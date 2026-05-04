'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Gallery from '@/components/listings/Gallery'
import PropertyMap from '@/components/map/PropertyMap'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { getListingById, insertMessage, toggleSaved, getSavedIds } from '@/lib/api'
import { safeImgs, safeFeats, safePrice, getInitials } from '@/lib/utils'
import type { Listing } from '@/types'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [msgSent, setMsgSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const { user } = useAuth()
  const { message, visible, showToast } = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const l = await getListingById(id)
      setListing(l)
      setLoading(false)
      if (user) {
        setName(`${user.fname} ${user.lname || ''}`.trim())
        setEmail(user.email)
        setPhone(user.phone || '')
        const ids = await getSavedIds(user.id)
        setSavedIds(ids)
      }
    }
    load()
  }, [id, user])

  const handleSendMessage = async (type: 'enquiry' | 'viewing' = 'enquiry') => {
    if (!name.trim()) { showToast('Please enter your name.'); return }
    if (!email.trim()) { showToast('Please enter your email.'); return }
    if (type === 'enquiry' && !msg.trim()) { showToast('Please enter a message.'); return }
    const text = type === 'viewing' ? 'I would like to request a viewing for this property.' : msg

    await insertMessage({
      id: 'm' + Date.now(),
      listingid: listing!.id,
      listingtitle: listing!.title,
      listingowner: listing!.author,
      from: name,
      fromemail: email,
      phone,
      text,
      date: new Date().toLocaleString(),
      type,
    })
    setMsgSent(true)
    setMsg('')
    showToast(type === 'viewing' ? 'Viewing request sent! 📅' : 'Message sent! The agent will contact you shortly.')
  }

  const handleToggleSave = async () => {
    if (!user) { showToast('Sign in to save properties.'); return }
    const nowSaved = await toggleSaved(user.id, listing!.id)
    setSavedIds(prev => nowSaved ? [...prev, listing!.id] : prev.filter(x => x !== listing!.id))
    showToast(nowSaved ? 'Property saved! ♥' : 'Removed from saved.')
  }

  if (loading) return <div className="empty-state" style={{ padding: '4rem' }}><p>Loading property…</p></div>
  if (!listing) return (
    <div className="empty-state" style={{ padding: '4rem' }}>
      <p>Property not found. <Link href="/" style={{ color: 'var(--accent)' }}>Go home</Link></p>
    </div>
  )

  const imgs = safeImgs(listing)
  const feats = safeFeats(listing)
  const addr = [listing.addr, listing.city, listing.province, listing.postal].filter(Boolean).join(', ')
  const isSaved = savedIds.includes(listing.id)
  const initials = listing.agent ? getInitials(listing.agent) : 'AG'

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="detail-wrap">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href={listing.type === 'For Rent' ? '/rent' : '/buy'}>
            ← Back to {listing.type === 'For Rent' ? 'Rentals' : 'For Sale'}
          </Link>
        </div>

        {/* Gallery */}
        <Gallery imgs={imgs} title={listing.title} />

        <div className="detail-layout">
          {/* Left column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div className="dprice">{safePrice(listing.price)}</div>
                <div className="dtitle">{listing.title}</div>
                <div className="dloc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 4 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {addr}
                </div>
              </div>
              <button
                onClick={handleToggleSave}
                className={`btn${isSaved ? ' btn-accent' : ''}`}
                style={{ flexShrink: 0 }}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            </div>

            {/* Specs */}
            <div className="dspecs">
              {listing.beds ? <div className="spec"><span className="sv">{listing.beds}</span><span className="sl2">Bedrooms</span></div> : null}
              {listing.baths ? <div className="spec"><span className="sv">{listing.baths}</span><span className="sl2">Bathrooms</span></div> : null}
              {listing.sqft ? <div className="spec"><span className="sv">{Number(listing.sqft).toLocaleString()}</span><span className="sl2">Sq. Ft.</span></div> : null}
              {listing.garage !== undefined && listing.garage !== 0 ? <div className="spec"><span className="sv">{listing.garage}</span><span className="sl2">Garage</span></div> : null}
            </div>

            {/* Description */}
            {(listing.description || (listing as any).desc) && (
              <>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, marginBottom: '.5rem' }}>About This Property</h3>
                <p className="ddesc">{listing.description || (listing as any).desc}</p>
              </>
            )}

            {/* Features */}
            {feats.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, marginBottom: '.75rem' }}>Features & Amenities</h3>
                <div className="feats">
                  {feats.map((f, i) => <div key={i} className="feat">{f}</div>)}
                </div>
              </>
            )}

            {/* Map */}
            {addr && (
              <>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, marginBottom: '.75rem', marginTop: '1.5rem' }}>Location</h3>
                <div className="map-box">
                  <PropertyMap address={addr} title={listing.title} />
                </div>
              </>
            )}
          </div>

          {/* Right column — Contact card */}
          <div>
            <div className="ccard">
              <div className="agent-row">
                <div className="aava">{initials}</div>
                <div>
                  <div className="aname">{listing.agent || 'A - Z Housing Agent'}</div>
                  <div className="alabel">Listed {listing.date || 'recently'} · {listing.type}</div>
                </div>
              </div>

              {listing.phone && (
                <a href={`tel:${listing.phone}`} className="btn btn-full" style={{ marginBottom: '.65rem' }}>
                  📞 {listing.phone}
                </a>
              )}

              {msgSent && (
                <div className="msg-success" style={{ display: 'block' }}>
                  ✓ Message sent! The agent will be in touch shortly.
                </div>
              )}

              <div className="fg">
                <label>Your Name</label>
                <input className="fc" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="fg">
                <label>Email</label>
                <input className="fc" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="fg">
                <label>Phone (optional)</label>
                <input className="fc" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(416) 555-0000" />
              </div>
              <div className="fg">
                <label>Message</label>
                <textarea className="fc" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Hi, I'm interested in this property…" />
              </div>
              <button className="btn btn-primary btn-full" onClick={() => handleSendMessage('enquiry')} style={{ marginBottom: '.5rem' }}>
                Send Message
              </button>
              <button className="btn btn-full" onClick={() => handleSendMessage('viewing')}>
                📅 Request a Viewing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
