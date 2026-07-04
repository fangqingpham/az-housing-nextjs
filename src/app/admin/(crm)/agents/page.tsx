'use client'

import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { AppUser } from '@/types'
import { adminFetch } from '@/lib/client/admin-fetch'

const ROLES = ['buyer', 'landlord', 'agent', 'admin'] as const
type Role = typeof ROLES[number]
type ReferralPartner = {
  id: string
  full_name: string
  email: string
  phone: string
  referral_id: string
  etransfer_email: string
  partner_status: string
  created_at: string
}

const ROLE_COLORS: Record<Role, { bg: string; color: string; border: string }> = {
  admin:    { bg: '#fef3dc', color: '#a86d1a', border: '#f5d38a' },
  agent:    { bg: '#e3f2fd', color: '#1a5ea8', border: '#90caf9' },
  landlord: { bg: '#e1f5ee', color: '#2d7a4f', border: '#9fe1cb' },
  buyer:    { bg: '#f0e8fd', color: '#6930c3', border: '#c4a8f0' },
}

export default function AdminAgentsPage() {
  const { message, visible, showToast } = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [referralPartners, setReferralPartners] = useState<ReferralPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [userRows, referralRes] = await Promise.all([
      getUsers(),
      adminFetch('/api/admin/referrals', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ partners: [] })),
    ])
    setUsers(userRows)
    setReferralPartners(referralRes.partners || [])
    setLoading(false)
  }

  const changeRole = async (userId: string, newRole: Role) => {
    setUpdatingId(userId)
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)
    if (error) { showToast('Failed to update role.') }
    else { setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u)); showToast(`Role updated to ${newRole} ✓`) }
    setUpdatingId(null)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); showToast('User deleted.')
  }

  const filtered = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${u.fname} ${u.lname}`.toLowerCase().includes(q) && !(u.email||'').toLowerCase().includes(q) && !(u.phone||'').includes(q)) return false
    }
    return true
  })

  const roleCounts = ROLES.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc }, {} as Record<Role, number>)

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="page-shell">
        <div className="page-header">
          <div><h1 className="page-title">Team & Users</h1><p className="page-sub">{users.length} total registered accounts</p></div>
        </div>
        <div className="role-summary">
          {ROLES.map(r => {
            const rc = ROLE_COLORS[r]
            return (
              <button key={r} className="role-chip" style={{ background: roleFilter===r ? rc.color : rc.bg, color: roleFilter===r ? '#fff' : rc.color, borderColor: rc.border }} onClick={() => setRoleFilter(prev => prev===r ? '' : r)}>
                {r} <span className="role-count">{roleCounts[r]}</span>
              </button>
            )
          })}
          {roleFilter && <button className="role-chip-clear" onClick={() => setRoleFilter('')}>✕ Clear filter</button>}
        </div>
        <div className="filter-bar">
          <input className="fc" style={{maxWidth:300,marginBottom:0}} placeholder="Search name, email, phone…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {loading ? <div className="empty-msg">Loading users…</div> : filtered.length===0 ? <div className="empty-msg">No users match your filters.</div> : (
          <div className="table-wrap">
            <table className="crm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => {
                  const rc = ROLE_COLORS[u.role as Role] || ROLE_COLORS.buyer
                  return (
                    <tr key={u.id}>
                      <td><div className="user-avatar"><div className="avatar-circle" style={{background:rc.bg,color:rc.color}}>{(u.fname?.[0]||'?').toUpperCase()}</div><span className="td-name">{u.fname} {u.lname||''}</span></div></td>
                      <td><a href={`mailto:${u.email}`} className="td-email">{u.email}</a></td>
                      <td className="td-sub">{u.phone||'--'}</td>
                      <td>
                        <select className="role-select" value={u.role} disabled={updatingId===u.id} onChange={e=>changeRole(u.id,e.target.value as Role)} style={{background:rc.bg,color:rc.color,borderColor:rc.border}}>
                          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="td-sub td-nowrap">{u.joined||u.created_at?.slice(0,10)||'--'}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={()=>remove(u.id)}>Delete</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="page-header" style={{ marginTop: 34 }}>
          <div><h2 className="page-title" style={{ fontSize: 22 }}>Referral Partners</h2><p className="page-sub">{referralPartners.length} public referral partner records</p></div>
        </div>
        {loading ? null : referralPartners.length === 0 ? <div className="empty-msg">No referral partners yet.</div> : (
          <div className="table-wrap">
            <table className="crm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Partner Type</th><th>Referral ID</th><th>E-transfer</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {referralPartners.map(p => (
                  <tr key={p.id}>
                    <td><span className="td-name">{p.full_name}</span></td>
                    <td><a href={`mailto:${p.email}`} className="td-email">{p.email}</a></td>
                    <td className="td-sub">{p.phone || '--'}</td>
                    <td><span className="role-select" style={{ background: '#e1f5ee', color: '#2d7a4f', borderColor: '#9fe1cb' }}>Referral Partner</span></td>
                    <td className="td-sub" style={{ fontFamily: 'monospace', color: '#1b2a4a', fontWeight: 700 }}>{p.referral_id}</td>
                    <td><a href={`mailto:${p.etransfer_email}`} className="td-email">{p.etransfer_email}</a></td>
                    <td className="td-sub">{p.partner_status}</td>
                    <td className="td-sub td-nowrap">{p.created_at?.slice(0,10) || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style jsx>{`
        .page-shell{padding:clamp(24px,3vw,40px) clamp(20px,3vw,40px);max-width:1100px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .role-summary{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
        .role-chip{border:1px solid;border-radius:999px;padding:5px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:6px}
        .role-count{font-size:11px;opacity:0.75}
        .role-chip-clear{background:none;border:1px solid #e4e1d8;border-radius:999px;padding:5px 12px;font-size:12px;color:#a8a8a4;cursor:pointer}
        .role-chip-clear:hover{border-color:#a8a8a4;color:#1b2a4a}
        .filter-bar{margin-bottom:20px}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8}
        .table-wrap{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;overflow:auto}
        .crm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .crm-table th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;border-bottom:1px solid #e4e1d8;background:#fafaf8;white-space:nowrap}
        .crm-table td{padding:11px 14px;border-bottom:1px solid #f0ede6;vertical-align:middle}
        .crm-table tbody tr:last-child td{border-bottom:none}
        .crm-table tbody tr:hover td{background:#fafaf8}
        .user-avatar{display:flex;align-items:center;gap:10px}
        .avatar-circle{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}
        .td-name{font-weight:600;color:#1b2a4a}
        .td-email{color:#f5a623;text-decoration:none;font-size:13px}
        .td-email:hover{text-decoration:underline}
        .td-sub{font-size:12px;color:#a8a8a4}
        .td-nowrap{white-space:nowrap}
        .role-select{border:1px solid;border-radius:7px;padding:4px 8px;font-size:12px;font-weight:700;cursor:pointer;outline:none;font-family:inherit;transition:opacity 0.15s}
        .role-select:disabled{opacity:0.5;cursor:not-allowed}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;color:#1b2a4a}
        .btn:hover{background:#f7f4ef}
        .btn-sm{padding:5px 10px;font-size:11.5px}
        .btn-danger{background:#fcebeb!important;color:#a32d2d!important;border-color:#e8a5a5!important}
        .btn-danger:hover{background:#f8d5d5!important}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.18s;background:#fafaf8}
        .fc:focus{border-color:#f5a623}
      `}</style>
    </>
  )
}
