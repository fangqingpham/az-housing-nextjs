'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoHero from '@/components/layout/VideoHero';
import PropertyCard from '@/components/listings/PropertyCard';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getListings, getSavedIds, toggleSaved } from '@/lib/api';
import type { Listing } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { message, visible, showToast } = useToast();
  const { t } = useLanguage();
  const h = t.home;

  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [rentListings, setRentListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [heroText, setHeroText] = useState('');
  const [heroSub, setHeroSub] = useState('');

  useEffect(() => {
    async function load() {
      const [allListings, settings] = await Promise.all([
        getListings(),
        fetch('/api/settings').then(r => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      setSaleListings(allListings.filter((l: any) => l.price_type === 'sale').slice(0, 3));
      setRentListings(allListings.filter((l: any) => l.price_type === 'rent').slice(0, 3));
      if (settings?.hero) setHeroText(settings.hero);
      if (settings?.herosub) setHeroSub(settings.herosub);
      if (user) {
        const ids = await getSavedIds(user.id);
        setSavedIds(ids);
      }
    }
    load();
  }, [user]);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      showToast('Sign in to save properties.');
      return;
    }
    const nowSaved = await toggleSaved(user.id, id);
    setSavedIds(prev => (nowSaved ? [...prev, id] : prev.filter(x => x !== id)));
    showToast(nowSaved ? 'Property saved! ♥' : 'Removed from saved.');
  };

  const serviceCards = [
    {
      title: h.rentalTenantTitle,
      subtitle: h.rentalTenantSub,
      desc: h.rentalTenantDesc,
      bullets: h.rentalTenantBullets,
      footer: h.rentalTenantFooter,
      ctaLabel: h.rentalTenantCta,
      href: '/tenant-placement',
    },
    {
      title: h.propMgmtTitle,
      subtitle: h.propMgmtSub,
      desc: h.propMgmtDesc,
      bullets: h.propMgmtBullets,
      footer: h.propMgmtFooter,
      ctaLabel: h.propMgmtCta,
      href: '/services/pricing#property-management-service',
    },
    {
      title: h.referralsTitle,
      subtitle: h.referralsSub,
      desc: h.referralsDesc,
      bullets: h.referralsBullets,
      footer: h.referralsFooter,
      ctaLabel: h.referralsCta,
      href: '/knowledge-hub/guides',
    },
  ];

  return (
    <>
      <Toast message={message} visible={visible} />

      <VideoHero heroText={heroText || undefined} heroSub={heroSub || undefined} />

      {/* CTA Banner */}
      <div style={{ background: 'var(--dark)', color: 'white', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 500, marginBottom: '1rem' }}>
          {h.ctaBanner}
        </p>
        <Link href="/post-listing" className="btn-accent">{h.postListing}</Link>
      </div>

      {/* Services section */}
      <section style={{ background: '#f7f4ef', padding: 'clamp(48px,7vw,88px) 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto 42px' }}>
            <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
              {h.ourServices}
            </span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.9rem,4vw,3rem)', margin: '10px 0 12px', color: 'var(--dark)' }}>
              {h.everythingUnderOneRoof}
            </h2>
            <p style={{ color: 'var(--mid)', maxWidth: 680, margin: '0 auto' }}>
              {h.servicesDesc}
            </p>
          </div>

          <div className="services-grid">
            {serviceCards.map((card) => (
              <div key={card.title} className="service-card">
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.55rem', color: 'var(--dark)', margin: '0 0 8px' }}>
                  {card.title}
                </h3>
                <p style={{ color: 'var(--dark)', fontWeight: 700, lineHeight: 1.5, margin: '0 0 12px' }}>
                  {card.subtitle}
                </p>
                <p style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.75, margin: '0 0 14px' }}>
                  {card.desc}
                </p>
                <ul className="service-list">
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.7, marginTop: 'auto', marginBottom: 16 }}>
                  {card.footer}
                </p>
                <Link href={card.href} className="service-cta">
                  {card.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          align-items: stretch;
          width: 100%;
        }
        .service-card {
          min-width: 0;
          background: #fff;
          border: 1px solid rgba(12, 26, 75, 0.08);
          border-radius: 18px;
          padding: 26px 22px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .service-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.13);
          border-color: rgba(245, 166, 35, 0.38);
        }
        .service-list {
          list-style: none;
          margin: 0 0 14px;
          padding: 0;
          color: var(--mid);
          font-size: 14px;
          line-height: 1.65;
        }
        .service-list li {
          position: relative;
          padding-left: 26px;
          margin-bottom: 8px;
        }
        .service-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          top: 0;
          color: var(--accent);
          font-weight: 900;
        }
        .service-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: var(--accent);
          color: #1e2a45;
          border: none;
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-top: auto;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, letter-spacing 0.22s ease;
        }
        .service-cta:hover,
        .service-card:hover .service-cta {
          background: #1e2a45;
          color: var(--accent);
          box-shadow: 0 10px 28px rgba(245, 166, 35, 0.35);
          transform: translateY(-2px);
          letter-spacing: 3px;
        }
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr; gap: 18px; }
          .service-card { padding: 22px 18px; }
          .service-card:hover { transform: none; }
          .service-cta { width: 100%; }
        }
      `}</style>
    </>
  );
}
