'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoHero from '@/components/layout/VideoHero';
import PropertyCard from '@/components/listings/PropertyCard';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import {
  getListings,
  getUserCount,
  getSavedIds,
  toggleSaved,
} from '@/lib/api';
import type { Listing } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { message, visible, showToast } = useToast();

  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [rentListings, setRentListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [listingCount, setListingCount] = useState('0');
  const [userCount, setUserCount] = useState('0');
  const [heroText, setHeroText] = useState('Find Your Perfect Home Across Canada');
  const [heroSub, setHeroSub] = useState(
    'Browse thousands of listings from trusted sellers and agents across Canada.'
  );
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const [allListings, uc, settings] = await Promise.all([
        getListings(),
        getUserCount(),
        fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      const sale = allListings.filter((l: any) => l.type === 'For Sale').slice(0, 4);
      const rent = allListings.filter((l: any) => l.type === 'For Rent').slice(0, 4);
      setSaleListings(sale);
      setRentListings(rent);
      setListingCount(allListings.length ? allListings.length.toLocaleString() : '0');
      setUserCount(uc ? uc.toLocaleString() : '0');
      if (settings?.hero) setHeroText(settings.hero);
      if (settings?.herosub) setHeroSub(settings.herosub);
      if (settings?.videoSrc) setVideoSrc(settings.videoSrc);
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
    setSavedIds((prev) =>
      nowSaved ? [...prev, id] : prev.filter((x) => x !== id)
    );
    showToast(nowSaved ? 'Property saved! ♥' : 'Removed from saved.');
  };

  return (
    <>
      <Toast message={message} visible={visible} />

      {/* ── Video Hero Banner ── */}
      <VideoHero
  heroText={heroText}
  heroSub={heroSub}
      />

      {/* ── Featured For Sale ── */}
      <section className="sec">
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Featured For Sale</h2>
            <Link href="/buy" className="sec-link">View all listings →</Link>
          </div>
          <div className="grid">
            {saleListings.length > 0 ? (
              saleListings.map((l) => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                />
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>
                  No sale listings yet.{' '}
                  <Link href="/post-listing" style={{ color: 'var(--accent)' }}>
                    Post the first one!
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Promo band ── */}
      <div
        style={{
          background: 'var(--dark)',
          color: 'white',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(18px,3vw,26px)',
            fontWeight: 500,
            marginBottom: '1rem',
          }}
        >
          Ready to list your property? Reach thousands of buyers and renters across Canada.
        </p>
        <Link href="/post-listing" className="btn-accent">
          Post a Listing →
        </Link>
      </div>

      {/* ── Featured For Rent ── */}
      <section className="sec">
        <div className="container">
          <div className="sec-hdr">
            <h2 className="sec-title">Featured For Rent</h2>
            <Link href="/rent" className="sec-link">View all rentals →</Link>
          </div>
          <div className="grid">
            {rentListings.length > 0 ? (
              rentListings.map((l) => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                />
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>
                  No rental listings yet.{' '}
                  <Link href="/post-listing" style={{ color: 'var(--accent)' }}>
                    Post the first one!
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Services band ── */}
      <section
        style={{
          background: '#f7f4ef',
          padding: 'clamp(48px,7vw,80px) 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            Our Services
          </span>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.6rem,3vw,2.4rem)',
              marginBottom: 12,
              color: 'var(--dark)',
            }}
          >
            Everything You Need Under One Roof
          </h2>
          <p style={{ color: 'var(--mid)', marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
            Whether you&apos;re buying, selling, or renting — we have the tools and expertise to help.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 24,
            }}
          >
            {[
              { icon: '🏠', title: 'Buy a Home',       desc: 'Browse thousands of verified listings across Canada.',   href: '/buy' },
              { icon: '🔑', title: 'Rent a Property',  desc: 'Find your next rental — apartments, houses & more.',     href: '/rent' },
              { icon: '📋', title: 'List Your Property', desc: 'Reach serious buyers and renters quickly.',             href: '/post-listing' },
              { icon: '📚', title: 'Knowledge Hub',    desc: 'Expert guides on buying, selling & renting in Canada.',  href: '/knowledge-hub/guides' },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: '28px 22px',
                    border: '1px solid rgba(0,0,0,0.07)',
                    transition: 'transform .18s, box-shadow .18s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(0,0,0,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                  <h3
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: '1.1rem',
                      color: 'var(--dark)',
                      marginBottom: 8,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
