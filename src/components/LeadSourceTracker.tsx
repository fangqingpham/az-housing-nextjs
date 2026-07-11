'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureLeadTrackingFromUrl } from '@/lib/client/lead-tracking'

export default function LeadSourceTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === '/vi/ho-tro-den-canada') return
    captureLeadTrackingFromUrl()
  }, [pathname])

  return null
}
