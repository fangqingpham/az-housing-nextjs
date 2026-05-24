import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars missing')
  return createClient(url, key)
}

type RouteContext = { params: { id: string } }

async function verifyCaseAccess(caseId: string, callerRole: string, callerId: string | null) {
  const admin = getAdmin()
  const { data } = await admin
    .from('client_cases')
    .select('id, assigned_agent_id')
    .eq('id', caseId)
    .single()
  if (!data) return { ok: false, status: 404, error: 'Case not found' }
  if (callerRole === 'agent' && callerId && data.assigned_agent_id !== callerId) {
    return { ok: false, status: 403, error: 'Forbidden' }
  }
  return { ok: true }
}

// ── GET /api/admin/client-cases/[id]/notes ────────────────────────
// Query params: caller_role=admin|agent  caller_id=<uuid>
export async function GET(request: Request, { params }: RouteContext) {
  const { searchParams } = new URL(request.url)
  const callerRole = searchParams.get('caller_role') || 'admin'
  const callerId   = searchParams.get('caller_id')

  const check = await verifyCaseAccess(params.id, callerRole, callerId)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { data, error } = await getAdmin()
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
  const body = await request.json()
  const callerRole = body.caller_role || 'admin'
  const callerId   = body.caller_id   || null

  const check = await verifyCaseAccess(params.id, callerRole, callerId)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { content, created_by } = body
  if (!content?.trim()) return NextResponse.json({ error: 'Note content is required' }, { status: 400 })

  const { data, error } = await getAdmin()
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
