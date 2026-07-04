import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export type StaffUser = { id: string; role: 'admin' | 'agent' }

export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars missing')
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function requireStaff(allowedRoles: StaffUser['role'][] = ['admin', 'agent']) {
  const sessionClient = createSessionClient()
  const { data: { user }, error } = await sessionClient.auth.getUser()
  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = getServiceRoleClient()
  const { data: staff } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!staff || !allowedRoles.includes(staff.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user: staff as StaffUser, admin }
}
