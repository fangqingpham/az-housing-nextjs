'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientCase = {
  id: string; case_number: string; full_name: string; client_type: string
  phone: string | null; email: string | null; preferred_contact: string | null
  language: string | null; lead_source: string | null; assigned_agent_id: string | null
  status: string; priority: string; property_address: string | null; unit: string | null
  city: string | null; province: string | null; postal_code: string | null
  property_type: string | null; rent_amount: number | null; purchase_price: number | null
  sale_price: number | null; service_type: string | null; start_date: string | null
  end_date: string | null; deadline: string | null; client_needs: string | null
  current_situation: string | null; next_followup_date: string | null
  next_action: string | null; last_contacted_date: string | null
  related_landlord: string | null; related_tenant: string | null
  related_buyer: string | null; related_seller: string | null
  related_realtor: string | null; related_mortgage_agent: string | null
  related_paralegal: string | null; checklist: Record<string, boolean>
  archived: boolean; created_at: string; updated_at: string
}

type CaseNote = { id: string; case_id: string; content: string; created_by: string; created_at: string }
type Agent    = { id: string; fname: string; lname: string; email: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const CLIENT_TYPES   = ['Landlord', 'Tenant', 'Mortgage Client', 'Realtor Client']
const SERVICE_TYPES  = ['Tenant Placement', 'Property Management', 'Mortgage Referral', 'Real Estate Referral']
const STATUSES       = ['New', 'Contacted', 'In Progress', 'Completed', 'Cancelled']
const PRIORITIES     = ['Low', 'Normal', 'High', 'Urgent']
const PROVINCES      = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT']
const PROPERTY_TYPES = ['Detached House','Semi-Detached House','Townhouse','Condo Apartment','Basement Apartment','Room Rental','Commercial','Other']
const LEAD_SOURCES   = ['Website','Referral','Social Media','Kijiji','Walk-in','Phone Inquiry','Email Inquiry','Other']
const CONTACT_PREFS  = ['Phone','Email','Text','WhatsApp']
const LANGUAGES      = ['English','French','Mandarin','Cantonese','Hindi','Punjabi','Tagalog','Tamil','Spanish','Arabic','Other']

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  'New':         { color: '#a86d1a', bg: '#FEF3DC', border: '#f5d38a' },
  'Contacted':   { color: '#1a5ea8', bg: '#E3F2FD', border: '#90caf9' },
  'In Progress': { color: '#6930c3', bg: '#F0E8FD', border: '#c4a6f5' },
  'Completed':   { color: '#2d7a4f', bg: '#E1F5EE', border: '#9fe1cb' },
  'Cancelled':   { color: '#a32d2d', bg: '#FCEBEB', border: '#e8a5a5' },
}
const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  'Low':    { color: '#6b6b67', bg: '#f0ede6' },
  'Normal': { color: '#1a5ea8', bg: '#E3F2FD' },
  'High':   { color: '#a86d1a', bg: '#FEF3DC' },
  'Urgent': { color: '#a32d2d', bg: '#FCEBEB' },
}

