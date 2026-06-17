'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getArticleById } from '@/lib/api';
import type { BlogPost } from '@/types';

const CAT_META: Record<string, { color: string; icon: string }> = {
  'Buying & Selling':         { color: 'var(--accent)', icon: '🏷️' },
  'Mortgages & Finance':      { color: '#4a90d9',       icon: '💰' },
  'Renting':                  { color: '#27ae60',       icon: '🏘️' },
  'Renovation & Maintenance': { color: '#e67e22',       icon: '🔨' },
  'Legal Updates':            { color: '#8e44ad',       icon: '⚖️' },
};

export default function GuideDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getArticleById(slug).then(data => {
      if (data) {
        setArticle(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug]);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--mid)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📖</div>
          <p style={{ fontSize: 16 }}>Loading guide…</p>
        </div>
      </main>
    );
  }

  // ── Not found ────────────────────────────────────────────────
  if (notFound || !article) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--dark)', marginBottom: 12 }}>Guide Not Found</h2>
          <p style={{ color: 'var(--mid)', marginBottom: 28 }}>
            This guide might have been moved or removed. Browse all guides below.
          </p>
          <Link href="/knowledge-hub/guides" style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '13px 28px', fontWeight: 700, fontSize: 15 }}>
            ← Back to Guides
          </Link>
        </div>
      </main>
    );
  }

  const meta = CAT_META[article.cat] || { color: 'var(--accent)', icon: '📄' };
  const coverImg = article.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80';
  const author = article.author || 'A-Z Housing Team';
  const readTime = article.read || article.readTime || '5 min read';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── Hero / cover ── */}
      <div style={{
        height: 'clamp(280px, 40vw, 440px)',
        background: `linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%), url(${coverImg}) center/cover no-repeat`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 48px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          {/* Back button */}
          <button
            onClick={() => router.back()}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, backdropFilter: 'blur(4px)' }}
          >
            ← Back
          </button>

          {/* Category pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span style={{ background: meta.color, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
              {article.cat}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem,4vw,2.6rem)', color: '#fff', fontWeight: 700, marginBottom: 16, lineHeight: 1.25 }}>
            {article.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            <span>✍️ {author}</span>
            <span>⏱ {readTime}</span>
            {article.date && <span>📅 {article.date}</span>}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px,5vw,60px) 24px' }}>

        {/* Excerpt / intro callout */}
        {article.excerpt && (
          <div style={{
            background: meta.color + '12',
            borderLeft: `4px solid ${meta.color}`,
            borderRadius: '0 10px 10px 0',
            padding: '18px 22px',
            marginBottom: 36,
            color: 'var(--dark)',
            fontSize: 16,
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}>
            {article.excerpt}
          </div>
        )}

        {/* Article body — written as HTML in the admin editor */}
        {article.body ? (
          <div
            dangerouslySetInnerHTML={{ __html: article.body }}
            style={{
              color: 'var(--dark)',
              fontSize: 'clamp(15px,2vw,17px)',
              lineHeight: 1.85,
            }}
          />
        ) : (
          <p style={{ color: 'var(--mid)', fontStyle: 'italic' }}>
            Full guide content coming soon.
          </p>
        )}

        {/* ── Footer nav ── */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid #e5e0d8', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href="/knowledge-hub/guides"
            style={{ color: 'var(--mid)', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← All Guides
          </Link>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/contact"
              style={{ background: 'var(--dark)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14 }}
            >
              Ask an Expert
            </Link>
            <Link
              href="/blog"
              style={{ background: 'var(--cream)', color: 'var(--dark)', textDecoration: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 600, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)' }}
            >
              Read the Blog
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
