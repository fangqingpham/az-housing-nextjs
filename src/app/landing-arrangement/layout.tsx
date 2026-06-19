import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Landing Arrangement Service (Vietnam to GTA)',
  description: 'A-Z Housing Solutions arranges accommodation and settling-in support for individuals and families relocating from Vietnam to the Greater Toronto Area — rental search, landlord verification, lease signing from Vietnam, airport pickup, and more.',
  keywords: ['landing arrangement Toronto', 'Vietnam to Canada relocation', 'rental search from Vietnam', 'settle in GTA', 'A-Z Housing Solutions', 'định cư Toronto', 'sắp xếp nhà ở Toronto'],
  alternates: { canonical: 'https://www.azhouse.ca/landing-arrangement' },
  openGraph: {
    title: 'Landing Arrangement Service | A-Z Housing Solutions',
    description: 'For individuals and families in Vietnam — we arrange your accommodation and help you settle into the Greater Toronto Area before and after you arrive.',
    url: 'https://www.azhouse.ca/landing-arrangement',
  },
}

export default function LandingArrangementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
