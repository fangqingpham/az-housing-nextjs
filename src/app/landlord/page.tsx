"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { SHOW_LISTINGS } from "@/lib/features";

const FEATURES_EN = [
  { icon: "🏠", title: "Easy Listing Creation",    description: "Post a property in minutes with our guided form. Upload photos, set pricing, and go live instantly." },
  { icon: "📊", title: "Performance Dashboard",    description: "Track views, enquiries, and saves in real time. Know exactly how your listing is performing." },
  { icon: "💬", title: "Tenant Messaging",         description: "Receive and manage enquiries directly in your dashboard. No missed leads, no lost messages." },
  { icon: "📸", title: "Photo Management",         description: "Upload up to 20 high-resolution photos per listing. Showcase every room in its best light." },
  { icon: "🔍", title: "Wide Reach",               description: "Your listings appear in search results across all of Canada. Reach thousands of active buyers and renters." },
  { icon: "⚡", title: "Fast Approvals",            description: "Our team reviews listings quickly. Most go live within a few hours of submission." },
];

const FEATURES_ZH = [
  { icon: "🏠", title: "轻松创建房源",    description: "通过我们的引导表单，几分钟内即可发布房产。上传照片、设定价格，立即上线。" },
  { icon: "📊", title: "绩效仪表盘",      description: "实时追踪浏览量、询问和收藏数。随时了解您的房源表现。" },
  { icon: "💬", title: "租户消息管理",    description: "直接在仪表盘中接收和管理询问。不错过任何潜在客户，不丢失任何消息。" },
  { icon: "📸", title: "照片管理",        description: "每个房源最多可上传20张高分辨率照片。以最佳效果展示每个房间。" },
  { icon: "🔍", title: "广泛覆盖",        description: "您的房源将出现在加拿大全国的搜索结果中。触达数千名活跃买家和租客。" },
  { icon: "⚡", title: "快速审核",         description: "我们的团队快速审核房源。大多数房源在提交后几小时内即可上线。" },
];

const PLANS_EN = [
  {
    name: "A-Z Private Leasing Package",
    price: "$995",
    period: " flat fee",
    description: "Private leasing support for landlords who want help from marketing to signed lease.",
    features: [
      "Marketing on A-Z website, Kijiji, Facebook Marketplace, housing groups, and Rentals.ca where applicable",
      "Applicant inquiries and pre-qualification coordination",
      "Tenant screening for up to 5 applicants",
      "Ontario Standard Lease preparation and signing coordination",
      "Compliance support and landlord resources",
      "90-Day Rent Administration and Payment Monitoring",
      "Full Refund if Tenant Default Payment **",
    ],
    cta: "Order Here",
    href: "/tenant-placement",
    highlight: false,
  },
  {
    name: "Realtor MLS Full Leasing Package",
    price: "1 Month's Rent",
    period: " commission",
    description: "MLS/Realtor.ca leasing support for landlords who want maximum market exposure.",
    features: [
      "MLS listing through licensed Realtor channel",
      "Realtor.ca exposure",
      "Showing and inquiry coordination through Realtor channels",
      "Offer-to-lease review and negotiation support",
      "Lease signing and document coordination",
    ],
    cta: "Contact Us",
    href: "/contact",
    highlight: true,
  },
  {
    name: "Landlord Legal Resources",
    price: "Resources",
    period: " & guidance",
    description: "Helpful articles, guides, forms, and resources for Ontario and Canadian landlords.",
    features: [
      "Landlord and tenant rights guidance",
      "Lease, notice, and documentation resources",
      "Eviction preparation information",
      "Compliance tips and practical landlord checklists",
      "Access to Knowledge Hub guides and articles",
    ],
    cta: "Explore Resources",
    href: "/knowledge-hub/guides",
    highlight: false,
  },
];

