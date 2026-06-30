'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

const BACKGROUNDS = [
  'Realtor / real estate agent',
  'Mortgage agent',
  'Paralegal / legal professional',
  'Contractor / home service provider',
  'Community member',
  'Existing client',
  'Other',
] as const

const SERVICES = [
  'Basic Tenant Placement',
  'Property Management — 6 Months',
  'Property Management — 1 Year',
  'Tenant Placement + Property Management',
  'Not sure',
] as const

type SignupForm = {
  fullName: string; phone: string; email: string; etransferEmail: string
  city: string; province: string; partnerBackground: string; website: string
  termsAccepted: boolean; limitsAccepted: boolean; payoutAccepted: boolean
}

type ReferralForm = {
  referralId: string; partnerEmail: string; landlordName: string; landlordPhone: string
  landlordEmail: string; propertyAddress: string; city: string; serviceInterest: string
  notes: string; website: string; consentConfirmed: boolean; partnerRuleConfirmed: boolean
}

const initialSignup: SignupForm = {
  fullName: '', phone: '', email: '', etransferEmail: '', city: '', province: 'ON',
  partnerBackground: '', website: '', termsAccepted: false, limitsAccepted: false, payoutAccepted: false,
}

const initialReferral: ReferralForm = {
  referralId: '', partnerEmail: '', landlordName: '', landlordPhone: '', landlordEmail: '',
  propertyAddress: '', city: '', serviceInterest: '', notes: '', website: '',
  consentConfirmed: false, partnerRuleConfirmed: false,
}

