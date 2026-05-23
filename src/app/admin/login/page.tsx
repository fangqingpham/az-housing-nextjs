'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError(authError?.message || 'Invalid credentials.')
      setLoading(false)
      return
    }

    // Verify admin role in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. Admin role required.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <>
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <span style={{ fontSize: 32 }}>🏠</span>
            <div>
              <p className="login-brand-name">A–Z Housing</p>
              <p className="login-brand-sub">CRM Admin Portal</p>
            </div>
          </div>

          <h1 className="login-title">Sign in to your account</h1>
          <p className="login-sub">Enter your admin credentials to access the dashboard.</p>

          {error && (
            <div className="login-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="lf-group">
              <label>Email address</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@azhouse.ca"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="lf-group">
              <label>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="login-back">
            <a href="/">← Back to public site</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          background: #0c1525;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(245,166,35,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(30,42,69,0.8) 0%, transparent 50%);
        }
        .login-card {
          background: #111e31;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 44px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .login-brand-name {
          font-family: Georgia, serif;
          font-size: 16px;
          font-weight: 700;
          color: #f5a623;
          margin: 0;
          line-height: 1.3;
        }
        .login-brand-sub {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          margin: 0;
        }
        .login-title {
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px;
        }
        .login-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.38);
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(163,45,45,0.15);
          border: 1px solid rgba(163,45,45,0.35);
          color: #fc8181;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .lf-group { display: flex; flex-direction: column; gap: 6px; }
        .lf-group label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }
        .lf-group input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          padding: 11px 14px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s;
          font-family: inherit;
        }
        .lf-group input::placeholder { color: rgba(255,255,255,0.18); }
        .lf-group input:focus { border-color: rgba(245,166,35,0.55); }
        .login-btn {
          margin-top: 4px;
          background: #f5a623;
          color: #1e2a45;
          border: none;
          border-radius: 999px;
          padding: 13px;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 18px rgba(245,166,35,0.3);
          font-family: inherit;
        }
        .login-btn:hover:not(:disabled) {
          background: #d4891a;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(245,166,35,0.4);
        }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-back {
          text-align: center;
          margin-top: 20px;
          font-size: 12.5px;
        }
        .login-back a {
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-back a:hover { color: rgba(255,255,255,0.55); }
      `}</style>
    </>
  )
}
