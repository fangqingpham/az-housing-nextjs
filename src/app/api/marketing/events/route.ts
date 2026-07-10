import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/server/staff-auth'

export const dynamic = 'force-dynamic'

const ALLOWED_EVENTS = new Set([
  'contact_form_submit',
  'whatsapp_click',
  'messenger_click',
  'phone_click',
  'email_click',
  'order_form_start',
  'order_form_submit',
  'referral_signup',
  'referral_submission',
  'cta_click',
  'pricing_view',
  'faq_open',
])

const FORM_EVENTS = new Set(['contact_form_submit', 'order_form_submit', 'referral_signup', 'referral_submission'])
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const duplicateEvents = new Map<string, number>()

function cleanString(value: unknown, max = 240): string | null {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (!text) return null
  return text.slice(0, max)
}

function cleanUuid(value: unknown): string | null {
  const text = cleanString(value, 80)
  return text && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : null
}

function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded ? `ip:${forwarded.slice(0, 64)}` : `ua:${request.headers.get('user-agent')?.slice(0, 80) || 'unknown'}`
}

function allowedByRateLimit(request: Request) {
  const key = clientKey(request)
  const now = Date.now()
  const current = rateLimit.get(key)
  if (!current || current.resetAt < now) {
    rateLimit.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  current.count += 1
  return current.count <= 30
}

function isDuplicate(eventName: string, session: string | null, metadata: Record<string, unknown>) {
  if (!FORM_EVENTS.has(eventName)) return false
  const related = cleanString(metadata.order_id || metadata.referral_id || metadata.form_name || metadata.submission_key, 120) || 'unknown'
  const key = `${eventName}:${session || 'no-session'}:${related}`
  const now = Date.now()
  const last = duplicateEvents.get(key)
  duplicateEvents.set(key, now)
  return Boolean(last && now - last < 30 * 60_000)
}

function cleanMetadata(input: unknown): Record<string, unknown> {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw).slice(0, 40)) {
    const cleanKey = key.replace(/[^a-zA-Z0-9_:-]/g, '').slice(0, 80)
    if (!cleanKey) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[cleanKey] = typeof value === 'string' ? cleanString(value, 500) : value
    }
  }
  return out
}

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get('content-length') || 0)
    if (length > 12_000) return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
    if (!allowedByRateLimit(request)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })

    const eventName = cleanString((body as any).event_name, 80)
    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ error: 'Event is not allowed.' }, { status: 400 })
    }

    const metadata = cleanMetadata((body as any).metadata)
    const sessionIdentifier = cleanString((body as any).session_identifier, 160) || `anon_${crypto.randomUUID()}`
    if (isDuplicate(eventName, sessionIdentifier, metadata)) {
      return NextResponse.json({ success: true, duplicate: true })
    }

    const admin = getServiceRoleClient()
    const payload = {
      event_name: eventName,
      page_path: cleanString((body as any).page_path, 500),
      page_title: cleanString((body as any).page_title, 300),
      service: cleanString((body as any).service, 160),
      source: cleanString((body as any).source, 160),
      medium: cleanString((body as any).medium, 160),
      campaign: cleanString((body as any).campaign, 240),
      content: cleanString((body as any).content, 240),
      term: cleanString((body as any).term, 240),
      referrer: cleanString((body as any).referrer, 500),
      session_identifier: sessionIdentifier,
      device_type: cleanString((body as any).device_type, 40),
      related_order_id: cleanUuid((body as any).related_order_id),
      related_referral_id: cleanUuid((body as any).related_referral_id),
      metadata,
    }

    const { error } = await admin.from('marketing_events').insert(payload)
    if (error) {
      console.error('[marketing event insert]', error.message)
      return NextResponse.json({ error: 'Event could not be recorded.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[marketing event POST]', error)
    return NextResponse.json({ error: 'Event could not be recorded.' }, { status: 500 })
  }
}
