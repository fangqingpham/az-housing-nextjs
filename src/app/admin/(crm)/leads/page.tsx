'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMessages, deleteMessage, getUsers } from '@/lib/api'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Message, AppUser } from '@/types'
import { leadTrackingSummary } from '@/lib/lead-tracking'

type Tab = 'messages' | 'users'

export default function AdminLeadsPage() {
  const router = useRouter()
  const { message, visible, showToast } = useToast()
  const [tab, setTab] = useState<Tab>('messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [msgs, usrs] = await Promise.all([getMessages(), getUsers()])
    setMessages(msgs); setUsers(usrs); setLoading(false)
  }

  const removeMsg = async (id: string) => {
    await deleteMessage(id)
    setMessages(prev => prev.filter(m => m.id !== id))
    showToast('Message deleted.')
  }

  const filteredMsgs = messages.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (m.from||'').toLowerCase().includes(q)||(m.fromemail||'').toLowerCase().includes(q)||(m.listingtitle||'').toLowerCase().includes(q)||(m.text||'').toLowerCase().includes(q)
  })

  const filteredUsers = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return `${u.fname} ${u.lname}`.toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)
  })

  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    admin:{bg:'#fef3dc',color:'#a86d1a'}, agent:{bg:'#e3f2fd',color:'#1a5ea8'},
    landlord:{bg:'#e1f5ee',color:'#2d7a4f'}, buyer:{bg:'#f0e8fd',color:'#6930c3'},
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div className="page-shell">
        <div className="page-header">
          <div><h1 className="page-title">Leads & Users</h1><p className="page-sub">{messages.length} messages · {users.length} registered users</p></div>
        </div>
        <div className="tabs">
          {(['messages','users'] as Tab[]).map(t=>(
            <button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={()=>{setTab(t);setSearch('')}}>
              {t==='messages'?`💬 Messages (${messages.length})`:`👥 Users (${users.length})`}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          <input className="fc" style={{maxWidth:300,marginBottom:0}} placeholder={tab==='messages'?'Search messages…':'Search users…'} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {loading ? <div className="empty-msg">Loading…</div> : tab==='messages' ? (
          filteredMsgs.length===0 ? <div className="empty-msg">No messages yet.</div> : (
            <div className="msg-list">
              {filteredMsgs.map(m=>(
                <div key={m.id} className="msg-card">
                  <div className="msg-top">
                    <div>
                      <div className="msg-tag">{m.listingtitle?`📋 ${m.listingtitle}`:'📋 General'}<span className={`msg-type ${m.type==='viewing'?'type-viewing':'type-msg'}`}>{m.type==='viewing'?'🗓 Viewing Request':'💬 Enquiry'}</span></div>
                      <div className="msg-from">{m.from||'Unknown'}</div>
                    </div>
                    <div className="msg-actions">
                      <span className="msg-date">{m.date||''}</span>
                      {m.listingid&&<button className="btn btn-sm" onClick={()=>router.push(`/property/${m.listingid}`)}>View Property</button>}
                      <button className="btn btn-sm btn-danger" onClick={()=>removeMsg(m.id)}>Delete</button>
                    </div>
                  </div>
                  <p className="msg-body">&ldquo;{m.text}&rdquo;</p>
                  {leadTrackingSummary((m as any).lead_tracking || m) && (
                    <div className="source-block"><strong>Lead Source</strong><pre>{leadTrackingSummary((m as any).lead_tracking || m)}</pre></div>
                  )}
                  <div className="msg-contact">
                    {m.fromemail&&<a href={`mailto:${m.fromemail}`}>✉️ {m.fromemail}</a>}
                    {m.phone&&<span>📞 {m.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredUsers.length===0 ? <div className="empty-msg">No registered users yet.</div> : (
            <div className="table-wrap">
              <table className="crm-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u=>{
                    const rc=ROLE_COLORS[u.role]||{bg:'#f0e8fd',color:'#6930c3'}
                    return(
                      <tr key={u.id}>
                        <td className="td-name">{u.fname} {u.lname||''}</td>
                        <td className="td-email"><a href={`mailto:${u.email}`}>{u.email}</a></td>
                        <td><span className="pill" style={{background:rc.bg,color:rc.color}}>{u.role||'buyer'}</span></td>
                        <td className="td-sub">{u.phone||'--'}</td>
                        <td className="td-sub td-nowrap">{u.joined||u.created_at?.slice(0,10)||'--'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      <style jsx>{`
        .page-shell{padding:clamp(24px,3vw,40px) clamp(20px,3vw,40px);max-width:1000px}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:24px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0 0 4px}
        .page-sub{font-size:13px;color:#6b6b67;margin:0}
        .tabs{display:flex;gap:4px;margin-bottom:20px;border-bottom:2px solid #e4e1d8}
        .tab-btn{background:none;border:none;padding:10px 18px;font-size:13.5px;font-weight:600;color:#a8a8a4;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:color 0.15s;font-family:inherit}
        .tab-btn:hover{color:#1b2a4a}
        .tab-btn.active{color:#f5a623;border-bottom-color:#f5a623}
        .filter-bar{margin-bottom:20px}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8}
        .msg-list{display:flex;flex-direction:column;gap:10px}
        .msg-card{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:12px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
        .msg-top{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap}
        .msg-tag{font-size:12px;color:#a8a8a4;display:flex;align-items:center;gap:8px;margin-bottom:4px}
        .msg-type{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:700}
        .type-viewing{background:#e3f2fd;color:#1a5ea8}
        .type-msg{background:#f0e8fd;color:#6930c3}
        .msg-from{font-weight:700;color:#1b2a4a;font-size:14.5px}
        .msg-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .msg-date{font-size:11.5px;color:#a8a8a4;white-space:nowrap}
        .msg-body{font-size:13.5px;color:#6b6b67;font-style:italic;line-height:1.6;margin:0 0 10px}
        .source-block{background:#fff8e1;border:1px solid #ffe082;border-radius:9px;padding:10px 12px;margin:0 0 10px}
        .source-block strong{display:block;font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#a86d1a;margin-bottom:4px}
        .source-block pre{margin:0;white-space:pre-wrap;font-family:inherit;font-size:12.5px;line-height:1.5;color:#1b2a4a}
        .msg-contact{display:flex;gap:16px;font-size:12.5px;flex-wrap:wrap}
        .msg-contact a{color:#f5a623;text-decoration:none}
        .msg-contact a:hover{text-decoration:underline}
        .msg-contact span{color:#6b6b67}
        .table-wrap{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;overflow:auto}
        .crm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .crm-table th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;border-bottom:1px solid #e4e1d8;background:#fafaf8;white-space:nowrap}
        .crm-table td{padding:12px 14px;border-bottom:1px solid #f0ede6;vertical-align:middle}
        .crm-table tbody tr:last-child td{border-bottom:none}
        .crm-table tbody tr:hover td{background:#fafaf8}
        .td-name{font-weight:600;color:#1b2a4a}
        .td-email a{color:#f5a623;text-decoration:none;font-size:13px}
        .td-email a:hover{text-decoration:underline}
        .td-sub{font-size:12px;color:#a8a8a4}
        .td-nowrap{white-space:nowrap}
        .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700}
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
