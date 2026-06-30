'use client'

import { useEffect, useMemo, useState } from 'react'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type Partner = {
  id: string; full_name: string; email: string; phone: string; referral_id: string
  etransfer_email: string; partner_status: string
}
type Payout = {
  id: string; referral_submission_id: string | null; client_case_id: string | null
  service_type: string | null; eligible_fee: number; payout_amount: number
  eligibility_status: string; payment_status: string; agreement_signed_at: string | null
  client_payment_received_at: string | null; client_payment_cleared_at: string | null
  paid_at: string | null; etransfer_email: string | null; notes: string | null
  created_at: string; partner: Partner | null
}
type Submission = {
  id: string; referral_id: string; partner_name: string | null; partner_email: string | null
  landlord_name: string; landlord_email: string; landlord_phone: string
  property_address: string | null; city: string | null; interested_services: string[] | null
  possible_duplicate: boolean; duplicate_reason: string | null; created_at: string
}

const ELIGIBILITY = ['pending_requirements', 'eligible', 'cancelled', 'reversed']
const PAYMENTS = ['not_payable', 'payable', 'paid', 'cancelled', 'reversed']

const fmtMoney = (n: number) => '$' + Number(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })
const toDateInput = (value: string | null) => value ? value.slice(0, 10) : ''
const fromDateInput = (value: string) => value ? new Date(`${value}T12:00:00`).toISOString() : null

