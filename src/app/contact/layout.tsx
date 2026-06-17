import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with A-Z Housing Solutions. Our team of licensed real estate professionals is ready to help you buy, sell, rent, or manage property in Canada.',
  alternates: { canonical: 'https://www.azhouse.ca/contact' },
  openGraph: {
    title: 'Contact A-Z Housing Solutions',
    description: 'Get in touch with A-Z Housing Solutions. Our team of licensed real estate professionals is ready to help you buy, sell, rent, or manage property in Canada.',
    url: 'https://www.azhouse.ca/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
