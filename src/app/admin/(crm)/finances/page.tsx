'use client'

import { useEffect, useState, useMemo } from 'react'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type Agent = { id: string; fname: string; lname: string; email: string }

type CommissionRecord = {
  id: string; created_at: string
  agent_id: string | null; agent: Agent | null
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

const TRANSACTION_TYPES = [
  { value: 'tenant_placement',     label: 'Tenant Placement' },
  { value: 'property_management',  label: 'Property Management' },
  { value: 'mortgage_referral',    label: 'Mortgage Referral' },
  { value: 'real_estate_referral', label: 'Real Estate Referral' },
]
const DEAL_STATUSES = [
  { value: 'lead',        label: 'Lead',        color: '#a8a8a4', bg: '#f7f4ef' },
  { value: 'contacted',   label: 'Contacted',   color: '#1a5ea8', bg: '#e3f2fd' },
  { value: 'in_progress', label: 'In Progress', color: '#6930c3', bg: '#f0e8fd' },
  { value: 'closed',      label: 'Closed',      color: '#2d7a4f', bg: '#e1f5ee' },
  { value: 'cancelled',   label: 'Cancelled',   color: '#a32d2d', bg: '#fcebeb' },
]
const CLIENT_TYPES = ['landlord','tenant','buyer','seller','referral']
const PAYMENT_STATUSES = [
  { value: 'in_progress', label: 'In Progress', color: '#a86d1a', bg: '#FEF3DC' },
  { value: 'paid',        label: 'Paid',        color: '#2d7a4f', bg: '#E1F5EE' },
  { value: 'cancelled',   label: 'Cancelled',   color: '#a32d2d', bg: '#FCEBEB' },
]

const emptyForm = () => ({
  agent_id: '', client_name: '', client_type: 'landlord',
  related_file_id: '', property_address: '', transaction_type: 'tenant_placement',
  deal_status: 'lead', closing_date: '', service_type: '',
  total_service_fee: 0, commission_type: 'percentage',
  commission_rate: 0, flat_commission: 0, adjustment_amount: 0,
  deal_order_number: '', payment_status: 'in_progress',
  expected_payment_date: '', paid_date: '', notes: '',
})

const fmt = (n: number) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })

