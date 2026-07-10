import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireStaff } from '@/lib/server/staff-auth';
import { cleanLeadTracking, leadTrackingSummary } from '@/lib/lead-tracking';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase admin env vars missing.');
  return createClient(supabaseUrl, serviceRoleKey);
}

function deriveServiceType(selectedServices: string[]): string {
  if (!Array.isArray(selectedServices)) return 'Tenant Placement';
  const joined = selectedServices.join(' ').toLowerCase();
  if (joined.includes('landing arrangement')) return 'Landing Arrangement';
  if (joined.includes('property management')) return 'Property Management';
  return 'Tenant Placement';
}

function deriveTransactionType(selectedServices: string[]): string {
  if (!Array.isArray(selectedServices)) return 'tenant_placement';
  const joined = selectedServices.join(' ').toLowerCase();
  if (joined.includes('landing arrangement')) return 'landing_arrangement';
  if (joined.includes('property management')) return 'property_management';
  return 'tenant_placement';
}

// ── GET /api/admin/tenant-placement-orders ──────────────────────────────────
export async function GET(request: Request) {
  try {
    const auth = await requireStaff(request);
    if ('error' in auth) return auth.error;
    const supabase = getSupabaseAdmin();

    let ordersQuery = supabase
      .from('tenant_placement_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (auth.user.role === 'agent') ordersQuery = ordersQuery.eq('assigned_agent_id', auth.user.id);
    const { data: orders, error } = await ordersQuery;

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
    const auth = await requireStaff(request);
    if ('error' in auth) return auth.error;
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
    if (auth.user.role === 'agent' && current.assigned_agent_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    if (auth.user.role === 'agent' && ('assigned_agent_id' in body || commission !== undefined || commission_paid !== undefined)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const updates: Record<string, any> = {};
    const logs: any[] = [];

    // ── Status ────────────────────────────────────────────────────────────
    const statusChanging = status !== undefined && status !== current.status;
    if (statusChanging) {
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
    const agentKeyInBody = 'assigned_agent_id' in body;
    const newAgentId: string | null =
      body.assigned_agent_id === '' || body.assigned_agent_id == null
        ? null
        : String(body.assigned_agent_id);

    const agentChanged = agentKeyInBody && newAgentId !== current.assigned_agent_id;

    if (agentChanged) {
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

    // ── Auto-create commission record when order → completed ──────────────
    if (statusChanging && status === 'completed') {
      // Only create once per order — check if one already exists
      const { data: existingComm } = await supabase
        .from('commission_records')
        .select('id')
        .eq('source_order_id', id)
        .limit(1);

      if (!existingComm || existingComm.length === 0) {
        const agentId  = agentChanged ? newAgentId : current.assigned_agent_id;
        const fee      = Number(current.estimated_total || 0);
        const txType   = deriveTransactionType(current.selected_services || []);
        const svcType  = deriveServiceType(current.selected_services || []);

        // total_commission and final_amount are generated columns — do NOT insert them
        const city = current.city ? `, ${current.city}` : '';
        await supabase.from('commission_records').insert({
          source_order_id:   id,
          agent_id:          agentId || null,
          client_name:       current.landlord_name || '',
          client_type:       svcType === 'Landing Arrangement' ? 'tenant' : 'landlord',
          property_address:  `${current.property_address || ''}${city}`,
          transaction_type:  txType,
          service_type:      svcType,
          deal_status:       'closed',
          total_service_fee: fee,
          commission_type:   'percentage',
          commission_rate:   0,
          flat_commission:   0,
          adjustment_amount: 0,
          payment_status:    'in_progress',
          notes: `Auto-generated from completed order on ${new Date().toISOString().slice(0, 10)}`,
        });
      }
    }

    // ── Sync client case when agent changes ───────────────────────────────
    let linkedCase: { case_number: string; case_id: string } | null = null;

    if (agentChanged) {
      const { data: existingCases } = await supabase
        .from('client_cases')
        .select('id, case_number')
        .eq('source_order_id', id)
        .limit(1);
      const existingCase = existingCases?.[0] ?? null;

      if (existingCase) {
        await supabase
          .from('client_cases')
          .update({ assigned_agent_id: newAgentId })
          .eq('id', existingCase.id);
        linkedCase = { case_number: existingCase.case_number, case_id: existingCase.id };
      } else if (newAgentId) {
        const serviceType = deriveServiceType(current.selected_services || []);
        const isLandingArrangement = serviceType === 'Landing Arrangement';
        const rentRaw = String(current.expected_rent || '').replace(/[^0-9.]/g, '');
        const rentAmount = rentRaw ? Number(rentRaw) : null;
        const leadTracking = cleanLeadTracking(current.lead_tracking || current);
        const sourceDetail = leadTrackingSummary(leadTracking);

        const { data: newCase } = await supabase
          .from('client_cases')
          .insert({
            full_name:         current.landlord_name   || '',
            client_type:       isLandingArrangement ? 'Tenant' : 'Landlord',
            phone:             current.phone            || null,
            email:             current.email            || null,
            lead_source:       'Order Form',
            lead_source_detail: sourceDetail || null,
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
            checklist:         { lead_tracking: leadTracking },
          })
          .select('id, case_number')
          .single();

        if (newCase) linkedCase = { case_number: newCase.case_number, case_id: newCase.id };
      }
    } else {
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
