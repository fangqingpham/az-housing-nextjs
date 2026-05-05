'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PropertyCard from '@/components/listings/PropertyCard'
import SearchBar from '@/components/listings/SearchBar'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { getListings, getSavedIds, toggleSaved, getUserCount } from '@/lib/api'
import { SEED_LISTINGS, BLOGS, safePrice } from '@/lib/utils'
import { ensureSeedData } from '@/lib/api'
import type { Listing } from '@/types'

export default function HomePage() {
  const [mode, setMode] = useState<'sale' | 'rent'>('sale')
  const [saleListings, setSaleListings] = useState<Listing[]>([])
  const [rentListings, setRentListings] = useState<Listing[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [listingCount, setListingCount] = useState('--')
  const [userCount, setUserCount] = useState('--')
  const { user } = useAuth()
  const { message, visible, showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      await ensureSeedData(SEED_LISTINGS as any)
      const all = await getListings()
      const published = all.filter(l => l.status === 'published' || l.author === 'seed')
      setSaleListings(published.filter(l => l.type === 'For Sale').slice(0, 3))
      setRentListings(published.filter(l => l.type === 'For Rent').slice(0, 3))
      setListingCount(published.length > 0 ? published.length.toLocaleString() : '8')
      const uc = await getUserCount()
      setUserCount(uc > 0 ? uc.toLocaleString() : '0')
      if (user) {
        const ids = await getSavedIds(user.id)
        setSavedIds(ids)
      }
    }
    load()
  }, [user])

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

      {/* HERO */}
      <section className="hero">
        <span className="eyebrow">From Search to Sold, We've Got You Covered</span>
        <h1>Find Your Perfect Home Across Canada</h1>
        <p className="hero-sub">
          Browse thousands of listings from trusted sellers and agents across Canada.
        </p>

        <SearchBar mode={mode} onModeChange={setMode} />

        <div className="adv-filters">
          {['House', 'Condo', 'Townhouse', 'Apartment', 'New Builds', 'Open Houses'].map(f => (
            <button key={f} className="adv-chip">{f}</button>
          ))}
        </div>
        
      </section>

      {/* FEATURED FOR SALE */}
      <section className="sec">
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Featured For Sale</h2>
            <Link href="/buy" className="sec-link">View all listings →</Link>
          </div>
          <div className="grid">
            {saleListings.length > 0
              ? saleListings.map(l => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                />
              ))
              : <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>No sale listings yet. <Link href="/post-listing" style={{ color: 'var(--accent)' }}>Post the first one!</Link></p>
              </div>
            }
          </div>
        </div>
      </section>

      {/* PROMO BAND */}
      <div style={{ background: 'var(--dark)', color: 'white', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 500, marginBottom: '1rem' }}>
          Ready to list your property? Reach thousands of buyers and renters across Canada.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/post-listing" className="btn btn-accent btn-lg">Post a Listing</Link>
          <Link href="/landlord" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.12)', color: 'white', borderColor: 'rgba(255,255,255,.25)' }}>
            Learn More
          </Link>
        </div>
      </div>

      {/* FEATURED FOR RENT */}
      <section className="sec" style={{ background: 'white' }}>
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Featured Rentals</h2>
            <Link href="/rent" className="sec-link">View all rentals →</Link>
          </div>
          <div className="grid">
            {rentListings.length > 0
              ? rentListings.map(l => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                />
              ))
              : <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>No rental listings yet.</p>
              </div>
            }
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="sec">
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Advice & Guides</h2>
            <Link href="/blog" className="sec-link">All articles →</Link>
          </div>
          <div className="blog-grid">
            {BLOGS.slice(0, 3).map(b => (
              <Link href={`/blog/${b.id}`} key={b.id} className="bc">
                <div className="bc-img" style={{ background: b.color }} />
                <div className="bc-body">
                  <div className="btag">{b.cat}</div>
                  <div className="bc-title">{b.title}</div>
                  <div className="bc-exc">{b.excerpt}</div>
                  <div className="bc-meta">
                    <span>{b.date}</span>
                    <span>{b.read}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CITY GRID */}
      <section className="sec" style={{ background: 'white' }}>
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Browse by City</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem' }}>
            {['Toronto', 'Vancouver', 'Ottawa', 'Montreal', 'Calgary', 'Edmonton'].map(city => (
              <Link
                key={city}
                href={`/buy?search=${city}`}
                style={{
                  background: 'var(--cream)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r)', padding: '1.25rem 1rem', textAlign: 'center',
                  cursor: 'pointer', transition: 'all .18s', fontWeight: 500, fontSize: '14px',
                }}
                className="city-chip"
              >
                📍 {city}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
