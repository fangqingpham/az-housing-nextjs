'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AgentGuard, { AgentUser } from '@/components/admin/AgentGuard'

type Order = {
  id: string; created_at: string; landlord_name: string; company_name: string | null
  phone: string; email: string; mailing_address: string; property_address: string
  city: string; postal_code: string; property_type: string; expected_rent: string | null
  bedrooms: string | null; bathrooms: string | null; move_in_date: string | null
  showing_ready: string; selected_services: string[]; estimated_total: number
  additional_notes: string | null; status: string
  commission: number; commission_paid: boolean
}

type ActivityLog = {
  id: string; created_at: string; action: string
  old_value: string | null; new_value: string | null; role: string
}

const STATUS_OPTIONS = [
  { value: 'new',       label: 'New',       color: '#a86d1a', bg: '#FEF3DC' },
  { value: 'contacted', label: 'Contacted', color: '#1a5ea8', bg: '#E3F2FD' },
  { value: 'completed', label: 'Completed', color: '#2d7a4f', bg: '#E1F5EE' },
  { value: 'cancelled', label: 'Cancelled', color: '#a32d2d', bg: '#FCEBEB' },
]

const ACTION_LABELS: Record<string, string> = {
  status_change:   '🔄 Status changed',
  agent_assigned:  '👤 Agent assigned',
  commission_set:  '💵 Commission set',
  commission_paid: '✅ Commission paid',
}

function statusStyle(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s) || { color: '#a8a8a4', bg: '#f7f4ef', label: s }
}

