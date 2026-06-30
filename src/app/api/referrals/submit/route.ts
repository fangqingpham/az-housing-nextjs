import { NextResponse } from 'next/server'
import { BUSINESS_EMAIL, emailShell, sendEmail } from '@/lib/server/email'
import {
  buildServiceArray,
  calculateReferralPayout,
  cleanText,
  getAdminClient,
  isEmail,
  normalizeEmail,
  publicError,
} from '@/lib/server/referrals'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (cleanText(body.website)) return NextResponse.json({ success: true })

    const referralId = cleanText(body.referralId).toUpperCase()
    const partnerEmail = normalizeEmail(body.partnerEmail)
    const landlordName = cleanText(body.landlordName)
    const landlordPhone = cleanText(body.landlordPhone)
    const landlordEmail = normalizeEmail(body.landlordEmail)
    const propertyAddress = cleanText(body.propertyAddress)
    const city = cleanText(body.city)
    const serviceInterest = cleanText(body.serviceInterest)
    const notes = cleanText(body.notes)
    const consentConfirmed = Boolean(body.consentConfirmed)
    const partnerRuleConfirmed = Boolean(body.partnerRuleConfirmed)

    if (!referralId || !partnerEmail || !landlordName || !landlordPhone || !landlordEmail || !propertyAddress || !city || !serviceInterest) {
      return NextResponse.json(publicError('Please complete all required fields.'), { status: 400 })
    }
    if (!isEmail(partnerEmail) || !isEmail(landlordEmail)) {
      return NextResponse.json(publicError('Please enter valid email addresses.'), { status: 400 })
    }
    if (!consentConfirmed || !partnerRuleConfirmed) {
      return NextResponse.json(publicError('Please confirm the required referral permissions and rules.'), { status: 400 })
    }

    const admin = getAdminClient()
    const { data: partner, error: partnerError } = await admin
      .from('referral_partners')
      .select('*')
      .eq('referral_id', referralId)
      .maybeSingle()
    if (partnerError) throw partnerError
    if (!partner || partner.partner_status !== 'active') {
      return NextResponse.json(publicError('Referral ID could not be validated.'), { status: 400 })
    }
    if (normalizeEmail(partner.email) !== partnerEmail) {
      return NextResponse.json(publicError('Referral ID and partner email do not match.'), { status: 400 })
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: duplicates } = await admin
      .from('referral_submissions')
      .select('id, created_at')
      .gte('created_at', since)
      .or(`landlord_email.ilike.${landlordEmail},landlord_phone.eq.${landlordPhone}`)
      .limit(1)

    const possibleDuplicate = Boolean(duplicates && duplicates.length > 0)
    const duplicateReason = possibleDuplicate ? 'Same landlord email or phone submitted within the last 30 days.' : null
    const interestedServices = buildServiceArray(serviceInterest)
    const payoutAmount = calculateReferralPayout(serviceInterest)

    const { data: submission, error: submissionError } = await admin
      .from('referral_submissions')
      .insert({
        referral_partner_id: partner.id,
        referral_id: referralId,
        partner_name: partner.full_name,
        partner_email: partner.email,
        partner_phone: partner.phone,
        landlord_name: landlordName,
        landlord_email: landlordEmail,
        landlord_phone: landlordPhone,
        property_address: propertyAddress,
        city,
        interested_services: interestedServices,
        notes: notes || null,
        consent_confirmed: consentConfirmed,
        partner_rule_confirmed: partnerRuleConfirmed,
        possible_duplicate: possibleDuplicate,
        duplicate_reason: duplicateReason,
        status: 'submitted',
      })
      .select()
      .single()
    if (submissionError) throw submissionError

    const { data: clientCase, error: caseError } = await admin
      .from('client_cases')
      .insert({
        full_name: landlordName,
        client_type: 'Landlord',
        phone: landlordPhone,
        email: landlordEmail,
        lead_source: 'Referral',
        lead_source_detail: 'Referral Partner',
        status: 'New',
        priority: possibleDuplicate ? 'High' : 'Normal',
        property_address: propertyAddress,
        city,
        service_type: serviceInterest,
        client_needs: notes || `Referral interest: ${serviceInterest}`,
        current_situation: possibleDuplicate ? duplicateReason : null,
        referral_submission_id: submission.id,
        referral_partner_id: partner.id,
        referral_id: referralId,
        checklist: {},
      })
      .select()
      .single()
    if (caseError) throw caseError

    const { error: updateSubmissionError } = await admin
      .from('referral_submissions')
      .update({ created_client_case_id: clientCase.id })
      .eq('id', submission.id)
    if (updateSubmissionError) throw updateSubmissionError

    const { error: payoutError } = await admin
      .from('referral_payouts')
      .insert({
        referral_submission_id: submission.id,
        referral_partner_id: partner.id,
        client_case_id: clientCase.id,
        service_type: serviceInterest,
        eligible_fee: payoutAmount,
        payout_amount: payoutAmount,
        eligibility_status: 'pending_requirements',
        payment_status: 'not_payable',
        etransfer_email: partner.etransfer_email,
        notes: possibleDuplicate ? duplicateReason : null,
      })
    if (payoutError) throw payoutError

    const reference = submission.id.slice(0, 8).toUpperCase()

    await Promise.all([
      sendEmail({
        to: landlordEmail,
        subject: 'You were referred to A-Z Housing Solutions',
        replyTo: BUSINESS_EMAIL,
        text: `You were referred to A-Z Housing Solutions by ${partner.full_name}.\n\nWe received your contact information because they indicated you may be interested in tenant placement, property management, or landlord support.\n\nYou are not obligated to use our service. If you did not authorize this referral or do not wish to be contacted, reply "Remove".\n\nA-Z Housing Solutions\n${BUSINESS_EMAIL}\nazhouse.ca`,
        html: emailShell('You were referred to A-Z Housing Solutions', `
          <p>You were referred to A-Z Housing Solutions by <strong>${partner.full_name}</strong>.</p>
          <p>We received your contact information because they indicated you may be interested in tenant placement, property management, or landlord support.</p>
          <p>You are not obligated to use our service.</p>
          <p>If you did not authorize this referral or do not wish to be contacted, reply <strong>Remove</strong>.</p>
          <p>A-Z Housing Solutions<br/>${BUSINESS_EMAIL}<br/>azhouse.ca</p>
        `),
      }),
      sendEmail({
        to: partner.email,
        subject: 'Referral Received — A-Z Housing Solutions',
        text: `Referral received.\n\nClient: ${landlordName}\nProperty: ${propertyAddress}, ${city}\nReference: ${reference}\n\nReferral fees only apply after the landlord signs the service agreement, payment is received, and payment clears and is not reversed. Please do not explain terms or make promises on behalf of A-Z Housing Solutions.`,
        html: emailShell('Referral Received', `
          <p>Your referral has been received.</p>
          <p><strong>Client:</strong> ${landlordName}</p>
          <p><strong>Property:</strong> ${propertyAddress}, ${city}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p>Referral fees only apply after the landlord signs the service agreement, payment is received, and payment clears and is not reversed.</p>
          <p>Please do not explain terms or make promises on behalf of A-Z Housing Solutions.</p>
        `),
      }),
      sendEmail({
        to: BUSINESS_EMAIL,
        subject: `New Referral Lead — ${landlordName}`,
        replyTo: partner.email,
        text: `New referral lead\n\nReferral ID: ${referralId}\nPartner: ${partner.full_name} <${partner.email}> ${partner.phone}\nLandlord: ${landlordName} <${landlordEmail}> ${landlordPhone}\nProperty: ${propertyAddress}, ${city}\nInterest: ${serviceInterest}\nPotential payout: $${payoutAmount}\nDuplicate flag: ${possibleDuplicate ? 'Yes - ' + duplicateReason : 'No'}\nClient case: ${clientCase.case_number}\nSubmission: ${submission.id}`,
        html: emailShell('New Referral Lead', `
          <p><strong>Referral ID:</strong> ${referralId}</p>
          <p><strong>Partner:</strong> ${partner.full_name} &lt;${partner.email}&gt; ${partner.phone}</p>
          <p><strong>Landlord:</strong> ${landlordName} &lt;${landlordEmail}&gt; ${landlordPhone}</p>
          <p><strong>Property:</strong> ${propertyAddress}, ${city}</p>
          <p><strong>Interest:</strong> ${serviceInterest}</p>
          <p><strong>Potential payout:</strong> $${payoutAmount}</p>
          <p><strong>Duplicate flag:</strong> ${possibleDuplicate ? duplicateReason : 'No'}</p>
          <p><strong>Client case:</strong> ${clientCase.case_number}</p>
          <p><strong>Submission:</strong> ${submission.id}</p>
        `),
      }),
    ])

    return NextResponse.json({ success: true, reference })
  } catch (err) {
    console.error('[referral submit]', err)
    return NextResponse.json(publicError('Referral could not be submitted right now.'), { status: 500 })
  }
}
