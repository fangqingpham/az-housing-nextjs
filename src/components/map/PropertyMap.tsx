'use client'

import { useEffect, useRef } from 'react'

interface PropertyMapProps {
  address: string
  title?: string
}

export default function PropertyMap({ address, title }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!address || !mapRef.current || initializedRef.current) return
    initializedRef.current = true

    const initMap = async () => {
      // Leaflet (OpenStreetMap)
      try {
        const L = (await import('leaflet')).default
        // @ts-ignore
        await import('leaflet/dist/leaflet.css')

        if (mapRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
          }).setView([43.6532, -79.3832], 13)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(mapInstanceRef.current)

          setTimeout(() => {
            mapInstanceRef.current?.invalidateSize()
          }, 200)
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ca`
        )
        const data = await res.json()

        if (data?.[0] && mapInstanceRef.current) {
          const lat = parseFloat(data[0].lat)
          const lon = parseFloat(data[0].lon)

          mapInstanceRef.current.setView([lat, lon], 16)

          const icon = L.divIcon({
            html: `<div style="background:#F5A623;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            className: '',
          })

          L.marker([lat, lon], { icon })
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `<b>${title || 'Property'}</b><br/>
               <span style="font-size:12px">${address}</span>`
            )
            .openPopup()
        } else if (mapRef.current) {
          if (mapInstanceRef.current) {
            try { mapInstanceRef.current.remove() } catch {}
          }
          mapRef.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:13px">📍 Location not found on map</div>`
        }
      } catch {
        if (mapRef.current) {
          mapRef.current.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:13px">📍 Map unavailable</div>`
        }
      }
    }

    const timer = setTimeout(initMap, 400)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
    }
  }, [address, title])

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: 260,
        borderRadius: 'var(--r)',
        border: '1px solid var(--border)',
        background: '#EEF0EC',
      }}
    />
  )
}