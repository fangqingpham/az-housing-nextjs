'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminFetch, readAdminJson } from '@/lib/client/admin-fetch'

const DATE_RANGES = [
  ['last30', 'Last 30 days'],
  ['today', 'Today'],
  ['yesterday', 'Yesterday'],
  ['last7', 'Last 7 days'],
  ['month', 'This month'],
  ['custom', 'Custom'],
] as const

const EVENT_TYPES = [
  'contact_form_submit', 'whatsapp_click', 'messenger_click', 'phone_click', 'email_click',
  'order_form_start', 'order_form_submit', 'referral_signup', 'referral_submission',
  'cta_click', 'pricing_view', 'faq_open',
]

type DashboardData = {
  range: { start: string; end: string }
  summary: Record<string, number | null>
  funnel: { contact: number[]; forms: number[] }
  charts: Record<string, Record<string, number>>
  events: { rows: any[]; total: number; page: number; pageSize: number }
  tables: { sourcePerformance: any[]; campaignPerformance: any[] }
  status: {
    latestEvent: { event_name: string; occurred_at: string } | null
    eventsToday: number
    latestContact: { id: string; created_at?: string; date?: string } | null
    latestOrder: { id: string; created_at: string } | null
    ga4Configured: boolean
  }
}

const money = (value: number | null | undefined) =>
  value == null ? 'N/A' : '$' + Number(value || 0).toLocaleString('en-CA', { maximumFractionDigits: 0 })
const num = (value: number | null | undefined) => value == null ? 'N/A' : Number(value || 0).toLocaleString('en-CA')
const pct = (value: number, base: number) => base ? `${Math.round((value / base) * 1000) / 10}%` : 'N/A'
const nice = (value: string) => value ? value.replace(/_/g, ' ') : 'N/A'

