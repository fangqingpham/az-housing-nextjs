import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/globals.css'
import PublicChrome from '@/components/layout/PublicChrome'
import LanguagePicker from '@/components/ui/LanguagePicker'
import { LanguageProvider } from '@/hooks/useLanguage'

const SITE_URL = 'https://www.azhouse.ca'

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
    'Find homes for sale, rentals, tenant placement, and property management services across Canada. Trusted real estate professionals with 20+ years of experience.',
  keywords: [
    'real estate Canada',
    'homes for sale Canada',
    'rental properties Canada',
    'property management',
    'tenant placement',
    'buy home Canada',
    'rent home Canada',
    'mortgage agent Canada',
    'real estate agent Toronto',
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
      'Find homes for sale, rentals, tenant placement, and property management services across Canada. Trusted real estate professionals with 20+ years of experience.',
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
      'Find homes for sale, rentals, tenant placement, and property management across Canada.',
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
  description:
    'Full-service real estate company offering home buying, selling, rentals, tenant placement, and property management across Canada.',
  areaServed: {
    '@type': 'Country',
    name: 'Canada',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Real Estate Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Rental & Tenant Placement' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property Management' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Buying' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Selling' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mortgage Application' } },
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
          <LanguagePicker />
          <PublicChrome>
            {children}
          </PublicChrome>
        </LanguageProvider>

        {/* Tawk.to live chat loader */}
        <Script id="tawk-to-live-chat" strategy="afterInteractive">
          {`
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            (function(){
              var s1 = document.createElement("script");
              var s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/69fa94af18351f1c34e5ce75/1jntd9jtd';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
