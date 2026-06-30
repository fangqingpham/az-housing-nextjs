'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    label: 'Overview', href: '/admin/overview',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  },
  {
    label: 'Orders', href: '/admin/orders',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></svg>,
  },
  {
    label: 'Leads', href: '/admin/leads',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    label: 'Create Agent', href: '/admin/create-agent',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  },
  {
    label: 'Agents', href: '/admin/agents',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    label: 'Commission', href: '/admin/finances',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  },
  {
    label: 'Referrals', href: '/admin/referrals',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M16 3h5v5" /><path d="M21 3l-7 7" /><path d="M8 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /><path d="M7 14h6" /><path d="M7 17h3" /></svg>,
  },
  {
    label: 'Listings', href: '/admin/listings',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    label: 'Client Management', href: '/admin/client-management',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><line x1="19" y1="11" x2="19" y2="17" /><line x1="22" y1="14" x2="16" y2="14" /></svg>,
  },
  {
    label: 'Settings', href: '/admin/settings',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer open on mobile
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    href === '/admin/overview'
      ? pathname === '/admin/overview' || pathname === '/admin'
      : pathname.startsWith(href)

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="sb-inner">
      {/* Brand */}
      <div className="sb-brand">
        <span className="sb-brand-icon">🏠</span>
        <div>
          <p className="sb-brand-name">A–Z Housing</p>
          <p className="sb-brand-sub">CRM Admin</p>
        </div>
      </div>
      <div className="sb-divider" />

      {/* Nav */}
      <nav className="sb-nav">
        <p className="sb-section-label">Main Menu</p>
        {NAV.map(({ label, href, icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} className={`sb-item${active ? ' sb-item--active' : ''}`}>
              <span className="sb-item-icon">{icon}</span>
              <span className="sb-item-label">{label}</span>
              {active && <span className="sb-pip" />}
            </Link>
          )
        })}
      </nav>

      <div style={{ flexGrow: 1 }} />
      <div className="sb-divider" />

      {/* Footer */}
      <div className="sb-footer">
        <Link href="/" className="sb-footer-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          Back to site
        </Link>
        <button className="sb-footer-btn sb-signout" onClick={handleSignOut}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ 768px) ───────────────────── */}
      <aside className="crm-sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="crm-mobile-bar">
        <button className="hamburger" onClick={() => setOpen(v => !v)} aria-label="Menu">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏠</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 700, color: '#f5a623' }}>A–Z Housing</span>
        </div>
        <div style={{ width: 36 }} /> {/* spacer to centre brand */}
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)} />
      )}
      <aside className={`crm-sidebar-drawer${open ? ' drawer-open' : ''}`}>
        <SidebarContent />
      </aside>

      <style jsx>{`
        /* ── Desktop sidebar ─────────────────────────────── */
        .crm-sidebar-desktop {
          width: 220px;
          min-width: 220px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #0c1525;
          border-right: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto;
          z-index: 50;
        }

        /* ── Mobile top bar ──────────────────────────────── */
        .crm-mobile-bar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 52px;
          background: #0c1525;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 100;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }
        .hamburger {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .hamburger:hover { color: #f5a623; }

        /* ── Mobile drawer ───────────────────────────────── */
        .drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 90;
        }
        .crm-sidebar-drawer {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 240px;
          height: 100vh;
          background: #0c1525;
          border-right: 1px solid rgba(255,255,255,0.08);
          z-index: 95;
          transform: translateX(-100%);
          transition: transform 0.22s ease;
          overflow-y: auto;
        }
        .drawer-open { transform: translateX(0) !important; }

        /* ── Shared inner ────────────────────────────────── */
        .sb-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 18px 12px 16px;
        }
        .sb-brand { display:flex; align-items:center; gap:10px; padding:4px 8px 10px; }
        .sb-brand-icon { font-size:24px; line-height:1; }
        .sb-brand-name { font-family:Georgia,serif; font-size:14px; font-weight:700; color:#f5a623; margin:0; line-height:1.3; }
        .sb-brand-sub { font-size:9.5px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.28); margin:0; }
        .sb-divider { height:1px; background:rgba(255,255,255,0.07); margin:8px 0; }
        .sb-nav { display:flex; flex-direction:column; gap:2px; }
        .sb-section-label { font-size:9.5px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.22); margin:4px 8px 8px; }
        .sb-item { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:9px; text-decoration:none; color:rgba(255,255,255,0.46); font-size:13.5px; font-weight:500; position:relative; transition:background 0.15s, color 0.15s; line-height:1; }
        .sb-item:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.82); }
        .sb-item--active { background:rgba(245,166,35,0.13); color:#f5a623; font-weight:700; }
        .sb-item--active:hover { background:rgba(245,166,35,0.18); color:#f5a623; }
        .sb-item-icon { display:flex; align-items:center; flex-shrink:0; opacity:0.85; }
        .sb-item--active .sb-item-icon { opacity:1; }
        .sb-item-label { flex:1; }
        .sb-pip { width:6px; height:6px; border-radius:50%; background:#f5a623; flex-shrink:0; }
        .sb-footer { display:flex; flex-direction:column; gap:2px; padding:4px 0; }
        .sb-footer-btn { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; font-size:12.5px; color:rgba(255,255,255,0.32); text-decoration:none; background:none; border:none; cursor:pointer; transition:color 0.15s, background 0.15s; width:100%; text-align:left; font-family:inherit; }
        .sb-footer-btn:hover { color:rgba(255,255,255,0.68); background:rgba(255,255,255,0.05); }
        .sb-signout:hover { color:#fc8181; }

        /* ── Mobile breakpoint ───────────────────────────── */
        @media (max-width: 767px) {
          .crm-sidebar-desktop { display: none !important; }
          .crm-mobile-bar { display: flex !important; }
          .drawer-overlay { display: block !important; }
          .crm-sidebar-drawer { display: flex !important; flex-direction: column; }
        }
      `}</style>
    </>
  )
}
