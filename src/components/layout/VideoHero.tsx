'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

const DEFAULT_YOUTUBE_URL = 'https://www.youtube.com/watch?v=H4-hQv7HDx8'

function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    let videoId = ''

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v') || ''
      else {
        const [kind, id] = url.pathname.split('/').filter(Boolean)
        if (kind === 'shorts' || kind === 'embed') videoId = id || ''
      }
    }

    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

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
  const videoId = useMemo(
    () => getYouTubeVideoId(process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL || DEFAULT_YOUTUBE_URL),
    []
  )
  const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '/og-image.jpg'
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null

  useEffect(() => {
    if (!showVideo) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowVideo(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [showVideo])

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(520px, 80vh, 780px)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0d1b2a' }}>
      {/* Static hero image; the YouTube player is created only after a click. */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: `center / cover no-repeat url("${thumbnailUrl}")` }} />

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

      {videoId && (
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          aria-label={watchVideoText}
          style={{ position: 'absolute', zIndex: 3, right: 'clamp(18px, 5vw, 72px)', bottom: 'clamp(22px, 7vw, 88px)', display: 'inline-flex', alignItems: 'center', gap: 12, color: '#fff', fontWeight: 700, fontSize: 'clamp(0.9rem, 2vw, 1rem)', cursor: 'pointer', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.34)', borderRadius: 999, padding: '10px 18px', backdropFilter: 'blur(8px)', boxShadow: '0 12px 28px rgba(0,0,0,0.28)' }}
        >
          <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)' }}>
            <span style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '11px solid #0d1b2a', marginLeft: 3 }} />
          </span>
          {watchVideoText}
        </button>
      )}

      {showVideo && embedUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="A-Z Housing Solutions video"
          onClick={() => setShowVideo(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', padding: 'clamp(16px, 4vw, 48px)', background: 'rgba(4, 10, 20, 0.9)' }}
        >
          <div onClick={event => event.stopPropagation()} style={{ position: 'relative', width: 'min(100%, 1100px)' }}>
            <button type="button" onClick={() => setShowVideo(false)} aria-label="Close video" style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 10px)', border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 30, lineHeight: 1 }}>
              &times;
            </button>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 12, background: '#000' }}>
              <iframe
                src={embedUrl}
                title="A-Z Housing Solutions video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
