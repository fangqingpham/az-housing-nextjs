'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
type Role = 'bot' | 'user'

interface Message {
  id: number
  role: Role
  text: string
  quickReplies?: string[]
}

type LeadField = 'name' | 'email' | 'phone' | 'message'
type CollectionStep = LeadField | 'done' | null

interface LeadData {
  name: string
  email: string
  phone: string
  message: string
}

// ─────────────────────────────────────────────────────────────────
// FAQ Knowledge Base
// ─────────────────────────────────────────────────────────────────
const DISCLAIMER =
  '\n\n⚠️ *This is general information only. Please contact us for advice specific to your situation.*'

interface FAQEntry {
  id: string
  keywords: string[]
  answer: string
  disclaimer?: boolean
  quickReplies?: string[]
  triggerLead?: boolean
  urgent?: boolean
}

const FAQ: FAQEntry[] = [
  {
    id: 'services',
    keywords: ['service', 'offer', 'provide', 'do you', 'what can', 'help with', 'available', 'what do you do'],
    answer:
      'A-Z Housing Solutions offers a full range of real estate services across Canada:\n\n• 🔐 **Tenant Placement** — find & screen reliable tenants\n• 🛠️ **Property Management** — day-to-day management support\n• 🏦 **Mortgage Assistance** — 50+ lenders, all file types\n• 🏡 **Realtor Service** — buying & selling guidance\n• ⚖️ **Legal Referrals** — paralegals, real estate lawyers\n• 🤝 **Trusted Trade Referrals** — vetted contractors & renovators\n\nWhich service would you like to know more about?',
    quickReplies: ['Tenant Placement', 'Property Management', 'Mortgage Help', 'Realtor Service'],
  },
  {
    id: 'tenant-placement',
    keywords: ['tenant placement', 'find tenant', 'place tenant', 'rental listing', 'list my property', 'advertise rental', 'post rental', 'need a tenant', 'looking for tenant'],
    answer:
      'Our **Tenant Placement** service helps landlords find reliable, responsible tenants fast.\n\nWhat\'s included:\n• Listing your property on our website (free)\n• Credit & background checks\n• Employment & income verification\n• Court filing search (OpenRoom)\n• Landlord reference checks\n• Candidate recommendation\n\nFlat fee: **$995** (A-Z Private Leasing) or **1 month\'s rent** (Realtor MLS Full Package).\n\nWould you like to get started or speak with our team?',
    quickReplies: ['Get started', 'Tell me about pricing', 'Contact Us'],
  },
  {
    id: 'screening',
    keywords: ['screen', 'screening', 'background check', 'credit check', 'verify tenant', 'tenant check', 'openroom', 'eviction record', 'criminal check', 'reference check'],
    answer:
      'We run a thorough **tenant screening** process to protect your investment:\n\n✓ Full credit report\n✓ Employment & income verification\n✓ Work history & financial stability assessment\n✓ Court filing search on OpenRoom (past evictions)\n✓ Landlord reference check\n\nWe filter out high-risk applicants and only recommend candidates we\'re confident in.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Tenant Placement', 'Contact Us'],
  },
  {
    id: 'property-management',
    keywords: ['property management', 'manage property', 'property manager', 'manage my rental', 'day to day', 'landlord abroad', 'overseas landlord', 'out of country', 'manage for me', 'hands off'],
    answer:
      'Our **Property Management** service is ideal for local and overseas landlords who need reliable, hands-off support.\n\nWhat\'s included:\n• 24/7 emergency call handling\n• Repair & maintenance coordination\n• Move-in / move-out inspections\n• Regular property checks\n• Tenant communication\n\nMonthly fee: **$120/month** per property.\n\nWant to learn more or get started?',
    quickReplies: ['Get started', 'Tell me about pricing', 'Contact Us'],
  },
  {
    id: 'rent-collection',
    keywords: ['rent collection', 'collect rent', 'rent payment', 'tenant not paying', 'late rent', 'missed rent', 'unpaid rent', 'behind on rent', 'rent arrears'],
    answer:
      'If a tenant is **not paying rent**, here\'s what we generally advise:\n\n1. Send a written reminder (N4 Notice in Ontario)\n2. Allow the legal grace period\n3. If unresolved, file with the Landlord and Tenant Board (LTB)\n\nWe can connect you with a **paralegal** who specializes in landlord-tenant disputes to guide you through the process.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Eviction / LTB questions', 'Contact Us'],
  },
  {
    id: 'lease',
    keywords: ['lease', 'lease agreement', 'rental agreement', 'tenancy agreement', 'contract', 'standard lease', 'ontario lease', 'lease renewal', 'new lease', 'sign lease'],
    answer:
      'In Ontario, landlords are required to use the **Ontario Standard Lease Agreement** for most residential tenancies.\n\nWe assist with:\n• Preparing and reviewing lease agreements\n• Ensuring all required clauses are included\n• Explaining tenant and landlord rights\n• Connecting you with a real estate lawyer if needed' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Contact Us', 'Landlord support'],
  },
  {
    id: 'eviction',
    keywords: ['evict', 'eviction', 'ltb', 'landlord tenant board', 'n4', 'n12', 'n13', 'notice to vacate', 'remove tenant', 'bad tenant', 'problem tenant', 'tenant won\'t leave', 'tenant refusing'],
    answer:
      'Eviction in Ontario is a **legal process** governed by the Residential Tenancies Act.\n\nCommon steps:\n1. Serve the correct Notice (N4 for non-payment, N12 for own use, etc.)\n2. Wait the legal period for the tenant to respond\n3. File an application with the LTB if unresolved\n4. Attend the hearing\n\nWe can refer you to an experienced **paralegal** who handles LTB filings and hearings.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Connect me with a paralegal', 'Contact Us'],
  },
  {
    id: 'landlord',
    keywords: ['landlord', 'landlord support', 'landlord help', 'landlord service', 'rental property', 'investment property', 'rental income', 'i am a landlord', 'property owner'],
    answer:
      'We offer end-to-end support for **landlords** in the Greater Toronto Area:\n\n• Tenant placement & screening\n• Lease preparation\n• Property management\n• Legal referrals (paralegals, lawyers)\n• Trusted contractor referrals\n• Mortgage advice for investment properties\n\nWhat would you like help with?',
    quickReplies: ['Tenant Placement', 'Property Management', 'Contact Us'],
  },
  {
    id: 'tenant',
    keywords: ['tenant support', 'tenant help', 'tenant service', 'looking for rental', 'find a rental', 'renting', 'i am a tenant', 'need to rent', 'apartment', 'searching for home'],
    answer:
      'We also support **tenants** looking for rental properties:\n\n• Property search assistance\n• Help connecting with landlords\n• Guidance on tenant rights in Ontario\n• Advice on rental applications\n\nBrowse available listings at **www.azhouse.ca** or contact us to discuss your needs.' + DISCLAIMER,
    quickReplies: ['Contact Us', 'Service areas'],
  },
  {
    id: 'mortgage',
    keywords: ['mortgage', 'home loan', 'get approved', 'mortgage approval', 'first time buyer', 'first-time', 'pre-approval', 'pre approval', 'down payment', 'mortgage rate', 'interest rate', 'lender', 'mortgage application', 'apply for mortgage'],
    answer:
      'Our mortgage team works with **50+ lenders** across Canada to find the best rate and product for your situation.\n\nWe help with:\n• First-time home purchases\n• Renewals & refinancing\n• HELOC (Home Equity Line of Credit)\n• Investment property mortgages\n• Complex or unusual files\n\nWith 20+ years of brokerage experience and a **4.8★ client satisfaction** rating, we\'re committed to getting you approved.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Refinance', 'HELOC', 'Self-employed mortgage', 'Contact Us'],
  },
  {
    id: 'refinance',
    keywords: ['refinance', 'refinancing', 'lower my rate', 'switch lender', 'break mortgage', 'renew mortgage', 'renewal', 'better rate', 'lower interest'],
    answer:
      'Refinancing can help you:\n\n• Access a lower interest rate\n• Consolidate debt\n• Access home equity\n• Change your mortgage term or lender\n\nWe analyze your current mortgage and compare it against 50+ lenders to see if switching makes financial sense for you. Penalties may apply for breaking your term early — we\'ll walk you through the numbers.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['HELOC', 'Contact Us'],
  },
  {
    id: 'heloc',
    keywords: ['heloc', 'home equity', 'equity line', 'equity loan', 'borrow against home', 'use my equity', 'renovation loan', 'line of credit', 'equity credit'],
    answer:
      'A **HELOC (Home Equity Line of Credit)** lets you borrow against the equity you\'ve built in your home — great for:\n\n• Renovations\n• Debt consolidation\n• Education or major purchases\n• Investment opportunities\n\nTypically up to **80% of your home\'s appraised value** minus your outstanding mortgage. Rates are usually lower than personal loans.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Contact Us', 'Mortgage Help'],
  },
  {
    id: 'self-employed',
    keywords: ['self employed', 'self-employed', 'business owner', 'contractor', 'freelancer', 'no t4', 'stated income', 'hard to get mortgage', 'irregular income', 'own business', 'commission income'],
    answer:
      'We **specialize in self-employed mortgage files** — one of our core strengths.\n\nWe work with lenders who understand self-employed income, including:\n• Stated income programs\n• Business-for-self (BFS) products\n• Alt-A and B lenders\n\nYou don\'t need a T4 to qualify. We\'ll review your NOAs, business financials, and bank statements to build the strongest possible application.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Contact Us', 'Mortgage Help'],
  },
  {
    id: 'new-immigrant',
    keywords: ['new immigrant', 'newcomer', 'new to canada', 'no credit history', 'landed immigrant', 'permanent resident', 'pr', 'work permit', 'foreign worker', 'international', 'no canadian credit', 'just moved', 'recently arrived'],
    answer:
      'Yes! We help **newcomers to Canada** navigate the mortgage and rental process.\n\nMany lenders have **New to Canada mortgage programs** that consider:\n• International credit history\n• Employment letters\n• Down payment source\n\nWe also help newcomers understand tenant and landlord rights in Ontario, and connect them with the right professionals.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Contact Us', 'Mortgage Help'],
  },
  {
    id: 'language',
    keywords: ['chinese', 'mandarin', 'cantonese', 'vietnamese', 'language', 'speak', 'communicate', 'translation', 'multilingual', 'french', 'hindi', 'punjabi', 'other language'],
    answer:
      'We strive to serve clients in their preferred language. Please **contact us directly** to confirm which languages are currently available with our team.\n\n📧 info@azhouse.ca\n📞 +1 (647)-6932-932',
    quickReplies: ['Contact Us'],
  },
  {
    id: 'buying',
    keywords: ['buy', 'buying', 'purchase', 'home purchase', 'house hunting', 'looking to buy', 'find a home', 'realtor', 'real estate agent', 'buying a house', 'buying a condo'],
    answer:
      'Our **Realtors** provide patient, honest guidance throughout the buying process:\n\n• Multiple property visits — we won\'t rush you\n• Identifying structural issues & legal concerns\n• Offer strategy & negotiation\n• Connecting you with mortgage advisors & lawyers\n• Post-sale support\n\nWe protect your interests so you can buy the right home with confidence.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Mortgage Help', 'Contact Us', 'Documents needed'],
  },
  {
    id: 'selling',
    keywords: ['sell', 'selling', 'list my home', 'list my house', 'sell my property', 'home sale', 'market value', 'commission', '1%', 'realtor fee', 'selling my house', 'put house on market'],
    answer:
      'Our **home selling** service helps you maximize your sale price:\n\n• Strategic pricing analysis\n• MLS listing + marketing\n• Strong negotiation support\n• **1% flat-fee listing option** available\n• Potential savings of $5,000–$10,000 vs. traditional commissions\n• Payment only when your home sells\n\nWant a free consultation to discuss your property?',
    quickReplies: ['Free consultation', 'Contact Us'],
  },
  {
    id: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'fee', 'how much', 'charge', 'rate', 'package', 'flat fee', '995', 'affordable', 'what does it cost', 'pricing structure'],
    answer:
      'Our pricing depends on the service and your specific situation. Here\'s a general overview:\n\n• **Tenant Placement (A-Z Private):** $995 flat fee\n• **Tenant Placement (Realtor MLS):** 1 month\'s rent\n• **Property Management:** $120/month\n• **Mortgage Advice:** No upfront cost — we\'re paid by lenders\n• **Realtor Service (Buying):** No buyer agent fees in most cases\n• **Realtor Service (Selling):** 1% listing option available\n\nFor a precise quote based on your situation, please leave your contact info and we\'ll reach out.',
    quickReplies: ['Get a quote', 'Contact Us'],
  },
  {
    id: 'areas',
    keywords: ['area', 'location', 'serve', 'city', 'toronto', 'mississauga', 'brampton', 'markham', 'vaughan', 'richmond hill', 'pickering', 'oshawa', 'whitby', 'newmarket', 'gta', 'greater toronto', 'ontario', 'canada', 'where do you operate'],
    answer:
      'We primarily serve the **Greater Toronto Area (GTA)**, including:\n\n🏙️ Toronto · Mississauga · Brampton · Markham\nRichmond Hill · Vaughan · Pickering · Oshawa\nWhitby · Newmarket\n\nOur mortgage and some real estate services extend across **all of Canada**. Contact us to confirm availability in your area.',
    quickReplies: ['Contact Us'],
  },
  {
    id: 'contact',
    keywords: ['contact', 'reach', 'email', 'phone', 'call', 'address', 'office', 'where are you', 'get in touch', 'how to contact'],
    answer:
      '📧 **Email:** info@azhouse.ca\n📞 **Phone:** +1 (647) 6932-932\n🏢 **Office:** 18 King Street East, Suite 1400, Toronto, ON\n🌐 **Website:** www.azhouse.ca\n\nOr I can take your details now and have someone contact you — just say "contact me"!',
    quickReplies: ['Contact me', 'Business hours'],
  },
  {
    id: 'hours',
    keywords: ['hours', 'open', 'when', 'business hours', 'availability', 'schedule', 'weekend', 'saturday', 'sunday', 'what time', 'office hours'],
    answer:
      '🕘 **Business Hours:**\nMonday – Friday: 9:00 AM – 6:00 PM EST\nSaturday: By appointment\nSunday: Closed\n\nFor urgent matters outside business hours, email info@azhouse.ca and we\'ll respond as soon as possible.',
    quickReplies: ['Contact Us'],
  },
  {
    id: 'consultation',
    keywords: ['free', 'consultation', 'free consult', 'no cost', 'complimentary', 'no obligation', 'meet', 'appointment', 'free advice', 'talk to someone for free'],
    answer:
      'Yes! We offer a **free, no-obligation consultation** to discuss your needs.\n\nWhether you\'re a landlord, tenant, buyer, seller, or need mortgage help — we\'ll assess your situation and explain exactly how we can help.\n\nLeave your details and we\'ll reach out to schedule a time that works for you.',
    triggerLead: true,
    quickReplies: ['Book a consultation'],
  },
  {
    id: 'how-to-start',
    keywords: ['how to start', 'get started', 'begin', 'first step', 'sign up', 'onboard', 'process', 'how does it work', 'what do i do', 'where do i start'],
    answer:
      'Getting started is simple:\n\n1️⃣ **Contact us** — email, phone, or leave your details here\n2️⃣ **Free consultation** — we learn about your situation\n3️⃣ **Customized plan** — we recommend the right service\n4️⃣ **We get to work** — fast, professional, transparent\n\nWould you like to leave your contact info so we can reach out?',
    quickReplies: ['Yes, contact me', 'Contact Us'],
  },
  {
    id: 'documents',
    keywords: ['document', 'documents', 'paperwork', 'what do i need', 'bring', 'require', 'id', 'identification', 'proof', 'income proof', 'notice of assessment', 'noa', 't4', 'pay stub', 'what to prepare'],
    answer:
      'Required documents vary by service:\n\n**For Mortgage:**\n• Government-issued ID\n• Recent pay stubs or NOA (self-employed)\n• T4s (last 2 years)\n• Bank statements (3 months)\n• Property details (if purchasing)\n\n**For Tenant Placement:**\n• Proof of ownership\n• Property details & photos\n\n**For Buyers/Sellers:**\n• ID + mortgage pre-approval (buyers)\n• Property documents & recent assessment (sellers)\n\nOur team will guide you through exactly what\'s needed for your file.' + DISCLAIMER,
    disclaimer: true,
    quickReplies: ['Contact Us'],
  },
  {
    id: 'privacy',
    keywords: ['confidential', 'privacy', 'private', 'secure', 'data', 'information safe', 'share my info', 'personal information', 'protect', 'is my info safe', 'trust'],
    answer:
      'Your information is treated with the **highest level of confidentiality**.\n\nWe collect only what\'s necessary to provide our services, never sell your data to third parties, and comply with Canadian privacy laws (PIPEDA).\n\nFor details, see our Privacy Policy at **www.azhouse.ca/privacy**.',
    quickReplies: ['Contact Us'],
  },
  {
    id: 'urgent',
    keywords: ['urgent', 'emergency', 'asap', 'immediately', 'right now', 'today', 'critical', 'serious', 'flooding', 'break in', 'fire', 'damage', 'help now', 'need help now'],
    answer:
      '🚨 **For urgent matters, please contact us directly:**\n\n📞 **Call:** +1 (647) 6932-932\n📧 **Email:** info@azhouse.ca\n\nFor property emergencies (flooding, fire, break-in), call **911** first, then contact us.',
    urgent: true,
    quickReplies: ['Contact Us'],
  },
]

