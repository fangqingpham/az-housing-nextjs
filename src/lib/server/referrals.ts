import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export const REFERRAL_TERMS_VERSION = '2026-06-29'

export const SERVICE_PAYOUTS: Record<string, number> = {
  'Basic Tenant Placement': 100,
  'Property Management — 6 Months': 50,
  'Property Management — 1 Year': 100,
  'Tenant Placement + Property Management': 200,
  'Landing Arrangement tron goi': 100,
  'Landing Arrangement full package': 100,
  'Not sure': 0,
}

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin settings are missing')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function cleanText(value: unknown) {
  return String(value ?? '').trim()
}

export function normalizeEmail(value: unknown) {
  return cleanText(value).toLowerCase()
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function publicError(message = 'The request could not be processed.') {
  return { error: message }
}

export function calculateReferralPayout(service: string) {
  return SERVICE_PAYOUTS[service] ?? 0
}

export async function generateReferralId(admin = getAdminClient()) {
  const year = new Date().getFullYear()
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  for (let attempt = 0; attempt < 8; attempt += 1) {
    let suffix = ''
    const bytes = randomBytes(6)
    for (let i = 0; i < bytes.length; i += 1) {
      suffix += alphabet[bytes[i] % alphabet.length]
    }
    const referralId = `AZR-${year}-${suffix}`

    const { data, error } = await admin
      .from('referral_partners')
      .select('id')
      .eq('referral_id', referralId)
      .maybeSingle()

    if (error) throw error
    if (!data) return referralId
  }

  throw new Error('Could not generate a unique referral ID')
}

export function buildServiceArray(service: string) {
  if (!service) return []
  if (service === 'Tenant Placement + Property Management') {
    return ['Basic Tenant Placement', 'Property Management']
  }
  if (service === 'Landing Arrangement tron goi') {
    return ['Landing Arrangement']
  }
  return [service]
}
