'use client'

import { Suspense } from 'react'
import LoginInner from './LoginInner'

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <LoginInner />
    </Suspense>
  )
}