// ─────────────────────────────────────────────────────────────────
// Intent / keyword scoring engine
// ─────────────────────────────────────────────────────────────────
const HUMAN_TRIGGERS = [
  'human', 'agent', 'person', 'representative', 'real person',
  'talk to someone', 'speak to', 'call me', 'callback', 'call back',
  'contact me', 'reach me', 'book', 'get a quote', 'book a consultation',
  'yes contact me', 'schedule', 'appointment', 'leave my details',
  'speak with', 'get in touch', 'connect me',
]

const AFFIRMATIVES = [
  'yes', 'sure', 'ok', 'okay', 'please', 'yeah', 'yep',
  'definitely', 'absolutely', 'go ahead', 'sounds good', 'yes please',
]

const CLOSING_TRIGGERS = [
  'no',
  'no thank you',
  'no thanks',
  'nope',
  'thats all',
  'that is all',
  'nothing else',
  'bye',
  'goodbye',
  'thanks bye',
  'thank you bye',
]

const MAIN_QUICK_REPLIES = [
  'Tenant Placement',
  'Property Management',
  'Mortgage Help',
  'Realtor Service',
  'Contact Us',
]

const QUICK_REPLY_MAP: Record<string, string> = {
  'Tenant Placement':           'tenant-placement',
  'Property Management':        'property-management',
  'Mortgage Help':              'mortgage',
  'Realtor Service':            'buying',
  'Refinance':                  'refinance',
  'HELOC':                      'heloc',
  'Self-employed mortgage':     'self-employed',
  'Eviction / LTB questions':   'eviction',
  'Landlord support':           'landlord',
  'Tenant support':             'tenant',
  'Service areas':              'areas',
  'Business hours':             'hours',
  'Free consultation':          'consultation',
  'Documents needed':           'documents',
  'Connect me with a paralegal':'eviction',
  'Tell me about pricing':      'pricing',
  'Get started':                'how-to-start',
}

