'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false })
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })
const LiveChatWidget = dynamic(() => import('@/components/LiveChatWidget'), { ssr: false })

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const isBridgePage = pathname === '/vi/ho-tro-den-canada'

  if (isAdmin) {
    return <>{children}</>
  }

  if (isBridgePage) {
    return (
      <>
        {children}
        <LiveChatWidget />
      </>
    )
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
