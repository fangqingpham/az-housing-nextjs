'use client'

import { useEffect, useState } from 'react'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type Order = {
  id: string
  created_at: string
  landlord_name: string
  company_name: string | null
  phone: string
  email: string
  mailing_address: string
  property_address: string
  city: string
  postal_code: string
  property_type: string
  expected_rent: string | null
  bedrooms: string | null
  bathrooms: string | null
  move_in_date: string | null
  showing_ready: string
  selected_services: string[]
  estimated_total: number
  additional_notes: string | null
  authorization_confirmed: boolean
  status: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new:       { label: 'New',       bg: '#fef3dc', color: '#a86d1a', border: '#f5d38a' },
  contacted: { label: 'Contacted', bg: '#e3f2fd', color: '#1a5ea8', border: '#90caf9' },
  completed: { label: 'Completed', bg: '#e1f5ee', color: '#2d7a4f', border: '#9fe1cb' },
  cancelled: { label: 'Cancelled', bg: '#fcebeb', color: '#a32d2d', border: '#e8a5a5' },
}

export default function AdminOrdersPage() {
  const { message, visible, showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/tenant-placement-orders', { cache: 'no-store' })
    if (r.ok) { const d = await r.json(); setOrders(d.orders || []) }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const r = await fetch('/api/admin/tenant-placement-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!r.ok) { showToast('Failed to update status.'); return }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    showToast('Status updated ✓')
  }

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = [o.landlord_name, o.company_name || '', o.phone, o.email, o.property_address, o.city, o.postal_code].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const newCount = orders.filter(o => o.status === 'new').length

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Tenant Orders</h1>
            <p className="page-sub">{orders.length} total · {newCount} new</p>
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

        {loading ? (
          <div className="empty-msg">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No orders match your filters.</div>
        ) : (
          <div className="orders-list">
            {filtered.map(o => {
              const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.new
              const isOpen = expanded === o.id
              return (
                <div key={o.id} className="order-card">
                  {/* Card Header */}
                  <div className="order-card-top" onClick={() => setExpanded(isOpen ? null : o.id)}>
                    <div className="order-meta">
                      <div className="order-name">
                        {o.landlord_name}
                        {o.company_name && <span className="order-company"> · {o.company_name}</span>}
                      </div>
                      <div className="order-addr">{o.property_address}, {o.city} {o.postal_code}</div>
                      <div className="order-date">
                        Submitted {o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : '--'}
                      </div>
                    </div>

                    <div className="order-right">
                      <div className="order-total">${Number(o.estimated_total || 0).toLocaleString('en-CA')}</div>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {sc.label}
                      </span>
                      <span className="expand-toggle">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div className="order-detail">
                      <div className="detail-grid">
                        <div><strong>Phone</strong><span>{o.phone}</span></div>
                        <div><strong>Email</strong><a href={`mailto:${o.email}`}>{o.email}</a></div>
                        <div><strong>Property Type</strong><span>{o.property_type}</span></div>
                        <div><strong>Expected Rent</strong><span>{o.expected_rent || '--'}</span></div>
                        <div><strong>Beds / Baths</strong><span>{o.bedrooms || '--'} / {o.bathrooms || '--'}</span></div>
                        <div><strong>Move-in Date</strong><span>{o.move_in_date || '--'}</span></div>
                        <div><strong>Ready for Showing</strong><span>{o.showing_ready || '--'}</span></div>
                        <div><strong>Mailing Address</strong><span>{o.mailing_address}</span></div>
                      </div>

                      {Array.isArray(o.selected_services) && o.selected_services.length > 0 && (
                        <div className="services-block">
                          <strong>Selected Services</strong>
                          <ul>{o.selected_services.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                      )}

                      {o.additional_notes && (
                        <div className="notes-block">
                          <strong>Notes</strong>
                          <p>{o.additional_notes}</p>
                        </div>
                      )}

                      <div className="status-row">
                        <label>Update status:</label>
                        <select className="fc" style={{ maxWidth: 160, marginBottom: 0 }} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
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
        .page-shell { padding: clamp(24px,3vw,40px) clamp(20px,3vw,40px); max-width: 980px; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
        .page-title { font-family:Georgia,serif; font-size:26px; font-weight:600; color:#1b2a4a; margin:0 0 4px; }
        .page-sub { font-size:13px; color:#6b6b67; margin:0; }
        .btn-refresh { background:#fff; border:1px solid #e4e1d8; border-radius:8px; padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer; color:#1b2a4a; transition:background 0.15s; }
        .btn-refresh:hover { background:#f7f4ef; }
        .filter-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .empty-msg { text-align:center; color:#a8a8a4; padding:48px; background:#fff; border-radius:12px; border:1px solid #e4e1d8; }
        .orders-list { display:flex; flex-direction:column; gap:12px; }
        .order-card { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
        .order-card-top { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 20px; cursor:pointer; transition:background 0.15s; flex-wrap:wrap; }
        .order-card-top:hover { background:#fafaf8; }
        .order-meta { flex:1; min-width:0; }
        .order-name { font-weight:700; font-size:15px; color:#1b2a4a; }
        .order-company { color:#a8a8a4; font-weight:400; }
        .order-addr { font-size:13px; color:#6b6b67; margin-top:3px; }
        .order-date { font-size:11.5px; color:#a8a8a4; margin-top:2px; }
        .order-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
        .order-total { font-family:Georgia,serif; font-size:20px; font-weight:700; color:#1b2a4a; }
        .status-pill { display:inline-block; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid; }
        .expand-toggle { font-size:10px; color:#a8a8a4; }
        .order-detail { padding:0 20px 20px; border-top:1px solid #f0ede6; }
        .detail-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px 24px; margin:16px 0; font-size:13px; }
        .detail-grid > div { display:flex; flex-direction:column; gap:2px; }
        .detail-grid strong { font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:#a8a8a4; }
        .detail-grid span, .detail-grid a { color:#1b2a4a; }
        .detail-grid a { color:#f5a623; text-decoration:none; }
        .detail-grid a:hover { text-decoration:underline; }
        .services-block { background:#f7f4ef; border-radius:10px; padding:14px 16px; margin-bottom:14px; }
        .services-block strong { font-size:12px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:#6b6b67; display:block; margin-bottom:8px; }
        .services-block ul { margin:0; padding-left:18px; color:#1b2a4a; font-size:13px; line-height:1.8; }
        .notes-block { font-size:13px; color:#6b6b67; margin-bottom:14px; }
        .notes-block strong { display:block; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:#a8a8a4; margin-bottom:4px; }
        .notes-block p { margin:0; line-height:1.6; }
        .status-row { display:flex; align-items:center; gap:12px; }
        .status-row label { font-size:12px; font-weight:700; color:#6b6b67; white-space:nowrap; }
        .fc { border:1px solid #e4e1d8; border-radius:8px; padding:9px 12px; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color 0.18s; background:#fafaf8; }
        .fc:focus { border-color:#f5a623; }
      `}</style>
    </>
  )
}
