'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PropertyCard from '@/components/listings/PropertyCard'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { getListings, getSavedIds, toggleSaved } from '@/lib/api'
import { SEED_LISTINGS } from '@/lib/utils'
import { ensureSeedData } from '@/lib/api'
import type { Listing } from '@/types'

export default function RentPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [ptype, setPtype] = useState(searchParams.get('type') || '')
  const [beds, setBeds] = useState(searchParams.get('beds') || '')
  const [price, setPrice] = useState('')
  const [sort, setSort] = useState('newest')
  const { user } = useAuth()
  const { message, visible, showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await ensureSeedData(SEED_LISTINGS as any)
      const all = await getListings()
      const rent = all.filter(l => (l.status === 'published' || l.author === 'seed') && l.type === 'For Rent')
      setListings(rent)
      setLoading(false)
      if (user) setSavedIds(await getSavedIds(user.id))
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    let r = listings
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.addr?.toLowerCase().includes(q)
      )
    }
    if (ptype) r = r.filter(l => l.ptype === ptype)
    if (beds) r = r.filter(l => l.beds >= parseInt(beds))
    if (price === 'u1500') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) < 1500)
    if (price === '1500-2500') r = r.filter(l => {
      const p = parseFloat(String(l.price).replace(/[^0-9.]/g, ''))
      return p >= 1500 && p < 2500
    })
    if (price === '2500+') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) >= 2500)
    return r
  }, [listings, search, ptype, beds, price])

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) { showToast('Sign in to save properties.'); return }
    const nowSaved = await toggleSaved(user.id, id)
    setSavedIds(prev => nowSaved ? [...prev, id] : prev.filter(x => x !== id))
    showToast(nowSaved ? 'Property saved! ♥' : 'Removed from saved.')
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 500 }}>For Rent</h1>
          <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
            {loading ? 'Loading…' : `${filtered.length} rental${filtered.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input
            className="fc"
            style={{ maxWidth: 200, marginBottom: 0 }}
            placeholder="Search city or area…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="fc" style={{ maxWidth: 150, marginBottom: 0 }} value={ptype} onChange={e => setPtype(e.target.value)}>
            <option value="">All types</option>
            <option>House</option><option>Condo</option><option>Townhouse</option><option>Apartment</option>
          </select>
          <select className="fc" style={{ maxWidth: 120, marginBottom: 0 }} value={beds} onChange={e => setBeds(e.target.value)}>
            <option value="">Any beds</option>
            <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
          </select>
          <select className="fc" style={{ maxWidth: 180, marginBottom: 0 }} value={price} onChange={e => setPrice(e.target.value)}>
            <option value="">Any price</option>
            <option value="u1500">Under $1,500/mo</option>
            <option value="1500-2500">$1,500 – $2,500</option>
            <option value="2500+">$2,500+/mo</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading listings…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No rentals match your filters.</p></div>
        ) : (
          <div className="grid">
            {filtered.map(l => (
              <PropertyCard key={l.id} listing={l} savedIds={savedIds} onToggleSave={handleToggleSave} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
