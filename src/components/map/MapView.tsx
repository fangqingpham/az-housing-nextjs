'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Listing } from '@/types'
import { getCityCoords } from '@/lib/utils'

interface MapViewProps {
  listings: Listing[]
  onMarkerClick?: (id: string) => void
  highlightedId?: string | null
  center?: [number, number]
  zoom?: number
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

const geocodeCache = new Map<string, [number, number]>()

function getSavedCoords(listing: any): [number, number] | null {
  const lat = Number(listing.lat)
  const lng = Number(listing.lng)
  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng]
  }
  return null
}

function getAddressText(listing: any): string {
  return [
    listing.address || listing.addr || '',
    listing.city || '',
    listing.province || '',
    listing.postal || '',
    'Canada',
  ]
    .filter(Boolean)
    .join(', ')
}

async function geocodeListing(listing: any): Promise<[number, number]> {
  const saved = getSavedCoords(listing)
  if (saved) return saved

  const address = getAddressText(listing)
  if (geocodeCache.has(address)) return geocodeCache.get(address)!

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    const res = await fetch(url)
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      const lat = Number(data[0].lat)
      const lng = Number(data[0].lon)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const coords: [number, number] = [lat, lng]
        geocodeCache.set(address, coords)
        return coords
      }
    }
  } catch (err) {
    console.warn('Geocoding failed:', address, err)
  }

  return getCityCoords(listing)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({
  listings,
  onMarkerClick,
  highlightedId,
  center = [43.6532, -79.3832],
  zoom = 10,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const initializedRef = useRef(false)

  // ── Marker helpers ──────────────────────────────────────────────────────────

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => {
      try { m.remove() } catch {}
    })
    markersRef.current = []
  }, [])

  const placeMarkers = useCallback(async () => {
    const map = mapInstanceRef.current
    const L = leafletRef.current
    if (!map || !L) return

    clearMarkers()

    const bounds: [number, number][] = []

    for (const listing of listings as any[]) {
      const [lat, lng] = await geocodeListing(listing)
      bounds.push([lat, lng])

      const isHighlighted = highlightedId === listing.id
      const isRent = listing.type === 'For Rent'
      const bg = isHighlighted ? '#F5A623' : isRent ? '#2D7A4F' : '#1B2A4A'

      const icon = L.divIcon({
        html: `
          <div style="
            background: ${bg};
            color: white;
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 3px 10px rgba(0,0,0,.3);
            border: 2px solid white;
            cursor: pointer;
            transform: ${isHighlighted ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.15s ease, background 0.15s ease;
          ">
            ${listing.price || '--'}
          </div>
        `,
        className: '',
        iconAnchor: [20, 20],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

      marker.bindPopup(`
        <div style="min-width: 190px; font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${listing.price || ''}</div>
          <div style="font-size: 13px; margin-bottom: 4px;">${listing.title || ''}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
            📍 ${listing.city || ''}${listing.province ? ', ' + listing.province : ''}
          </div>
          ${listing.beds ? `<span style="font-size:11px;color:#555;margin-right:8px;">🛏 ${listing.beds}bd</span>` : ''}
          ${listing.baths ? `<span style="font-size:11px;color:#555;margin-right:8px;">🚿 ${listing.baths}ba</span>` : ''}
          <a
            href="/property/${listing.id}"
            style="display:block;background:#1B2A4A;color:white;text-align:center;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;margin-top:8px;"
          >
            View Property →
          </a>
        </div>
      `)

      marker.on('click', () => {
        onMarkerClick?.(listing.id)
      })

      markersRef.current.push(marker)
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 })
    }
  }, [listings, highlightedId, onMarkerClick, clearMarkers])

  // ── Init map (once) ─────────────────────────────────────────────────────────

  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return

    const L = (await import('leaflet')).default
    // @ts-ignore — Leaflet CSS has no types
    await import('leaflet/dist/leaflet.css')

    leafletRef.current = L

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    // Give the container time to paint before placing markers
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize()
      placeMarkers()
    }, 200)
  }, [center, zoom, placeMarkers])

  // ── Mount / unmount ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    initMap()

    return () => {
      clearMarkers()
      try { mapInstanceRef.current?.remove() } catch {}
      mapInstanceRef.current = null
      leafletRef.current = null
      initializedRef.current = false
    }
  }, [initMap, clearMarkers])

  // ── Re-place markers when listings or highlight changes ─────────────────────

  useEffect(() => {
    if (!initializedRef.current || !mapInstanceRef.current) return
    placeMarkers()
  }, [listings, highlightedId, placeMarkers])

  // ── Pan when center prop changes (e.g. city search) ─────────────────────────

  useEffect(() => {
    mapInstanceRef.current?.panTo(center)
  }, [center])

  return (
    <div
      ref={mapRef}
      id="search-map"
      style={{ width: '100%', height: '100%', minHeight: 300 }}
    />
  )
}