// Document checklists
const CHECKLIST_TENANT_PLACEMENT = [
  { key: 'landlord_service_agreement',   label: 'Landlord service agreement' },
  { key: 'landlord_id',                  label: 'Landlord ID' },
  { key: 'property_ownership_proof',     label: 'Property ownership proof' },
  { key: 'tenant_application_form',      label: 'Tenant application form' },
  { key: 'tenant_consent_screening',     label: 'Tenant consent for screening' },
  { key: 'tenant_id',                    label: 'Tenant ID' },
  { key: 'credit_screening_report',      label: 'Credit report / screening report' },
  { key: 'income_employment_proof',      label: 'Income / employment proof' },
  { key: 'reference_check_completed',    label: 'Reference check completed' },
  { key: 'ontario_standard_lease',       label: 'Ontario Standard Lease' },
  { key: 'key_rent_deposit',             label: 'Key deposit / rent deposit' },
  { key: 'move_in_inspection_checklist', label: 'Move-in inspection checklist' },
]
const CHECKLIST_PROPERTY_MANAGEMENT = [
  { key: 'pm_management_agreement',           label: 'Property management agreement' },
  { key: 'pm_landlord_id_verified',           label: 'Landlord ID verified' },
  { key: 'pm_property_ownership_proof',       label: 'Property ownership proof received' },
  { key: 'pm_rent_collection_confirmed',      label: 'Rent collection method confirmed' },
  { key: 'pm_tenant_information_list',        label: 'Tenant information list' },
  { key: 'pm_current_lease',                  label: 'Current lease' },
  { key: 'pm_move_in_inspection',             label: 'Move-in / current inspection record' },
  { key: 'pm_maintenance_auth_confirmed',     label: 'Maintenance authorization limit confirmed' },
  { key: 'pm_landlord_payment_instruction',   label: 'Landlord payment instruction' },
]
const CHECKLIST_GENERAL = [
  { key: 'gen_id_received',       label: 'ID received' },
  { key: 'gen_lease_received',    label: 'Lease received' },
  { key: 'gen_credit_received',   label: 'Credit report received' },
  { key: 'gen_agreement_signed',  label: 'Agreement signed' },
  { key: 'gen_invoice_sent',      label: 'Invoice sent' },
  { key: 'gen_payment_received',  label: 'Payment received' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const fmtMoney = (n: number | null) => n != null ? '$' + Number(n).toLocaleString('en-CA', { minimumFractionDigits: 0 }) : '—'

const emptyCase = (): Partial<ClientCase> => ({
  full_name: '', client_type: '', phone: '', email: '', preferred_contact: '',
  language: '', lead_source: '', status: 'New', priority: 'Normal',
  property_address: '', unit: '', city: '', province: '', postal_code: '',
  property_type: '', service_type: '', client_needs: '', current_situation: '',
  next_action: '', checklist: {},
})

// ─── Pill component ───────────────────────────────────────────────────────────
function Pill({ text, style }: { text: string; style: { color: string; bg: string; border?: string } }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, background: style.bg, color: style.color,
      border: `1px solid ${style.border || style.bg}`, whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  )
}

// ─── Shared FC styles ─────────────────────────────────────────────────────────
const FC: React.CSSProperties = {
  border: '1px solid #e4e1d8', borderRadius: 8, padding: '9px 12px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', color: '#1b2a4a',
}
const LBL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6b6b67', display: 'block', marginBottom: 4,
}
const SEC_HEAD: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
  color: '#f5a623', paddingBottom: 8, borderBottom: '1px solid #f0ede6', marginBottom: 16, marginTop: 24,
}

