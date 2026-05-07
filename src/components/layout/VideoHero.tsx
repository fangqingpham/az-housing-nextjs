'use client';

import { useEffect, useRef, useState } from 'react';
import SearchBar from '@/components/listings/SearchBar';

interface VideoHeroProps {
  heroText?: string;
  heroSub?: string;
  listingCount?: string;
  userCount?: string;
  videoSrc?: string; // optional custom video URL
}

export default function VideoHero({
  heroText = 'Find Your Perfect Home Across Canada',
  heroSub = 'Browse thousands of listings from trusted sellers and agents across Canada.',
  listingCount = '0',
  userCount = '0',
  videoSrc,
}: VideoHeroProps) {
  const [mode, setMode] = useState<'sale' | 'rent'>('sale');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default royalty-free real-estate video (Pexels)
  const src =
    videoSrc ||
    'https://www.pexels.com/video/6869/download/?fps=25.0&h=1080&w=1920';

  useEffect(() => {
    // Ensure autoplay works even on mobile
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — video stays as poster
      });
    }
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'clamp(520px, 80vh, 780px)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0d1b2a', // fallback while video loads
      }}
    >
      {/* ── Background video ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* ── Dark overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(10,20,40,0.78) 0%, rgba(10,20,40,0.55) 60%, rgba(10,20,40,0.45) 100%)',
          zIndex: 1,
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 860,
          margin: '0 auto',
          padding: 'clamp(60px,10vw,100px) clamp(20px,5vw,48px)',
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 20,
            background: 'rgba(255,255,255,0.08)',
            padding: '5px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          From Search to Sold, We&apos;ve Got You Covered
        </span>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: 20,
            textShadow: '0 2px 16px rgba(0,0,0,0.4)',
            maxWidth: 720,
          }}
        >
          {heroText}
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          {heroSub}
        </p>

        {/* Search bar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 14,
            padding: '6px 6px 6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 660,
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
            flexWrap: 'wrap',
          }}
        >
          {/* Buy / Rent toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1ede8',
              borderRadius: 8,
              padding: 3,
              flexShrink: 0,
            }}
          >
            {(['sale', 'rent'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all .18s',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--mid)',
                }}
              >
                {m === 'sale' ? 'Buy' : 'Rent'}
              </button>
            ))}
          </div>

          {/* Embedded SearchBar (existing component) */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <SearchBar mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {/* Quick-filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 20,
            flexWrap: 'wrap',
          }}
        >
          {['House', 'Condo', 'Townhouse', 'Apartment', 'New Builds', 'Open Houses'].map(
            (f) => (
              <button
                key={f}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.88)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'background .18s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    'rgba(255,255,255,0.22)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    'rgba(255,255,255,0.12)')
                }
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(24px,4vw,48px)',
            marginTop: 44,
            flexWrap: 'wrap',
          }}
        >
          {[
            { n: listingCount, l: 'Active Listings' },
            { n: 'Canada',     l: 'Nationwide' },
            { n: userCount,    l: 'Registered Users' },
          ].map((s) => (
            <div key={s.l}>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  marginTop: 5,
                  letterSpacing: 0.5,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll-down indicator ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.55,
        }}
      >
        <span style={{ color: '#fff', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 36,
            background: 'linear-gradient(to bottom, #fff, transparent)',
          }}
        />
      </div>
    </section>
  );
}
