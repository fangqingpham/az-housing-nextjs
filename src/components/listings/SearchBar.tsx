'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  mode: 'sale' | 'rent'
  onModeChange: (mode: 'sale' | 'rent') => void
}

export default function SearchBar({ mode, onModeChange }: SearchBarProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [beds, setBeds] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (beds) params.set('beds', beds)
    const dest = mode === 'sale' ? '/buy' : '/rent'
    router.push(`${dest}?${params.toString()}`)
  }

  return (
    <>
      <div className="main-tabs">
        <button
          className={`main-tab${mode === 'sale' ? ' active' : ''}`}
          onClick={() => onModeChange('sale')}
        >
          For Sale
        </button>
        <button
          className={`main-tab${mode === 'rent' ? ' active' : ''}`}
          onClick={() => onModeChange('rent')}
        >
          For Rent
        </button>
      </div>

      <div className="search-bar">
        <svg width="14" height="14" fill="none" stroke="#6B6B67" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="City, address or postal code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <div className="sdiv" />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">Any type</option>
          <option>House</option>
          <option>Condo</option>
          <option>Townhouse</option>
          <option>Apartment</option>
        </select>
        <div className="sdiv" />
        <select value={beds} onChange={e => setBeds(e.target.value)}>
          <option value="">Any beds</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <button className="btn btn-accent btn-sm" onClick={handleSearch}>
          Search
        </button>
      </div>
    </>
  )
}
