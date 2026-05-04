'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { getListings } from '@/lib/api'
import { SEED_LISTINGS, safeImgs, safePrice, CITY_COORDS } from '@/lib/utils'
import { ensureSeedData } from '@/lib/api'
import type { Listing, MapFilter } from '@/types'

// Dynamically import map to avoid SSR issues
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: '#EEF0EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid)' }}>
      Loading map…
    </div>
  ),
})

export default function MapSearchPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<MapFilter>('all')
  const [ptypeFilter, setPtypeFilter] = useState('')
  const [bedsFilter, setBedsFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.6532, -79.3832])
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const { message, visible, showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      await ensureSeedData(SEED_LISTINGS as any)
      const all = await getListings()
      setListings(all.filter(l => l.status === 'published' || l.author === 'seed'))
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (filter === 'sale' && l.type !== 'For Sale') return false
      if (filter === 'rent' && l.type !== 'For Rent') return false
      if (ptypeFilter && l.ptype !== ptypeFilter) return false
      if (bedsFilter && l.beds < parseInt(bedsFilter)) return false
      return true
    })
  }, [listings, filter, ptypeFilter, bedsFilter])

  const handleSearch = useCallback(async () => {
    const q = searchText.trim().toLowerCase()
    if (!q) return
    const cityCoords = CITY_COORDS[q]
    if (cityCoords) {
      setMapCenter(cityCoords)
      return
    }
    // Try Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Canada')}&limit=1`)
      const data = await res.json()
      if (data?.[0]) setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)])
      else showToast('Location not found.')
    } catch {
      showToast('Search failed.')
    }
  }, [searchText, showToast])

  const handleLocateMe = () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported.'); return }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude])
        showToast('Showing listings near your location!')
      },
      () => showToast('Could not get your location.')
    )
  }

  const handleMarkerClick = (id: string) => {
    setHighlightedId(id)
    document.getElementById(`mc-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="map-search-layout">
        {/* Left panel */}
        <div className="map-results-panel">
          <div className="map-search-bar">
            <svg width="14" height="14" fill="none" stroke="#6B6B67" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search city or address…"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-accent btn-sm" onClick={handleSearch}>Go</button>
          </div>

          <div className="map-filters-row">
            {(['all', 'sale', 'rent'] as MapFilter[]).map(f => (
              <button
                key={f}
                className={`map-chip${filter === f ? ' on' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'sale' ? 'For Sale' : 'For Rent'}
              </button>
            ))}
            <select
              className="map-chip"
              style={{ background: 'white', cursor: 'pointer' }}
              value={ptypeFilter}
              onChange={e => setPtypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option>House</option><option>Condo</option><option>Townhouse</option><option>Apartment</option>
            </select>
            <select
              className="map-chip"
              style={{ background: 'white', cursor: 'pointer' }}
              value={bedsFilter}
              onChange={e => setBedsFilter(e.target.value)}
            >
              <option value="">Any beds</option>
              <option value="1">1+ bed</option>
              <option value="2">2+ beds</option>
              <option value="3">3+ beds</option>
            </select>
            <button className="map-chip" onClick={handleLocateMe}>📍 Near Me</button>
          </div>

          <div className="map-results-count">
            {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} found
          </div>

          <div id="ms-results">
            {filtered.map(l => {
              const imgs = safeImgs(l)
              const isRent = l.type === 'For Rent'
              const badgeStyle = isRent
                ? { background: '#E1F5EE', color: '#2D7A4F' }
                : { background: '#FEF3DC', color: '#D4891A' }

              return (
                <div
                  key={l.id}
                  id={`mc-${l.id}`}
                  className={`map-card${highlightedId === l.id ? ' highlighted' : ''}`}
                  onClick={() => router.push(`/property/${l.id}`)}
                >
                  <div className="map-card-img">
                    {imgs[0]
                      ? <img src={imgs[0]} alt="" onError={e => (e.currentTarget.style.display = 'none')} />
                      : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth={0.8} opacity={0.5}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    }
                  </div>
                  <div className="map-card-info">
                    <div className="map-card-badge" style={badgeStyle}>{l.type}</div>
                    <div className="map-card-price">{safePrice(l.price)}</div>
                    <div className="map-card-title">{l.title}</div>
                    <div className="map-card-loc">📍 {l.city}{l.province ? ', ' + l.province : ''}</div>
                    <div className="map-card-meta">
                      {l.beds ? <span>🛏 {l.beds}bd</span> : null}
                      {l.baths ? <span>🚿 {l.baths}ba</span> : null}
                      {l.sqft ? <span>📐 {Number(l.sqft).toLocaleString()}sqft</span> : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Map panel */}
        <div className="map-panel">
          <MapView
            listings={filtered}
            onMarkerClick={handleMarkerClick}
            highlightedId={highlightedId}
            center={mapCenter}
          />
        </div>
      </div>
    </>
  )
}
