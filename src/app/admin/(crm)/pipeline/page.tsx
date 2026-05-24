'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type DealStage = 'lead' | 'contacted' | 'viewing' | 'offer' | 'closed' | 'lost'
type Deal = { id: string; created_at: string; client_name: string; client_email: string; client_phone: string | null; property_address: string; deal_type: 'buy' | 'rent' | 'sell'; value: number | null; stage: DealStage; notes: string | null; assigned_agent: string | null }

const STAGES: { key: DealStage; label: string; color: string; bg: string }[] = [
  { key: 'lead', label: 'Lead', color: '#a8a8a4', bg: '#f7f4ef' },
  { key: 'contacted', label: 'Contacted', color: '#1a5ea8', bg: '#e3f2fd' },
  { key: 'viewing', label: 'Viewing', color: '#6930c3', bg: '#f0e8fd' },
  { key: 'offer', label: 'Offer', color: '#a86d1a', bg: '#fef3dc' },
  { key: 'closed', label: 'Closed', color: '#2d7a4f', bg: '#e1f5ee' },
  { key: 'lost', label: 'Lost', color: '#a32d2d', bg: '#fcebeb' },
]

const TYPE_LABELS = { buy: 'Buying', rent: 'Renting', sell: 'Selling' }
const empty = (): Omit<Deal, 'id' | 'created_at'> => ({ client_name: '', client_email: '', client_phone: '', property_address: '', deal_type: 'buy', value: null, stage: 'lead', notes: '', assigned_agent: '' })

export default function AdminPipelinePage() {
  const { message, visible, showToast } = useToast()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; isNew: boolean; deal?: Deal }>({ open: false, isNew: true })
  const [form, setForm] = useState<Omit<Deal, 'id' | 'created_at'>>(empty())
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await createClient().from('deals').select('*').order('created_at', { ascending: false })
    setDeals(data || []); setLoading(false)
  }

  const save = async () => {
    if (!form.client_name.trim() || !form.property_address.trim()) { showToast('Client name and property are required.'); return }
    setSaving(true)
    const supabase = createClient()
    const { error } = modal.isNew ? await supabase.from('deals').insert([form]) : await supabase.from('deals').update(form).eq('id', modal.deal!.id)
    if (error) { showToast('Failed to save.'); setSaving(false); return }
    showToast(modal.isNew ? 'Deal created ✓' : 'Deal updated ✓')
    setModal({ open: false, isNew: true }); await load(); setSaving(false)
  }

  const moveDeal = async (id: string, stage: DealStage) => {
    await createClient().from('deals').update({ stage }).eq('id', id)
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
  }

  const removeDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await createClient().from('deals').delete().eq('id', id)
    setDeals(prev => prev.filter(d => d.id !== id)); showToast('Deal deleted.')
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const totalValue = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + (d.value || 0), 0)

  return (
    <>
      <Toast message={message} visible={visible} />
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, isNew: true })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal({ open: false, isNew: true })}>✕</button>
            <h3 className="modal-title">{modal.isNew ? 'New Deal' : 'Edit Deal'}</h3>
            <div className="fr">
              <div className="fg"><label>Client Name *</label><input className="fc" value={form.client_name} onChange={f('client_name')} /></div>
              <div className="fg"><label>Deal Type</label><select className="fc" value={form.deal_type} onChange={f('deal_type')}><option value="buy">Buying</option><option value="rent">Renting</option><option value="sell">Selling</option></select></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Email</label><input className="fc" type="email" value={form.client_email} onChange={f('client_email')} /></div>
              <div className="fg"><label>Phone</label><input className="fc" value={form.client_phone || ''} onChange={f('client_phone')} /></div>
            </div>
            <div className="fg"><label>Property Address *</label><input className="fc" value={form.property_address} onChange={f('property_address')} /></div>
            <div className="fr">
              <div className="fg"><label>Deal Value ($)</label><input className="fc" type="number" value={form.value ?? ''} onChange={e => setForm(p => ({ ...p, value: e.target.value ? Number(e.target.value) : null }))} /></div>
              <div className="fg"><label>Stage</label><select className="fc" value={form.stage} onChange={f('stage')}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
            </div>
            <div className="fg"><label>Assigned Agent</label><input className="fc" value={form.assigned_agent || ''} onChange={f('assigned_agent')} /></div>
            <div className="fg"><label>Notes</label><textarea className="fc" rows={3} value={form.notes || ''} onChange={f('notes')} /></div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : modal.isNew ? 'Create Deal' : 'Save Changes'}</button>
              <button className="btn" onClick={() => setModal({ open: false, isNew: true })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-shell">
        <div className="page-header">
          <div><h1 className="page-title">Pipeline</h1><p className="page-sub">{deals.length} active deals · ${totalValue.toLocaleString('en-CA')} closed value</p></div>
          <button className="btn-accent-pill" onClick={() => { setForm(empty()); setModal({ open: true, isNew: true }) }}>+ New Deal</button>
        </div>
        {loading ? <div className="empty-msg">Loading pipeline…</div> : (
          <div className="kanban">
            {STAGES.map(stage => {
              const cols = deals.filter(d => d.stage === stage.key)
              const colValue = cols.reduce((s, d) => s + (d.value || 0), 0)
              return (
                <div key={stage.key} className="kanban-col">
                  <div className="col-header" style={{ borderTopColor: stage.color }}>
                    <span className="col-label" style={{ color: stage.color }}>{stage.label}</span>
                    <span className="col-count" style={{ background: stage.bg, color: stage.color }}>{cols.length}</span>
                  </div>
                  {colValue > 0 && <div className="col-value">${colValue.toLocaleString('en-CA')}</div>}
                  <div className="col-cards">
                    {cols.length === 0 && <div className="col-empty">No deals</div>}
                    {cols.map(d => (
                      <div key={d.id} className="deal-card">
                        <div className="deal-type-tag" style={{ background: stage.bg, color: stage.color }}>{TYPE_LABELS[d.deal_type]}</div>
                        <div className="deal-name">{d.client_name}</div>
                        <div className="deal-addr">{d.property_address}</div>
                        {d.value && <div className="deal-val">${d.value.toLocaleString('en-CA')}</div>}
                        {d.assigned_agent && <div className="deal-agent">👤 {d.assigned_agent}</div>}
                        {d.notes && <div className="deal-notes">{d.notes}</div>}
                        <div className="deal-actions">
                          <button className="deal-btn" onClick={() => { setForm({ ...d }); setModal({ open: true, isNew: false, deal: d }) }}>Edit</button>
                          <select className="deal-move" value={d.stage} onChange={e => moveDeal(d.id, e.target.value as DealStage)}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
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
        .deal-type-tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-bottom:6px}
        .deal-name{font-weight:700;font-size:13.5px;color:#1b2a4a;margin-bottom:3px}
        .deal-addr{font-size:11.5px;color:#6b6b67;line-height:1.4;margin-bottom:5px}
        .deal-val{font-size:13px;font-weight:700;color:#2d7a4f;margin-bottom:3px}
        .deal-agent{font-size:11px;color:#a8a8a4;margin-bottom:4px}
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
