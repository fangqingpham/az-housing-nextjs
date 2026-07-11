'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
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

const MESSENGER_URL = 'https://m.me/azhouse.ca'

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
      if (action === 'lead') {
        event.preventDefault()
        setLeadOpen(true)
        setLeadSent(false)
        void trackMarketingEvent('lead_form_start', {
          service: 'Để lại thông tin',
          selected_service: 'Để lại thông tin',
          form_name: 'vietnam_bridge_lead',
          metadata: { language: 'vi', ...utmFields() },
        })
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

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('toggle', onToggle, true)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('toggle', onToggle, true)
      document.removeEventListener('click', onClick)
    }
  }, [serviceMap])

  const openChat = (service?: ClientService, location = 'cta') => {
    const selectedService = service?.title || 'Tư vấn chung'
    const detail = {
      language: 'vi',
      selected_service: selectedService,
      message: service?.prompt || 'Xin chào! Mình muốn được A-Z tư vấn bằng tiếng Việt về dịch vụ hỗ trợ khi đến Canada.',
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
      `Đường dẫn trang: ${typeof window !== 'undefined' ? window.location.href : '/vi/ho-tro-den-canada'}`,
    ].join('\n')

    try {
      const res = await fetch('/api/chat-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, message }),
      })
      if (!res.ok) throw new Error('submit failed')
      setLeadSent(true)
      void trackMarketingEvent('lead_form_submit', {
        service: 'Để lại thông tin',
        selected_service: 'Để lại thông tin',
        form_name: 'vietnam_bridge_lead',
        metadata: { language: 'vi', ...utmFields() },
      })
    } catch {
      setLeadError('Chưa gửi được thông tin. Vui lòng thử lại hoặc chat trực tiếp với A-Z.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className={styles.mobileBar} aria-label="Liên hệ nhanh trên điện thoại">
        <button data-az-action="chat" data-location="mobile_bar">Chat</button>
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
    </>
  )
}
