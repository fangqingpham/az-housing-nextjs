import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server settings are missing.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Tenant placement orders fetch error:', error);
      return NextResponse.json(
        { error: 'Tenant placement orders could not be loaded.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error('Tenant placement orders API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order id and status are required.' },
        { status: 400 }
      );
    }

    const allowedStatuses = ['new', 'contacted', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single();

    if (error) {
      console.error('Tenant placement order status update error:', error);
      return NextResponse.json(
        { error: 'Order status could not be updated.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('Tenant placement order status API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
