'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ─── Navigation items ─────────────────────────────────────────── */
const NAV = [
  {
    label: 'Overview',
    href: '/admin/overview',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Leads',
    href: '/admin/leads',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Agents',
    href: '/admin/agents',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Pipeline',
    href: '/admin/pipeline',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Listings',
    href: '/admin/listings',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/admin/overview') return pathname === '/admin/overview' || pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      <aside className="crm-sidebar">
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

        {/* Footer */}
        <div style={{ flexGrow: 1 }} />
        <div className="sb-divider" />
        <div className="sb-footer">
          <Link href="/" className="sb-footer-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to site
          </Link>
          <button className="sb-footer-btn sb-signout" onClick={handleSignOut}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <style jsx>{`
        .crm-sidebar {
          width: 232px;
          min-width: 232px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #0c1525;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          padding: 18px 12px 16px;
          overflow-y: auto;
          z-index: 50;
        }
        .sb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px 10px;
        }
        .sb-brand-icon { font-size: 24px; line-height: 1; }
        .sb-brand-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          font-weight: 700;
          color: #f5a623;
          margin: 0;
          line-height: 1.3;
        }
        .sb-brand-sub {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.28);
          margin: 0;
        }
        .sb-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
          margin: 8px 0;
        }
        .sb-nav { display: flex; flex-direction: column; gap: 2px; }
        .sb-section-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.22);
          margin: 4px 8px 8px;
          padding: 0;
        }
        .sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.46);
          font-size: 13.5px;
          font-weight: 500;
          position: relative;
          transition: background 0.15s, color 0.15s;
          line-height: 1;
        }
        .sb-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.82);
        }
        .sb-item--active {
          background: rgba(245, 166, 35, 0.13);
          color: #f5a623;
          font-weight: 700;
        }
        .sb-item--active:hover {
          background: rgba(245, 166, 35, 0.18);
          color: #f5a623;
        }
        .sb-item-icon { display: flex; align-items: center; flex-shrink: 0; opacity: 0.85; }
        .sb-item--active .sb-item-icon { opacity: 1; }
        .sb-item-label { flex: 1; }
        .sb-pip {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f5a623;
          flex-shrink: 0;
        }
        .sb-footer { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }
        .sb-footer-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.32);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          width: 100%;
          text-align: left;
        }
        .sb-footer-btn:hover {
          color: rgba(255, 255, 255, 0.68);
          background: rgba(255, 255, 255, 0.05);
        }
        .sb-signout:hover { color: #fc8181; }
      `}</style>
    </>
  )
}
