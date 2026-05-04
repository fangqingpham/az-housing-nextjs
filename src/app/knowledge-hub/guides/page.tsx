'use client';

import Link from 'next/link';

const GUIDE_CATEGORIES = [
  {
    icon: '🏷️',
    color: 'var(--accent)',
    title: 'Buying & Selling',
    guides: [
      { title: "First-Time Buyer's Complete Guide",  time: '12 min read', desc: 'Everything from pre-approval to closing day.' },
      { title: 'How to Price Your Home to Sell',     time: '8 min read',  desc: 'Data-driven pricing strategies for the Canadian market.' },
      { title: 'Understanding Closing Costs',        time: '6 min read',  desc: 'Land transfer tax, legal fees, and what to budget.' },
      { title: "Buying in a Seller's Market",        time: '7 min read',  desc: 'Offer strategies, escalation clauses & deposit advice.' },
    ],
  },
  {
    icon: '💰',
    color: '#4a90d9',
    title: 'Mortgages & Finance',
    guides: [
      { title: 'Fixed vs Variable Rate: Which Is Right for You?', time: '9 min read',  desc: 'Breaking down the trade-offs in plain language.' },
      { title: 'How the Mortgage Stress Test Works',              time: '5 min read',  desc: 'Qualifying rates, calculations & what to expect.' },
      { title: "FHSA, RRSP Home Buyers' Plan & FHBTC",           time: '10 min read', desc: 'Maximise federal programs to boost your down payment.' },
      { title: 'Renewing vs Refinancing Your Mortgage',          time: '7 min read',  desc: 'When to switch lenders and how to negotiate.' },
    ],
  },
  {
    icon: '🏘️',
    color: 'var(--green)',
    title: 'Renting',
    guides: [
      { title: 'Tenant Rights in Canada: Province-by-Province',  time: '11 min read', desc: 'Know your protections before you sign a lease.' },
      { title: 'How to Negotiate Your Rent',                     time: '5 min read',  desc: 'Practical tactics for new and renewing tenants.' },
      { title: 'What to Look for in a Lease Agreement',          time: '8 min read',  desc: 'Red flags, must-have clauses & common traps.' },
      { title: 'Renting as a New Canadian Immigrant',            time: '9 min read',  desc: 'Building credit history and securing your first rental.' },
    ],
  },
  {
    icon: '🔨',
    color: '#e67e22',
    title: 'Renovation & Maintenance',
    guides: [
      { title: 'Top 5 Renovations That Add Real Value',          time: '7 min read',  desc: 'Kitchen, bathrooms, and curb appeal ranked by ROI.' },
      { title: 'Seasonal Home Maintenance Checklist',            time: '6 min read',  desc: 'Spring, summer, fall & winter tasks to prevent costly repairs.' },
      { title: 'Navigating Building Permits in Canada',          time: '8 min read',  desc: 'When you need one, how to apply, and what to avoid.' },
      { title: 'Energy-Efficient Upgrades: Grants & Incentives', time: '9 min read',  desc: 'Canada Greener Homes and provincial rebates explained.' },
    ],
  },
  {
    icon: '⚖️',
    color: '#9b59b6',
    title: 'Legal Updates',
    guides: [
      { title: 'Changes to the Residential Tenancies Act 2025',  time: '8 min read',  desc: 'What landlords and tenants need to know now.' },
      { title: 'Anti-Flipping Tax & Short-Term Rental Rules',    time: '7 min read',  desc: 'Federal and municipal rules affecting investors.' },
      { title: 'Foreign Buyer Ban: What Changed',                time: '5 min read',  desc: 'Current status and exceptions explained clearly.' },
      { title: 'Condo Act Updates: Buyer Protections',           time: '6 min read',  desc: 'New disclosure requirements and cooling-off periods.' },
    ],
  },
];

export default function GuidesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--dark)', color: '#fff', padding: 'clamp(60px,10vw,100px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 20, padding: '5px 16px', marginBottom: 24 }}>
            Knowledge Hub
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.25, marginBottom: 16 }}>
            Guides for Every Stage of Your <span style={{ color: 'var(--accent)' }}>Property Journey</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 32px' }}>
            Free, expert-written guides covering buying, selling, renting, mortgages, renovations, and the latest legal changes.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {GUIDE_CATEGORIES.map(c => (
              <a key={c.title} href={`#${c.title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '7px 15px', fontSize: 13, fontWeight: 500 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)')}>
                {c.icon} {c.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Guide categories */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {GUIDE_CATEGORIES.map(cat => (
            <section key={cat.title} id={cat.title.toLowerCase().replace(/[^a-z]+/g, '-')} style={{ scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 18, borderBottom: `3px solid ${cat.color}` }}>
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--dark)', margin: 0 }}>{cat.title}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
                {cat.guides.map(g => (
                  <article
                    key={g.title}
                    style={{ background: '#fff', borderRadius: 13, padding: '24px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s', borderTop: `3px solid ${cat.color}`, display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                  >
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dark)', lineHeight: 1.4, marginBottom: 10, flex: 1 }}>{g.title}</h3>
                    <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{g.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--mid)' }}>⏱ {g.time}</span>
                      <span style={{ fontSize: 13, color: cat.color, fontWeight: 700 }}>Read →</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Blog CTA */}
      <section style={{ background: '#fff', padding: 'clamp(48px,6vw,72px) 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 36, alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 12 }}>Looking for the latest news?</h3>
            <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: 24 }}>
              Visit our blog for weekly market commentary, policy updates, and advice from Canadian real estate professionals.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/blog" style={{ background: 'var(--dark)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14 }}>Read the Blog</Link>
              <Link href="/contact" style={{ background: 'var(--cream)', color: 'var(--dark)', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 600, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)' }}>Ask an Expert</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{ n: '5', l: 'Guide Categories' }, { n: '20+', l: 'Expert Guides' }, { n: 'Free', l: 'Always Free' }, { n: 'Weekly', l: 'New Content' }].map(s => (
              <div key={s.l} style={{ background: 'var(--cream)', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', color: 'var(--accent)', fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
