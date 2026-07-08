import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vietnam Referral Partner - A-Z Housing Solutions',
  description: 'Vietnam referral partner program for study-abroad, newcomer, and education agencies referring clients to A-Z Housing Landing Arrangement services.',
  alternates: { canonical: 'https://www.azhouse.ca/vietnam-referral-partner' },
}

export default function VietnamReferralPartnerLayout({ children }: { children: React.ReactNode }) {
  return children
}
