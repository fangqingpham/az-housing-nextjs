'use client';

import { useState } from 'react';
import SearchBar from '@/components/listings/SearchBar';

const VIDEO_URL = 'https://mdqapinkafuzkxvsmqvs.supabase.co/storage/v1/object/public/media/az%20housing.mp4';

interface VideoHeroProps {
  heroText?: string;
  heroSub?: string;
}

export default function VideoHero({
  heroText = 'Find Your Perfect Home Across Canada',
  heroSub = 'Browse thousands of listings from trusted sellers and agents across Canada.',
}: VideoHeroProps) {
  const [mode, setMode] = useState<'sale' | 'rent'>('sale');

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'clamp(520px, 80vh, 780px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0d1b2a',
      }}
    >
      {/* ── Video background ── */}
      <video autoPlay muted loop playsInline
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 'max(100%, calc(100vh * 16/9))',
          height: 'max(100%, calc(100vw * 9/16))',
          transform: 'translate(-50%, -50%)',
          zIndex: 0, objectFit: 'cover', pointerEvents: 'none',
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* ── Dark overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(10,20,40,0.80) 0%, rgba(10,20,40,0.58) 60%, rgba(10,20,40,0.48) 100%)',
        zIndex: 1,
      }} />

      {/* ── Content ── */}
      <div style={{
        position: 'relative', zIndex: 2, width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(60px,10vw,100px) clamp(20px,5vw,48px)',
      }}>
        {/* Eyebrow */}
        <span style={{
          display: 'inline-block', fontSize: 11, letterSpacing: 3,
          textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600,
          marginBottom: 20, background: 'rgba(255,255,255,0.08)',
          padding: '5px 14px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          From Search to Sold, We&apos;ve Got You Covered
        </span>

        {/* Headline — single line */}
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(1.8rem, 3.8vw, 3.2rem)',
          fontWeight: 700, color: '#ffffff',
          lineHeight: 1.15, marginBottom: 16,
          textShadow: '0 2px 16px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}>
          {heroText}
        </h1>

        {/* Subheading — single line */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
          color: 'rgba(255,255,255,0.78)',
          lineHeight: 1.5, marginBottom: 32,
          whiteSpace: 'nowrap',
        }}>
          {heroSub}
        </p>

        {/* Search bar — full width to match text */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 14,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
          boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
        }}>
          <div style={{ flex: 1 }}>
            <SearchBar mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {/* Quick-filter chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          {['House', 'Condo', 'Townhouse', 'Apartment', 'New Builds', 'Open Houses'].map((f) => (
            <button key={f}
              style={{
                background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)',
                border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
                padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(6px)', transition: 'background .18s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
