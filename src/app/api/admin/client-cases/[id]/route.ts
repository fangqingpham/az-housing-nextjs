import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/server/staff-auth'

type RouteContext = { params: { id: string } }

// UUID columns that must never receive an empty string — coerce '' → null
const UUID_COLS = ['assigned_agent_id']

// Date/numeric columns where empty string should also become null
const NULLABLE_COLS = [
  'start_date', 'end_date', 'deadline', 'next_followup_date', 'last_contacted_date',
  'rent_amount', 'purchase_price', 'sale_price',
]

function sanitiseUpdates(raw: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (UUID_COLS.includes(k)) {
      // '' or 'null' → null; any other truthy string kept as-is
      out[k] = (v === '' || v === 'null' || v == null) ? null : v
    } else if (NULLABLE_COLS.includes(k)) {
      out[k] = (v === '' || v == null) ? null : v
    } else {
      out[k] = v
    }
  }
  return out
}

// ── GET /api/admin/client-cases/[id] ─────────────────────────────
export async function GET(request: Request, { params }: RouteContext) {
  const auth = await requireStaff(request)
  if ('error' in auth) return auth.error
  const { admin, user } = auth

  const { data, error } = await admin
    .from('client_cases')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  if (user.role === 'agent' && data.assigned_agent_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ case: data })
}

// ── PATCH /api/admin/client-cases/[id] ───────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireStaff(request)
  if ('error' in auth) return auth.error
  const { admin, user } = auth
  const body  = await request.json()

  // Verify case exists
  const { data: existing, error: fetchErr } = await admin
    .from('client_cases')
    .select('id, assigned_agent_id')
    .eq('id', params.id)
    .single()

  if (fetchErr || !existing) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  // Agents can only edit their own cases
  if (user.role === 'agent' && existing.assigned_agent_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Strip meta/immutable fields
  const {
    caller_role: _cr, caller_id: _ci,
    id: _id, case_number: _cn, source_order_id: _soi,
    created_at: _ca, updated_at: _ua,
    ...raw
  } = body

  // Agents cannot reassign cases
  if (user.role === 'agent') delete raw.assigned_agent_id

  // ⚠️  Sanitise empty strings → null for UUID / date / numeric columns
  //     Supabase rejects '' for uuid-typed columns with a 500 error
  const updates = sanitiseUpdates(raw)

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('client_cases')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH client-cases/[id]]', error.message, '| updates:', JSON.stringify(updates))
    return NextResponse.json({ error: 'Failed to update case: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ case: data })
}
