'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'

type SubItem = {
  label: string
  href: string
  desc?: string
}

type ServiceGroup = {
  label: string
  key: string
  items: SubItem[]
}

type NavItem =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'dropdown'; label: string; key: string; items: SubItem[] }
  | { kind: 'services'; label: string; key: string; groups: ServiceGroup[] }

const NAV: NavItem[] = [
  { kind: 'link', label: 'Home', href: '/' },
  {
    kind: 'services',
    label: 'Services',
    key: 'services',
    groups: [
      {
        label: 'For Landlords',
        key: 'landlords',
        items: [
          { label: 'Tenant Screening', href: '/services/landlords#tenant-screening', desc: 'Verify prospective tenants' },
          { label: 'Rental Arrangement', href: '/services/landlords#rental-arrangement', desc: 'Contracts & agreements' },
          { label: 'Property Management', href: '/services/landlords#property-management', desc: 'Day-to-day management support' },
          { label: 'Legal Advice & Eviction Prep', href: '/services/landlords#legal-advice', desc: 'Rights, notices & proceedings' },
        ],
      },
      {
        label: 'For Tenants',
        key: 'tenants',
        items: [
          { label: 'Property Search', href: '/services/tenants#property-search', desc: 'Find your perfect home' },
          { label: 'Contact Landlords', href: '/services/tenants#contact-landlords', desc: 'Direct communication tools' },
        ],
      },
      {
        label: 'For Buyers & Sellers',
        key: 'buyers-sellers',
        items: [
          { label: 'House Selling Guidance', href: '/services/buyers-sellers#selling', desc: 'Maximise your sale price' },
          { label: 'Purchasing Guidance', href: '/services/buyers-sellers#purchasing', desc: 'Navigate the buying process' },
          { label: 'Mortgage Advice', href: '/services/buyers-sellers#mortgage', desc: 'Rates, lenders & calculators' },
          { label: 'Renovation & Maintenance', href: '/services/buyers-sellers#renovation', desc: 'Improve & maintain your home' },
        ],
      },
    ],
  },
  {
    kind: 'dropdown',
    label: 'Listings',
    key: 'listings',
    items: [
      { label: 'Search Properties', href: '/map-search', desc: 'Browse with interactive map' },
      { label: 'For Sale', href: '/buy', desc: 'Browse homes for sale' },
      { label: 'For Rent', href: '/rent', desc: 'Browse rental properties' },
      { label: 'Post a Property', href: '/post-listing', desc: 'List your home or rental' },
      { label: 'Dashboard', href: '/dashboard', desc: 'Manage listings & saved searches' },
    ],
  },
  {
    kind: 'dropdown',
    label: 'Knowledge Hub',
    key: 'knowledge',
    items: [
      { label: 'Blog Articles', href: '/blog', desc: 'Market insights & news' },
      { label: 'Guides', href: '/knowledge-hub/guides', desc: 'Buy, sell, rent & mortgage' },
    ],
  },
  {
    kind: 'dropdown',
    label: 'User Account',
    key: 'account',
    items: [
      { label: 'Sign Up / Login', href: '/auth/login', desc: 'Access your account' },
      { label: 'Dashboard', href: '/dashboard', desc: 'Landlord & tenant tools' },
    ],
  },
  { kind: 'link', label: 'Contact & Support', href: '/contact' },
  { kind: 'link', label: 'About Us', href: '/about' },
]

const PANEL: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
  border: '1px solid rgba(0,0,0,0.07)',
  zIndex: 5000,
  padding: '8px 0',
  minWidth: 230,
  marginTop: 0,
}

