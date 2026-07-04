'use client'

import { useEffect, useState } from 'react'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { adminFetch } from '@/lib/client/admin-fetch'

type DealStage = 'lead' | 'contacted' | 'viewing' | 'offer' | 'closed' | 'cancelled'

type Deal = {
  id: string; created_at: string; file_number: string | null
  client_name: string; client_email: string; client_phone: string | null
  property_address: string; deal_type: 'buy' | 'rent' | 'sell'
  value: number | null; stage: DealStage; notes: string | null
  assigned_agent: string | null; assigned_agent_id: string | null
  linked_order_id: string | null; auto_source: string; commission: number | null
}

type Agent = { id: string; fname: string; lname: string; email: string }

type Order = {
  id: string; landlord_name: string; email: string; phone: string
  property_address: string; city: string; estimated_total: number; status: string
}

const STAGES: { key: DealStage; label: string; color: string; bg: string }[] = [
  { key: 'lead',      label: 'Lead',      color: '#a8a8a4', bg: '#f7f4ef' },
  { key: 'contacted', label: 'Contacted', color: '#1a5ea8', bg: '#e3f2fd' },
  { key: 'viewing',   label: 'Viewing',   color: '#6930c3', bg: '#f0e8fd' },
  { key: 'offer',     label: 'Offer',     color: '#a86d1a', bg: '#fef3dc' },
  { key: 'closed',    label: 'Closed',    color: '#2d7a4f', bg: '#e1f5ee' },
  { key: 'cancelled', label: 'Cancelled', color: '#a32d2d', bg: '#fcebeb' },
]

const TYPE_LABELS = { buy: 'Buying', rent: 'Renting', sell: 'Selling' }

const emptyDeal = (): Omit<Deal, 'id' | 'created_at' | 'file_number'> => ({
  client_name: '', client_email: '', client_phone: '',
  property_address: '', deal_type: 'buy', value: null,
  stage: 'lead', notes: '', assigned_agent: '', assigned_agent_id: null,
  linked_order_id: null, auto_source: 'manual', commission: null,
})

type ModalMode = 'new-manual' | 'new-order' | 'edit'

