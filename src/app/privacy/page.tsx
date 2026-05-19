'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'var(--dark)', padding: 'clamp(48px,6vw,72px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>A-Z Housing Solutions</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#fff', fontWeight: 700, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Last updated: May 2025</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(p => {
            const href = p === 'Privacy Policy' ? '/privacy' : p === 'Terms of Service' ? '/terms' : '/cookies';
            const active = p === 'Privacy Policy';
            return (
              <Link key={p} href={href} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--accent)' : '#fff', color: active ? '#fff' : 'var(--mid)', border: '1px solid ' + (active ? 'transparent' : '#ddd') }}>
                {p}
              </Link>
            );
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(28px,4vw,48px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>Effective Date</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>[Jan 1, 2026]</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>1. Introduction</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>A-Z Housing Solutions (&quot;A-Z Housing&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates https://az-housing-nextjs.vercel.app/ and provides property search, property listing, real estate guidance, landlord and tenant support, mortgage advice referral, and related online services across Canada. This Privacy Policy explains how we collect, use, disclose, store, and protect personal information when you visit our website, create an account, post or inquire about a listing, contact us, or use our services.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>2. Personal Information We Collect</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We may collect personal information that you provide directly, including your name, email address, phone number, account login information, listing details, property address or location information, messages submitted through contact forms, tenant or landlord inquiry details, and payment or billing information if paid services are offered. We may also collect technical information such as IP address, browser type, device information, pages visited, referral URLs, cookie identifiers, and website usage data.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>3. How We Use Personal Information</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We use personal information to provide and improve our website and services; create and manage user accounts; display, review, and manage property listings; respond to questions and support requests; connect users with listing owners, landlords, tenants, service providers, or referral partners when requested; prevent fraud, spam, or misuse of the website; maintain website security; analyze website performance; send service messages; and comply with legal, tax, accounting, or regulatory requirements.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>4. Consent</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>By using our website, submitting information, creating an account, posting a listing, or contacting us, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy. You may withdraw consent where legally permitted, but this may limit our ability to provide certain services.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>5. Sharing of Personal Information</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We may share personal information with service providers that help operate our website, hosting, analytics, communications, security, customer support, payment processing, or business administration. We may also share information with listing parties, landlords, tenants, agents, mortgage or legal referral partners, or other third parties when you request or authorize the connection. We may disclose information if required by law, court order, government request, or to protect our rights, users, property, safety, or website security.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>6. Listings and Public Information</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Information submitted for public listings, such as property descriptions, prices, addresses, photos, and contact or inquiry information, may be visible to website visitors or other users depending on the listing settings. Do not submit information in a listing that you do not want made public.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>7. Third-Party Links and Listings</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Our website may link to third-party websites, listing platforms, brokerages, lenders, legal professionals, or other service providers. We are not responsible for the privacy practices, accuracy, security, or content of third-party websites or services. Users should review the privacy policies of those third parties before sharing information with them.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>8. Cookies and Analytics</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We may use cookies and similar technologies to remember preferences, support account login, measure website traffic, improve user experience, and understand how users interact with our website. More information is provided in our Cookie Policy.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>9. Retention and Security</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We keep personal information only as long as reasonably necessary for the purposes described in this Privacy Policy or as required by law. We use reasonable administrative, technical, and physical safeguards to protect personal information. However, no website, internet transmission, or electronic storage system is completely secure.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>10. Access, Correction, and Questions</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>You may request access to your personal information, ask for corrections, withdraw consent, or ask privacy questions by contacting us at azhousing.solutions@outlook.com. We may need to verify your identity before processing a request.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>11. Children</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Our website is intended for general real estate and housing-related use and is not directed to children. Users should not submit personal information about minors unless they have legal authority to do so and the information is necessary for the requested service.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>12. Changes to This Privacy Policy</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>We may update this Privacy Policy from time to time. The updated version will be posted on our website with a revised effective date. Continued use of the website after changes means you accept the updated policy.</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 700, color: "var(--dark)", marginBottom: "0.5rem", paddingBottom: "0.4rem", borderBottom: "1px solid #e5e0d8", marginTop: "1.5rem" }}>13. Contact</h2>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>A-Z Housing Solutions</p>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Toronto, Ontario, Canada</p>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Email: azhousing.solutions@outlook.com</p>
          <p style={{ lineHeight: 1.8, color: "#444", marginBottom: "0.6rem", fontSize: 15 }}>Phone: +1 (647) 948-4428</p>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--mid)', fontSize: 13, marginTop: 32 }}>
          Questions? <Link href="/contact" style={{ color: 'var(--accent)' }}>Contact us</Link>
        </p>
      </div>
    </main>
  );
}
