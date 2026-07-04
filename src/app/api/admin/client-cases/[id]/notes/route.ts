import { NextResponse } from 'next/server'
import { requireStaff, StaffUser } from '@/lib/server/staff-auth'

type RouteContext = { params: { id: string } }

async function verifyCaseAccess(caseId: string, user: StaffUser, admin: ReturnType<typeof import('@/lib/server/staff-auth').getServiceRoleClient>) {
  const { data } = await admin
    .from('client_cases')
    .select('id, assigned_agent_id')
    .eq('id', caseId)
    .single()
  if (!data) return { ok: false, status: 404, error: 'Case not found' }
  if (user.role === 'agent' && data.assigned_agent_id !== user.id) {
    return { ok: false, status: 403, error: 'Forbidden' }
  }
  return { ok: true }
}

// ── GET /api/admin/client-cases/[id]/notes ────────────────────────
// Query params: caller_role=admin|agent  caller_id=<uuid>
export async function GET(request: Request, { params }: RouteContext) {
  const auth = await requireStaff(request)
  if ('error' in auth) return auth.error
  const check = await verifyCaseAccess(params.id, auth.user, auth.admin)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { data, error } = await auth.admin
    .from('case_notes')
    .select('*')
    .eq('case_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 })
  return NextResponse.json({ notes: data || [] })
}

// ── POST /api/admin/client-cases/[id]/notes ───────────────────────
// Body: { content, created_by, caller_role?, caller_id? }
export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireStaff(request)
  if ('error' in auth) return auth.error
  const body = await request.json()
  const check = await verifyCaseAccess(params.id, auth.user, auth.admin)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { content, created_by } = body
  if (!content?.trim()) return NextResponse.json({ error: 'Note content is required' }, { status: 400 })

  const { data, error } = await auth.admin
    .from('case_notes')
    .insert({
      case_id:    params.id,
      content:    content.trim(),
      created_by: created_by || 'Unknown',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to add note: ' + error.message }, { status: 500 })
  return NextResponse.json({ note: data }, { status: 201 })
}
