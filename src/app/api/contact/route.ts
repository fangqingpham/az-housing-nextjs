import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BUSINESS_EMAIL, emailShell, sendEmail } from '@/lib/server/email'
import {
  appendLeadTrackingToNotes,
  cleanLeadTracking,
  isMissingLeadTrackingColumnError,
  leadTrackingColumnPayload,
  leadTrackingHtml,
  leadTrackingSummary,
  stripLeadTrackingColumns,
} from '@/lib/lead-tracking'

export const dynamic = 'force-dynamic'

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin settings are missing')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function insertMessage(payload: Record<string, any>) {
  const admin = getSupabaseAdmin()
  const { error } = await admin.from('messages').insert(payload)
  if (!error) return

  if (isMissingLeadTrackingColumnError(error)) {
    const retry = await admin.from('messages').insert(stripLeadTrackingColumns(payload))
    if (!retry.error) return
    throw retry.error
  }

  throw error
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = text(body.name || body.from)
    const email = text(body.email || body.fromemail)
    const phone = text(body.phone)
    const rawMessage = text(body.message || body.text)
    const tracking = cleanLeadTracking(body.leadTracking || body.lead_tracking || body)

    if (!name || !email || !rawMessage) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
    }

    const message = appendLeadTrackingToNotes(rawMessage, tracking) || rawMessage
    const payload = {
      id: `m${Date.now()}`,
      listingid: '',
      listingtitle: 'General Contact Form',
      listingowner: 'A-Z Housing Solutions',
      from: name,
      fromemail: email,
      phone,
      text: message,
      date: new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' }),
      type: 'enquiry',
      ...leadTrackingColumnPayload(tracking),
      lead_tracking: tracking,
    }

    await insertMessage(payload)

    const sourceText = leadTrackingSummary(tracking)
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: `New Website Contact - ${name}`,
      replyTo: email,
      text: [
        'New contact form message submitted via azhouse.ca.',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || '-'}`,
        '',
        rawMessage,
        sourceText ? `\n${sourceText}` : '',
      ].join('\n'),
      html: emailShell('New Website Contact', `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || '-'}</p>
        <p><strong>Message:</strong><br/>${rawMessage.replace(/\n/g, '<br/>')}</p>
        ${leadTrackingHtml(tracking)}
      `),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact POST]', err)
    return NextResponse.json({ error: 'Message could not be submitted right now.' }, { status: 500 })
  }
}