const PLANS_ZH = [
  {
    name: "A-Z 私人租赁套餐",
    price: "$995",
    period: " 一次性固定费用",
    description: "为需要从营销到签署租约全程协助的房东提供私人租赁支持。",
    features: [
      "在 A-Z 网站、Kijiji、Facebook Marketplace、房屋群及适用的 Rentals.ca 上营销",
      "申请人询问及预资格审核协调",
      "最多5名申请人的租户筛查",
      "安大略省标准租约准备及签署协调",
      "合规支持及房东资源",
      "90天租金管理和付款监控",
      "如租客违约可获全额退款 **",
    ],
    cta: "立即下单",
    href: "/tenant-placement",
    highlight: false,
  },
  {
    name: "经纪人 MLS 完整租赁套餐",
    price: "一个月租金",
    period: " 佣金",
    description: "通过 MLS/Realtor.ca 为需要最大市场曝光的房东提供租赁支持。",
    features: [
      "通过持牌经纪人渠道进行 MLS 挂牌",
      "Realtor.ca 曝光",
      "通过经纪人渠道协调带看和询问",
      "要约转租约审查和谈判支持",
      "租约签署和文件协调",
    ],
    cta: "联系我们",
    href: "/contact",
    highlight: true,
  },
  {
    name: "房东法律资源",
    price: "资源",
    period: " 与指导",
    description: "为安大略省和加拿大房东提供实用文章、指南、表格和资源。",
    features: [
      "房东和租户权利指导",
      "租约、通知和文件资源",
      "驱逐准备信息",
      "合规技巧和实用房东清单",
      "访问知识中心指南和文章",
    ],
    cta: "探索资源",
    href: "/knowledge-hub/guides",
    highlight: false,
  },
];

const TESTIMONIALS_EN = [
  { quote: "I listed my condo and had three qualified viewings booked within the first week. The process was incredibly smooth.", name: "Sarah M.", role: "Private Landlord, Toronto",    avatar: "S" },
  { quote: "Managing 8 rental units used to be chaotic. Now everything lives in one dashboard and I never miss an enquiry.",     name: "David K.", role: "Property Investor, Vancouver", avatar: "D" },
  { quote: "Our agency switched to A-Z six months ago and we have cut our listing admin time in half. The team support is excellent.", name: "Priya R.", role: "Agency Director, Calgary",    avatar: "P" },
];

const TESTIMONIALS_ZH = [
  { quote: "我挂出公寓后，第一周内就预约了三次合格看房。整个流程非常顺畅。", name: "Sarah M.", role: "私人房东，多伦多",    avatar: "S" },
  { quote: "管理8套出租房曾经很混乱。现在一切都在一个仪表盘里，我再也不会错过任何询问了。", name: "David K.", role: "房产投资者，温哥华", avatar: "D" },
  { quote: "我们的机构六个月前切换到 A-Z，房源管理时间缩短了一半。团队支持非常出色。", name: "Priya R.", role: "机构总监，卡尔加里",    avatar: "P" },
];

const FAQS_EN = [
  { q: "Why is tenant screening important for Ontario landlords?", a: "Tenant screening helps landlords reduce the risk of non-payment, fake documents, poor communication, and future tenancy problems. A proper screening process should not rely on one document only. It should review the applicant’s identity, income, employment, credit history, landlord references, affordability, and overall consistency of the application." },
  { q: "How long does it take for my listing to go live?",    a: "Most listings are reviewed and approved within 2-4 hours during business hours. You will receive an email confirmation as soon as your listing is live." },
  { q: "Can I edit my listing after it is published?",        a: "Yes. You can update photos, pricing, description, and availability at any time from your dashboard. Changes go live immediately." },
  { q: "Is my contact information kept private?",             a: "Absolutely. Prospective tenants and buyers send enquiries through our platform. Your email and phone number are never displayed publicly." },
  { q: "What types of properties can I list?",                a: "We support all residential property types: condos, houses, townhouses, basements, and commercial spaces. Both for-sale and for-rent listings are welcome." },
  { q: "Can I upgrade or downgrade my plan?",                 a: "Yes, you can change plans at any time. Upgrades take effect immediately; downgrades apply at the end of your current billing period." },
];

const FAQS_ZH = [
  { q: "我的房源需要多长时间才能上线？",    a: "大多数房源在工作时间内2-4小时内完成审核和批准。您的房源上线后，您将收到电子邮件确认。" },
  { q: "发布后我可以编辑房源吗？",        a: "可以。您可以随时从仪表盘更新照片、价格、描述和可用性。更改立即生效。" },
  { q: "我的联系方式会保密吗？",             a: "当然。潜在租客和买家通过我们的平台发送询问。您的电子邮件和电话号码永远不会公开显示。" },
  { q: "我可以挂牌哪些类型的房产？",                a: "我们支持所有住宅类型：公寓、独立屋、联排别墅、地下室及商业空间。出售和出租房源均可。" },
  { q: "我可以升级或降级我的套餐吗？",                 a: "可以，您随时可以更改套餐。升级立即生效；降级在当前计费周期结束后生效。" },
];

