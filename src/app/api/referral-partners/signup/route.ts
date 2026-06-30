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

    const fullName = cleanText(body.fullName)
    const phone = cleanText(body.phone)
    const email = normalizeEmail(body.email)
    const etransferEmail = normalizeEmail(body.etransferEmail)
    const city = cleanText(body.city)
    const province = cleanText(body.province)
    const partnerBackground = cleanText(body.partnerBackground)

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
      partner_type: 'referral_partner',
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

    const partnerText = [
      `Thank you for signing up as an A-Z Housing Referral Partner.`,
      ``,
      `Your Referral ID: ${referralId}`,
      ``,
      `Use this Referral ID when submitting landlord referrals at azhouse.ca/referral-program.`,
      ``,
      `Referral fee structure:`,
      `- Basic Tenant Placement Package $995+: $100`,
      `- 6-Month Property Management: $50`,
      `- 1-Year Property Management: $100`,
      `- Combined eligible services may be combined.`,
      `- Add-ons and other services do not qualify.`,
      ``,
      `Reminder: you are not an employee, agent, broker, leasing representative, legal representative, or property manager of A-Z Housing Solutions. You may introduce potential landlord clients only. Do not explain pricing, warranties, screening decisions, lease terms, or make promises on behalf of A-Z.`,
    ].join('\n')

    await Promise.all([
      sendEmail({
        to: email,
        subject: 'Your A-Z Housing Referral ID',
        text: partnerText,
        html: emailShell('Your A-Z Housing Referral ID', `
          <p>Thank you for signing up as an A-Z Housing Referral Partner.</p>
          <p style="font-size:18px;color:#1e2a45;"><strong>Referral ID: ${referralId}</strong></p>
          <p>Use this Referral ID when submitting landlord referrals at azhouse.ca/referral-program.</p>
          <h3 style="color:#1e2a45;">Referral fee structure</h3>
          ${feeList()}
          <p><strong>Important:</strong> You are not an employee, agent, broker, leasing representative, legal representative, or property manager of A-Z Housing Solutions.</p>
          <p>You may introduce potential landlord clients only. Do not explain pricing, warranties, screening decisions, lease terms, or make promises on behalf of A-Z.</p>
        `),
      }),
      sendEmail({
        to: BUSINESS_EMAIL,
        subject: `New Referral Partner Signup — ${fullName}`,
        replyTo: email,
        text: `New referral partner signup\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nReferral ID: ${referralId}\nE-transfer: ${etransferEmail}\nCity: ${city}, ${province}\nBackground: ${partnerBackground}\nPartner row: ${partner.id}`,
        html: emailShell('New Referral Partner Signup', `
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Referral ID:</strong> ${referralId}</p>
          <p><strong>E-transfer email:</strong> ${etransferEmail}</p>
          <p><strong>City:</strong> ${city}, ${province}</p>
          <p><strong>Background:</strong> ${partnerBackground}</p>
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
