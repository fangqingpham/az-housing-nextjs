'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import {
  getListings, updateListing, deleteListing,
  getUsers, deleteUser,
  getMessages, deleteMessage,
  getUserCount, getMessageCount,
} from '@/lib/api'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { safeImgs, safePrice, safeFeats } from '@/lib/utils'
import { invalidateCache } from '@/hooks/useListings'
import type { Listing, Message, AppUser } from '@/types'

const ADMIN_PASS_KEY = 'nf_admin_pass'
const ADMIN_SESSION_KEY = 'nf_admin_session'

type AdminTab = 'listings' | 'messages' | 'users' | 'settings'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState('')
  const [tab, setTab] = useState<AdminTab>('listings')

  // Data
  const [listings, setListings] = useState<Listing[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [stats, setStats] = useState({ total: 0, published: 0, messages: 0, users: 0 })
  const [loading, setLoading] = useState(false)

  // Edit modal
  const [editListing, setEditListing] = useState<Listing | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editType, setEditType] = useState('')
  const [editPtype, setEditPtype] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editBeds, setEditBeds] = useState('')
  const [editBaths, setEditBaths] = useState('')
  const [editSqft, setEditSqft] = useState('')
  const [editAddr, setEditAddr] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editProvince, setEditProvince] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editAgent, setEditAgent] = useState('')
  const [editAgentEmail, setEditAgentEmail] = useState('')

  // Settings
  const [sitename, setSitename] = useState('A - Z Housing Solutions')
  const [tagline, setTagline] = useState("From Search to Sold, We\'ve Got You Covered")
  const [adminEmail, setAdminEmail] = useState('')
  const [heroText, setHeroText] = useState('')
  const [heroSub, setHeroSub] = useState('')
  const [newPass, setNewPass] = useState('')
  const [oldPass, setOldPass] = useState('')

  // Filters
  const [alSearch, setAlSearch] = useState('')
  const [alType, setAlType] = useState('')
  const [alStatus, setAlStatus] = useState('')
  const [amSearch, setAmSearch] = useState('')

  const { message, visible, showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === '1'
      setIsLoggedIn(loggedIn)
      if (loggedIn) loadDashboard()
    }
  }, [])

  const adminLogin = () => {
    const stored = localStorage.getItem(ADMIN_PASS_KEY)
    if (!passInput || passInput.length < 4) { setPassError('Password must be at least 4 characters.'); return }
    if (!stored) {
      localStorage.setItem(ADMIN_PASS_KEY, passInput)
      localStorage.setItem(ADMIN_SESSION_KEY, '1')
      setIsLoggedIn(true)
      showToast('Admin password set! Welcome. 🔐')
      loadDashboard()
    } else if (passInput === stored) {
      localStorage.setItem(ADMIN_SESSION_KEY, '1')
      setIsLoggedIn(true)
      loadDashboard()
    } else {
      setPassError('Incorrect admin password.')
    }
  }

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setIsLoggedIn(false)
    showToast('Admin panel locked.')
  }

  const loadDashboard = async () => {
    setLoading(true)
    const [ls, uc, mc] = await Promise.all([getListings(), getUserCount(), getMessageCount()])
    const published = ls.filter(l => l.status === 'published' || l.author === 'seed').length
    setStats({ total: ls.length, published, messages: mc, users: uc })
    setListings(ls)
    setLoading(false)

    // Load settings
    const s = JSON.parse(localStorage.getItem('nf_admin_settings') || '{}')
    if (s.sitename) setSitename(s.sitename)
    if (s.tagline) setTagline(s.tagline)
    if (s.email) setAdminEmail(s.email)
    if (s.hero) setHeroText(s.hero)
    if (s.herosub) setHeroSub(s.herosub)
  }

  const loadTab = async (t: AdminTab) => {
    setTab(t)
    setLoading(true)
    if (t === 'listings') setListings(await getListings())
    if (t === 'messages') setMessages(await getMessages())
    if (t === 'users') setUsers(await getUsers())
    setLoading(false)
  }

  const openEdit = (l: Listing) => {
    setEditListing(l)
    setEditTitle(l.title)
    setEditPrice(l.price)
    setEditType(l.type)
    setEditPtype(l.ptype)
    setEditStatus(l.status)
    setEditBeds(String(l.beds || ''))
    setEditBaths(String(l.baths || ''))
    setEditSqft(String(l.sqft || ''))
    setEditAddr(l.addr)
    setEditCity(l.city)
    setEditProvince(l.province)
    setEditDesc(l.description)
    setEditAgent(l.agent)
    setEditAgentEmail(l.email)
  }

  const saveEdit = async () => {
    if (!editListing) return
    await updateListing(editListing.id, {
      title: editTitle, price: editPrice, type: editType as any, ptype: editPtype,
      status: editStatus as any, beds: parseInt(editBeds) || 0, baths: parseInt(editBaths) || 0,
      sqft: parseInt(editSqft) || 0, addr: editAddr, city: editCity, province: editProvince,
      description: editDesc, agent: editAgent, email: editAgentEmail,
    })
    invalidateCache()
    setEditListing(null)
    await loadTab('listings')
    showToast('Listing updated! ✓')
  }

  const approveListing = async (id: string) => {
    await updateListing(id, { status: 'published' })
    invalidateCache()
    await loadTab('listings')
    showToast('Listing approved! ✓')
  }

  const adminDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await deleteListing(id)
    invalidateCache()
    setListings(prev => prev.filter(l => l.id !== id))
    showToast('Listing deleted.')
  }

  const adminDeleteMessage = async (id: string) => {
    await deleteMessage(id)
    setMessages(prev => prev.filter(m => m.id !== id))
    showToast('Message deleted.')
  }

  const adminDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    showToast('User deleted.')
  }

  const clearAllListings = async () => {
    if (!confirm('Delete ALL non-seed listings?')) return
    const supa = getSupabaseBrowserClient()
    await supa.from('listings').delete().neq('author', 'seed')
    invalidateCache()
    await loadTab('listings')
    showToast('All user listings deleted.')
  }

  const saveSettings = () => {
    const s = { sitename, tagline, email: adminEmail, hero: heroText, herosub: heroSub }
    localStorage.setItem('nf_admin_settings', JSON.stringify(s))
    showToast('Settings saved! ✓')
  }

  const changePass = () => {
    const stored = localStorage.getItem(ADMIN_PASS_KEY)
    if (oldPass !== stored) { showToast('Current password is incorrect.'); return }
    if (newPass.length < 4) { showToast('New password must be at least 4 characters.'); return }
    localStorage.setItem(ADMIN_PASS_KEY, newPass)
    setOldPass(''); setNewPass('')
    showToast('Admin password updated! 🔐')
  }

  // Filter listings
  const filteredListings = listings.filter(l => {
    if (alSearch && !l.title.toLowerCase().includes(alSearch.toLowerCase()) && !(l.city || '').toLowerCase().includes(alSearch.toLowerCase())) return false
    if (alType && l.type !== alType) return false
    if (alStatus && (l.status || 'published') !== alStatus) return false
    return true
  })

  const filteredMessages = messages.filter(m => {
    if (amSearch && !(m.from || '').toLowerCase().includes(amSearch.toLowerCase()) && !(m.listingtitle || '').toLowerCase().includes(amSearch.toLowerCase())) return false
    return true
  })

  if (!isLoggedIn) {
    return (
      <>
        <Toast message={message} visible={visible} />
        <div className="auth-wrap">
          <h2>Admin Access</h2>
          <p className="auth-sub">
            {typeof window !== 'undefined' && !localStorage.getItem(ADMIN_PASS_KEY)
              ? '🔐 No admin password set. Enter a new password to create your admin access.'
              : '💡 Enter your admin password to access the dashboard.'
            }
          </p>
          {passError && <div className="auth-err">{passError}</div>}
          <div className="fg">
            <label>Admin Password</label>
            <input
              className="fc"
              type="password"
              placeholder="Enter password"
              value={passInput}
              onChange={e => setPassInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adminLogin()}
            />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={adminLogin}>Access Admin Panel</button>
        </div>
      </>
    )
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      {editListing && (
        <div className="modal-overlay" onClick={() => setEditListing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditListing(null)}>✕</button>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', marginBottom: '1.25rem' }}>Edit Listing</h3>
            <div className="fg"><label>Title</label><input className="fc" value={editTitle} onChange={e => setEditTitle(e.target.value)} /></div>
            <div className="fr">
              <div className="fg"><label>Price</label><input className="fc" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>
              <div className="fg">
                <label>Type</label>
                <select className="fc" value={editType} onChange={e => setEditType(e.target.value)}>
                  <option>For Sale</option><option>For Rent</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg">
                <label>Property Type</label>
                <select className="fc" value={editPtype} onChange={e => setEditPtype(e.target.value)}>
                  <option>House</option><option>Condo</option><option>Townhouse</option><option>Apartment</option>
                </select>
              </div>
              <div className="fg">
                <label>Status</label>
                <select className="fc" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="published">Published</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Beds</label><input className="fc" type="number" value={editBeds} onChange={e => setEditBeds(e.target.value)} /></div>
              <div className="fg"><label>Baths</label><input className="fc" type="number" value={editBaths} onChange={e => setEditBaths(e.target.value)} /></div>
            </div>
            <div className="fg"><label>Street Address</label><input className="fc" value={editAddr} onChange={e => setEditAddr(e.target.value)} /></div>
            <div className="fr">
              <div className="fg"><label>City</label><input className="fc" value={editCity} onChange={e => setEditCity(e.target.value)} /></div>
              <div className="fg"><label>Province</label><input className="fc" value={editProvince} onChange={e => setEditProvince(e.target.value)} /></div>
            </div>
            <div className="fg"><label>Description</label><textarea className="fc" value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
            <div className="fr">
              <div className="fg"><label>Agent Name</label><input className="fc" value={editAgent} onChange={e => setEditAgent(e.target.value)} /></div>
              <div className="fg"><label>Agent Email</label><input className="fc" value={editAgentEmail} onChange={e => setEditAgentEmail(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
              <button className="btn" onClick={() => setEditListing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 500 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--mid)', fontSize: '13px' }}>A - Z Housing Solutions</p>
          </div>
          <button className="btn btn-sm btn-danger" onClick={adminLogout}>Lock Panel</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { val: stats.total, label: 'Total Listings' },
            { val: stats.published, label: 'Published' },
            { val: stats.messages, label: 'Messages' },
            { val: stats.users, label: 'Registered Users' },
          ].map(s => (
            <div key={s.label} className="astat">
              <span className="astat-val">{s.val}</span>
              <div className="astat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: '1.75rem', display: 'flex' }}>
          {(['listings', 'messages', 'users', 'settings'] as AdminTab[]).map(t => (
            <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => loadTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div className="empty-state"><p>Loading…</p></div>}

        {/* LISTINGS TAB */}
        {tab === 'listings' && !loading && (
          <>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input className="fc" style={{ maxWidth: 200, marginBottom: 0 }} placeholder="Search title or city…" value={alSearch} onChange={e => setAlSearch(e.target.value)} />
              <select className="fc" style={{ maxWidth: 140, marginBottom: 0 }} value={alType} onChange={e => setAlType(e.target.value)}>
                <option value="">All types</option><option>For Sale</option><option>For Rent</option>
              </select>
              <select className="fc" style={{ maxWidth: 140, marginBottom: 0 }} value={alStatus} onChange={e => setAlStatus(e.target.value)}>
                <option value="">All status</option><option value="published">Published</option><option value="pending">Pending</option>
              </select>
              <button className="btn btn-sm btn-danger" onClick={clearAllListings}>Delete All User Listings</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th></th><th>Title</th><th>Price</th><th>Type</th>
                    <th>City</th><th>Beds</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map(l => {
                    const imgs = safeImgs(l)
                    const status = l.status || 'published'
                    const isSeed = l.author === 'seed'
                    return (
                      <tr key={l.id}>
                        <td>
                          <div className="atd-img">
                            {imgs[0] ? <img src={imgs[0]} alt="" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth={1} opacity={0.4}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
                          </div>
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--mid)' }}>{l.ptype || ''}</div>
                        </td>
                        <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{l.price || '--'}</td>
                        <td><span className={`status-pill ${l.type === 'For Rent' ? 'sp-rent' : 'sp-sale'}`}>{l.type}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--mid)' }}>{l.city}{l.province ? ', ' + l.province : ''}</td>
                        <td style={{ textAlign: 'center' }}>{l.beds || '--'}</td>
                        <td><span className={`status-pill ${status === 'published' ? 'sp-published' : 'sp-pending'}`}>{status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--mid)', whiteSpace: 'nowrap' }}>{l.date || '--'}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="btn btn-sm" onClick={() => router.push(`/property/${l.id}`)}>View</button>
                            <button className="btn btn-sm" onClick={() => openEdit(l)}>Edit</button>
                            {status === 'pending' && (
                              <button className="btn btn-sm" style={{ background: 'var(--green-l)', color: 'var(--green)', borderColor: '#9FE1CB' }} onClick={() => approveListing(l.id)}>Approve</button>
                            )}
                            {!isSeed && (
                              <button className="btn btn-sm btn-danger" onClick={() => adminDeleteListing(l.id)}>Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredListings.length === 0 && <div className="empty-state"><p>No listings match your filters.</p></div>}
            </div>
          </>
        )}

        {/* MESSAGES TAB */}
        {tab === 'messages' && !loading && (
          <>
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
              <input className="fc" style={{ maxWidth: 260, marginBottom: 0 }} placeholder="Search messages…" value={amSearch} onChange={e => setAmSearch(e.target.value)} />
            </div>
            {filteredMessages.length === 0
              ? <div className="empty-state"><p>No messages yet.</p></div>
              : filteredMessages.map(m => (
                <div key={m.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                        📋 {m.listingtitle || 'General'} · {m.type === 'viewing' ? '🗓 Viewing' : '💬 Message'}
                      </div>
                      <div style={{ fontWeight: 500 }}>{m.from || 'Unknown'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--light)' }}>{m.date || ''}</span>
                      <button className="btn btn-sm btn-danger" onClick={() => adminDeleteMessage(m.id)}>Delete</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--mid)', fontStyle: 'italic', marginBottom: '.4rem' }}>"{m.text}"</div>
                  <div style={{ fontSize: 12, display: 'flex', gap: '1rem', color: 'var(--mid)' }}>
                    {m.fromemail && <span>✉️ <a href={`mailto:${m.fromemail}`} style={{ color: 'var(--accent)' }}>{m.fromemail}</a></span>}
                    {m.phone && <span>📞 {m.phone}</span>}
                    {m.listingid && <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => router.push(`/property/${m.listingid}`)}>→ View Property</span>}
                  </div>
                </div>
              ))
            }
          </>
        )}

        {/* USERS TAB */}
        {tab === 'users' && !loading && (
          <>
            {users.length === 0
              ? <div className="empty-state"><p>No registered users yet.</p></div>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 500 }}>{u.fname} {u.lname || ''}</td>
                          <td style={{ fontSize: 13 }}>{u.email}</td>
                          <td><span className="status-pill sp-published">{u.role || 'buyer'}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--mid)' }}>{u.phone || '--'}</td>
                          <td style={{ fontSize: 12, color: 'var(--mid)' }}>{u.joined || '--'}</td>
                          <td><button className="btn btn-sm btn-danger" onClick={() => adminDeleteUser(u.id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div style={{ maxWidth: 560 }}>
            <span className="fsec">Site Settings</span>
            <div className="fg"><label>Site Name</label><input className="fc" value={sitename} onChange={e => setSitename(e.target.value)} /></div>
            <div className="fg"><label>Tagline</label><input className="fc" value={tagline} onChange={e => setTagline(e.target.value)} /></div>
            <div className="fg"><label>Contact Email</label><input className="fc" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} /></div>
            <div className="fg"><label>Hero Title</label><input className="fc" value={heroText} onChange={e => setHeroText(e.target.value)} /></div>
            <div className="fg"><label>Hero Subtitle</label><input className="fc" value={heroSub} onChange={e => setHeroSub(e.target.value)} /></div>
            <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>

            <span className="fsec" style={{ marginTop: '2rem' }}>Change Admin Password</span>
            <div className="fg"><label>Current Password</label><input className="fc" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} /></div>
            <div className="fg"><label>New Password</label><input className="fc" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
            <button className="btn btn-outline" onClick={changePass}>Update Password</button>
          </div>
        )}
      </div>
    </>
  )
}
