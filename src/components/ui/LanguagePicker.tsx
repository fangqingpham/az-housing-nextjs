'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import type { Lang } from '@/lib/translations'

export default function LanguagePicker() {
  const { showPicker, setLang, t } = useLanguage()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (showPicker) {
      requestAnimationFrame(() => setVisible(true))
    }
  }, [showPicker])

  if (pathname === '/vi/ho-tro-den-canada') return null

  if (!showPicker && !visible) return null

  const choose = (lang: Lang) => {
    setExiting(true)
    setTimeout(() => {
      setLang(lang)
      setVisible(false)
      setExiting(false)
    }, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 20, 40, 0.72)',
          zIndex: 99998,
          backdropFilter: 'blur(4px)',
          opacity: visible && !exiting ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => choose('en')}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Language selection"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: visible && !exiting
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -48%) scale(0.96)',
          zIndex: 99999,
          background: '#ffffff',
          borderRadius: 20,
          padding: 'clamp(32px, 5vw, 48px) clamp(28px, 5vw, 52px)',
          width: 'min(92vw, 480px)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
          opacity: visible && !exiting ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          textAlign: 'center',
        }}
      >
        {/* Globe icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #2d4a7a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 28,
        }}>
          🌐
        </div>

        <h2 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
          color: 'var(--dark)',
          marginBottom: 8,
          lineHeight: 1.2,
        }}>
          {t.langPicker.title}
        </h2>

        <p style={{
          color: 'var(--mid)',
          fontSize: 15,
          marginBottom: 32,
          lineHeight: 1.5,
        }}>
          {t.langPicker.subtitle}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {/* English button */}
          <button
            onClick={() => choose('en')}
            style={{
              padding: '18px 12px',
              border: '2px solid rgba(27,42,74,0.15)',
              borderRadius: 14,
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = '#1B2A4A'
              el.style.background = '#f7f4ef'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 24px rgba(27,42,74,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(27,42,74,0.15)'
              el.style.background = '#fff'
              el.style.transform = 'none'
              el.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: 32 }}>🇨🇦</span>
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--dark)',
            }}>
              {t.langPicker.english}
            </span>
          </button>

          {/* Chinese button */}
          <button
            onClick={() => choose('zh')}
            style={{
              padding: '18px 12px',
              border: '2px solid rgba(245,166,35,0.25)',
              borderRadius: 14,
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--accent)'
              el.style.background = '#fef9ee'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 24px rgba(245,166,35,0.2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(245,166,35,0.25)'
              el.style.background = '#fff'
              el.style.transform = 'none'
              el.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: 32 }}>🇨🇳</span>
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--dark)',
            }}>
              {t.langPicker.chinese}
            </span>
          </button>
        </div>

        {/* Skip text */}
        <p style={{
          marginTop: 20,
          fontSize: 12,
          color: 'var(--light)',
        }}>
          You can change this anytime in the navigation bar. &nbsp;·&nbsp; 您随时可以在导航栏更改语言。
        </p>
      </div>
    </>
  )
}
