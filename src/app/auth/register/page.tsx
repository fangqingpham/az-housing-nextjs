'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import type { AppUser } from '@/types'

export default function RegisterPage() {
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<AppUser['role']>('buyer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const a = t.auth

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fname || !email || !password) { setError(a.fillAllFields); return }
    if (password !== confirm) { setError(a.passwordsMismatch); return }
    if (password.length < 6) { setError(a.passwordTooShort); return }
    setLoading(true)
    setError('')
    const err = await signUp(email, password, fname, lname, phone, role)
    setLoading(false)
    if (err) { setError(err); return }
    router.push('/dashboard')
  }

  return (
    <div className="auth-wrap">
      <h2>{a.createAccount}</h2>
      <p className="auth-sub">{a.registerSub}</p>

      {error && <div className="auth-err">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="fr">
          <div className="fg">
            <label>{a.firstName} *</label>
            <input className="fc" placeholder="Jane" value={fname} onChange={e => setFname(e.target.value)} required />
          </div>
          <div className="fg">
            <label>{a.lastName}</label>
            <input className="fc" placeholder="Smith" value={lname} onChange={e => setLname(e.target.value)} />
          </div>
        </div>
        <div className="fg">
          <label>{a.email} *</label>
          <input className="fc" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="fg">
          <label>{a.phone}</label>
          <input className="fc" type="tel" placeholder="(416) 555-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="fg">
          <label>{a.iAmA}</label>
          <select className="fc" value={role} onChange={e => setRole(e.target.value as AppUser['role'])}>
            <option value="buyer">{a.buyerRenter}</option>
            <option value="landlord">{a.landlordSeller}</option>
            <option value="agent">{a.realEstateAgent}</option>
          </select>
        </div>
        <div className="fr">
          <div className="fg">
            <label>{a.passwordLabel} *</label>
            <input className="fc" type="password" placeholder={a.passwordMin} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="fg">
            <label>{a.confirmPassword} *</label>
            <input className="fc" type="password" placeholder={a.repeatPassword} value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? a.creatingAccount : a.createAccount}
        </button>
      </form>

      <div className="auth-sw">
        {a.alreadyHaveAccount} <Link href="/auth/login">{a.signInLink}</Link>
      </div>
    </div>
  )
}
