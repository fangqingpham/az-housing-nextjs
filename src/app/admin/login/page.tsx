'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setLoading(false)
      setError('Invalid email or password.')
      return
    }

    // Check admin role
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); setError('Login failed. Please try again.'); return }

    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userRow?.role !== 'admin') {
      await supabase.auth.signOut()
      setLoading(false)
      setError('Access denied. Admin accounts only.')
      return
    }

    router.replace('/admin/overview')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c1525',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#1b2a4a', margin: '0 0 6px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#6b6b67', fontSize: 13, margin: 0 }}>
            A-Z Housing CRM
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fce4ec',
            color: '#a32d2d',
            border: '1px solid #f5c6cb',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', letterSpacing: 1, textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              style={{
                border: '1.5px solid #e4e1d8',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.18s',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#1b2a4a', letterSpacing: 1, textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                border: '1.5px solid #e4e1d8',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.18s',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? '#a8a8a4' : '#f5a623',
              color: '#1e2a45',
              border: 'none',
              borderRadius: 999,
              padding: '14px 24px',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(245,166,35,0.35)',
              transition: 'background 0.18s, transform 0.18s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
