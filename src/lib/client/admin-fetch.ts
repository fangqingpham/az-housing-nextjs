'use client'

import { createClient } from '@/lib/supabase/client'

export class AdminApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'AdminApiError'
  }
}

export async function adminFetch(input: string, init: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.access_token) {
    throw new AdminApiError('You are not authorized. Please log out and log back in as admin.', 401)
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}

export async function readAdminJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const fallback = response.status === 401 || response.status === 403
      ? 'You are not authorized. Please log out and log back in as admin.'
      : 'The admin request failed.'
    throw new AdminApiError(payload.error || fallback, response.status)
  }
  return payload as T
}
