'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BLOGS } from '@/lib/utils';

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const post = BLOGS.find(b => b.id === id);
  const related = BLOGS.filter(b => b.id !== id).slice(0, 3);

  if (!post) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--dark)', marginBottom: 16 }}>Post Not Found</h2>
          <Link href="/blog" className="btn-primary">← Back to Blog</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Hero image */}
      <div
        style={{
          height: 420,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%), url(${post.image}) center/cover no-repeat`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 0 48px',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: 'pointer',
              fontSize: 13,
              marginBottom: 20,
              backdropFilter: 'blur(8px)',
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              color: '#fff',
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            {post.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: 'rgba(255,255,255,0.8)', fontSize: 14, flexWrap: 'wrap' }}>
            <span>✍️ {post.author}</span>
            <span>📅 {post.date}</span>
            <span>⏱ {post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 'clamp(28px, 5vw, 56px)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
            marginBottom: 48,
          }}
        >
          {/* Excerpt / lead */}
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--dark)',
              lineHeight: 1.8,
              fontStyle: 'italic',
              borderLeft: '4px solid var(--accent)',
              paddingLeft: 20,
              marginBottom: 32,
            }}
          >
            {post.excerpt}
          </p>

          {/* Generated body content */}
          <div style={{ color: 'var(--mid)', lineHeight: 1.85, fontSize: '1rem' }}>
            <p style={{ marginBottom: 20 }}>
              The Canadian real estate market continues to evolve, shaped by economic conditions, demographic
              shifts, and policy changes at every level of government. Whether you&apos;re a first-time buyer,
              seasoned investor, or simply trying to understand where things are headed, staying informed is
              more important than ever.
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', color: 'var(--dark)', fontSize: '1.4rem', margin: '32px 0 16px' }}>
              Key Trends Driving the Market
            </h2>
            <p style={{ marginBottom: 20 }}>
              Interest rates, inventory levels, and immigration targets are the three biggest levers influencing
              Canadian housing right now. As the Bank of Canada adjusts its overnight rate, buyers and sellers
              alike recalibrate their plans, creating waves of activity followed by periods of cautious
              observation.
            </p>
            <p style={{ marginBottom: 20 }}>
              Supply remains constrained in most major urban centres. Toronto, Vancouver, and Calgary
              consistently report fewer active listings than demand warrants, keeping upward pressure on
              prices even as borrowing costs moderate.
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', color: 'var(--dark)', fontSize: '1.4rem', margin: '32px 0 16px' }}>
              What Buyers Should Know
            </h2>
            <p style={{ marginBottom: 20 }}>
              Pre-approval remains essential. With lender conditions changing quickly, knowing your exact
              budget before you start viewing properties saves time and prevents disappointment. Work with a
              mortgage broker who can access multiple lenders and find the most competitive terms for your
              profile.
            </p>
            <p style={{ marginBottom: 20 }}>
              Location is always paramount, but consider secondary factors: walkability scores, proximity to
              transit, school catchment areas, and planned infrastructure projects. These elements compound
              in value over time and often differentiate properties that appreciate strongly from those that
              stagnate.
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', color: 'var(--dark)', fontSize: '1.4rem', margin: '32px 0 16px' }}>
              Advice for Sellers
            </h2>
            <p style={{ marginBottom: 20 }}>
              Presentation matters more than ever. Buyers today are sophisticated — they research extensively
              online before ever stepping through a door. Professional photography, virtual tours, and a
              well-staged home are no longer optional extras; they are baseline expectations.
            </p>
            <p style={{ marginBottom: 20 }}>
              Pricing strategy should be data-driven. Overpricing in a normalizing market leads to extended
              days on market, which triggers buyer skepticism. A well-priced property with strong curb appeal
              and smart marketing will consistently outperform one that starts high and is chased downward
              through reductions.
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', color: 'var(--dark)', fontSize: '1.4rem', margin: '32px 0 16px' }}>
              Looking Ahead
            </h2>
            <p style={{ marginBottom: 0 }}>
              The fundamentals of Canadian real estate remain strong over the long term. Population growth,
              limited land in desirable areas, and strong household formation all support prices. Short-term
              volatility is inevitable, but for those with a multi-year horizon, strategic purchases in quality
              locations continue to represent sound wealth-building decisions.
            </p>
          </div>
        </div>

        {/* Author card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '28px 32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 48,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {post.author.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>{post.author}</div>
            <div style={{ color: 'var(--mid)', fontSize: 14 }}>
              Real estate analyst and contributing writer at A-Z Housing Solutions. Specializes in Canadian
              market trends, first-time buyer strategy, and investment property analysis.
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h3
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.5rem',
                color: 'var(--dark)',
                marginBottom: 24,
              }}
            >
              Related Articles
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 20,
              }}
            >
              {related.map(rel => (
                <Link key={rel.id} href={`/blog/${rel.id}`} style={{ textDecoration: 'none' }}>
                  <article
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = '')}
                  >
                    <div
                      style={{
                        height: 140,
                        background: `url(${rel.image}) center/cover no-repeat`,
                      }}
                    />
                    <div style={{ padding: 16 }}>
                      <h4
                        style={{
                          fontFamily: 'var(--serif)',
                          fontSize: '0.95rem',
                          color: 'var(--dark)',
                          lineHeight: 1.4,
                          marginBottom: 8,
                        }}
                      >
                        {rel.title}
                      </h4>
                      <div style={{ fontSize: 12, color: 'var(--mid)' }}>{rel.readTime}</div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← All Articles
          </Link>
        </div>
      </div>
    </main>
  );
}
