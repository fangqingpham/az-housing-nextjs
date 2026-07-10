export const LEAD_TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const

export type LeadTrackingKey = typeof LEAD_TRACKING_KEYS[number]
export type LeadTracking = Partial<Record<LeadTrackingKey, string>>
export type AttributionBundle = {
  first_touch?: LeadTracking
  latest_touch?: LeadTracking
  session_identifier?: string
}

const LABELS: Record<LeadTrackingKey, string> = {
  utm_source: 'Lead Source',
  utm_medium: 'Medium',
  utm_campaign: 'Campaign',
  utm_content: 'Ad',
  utm_term: 'Term',
  fbclid: 'FB Click ID',
  gclid: 'Google Click ID',
}

export function cleanLeadTracking(input: unknown): LeadTracking {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const source = raw.latest_touch && typeof raw.latest_touch === 'object'
    ? raw.latest_touch as Record<string, unknown>
    : raw
  const out: LeadTracking = {}

  for (const key of LEAD_TRACKING_KEYS) {
    const value = String(source[key] ?? '').trim()
    if (value) out[key] = value.slice(0, 500)
  }

  return out
}

export function hasLeadTracking(input: unknown): boolean {
  return Object.keys(cleanLeadTracking(input)).length > 0
}

export function leadTrackingColumnPayload(input: unknown): Record<string, string | null> {
  const tracking = cleanLeadTracking(input)
  const bundle = input && typeof input === 'object' ? input as AttributionBundle : {}
  const firstTouch = cleanLeadTracking(bundle.first_touch)
  const latestTouch = cleanLeadTracking(bundle.latest_touch || tracking)
  return {
    ...Object.fromEntries(LEAD_TRACKING_KEYS.map(key => [key, latestTouch[key] || tracking[key] || null])),
    first_touch_source: firstTouch.utm_source || null,
    first_touch_medium: firstTouch.utm_medium || null,
    first_touch_campaign: firstTouch.utm_campaign || null,
    latest_touch_source: latestTouch.utm_source || null,
    latest_touch_medium: latestTouch.utm_medium || null,
    latest_touch_campaign: latestTouch.utm_campaign || null,
  }
}

export function leadTrackingSummary(input: unknown): string {
  const bundle = input && typeof input === 'object' ? input as AttributionBundle : {}
  const firstTouch = cleanLeadTracking(bundle.first_touch)
  const tracking = cleanLeadTracking(bundle.latest_touch || input)
  if (!hasLeadTracking(tracking) && !hasLeadTracking(firstTouch)) return ''

  const lines: string[] = []
  if (firstTouch.utm_source || firstTouch.utm_medium || firstTouch.utm_campaign) {
    lines.push(`First Touch: ${firstTouch.utm_source || 'unknown'} / ${firstTouch.utm_medium || 'unknown'}${firstTouch.utm_campaign ? ` / ${firstTouch.utm_campaign}` : ''}`)
  }
  if (tracking.utm_source || tracking.utm_medium) {
    lines.push(`Latest Source: ${tracking.utm_source || 'unknown'} / ${tracking.utm_medium || 'unknown'}`)
  }
  if (tracking.utm_campaign) lines.push(`Campaign: ${tracking.utm_campaign}`)
  if (tracking.utm_content) lines.push(`Ad: ${tracking.utm_content}`)
  if (tracking.utm_term) lines.push(`Term: ${tracking.utm_term}`)
  if (tracking.fbclid) lines.push(`FB Click ID: ${tracking.fbclid}`)
  if (tracking.gclid) lines.push(`Google Click ID: ${tracking.gclid}`)

  return lines.join('\n')
}

export function leadTrackingHtml(input: unknown): string {
  const tracking = cleanLeadTracking(input)
  if (!hasLeadTracking(tracking)) return ''

  const rows = [
    tracking.utm_source || tracking.utm_medium
      ? ['Lead Source', `${tracking.utm_source || 'unknown'} / ${tracking.utm_medium || 'unknown'}`]
      : null,
    tracking.utm_campaign ? [LABELS.utm_campaign, tracking.utm_campaign] : null,
    tracking.utm_content ? [LABELS.utm_content, tracking.utm_content] : null,
    tracking.utm_term ? [LABELS.utm_term, tracking.utm_term] : null,
    tracking.fbclid ? [LABELS.fbclid, tracking.fbclid] : null,
  ].filter(Boolean) as [string, string][]

  return `
    <div style="background:#fff;border-radius:10px;padding:18px 22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#f5a623;margin-bottom:10px;">Lead Source</div>
      ${rows.map(([label, value]) => `<p style="margin:0 0 6px;color:#444;font-size:14px;"><strong>${label}:</strong> ${value}</p>`).join('')}
    </div>
  `
}

export function appendLeadTrackingToNotes(notes: string | null | undefined, tracking: unknown): string | null {
  const summary = leadTrackingSummary(tracking)
  const base = String(notes ?? '').trim()
  if (!summary) return base || null
  return [base, summary].filter(Boolean).join('\n\n')
}

export function stripLeadTrackingColumns<T extends Record<string, any>>(payload: T): T {
  const clone = { ...payload }
  for (const key of LEAD_TRACKING_KEYS) delete clone[key]
  delete clone.first_touch_source
  delete clone.first_touch_medium
  delete clone.first_touch_campaign
  delete clone.latest_touch_source
  delete clone.latest_touch_medium
  delete clone.latest_touch_campaign
  delete clone.lead_tracking
  return clone
}

export function isMissingLeadTrackingColumnError(error: any): boolean {
  const message = String(error?.message || error?.details || '')
  return error?.code === '42703' || (
    message.includes('utm_source') ||
    message.includes('utm_medium') ||
    message.includes('utm_campaign') ||
    message.includes('utm_content') ||
    message.includes('utm_term') ||
    message.includes('gclid') ||
    message.includes('first_touch_') ||
    message.includes('latest_touch_') ||
    message.includes('fbclid') ||
    message.includes('lead_tracking')
  )
}
