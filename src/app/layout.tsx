import type { Metadata } from 'next'
import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GoogleMapsLoader from '@/components/map/GoogleMapsLoader'

export const metadata: Metadata = {
  title: 'A - Z Housing Solutions | From Search to Sold',
  description: 'Browse thousands of listings from trusted sellers and agents across Canada.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleMapsLoader />
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 62px)' }}>
          {children}
        </main>
        <Footer />
        {/* Global toast is rendered per-page via useToast hook */}
      </body>
    </html>
  )
}
