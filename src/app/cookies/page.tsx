'use client';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export default function CookiesPage() {
  const { lang } = useLanguage();

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
            {lang === 'zh' ? 'Cookie 政策' : 'Cookie Policy'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            {lang === 'zh' ? '最后更新：2025年5月' : 'Last updated: May 2025'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          {tabs.map(p => {
            const active = p.href === '/cookies';
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
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>[请填写生效日期]</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. 简介</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>本 Cookie 政策说明 A-Z Housing Solutions 如何在 https://az-housing-nextjs.vercel.app/ 上使用 Cookie 及类似技术。本政策应与我们的隐私政策一起阅读。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. 什么是 Cookie</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Cookie 是您访问网站时放置在您设备上的小型文本文件。它们帮助网站记住有关您访问的信息，例如登录状态、偏好设置、浏览页面以及与网站的互动情况。类似技术可能包括像素、标签、本地存储和分析标识符。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. 我们如何使用 Cookie</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们可能使用 Cookie 来运营网站、保持用户登录状态、记住用户偏好、改善导航、衡量网站流量、了解用户如何使用页面和房源、保护网站免受欺诈或滥用、测试网站性能，以及在适用时支持营销或转介衡量。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. 我们可能使用的 Cookie 类型</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>必要 Cookie 是账户登录、安全、表单和基本导航等核心网站功能所必需的。偏好 Cookie 记住设置或保存的搜索偏好等选择。分析 Cookie 帮助我们了解网站流量并改善网站。营销或转介 Cookie 可能有助于衡量广告、转介或活动效果（如果我们使用这些工具）。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. 第三方 Cookie</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>某些 Cookie 可能由支持托管、分析、地图、通信工具、广告、嵌入内容、欺诈预防或其他网站功能的第三方提供商设置。第三方提供商可能根据其自身的隐私和 Cookie 政策处理信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. 同意和 Cookie 控制</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>在需要的情况下，我们将在使用非必要 Cookie 前请求您的同意。您可以通过浏览器设置管理 Cookie，包括删除 Cookie、阻止 Cookie 或将浏览器设置为在使用 Cookie 时提醒您。如果您阻止或删除 Cookie，某些网站功能、账户功能、房源工具或表单可能无法正常工作。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. 请勿追踪和浏览器信号</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>部分浏览器提供请勿追踪等隐私信号。由于这些信号并没有统一的行业标准，我们的网站可能无法响应每个浏览器信号。您仍然可以通过浏览器设置控制 Cookie。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. Cookie 保留期限</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Cookie 可能是会话 Cookie（在您关闭浏览器时过期），也可能是持久 Cookie（在设定期限内保留或直到您删除为止）。确切的保留期限取决于 Cookie 类型和提供商。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. 本 Cookie 政策的更新</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>如果我们的网站功能、Cookie 工具、分析服务或法律要求发生变化，我们可能会更新本 Cookie 政策。更新版本将发布在我们的网站上，并注明修订后的生效日期。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. 联系方式</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>关于本 Cookie 政策的问题，请发送至：</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>加拿大安大略省多伦多市</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电子邮件：azhousing.solutions@outlook.com</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电话：1-800-AZ-HOUSE</p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>Effective Date</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>[Insert effective date]</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. Introduction</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>This Cookie Policy explains how A-Z Housing Solutions uses cookies and similar technologies on https://az-housing-nextjs.vercel.app/. This policy should be read together with our Privacy Policy.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. What Cookies Are</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Cookies are small text files placed on your device when you visit a website. They help websites remember information about your visit, such as login status, preferences, pages viewed, and interactions with the website. Similar technologies may include pixels, tags, local storage, and analytics identifiers.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. How We Use Cookies</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may use cookies to operate the website, keep users logged in, remember user preferences, improve navigation, measure website traffic, understand how users use pages and listings, protect the website from fraud or abuse, test website performance, and support marketing or referral measurement where applicable.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. Types of Cookies We May Use</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Essential cookies are required for core website functions such as account login, security, forms, and basic navigation. Preference cookies remember choices such as settings or saved search preferences. Analytics cookies help us understand website traffic and improve the website. Marketing or referral cookies may help measure advertisements, referrals, or campaign performance if we use those tools.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. Third-Party Cookies</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Some cookies may be set by third-party providers that support hosting, analytics, maps, communication tools, advertising, embedded content, fraud prevention, or other website functions. Third-party providers may process information according to their own privacy and cookie policies.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. Consent and Cookie Control</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Where required, we will request consent before using non-essential cookies. You can manage cookies through your browser settings, by deleting cookies, blocking cookies, or setting your browser to alert you when cookies are being used. If you block or delete cookies, some website features, account functions, listing tools, or forms may not work properly.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. Do Not Track and Browser Signals</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Some browsers offer privacy signals such as Do Not Track. Because there is not always a consistent industry standard for these signals, our website may not respond to every browser signal. You can still control cookies through your browser settings.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. Cookie Retention</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Cookies may be session cookies, which expire when you close your browser, or persistent cookies, which remain for a set period or until you delete them. The exact retention period depends on the cookie type and provider.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. Updates to This Cookie Policy</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may update this Cookie Policy if our website features, cookie tools, analytics services, or legal requirements change. The updated version will be posted on our website with a revised effective date.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. Contact</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Questions about this Cookie Policy can be sent to:</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Toronto, Ontario, Canada</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Email: azhousing.solutions@outlook.com</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Phone: 1-800-AZ-HOUSE</p>
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
