'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fname || !email || !password) { setError('Please fill in all required fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    const err = await signUp(email, password, fname, lname, phone, role)
    setLoading(false)
    if (err) { setError(err); return }
    router.push('/dashboard')
  }

  return (
    <div className="auth-wrap">
      <h2>Create Account</h2>
      <p className="auth-sub">Join thousands of Canadians using A - Z Housing.</p>

      {error && <div className="auth-err">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="fr">
          <div className="fg">
            <label>First Name *</label>
            <input className="fc" placeholder="Jane" value={fname} onChange={e => setFname(e.target.value)} required />
          </div>
          <div className="fg">
            <label>Last Name</label>
            <input className="fc" placeholder="Smith" value={lname} onChange={e => setLname(e.target.value)} />
          </div>
        </div>
        <div className="fg">
          <label>Email *</label>
          <input className="fc" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="fg">
          <label>Phone (optional)</label>
          <input className="fc" type="tel" placeholder="(416) 555-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="fg">
          <label>I am a…</label>
          <select className="fc" value={role} onChange={e => setRole(e.target.value as AppUser['role'])}>
            <option value="buyer">Buyer / Renter</option>
            <option value="landlord">Landlord / Seller</option>
            <option value="agent">Real Estate Agent</option>
          </select>
        </div>
        <div className="fr">
          <div className="fg">
            <label>Password *</label>
            <input className="fc" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="fg">
            <label>Confirm Password *</label>
            <input className="fc" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className="auth-sw">
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </div>
    </div>
  )
}
