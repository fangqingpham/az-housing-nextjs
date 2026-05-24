'use client'

import { useState } from 'react'
import { insertMessage } from '@/lib/api'

const TOPICS = [
  'General Enquiry',
  'Listing Support',
  'Buy / Sell a property',
  'Mortgage Inquiry',
  'Legal Advice Referral',
  'Join our team',
  'Tenant Placement',
  'Other',
]

const SUPPORT_CARDS = [
  {
    icon: '📧',
    title: 'Email Support',
    detail: 'info@azhouse.ca',
    sub: 'Response within 24 hours',
  },
  {
    icon: '📞',
    title: 'Phone Support',
    detail: '+1 (647) 948-4428',
    sub: 'Mon-Fri, 9am-6pm EST',
  },
  {
    icon: '💬',
    title: 'Live Support',
    detail: 'Chat with our team for quick assistance',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  })

  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    setErrorMsg('Please fill in your name, email, and message.')
    return
  }

  setSending(true)
  setErrorMsg('')

  const messagePayload = {
    listing_id: null,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    message: form.topic
      ? `Topic: ${form.topic}\n\n${form.message.trim()}`
      : form.message.trim(),
    viewing_date: '',
  }

  try {
    const ok = await insertMessage(messagePayload as any)

    if (!ok) {
      setErrorMsg('Sorry, your message could not be sent. Please try again.')
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  } catch (error) {
    console.error('Contact form submit error:', error)
    setErrorMsg('Sorry, your message could not be sent. Please try again.')
    setSending(false)
  }
}

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <section
        style={{
          background: 'var(--dark)',
          color: '#fff',
          padding: 'clamp(60px,8vw,90px) 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem,5vw,3rem)',
              marginBottom: 14,
              lineHeight: 1.2,
            }}
          >
            Contact & <span style={{ color: 'var(--accent)' }}>Support</span>
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            We are here to help -- whether you have a question about a listing, need advice, or want to talk to a specialist.
          </p>
        </div>
      </section>

      <div
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          padding: 'clamp(48px,6vw,80px) 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
          gap: 48,
          alignItems: 'start',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.7rem',
              color: 'var(--dark)',
              marginBottom: 8,
            }}
          >
            Send Us a Message
          </h2>

          <p style={{ color: 'var(--mid)', marginBottom: 28, fontSize: 14 }}>
            We will get back to you within one business day.
          </p>

          {sent ? (
            <div
              style={{
                background: '#f0faf4',
                border: '1px solid #bde8cc',
                borderRadius: 14,
                padding: '36px 32px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>

              <h3
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '1.4rem',
                  color: 'var(--dark)',
                  marginBottom: 10,
                }}
              >
                Message Sent!
              </h3>

              <p style={{ color: 'var(--mid)', lineHeight: 1.7 }}>
                Thanks, {form.name}. Our team will be in touch at{' '}
                <strong>{form.email}</strong> within one business day.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '32px 28px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {errorMsg && (
                <div
                  style={{
                    background: '#fff1f1',
                    border: '1px solid #ffb3b3',
                    color: '#b42318',
                    padding: '12px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--dark)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Full Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Jane Smith"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--dark)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Phone (optional)
                  </label>

                  <input
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="416-555-0100"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--dark)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Email Address *
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="jane@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--dark)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Topic
                </label>

                <select
                  value={form.topic}
                  onChange={e => set('topic', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select a topic...</option>
                  {TOPICS.map(topic => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--dark)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Message *
                </label>

                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={5}
                  placeholder="Tell us how we can help..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={sending || !form.name || !form.email || !form.message}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '13px 0',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending || !form.name || !form.email || !form.message ? 0.6 : 1,
                }}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.7rem',
              color: 'var(--dark)',
              marginBottom: 0,
            }}
          >
            Other Ways to Reach Us
          </h2>

          {SUPPORT_CARDS.map(card => (
            <div
              key={card.title}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '22px 20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--dark)',
                    fontSize: 15,
                    marginBottom: 2,
                  }}
                >
                  {card.title}
                </div>

                <div
                  style={{
                    color: 'var(--accent)',
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {card.detail}
                </div>

                <div style={{ fontSize: 12, color: 'var(--mid)' }}>{card.sub}</div>
              </div>
            </div>
          ))}

          <div
            style={{
              background: 'var(--dark)',
              borderRadius: 14,
              padding: '24px 22px',
              color: '#fff',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              Looking for quick answers?
            </div>

            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Check the Landlord Portal for FAQs, pricing, and getting started guides.
            </p>


            <a
              href="/landlord"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 13,
                display: 'inline-block',
              }}
            >
              View FAQs
            </a>
          </div>
        </div>
      </div>

      {/* ── Cities we serve ── */}
      <div
        style={{
          background: 'var(--dark)',
          padding: 'clamp(48px,7vw,80px) 24px',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(196,162,90,0.18)',
                border: '1px solid rgba(196,162,90,0.35)',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                borderRadius: 20,
                padding: '4px 16px',
                marginBottom: 14,
              }}
            >
              Areas We Serve
            </div>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(1.6rem,3.5vw,2.2rem)',
                color: '#fff',
                margin: 0,
              }}
            >
              Serving the Greater Toronto Area
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {[
              'Toronto',
              'Mississauga',
              'Markham',
              'Richmond Hill',
              'Vaughan',
              'Pickering',
              'Oshawa',
              'Whitby',
              'Brampton',
              'Newmarket',
            ].map(city => (
              <div
                key={city}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '28px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background .18s, transform .18s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(196,162,90,0.12)'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.07)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: 22 }}></span>
                <span
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 'clamp(1rem,2vw,1.2rem)',
                    fontWeight: 700,
                    color: 'var(--accent)',
                  }}
                >
                  {city}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}