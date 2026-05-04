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
      <div className="gallery-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="no-img" style={{ height: '100%', width: '100%' }}>
          <HouseSVG size={64} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="gallery-main">
        <img
          src={imgs[active]}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = 'none'
          }}
        />
      </div>
      {imgs.length > 1 && (
        <div className="gallery-thumbs">
          {imgs.slice(0, 5).map((img, i) => (
            <div
              key={i}
              className={`gthumb${i === active ? ' on' : ''}`}
              onClick={() => setActive(i)}
            >
              <img src={img} alt="" />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