export default function CommissionPage() {
  const { message, visible, showToast } = useToast()
  const [records, setRecords] = useState<CommissionRecord[]>([])
  const [agents, setAgents]   = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [agentFilter, setAgentFilter]   = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modal, setModal]     = useState<{ open: boolean; rec?: CommissionRecord }>({ open: false })
  const [form, setForm]       = useState(emptyForm())
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [recRes, agentRes] = await Promise.all([
      fetch('/api/admin/commission').then(r => r.json()),
      fetch('/api/admin/agents').then(r => r.json()),
    ])
    setRecords(recRes.records || [])
    setAgents(agentRes.agents || [])
    setLoading(false)
  }

  const openNew  = () => { setForm(emptyForm()); setModal({ open: true }) }
  const openEdit = (rec: CommissionRecord) => {
    setForm({
      agent_id: rec.agent_id || '', client_name: rec.client_name,
      client_type: rec.client_type, related_file_id: rec.related_file_id || '',
      property_address: rec.property_address || '', transaction_type: rec.transaction_type,
      deal_status: rec.deal_status, closing_date: rec.closing_date || '',
      service_type: rec.service_type || '', total_service_fee: rec.total_service_fee,
      commission_type: rec.commission_type, commission_rate: rec.commission_rate,
      flat_commission: rec.flat_commission, adjustment_amount: rec.adjustment_amount,
      deal_order_number: rec.deal_order_number || '', payment_status: rec.payment_status,
      expected_payment_date: rec.expected_payment_date || '',
      paid_date: rec.paid_date || '', notes: rec.notes || '',
    })
    setModal({ open: true, rec })
  }
  const closeModal = () => setModal({ open: false })

  const previewCommission = useMemo(() => {
    if (form.commission_type === 'flat') return Number(form.flat_commission)
    return Math.round(Number(form.total_service_fee) * Number(form.commission_rate) / 100 * 100) / 100
  }, [form.commission_type, form.flat_commission, form.total_service_fee, form.commission_rate])

  const previewFinal = useMemo(() =>
    Math.round((previewCommission + Number(form.adjustment_amount)) * 100) / 100
  , [previewCommission, form.adjustment_amount])

  const save = async () => {
    if (!form.client_name.trim()) { showToast('Client name required.'); return }
    setSaving(true)
    const payload = {
      ...form,
      agent_id: form.agent_id || null,
      related_file_id: form.related_file_id || null,
      property_address: form.property_address || null,
      closing_date: form.closing_date || null,
      service_type: form.service_type || null,
      deal_order_number: form.deal_order_number || null,
      expected_payment_date: form.expected_payment_date || null,
      paid_date: form.paid_date || null,
      notes: form.notes || null,
      total_service_fee: Number(form.total_service_fee),
      commission_rate: Number(form.commission_rate),
      flat_commission: Number(form.flat_commission),
      adjustment_amount: Number(form.adjustment_amount),
    }
    const res = modal.rec
      ? await fetch('/api/admin/commission', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: modal.rec.id, ...payload }) })
      : await fetch('/api/admin/commission', { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()
    if (!res.ok) { showToast('Error: ' + json.error); setSaving(false); return }
    showToast(modal.rec ? 'Record updated ✓' : 'Record created ✓')
    closeModal(); await load(); setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this record?')) return
    await fetch('/api/admin/commission', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setRecords(prev => prev.filter(r => r.id !== id))
    showToast('Deleted.')
  }

  const sf = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))

  const filtered = records.filter(r => {
    if (statusFilter && r.deal_status !== statusFilter) return false
    if (agentFilter && r.agent_id !== agentFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (![r.client_name, r.property_address||'', r.related_file_id||'', r.deal_order_number||'',
        r.agent?.fname||'', r.agent?.lname||''].join(' ').toLowerCase().includes(q)) return false
    }
    return true
  })

  const agentSummary = useMemo(() => {
    const map: Record<string, { agent: Agent; gross: number; paid: number; pending: number; count: number }> = {}
    records.forEach(r => {
      if (!r.agent_id || !r.agent) return
      if (!map[r.agent_id]) map[r.agent_id] = { agent: r.agent, gross: 0, paid: 0, pending: 0, count: 0 }
      map[r.agent_id].gross += r.total_commission || 0
      map[r.agent_id].count += 1
      if (r.payment_status === 'paid') map[r.agent_id].paid += r.final_amount || 0
      else if (r.payment_status === 'in_progress') map[r.agent_id].pending += r.final_amount || 0
    })
    return Object.values(map).sort((a, b) => b.gross - a.gross)
  }, [records])

  const totalGross = records.reduce((s, r) => s + (r.total_commission || 0), 0)
  const totalPaid  = records.filter(r => r.payment_status === 'paid').reduce((s, r) => s + (r.final_amount || 0), 0)
  const totalOwed  = records.filter(r => r.payment_status === 'in_progress').reduce((s, r) => s + (r.final_amount || 0), 0)

  return (
    <>
      <Toast message={message} visible={visible} />

      {modal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={closeModal}>
          <div style={{ background:'#fff', borderRadius:18, padding:'32px 28px', maxWidth:680, width:'100%', maxHeight:'92vh', overflowY:'auto', position:'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#a8a8a4' }}>✕</button>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:22, color:'#1b2a4a', margin:'0 0 22px' }}>{modal.rec ? 'Edit Commission Record' : 'New Commission Record'}</h3>

            <div className="msec-title">Deal Information</div>
            <div className="mrow">
              <div className="fg"><label>Agent</label>
                <select className="fc" value={form.agent_id} onChange={sf('agent_id')}>
                  <option value="">— Unassigned —</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.fname} {a.lname}</option>)}
                </select>
              </div>
              <div className="fg"><label>Client Type</label>
                <select className="fc" value={form.client_type} onChange={sf('client_type')}>
                  {CLIENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="mrow">
              <div className="fg"><label>Client Name *</label><input className="fc" value={form.client_name} onChange={sf('client_name')} /></div>
              <div className="fg"><label>Related File ID</label><input className="fc" value={form.related_file_id} onChange={sf('related_file_id')} placeholder="e.g. AZ-2026-1001" /></div>
            </div>
            <div className="fg"><label>Property Address</label><input className="fc" value={form.property_address} onChange={sf('property_address')} /></div>
            <div className="mrow">
              <div className="fg"><label>Transaction Type</label>
                <select className="fc" value={form.transaction_type} onChange={sf('transaction_type')}>
                  {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="fg"><label>Service Type</label><input className="fc" value={form.service_type} onChange={sf('service_type')} placeholder="e.g. Full Package" /></div>
            </div>
            <div className="mrow">
              <div className="fg"><label>Deal Status</label>
                <select className="fc" value={form.deal_status} onChange={sf('deal_status')}>
                  {DEAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="fg"><label>Closing / Completion Date</label><input className="fc" type="date" value={form.closing_date} onChange={sf('closing_date')} /></div>
            </div>

            <div className="msec-title" style={{ marginTop:8 }}>Commission Calculation</div>
            <div className="mrow">
              <div className="fg"><label>Total Service Fee ($)</label><input className="fc" type="number" step="0.01" value={form.total_service_fee || ''} onChange={sf('total_service_fee')} /></div>
              <div className="fg"><label>Commission Type</label>
                <select className="fc" value={form.commission_type} onChange={sf('commission_type')}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ($)</option>
                </select>
              </div>
            </div>
            <div className="mrow">
              {form.commission_type === 'percentage'
                ? <div className="fg"><label>Commission Rate (%)</label><input className="fc" type="number" step="0.01" value={form.commission_rate || ''} onChange={sf('commission_rate')} /></div>
                : <div className="fg"><label>Flat Commission ($)</label><input className="fc" type="number" step="0.01" value={form.flat_commission || ''} onChange={sf('flat_commission')} /></div>
              }
              <div className="fg"><label>Adjustment Amount ($)</label><input className="fc" type="number" step="0.01" value={form.adjustment_amount || ''} onChange={sf('adjustment_amount')} /></div>
            </div>
            <div style={{ background:'#f7f4ef', borderRadius:10, padding:'12px 16px', marginBottom:14, fontSize:13, display:'flex', gap:24 }}>
              <span style={{ color:'#6b6b67' }}>Gross Commission: <strong style={{ color:'#1b2a4a' }}>{fmt(previewCommission)}</strong></span>
              <span style={{ color:'#6b6b67' }}>Final Payable: <strong style={{ color:'#2d7a4f', fontSize:15 }}>{fmt(previewFinal)}</strong></span>
            </div>

            <div className="msec-title" style={{ marginTop:8 }}>Payment Tracking</div>
            <div className="mrow">
              <div className="fg"><label>Deal / Order Number</label><input className="fc" value={form.deal_order_number} onChange={sf('deal_order_number')} /></div>
              <div className="fg"><label>Payment Status</label>
                <select className="fc" value={form.payment_status} onChange={sf('payment_status')}>
                  {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mrow">
              <div className="fg"><label>Expected Payment Date</label><input className="fc" type="date" value={form.expected_payment_date} onChange={sf('expected_payment_date')} /></div>
              <div className="fg"><label>Paid Date</label><input className="fc" type="date" value={form.paid_date} onChange={sf('paid_date')} /></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="fc" rows={2} value={form.notes} onChange={sf('notes')} /></div>

            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : modal.rec ? 'Save Changes' : 'Create Record'}</button>
              <button className="btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Commission</h1>
            <p className="page-sub">Agent commission tracking · {records.length} records</p>
          </div>
          <button className="btn-accent-pill" onClick={openNew}>+ New Record</button>
        </div>

        <div className="summary-grid">
          <div className="scard"><div className="scard-label">Total Gross Commission</div><div className="scard-val">{fmt(totalGross)}</div></div>
          <div className="scard"><div className="scard-label">Total Paid Out</div><div className="scard-val" style={{ color:'#2d7a4f' }}>{fmt(totalPaid)}</div></div>
          <div className="scard"><div className="scard-label">Pending Payment</div><div className="scard-val" style={{ color:'#a86d1a' }}>{fmt(totalOwed)}</div></div>
        </div>

        {agentSummary.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <div className="section-title">Agent Summary</div>
            <div className="table-wrap">
              <table className="crm-table">
                <thead><tr><th>Agent</th><th>Records</th><th>Gross Commission</th><th>Paid</th><th>Pending</th></tr></thead>
                <tbody>
                  {agentSummary.map(s => (
                    <tr key={s.agent.id}>
                      <td><div style={{ fontWeight:700, color:'#1b2a4a' }}>{s.agent.fname} {s.agent.lname}</div><div style={{ fontSize:11.5, color:'#a8a8a4' }}>{s.agent.email}</div></td>
                      <td style={{ color:'#6b6b67', textAlign:'center' }}>{s.count}</td>
                      <td style={{ fontWeight:700, color:'#1b2a4a', fontFamily:'Georgia,serif' }}>{fmt(s.gross)}</td>
                      <td style={{ fontWeight:700, color:'#2d7a4f' }}>{fmt(s.paid)}</td>
                      <td style={{ fontWeight:700, color:'#a86d1a' }}>{fmt(s.pending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="filter-bar">
          <input className="fc" style={{ maxWidth:260, marginBottom:0 }} placeholder="Search client, property, file ID…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fc" style={{ maxWidth:160, marginBottom:0 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {DEAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="fc" style={{ maxWidth:180, marginBottom:0 }} value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
            <option value="">All agents</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.fname} {a.lname}</option>)}
          </select>
        </div>

        {loading ? <div className="empty-msg">Loading…</div>
          : filtered.length === 0 ? <div className="empty-msg">No commission records yet.</div>
          : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(r => {
              const isOpen = expanded === r.id
              const ds = DEAL_STATUSES.find(s => s.value === r.deal_status)
              const ps = PAYMENT_STATUSES.find(s => s.value === r.payment_status)
              const tt = TRANSACTION_TYPES.find(t => t.value === r.transaction_type)
              return (
                <div key={r.id} style={{ background:'#fff', border:'1px solid rgba(12,21,37,0.08)', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div onClick={() => setExpanded(isOpen ? null : r.id)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 20px', cursor:'pointer', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontWeight:700, fontSize:15, color:'#1b2a4a' }}>{r.client_name}</span>
                        {r.related_file_id && <span style={{ fontSize:10, fontFamily:'monospace', color:'#a8a8a4', background:'#f7f4ef', padding:'2px 7px', borderRadius:4 }}>{r.related_file_id}</span>}
                        {tt && <span style={{ fontSize:10, fontWeight:700, color:'#1a5ea8', background:'#e3f2fd', padding:'2px 8px', borderRadius:4 }}>{tt.label}</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#6b6b67', marginTop:2 }}>{r.property_address || '—'}</div>
                      <div style={{ fontSize:11.5, color:'#a8a8a4', marginTop:2 }}>
                        {r.agent ? `👤 ${r.agent.fname} ${r.agent.lname}` : 'Unassigned'}
                        {r.closing_date && ` · Closes ${r.closing_date}`}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, flexWrap:'wrap' }}>
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
                    <div style={{ borderTop:'1px solid #f0ede6', padding:'18px 20px 20px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'10px 28px', marginBottom:18 }}>
                        {[
                          ['Client Type',      r.client_type ? r.client_type.charAt(0).toUpperCase()+r.client_type.slice(1) : '--'],
                          ['Service Type',     r.service_type || '--'],
                          ['Transaction Type', tt?.label || '--'],
                          ['Deal Status',      ds?.label || '--'],
                          ['Closing Date',     r.closing_date || '--'],
                          ['Deal / Order No.', r.deal_order_number || '--'],
                        ].map(([lbl, val]) => (
                          <div key={lbl}>
                            <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                            <div style={{ fontSize:13, color:'#1b2a4a' }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ background:'#f7f4ef', borderRadius:12, padding:'14px 18px', marginBottom:12 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#6b6b67', marginBottom:10 }}>Commission Breakdown</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                          {[
                            ['Total Service Fee', fmt(r.total_service_fee)],
                            ['Commission Type',   r.commission_type === 'flat' ? 'Flat' : `${r.commission_rate}%`],
                            ['Gross Commission',  fmt(r.total_commission)],
                            ['Adjustment',        fmt(r.adjustment_amount)],
                            ['Final Payable',     fmt(r.final_amount)],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#a8a8a4', marginBottom:2 }}>{lbl}</div>
                              <div style={{ fontWeight: lbl === 'Final Payable' ? 800 : 600, color: lbl === 'Final Payable' ? '#2d7a4f' : '#1b2a4a', fontSize: lbl === 'Final Payable' ? 16 : 13 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background:'#e8f4fd', borderRadius:12, padding:'14px 18px', marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'#1a5ea8', marginBottom:10 }}>Payment Tracking</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'8px 20px' }}>
                          {[
                            ['Payment Status', ps?.label || '--'],
                            ['Expected Date',  r.expected_payment_date || '--'],
                            ['Paid Date',      r.paid_date || '--'],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', color:'#1a5ea8', opacity:0.7, marginBottom:2 }}>{lbl}</div>
                              <div style={{ fontWeight:600, color:'#1b2a4a', fontSize:13 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        {r.notes && <div style={{ marginTop:10, fontSize:12, color:'#6b6b67', borderTop:'1px solid rgba(26,94,168,0.15)', paddingTop:8 }}><strong>Notes:</strong> {r.notes}</div>}
                      </div>

                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-sm" onClick={() => openEdit(r)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Delete</button>
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
        .page-shell{padding:clamp(20px,3vw,36px) clamp(16px,3vw,36px);max-width:1100px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .btn-accent-pill{background:#f5a623;color:#1e2a45;border:none;border-radius:999px;padding:10px 22px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 14px rgba(245,166,35,0.28)}
        .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
        .scard{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;padding:20px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
        .scard-label{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;margin-bottom:8px}
        .scard-val{font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1b2a4a}
        .section-title{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b6b67;margin-bottom:10px}
        .filter-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8;font-size:14px}
        .table-wrap{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:12px;overflow:auto;margin-bottom:8px}
        .crm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .crm-table th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;border-bottom:1px solid #e4e1d8;background:#fafaf8;white-space:nowrap}
        .crm-table td{padding:11px 14px;border-bottom:1px solid #f0ede6;vertical-align:middle}
        .crm-table tbody tr:last-child td{border-bottom:none}
        .crm-table tbody tr:hover td{background:#fafaf8}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:7px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:#1b2a4a;transition:background 0.15s}
        .btn:hover{background:#f7f4ef}
        .btn-sm{padding:5px 10px;font-size:12px}
        .btn-primary{background:#f5a623;color:#1e2a45;border-color:#f5a623}
        .btn-primary:hover{background:#d4891a}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
        .btn-danger{background:#fcebeb!important;color:#a32d2d!important;border-color:#e8a5a5!important}
        .btn-danger:hover{background:#f8d5d5!important}
        .fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .fg label{font-size:11px;font-weight:700;letter-spacing:0.5px;color:#6b6b67;text-transform:uppercase}
        .mrow{display:flex;gap:12px}
        .mrow .fg{flex:1}
        .msec-title{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#f5a623;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #f0ede6}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;width:100%;background:#fafaf8;transition:border-color 0.18s}
        .fc:focus{border-color:#f5a623}
        @media(max-width:640px){.summary-grid{grid-template-columns:1fr}.mrow{flex-direction:column}}
      `}</style>
    </>
  )
}
