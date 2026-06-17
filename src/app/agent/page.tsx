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

type CommissionRecord = {
  id: string
  source_order_id: string | null  // links back to tenant_placement_orders.id
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

type ClientCase = {
  id: string; case_number: string; full_name: string; client_type: string
  phone: string | null; email: string | null; status: string; priority: string
  service_type: string | null; property_address: string | null; city: string | null
  next_followup_date: string | null; next_action: string | null; client_needs: string | null
  current_situation: string | null; deadline: string | null
  language: string | null; preferred_contact: string | null
  rent_amount: number | null; start_date: string | null; end_date: string | null
  last_contacted_date: string | null; checklist: Record<string, boolean>
  created_at: string; updated_at: string; assigned_agent_id: string | null
  related_landlord: string | null; related_tenant: string | null
  related_buyer: string | null; related_seller: string | null
  related_realtor: string | null; related_mortgage_agent: string | null
  related_paralegal: string | null
}
type CaseNote = { id: string; case_id: string; content: string; created_by: string; created_at: string }

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

const fmtMoney = (n: number) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })

type Tab = 'orders' | 'commission' | 'clients'

function Dashboard({ agent }: { agent: AgentUser }) {
  const router = useRouter()
  const [tab, setTab]         = useState<Tab>('orders')
  const [orders, setOrders]   = useState<Order[]>([])
  const [commissions, setCommissions] = useState<CommissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [saving, setSaving]       = useState<string | null>(null)
  const [toast, setToast]         = useState('')
  // Client cases state
  const [clientCases, setClientCases] = useState<ClientCase[]>([])
  const [casesLoading, setCasesLoading] = useState(false)
  const [caseSearch, setCaseSearch]   = useState('')
  const [caseStatusFilter, setCaseStatusFilter] = useState('')
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null)
  const [caseModalTab, setCaseModalTab] = useState<'details' | 'notes'>('details')
  const [caseNotes, setCaseNotes]       = useState<CaseNote[]>([])
  const [noteContent, setNoteContent]   = useState('')
  const [savingNote, setSavingNote]     = useState(false)
  const [showCreateCase, setShowCreateCase] = useState(false)

  useEffect(() => { load() }, [agent.id])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadClients = async () => {
    setCasesLoading(true)
    const r = await fetch(`/api/admin/client-cases?caller_role=agent&caller_id=${agent.id}`)
    if (r.ok) { const d = await r.json(); setClientCases(d.cases || []) }
    setCasesLoading(false)
  }

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

  const updateStatus = async (orderId: string, newStatus: string) => {
    setSaving(orderId)
    const r = await fetch('/api/admin/tenant-placement-orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus, changed_by: agent.id, changed_by_role: 'agent' }),
    })
    if (!r.ok) { showToast('Failed to update status.'); setSaving(null); return }
    const json = await r.json()
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o))
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

  const activeOrders = orders.filter(o => !['completed','cancelled'].includes(o.status)).length
  // Build a map: order_id → commission record (for Orders tab display)
  const commByOrderId = commissions.reduce((map, cr) => {
    if (cr.source_order_id) map[cr.source_order_id] = cr
    return map
  }, {} as Record<string, CommissionRecord>)
  // Income earned = sum of final_amount for paid commission records linked to this agent's orders
  const orderEarned = commissions
    .filter(cr => cr.source_order_id && cr.payment_status === 'paid')
    .reduce((s, cr) => s + (cr.final_amount || 0), 0)

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
          {(['orders','commission','clients'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'clients' && clientCases.length === 0) loadClients() }}
              style={{ background:'none', border:'none', padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color: tab === t ? '#f5a623' : '#6b6b67', borderBottom: tab === t ? '2px solid #f5a623' : '2px solid transparent', marginBottom:-2, textTransform:'capitalize', letterSpacing:0.5, transition:'color 0.15s' }}>
              {t === 'orders' ? 'My Orders' : t === 'commission' ? 'My Commission' : '👥 My Clients'}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total Orders',  value:orders.length,           icon:'📋', bg:'#E8F4FD', color:'#1a5ea8' },
                { label:'Active',        value:activeOrders,             icon:'⚡', bg:'#FEF3DC', color:'#a86d1a' },
                { label:'Income Earned', value:fmtMoney(orderEarned),   icon:'💵', bg:'#E1F5EE', color:'#2d7a4f' },
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
                  return (
                    <div key={o.id} style={{ background:'#fff', borderRadius:14, border:'1px solid rgba(12,21,37,0.08)', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div onClick={() => setExpanded(isOpen ? null : o.id)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer', gap:16, flexWrap:'wrap' }}>
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

                          {(() => {
                            const cr = commByOrderId[o.id]
                            const commAmt  = cr ? (cr.final_amount || 0)        : (o.commission || 0)
                            const isPaid   = cr ? cr.payment_status === 'paid'  : o.commission_paid
                            const payLabel = cr
                              ? (PAYMENT_LABELS[cr.payment_status]?.label || cr.payment_status)
                              : (o.commission_paid ? 'Paid' : 'Pending')
                            const payColor = isPaid ? '#2d7a4f' : '#a86d1a'
                            const payBg    = isPaid ? '#E1F5EE' : '#FEF3DC'
                            return (
                              <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                                <div style={{ background:'#E1F5EE', borderRadius:10, padding:'10px 16px', fontSize:13 }}>
                                  <span style={{ color:'#6b6b67' }}>Commission (Final): </span>
                                  <span style={{ fontWeight:700, color:'#2d7a4f' }}>{fmtMoney(commAmt)}</span>
                                  {cr && cr.commission_rate > 0 && (
                                    <span style={{ marginLeft:6, fontSize:11, color:'#6b6b67' }}>({cr.commission_rate}%)</span>
                                  )}
                                </div>
                                <div style={{ background: payBg, borderRadius:10, padding:'10px 16px', fontSize:13 }}>
                                  <span style={{ color:'#6b6b67' }}>Payout: </span>
                                  <span style={{ fontWeight:700, color: payColor }}>
                                    {isPaid ? '✓ ' : '⏳ '}{payLabel}
                                  </span>
                                </div>
                              </div>
                            )
                          })()}

                          <div style={{ background:'#f7f4ef', borderRadius:12, padding:'16px 18px' }}>
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── COMMISSION TAB ── */}
        {tab === 'commission' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total Gross Commission', value:fmtMoney(totalGross),   icon:'💰', bg:'#f7f4ef', color:'#1b2a4a' },
                { label:'Total Final Payable',    value:fmtMoney(totalFinal),   icon:'📄', bg:'#E8F4FD', color:'#1a5ea8' },
                { label:'Total Paid',             value:fmtMoney(totalPaid),    icon:'✅', bg:'#E1F5EE', color:'#2d7a4f' },
                { label:'Total Pending',          value:fmtMoney(totalPending), icon:'⏳', bg:'#FEF3DC', color:'#a86d1a' },
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
                      <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px', cursor:'pointer', flexWrap:'wrap' }}>
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
                            <div style={{ fontFamily:'Georgia,serif', fontSize:16, fontWeight:700, color:'#1b2a4a' }}>{fmtMoney(r.total_commission)}</div>
                            <div style={{ fontSize:10, color:'#a8a8a4' }}>gross commission</div>
                          </div>
                          {ds && <span style={{ background:ds.bg, color:ds.color, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{ds.label}</span>}
                          {ps && <span style={{ background:ps.bg, color:ps.color, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{ps.label}</span>}
                          <span style={{ fontSize:10, color:'#a8a8a4' }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ borderTop:'1px solid #f0ede6', padding:'18px 20px 22px' }}>
                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Deal Information</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px 24px', marginBottom:18, fontSize:13 }}>
                            {[
                              ['Deal / Order Number', r.deal_order_number || '--'],
                              ['Client Name', r.client_name],
                              ['Client Type', r.client_type ? r.client_type.charAt(0).toUpperCase()+r.client_type.slice(1) : '--'],
                              ['Service Type', r.service_type || '--'],
                              ['Property Address', r.property_address || '--'],
                              ['Transaction Type', TRANSACTION_LABELS[r.transaction_type] || '--'],
                              ['Deal Status', ds?.label || '--'],
                              ['Closing Date', r.closing_date || '--'],
                            ].map(([lbl, val]) => (
                              <div key={lbl}>
                                <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                <div style={{ color:'#1b2a4a', fontWeight:500 }}>{val}</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Commission Information</div>
                          <div style={{ background:'#f7f4ef', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                              {[
                                ['Gross Commission', fmtMoney(r.total_commission)],
                                ['Commission Type', r.commission_type === 'flat' ? 'Flat' : `${r.commission_rate}% of fee`],
                                ['Commission Rate', r.commission_type === 'percentage' ? `${r.commission_rate}%` : '—'],
                                ['Flat Commission Amount', r.commission_type === 'flat' ? fmtMoney(r.flat_commission) : '—'],
                                ['Adjustment Amount', fmtMoney(r.adjustment_amount)],
                                ['Final Payable Amount', fmtMoney(r.final_amount)],
                              ].map(([lbl, val]) => (
                                <div key={lbl}>
                                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                  <div style={{ fontWeight: lbl === 'Final Payable Amount' ? 800 : 600, color: lbl === 'Final Payable Amount' ? '#2d7a4f' : '#1b2a4a', fontSize: lbl === 'Final Payable Amount' ? 16 : 13 }}>{val}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0ede6' }}>Payment Information</div>
                          <div style={{ background:'#e8f4fd', borderRadius:12, padding:'14px 18px' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                              {[
                                ['Payment Status', ps?.label || '--'],
                                ['Expected Payment Date', r.expected_payment_date || '--'],
                                ['Paid Date', r.paid_date || '--'],
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

        {/* ── MY CLIENTS TAB ── */}
        {tab === 'clients' && (() => {
          const CASE_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
            'New':         { color: '#a86d1a', bg: '#FEF3DC' },
            'Contacted':   { color: '#1a5ea8', bg: '#E3F2FD' },
            'In Progress': { color: '#6930c3', bg: '#F0E8FD' },
            'Completed':   { color: '#2d7a4f', bg: '#E1F5EE' },
            'Cancelled':   { color: '#a32d2d', bg: '#FCEBEB' },
          }
          const CASE_PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
            'Low':    { color: '#6b6b67', bg: '#f0ede6' },
            'Normal': { color: '#1a5ea8', bg: '#E3F2FD' },
            'High':   { color: '#a86d1a', bg: '#FEF3DC' },
            'Urgent': { color: '#a32d2d', bg: '#FCEBEB' },
          }
          const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-CA', { year:'numeric', month:'short', day:'numeric' }) : '—'

          const filteredCases = clientCases.filter(c => {
            if (caseStatusFilter && c.status !== caseStatusFilter) return false
            if (caseSearch) {
              const q = caseSearch.toLowerCase()
              if (![c.full_name, c.phone, c.email, c.case_number, c.property_address].some(v => v && v.toLowerCase().includes(q))) return false
            }
            return true
          })

          const openCase = (c: ClientCase) => {
            setSelectedCase(c); setCaseModalTab('details'); setCaseNotes([]); setNoteContent('')
          }

          const loadNotes = async (caseId: string) => {
            const r = await fetch(`/api/admin/client-cases/${caseId}/notes?caller_role=agent&caller_id=${agent.id}`)
            if (r.ok) { const d = await r.json(); setCaseNotes(d.notes || []) }
          }

          const addNote = async () => {
            if (!selectedCase || !noteContent.trim()) return
            setSavingNote(true)
            const r = await fetch(`/api/admin/client-cases/${selectedCase.id}/notes`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: noteContent, created_by: `${agent.fname} ${agent.lname} (Agent)`, caller_role: 'agent', caller_id: agent.id }),
            })
            if (r.ok) { const d = await r.json(); setCaseNotes(prev => [d.note, ...prev]); setNoteContent(''); showToast('Note added ✓') }
            else { showToast('Failed to save note.') }
            setSavingNote(false)
          }

          const updateCaseField = async (field: string, value: string) => {
            if (!selectedCase) return
            const r = await fetch(`/api/admin/client-cases/${selectedCase.id}`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [field]: value, caller_role: 'agent', caller_id: agent.id }),
            })
            if (r.ok) { const d = await r.json(); setClientCases(prev => prev.map(c => c.id === d.case.id ? d.case : c)); setSelectedCase(d.case); showToast('Updated ✓') }
            else { showToast('Failed to update.') }
          }

          const fcStyle = { border:'1px solid #e4e1d8', borderRadius:8, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', background:'#fff', color:'#1b2a4a' } as React.CSSProperties
          const lblStyle = { fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase' as const, color:'#a8a8a4', marginBottom:3, display:'block' }

          return (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
                {[
                  { label:'My Cases',    value: clientCases.length,                                         icon:'📁', bg:'#f0ede6', color:'#1b2a4a' },
                  { label:'New',         value: clientCases.filter(c => c.status === 'New').length,         icon:'🆕', bg:'#FEF3DC', color:'#a86d1a' },
                  { label:'In Progress', value: clientCases.filter(c => c.status === 'In Progress').length, icon:'⚡', bg:'#F0E8FD', color:'#6930c3' },
                  { label:'Urgent',      value: clientCases.filter(c => c.priority === 'Urgent').length,    icon:'🚨', bg:'#FCEBEB', color:'#a32d2d' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'14px 16px', border:'1px solid rgba(12,21,37,0.07)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize:20 }}>{s.icon}</div>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:700, color:s.color, margin:'4px 0 2px' }}>{s.value}</div>
                    <div style={{ fontSize:11, color:'#6b6b67', fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:18 }}>
                <input style={{ ...fcStyle, maxWidth:280, flex:'1 1 180px' }} placeholder="Search name, phone, email, case #…" value={caseSearch} onChange={e => setCaseSearch(e.target.value)} />
                <select style={{ ...fcStyle, maxWidth:160, flex:'1 1 120px' }} value={caseStatusFilter} onChange={e => setCaseStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  {['New','Contacted','In Progress','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={loadClients} style={{ background:'#fff', border:'1px solid #e4e1d8', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer', color:'#6b6b67', fontFamily:'inherit' }}>↻ Refresh</button>
                <button onClick={() => setShowCreateCase(true)} style={{ background:'#f5a623', border:'none', borderRadius:8, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', color:'#fff', fontFamily:'inherit', marginLeft:'auto' }}>+ New Case</button>
              </div>

              {casesLoading
                ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>Loading cases…</div>
                : filteredCases.length === 0
                  ? <div style={{ padding:48, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:14 }}>{clientCases.length === 0 ? 'No client cases assigned to you yet.' : 'No cases match your search.'}</div>
                  : (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {filteredCases.map(c => {
                        const ss = CASE_STATUS_STYLE[c.status] || CASE_STATUS_STYLE['New']
                        const ps = CASE_PRIORITY_STYLE[c.priority] || CASE_PRIORITY_STYLE['Normal']
                        return (
                          <div key={c.id} onClick={() => openCase(c)}
                            style={{ background:'#fff', border:'1px solid rgba(12,21,37,0.08)', borderRadius:14, padding:'15px 18px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap', transition:'box-shadow 0.15s, border-color 0.15s' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'; el.style.borderColor='rgba(245,166,35,0.4)' }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'; el.style.borderColor='rgba(12,21,37,0.08)' }}
                          >
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:5 }}>
                                <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#f5a623', background:'rgba(245,166,35,0.1)', padding:'1px 7px', borderRadius:4 }}>{c.case_number}</span>
                                <span style={{ fontWeight:700, fontSize:14, color:'#1b2a4a' }}>{c.full_name}</span>
                              </div>
                              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:5 }}>
                                <span style={{ fontSize:10, fontWeight:700, background:'#E3F2FD', color:'#1a5ea8', padding:'2px 8px', borderRadius:999 }}>{c.client_type}</span>
                                {c.service_type && <span style={{ fontSize:10, fontWeight:700, background:'#E1F5EE', color:'#2d7a4f', padding:'2px 8px', borderRadius:999 }}>{c.service_type}</span>}
                                <span style={{ fontSize:10, fontWeight:700, background:ss.bg, color:ss.color, padding:'2px 8px', borderRadius:999 }}>{c.status}</span>
                                <span style={{ fontSize:10, fontWeight:700, background:ps.bg, color:ps.color, padding:'2px 8px', borderRadius:999 }}>{c.priority}</span>
                              </div>
                              <div style={{ fontSize:12, color:'#6b6b67', display:'flex', gap:10, flexWrap:'wrap' }}>
                                {c.phone && <span>📞 {c.phone}</span>}
                                {c.email && <span>✉️ {c.email}</span>}
                                {c.property_address && <span>🏠 {c.property_address}{c.city ? `, ${c.city}` : ''}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              {c.next_followup_date && <div style={{ fontSize:11, color:'#a86d1a', fontWeight:600 }}>Follow-up: {fmtDate(c.next_followup_date)}</div>}
                              {c.deadline && <div style={{ fontSize:11, color:'#a32d2d', fontWeight:600 }}>Deadline: {fmtDate(c.deadline)}</div>}
                              <div style={{ fontSize:11, color:'#a8a8a4', marginTop:2 }}>{fmtDate(c.created_at)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
              }

              {selectedCase && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:20, overflowY:'auto' }}
                  onClick={() => setSelectedCase(null)}>
                  <div onClick={e => e.stopPropagation()} style={{ background:'#f7f4ef', borderRadius:20, width:'100%', maxWidth:740, boxShadow:'0 24px 80px rgba(0,0,0,0.28)', marginTop:20, marginBottom:20 }}>
                    <div style={{ background:'linear-gradient(135deg,#0c1525,#1a2a4a)', padding:'20px 24px', color:'#fff', position:'sticky', top:0, zIndex:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                        <div style={{ minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                            <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#f5a623', background:'rgba(245,166,35,0.15)', padding:'2px 8px', borderRadius:4 }}>{selectedCase.case_number}</span>
                            <span style={{ fontSize:11, fontWeight:700, background:(CASE_STATUS_STYLE[selectedCase.status]||CASE_STATUS_STYLE['New']).bg, color:(CASE_STATUS_STYLE[selectedCase.status]||CASE_STATUS_STYLE['New']).color, padding:'2px 8px', borderRadius:999 }}>{selectedCase.status}</span>
                            <span style={{ fontSize:11, fontWeight:700, background:(CASE_PRIORITY_STYLE[selectedCase.priority]||CASE_PRIORITY_STYLE['Normal']).bg, color:(CASE_PRIORITY_STYLE[selectedCase.priority]||CASE_PRIORITY_STYLE['Normal']).color, padding:'2px 8px', borderRadius:999 }}>{selectedCase.priority}</span>
                          </div>
                          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1rem,2.5vw,1.4rem)', margin:'0 0 4px' }}>{selectedCase.full_name}</h2>
                          <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', display:'flex', gap:10, flexWrap:'wrap' }}>
                            <span>{selectedCase.client_type}</span>
                            {selectedCase.service_type && <><span>·</span><span>{selectedCase.service_type}</span></>}
                            {selectedCase.city && <><span>·</span><span>{selectedCase.city}</span></>}
                          </div>
                        </div>
                        <button onClick={() => setSelectedCase(null)} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, fontSize:17, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                      </div>
                      <div style={{ display:'flex', marginTop:14, borderBottom:'1px solid rgba(255,255,255,0.12)' }}>
                        {(['details','notes'] as const).map(t => (
                          <button key={t} onClick={() => { setCaseModalTab(t); if (t === 'notes' && caseNotes.length === 0) loadNotes(selectedCase.id) }}
                            style={{ background:'none', border:'none', padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', color: caseModalTab===t ? '#f5a623':'rgba(255,255,255,0.45)', borderBottom: caseModalTab===t ? '2px solid #f5a623':'2px solid transparent', marginBottom:-1, textTransform:'capitalize' }}>
                            {t === 'details' ? '📋 Details' : '📝 Notes'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding:'22px 24px 28px' }}>
                      {caseModalTab === 'details' && (
                        <div>
                          <div style={{ background:'#fff', borderRadius:14, padding:'16px 18px', marginBottom:20, border:'1px solid rgba(12,21,37,0.08)' }}>
                            <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', marginBottom:12 }}>Quick Update</div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
                              <div><label style={lblStyle}>Status</label>
                                <select style={fcStyle} value={selectedCase.status} onChange={e => updateCaseField('status', e.target.value)}>
                                  {['New','Contacted','In Progress','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div><label style={lblStyle}>Priority</label>
                                <select style={fcStyle} value={selectedCase.priority} onChange={e => updateCaseField('priority', e.target.value)}>
                                  {['Low','Normal','High','Urgent'].map(p => <option key={p}>{p}</option>)}
                                </select>
                              </div>
                              <div><label style={lblStyle}>Next Follow-up</label>
                                <input type="date" style={fcStyle} value={selectedCase.next_followup_date || ''} onChange={e => updateCaseField('next_followup_date', e.target.value)} />
                              </div>
                              <div><label style={lblStyle}>Last Contacted</label>
                                <input type="date" style={fcStyle} value={selectedCase.last_contacted_date || ''} onChange={e => updateCaseField('last_contacted_date', e.target.value)} />
                              </div>
                            </div>
                            <div style={{ marginTop:12 }}>
                              <label style={lblStyle}>Next Action</label>
                              <input style={fcStyle} value={selectedCase.next_action || ''} placeholder="e.g. Send lease, Follow-up call…" onChange={e => updateCaseField('next_action', e.target.value)} />
                            </div>
                          </div>

                          {[
                            { heading:'Contact Information', rows:[['Phone',selectedCase.phone||'—'],['Email',selectedCase.email||'—'],['Preferred Contact',selectedCase.preferred_contact||'—'],['Language',selectedCase.language||'—']] },
                            { heading:'Property & Service', rows:[['Service Type',selectedCase.service_type||'—'],['Property Address',selectedCase.property_address?`${selectedCase.property_address}${selectedCase.city?', '+selectedCase.city:''}`:'—'],['Rent Amount',selectedCase.rent_amount?'$'+Number(selectedCase.rent_amount).toLocaleString('en-CA'):'—'],['Start Date',fmtDate(selectedCase.start_date)],['Deadline',fmtDate(selectedCase.deadline)]] },
                          ].map(sec => (
                            <div key={sec.heading} style={{ marginBottom:18 }}>
                              <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#6b6b67', paddingBottom:7, borderBottom:'1px solid #e4e1d8', marginBottom:12 }}>{sec.heading}</div>
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'8px 20px' }}>
                                {sec.rows.map(([lbl,val]) => (
                                  <div key={lbl}>
                                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                    <div style={{ fontSize:13, color:'#1b2a4a', fontWeight:500 }}>{val}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {selectedCase.client_needs && <div style={{ marginBottom:14 }}><div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:4 }}>Client Needs</div><p style={{ margin:0, fontSize:13, color:'#1b2a4a', lineHeight:1.65 }}>{selectedCase.client_needs}</p></div>}
                          {selectedCase.current_situation && <div style={{ marginBottom:14 }}><div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:4 }}>Current Situation</div><p style={{ margin:0, fontSize:13, color:'#1b2a4a', lineHeight:1.65 }}>{selectedCase.current_situation}</p></div>}

                          {[selectedCase.related_landlord, selectedCase.related_tenant, selectedCase.related_buyer, selectedCase.related_seller, selectedCase.related_realtor, selectedCase.related_mortgage_agent, selectedCase.related_paralegal].some(Boolean) && (
                            <div>
                              <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#6b6b67', paddingBottom:7, borderBottom:'1px solid #e4e1d8', marginBottom:12 }}>Related Parties</div>
                              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'8px 20px' }}>
                                {([
                                  ['Landlord', selectedCase.related_landlord],
                                  ['Tenant', selectedCase.related_tenant],
                                  ['Buyer', selectedCase.related_buyer],
                                  ['Seller', selectedCase.related_seller],
                                  ['Realtor', selectedCase.related_realtor],
                                  ['Mortgage Agent', selectedCase.related_mortgage_agent],
                                  ['Paralegal', selectedCase.related_paralegal],
                                ] as [string, string | null][]).filter(([, v]) => v).map(([lbl, val]) => (
                                  <div key={lbl}>
                                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                                    <div style={{ fontSize:13, color:'#1b2a4a', fontWeight:500 }}>{val}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {caseModalTab === 'notes' && (
                        <div>
                          <div style={{ marginBottom:20 }}>
                            <label style={lblStyle}>Add a Note</label>
                            <textarea style={{ ...fcStyle, minHeight:88, resize:'vertical' } as React.CSSProperties} value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write a note about this case…" />
                            <div style={{ marginTop:8, display:'flex', justifyContent:'flex-end' }}>
                              <button onClick={addNote} disabled={!noteContent.trim() || savingNote}
                                style={{ background:'#1b2a4a', color:'#fff', border:'none', borderRadius:8, padding:'9px 22px', fontSize:13, fontWeight:700, cursor:!noteContent.trim()||savingNote?'not-allowed':'pointer', fontFamily:'inherit', opacity:!noteContent.trim()||savingNote?0.6:1 }}>
                                {savingNote ? 'Saving…' : 'Add Note'}
                              </button>
                            </div>
                          </div>
                          {caseNotes.length === 0
                            ? <div style={{ padding:32, textAlign:'center', color:'#a8a8a4', background:'#fff', borderRadius:12 }}>No notes yet.</div>
                            : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                {caseNotes.map(note => (
                                  <div key={note.id} style={{ background:'#fff', border:'1px solid #e4e1d8', borderRadius:12, padding:'13px 15px' }}>
                                    <p style={{ margin:'0 0 8px', fontSize:13, color:'#1b2a4a', lineHeight:1.65 }}>{note.content}</p>
                                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                      <span style={{ fontSize:11, fontWeight:700, color:'#6b6b67' }}>{note.created_by}</span>
                                      <span style={{ width:3, height:3, borderRadius:'50%', background:'#d0cdc5', flexShrink:0 }} />
                                      <span style={{ fontSize:11, color:'#a8a8a4' }}>{new Date(note.created_at).toLocaleString('en-CA', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        })()}

        {showCreateCase && (
          <NewCaseModal
            agent={agent}
            onClose={() => setShowCreateCase(false)}
            onCreated={(c) => { setClientCases(prev => [c, ...prev]); setShowCreateCase(false); showToast('Case created ✓') }}
          />
        )}

      </div>
    </div>
  )
}

// ─── NewCaseModal (agent-side create; Related Parties intentionally omitted) ───
function NewCaseModal({ agent, onClose, onCreated }: {
  agent: AgentUser
  onClose: () => void
  onCreated: (c: any) => void
}) {
  const CLIENT_TYPES   = ['Landlord', 'Tenant', 'Mortgage Client', 'Realtor Client']
  const SERVICE_TYPES  = ['Tenant Placement', 'Property Management', 'Mortgage Referral', 'Real Estate Referral']
  const STATUSES       = ['New', 'Contacted', 'In Progress', 'Completed', 'Cancelled']
  const PRIORITIES     = ['Low', 'Normal', 'High', 'Urgent']
  const PROVINCES      = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']
  const PROPERTY_TYPES = ['Detached House','Semi-Detached House','Townhouse','Condo Apartment','Basement Apartment','Room Rental','Commercial','Other']
  const LEAD_SOURCES   = ['Website','Referral','Social Media','Kijiji','Walk-in','Phone Inquiry','Email Inquiry','Other']
  const CONTACT_PREFS  = ['Phone','Email','Text','WhatsApp']
  const LANGUAGES      = ['English','French','Mandarin','Cantonese','Hindi','Punjabi','Tagalog','Tamil','Spanish','Arabic','Other']

  const FC: React.CSSProperties = { border:'1px solid #e4e1d8', borderRadius:8, padding:'9px 12px', fontSize:14, fontFamily:'inherit', outline:'none', width:'100%', background:'#fff', color:'#1b2a4a' }
  const LBL: React.CSSProperties = { fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#6b6b67', display:'block', marginBottom:4 }
  const SEC: React.CSSProperties = { fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:'uppercase', color:'#f5a623', paddingBottom:8, borderBottom:'1px solid #f0ede6', marginBottom:16, marginTop:24 }

  const [form, setForm] = useState<Record<string, any>>({
    full_name:'', client_type:'', phone:'', email:'', preferred_contact:'', language:'', lead_source:'',
    status:'New', priority:'Normal', service_type:'', start_date:'', end_date:'', deadline:'',
    next_followup_date:'', last_contacted_date:'', property_address:'', unit:'', city:'', province:'',
    postal_code:'', property_type:'', rent_amount:'', purchase_price:'', sale_price:'',
    client_needs:'', current_situation:'', next_action:'',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!form.full_name?.trim()) { setError('Full Name is required.'); return }
    if (!form.client_type)       { setError('Client Type is required.'); return }
    setSaving(true); setError('')
    const r = await fetch('/api/admin/client-cases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, caller_role: 'agent', caller_id: agent.id }),
    })
    if (r.ok) { const d = await r.json(); onCreated(d.case) }
    else { const d = await r.json().catch(() => ({})); setError(d.error || 'Failed to create case.'); setSaving(false) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:20, overflowY:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#f7f4ef', borderRadius:20, width:'100%', maxWidth:820, boxShadow:'0 24px 80px rgba(0,0,0,0.28)', marginTop:20, marginBottom:20 }}>
        <div style={{ background:'linear-gradient(135deg, #0c1525, #1a2a4a)', padding:'22px 28px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10, borderRadius:'20px 20px 0 0' }}>
          <div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.35rem', margin:'0 0 4px' }}>Create New Case</h2>
            <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.5)' }}>A unique case number will be auto-generated. This case will be assigned to you.</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:'50%', width:34, height:34, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>&times;</button>
        </div>
        <div style={{ padding:'24px 28px 28px' }}>
          <div style={SEC}>Client Information</div>
          <Row2A>
            <FieldA label="Full Name *"  L={LBL}><input style={FC} value={form.full_name} onChange={set('full_name')} placeholder="Full legal name" /></FieldA>
            <FieldA label="Client Type *" L={LBL}>
              <select style={FC} value={form.client_type} onChange={set('client_type')}>
                <option value="">Select…</option>
                {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FieldA>
            <FieldA label="Phone" L={LBL}><input style={FC} value={form.phone} onChange={set('phone')} placeholder="+1 (416) 000-0000" /></FieldA>
            <FieldA label="Email" L={LBL}><input style={FC} type="email" value={form.email} onChange={set('email')} placeholder="client@email.com" /></FieldA>
            <FieldA label="Preferred Contact" L={LBL}>
              <select style={FC} value={form.preferred_contact} onChange={set('preferred_contact')}>
                <option value="">Select…</option>
                {CONTACT_PREFS.map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldA>
            <FieldA label="Language" L={LBL}>
              <select style={FC} value={form.language} onChange={set('language')}>
                <option value="">Select…</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </FieldA>
            <FieldA label="Lead Source" L={LBL}>
              <select style={FC} value={form.lead_source} onChange={set('lead_source')}>
                <option value="">Select…</option>
                {LEAD_SOURCES.map(x => <option key={x}>{x}</option>)}
              </select>
            </FieldA>
          </Row2A>

          <div style={SEC}>Status &amp; Service</div>
          <Row2A>
            <FieldA label="Status" L={LBL}><select style={FC} value={form.status} onChange={set('status')}>{STATUSES.map(x => <option key={x}>{x}</option>)}</select></FieldA>
            <FieldA label="Priority" L={LBL}><select style={FC} value={form.priority} onChange={set('priority')}>{PRIORITIES.map(x => <option key={x}>{x}</option>)}</select></FieldA>
            <FieldA label="Service Type" L={LBL}>
              <select style={FC} value={form.service_type} onChange={set('service_type')}>
                <option value="">Select…</option>
                {SERVICE_TYPES.map(x => <option key={x}>{x}</option>)}
              </select>
            </FieldA>
            <FieldA label="Start Date" L={LBL}><input style={FC} type="date" value={form.start_date} onChange={set('start_date')} /></FieldA>
            <FieldA label="End Date" L={LBL}><input style={FC} type="date" value={form.end_date} onChange={set('end_date')} /></FieldA>
            <FieldA label="Deadline" L={LBL}><input style={FC} type="date" value={form.deadline} onChange={set('deadline')} /></FieldA>
            <FieldA label="Next Follow-up Date" L={LBL}><input style={FC} type="date" value={form.next_followup_date} onChange={set('next_followup_date')} /></FieldA>
            <FieldA label="Last Contacted Date" L={LBL}><input style={FC} type="date" value={form.last_contacted_date} onChange={set('last_contacted_date')} /></FieldA>
          </Row2A>

          <div style={SEC}>Property Details</div>
          <Row2A>
            <FieldA label="Property Address" L={LBL}><input style={FC} value={form.property_address} onChange={set('property_address')} placeholder="Street address" /></FieldA>
            <FieldA label="Unit" L={LBL}><input style={FC} value={form.unit} onChange={set('unit')} placeholder="Unit / Suite #" /></FieldA>
            <FieldA label="City" L={LBL}><input style={FC} value={form.city} onChange={set('city')} placeholder="City" /></FieldA>
            <FieldA label="Province" L={LBL}>
              <select style={FC} value={form.province} onChange={set('province')}>
                <option value="">Select…</option>
                {PROVINCES.map(x => <option key={x}>{x}</option>)}
              </select>
            </FieldA>
            <FieldA label="Postal Code" L={LBL}><input style={FC} value={form.postal_code} onChange={set('postal_code')} placeholder="A1A 1A1" /></FieldA>
            <FieldA label="Property Type" L={LBL}>
              <select style={FC} value={form.property_type} onChange={set('property_type')}>
                <option value="">Select…</option>
                {PROPERTY_TYPES.map(x => <option key={x}>{x}</option>)}
              </select>
            </FieldA>
            <FieldA label="Rent Amount" L={LBL}><input style={FC} type="number" value={form.rent_amount} onChange={set('rent_amount')} placeholder="0.00" /></FieldA>
            <FieldA label="Purchase Price" L={LBL}><input style={FC} type="number" value={form.purchase_price} onChange={set('purchase_price')} placeholder="0.00" /></FieldA>
            <FieldA label="Sale Price" L={LBL}><input style={FC} type="number" value={form.sale_price} onChange={set('sale_price')} placeholder="0.00" /></FieldA>
          </Row2A>

          <div style={SEC}>Case Background</div>
          <div style={{ display:'grid', gap:12 }}>
            <FieldA label="Client Needs" L={LBL}><textarea style={{ ...FC, minHeight:80, resize:'vertical' } as React.CSSProperties} value={form.client_needs} onChange={set('client_needs')} placeholder="What does the client need?" /></FieldA>
            <FieldA label="Current Situation" L={LBL}><textarea style={{ ...FC, minHeight:80, resize:'vertical' } as React.CSSProperties} value={form.current_situation} onChange={set('current_situation')} placeholder="Describe the current situation…" /></FieldA>
            <FieldA label="Next Action" L={LBL}><input style={FC} value={form.next_action} onChange={set('next_action')} placeholder="e.g. Send lease, Follow up call…" /></FieldA>
          </div>

          {error && <p style={{ color:'#a32d2d', fontSize:13, marginTop:12 }}>{error}</p>}
          <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ background:'#f7f4ef', border:'1px solid #e4e1d8', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#1b2a4a' }}>Cancel</button>
            <button onClick={submit} disabled={saving} style={{ background:'#f5a623', color:'#fff', border:'none', borderRadius:8, padding:'10px 26px', fontSize:13, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>{saving ? 'Creating…' : '+ Create Case'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Module-scope layout helpers (kept out of the component so inputs keep focus while typing)
function Row2A({ children }: { children: React.ReactNode }) {
  return <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>{children}</div>
}
function FieldA({ label, L, children }: { label: string; L: React.CSSProperties; children: React.ReactNode }) {
  return <div><label style={L}>{label}</label>{children}</div>
}

export default function AgentDashboardPage() {
  return <AgentGuard>{(agent) => <Dashboard agent={agent} />}</AgentGuard>
}
