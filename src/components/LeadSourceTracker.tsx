'use client'

import { useEffect } from 'react'
import { captureLeadTrackingFromUrl } from '@/lib/client/lead-tracking'

export default function LeadSourceTracker() {
  useEffect(() => {
    captureLeadTrackingFromUrl()
  }, [])

  return null
}
