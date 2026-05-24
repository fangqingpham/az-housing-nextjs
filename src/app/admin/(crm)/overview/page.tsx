'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getListings, getUserCount, getMessageCount,
  getArticleCount,
} from '@/lib/api'

type Stat = { label: string; value: number | string; href: string; icon: string; color: string }

type RecentOrder = {
  id: string
  landlord_name: string
  email: string
  property_address: string
  city: string
  estimated_total: number
  status: string
  created_at: string
}

async function fetchOrders(): Promise<RecentOrder[]> {
  const r = await fetch('/api/admin/tenant-placement-orders', { cache: 'no-store' })
  if (!r.ok) return []
  const d = await r.json()
  return d.orders || []
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [listings, userCount, msgCount, artCount, orders] = await Promise.all([
        getListings(),
        getUserCount(),
        getMessageCount(),
        getArticleCount(),
        fetchOrders(),
      ])

      const published = listings.filter(l => l.status === 'published' || l.author === 'seed').length
      const pending = listings.filter(l => l.status === 'pending').length
      const newOrders = orders.filter(o => o.status === 'new').length

      setStats([
        { label: 'Total Listings',     value: listings.length, href: '/admin/listings', icon: '🏘️', color: '#E8F4FD' },
        { label: 'Published',          value: published,       href: '/admin/listings', icon: '✅', color: '#E1F5EE' },
        { label: 'Pending Approval',   value: pending,         href: '/admin/listings', icon: '⏳', color: '#FEF3DC' },
        { label: 'New Orders',         value: newOrders,       href: '/admin/orders',   icon: '🧾', color: pending > 0 ? '#FCE4EC' : '#E1F5EE' },
        { label: 'Messages',           value: msgCount,        href: '/admin/leads',    icon: '💬', color: '#F0E8FD' },
        { label: 'Registered Users',   value: userCount,       href: '/admin/agents',   icon: '👥', color: '#E3F2FD' },
        { label: 'Articles',           value: artCount,        href: '/admin/settings', icon: '✍️', color: '#FFF3E0' },
        { label: 'Tenant Orders Total',value: orders.length,   href: '/admin/orders',   icon: '📋', color: '#E8F4FD' },
      ])

      setRecentOrders(orders.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const STATUS_COLOR: Record<string, string> = {
    new: '#f5a623', contacted: '#1a5ea8', completed: '#2d7a4f', cancelled: '#a32d2d',
  }

  return (
    <div className="ov-shell">
      <div className="ov-header">
        <div>
          <h1 className="ov-title">Overview</h1>
          <p className="ov-sub">Welcome back — here&apos;s what&apos;s happening across A-Z Housing.</p>
        </div>
        <Link href="/post-listing" className="ov-cta">+ Post Listing</Link>
      </div>

      {loading ? (
        <div className="ov-loading">Loading stats…</div>
      ) : (
        <div className="ov-stats">
          {stats.map(s => (
            <Link key={s.label} href={s.href} className="ov-stat-card">
              <div className="ov-stat-icon" style={{ background: s.color }}>{s.icon}</div>
              <div className="ov-stat-val">{s.value}</div>
              <div className="ov-stat-label">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="ov-section">
        <div className="ov-section-hdr">
          <h2 className="ov-section-title">Recent Tenant Orders</h2>
          <Link href="/admin/orders" className="ov-section-link">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="ov-empty">No tenant placement orders yet.</div>
        ) : (
          <div className="ov-table-wrap">
            <table className="ov-table">
              <thead><tr><th>Landlord</th><th>Property</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="ov-td-name">{o.landlord_name}</div>
                      <div className="ov-td-sub">{o.email}</div>
                    </td>
                    <td className="ov-td-addr">{o.property_address}, {o.city}</td>
                    <td className="ov-td-amount">${Number(o.estimated_total || 0).toLocaleString('en-CA')}</td>
                    <td>
                      <span className="ov-status" style={{ background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status], borderColor: STATUS_COLOR[o.status] + '44' }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="ov-td-date">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-CA') : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="ov-section">
        <h2 className="ov-section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div className="ov-quick">
          {[
            { label: 'Manage Listings', href: '/admin/listings', icon: '🏘️' },
            { label: 'View Orders',     href: '/admin/orders',   icon: '🧾' },
            { label: 'Leads & Messages',href: '/admin/leads',    icon: '💬' },
            { label: 'Agent Directory', href: '/admin/agents',   icon: '👤' },
            { label: 'Pipeline',        href: '/admin/pipeline', icon: '📊' },
            { label: 'Finances',        href: '/admin/finances', icon: '💵' },
            { label: 'Site Settings',   href: '/admin/settings', icon: '⚙️' },
          ].map(q => (
            <Link key={q.href} href={q.href} className="ov-quick-card">
              <span className="ov-quick-icon">{q.icon}</span>
              <span className="ov-quick-label">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .ov-shell { padding: clamp(24px,3vw,40px) clamp(20px,3vw,40px); max-width: 1200px; }
        .ov-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:32px; flex-wrap:wrap; }
        .ov-title { font-family:Georgia,serif; font-size:28px; font-weight:600; color:#1b2a4a; margin:0 0 4px; }
        .ov-sub { font-size:13.5px; color:#6b6b67; margin:0; }
        .ov-cta { display:inline-flex; align-items:center; background:#f5a623; color:#1e2a45; text-decoration:none; padding:10px 22px; border-radius:999px; font-weight:700; font-size:13px; letter-spacing:1.5px; text-transform:uppercase; box-shadow:0 4px 14px rgba(245,166,35,0.28); transition:background 0.18s,transform 0.18s; white-space:nowrap; }
        .ov-cta:hover { background:#d4891a; transform:translateY(-1px); }
        .ov-loading { text-align:center; color:#a8a8a4; padding:40px; font-size:14px; }
        .ov-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:36px; }
        .ov-stat-card { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; padding:20px 18px; text-decoration:none; display:flex; flex-direction:column; gap:8px; transition:transform 0.18s,box-shadow 0.18s; box-shadow:0 2px 10px rgba(0,0,0,0.04); }
        .ov-stat-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.1); }
        .ov-stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .ov-stat-val { font-family:Georgia,serif; font-size:28px; font-weight:600; color:#1b2a4a; line-height:1; }
        .ov-stat-label { font-size:12px; color:#6b6b67; font-weight:500; }
        .ov-section { margin-bottom:36px; }
        .ov-section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .ov-section-title { font-family:Georgia,serif; font-size:18px; font-weight:600; color:#1b2a4a; margin:0; }
        .ov-section-link { font-size:13px; color:#f5a623; text-decoration:none; font-weight:600; }
        .ov-section-link:hover { text-decoration:underline; }
        .ov-empty { color:#a8a8a4; font-size:14px; padding:32px; text-align:center; background:#fff; border-radius:12px; border:1px solid #e4e1d8; }
        .ov-table-wrap { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:14px; overflow:hidden; }
        .ov-table { width:100%; border-collapse:collapse; font-size:13.5px; }
        .ov-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#a8a8a4; border-bottom:1px solid #e4e1d8; background:#fafaf8; }
        .ov-table td { padding:13px 16px; border-bottom:1px solid #f0ede6; vertical-align:middle; }
        .ov-table tbody tr:last-child td { border-bottom:none; }
        .ov-table tbody tr:hover td { background:#fafaf8; }
        .ov-td-name { font-weight:600; color:#1b2a4a; }
        .ov-td-sub { font-size:11.5px; color:#a8a8a4; margin-top:2px; }
        .ov-td-addr { color:#6b6b67; max-width:200px; }
        .ov-td-amount { font-weight:700; color:#1b2a4a; }
        .ov-td-date { color:#a8a8a4; white-space:nowrap; font-size:12px; }
        .ov-status { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:capitalize; border:1px solid; }
        .ov-quick { display:grid; grid-template-columns:repeat(7,1fr); gap:12px; }
        .ov-quick-card { background:#fff; border:1px solid rgba(12,21,37,0.08); border-radius:12px; padding:16px 12px; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:8px; transition:transform 0.18s,box-shadow 0.18s; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .ov-quick-card:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.1); border-color:rgba(245,166,35,0.35); }
        .ov-quick-icon { font-size:22px; }
        .ov-quick-label { font-size:11px; font-weight:600; color:#1b2a4a; text-align:center; line-height:1.3; }
        @media (max-width:1100px) { .ov-stats { grid-template-columns:repeat(4,1fr); } .ov-quick { grid-template-columns:repeat(4,1fr); } }
        @media (max-width:768px)  { .ov-stats { grid-template-columns:repeat(2,1fr); } .ov-quick { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:480px)  { .ov-stats { grid-template-columns:repeat(2,1fr); } .ov-quick { grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  )
}
