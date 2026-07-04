'use client'

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
  const { t } = useLanguage()
  const h = t.hero

  const title = heroText || h.defaultTitle
  const sub = heroSub || h.defaultSub
  const videoId = getYouTubeVideoId(process.env.NEXT_PUBLIC_HOMEPAGE_VIDEO_URL || DEFAULT_YOUTUBE_URL)
  const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '/og-image.jpg'
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`
    : null

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(520px, 80vh, 780px)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0d1b2a' }}>
      {/* Static fallback remains visible while YouTube loads or when autoplay is unavailable. */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: `center / cover no-repeat url("${thumbnailUrl}")`, pointerEvents: 'none' }}>
        {embedUrl && (
          <iframe
            src={embedUrl}
            title="A-Z Housing Solutions background video"
            aria-hidden="true"
            tabIndex={-1}
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{ position: 'absolute', top: '50%', left: '50%', width: 'max(100%, calc(100vh * 16 / 9))', height: 'max(100%, calc(100vw * 9 / 16))', transform: 'translate(-50%, -50%)', border: 0, pointerEvents: 'none' }}
          />
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
