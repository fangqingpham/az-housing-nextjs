'use client'

import Image from 'next/image'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { captureLeadTrackingFromUrl } from '@/lib/client/lead-tracking'
import { trackMarketingEvent } from '@/lib/client/marketing-events'
import styles from './page.module.css'

type ClientService = {
  id: string
  title: string
  summary: string
  explanation: string
  audience: string
  benefits: string[]
  price: string
  prompt: string
}

type Props = {
  services: ClientService[]
}

type LeadOpenDetail = {
  language?: string
  selected_service?: string
  location?: string
  page_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
}

const MESSENGER_URL = 'https://m.me/azhousesolution'
const ZALO_QR_SRC = '/images/zalo-khanh-pham-qr.png'
const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function utmFields() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    page_url: window.location.href,
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
  }
}

function preserveTrackingParams(destination: string) {
  if (typeof window === 'undefined') return destination
  const current = new URLSearchParams(window.location.search)
  if (TRACKING_PARAMS.every(param => !current.has(param))) return destination

  const url = new URL(destination, window.location.origin)
  TRACKING_PARAMS.forEach(param => {
    const value = current.get(param)
    if (value && !url.searchParams.has(param)) url.searchParams.set(param, value)
  })
  return url.toString()
}

export default function BridgeInteractions({ services }: Props) {
  const serviceMap = useMemo(
    () => new Map(services.map(service => [service.id, service])),
    [services],
  )
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [leadError, setLeadError] = useState('')
  const [sending, setSending] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', phone: '', message: '' })
  const [leadContext, setLeadContext] = useState<LeadOpenDetail>({})
  const [zaloOpen, setZaloOpen] = useState(false)
  const [zaloPlacement, setZaloPlacement] = useState('main_cta')
  const [qrExpanded, setQrExpanded] = useState(false)
  const zaloDialogRef = useRef<HTMLDivElement>(null)
  const zaloOpenerRef = useRef<HTMLElement | null>(null)

  const trackZalo = useCallback((action: 'open_qr' | 'enlarge_qr' | 'save_qr', placement = zaloPlacement) => {
    void trackMarketingEvent('zalo_click', {
      service: 'Zalo',
      selected_service: 'Zalo',
      metadata: {
        contact_method: 'zalo',
        action,
        placement,
        language: 'vi',
        ...utmFields(),
      },
    })
  }, [zaloPlacement])

  const openZaloModal = useCallback((placement: string, opener?: HTMLElement | null) => {
    zaloOpenerRef.current = opener || null
    setZaloPlacement(placement)
    setQrExpanded(false)
    setZaloOpen(true)
    trackZalo('open_qr', placement)
  }, [trackZalo])

  const closeZaloModal = useCallback(() => {
    setZaloOpen(false)
    setQrExpanded(false)
    window.setTimeout(() => zaloOpenerRef.current?.focus(), 0)
  }, [])

  const saveZaloQr = useCallback(() => {
    trackZalo('save_qr')
    window.setTimeout(() => {
      const link = document.createElement('a')
      link.href = ZALO_QR_SRC
      link.download = 'zalo-khanh-pham-qr.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
    }, 80)
  }, [trackZalo])

  useEffect(() => {
    captureLeadTrackingFromUrl()
    void trackMarketingEvent('vietnam_bridge_page_view', {
      service: 'Trang hỗ trợ đến Canada',
      selected_service: 'Trang hỗ trợ đến Canada',
      metadata: { language: 'vi', ...utmFields() },
    })

    const sent = { mid: false, deep: false }
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = window.scrollY / total
      if (!sent.mid && pct >= 0.5) {
        sent.mid = true
        void trackMarketingEvent('scroll_50', {
          service: 'Trang hỗ trợ đến Canada',
          selected_service: 'Trang hỗ trợ đến Canada',
          metadata: { language: 'vi', ...utmFields() },
        })
      }
      if (!sent.deep && pct >= 0.9) {
        sent.deep = true
        void trackMarketingEvent('scroll_90', {
          service: 'Trang hỗ trợ đến Canada',
          selected_service: 'Trang hỗ trợ đến Canada',
          metadata: { language: 'vi', ...utmFields() },
        })
      }
    }

    const onToggle = (event: Event) => {
      const details = event.target instanceof HTMLDetailsElement ? event.target : null
      const serviceId = details?.dataset.serviceId
      if (!details?.open || !serviceId) return
      const service = serviceMap.get(serviceId)
      if (!service) return
      void trackMarketingEvent('service_card_expand', {
        service: service.title,
        selected_service: service.title,
        metadata: { selected_service: service.title, language: 'vi', ...utmFields() },
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-az-action]') : null
      if (!target) return
      const action = target.dataset.azAction
      const serviceId = target.dataset.serviceId
      const service = serviceId ? serviceMap.get(serviceId) : undefined

      if (action === 'chat') {
        event.preventDefault()
        openChat(service, target.dataset.location || 'cta')
      }
      if (action === 'service-question' && service) {
        event.preventDefault()
        void trackMarketingEvent('service_question_click', {
          service: service.title,
          selected_service: service.title,
          metadata: { selected_service: service.title, language: 'vi', ...utmFields() },
        })
        openChat(service, 'service_card')
      }
      if (action === 'messenger') {
        void trackMarketingEvent('messenger_click', {
          service: 'Nhắn tin qua Messenger',
          selected_service: 'Nhắn tin qua Messenger',
          metadata: { location: target.dataset.location || 'cta', language: 'vi', ...utmFields() },
        })
      }
      if (action === 'zalo') {
        event.preventDefault()
        openZaloModal(target.dataset.location || 'main_cta', target)
      }
      if (action === 'bridge-top-home') {
        void trackMarketingEvent('bridge_top_home_click', {
          service: 'Trang chủ',
          selected_service: 'Trang chủ',
          metadata: {
            location: 'top_header',
            language: 'vi',
            destination_url: 'https://azhouse.ca',
            ...utmFields(),
          },
        })
      }
      if (action === 'bridge-top-service') {
        if (target instanceof HTMLAnchorElement) target.href = preserveTrackingParams(target.href)
        void trackMarketingEvent('bridge_top_service_click', {
          service: 'Landing Arrangement',
          selected_service: 'Landing Arrangement',
          metadata: {
            selected_service: 'Landing Arrangement',
            location: 'top_header',
            language: 'vi',
            destination_url: 'https://azhouse.ca/landing-arrangement',
            ...utmFields(),
          },
        })
      }
      if (action === 'landing-arrangement-read-more' && service) {
        if (target instanceof HTMLAnchorElement) target.href = preserveTrackingParams(target.href)
        void trackMarketingEvent('landing_arrangement_read_more_click', {
          service: service.title,
          selected_service: service.title,
          metadata: {
            selected_service: service.title,
            service_id: service.id,
            location: 'service_card',
            language: 'vi',
            ...utmFields(),
          },
        })
      }
      if (action === 'lead') {
        event.preventDefault()
        openLeadForm({ language: 'vi', selected_service: 'Để lại thông tin', location: target.dataset.location || 'cta', ...utmFields() })
      }
      if (action === 'pricing') {
        event.preventDefault()
        void trackMarketingEvent('pricing_click', {
          service: 'Bảng giá & Chi phí',
          selected_service: 'Bảng giá & Chi phí',
          metadata: { language: 'vi', ...utmFields() },
        })
        document.getElementById('pricing-costs')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const onOpenLead = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as LeadOpenDetail | undefined : undefined
      openLeadForm({ language: 'vi', ...(detail || {}), location: detail?.location || 'chatbot' })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('toggle', onToggle, true)
    document.addEventListener('click', onClick)
    window.addEventListener('az:openlead', onOpenLead)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('toggle', onToggle, true)
      document.removeEventListener('click', onClick)
      window.removeEventListener('az:openlead', onOpenLead)
    }
  }, [openZaloModal, serviceMap])

  useEffect(() => {
    if (!zaloOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => {
      const first = zaloDialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      first?.focus()
    }, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeZaloModal()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(zaloDialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) || [])
        .filter(element => !element.hasAttribute('disabled') && element.offsetParent !== null)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [closeZaloModal, zaloOpen])

  const openLeadForm = (detail: LeadOpenDetail = {}) => {
    const selectedService = detail.selected_service || 'Để lại thông tin'
    setLeadContext(detail)
    setLeadOpen(true)
    setLeadSent(false)
    setLeadError('')
    setLead(value => ({
      ...value,
      message: value.message || (selectedService && selectedService !== 'Để lại thông tin'
        ? `Tôi muốn tìm hiểu thêm về ${selectedService}.`
        : ''),
    }))
    void trackMarketingEvent('lead_form_start', {
      service: selectedService,
      selected_service: selectedService,
      form_name: 'vietnam_bridge_lead',
      metadata: {
        selected_service: selectedService,
        language: 'vi',
        location: detail.location || 'cta',
        ...(detail.page_url ? { page_url: detail.page_url } : {}),
        ...(detail.utm_source ? { utm_source: detail.utm_source } : {}),
        ...(detail.utm_medium ? { utm_medium: detail.utm_medium } : {}),
        ...(detail.utm_campaign ? { utm_campaign: detail.utm_campaign } : {}),
        ...(detail.utm_content ? { utm_content: detail.utm_content } : {}),
      },
    })
  }

  const openChat = (service?: ClientService, location = 'cta') => {
    const selectedService = service?.title || 'Tư vấn chung'
    const detail = {
      language: 'vi',
      service_id: service?.id,
      selected_service: selectedService,
      service_price: service?.price,
      service_summary: service?.summary,
      message: service ? `Xin chào! Bạn đang tìm hiểu về dịch vụ ${service.title}.` : 'Xin chào! Tôi là trợ lý tự động của A-Z Housing.',
      ...utmFields(),
    }
    void trackMarketingEvent('chat_open', {
      service: selectedService,
      selected_service: selectedService,
      metadata: { selected_service: selectedService, location, language: 'vi', ...utmFields() },
    })
    window.__azPendingChatDetail = detail
    window.dispatchEvent(new CustomEvent('az:openchat', { detail }))
  }

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLeadError('')
    setSending(true)
    const message = [
      lead.message || 'Khách muốn được tư vấn dịch vụ hỗ trợ đến Canada.',
      '',
      'Nguồn: Trang quảng cáo Facebook tiếng Việt',
      leadContext.selected_service ? `Dịch vụ đã chọn: ${leadContext.selected_service}` : '',
      leadContext.location ? `Vị trí mở biểu mẫu: ${leadContext.location}` : '',
      `Đường dẫn trang: ${typeof window !== 'undefined' ? window.location.href : '/vi/ho-tro-den-canada'}`,
      leadContext.utm_source ? `UTM source: ${leadContext.utm_source}` : '',
      leadContext.utm_medium ? `UTM medium: ${leadContext.utm_medium}` : '',
      leadContext.utm_campaign ? `UTM campaign: ${leadContext.utm_campaign}` : '',
      leadContext.utm_content ? `UTM content: ${leadContext.utm_content}` : '',
    ].filter(Boolean).join('\n')

    try {
      const res = await fetch('/api/chat-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, message }),
      })
      if (!res.ok) throw new Error('submit failed')
      setLeadSent(true)
      void trackMarketingEvent('lead_form_submit', {
        service: leadContext.selected_service || 'Để lại thông tin',
        selected_service: leadContext.selected_service || 'Để lại thông tin',
        form_name: 'vietnam_bridge_lead',
        metadata: { selected_service: leadContext.selected_service || 'Để lại thông tin', language: 'vi', location: leadContext.location || 'cta', ...utmFields() },
      })
    } catch {
      setLeadError('Chưa gửi được thông tin. Vui lòng thử lại hoặc chat trực tiếp với A-Z.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button className={styles.floatingZalo} data-az-action="zalo" data-location="floating_button">
        <span aria-hidden="true">Zalo</span>
        Chat qua Zalo
      </button>

      <div className={styles.mobileBar} aria-label="Liên hệ nhanh trên điện thoại">
        <button data-az-action="chat" data-location="mobile_bar">Chat</button>
        <button data-az-action="zalo" data-location="floating_button">Zalo</button>
        <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" data-az-action="messenger" data-location="mobile_bar">Messenger</a>
        <button data-az-action="pricing">Bảng giá</button>
      </div>

      {leadOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setLeadOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Để lại thông tin" onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setLeadOpen(false)} aria-label="Đóng">×</button>
            {leadSent ? (
              <div className={styles.successBox}>
                <h2>Cảm ơn bạn!</h2>
                <p>A-Z đã nhận thông tin và sẽ liên hệ lại trong thời gian sớm nhất.</p>
                <button className={styles.primaryButton} onClick={() => setLeadOpen(false)}>Đóng</button>
              </div>
            ) : (
              <form onSubmit={submitLead} className={styles.leadForm}>
                <h2>Để lại thông tin</h2>
                <p>Điền thông tin ngắn gọn, A-Z sẽ liên hệ lại bằng tiếng Việt.</p>
                <input required value={lead.name} onChange={e => setLead(v => ({ ...v, name: e.target.value }))} placeholder="Họ và tên *" />
                <input required type="email" value={lead.email} onChange={e => setLead(v => ({ ...v, email: e.target.value }))} placeholder="Email *" />
                <input value={lead.phone} onChange={e => setLead(v => ({ ...v, phone: e.target.value }))} placeholder="Số điện thoại / Zalo" />
                <textarea value={lead.message} onChange={e => setLead(v => ({ ...v, message: e.target.value }))} placeholder="Bạn cần hỗ trợ gì?" rows={4} />
                {leadError && <p className={styles.error}>{leadError}</p>}
                <button className={styles.primaryButton} disabled={sending} type="submit">
                  {sending ? 'Đang gửi...' : 'Gửi thông tin'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {zaloOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeZaloModal}>
          <div
            className={`${styles.modal} ${styles.zaloModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="zalo-modal-title"
            ref={zaloDialogRef}
            onClick={event => event.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeZaloModal} aria-label="Đóng">×</button>
            <div className={styles.zaloContent}>
              <h2 id="zalo-modal-title">Liên hệ qua Zalo</h2>
              <button
                type="button"
                className={`${styles.zaloQrButton} ${qrExpanded ? styles.zaloQrButtonExpanded : ''}`}
                onClick={() => {
                  setQrExpanded(value => !value)
                  if (!qrExpanded) trackZalo('enlarge_qr')
                }}
                aria-label={qrExpanded ? 'Thu nhỏ mã QR Zalo' : 'Phóng to mã QR Zalo'}
              >
                <Image
                  src={ZALO_QR_SRC}
                  alt="Mã QR Zalo của Khanh Pham tại A-Z Housing Solutions"
                  width={1020}
                  height={1469}
                  sizes={qrExpanded ? '(max-width: 760px) 94vw, 720px' : '(max-width: 760px) 84vw, 420px'}
                  unoptimized
                  className={styles.zaloQrImage}
                />
              </button>
              <p>Quét mã QR để kết nối với A-Z Housing trên Zalo.</p>
              <p className={styles.mobileInstruction}>Nếu bạn đang xem trên điện thoại, hãy lưu mã QR rồi mở Zalo để quét mã từ thư viện ảnh.</p>
              <div className={styles.zaloActions}>
                <button type="button" className={styles.primaryButton} onClick={saveZaloQr}>Lưu mã QR</button>
                <button type="button" className={styles.secondaryButton} onClick={closeZaloModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
