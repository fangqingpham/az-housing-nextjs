import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/server/staff-auth'

export const dynamic = 'force-dynamic'

const CONTACT_EVENTS = ['whatsapp_click', 'messenger_click', 'zalo_click', 'phone_click', 'email_click', 'contact_form_submit']
function isoDate(value: string | null, fallback: Date) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function rangeFromPreset(preset: string | null, url: URL) {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)
  switch (preset) {
    case 'today':
      start = startOfDay(now); break
    case 'yesterday':
      start = startOfDay(new Date(now.getTime() - 86400000))
      end = startOfDay(now); break
    case 'last7':
      start = startOfDay(new Date(now.getTime() - 6 * 86400000)); break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1); break
    case 'custom':
      start = startOfDay(isoDate(url.searchParams.get('start'), new Date(now.getTime() - 29 * 86400000)))
      end = isoDate(url.searchParams.get('end'), now)
      end.setHours(23, 59, 59, 999)
      break
    case 'last30':
    default:
      start = startOfDay(new Date(now.getTime() - 29 * 86400000))
  }
  if (preset !== 'custom') end.setHours(23, 59, 59, 999)
  return { start, end }
}

function sourceOf(row: any) {
  return row.source || row.latest_touch_source || row.utm_source || row.lead_tracking?.latest_touch?.utm_source || row.lead_tracking?.utm_source || 'direct'
}

function mediumOf(row: any) {
  return row.medium || row.latest_touch_medium || row.utm_medium || row.lead_tracking?.latest_touch?.utm_medium || row.lead_tracking?.utm_medium || 'none'
}

function campaignOf(row: any) {
  return row.campaign || row.latest_touch_campaign || row.utm_campaign || row.lead_tracking?.latest_touch?.utm_campaign || row.lead_tracking?.utm_campaign || 'none'
}

function serviceOf(row: any) {
  const services = Array.isArray(row.selected_services) ? row.selected_services.join(' ') : ''
  if (row.service) return row.service
  if (services.toLowerCase().includes('landing arrangement')) return 'landing_arrangement'
  if (services) return 'tenant_placement'
  return 'unknown'
}

function dayKey(value: string) {
  return value.slice(0, 10)
}

function inc(map: Record<string, number>, key: string, amount = 1) {
  map[key || 'unknown'] = (map[key || 'unknown'] || 0) + amount
}

function rowsByKey<T extends Record<string, any>>(map: Record<string, T>) {
  return Object.values(map)
}

