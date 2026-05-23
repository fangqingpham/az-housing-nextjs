import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * /api/settings — GET + POST for site-level key/value settings.
 *
 * Uses a `site_settings` table in Supabase:
 *   create table site_settings (
 *     key   text primary key,
 *     value text
 *   );
 *
 * If the table doesn't exist yet the route degrades gracefully:
 *   GET  → returns {} (no crash)
 *   POST → returns 500 with a helpful message
 *
 * RLS: enable RLS on site_settings and add a policy:
 *   allow service_role full access (the route uses the service role key)
 */

const SETTINGS_KEYS = ['hero', 'herosub', 'sitename', 'tagline', 'email'] as const
type SettingKey = typeof SETTINGS_KEYS[number]

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars missing.')
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error) {
      // Table may not exist yet — return empty object rather than 500
      console.warn('site_settings fetch warn:', error.message)
      return NextResponse.json({})
    }

    const settings: Record<string, string> = {}
    for (const row of data || []) {
      settings[row.key] = row.value
    }

    return NextResponse.json(settings)
  } catch (err) {
    console.error('GET /api/settings error:', err)
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Only persist known, safe keys
    const upserts = Object.entries(body)
      .filter(([k]) => (SETTINGS_KEYS as readonly string[]).includes(k))
      .map(([key, value]) => ({ key, value: String(value) }))

    if (upserts.length === 0) {
      return NextResponse.json({ error: 'No valid settings keys provided.' }, { status: 400 })
    }

    const supabase = getAdmin()
    const { error } = await supabase
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' })

    if (error) {
      console.error('site_settings upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to save settings. Make sure the site_settings table exists.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/settings error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
