'use client';

import Link from 'next/link';

const STEPS_SEARCH = [
  { n: '1', title: 'Set Your Criteria',    body: 'Filter by city, property type, number of bedrooms, and monthly budget. Our advanced search remembers your preferences.' },
  { n: '2', title: 'Browse & Save',        body: 'Explore hundreds of verified listings with high-resolution photos. Save favourites to your dashboard for easy comparison.' },
  { n: '3', title: 'Book a Viewing',       body: 'Request a viewing directly from any listing page. Most landlords respond within 24 hours.' },
  { n: '4', title: 'Apply with Confidence',body: 'Our secure platform lets you submit rental applications and required documents in one place.' },
];

const TIPS = [
  { icon: '📄', tip: 'Have 2–3 months of pay stubs and a letter of employment ready before you start applying.' },
  { icon: '📞', tip: 'Contact previous landlords proactively — a strong reference letter can set you apart.' },
  { icon: '💳', tip: 'Know your credit score. Many landlords screen applicants — a score above 650 is generally competitive.' },
  { icon: '🤝', tip: 'Be responsive. The rental market moves fast; reply to landlords within a few hours of hearing back.' },
];

export default function TenantsServicesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2a46 100%)', color: '#fff', padding: 'clamp(60px,10vw,110px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(74,144,217,0.2)', border: '1px solid rgba(74,144,217,0.4)', color: '#7ab8e8', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 20, padding: '5px 16px', marginBottom: 24 }}>
            Services for Tenants
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', lineHeight: 1.2, marginBottom: 18 }}>
            Find a Home You <span style={{ color: '#7ab8e8' }}>Love</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            Whether you're searching for your first rental or relocating across the country, A-Z Housing gives you the tools and support to find the right place.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#property-search"   style={{ background: '#4a90d9', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700 }}>Property Search</a>
            <a href="#contact-landlords" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 500 }}>Contact Landlords</a>
          </div>
        </div>
      </section>

      {/* Property Search */}
      <section id="property-search" style={{ padding: 'clamp(60px,8vw,100px) 24px', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--dark)', marginBottom: 14 }}>Property Search</h2>
            <p style={{ color: 'var(--mid)', maxWidth: 560, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Canada's most complete rental and for-sale listings database, updated daily. Find properties from verified landlords across every province.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24, marginBottom: 48 }}>
            {STEPS_SEARCH.map(s => (
              <div key={s.n} style={{ background: '#fff', borderRadius: 14, padding: '28px 24px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: '#4a90d920', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#4a90d9' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--dark)', marginBottom: 10, paddingRight: 40 }}>{s.title}</h3>
                <p style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/map-search" style={{ background: '#4a90d9', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15 }}>Search on the Map</Link>
            <Link href="/rent"       style={{ background: 'var(--dark)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 600, fontSize: 15 }}>Browse Rentals</Link>
            <Link href="/buy"        style={{ background: 'var(--cream)', color: 'var(--dark)', textDecoration: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 600, fontSize: 15, border: '1px solid rgba(0,0,0,0.12)' }}>Browse For Sale</Link>
          </div>
        </div>
      </section>

      {/* Tenant Tips */}
      <section style={{ background: '#fff', padding: 'clamp(50px,6vw,80px) 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', color: 'var(--dark)', marginBottom: 28 }}>Tenant Tips</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {TIPS.map(t => (
              <div key={t.tip} style={{ background: 'var(--cream)', borderRadius: 12, padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{t.icon}</span>
                <p style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Landlords */}
      <section id="contact-landlords" style={{ padding: 'clamp(60px,8vw,100px) 24px', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: 'var(--dark)', marginBottom: 14 }}>Contact Landlords</h2>
            <p style={{ color: '#4a90d9', fontWeight: 600, marginBottom: 18 }}>Direct lines to the people who matter.</p>
            <p style={{ color: 'var(--mid)', lineHeight: 1.8, marginBottom: 16 }}>
              Every listing on A-Z Housing includes a secure enquiry form that connects you directly to the landlord or listing agent. Your contact details are never shared publicly — only visible to the property owner after you choose to reach out.
            </p>
            <p style={{ color: 'var(--mid)', lineHeight: 1.8, marginBottom: 24 }}>
              Registered users can also send and track all their enquiries from a single dashboard, so you never lose track of where you're at with multiple properties.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ background: '#4a90d9', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 26px', fontWeight: 700, fontSize: 14 }}>Create a Free Account</Link>
              <Link href="/map-search"    style={{ background: 'var(--cream)', color: 'var(--dark)', textDecoration: 'none', borderRadius: 10, padding: '12px 26px', fontWeight: 600, fontSize: 14, border: '1px solid rgba(0,0,0,0.12)' }}>Browse Listings</Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { icon: '🔒', title: 'Privacy Protected',    body: 'Your email and phone are hidden from landlords until you choose to enquire.' },
              { icon: '📬', title: 'All Enquiries in One Place', body: 'Dashboard inbox consolidates every message you\'ve sent or received.' },
              { icon: '📅', title: 'Viewing Requests',     body: 'Schedule a viewing directly through the platform — no back-and-forth emails.' },
              { icon: '⚡', title: 'Fast Landlord Response',body: 'Most landlords on our platform respond within 24 hours of an enquiry.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 4, fontSize: 14 }}>{f.title}</div>
                  <div style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6 }}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#4a90d9', padding: 'clamp(50px,7vw,80px) 24px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', marginBottom: 14 }}>Your next home is waiting.</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>Join thousands of Canadians who found their home through A-Z Housing.</p>
        <Link href="/map-search" style={{ background: '#fff', color: '#4a90d9', textDecoration: 'none', borderRadius: 10, padding: '14px 36px', fontWeight: 800, fontSize: 16 }}>Start Searching Now</Link>
      </section>
    </main>
  );
}
