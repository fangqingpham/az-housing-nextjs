'use client'

import { useState } from 'react'
import HouseSVG from '@/components/ui/HouseSVG'

interface GalleryProps {
  imgs: string[]
  title: string
}

export default function Gallery({ imgs, title }: GalleryProps) {
  const [active, setActive] = useState(0)

  if (imgs.length === 0) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: 520, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, overflow: 'hidden' }}>
        <HouseSVG size={64} />
      </div>
    )
  }

  return (
    <>
      {/* ── Main image ── */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        maxHeight: 520,
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={imgs[active]}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',   // ← shows full image, no cropping
            objectPosition: 'center',
            background: '#f5f5f5',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      {/* ── Thumbnails ── */}
      {imgs.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 10,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {imgs.slice(0, 8).map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 80,
                height: 60,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: i === active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'border-color .15s',
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
