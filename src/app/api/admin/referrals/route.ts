import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, publicError } from '@/lib/server/referrals'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = getAdminClient()
    const [partnersRes, submissionsRes, payoutsRes] = await Promise.all([
      admin.from('referral_partners').select('*').order('created_at', { ascending: false }),
      admin.from('referral_submissions').select('*').order('created_at', { ascending: false }),
      admin.from('referral_payouts').select('*, partner:referral_partner_id(*)').order('created_at', { ascending: false }),
    ])

    if (partnersRes.error) throw partnersRes.error
    if (submissionsRes.error) throw submissionsRes.error
    if (payoutsRes.error) throw payoutsRes.error

    return NextResponse.json({
      partners: partnersRes.data || [],
      submissions: submissionsRes.data || [],
      payouts: payoutsRes.data || [],
    })
  } catch (err) {
    console.error('[admin referrals GET]', err)
    return NextResponse.json(publicError('Referral data could not be loaded.'), { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json(publicError('Payout id is required.'), { status: 400 })

    const allowed = [
      'agreement_signed_at',
      'client_payment_received_at',
      'client_payment_cleared_at',
      'eligibility_status',
      'payment_status',
      'paid_at',
      'notes',
    ]
    const payload: Record<string, any> = {}
    for (const key of allowed) {
      if (key in updates) payload[key] = updates[key] || null
    }
    if (Object.keys(payload).length === 0) {
      return NextResponse.json(publicError('No valid fields to update.'), { status: 400 })
    }

    const { data, error } = await getAdminClient()
      .from('referral_payouts')
      .update(payload)
      .eq('id', id)
      .select('*, partner:referral_partner_id(*)')
      .single()
    if (error) throw error

    return NextResponse.json({ payout: data })
  } catch (err) {
    console.error('[admin referrals PATCH]', err)
    return NextResponse.json(publicError('Referral payout could not be updated.'), { status: 500 })
  }
}
