'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type Order = {
  id: string; created_at: string; landlord_name: string; company_name: string | null
  phone: string; email: string; mailing_address: string; property_address: string
  city: string; postal_code: string; property_type: string; expected_rent: string | null
  bedrooms: string | null; bathrooms: string | null; move_in_date: string | null
  showing_ready: string; selected_services: string[]; estimated_total: number
  additional_notes: string | null; authorization_confirmed: boolean; status: string
  assigned_agent_id: string | null; commission: number; commission_paid: boolean
  linked_case_number: string | null; linked_case_id: string | null
}
type Agent = { id: string; fname: string; lname: string; email: string }

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new:       { label: 'New',       bg: '#fef3dc', color: '#a86d1a', border: '#f5d38a' },
  contacted: { label: 'Contacted', bg: '#e3f2fd', color: '#1a5ea8', border: '#90caf9' },
  completed: { label: 'Completed', bg: '#e1f5ee', color: '#2d7a4f', border: '#9fe1cb' },
  cancelled: { label: 'Cancelled', bg: '#fcebeb', color: '#a32d2d', border: '#e8a5a5' },
}

export default function AdminOrdersPage() {
  const { message, visible, showToast } = useToast()
  const [orders, setOrders]   = useState<Order[]>([])
  const [agents, setAgents]   = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving]   = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [ordersRes, agentsRes] = await Promise.all([
      fetch('/api/admin/tenant-placement-orders', { cache: 'no-store' }),
      createClient().from('users').select('id,fname,lname,email').eq('role', 'agent').order('fname'),
    ])
    if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.orders || []) }
    setAgents(agentsRes.data || [])
    setLoading(false)
  }

  const patch = async (orderId: string, fields: Record<string, any>) => {
    setSaving(orderId)
    const r = await fetch('/api/admin/tenant-placement-orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, ...fields }),
    })
    if (!r.ok) { showToast('Failed to save.'); setSaving(null); return }
    const json = await r.json()
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...json.order } : o))
    showToast('Saved ✓')
    setSaving(null)
  }

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (![o.landlord_name, o.company_name||'', o.phone, o.email, o.property_address, o.city].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  })

  const agentName = (id: string | null) => {
    if (!id) return null
    const a = agents.find(a => a.id === id)
    return a ? `${a.fname} ${a.lname}` : null
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-sub">{orders.length} total · {orders.filter(o => o.status === 'new').length} new</p>
          </div>
          <button className="btn-refresh" onClick={load}>↻ Refresh</button>
        </div>

        <div className="filter-bar">
          <input className="fc" style={{ maxWidth: 280, marginBottom: 0 }} placeholder="Search landlord, email, address…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fc" style={{ maxWidth: 160, marginBottom: 0 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {loading ? <div className="empty-msg">Loading orders…</div>
          : filtered.length === 0 ? <div className="empty-msg">No orders found.</div>
          : (
          <div className="orders-list">
            {filtered.map(o => {
              const sc     = STATUS_CONFIG[o.status] || STATUS_CONFIG.new
              const isOpen = expanded === o.id
              const name   = agentName(o.assigned_agent_id)

              return (
                <div key={o.id} className="order-card">
                  <div className="order-card-top" onClick={() => setExpanded(isOpen ? null : o.id)}>
                    <div className="order-meta">
                      <div className="order-name">{o.landlord_name}{o.company_name && <span className="order-company"> · {o.company_name}</span>}</div>
                      <div className="order-addr">{o.property_address}, {o.city} {o.postal_code}</div>
                      <div className="order-date">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : '--'}
                        {name && <span style={{ marginLeft: 10, color: '#f5a623', fontWeight: 600 }}>· 👤 {name}</span>}
                        {o.linked_case_number && <span style={{ marginLeft: 10, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#2d7a4f', background: '#E1F5EE', padding: '1px 7px', borderRadius: 4 }}>🗂️ {o.linked_case_number}</span>}
                      </div>
                    </div>
                    <div className="order-right">
                      <div className="order-total">${Number(o.estimated_total || 0).toLocaleString('en-CA')}</div>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{sc.label}</span>
                      <span className="expand-toggle">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="order-detail">
                      <div className="detail-grid">
                        <div><strong>Phone</strong><span>{o.phone}</span></div>
                        <div><strong>Email</strong><a href={`mailto:${o.email}`}>{o.email}</a></div>
                        <div><strong>Property Type</strong><span>{o.property_type}</span></div>
                        <div><strong>Expected Rent</strong><span>{o.expected_rent || '--'}</span></div>
                        <div><strong>Beds / Baths</strong><span>{o.bedrooms || '--'} / {o.bathrooms || '--'}</span></div>
                        <div><strong>Move-in Date</strong><span>{o.move_in_date || '--'}</span></div>
                        <div><strong>Showing Ready</strong><span>{o.showing_ready || '--'}</span></div>
                        <div><strong>Mailing Address</strong><span>{o.mailing_address}</span></div>
                      </div>

                      {Array.isArray(o.selected_services) && o.selected_services.length > 0 && (
                        <div className="services-block">
                          <strong>Selected Services</strong>
                          <ul>{o.selected_services.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                      )}

                      {o.additional_notes && (
                        <div className="notes-block"><strong>Notes</strong><p>{o.additional_notes}</p></div>
                      )}

                      {/* Linked Client Case */}
                      <div style={{ margin: '16px 0 0', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: o.linked_case_number ? '#E1F5EE' : '#f7f4ef', borderRadius: 10, border: `1px solid ${o.linked_case_number ? '#9fe1cb' : '#e4e1d8'}` }}>
                        <span style={{ fontSize: 16 }}>{o.linked_case_number ? '🗂️' : '📋'}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: o.linked_case_number ? '#2d7a4f' : '#a8a8a4', marginBottom: 2 }}>Linked Case</div>
                          {o.linked_case_number
                            ? <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#1b2a4a' }}>{o.linked_case_number}</span>
                            : <span style={{ fontSize: 13, color: '#a8a8a4', fontStyle: 'italic' }}>No case yet — assign an agent to auto-create one</span>
                          }
                        </div>
                      </div>

                      {/* Manager controls */}
                      <div className="manager-section">
                        <h4 className="manager-title">Manager Controls</h4>
                        <div className="manager-grid">
                          <div className="ctrl-group">
                            <label>Order Status</label>
                            <select className="fc" style={{ marginBottom: 0 }} value={o.status} onChange={e => patch(o.id, { status: e.target.value })}>
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </div>
                          <div className="ctrl-group">
                            <label>Assign Agent</label>
                            <select className="fc" style={{ marginBottom: 0 }} value={o.assigned_agent_id || ''} onChange={e => patch(o.id, { assigned_agent_id: e.target.value || null })} disabled={saving === o.id}>
                              <option value="">— Unassigned —</option>
                              {agents.map(a => <option key={a.id} value={a.id}>{a.fname} {a.lname} ({a.email})</option>)}
                            </select>
                          </div>
                          <div className="ctrl-group">
                            <label>Commission ($)</label>
                            <input className="fc" style={{ marginBottom: 0 }} type="number" min="0" defaultValue={o.commission || 0} onBlur={e => patch(o.id, { commission: Number(e.target.value) })} disabled={saving === o.id} />
                          </div>
                          <div className="ctrl-group">
                            <label>Commission Paid</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                              <button onClick={() => patch(o.id, { commission_paid: !o.commission_paid })} disabled={saving === o.id}
                                style={{ background: o.commission_paid ? '#e1f5ee' : '#f7f4ef', color: o.commission_paid ? '#2d7a4f' : '#a8a8a4', border: `1px solid ${o.commission_paid ? '#9fe1cb' : '#e4e1d8'}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {o.commission_paid ? '✓ Paid' : 'Mark as Paid'}
                              </button>
                              {saving === o.id && <span style={{ fontSize: 12, color: '#a8a8a4' }}>Saving…</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-shell{padding:clamp(24px,3vw,40px) clamp(20px,3vw,40px);max-width:980px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:28px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .btn-refresh{background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;color:#1b2a4a;transition:background 0.15s}
        .btn-refresh:hover{background:#f7f4ef}
        .filter-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8}
        .orders-list{display:flex;flex-direction:column;gap:12px}
        .order-card{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.04)}
        .order-card-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;cursor:pointer;transition:background 0.15s;flex-wrap:wrap}
        .order-card-top:hover{background:#fafaf8}
        .order-meta{flex:1;min-width:0}
        .order-name{font-weight:700;font-size:15px;color:#1b2a4a}
        .order-company{color:#a8a8a4;font-weight:400}
        .order-addr{font-size:13px;color:#6b6b67;margin-top:3px}
        .order-date{font-size:11.5px;color:#a8a8a4;margin-top:2px}
        .order-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
        .order-total{font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1b2a4a}
        .status-pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid}
        .expand-toggle{font-size:10px;color:#a8a8a4}
        .order-detail{padding:0 20px 24px;border-top:1px solid #f0ede6}
        .detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px 24px;margin:16px 0;font-size:13px}
        .detail-grid>div{display:flex;flex-direction:column;gap:2px}
        .detail-grid strong{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#a8a8a4}
        .detail-grid span,.detail-grid a{color:#1b2a4a}
        .detail-grid a{color:#f5a623;text-decoration:none}
        .detail-grid a:hover{text-decoration:underline}
        .services-block{background:#f7f4ef;border-radius:10px;padding:14px 16px;margin-bottom:14px}
        .services-block strong{font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b6b67;display:block;margin-bottom:8px}
        .services-block ul{margin:0;padding-left:18px;color:#1b2a4a;font-size:13px;line-height:1.8}
        .notes-block{font-size:13px;color:#6b6b67;margin-bottom:14px}
        .notes-block strong{display:block;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#a8a8a4;margin-bottom:4px}
        .notes-block p{margin:0;line-height:1.6}
        .manager-section{background:#f7f4ef;border-radius:12px;padding:18px;margin-top:16px}
        .manager-title{font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1b2a4a;margin:0 0 14px}
        .manager-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
        .ctrl-group{display:flex;flex-direction:column;gap:5px}
        .ctrl-group label{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#6b6b67}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.18s;background:#fff}
        .fc:focus{border-color:#f5a623}
      `}</style>
    </>
  )
}
