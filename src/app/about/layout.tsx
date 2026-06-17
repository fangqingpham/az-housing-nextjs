import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Meet the A-Z Housing Solutions team — licensed mortgage agents, real estate salespeople, and property managers helping Canadians buy, sell, rent, and manage property across Canada.',
  alternates: { canonical: 'https://www.azhouse.ca/about' },
  openGraph: {
    title: 'About A-Z Housing Solutions',
    description: 'Meet the A-Z Housing Solutions team — licensed mortgage agents, real estate salespeople, and property managers helping Canadians buy, sell, rent, and manage property across Canada.',
    url: 'https://www.azhouse.ca/about',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
