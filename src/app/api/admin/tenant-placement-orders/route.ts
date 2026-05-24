import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase admin env vars missing.');
  return createClient(supabaseUrl, serviceRoleKey);
}

function deriveServiceType(selectedServices: string[]): string {
  if (!Array.isArray(selectedServices)) return 'Tenant Placement';
  const joined = selectedServices.join(' ').toLowerCase();
  if (joined.includes('property management')) return 'Property Management';
  return 'Tenant Placement';
}

// ── GET /api/admin/tenant-placement-orders ──────────────────────────────────
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: orders, error } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Orders could not be loaded.' }, { status: 500 });
    if (!orders || orders.length === 0) return NextResponse.json({ orders: [] });

    // Fetch linked client cases and merge
    const orderIds = orders.map(o => o.id);
    const { data: cases } = await supabase
      .from('client_cases')
      .select('source_order_id, case_number, id')
      .in('source_order_id', orderIds);

    const caseMap: Record<string, { case_number: string; case_id: string }> = {};
    for (const c of cases || []) {
      if (c.source_order_id) {
        caseMap[c.source_order_id] = { case_number: c.case_number, case_id: c.id };
      }
    }

    const enriched = orders.map(o => ({
      ...o,
      linked_case_number: caseMap[o.id]?.case_number ?? null,
      linked_case_id:     caseMap[o.id]?.case_id     ?? null,
    }));

    return NextResponse.json({ orders: enriched });
  } catch (err) {
    console.error('[GET tenant-placement-orders]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// ── PATCH /api/admin/tenant-placement-orders ────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, commission, commission_paid, changed_by, changed_by_role } = body;

    if (!id) return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Fetch current order
    const { data: current, error: fetchErr } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    const logs: any[] = [];

    // ── Status ────────────────────────────────────────────────────────────
    if (status !== undefined && status !== current.status) {
      const allowed = ['new', 'contacted', 'completed', 'cancelled'];
      if (!allowed.includes(status))
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      updates.status = status;
      logs.push({
        order_id: id, changed_by: changed_by || null, role: changed_by_role || 'unknown',
        action: 'status_change', old_value: current.status, new_value: status,
      });
    }

    // ── Agent assignment — explicit null-safe handling ────────────────────
    // The key is present in the body (even if its value is null/empty string)
    const agentKeyInBody = 'assigned_agent_id' in body;
    // Normalise: empty string '' → null (matches the <select> option value="")
    const newAgentId: string | null =
      body.assigned_agent_id === '' || body.assigned_agent_id == null
        ? null
        : String(body.assigned_agent_id);

    const agentChanged = agentKeyInBody && newAgentId !== current.assigned_agent_id;

    if (agentChanged) {
      // Explicitly set the column — null means NULL in the DB (unassign)
      updates.assigned_agent_id = newAgentId;
      logs.push({
        order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin',
        action: 'agent_assigned',
        old_value: current.assigned_agent_id || 'unassigned',
        new_value: newAgentId || 'unassigned',
      });
    }

    // ── Commission ────────────────────────────────────────────────────────
    if (commission !== undefined) {
      updates.commission = commission;
      logs.push({
        order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin',
        action: 'commission_set',
        old_value: String(current.commission || 0), new_value: String(commission),
      });
    }

    if (commission_paid !== undefined) {
      updates.commission_paid = commission_paid;
      logs.push({
        order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin',
        action: 'commission_paid',
        old_value: String(current.commission_paid), new_value: String(commission_paid),
      });
    }

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });

    // ── Perform the update ────────────────────────────────────────────────
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('tenant_placement_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr || !updatedOrder) {
      console.error('[PATCH tenant-placement-orders] update error:', updateErr);
      return NextResponse.json({ error: 'Order could not be updated.' }, { status: 500 });
    }

    if (logs.length > 0) await supabase.from('order_activity_log').insert(logs);

    // ── Sync client case when agent changes ───────────────────────────────
    let linkedCase: { case_number: string; case_id: string } | null = null;

    if (agentChanged) {
      // Look up existing linked case for this order
      const { data: existingCases } = await supabase
        .from('client_cases')
        .select('id, case_number')
        .eq('source_order_id', id)
        .limit(1);
      const existingCase = existingCases?.[0] ?? null;

      if (existingCase) {
        // Case exists — update its assigned agent to match the order
        await supabase
          .from('client_cases')
          .update({ assigned_agent_id: newAgentId })
          .eq('id', existingCase.id);
        linkedCase = { case_number: existingCase.case_number, case_id: existingCase.id };
      } else if (newAgentId) {
        // No case yet and we have a new agent — create one
        const serviceType = deriveServiceType(current.selected_services || []);
        const rentRaw = String(current.expected_rent || '').replace(/[^0-9.]/g, '');
        const rentAmount = rentRaw ? Number(rentRaw) : null;

        const { data: newCase } = await supabase
          .from('client_cases')
          .insert({
            full_name:         current.landlord_name   || '',
            client_type:       'Landlord',
            phone:             current.phone            || null,
            email:             current.email            || null,
            lead_source:       'Order Form',
            assigned_agent_id: newAgentId,
            status:            'New',
            priority:          'Normal',
            property_address:  current.property_address || null,
            city:              current.city             || null,
            postal_code:       current.postal_code      || null,
            property_type:     current.property_type    || null,
            rent_amount:       rentAmount,
            service_type:      serviceType,
            client_needs:      current.additional_notes || null,
            source_order_id:   id,
            checklist:         {},
          })
          .select('id, case_number')
          .single();

        if (newCase) linkedCase = { case_number: newCase.case_number, case_id: newCase.id };
      }
    } else {
      // No agent change — return existing linked case number if any
      const { data: existingCases } = await supabase
        .from('client_cases')
        .select('id, case_number')
        .eq('source_order_id', id)
        .limit(1);
      const existingCase = existingCases?.[0] ?? null;
      if (existingCase) linkedCase = { case_number: existingCase.case_number, case_id: existingCase.id };
    }

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        linked_case_number: linkedCase?.case_number ?? null,
        linked_case_id:     linkedCase?.case_id     ?? null,
      },
    });
  } catch (err) {
    console.error('[PATCH tenant-placement-orders]', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
