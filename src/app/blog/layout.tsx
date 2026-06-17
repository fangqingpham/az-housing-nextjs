import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate Blog',
  description: 'Real estate news, market insights, and practical tips for Canadian buyers, sellers, landlords, and tenants. Stay informed with A-Z Housing Solutions.',
  alternates: { canonical: 'https://www.azhouse.ca/blog' },
  openGraph: {
    title: 'Real Estate Blog | A-Z Housing Solutions',
    description: 'Real estate news, market insights, and practical tips for Canadian buyers, sellers, landlords, and tenants.',
    url: 'https://www.azhouse.ca/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