export default function AdminMarketingPage() {
  const [range, setRange] = useState('last30')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [eventType, setEventType] = useState('')
  const [service, setService] = useState('')
  const [source, setSource] = useState('')
  const [campaign, setCampaign] = useState('')
  const [landingPage, setLandingPage] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('occurred_at')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const query = useMemo(() => {
    const params = new URLSearchParams({ range, page: String(page), pageSize: '25', sort, direction })
    if (range === 'custom') {
      if (start) params.set('start', start)
      if (end) params.set('end', end)
    }
    if (eventType) params.set('event', eventType)
    if (service) params.set('service', service)
    if (source) params.set('source', source)
    if (campaign) params.set('campaign', campaign)
    if (landingPage) params.set('landingPage', landingPage)
    return params.toString()
  }, [range, start, end, eventType, service, source, campaign, landingPage, page, sort, direction])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await adminFetch(`/api/admin/marketing?${query}`, { cache: 'no-store' })
        const json = await readAdminJson<DashboardData>(res)
        if (active) setData(json)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Marketing data could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [query])

  const summary = data?.summary || {}
  const totalPages = data ? Math.max(1, Math.ceil(data.events.total / data.events.pageSize)) : 1

  function setSortColumn(column: string) {
    if (sort === column) setDirection(direction === 'asc' ? 'desc' : 'asc')
    else { setSort(column); setDirection('desc') }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing</h1>
          <p className="page-sub">Stage 1 first-party conversion tracking. Ad sessions and impressions come later.</p>
        </div>
        <button className="btn" onClick={() => setPage(1)}>Refresh</button>
      </div>

      <div className="filters">
        <Field label="Date range"><select value={range} onChange={e => { setRange(e.target.value); setPage(1) }}>{DATE_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        {range === 'custom' && <Field label="Start"><input type="date" value={start} onChange={e => setStart(e.target.value)} /></Field>}
        {range === 'custom' && <Field label="End"><input type="date" value={end} onChange={e => setEnd(e.target.value)} /></Field>}
        <Field label="Event"><select value={eventType} onChange={e => { setEventType(e.target.value); setPage(1) }}><option value="">All</option>{EVENT_TYPES.map(e => <option key={e}>{e}</option>)}</select></Field>
        <Field label="Service"><input value={service} onChange={e => { setService(e.target.value); setPage(1) }} placeholder="tenant_placement" /></Field>
        <Field label="Source"><input value={source} onChange={e => { setSource(e.target.value); setPage(1) }} placeholder="google" /></Field>
        <Field label="Campaign"><input value={campaign} onChange={e => { setCampaign(e.target.value); setPage(1) }} placeholder="campaign" /></Field>
        <Field label="Landing page"><input value={landingPage} onChange={e => { setLandingPage(e.target.value); setPage(1) }} placeholder="/tenant-placement" /></Field>
      </div>

      {error && <div className="empty-msg error">{error}</div>}
      {loading && !data ? <div className="empty-msg">Loading marketing dashboard...</div> : data && (
        <>
          <section className="status-grid">
            <StatusCard label="Tracking status" value={data.status.latestEvent ? 'Tracking active' : 'No events received yet'} detail={data.status.latestEvent ? `Last event received at ${new Date(data.status.latestEvent.occurred_at).toLocaleString('en-CA')}` : 'Waiting for first server event'} />
            <StatusCard label="Events today" value={String(data.status.eventsToday)} detail="Recorded through /api/marketing/events" />
            <StatusCard label="Latest contact" value={data.status.latestContact ? 'Received' : 'None'} detail={data.status.latestContact?.created_at || data.status.latestContact?.date || 'No contact submissions yet'} />
            <StatusCard label="Latest order" value={data.status.latestOrder ? 'Received' : 'None'} detail={data.status.latestOrder?.created_at || 'No order submissions yet'} />
            <StatusCard label="GA4 client tag" value={data.status.ga4Configured ? 'Configured' : 'Configuration missing'} detail="Client tag only; reporting API is not connected" />
          </section>

          <section className="summary-grid">
            <Metric label="Contact attempts" value={num(summary.contactAttempts)} />
            <Metric label="Contact form submissions" value={num(summary.contactFormSubmissions)} />
            <Metric label="WhatsApp clicks" value={num(summary.whatsappClicks)} />
            <Metric label="Messenger clicks" value={num(summary.messengerClicks)} />
            <Metric label="Phone clicks" value={num(summary.phoneClicks)} />
            <Metric label="Email clicks" value={num(summary.emailClicks)} />
            <Metric label="Order form starts" value={num(summary.orderFormStarts)} />
            <Metric label="Completed orders" value={num(summary.completedOrders)} />
            <Metric label="Referral signups" value={num(summary.referralSignups)} />
            <Metric label="Referral submissions" value={num(summary.referralSubmissions)} />
            <Metric label="Paid orders" value={num(summary.paidOrders)} />
            <Metric label="Revenue" value={money(summary.revenue)} />
          </section>

          <section className="panel">
            <h2>Funnels</h2>
            <p className="muted">Ad impressions and website sessions will be added in later stages.</p>
            <Funnel labels={['Website contact attempts', 'Leads', 'Completed orders', 'Paid customers']} values={data.funnel.contact} />
            <Funnel labels={['Order form starts', 'Order form submissions', 'Paid orders']} values={data.funnel.forms} />
          </section>

          <section className="chart-grid">
            <Chart title="Daily contact attempts" data={data.charts.dailyContactAttempts} />
            <Chart title="Daily order form starts" data={data.charts.dailyOrderStarts} />
            <Chart title="Daily completed orders" data={data.charts.dailyCompletedOrders} />
            <Chart title="Daily revenue" data={data.charts.dailyRevenue} money />
            <Chart title="Events by source" data={data.charts.eventsBySource} />
            <Chart title="Events by campaign" data={data.charts.eventsByCampaign} />
            <Chart title="Events by landing page" data={data.charts.eventsByLandingPage} />
            <Chart title="Events by service" data={data.charts.eventsByService} />
          </section>

          <section className="panel">
            <h2>Events</h2>
            <Table rows={data.events.rows} sort={sort} direction={direction} onSort={setSortColumn} />
            <div className="pager">
              <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </section>

          <section className="perf-grid">
            <PerformanceTable title="Source performance" rows={data.tables.sourcePerformance} campaign={false} />
            <PerformanceTable title="Campaign performance" rows={data.tables.campaignPerformance} campaign />
          </section>
        </>
      )}

      <style jsx>{`
        .page-shell{padding:clamp(24px,3vw,40px);max-width:1280px;width:100%}
        .page-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px;flex-wrap:wrap}
        .page-title{font-family:Georgia,serif;font-size:27px;color:#1b2a4a;margin:0 0 4px}
        .page-sub,.muted{font-size:13px;color:#6b6b67;margin:0;line-height:1.5}
        .filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px;background:#fff;border:1px solid #e4e1d8;border-radius:14px;padding:14px}
        .summary-grid,.status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:18px}
        .status-grid{grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
        .metric,.status,.panel,.chart,.perf{background:#fff;border:1px solid rgba(12,21,37,.08);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
        .metric span,.status span{display:block;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;margin-bottom:7px}
        .metric strong,.status strong{font-family:Georgia,serif;font-size:24px;color:#1b2a4a}
        .status p{font-size:12px;color:#6b6b67;margin:6px 0 0;line-height:1.4}
        .panel{margin-bottom:18px}
        .panel h2,.chart h3,.perf h2{font-family:Georgia,serif;font-size:18px;color:#1b2a4a;margin:0 0 10px}
        .chart-grid,.perf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:18px}
        .bar-row{display:grid;grid-template-columns:minmax(80px,1fr) 2fr 54px;gap:8px;align-items:center;font-size:12px;margin:7px 0}
        .bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1b2a4a}
        .bar-track{height:9px;background:#f1ede7;border-radius:999px;overflow:hidden}
        .bar-fill{height:100%;background:#f5a623;border-radius:999px}
        .bar-value{text-align:right;color:#6b6b67;font-variant-numeric:tabular-nums}
        .funnel{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:12px 0 18px}
        .step{border:1px solid #e4e1d8;border-radius:12px;padding:12px;background:#fafaf8}
        .step strong{display:block;font-size:22px;color:#1b2a4a;font-family:Georgia,serif}
        .step span{display:block;font-size:12px;color:#6b6b67;margin-top:2px}
        .table-wrap{overflow:auto;border:1px solid #e4e1d8;border-radius:12px}
        table{width:100%;border-collapse:collapse;font-size:13px;background:#fff}
        th{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4;text-align:left;background:#fafaf8;cursor:pointer}
        th,td{padding:10px 12px;border-bottom:1px solid #f0ede6;white-space:nowrap}
        td{color:#1b2a4a}
        tr:last-child td{border-bottom:none}
        .pager{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:12px;font-size:13px;color:#6b6b67}
        .btn{background:#fff;border:1px solid #e4e1d8;border-radius:8px;padding:9px 14px;font-weight:700;color:#1b2a4a;cursor:pointer}
        .btn:disabled{opacity:.45;cursor:not-allowed}
        .empty-msg{background:#fff;border:1px solid #e4e1d8;border-radius:14px;padding:42px;text-align:center;color:#a8a8a4}
        .error{color:#a32d2d}
        @media(max-width:767px){.page-shell{padding:18px 14px}.pager{justify-content:space-between}.summary-grid{grid-template-columns:1fr 1fr}}
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}<style jsx>{`.field{display:flex;flex-direction:column;gap:5px}.field span{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#a8a8a4}.field :global(input),.field :global(select){border:1px solid #e4e1d8;border-radius:8px;padding:9px 10px;font-size:13px;background:#fafaf8;color:#1b2a4a}`}</style></label>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>
}

function StatusCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="status"><span>{label}</span><strong>{value}</strong><p>{detail}</p></div>
}

function Funnel({ labels, values }: { labels: string[]; values: number[] }) {
  const first = values[0] || 0
  return <div className="funnel">{labels.map((label, i) => <div className="step" key={label}><span>{label}</span><strong>{num(values[i])}</strong><span>Prev: {i === 0 ? '100%' : pct(values[i], values[i - 1])}</span><span>First: {i === 0 ? '100%' : pct(values[i], first)}</span></div>)}</div>
}

function Chart({ title, data, money: isMoney }: { title: string; data: Record<string, number>; money?: boolean }) {
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const max = Math.max(1, ...rows.map(([, v]) => v))
  return <div className="chart"><h3>{title}</h3>{rows.length === 0 ? <p className="muted">No data</p> : rows.map(([key, value]) => <div className="bar-row" key={key}><div className="bar-label" title={key}>{key}</div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div><div className="bar-value">{isMoney ? money(value) : num(value)}</div></div>)}</div>
}

function Table({ rows, sort, direction, onSort }: { rows: any[]; sort: string; direction: string; onSort: (column: string) => void }) {
  const headers = [['occurred_at', 'Date'], ['event_name', 'Event'], ['service', 'Service'], ['page_path', 'Page'], ['source', 'Source'], ['campaign', 'Campaign']]
  return <div className="table-wrap"><table><thead><tr>{headers.map(([key, label]) => <th key={key} onClick={() => onSort(key)}>{label}{sort === key ? direction === 'asc' ? ' ▲' : ' ▼' : ''}</th>)}<th>Related order</th><th>Related referral</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={8}>No events found.</td></tr> : rows.map(row => <tr key={row.id}><td>{new Date(row.occurred_at).toLocaleString('en-CA')}</td><td>{nice(row.event_name)}</td><td>{row.service || 'N/A'}</td><td>{row.page_path || 'N/A'}</td><td>{row.source || 'direct'}</td><td>{row.campaign || 'none'}</td><td>{row.related_order_id || 'N/A'}</td><td>{row.related_referral_id || 'N/A'}</td></tr>)}</tbody></table></div>
}

function PerformanceTable({ title, rows, campaign }: { title: string; rows: any[]; campaign: boolean }) {
  const sorted = [...rows].sort((a, b) => Number(b.orders || b.contactAttempts || 0) - Number(a.orders || a.contactAttempts || 0)).slice(0, 20)
  return <div className="perf"><h2>{title}</h2><div className="table-wrap"><table><thead><tr><th>{campaign ? 'Campaign' : 'Source / medium'}</th><th>Contact attempts</th>{!campaign && <th>Leads</th>}<th>Orders</th><th>Paid orders</th><th>Revenue</th>{campaign && <th>Conversion rate</th>}</tr></thead><tbody>{sorted.length === 0 ? <tr><td colSpan={campaign ? 6 : 6}>No data.</td></tr> : sorted.map(row => <tr key={row.key}><td>{row.key}</td><td>{num(row.contactAttempts)}</td>{!campaign && <td>{num(row.leads)}</td>}<td>{num(row.orders)}</td><td>{num(row.paidOrders)}</td><td>{money(row.revenue)}</td>{campaign && <td>{row.conversionRate == null ? 'N/A' : pct(row.orders, row.contactAttempts)}</td>}</tr>)}</tbody></table></div></div>
}
