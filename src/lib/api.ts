import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Listing, AppUser, Message } from '@/types'

const supa = () => getSupabaseBrowserClient()

// ── Listings ───────────────────────────────────────────────────────────
export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supa()
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
  return error ? [] : (data as Listing[])
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supa()
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()
  return error ? null : (data as Listing)
}

export async function insertListing(l: Omit<Listing, 'created_at'>): Promise<Listing | null> {
  const { data, error } = await supa().from('listings').insert([l]).select()
  if (error) { console.error('insertListing:', error); return null }
  return data[0] as Listing
}

export async function updateListing(id: string, changes: Partial<Listing>): Promise<boolean> {
  const { error } = await supa().from('listings').update(changes).eq('id', id)
  return !error
}

export async function deleteListing(id: string): Promise<boolean> {
  const { error } = await supa().from('listings').delete().eq('id', id)
  return !error
}

// ── Users ──────────────────────────────────────────────────────────────
export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supa()
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  return error ? [] : (data as AppUser[])
}

export async function findUser(email: string): Promise<AppUser | null> {
  const { data, error } = await supa()
    .from('users')
    .select('*')
    .ilike('email', email)
    .single()
  return error ? null : (data as AppUser)
}

export async function upsertUser(u: Omit<AppUser, 'created_at'>): Promise<AppUser | null> {
  const payload = {
    id: u.id,
    email: u.email,
    fname: u.fname || '',
    lname: u.lname || '',
    phone: u.phone || '',
    role: u.role || 'buyer',
  }

  const { data, error } = await supa()
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('upsertUser error:', error)
    return null
  }

  return data as AppUser
}

export async function updateUser(id: string, changes: Partial<AppUser>): Promise<boolean> {
  const { error } = await supa().from('users').update(changes).eq('id', id)
  return !error
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supa().from('users').delete().eq('id', id)
  return !error
}

export async function getUserCount(): Promise<number> {
  const { count } = await supa()
    .from('users')
    .select('*', { count: 'exact', head: true })
  return count || 0
}

// ── Messages ───────────────────────────────────────────────────────────
export async function getMessages(): Promise<Message[]> {
  const { data, error } = await supa()
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return error ? [] : (data as Message[])
}

export async function insertMessage(m: Omit<Message, 'created_at'>): Promise<boolean> {
  const { error } = await supa().from('messages').insert([m])
  return !error
}

export async function deleteMessage(id: string): Promise<boolean> {
  const { error } = await supa().from('messages').delete().eq('id', id)
  return !error
}

export async function getMessageCount(): Promise<number> {
  const { count } = await supa()
    .from('messages')
    .select('*', { count: 'exact', head: true })
  return count || 0
}

// ── Saved listings ─────────────────────────────────────────────────────
export async function getSavedIds(userId: string): Promise<string[]> {
  const { data, error } = await supa()
    .from('saved')
    .select('listing_id')
    .eq('user_id', userId)
  return error ? [] : (data || []).map(r => r.listing_id)
}

export async function toggleSaved(userId: string, listingId: string): Promise<boolean> {
  const saved = await getSavedIds(userId)
  if (saved.includes(listingId)) {
    await supa()
      .from('saved')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId)
    return false
  } else {
    await supa().from('saved').insert([{ user_id: userId, listing_id: listingId }])
    return true
  }
}

// ── Photo upload ───────────────────────────────────────────────────────
export async function uploadPhoto(file: File, prefix = 'listings'): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supa()
    .storage
    .from('property-photos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) { console.error('uploadPhoto:', error); return null }
  const { data: urlData } = supa()
    .storage
    .from('property-photos')
    .getPublicUrl(path)
  return urlData.publicUrl
}

// ── Seed data ──────────────────────────────────────────────────────────
export async function ensureSeedData(seeds: Omit<Listing, 'created_at'>[]): Promise<void> {
  const { data } = await supa()
    .from('listings')
    .select('id')
    .eq('author', 'seed')
    .limit(1)
  if (data && data.length > 0) return
  await supa().from('listings').insert(seeds)
}
