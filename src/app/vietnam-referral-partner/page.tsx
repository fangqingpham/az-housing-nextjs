'use client'

import { useState } from 'react'

const ACTIVITY_TYPES = [
  'Du học',
  'Tư vấn định cư',
  'Trung tâm tiếng Anh-IELTS',
  'Vé máy bay-du lịch',
  'Cộng đồng sinh viên',
  'Khác',
]

const SERVICES = [
  'Tìm phòng',
  'Đưa đón sân bay',
  'Xem phòng',
  'Hỗ trợ chuyển vào',
  'Landing Arrangement tron goi',
  'Khác',
]

type SignupForm = {
  companyName: string
  contactName: string
  position: string
  email: string
  phone: string
  city: string
  activityType: string
  publicPage: string
  expectedMonthlyClients: string
  payoutMethod: string
  notes: string
  website: string
  termsAccepted: boolean
}

type ReferralForm = {
  referralId: string
  partnerEmail: string
  clientName: string
  clientPhone: string
  clientEmail: string
  originLocation: string
  destinationCity: string
  arrivalDate: string
  schoolProgram: string
  peopleCount: string
  rentalBudget: string
  serviceInterest: string
  notes: string
  website: string
  consentConfirmed: boolean
}

const initialSignup: SignupForm = {
  companyName: '',
  contactName: '',
  position: '',
  email: '',
  phone: '',
  city: '',
  activityType: '',
  publicPage: '',
  expectedMonthlyClients: '',
  payoutMethod: '',
  notes: '',
  website: '',
  termsAccepted: false,
}

const initialReferral: ReferralForm = {
  referralId: '',
  partnerEmail: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  originLocation: '',
  destinationCity: '',
  arrivalDate: '',
  schoolProgram: '',
  peopleCount: '',
  rentalBudget: '',
  serviceInterest: '',
  notes: '',
  website: '',
  consentConfirmed: false,
}

