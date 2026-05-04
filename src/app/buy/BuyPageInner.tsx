'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/listings/PropertyCard'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { getListings, getSavedIds, toggleSaved, ensureSeedData } from '@/lib/api'
import { SEED_LISTINGS } from '@/lib/utils'
import type { Listing } from '@/types'

export default function BuyPageInner() {
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
      const sale = all.filter(l => (l.status === 'published' || l.author === 'seed') && l.type === 'For Sale')
      setListings(sale)
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
        l.addr?.toLowerCase().includes(q) ||
        l.province?.toLowerCase().includes(q)
      )
    }
    if (ptype) r = r.filter(l => l.ptype === ptype)
    if (beds) r = r.filter(l => l.beds >= parseInt(beds))
    if (price === 'u500') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) < 500000)
    if (price === '500-1m') r = r.filter(l => {
      const p = parseFloat(String(l.price).replace(/[^0-9.]/g, ''))
      return p >= 500000 && p < 1000000
    })
    if (price === '1m+') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) >= 1000000)
    if (sort === 'price-asc') r = [...r].sort((a, b) => parseFloat(String(a.price).replace(/[^0-9.]/g, '')) - parseFloat(String(b.price).replace(/[^0-9.]/g, '')))
    if (sort === 'price-desc') r = [...r].sort((a, b) => parseFloat(String(b.price).replace(/[^0-9.]/g, '')) - parseFloat(String(a.price).replace(/[^0-9.]/g, '')))
    return r
  }, [listings, search, ptype, beds, price, sort])

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) {
      showToast('Sign in to save properties.')
      return
    }
    const nowSaved = await toggleSaved(user.id, id)
    setSavedIds(prev => nowSaved ? [...prev, id] : prev.filter(x => x !== id))
    showToast(nowSaved ? 'Property saved! ♥' : 'Removed from saved.')
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1>For Sale</h1>

        {loading ? (
          <div className="empty-state"><p>Loading listings…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No properties match your filters.</p></div>
        ) : (
          <div className="grid">
            {filtered.map(l => (
              <PropertyCard
                key={l.id}
                listing={l}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}