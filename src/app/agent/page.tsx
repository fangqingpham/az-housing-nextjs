'use client'

import { useEffect, useState, useMemo } from 'react'
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

type CommissionRecord = {
  id: string
  client_name: string; client_type: string
  related_file_id: string | null; property_address: string | null
  transaction_type: string; deal_status: string
  closing_date: string | null; service_type: string | null
  total_service_fee: number; commission_type: string
  commission_rate: number; flat_commission: number
  total_commission: number; adjustment_amount: number; final_amount: number
  deal_order_number: string | null; payment_status: string
  expected_payment_date: string | null; paid_date: string | null; notes: string | null
}

type ActivityLog = { id: string; created_at: string; action: string; old_value: string | null; new_value: string | null; role: string }

const STATUS_OPTIONS = [
  { value: 'new',       label: 'New',       color: '#a86d1a', bg: '#FEF3DC' },
  { value: 'contacted', label: 'Contacted', color: '#1a5ea8', bg: '#E3F2FD' },
  { value: 'completed', label: 'Completed', color: '#2d7a4f', bg: '#E1F5EE' },
  { value: 'cancelled', label: 'Cancelled', color: '#a32d2d', bg: '#FCEBEB' },
]
const TRANSACTION_LABELS: Record<string, string> = {
  tenant_placement: 'Tenant Placement', property_management: 'Property Management',
  mortgage_referral: 'Mortgage Referral', real_estate_referral: 'Real Estate Referral',
}
const DEAL_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead:        { label: 'Lead',        color: '#a8a8a4', bg: '#f7f4ef' },
  contacted:   { label: 'Contacted',   color: '#1a5ea8', bg: '#e3f2fd' },
  in_progress: { label: 'In Progress', color: '#6930c3', bg: '#f0e8fd' },
  closed:      { label: 'Closed',      color: '#2d7a4f', bg: '#e1f5ee' },
  cancelled:   { label: 'Cancelled',   color: '#a32d2d', bg: '#fcebeb' },
}
const PAYMENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In Progress', color: '#a86d1a', bg: '#FEF3DC' },
  paid:        { label: 'Paid',        color: '#2d7a4f', bg: '#E1F5EE' },
  cancelled:   { label: 'Cancelled',   color: '#a32d2d', bg: '#FCEBEB' },
}

const fmt = (n: number) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })
const ACTION_LABELS: Record<string, string> = {
  status_change: '🔄 Status changed', agent_assigned: '👤 Agent assigned',
  commission_set: '💵 Commission set', commission_paid: '✅ Commission paid',
}

type Tab = 'orders' | 'commission'

