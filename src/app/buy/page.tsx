'use client'

import { Suspense } from 'react'
import BuyPageInner from './BuyPageInner'

export default function BuyPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <BuyPageInner />
    </Suspense>
  )
}