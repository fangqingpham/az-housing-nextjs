'use client'

import { Suspense } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/listings/PropertyCard'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getListings, getSavedIds, toggleSaved, ensureSeedData } from '@/lib/api'
import { SEED_LISTINGS } from '@/lib/utils'
import type { Listing } from '@/types'

const PER_PAGE = 6

function RentPageContent() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [ptype, setPtype] = useState(searchParams.get('type') || '')
  const [beds, setBeds] = useState(searchParams.get('beds') || '')
  const [price, setPrice] = useState('')
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  const { message, visible, showToast } = useToast()
  const { t } = useLanguage()
  const rx = t.rent
  const bx = t.buy

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await ensureSeedData(SEED_LISTINGS as any)
      const all = await getListings()
      const rent = all.filter(
        l => (l.status === 'published' || l.author === 'seed') &&
          ((l as any).price_type === 'rent' || l.type === 'For Rent')
      )
      setListings(rent)
      setLoading(false)
      if (user) setSavedIds(await getSavedIds(user.id))
    }
    load()
  }, [user])

  useEffect(() => { setPage(1) }, [search, ptype, beds, price])

  const filtered = useMemo(() => {
    let r = listings
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        (l as any).address?.toLowerCase().includes(q)
      )
    }
    if (ptype) r = r.filter(l => l.type === ptype)
    if (beds) r = r.filter(l => ((l as any).bedrooms ?? (l as any).beds ?? 0) >= parseInt(beds))
    if (price === 'u1500') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) < 1500)
    if (price === '1500-2500') r = r.filter(l => { const p = parseFloat(String(l.price).replace(/[^0-9.]/g, '')); return p >= 1500 && p < 2500 })
    if (price === '2500+') r = r.filter(l => parseFloat(String(l.price).replace(/[^0-9.]/g, '')) >= 2500)
    return r
  }, [listings, search, ptype, beds, price])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) { showToast(bx.signInToSave); return }
    const nowSaved = await toggleSaved(user.id, id)
    setSavedIds(prev => nowSaved ? [...prev, id] : prev.filter(x => x !== id))
    showToast(nowSaved ? bx.propertySaved : bx.removedFromSaved)
  }

  const goTo = (n: number) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const pageNumbers = () => {
    const range: number[] = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i)
    }
    return range
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>{rx.title}</h1>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <input className="fc" placeholder={rx.cityKeyword} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 140px', minWidth: 120 }} />
          <select className="fc" value={ptype} onChange={e => setPtype(e.target.value)} style={{ flex: '1 1 120px', minWidth: 110 }}>
            <option value="">{rx.anyType}</option>
            <option>House</option><option>Condo</option><option>Apartment</option><option>Townhouse</option>
          </select>
          <select className="fc" value={beds} onChange={e => setBeds(e.target.value)} style={{ flex: '1 1 100px', minWidth: 95 }}>
            <option value="">{rx.anyBeds}</option>
            <option value="1">{rx.bed1}</option><option value="2">{rx.bed2}</option><option value="3">{rx.bed3}</option>
          </select>
          <select className="fc" value={price} onChange={e => setPrice(e.target.value)} style={{ flex: '1 1 120px', minWidth: 110 }}>
            <option value="">{rx.anyPrice}</option>
            <option value="u1500">{rx.under1500}</option>
            <option value="1500-2500">{rx.from1500to2500}</option>
            <option value="2500+">{rx.over2500}</option>
          </select>
        </div>

        {loading ? (
          <p>{rx.loading}</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--mid)' }}>{rx.noMatch}</p>
        ) : (
          <>
            <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 16 }}>
              {filtered.length} {filtered.length !== 1 ? rx.rentals : rx.rental} · {rx.page} {page} {rx.of} {totalPages}
            </p>

            {/* Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(12px, 3vw, 20px)',
            }}>
              {paginated.map(l => (
                <PropertyCard key={l.id} listing={l} savedIds={savedIds} onToggleSave={handleToggleSave} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 36,
                flexWrap: 'wrap',
              }}>
                <button onClick={() => goTo(page - 1)} disabled={page === 1}
                  style={{ minWidth: 44, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #ddd', background: page === 1 ? '#f5f5f5' : '#fff', color: page === 1 ? '#aaa' : 'var(--dark)', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: 15 }}>
                  ‹
                </button>

                {pageNumbers()[0] > 1 && (
                  <>
                    <button onClick={() => goTo(1)} style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: '1px solid #ddd', background: '#fff', color: 'var(--dark)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>1</button>
                    {pageNumbers()[0] > 2 && <span style={{ color: 'var(--mid)', padding: '0 4px' }}>…</span>}
                  </>
                )}

                {pageNumbers().map(n => (
                  <button key={n} onClick={() => goTo(n)}
                    style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: n === page ? 'none' : '1px solid #ddd', background: n === page ? 'var(--accent)' : '#fff', color: n === page ? '#fff' : 'var(--dark)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    {n}
                  </button>
                ))}

                {pageNumbers()[pageNumbers().length - 1] < totalPages && (
                  <>
                    {pageNumbers()[pageNumbers().length - 1] < totalPages - 1 && <span style={{ color: 'var(--mid)', padding: '0 4px' }}>…</span>}
                    <button onClick={() => goTo(totalPages)} style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: '1px solid #ddd', background: '#fff', color: 'var(--dark)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{totalPages}</button>
                  </>
                )}

                <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
                  style={{ minWidth: 44, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #ddd', background: page === totalPages ? '#f5f5f5' : '#fff', color: page === totalPages ? '#aaa' : 'var(--dark)', cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontSize: 15 }}>
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default function RentPage() {
  return (
    <Suspense fallback={<div />}>
      <RentPageContent />
    </Suspense>
  )
}
