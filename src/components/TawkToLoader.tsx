'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

export default function TawkToLoader() {
  const pathname = usePathname()
  if (pathname === '/vi/ho-tro-den-canada' || pathname?.startsWith('/admin')) return null

  return (
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
  )
}
