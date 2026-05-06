import type { Metadata } from 'next'
import Script from 'next/script'
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

        <Script id="tawk-to-live-chat" strategy="afterInteractive">
          {`
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            (function(){
              var s1 = document.createElement("script");
              var s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/69fa94af18351f1c34e5ce75/1jntd9jtd';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();
          `}
        </Script>
      </body>
    </html>
  )
}