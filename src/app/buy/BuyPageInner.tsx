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

const PER_PAGE = 6

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
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  const { message, visible, showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await ensureSeedData(SEED_LISTINGS as any)
      const all = await getListings()
      const sale = all.filter(
        l => (l.status === 'published' || l.author === 'seed') && ((l as any).price_type === 'sale' || l.type === 'For Sale')
      )
      setListings(sale)
      setLoading(false)
      if (user) setSavedIds(await getSavedIds(user.id))
    }
    load()
  }, [user])

  // Reset to page 1 whenever filters or sort change
  useEffect(() => { setPage(1) }, [search, ptype, beds, price, sort])

  const filtered = useMemo(() => {
    let r = listings
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        (l as any).address?.toLowerCase().includes(q) ||
        l.province?.toLowerCase().includes(q)
      )
    }
    if (ptype) r = r.filter(l => l.type === ptype)
    if (beds) r = r.filter(l => ((l as any).bedrooms ?? (l as any).beds ?? 0) >= parseInt(beds))
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

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
        <h1>For Sale</h1>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          <input className="fc" placeholder="City or keyword" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 220 }} />
          <select className="fc" value={ptype} onChange={e => setPtype(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">Any type</option>
            <option>House</option><option>Condo</option><option>Apartment</option><option>Townhouse</option>
          </select>
          <select className="fc" value={beds} onChange={e => setBeds(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="">Any beds</option>
            <option value="1">1+ bed</option><option value="2">2+ beds</option><option value="3">3+ beds</option>
          </select>
          <select className="fc" value={price} onChange={e => setPrice(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">Any price</option>
            <option value="u500">Under $500K</option>
            <option value="500-1m">$500K – $1M</option>
            <option value="1m+">$1M+</option>
          </select>
          <select className="fc" value={sort} onChange={e => setSort(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading listings…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No properties match your filters.</p></div>
        ) : (
          <>
            <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 16 }}>
              {filtered.length} propert{filtered.length !== 1 ? 'ies' : 'y'} found · Page {page} of {totalPages}
            </p>

            <div className="grid">
              {paginated.map(l => (
                <PropertyCard key={l.id} listing={l} savedIds={savedIds} onToggleSave={handleToggleSave} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                <button
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                  disabled={page === 1}
                  style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: page === 1 ? '#f5f5f5' : '#fff', color: page === 1 ? '#aaa' : 'var(--dark)', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo(0, 0) }}
                    style={{ width: 38, height: 38, borderRadius: 8, border: n === page ? 'none' : '1px solid #ddd', background: n === page ? 'var(--accent)' : '#fff', color: n === page ? '#fff' : 'var(--dark)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                  disabled={page === totalPages}
                  style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: page === totalPages ? '#f5f5f5' : '#fff', color: page === totalPages ? '#aaa' : 'var(--dark)', cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontSize: 14 }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
