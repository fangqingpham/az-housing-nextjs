'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { findUser, upsertUser } from '@/lib/api'
import type { AppUser } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supa = getSupabaseBrowserClient()

  const loadUser = useCallback(async () => {
    const { data: { session } } = await supa.auth.getSession()
    if (!session?.user) { setUser(null); setLoading(false); return }
    const appUser = await findUser(session.user.email!)
    setUser(appUser)
    setLoading(false)
  }, [supa])

  useEffect(() => {
    loadUser()
    const { data: { subscription } } = supa.auth.onAuthStateChange(() => {
      loadUser()
    })
    return () => subscription.unsubscribe()
  }, [loadUser, supa])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supa.auth.signInWithPassword({ email, password })
    if (error) return error.message
    await loadUser()
    return null
  }

  const signUp = async (
    email: string,
    password: string,
    fname: string,
    lname: string,
    phone: string,
    role: AppUser['role']
  ): Promise<string | null> => {
    const { data, error } = await supa.auth.signUp({ email, password })
    if (error) return error.message
    if (data.user) {
      await upsertUser({
        id: data.user.id,
        email,
        fname,
        lname,
        phone,
        role,
        joined: new Date().toLocaleDateString(),
      })
    }
    await loadUser()
    return null
  }

  const signOut = async () => {
    await supa.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signUp, signOut, reload: loadUser }
}
