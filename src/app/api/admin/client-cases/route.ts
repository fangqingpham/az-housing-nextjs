import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/server/staff-auth'

// ── GET  /api/admin/client-cases ─────────────────────────────────
// Query params:
//   caller_role=admin|agent  (required for agent filtering)
//   caller_id=<uuid>         (required when caller_role=agent)
//   archived=true|false      (default false)
//   client_type, service_type, status, priority, agent_id, search
export async function GET(request: Request) {
  const auth = await requireStaff()
  if ('error' in auth) return auth.error
  const { admin, user } = auth
  const { searchParams } = new URL(request.url)

  const archived   = searchParams.get('archived') === 'true'

  let query = admin
    .from('client_cases')
    .select('*')
    .eq('archived', archived)
    .order('created_at', { ascending: false })

  // Agents only see cases assigned to them
  if (user.role === 'agent') {
    query = query.eq('assigned_agent_id', user.id)
  } else {
    // Admins can filter by agent optionally
    const agentId = searchParams.get('agent_id')
    if (agentId) query = query.eq('assigned_agent_id', agentId)
  }

  const clientType  = searchParams.get('client_type')
  const serviceType = searchParams.get('service_type')
  const status      = searchParams.get('status')
  const priority    = searchParams.get('priority')

  if (clientType)  query = query.eq('client_type', clientType)
  if (serviceType) query = query.eq('service_type', serviceType)
  if (status)      query = query.eq('status', status)
  if (priority)    query = query.eq('priority', priority)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to load cases: ' + error.message }, { status: 500 })

  // Text search across key columns (done in memory — fast enough for CRM scale)
  const search = searchParams.get('search')?.toLowerCase().trim()
  const cases = search
    ? (data || []).filter(c =>
        [c.full_name, c.phone, c.email, c.case_number, c.property_address]
          .some(v => v && String(v).toLowerCase().includes(search))
      )
    : data || []

  return NextResponse.json({ cases })
}

// ── POST /api/admin/client-cases ─────────────────────────────────
export async function POST(request: Request) {
  const auth = await requireStaff()
  if ('error' in auth) return auth.error
  const { admin, user } = auth
  const body  = await request.json()

  if (!body.full_name?.trim()) return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
  if (!body.client_type)        return NextResponse.json({ error: 'client_type is required' }, { status: 400 })

  // If agent is creating (caller_role=agent) and no assigned_agent_id, auto-assign to self
  if (user.role === 'agent') {
    body.assigned_agent_id = user.id
  }

  // Strip internal-only fields before insert
  const { caller_role: _cr, caller_id: _ci, ...payload } = body

  const insert: Record<string, any> = {
    full_name:              payload.full_name?.trim(),
    client_type:            payload.client_type,
    phone:                  payload.phone              || null,
    email:                  payload.email              || null,
    preferred_contact:      payload.preferred_contact  || null,
    language:               payload.language           || null,
    lead_source:            payload.lead_source        || null,
    assigned_agent_id:      payload.assigned_agent_id  || null,
    status:                 payload.status             || 'New',
    priority:               payload.priority           || 'Normal',
    property_address:       payload.property_address   || null,
    unit:                   payload.unit               || null,
    city:                   payload.city               || null,
    province:               payload.province           || null,
    postal_code:            payload.postal_code        || null,
    property_type:          payload.property_type      || null,
    rent_amount:            payload.rent_amount        ? Number(payload.rent_amount) : null,
    purchase_price:         payload.purchase_price     ? Number(payload.purchase_price) : null,
    sale_price:             payload.sale_price         ? Number(payload.sale_price) : null,
    service_type:           payload.service_type       || null,
    start_date:             payload.start_date         || null,
    end_date:               payload.end_date           || null,
    deadline:               payload.deadline           || null,
    client_needs:           payload.client_needs       || null,
    current_situation:      payload.current_situation  || null,
    next_followup_date:     payload.next_followup_date || null,
    next_action:            payload.next_action        || null,
    last_contacted_date:    payload.last_contacted_date || null,
    related_landlord:       payload.related_landlord   || null,
    related_tenant:         payload.related_tenant     || null,
    related_buyer:          payload.related_buyer      || null,
    related_seller:         payload.related_seller     || null,
    related_realtor:        payload.related_realtor    || null,
    related_mortgage_agent: payload.related_mortgage_agent || null,
    related_paralegal:      payload.related_paralegal  || null,
    checklist:              payload.checklist          || {},
    source_order_id:        payload.source_order_id    || null,
  }

  const { data, error } = await admin
    .from('client_cases')
    .insert(insert)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create case: ' + error.message }, { status: 500 })
  return NextResponse.json({ case: data }, { status: 201 })
}