// ─── CaseForm (create / edit) ─────────────────────────────────────────────────
function CaseForm({
  data, onChange, agents, isAdmin,
}: {
  data: Partial<ClientCase>
  onChange: (key: keyof ClientCase, val: any) => void
  agents: Agent[]
  isAdmin: boolean
}) {
  const f = (key: keyof ClientCase) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onChange(key, e.target.value)
  const Row2 = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>{children}</div>
  )
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label style={LBL}>{label}</label>{children}</div>
  )

  return (
    <div>
      {/* 1. Client Info */}
      <div style={SEC_HEAD}>Client Information</div>
      <Row2>
        <Field label="Full Name *">
          <input style={FC} value={data.full_name || ''} onChange={f('full_name')} placeholder="Full legal name" />
        </Field>
        <Field label="Client Type *">
          <select style={FC} value={data.client_type || ''} onChange={f('client_type')}>
            <option value="">Select…</option>
            {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Phone">
          <input style={FC} value={data.phone || ''} onChange={f('phone')} placeholder="+1 (416) 000-0000" />
        </Field>
        <Field label="Email">
          <input style={FC} type="email" value={data.email || ''} onChange={f('email')} placeholder="client@email.com" />
        </Field>
        <Field label="Preferred Contact">
          <select style={FC} value={data.preferred_contact || ''} onChange={f('preferred_contact')}>
            <option value="">Select…</option>
            {CONTACT_PREFS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Language">
          <select style={FC} value={data.language || ''} onChange={f('language')}>
            <option value="">Select…</option>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Lead Source">
          <select style={FC} value={data.lead_source || ''} onChange={f('lead_source')}>
            <option value="">Select…</option>
            {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </Row2>

      {/* 2. Assignment & Status */}
      <div style={SEC_HEAD}>Assignment & Status</div>
      <Row2>
        {isAdmin && (
          <Field label="Assigned Agent">
            <select style={FC} value={data.assigned_agent_id || ''} onChange={f('assigned_agent_id')}>
              <option value="">— Unassigned —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.fname} {a.lname}</option>)}
            </select>
          </Field>
        )}
        <Field label="Status">
          <select style={FC} value={data.status || 'New'} onChange={f('status')}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select style={FC} value={data.priority || 'Normal'} onChange={f('priority')}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Service Type">
          <select style={FC} value={data.service_type || ''} onChange={f('service_type')}>
            <option value="">Select…</option>
            {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Start Date">
          <input style={FC} type="date" value={data.start_date || ''} onChange={f('start_date')} />
        </Field>
        <Field label="End Date">
          <input style={FC} type="date" value={data.end_date || ''} onChange={f('end_date')} />
        </Field>
        <Field label="Deadline">
          <input style={FC} type="date" value={data.deadline || ''} onChange={f('deadline')} />
        </Field>
        <Field label="Next Follow-up Date">
          <input style={FC} type="date" value={data.next_followup_date || ''} onChange={f('next_followup_date')} />
        </Field>
        <Field label="Last Contacted Date">
          <input style={FC} type="date" value={data.last_contacted_date || ''} onChange={f('last_contacted_date')} />
        </Field>
      </Row2>

      {/* 3. Property */}
      <div style={SEC_HEAD}>Property Details</div>
      <Row2>
        <Field label="Property Address">
          <input style={FC} value={data.property_address || ''} onChange={f('property_address')} placeholder="Street address" />
        </Field>
        <Field label="Unit">
          <input style={FC} value={data.unit || ''} onChange={f('unit')} placeholder="Unit / Suite #" />
        </Field>
        <Field label="City">
          <input style={FC} value={data.city || ''} onChange={f('city')} placeholder="City" />
        </Field>
        <Field label="Province">
          <select style={FC} value={data.province || ''} onChange={f('province')}>
            <option value="">Select…</option>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Postal Code">
          <input style={FC} value={data.postal_code || ''} onChange={f('postal_code')} placeholder="A1A 1A1" />
        </Field>
        <Field label="Property Type">
          <select style={FC} value={data.property_type || ''} onChange={f('property_type')}>
            <option value="">Select…</option>
            {PROPERTY_TYPES.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Rent Amount">
          <input style={FC} type="number" value={data.rent_amount ?? ''} onChange={f('rent_amount')} placeholder="0.00" />
        </Field>
        <Field label="Purchase Price">
          <input style={FC} type="number" value={data.purchase_price ?? ''} onChange={f('purchase_price')} placeholder="0.00" />
        </Field>
        <Field label="Sale Price">
          <input style={FC} type="number" value={data.sale_price ?? ''} onChange={f('sale_price')} placeholder="0.00" />
        </Field>
      </Row2>

      {/* 4. Case Background */}
      <div style={SEC_HEAD}>Case Background</div>
      <div style={{ display: 'grid', gap: 12 }}>
        <Field label="Client Needs">
          <textarea style={{ ...FC, minHeight: 80, resize: 'vertical' } as React.CSSProperties}
            value={data.client_needs || ''} onChange={f('client_needs')} placeholder="What does the client need?" />
        </Field>
        <Field label="Current Situation">
          <textarea style={{ ...FC, minHeight: 80, resize: 'vertical' } as React.CSSProperties}
            value={data.current_situation || ''} onChange={f('current_situation')} placeholder="Describe the current situation…" />
        </Field>
        <Field label="Next Action">
          <input style={FC} value={data.next_action || ''} onChange={f('next_action')} placeholder="e.g. Send lease, Follow up call…" />
        </Field>
      </div>

      {/* 5. Related Parties */}
      <div style={SEC_HEAD}>Related Parties</div>
      <Row2>
        <Field label="Related Landlord"><input style={FC} value={data.related_landlord || ''} onChange={f('related_landlord')} /></Field>
        <Field label="Related Tenant"><input style={FC} value={data.related_tenant || ''} onChange={f('related_tenant')} /></Field>
        <Field label="Related Buyer"><input style={FC} value={data.related_buyer || ''} onChange={f('related_buyer')} /></Field>
        <Field label="Related Seller"><input style={FC} value={data.related_seller || ''} onChange={f('related_seller')} /></Field>
        <Field label="Related Realtor"><input style={FC} value={data.related_realtor || ''} onChange={f('related_realtor')} /></Field>
        <Field label="Related Mortgage Agent"><input style={FC} value={data.related_mortgage_agent || ''} onChange={f('related_mortgage_agent')} /></Field>
        <Field label="Related Paralegal"><input style={FC} value={data.related_paralegal || ''} onChange={f('related_paralegal')} /></Field>
      </Row2>
    </div>
  )
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────
function ChecklistTab({ caseData, onSave }: { caseData: ClientCase; onSave: (checklist: Record<string, boolean>) => void }) {
  const [cl, setCl] = useState<Record<string, boolean>>(caseData.checklist || {})
  const [saving, setSaving] = useState(false)

  const toggle = (key: string) => {
    const next = { ...cl, [key]: !cl[key] }
    setCl(next)
  }

  const save = async () => {
    setSaving(true)
    await onSave(cl)
    setSaving(false)
  }

  const serviceItems =
    caseData.service_type === 'Tenant Placement'   ? CHECKLIST_TENANT_PLACEMENT :
    caseData.service_type === 'Property Management' ? CHECKLIST_PROPERTY_MANAGEMENT : []

  const CheckRow = ({ item }: { item: { key: string; label: string } }) => {
    const checked = !!cl[item.key]
    return (
      <button type="button" onClick={() => toggle(item.key)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        padding: '11px 14px', borderRadius: 10, border: checked ? '1.5px solid #2d7a4f' : '1px solid #e4e1d8',
        background: checked ? '#E1F5EE' : '#fff', cursor: 'pointer', marginBottom: 8,
        transition: 'all 0.15s',
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          background: checked ? '#2d7a4f' : '#fff', border: checked ? '2px solid #2d7a4f' : '2px solid #d0cdc5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 900,
        }}>{checked ? '✓' : ''}</span>
        <span style={{ fontSize: 14, color: checked ? '#2d7a4f' : '#1b2a4a', fontWeight: checked ? 600 : 400 }}>{item.label}</span>
      </button>
    )
  }

  const done = Object.values(cl).filter(Boolean).length
  const total = serviceItems.length + CHECKLIST_GENERAL.length

  return (
    <div>
      {!caseData.service_type || (!serviceItems.length) ? (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#7a6000' }}>
          ℹ️ Set the <strong>Service Type</strong> to Tenant Placement or Property Management to see the full checklist.
        </div>
      ) : null}

      {serviceItems.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#f5a623', marginBottom: 12 }}>
            {caseData.service_type} Documents
          </div>
          {serviceItems.map(item => <CheckRow key={item.key} item={item} />)}
        </>
      )}

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6b6b67', margin: '20px 0 12px' }}>
        General
      </div>
      {CHECKLIST_GENERAL.map(item => <CheckRow key={item.key} item={item} />)}

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontSize: 13, color: '#6b6b67' }}>{done} of {total} items completed</span>
        <button onClick={save} disabled={saving} style={{
          background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px',
          fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        }}>
          {saving ? 'Saving…' : 'Save Checklist'}
        </button>
      </div>
    </div>
  )
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────
function NotesTab({ caseId }: { caseId: string }) {
  const [notes, setNotes] = useState<CaseNote[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadNotes = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/admin/client-cases/${caseId}/notes?caller_role=admin`)
    if (r.ok) { const d = await r.json(); setNotes(d.notes) }
    setLoading(false)
  }, [caseId])

  useEffect(() => { loadNotes() }, [loadNotes])

  const addNote = async () => {
    if (!content.trim()) return
    setSaving(true)
    setError('')
    const r = await fetch(`/api/admin/client-cases/${caseId}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, caller_role: 'admin' }),
    })
    if (r.ok) {
      const d = await r.json()
      setNotes(prev => [d.note, ...prev])
      setContent('')
    } else {
      setError('Failed to save note.')
    }
    setSaving(false)
  }

  return (
    <div>
      {/* Add note */}
      <div style={{ marginBottom: 24 }}>
        <label style={LBL}>Add a Note</label>
        <textarea
          style={{ ...FC, minHeight: 90, resize: 'vertical' } as React.CSSProperties}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a note about this case…"
        />
        {error && <p style={{ color: '#a32d2d', fontSize: 12, margin: '4px 0 0' }}>{error}</p>}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={addNote} disabled={!content.trim() || saving} style={{
            background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px',
            fontSize: 13, fontWeight: 700, cursor: !content.trim() || saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: !content.trim() || saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving…' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#a8a8a4', padding: 32 }}>Loading notes…</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#a8a8a4', padding: 32, background: '#f7f4ef', borderRadius: 12 }}>
          No notes yet. Add the first one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map(note => (
            <div key={note.id} style={{ background: '#fff', border: '1px solid #e4e1d8', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#1b2a4a', lineHeight: 1.65 }}>{note.content}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b6b67' }}>{note.created_by}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d0cdc5', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#a8a8a4' }}>
                  {new Date(note.created_at).toLocaleString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Case Detail Modal ────────────────────────────────────────────────────────
function CaseModal({
  caseData, agents, isAdmin,
  onClose, onUpdate,
}: {
  caseData: ClientCase
  agents: Agent[]
  isAdmin: boolean
  onClose: () => void
  onUpdate: (updated: ClientCase) => void
}) {
  const [tab, setTab]       = useState<'details' | 'checklist' | 'notes'>('details')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm]     = useState<Partial<ClientCase>>(caseData)
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const handleChange = (key: keyof ClientCase, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const saveDetails = async () => {
    setSaving(true)
    const r = await fetch(`/api/admin/client-cases/${caseData.id}?caller_role=admin`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) {
      const d = await r.json()
      onUpdate(d.case)
      setForm(d.case)
      setEditMode(false)
      showToast('Case saved ✓')
    } else {
      showToast('Failed to save.')
    }
    setSaving(false)
  }

  const saveChecklist = async (checklist: Record<string, boolean>) => {
    const r = await fetch(`/api/admin/client-cases/${caseData.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist, caller_role: 'admin' }),
    })
    if (r.ok) {
      const d = await r.json()
      onUpdate(d.case)
      showToast('Checklist saved ✓')
    } else {
      showToast('Failed to save checklist.')
    }
  }

  const agentName = (id: string | null) => {
    if (!id) return '— Unassigned —'
    const a = agents.find(x => x.id === id)
    return a ? `${a.fname} ${a.lname}` : id
  }

  const ss = STATUS_STYLE[caseData.status]   || STATUS_STYLE['New']
  const ps = PRIORITY_STYLE[caseData.priority] || PRIORITY_STYLE['Normal']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px',
      overflowY: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#f7f4ef', borderRadius: 20, width: '100%', maxWidth: 820,
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)', overflow: 'hidden',
        marginTop: 20, marginBottom: 20,
      }}>
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1b2a4a', color: '#fff', padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 300 }}>
            {toast}
          </div>
        )}

        {/* Modal header */}
        <div style={{ background: 'linear-gradient(135deg, #0c1525, #1a2a4a)', padding: '22px 28px', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#f5a623', background: 'rgba(245,166,35,0.15)', padding: '2px 8px', borderRadius: 4 }}>
                  {caseData.case_number}
                </span>
                <Pill text={caseData.status} style={ss} />
                <Pill text={caseData.priority} style={ps} />
                {caseData.archived && <Pill text="Archived" style={{ color: '#6b6b67', bg: '#e4e1d8' }} />}
              </div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.1rem,2.5vw,1.5rem)', margin: '0 0 4px', lineHeight: 1.2 }}>
                {caseData.full_name}
              </h2>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>{caseData.client_type}</span>
                {caseData.service_type && <><span>·</span><span>{caseData.service_type}</span></>}
                {caseData.city && <><span>·</span><span>{caseData.city}</span></>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 34, height: 34, fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 16, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            {(['details','checklist','notes'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', padding: '8px 18px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                color: tab === t ? '#f5a623' : 'rgba(255,255,255,0.45)',
                borderBottom: tab === t ? '2px solid #f5a623' : '2px solid transparent',
                marginBottom: -1, textTransform: 'capitalize', letterSpacing: 0.5,
              }}>
                {t === 'details' ? '📋 Details' : t === 'checklist' ? '✅ Checklist' : '📝 Notes'}
              </button>
            ))}
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* ── Details Tab ── */}
          {tab === 'details' && (
            <div>
              {!editMode ? (
                <>
                  {/* Read-only summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: '#6b6b67' }}>
                      Created {fmtDate(caseData.created_at)} · Updated {fmtDate(caseData.updated_at)}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isAdmin && (
                        <button onClick={async () => {
                          const r = await fetch(`/api/admin/client-cases/${caseData.id}`, {
                          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ archived: !caseData.archived, caller_role: 'admin' }),
                          })
                          if (r.ok) { const d = await r.json(); onUpdate(d.case); showToast(d.case.archived ? 'Case archived' : 'Case restored') }
                        }} style={{ background: '#f7f4ef', border: '1px solid #e4e1d8', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#6b6b67' }}>
                          {caseData.archived ? '♻️ Restore' : '📦 Archive'}
                        </button>
                      )}
                      <button onClick={() => { setForm(caseData); setEditMode(true) }} style={{ background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✏️ Edit
                      </button>
                    </div>
                  </div>

                  {/* Read-only fields grid */}
                  {[
                    { heading: 'Client Information', rows: [
                      ['Phone', caseData.phone || '—'], ['Email', caseData.email || '—'],
                      ['Preferred Contact', caseData.preferred_contact || '—'], ['Language', caseData.language || '—'],
                      ['Lead Source', caseData.lead_source || '—'],
                    ]},
                    { heading: 'Assignment & Status', rows: [
                      ['Assigned Agent', agentName(caseData.assigned_agent_id)],
                      ['Service Type', caseData.service_type || '—'],
                      ['Start Date', fmtDate(caseData.start_date)], ['End Date', fmtDate(caseData.end_date)],
                      ['Deadline', fmtDate(caseData.deadline)], ['Next Follow-up', fmtDate(caseData.next_followup_date)],
                      ['Last Contacted', fmtDate(caseData.last_contacted_date)],
                    ]},
                    { heading: 'Property', rows: [
                      ['Address', [caseData.property_address, caseData.unit].filter(Boolean).join(' Unit ') || '—'],
                      ['City / Province', [caseData.city, caseData.province, caseData.postal_code].filter(Boolean).join(', ') || '—'],
                      ['Property Type', caseData.property_type || '—'],
                      ['Rent Amount', fmtMoney(caseData.rent_amount)],
                      ['Purchase Price', fmtMoney(caseData.purchase_price)],
                      ['Sale Price', fmtMoney(caseData.sale_price)],
                    ]},
                  ].map(sec => (
                    <div key={sec.heading} style={{ marginBottom: 20 }}>
                      <div style={{ ...SEC_HEAD, marginTop: 0 }}>{sec.heading}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '10px 24px' }}>
                        {sec.rows.map(([lbl, val]) => (
                          <div key={lbl}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 2 }}>{lbl}</div>
                            <div style={{ fontSize: 13, color: '#1b2a4a', fontWeight: 500 }}>{val as string}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(caseData.client_needs || caseData.current_situation || caseData.next_action) && (
                    <div>
                      <div style={SEC_HEAD}>Case Background</div>
                      {caseData.client_needs && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 4 }}>Client Needs</div><p style={{ margin: 0, fontSize: 13, color: '#1b2a4a', lineHeight: 1.65 }}>{caseData.client_needs}</p></div>}
                      {caseData.current_situation && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 4 }}>Current Situation</div><p style={{ margin: 0, fontSize: 13, color: '#1b2a4a', lineHeight: 1.65 }}>{caseData.current_situation}</p></div>}
                      {caseData.next_action && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 4 }}>Next Action</div><p style={{ margin: 0, fontSize: 13, color: '#1b2a4a', fontWeight: 600 }}>{caseData.next_action}</p></div>}
                    </div>
                  )}

                  {[caseData.related_landlord, caseData.related_tenant, caseData.related_buyer, caseData.related_seller, caseData.related_realtor, caseData.related_mortgage_agent, caseData.related_paralegal].some(Boolean) && (
                    <div>
                      <div style={SEC_HEAD}>Related Parties</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '10px 24px' }}>
                        {[
                          ['Landlord', caseData.related_landlord], ['Tenant', caseData.related_tenant],
                          ['Buyer', caseData.related_buyer], ['Seller', caseData.related_seller],
                          ['Realtor', caseData.related_realtor], ['Mortgage Agent', caseData.related_mortgage_agent],
                          ['Paralegal', caseData.related_paralegal],
                        ].filter(([, v]) => v).map(([lbl, val]) => (
                          <div key={lbl as string}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a8a8a4', marginBottom: 2 }}>{lbl}</div>
                            <div style={{ fontSize: 13, color: '#1b2a4a' }}>{val as string}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Edit mode */
                <>
                  <CaseForm data={form} onChange={handleChange} agents={agents} isAdmin={isAdmin} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditMode(false)} style={{ background: '#f7f4ef', border: '1px solid #e4e1d8', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#1b2a4a' }}>
                      Cancel
                    </button>
                    <button onClick={saveDetails} disabled={saving} style={{ background: '#1b2a4a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 26px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Checklist Tab ── */}
          {tab === 'checklist' && (
            <ChecklistTab caseData={caseData} onSave={saveChecklist} />
          )}

          {/* ── Notes Tab ── */}
          {tab === 'notes' && <NotesTab caseId={caseData.id} />}
        </div>
      </div>
    </div>
  )
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ agents, isAdmin, onClose, onCreate }: {
  agents: Agent[]
  isAdmin: boolean
  onClose: () => void
  onCreate: (c: ClientCase) => void
}) {
  const [form, setForm] = useState<Partial<ClientCase>>(emptyCase())
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = (key: keyof ClientCase, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const submit = async () => {
    if (!form.full_name?.trim()) { setError('Full Name is required.'); return }
    if (!form.client_type) { setError('Client Type is required.'); return }
    setSaving(true); setError('')
    const r = await fetch('/api/admin/client-cases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, caller_role: 'admin' }),
    })
    if (r.ok) {
      const d = await r.json()
      onCreate(d.case)
      onClose()
    } else {
      const d = await r.json().catch(() => ({}))
      setError(d.error || 'Failed to create case.')
    }
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f7f4ef', borderRadius: 20, width: '100%', maxWidth: 820, boxShadow: '0 24px 80px rgba(0,0,0,0.28)', overflow: 'hidden', marginTop: 20, marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #0c1525, #1a2a4a)', padding: '22px 28px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.35rem', margin: '0 0 4px' }}>Create New Case</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>A unique case number will be auto-generated.</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 34, height: 34, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <CaseForm data={form} onChange={handleChange} agents={agents} isAdmin={isAdmin} />
          {error && <p style={{ color: '#a32d2d', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ background: '#f7f4ef', border: '1px solid #e4e1d8', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#1b2a4a' }}>Cancel</button>
            <button onClick={submit} disabled={saving} style={{ background: '#f5a623', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 26px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Creating…' : '+ Create Case'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientManagementPage() {
  const [cases, setCases]             = useState<ClientCase[]>([])
  const [agents, setAgents]           = useState<Agent[]>([])
  const [loading, setLoading]         = useState(true)
  const isAdmin                       = true  // this page is admin-only (AdminGuard)
  const [search, setSearch]           = useState('')
  const [filterClient, setFilterClient]   = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAgent, setFilterAgent]     = useState('')
  const [showArchived, setShowArchived]   = useState(false)
  const [selectedCase, setSelectedCase]   = useState<ClientCase | null>(null)
  const [showCreate, setShowCreate]       = useState(false)
  const [toast, setToast]                 = useState('')

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('caller_role', 'admin')
    if (showArchived) params.set('archived', 'true')
    if (filterClient)  params.set('client_type', filterClient)
    if (filterService) params.set('service_type', filterService)
    if (filterStatus)  params.set('status', filterStatus)
    if (filterPriority) params.set('priority', filterPriority)
    if (filterAgent && isAdmin) params.set('agent_id', filterAgent)

    const [casesRes, agentsRes] = await Promise.all([
      fetch(`/api/admin/client-cases?${params}`),
      createClient().from('users').select('id,fname,lname,email').eq('role', 'agent').order('fname'),
    ])

    if (casesRes.ok) {
      const d = await casesRes.json()
      setCases(d.cases || [])
    }
    setAgents(agentsRes.data || [])
    setLoading(false)
  }, [showArchived, filterClient, filterService, filterStatus, filterPriority, filterAgent, isAdmin])

  useEffect(() => { load() }, [load])

  const agentName = (id: string | null) => {
    if (!id) return null
    const a = agents.find(x => x.id === id)
    return a ? `${a.fname} ${a.lname}` : null
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return cases
    const q = search.toLowerCase()
    return cases.filter(c =>
      [c.full_name, c.phone, c.email, c.case_number, c.property_address].some(v => v && v.toLowerCase().includes(q))
    )
  }, [cases, search])

  // Stats
  const stats = useMemo(() => ({
    total:      cases.length,
    new:        cases.filter(c => c.status === 'New').length,
    inProgress: cases.filter(c => c.status === 'In Progress').length,
    urgent:     cases.filter(c => c.priority === 'Urgent').length,
  }), [cases])

  const handleUpdate = (updated: ClientCase) => {
    setCases(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (selectedCase?.id === updated.id) setSelectedCase(updated)
  }

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1b2a4a', color: '#fff', padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 500 }}>
          {toast}
        </div>
      )}

      <div style={{ padding: 'clamp(24px,3vw,40px)', maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 600, color: '#1b2a4a', margin: '0 0 4px' }}>
              Client Management
            </h1>
            <p style={{ fontSize: 13, color: '#6b6b67', margin: 0 }}>
              {stats.total} {showArchived ? 'archived' : 'active'} case{stats.total !== 1 ? 's' : ''}
              {!showArchived && stats.new > 0 && <> · <span style={{ color: '#a86d1a', fontWeight: 700 }}>{stats.new} new</span></>}
              {!showArchived && stats.urgent > 0 && <> · <span style={{ color: '#a32d2d', fontWeight: 700 }}>{stats.urgent} urgent</span></>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowArchived(v => !v)} style={{ background: '#fff', border: '1px solid #e4e1d8', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b6b67', fontFamily: 'inherit' }}>
              {showArchived ? '← Active Cases' : '📦 Archived'}
            </button>
            <button onClick={load} style={{ background: '#fff', border: '1px solid #e4e1d8', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b6b67', fontFamily: 'inherit' }}>↻ Refresh</button>
            <button onClick={() => setShowCreate(true)} style={{ background: '#f5a623', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              + New Case
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {!showArchived && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Cases',  value: stats.total,      icon: '📁', bg: '#f0ede6', color: '#1b2a4a' },
              { label: 'New',          value: stats.new,        icon: '🆕', bg: '#FEF3DC', color: '#a86d1a' },
              { label: 'In Progress',  value: stats.inProgress, icon: '⚡', bg: '#F0E8FD', color: '#6930c3' },
              { label: 'Urgent',       value: stats.urgent,     icon: '🚨', bg: '#FCEBEB', color: '#a32d2d' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(12,21,37,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: s.color, margin: '4px 0 2px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#6b6b67', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <input
            style={{ ...FC, maxWidth: 280, flex: '1 1 200px' }}
            placeholder="Search name, phone, email, case #, address…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select style={{ ...FC, maxWidth: 170, flex: '1 1 140px' }} value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">All client types</option>
            {CLIENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={{ ...FC, maxWidth: 180, flex: '1 1 140px' }} value={filterService} onChange={e => setFilterService(e.target.value)}>
            <option value="">All service types</option>
            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={{ ...FC, maxWidth: 150, flex: '1 1 120px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select style={{ ...FC, maxWidth: 140, flex: '1 1 110px' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          {isAdmin && (
            <select style={{ ...FC, maxWidth: 190, flex: '1 1 140px' }} value={filterAgent} onChange={e => setFilterAgent(e.target.value)}>
              <option value="">All agents</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.fname} {a.lname}</option>)}
            </select>
          )}
        </div>

        {/* Case List */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', background: '#fff', borderRadius: 14 }}>Loading cases…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', background: '#fff', borderRadius: 14 }}>
            {cases.length === 0 ? 'No cases yet. Create your first one!' : 'No cases match your search or filters.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => {
              const ss = STATUS_STYLE[c.status]   || STATUS_STYLE['New']
              const ps = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE['Normal']
              const an = agentName(c.assigned_agent_id)
              return (
                <div key={c.id} onClick={() => setSelectedCase(c)} style={{
                  background: '#fff', border: '1px solid rgba(12,21,37,0.08)', borderRadius: 14,
                  padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s, border-color 0.15s', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,166,35,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(12,21,37,0.08)' }}
                >
                  {/* Left */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '1px 7px', borderRadius: 4 }}>
                        {c.case_number}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1b2a4a' }}>{c.full_name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      <Pill text={c.client_type} style={{ color: '#1a5ea8', bg: '#E3F2FD' }} />
                      {c.service_type && <Pill text={c.service_type} style={{ color: '#2d7a4f', bg: '#E1F5EE' }} />}
                      <Pill text={c.status} style={ss} />
                      <Pill text={c.priority} style={ps} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6b6b67', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {c.phone && <span>📞 {c.phone}</span>}
                      {c.email && <span>✉️ {c.email}</span>}
                      {c.property_address && <span>🏠 {c.property_address}{c.city ? `, ${c.city}` : ''}</span>}
                    </div>
                  </div>
                  {/* Right */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {an && <div style={{ fontSize: 12, fontWeight: 600, color: '#f5a623', marginBottom: 4 }}>👤 {an}</div>}
                    {c.next_followup_date && (
                      <div style={{ fontSize: 11, color: '#6b6b67' }}>Follow-up: {fmtDate(c.next_followup_date)}</div>
                    )}
                    <div style={{ fontSize: 11, color: '#a8a8a4', marginTop: 2 }}>{fmtDate(c.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseModal
          caseData={selectedCase}
          agents={agents}
          isAdmin={isAdmin}
          onClose={() => setSelectedCase(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateModal
          agents={agents}
          isAdmin={isAdmin}
          onClose={() => setShowCreate(false)}
          onCreate={c => { setCases(prev => [c, ...prev]); showToast(`Case ${c.case_number} created ✓`) }}
        />
      )}

      <style jsx global>{`
        input[type=date]:focus, input:focus, select:focus, textarea:focus {
          border-color: #f5a623 !important;
          box-shadow: 0 0 0 2px rgba(245,166,35,0.15);
        }
      `}</style>
    </>
  )
}
