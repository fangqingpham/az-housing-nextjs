'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type TxType = 'income' | 'expense'
type TxCategory = 'commission' | 'placement fee' | 'management fee' | 'referral' | 'marketing' | 'operations' | 'other'

type Transaction = {
  id: string
  created_at: string
  date: string
  description: string
  amount: number
  type: TxType
  category: TxCategory
  notes: string | null
  client_name: string | null
  property_address: string | null
}

const CATEGORIES: TxCategory[] = ['commission', 'placement fee', 'management fee', 'referral', 'marketing', 'operations', 'other']

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const emptyTx = (): Omit<Transaction, 'id' | 'created_at'> => ({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  type: 'income',
  category: 'commission',
  notes: '',
  client_name: '',
  property_address: '',
})

export default function AdminFinancesPage() {
  const { message, visible, showToast } = useToast()
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; isNew: boolean; tx?: Transaction }>({ open: false, isNew: true })
  const [form, setForm] = useState<Omit<Transaction, 'id' | 'created_at'>>(emptyTx())
  const [saving, setSaving] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'' | TxType>('')
  const [catFilter, setCatFilter] = useState<'' | TxCategory>('')
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    setTxs(data || [])
    setLoading(false)
  }

  const save = async () => {
    if (!form.description.trim() || !form.amount) { showToast('Description and amount required.'); return }
    setSaving(true)
    const supabase = createClient()
    if (modal.isNew) {
      const { error } = await supabase.from('transactions').insert([{ ...form, amount: Number(form.amount) }])
      if (error) { showToast('Failed to save.'); setSaving(false); return }
      showToast('Transaction added ✓')
    } else {
      const { error } = await supabase.from('transactions').update({ ...form, amount: Number(form.amount) }).eq('id', modal.tx!.id)
      if (error) { showToast('Failed to update.'); setSaving(false); return }
      showToast('Transaction updated ✓')
    }
    setModal({ open: false, isNew: true })
    await load()
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
    showToast('Transaction deleted.')
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const years = Array.from(new Set(txs.map(t => t.date?.slice(0, 4)).filter(Boolean))).sort().reverse()
  if (!years.includes(yearFilter) && years.length) setYearFilter(years[0])

  const filtered = txs.filter(t => {
    if (yearFilter && t.date?.slice(0, 4) !== yearFilter) return false
    if (typeFilter && t.type !== typeFilter) return false
    if (catFilter && t.category !== catFilter) return false
    return true
  })

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalExpense

  // Monthly breakdown for mini chart
  const monthlyData = MONTH_NAMES.map((_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const monthTxs = txs.filter(t => t.date?.slice(0, 4) === yearFilter && t.date?.slice(5, 7) === month)
    return {
      label: MONTH_NAMES[i],
      income: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
  const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1)

  return (
    <>
      <Toast message={message} visible={visible} />

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, isNew: true })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal({ open: false, isNew: true })}>✕</button>
            <h3 className="modal-title">{modal.isNew ? 'New Transaction' : 'Edit Transaction'}</h3>
            <div className="fr">
              <div className="fg"><label>Type</label>
                <select className="fc" value={form.type} onChange={f('type')}>
                  <option value="income">Income</option><option value="expense">Expense</option>
                </select>
              </div>
              <div className="fg"><label>Category</label>
                <select className="fc" value={form.category} onChange={f('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label>Description *</label><input className="fc" value={form.description} onChange={f('description')} /></div>
            <div className="fr">
              <div className="fg"><label>Amount ($) *</label><input className="fc" type="number" step="0.01" value={form.amount || ''} onChange={f('amount')} /></div>
              <div className="fg"><label>Date</label><input className="fc" type="date" value={form.date} onChange={f('date')} /></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Client Name</label><input className="fc" value={form.client_name || ''} onChange={f('client_name')} /></div>
              <div className="fg"><label>Property</label><input className="fc" value={form.property_address || ''} onChange={f('property_address')} /></div>
            </div>
            <div className="fg"><label>Notes</label><textarea className="fc" rows={2} value={form.notes || ''} onChange={f('notes')} /></div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : modal.isNew ? 'Add Transaction' : 'Save Changes'}</button>
              <button className="btn" onClick={() => setModal({ open: false, isNew: true })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Finances</h1>
            <p className="page-sub">Income, expenses, and net revenue</p>
          </div>
          <button className="btn-accent-pill" onClick={() => { setForm(emptyTx()); setModal({ open: true, isNew: true }) }}>+ Add Transaction</button>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Total Income</div>
            <div className="summary-val" style={{ color: '#2d7a4f' }}>${totalIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-val" style={{ color: '#a32d2d' }}>${totalExpense.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="summary-card summary-card--net">
            <div className="summary-label">Net Revenue</div>
            <div className="summary-val" style={{ color: net >= 0 ? '#2d7a4f' : '#a32d2d' }}>
              {net >= 0 ? '' : '-'}${Math.abs(net).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="chart-wrap">
          <div className="chart-header">
            <span className="chart-title">Monthly Overview</span>
            <select className="fc" style={{ maxWidth: 100, marginBottom: 0 }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              {(years.length ? years : [String(new Date().getFullYear())]).map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="chart-bars">
            {monthlyData.map(m => (
              <div key={m.label} className="chart-col">
                <div className="bar-pair">
                  <div className="bar bar-income" style={{ height: `${(m.income / maxMonthly) * 100}%` }} title={`Income: $${m.income.toLocaleString('en-CA')}`} />
                  <div className="bar bar-expense" style={{ height: `${(m.expense / maxMonthly) * 100}%` }} title={`Expense: $${m.expense.toLocaleString('en-CA')}`} />
                </div>
                <div className="bar-label">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: '#2d7a4f' }} /> Income
            <span className="legend-dot" style={{ background: '#a32d2d', marginLeft: 12 }} /> Expense
          </div>
        </div>

        {/* Filters + Table */}
        <div className="filter-bar">
          <select className="fc" style={{ maxWidth: 150, marginBottom: 0 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
            <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select className="fc" style={{ maxWidth: 180, marginBottom: 0 }} value={catFilter} onChange={e => setCatFilter(e.target.value as any)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty-msg">Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No transactions yet. Add your first one above.</div>
        ) : (
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Client</th><th>Type</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td className="td-sub td-nowrap">{t.date}</td>
                    <td>
                      <div className="td-name">{t.description}</div>
                      {t.property_address && <div className="td-sub">{t.property_address}</div>}
                    </td>
                    <td><span className="cat-pill">{t.category}</span></td>
                    <td className="td-sub">{t.client_name || '--'}</td>
                    <td>
                      <span className={`type-pill ${t.type === 'income' ? 'pill-income' : 'pill-expense'}`}>
                        {t.type === 'income' ? '▲' : '▼'} {t.type}
                      </span>
                    </td>
                    <td className={`td-amount ${t.type === 'income' ? 'amount-in' : 'amount-out'}`}>
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="action-row">
                        <button className="btn btn-sm" onClick={() => { setForm({ ...t }); setModal({ open: true, isNew: false, tx: t }) }}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(t.id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-shell { padding: clamp(24px,3vw,40px) clamp(20px,3vw,40px); max-width: 1100px; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
        .page-title { font-family:Georgia,serif; font-size:26px; font-weight:600; color:#1b2a4a; margin:0 0 4px; }
        .page-sub { font-size:13px; color:#6b6b67; margin:0; }
        .btn-accent-pill { background:#f5a623; color:#1e2a45; border:none; border-radius:999px; padding:10px 22px; font-weight:700; font-size:13px; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; white-space:nowrap; box-shadow:0 4px 14px rgba(245,166,35,0.28); transition:background 0.18s,transform 0.18s; }
        .btn-accent-pill:hover { background:#d4891a; transform:translateY(-1px); }
        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .summary-card { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; padding:22px 20px; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
        .summary-card--net { border-color: rgba(245,166,35,0.25); }
        .summary-label { font-size:11.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#a8a8a4; margin-bottom:8px; }
        .summary-val { font-family:Georgia,serif; font-size:28px; font-weight:700; }
        .chart-wrap { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; padding:20px 22px; margin-bottom:24px; }
        .chart-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .chart-title { font-size:14px; font-weight:700; color:#1b2a4a; }
        .chart-bars { display:flex; gap:6px; align-items:flex-end; height:100px; }
        .chart-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .bar-pair { display:flex; gap:2px; align-items:flex-end; width:100%; height:80px; }
        .bar { flex:1; border-radius:3px 3px 0 0; min-height:2px; transition:height 0.3s; }
        .bar-income { background:#2d7a4f; opacity:0.8; }
        .bar-expense { background:#a32d2d; opacity:0.7; }
        .bar-label { font-size:9.5px; color:#a8a8a4; font-weight:600; text-transform:uppercase; }
        .chart-legend { display:flex; align-items:center; font-size:12px; color:#6b6b67; margin-top:10px; }
        .legend-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:5px; }
        .filter-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .empty-msg { text-align:center; color:#a8a8a4; padding:48px; background:#fff; border-radius:12px; border:1px solid #e4e1d8; }
        .table-wrap { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; overflow:auto; }
        .crm-table { width:100%; border-collapse:collapse; font-size:13.5px; }
        .crm-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#a8a8a4; border-bottom:1px solid #e4e1d8; background:#fafaf8; white-space:nowrap; }
        .crm-table td { padding:11px 14px; border-bottom:1px solid #f0ede6; vertical-align:middle; }
        .crm-table tbody tr:last-child td { border-bottom:none; }
        .crm-table tbody tr:hover td { background:#fafaf8; }
        .td-name { font-weight:600; color:#1b2a4a; }
        .td-sub { font-size:12px; color:#a8a8a4; }
        .td-nowrap { white-space:nowrap; }
        .td-amount { font-weight:700; font-family:Georgia,serif; white-space:nowrap; }
        .amount-in { color:#2d7a4f; }
        .amount-out { color:#a32d2d; }
        .cat-pill { display:inline-block; background:#f7f4ef; color:#6b6b67; border:1px solid #e4e1d8; border-radius:999px; padding:2px 9px; font-size:11px; font-weight:600; text-transform:capitalize; white-space:nowrap; }
        .type-pill { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; white-space:nowrap; }
        .pill-income { background:#e1f5ee; color:#2d7a4f; }
        .pill-expense { background:#fcebeb; color:#a32d2d; }
        .action-row { display:flex; gap:5px; }
        .btn { background:#fff; border:1px solid #e4e1d8; border-radius:7px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.15s; color:#1b2a4a; }
        .btn:hover { background:#f7f4ef; }
        .btn-sm { padding:5px 10px; font-size:11.5px; }
        .btn-primary { background:#f5a623; color:#1e2a45; border-color:#f5a623; }
        .btn-primary:hover { background:#d4891a; border-color:#d4891a; }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-danger { background:#fcebeb !important; color:#a32d2d !important; border-color:#e8a5a5 !important; }
        .btn-danger:hover { background:#f8d5d5 !important; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
        .modal-box { background:#fff; border-radius:18px; padding:32px 28px; max-width:560px; width:100%; max-height:90vh; overflow-y:auto; position:relative; }
        .modal-close { position:absolute; top:14px; right:16px; background:none; border:none; font-size:18px; cursor:pointer; color:#a8a8a4; }
        .modal-close:hover { color:#1b2a4a; }
        .modal-title { font-family:Georgia,serif; font-size:22px; font-weight:600; color:#1b2a4a; margin:0 0 20px; }
        .modal-actions { display:flex; gap:8px; margin-top:12px; }
        .fg { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
        .fg label { font-size:11px; font-weight:700; letter-spacing:0.5px; color:#6b6b67; text-transform:uppercase; }
        .fr { display:flex; gap:12px; }
        .fr .fg { flex:1; }
        .fc { border:1px solid #e4e1d8; border-radius:8px; padding:9px 12px; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color 0.18s; background:#fafaf8; }
        .fc:focus { border-color:#f5a623; }
        @media (max-width: 640px) {
          .summary-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
