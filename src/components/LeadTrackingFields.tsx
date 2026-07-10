'use client'

import { LEAD_TRACKING_KEYS } from '@/lib/lead-tracking'
import { useLeadTracking } from '@/lib/client/lead-tracking'

export default function LeadTrackingFields() {
  const tracking = useLeadTracking()
  const latest = tracking.latest_touch || {}

  return (
    <>
      {LEAD_TRACKING_KEYS.map(key => (
        <input key={key} type="hidden" name={key} value={latest[key] || ''} readOnly />
      ))}
    </>
  )
}
