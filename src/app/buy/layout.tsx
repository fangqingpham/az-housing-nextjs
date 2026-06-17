import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Homes for Sale in Canada',
  description: 'Browse verified homes, condos, and investment properties for sale across Canada. Filter by location, price, and property type. Find your perfect home with A-Z Housing Solutions.',
  keywords: ['homes for sale Canada', 'houses for sale', 'condos for sale', 'buy property Canada', 'real estate listings Canada', 'investment properties Canada'],
  alternates: { canonical: 'https://www.azhouse.ca/buy' },
  openGraph: {
    title: 'Homes for Sale in Canada | A-Z Housing Solutions',
    description: 'Browse verified homes, condos, and investment properties for sale across Canada.',
    url: 'https://www.azhouse.ca/buy',
  },
}

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
