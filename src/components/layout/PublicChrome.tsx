'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LiveChatWidget from '@/components/LiveChatWidget'

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 62px)' }}>
        {children}
      </main>
      <Footer />
      <LiveChatWidget />
    </>
  )
}