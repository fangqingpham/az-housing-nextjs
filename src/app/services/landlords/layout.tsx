import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Landlord Services',
  description: 'Comprehensive landlord services in Canada — tenant placement, lease coordination, property management support, and landlord-tenant dispute guidance from A-Z Housing Solutions.',
  keywords: ['landlord services Canada', 'property management Canada', 'tenant placement', 'landlord support', 'rental management Ontario'],
  alternates: { canonical: 'https://www.azhouse.ca/services/landlords' },
  openGraph: {
    title: 'Landlord Services | A-Z Housing Solutions',
    description: 'Comprehensive landlord services — tenant placement, lease coordination, property management, and dispute guidance across Canada.',
    url: 'https://www.azhouse.ca/services/landlords',
  },
}

export default function LandlordsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
