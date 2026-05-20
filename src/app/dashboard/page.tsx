'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PropertyCard from '@/components/listings/PropertyCard'
import Toast from '@/components/ui/Toast'
import HouseSVG from '@/components/ui/HouseSVG'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import {
  getListings,
  getMessages,
  getSavedIds,
  deleteListing,
  updateUser,
  deleteUser,
} from '@/lib/api'
import { safeImgs, safePrice } from '@/lib/utils'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Listing, Message } from '@/types'

type DashTab = 'listings' | 'saved' | 'messages' | 'profile'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut, reload } = useAuth()
  const [tab, setTab] = useState<DashTab>('listings')
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [savedListings, setSavedListings] = useState<Listing[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const [pFname, setPFname] = useState('')
  const [pLname, setPLname] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pRole, setPRole] = useState('')

  const { message, visible, showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    setPFname(user.fname || '')
    setPLname(user.lname || '')
    setPPhone(user.phone || '')
    setPRole(user.role || 'buyer')

    loadTab('listings')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadTab = async (selectedTab: DashTab) => {
    if (!user) return

    setTab(selectedTab)
    setDataLoading(true)

    try {
      if (selectedTab === 'listings') {
        const all = await getListings()
        setMyListings(all.filter(listing => String(listing.author) === String(user.id)))
      }

      if (selectedTab === 'saved') {
        const ids = await getSavedIds(user.id)
        setSavedIds(ids)

        const all = await getListings()
        setSavedListings(all.filter(listing => ids.includes(listing.id)))
      }

      if (selectedTab === 'messages') {
        const all = await getMessages()

        // Your current messages table is general-contact style:
        // listing_id, name, email, phone, message, viewing_date, created_at.
        // So we show all messages for now.
        setMessages(all)
      }
    } catch (error) {
      console.error('Dashboard load error:', error)
      showToast('Could not load dashboard data.')
    }

    setDataLoading(false)
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return

    const ok = await deleteListing(id)

    if (!ok) {
      showToast('Could not delete listing.')
      return
    }

    setMyListings(prev => prev.filter(listing => listing.id !== id))
    showToast('Listing deleted.')
  }

  const handleSaveProfile = async () => {
    if (!user) return

    const ok = await updateUser(user.id, {
      fname: pFname,
      lname: pLname,
      phone: pPhone,
      role: pRole as any,
    })

    if (!ok) {
      showToast('Could not update profile.')
      return
    }

    await reload()
    showToast('Profile updated!')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? All your listings and data will be removed. This cannot be undone.')) return
    if (!user) return

    const supa = getSupabaseBrowserClient()

    await deleteUser(user.id)
    await supa.from('listings').delete().eq('author', user.id)
    await supa.from('saved').delete().eq('user_id', user.id)

    await signOut()

    showToast('Account deleted.')
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="empty-state" style={{ padding: '4rem' }}>
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) return null

  const tabs: { id: DashTab; label: string }[] = [
    { id: 'listings', label: 'My Listings' },
    { id: 'saved', label: 'Saved' },
    { id: 'messages', label: 'Messages' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <>
      <Toast message={message} visible={visible} />

      <div className="dash-wrap">
        <h2>Welcome, {user.fname}</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
  <p style={{ color: 'var(--mid)', fontSize: '14px', margin: 0 }}>
    {user.email} · Member since {user.joined || 'recently'}
  </p>

  <button
    className="btn btn-sm btn-danger"
    onClick={async () => {
      await signOut()
      router.push('/')
    }}
  >
    Log Out
  </button>
</div>

        <div className="dash-tabs">
          {tabs.map(item => (
            <button
              key={item.id}
              className={`dash-tab${tab === item.id ? ' active' : ''}`}
              onClick={() => loadTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="empty-state">
            <p>Loading…</p>
          </div>
        )}

        {tab === 'listings' && !dataLoading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--mid)' }}>
                {myListings.length} listing{myListings.length !== 1 ? 's' : ''}
              </span>

              <Link href="/post-listing" className="btn btn-sm btn-accent">
                + Post New Listing
              </Link>
            </div>

            {myListings.length === 0 ? (
              <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
                You haven&apos;t posted any listings yet.{' '}
                <Link href="/post-listing" style={{ color: 'var(--accent)' }}>
                  Post your first!
                </Link>
              </p>
            ) : (
              myListings.map(listing => {
                const imgs = safeImgs(listing)

                return (
                  <div key={listing.id} className="listing-row">
                    <div className="listing-row-img">
                      {imgs[0] ? <img src={imgs[0]} alt="" /> : <HouseSVG size={24} />}
                    </div>

                    <div className="listing-row-info">
                      <div className="listing-row-title">{listing.title}</div>

                      <div className="listing-row-sub">
                        {safePrice(listing.price)} · {listing.city} ·{' '}
                        <span style={{ color: listing.status === 'published' ? 'var(--green)' : 'var(--accent)' }}>
                          {listing.status || 'published'}
                        </span>
                        {' · '}
                        {listing.type}
                      </div>
                    </div>

                    <div className="listing-row-actions">
                      <Link href={`/property/${listing.id}`} className="btn btn-sm">
                        View
                      </Link>

                      <Link href={`/edit-listing/${listing.id}`} className="btn btn-sm btn-primary">
                        Edit
                      </Link>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'saved' && !dataLoading && (
          <div>
            {savedListings.length === 0 ? (
              <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
                You haven&apos;t saved any properties yet. Browse listings and tap ♡ to save.
              </p>
            ) : (
              <div className="saved-grid">
                {savedListings.map(listing => (
                  <PropertyCard key={listing.id} listing={listing} savedIds={savedIds} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && !dataLoading && (
          <div>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
                No messages yet. When someone contacts you, it will appear here.
              </p>
            ) : (
              messages.map((msg: any) => (
                <div key={msg.id} className="msg-item">
                  <div className="msg-prop">
                    {msg.listing_id ? `Listing enquiry: ${msg.listing_id}` : 'Contact form message'} ·{' '}
                    <span style={{ color: 'var(--mid)' }}>
                      {msg.viewing_date ? `Viewing date: ${msg.viewing_date}` : 'General Message'}
                    </span>
                  </div>

                  <div className="msg-from">
                    {msg.name || 'Unknown'} --{' '}
                    <a href={`mailto:${msg.email}`} style={{ color: 'var(--accent)' }}>
                      {msg.email}
                    </a>
                    {msg.phone ? ' · ' + msg.phone : ''}
                  </div>

                  <div className="msg-text">{msg.message}</div>

                  <div className="msg-time">{msg.created_at || ''}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div className="fr">
              <div className="fg">
                <label>First Name</label>
                <input className="fc" value={pFname} onChange={e => setPFname(e.target.value)} />
              </div>

              <div className="fg">
                <label>Last Name</label>
                <input className="fc" value={pLname} onChange={e => setPLname(e.target.value)} />
              </div>
            </div>

            <div className="fg">
              <label>Email</label>
              <input className="fc" value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>

            <div className="fg">
              <label>Phone</label>
              <input
                className="fc"
                value={pPhone}
                onChange={e => setPPhone(e.target.value)}
                placeholder="(416) 555-0000"
              />
            </div>

            <div className="fg">
              <label>Role</label>
              <select className="fc" value={pRole} onChange={e => setPRole(e.target.value)}>
                <option value="buyer">Buyer / Renter</option>
                <option value="landlord">Landlord / Seller</option>
                <option value="agent">Real Estate Agent</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSaveProfile} style={{ marginBottom: '2rem' }}>
              Save Profile
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '.5rem' }}>
              Danger Zone
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '1rem' }}>
              Deleting your account is permanent and cannot be undone. All your listings and data will be removed.
            </p>

            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              Delete My Account
            </button>
          </div>
        )}
      </div>
    </>
  )
}