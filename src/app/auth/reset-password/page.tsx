'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supa = useMemo(() => getSupabaseBrowserClient(), [])

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const prepareRecoverySession = async () => {
      setCheckingSession(true)
      setErrorMsg('')
      setReady(false)

      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      try {
        // Recommended Supabase recovery flow for Next.js/SSR apps.
        // This works when your Supabase email template sends:
        // /reset-password?token_hash={{ .TokenHash }}&type=recovery
        if (tokenHash && type === 'recovery') {
          const { error } = await supa.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })

          if (error) {
            setErrorMsg(error.message)
            setReady(false)
            return
          }

          setReady(true)
          return
        }

        // Fallback for default Supabase PKCE links that contain ?code=...
        // This only works when the same browser still has the PKCE verifier.
        if (code) {
          const { error } = await supa.auth.exchangeCodeForSession(code)

          if (error) {
            setErrorMsg(
              'Your reset link opened without the required browser session. Please request a new reset email and open the link in the same browser, or update the Supabase reset email template to use token_hash.'
            )
            setReady(false)
            return
          }

          setReady(true)
          return
        }

        const {
          data: { session },
        } = await supa.auth.getSession()

        if (session) {
          setReady(true)
          return
        }

        setErrorMsg('Password reset session is missing or expired. Please request a new reset email.')
        setReady(false)
      } finally {
        setCheckingSession(false)
      }
    }

    prepareRecoverySession()
  }, [searchParams, supa])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    setErrorMsg('')
    setSuccessMsg('')

    if (!ready) {
      setErrorMsg('Password reset session is missing or expired. Please request a new reset email.')
      return
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in both password fields.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supa.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setSuccessMsg('Your password has been updated successfully. Redirecting to sign in...')

    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--cream, #f6f3ed)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
        <h1
          style={{
            fontSize: 'clamp(38px, 6vw, 60px)',
            lineHeight: 1.05,
            margin: '0 0 20px',
            color: '#1f3763',
            fontWeight: 500,
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            fontSize: 18,
            color: '#666',
            marginBottom: 32,
          }}
        >
          Enter your new password below.
        </p>

        {checkingSession && (
          <div
            style={{
              background: '#eef4ff',
              border: '1px solid #b9c9ea',
              color: '#1f3763',
              padding: '14px 16px',
              borderRadius: 12,
              marginBottom: 18,
              fontSize: 15,
            }}
          >
            Checking reset link...
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: '#fdecec',
              border: '1px solid #f3b4b4',
              color: '#b42318',
              padding: '14px 16px',
              borderRadius: 12,
              marginBottom: 18,
              fontSize: 15,
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#ecfdf3',
              border: '1px solid #a6e0b7',
              color: '#067647',
              padding: '14px 16px',
              borderRadius: 12,
              marginBottom: 18,
              fontSize: 15,
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 10,
                fontSize: 18,
                fontWeight: 600,
                color: '#102a56',
              }}
            >
              New password
            </label>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={!ready || checkingSession}
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '18px 16px',
                borderRadius: 14,
                border: '1px solid #ddd6c9',
                background: '#fff',
                fontSize: 18,
                outline: 'none',
                opacity: ready && !checkingSession ? 1 : 0.6,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 10,
                fontSize: 18,
                fontWeight: 600,
                color: '#102a56',
              }}
            >
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={!ready || checkingSession}
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '18px 16px',
                borderRadius: 14,
                border: '1px solid #ddd6c9',
                background: '#fff',
                fontSize: 18,
                outline: 'none',
                opacity: ready && !checkingSession ? 1 : 0.6,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !ready || checkingSession}
            style={{
              width: '100%',
              background: '#1f3763',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '18px 20px',
              fontSize: 22,
              fontWeight: 600,
              cursor: loading || !ready || checkingSession ? 'not-allowed' : 'pointer',
              marginBottom: 22,
              opacity: loading || !ready || checkingSession ? 0.65 : 1,
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: 0 }}>
          <Link
            href="/auth/login"
            style={{
              color: '#1f3763',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to Sign In
          </Link>	
        </p>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  )
}
