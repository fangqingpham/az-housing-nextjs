import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/health  — health check + Supabase keep-alive.
 *
 * Pings Supabase by updating the `keep_alive` table (row id = 1),
 * setting `last_ping` to the current timestamp. This prevents a
 * low-traffic Supabase project from being auto-paused.
 *
 * The `keep_alive` table may live in a different Supabase project than
 * the main app database, so this route PREFERS dedicated keep-alive
 * env vars and falls back to the standard app env vars:
 *
 *   KEEP_ALIVE_SUPABASE_URL                -> NEXT_PUBLIC_SUPABASE_URL
 *   KEEP_ALIVE_SUPABASE_SERVICE_ROLE_KEY   -> SUPABASE_SERVICE_ROLE_KEY
 *
 * Set the KEEP_ALIVE_* vars (in Vercel + .env.local) to the project that
 * actually contains the keep_alive table. The service role key is used so
 * the UPDATE bypasses RLS.
 *
 * Success response:
 *   { "ok": true, "supabase": "connected", "updated": true }
 */

// Never cache; always run server-side on the Node runtime.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getClient() {
  const url =
    process.env.KEEP_ALIVE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.KEEP_ALIVE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  const supabase = getClient()

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        supabase: 'misconfigured',
        updated: false,
        error: 'Supabase env vars missing (need a URL and a service role key).',
      },
      { status: 500 }
    )
  }

  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('keep_alive')
      .update({ last_ping: now })
      .eq('id', 1)
      .select('id, last_ping')

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          supabase: 'error',
          updated: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    const updated = Array.isArray(data) && data.length > 0

    return NextResponse.json(
      {
        ok: true,
        supabase: 'connected',
        updated,
        last_ping: updated ? data[0].last_ping : null,
      },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        supabase: 'error',
        updated: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