export default function AdminReferralsPage() {
  const { message, visible, showToast } = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/referrals', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setPartners(data.partners || [])
      setSubmissions(data.submissions || [])
      setPayouts(data.payouts || [])
    }
    setLoading(false)
  }

  async function patch(id: string, fields: Record<string, any>) {
    setSaving(id)
    const res = await fetch('/api/admin/referrals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    if (!res.ok) {
      showToast('Failed to save referral payout.')
      setSaving(null)
      return
    }
    const json = await res.json()
    setPayouts(prev => prev.map(p => p.id === id ? json.payout : p))
    showToast('Referral payout saved.')
    setSaving(null)
  }

  const submissionMap = useMemo(() => {
    const map: Record<string, Submission> = {}
    submissions.forEach(s => { map[s.id] = s })
    return map
  }, [submissions])

  const filteredPayouts = payouts.filter(p => {
    if (!search) return true
    const s = submissionMap[p.referral_submission_id || '']
    const q = search.toLowerCase()
    return [
      p.partner?.full_name, p.partner?.email, p.partner?.referral_id,
      s?.landlord_name, s?.landlord_email, s?.property_address, s?.city,
    ].filter(Boolean).join(' ').toLowerCase().includes(q)
  })

  const totalPending = payouts.filter(p => ['not_payable', 'payable'].includes(p.payment_status)).reduce((sum, p) => sum + Number(p.payout_amount || 0), 0)
  const totalPaid = payouts.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + Number(p.payout_amount || 0), 0)

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Referral Program</h1>
            <p className="page-sub">{partners.length} partners · {submissions.length} submissions · {payouts.length} payouts</p>
          </div>
          <button className="btn" onClick={load}>Refresh</button>
        </div>

        <div className="summary-grid">
          <div className="summary-card"><span>Pending Potential</span><strong>{fmtMoney(totalPending)}</strong></div>
          <div className="summary-card"><span>Paid</span><strong>{fmtMoney(totalPaid)}</strong></div>
          <div className="summary-card"><span>Active Partners</span><strong>{partners.filter(p => p.partner_status === 'active').length}</strong></div>
        </div>

        <input className="fc" style={{ maxWidth: 320, marginBottom: 18 }} placeholder="Search partner, referral ID, landlord..." value={search} onChange={e => setSearch(e.target.value)} />

        {loading ? <div className="empty-msg">Loading referrals...</div> : filteredPayouts.length === 0 ? <div className="empty-msg">No referral payouts found.</div> : (
          <div className="list">
            {filteredPayouts.map(p => {
              const s = submissionMap[p.referral_submission_id || '']
              const isOpen = expanded === p.id
              return (
                <div key={p.id} className="card">
                  <div className="card-top" onClick={() => setExpanded(isOpen ? null : p.id)}>
                    <div>
                      <div className="name">{s?.landlord_name || 'Referral Lead'}</div>
                      <div className="sub">{s?.property_address || '--'}{s?.city ? `, ${s.city}` : ''}</div>
                      <div className="meta">{p.partner?.full_name || s?.partner_name || 'Unknown partner'} · {p.partner?.referral_id || s?.referral_id || '--'}</div>
                    </div>
                    <div className="right">
                      <div className="amount">{fmtMoney(p.payout_amount)}</div>
                      <span className={`pill ${p.payment_status}`}>{p.payment_status.replace(/_/g, ' ')}</span>
                      <span className="chev">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="detail">
                      <div className="detail-grid">
                        <Info label="Partner Email" value={p.partner?.email || s?.partner_email || '--'} />
                        <Info label="E-transfer" value={p.etransfer_email || p.partner?.etransfer_email || '--'} />
                        <Info label="Landlord Email" value={s?.landlord_email || '--'} />
                        <Info label="Landlord Phone" value={s?.landlord_phone || '--'} />
                        <Info label="Service Interest" value={p.service_type || s?.interested_services?.join(', ') || '--'} />
                        <Info label="Eligible Fee" value={fmtMoney(p.eligible_fee)} />
                      </div>
                      {s?.possible_duplicate && <div className="warn">Possible duplicate: {s.duplicate_reason}</div>}
                      <div className="controls">
                        <Field label="Agreement Signed"><input className="fc" type="date" value={toDateInput(p.agreement_signed_at)} onChange={e => patch(p.id, { agreement_signed_at: fromDateInput(e.target.value) })} /></Field>
                        <Field label="Payment Received"><input className="fc" type="date" value={toDateInput(p.client_payment_received_at)} onChange={e => patch(p.id, { client_payment_received_at: fromDateInput(e.target.value) })} /></Field>
                        <Field label="Payment Cleared"><input className="fc" type="date" value={toDateInput(p.client_payment_cleared_at)} onChange={e => patch(p.id, { client_payment_cleared_at: fromDateInput(e.target.value) })} /></Field>
                        <Field label="Paid At"><input className="fc" type="date" value={toDateInput(p.paid_at)} onChange={e => patch(p.id, { paid_at: fromDateInput(e.target.value) })} /></Field>
                        <Field label="Eligibility">
                          <select className="fc" value={p.eligibility_status} onChange={e => patch(p.id, { eligibility_status: e.target.value })}>{ELIGIBILITY.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select>
                        </Field>
                        <Field label="Payment Status">
                          <select className="fc" value={p.payment_status} onChange={e => patch(p.id, { payment_status: e.target.value })}>{PAYMENTS.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}</select>
                        </Field>
                      </div>
                      <Field label="Notes"><textarea className="fc" rows={3} defaultValue={p.notes || ''} onBlur={e => patch(p.id, { notes: e.target.value })} /></Field>
                      {saving === p.id && <div className="saving">Saving...</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style jsx global>{`
        .page-shell{padding:clamp(24px,3vw,40px);max-width:1100px}
        .page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:24px}
        .page-title{font-family:Georgia,serif;font-size:26px;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:18px}
        .summary-card{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
        .summary-card span{display:block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;margin-bottom:8px}
        .summary-card strong{font-family:Georgia,serif;font-size:24px;color:#1b2a4a}
        .list{display:flex;flex-direction:column;gap:12px}
        .card{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.04)}
        .card-top{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:16px 20px;cursor:pointer;flex-wrap:wrap}
        .name{font-weight:800;color:#1b2a4a;font-size:15px}
        .sub{font-size:13px;color:#6b6b67;margin-top:3px}
        .meta{font-size:12px;color:#a86d1a;margin-top:3px;font-weight:700}
        .right{display:flex;gap:10px;align-items:center}
        .amount{font-family:Georgia,serif;font-weight:800;color:#1b2a4a;font-size:20px}
        .pill{border-radius:999px;padding:4px 10px;font-size:11px;font-weight:800;text-transform:capitalize;background:#f7f4ef;color:#6b6b67}
        .pill.payable,.pill.paid{background:#e1f5ee;color:#2d7a4f}
        .pill.not_payable{background:#fef3dc;color:#a86d1a}
        .pill.cancelled,.pill.reversed{background:#fcebeb;color:#a32d2d}
        .chev{font-size:10px;color:#a8a8a4}
        .detail{border-top:1px solid #f0ede6;padding:18px 20px 22px}
        .detail-grid,.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px 18px;margin-bottom:16px}
        .info-label,.fg label{font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#a8a8a4;margin-bottom:3px}
        .info-value{font-size:13px;color:#1b2a4a;font-weight:600}
        .warn{background:#fff5e0;border:1px solid #f5d38a;color:#a86d1a;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:14px}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;width:100%;background:#fafaf8}
        .fg{display:flex;flex-direction:column;gap:4px}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;color:#1b2a4a}
        .empty-msg{background:#fff;border:1px solid #e4e1d8;border-radius:14px;padding:48px;text-align:center;color:#a8a8a4}
        .saving{font-size:12px;color:#a8a8a4;margin-top:8px}
      `}</style>
    </>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="info-label">{label}</div><div className="info-value">{value}</div></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="fg"><label>{label}</label>{children}</div>
}
