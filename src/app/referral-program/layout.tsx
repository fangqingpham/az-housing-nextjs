import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral Program — A-Z Housing Solutions',
  description: 'Introduce Ontario landlords to A-Z Housing Solutions and earn referral fees when eligible clients sign, pay, and payment clears.',
  alternates: { canonical: 'https://www.azhouse.ca/referral-program' },
}

export default function ReferralProgramLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
