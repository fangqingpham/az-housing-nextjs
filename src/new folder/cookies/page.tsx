
'use client';
import Link from 'next/link';

export default function CookiesPage() {{
  return (
    <main style={{{{ minHeight: '100vh', background: 'var(--cream)' }}}}>
      {{/* Header */}}
      <div style={{{{ background: 'var(--dark)', padding: 'clamp(48px,6vw,72px) 24px', textAlign: 'center' }}}}>
        <div style={{{{ maxWidth: 720, margin: '0 auto' }}}}>
          <p style={{{{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}}}>A-Z Housing Solutions</p>
          <h1 style={{{{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#fff', fontWeight: 700, marginBottom: 12 }}}}>Cookie Policy</h1>
          <p style={{{{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}}}>Last updated: May 2025</p>
        </div>
      </div>

      {{/* Body */}}
      <div style={{{{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}}}>
        {{/* Nav links to other policies */}}
        <div style={{{{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}}}>
          {{['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(p => {{
            const href = p === 'Privacy Policy' ? '/privacy' : p === 'Terms of Service' ? '/terms' : '/cookies';
            const active = p === 'Cookie Policy';
            return (
              <Link key={{p}} href={{href}} style={{{{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--accent)' : '#fff', color: active ? '#fff' : 'var(--mid)', border: '1px solid ' + (active ? 'transparent' : '#ddd') }}}}>
                {{p}}
              </Link>
            );
          }})}}
        </div>

        {{/* Content */}}
        <div style={{{{ background: '#fff', borderRadius: 14, padding: 'clamp(28px,4vw,48px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}}}>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>Effective Date</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>[Insert effective date]</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>1. Introduction</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>This Cookie Policy explains how A-Z Housing Solutions uses cookies and similar technologies on https://az-housing-nextjs.vercel.app/. This policy should be read together with our Privacy Policy.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>2. What Cookies Are</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Cookies are small text files placed on your device when you visit a website. They help websites remember information about your visit, such as login status, preferences, pages viewed, and interactions with the website. Similar technologies may include pixels, tags, local storage, and analytics identifiers.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>3. How We Use Cookies</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>We may use cookies to operate the website, keep users logged in, remember user preferences, improve navigation, measure website traffic, understand how users use pages and listings, protect the website from fraud or abuse, test website performance, and support marketing or referral measurement where applicable.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>4. Types of Cookies We May Use</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Essential cookies are required for core website functions such as account login, security, forms, and basic navigation. Preference cookies remember choices such as settings or saved search preferences. Analytics cookies help us understand website traffic and improve the website. Marketing or referral cookies may help measure advertisements, referrals, or campaign performance if we use those tools.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>5. Third-Party Cookies</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Some cookies may be set by third-party providers that support hosting, analytics, maps, communication tools, advertising, embedded content, fraud prevention, or other website functions. Third-party providers may process information according to their own privacy and cookie policies.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>6. Consent and Cookie Control</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Where required, we will request consent before using non-essential cookies. You can manage cookies through your browser settings, by deleting cookies, blocking cookies, or setting your browser to alert you when cookies are being used. If you block or delete cookies, some website features, account functions, listing tools, or forms may not work properly.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>7. Do Not Track and Browser Signals</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Some browsers offer privacy signals such as Do Not Track. Because there is not always a consistent industry standard for these signals, our website may not respond to every browser signal. You can still control cookies through your browser settings.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>8. Cookie Retention</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Cookies may be session cookies, which expire when you close your browser, or persistent cookies, which remain for a set period or until you delete them. The exact retention period depends on the cookie type and provider.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>9. Updates to This Cookie Policy</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>We may update this Cookie Policy if our website features, cookie tools, analytics services, or legal requirements change. The updated version will be posted on our website with a revised effective date.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>10. Contact</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Questions about this Cookie Policy can be sent to:</p>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>A-Z Housing Solutions</p>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Toronto, Ontario, Canada</p>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Email: azhousing.solutions@outlook.com</p>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Phone: 1-800-AZ-HOUSE</p>
              </div>
        </div>

        {{/* Footer note */}}
        <p style={{{{ textAlign: 'center', color: 'var(--mid)', fontSize: 13, marginTop: 32 }}}}>
          Questions? <Link href="/contact" style={{{{ color: 'var(--accent)' }}}}>Contact us</Link>
        </p>
      </div>
    </main>
  );
}}
