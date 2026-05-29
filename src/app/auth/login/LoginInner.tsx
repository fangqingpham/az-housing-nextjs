'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'

export default function LoginInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const { t, lang } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const a = t.auth

  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError(a.enterEmailPassword)
      return
    }

    setLoading(true)
    setError('')

    const err = await signIn(email, password)

    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    router.push(redirect)
  }

  return (
    <div className="auth-wrap">
      <h2>{a.welcomeBack}</h2>
      <p className="auth-sub">{a.signInSub}</p>

      {error && <div className="auth-err">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="fg">
          <label>{a.emailAddress}</label>
          <input
            className="fc"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="fg">
          <label>{a.password}</label>
          <input
            className="fc"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? a.signingIn : a.signIn}
        </button>
      </form>

      <div className="auth-sw">
        {a.noAccount} <Link href="/auth/register">{a.createOneFree}</Link>
      </div>
    </div>
  )
}
