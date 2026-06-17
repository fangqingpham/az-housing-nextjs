import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Pricing & Packages',
  description: 'Transparent pricing for A-Z Housing Solutions\' real estate services — tenant placement, property management, home buying/selling support, and mortgage guidance across Canada.',
  alternates: { canonical: 'https://www.azhouse.ca/services/pricing' },
  openGraph: {
    title: 'Service Pricing & Packages | A-Z Housing Solutions',
    description: 'Transparent pricing for our real estate services — tenant placement, property management, buying/selling support, and mortgage guidance.',
    url: 'https://www.azhouse.ca/services/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
