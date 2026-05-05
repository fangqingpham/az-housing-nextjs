'use client';

import Link from 'next/link';

const FOOTER_COLS = [
  {
    heading: 'Services',
    links: [
      { label: 'For Landlords',        href: '/services/landlords'      },
      { label: 'Tenant Screening',     href: '/services/landlords#tenant-screening' },
      { label: 'Rental Arrangement',   href: '/services/landlords#rental-arrangement' },
      { label: 'Property Management',  href: '/services/landlords#property-management' },
      { label: 'For Tenants',          href: '/services/tenants'        },
      { label: 'For Buyers & Sellers', href: '/services/buyers-sellers' },
      { label: 'Mortgage Advice',      href: '/services/buyers-sellers#mortgage' },
    ],
  },
  {
    heading: 'Listings',
    links: [
      { label: 'Search Properties', href: '/map-search'   },
      { label: 'For Sale',          href: '/buy'          },
      { label: 'For Rent',          href: '/rent'         },
      { label: 'Post a Property',   href: '/post-listing' },
      { label: 'Dashboard',         href: '/dashboard'    },
      { label: 'Landlord Portal',   href: '/landlord'     },
    ],
  },
  {
    heading: 'Knowledge Hub',
    links: [
      { label: 'Blog Articles',   href: '/blog'                  },
      { label: 'Buying & Selling Guide', href: '/knowledge-hub/guides#buying---selling' },
      { label: 'Mortgage Guides', href: '/knowledge-hub/guides#mortgages---finance' },
      { label: 'Renting Guides',  href: '/knowledge-hub/guides#renting'  },
      { label: 'Legal Updates',   href: '/knowledge-hub/guides#legal-updates' },
      { label: 'Renovation Tips', href: '/knowledge-hub/guides#renovation---maintenance' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',         href: '/about'              },
      { label: 'Contact & Support',href: '/contact'            },
      { label: 'Sign Up',          href: '/auth/register'      },
      { label: 'Log In',           href: '/auth/login'         },
      { label: 'Admin Panel',      href: '/admin'              },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.65)', paddingTop: 56 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Top: logo + tagline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 40, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Brand */}
          <div>
            <Link href="/" className="logo" style={{ textDecoration: 'none', fontSize: '1.5rem', display: 'block', marginBottom: 12 }}>
              A - <span>Z</span> Housing
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 260, marginBottom: 20, color: 'rgba(255,255,255,0.55)' }}>
              Canada's complete platform for property search, listing, and real estate guidance -- from search to sold.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Facebook', 'Instagram', 'LinkedIn', 'X'].map(s => (
                <div key={s} title={s} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                  {s === 'Facebook' ? '𝐟' : s === 'Instagram' ? '📷' : s === 'LinkedIn' ? 'in' : '𝕏'}
                </div>
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
                    <Link href={l.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', fontSize: 13, gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} A-Z Housing Solutions. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <Link key={l} href="/contact" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