function Dashboard({ agent }: { agent: AgentUser }) {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('orders')
  const [orders, setOrders]   = useState<Order[]>([])
  const [commissions, setCommissions] = useState<CommissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [logs, setLogs]           = useState<Record<string, ActivityLog[]>>({})
  const [saving, setSaving]       = useState<string | null>(null)
  const [toast, setToast]         = useState('')

  useEffect(() => { load() }, [agent.id])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const [ordersRes, commRes] = await Promise.all([
      supabase.from('tenant_placement_orders').select('*').eq('assigned_agent_id', agent.id).order('created_at', { ascending: false }),
      supabase.from('commission_records').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }),
    ])
    setOrders(ordersRes.data || [])
    setCommissions(commRes.data || [])
    setLoading(false)
  }

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    if (!logs[orderId]) {
      const { data } = await createClient().from('order_activity_log').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(20)
      setLogs(prev => ({ ...prev, [orderId]: data || [] }))
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setSaving(orderId)
    const r = await fetch('/api/admin/tenant-placement-orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus, changed_by: agent.id, changed_by_role: 'agent' }),
    })
    if (!r.ok) { showToast('Failed to update status.'); setSaving(null); return }
    const json = await r.json()
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o))
    const { data } = await createClient().from('order_activity_log').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(20)
    setLogs(prev => ({ ...prev, [orderId]: data || [] }))
    showToast('Status updated ✓'); setSaving(null)
  }

  // ── Commission stats ──────────────────────────────────────────────────────
  const totalGross   = commissions.reduce((s, r) => s + (r.total_commission || 0), 0)
  const totalFinal   = commissions.reduce((s, r) => s + (r.final_amount || 0), 0)
  const totalPaid    = commissions.filter(r => r.payment_status === 'paid').reduce((s, r) => s + (r.final_amount || 0), 0)
  const totalPending = commissions.filter(r => r.payment_status === 'in_progress').reduce((s, r) => s + (r.final_amount || 0), 0)
  const nextPayment  = commissions
    .filter(r => r.payment_status === 'in_progress' && r.expected_payment_date)
    .sort((a, b) => (a.expected_payment_date! > b.expected_payment_date! ? 1 : -1))[0]

  // ── Order stats ───────────────────────────────────────────────────────────
  const activeOrders = orders.filter(o => !['completed','cancelled'].includes(o.status)).length
  const orderEarned  = orders.filter(o => o.status === 'completed' && o.commission_paid).reduce((s, o) => s + (o.commission || 0), 0)

  const handleSignOut = async () => { await createClient().auth.signOut(); router.push('/admin/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#f1ede7' }}>
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#1b2a4a', color:'#fff', padding:'12px 24px', borderRadius:999, fontSize:13, fontWeight:600, zIndex:999, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ background:'#0c1525', padding:'0 28px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:22 }}>🏠</span>
          <div>
            <p style={{ fontFamily:'Georgia,serif', fontSize:13, fontWeight:700, color:'#f5a623', margin:0 }}>A–Z Housing</p>
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.3)', margin:0 }}>Agent Portal</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>👤 {agent.fname} {agent.lname}</span>
          <button onClick={handleSignOut} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 14px', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Sign out</button>
        </div>
      </header>

      <div style={{ padding:'clamp(20px,3vw,36px)', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:26, color:'#1b2a4a', margin:'0 0 4px' }}>Welcome back, {agent.fname} 👋</h1>
          <p style={{ color:'#6b6b67', fontSize:13, margin:0 }}>Your personal agent dashboard.</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:'2px solid #e4e1d8' }}>
          {(['orders','commission'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background:'none', border:'none', padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color: tab === t ? '#f5a623' : '#6b6b67', borderBottom: tab === t ? '2px solid #f5a623' : '2px solid transparent', marginBottom:-2, textTransform:'capitalize', letterSpacing:0.5, transition:'color 0.15s' }}>
              {t === 'orders' ? 'My Orders' : 'My Commission'}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ──────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total Orders',  value:orders.length,         icon:'📋', bg:'#E8F4FD', color:'#1a5ea8' },
                { label:'Active',        value:activeOrders,           icon:'⚡', bg:'#FEF3DC', color:'#a86d1a' },
                { label:'Income Earned', value:fmt(orderEarned),       icon:'💵', bg:'#E1F5EE', color:'#2d7a4f' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'18px 16px', border:'1px solid rgba(12,21,37,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:7 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:600, color:'#1b2a4a', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:'#6b6b67', fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loading ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>Loading…</div>
              : orders.length === 0 ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>No orders assigned yet.</div>
              : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {orders.map(o => {
                  const sc = STATUS_OPTIONS.find(s => s.value === o.status) || STATUS_OPTIONS[0]
                  const isOpen = expanded === o.id
                  const orderLogs = logs[o.id] || []
                  return (
                    <div key={o.id} style={{ background:'#fff', borderRadius:14, border:'1px solid rgba(12,21,37,0.08)', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div onClick={() => toggleExpand(o.id)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer', gap:16, flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:15, color:'#1b2a4a' }}>{o.landlord_name}</div>
                          <div style={{ fontSize:13, color:'#6b6b67', marginTop:2 }}>{o.property_address}, {o.city}</div>
                          <div style={{ fontSize:11.5, color:'#a8a8a4', marginTop:2 }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : '--'}</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                          <div style={{ fontFamily:'Georgia,serif', fontSize:18, fontWeight:700, color:'#1b2a4a' }}>${Number(o.estimated_total||0).toLocaleString('en-CA')}</div>
                          <span style={{ background:sc.bg, color:sc.color, padding:'3px 12px', borderRadius:999, fontSize:11, fontWeight:700 }}>{sc.label}</span>
                          <span style={{ fontSize:10, color:'#a8a8a4' }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ borderTop:'1px solid #f0ede6', padding:'20px 20px 24px' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px 24px', marginBottom:20, fontSize:13 }}>
                            {[
                              ['Phone', o.phone], ['Email', o.email],
                              ['Property Type', o.property_type], ['Expected Rent', o.expected_rent||'--'],
                              ['Beds / Baths', `${o.bedrooms||'--'} / ${o.bathrooms||'--'}`], ['Move-in Date', o.move_in_date||'--'],
                              ['Showing Ready', o.showing_ready], ['Mailing Addr', o.mailing_address],
                            ].map(([lbl, val]) => (
                              <div key={lbl}>
                                <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                <div style={{ color:'#1b2a4a' }}>{val}</div>
                              </div>
                            ))}
                          </div>

                          {Array.isArray(o.selected_services) && o.selected_services.length > 0 && (
                            <div style={{ background:'#f7f4ef', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#6b6b67', marginBottom:8 }}>Selected Services</div>
                              <ul style={{ margin:0, paddingLeft:18, color:'#1b2a4a', fontSize:13, lineHeight:1.8 }}>
                                {o.selected_services.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          )}

                          {o.additional_notes && (
                            <div style={{ marginBottom:16 }}>
                              <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#a8a8a4', marginBottom:4 }}>Notes</div>
                              <p style={{ fontSize:13, color:'#6b6b67', margin:0, lineHeight:1.6 }}>{o.additional_notes}</p>
                            </div>
                          )}

                          <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                            <div style={{ background:'#E1F5EE', borderRadius:10, padding:'10px 16px', fontSize:13 }}>
                              <span style={{ color:'#6b6b67' }}>Commission: </span>
                              <span style={{ fontWeight:700, color:'#2d7a4f' }}>{fmt(o.commission)}</span>
                            </div>
                            <div style={{ background: o.commission_paid ? '#E1F5EE' : '#FEF3DC', borderRadius:10, padding:'10px 16px', fontSize:13 }}>
                              <span style={{ color:'#6b6b67' }}>Payout: </span>
                              <span style={{ fontWeight:700, color: o.commission_paid ? '#2d7a4f' : '#a86d1a' }}>{o.commission_paid ? '✓ Paid' : '⏳ Pending'}</span>
                            </div>
                          </div>

                          <div style={{ background:'#f7f4ef', borderRadius:12, padding:'16px 18px', marginBottom:20 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'#1b2a4a', marginBottom:12, letterSpacing:0.5 }}>UPDATE ORDER STATUS</div>
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                              {STATUS_OPTIONS.map(opt => (
                                <button key={opt.value} disabled={o.status === opt.value || saving === o.id} onClick={() => updateStatus(o.id, opt.value)}
                                  style={{ background: o.status === opt.value ? opt.bg : '#fff', color: o.status === opt.value ? opt.color : '#6b6b67', border:`1.5px solid ${o.status === opt.value ? opt.color : '#e4e1d8'}`, borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, cursor: o.status === opt.value ? 'default' : 'pointer', fontFamily:'inherit' }}>
                                  {o.status === opt.value ? '● ' : ''}{opt.label}
                                </button>
                              ))}
                            </div>
                            {saving === o.id && <p style={{ margin:'8px 0 0', fontSize:12, color:'#a8a8a4' }}>Saving…</p>}
                          </div>

                          {orderLogs.length > 0 && (
                            <div>
                              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#a8a8a4', marginBottom:10 }}>Activity Log</div>
                              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                {orderLogs.map(log => (
                                  <div key={log.id} style={{ display:'flex', gap:10, fontSize:12, alignItems:'flex-start' }}>
                                    <span style={{ color:'#a8a8a4', whiteSpace:'nowrap', flexShrink:0 }}>
                                      {new Date(log.created_at).toLocaleString('en-CA', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                                    </span>
                                    <span>
                                      <span style={{ fontWeight:600, color:'#1b2a4a' }}>{ACTION_LABELS[log.action] || log.action}</span>
                                      {log.old_value && log.new_value && <span style={{ color:'#6b6b67' }}> — <span style={{ textDecoration:'line-through', color:'#a8a8a4' }}>{log.old_value}</span> → <span style={{ fontWeight:600, color:'#1b2a4a' }}>{log.new_value}</span></span>}
                                      <span style={{ marginLeft:6, fontSize:10, padding:'1px 6px', borderRadius:4, fontWeight:700, textTransform:'uppercase', background: log.role === 'agent' ? '#E3F2FD' : '#FEF3DC', color: log.role === 'agent' ? '#1a5ea8' : '#a86d1a' }}>{log.role}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── COMMISSION TAB ──────────────────────────────────────────────── */}
        {tab === 'commission' && (
          <>
            {/* 5 summary cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total Gross Commission', value:fmt(totalGross),    icon:'💰', bg:'#f7f4ef', color:'#1b2a4a' },
                { label:'Total Final Payable',    value:fmt(totalFinal),    icon:'📄', bg:'#E8F4FD', color:'#1a5ea8' },
                { label:'Total Paid',             value:fmt(totalPaid),     icon:'✅', bg:'#E1F5EE', color:'#2d7a4f' },
                { label:'Total Pending',          value:fmt(totalPending),  icon:'⏳', bg:'#FEF3DC', color:'#a86d1a' },
                { label:'Next Expected Payment',  value: nextPayment ? nextPayment.expected_payment_date! : '—', icon:'📅', bg:'#F0E8FD', color:'#6930c3' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'18px 16px', border:'1px solid rgba(12,21,37,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:7 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize: s.label === 'Next Expected Payment' ? 16 : 22, fontWeight:600, color:s.color, lineHeight:1.2 }}>{s.value}</div>
                  <div style={{ fontSize:11.5, color:'#6b6b67', fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loading ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>Loading…</div>
              : commissions.length === 0 ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>No commission records assigned to you yet.</div>
              : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {commissions.map(r => {
                  const isOpen = expanded === r.id
                  const ds = DEAL_STATUS_LABELS[r.deal_status]
                  const ps = PAYMENT_LABELS[r.payment_status]
                  return (
                    <div key={r.id} style={{ background:'#fff', border:'1px solid rgba(12,21,37,0.08)', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div onClick={() => setExpanded(isOpen ? null : r.id)}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px', cursor:'pointer', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                            <span style={{ fontWeight:700, fontSize:15, color:'#1b2a4a' }}>{r.client_name}</span>
                            {r.related_file_id && <span style={{ fontSize:10, fontFamily:'monospace', color:'#a8a8a4', background:'#f7f4ef', padding:'2px 7px', borderRadius:4 }}>{r.related_file_id}</span>}
                            {r.transaction_type && <span style={{ fontSize:10, fontWeight:700, color:'#1a5ea8', background:'#e3f2fd', padding:'2px 8px', borderRadius:4 }}>{TRANSACTION_LABELS[r.transaction_type] || r.transaction_type}</span>}
                          </div>
                          <div style={{ fontSize:12, color:'#6b6b67', marginTop:2 }}>{r.property_address || '—'}</div>
                          {r.closing_date && <div style={{ fontSize:11.5, color:'#a8a8a4', marginTop:2 }}>Closes {r.closing_date}</div>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontFamily:'Georgia,serif', fontSize:16, fontWeight:700, color:'#1b2a4a' }}>{fmt(r.total_commission)}</div>
                            <div style={{ fontSize:10, color:'#a8a8a4' }}>gross commission</div>
                          </div>
                          {ds && <span style={{ background:ds.bg, color:ds.color, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{ds.label}</span>}
                          {ps && <span style={{ background:ps.bg, color:ps.color, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{ps.label}</span>}
                          <span style={{ fontSize:10, color:'#a8a8a4' }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ borderTop:'1px solid #f0ede6', padding:'18px 20px 22px' }}>
                          {/* Deal Information */}
                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Deal Information</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px 24px', marginBottom:18, fontSize:13 }}>
                            {[
                              ['Deal / Order Number', r.deal_order_number || '--'],
                              ['Client Name',         r.client_name],
                              ['Client Type',         r.client_type ? r.client_type.charAt(0).toUpperCase()+r.client_type.slice(1) : '--'],
                              ['Service Type',        r.service_type || '--'],
                              ['Property Address',    r.property_address || '--'],
                              ['Transaction Type',    TRANSACTION_LABELS[r.transaction_type] || '--'],
                              ['Deal Status',         ds?.label || '--'],
                              ['Closing Date',        r.closing_date || '--'],
                            ].map(([lbl, val]) => (
                              <div key={lbl}>
                                <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                <div style={{ color:'#1b2a4a', fontWeight:500 }}>{val}</div>
                              </div>
                            ))}
                          </div>

                          {/* Commission Information */}
                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Commission Information</div>
                          <div style={{ background:'#f7f4ef', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                              {[
                                ['Gross Commission',        fmt(r.total_commission)],
                                ['Commission Type',         r.commission_type === 'flat' ? 'Flat' : `${r.commission_rate}% of fee`],
                                ['Commission Rate',         r.commission_type === 'percentage' ? `${r.commission_rate}%` : '—'],
                                ['Flat Commission Amount',  r.commission_type === 'flat' ? fmt(r.flat_commission) : '—'],
                                ['Adjustment Amount',       fmt(r.adjustment_amount)],
                                ['Final Payable Amount',    fmt(r.final_amount)],
                              ].map(([lbl, val]) => (
                                <div key={lbl}>
                                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                  <div style={{ fontWeight: lbl === 'Final Payable Amount' ? 800 : 600, color: lbl === 'Final Payable Amount' ? '#2d7a4f' : '#1b2a4a', fontSize: lbl === 'Final Payable Amount' ? 16 : 13 }}>{val}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Information */}
                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Payment Information</div>
                          <div style={{ background:'#e8f4fd', borderRadius:12, padding:'14px 18px' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                              {[
                                ['Payment Status',      ps?.label || '--'],
                                ['Expected Payment Date', r.expected_payment_date || '--'],
                                ['Paid Date',           r.paid_date || '--'],
                              ].map(([lbl, val]) => (
                                <div key={lbl}>
                                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#1a5ea8', opacity:0.7, marginBottom:2 }}>{lbl}</div>
                                  <div style={{ fontWeight:600, color:'#1b2a4a' }}>{val}</div>
                                </div>
                              ))}
                            </div>
                            {r.notes && <div style={{ marginTop:10, fontSize:12, color:'#6b6b67', borderTop:'1px solid rgba(26,94,168,0.15)', paddingTop:8 }}><strong>Payment Notes:</strong> {r.notes}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AgentDashboardPage() {
  return <AgentGuard>{(agent) => <Dashboard agent={agent} />}</AgentGuard>
}