export async function GET(request: Request) {
  const auth = await requireStaff(request, ['admin'])
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const { start, end } = rangeFromPreset(url.searchParams.get('range'), url)
  const eventType = url.searchParams.get('event') || ''
  const service = url.searchParams.get('service') || ''
  const source = url.searchParams.get('source') || ''
  const campaign = url.searchParams.get('campaign') || ''
  const landingPage = url.searchParams.get('landingPage') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || 1))
  const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get('pageSize') || 25)))
  const sort = url.searchParams.get('sort') || 'occurred_at'
  const direction = url.searchParams.get('direction') === 'asc' ? 'asc' : 'desc'

  const fromIso = start.toISOString()
  const toIso = end.toISOString()
  const admin = auth.admin

  let eventQuery = admin
    .from('marketing_events')
    .select('*', { count: 'exact' })
    .gte('occurred_at', fromIso)
    .lte('occurred_at', toIso)
  if (eventType) eventQuery = eventQuery.eq('event_name', eventType)
  if (service) eventQuery = eventQuery.eq('service', service)
  if (source) eventQuery = eventQuery.eq('source', source)
  if (campaign) eventQuery = eventQuery.eq('campaign', campaign)
  if (landingPage) eventQuery = eventQuery.eq('page_path', landingPage)

  const sortColumn = ['occurred_at', 'event_name', 'service', 'source', 'campaign', 'page_path'].includes(sort) ? sort : 'occurred_at'
  const [{ data: events, count: eventCount, error: eventError }, ordersRes, messagesRes, partnersRes, submissionsRes] = await Promise.all([
    eventQuery.order(sortColumn, { ascending: direction === 'asc' }).range((page - 1) * pageSize, page * pageSize - 1),
    admin.from('tenant_placement_orders').select('id, created_at, status, estimated_total, selected_services, property_address, city, utm_source, utm_medium, utm_campaign, latest_touch_source, latest_touch_medium, latest_touch_campaign, lead_tracking').gte('created_at', fromIso).lte('created_at', toIso),
    admin.from('messages').select('id, date, created_at, listingtitle, utm_source, utm_medium, utm_campaign, latest_touch_source, latest_touch_medium, latest_touch_campaign, lead_tracking').gte('created_at', fromIso).lte('created_at', toIso),
    admin.from('referral_partners').select('id, created_at, utm_source, utm_medium, utm_campaign, latest_touch_source, latest_touch_medium, latest_touch_campaign, lead_tracking').gte('created_at', fromIso).lte('created_at', toIso),
    admin.from('referral_submissions').select('id, created_at, interested_services, utm_source, utm_medium, utm_campaign, latest_touch_source, latest_touch_medium, latest_touch_campaign, lead_tracking').gte('created_at', fromIso).lte('created_at', toIso),
  ])

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })
  const allEvents = events || []
  const orders = ordersRes.data || []
  const messages = messagesRes.data || []
  const partners = partnersRes.data || []
  const submissions = submissionsRes.data || []

  const contactAttempts = allEvents.filter(e => CONTACT_EVENTS.includes(e.event_name)).length
  const formSubmissions = allEvents.filter(e => e.event_name === 'contact_form_submit').length
  const orderStarts = allEvents.filter(e => e.event_name === 'order_form_start').length
  const completedOrders = orders.filter(o => ['new', 'contacted', 'completed'].includes(o.status || '')).length
  const paidOrders = null
  const revenue = null

  const dailyContactAttempts: Record<string, number> = {}
  const dailyOrderStarts: Record<string, number> = {}
  const dailyCompletedOrders: Record<string, number> = {}
  const dailyRevenue: Record<string, number> = {}
  allEvents.forEach(e => {
    if (CONTACT_EVENTS.includes(e.event_name)) inc(dailyContactAttempts, dayKey(e.occurred_at))
    if (e.event_name === 'order_form_start') inc(dailyOrderStarts, dayKey(e.occurred_at))
  })
  orders.forEach(o => {
    if (['new', 'contacted', 'completed'].includes(o.status || '')) inc(dailyCompletedOrders, dayKey(o.created_at))
    if (false) inc(dailyRevenue, dayKey(o.created_at), Number(o.estimated_total || 0))
  })

  const sourceMap: Record<string, any> = {}
  const campaignMap: Record<string, any> = {}
  const sourceEventCounts: Record<string, number> = {}
  const campaignEventCounts: Record<string, number> = {}
  const pageEventCounts: Record<string, number> = {}
  const serviceEventCounts: Record<string, number> = {}

  allEvents.forEach(e => {
    inc(sourceEventCounts, `${sourceOf(e)} / ${mediumOf(e)}`)
    inc(campaignEventCounts, campaignOf(e))
    inc(pageEventCounts, e.page_path || 'unknown')
    inc(serviceEventCounts, e.service || 'unknown')
  })

  function ensureSource(row: any) {
    const key = `${sourceOf(row)} / ${mediumOf(row)}`
    sourceMap[key] ||= { key, contactAttempts: 0, leads: 0, orders: 0, paidOrders: 0, revenue: 0 }
    return sourceMap[key]
  }
  function ensureCampaign(row: any) {
    const key = campaignOf(row)
    campaignMap[key] ||= { key, contactAttempts: 0, orders: 0, paidOrders: 0, revenue: 0, conversionRate: 0 }
    return campaignMap[key]
  }
  allEvents.filter(e => CONTACT_EVENTS.includes(e.event_name)).forEach(e => { ensureSource(e).contactAttempts++; ensureCampaign(e).contactAttempts++ })
  messages.forEach(m => { ensureSource(m).leads++ })
  orders.forEach(o => {
    const s = ensureSource(o); const c = ensureCampaign(o)
    s.orders++; c.orders++
    if (false) { s.revenue += Number(o.estimated_total || 0); c.revenue += Number(o.estimated_total || 0) }
  })
  rowsByKey(campaignMap).forEach(row => { row.conversionRate = row.contactAttempts ? row.orders / row.contactAttempts : null })

  const latestEvent = await admin.from('marketing_events').select('event_name, occurred_at').order('occurred_at', { ascending: false }).limit(1).maybeSingle()
  const recentContact = await admin.from('messages').select('id, created_at, date').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const recentOrder = await admin.from('tenant_placement_orders').select('id, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEvents = await admin.from('marketing_events').select('id', { count: 'exact', head: true }).gte('occurred_at', todayStart)

  return NextResponse.json({
    range: { start: fromIso, end: toIso },
    filters: { eventType, service, source, campaign, landingPage },
    summary: {
      contactAttempts,
      contactFormSubmissions: formSubmissions,
      whatsappClicks: allEvents.filter(e => e.event_name === 'whatsapp_click').length,
      messengerClicks: allEvents.filter(e => e.event_name === 'messenger_click').length,
      zaloClicks: allEvents.filter(e => e.event_name === 'zalo_click').length,
      phoneClicks: allEvents.filter(e => e.event_name === 'phone_click').length,
      emailClicks: allEvents.filter(e => e.event_name === 'email_click').length,
      orderFormStarts: orderStarts,
      completedOrders,
      referralSignups: partners.length,
      referralSubmissions: submissions.length,
      paidOrders,
      revenue,
    },
    funnel: {
      contact: [contactAttempts, messages.length, completedOrders, 0],
      forms: [orderStarts, allEvents.filter(e => e.event_name === 'order_form_submit').length, 0],
    },
    charts: {
      dailyContactAttempts,
      dailyOrderStarts,
      dailyCompletedOrders,
      dailyRevenue,
      eventsBySource: sourceEventCounts,
      eventsByCampaign: campaignEventCounts,
      eventsByLandingPage: pageEventCounts,
      eventsByService: serviceEventCounts,
    },
    events: {
      rows: allEvents,
      total: eventCount || 0,
      page,
      pageSize,
    },
    tables: {
      sourcePerformance: rowsByKey(sourceMap),
      campaignPerformance: rowsByKey(campaignMap),
    },
    status: {
      latestEvent: latestEvent.data || null,
      eventsToday: todayEvents.count || 0,
      latestContact: recentContact.data || null,
      latestOrder: recentOrder.data || null,
      ga4Configured: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    },
  })
}
