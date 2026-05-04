'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    googleMapsReady?: () => void
    _googleMapsLoaded?: boolean
  }
}

export default function GoogleMapsLoader() {
  useEffect(() => {
    if (window._googleMapsLoaded) return
    window._googleMapsLoaded = true

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  return null
}
