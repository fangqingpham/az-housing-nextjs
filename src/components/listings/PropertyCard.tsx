'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import HouseSVG from '@/components/ui/HouseSVG'
import { safeImgs, safePrice } from '@/lib/utils'
import type { Listing } from '@/types'

interface PropertyCardProps {
  listing: Listing
  savedIds: string[]
  onToggleSave?: (e: React.MouseEvent, id: string) => void
  isNew?: boolean
}

export default function PropertyCard({
  listing: l,
  savedIds,
  onToggleSave,
  isNew = false,
}: PropertyCardProps) {
  const router = useRouter()
  const imgs = safeImgs(l)
  const isSaved = savedIds.includes(l.id)
  const isRent = l.type === 'For Rent'

  return (
    <div className="card" onClick={() => router.push(`/property/${l.id}`)}>
      <div className="card-img">
        {imgs[0] ? (
          <img
            src={imgs[0]}
            alt={l.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="no-img"><HouseSVG /></div>
        )}
        <span className={`cbadge ${isRent ? 'b-rent' : 'b-sale'}`}>
          {l.type}
        </span>
        {isNew && <span className="cbadge b-new" style={{ left: 'auto', right: 44 }}>New</span>}
        {onToggleSave && (
          <button
            className={`cwish${isSaved ? ' saved' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleSave(e, l.id) }}
            aria-label="Save listing"
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="cbody">
        <div className="cprice">{safePrice(l.price)}</div>
        <div className="ctitle">{l.title}</div>
        <div className="cloc">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {[l.city, l.province].filter(Boolean).join(', ')}
        </div>
        <div className="cmeta">
          {l.beds ? <span>🛏 {l.beds} bed</span> : null}
          {l.baths ? <span>🚿 {l.baths} bath</span> : null}
          {l.sqft ? <span>📐 {Number(l.sqft).toLocaleString()} sqft</span> : null}
        </div>
      </div>
    </div>
  )
}
