import { NextResponse } from 'next/server'
import { BUSINESS_EMAIL, emailShell, sendEmail } from '@/lib/server/email'
import {
  REFERRAL_TERMS_VERSION,
  cleanText,
  generateReferralId,
  getAdminClient,
  isEmail,
  normalizeEmail,
  publicError,
} from '@/lib/server/referrals'

export const dynamic = 'force-dynamic'

function feeList() {
  return `
    <ul>
      <li>Basic Tenant Placement Package $995+: $100</li>
      <li>6-Month Property Management: $50</li>
      <li>1-Year Property Management: $100</li>
      <li>Combined eligible services may be combined.</li>
      <li>Add-ons and other services do not qualify for a referral fee.</li>
    </ul>
  `
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (cleanText(body.website)) return NextResponse.json({ success: true })

    const sourcePage = cleanText(body.sourcePage)
    const language = cleanText(body.language)
    const partnerType = cleanText(body.partnerType) === 'vietnam_agency' ? 'vietnam_agency' : 'referral_partner'
    const isVietnamPartner = partnerType === 'vietnam_agency' || sourcePage === 'vietnam-referral-partner'

    const companyName = cleanText(body.companyName)
    const contactName = cleanText(body.contactName)
    const position = cleanText(body.position)
    const activityType = cleanText(body.activityType)
    const expectedMonthlyClients = cleanText(body.expectedMonthlyClients)
    const payoutMethod = cleanText(body.payoutMethod)
    const notes = cleanText(body.notes)

    const fullName = isVietnamPartner ? companyName : cleanText(body.fullName)
    const phone = cleanText(body.phone)
    const email = normalizeEmail(body.email)
    const requestedEtransferEmail = normalizeEmail(body.etransferEmail)
    const etransferEmail = isVietnamPartner ? (isEmail(requestedEtransferEmail) ? requestedEtransferEmail : email) : requestedEtransferEmail
    const city = cleanText(body.city)
    const province = isVietnamPartner ? (cleanText(body.province) || 'Vietnam') : cleanText(body.province)
    const partnerBackground = isVietnamPartner
      ? [
          'Vietnam Agency Partner',
          `source_page=${sourcePage || 'vietnam-referral-partner'}`,
          `language=${language || 'vi'}`,
          contactName ? `Contact: ${contactName}` : '',
          position ? `Position: ${position}` : '',
          activityType ? `Activity type: ${activityType}` : '',
          expectedMonthlyClients ? `Expected monthly clients: ${expectedMonthlyClients}` : '',
          payoutMethod ? `Preferred commission method: ${payoutMethod}` : '',
          notes ? `Notes: ${notes}` : '',
        ].filter(Boolean).join('\n')
      : cleanText(body.partnerBackground)

    const termsAccepted = Boolean(body.termsAccepted)
    const limitsAccepted = Boolean(body.limitsAccepted)
    const payoutAccepted = Boolean(body.payoutAccepted)

    if (!fullName || !phone || !email || !etransferEmail || !city || !province || !partnerBackground) {
      return NextResponse.json(publicError('Please complete all required fields.'), { status: 400 })
    }
    if (!isEmail(email) || !isEmail(etransferEmail)) {
      return NextResponse.json(publicError('Please enter a valid email address.'), { status: 400 })
    }
    if (!termsAccepted || !limitsAccepted || !payoutAccepted) {
      return NextResponse.json(publicError('Please confirm all required referral partner terms.'), { status: 400 })
    }

    const admin = getAdminClient()
    const { data: existing, error: lookupError } = await admin
      .from('referral_partners')
      .select('*')
      .ilike('email', email)
      .maybeSingle()
    if (lookupError) throw lookupError

    const referralId = existing?.referral_id || await generateReferralId(admin)
    const payload = {
      full_name: fullName,
      phone,
      email,
      etransfer_email: etransferEmail,
      city,
      province,
      partner_background: partnerBackground,
      partner_type: isVietnamPartner ? 'vietnam_agency' : 'referral_partner',
      referral_id: referralId,
      partner_status: existing?.partner_status || 'active',
      referral_terms_accepted_at: new Date().toISOString(),
      referral_terms_version: REFERRAL_TERMS_VERSION,
    }

    const query = existing
      ? admin.from('referral_partners').update(payload).eq('id', existing.id).select().single()
      : admin.from('referral_partners').insert(payload).select().single()

    const { data: partner, error } = await query
    if (error) throw error

    const pageUrl = isVietnamPartner ? 'azhouse.ca/vietnam-referral-partner' : 'azhouse.ca/referral-program'
    const partnerText = isVietnamPartner
      ? [
          'Cam on ban da dang ky tro thanh Doi Tac Gioi Thieu Viet Nam cua A-Z Housing.',
          '',
          `Your Referral ID: ${referralId}`,
          '',
          `Use this Referral ID when submitting referrals at ${pageUrl}.`,
          '',
          'Referral fee structure:',
          '- Service package from $799 to $1,499 CAD: $100 CAD for each referred client who successfully pays.',
          '- Service package from $1,500 CAD or more: $150 CAD for each referred client who successfully pays.',
          '- Commission is paid only after the client has registered, paid A-Z Housing directly, and payment is confirmed.',
          '',
          'Reminder: Vietnam partners are referral sources only. Do not collect payment, confirm service availability, change pricing, guarantee housing, negotiate terms, or make promises on behalf of A-Z Housing Solutions. A-Z Housing controls all client communication, invoices, payment, confirmation, and service delivery.',
        ].join('\n')
      : [
          'Thank you for signing up as an A-Z Housing Referral Partner.',
          '',
          `Your Referral ID: ${referralId}`,
          '',
          `Use this Referral ID when submitting landlord referrals at ${pageUrl}.`,
          '',
          'Referral fee structure:',
          '- Basic Tenant Placement Package $995+: $100',
          '- 6-Month Property Management: $50',
          '- 1-Year Property Management: $100',
          '- Combined eligible services may be combined.',
          '- Add-ons and other services do not qualify.',
          '',
          'Reminder: you are not an employee, agent, broker, leasing representative, legal representative, or property manager of A-Z Housing Solutions. You may introduce potential landlord clients only. Do not explain pricing, warranties, screening decisions, lease terms, or make promises on behalf of A-Z.',
        ].join('\n')

    await Promise.all([
      sendEmail({
        to: email,
        subject: isVietnamPartner ? 'Dang ky Doi Tac Viet Nam - A-Z Housing' : 'Your A-Z Housing Referral ID',
        text: partnerText,
        html: emailShell(isVietnamPartner ? 'Dang ky Doi Tac Viet Nam - A-Z Housing' : 'Your A-Z Housing Referral ID', `
          <p>${isVietnamPartner ? 'Cam on ban da dang ky tro thanh Doi Tac Gioi Thieu Viet Nam cua A-Z Housing.' : 'Thank you for signing up as an A-Z Housing Referral Partner.'}</p>
          <p style="font-size:18px;color:#1e2a45;"><strong>Referral ID: ${referralId}</strong></p>
          <p>Use this Referral ID when submitting referrals at ${pageUrl}.</p>
          ${isVietnamPartner
            ? `<p><strong>Partner type:</strong> Vietnam Agency Partner<br/><strong>Source page:</strong> ${sourcePage || 'vietnam-referral-partner'}<br/><strong>Language:</strong> ${language || 'vi'}</p>
              <p><strong>Important:</strong> Vietnam partners are referral sources only. A-Z Housing controls client communication, invoices, payment, confirmation, and service delivery.</p>
              <p>Do not collect payment, confirm service availability, change pricing, guarantee housing, negotiate terms, or make promises on behalf of A-Z Housing Solutions.</p>`
            : `<h3 style="color:#1e2a45;">Referral fee structure</h3>
              ${feeList()}
              <p><strong>Important:</strong> You are not an employee, agent, broker, leasing representative, legal representative, or property manager of A-Z Housing Solutions.</p>
              <p>You may introduce potential landlord clients only. Do not explain pricing, warranties, screening decisions, lease terms, or make promises on behalf of A-Z.</p>`}
        `),
      }),
      sendEmail({
        to: BUSINESS_EMAIL,
        subject: isVietnamPartner ? 'Dang ky Doi Tac Viet Nam - A-Z Housing' : `New Referral Partner Signup - ${fullName}`,
        replyTo: email,
        text: `New referral partner signup\n\nPartner type: ${isVietnamPartner ? 'Vietnam Agency Partner' : 'Referral Partner'}\nSource page: ${sourcePage || 'referral-program'}\nLanguage: ${language || 'en'}\nName: ${fullName}\nContact: ${contactName || fullName}\nEmail: ${email}\nPhone: ${phone}\nReferral ID: ${referralId}\nE-transfer: ${etransferEmail}\nCity: ${city}, ${province}\nBackground: ${partnerBackground}\nPartner row: ${partner.id}`,
        html: emailShell(isVietnamPartner ? 'Vietnam Agency Partner Signup' : 'New Referral Partner Signup', `
          <p><strong>Partner type:</strong> ${isVietnamPartner ? 'Vietnam Agency Partner' : 'Referral Partner'}</p>
          <p><strong>Source page:</strong> ${sourcePage || 'referral-program'}</p>
          <p><strong>Language:</strong> ${language || 'en'}</p>
          <p><strong>Name:</strong> ${fullName}</p>
          ${contactName ? `<p><strong>Contact:</strong> ${contactName}</p>` : ''}
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Referral ID:</strong> ${referralId}</p>
          <p><strong>E-transfer email:</strong> ${etransferEmail}</p>
          <p><strong>City:</strong> ${city}, ${province}</p>
          <p><strong>Background:</strong><br/>${partnerBackground.replace(/\n/g, '<br/>')}</p>
          <p><strong>Partner row:</strong> ${partner.id}</p>
        `),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[referral signup]', err)
    return NextResponse.json(publicError('Signup could not be completed right now.'), { status: 500 })
  }
}
