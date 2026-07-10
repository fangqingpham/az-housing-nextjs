'use client'

import { useEffect, useState } from 'react'
import { LEAD_TRACKING_KEYS, type AttributionBundle, type LeadTracking, cleanLeadTracking } from '@/lib/lead-tracking'

const STORAGE_KEY = 'azhouse_attribution'
const LEGACY_STORAGE_KEY = 'azhouse_lead_tracking'
const COOKIE_KEY = 'azhouse_attribution'
const LEGACY_COOKIE_KEY = 'azhouse_lead_tracking'
const SESSION_KEY = 'azhouse_session_id'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function readCookie(key: string): unknown {
  if (typeof document === 'undefined') return {}
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${key}=`))
    ?.slice(key.length + 1)
  if (!cookie) return {}

  try {
    return JSON.parse(decodeURIComponent(cookie))
  } catch {
    return {}
  }
}

function writeCookie(value: AttributionBundle) {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

function readStoredBundle(): AttributionBundle {
  if (typeof window === 'undefined') return {}

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return normalizeBundle(JSON.parse(stored))
  } catch {}

  const cookieBundle = normalizeBundle(readCookie(COOKIE_KEY))
  if (cookieBundle.first_touch || cookieBundle.latest_touch) return cookieBundle

  try {
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const tracking = cleanLeadTracking(JSON.parse(legacy))
      return { first_touch: tracking, latest_touch: tracking, session_identifier: getSessionIdentifier() }
    }
  } catch {}

  const legacyCookie = cleanLeadTracking(readCookie(LEGACY_COOKIE_KEY))
  if (Object.keys(legacyCookie).length > 0) return { first_touch: legacyCookie, latest_touch: legacyCookie, session_identifier: getSessionIdentifier() }

  return { session_identifier: getSessionIdentifier() }
}

function normalizeBundle(input: unknown): AttributionBundle {
  const raw = input && typeof input === 'object' ? input as AttributionBundle : {}
  return {
    first_touch: cleanLeadTracking(raw.first_touch),
    latest_touch: cleanLeadTracking(raw.latest_touch || input),
    session_identifier: typeof raw.session_identifier === 'string' ? raw.session_identifier : getSessionIdentifier(),
  }
}

function hasCampaignSource(tracking: LeadTracking): boolean {
  return Boolean(tracking.utm_source || tracking.utm_medium || tracking.utm_campaign || tracking.fbclid || tracking.gclid)
}

export function getSessionIdentifier(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = `azs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
      window.localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export function getStoredAttribution(): AttributionBundle {
  const bundle = readStoredBundle()
  return {
    first_touch: cleanLeadTracking(bundle.first_touch),
    latest_touch: cleanLeadTracking(bundle.latest_touch),
    session_identifier: bundle.session_identifier || getSessionIdentifier(),
  }
}

export function getStoredLeadTracking(): AttributionBundle {
  return getStoredAttribution()
}

export function captureLeadTrackingFromUrl() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const fromUrl: LeadTracking = {}
  for (const key of LEAD_TRACKING_KEYS) {
    const value = params.get(key)
    if (value) fromUrl[key] = value
  }

  const tracking = cleanLeadTracking(fromUrl)
  if (Object.keys(tracking).length === 0) return

  const current = getStoredAttribution()
  const firstTouch = hasCampaignSource(cleanLeadTracking(current.first_touch))
    ? cleanLeadTracking(current.first_touch)
    : tracking
  const latestTouch = hasCampaignSource(tracking)
    ? tracking
    : cleanLeadTracking(current.latest_touch)
  const next = {
    first_touch: firstTouch,
    latest_touch: latestTouch,
    session_identifier: getSessionIdentifier(),
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  writeCookie(next)
  window.dispatchEvent(new Event('az:leadtracking'))
}

export function useLeadTracking(): AttributionBundle {
  const [tracking, setTracking] = useState<AttributionBundle>({})

  useEffect(() => {
    const update = () => setTracking(getStoredAttribution())
    update()
    window.addEventListener('az:leadtracking', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('az:leadtracking', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return tracking
}
