import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — A-Z Housing',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
