
'use client';
import Link from 'next/link';

export default function TermsPage() {{
  return (
    <main style={{{{ minHeight: '100vh', background: 'var(--cream)' }}}}>
      {{/* Header */}}
      <div style={{{{ background: 'var(--dark)', padding: 'clamp(48px,6vw,72px) 24px', textAlign: 'center' }}}}>
        <div style={{{{ maxWidth: 720, margin: '0 auto' }}}}>
          <p style={{{{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}}}>A-Z Housing Solutions</p>
          <h1 style={{{{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#fff', fontWeight: 700, marginBottom: 12 }}}}>Terms of Service</h1>
          <p style={{{{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}}}>Last updated: May 2025</p>
        </div>
      </div>

      {{/* Body */}}
      <div style={{{{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}}}>
        {{/* Nav links to other policies */}}
        <div style={{{{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}}}>
          {{['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(p => {{
            const href = p === 'Privacy Policy' ? '/privacy' : p === 'Terms of Service' ? '/terms' : '/cookies';
            const active = p === 'Terms of Service';
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
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>1. Agreement to These Terms</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>These Terms of Service ("Terms") govern your use of https://az-housing-nextjs.vercel.app/, operated by A-Z Housing Solutions. By accessing or using the website, creating an account, posting a listing, submitting an inquiry, or using any service, you agree to these Terms. If you do not agree, do not use the website.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>2. Our Services</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>A-Z Housing Solutions provides an online platform for property search, property listing, rental and sale information, educational housing content, landlord and tenant support, tenant screening information, rental arrangement support, property management information, mortgage advice referrals, legal advice referrals, and related services. We may update, change, suspend, or discontinue any part of the website or services at any time.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>3. No Brokerage, Legal, Financial, or Tax Advice</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Unless separately agreed in writing, information on the website is for general informational purposes only and does not create a brokerage, agency, legal, mortgage, accounting, tax, or professional advisory relationship. Users should confirm property details, availability, price, legal rights, financing options, and professional advice directly with the appropriate licensed professionals or listing parties.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>4. User Accounts</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>You are responsible for keeping your account login information secure and for all activity under your account. You must provide accurate, current, and complete information. We may suspend or terminate accounts that contain false information, violate these Terms, create risk, or misuse the website.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>5. Listings and User Content</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>If you post a property listing, message, photo, description, price, contact detail, review, or other content, you confirm that you have the right to post it and that it is accurate, lawful, non-misleading, and does not infringe another person’s rights. You grant A-Z Housing Solutions a non-exclusive, royalty-free, worldwide licence to host, display, copy, edit, and use your submitted content for operating and promoting the website and services.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>6. Listing Accuracy and Availability</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>We try to provide useful property information, but we do not guarantee that listings, prices, availability, property details, photos, measurements, taxes, fees, zoning, school information, rental rules, or contact details are complete, current, or error-free. Users must independently verify all information before making decisions.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>7. Prohibited Use</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>You must not use the website to post false or misleading listings; impersonate others; upload illegal, offensive, discriminatory, defamatory, or infringing content; scrape or copy website data without permission; interfere with website security; send spam; collect user information without consent; or use the website for unlawful activity.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>8. Payments and Fees</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>Some services may require fees. If fees apply, the price, payment terms, refund terms, and service scope will be shown before purchase or agreed separately in writing. All fees are payable in Canadian dollars unless stated otherwise. Taxes may apply.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>9. Third-Party Services and Links</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>The website may include links or referrals to third-party websites, listing platforms, landlords, tenants, real estate agents, mortgage professionals, legal professionals, contractors, or other service providers. We are not responsible for third-party services, advice, content, availability, pricing, or conduct.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>10. Intellectual Property</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>The website design, brand name, logo, text, graphics, layout, software, and other content owned by A-Z Housing Solutions are protected by intellectual property laws. You may not copy, modify, distribute, sell, or use our intellectual property except as permitted by these Terms or with our written permission.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>11. Disclaimer of Warranties</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>The website and services are provided on an 'as is' and 'as available' basis. We do not guarantee uninterrupted access, error-free operation, complete accuracy, specific results, or that the website will be free of viruses or harmful components.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>12. Limitation of Liability</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>To the maximum extent permitted by law, A-Z Housing Solutions will not be liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages, or for losses arising from listings, third-party services, user conduct, website downtime, reliance on information, or transactions between users.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>13. Indemnity</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>You agree to indemnify and hold harmless A-Z Housing Solutions from claims, losses, liabilities, damages, costs, and expenses arising from your use of the website, your content, your listings, your violation of these Terms, or your violation of any law or third-party right.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>14. Termination</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>We may suspend or terminate access to the website or services at any time if we believe a user has violated these Terms, created risk, misused the website, or acted unlawfully.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>15. Governing Law</h2>
                <p style={{ lineHeight: 1.8, color: '#444', marginBottom: '0.6rem', fontSize: 15 }}>These Terms are governed by the laws of the Province of Ontario and the applicable laws of Canada. Disputes will be handled in the courts or tribunals with jurisdiction in Ontario, unless another forum is required by law.</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e5e0d8' }}>16. Contact</h2>
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
