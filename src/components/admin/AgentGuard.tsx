'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type AgentUser = {
  id: string
  fname: string
  lname: string
  email: string
  phone: string | null
  role: string
}

export default function AgentGuard({ children }: { children: (agent: AgentUser) => React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [agent, setAgent] = useState<AgentUser | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/admin/login'); return }

      const { data: userRow } = await supabase
        .from('users').select('*').eq('id', session.user.id).single()

      if (!userRow || !['admin', 'agent'].includes(userRow.role)) {
        router.replace('/admin/login')
        return
      }

      if (userRow.role === 'admin') {
        router.replace('/admin/overview')
        return
      }

      setAgent(userRow)
      setChecking(false)
    }
    check()
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0c1525', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'Georgia, serif' }}>Loading…</div>
      </div>
    )
  }

  if (!agent) return null
  return <>{children(agent)}</>
}
