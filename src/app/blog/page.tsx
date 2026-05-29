'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { BLOGS } from '@/lib/utils';
import { getArticles } from '@/lib/api';
import type { BlogPost } from '@/types';

const PER_PAGE = 3;

export default function BlogPage() {
  const { t } = useLanguage();
  const bl = t.blog;
  const [allPosts, setAllPosts] = useState<BlogPost[]>(BLOGS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getArticles().then(dbPosts => {
      if (dbPosts.length > 0) {
        setAllPosts([...dbPosts, ...BLOGS]);
      }
    });
  }, []);

  // Featured post is always allPosts[0], pagination applies to the rest
  const rest = allPosts.slice(1);
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const paginated = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (n: number) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const pageNumbers = () => {
    const range: number[] = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) range.push(i);
    return range;
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--dark)', marginBottom: 16 }}>
            {bl.pageTitle}
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            {bl.pageSubtitle}
          </p>
        </div>

        {/* Featured post — only on page 1 */}
        {page === 1 && allPosts.length > 0 && (
          <Link href={`/blog/${allPosts[0].id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 48 }}>
            <article
              style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ background: `url(${allPosts[0].image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'}) center/cover no-repeat`, minHeight: 260 }} />
              <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderRadius: 20, padding: '4px 14px', marginBottom: 16, width: 'fit-content' }}>{bl.featured}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--dark)', marginBottom: 12, lineHeight: 1.3 }}>{allPosts[0].title}</h2>
                <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: 20 }}>{allPosts[0].excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--mid)', flexWrap: 'wrap' }}>
                  <span>✍️ {allPosts[0].author || 'A-Z Housing Team'}</span>
                  <span>📅 {allPosts[0].date}</span>
                  <span>⏱ {allPosts[0].readTime || allPosts[0].read}</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Counter */}
        <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 20 }}>
          {rest.length} {rest.length !== 1 ? bl.articles : bl.article} · {bl.page} {page} {bl.of} {totalPages}
        </p>

        {/* Grid — 1 col mobile, up to 3 col desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(16px, 3vw, 28px)',
        }}>
          {paginated.map(post => (
            <Link key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
              <article
                style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
              >
                <div style={{ height: 180, background: `url(${post.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'}) center/cover no-repeat` }} />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', color: 'var(--dark)', marginBottom: 10, lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--mid)', borderTop: '1px solid #f0ede8', paddingTop: 14, flexWrap: 'wrap' }}>
                    <span>✍️ {post.author || 'A-Z Housing Team'}</span>
                    <span style={{ marginLeft: 'auto' }}>⏱ {post.readTime || post.read}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 48, flexWrap: 'wrap' }}>
            <button onClick={() => goTo(page - 1)} disabled={page === 1}
              style={{ minWidth: 44, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #ddd', background: page === 1 ? '#f5f5f5' : '#fff', color: page === 1 ? '#aaa' : 'var(--dark)', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: 15 }}>
              ‹
            </button>

            {pageNumbers()[0] > 1 && (
              <>
                <button onClick={() => goTo(1)} style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: '1px solid #ddd', background: '#fff', color: 'var(--dark)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>1</button>
                {pageNumbers()[0] > 2 && <span style={{ color: 'var(--mid)' }}>…</span>}
              </>
            )}

            {pageNumbers().map(n => (
              <button key={n} onClick={() => goTo(n)}
                style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: n === page ? 'none' : '1px solid #ddd', background: n === page ? 'var(--accent)' : '#fff', color: n === page ? '#fff' : 'var(--dark)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                {n}
              </button>
            ))}

            {pageNumbers()[pageNumbers().length - 1] < totalPages && (
              <>
                {pageNumbers()[pageNumbers().length - 1] < totalPages - 1 && <span style={{ color: 'var(--mid)' }}>…</span>}
                <button onClick={() => goTo(totalPages)} style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: '1px solid #ddd', background: '#fff', color: 'var(--dark)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{totalPages}</button>
              </>
            )}

            <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
              style={{ minWidth: 44, minHeight: 44, padding: '0 16px', borderRadius: 10, border: '1px solid #ddd', background: page === totalPages ? '#f5f5f5' : '#fff', color: page === totalPages ? '#aaa' : 'var(--dark)', cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontSize: 15 }}>
              ›
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div style={{ marginTop: 72, background: 'var(--dark)', borderRadius: 16, padding: 'clamp(32px,5vw,48px) clamp(24px,5vw,40px)', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', marginBottom: 12 }}>{bl.stayAhead}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            {bl.stayAheadSub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="email" placeholder={bl.emailPlaceholder} style={{ padding: '12px 20px', borderRadius: 8, border: 'none', fontSize: 15, width: 'min(280px, 100%)', outline: 'none' }} />
            <button style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{bl.subscribe}</button>
          </div>
        </div>

      </div>
    </main>
  );
}
