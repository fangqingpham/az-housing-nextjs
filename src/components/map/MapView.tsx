'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Listing } from '@/types'
import { getCityCoords } from '@/lib/utils'

declare global {
  interface Window {
    _gmMarkers: google.maps.Marker[]
    _L: typeof import('leaflet') | null
  }
}

interface MapViewProps {
  listings: Listing[]
  onMarkerClick?: (id: string) => void
  highlightedId?: string | null
  center?: [number, number]
  zoom?: number
}

export default function MapView({
  listings,
  onMarkerClick,
  highlightedId,
  center = [43.6532, -79.3832],
  zoom = 9,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const leafletInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const leafletMarkersRef = useRef<import('leaflet').Marker[]>([])
  const initRef = useRef(false)

  const initGoogleMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom,
      mapTypeControl: false,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    })
    placeGoogleMarkers()
  }, [center, zoom])

  const placeGoogleMarkers = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map || typeof google === 'undefined') return

    // Clear old
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    window._gmMarkers = []

    listings.forEach(l => {
      const [lat, lng] = getCityCoords(l)
      const isRent = l.type === 'For Rent'
      const color = isRent ? '#2D7A4F' : '#1B2A4A'

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: l.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`
          )}`,
          scaledSize: new google.maps.Size(1, 1),
        },
      })

      const iw = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;min-width:200px;padding:4px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${l.price}</div>
          <div style="font-size:13px;margin-bottom:3px">${l.title}</div>
          <div style="font-size:11px;color:#666;margin-bottom:8px">📍 ${l.city || ''}, ${l.province || ''}</div>
          <a href="/property/${l.id}" style="display:block;background:#1B2A4A;color:white;text-align:center;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none">View Property →</a>
        </div>`,
      })

      marker.addListener('click', () => {
        markersRef.current.forEach(m => (m as any)._iw?.close())
        iw.open(map, marker)
        if (onMarkerClick) onMarkerClick(l.id)
      })
        ; (marker as any)._iw = iw
      markersRef.current.push(marker)
    })
  }, [listings, onMarkerClick])

  const initLeafletMap = useCallback(async () => {
    if (!mapRef.current || leafletInstanceRef.current) return
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')

    leafletInstanceRef.current = L.map(mapRef.current, { zoomControl: true })
      .setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletInstanceRef.current)

    setTimeout(() => leafletInstanceRef.current?.invalidateSize(), 200)

    // Place markers
    listings.forEach(l => {
      const [lat, lng] = getCityCoords(l)
      const isRent = l.type === 'For Rent'
      const color = isRent ? '#2D7A4F' : '#1B2A4A'
      const icon = L.divIcon({
        html: `<div style="background:${color};color:white;padding:4px 9px;border-radius:14px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid white;cursor:pointer">${l.price || '—'}</div>`,
        className: '',
        iconAnchor: [0, 0],
      })
      const marker = L.marker([lat, lng], { icon }).addTo(leafletInstanceRef.current!)
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(l.id)
        marker.bindPopup(`<div style="min-width:180px;font-family:sans-serif;padding:4px">
          <div style="font-weight:700;font-size:14px">${l.price}</div>
          <div style="font-size:13px">${l.title}</div>
          <div style="font-size:11px;color:#666;margin:4px 0">📍 ${l.city || ''}, ${l.province || ''}</div>
          <a href="/property/${l.id}" style="display:block;background:#1B2A4A;color:white;text-align:center;padding:6px 12px;border-radius:5px;font-size:12px;margin-top:4px;text-decoration:none">View →</a>
        </div>`).openPopup()
      })
      leafletMarkersRef.current.push(marker)
    })
  }, [listings, center, zoom, onMarkerClick])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    if (typeof google !== 'undefined' && google.maps) {
      initGoogleMap()
    } else {
      initLeafletMap()
    }

    return () => {
      if (leafletInstanceRef.current) {
        try { leafletInstanceRef.current.remove() } catch {}
        leafletInstanceRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when listings change (after initial render)
  useEffect(() => {
    if (!initRef.current) return
    if (mapInstanceRef.current) placeGoogleMarkers()
  }, [listings, placeGoogleMarkers])

  // Pan to center when it changes externally
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: center[0], lng: center[1] })
    } else if (leafletInstanceRef.current) {
      leafletInstanceRef.current.panTo(center)
    }
  }, [center])

  return (
    <div ref={mapRef} id="search-map" style={{ width: '100%', height: '100%', minHeight: 300 }} />
  )
}
