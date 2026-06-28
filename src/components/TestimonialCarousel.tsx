'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

type Testimonial = {
  title: string;
  review: string;
  name: string;
  reviewer: string;
};

function getVisibleCount() {
  if (typeof window === 'undefined') return 1;
  if (window.matchMedia('(min-width: 1025px)').matches) return 3;
  if (window.matchMedia('(min-width: 641px)').matches) return 2;
  return 1;
}

export default function TestimonialCarousel() {
  const { t } = useLanguage();
  const h = t.home;
  const testimonials = h.testimonials as readonly Testimonial[];
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount());
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [testimonials]);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const renderedTestimonials = useMemo(
    () => {
      const clones = testimonials.slice(0, Math.max(visibleCount - 1, 0));
      return [...testimonials, ...clones].map((item, index) => ({
        ...item,
        id: `${index}-${item.title}`,
      }));
    },
    [testimonials, visibleCount],
  );

  const trackWidth = `${(renderedTestimonials.length / visibleCount) * 100}%`;
  const slideWidth = `${100 / renderedTestimonials.length}%`;
  const trackTransform = `translateX(-${activeIndex * (100 / renderedTestimonials.length)}%)`;

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  return (
    <section
      className="testimonial-section"
      aria-labelledby="testimonial-carousel-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="testimonial-inner">
        <div className="testimonial-header">
          <span className="testimonial-eyebrow">{h.testimonialsLabel}</span>
          <h2 id="testimonial-carousel-heading">{h.testimonialsHeading}</h2>
          <p>{h.testimonialsSubheading}</p>
        </div>

        <div className="testimonial-viewport" aria-live="polite">
          <div
            className="testimonial-track"
            style={{
              transform: trackTransform,
              width: trackWidth,
            }}
          >
            {renderedTestimonials.map((item) => (
              <div className="testimonial-slide" key={item.id} style={{ flexBasis: slideWidth, width: slideWidth }}>
                <article className="testimonial-card">
                  <div className="testimonial-quote-mark" aria-hidden="true">
                    &ldquo;
                  </div>
                  <h3>{item.title}</h3>
                  <blockquote>{item.review}</blockquote>
                  <div className="testimonial-reviewer">
                    <p className="testimonial-name">{item.name}</p>
                    <p className="testimonial-role">{item.reviewer}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonial-controls-row">
          <button
            type="button"
            className="testimonial-arrow"
            onClick={goToPrevious}
            aria-label={h.testimonialPrevious}
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button
            type="button"
            className="testimonial-arrow"
            onClick={goToNext}
            aria-label={h.testimonialNext}
          >
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>

        <div className="testimonial-dots" aria-label={h.testimonialDotsLabel}>
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.title}
              type="button"
              className={`testimonial-dot${index === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={h.testimonialDotLabel.replace('{title}', testimonial.title)}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonial-section {
          background: var(--cream);
          padding: clamp(48px, 7vw, 88px) 24px;
        }

        .testimonial-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .testimonial-header {
          max-width: 820px;
          margin: 0 auto 36px;
          text-align: center;
        }

        .testimonial-eyebrow {
          color: var(--accent);
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .testimonial-header h2 {
          color: var(--dark);
          font-family: var(--serif);
          font-size: clamp(1.9rem, 4vw, 3rem);
          font-weight: 600;
          line-height: 1.08;
          margin: 0 0 12px;
        }

        .testimonial-header p {
          color: var(--mid);
          margin: 0 auto;
          max-width: 620px;
        }

        .testimonial-viewport {
          max-width: 100%;
          overflow: hidden;
          width: 100%;
        }

        .testimonial-track {
          display: flex;
          gap: 0;
          min-width: 0;
          transition: transform 0.4s ease;
          will-change: transform;
        }

        .testimonial-slide {
          box-sizing: border-box;
          display: flex;
          flex: 0 0 auto;
          justify-content: center;
          min-width: 0;
          padding: 0 12px;
        }

        .testimonial-card {
          background: var(--white);
          border: 1px solid rgba(12, 26, 75, 0.08);
          border-radius: 18px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          min-height: 292px;
          min-width: 0;
          padding: 24px 22px;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
          width: 100%;
        }

        .testimonial-card:hover {
          border-color: rgba(245, 166, 35, 0.38);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.12);
          transform: translateY(-5px);
        }

        .testimonial-quote-mark {
          align-items: center;
          background: var(--accent-l);
          border-radius: 50%;
          color: var(--accent-d);
          display: flex;
          font-family: var(--serif);
          font-size: 34px;
          height: 42px;
          justify-content: center;
          line-height: 1;
          margin-bottom: 16px;
          width: 42px;
        }

        .testimonial-card h3 {
          color: var(--dark);
          font-family: var(--serif);
          font-size: 1.45rem;
          font-weight: 600;
          line-height: 1.15;
          margin: 0 0 10px;
        }

        .testimonial-card blockquote {
          color: var(--mid);
          flex: 1;
          font-size: 14px;
          line-height: 1.75;
          margin: 0 0 18px;
        }

        .testimonial-reviewer {
          border-top: 1px solid var(--border);
          margin: 0;
          padding-top: 14px;
        }

        .testimonial-name {
          color: var(--dark);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.25;
          margin: 0 0 3px;
        }

        .testimonial-role {
          color: var(--mid);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          line-height: 1.3;
          margin: 0;
          text-transform: uppercase;
        }

        .testimonial-arrow {
          align-items: center;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 50%;
          box-shadow: var(--sh);
          color: var(--dark);
          display: flex;
          font-size: 22px;
          height: 46px;
          justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
          width: 46px;
        }

        .testimonial-arrow:hover,
        .testimonial-arrow:focus-visible {
          background: var(--dark);
          border-color: var(--dark);
          color: var(--accent);
          outline: none;
          transform: translateY(-2px);
        }

        .testimonial-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 26px;
        }

        .testimonial-dot {
          background: rgba(27, 42, 74, 0.2);
          border: none;
          border-radius: 999px;
          height: 8px;
          padding: 0;
          transition: background 0.2s ease, width 0.2s ease;
          width: 8px;
        }

        .testimonial-controls-row {
          align-items: center;
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .testimonial-dot.active,
        .testimonial-dot:hover,
        .testimonial-dot:focus-visible {
          background: var(--accent);
          outline: none;
          width: 24px;
        }

        @media (max-width: 1024px) {
          .testimonial-slide {
            padding: 0 9px;
          }
        }

        @media (max-width: 640px) {
          .testimonial-section {
            padding-left: 0;
            padding-right: 0;
          }

          .testimonial-controls-row {
            row-gap: 18px;
          }

          .testimonial-viewport {
            max-width: 100%;
            overflow: hidden;
            width: 100%;
          }

          .testimonial-track {
            display: flex;
            gap: 0;
          }

          .testimonial-slide {
            box-sizing: border-box;
            display: flex;
            flex: 0 0 auto;
            justify-content: center;
            min-width: 0;
            padding: 0 16px;
            width: 100%;
          }

          .testimonial-arrow {
            height: 42px;
            width: 42px;
          }

          .testimonial-card {
            flex: 0 0 auto;
            box-sizing: border-box;
            min-height: 0;
            min-width: 0;
            max-width: 360px;
            padding: 24px 22px;
            white-space: normal;
            width: min(88vw, 360px);
          }

          .testimonial-card:hover {
            transform: none;
          }

          .testimonial-card h3,
          .testimonial-card blockquote,
          .testimonial-name,
          .testimonial-role {
            overflow-wrap: normal;
            white-space: normal;
            word-break: normal;
          }

          .testimonial-card h3 {
            font-size: 1.35rem;
          }

          .testimonial-card blockquote {
            font-size: 14px;
            line-height: 1.7;
          }

          .testimonial-dots {
            margin-top: 18px;
            padding: 0 18px;
          }
        }
      `}</style>
    </section>
  );
}
