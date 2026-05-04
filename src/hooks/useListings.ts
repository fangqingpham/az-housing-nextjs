'use client'

import { useState, useEffect, useCallback } from 'react'
import { getListings } from '@/lib/api'
import type { Listing } from '@/types'

let _cache: Listing[] | null = null
let _cacheTime = 0
const TTL = 60_000 // 1 minute

export function invalidateCache() {
  _cache = null
  _cacheTime = 0
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>(_cache || [])
  const [loading, setLoading] = useState(!_cache)

  const refresh = useCallback(async (force = false) => {
    if (!force && _cache && Date.now() - _cacheTime < TTL) {
      setListings(_cache)
      setLoading(false)
      return
    }
    setLoading(true)
    const data = await getListings()
    _cache = data
    _cacheTime = Date.now()
    setListings(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { listings, loading, refresh }
}
