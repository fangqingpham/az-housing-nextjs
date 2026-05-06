'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/api';
import type { BlogPost } from '@/types';

// ── Static fallback guides (shown if no Supabase articles exist for a category) ──
const STATIC_CATEGORIES = [
  {
    icon: '🏷️',
    color: 'var(--accent)',
    title: 'Buying & Selling',
    guides: [
      { id: 'first-time-buyer-guide',     title: "First-Time Buyer's Complete Guide",  read: '12 min read', excerpt: 'Everything from pre-approval to closing day.' },
      { id: 'price-your-home',            title: 'How to Price Your Home to Sell',     read: '8 min read',  excerpt: 'Data-driven pricing strategies for the Canadian market.' },
      { id: 'understanding-closing-costs', title: 'Understanding Closing Costs',        read: '6 min read',  excerpt: 'Land transfer tax, legal fees, and what to budget.' },
      { id: 'buying-sellers-market',      title: "Buying in a Seller's Market",        read: '7 min read',  excerpt: 'Offer strategies, escalation clauses & deposit advice.' },
    ],
  },
  {
    icon: '💰',
    color: '#4a90d9',
    title: 'Mortgages & Finance',
    guides: [
      { id: 'fixed-vs-variable',          title: 'Fixed vs Variable Rate: Which Is Right for You?', read: '9 min read',  excerpt: 'Breaking down the trade-offs in plain language.' },
      { id: 'mortgage-stress-test',       title: 'How the Mortgage Stress Test Works',              read: '5 min read',  excerpt: 'Qualifying rates, calculations & what to expect.' },
      { id: 'fhsa-rrsp-fhbtc',            title: "FHSA, RRSP Home Buyers' Plan & FHBTC",           read: '10 min read', excerpt: 'Maximise federal programs to boost your down payment.' },
      { id: 'renewing-vs-refinancing',    title: 'Renewing vs Refinancing Your Mortgage',           read: '7 min read',  excerpt: 'When to switch lenders and how to negotiate.' },
    ],
  },
  {
    icon: '🏘️',
    color: '#27ae60',
    title: 'Renting',
    guides: [
      { id: 'tenant-rights-canada',       title: 'Tenant Rights in Canada: Province-by-Province', read: '11 min read', excerpt: 'Know your protections before you sign a lease.' },
      { id: 'negotiate-rent',             title: 'How to Negotiate Your Rent',                    read: '5 min read',  excerpt: 'Practical tactics for new and renewing tenants.' },
      { id: 'lease-agreement-guide',      title: 'What to Look for in a Lease Agreement',         read: '8 min read',  excerpt: 'Red flags, must-have clauses & common traps.' },
      { id: 'renting-new-immigrant',      title: 'Renting as a New Canadian Immigrant',           read: '9 min read',  excerpt: 'Building credit history and securing your first rental.' },
    ],
  },
  {
    icon: '🔨',
    color: '#e67e22',
    title: 'Renovation & Maintenance',
    guides: [
      { id: 'renovations-add-value',      title: 'Top 5 Renovations That Add Real Value',     read: '7 min read',  excerpt: 'Kitchen, bathrooms, and curb appeal ranked by ROI.' },
      { id: 'seasonal-maintenance',       title: 'Seasonal Home Maintenance Checklist',       read: '6 min read',  excerpt: 'What to do every spring, summer, fall, and winter.' },
      { id: 'renovation-budget',          title: 'How to Budget a Major Renovation',         read: '8 min read',  excerpt: 'Cost estimates, contingency planning & contractor tips.' },
      { id: 'diy-vs-contractor',          title: 'DIY vs Hiring a Contractor',               read: '5 min read',  excerpt: 'When to roll up your sleeves and when to call a pro.' },
    ],
  },
  {
    icon: '⚖️',
    color: '#8e44ad',
    title: 'Legal Updates',
    guides: [
      { id: 'bc-alberta-tenancy-changes', title: 'Recent Tenancy Law Changes in BC & Alberta', read: '8 min read',  excerpt: 'What landlords and tenants need to know in 2024.' },
      { id: 'foreign-buyer-ban',          title: "Canada's Foreign Buyer Ban Explained",       read: '6 min read',  excerpt: 'Who is affected, exemptions, and what comes next.' },
      { id: 'condo-act-ontario',          title: "Ontario's Condo Act: Owner Rights",         read: '7 min read',  excerpt: 'Disputes, maintenance fees, and board governance.' },
      { id: 'anti-flipping-rule',         title: 'Anti-Flipping Tax Rule (Bill C-268)',        read: '5 min read',  excerpt: 'How the 12-month ownership rule affects your sale.' },
    ],
  },
];

// Map Supabase "cat" values to the colour & icon used in the UI
const CAT_META: Record<string, { color: string; icon: string }> = {
  'Buying & Selling':      { color: 'var(--accent)', icon: '🏷️' },
  'Mortgages & Finance':   { color: '#4a90d9',       icon: '💰' },
  'Renting':               { color: '#27ae60',       icon: '🏘️' },
  'Renovation & Maintenance': { color: '#e67e22',    icon: '🔨' },
  'Legal Updates':         { color: '#8e44ad',       icon: '⚖️' },
};

