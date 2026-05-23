'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getListings, updateListing, deleteListing } from '@/lib/api'
import { safeImgs } from '@/lib/utils'
import { invalidateCache } from '@/hooks/useListings'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Listing } from '@/types'

export default function AdminListingsPage() {
  const router = useRouter()
  const { message, visible, showToast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editListing, setEditListing] = useState<Listing | null>(null)
  const [form, setForm] = useState<Partial<Listing>>({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setListings(await getListings())
    setLoading(false)
  }

  const openEdit = (l: Listing) => { setEditListing(l); setForm({ ...l }) }

  const saveEdit = async () => {
    if (!editListing) return
    await updateListing(editListing.id, form as any)
    invalidateCache()
    setEditListing(null)
    await load()
    showToast('Listing updated ✓')
  }

  const approve = async (id: string) => {
    await updateListing(id, { status: 'published' })
    invalidateCache()
    await load()
    showToast('Listing approved ✓')
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await deleteListing(id)
    invalidateCache()
    setListings(prev => prev.filter(l => l.id !== id))
    showToast('Listing deleted.')
  }

  const filtered = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !(l.city || '').toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && l.type !== typeFilter) return false
    if (statusFilter && (l.status || 'published') !== statusFilter) return false
    return true
  })

  const f = (key: keyof Listing) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <Toast message={message} visible={visible} />

      {editListing && (
        <div className="modal-overlay" onClick={() => setEditListing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditListing(null)}>✕</button>
            <h3 className="modal-title">Edit Listing</h3>
            <div className="fg"><label>Title</label><input className="fc" value={form.title || ''} onChange={f('title')} /></div>
            <div className="fr">
              <div className="fg"><label>Price</label><input className="fc" value={form.price || ''} onChange={f('price')} /></div>
              <div className="fg"><label>Type</label>
                <select className="fc" value={form.type || ''} onChange={f('type')}>
                  <option>For Sale</option><option>For Rent</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Property Type</label>
                <select className="fc" value={form.ptype || ''} onChange={f('ptype')}>
                  <option>House</option><option>Condo</option><option>Townhouse</option><option>Apartment</option>
                </select>
              </div>
              <div className="fg"><label>Status</label>
                <select className="fc" value={form.status || 'published'} onChange={f('status')}>
                  <option value="published">Published</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Beds</label><input className="fc" type="number" value={form.beds ?? ''} onChange={f('beds')} /></div>
              <div className="fg"><label>Baths</label><input className="fc" type="number" value={form.baths ?? ''} onChange={f('baths')} /></div>
              <div className="fg"><label>Sqft</label><input className="fc" type="number" value={form.sqft ?? ''} onChange={f('sqft')} /></div>
            </div>
            <div className="fg"><label>Street Address</label><input className="fc" value={form.addr || ''} onChange={f('addr')} /></div>
            <div className="fr">
              <div className="fg"><label>City</label><input className="fc" value={form.city || ''} onChange={f('city')} /></div>
              <div className="fg"><label>Province</label><input className="fc" value={form.province || ''} onChange={f('province')} /></div>
            </div>
            <div className="fg"><label>Description</label><textarea className="fc" rows={4} value={form.description || ''} onChange={f('description')} /></div>
            <div className="fr">
              <div className="fg"><label>Agent Name</label><input className="fc" value={form.agent || ''} onChange={f('agent')} /></div>
              <div className="fg"><label>Agent Email</label><input className="fc" value={form.email || ''} onChange={f('email')} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
              <button className="btn" onClick={() => setEditListing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Listings</h1>
            <p className="page-sub">{listings.length} total · {listings.filter(l => l.status === 'pending').length} pending approval</p>
          </div>
          <button className="btn-accent-pill" onClick={() => router.push('/post-listing')}>+ Post Listing</button>
        </div>

        <div className="filter-bar">
          <input className="fc filter-input" placeholder="Search title or city…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fc filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option><option>For Sale</option><option>For Rent</option>
          </select>
          <select className="fc filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All status</option><option value="published">Published</option><option value="pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-msg">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-msg">No listings match your filters.</div>
        ) : (
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th></th><th>Title</th><th>Price</th><th>Type</th>
                  <th>City</th><th>Beds</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const imgs = safeImgs(l)
                  const status = l.status || 'published'
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="thumb">
                          {imgs[0]
                            ? <img src={imgs[0]} alt="" />
                            : <span style={{ color: '#f5a623', opacity: 0.4, fontSize: 20 }}>🏠</span>}
                        </div>
                      </td>
                      <td>
                        <div className="td-name">{l.title}</div>
                        <div className="td-sub">{l.ptype}</div>
                      </td>
                      <td className="td-mono">{l.price || '--'}</td>
                      <td><span className={`pill ${l.type === 'For Rent' ? 'pill-rent' : 'pill-sale'}`}>{l.type}</span></td>
                      <td className="td-sub">{l.city}{l.province ? ', ' + l.province : ''}</td>
                      <td className="td-center">{l.beds || '--'}</td>
                      <td><span className={`pill ${status === 'published' ? 'pill-pub' : 'pill-pend'}`}>{status}</span></td>
                      <td className="td-sub td-nowrap">{l.date || '--'}</td>
                      <td>
                        <div className="action-row">
                          <button className="btn btn-sm" onClick={() => router.push(`/property/${l.id}`)}>View</button>
                          <button className="btn btn-sm" onClick={() => openEdit(l)}>Edit</button>
                          {status === 'pending' && (
                            <button className="btn btn-sm btn-approve" onClick={() => approve(l.id)}>Approve</button>
                          )}
                          {l.author !== 'seed' && (
                            <button className="btn btn-sm btn-danger" onClick={() => remove(l.id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-shell { padding: clamp(24px,3vw,40px) clamp(20px,3vw,40px); max-width: 1200px; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
        .page-title { font-family:Georgia,serif; font-size:26px; font-weight:600; color:#1b2a4a; margin:0 0 4px; }
        .page-sub { font-size:13px; color:#6b6b67; margin:0; }
        .btn-accent-pill {
          background:#f5a623; color:#1e2a45; border:none; border-radius:999px;
          padding:10px 22px; font-weight:700; font-size:13px; letter-spacing:1.5px;
          text-transform:uppercase; cursor:pointer; white-space:nowrap;
          box-shadow:0 4px 14px rgba(245,166,35,0.28); transition:background 0.18s,transform 0.18s;
        }
        .btn-accent-pill:hover { background:#d4891a; transform:translateY(-1px); }
        .filter-bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .filter-input { max-width:220px; margin-bottom:0 !important; }
        .filter-select { max-width:150px; margin-bottom:0 !important; }
        .empty-msg { text-align:center; color:#a8a8a4; padding:48px; background:#fff; border-radius:12px; border:1px solid #e4e1d8; }
        .table-wrap { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; overflow:auto; }
        .crm-table { width:100%; border-collapse:collapse; font-size:13.5px; }
        .crm-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#a8a8a4; border-bottom:1px solid #e4e1d8; background:#fafaf8; white-space:nowrap; }
        .crm-table td { padding:12px 14px; border-bottom:1px solid #f0ede6; vertical-align:middle; }
        .crm-table tbody tr:last-child td { border-bottom:none; }
        .crm-table tbody tr:hover td { background:#fafaf8; }
        .thumb { width:42px; height:42px; border-radius:8px; overflow:hidden; background:#f7f4ef; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .thumb img { width:100%; height:100%; object-fit:cover; }
        .td-name { font-weight:600; color:#1b2a4a; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .td-sub { font-size:12px; color:#a8a8a4; }
        .td-mono { font-weight:600; white-space:nowrap; color:#1b2a4a; }
        .td-center { text-align:center; }
        .td-nowrap { white-space:nowrap; }
        .pill { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:capitalize; border:1px solid transparent; }
        .pill-sale { background:#e8f4fd; color:#1a5ea8; border-color:#c2daf5; }
        .pill-rent { background:#e1f5ee; color:#2d7a4f; border-color:#9fe1cb; }
        .pill-pub { background:#e1f5ee; color:#2d7a4f; border-color:#9fe1cb; }
        .pill-pend { background:#fef3dc; color:#a86d1a; border-color:#f5d38a; }
        .action-row { display:flex; gap:6px; flex-wrap:wrap; }
        .btn-approve { background:#e1f5ee !important; color:#2d7a4f !important; border-color:#9fe1cb !important; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
        .modal-box { background:#fff; border-radius:18px; padding:32px 28px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; position:relative; }
        .modal-close { position:absolute; top:14px; right:16px; background:none; border:none; font-size:18px; cursor:pointer; color:#a8a8a4; line-height:1; }
        .modal-close:hover { color:#1b2a4a; }
        .modal-title { font-family:Georgia,serif; font-size:22px; font-weight:600; color:#1b2a4a; margin:0 0 20px; }
        .modal-actions { display:flex; gap:8px; margin-top:12px; }
        .fg { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
        .fg label { font-size:11px; font-weight:700; letter-spacing:0.5px; color:#6b6b67; text-transform:uppercase; }
        .fr { display:flex; gap:12px; }
        .fr .fg { flex:1; }
        .fc { border:1px solid #e4e1d8; border-radius:8px; padding:9px 12px; font-size:14px; font-family:inherit; outline:none; width:100%; transition:border-color 0.18s; background:#fafaf8; }
        .fc:focus { border-color:#f5a623; }
        .btn { background:#fff; border:1px solid #e4e1d8; border-radius:7px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.15s,border-color 0.15s; color:#1b2a4a; }
        .btn:hover { background:#f7f4ef; border-color:#d4cfc5; }
        .btn-sm { padding:5px 10px; font-size:11.5px; }
        .btn-primary { background:#f5a623; color:#1e2a45; border-color:#f5a623; }
        .btn-primary:hover { background:#d4891a; border-color:#d4891a; }
        .btn-danger { background:#fcebeb !important; color:#a32d2d !important; border-color:#e8a5a5 !important; }
        .btn-danger:hover { background:#f8d5d5 !important; }
      `}</style>
    </>
  )
}
