'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/Toast'
import ArticleBody from '@/components/articles/ArticleBody'
import { useToast } from '@/hooks/useToast'
import { cleanArticleDraft } from '@/lib/articles/format'
import type { BlogPost } from '@/types'

const ARTICLE_CATEGORIES = ['Buying Guide','Selling Tips','Renting Advice','Market Analysis','Neighbourhood Guide','Mortgages & Finance','Legal Updates','Renovation & Maintenance','Investment','News']
const ARTICLE_COLORS = ['#E8F4FD','#FEF3DC','#E1F5EE','#F0E8FD','#FDE8E8','#E8F0FD','#FFF3E0','#E8F5E9','#FCE4EC','#E3F2FD']
const emptyArticle = (): BlogPost => ({ id:'', title:'', cat:'Buying Guide', excerpt:'', date: new Date().toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'}), read:'5 min read', color:'#E8F4FD', body:'', image:'', author:'' })
type Tab = 'site' | 'articles' | 'account'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function prepareCoverImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Only JPG, PNG, and WebP images are allowed.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image must be 5 MB or smaller.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not process the image.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.82))
  if (!blob) throw new Error('This browser could not compress the image.')
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { message, visible, showToast } = useToast()
  const [tab, setTab] = useState<Tab>('site')
  const [heroText, setHeroText] = useState('')
  const [heroSub, setHeroSub] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [artLoading, setArtLoading] = useState(false)
  const [artSearch, setArtSearch] = useState('')
  const [artCat, setArtCat] = useState('')
  const [artModal, setArtModal] = useState<{ open: boolean; isNew: boolean }>({ open: false, isNew: true })
  const [artForm, setArtForm] = useState<BlogPost>(emptyArticle())
  const [artBodyMode, setArtBodyMode] = useState<'write' | 'preview'>('write')
  const [imgUploading, setImgUploading] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [updatingPass, setUpdatingPass] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => { if (!s) return; if (s.hero) setHeroText(s.hero); if (s.herosub) setHeroSub(s.herosub) }).catch(()=>{})
  }, [])

  useEffect(() => { if (tab === 'articles' && articles.length === 0) loadArticles() }, [tab])

  const loadArticles = async () => {
    setArtLoading(true)
    try {
      const response = await fetch('/api/admin/articles', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Articles could not be loaded.')
      setArticles(data.articles || [])
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Articles could not be loaded.')
    } finally {
      setArtLoading(false)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hero: heroText, herosub: heroSub }) })
      showToast(r.ok ? 'Settings saved ✓' : 'Failed to save settings.')
    } catch { showToast('Failed to save settings.') }
    setSavingSettings(false)
  }

  const setArtField = (key: keyof BlogPost, val: string) => setArtForm(prev => ({ ...prev, [key]: val }))

  const uploadImage = async (file: File) => {
    setImgUploading(true)
    try {
      const optimized = await prepareCoverImage(file)
      const formData = new FormData()
      formData.append('file', optimized)
      const response = await fetch('/api/admin/articles/cover', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Image upload failed.')
      setArtField('image', data.url)
      showToast('Image uploaded ✓')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Image upload failed.')
    } finally {
      setImgUploading(false)
    }
  }

  const saveArticle = async () => {
    if (!artForm.title.trim()) { showToast('Title is required.'); return }
    if (!artForm.excerpt.trim()) { showToast('Excerpt is required.'); return }
    const article = { ...artForm, body: cleanArticleDraft(artForm.body) }
    if (artModal.isNew) article.id = `art-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
    const response = await fetch('/api/admin/articles', { method: artModal.isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(article) })
    const data = await response.json()
    if (!response.ok) { showToast(data.error || 'Article could not be saved.'); return }
    showToast(artModal.isNew ? 'Article published ✓' : 'Article updated ✓')
    setArtModal({ open: false, isNew: true }); await loadArticles()
  }

  const removeArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return
    const response = await fetch(`/api/admin/articles?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) { showToast('Article could not be deleted.'); return }
    setArticles(prev => prev.filter(a => a.id !== id)); showToast('Article deleted.')
  }

  const changePassword = async () => {
    if (!currentPass || !newPass) { showToast('Both fields are required.'); return }
    if (newPass.length < 8) { showToast('New password must be at least 8 characters.'); return }
    setUpdatingPass(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { showToast('Not authenticated.'); setUpdatingPass(false); return }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPass })
    if (signInErr) { showToast('Current password is incorrect.'); setUpdatingPass(false); return }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { showToast('Failed to update password.'); setUpdatingPass(false); return }
    showToast('Password updated 🔐'); setCurrentPass(''); setNewPass(''); setUpdatingPass(false)
  }

  const filteredArticles = articles.filter(a => {
    if (artCat && a.cat !== artCat) return false
    if (artSearch && !a.title.toLowerCase().includes(artSearch.toLowerCase()) && !(a.author||'').toLowerCase().includes(artSearch.toLowerCase())) return false
    return true
  })

  return (
    <>
      <Toast message={message} visible={visible} />
      {artModal.open && (
        <div className="modal-overlay" onClick={() => setArtModal({ open: false, isNew: true })}>
          <div className="modal-box wide-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setArtModal({ open: false, isNew: true })}>✕</button>
            <h3 className="modal-title">{artModal.isNew ? '✍️ New Article' : '✏️ Edit Article'}</h3>
            <div className="fg"><label>Title *</label><input className="fc" value={artForm.title} onChange={e=>setArtField('title',e.target.value)} /></div>
            <div className="fr">
              <div className="fg"><label>Category</label><select className="fc" value={artForm.cat} onChange={e=>setArtField('cat',e.target.value)}>{ARTICLE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label>Read Time</label><input className="fc" value={artForm.read} onChange={e=>setArtField('read',e.target.value)} /></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Author</label><input className="fc" value={artForm.author||''} onChange={e=>setArtField('author',e.target.value)} /></div>
              <div className="fg"><label>Date</label><input className="fc" value={artForm.date} onChange={e=>setArtField('date',e.target.value)} /></div>
            </div>
            <div className="fg">
              <label>Cover Image</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input className="fc" style={{marginBottom:0,flex:1}} placeholder="Paste URL or upload…" value={artForm.image||''} onChange={e=>setArtField('image',e.target.value)} />
                <label className="upload-btn">{imgUploading?'⏳':'📁 Upload'}<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" style={{display:'none'}} disabled={imgUploading} onChange={e=>{const f=e.target.files?.[0];if(f)uploadImage(f);e.target.value=''}} /></label>
              </div>
              {artForm.image&&<div style={{marginTop:8,borderRadius:8,overflow:'hidden',height:100,position:'relative'}}><img src={artForm.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /><button onClick={()=>setArtField('image','')} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',borderRadius:6,padding:'3px 8px',cursor:'pointer',fontSize:12}}>✕</button></div>}
            </div>
            <div className="fg">
              <label>Card Color</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                {ARTICLE_COLORS.map(c=><button key={c} onClick={()=>setArtField('color',c)} style={{width:26,height:26,borderRadius:'50%',background:c,border:'none',cursor:'pointer',outline:artForm.color===c?'2px solid #f5a623':'2px solid transparent',outlineOffset:2}} />)}
              </div>
            </div>
            <div className="fg"><label>Excerpt *</label><textarea className="fc" rows={2} value={artForm.excerpt} onChange={e=>setArtField('excerpt',e.target.value)} /></div>
            <div className="fg">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{margin:0}}>Article Body (Markdown supported)</label>
                <div style={{display:'flex',gap:4}}>
                  <button onClick={()=>{setArtField('body',cleanArticleDraft(artForm.body));showToast('Article formatting cleaned ✓')}} style={{fontSize:12,padding:'3px 10px',borderRadius:6,cursor:'pointer',background:'transparent',color:'#6b6b67',border:'1px solid #e4e1d8',fontFamily:'inherit'}}>Clean Format</button>
                  {(['write','preview'] as const).map(m=><button key={m} onClick={()=>setArtBodyMode(m)} style={{fontSize:12,padding:'3px 10px',borderRadius:6,cursor:'pointer',background:artBodyMode===m?'#f5a623':'transparent',color:artBodyMode===m?'#1e2a45':'#a8a8a4',border:'1px solid #e4e1d8',fontFamily:'inherit'}}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>)}
                </div>
              </div>
              {artBodyMode==='write' ? <textarea className="fc" rows={12} value={artForm.body} onChange={e=>setArtField('body',e.target.value)} placeholder={'Write naturally with blank lines between paragraphs.\n\n## Subheading\n\n- Bullet point\n- Another point\n\n**Bold text**'} style={{fontFamily:'inherit',fontSize:14,lineHeight:1.6}} /> : <div style={{border:'1px solid #e4e1d8',borderRadius:8,padding:'1rem',minHeight:160,background:'#fafaf8'}}><ArticleBody body={artForm.body} emptyMessage="Nothing to preview yet." /></div>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveArticle}>{artModal.isNew?'Publish Article':'Save Changes'}</button>
              <button className="btn" onClick={()=>setArtModal({open:false,isNew:true})}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-shell">
        <div className="page-header"><h1 className="page-title">Settings</h1></div>
        <div className="tabs">
          {(['site','articles','account'] as Tab[]).map(t=>(
            <button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>
              {t==='site'?'🌐 Site':t==='articles'?'✍️ Articles':'🔐 Account'}
            </button>
          ))}
        </div>
        {tab==='site'&&(
          <div className="settings-section">
            <div className="settings-card">
              <h2 className="settings-card-title">Hero Banner</h2>
              <div className="fg"><label>Hero Title</label><input className="fc" value={heroText} onChange={e=>setHeroText(e.target.value)} /></div>
              <div className="fg"><label>Hero Subtitle</label><input className="fc" value={heroSub} onChange={e=>setHeroSub(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={saveSettings} disabled={savingSettings}>{savingSettings?'Saving…':'Save Settings'}</button>
            </div>
            <div className="settings-card">
              <h2 className="settings-card-title">Quick Links</h2>
              <div className="quick-links">
                <a href="/post-listing" target="_blank" rel="noreferrer" className="quick-link">🏘️ Post a Listing</a>
                <a href="/blog" target="_blank" rel="noreferrer" className="quick-link">📰 View Blog</a>
                <a href="/contact" target="_blank" rel="noreferrer" className="quick-link">✉️ Contact Page</a>
                <a href="/" target="_blank" rel="noreferrer" className="quick-link">🌐 Public Site</a>
              </div>
            </div>
          </div>
        )}
        {tab==='articles'&&(
          <>
            <div className="filter-bar">
              <input className="fc" style={{maxWidth:240,marginBottom:0}} placeholder="Search title or author…" value={artSearch} onChange={e=>setArtSearch(e.target.value)} />
              <select className="fc" style={{maxWidth:200,marginBottom:0}} value={artCat} onChange={e=>setArtCat(e.target.value)}><option value="">All categories</option>{ARTICLE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
              <button className="btn btn-primary" style={{marginLeft:'auto'}} onClick={()=>{setArtForm(emptyArticle());setArtBodyMode('write');setArtModal({open:true,isNew:true})}}>+ New Article</button>
            </div>
            {artLoading?<div className="empty-msg">Loading articles…</div>:filteredArticles.length===0?(
              <div className="empty-msg"><div style={{fontSize:36,marginBottom:12}}>✍️</div><p style={{fontWeight:600,marginBottom:6}}>No articles yet</p><p style={{color:'#a8a8a4',fontSize:13,marginBottom:18}}>Articles you publish here appear on the blog.</p><button className="btn btn-primary" onClick={()=>{setArtForm(emptyArticle());setArtModal({open:true,isNew:true})}}>Write Your First Article</button></div>
            ):(
              <div className="table-wrap">
                <table className="crm-table">
                  <thead><tr><th></th><th>Title</th><th>Category</th><th>Author</th><th>Read</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredArticles.map(a=>(
                      <tr key={a.id}>
                        <td><div style={{width:38,height:38,borderRadius:7,background:a.image?`url(${a.image}) center/cover no-repeat`:(a.color||'#E8F4FD'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{!a.image&&'📄'}</div></td>
                        <td><div className="td-name" style={{maxWidth:260}}>{a.title}</div><div className="td-sub" style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.excerpt}</div></td>
                        <td><span className="cat-pill" style={{background:a.color||'#E8F4FD'}}>{a.cat}</span></td>
                        <td className="td-sub">{a.author||'A-Z Housing Team'}</td>
                        <td className="td-sub">⏱ {a.read||(a as any).readTime}</td>
                        <td className="td-sub td-nowrap">{a.date}</td>
                        <td><div className="action-row"><button className="btn btn-sm" onClick={()=>router.push(`/blog/${a.id}`)}>View</button><button className="btn btn-sm" onClick={()=>{setArtForm({...a});setArtBodyMode('write');setArtModal({open:true,isNew:false})}}>Edit</button><button className="btn btn-sm btn-danger" onClick={()=>removeArticle(a.id)}>Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {tab==='account'&&(
          <div className="settings-section">
            <div className="settings-card">
              <h2 className="settings-card-title">Change Password</h2>
              <p className="settings-hint">You must enter your current password to set a new one.</p>
              <div className="fg"><label>Current Password</label><input className="fc" type="password" placeholder="••••••••" value={currentPass} onChange={e=>setCurrentPass(e.target.value)} /></div>
              <div className="fg"><label>New Password</label><input className="fc" type="password" placeholder="Min 8 characters" value={newPass} onChange={e=>setNewPass(e.target.value)} /></div>
              <button className="btn btn-primary" onClick={changePassword} disabled={updatingPass}>{updatingPass?'Updating…':'Update Password'}</button>
            </div>
            <div className="settings-card">
              <h2 className="settings-card-title">Session</h2>
              <p className="settings-hint">Sign out of the admin portal.</p>
              <button className="btn btn-danger-solid" onClick={async()=>{await createClient().auth.signOut();router.push('/admin/login');router.refresh()}}>Sign out</button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .page-shell{padding:clamp(24px,3vw,40px) clamp(20px,3vw,40px);max-width:1100px}
        .page-header{margin-bottom:24px}
        .page-title{font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1b2a4a;margin:0}
        .tabs{display:flex;gap:4px;margin-bottom:28px;border-bottom:2px solid #e4e1d8}
        .tab-btn{background:none;border:none;padding:10px 18px;font-size:13.5px;font-weight:600;color:#a8a8a4;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:color 0.15s;font-family:inherit}
        .tab-btn:hover{color:#1b2a4a}
        .tab-btn.active{color:#f5a623;border-bottom-color:#f5a623}
        .settings-section{display:flex;flex-direction:column;gap:20px;max-width:640px}
        .settings-card{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(0,0,0,0.04)}
        .settings-card-title{font-family:Georgia,serif;font-size:17px;font-weight:600;color:#1b2a4a;margin:0 0 16px}
        .settings-hint{font-size:13px;color:#6b6b67;margin:0 0 16px;line-height:1.5}
        .quick-links{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .quick-link{display:flex;align-items:center;gap:8px;background:#f7f4ef;border:1px solid #e4e1d8;border-radius:9px;padding:11px 14px;font-size:13px;font-weight:600;color:#1b2a4a;text-decoration:none;transition:background 0.15s}
        .quick-link:hover{background:#f0ede6}
        .filter-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
        .empty-msg{text-align:center;color:#a8a8a4;padding:48px;background:#fff;border-radius:12px;border:1px solid #e4e1d8}
        .table-wrap{background:#fff;border:1px solid rgba(12,21,37,0.08);border-radius:14px;overflow:auto}
        .crm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .crm-table th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;border-bottom:1px solid #e4e1d8;background:#fafaf8;white-space:nowrap}
        .crm-table td{padding:11px 14px;border-bottom:1px solid #f0ede6;vertical-align:middle}
        .crm-table tbody tr:last-child td{border-bottom:none}
        .crm-table tbody tr:hover td{background:#fafaf8}
        .td-name{font-weight:600;color:#1b2a4a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .td-sub{font-size:12px;color:#a8a8a4}
        .td-nowrap{white-space:nowrap}
        .cat-pill{display:inline-block;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;color:#1b2a4a}
        .action-row{display:flex;gap:5px;flex-wrap:wrap}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:7px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;color:#1b2a4a}
        .btn:hover{background:#f7f4ef}
        .btn-sm{padding:5px 10px;font-size:11.5px}
        .btn-primary{background:#f5a623;color:#1e2a45;border-color:#f5a623}
        .btn-primary:hover{background:#d4891a;border-color:#d4891a}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed}
        .btn-danger{background:#fcebeb!important;color:#a32d2d!important;border-color:#e8a5a5!important}
        .btn-danger:hover{background:#f8d5d5!important}
        .btn-danger-solid{background:#a32d2d;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s}
        .btn-danger-solid:hover{background:#8a2525}
        .upload-btn{display:inline-flex;align-items:center;gap:6px;background:#f5a623;color:#1e2a45;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
        .modal-box{background:#fff;border-radius:18px;padding:32px 28px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;position:relative}
        .wide-modal{max-width:660px}
        .modal-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;color:#a8a8a4}
        .modal-close:hover{color:#1b2a4a}
        .modal-title{font-family:Georgia,serif;font-size:22px;font-weight:600;color:#1b2a4a;margin:0 0 20px}
        .modal-actions{display:flex;gap:8px;margin-top:12px}
        .fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
        .fg label{font-size:11px;font-weight:700;letter-spacing:0.5px;color:#6b6b67;text-transform:uppercase}
        .fr{display:flex;gap:12px}
        .fr .fg{flex:1}
        .fc{border:1px solid #e4e1d8;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color 0.18s;background:#fafaf8}
        .fc:focus{border-color:#f5a623}
      `}</style>
    </>
  )
}
