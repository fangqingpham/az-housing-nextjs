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
  if (!p) return '—'
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
export const BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: '10 Questions to Ask Before Signing a Lease',
    cat: 'Renting Advice',
    excerpt: 'Before you commit to a rental, these are the essential questions that every tenant should ask their landlord.',
    date: 'April 12, 2026',
    read: '5 min read',
    color: '#E8F4FD',
    body: `<p>Signing a lease is one of the biggest financial commitments you'll make as a renter. Before you put pen to paper, make sure you've asked these ten critical questions.</p>
    <h3>1. What is included in the rent?</h3>
    <p>Always clarify whether utilities, parking, and internet are bundled or separate costs. In many Canadian cities, hydro alone can add hundreds of dollars monthly.</p>
    <h3>2. What are the rules around guests and subletting?</h3>
    <p>Some landlords have strict policies. Understanding these upfront prevents conflicts later.</p>
    <h3>3. How are maintenance requests handled?</h3>
    <p>Ask for the average response time and whether there is 24/7 emergency support.</p>
    <h3>4. What is the pet policy?</h3>
    <p>Even if you don't have a pet today, your situation may change — and in many provinces, blanket pet bans have legal nuances worth understanding.</p>
    <h3>5. What are the lease renewal terms?</h3>
    <p>In Ontario, landlords must give 90 days' notice of rent increases. Knowing the process helps you plan ahead.</p>`,
  },
  {
    id: 'b2',
    title: 'How to Stage Your Home for a Fast Sale',
    cat: 'Selling Tips',
    excerpt: 'Professional staging can reduce time on market by up to 40%. Here\'s what the experts do — and what you can DIY.',
    date: 'April 7, 2026',
    read: '7 min read',
    color: '#FEF3DC',
    body: `<p>In a competitive market, first impressions are everything. Properly staged homes sell 40% faster and often above asking price.</p>
    <h3>Declutter First</h3>
    <p>Buyers need to envision their belongings in the space. Pack away personal photos, knick-knacks, and anything that crowds countertops or shelves.</p>
    <h3>Neutral Paint</h3>
    <p>Bold colours may appeal to you personally but can limit a buyer's imagination. A fresh coat of greige or warm white is almost always worth the investment.</p>
    <h3>Curb Appeal</h3>
    <p>Pressure-wash the driveway, add potted plants near the entry, and ensure all exterior lighting works. Buyers decide within 8 seconds whether they want to see inside.</p>`,
  },
  {
    id: 'b3',
    title: 'Understanding Mortgage Pre-Approval in Canada',
    cat: 'Buying Guide',
    excerpt: 'Pre-approval isn\'t just a formality — it\'s a strategic advantage in competitive markets. Here\'s exactly how it works.',
    date: 'March 29, 2026',
    read: '6 min read',
    color: '#E1F5EE',
    body: `<p>A mortgage pre-approval letter signals to sellers that you're serious, financially qualified, and ready to move quickly.</p>
    <h3>What Lenders Look At</h3>
    <p>Canadian lenders evaluate your gross debt service (GDS) ratio and total debt service (TDS) ratio alongside your credit score, employment history, and down payment size.</p>
    <h3>The Stress Test</h3>
    <p>Since 2018, all federally regulated lenders apply a stress test at the greater of the Bank of Canada benchmark rate or your contract rate plus 2%. This ensures you can weather rate increases.</p>
    <h3>Pre-Approval vs Pre-Qualification</h3>
    <p>A pre-qualification is an informal estimate; a pre-approval involves a hard credit check and is a conditional commitment from the lender.</p>`,
  },
  {
    id: 'b4',
    title: 'The Best Neighbourhoods in Toronto for First-Time Buyers',
    cat: 'Neighbourhood Guide',
    excerpt: 'With average detached prices approaching $1.3M, where can first-timers actually afford to buy? We looked at the data.',
    date: 'March 20, 2026',
    read: '8 min read',
    color: '#F0E8FD',
    body: `<p>Toronto's housing market is notoriously competitive, but there are still pockets of relative value for those willing to look beyond the most hyped neighbourhoods.</p>
    <h3>Scarborough</h3>
    <p>Often overlooked, Scarborough offers detached homes under $900K with strong transit access and a vibrant, diverse community.</p>
    <h3>Etobicoke</h3>
    <p>Humber Valley and surrounding areas blend suburban spaciousness with proximity to downtown. Semi-detached homes here can still be found in the $800K range.</p>
    <h3>East York</h3>
    <p>Gentrifying steadily, East York offers starter bungalows and easy access to the DVP and subway expansion.</p>`,
  },
  {
    id: 'b5',
    title: 'Condo Fees Explained: What You\'re Actually Paying For',
    cat: 'Buying Guide',
    excerpt: 'Condo maintenance fees can range from $200 to over $1,500/month. Here\'s a breakdown of what they cover and red flags to watch for.',
    date: 'March 14, 2026',
    read: '5 min read',
    color: '#FDE8E8',
    body: `<p>Maintenance fees are one of the most misunderstood costs in condo ownership. Understanding what's included — and what isn't — is critical before you buy.</p>
    <h3>What's Usually Included</h3>
    <p>Building insurance, reserve fund contributions, property management, common element upkeep (lobbies, gym, pool), and sometimes utilities like water and heat.</p>
    <h3>The Reserve Fund</h3>
    <p>This is your safety net for major repairs — roof replacement, elevator servicing, garage waterproofing. A healthy reserve fund should cover 100% of projected 30-year expenses.</p>
    <h3>Status Certificate</h3>
    <p>Always request a status certificate before purchasing. It reveals the financial health of the corporation, any pending special assessments, and whether the unit has outstanding common expense arrears.</p>`,
  },
  {
    id: 'b6',
    title: 'Vancouver vs Toronto: Which Market is Right for You?',
    cat: 'Market Analysis',
    excerpt: 'Canada\'s two hottest housing markets have very different dynamics. Here\'s a data-driven comparison to help you decide.',
    date: 'March 5, 2026',
    read: '9 min read',
    color: '#E8F0FD',
    body: `<p>Both cities consistently rank among the world's least affordable, but their market drivers, lifestyle offerings, and long-term outlooks differ significantly.</p>
    <h3>Affordability</h3>
    <p>Metro Vancouver's benchmark detached home price consistently exceeds Toronto's by roughly 15–20%, driven in part by land scarcity between mountains and ocean.</p>
    <h3>Rental Market</h3>
    <p>Vancouver has Canada's tightest rental vacancy rate (often below 1%), pushing rents higher. Toronto offers more supply diversity with active condo development.</p>
    <h3>Lifestyle Considerations</h3>
    <p>Vancouver's outdoor lifestyle, milder winters, and proximity to ski resorts attract a different demographic than Toronto's cultural density and financial sector employment.</p>`,
  },
]

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
