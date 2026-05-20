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
    icon: '🏦',
    title: 'Mortgage Application',
    subtitle: 'Get Approved With Confidence — Even for Complex Files',
    desc: 'Work with a highly experienced Mortgage Agent who partners with 50+ lenders across Canada to secure the best mortgage for your situation.',
    bullets: [
      'New home purchases',
      'Refinancing',
      'HELOC for renovations or debt consolidation',
      '20+ years of brokerage experience and 4.8★ client satisfaction',
    ],
    footer:
      'High approval rates, personalized guidance, and a smoother mortgage process from start to finish.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    icon: '🏡',
    title: 'Home Buying',
    subtitle: 'Patient Guidance. Honest Advice. Smart Protection.',
    desc: 'Buying a home takes time — and our dedicated Realtors are with you every step of the way, including repeat property visits when needed.',
    bullets: [
      'Spot visible issues, especially in older homes',
      'Understand structural pros and cons',
      'Identify potential legal concerns',
      'Evaluate risks before making an offer',
    ],
    footer:
      'We help protect your interests so you can buy the right home with confidence and peace of mind.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    icon: '📈',
    title: 'Home Selling',
    subtitle: 'Sell Faster. Negotiate Smarter. Keep More of Your Equity.',
    desc: 'Our Realtors combine market expertise with strong negotiation skills to help you price right and sell without leaving money on the table.',
    bullets: [
      'Strategic pricing for a faster sale',
      'Strong negotiation support',
      '1% flat-fee listing option',
      'Potential savings of $5,000–$10,000 vs. traditional commission packages',
    ],
    footer:
      'Professional service, transparent pricing, and maximum value — with payment only when your home sells.',
    ctaLabel: 'Contact Agent',
    href: '/contact',
  },
  {
    icon: '🔐',
    title: 'Rental & Tenant Placement',
    subtitle: 'Avoid Bad Tenants. Protect Your Investment.',
    desc: 'Post your rental listing free on our website and get help finding reliable tenants while reducing the risks of unpaid rent, property damage, and costly disputes.',
    bullets: [
      'Credit checks',
      'Employment and income verification',
      'Work history review and financial stability assessment',
      'Court filing search on OpenRoom',
    ],
    footer:
      'We filter out high-risk applicants and recommend responsible tenants to protect your property and your peace of mind.',
    ctaLabel: 'Tenant Placement',
    href: '/tenant-placement',
  },
  {
    icon: '🛠️',
    title: 'Property Management',
    subtitle: 'Worry-Free Management for Local & Overseas Landlords',
    desc: 'If you are travelling, living abroad, or simply too far from your rental property, we can help manage the day-to-day coordination on your behalf.',
    bullets: [
      '24/7 emergency call handling',
      'Coordinating repairs and maintenance',
      'Move-in and move-out inspections',
      'Regular property checks',
    ],
    footer:
      'We help keep your property safe, maintained, and professionally managed — even when you are not here.',
    ctaLabel: 'Property Management Service',
    href: '/services/pricing#property-management-service',
  },
  {
    icon: '🤝',
    title: 'Trusted Professional Referrals',
    subtitle: 'Access Our Network of Verified, Reliable Experts',
    desc: 'With years of collaboration across the industry, we can connect you with trusted professionals who deliver high-quality service.',
    bullets: [
      'Major repairs and home renovations',
      'Real estate lawyers for closing and legal review',
      'Paralegals for eviction notices and landlord-tenant disputes',
      'Reliable professionals with proven results',
    ],
    footer:
      'We only recommend professionals known for strong workmanship, professionalism, and consistent service quality.',
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

      <div style={{ background: 'var(--dark)', color: 'white', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 500, marginBottom: '1rem' }}>
          Ready to list your property? Reach thousands of buyers and renters across Canada.
        </p>
        <Link href="/post-listing" className="btn-accent">Post a Listing </Link>
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

      <section style={{ background: '#f7f4ef', padding: 'clamp(48px,7vw,88px) 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto 42px' }}>
            <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
              Our Services
            </span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.9rem,4vw,3rem)', margin: '10px 0 12px', color: 'var(--dark)' }}>
              Everything You Need Under One Roof
            </h2>
            <p style={{ color: 'var(--mid)', maxWidth: 680, margin: '0 auto' }}>
              Whether you&apos;re buying, selling, renting, or managing property — we offer practical support, trusted guidance, and reliable professional connections.
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
          background: #1e2a45;
          color: var(--accent);
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
          background: var(--accent);
          color: #1e2a45;
          box-shadow: 0 10px 28px rgba(245, 166, 35, 0.35);
          transform: translateY(-2px);
          letter-spacing: 3px;
        }

        @media (max-width: 1024px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .services-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .service-card {
            padding: 22px 18px;
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