function SimpleDropdown({
  items,
  onClose,
}: {
  items: SubItem[]
  onClose: () => void
}) {
  return (
    <div style={PANEL}>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{
            display: 'block',
            padding: '11px 18px',
            textDecoration: 'none',
            transition: 'background .15s',
          }}
          onMouseEnter={event => {
            event.currentTarget.style.background = 'var(--cream)'
          }}
          onMouseLeave={event => {
            event.currentTarget.style.background = 'transparent'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>
            {item.label}
          </div>

          {item.desc && (
            <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>
              {item.desc}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

function ServicesPanel({
  groups,
  onClose,
}: {
  groups: ServiceGroup[]
  onClose: () => void
}) {
  const [activeGroup, setActiveGroup] = useState<string>(groups[0]?.key || '')
  const current = groups.find(group => group.key === activeGroup) || groups[0]

  return (
    <div
      style={{
        ...PANEL,
        display: 'flex',
        minWidth: 560,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 190,
          background: 'var(--cream)',
          borderRight: '1px solid rgba(0,0,0,0.07)',
          padding: '8px 0',
          flexShrink: 0,
        }}
      >
        {groups.map(group => (
          <button
            key={group.key}
            type="button"
            onMouseEnter={() => setActiveGroup(group.key)}
            onClick={() => setActiveGroup(group.key)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '11px 18px',
              background: activeGroup === group.key ? '#fff' : 'transparent',
              border: 'none',
              borderLeft: `3px solid ${activeGroup === group.key ? 'var(--accent)' : 'transparent'}`,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: activeGroup === group.key ? 'var(--dark)' : 'var(--mid)',
              transition: 'all .15s',
            }}
          >
            {group.label}
            <span style={{ fontSize: 10, opacity: 0.5 }}>›</span>
          </button>
        ))}

        <div
          style={{
            margin: '10px 12px 6px',
            padding: '10px 6px',
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Link
            href="/landlord"
            onClick={onClose}
            style={{
              fontSize: 12,
              color: 'var(--accent)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Landlord Portal →
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, padding: '8px 0' }}>
        <div
          style={{
            padding: '8px 16px 6px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: 'var(--mid)',
            textTransform: 'uppercase',
          }}
        >
          {current.label}
        </div>

        {current.items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{
              display: 'block',
              padding: '10px 16px',
              textDecoration: 'none',
              transition: 'background .15s',
            }}
            onMouseEnter={event => {
              event.currentTarget.style.background = 'var(--cream)'
            }}
            onMouseLeave={event => {
              event.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>
              {item.label}
            </div>

            {item.desc && (
              <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>
                {item.desc}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileAccordion({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '13px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--dark)',
        }}
      >
        {label}
        <span
          style={{
            transition: 'transform .2s',
            transform: open ? 'rotate(180deg)' : 'none',
            fontSize: 12,
          }}
        >
          ▾
        </span>
      </button>

      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  )
}

export default function Navbar() {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileServicesGroup, setMobileServicesGroup] = useState<string | null>(null)

  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenKey(null)
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)

    return () => {
      document.removeEventListener('mousedown', handler)
    }
  }, [])

  useEffect(() => {
    setOpenKey(null)
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  const servicesItem = NAV.find(item => item.kind === 'services') as Extract<NavItem, { kind: 'services' }>
  const dropdownItems = NAV.filter(item => item.kind === 'dropdown') as Extract<NavItem, { kind: 'dropdown' }>[]

  return (
    <nav
      ref={navRef}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 3000,
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 20px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'visible',
        }}
      >
        <Link
  href="/"
  style={{
    marginRight: 16,
    flexShrink: 0,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    height: 62,
  }}
>
  <Image
    src="/logo.png"
    alt="A-Z Housing Solutions"
    width={100}
    height={45}
    priority
    style={{
      width: '100px',
      maxHeight: '45px',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
    }}
  />
</Link>

        <div
          className="nav-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: 0,
            flexWrap: 'nowrap',
            overflow: 'visible',
            minWidth: 0,
          }}
        >
          {NAV.map(item => {
            if (item.kind === 'link') {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '0 10px',
                    height: 62,
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    color: active ? 'var(--accent)' : 'var(--dark)',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'color .15s',
                  }}
                >
                  {item.label}
                </Link>
              )
            }

            const active =
              item.kind === 'dropdown'
                ? item.items.some(subItem => pathname.startsWith(subItem.href))
                : item.groups.some(group =>
                    group.items.some(subItem => pathname.startsWith(subItem.href.split('#')[0]))
                  )

            return (
              <div
                key={item.key}
                style={{
                  position: 'relative',
                  height: 62,
                  display: 'inline-flex',
                  alignItems: 'center',
                  overflow: 'visible',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenKey(current => (current === item.key ? null : item.key))}
                  style={{
                    padding: '0 10px',
                    height: 62,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: active ? 'var(--accent)' : 'var(--dark)',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'color .15s',
                  }}
                >
                  {item.label}
                  <span
                    style={{
                      fontSize: 9,
                      opacity: 0.5,
                      transition: 'transform .2s',
                      transform: openKey === item.key ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    ▾
                  </span>
                </button>

                {openKey === item.key &&
                  (item.kind === 'services' ? (
                    <ServicesPanel groups={item.groups} onClose={() => setOpenKey(null)} />
                  ) : (
                    <SimpleDropdown items={item.items} onClose={() => setOpenKey(null)} />
                  ))}
              </div>
            )
          })}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {user ? (
            <>
              <Link
                href="/post-listing"
                className="btn btn-sm btn-accent"
                style={{
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                + List Property
              </Link>

              <div
                className="nav-avatar"
                onClick={() => setUserMenuOpen(value => !value)}
                title={user.fname}
                style={{
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {getInitials(`${user.fname} ${user.lname || ''}`)}
              </div>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 50,
                    right: 0,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    minWidth: 180,
                    zIndex: 6000,
                    padding: '6px 0',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 16px 8px',
                      fontSize: 12,
                      color: 'var(--mid)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {user.fname} {user.lname}
                  </div>

                  <Link
                    href="/dashboard"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: 14,
                      color: 'var(--dark)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/post-listing"
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      fontSize: 14,
                      color: 'var(--dark)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Post a Listing
                  </Link>

                  <hr style={{ margin: '4px 0', borderColor: 'var(--border)' }} />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: 14,
                      color: 'var(--red)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-sm" style={{ textDecoration: 'none' }}>
                Log In
              </Link>

              <Link href="/auth/register" className="btn btn-sm btn-accent" style={{ textDecoration: 'none' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="nav-burger"
          type="button"
          onClick={() => setMobileOpen(value => !value)}
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            marginLeft: 6,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'var(--dark)',
              marginBottom: 5,
              transition: 'transform .2s',
              transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)' : 'none',
            }}
          />

          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'var(--dark)',
              marginBottom: 5,
              opacity: mobileOpen ? 0 : 1,
              transition: 'opacity .2s',
            }}
          />

          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'var(--dark)',
              transition: 'transform .2s',
              transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none',
            }}
          />
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--dark)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            Home
          </Link>

          <MobileAccordion label="Services">
            {servicesItem.groups.map(group => (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => setMobileServicesGroup(value => (value === group.key ? null : group.key))}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 20px 10px 32px',
                    background: 'var(--cream)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--dark)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {group.label}
                  <span style={{ fontSize: 10, opacity: 0.5 }}>
                    {mobileServicesGroup === group.key ? '▲' : '▼'}
                  </span>
                </button>

                {mobileServicesGroup === group.key &&
                  group.items.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 20px 10px 48px',
                        fontSize: 13,
                        color: 'var(--mid)',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>
            ))}
          </MobileAccordion>

          {dropdownItems.map(item => (
            <MobileAccordion key={item.key} label={item.label}>
              {item.items.map(subItem => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 20px 10px 32px',
                    fontSize: 14,
                    color: 'var(--mid)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {subItem.label}
                </Link>
              ))}
            </MobileAccordion>
          ))}

          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--dark)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            Contact & Support
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--dark)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            About Us
          </Link>

          <div style={{ padding: '12px 20px', display: 'flex', gap: 10 }}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm"
                  style={{
                    textDecoration: 'none',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    color: 'var(--red)',
                    borderColor: 'var(--red)',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm"
                  style={{
                    textDecoration: 'none',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  Log In
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-sm btn-accent"
                  style={{
                    textDecoration: 'none',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}