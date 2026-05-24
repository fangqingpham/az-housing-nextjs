'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type View = 'login' | 'reset'

export default function AdminLoginPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setLoading(false); setError('Invalid email or password.'); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); setError('Login failed. Please try again.'); return }

    const { data: userRow } = await supabase
      .from('users').select('role').eq('id', session.user.id).single()

    if (userRow?.role === 'admin') {
      router.replace('/admin/overview')
    } else if (userRow?.role === 'agent') {
      router.replace('/agent')
    } else {
      await supabase.auth.signOut()
      setLoading(false)
      setError('Access denied. This portal is for staff only.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true); setError(''); setInfo('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-confirm`,
    })

    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    setInfo('Password reset email sent! Check your inbox.')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c1525', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#1b2a4a', margin: '0 0 6px' }}>
            {view === 'login' ? 'Staff Login' : 'Reset Password'}
          </h1>
          <p style={{ color: '#6b6b67', fontSize: 13, margin: 0 }}>A-Z Housing Portal</p>
        </div>

        {error && (
          <div style={{ background: '#fce4ec', color: '#a32d2d', border: '1px solid #f5c6cb', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {info && (
          <div style={{ background: '#e1f5ee', color: '#2d7a4f', border: '1px solid #9fe1cb', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
            {info}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', letterSpacing: 1, textTransform: 'uppercase' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@azhouse.ca"
                style={{ border: '1.5px solid #e4e1d8', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', letterSpacing: 1, textTransform: 'uppercase' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ border: '1.5px solid #e4e1d8', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 8, background: loading ? '#a8a8a4' : '#f5a623', color: '#1e2a45', border: 'none', borderRadius: 999, padding: '14px 24px', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(245,166,35,0.35)' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button type="button" onClick={() => { setView('reset'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: '#a8a8a4', fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', marginTop: 4 }}>
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', letterSpacing: 1, textTransform: 'uppercase' }}>Your Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@azhouse.ca"
                style={{ border: '1.5px solid #e4e1d8', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <p style={{ fontSize: 13, color: '#6b6b67', margin: 0, lineHeight: 1.6 }}>
              We'll send a password reset link to your email address.
            </p>
            <button type="submit" disabled={loading} style={{ background: loading ? '#a8a8a4' : '#f5a623', color: '#1e2a45', border: 'none', borderRadius: 999, padding: '14px 24px', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(245,166,35,0.35)' }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => { setView('login'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: '#a8a8a4', fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
