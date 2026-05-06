import type { Listing, BlogPost } from '@/types'

// ── Image helpers ──────────────────────────────────────────────────────
export function safeImgs(l: Listing | null): string[] {
  if (!l || !l.imgs) return []
  if (Array.isArray(l.imgs)) return l.imgs.filter(Boolean) as string[]
  if (typeof l.imgs === 'string') {
    try {
      const p = JSON.parse(l.imgs)
      return Array.isArray(p) ? p.filter(Boolean) : []
    } catch { return [] }
  }
  return []
}

export function safeFeats(l: Listing | null): string[] {
  if (!l || !l.feats) return []
  if (Array.isArray(l.feats)) return l.feats.filter(Boolean) as string[]
  if (typeof l.feats === 'string') {
    try {
      const p = JSON.parse(l.feats)
      if (Array.isArray(p)) return p.filter(Boolean)
    } catch {}
    return l.feats.split('\n').filter(Boolean)
  }
  return []
}

export function safePrice(p: string | number | undefined | null): string {
  if (!p) return '--'
  const s = String(p).trim()
  if (/^\d[\d,]*(\.\d+)?(\/mo)?$/.test(s)) return '$' + s
  return s
}

// ── City coordinate lookup ─────────────────────────────────────────────
export const CITY_COORDS: Record<string, [number, number]> = {
  toronto: [43.6532, -79.3832],
  vancouver: [49.2827, -123.1207],
  ottawa: [45.4215, -75.6972],
  montreal: [45.5017, -73.5673],
  calgary: [51.0447, -114.0719],
  edmonton: [53.5461, -113.4938],
  hamilton: [43.2557, -79.8711],
  winnipeg: [49.8951, -97.1384],
  'quebec city': [46.8139, -71.2082],
  halifax: [44.6488, -63.5752],
  mississauga: [43.589, -79.6441],
  brampton: [43.7315, -79.7624],
  london: [42.9849, -81.2453],
  kitchener: [43.4516, -80.4925],
}

export function getCityCoords(listing: Listing): [number, number] {
  if (listing.lat && listing.lng) return [listing.lat, listing.lng]
  const city = (listing.city || '').toLowerCase().trim()
  return CITY_COORDS[city] || [
    43.6532 + (Math.random() - 0.5) * 0.15,
    -79.3832 + (Math.random() - 0.5) * 0.15,
  ]
}

// ── Agent initials ─────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// ── Blog posts (static data) ───────────────────────────────────────────
export const BLOGS: BlogPost[] = []


// ── Seed listings (shown when Supabase has no seed data) ───────────────
export const SEED_LISTINGS: Omit<Listing, 'created_at'>[] = [
  {
    id: 'l1', type: 'For Sale', title: 'Charming Detached in Rosedale',
    ptype: 'House', price: '$1,295,000', beds: 4, baths: 3, sqft: 2100, garage: 2,
    addr: '12 Crescent Rd', city: 'Toronto', province: 'ON', postal: 'M4W 1T3',
    description: "A beautifully maintained Victorian-era detached home on one of Rosedale's most coveted streets.",
    feats: ['Hardwood floors throughout', "Chef's kitchen with island", 'Private landscaped backyard', 'Finished basement rec room', 'Two-car garage', 'Central A/C & heating'],
    agent: 'Jane Mitchell', email: 'jane@az-housing.ca', phone: '(416) 555-0101',
    imgs: [], date: '2026-04-01', author: 'seed', status: 'published',
  },
  {
    id: 'l2', type: 'For Rent', title: 'Modern Condo with Lake Views',
    ptype: 'Condo', price: '$3,800/mo', beds: 2, baths: 2, sqft: 980, garage: 1,
    addr: '16 Harbour St', city: 'Vancouver', province: 'BC', postal: 'V6Z 2Y3',
    description: 'Stunning floor-to-ceiling lake views from this modern 2-bedroom condo in the heart of Coal Harbour.',
    feats: ['Floor-to-ceiling windows', 'In-suite laundry', 'Concierge & gym', '1 underground parking', 'Pet-friendly building', 'Walk to seawall'],
    agent: 'Marcus Lee', email: 'marcus@az-housing.ca', phone: '(604) 555-0202',
    imgs: [], date: '2026-04-05', author: 'seed', status: 'published',
  },
  {
    id: 'l3', type: 'For Sale', title: 'Townhouse Near Rideau Canal',
    ptype: 'Townhouse', price: '$879,000', beds: 3, baths: 2, sqft: 1550, garage: 1,
    addr: '44 Canal Terrace', city: 'Ottawa', province: 'ON', postal: 'K1S 3M4',
    description: 'A well-appointed three-storey townhouse just steps from the Rideau Canal and Glebe neighbourhood.',
    feats: ['Rooftop terrace', 'Updated kitchen', 'Attached garage', 'Steps to canal trails', 'Quiet family street', 'New windows & doors'],
    agent: 'Sophie Tremblay', email: 'sophie@az-housing.ca', phone: '(613) 555-0303',
    imgs: [], date: '2026-04-08', author: 'seed', status: 'published',
  },
  {
    id: 'l4', type: 'For Rent', title: 'Cozy Bachelor in Plateau-Mont-Royal',
    ptype: 'Apartment', price: '$1,650/mo', beds: 1, baths: 1, sqft: 480, garage: 0,
    addr: '88 Avenue du Mont-Royal Est', city: 'Montreal', province: 'QC', postal: 'H2T 1P5',
    description: 'Bright, renovated bachelor apartment in the heart of one of Montreal\'s most vibrant neighbourhoods.',
    feats: ['High ceilings', 'Exposed brick', 'Steps from Marché Jean-Talon', 'Coin laundry in building', 'Heat included'],
    agent: 'Camille Dubois', email: 'camille@az-housing.ca', phone: '(514) 555-0404',
    imgs: [], date: '2026-04-10', author: 'seed', status: 'published',
  },
  {
    id: 'l5', type: 'For Sale', title: 'Executive Home in Mount Pleasant',
    ptype: 'House', price: '$2,199,000', beds: 5, baths: 4, sqft: 3200, garage: 2,
    addr: '22 Oak Manor Dr', city: 'Calgary', province: 'AB', postal: 'T2S 1B3',
    description: 'Exceptional executive residence in prestigious Mount Pleasant, professionally designed throughout.',
    feats: ['Chef\'s kitchen with quartz counters', 'Home theatre', 'Triple garage', 'Heated driveway', 'Smart home system', 'Mountain views'],
    agent: 'Ryan Okafor', email: 'ryan@az-housing.ca', phone: '(403) 555-0505',
    imgs: [], date: '2026-04-12', author: 'seed', status: 'published',
  },
  {
    id: 'l6', type: 'For Rent', title: 'Sunny 2BR in Stittsville',
    ptype: 'Apartment', price: '$2,200/mo', beds: 2, baths: 1, sqft: 820, garage: 1,
    addr: '7 Maple Leaf Cres', city: 'Ottawa', province: 'ON', postal: 'K2S 0M3',
    description: 'Spacious two-bedroom in a quiet suburb minutes from the 417, newly updated with modern finishes.',
    feats: ['In-unit laundry', 'Underground parking', 'Balcony', 'Dog-friendly', 'Near schools'],
    agent: 'Sophie Tremblay', email: 'sophie@az-housing.ca', phone: '(613) 555-0606',
    imgs: [], date: '2026-04-14', author: 'seed', status: 'published',
  },
]
