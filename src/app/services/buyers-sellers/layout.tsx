import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buyer & Seller Services',
  description: 'Expert home buying and selling support in Canada. A-Z Housing Solutions helps you navigate offers, negotiations, inspections, and closing — from search to sold.',
  keywords: ['home buying services Canada', 'sell home Canada', 'real estate agent Ontario', 'buyer agent Canada', 'seller services real estate'],
  alternates: { canonical: 'https://www.azhouse.ca/services/buyers-sellers' },
  openGraph: {
    title: 'Buyer & Seller Services | A-Z Housing Solutions',
    description: 'Expert home buying and selling support in Canada. We help you navigate offers, negotiations, inspections, and closing — from search to sold.',
    url: 'https://www.azhouse.ca/services/buyers-sellers',
  },
}

export default function BuyersSellersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