function scoreEntry(entry: FAQEntry, input: string): number {
  const lower = input.toLowerCase()
  let score = 0
  for (const kw of entry.keywords) {
    if (lower.includes(kw)) {
      score += kw.split(' ').length * 2
    }
  }
  return score
}

function findBestMatch(input: string): { entry: FAQEntry; score: number } | null {
  let best: { entry: FAQEntry; score: number } | null = null
  for (const entry of FAQ) {
    const score = scoreEntry(entry, input)
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score }
    }
  }
  return best
}

function isClosingMessage(input: string): boolean {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return CLOSING_TRIGGERS.includes(normalized)
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
let _id = 0
const uid = () => ++_id

function botMsg(text: string, quickReplies?: string[]): Message {
  return { id: uid(), role: 'bot', text, quickReplies }
}
function userMsg(text: string): Message {
  return { id: uid(), role: 'user', text }
}

const GREETING = botMsg(
  'Hi there! 👋 Welcome to **A-Z Housing Solutions**.\n\nI can answer questions about our services, pricing, mortgage, tenant placement, property management, and more — or connect you with our team.\n\nWhat can I help you with today?',
  MAIN_QUICK_REPLIES,
)

const LEAD_PROMPTS: Record<LeadField, string> = {
  name:    'Sure! Let\'s get you connected with our team.\n\nWhat\'s your **full name**?',
  email:   'Thanks! What\'s the best **email address** to reach you at?',
  phone:   'Got it. And your **phone number**?\n*(Press Enter or type "skip" to leave blank)*',
  message: 'Almost there! Briefly describe how we can help you:',
}

const LEAD_ORDER: LeadField[] = ['name', 'email', 'phone', 'message']

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
export default function LiveChatWidget() {
  const [open, setOpen]             = useState(false)
  const [messages, setMessages]     = useState<Message[]>([GREETING])
  const [input, setInput]           = useState('')
  const [collecting, setCollecting] = useState<CollectionStep>(null)
  const [lead, setLead]             = useState<LeadData>({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending]       = useState(false)
  const [unread, setUnread]         = useState(0)
  const [isTyping, setIsTyping]     = useState(false)
  const [lastFaqId, setLastFaqId]   = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Allow external triggers (e.g. contact page "Live Support" card)
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('az:openchat', handler)
    return () => window.removeEventListener('az:openchat', handler)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const addBotReply = useCallback((msg: Message) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, msg])
      if (!open) setUnread(n => n + 1)
    }, 700)
  }, [open])

  const startLeadCollection = useCallback(() => {
    setCollecting('name')
    addBotReply(botMsg(LEAD_PROMPTS['name']))
  }, [addBotReply])

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages(prev => [...prev, userMsg(trimmed)])
    setInput('')

    // ── Lead collection flow ──────────────────────────────────
    if (collecting && collecting !== 'done') {
      const field = collecting as LeadField
      const isSkip = trimmed.toLowerCase() === 'skip'
      const value  = (field === 'phone' && isSkip) ? '' : trimmed
      const updatedLead = { ...lead, [field]: value }
      setLead(updatedLead)

      const idx  = LEAD_ORDER.indexOf(field)
      const next = LEAD_ORDER[idx + 1] as LeadField | undefined

      if (next) {
        setCollecting(next)
        addBotReply(botMsg(LEAD_PROMPTS[next]))
      } else {
        setCollecting('done')
        setSending(true)
        addBotReply(botMsg('One moment while I send your details to our team... ⏳'))

        try {
          const res = await fetch('/api/chat-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLead),
          })
          if (res.ok) {
            addBotReply(botMsg(
              `✅ **Thank you, ${updatedLead.name}!** Our team will contact you at ${updatedLead.email} shortly.\n\nIs there anything else I can help you with?`,
              MAIN_QUICK_REPLIES,
            ))
          } else {
            addBotReply(botMsg(
              'There was a hiccup sending your details. Please reach us directly:\n📧 info@azhouse.ca\n📞 +1 (647) 6932-932',
            ))
          }
        } catch {
          addBotReply(botMsg(
            'Network error. Please reach us at:\n📧 info@azhouse.ca\n📞 +1 (647) 2932-932',
          ))
        } finally {
          setSending(false)
        }
      }
      return
    }

    const lower = trimmed.toLowerCase()

    // ── Closing / goodbye intent ──────────────────────────────
    if (isClosingMessage(trimmed)) {
      addBotReply(botMsg('Thank you for contacting us. Bye for now.'))
      return
    }

    // ── Human / lead trigger ──────────────────────────────────
    if (HUMAN_TRIGGERS.some(t => lower.includes(t))) {
      startLeadCollection()
      return
    }

    // ── Affirmative after triggerLead FAQ ─────────────────────
    if (AFFIRMATIVES.includes(lower) && lastFaqId) {
      const last = FAQ.find(f => f.id === lastFaqId)
      if (last?.triggerLead) {
        startLeadCollection()
        return
      }
    }

    // ── Quick reply direct map ────────────────────────────────
    if (QUICK_REPLY_MAP[trimmed]) {
      const entry = FAQ.find(f => f.id === QUICK_REPLY_MAP[trimmed])
      if (entry) {
        setLastFaqId(entry.id)
        addBotReply(botMsg(entry.answer, entry.quickReplies ?? MAIN_QUICK_REPLIES))
        if (entry.triggerLead) setTimeout(startLeadCollection, 1400)
        return
      }
    }

    // ── Contact Us shortcut ───────────────────────────────────
    if (lower === 'contact us' || lower === 'contact') {
      addBotReply(botMsg(
        '📧 info@azhouse.ca\n📞 +1 (647) 6932-932\n🏢 18 King Street East, Suite 1400, Toronto, ON\n\nOr leave your details here and we\'ll reach out!',
        ['Leave my details', ...MAIN_QUICK_REPLIES.slice(0, 3)],
      ))
      return
    }

    // ── Keyword / intent scoring ──────────────────────────────
    const best = findBestMatch(trimmed)

    if (best && best.score >= 2) {
      setLastFaqId(best.entry.id)
      addBotReply(botMsg(best.entry.answer, best.entry.quickReplies ?? MAIN_QUICK_REPLIES))
      if (best.entry.triggerLead) setTimeout(startLeadCollection, 1400)
      return
    }

    if (best && best.score === 1) {
      addBotReply(botMsg(
        `I think you might be asking about **${best.entry.id.replace(/-/g, ' ')}** — is that right? Choose a topic below and I\'ll give you the full details.`,
        MAIN_QUICK_REPLIES,
      ))
      return
    }

    // ── Fallback ──────────────────────────────────────────────
    addBotReply(botMsg(
      'I\'m not sure I understood that — I\'m a chatbot with limited knowledge 😊. Try one of the topics below, or let me connect you with our team for a quick answer.',
      [...MAIN_QUICK_REPLIES, 'Speak to someone'],
    ))
  }, [collecting, lead, lastFaqId, addBotReply, startLeadCollection])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const renderText = (text: string) =>
    text.split('\n').map((line, i, arr) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < arr.length - 1 && <br />}
        </span>
      )
    })

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: 'var(--dark, #1e2a45)',
          border: '2px solid var(--accent, #f5a623)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          color: 'var(--accent, #f5a623)', fontSize: 24,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.36)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)'
        }}
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#e53935', color: '#fff',
            borderRadius: '50%', fontSize: 11, fontWeight: 700,
            width: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-label="A-Z Housing chat"
          style={{
            position: 'fixed', bottom: 96, right: 24, zIndex: 9998,
            width: 'min(390px, calc(100vw - 32px))',
            maxHeight: 'min(600px, calc(100vh - 120px))',
            display: 'flex', flexDirection: 'column',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fff',
            animation: 'chatSlideUp 0.22s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'var(--dark, #1e2a45)', padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--accent, #f5a623)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>🏠</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                A-Z Housing
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
                Online · Usually replies instantly
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.12)',
                border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
                width: 30, height: 30, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            background: '#f7f4ef',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 6,
              }}>
                <div style={{
                  maxWidth: '84%', padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'var(--dark, #1e2a45)' : '#fff',
                  color: msg.role === 'user' ? '#fff' : 'var(--dark, #1e2a45)',
                  fontSize: 14, lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  wordBreak: 'break-word',
                }}>
                  {renderText(msg.text)}
                </div>
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '92%' }}>
                    {msg.quickReplies.map(qr => (
                      <button
                        key={qr}
                        onClick={() => handleSend(qr)}
                        style={{
                          background: '#fff',
                          border: '1.5px solid var(--accent, #f5a623)',
                          borderRadius: 999, padding: '5px 13px',
                          fontSize: 12, fontWeight: 600,
                          color: 'var(--dark, #1e2a45)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent, #f5a623)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                  background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--accent, #f5a623)', display: 'inline-block',
                      animation: `chatDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid rgba(0,0,0,0.07)',
            display: 'flex', gap: 8, alignItems: 'center',
            background: '#fff', flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                collecting && collecting !== 'done' ? 'Type your answer…' : 'Ask me anything…'
              }
              disabled={sending}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 12,
                border: '1.5px solid rgba(0,0,0,0.12)', fontSize: 14, outline: 'none',
                background: sending ? '#f5f5f5' : '#fff',
                color: 'var(--dark, #1e2a45)', transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent, #f5a623)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || sending}
              aria-label="Send"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: input.trim() && !sending ? 'var(--dark, #1e2a45)' : 'rgba(0,0,0,0.1)',
                border: 'none',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, transition: 'background 0.15s', flexShrink: 0,
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </>
  )
}