export default function GuidesPage() {
  const [dbArticles, setDbArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles().then(articles => {
      setDbArticles(articles);
      setLoading(false);
    });
  }, []);

  // Group Supabase articles by category
  const grouped: Record<string, BlogPost[]> = {};
  for (const a of dbArticles) {
    if (!grouped[a.cat]) grouped[a.cat] = [];
    grouped[a.cat].push(a);
  }

  // Merge: use Supabase articles when available, else fall back to static
  const categories = STATIC_CATEGORIES.map(cat => {
    const live = grouped[cat.title] || [];
    return {
      ...cat,
      liveGuides: live,
      staticGuides: cat.guides,
    };
  });

  // Also include any Supabase categories not in the static list
  const extraCats = Object.keys(grouped).filter(
    k => !STATIC_CATEGORIES.find(c => c.title === k)
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--dark) 0%, #2c3e50 100%)',
        padding: 'clamp(60px,8vw,100px) 24px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3rem)', marginBottom: 16, fontWeight: 700 }}>
            Knowledge Hub — Guides
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem,2vw,1.15rem)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            Expert guides on buying, selling, renting, mortgages, renovation, and Canadian real estate law — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATIC_CATEGORIES.map(c => (
              <a key={c.title} href={`#${c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', textDecoration: 'none', borderRadius: 999, padding: '8px 18px', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', transition: 'background .2s', whiteSpace: 'nowrap' }}>
                {c.icon} {c.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px', display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { n: loading ? '…' : String(dbArticles.length || '20+'), l: 'Expert Guides' },
            { n: '5',      l: 'Categories' },
            { n: 'Free',   l: 'Always Free' },
            { n: 'Weekly', l: 'New Content' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Guide categories ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,70px) 24px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--mid)', fontSize: 15 }}>
            Loading guides…
          </div>
        )}

        {/* Static categories (merged with live data) */}
        {categories.map(cat => {
          const guides = cat.liveGuides.length > 0 ? cat.liveGuides : cat.staticGuides;
          const anchorId = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <section key={cat.title} id={anchorId} style={{ marginBottom: 64, scrollMarginTop: 80 }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--dark)', margin: 0 }}>{cat.title}</h2>
                {cat.liveGuides.length > 0 && (
                  <span style={{ background: cat.color + '18', color: cat.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {cat.liveGuides.length} article{cat.liveGuides.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${cat.color}, transparent)`, borderRadius: 4, marginBottom: 28 }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {(guides as (BlogPost | typeof cat.staticGuides[0])[]).map((g, i) => {
                  const isLive = 'excerpt' in g && 'id' in g;
                  const href = `/knowledge-hub/guides/${g.id}`;
                  const title = g.title;
                  const desc = isLive ? (g as BlogPost).excerpt : (g as typeof cat.staticGuides[0]).excerpt;
                  const readTime = isLive ? ((g as BlogPost).read || (g as BlogPost).readTime || '5 min read') : (g as typeof cat.staticGuides[0]).read;

                  return (
                    <Link key={g.id || i} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                      <article style={{
                        background: '#fff',
                        borderRadius: 14,
                        padding: '24px 22px',
                        border: `2px solid ${cat.color}22`,
                        transition: 'transform .18s, box-shadow .18s, border-color .18s',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)';
                          (e.currentTarget as HTMLElement).style.borderColor = cat.color;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLElement).style.borderColor = cat.color + '22';
                        }}
                      >
                        {/* Cover image (live articles only) */}
                        {isLive && (g as BlogPost).image && (
                          <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16, flexShrink: 0 }}>
                            <img src={(g as BlogPost).image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dark)', marginBottom: 10, lineHeight: 1.45, flex: 1 }}>{title}</h3>
                        <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--mid)' }}>⏱ {readTime}</span>
                          <span style={{ fontSize: 13, color: cat.color, fontWeight: 700 }}>Read →</span>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Extra Supabase categories not in static list */}
        {!loading && extraCats.map(catName => {
          const meta = CAT_META[catName] || { color: 'var(--accent)', icon: '📄' };
          const articles = grouped[catName];
          const anchorId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <section key={catName} id={anchorId} style={{ marginBottom: 64, scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{meta.icon}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--dark)', margin: 0 }}>{catName}</h2>
                <span style={{ background: meta.color + '18', color: meta.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginLeft: 'auto' }}>
                  {articles.length} article{articles.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${meta.color}, transparent)`, borderRadius: 4, marginBottom: 28 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {articles.map(a => (
                  <Link key={a.id} href={`/knowledge-hub/guides/${a.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <article style={{ background: '#fff', borderRadius: 14, padding: '24px 22px', border: `2px solid ${meta.color}22`, transition: 'transform .18s, box-shadow .18s, border-color .18s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = meta.color; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = meta.color + '22'; }}
                    >
                      {a.image && <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}><img src={a.image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dark)', marginBottom: 10, lineHeight: 1.45, flex: 1 }}>{a.title}</h3>
                      <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{a.excerpt}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--mid)' }}>⏱ {a.read || a.readTime || '5 min read'}</span>
                        <span style={{ fontSize: 13, color: meta.color, fontWeight: 700 }}>Read →</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

      </div>

      {/* ── Blog CTA ── */}
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
