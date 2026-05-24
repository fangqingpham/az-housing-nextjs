'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type Agent = {
  id: string
  fname: string
  lname: string
  email: string
  phone: string | null
  created_at: string
  role: string
}

export default function CreateAgentPage() {
  const { message, visible, showToast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fname: '', lname: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { loadAgents() }, [])

  const loadAgents = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent')
      .order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fname.trim()) e.fname = 'First name required'
    if (!form.lname.trim()) e.lname = 'Last name required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setCreating(true)

    try {
      const res = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create agent')
      showToast(`Agent ${form.fname} ${form.lname} created ✓`)
      setForm({ fname: '', lname: '', email: '', phone: '', password: '' })
      setShowForm(false)
      await loadAgents()
    } catch (err: any) {
      showToast(err.message || 'Error creating agent')
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveAgent = async (id: string, name: string) => {
    if (!confirm(`Remove agent access for ${name}? Their account will remain but role will be changed to "buyer".`)) return
    const supabase = createClient()
    await supabase.from('users').update({ role: 'buyer' }).eq('id', id)
    showToast(`${name} removed from agents.`)
    await loadAgents()
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  return (
    <>
      <Toast message={message} visible={visible} />
      <div style={{ padding: 'clamp(20px,3vw,36px)', maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#1b2a4a', margin: '0 0 4px' }}>Agent Accounts</h1>
            <p style={{ fontSize: 13, color: '#6b6b67', margin: 0 }}>Create and manage agent logins for the portal.</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ background: '#f5a623', color: '#1e2a45', border: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,166,35,0.28)' }}
          >
            {showForm ? '✕ Cancel' : '+ New Agent'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(12,21,37,0.08)', padding: '28px 24px', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1b2a4a', margin: '0 0 20px' }}>Create Agent Account</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { key: 'fname',    label: 'First Name',     type: 'text',     placeholder: 'Jane' },
                  { key: 'lname',    label: 'Last Name',      type: 'text',     placeholder: 'Smith' },
                  { key: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'jane@azhouse.ca' },
                  { key: 'phone',    label: 'Phone (optional)',type: 'tel',     placeholder: '416-555-0100' },
                  { key: 'password', label: 'Temp Password',  type: 'password', placeholder: 'Min 8 characters' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: key === 'password' ? '1 / -1' : undefined }}>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: '#6b6b67', textTransform: 'uppercase' }}>{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={f(key as keyof typeof form)}
                      placeholder={placeholder}
                      style={{ border: `1.5px solid ${errors[key] ? '#f87171' : '#e4e1d8'}`, borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafaf8' }}
                    />
                    {errors[key] && <span style={{ fontSize: 11, color: '#ef4444' }}>{errors[key]}</span>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button type="submit" disabled={creating} style={{ background: creating ? '#a8a8a4' : '#f5a623', color: '#1e2a45', border: 'none', borderRadius: 999, padding: '11px 28px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: creating ? 'not-allowed' : 'pointer' }}>
                  {creating ? 'Creating…' : 'Create Agent'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#fff', border: '1px solid #e4e1d8', borderRadius: 999, padding: '11px 22px', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#6b6b67', fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agents list */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(12,21,37,0.08)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#1b2a4a', margin: 0 }}>Active Agents</h2>
            <span style={{ fontSize: 12, color: '#a8a8a4' }}>{agents.length} agents</span>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', fontSize: 14 }}>Loading…</div>
          ) : agents.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#a8a8a4', fontSize: 14 }}>
              No agents yet. Create one above.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr>
                  {['Agent', 'Email', 'Phone', 'Joined', 'Portal Link', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#a8a8a4', borderBottom: '1px solid #e4e1d8', background: '#fafaf8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1b2a4a' }}>{a.fname} {a.lname}</div>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#6b6b67' }}>{a.email}</td>
                    <td style={{ padding: '13px 16px', color: '#6b6b67' }}>{a.phone || '—'}</td>
                    <td style={{ padding: '13px 16px', color: '#a8a8a4', fontSize: 12 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-CA') : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <a href="/agent" target="_blank" style={{ fontSize: 12, color: '#f5a623', fontWeight: 600, textDecoration: 'none' }}>
                        /agent →
                      </a>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <button
                        onClick={() => handleRemoveAgent(a.id, `${a.fname} ${a.lname}`)}
                        style={{ background: '#fcebeb', color: '#a32d2d', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
