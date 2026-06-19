'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getInitials } from '@/lib/utils'
import type { Lang } from '@/lib/translations'

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

type SubItem = { label: string; href: string; desc?: string }
type ServiceGroup = { label: string; key: string; items: SubItem[] }
type NavItem =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'dropdown'; label: string; key: string; items: SubItem[] }
  | { kind: 'services'; label: string; key: string; groups: ServiceGroup[] }

function SimpleDropdown({ items, onClose }: { items: SubItem[]; onClose: () => void }) {
  return (
    <div style={PANEL}>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{ display: 'block', padding: '11px 18px', textDecoration: 'none', transition: 'background .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{item.label}</div>
          {item.desc && <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>{item.desc}</div>}
        </Link>
      ))}
    </div>
  )
}

function ServicesPanel({ groups, onClose }: { groups: ServiceGroup[]; onClose: () => void }) {
  const [activeGroup, setActiveGroup] = useState<string>(groups[0]?.key || '')
  const current = groups.find(g => g.key === activeGroup) || groups[0]

  return (
    <div style={{ ...PANEL, display: 'flex', minWidth: 560, padding: 0, overflow: 'hidden' }}>
      <div style={{ width: 190, background: 'var(--cream)', borderRight: '1px solid rgba(0,0,0,0.07)', padding: '8px 0', flexShrink: 0 }}>
        {groups.map(group => (
          <button
            key={group.key}
            type="button"
            onMouseEnter={() => setActiveGroup(group.key)}
            onClick={() => setActiveGroup(group.key)}
            style={{
              width: '100%', textAlign: 'left', padding: '11px 18px',
              background: activeGroup === group.key ? '#fff' : 'transparent',
              border: 'none',
              borderLeft: `3px solid ${activeGroup === group.key ? 'var(--accent)' : 'transparent'}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: activeGroup === group.key ? 'var(--dark)' : 'var(--mid)',
            }}
          >
            {group.label}
            <span style={{ fontSize: 10, opacity: 0.5 }}>›</span>
          </button>
        ))}
        <div style={{ margin: '10px 12px 6px', padding: '10px 6px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Link href="/landlord" onClick={onClose} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
            {groups[0]?.key === 'landlords' ? 'Landlord Portal →' : '房东门户 →'}
          </Link>
        </div>
      </div>
      <div style={{ flex: 1, padding: '8px 0' }}>
        <div style={{ padding: '8px 16px 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--mid)', textTransform: 'uppercase' }}>
          {current.label}
        </div>
        {current.items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', transition: 'background .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{item.label}</div>
            {item.desc && <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>{item.desc}</div>}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileAccordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, color: 'var(--dark)' }}
      >
        {label}
        <span style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', fontSize: 12 }}>▾</span>
      </button>
      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  )
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ display: 'block', padding: '11px 18px 11px 34px', fontSize: 14, color: 'var(--mid)', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      {children}
    </Link>
  )
}

// ── Language toggle pill ────────────────────────────────────────────────────
function LangToggle() {
  const { lang, setLang } = useLanguage()
  const next: Lang = lang === 'en' ? 'zh' : 'en'
  const label = lang === 'en' ? '中文' : 'EN'

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      title={lang === 'en' ? 'Switch to Chinese' : '切换为英文'}
      style={{
        padding: '5px 12px',
        border: '1.5px solid var(--accent)',
        borderRadius: 999,
        background: 'transparent',
        color: 'var(--accent)',
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        letterSpacing: 0.5,
        transition: 'all 0.18s',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--accent)'
      }}
    >
      🌐 {label}
    </button>
  )
}

export default function Navbar() {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileServicesGroup, setMobileServicesGroup] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

  // Build nav from translations
  const NAV: NavItem[] = [
    { kind: 'link', label: t.nav.home, href: '/' },
    {
      kind: 'services',
      label: t.nav.services,
      key: 'services',
      groups: [
        {
          label: t.nav.forLandlords,
          key: 'landlords',
          items: [
            { label: t.nav.tenantPlacement, href: '/services/landlords#tenant-screening', desc: t.nav.tenantPlacementDesc },
            { label: t.nav.rentalArrangement, href: '/services/landlords#rental-arrangement', desc: t.nav.rentalArrangementDesc },
            { label: t.nav.propertyManagement, href: '/services/landlords#property-management', desc: t.nav.propertyManagementDesc },
            { label: t.nav.legalAdvice, href: '/services/landlords#legal-advice', desc: t.nav.legalAdviceDesc },
          ],
        },
        {
          label: t.nav.forTenants,
          key: 'tenants',
          items: [
            { label: t.nav.propertySearch, href: '/services/tenants#property-search', desc: t.nav.propertySearchDesc },
            { label: t.nav.landingArrangement, href: '/landing-arrangement', desc: t.nav.landingArrangementDesc },
          ],
        },
        {
          label: t.nav.forBuyersSellers,
          key: 'buyers-sellers',
          items: [
            { label: t.nav.houseSellingGuidance, href: '/services/buyers-sellers#selling', desc: t.nav.houseSellingGuidanceDesc },
            { label: t.nav.purchasingGuidance, href: '/services/buyers-sellers#purchasing', desc: t.nav.purchasingGuidanceDesc },
            { label: t.nav.mortgageAdvice, href: '/services/buyers-sellers#mortgage', desc: t.nav.mortgageAdviceDesc },
            { label: t.nav.renovationMaintenance, href: '/services/buyers-sellers#renovation', desc: t.nav.renovationMaintenanceDesc },
          ],
        },
        {
          label: t.nav.pricing,
          key: 'pricing',
          items: [
            { label: t.nav.azPrivateLeasing, href: '/services/pricing#az-private-leasing', desc: t.nav.azPrivateLeasingDesc },
            { label: t.nav.realtorMLSLeasing, href: '/services/pricing#realtor-mls-leasing', desc: t.nav.realtorMLSLeasingDesc },
            { label: t.nav.propertyManagementService, href: '/services/pricing#property-management', desc: t.nav.propertyManagementServiceDesc },
          ],
        },
      ],
    },
    {
      kind: 'dropdown',
      label: t.nav.listings,
      key: 'listings',
      items: [
        { label: t.nav.forSale, href: '/buy', desc: t.nav.forSaleDesc },
        { label: t.nav.forRent, href: '/rent', desc: t.nav.forRentDesc },
        { label: t.nav.postProperty, href: '/post-listing', desc: t.nav.postPropertyDesc },
        { label: t.nav.dashboard, href: '/dashboard', desc: t.nav.dashboardDesc },
      ],
    },
    {
      kind: 'dropdown',
      label: t.nav.knowledgeHub,
      key: 'knowledge',
      items: [
        { label: t.nav.blogArticles, href: '/blog', desc: t.nav.blogArticlesDesc },
        { label: t.nav.guides, href: '/knowledge-hub/guides', desc: t.nav.guidesDesc },
      ],
    },
    {
      kind: 'dropdown',
      label: t.nav.account,
      key: 'account',
      items: [
        { label: t.nav.signUpLogin, href: '/auth/login', desc: t.nav.signUpLoginDesc },
        { label: t.nav.dashboard, href: '/dashboard', desc: t.nav.dashboardDesc },
      ],
    },
    { kind: 'link', label: t.nav.contact, href: '/contact' },
    { kind: 'link', label: t.nav.about, href: '/about' },
  ]

  const servicesItem = NAV.find(i => i.kind === 'services') as Extract<NavItem, { kind: 'services' }>
  const dropdownItems = NAV.filter(i => i.kind === 'dropdown') as Extract<NavItem, { kind: 'dropdown' }>[]

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 900)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenKey(null)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setOpenKey(null)
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <nav
      ref={navRef}
      style={{
        position: 'sticky', top: 0, zIndex: 3000, background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        overflow: 'visible', width: '100%', maxWidth: '100vw',
      }}
    >
      <div style={{
        maxWidth: 1400, width: '100%', margin: '0 auto',
        padding: isMobile ? '0 14px' : '0 20px',
        height: isMobile ? 58 : 62,
        display: 'flex', alignItems: 'center',
        justifyContent: isMobile ? 'space-between' : 'flex-start',
        gap: 2, overflow: 'visible',
      }}>
        {/* Logo */}
        <Link href="/" style={{ marginRight: isMobile ? 0 : 14, flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', height: isMobile ? 58 : 62 }}>
          <Image
            src="/logo.png"
            alt="A-Z Housing Solutions"
            width={isMobile ? 58 : 88}
            height={isMobile ? 32 : 42}
            priority
            style={{ width: isMobile ? '58px' : '88px', maxHeight: isMobile ? '44px' : '54px', height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0, flexWrap: 'nowrap', overflow: 'visible', minWidth: 0 }}>
            {NAV.map(item => {
              if (item.kind === 'link') {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href} style={{
                    padding: '0 10px', height: 62, display: 'inline-flex', alignItems: 'center',
                    fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', textDecoration: 'none',
                    color: active ? 'var(--accent)' : 'var(--dark)',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  }}>
                    {item.label}
                  </Link>
                )
              }
              const active =
                item.kind === 'dropdown'
                  ? item.items.some(s => pathname.startsWith(s.href))
                  : item.groups.some(g => g.items.some(s => pathname.startsWith(s.href.split('#')[0])))

              return (
                <div
                  key={item.key}
                  style={{ position: 'relative', height: 62, display: 'inline-flex', alignItems: 'center', overflow: 'visible' }}
                  onMouseEnter={() => setOpenKey(item.key)}
                  onMouseLeave={() => setOpenKey(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenKey(c => (c === item.key ? null : item.key))}
                    style={{
                      padding: '0 10px', height: 62, background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      color: active ? 'var(--accent)' : 'var(--dark)',
                      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    {item.label}
                    <span style={{ fontSize: 9, opacity: 0.5, transform: openKey === item.key ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </button>
                  {openKey === item.key && (
                    item.kind === 'services'
                      ? <ServicesPanel groups={item.groups} onClose={() => setOpenKey(null)} />
                      : <SimpleDropdown items={item.items} onClose={() => setOpenKey(null)} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Desktop right actions */}
        {!isMobile && (
          <div className="nav-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, position: 'relative' }}>
            <LangToggle />

            {user ? (
              <>
                <Link href="/post-listing" className="btn btn-sm btn-accent" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  {t.nav.listProperty}
                </Link>
                <div className="nav-avatar" onClick={() => setUserMenuOpen(v => !v)} title={user.fname} style={{ cursor: 'pointer', flexShrink: 0 }}>
                  {getInitials(`${user.fname} ${user.lname || ''}`)}
                </div>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 50, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 6000, padding: '6px 0' }}>
                    <div style={{ padding: '10px 16px 8px', fontSize: 12, color: 'var(--mid)', borderBottom: '1px solid var(--border)' }}>{user.fname} {user.lname}</div>
                    <Link href="/dashboard" style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--dark)', textDecoration: 'none' }} onClick={() => setUserMenuOpen(false)}>{t.nav.dashboard}</Link>
                    <Link href="/post-listing" style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--dark)', textDecoration: 'none' }} onClick={() => setUserMenuOpen(false)}>{t.nav.postProperty}</Link>
                    <hr style={{ margin: '4px 0', borderColor: 'var(--border)' }} />
                    <button type="button" onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {t.nav.signOut}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-sm" style={{ textDecoration: 'none' }}>{t.nav.logIn}</Link>
                <Link href="/auth/register" className="btn btn-sm btn-accent" style={{ textDecoration: 'none' }}>{t.nav.signUp}</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <LangToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, width: 42, height: 42, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ display: 'block', width: 24, height: 2, background: 'var(--dark)', marginBottom: 5, transition: 'transform .2s', transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
              <span style={{ display: 'block', width: 24, height: 2, background: 'var(--dark)', marginBottom: 5, opacity: mobileOpen ? 0 : 1, transition: 'opacity .2s' }} />
              <span style={{ display: 'block', width: 24, height: 2, background: 'var(--dark)', transition: 'transform .2s', transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', maxHeight: 'calc(100vh - 58px)', overflowY: 'auto', width: '100%', maxWidth: '100vw' }}>
          <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 18px', fontSize: 15, fontWeight: 700, color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            {t.nav.home}
          </Link>

          <MobileAccordion label={t.nav.services}>
            {servicesItem.groups.map(group => (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => setMobileServicesGroup(v => (v === group.key ? null : group.key))}
                  style={{ width: '100%', textAlign: 'left', padding: '11px 18px 11px 30px', background: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--dark)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                  {group.label}
                  <span style={{ fontSize: 10, opacity: 0.5 }}>{mobileServicesGroup === group.key ? '▲' : '▼'}</span>
                </button>
                {mobileServicesGroup === group.key && group.items.map(item => (
                  <MobileLink key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</MobileLink>
                ))}
              </div>
            ))}
          </MobileAccordion>

          {dropdownItems.map(item => (
            <MobileAccordion key={item.key} label={item.label}>
              {item.items.map(sub => (
                <MobileLink key={sub.href} href={sub.href} onClick={() => setMobileOpen(false)}>{sub.label}</MobileLink>
              ))}
            </MobileAccordion>
          ))}

          <Link href="/contact" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            {t.nav.contact}
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 18px', fontSize: 15, fontWeight: 600, color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            {t.nav.about}
          </Link>

          <div style={{ padding: '14px 18px', display: 'flex', gap: 10 }}>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-sm" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>{t.nav.dashboard}</Link>
                <button type="button" onClick={handleSignOut} className="btn btn-sm" style={{ flex: 1, color: 'var(--red)', borderColor: 'var(--red)' }}>{t.nav.signOut}</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn btn-sm" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>{t.nav.logIn}</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn btn-sm btn-accent" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>{t.nav.signUp}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
