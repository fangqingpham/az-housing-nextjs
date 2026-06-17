import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate Guides',
  description: 'Expert guides on buying, selling, renting, mortgages, legal updates, and property management in Canada. A comprehensive knowledge hub from A-Z Housing Solutions.',
  keywords: ['real estate guides Canada', 'how to buy home Canada', 'landlord guide Canada', 'mortgage guide', 'renting guide Canada', 'first time buyer guide'],
  alternates: { canonical: 'https://www.azhouse.ca/knowledge-hub/guides' },
  openGraph: {
    title: 'Real Estate Guides | A-Z Housing Solutions Knowledge Hub',
    description: 'Expert guides on buying, selling, renting, mortgages, and property management in Canada.',
    url: 'https://www.azhouse.ca/knowledge-hub/guides',
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
