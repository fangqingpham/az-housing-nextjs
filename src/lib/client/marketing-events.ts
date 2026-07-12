'use client'

import { getStoredAttribution, getSessionIdentifier } from '@/lib/client/lead-tracking'

export type MarketingEventName =
  | 'contact_form_submit'
  | 'whatsapp_click'
  | 'messenger_click'
  | 'phone_click'
  | 'email_click'
  | 'order_form_start'
  | 'order_form_submit'
  | 'referral_signup'
  | 'referral_submission'
  | 'cta_click'
  | 'pricing_view'
  | 'faq_open'
  | 'vietnam_bridge_page_view'
  | 'service_card_expand'
  | 'service_question_click'
  | 'landing_arrangement_read_more_click'
  | 'chat_open'
  | 'pricing_click'
  | 'lead_form_start'
  | 'lead_form_submit'
  | 'scroll_50'
  | 'scroll_90'

type EventPayload = {
  service?: string
  selected_service?: string
  form_name?: string
  order_id?: string
  referral_id?: string
  related_order_id?: string
  related_referral_id?: string
  metadata?: Record<string, unknown>
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

const FORM_EVENT_KEY = 'azhouse_marketing_form_events'

function readSentKeys(): Record<string, number> {
  try {
    return JSON.parse(window.sessionStorage.getItem(FORM_EVENT_KEY) || '{}')
  } catch {
    return {}
  }
}

function rememberSentKey(key: string) {
  try {
    const sent = readSentKeys()
    sent[key] = Date.now()
    window.sessionStorage.setItem(FORM_EVENT_KEY, JSON.stringify(sent))
  } catch {}
}

function pageContext() {
  if (typeof window === 'undefined') return {}
  return {
    page_path: window.location.pathname,
    page_title: document.title,
    referrer: document.referrer || undefined,
    device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
  }
}

function gaEventName(eventName: MarketingEventName) {
  return eventName.replace(/[^a-z0-9_]/gi, '_')
}

export async function trackMarketingEvent(eventName: MarketingEventName, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return

  const attribution = getStoredAttribution()
  const latest = attribution.latest_touch || {}
  const first = attribution.first_touch || {}
  const body = {
    event_name: eventName,
    ...pageContext(),
    service: payload.service,
    related_order_id: payload.related_order_id || payload.order_id,
    related_referral_id: payload.related_referral_id || payload.referral_id,
    source: latest.utm_source,
    medium: latest.utm_medium,
    campaign: latest.utm_campaign,
    content: latest.utm_content,
    term: latest.utm_term,
    session_identifier: attribution.session_identifier || getSessionIdentifier(),
    metadata: {
      ...(payload.metadata || {}),
      selected_service: payload.selected_service || payload.service,
      event_timestamp: new Date().toISOString(),
      form_name: payload.form_name,
      order_id: payload.order_id,
      referral_id: payload.referral_id,
      first_touch_source: first.utm_source,
      first_touch_medium: first.utm_medium,
      first_touch_campaign: first.utm_campaign,
      latest_touch_source: latest.utm_source,
      latest_touch_medium: latest.utm_medium,
      latest_touch_campaign: latest.utm_campaign,
      fbclid: latest.fbclid,
      gclid: latest.gclid,
    },
  }

  window.gtag?.('event', gaEventName(eventName), {
    event_category: 'marketing',
    event_label: payload.service || payload.form_name || eventName,
    page_path: body.page_path,
    service: payload.service,
    campaign: body.campaign,
  })

  try {
    await fetch('/api/marketing/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {}
}

export function trackFormEventOnce(eventName: MarketingEventName, dedupeKey: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return
  const key = `${eventName}:${dedupeKey}`
  const sent = readSentKeys()
  if (sent[key]) return
  rememberSentKey(key)
  void trackMarketingEvent(eventName, payload)
}
