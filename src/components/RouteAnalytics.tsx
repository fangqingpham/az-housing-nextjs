'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { usePathname } from 'next/navigation'

export default function RouteAnalytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname()
  if (!gaId || pathname === '/vi/ho-tro-den-canada') return null
  return <GoogleAnalytics gaId={gaId} />
}
