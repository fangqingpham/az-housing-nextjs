'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Listing } from '@/types'
import { getCityCoords } from '@/lib/utils'

declare global {
  interface Window {
    _gmMarkers?: google.maps.Marker[]
  }
}

interface MapViewProps {
  listings: Listing[]
  onMarkerClick?: (id: string) => void
  highlightedId?: string | null
  center?: [number, number]
  zoom?: number
}

function getListingCoords(listing: any): [number, number] {
  const lat = Number(listing.lat)
  const lng = Number(listing.lng)

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng]
  }

  return getCityCoords(listing)
}

export default function MapView({
  listings,
  onMarkerClick,
  highlightedId,
  center = [43.6532, -79.3832],
  zoom = 9,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  const googleMapRef = useRef<google.maps.Map | null>(null)
  const googleMarkersRef = useRef<google.maps.Marker[]>([])

  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const leafletMarkersRef = useRef<import('leaflet').Marker[]>([])
  const leafletLibRef = useRef<typeof import('leaflet') | null>(null)

  const initializedRef = useRef(false)

  const clearGoogleMarkers = useCallback(() => {
    googleMarkersRef.current.forEach(marker => marker.setMap(null))
    googleMarkersRef.current = []
    window._gmMarkers = []
  }, [])

  const clearLeafletMarkers = useCallback(() => {
    leafletMarkersRef.current.forEach(marker => {
      try {
        marker.remove()
      } catch {}
    })

    leafletMarkersRef.current = []
  }, [])

  const placeGoogleMarkers = useCallback(() => {
    const map = googleMapRef.current

    if (!map || typeof google === 'undefined') return

    clearGoogleMarkers()

    listings.forEach(listing => {
      const [lat, lng] = getListingCoords(listing)
      const isRent = listing.type === 'For Rent'
      const color = isRent ? '#2D7A4F' : '#1B2A4A'

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: listing.title,
        label: {
          text: String(listing.price || '$'),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '700',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: highlightedId === listing.id ? 14 : 11,
          fillColor: highlightedId === listing.id ? '#F5A623' : color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif;min-width:200px;padding:4px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${listing.price || ''}</div>
            <div style="font-size:13px;margin-bottom:3px">${listing.title || ''}</div>
            <div style="font-size:11px;color:#666;margin-bottom:8px">📍 ${listing.city || ''}, ${listing.province || ''}</div>
            <a href="/property/${listing.id}" style="display:block;background:#1B2A4A;color:white;text-align:center;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none">View Property →</a>
          </div>
        `,
      })

      marker.addListener('click', () => {
        googleMarkersRef.current.forEach(m => {
          const existingWindow = (m as any)._infoWindow
          if (existingWindow) existingWindow.close()
        })

        infoWindow.open(map, marker)
        onMarkerClick?.(listing.id)
      })

      ;(marker as any)._infoWindow = infoWindow
      googleMarkersRef.current.push(marker)
    })
  }, [listings, highlightedId, onMarkerClick, clearGoogleMarkers])

  const placeLeafletMarkers = useCallback(() => {
    const map = leafletMapRef.current
    const L = leafletLibRef.current

    if (!map || !L) return

    clearLeafletMarkers()

    listings.forEach(listing => {
      const [lat, lng] = getListingCoords(listing)
      const isRent = listing.type === 'For Rent'
      const color = isRent ? '#2D7A4F' : '#1B2A4A'
      const isHighlighted = highlightedId === listing.id

      const icon = L.divIcon({
        html: `
          <div style="
            background:${isHighlighted ? '#F5A623' : color};
            color:white;
            padding:5px 10px;
            border-radius:16px;
            font-size:12px;
            font-weight:700;
            white-space:nowrap;
            box-shadow:0 3px 10px rgba(0,0,0,.3);
            border:2px solid white;
            cursor:pointer;
            transform:${isHighlighted ? 'scale(1.15)' : 'scale(1)'};
          ">
            ${listing.price || '--'}
          </div>
        `,
        className: '',
        iconAnchor: [20, 20],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

      marker.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif;padding:4px">
          <div style="font-weight:700;font-size:14px">${listing.price || ''}</div>
          <div style="font-size:13px">${listing.title || ''}</div>
          <div style="font-size:11px;color:#666;margin:4px 0">📍 ${listing.city || ''}, ${listing.province || ''}</div>
          <a href="/property/${listing.id}" style="display:block;background:#1B2A4A;color:white;text-align:center;padding:6px 12px;border-radius:5px;font-size:12px;margin-top:4px;text-decoration:none">View →</a>
        </div>
      `)

      marker.on('click', () => {
        onMarkerClick?.(listing.id)
      })

      leafletMarkersRef.current.push(marker)
    })
  }, [listings, highlightedId, onMarkerClick, clearLeafletMarkers])

  const initGoogleMap = useCallback(() => {
    if (!mapRef.current || googleMapRef.current) return

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    })

    placeGoogleMarkers()
  }, [center, zoom, placeGoogleMarkers])

  const initLeafletMap = useCallback(async () => {
    if (!mapRef.current || leafletMapRef.current) return

    const L = (await import('leaflet')).default

    // @ts-ignore
    await import('leaflet/dist/leaflet.css')

    leafletLibRef.current = L

    leafletMapRef.current = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMapRef.current)

    setTimeout(() => {
      leafletMapRef.current?.invalidateSize()
      placeLeafletMarkers()
    }, 200)
  }, [center, zoom, placeLeafletMarkers])

  useEffect(() => {
    if (initializedRef.current) return

    initializedRef.current = true

    if (typeof google !== 'undefined' && google.maps) {
      initGoogleMap()
    } else {
      initLeafletMap()
    }

    return () => {
      clearGoogleMarkers()
      clearLeafletMarkers()

      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove()
        } catch {}

        leafletMapRef.current = null
      }

      googleMapRef.current = null
      initializedRef.current = false
    }
  }, [initGoogleMap, initLeafletMap, clearGoogleMarkers, clearLeafletMarkers])

  useEffect(() => {
    if (!initializedRef.current) return

    if (googleMapRef.current) {
      placeGoogleMarkers()
    }

    if (leafletMapRef.current) {
      placeLeafletMarkers()
    }
  }, [listings, highlightedId, placeGoogleMarkers, placeLeafletMarkers])

  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: center[0], lng: center[1] })
    }

    if (leafletMapRef.current) {
      leafletMapRef.current.panTo(center)
    }
  }, [center])

  return (
    <div
      ref={mapRef}
      id="search-map"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 300,
      }}
    />
  )
}