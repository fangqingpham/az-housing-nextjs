import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rental Properties in Canada',
  description: 'Find rental homes, condos, and apartments across Canada. Search verified rental listings by city, price, and property type. A-Z Housing Solutions makes renting simple.',
  keywords: ['rental properties Canada', 'apartments for rent', 'houses for rent Canada', 'condos for rent', 'find rental home', 'rent apartment Canada'],
  alternates: { canonical: 'https://www.azhouse.ca/rent' },
  openGraph: {
    title: 'Rental Properties in Canada | A-Z Housing Solutions',
    description: 'Find rental homes, condos, and apartments across Canada. Search verified rental listings by city, price, and property type.',
    url: 'https://www.azhouse.ca/rent',
  },
}

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