export default function VietnamReferralPartnerPage() {
  const [open, setOpen] = useState<'signup' | 'referral'>('signup')
  const [signup, setSignup] = useState<SignupForm>(initialSignup)
  const [referral, setReferral] = useState<ReferralForm>(initialReferral)
  const [signupState, setSignupState] = useState({ loading: false, done: false, error: '' })
  const [referralState, setReferralState] = useState({ loading: false, done: false, error: '', reference: '' })

  const setSignupField = (key: keyof SignupForm, value: string | boolean) => setSignup(prev => ({ ...prev, [key]: value }))
  const setReferralField = (key: keyof ReferralForm, value: string | boolean) => setReferral(prev => ({ ...prev, [key]: value }))

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault()
    setSignupState({ loading: true, done: false, error: '' })
    try {
      const res = await fetch('/api/referral-partners/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signup,
          phone: signup.phone,
          city: signup.city,
          province: 'Vietnam',
          etransferEmail: signup.email,
          partnerType: 'vietnam_agency',
          sourcePage: 'vietnam-referral-partner',
          language: 'vi',
          fullName: signup.companyName,
          partnerBackground: signup.activityType,
          website: signup.website,
          publicPage: signup.publicPage,
          notes: [
            signup.publicPage ? `Website/Facebook/Zalo: ${signup.publicPage}` : '',
            signup.notes,
          ].filter(Boolean).join('\n'),
          termsAccepted: signup.termsAccepted,
          limitsAccepted: signup.termsAccepted,
          payoutAccepted: signup.termsAccepted,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Không thể gửi đăng ký ngay lúc này.')
      setSignup(initialSignup)
      setSignupState({ loading: false, done: true, error: '' })
    } catch (err) {
      setSignupState({ loading: false, done: false, error: err instanceof Error ? err.message : 'Không thể gửi đăng ký ngay lúc này.' })
    }
  }

  async function submitReferral(e: React.FormEvent) {
    e.preventDefault()
    setReferralState({ loading: true, done: false, error: '', reference: '' })
    try {
      const res = await fetch('/api/referrals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...referral,
          partnerType: 'vietnam_agency',
          sourcePage: 'vietnam-referral-partner',
          language: 'vi',
          partnerRuleConfirmed: referral.consentConfirmed,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Không thể gửi thông tin khách hàng ngay lúc này.')
      setReferral(initialReferral)
      setReferralState({ loading: false, done: true, error: '', reference: json.reference || '' })
    } catch (err) {
      setReferralState({ loading: false, done: false, error: err instanceof Error ? err.message : 'Không thể gửi thông tin khách hàng ngay lúc này.', reference: '' })
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <section style={{ background: 'linear-gradient(135deg, var(--dark), #1a2a4a)', color: '#fff', padding: 'clamp(64px,9vw,112px) 24px 72px', textAlign: 'center' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={eyebrowStyle}>A-Z Housing Solutions</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 1.14, margin: '0 0 18px' }}>Chương Trình Đối Tác Giới Thiệu Khách Hàng Tại Việt Nam</h1>
          <p style={{ color: 'rgba(255,255,255,0.76)', fontSize: '1.08rem', lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 760 }}>Dành cho công ty du học, tư vấn định cư, trung tâm tiếng Anh, IELTS, và các đơn vị hỗ trợ học sinh - sinh viên sang Canada.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href="#partner-signup" style={primaryCta}>Đăng Ký Làm Đối Tác</a>
            <a href="#client-referral" style={secondaryCta}>Gửi Thông Tin Khách Hàng</a>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={introGridStyle}>
          <div>
            <h2 style={headingStyle}>Vì sao hợp tác với A-Z Housing?</h2>
            <p style={bodyStyle}>Khách hàng của bạn không chỉ cần visa hay thư nhập học. Họ còn cần nơi ở an toàn, người hỗ trợ khi mới đến Canada, và một đơn vị đáng tin cậy để giúp họ ổn định trong những ngày đầu tiên.</p>
          </div>
          <div style={cardStyle}>
            <ul style={listStyle}>
              {[
                'A-Z Housing hỗ trợ tìm chỗ ở và sắp xếp khi khách đến Canada',
                'Đưa đón sân bay nếu khách có nhu cầu',
                'Hỗ trợ liên hệ chủ nhà / landlady / landlord',
                'Hỗ trợ xem phòng, đặt lịch, và chuẩn bị chuyển vào',
                'Giúp phụ huynh yên tâm hơn khi con mới sang Canada',
                'Đối tác chỉ cần giới thiệu khách, A-Z xử lý phần còn lại',
              ].map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <h2 style={headingStyle}>Hoa hồng giới thiệu</h2>
        <div style={commissionGridStyle}>
          {[
            'Gói dịch vụ từ $799 đến $1,499 CAD: hoa hồng $100 CAD cho mỗi khách hàng được giới thiệu và thanh toán thành công.',
            'Gói dịch vụ từ $1,500 CAD trở lên: hoa hồng $150 CAD cho mỗi khách hàng được giới thiệu và thanh toán thành công.',
            'Hoa hồng chỉ được thanh toán sau khi khách hàng đã đăng ký, thanh toán trực tiếp cho A-Z Housing, và khoản thanh toán được xác nhận',
          ].map(item => <div key={item} style={miniCardStyle}>{item}</div>)}
        </div>
        <p style={{ ...bodyStyle, marginTop: 18, fontWeight: 700, color: 'var(--dark)' }}>Đối tác không cần thu tiền từ khách hàng. A-Z Housing sẽ trực tiếp tư vấn, báo giá, gửi invoice và nhận thanh toán từ khách hàng.</p>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>Quy Trình Hợp Tác Đơn Giản</h2>
          <ol style={{ ...listStyle, columns: 1, paddingLeft: 22 }}>
            {[
              'Đối tác đăng ký thông tin',
              'A-Z Housing xét duyệt và cấp mã đối tác',
              'Đối tác nhập thông tin khách hàng qua trang web azhouse',
              'A-Z Housing liên hệ trực tiếp với khách hàng',
              'Khách hàng thanh toán trực tiếp cho A-Z Housing',
              'Đối tác nhận hoa hồng sau khi thanh toán được xác nhận',
            ].map(step => <li key={step}>{step}</li>)}
          </ol>
        </div>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <div style={{ ...cardStyle, borderLeft: '5px solid var(--accent)' }}>
          <h2 style={headingStyle}>Vai trò của đối tác</h2>
          <p style={bodyStyle}>Vai trò của đối tác chỉ giới hạn ở việc giới thiệu khách hàng tiềm năng cho A-Z Housing. Đối tác không được thu tiền, cam kết có phòng, thay đổi giá dịch vụ, xác nhận dịch vụ, ký giấy tờ, hoặc đưa ra bất kỳ lời hứa nào thay mặt A-Z Housing. Tất cả tư vấn, báo giá, thu tiền, xác nhận dịch vụ và quá trình hỗ trợ khách hàng sẽ do A-Z Housing trực tiếp thực hiện.</p>
        </div>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0, display: 'grid', gap: 18 }}>
        <div id="partner-signup" style={cardStyle}>
          <button onClick={() => setOpen(open === 'signup' ? 'referral' : 'signup')} style={accordionButtonStyle}>
            <span>1. Đăng Ký Làm Đối Tác</span><span>{open === 'signup' ? '▲' : '▼'}</span>
          </button>
          {open === 'signup' && (
            <div style={formWrapStyle}>
              {signupState.done && <Success>Cảm ơn bạn đã đăng ký trở thành Đối Tác Giới Thiệu của A-Z Housing. Chúng tôi sẽ xem xét thông tin và liên hệ lại với bạn trong thời gian sớm nhất.</Success>}
              {signupState.error && <ErrorBox>{signupState.error}</ErrorBox>}
              <form onSubmit={submitSignup} style={formStyle}>
                <div style={{ display: 'none' }}><input value={signup.website} onChange={e => setSignupField('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
                <div style={fieldGridStyle}>
                  <Field label="Tên công ty / đơn vị"><input required style={inputStyle} value={signup.companyName} onChange={e => setSignupField('companyName', e.target.value)} /></Field>
                  <Field label="Người liên hệ chính"><input required style={inputStyle} value={signup.contactName} onChange={e => setSignupField('contactName', e.target.value)} /></Field>
                  <Field label="Chức vụ"><input required style={inputStyle} value={signup.position} onChange={e => setSignupField('position', e.target.value)} /></Field>
                  <Field label="Email"><input required type="email" style={inputStyle} value={signup.email} onChange={e => setSignupField('email', e.target.value)} /></Field>
                  <Field label="Số điện thoại / Zalo / WhatsApp"><input required style={inputStyle} value={signup.phone} onChange={e => setSignupField('phone', e.target.value)} /></Field>
                  <Field label="Thành phố tại Việt Nam"><input required style={inputStyle} value={signup.city} onChange={e => setSignupField('city', e.target.value)} /></Field>
                  <Field label="Loại hình hoạt động">
                    <select required style={inputStyle} value={signup.activityType} onChange={e => setSignupField('activityType', e.target.value)}>
                      <option value="">Chọn loại hình</option>
                      {ACTIVITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </Field>
                  <Field label="Website / Facebook / Zalo page"><input style={inputStyle} value={signup.publicPage} onChange={e => setSignupField('publicPage', e.target.value)} /></Field>
                  <Field label="Số lượng khách dự kiến mỗi tháng"><input required style={inputStyle} value={signup.expectedMonthlyClients} onChange={e => setSignupField('expectedMonthlyClients', e.target.value)} /></Field>
                  <Field label="Phương thức nhận hoa hồng mong muốn"><input required style={inputStyle} value={signup.payoutMethod} onChange={e => setSignupField('payoutMethod', e.target.value)} /></Field>
                </div>
                <Field label="Ghi chú"><textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={signup.notes} onChange={e => setSignupField('notes', e.target.value)} /></Field>
                <Checkbox checked={signup.termsAccepted} onChange={v => setSignupField('termsAccepted', v)} label="Tôi xác nhận đã đọc và đồng ý với Điều Khoản Đối Tác của A-Z Housing. Tôi hiểu rằng vai trò của tôi chỉ là giới thiệu khách hàng. Tôi không được thu tiền, thay đổi giá, cam kết có phòng, hoặc đưa ra lời hứa thay mặt A-Z Housing." />
                <button disabled={signupState.loading} style={submitButtonStyle(signupState.loading)}>{signupState.loading ? 'Đang gửi...' : 'Đăng Ký Làm Đối Tác'}</button>
              </form>
            </div>
          )}
        </div>

        <div id="client-referral" style={cardStyle}>
          <button onClick={() => setOpen(open === 'referral' ? 'signup' : 'referral')} style={accordionButtonStyle}>
            <span>2. Gửi Thông Tin Khách Hàng</span><span>{open === 'referral' ? '▲' : '▼'}</span>
          </button>
          {open === 'referral' && (
            <div style={formWrapStyle}>
              {referralState.done && <Success>Cảm ơn bạn đã gửi thông tin khách hàng. A-Z Housing sẽ liên hệ trực tiếp với khách hàng. Hoa hồng sẽ được ghi nhận theo mã đối tác nếu khách hàng đăng ký và thanh toán thành công.{referralState.reference ? ` Mã tham chiếu: ${referralState.reference}` : ''}</Success>}
              {referralState.error && <ErrorBox>{referralState.error}</ErrorBox>}
              <form onSubmit={submitReferral} style={formStyle}>
                <div style={{ display: 'none' }}><input value={referral.website} onChange={e => setReferralField('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
                <div style={fieldGridStyle}>
                  <Field label="Mã đối tác (Referral ID)"><input required style={inputStyle} value={referral.referralId} onChange={e => setReferralField('referralId', e.target.value)} /></Field>
                  <Field label="Email đối tác đã đăng ký"><input required type="email" style={inputStyle} value={referral.partnerEmail} onChange={e => setReferralField('partnerEmail', e.target.value)} /></Field>
                  <Field label="Tên khách hàng"><input required style={inputStyle} value={referral.clientName} onChange={e => setReferralField('clientName', e.target.value)} /></Field>
                  <Field label="Số điện thoại / Zalo / WhatsApp của khách"><input required style={inputStyle} value={referral.clientPhone} onChange={e => setReferralField('clientPhone', e.target.value)} /></Field>
                  <Field label="Email khách hàng"><input required type="email" style={inputStyle} value={referral.clientEmail} onChange={e => setReferralField('clientEmail', e.target.value)} /></Field>
                  <Field label="Khách hiện đang ở quốc gia/thành phố nào"><input required style={inputStyle} value={referral.originLocation} onChange={e => setReferralField('originLocation', e.target.value)} /></Field>
                  <Field label="Thành phố khách sẽ đến tại Canada"><input required style={inputStyle} value={referral.destinationCity} onChange={e => setReferralField('destinationCity', e.target.value)} /></Field>
                  <Field label="Ngày dự kiến đến Canada"><input required type="date" style={inputStyle} value={referral.arrivalDate} onChange={e => setReferralField('arrivalDate', e.target.value)} /></Field>
                  <Field label="Trường học / chương trình học nếu có"><input style={inputStyle} value={referral.schoolProgram} onChange={e => setReferralField('schoolProgram', e.target.value)} /></Field>
                  <Field label="Số người cần hỗ trợ"><input required style={inputStyle} value={referral.peopleCount} onChange={e => setReferralField('peopleCount', e.target.value)} /></Field>
                  <Field label="Ngân sách thuê nhà dự kiến"><input style={inputStyle} value={referral.rentalBudget} onChange={e => setReferralField('rentalBudget', e.target.value)} /></Field>
                  <Field label="Dịch vụ cần hỗ trợ">
                    <select required style={inputStyle} value={referral.serviceInterest} onChange={e => setReferralField('serviceInterest', e.target.value)}>
                      <option value="">Chọn dịch vụ</option>
                      {SERVICES.map(service => <option key={service} value={service}>{service === 'Landing Arrangement tron goi' ? 'Landing Arrangement trọn gói' : service}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Ghi chú"><textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={referral.notes} onChange={e => setReferralField('notes', e.target.value)} /></Field>
                <Checkbox checked={referral.consentConfirmed} onChange={v => setReferralField('consentConfirmed', v)} label="Tôi xác nhận rằng khách hàng đã đồng ý cho tôi chia sẻ thông tin liên hệ của họ với A-Z Housing Solutions để A-Z Housing có thể liên hệ trực tiếp về dịch vụ hỗ trợ nhà ở và sắp xếp khi đến Canada." />
                <button disabled={referralState.loading} style={submitButtonStyle(referralState.loading)}>{referralState.loading ? 'Đang gửi...' : 'Gửi Thông Tin Khách Hàng'}</button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--mid)', fontSize: 13.5, lineHeight: 1.6 }}>
      <input required type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 4 }} />
      <span>{label}</span>
    </label>
  )
}

function Success({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#e1f5ee', color: '#2d7a4f', border: '1px solid #9fe1cb', borderRadius: 10, padding: 14, marginBottom: 16, fontWeight: 700 }}>{children}</div>
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#fcebeb', color: '#a32d2d', border: '1px solid #e8a5a5', borderRadius: 10, padding: 14, marginBottom: 16 }}>{children}</div>
}

const sectionStyle: React.CSSProperties = { maxWidth: 1080, margin: '0 auto', padding: 'clamp(44px,6vw,76px) 24px' }
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid rgba(12,21,37,0.08)', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', padding: 24, overflow: 'hidden' }
const miniCardStyle: React.CSSProperties = { ...cardStyle, padding: 20, color: 'var(--dark)', fontWeight: 800, lineHeight: 1.55 }
const headingStyle: React.CSSProperties = { fontFamily: 'var(--serif)', fontSize: 'clamp(1.7rem,3vw,2.35rem)', lineHeight: 1.18, color: 'var(--dark)', margin: '0 0 16px' }
const bodyStyle: React.CSSProperties = { color: 'var(--mid)', fontSize: '1rem', lineHeight: 1.8, margin: 0 }
const listStyle: React.CSSProperties = { color: 'var(--mid)', lineHeight: 1.8, margin: 0, paddingLeft: 20 }
const introGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22, alignItems: 'start' }
const commissionGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }
const eyebrowStyle: React.CSSProperties = { display: 'inline-block', background: 'rgba(196,162,90,0.18)', border: '1px solid rgba(196,162,90,0.35)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 20, padding: '5px 16px', marginBottom: 24 }
const primaryCta: React.CSSProperties = { background: 'var(--accent)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '13px 22px', fontWeight: 800, fontSize: 15 }
const secondaryCta: React.CSSProperties = { background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '13px 22px', fontWeight: 800, fontSize: 15, border: '1px solid rgba(255,255,255,0.25)' }
const accordionButtonStyle: React.CSSProperties = { width: '100%', background: '#fff', border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', gap: 16, cursor: 'pointer', color: 'var(--dark)', fontWeight: 800, fontSize: 18, fontFamily: 'var(--serif)', textAlign: 'left' }
const formWrapStyle: React.CSSProperties = { paddingTop: 22 }
const formStyle: React.CSSProperties = { display: 'grid', gap: 14 }
const fieldGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e4e1d8', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fafaf8', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: 6 }
const submitButtonStyle = (loading: boolean): React.CSSProperties => ({ background: loading ? '#9aa3b2' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' })
