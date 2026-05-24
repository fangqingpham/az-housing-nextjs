'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/admin/login')
        return
      }

      // Check role in users table
      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userRow?.role === 'agent') {
        router.replace('/agent')
        return
      }

      if (userRow?.role !== 'admin') {
        router.replace('/admin/login')
        return
      }

      setAllowed(true)
      setChecking(false)
    }
    check()
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0c1525', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Georgia, serif' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}
