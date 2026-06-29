'use client';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export default function PrivacyPage() {
  const { t, lang } = useLanguage();

  const tabs = [
    { label: lang === 'zh' ? '隐私政策' : 'Privacy Policy',    href: '/privacy'  },
    { label: lang === 'zh' ? '服务条款' : 'Terms of Service',  href: '/terms'    },
    { label: lang === 'zh' ? 'Cookie 政策' : 'Cookie Policy',  href: '/cookies'  },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'var(--dark)', padding: 'clamp(48px,6vw,72px) 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>A-Z Housing Solutions</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: '#fff', fontWeight: 700, marginBottom: 12 }}>
            {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            {lang === 'zh' ? '最后更新：2025年5月' : 'Last updated: May 2025'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          {tabs.map(p => {
            const active = p.href === '/privacy';
            return (
              <Link key={p.href} href={p.href} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'var(--accent)' : '#fff', color: active ? '#fff' : 'var(--mid)', border: '1px solid ' + (active ? 'transparent' : '#ddd') }}>
                {p.label}
              </Link>
            );
          })}
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(28px,4vw,48px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {lang === 'zh' ? (
            <>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>生效日期</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>2026年1月1日</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. 简介</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions（以下简称"A-Z Housing"、"我们"）运营 https://az-housing-nextjs.vercel.app/，并在加拿大各地提供房产搜索、挂牌出售/出租、房地产指导、房东和租户支持、抵押贷款建议转介及相关在线服务。本隐私政策说明我们如何在您访问网站、创建账户、发布或查询房源、联系我们或使用我们服务时收集、使用、披露、存储和保护个人信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. 我们收集的个人信息</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们可能收集您直接提供的个人信息，包括姓名、电子邮件地址、电话号码、账户登录信息、房源详情、房产地址或位置信息、通过联系表单提交的消息、租户或房东询问详情，以及提供付费服务时的付款或账单信息。我们还可能收集技术信息，例如 IP 地址、浏览器类型、设备信息、访问页面、引荐 URL、Cookie 标识符和网站使用数据。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. 我们如何使用个人信息</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们使用个人信息来提供和改进网站及服务；创建和管理用户账户；展示、审核和管理房源；回应问题和支持请求；根据用户请求将其与房源所有者、房东、租户、服务提供商或转介合作伙伴联系；防止欺诈、垃圾邮件或滥用网站；维护网站安全；分析网站性能；发送服务消息；以及遵守法律、税务、会计或监管要求。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. 同意</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>使用我们的网站、提交信息、创建账户、发布房源或联系我们，即表示您同意按照本隐私政策的规定收集、使用和披露您的个人信息。在法律允许的情况下，您可以撤回同意，但这可能会限制我们提供某些服务的能力。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. 个人信息的共享</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们可能与帮助运营网站的服务提供商共享个人信息，包括托管、分析、通信、安全、客户支持、支付处理或业务管理方面的服务提供商。当您请求或授权连接时，我们也可能与房源相关方、房东、租户、代理商、抵押贷款或法律转介合作伙伴或其他第三方共享信息。如果法律、法院命令、政府请求要求，或为保护我们的权利、用户、财产、安全或网站安全，我们可能会披露信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. 房源和公开信息</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>为公开房源提交的信息，例如房产描述、价格、地址、照片以及联系或询问信息，根据房源设置，可能对网站访客或其他用户可见。请勿在房源中提交您不希望公开的信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. 第三方链接和房源</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们的网站可能链接至第三方网站、房源平台、经纪机构、贷款机构、法律专业人士或其他服务提供商。我们对第三方网站或服务的隐私惯例、准确性、安全性或内容不承担责任。用户在与第三方共享信息前，应查阅其隐私政策。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. Cookie 和分析</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们可能使用 Cookie 和类似技术来记住偏好、支持账户登录、衡量网站流量、改善用户体验并了解用户与网站的互动方式。更多信息请参阅我们的 Cookie 政策。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. 保留和安全</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们仅在本隐私政策所述目的所需的合理期限内或法律要求的期限内保留个人信息。我们采用合理的行政、技术和物理保障措施来保护个人信息。但是，没有任何网站、互联网传输或电子存储系统是完全安全的。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. 访问、更正和问题</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>您可以通过发送电子邮件至 azhousing.solutions@outlook.com 请求访问您的个人信息、要求更正、撤回同意或提出隐私问题。我们可能需要在处理请求前验证您的身份。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>11. 儿童</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们的网站面向一般房产和住房相关用途，不面向儿童。除非用户具有法律授权且相关信息对所请求的服务是必要的，否则用户不应提交未成年人的个人信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>12. 本隐私政策的变更</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们可能会不时更新本隐私政策。更新版本将发布在我们的网站上，并注明修订后的生效日期。在变更后继续使用本网站，即表示您接受更新后的政策。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>13. 联系方式</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>加拿大安大略省多伦多市</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电子邮件：azhousing.solutions@outlook.com</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电话：+1 (647) 6932-932</p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>Effective Date</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>[Jan 1, 2026]</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. Introduction</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions (&quot;A-Z Housing&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates https://az-housing-nextjs.vercel.app/ and provides property search, property listing, real estate guidance, landlord and tenant support, mortgage advice referral, and related online services across Canada. This Privacy Policy explains how we collect, use, disclose, store, and protect personal information when you visit our website, create an account, post or inquire about a listing, contact us, or use our services.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. Personal Information We Collect</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may collect personal information that you provide directly, including your name, email address, phone number, account login information, listing details, property address or location information, messages submitted through contact forms, tenant or landlord inquiry details, and payment or billing information if paid services are offered. We may also collect technical information such as IP address, browser type, device information, pages visited, referral URLs, cookie identifiers, and website usage data.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. How We Use Personal Information</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We use personal information to provide and improve our website and services; create and manage user accounts; display, review, and manage property listings; respond to questions and support requests; connect users with listing owners, landlords, tenants, service providers, or referral partners when requested; prevent fraud, spam, or misuse of the website; maintain website security; analyze website performance; send service messages; and comply with legal, tax, accounting, or regulatory requirements.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. Consent</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>By using our website, submitting information, creating an account, posting a listing, or contacting us, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy. You may withdraw consent where legally permitted, but this may limit our ability to provide certain services.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. Sharing of Personal Information</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may share personal information with service providers that help operate our website, hosting, analytics, communications, security, customer support, payment processing, or business administration. We may also share information with listing parties, landlords, tenants, agents, mortgage or legal referral partners, or other third parties when you request or authorize the connection. We may disclose information if required by law, court order, government request, or to protect our rights, users, property, safety, or website security.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. Listings and Public Information</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Information submitted for public listings, such as property descriptions, prices, addresses, photos, and contact or inquiry information, may be visible to website visitors or other users depending on the listing settings. Do not submit information in a listing that you do not want made public.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. Third-Party Links and Listings</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Our website may link to third-party websites, listing platforms, brokerages, lenders, legal professionals, or other service providers. We are not responsible for the privacy practices, accuracy, security, or content of third-party websites or services. Users should review the privacy policies of those third parties before sharing information with them.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. Cookies and Analytics</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may use cookies and similar technologies to remember preferences, support account login, measure website traffic, improve user experience, and understand how users interact with our website. More information is provided in our Cookie Policy.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. Retention and Security</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We keep personal information only as long as reasonably necessary for the purposes described in this Privacy Policy or as required by law. We use reasonable administrative, technical, and physical safeguards to protect personal information. However, no website, internet transmission, or electronic storage system is completely secure.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. Access, Correction, and Questions</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>You may request access to your personal information, ask for corrections, withdraw consent, or ask privacy questions by contacting us at azhousing.solutions@outlook.com. We may need to verify your identity before processing a request.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>11. Children</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Our website is intended for general real estate and housing-related use and is not directed to children. Users should not submit personal information about minors unless they have legal authority to do so and the information is necessary for the requested service.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>12. Changes to This Privacy Policy</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may update this Privacy Policy from time to time. The updated version will be posted on our website with a revised effective date. Continued use of the website after changes means you accept the updated policy.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>13. Contact</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Toronto, Ontario, Canada</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Email: azhousing.solutions@outlook.com</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Phone: +1 (647) 6932-932</p>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--mid)', fontSize: 13, marginTop: 32 }}>
          {lang === 'zh' ? '有疑问？' : 'Questions?'}{' '}
          <Link href="/contact" style={{ color: 'var(--accent)' }}>
            {lang === 'zh' ? '联系我们' : 'Contact us'}
          </Link>
        </p>
      </div>
    </main>
  );
}
