'use client';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export default function TermsPage() {
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
            {lang === 'zh' ? '服务条款' : 'Terms of Service'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            {lang === 'zh' ? '最后更新：2025年5月' : 'Last updated: May 2025'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          {tabs.map(p => {
            const active = p.href === '/terms';
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
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. 同意本条款</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>本服务条款（以下简称"条款"）规范您对 https://az-housing-nextjs.vercel.app/ 的使用，该网站由 A-Z Housing Solutions 运营。访问或使用网站、创建账户、发布房源、提交询价或使用任何服务，即表示您同意本条款。如果您不同意，请勿使用本网站。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. 我们的服务</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions 提供房产搜索、房源发布、租售信息、住房教育内容、房东和租户支持、租户筛查信息、租赁安排支持、物业管理信息、抵押贷款建议转介、法律建议转介及相关服务的在线平台。我们可能随时更新、变更、暂停或停止网站或服务的任何部分。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. 非经纪、法律、财务或税务建议</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>除非另有书面协议，网站上的信息仅供一般参考之用，不构成经纪、代理、法律、抵押贷款、会计、税务或专业咨询关系。用户应在做出决定前直接向相应持牌专业人士或房源相关方核实房产详情、可用性、价格、法律权利、融资选项及专业建议。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. 用户账户</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>您有责任保护账户登录信息的安全，并对账户下的所有活动负责。您必须提供准确、最新且完整的信息。我们可能暂停或终止包含虚假信息、违反本条款、制造风险或滥用网站的账户。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. 房源和用户内容</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>如果您发布房源、消息、照片、描述、价格、联系方式、评价或其他内容，即表示您确认有权发布，且内容准确、合法、不具误导性，且不侵犯他人权利。您授予 A-Z Housing Solutions 非排他性、免版税的全球许可，以托管、展示、复制、编辑和使用您提交的内容，用于运营和推广网站及服务。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. 房源准确性和可用性</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>我们努力提供有用的房产信息，但不保证房源、价格、可用性、房产详情、照片、面积、税费、区划、学校信息、租赁规则或联系方式的完整性、时效性或无误性。用户在做出决定前必须独立核实所有信息。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. 禁止使用</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>您不得使用本网站发布虚假或误导性房源；冒充他人；上传非法、冒犯性、歧视性、诽谤性或侵权内容；未经许可抓取或复制网站数据；干扰网站安全；发送垃圾邮件；未经同意收集用户信息；或将网站用于非法活动。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. 付款和费用</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>某些服务可能需要收费。如果收费适用，价格、付款条款、退款条款和服务范围将在购买前显示或另行书面协议。除非另有说明，所有费用以加拿大元支付。可能需缴税。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. 第三方服务和链接</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>网站可能包含指向第三方网站、房源平台、房东、租户、房地产代理、抵押贷款专业人士、法律专业人士、承包商或其他服务提供商的链接或转介。我们对第三方服务、建议、内容、可用性、定价或行为不承担责任。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. 知识产权</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions 拥有的网站设计、品牌名称、标识、文字、图形、布局、软件和其他内容受知识产权法保护。除本条款允许或经我们书面许可外，您不得复制、修改、分发、出售或使用我们的知识产权。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>11. 免责声明</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>网站和服务按"现状"和"可用时"提供。我们不保证不间断访问、无错误操作、完整准确性、特定结果，或网站不含病毒或有害组件。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>12. 责任限制</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>在法律允许的最大范围内，A-Z Housing Solutions 不对间接、偶然、特殊、后果性、惩罚性或利润损失赔偿，或因房源、第三方服务、用户行为、网站停机、依赖信息或用户间交易而产生的损失承担责任。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>13. 赔偿</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>您同意就因您使用网站、您的内容、您的房源、您违反本条款或您违反任何法律或第三方权利而产生的索赔、损失、责任、损害、费用和开支，对 A-Z Housing Solutions 进行赔偿并使其免受损害。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>14. 终止</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>如果我们认为用户违反了本条款、制造了风险、滥用了网站或有违法行为，我们可随时暂停或终止其访问网站或服务的权限。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>15. 适用法律</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>本条款受安大略省法律及加拿大适用法律管辖。除非法律要求其他论坛，纠纷将在安大略省有管辖权的法院或法庭处理。</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>16. 联系方式</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>加拿大安大略省多伦多市</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电子邮件：azhousing.solutions@outlook.com</p>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>电话：1-800-AZ-HOUSE</p>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>Effective Date</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>[Insert effective date]</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>1. Agreement to These Terms</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>These Terms of Service (&quot;Terms&quot;) govern your use of https://az-housing-nextjs.vercel.app/, operated by A-Z Housing Solutions. By accessing or using the website, creating an account, posting a listing, submitting an inquiry, or using any service, you agree to these Terms. If you do not agree, do not use the website.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>2. Our Services</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>A-Z Housing Solutions provides an online platform for property search, property listing, rental and sale information, educational housing content, landlord and tenant support, tenant screening information, rental arrangement support, property management information, mortgage advice referrals, legal advice referrals, and related services. We may update, change, suspend, or discontinue any part of the website or services at any time.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>3. No Brokerage, Legal, Financial, or Tax Advice</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Unless separately agreed in writing, information on the website is for general informational purposes only and does not create a brokerage, agency, legal, mortgage, accounting, tax, or professional advisory relationship. Users should confirm property details, availability, price, legal rights, financing options, and professional advice directly with the appropriate licensed professionals or listing parties.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>4. User Accounts</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>You are responsible for keeping your account login information secure and for all activity under your account. You must provide accurate, current, and complete information. We may suspend or terminate accounts that contain false information, violate these Terms, create risk, or misuse the website.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>5. Listings and User Content</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>If you post a property listing, message, photo, description, price, contact detail, review, or other content, you confirm that you have the right to post it and that it is accurate, lawful, non-misleading, and does not infringe another person&apos;s rights. You grant A-Z Housing Solutions a non-exclusive, royalty-free, worldwide licence to host, display, copy, edit, and use your submitted content for operating and promoting the website and services.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>6. Listing Accuracy and Availability</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We try to provide useful property information, but we do not guarantee that listings, prices, availability, property details, photos, measurements, taxes, fees, zoning, school information, rental rules, or contact details are complete, current, or error-free. Users must independently verify all information before making decisions.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>7. Prohibited Use</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>You must not use the website to post false or misleading listings; impersonate others; upload illegal, offensive, discriminatory, defamatory, or infringing content; scrape or copy website data without permission; interfere with website security; send spam; collect user information without consent; or use the website for unlawful activity.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>8. Payments and Fees</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>Some services may require fees. If fees apply, the price, payment terms, refund terms, and service scope will be shown before purchase or agreed separately in writing. All fees are payable in Canadian dollars unless stated otherwise. Taxes may apply.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>9. Third-Party Services and Links</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>The website may include links or referrals to third-party websites, listing platforms, landlords, tenants, real estate agents, mortgage professionals, legal professionals, contractors, or other service providers. We are not responsible for third-party services, advice, content, availability, pricing, or conduct.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>10. Intellectual Property</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>The website design, brand name, logo, text, graphics, layout, software, and other content owned by A-Z Housing Solutions are protected by intellectual property laws. You may not copy, modify, distribute, sell, or use our intellectual property except as permitted by these Terms or with our written permission.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>11. Disclaimer of Warranties</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>The website and services are provided on an &apos;as is&apos; and &apos;as available&apos; basis. We do not guarantee uninterrupted access, error-free operation, complete accuracy, specific results, or that the website will be free of viruses or harmful components.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>12. Limitation of Liability</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>To the maximum extent permitted by law, A-Z Housing Solutions will not be liable for indirect, incidental, special, consequential, punitive, or loss-of-profit damages, or for losses arising from listings, third-party services, user conduct, website downtime, reliance on information, or transactions between users.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>13. Indemnity</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>You agree to indemnify and hold harmless A-Z Housing Solutions from claims, losses, liabilities, damages, costs, and expenses arising from your use of the website, your content, your listings, your violation of these Terms, or your violation of any law or third-party right.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>14. Termination</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>We may suspend or terminate access to the website or services at any time if we believe a user has violated these Terms, created risk, misused the website, or acted unlawfully.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>15. Governing Law</h2>
              <p style={{ lineHeight:1.8, color:"#444", marginBottom:"0.6rem", fontSize:15 }}>These Terms are governed by the laws of the Province of Ontario and the applicable laws of Canada. Disputes will be handled in the courts or tribunals with jurisdiction in Ontario, unless another forum is required by law.</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:700, color:"var(--dark)", marginBottom:"0.5rem", paddingBottom:"0.4rem", borderBottom:"1px solid #e5e0d8", marginTop:"1.5rem" }}>16. Contact</h2>
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