export default function LandlordPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { lang } = useLanguage();

  const FEATURES     = lang === 'zh' ? FEATURES_ZH     : FEATURES_EN;
  const PLANS        = lang === 'zh' ? PLANS_ZH        : PLANS_EN;
  const TESTIMONIALS = lang === 'zh' ? TESTIMONIALS_ZH : TESTIMONIALS_EN;
  const FAQS         = lang === 'zh' ? FAQS_ZH         : FAQS_EN;

  const hero = lang === 'zh' ? {
    badge: '房东与经纪人专区',
    title: '更智能挂牌。',
    accent: '更快出租。',
    sub: '加拿大最受房东和房产经纪人信赖的平台。发布您的房产，触达数千名合格买家和租客，更快完成交易。',
    cta1: '免费发布房源',
    cta2: '查看套餐',
    stats: [
      { value: '12,000+', label: '活跃房源' },
      { value: '85,000+', label: '月访客' },
      { value: '4.8★',   label: '房东评分' },
    ],
    featuresTitle: '成功所需的一切工具',
    featuresSub: '我们的平台专为加拿大房东和经纪人打造。',
    plansTitle: '房东服务套餐',
    plansSub: '选择适合您租赁和房东支持需求的服务选项。',
    mostPopular: '最受欢迎',
    refundNote: '** 条件适用：如 A-Z 批准的租户在租约开始日期起90个日历天内的45个或更多连续日历天内持续拖欠租金，客户可能有资格获得全额退款。详情请联系租赁代理人。',
    testimonialsTitle: '深受加拿大房东喜爱',
    faqTitle: '常见问题',
    ctaTitle: '准备好挂牌您的房产了吗？',
    ctaSub: '加入数千名已在 A-Z Housing 发展房产组合的加拿大房东。',
    ctaBtn1: '免费发布房源',
    ctaBtn2: '创建账户',
  } : {
    badge: 'For Landlords & Agents',
    title: 'List Smarter.',
    accent: 'Rent Faster.',
    sub: "Canada's most trusted platform for landlords and real estate agents. Post your property, reach thousands of qualified buyers and renters, and close deals faster.",
    cta1: 'Post a Listing Free',
    cta2: 'View Plans',
    stats: [
      { value: '12,000+', label: 'Active Listings' },
      { value: '85,000+', label: 'Monthly Visitors' },
      { value: '4.8★',   label: 'Landlord Rating' },
    ],
    featuresTitle: 'Everything You Need to Succeed',
    featuresSub: 'Our platform is built specifically for Canadian landlords and agents.',
    plansTitle: 'Landlord Service Packages',
    plansSub: 'Choose the service option that fits your leasing and landlord support needs.',
    mostPopular: 'MOST POPULAR',
    refundNote: '** Conditions apply: if an A-Z-approved tenant remains in rent default for 45 or more consecutive calendar days within the first 90 calendar days of the lease start date, the Client may be eligible for a full refund. For more details, please contact Leasing Agent.',
    testimonialsTitle: 'Loved by Canadian Landlords',
    faqTitle: 'Frequently Asked Questions',
    ctaTitle: 'Ready to List Your Property?',
    ctaSub: 'Join thousands of Canadian landlords already growing their portfolio with A-Z Housing.',
    ctaBtn1: 'Post a Listing — Free',
    ctaBtn2: 'Create an Account',
  };

  if (!SHOW_LISTINGS) {
    const hiddenHero = lang === 'zh' ? {
      badge: '房东服务',
      title: '房东支持服务',
      sub: '我们继续为房东提供租客安置、租客筛选、租赁协助、物业管理和法律资源支持。',
      primary: '查看房东服务',
      secondary: '租客安置申请',
    } : {
      badge: 'Landlord Services',
      title: 'Support for Landlords',
      sub: 'We continue to support landlords with tenant placement, screening, leasing coordination, property management, and legal resources.',
      primary: 'View Landlord Services',
      secondary: 'Tenant Placement Application',
    };

    return (
      <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
        <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(80px,12vw,140px) 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <span style={{ display: "inline-block", background: "rgba(196,162,90,0.2)", border: "1px solid rgba(196,162,90,0.4)", color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "6px 18px", marginBottom: 28 }}>
              {hiddenHero.badge}
            </span>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,6vw,4rem)", lineHeight: 1.2, marginBottom: 24 }}>
              {hiddenHero.title}
            </h1>
            <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
              {hiddenHero.sub}
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/services/landlords" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 700, fontSize: 16 }}>{hiddenHero.primary}</Link>
              <Link href="/tenant-placement" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 16, border: "1px solid rgba(255,255,255,0.25)" }}>{hiddenHero.secondary}</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(80px,12vw,140px) 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <span style={{ display: "inline-block", background: "rgba(196,162,90,0.2)", border: "1px solid rgba(196,162,90,0.4)", color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "6px 18px", marginBottom: 28 }}>
            {hero.badge}
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,6vw,4rem)", lineHeight: 1.2, marginBottom: 24 }}>
            {hero.title} <br /><span style={{ color: "var(--accent)" }}>{hero.accent}</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            {hero.sub}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/post-listing" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 700, fontSize: 16 }}>{hero.cta1}</Link>
            <a href="#plans" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 16, border: "1px solid rgba(255,255,255,0.25)" }}>{hero.cta2}</a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 60, flexWrap: "wrap" }}>
            {hero.stats.map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--accent)", fontWeight: 700 }}>{stat.value}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(60px,8vw,100px) 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>{hero.featuresTitle}</h2>
          <p style={{ color: "var(--mid)", maxWidth: 520, margin: "0 auto", fontSize: "1.05rem" }}>{hero.featuresSub}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--dark)", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "var(--mid)", lineHeight: 1.7, fontSize: 14 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" style={{ background: "#fff", padding: "clamp(60px,8vw,100px) 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>{hero.plansTitle}</h2>
            <p style={{ color: "var(--mid)", fontSize: "1.05rem" }}>{hero.plansSub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28, alignItems: "start" }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.highlight ? "var(--dark)" : "var(--cream)", borderRadius: 16, padding: "36px 32px", position: "relative", boxShadow: plan.highlight ? "0 12px 40px rgba(0,0,0,0.18)" : "0 2px 12px rgba(0,0,0,0.06)", transform: plan.highlight ? "scale(1.03)" : "scale(1)" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1, borderRadius: 20, padding: "5px 16px", whiteSpace: "nowrap" }}>{hero.mostPopular}</div>
                )}
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: plan.highlight ? "#fff" : "var(--dark)", marginBottom: 6, fontWeight: 700 }}>{plan.name}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, color: plan.highlight ? "var(--accent)" : "var(--dark)" }}>{plan.price}</span>
                  <span style={{ color: plan.highlight ? "rgba(255,255,255,0.55)" : "var(--mid)", fontSize: 15 }}>{plan.period}</span>
                </div>
                <p style={{ color: plan.highlight ? "rgba(255,255,255,0.65)" : "var(--mid)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{plan.description}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {plan.features.map(feat => (
                    <li key={feat} style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--mid)", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${plan.highlight ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: plan.highlight ? "var(--accent)" : "var(--green)", fontWeight: 700 }}>✓</span>
                      {feat.includes("**") ? (
                        <span style={{ fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,0.9)" : "var(--dark)" }}>
                          {feat.replace(" **", "")} <span style={{ color: "var(--accent)", fontWeight: 900 }}>**</span>
                        </span>
                      ) : feat}
                    </li>
                  ))}
                </ul>
                {(plan.name === "A-Z Private Leasing Package" || plan.name === "A-Z 私人租赁套餐") && (
                  <p style={{ fontSize: 11.5, color: plan.highlight ? "rgba(255,255,255,0.55)" : "var(--mid)", lineHeight: 1.65, marginBottom: 20 }}>
                    {hero.refundNote}
                  </p>
                )}
                <Link href={plan.href} style={{ display: "block", textAlign: "center", background: plan.highlight ? "var(--accent)" : "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 15 }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(60px,8vw,100px) 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>{hero.testimonialsTitle}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, color: "var(--accent)", marginBottom: 16, lineHeight: 1 }}>&ldquo;</div>
              <p style={{ color: "var(--mid)", lineHeight: 1.75, marginBottom: 24, fontSize: "0.97rem" }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--dark)", fontSize: 15 }}>{t.name}</div>
                  <div style={{ color: "var(--mid)", fontSize: 13 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#fff", padding: "clamp(60px,8vw,100px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 14 }}>{hero.faqTitle}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "var(--cream)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
                  <span style={{ fontWeight: 600, color: "var(--dark)", fontSize: "0.97rem" }}>{faq.q}</span>
                  <span style={{ fontSize: 20, color: "var(--accent)", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && <div style={{ padding: "0 24px 20px", color: "var(--mid)", lineHeight: 1.75, fontSize: 14 }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, var(--accent) 0%, #b8923a 100%)", padding: "clamp(60px,8vw,100px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: 16 }}>{hero.ctaTitle}</h2>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
          {hero.ctaSub}
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing"  style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 800, fontSize: 16 }}>{hero.ctaBtn1}</Link>
          <Link href="/auth/register" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 16, border: "1px solid rgba(255,255,255,0.4)" }}>{hero.ctaBtn2}</Link>
        </div>
      </section>
    </main>
  );
}
