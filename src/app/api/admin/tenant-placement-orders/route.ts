import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase server settings are missing.');
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Orders could not be loaded.' }, { status: 500 });
    return NextResponse.json({ orders: data || [] });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assigned_agent_id, commission, commission_paid, changed_by, changed_by_role } = body;

    if (!id) return NextResponse.json({ error: 'Order id is required.' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Fetch current order to diff old vs new values
    const { data: current } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .eq('id', id)
      .single();

    const updates: Record<string, any> = {};
    const logs: any[] = [];

    if (status !== undefined && status !== current?.status) {
      const allowed = ['new', 'contacted', 'completed', 'cancelled'];
      if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      updates.status = status;
      logs.push({ order_id: id, changed_by: changed_by || null, role: changed_by_role || 'unknown', action: 'status_change', old_value: current?.status, new_value: status });
    }

    if (assigned_agent_id !== undefined) {
      updates.assigned_agent_id = assigned_agent_id || null;
      logs.push({ order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin', action: 'agent_assigned', old_value: current?.assigned_agent_id || 'unassigned', new_value: assigned_agent_id || 'unassigned' });
    }

    if (commission !== undefined) {
      updates.commission = commission;
      logs.push({ order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin', action: 'commission_set', old_value: String(current?.commission || 0), new_value: String(commission) });
    }

    if (commission_paid !== undefined) {
      updates.commission_paid = commission_paid;
      logs.push({ order_id: id, changed_by: changed_by || null, role: changed_by_role || 'admin', action: 'commission_paid', old_value: String(current?.commission_paid), new_value: String(commission_paid) });
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Order could not be updated.' }, { status: 500 });

    if (logs.length > 0) await supabase.from('order_activity_log').insert(logs);

    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
