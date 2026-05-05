'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { insertListing, uploadPhoto } from '@/lib/api'
import { invalidateCache } from '@/hooks/useListings'

export default function PostListingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { message, visible, showToast } = useToast()

  const [listingType, setListingType] = useState<'For Sale' | 'For Rent'>('For Sale')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [ptype, setPtype] = useState('House')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [sqft, setSqft] = useState('')
  const [garage, setGarage] = useState('')
  const [addr, setAddr] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('ON')
  const [postal, setPostal] = useState('')
  const [description, setDescription] = useState('')
  const [feats, setFeats] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login?redirect=/post-listing')
    if (user) {
      setAgentName(`${user.fname} ${user.lname || ''}`.trim())
      setAgentEmail(user.email)
    }
  }, [user, authLoading, router])

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10)
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    let errors = 0
    for (const file of files) {
      const url = await uploadPhoto(file)
      if (url) urls.push(url)
      else errors++
    }
    setUploadedPhotos(prev => [...prev, ...urls])
    setUploading(false)
    if (errors > 0) showToast(`⚠️ ${errors} photo(s) failed. Check Storage bucket exists.`)
    else if (urls.length > 0) showToast(`${urls.length} photo(s) uploaded! ✓`)
  }

  const removePhoto = (i: number) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title || !price || !addr || !city) {
      setAlertMsg('Please fill in all required fields (Title, Price, Address, City).')
      return
    }
    setAlertMsg('')
    setSubmitting(true)

    const listing = {
        title,
  price: parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0,
  price_type: listingType === 'For Rent' ? 'rent' : 'sale',
  type: ptype,
  bedrooms: parseInt(beds) || 0,
  bathrooms: parseInt(baths) || 0,
  area: parseInt(sqft) || 0,
  address: addr,
  location: `${addr}, ${city}, ${province} ${postal}`,
  city,
  province,
  description,
  features: feats.split('\n').filter(Boolean),
  images: uploadedPhotos,
  agent_name: agentName,
  agent_email: agentEmail,
  status: 'published' as const,
  author: user.id,

    }

    const result = await insertListing(listing)
    setSubmitting(false)
    if (!result) { showToast('Error publishing. Please try again.'); return }

    invalidateCache()
    showToast('Your listing is live! 🎉')
    setTimeout(() => router.push(listingType === 'For Rent' ? '/rent' : '/buy'), 1200)
  }

  if (authLoading) return <div className="empty-state" style={{ padding: '4rem' }}><p>Loading…</p></div>
  if (!user) return null

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="pl-wrap">
        <h2>Post a Listing</h2>
        <p style={{ color: 'var(--mid)', fontSize: '14px', marginBottom: '2rem' }}>
          Your listing goes live immediately after submission.
        </p>

        {alertMsg && <div className="alert alert-e">{alertMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Listing type */}
          <span className="fsec">Listing Type</span>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`btn${listingType === 'For Sale' ? ' btn-primary' : ''}`}
              onClick={() => setListingType('For Sale')}
            >For Sale</button>
            <button
              type="button"
              className={`btn${listingType === 'For Rent' ? ' btn-primary' : ''}`}
              onClick={() => setListingType('For Rent')}
            >For Rent</button>
          </div>

          {/* Basic info */}
          <span className="fsec">Basic Information</span>
          <div className="fg">
            <label>Listing Title *</label>
            <input className="fc" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Charming Detached in Rosedale" required />
          </div>
          <div className="fr">
            <div className="fg">
              <label>Price *</label>
              <input className="fc" value={price} onChange={e => setPrice(e.target.value)} placeholder={listingType === 'For Rent' ? '$2,500/mo' : '$850,000'} required />
            </div>
            <div className="fg">
              <label>Property Type</label>
              <select className="fc" value={ptype} onChange={e => setPtype(e.target.value)}>
                <option>House</option><option>Condo</option><option>Townhouse</option><option>Apartment</option>
              </select>
            </div>
          </div>
          <div className="fr">
            <div className="fg"><label>Bedrooms</label><input className="fc" type="number" min="0" value={beds} onChange={e => setBeds(e.target.value)} placeholder="e.g. 3" /></div>
            <div className="fg"><label>Bathrooms</label><input className="fc" type="number" min="0" value={baths} onChange={e => setBaths(e.target.value)} placeholder="e.g. 2" /></div>
          </div>
          <div className="fr">
            <div className="fg"><label>Square Footage</label><input className="fc" type="number" min="0" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="e.g. 1200" /></div>
            <div className="fg"><label>Garage Spaces</label><input className="fc" type="number" min="0" value={garage} onChange={e => setGarage(e.target.value)} placeholder="e.g. 1" /></div>
          </div>

          {/* Address */}
          <span className="fsec">Address</span>
          <div className="fg">
            <label>Street Address *</label>
            <input className="fc" value={addr} onChange={e => setAddr(e.target.value)} placeholder="123 Main St" required />
          </div>
          <div className="fr">
            <div className="fg"><label>City *</label><input className="fc" value={city} onChange={e => setCity(e.target.value)} placeholder="Toronto" required /></div>
            <div className="fg">
              <label>Province</label>
              <select className="fc" value={province} onChange={e => setProvince(e.target.value)}>
                {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="fg">
            <label>Postal Code</label>
            <input className="fc" value={postal} onChange={e => setPostal(e.target.value)} placeholder="M4W 1T3" style={{ maxWidth: 160 }} />
          </div>

          {/* Description */}
          <span className="fsec">Description & Features</span>
          <div className="fg">
            <label>Description</label>
            <textarea className="fc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the property…" style={{ minHeight: 120 }} />
          </div>
          <div className="fg">
            <label>Features (one per line)</label>
            <textarea className="fc" value={feats} onChange={e => setFeats(e.target.value)} placeholder="Hardwood floors&#10;Updated kitchen&#10;Backyard" />
          </div>

          {/* Photos */}
          <span className="fsec">Photos</span>
          <label className="upload-area" style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              {uploading ? 'Uploading…' : 'Click to upload photos'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mid)' }}>JPG, PNG or WEBP -- up to 10 photos</div>
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} disabled={uploading} />
          </label>
          {uploadedPhotos.length > 0 && (
            <div className="photo-previews">
              {uploadedPhotos.map((url, i) => (
                <div key={i} className="photo-prev">
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="rm"
                    onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Agent info */}
          <span className="fsec">Contact Information</span>
          <div className="fr">
            <div className="fg"><label>Agent / Seller Name</label><input className="fc" value={agentName} onChange={e => setAgentName(e.target.value)} /></div>
            <div className="fg"><label>Contact Email</label><input className="fc" type="email" value={agentEmail} onChange={e => setAgentEmail(e.target.value)} /></div>
          </div>

          <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={submitting} style={{ marginTop: '1rem' }}>
            {submitting ? 'Publishing…' : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    </>
  )
}