export default function ReferralProgramPage() {
  const { t } = useLanguage()
  const r = t.referralProgram
  const [open, setOpen] = useState<'signup' | 'referral'>('signup')
  const [signup, setSignup] = useState<SignupForm>(initialSignup)
  const [referral, setReferral] = useState<ReferralForm>(initialReferral)
  const [signupState, setSignupState] = useState({ loading: false, done: false, error: '' })
  const [referralState, setReferralState] = useState({ loading: false, done: false, error: '', reference: '' })

  const setSignupField = (key: keyof SignupForm, value: string | boolean) => setSignup(prev => ({ ...prev, [key]: value }))
  const setReferralField = (key: keyof ReferralForm, value: string | boolean) => setReferral(prev => ({ ...prev, [key]: value }))

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault()
    setSignupState({ loading: true, done: false, error: '' })
    try {
      const res = await fetch('/api/referral-partners/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || r.genericError)
      setSignup(initialSignup)
      setSignupState({ loading: false, done: true, error: '' })
    } catch (err) {
      setSignupState({ loading: false, done: false, error: err instanceof Error ? err.message : r.genericError })
    }
  }

  async function submitReferral(e: React.FormEvent) {
    e.preventDefault()
    setReferralState({ loading: true, done: false, error: '', reference: '' })
    try {
      const res = await fetch('/api/referrals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referral),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || r.genericError)
      setReferral(initialReferral)
      setReferralState({ loading: false, done: true, error: '', reference: json.reference || '' })
    } catch (err) {
      setReferralState({ loading: false, done: false, error: err instanceof Error ? err.message : r.genericError, reference: '' })
    }
  }

  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid rgba(12,21,37,0.08)', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', overflow: 'hidden' }
  const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e4e1d8', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fafaf8', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: 6 }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <section style={{ background: 'linear-gradient(135deg, var(--dark), #1a2a4a)', color: '#fff', padding: 'clamp(64px,9vw,110px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(196,162,90,0.18)', border: '1px solid rgba(196,162,90,0.35)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 20, padding: '5px 16px', marginBottom: 24 }}>
            A-Z Housing Solutions
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.3rem)', lineHeight: 1.15, marginBottom: 16 }}>{r.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.08rem', lineHeight: 1.7, margin: '0 auto', maxWidth: 720 }}>{r.subtitle}</p>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(44px,6vw,76px) 24px', display: 'grid', gap: 18 }}>
        <div style={cardStyle}>
          <button onClick={() => setOpen(open === 'signup' ? 'referral' : 'signup')} style={{ width: '100%', background: '#fff', border: 'none', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: 16, cursor: 'pointer', color: 'var(--dark)', fontWeight: 800, fontSize: 18, fontFamily: 'var(--serif)', textAlign: 'left' }}>
            <span>1. {r.signupTitle}</span><span>{open === 'signup' ? '▲' : '▼'}</span>
          </button>
          {open === 'signup' && (
            <div style={{ padding: '0 24px 26px' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--dark)', margin: '10px 0 12px' }}>{r.howItWorks}</h2>
              <ol style={{ color: 'var(--mid)', lineHeight: 1.8, marginBottom: 24, paddingLeft: 22 }}>{r.steps.map((s: string) => <li key={s}>{s}</li>)}</ol>
              <div style={{ overflowX: 'auto', marginBottom: 26 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#fafaf8', borderRadius: 10, overflow: 'hidden' }}>
                  <tbody>{r.fees.map((f: { service: string; fee: string }) => (
                    <tr key={f.service}>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #e4e1d8', color: 'var(--dark)', fontWeight: 700 }}>{f.service}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #e4e1d8', color: 'var(--accent)', fontWeight: 800, textAlign: 'right' }}>{f.fee}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {signupState.done && <div style={{ background: '#e1f5ee', color: '#2d7a4f', border: '1px solid #9fe1cb', borderRadius: 10, padding: 14, marginBottom: 16, fontWeight: 700 }}>{r.signupSuccess}</div>}
              {signupState.error && <div style={{ background: '#fcebeb', color: '#a32d2d', border: '1px solid #e8a5a5', borderRadius: 10, padding: 14, marginBottom: 16 }}>{signupState.error}</div>}
              <form onSubmit={submitSignup} style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'none' }}><input value={signup.website} onChange={e => setSignupField('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                  <Field label={r.fullName} labelStyle={labelStyle}><input required style={inputStyle} value={signup.fullName} onChange={e => setSignupField('fullName', e.target.value)} /></Field>
                  <Field label={r.phone} labelStyle={labelStyle}><input required style={inputStyle} value={signup.phone} onChange={e => setSignupField('phone', e.target.value)} /></Field>
                  <Field label={r.email} labelStyle={labelStyle}><input required type="email" style={inputStyle} value={signup.email} onChange={e => setSignupField('email', e.target.value)} /></Field>
                  <Field label={r.etransferEmail} labelStyle={labelStyle}><input required type="email" style={inputStyle} value={signup.etransferEmail} onChange={e => setSignupField('etransferEmail', e.target.value)} /></Field>
                  <Field label={r.city} labelStyle={labelStyle}><input required style={inputStyle} value={signup.city} onChange={e => setSignupField('city', e.target.value)} /></Field>
                  <Field label={r.province} labelStyle={labelStyle}><input required style={inputStyle} value={signup.province} onChange={e => setSignupField('province', e.target.value)} /></Field>
                  <Field label={r.background} labelStyle={labelStyle}>
                    <select required style={inputStyle} value={signup.partnerBackground} onChange={e => setSignupField('partnerBackground', e.target.value)}>
                      <option value="">{r.select}</option>
                      {BACKGROUNDS.map(b => <option key={b} value={b}>{r.backgroundOptions[b] || b}</option>)}
                    </select>
                  </Field>
                </div>
                <Checkbox checked={signup.termsAccepted} onChange={v => setSignupField('termsAccepted', v)} label={r.terms1} />
                <Checkbox checked={signup.limitsAccepted} onChange={v => setSignupField('limitsAccepted', v)} label={r.terms2} />
                <Checkbox checked={signup.payoutAccepted} onChange={v => setSignupField('payoutAccepted', v)} label={r.terms3} />
                <button disabled={signupState.loading} style={{ background: signupState.loading ? '#9aa3b2' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontWeight: 800, fontSize: 15, cursor: signupState.loading ? 'not-allowed' : 'pointer' }}>{signupState.loading ? r.submitting : r.signupButton}</button>
              </form>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <button onClick={() => setOpen(open === 'referral' ? 'signup' : 'referral')} style={{ width: '100%', background: '#fff', border: 'none', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', gap: 16, cursor: 'pointer', color: 'var(--dark)', fontWeight: 800, fontSize: 18, fontFamily: 'var(--serif)', textAlign: 'left' }}>
            <span>2. {r.referralTitle}</span><span>{open === 'referral' ? '▲' : '▼'}</span>
          </button>
          {open === 'referral' && (
            <div style={{ padding: '0 24px 26px' }}>
              {referralState.done && <div style={{ background: '#e1f5ee', color: '#2d7a4f', border: '1px solid #9fe1cb', borderRadius: 10, padding: 14, margin: '10px 0 16px', fontWeight: 700 }}>{r.referralSuccess}{referralState.reference ? ` ${referralState.reference}` : ''}</div>}
              {referralState.error && <div style={{ background: '#fcebeb', color: '#a32d2d', border: '1px solid #e8a5a5', borderRadius: 10, padding: 14, margin: '10px 0 16px' }}>{referralState.error}</div>}
              <form onSubmit={submitReferral} style={{ display: 'grid', gap: 14, marginTop: 10 }}>
                <div style={{ display: 'none' }}><input value={referral.website} onChange={e => setReferralField('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                  <Field label={r.referralId} labelStyle={labelStyle}><input required style={inputStyle} value={referral.referralId} onChange={e => setReferralField('referralId', e.target.value)} /></Field>
                  <Field label={r.partnerEmail} labelStyle={labelStyle}><input required type="email" style={inputStyle} value={referral.partnerEmail} onChange={e => setReferralField('partnerEmail', e.target.value)} /></Field>
                  <Field label={r.landlordName} labelStyle={labelStyle}><input required style={inputStyle} value={referral.landlordName} onChange={e => setReferralField('landlordName', e.target.value)} /></Field>
                  <Field label={r.landlordPhone} labelStyle={labelStyle}><input required style={inputStyle} value={referral.landlordPhone} onChange={e => setReferralField('landlordPhone', e.target.value)} /></Field>
                  <Field label={r.landlordEmail} labelStyle={labelStyle}><input required type="email" style={inputStyle} value={referral.landlordEmail} onChange={e => setReferralField('landlordEmail', e.target.value)} /></Field>
                  <Field label={r.propertyAddress} labelStyle={labelStyle}><input required style={inputStyle} value={referral.propertyAddress} onChange={e => setReferralField('propertyAddress', e.target.value)} /></Field>
                  <Field label={r.city} labelStyle={labelStyle}><input required style={inputStyle} value={referral.city} onChange={e => setReferralField('city', e.target.value)} /></Field>
                  <Field label={r.serviceInterest} labelStyle={labelStyle}>
                    <select required style={inputStyle} value={referral.serviceInterest} onChange={e => setReferralField('serviceInterest', e.target.value)}>
                      <option value="">{r.select}</option>
                      {SERVICES.map(s => <option key={s} value={s}>{r.serviceOptions[s] || s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label={r.notes} labelStyle={labelStyle}><textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={referral.notes} onChange={e => setReferralField('notes', e.target.value)} /></Field>
                <Checkbox checked={referral.consentConfirmed} onChange={v => setReferralField('consentConfirmed', v)} label={r.referralConsent1} />
                <Checkbox checked={referral.partnerRuleConfirmed} onChange={v => setReferralField('partnerRuleConfirmed', v)} label={r.referralConsent2} />
                <button disabled={referralState.loading} style={{ background: referralState.loading ? '#9aa3b2' : 'var(--dark)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontWeight: 800, fontSize: 15, cursor: referralState.loading ? 'not-allowed' : 'pointer' }}>{referralState.loading ? r.submitting : r.referralButton}</button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ label, labelStyle, children }: { label: string; labelStyle: React.CSSProperties; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--mid)', fontSize: 13.5, lineHeight: 1.6 }}>
      <input required type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 4 }} />
      <span>{label}</span>
    </label>
  )
}
