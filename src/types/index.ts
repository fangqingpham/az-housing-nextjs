export interface Listing {
  id: string
  type: 'For Sale' | 'For Rent'
  title: string
  ptype: string
  price: string
  beds: number
  baths: number
  sqft: number
  garage: number
  addr: string
  city: string
  province: string
  postal: string
  description: string
  feats: string[] | string
  agent: string
  email: string
  phone?: string
  imgs: string[] | string
  date: string
  author: string
  status: 'published' | 'pending'
  lat?: number
  lng?: number
  created_at?: string
}

export interface AppUser {
  id: string
  fname: string
  lname: string
  email: string
  phone?: string
  role: 'buyer' | 'landlord' | 'agent' | 'admin'  // ← 'admin' added for CRM access
  joined?: string
  created_at?: string
}

export interface Message {
  id: string
  listingid: string
  listingtitle: string
  listingowner: string
  from: string
  fromemail: string
  phone?: string
  text: string
  date: string
  type: 'enquiry' | 'viewing'
  created_at?: string
}

export interface SavedListing {
  user_id: string
  listing_id: string
}

export interface AdminSettings {
  sitename?: string
  tagline?: string
  email?: string
  hero?: string
  herosub?: string
  logoUrl?: string
  heroBg?: string
  favicon?: string
}

export interface BlogPost {
  id: string
  title: string
  cat: string
  excerpt: string
  date: string
  read: string
  readTime?: string
  color: string
  body: string
  image?: string
  author?: string
}

export type MapFilter = 'all' | 'sale' | 'rent'
