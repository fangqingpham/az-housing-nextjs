'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const err = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    router.push(redirect)
  }

  return (
    <div className="auth-wrap">
      <h2>Welcome Back</h2>
      <p className="auth-sub">Sign in to your A - Z Housing account.</p>

      {error && <div className="auth-err">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="fg">
          <label>Email address</label>
          <input
            className="fc"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="fg">
          <label>Password</label>
          <input
            className="fc"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="auth-sw">
        Don't have an account? <Link href="/auth/register">Create one free</Link>
      </div>
    </div>
  )
}