export default function AdminPipelinePage() {
  const { message, visible, showToast } = useToast()
  const [deals, setDeals]   = useState<Deal[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState<{ open: boolean; mode: ModalMode; deal?: Deal }>({ open: false, mode: 'new-manual' })
  const [form, setForm]     = useState(emptyDeal())
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [dealsRes, ordersRes, agentsRes] = await Promise.all([
      fetch('/api/admin/deals').then(r => r.json()),
      adminFetch('/api/admin/tenant-placement-orders').then(r => r.json()),
      fetch('/api/admin/agents').then(r => r.json()).catch(() => ({ agents: [] })),
    ])
    setDeals(dealsRes.deals || [])
    setOrders(ordersRes.orders || [])
    setAgents(agentsRes.agents || [])
    setLoading(false)
  }

  const openNew = (mode: ModalMode) => {
    setForm(emptyDeal())
    setSelectedOrder('')
    setModal({ open: true, mode })
  }

  const openEdit = (deal: Deal) => {
    setForm({
      client_name: deal.client_name, client_email: deal.client_email,
      client_phone: deal.client_phone || '', property_address: deal.property_address,
      deal_type: deal.deal_type, value: deal.value, stage: deal.stage,
      notes: deal.notes || '', assigned_agent: deal.assigned_agent || '',
      assigned_agent_id: deal.assigned_agent_id || null,
      linked_order_id: deal.linked_order_id, auto_source: deal.auto_source,
      commission: deal.commission ?? null,
    })
    setSelectedOrder(deal.linked_order_id || '')
    setModal({ open: true, mode: 'edit', deal })
  }

  const closeModal = () => setModal({ open: false, mode: 'new-manual' })

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId)
    const o = orders.find(o => o.id === orderId)
    if (!o) return
    setForm(prev => ({
      ...prev,
      client_name: o.landlord_name,
      client_email: o.email,
      client_phone: o.phone,
      property_address: `${o.property_address}, ${o.city}`,
      value: o.estimated_total,
      linked_order_id: orderId,
      auto_source: 'order',
    }))
  }

  const save = async () => {
    if (!form.client_name.trim() || !form.property_address.trim()) {
      showToast('Client name and property are required.')
      return
    }
    setSaving(true)
    const payload = { ...form, linked_order_id: selectedOrder || null }
    let res
    if (modal.mode === 'edit') {
      res = await fetch('/api/admin/deals', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modal.deal!.id, ...payload }),
      })
    } else {
      res = await fetch('/api/admin/deals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    const json = await res.json()
    if (!res.ok) { showToast('Failed to save: ' + json.error); setSaving(false); return }
    showToast(modal.mode === 'edit' ? 'Deal updated ✓' : 'Deal created ✓')
    closeModal()
    await load()
    setSaving(false)
  }

  const moveDeal = async (id: string, stage: DealStage) => {
    const res = await fetch('/api/admin/deals', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
    })
    if (!res.ok) { showToast('Failed to move deal.'); return }
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
    if (stage === 'closed') showToast('🎉 Deal closed! Finance entry created.')
    if (stage === 'cancelled') showToast('Deal cancelled. Finance entry recorded.')
  }

  const removeDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await fetch('/api/admin/deals', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeals(prev => prev.filter(d => d.id !== id))
    showToast('Deal deleted.')
  }

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const totalClosed = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + (d.value || 0), 0)
  const totalPipeline = deals.filter(d => !['closed', 'cancelled'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0)
  const unlinkedOrders = orders.filter(o => !deals.find(d => d.linked_order_id === o.id))

  return (
    <>
      <Toast message={message} visible={visible} />

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h3 className="modal-title">
              {modal.mode === 'edit' ? `Edit Deal ${modal.deal?.file_number || ''}` : modal.mode === 'new-order' ? 'New Deal from Order' : 'New Manual Deal'}
            </h3>

            {/* Order selector */}
            {modal.mode === 'new-order' && (
              <div className="fg">
                <label>Link to Order *</label>
                <select className="fc" value={selectedOrder} onChange={e => handleOrderSelect(e.target.value)}>
                  <option value="">— Select an order —</option>
                  {unlinkedOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.landlord_name} — {o.property_address}, {o.city} (${Number(o.estimated_total).toLocaleString('en-CA')})
                    </option>
                  ))}
                </select>
                {selectedOrder && (
                  <div style={{ marginTop: 6, padding: '8px 12px', background: '#e1f5ee', borderRadius: 8, fontSize: 12, color: '#2d7a4f', fontWeight: 600 }}>
                    ✓ Order linked — fields pre-filled below
                  </div>
                )}
              </div>
            )}

            <div className="fr">
              <div className="fg"><label>Client Name *</label><input className="fc" value={form.client_name} onChange={f('client_name')} /></div>
              <div className="fg"><label>Deal Type</label>
                <select className="fc" value={form.deal_type} onChange={f('deal_type')}>
                  <option value="buy">Buying</option><option value="rent">Renting</option><option value="sell">Selling</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Email</label><input className="fc" type="email" value={form.client_email} onChange={f('client_email')} /></div>
              <div className="fg"><label>Phone</label><input className="fc" value={form.client_phone || ''} onChange={f('client_phone')} /></div>
            </div>
            <div className="fg"><label>Property Address *</label><input className="fc" value={form.property_address} onChange={f('property_address')} /></div>
            <div className="fr">
              <div className="fg">
                <label>Deal Value ($)</label>
                <input className="fc" type="number" value={form.value ?? ''} onChange={e => setForm(p => ({ ...p, value: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="fg"><label>Stage</label>
                <select className="fc" value={form.stage} onChange={f('stage')}>
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="fg">
              <label>Assigned Agent</label>
              <select className="fc" value={form.assigned_agent_id || ''}
                onChange={e => {
                  const agent = agents.find(a => a.id === e.target.value)
                  setForm(p => ({
                    ...p,
                    assigned_agent_id: e.target.value || null,
                    assigned_agent: agent ? `${agent.fname} ${agent.lname}` : '',
                  }))
                }}>
                <option value="">— Unassigned —</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.fname} {a.lname} ({a.email})</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Estimated Commission ($)</label>
              <input className="fc" type="number" min="0" placeholder="0"
                value={form.commission ?? ''}
                onChange={e => setForm(p => ({ ...p, commission: e.target.value ? Number(e.target.value) : null }))}
              />
              <span style={{ fontSize: 11, color: '#a8a8a4', marginTop: 3 }}>Auto-added to Commission module when deal closes</span>
            </div>
            <div className="fg"><label>Notes</label><textarea className="fc" rows={3} value={form.notes || ''} onChange={f('notes')} /></div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : modal.mode === 'edit' ? 'Save Changes' : 'Create Deal'}
              </button>
              <button className="btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Pipeline</h1>
            <p className="page-sub">
              {deals.length} deals · <span style={{ color: '#2d7a4f', fontWeight: 700 }}>${totalClosed.toLocaleString('en-CA')} closed</span>
              {' · '}<span style={{ color: '#a86d1a' }}>${totalPipeline.toLocaleString('en-CA')} in pipeline</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-pill" onClick={() => openNew('new-order')}>+ From Order</button>
            <button className="btn-accent-pill" onClick={() => openNew('new-manual')}>+ New Deal</button>
          </div>
        </div>

        {loading ? <div className="empty-msg">Loading pipeline…</div> : (
          <div className="kanban">
            {STAGES.map(stage => {
              const col = deals.filter(d => d.stage === stage.key)
              const colValue = col.reduce((s, d) => s + (d.value || 0), 0)
              return (
                <div key={stage.key} className="kanban-col">
                  <div className="col-header" style={{ borderTopColor: stage.color }}>
                    <span className="col-label" style={{ color: stage.color }}>{stage.label}</span>
                    <span className="col-count" style={{ background: stage.bg, color: stage.color }}>{col.length}</span>
                  </div>
                  {colValue > 0 && <div className="col-value">${colValue.toLocaleString('en-CA')}</div>}
                  <div className="col-cards">
                    {col.length === 0 && <div className="col-empty">No deals</div>}
                    {col.map(d => (
                      <div key={d.id} className="deal-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span className="deal-type-tag" style={{ background: stage.bg, color: stage.color }}>{TYPE_LABELS[d.deal_type]}</span>
                          {d.file_number && <span className="deal-file">{d.file_number}</span>}
                        </div>
                        <div className="deal-name">{d.client_name}</div>
                        <div className="deal-addr">{d.property_address}</div>
                        {d.value != null && <div className="deal-val">${d.value.toLocaleString('en-CA')}</div>}
                        {d.assigned_agent && <div className="deal-agent">👤 {d.assigned_agent}</div>}
                        {d.linked_order_id && <div className="deal-linked">🔗 Linked to order</div>}
                        {d.notes && <div className="deal-notes">{d.notes}</div>}
                        <div className="deal-actions">
                          <button className="deal-btn" onClick={() => openEdit(d)}>Edit</button>
                          <select className="deal-move" value={d.stage} onChange={e => moveDeal(d.id, e.target.value as DealStage)}>
                            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <button className="deal-btn deal-del" onClick={() => removeDeal(d.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-shell{padding:clamp(20px,3vw,36px) clamp(16px,3vw,36px)}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:28px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .btn-accent-pill{background:#f5a623;color:#1e2a45;border:none;border-radius:999px;padding:10px 22px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;white-space:nowrap;box-shadow:0 4px 14px rgba(245,166,35,0.28);transition:background 0.18s,transform 0.18s}
        .btn-accent-pill:hover{background:#d4891a;transform:translateY(-1px)}
        .btn-outline-pill{background:#fff;color:#1b2a4a;border:1.5px solid #e4e1d8;border-radius:999px;padding:10px 22px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;white-space:nowrap;transition:border-color 0.18s,transform 0.18s}
        .btn-outline-pill:hover{border-color:#f5a623;color:#a86d1a;transform:translateY(-1px)}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8}
        .kanban{display:grid;grid-template-columns:repeat(6,minmax(200px,1fr));gap:14px;overflow-x:auto;padding-bottom:16px}
        .kanban-col{background:#fff;border:1px solid rgba(12,21,37,0.07);border-radius:14px;overflow:hidden;min-width:190px}
        .col-header{padding:12px 14px 8px;border-top:3px solid;display:flex;align-items:center;justify-content:space-between}
        .col-label{font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
        .col-count{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px}
        .col-value{font-size:12px;font-weight:700;color:#1b2a4a;padding:0 14px 10px;font-family:Georgia,serif}
        .col-cards{padding:4px 10px 12px;display:flex;flex-direction:column;gap:8px;min-height:80px}
        .col-empty{font-size:12px;color:#a8a8a4;text-align:center;padding:20px 0}
        .deal-card{background:#fafaf8;border:1px solid #e4e1d8;border-radius:10px;padding:11px 12px;transition:box-shadow 0.15s}
        .deal-card:hover{box-shadow:0 4px 14px rgba(0,0,0,0.09)}
        .deal-type-tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:2px 8px;border-radius:999px}
        .deal-file{font-size:10px;font-weight:700;color:#a8a8a4;letter-spacing:0.5px;font-family:monospace}
        .deal-name{font-weight:700;font-size:13.5px;color:#1b2a4a;margin-bottom:3px}
        .deal-addr{font-size:11.5px;color:#6b6b67;line-height:1.4;margin-bottom:5px}
        .deal-val{font-size:13px;font-weight:700;color:#2d7a4f;margin-bottom:3px}
        .deal-agent{font-size:11px;color:#a8a8a4;margin-bottom:3px}
        .deal-linked{font-size:10px;color:#1a5ea8;font-weight:600;margin-bottom:3px}
        .deal-notes{font-size:11px;color:#a8a8a4;font-style:italic;line-height:1.4;margin-bottom:6px;border-top:1px solid #e4e1d8;padding-top:6px}
        .deal-actions{display:flex;gap:5px;align-items:center;margin-top:8px}
        .deal-btn{background:#fff;border:1px solid #e4e1d8;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.13s;color:#1b2a4a;flex-shrink:0}
        .deal-btn:hover{background:#f7f4ef}
        .deal-del{color:#a32d2d!important}
        .deal-del:hover{background:#fcebeb!important}
        .deal-move{flex:1;border:1px solid #e4e1d8;border-radius:6px;padding:4px 6px;font-size:11px;font-family:inherit;background:#fafaf8;outline:none;cursor:pointer;min-width:0}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .modal-box{background:#fff;border-radius:18px;padding:32px 28px;max-width:580px;width:100%;max-height:90vh;overflow-y:auto;position:relative}
        .modal-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;color:#a8a8a4;line-height:1}
        .modal-close:hover{color:#1b2a4a}
        .modal-title{font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1b2a4a;margin:0 0 20px}
        .modal-actions{display:flex;gap:8px;margin-top:12px}
        .fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .fg label{font-size:11px;font-weight:700;letter-spacing:0.5px;color:#6b6b67;text-transform:uppercase}
        .fr{display:flex;gap:12px}
        .fr .fg{flex:1}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.18s;background:#fafaf8}
        .fc:focus{border-color:#f5a623}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:7px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;color:#1b2a4a}
        .btn:hover{background:#f7f4ef}
        .btn-primary{background:#f5a623;color:#1e2a45;border-color:#f5a623}
        .btn-primary:hover{background:#d4891a;border-color:#d4891a}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
        @media(max-width:900px){.kanban{grid-template-columns:repeat(3,minmax(190px,1fr))}}
      `}</style>
    </>
  )
}
