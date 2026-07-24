import type { Metadata } from 'next'
import '@/styles/globals.css'
import PublicChrome from '@/components/layout/PublicChrome'
import LanguagePicker from '@/components/ui/LanguagePicker'
import { LanguageProvider } from '@/hooks/LanguageProvider'
import LeadSourceTracker from '@/components/LeadSourceTracker'
import TawkToLoader from '@/components/TawkToLoader'
import RouteAnalytics from '@/components/RouteAnalytics'
import { SHOW_LISTINGS } from '@/lib/features'

const SITE_URL = 'https://www.azhouse.ca'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: 'EuVQfSEi54LNhWchuUpNJfIjB9Bp9QZ6GEpZi3yKVZE',
  },
  title: {
    default: 'A-Z Housing Solutions | Real Estate & Property Management in Canada',
    template: '%s | A-Z Housing Solutions',
  },
  description:
    SHOW_LISTINGS
      ? 'Find homes for sale, rentals, tenant placement, and property management services across Canada. Trusted real estate professionals with 20+ years of experience.'
      : 'Tenant placement, property management, buyer and seller guidance, and real estate support across Canada. Trusted real estate professionals with 20+ years of experience.',
  keywords: [
    'real estate Canada',
    ...(SHOW_LISTINGS ? ['homes for sale Canada', 'rental properties Canada'] : []),
    'property management Canada',
    'tenant placement Canada',
    ...(SHOW_LISTINGS ? ['buy home Canada', 'rent home Canada'] : ['home buying guidance Canada', 'tenant placement services Canada']),
    'mortgage agent Canada',
    'real estate agent Toronto',
    ...(SHOW_LISTINGS ? ['homes for sale Ontario', 'rental properties Ontario'] : []),
    'landlord services Canada',
    'property management Toronto',
    'A-Z Housing Solutions',
  ],
  authors: [{ name: 'A-Z Housing Solutions' }],
  creator: 'A-Z Housing Solutions',
  publisher: 'A-Z Housing Solutions',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: 'A-Z Housing Solutions',
    title: 'A-Z Housing Solutions | Real Estate & Property Management in Canada',
    description:
      SHOW_LISTINGS
        ? 'Find homes for sale, rentals, tenant placement, and property management services across Canada. Trusted real estate professionals with 20+ years of experience.'
        : 'Tenant placement, property management, buyer and seller guidance, and real estate support across Canada. Trusted real estate professionals with 20+ years of experience.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'A-Z Housing Solutions — From Search to Sold',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-Z Housing Solutions | Real Estate & Property Management in Canada',
    description:
      SHOW_LISTINGS
        ? 'Find homes for sale, rentals, tenant placement, and property management across Canada.'
        : 'Tenant placement, property management, buyer and seller guidance, and real estate support across Canada.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: { icon: '/favicon.ico' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'A-Z Housing Solutions',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    SHOW_LISTINGS
      ? 'Full-service real estate company offering home buying, selling, rentals, tenant placement, and property management across Canada.'
      : 'Real estate support company offering tenant placement, property management, buyer and seller guidance, and professional referrals across Canada.',
  telephone: '+1-647-2932-932',
  email: 'info@azhouse.ca',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Toronto',
    addressRegion: 'Ontario',
    addressCountry: 'CA',
  },
  areaServed: [
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'State', name: 'Ontario' },
    { '@type': 'City', name: 'Toronto' },
  ],
  priceRange: '$$',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Real Estate Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rental & Tenant Placement', url: `${SITE_URL}/tenant-placement` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property Management', url: `${SITE_URL}/services/landlords` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Buying', url: SHOW_LISTINGS ? `${SITE_URL}/buy` : `${SITE_URL}/services/buyers-sellers#purchasing` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Selling', url: `${SITE_URL}/services/buyers-sellers` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mortgage Consultation', url: `${SITE_URL}/services/pricing` } },
    ],
  },
  sameAs: [],
}	

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/*
          LanguageProvider must wrap everything so Navbar, Footer, and all
          pages can call useLanguage(). LanguagePicker shows the first-visit
          modal. PublicChrome conditionally renders Navbar + Footer + LiveChat
          (skipped on /admin/* routes so the admin gets a clean canvas).
        */}
        <LanguageProvider>
          <LeadSourceTracker />
          <LanguagePicker />
          <PublicChrome>
            {children}
          </PublicChrome>
        </LanguageProvider>

        <TawkToLoader />
        <RouteAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  )
}
