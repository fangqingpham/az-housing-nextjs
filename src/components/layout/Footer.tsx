'use client'

import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'

export default function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  const FOOTER_COLS = [
    {
      heading: f.services,
      links: [
        { label: f.forLandlords, href: '/services/landlords' },
        { label: f.tenantScreening, href: '/services/landlords#tenant-screening' },
        { label: f.rentalArrangement, href: '/services/landlords#rental-arrangement' },
        { label: f.propertyManagement, href: '/services/landlords#property-management' },
        { label: f.forTenants, href: '/services/tenants' },
        { label: f.forBuyersSellers, href: '/services/buyers-sellers' },
        { label: f.mortgageAdvice, href: '/services/buyers-sellers#mortgage' },
      ],
    },
    {
      heading: f.listings2,
      links: [        
        { label: f.forSale, href: '/buy' },
        { label: f.forRent, href: '/rent' },
        { label: f.postProperty, href: '/post-listing' },
        { label: f.dashboard, href: '/dashboard' },
        { label: f.landlordPortal, href: '/landlord' },
      ],
    },
    {
      heading: f.knowledgeHub,
      links: [
        { label: f.blogArticles, href: '/blog' },
        { label: f.buyingSellingGuide, href: '/knowledge-hub/guides#buying---selling' },
        { label: f.mortgageGuides, href: '/knowledge-hub/guides#mortgages---finance' },
        { label: f.rentingGuides, href: '/knowledge-hub/guides#renting' },
        { label: f.legalResources, href: '/knowledge-hub/guides#legal-updates' },
        { label: f.renovationTips, href: '/knowledge-hub/guides#renovation---maintenance' },
      ],
    },
    {
      heading: f.company,
      links: [
        { label: f.aboutUs, href: '/about' },
        { label: f.contactSupport, href: '/contact' },
        { label: f.signUp, href: '/auth/register' },
        { label: f.logIn, href: '/auth/login' },
        { label: f.adminPanel, href: '/admin' },
      ],
    },
  ]

  const POLICY_LINKS = [
    { label: f.privacyPolicy, href: '/privacy' },
    { label: f.termsOfService, href: '/terms' },
    { label: f.cookiePolicy, href: '/cookies' },
  ]

  return (
    <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.65)', paddingTop: 56 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Brand */}
          <div>
            <Link href="/" className="logo" style={{ textDecoration: 'none', fontSize: '1.5rem', display: 'block', marginBottom: 12 }}>
              A - <span>Z</span> Housing
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 260, marginBottom: 20, color: 'rgba(255,255,255,0.55)' }}>
              {f.tagline}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Facebook', 'Instagram', 'LinkedIn', 'X'].map(s => (
                <div
                  key={s}
                  title={s}
                  style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.16)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)')}
                />
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>{col.heading}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ padding: '18px 0', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} A-Z Housing Solutions. {f.rights}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{f.operatedBy}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{f.address}</span>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {POLICY_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color .15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
