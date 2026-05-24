import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  const { data, error } = await admin()
    .from('commission_records')
    .select('*, agent:agent_id(id, fname, lname, email)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ records: data || [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await admin()
      .from('commission_records').insert([body])
      .select('*, agent:agent_id(id,fname,lname,email)').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ record: data })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { data, error } = await admin()
      .from('commission_records').update(updates).eq('id', id)
      .select('*, agent:agent_id(id,fname,lname,email)').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ record: data })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await admin().from('commission_records').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
