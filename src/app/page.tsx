'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoHero from '@/components/layout/VideoHero';
import PropertyCard from '@/components/listings/PropertyCard';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { getListings, getSavedIds, toggleSaved } from '@/lib/api';
import type { Listing } from '@/types';

const serviceCards = [
  {
    title: 'Mortgage Application',
    subtitle: 'Get Approved With Confidence — Even for Complex Files',
    desc: 'Work with a highly experienced Mortgage Agent who partners with 50+ lenders across Canada to secure the best mortgage for your situation.',
    bullets: [
      'New home purchases',
      'Refinancing',
      'HELOC for renovations or debt consolidation',
      'Support for self-employed income and lower credit scores',
    ],
    footer: 'High approval rates, personalized guidance, and a smoother mortgage process from start to finish.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    title: 'Home Buying',
    subtitle: 'Patient Guidance. Honest Advice. Smart Protection.',
    desc: 'Buying a home takes time — and our dedicated Realtors are with you every step of the way, including repeat property visits when needed.',
    bullets: [
      'Spot visible issues, especially in older homes',
      'Understand structural pros and cons',
      'Identify potential legal concerns',
      'Evaluate risks before making an offer',
    ],
    footer: 'We help protect your interests so you can buy the right home with confidence and peace of mind.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    title: 'Home Selling',
    subtitle: 'Sell Faster. Negotiate Smarter. Keep More of Your Equity.',
    desc: 'Our Realtors combine market expertise with strong negotiation skills to help you price right and sell without leaving money on the table.',
    bullets: [
      'Strategic pricing for a faster sale',
      'Strong negotiation support',
      '1% flat-fee listing option',
      'Potential savings of $5,000–$10,000',
    ],
    footer: 'Professional service, transparent pricing, and maximum value — with payment only when your home sells.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    title: 'Rental & Tenant Placement',
    subtitle: 'Avoid Bad Tenants. Protect Your Investment.',
    desc: 'Post your rental listing free on our website and get help finding reliable tenants while reducing the risks of unpaid rent, damage, and disputes.',
    bullets: [
      'Credit checks',
      'Employment and income verification',
      'Work history and financial stability assessment',
      'Court filing search on OpenRoom',
    ],
    footer: 'We filter out high-risk applicants and recommend responsible tenants to protect your property and peace of mind.',
    ctaLabel: 'Tenant Placement',
    href: '/tenant-placement',
  },
  {
    title: 'Property Management',
    subtitle: 'Worry-Free Management for Local & Overseas Landlords',
    desc: 'If you are travelling, living abroad, or simply too far from your rental property, we can help manage coordination on your behalf.',
    bullets: [
      '24/7 emergency call handling',
      'Coordinating repairs and maintenance',
      'Move-in and move-out inspections',
      'Regular property checks',
    ],
    footer: 'We help keep your property safe, maintained, and professionally managed — even when you are not here.',
    ctaLabel: 'Property Management Service',
    href: '/services/pricing#property-management-service',
  },
  {
    title: 'Trusted Professional Referrals',
    subtitle: 'Access Our Network of Verified, Reliable Experts',
    desc: 'With years of collaboration across the industry, we can connect you with trusted professionals who deliver high-quality service.',
    bullets: [
      'Major repairs and home renovations',
      'Real estate lawyers for closing and legal review',
      'Paralegals for eviction notices and disputes',
      'Reliable professionals with proven results',
    ],
    footer: 'We recommend professionals known for workmanship, professionalism, and consistent service quality.',
    ctaLabel: 'Trusted Home Services Referrals',
    href: '/knowledge-hub/guides',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { message, visible, showToast } = useToast();

  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [rentListings, setRentListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [heroText, setHeroText] = useState('Find Your Perfect Home Across Canada');
  const [heroSub, setHeroSub] = useState('Browse thousands of listings from trusted sellers and agents across Canada.');

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

  return (
    <>
      <Toast message={message} visible={visible} />

      <VideoHero heroText={heroText} heroSub={heroSub} />

      {false && (
        <section className="sec">
          <div className="container">
            <div className="sec-hdr">
              <h2 className="sec-title">Featured For Sale</h2>
              <Link href="/buy" className="sec-link">View all listings →</Link>
            </div>
            <div className="grid">
              {saleListings.length > 0 ? (
                saleListings.map(l => (
                  <PropertyCard key={l.id} listing={l} savedIds={savedIds} onToggleSave={handleToggleSave} />
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <p>No sale listings yet. <Link href="/post-listing" style={{ color: 'var(--accent)' }}>Post the first one!</Link></p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="promo-band">
        <p className="promo-text">Ready to list your property? Reach thousands of buyers and renters across Canada.</p>
        <Link href="/post-listing" className="btn-accent">Post a Listing →</Link>
      </div>

      {false && (
        <section className="sec">
          <div className="container">
            <div className="sec-hdr">
              <h2 className="sec-title">Featured For Rent</h2>
              <Link href="/rent" className="sec-link">View all rentals →</Link>
            </div>
            <div className="grid">
              {rentListings.length > 0 ? (
                rentListings.map(l => (
                  <PropertyCard key={l.id} listing={l} savedIds={savedIds} onToggleSave={handleToggleSave} />
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <p>No rental listings yet. <Link href="/post-listing" style={{ color: 'var(--accent)' }}>Post the first one!</Link></p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="services-section">
        <div className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">Our Services</span>
            <h2>Everything You Need Under One Roof</h2>
            <p>
              Whether you&apos;re buying, selling, renting, or managing property — we offer practical support,
              trusted guidance, and reliable professional connections.
            </p>
          </div>

          <div className="services-grid">
            {serviceCards.map(card => (
              <article key={card.title} className="service-card">
                <div className="service-card-content">
                  <h3>{card.title}</h3>
                  <p className="service-subtitle">{card.subtitle}</p>
                  <p className="service-desc">{card.desc}</p>

                  <ul className="service-list">
                    {card.bullets.map(bullet => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>

                  <p className="service-footer">{card.footer}</p>
                </div>

                <Link href={card.href} className="service-cta">
                  {card.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .promo-band {
          background: var(--dark);
          color: white;
          padding: 2.5rem 1.5rem;
          text-align: center;
        }

        .promo-text {
          font-family: var(--serif);
          font-size: clamp(18px, 3vw, 26px);
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .services-section {
          background: #f7f4ef;
          padding: clamp(48px, 7vw, 88px) 18px;
          overflow-x: hidden;
        }

        .services-container {
          max-width: 1220px;
          margin: 0 auto;
          width: 100%;
        }

        .services-header {
          text-align: center;
          max-width: 860px;
          margin: 0 auto 42px;
        }

        .services-eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 700;
        }

        .services-header h2 {
          font-family: var(--serif);
          font-size: clamp(1.9rem, 4vw, 3rem);
          margin: 10px 0 12px;
          color: var(--dark);
          line-height: 1.15;
        }

        .services-header p {
          color: var(--mid);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.7;
        }

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

        .service-card-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .service-card h3 {
          font-family: var(--serif);
          font-size: clamp(1.35rem, 2vw, 1.65rem);
          color: var(--dark);
          margin: 0 0 8px;
          line-height: 1.25;
        }

        .service-subtitle {
          color: var(--dark);
          font-weight: 800;
          line-height: 1.5;
          margin: 0 0 12px;
          font-size: 0.96rem;
        }

        .service-desc,
        .service-footer {
          color: var(--mid);
          font-size: 14px;
          line-height: 1.7;
          margin: 0 0 14px;
        }

        .service-footer {
          margin-top: auto;
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
          background: transparent;
          color: var(--accent);
          border: 1.5px solid rgba(245, 166, 35, 0.55);
          padding: 11px 18px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 4px;
          box-shadow: inset 0 0 0 0 var(--accent);
          transition: color 0.22s ease, border-color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        }

        .service-cta:hover,
        .service-card:hover .service-cta {
          color: #fff;
          border-color: var(--accent);
          background: var(--accent);
          box-shadow: 0 10px 24px rgba(245, 166, 35, 0.25);
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .services-section {
            padding: 44px 16px;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .service-card {
            padding: 22px 18px;
            border-radius: 16px;
          }

          .service-card:hover {
            transform: none;
          }

          .service-cta {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