function Dashboard({ agent }: { agent: AgentUser }) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, ActivityLog[]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => { load() }, [agent.id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('tenant_placement_orders')
      .select('*')
      .eq('assigned_agent_id', agent.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    if (!logs[orderId]) {
      const supabase = createClient()
      const { data } = await supabase
        .from('order_activity_log')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(20)
      setLogs(prev => ({ ...prev, [orderId]: data || [] }))
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setSaving(orderId)
    const r = await fetch('/api/admin/tenant-placement-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus, changed_by: agent.id, changed_by_role: 'agent' }),
    })
    if (!r.ok) { showToast('Failed to update status.'); setSaving(null); return }
    const json = await r.json()
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o))
    // Refresh logs for this order
    const supabase = createClient()
    const { data } = await supabase
      .from('order_activity_log')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(20)
    setLogs(prev => ({ ...prev, [orderId]: data || [] }))
    showToast('Status updated ✓')
    setSaving(null)
  }

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/admin/login')
  }

  const totalEarned  = orders.filter(o => o.status === 'completed' && o.commission_paid).reduce((s, o) => s + (o.commission || 0), 0)
  const totalPending = orders.filter(o => o.status === 'completed' && !o.commission_paid).reduce((s, o) => s + (o.commission || 0), 0)
  const activeCount  = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length

  return (
    <div style={{ minHeight: '100vh', background: '#f1ede7' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1b2a4a', color: '#fff', padding: '12px 24px', borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ background: '#0c1525', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <div>
            <p style={{ fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 700, color: '#f5a623', margin: 0 }}>A–Z Housing</p>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Agent Portal</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>👤 {agent.fname} {agent.lname}</span>
          <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign out
          </button>
        </div>
      </header>

      <div style={{ padding: 'clamp(20px,3vw,36px)', maxWidth: 1100, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#1b2a4a', margin: '0 0 4px' }}>Welcome back, {agent.fname} 👋</h1>
          <p style={{ color: '#6b6b67', fontSize: 13, margin: 0 }}>Manage your assigned orders below.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Orders',   value: orders.length,                                    icon: '📋', bg: '#E8F4FD', color: '#1a5ea8' },
            { label: 'Active',         value: activeCount,                                       icon: '⚡', bg: '#FEF3DC', color: '#a86d1a' },
            { label: 'Income Earned',  value: `$${totalEarned.toLocaleString('en-CA')}`,         icon: '💵', bg: '#E1F5EE', color: '#2d7a4f' },
            { label: 'Pending Payout', value: `$${totalPending.toLocaleString('en-CA')}`,        icon: '⏳', bg: '#F0E8FD', color: '#6930c3' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 16px', border: '1px solid rgba(12,21,37,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600, color: '#1b2a4a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b6b67', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1b2a4a', margin: '0 0 16px' }}>My Orders</h2>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', background: '#fff', borderRadius: 14 }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', background: '#fff', borderRadius: 14 }}>No orders assigned yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => {
              const sc = statusStyle(o.status)
              const isOpen = expanded === o.id
              const orderLogs = logs[o.id] || []

              return (
                <div key={o.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(12,21,37,0.08)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {/* Card header */}
                  <div
                    onClick={() => toggleExpand(o.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', gap: 16, flexWrap: 'wrap' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1b2a4a' }}>{o.landlord_name}</div>
                      <div style={{ fontSize: 13, color: '#6b6b67', marginTop: 2 }}>{o.property_address}, {o.city}</div>
                      <div style={{ fontSize: 11.5, color: '#a8a8a4', marginTop: 2 }}>
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : '--'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1b2a4a' }}>
                        ${Number(o.estimated_total || 0).toLocaleString('en-CA')}
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {sc.label}
                      </span>
                      <span style={{ fontSize: 10, color: '#a8a8a4' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f0ede6', padding: '20px 20px 24px' }}>

                      {/* Order info grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px 24px', marginBottom: 20, fontSize: 13 }}>
                        {[
                          { label: 'Phone',         value: o.phone },
                          { label: 'Email',         value: o.email },
                          { label: 'Property Type', value: o.property_type },
                          { label: 'Expected Rent', value: o.expected_rent || '--' },
                          { label: 'Beds / Baths',  value: `${o.bedrooms || '--'} / ${o.bathrooms || '--'}` },
                          { label: 'Move-in Date',  value: o.move_in_date || '--' },
                          { label: 'Showing Ready', value: o.showing_ready },
                          { label: 'Mailing Addr',  value: o.mailing_address },
                        ].map(f => (
                          <div key={f.label}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 2 }}>{f.label}</div>
                            <div style={{ color: '#1b2a4a' }}>{f.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Services */}
                      {Array.isArray(o.selected_services) && o.selected_services.length > 0 && (
                        <div style={{ background: '#f7f4ef', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6b6b67', marginBottom: 8 }}>Selected Services</div>
                          <ul style={{ margin: 0, paddingLeft: 18, color: '#1b2a4a', fontSize: 13, lineHeight: 1.8 }}>
                            {o.selected_services.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {o.additional_notes && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 4 }}>Notes</div>
                          <p style={{ fontSize: 13, color: '#6b6b67', margin: 0, lineHeight: 1.6 }}>{o.additional_notes}</p>
                        </div>
                      )}

                      {/* Commission info */}
                      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        <div style={{ background: '#E1F5EE', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}>
                          <span style={{ color: '#6b6b67' }}>Commission: </span>
                          <span style={{ fontWeight: 700, color: '#2d7a4f' }}>${Number(o.commission || 0).toLocaleString('en-CA')}</span>
                        </div>
                        <div style={{ background: o.commission_paid ? '#E1F5EE' : '#FEF3DC', borderRadius: 10, padding: '10px 16px', fontSize: 13 }}>
                          <span style={{ color: '#6b6b67' }}>Payout: </span>
                          <span style={{ fontWeight: 700, color: o.commission_paid ? '#2d7a4f' : '#a86d1a' }}>
                            {o.commission_paid ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Status update */}
                      <div style={{ background: '#f7f4ef', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', marginBottom: 12, letterSpacing: 0.5 }}>UPDATE ORDER STATUS</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              disabled={o.status === opt.value || saving === o.id}
                              onClick={() => updateStatus(o.id, opt.value)}
                              style={{
                                background: o.status === opt.value ? opt.bg : '#fff',
                                color: o.status === opt.value ? opt.color : '#6b6b67',
                                border: `1.5px solid ${o.status === opt.value ? opt.color : '#e4e1d8'}`,
                                borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                                cursor: o.status === opt.value ? 'default' : 'pointer',
                                fontFamily: 'inherit', transition: 'all 0.15s',
                                opacity: saving === o.id && o.status !== opt.value ? 0.5 : 1,
                              }}
                            >
                              {o.status === opt.value ? '● ' : ''}{opt.label}
                            </button>
                          ))}
                        </div>
                        {saving === o.id && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#a8a8a4' }}>Saving…</p>}
                      </div>

                      {/* Activity log */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', marginBottom: 10, letterSpacing: 0.5 }}>ACTIVITY LOG</div>
                        {orderLogs.length === 0 ? (
                          <p style={{ fontSize: 12, color: '#a8a8a4', margin: 0 }}>No activity yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {orderLogs.map(log => (
                              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: '#6b6b67' }}>
                                <span style={{ whiteSpace: 'nowrap', color: '#a8a8a4', flexShrink: 0 }}>
                                  {new Date(log.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span>
                                  <span style={{ fontWeight: 600, color: '#1b2a4a' }}>{ACTION_LABELS[log.action] || log.action}</span>
                                  {log.old_value && log.new_value && (
                                    <span> — <span style={{ textDecoration: 'line-through', color: '#a8a8a4' }}>{log.old_value}</span> → <span style={{ color: '#1b2a4a', fontWeight: 600 }}>{log.new_value}</span></span>
                                  )}
                                  <span style={{ marginLeft: 6, fontSize: 10, background: log.role === 'agent' ? '#E3F2FD' : '#FEF3DC', color: log.role === 'agent' ? '#1a5ea8' : '#a86d1a', padding: '1px 6px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                                    {log.role}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgentDashboardPage() {
  return <AgentGuard>{(agent) => <Dashboard agent={agent} />}</AgentGuard>
}
