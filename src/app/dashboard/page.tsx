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
  getListings, getMessages, getSavedIds,
  deleteListing, updateUser, deleteUser,
} from '@/lib/api'
import { safeImgs, safePrice, getInitials } from '@/lib/utils'
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
  // Profile fields
  const [pFname, setPFname] = useState('')
  const [pLname, setPLname] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pRole, setPRole] = useState('')
  const { message, visible, showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login?redirect=/dashboard')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setPFname(user.fname)
    setPLname(user.lname || '')
    setPPhone(user.phone || '')
    setPRole(user.role || 'buyer')
    loadTab('listings')
  }, [user])

  const loadTab = async (t: DashTab) => {
    if (!user) return
    setTab(t)
    setDataLoading(true)

    if (t === 'listings') {
      const all = await getListings()
      setMyListings(all.filter(l => l.author === user.id))
    }
    if (t === 'saved') {
      const ids = await getSavedIds(user.id)
      setSavedIds(ids)
      const all = await getListings()
      setSavedListings(all.filter(l => ids.includes(l.id)))
    }
    if (t === 'messages') {
      const all = await getMessages()
      setMessages(all.filter(m => m.listingowner === user.id))
    }

    setDataLoading(false)
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    await deleteListing(id)
    setMyListings(prev => prev.filter(l => l.id !== id))
    showToast('Listing deleted.')
  }

  const handleSaveProfile = async () => {
    if (!user) return
    await updateUser(user.id, { fname: pFname, lname: pLname, phone: pPhone, role: pRole as any })
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

  if (authLoading) return <div className="empty-state" style={{ padding: '4rem' }}><p>Loading…</p></div>
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
        <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '1.5rem' }}>
          {user.email} · Member since {user.joined || 'recently'}
        </p>

        <div className="dash-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`dash-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => loadTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {dataLoading && <div className="empty-state"><p>Loading…</p></div>}

        {/* MY LISTINGS */}
        {tab === 'listings' && !dataLoading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--mid)' }}>{myListings.length} listing{myListings.length !== 1 ? 's' : ''}</span>
              <Link href="/post-listing" className="btn btn-sm btn-accent">+ Post New Listing</Link>
            </div>
            {myListings.length === 0
              ? <p style={{ color: 'var(--mid)', fontSize: '14px' }}>You haven\'t posted any listings yet. <Link href="/post-listing" style={{ color: 'var(--accent)' }}>Post your first!</Link></p>
              : myListings.map(l => {
                const imgs = safeImgs(l)
                return (
                  <div key={l.id} className="listing-row">
                    <div className="listing-row-img">
                      {imgs[0] ? <img src={imgs[0]} alt="" /> : <HouseSVG size={24} />}
                    </div>
                    <div className="listing-row-info">
                      <div className="listing-row-title">{l.title}</div>
                      <div className="listing-row-sub">
                        {safePrice(l.price)} · {l.city} ·{' '}
                        <span style={{ color: l.status === 'published' ? 'var(--green)' : 'var(--accent)' }}>
                          {l.status || 'published'}
                        </span>
                        {' · '}{l.type}
                      </div>
                    </div>
                    <div className="listing-row-actions">
                      <Link href={`/property/${l.id}`} className="btn btn-sm">View</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteListing(l.id)}>Delete</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}

        {/* SAVED */}
        {tab === 'saved' && !dataLoading && (
          <div>
            {savedListings.length === 0
              ? <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
                You haven\'t saved any properties yet. Browse listings and tap ♡ to save.
              </p>
              : <div className="saved-grid">
                {savedListings.map(l => (
                  <PropertyCard key={l.id} listing={l} savedIds={savedIds} />
                ))}
              </div>
            }
          </div>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && !dataLoading && (
          <div>
            {messages.length === 0
              ? <p style={{ color: 'var(--mid)', fontSize: '14px' }}>
                No messages yet. When someone contacts you about a listing, it will appear here.
              </p>
              : messages.map(m => (
                <div key={m.id} className="msg-item">
                  <div className="msg-prop">
                    {m.listingtitle || 'Property enquiry'} ·{' '}
                    <span style={{ color: 'var(--mid)' }}>{m.type === 'viewing' ? 'Viewing Request' : 'Message'}</span>
                  </div>
                  <div className="msg-from">
                    {m.from} -- <a href={`mailto:${m.fromemail}`} style={{ color: 'var(--accent)' }}>{m.fromemail}</a>
                    {m.phone ? ' · ' + m.phone : ''}
                  </div>
                  <div className="msg-text">{m.text}</div>
                  <div className="msg-time">{m.date || (m as any).created_at || ''}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* PROFILE */}
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
              <input className="fc" value={user.email} disabled style={{ opacity: .6 }} />
            </div>
            <div className="fg">
              <label>Phone</label>
              <input className="fc" value={pPhone} onChange={e => setPPhone(e.target.value)} placeholder="(416) 555-0000" />
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
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '.5rem' }}>Danger Zone</h3>
            <p style={{ fontSize: '13px', color: 'var(--mid)', marginBottom: '1rem' }}>
              Deleting your account is permanent and cannot be undone. All your listings and data will be removed.
            </p>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete My Account</button>
          </div>
        )}
      </div>
    </>
  )
}
