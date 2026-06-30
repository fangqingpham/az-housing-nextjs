'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

const YOUTUBE_VIDEO_ID = 'H4-hQv7HDx8'
const YOUTUBE_THUMBNAIL_URL = `https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`

interface VideoHeroProps {
  heroText?: string
  heroSub?: string
}

export default function VideoHero({ heroText, heroSub }: VideoHeroProps) {
  const [showVideo, setShowVideo] = useState(false)
  const { lang, t } = useLanguage()
  const h = t.hero

  const title = heroText || h.defaultTitle
  const sub = heroSub || h.defaultSub
  const watchVideoText = lang === 'zh' ? '\u64ad\u653e\u89c6\u9891' : 'Watch Video'

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(520px, 80vh, 780px)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0d1b2a' }}>
      {/* Click-to-load YouTube video */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {showVideo ? (
          <iframe
            src={YOUTUBE_EMBED_URL}
            title="A-Z Housing Solutions video"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', top: '50%', left: '50%', width: 'max(100%, calc(100vh * 16/9))', height: 'max(100%, calc(100vw * 9/16))', transform: 'translate(-50%, -50%)', border: 0, objectFit: 'cover' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            aria-label={watchVideoText}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, padding: 0, cursor: 'pointer', background: `center / cover no-repeat url("${YOUTUBE_THUMBNAIL_URL}")` }}
          >
            <span style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />
            <span style={{ position: 'absolute', right: 'clamp(18px, 5vw, 72px)', bottom: 'clamp(22px, 7vw, 88px)', display: 'inline-flex', alignItems: 'center', gap: 12, color: '#fff', fontWeight: 700, fontSize: 'clamp(0.9rem, 2vw, 1rem)', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.34)', borderRadius: 999, padding: '10px 18px', backdropFilter: 'blur(8px)', boxShadow: '0 12px 28px rgba(0,0,0,0.28)' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)' }}>
                <span style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '11px solid #0d1b2a', marginLeft: 3 }} />
              </span>
              {watchVideoText}
            </span>
          </button>
        )}
      </div>

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,20,40,0.82) 0%, rgba(10,20,40,0.60) 60%, rgba(10,20,40,0.50) 100%)', zIndex: 1 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1000, margin: '0 auto', padding: 'clamp(48px,10vw,100px) clamp(16px,5vw,48px)' }}>
        <span style={{ display: 'inline-block', fontSize: 'clamp(9px, 1.8vw, 11px)', letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 16, background: 'rgba(255,255,255,0.08)', padding: '5px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', maxWidth: '90vw' }}>
          {h.eyebrow}
        </span>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 5vw, 3.2rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: 14, textShadow: '0 2px 16px rgba(0,0,0,0.4)', maxWidth: 800 }}>
          {title}
        </h1>

        <p style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 28, maxWidth: 620 }}>
          {sub}
        </p>

        
        {/* Chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', maxWidth: 680 }}>
          {h.chips.map(f => (
            <button
              key={f}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '5px 14px', fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'background .18s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
