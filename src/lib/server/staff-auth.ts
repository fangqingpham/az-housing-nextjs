import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type StaffUser = { id: string; role: 'admin' | 'agent' }

export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars missing')
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function requireStaff(request: Request, allowedRoles: StaffUser['role'][] = ['admin', 'agent']) {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  if (!match?.[1]) {
    return { error: NextResponse.json({ error: 'Unauthorized: missing bearer token.' }, { status: 401 }) }
  }

  let admin
  try {
    admin = getServiceRoleClient()
  } catch (error) {
    console.error('[staff auth] Supabase server configuration is missing', error)
    return { error: NextResponse.json({ error: 'Server authentication is not configured.' }, { status: 500 }) }
  }

  const { data: { user }, error } = await admin.auth.getUser(match[1])
  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized: invalid or expired session.' }, { status: 401 }) }
  }

  const { data: staff, error: staffError } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (staffError) {
    console.error('[staff auth] Staff role lookup failed', staffError.message)
    return { error: NextResponse.json({ error: 'Could not verify the staff role.' }, { status: 500 }) }
  }
  if (!staff || !allowedRoles.includes(staff.role)) {
    return { error: NextResponse.json({ error: 'Forbidden: this account does not have the required staff role.' }, { status: 403 }) }
  }

  return { user: staff as StaffUser, admin }
}
