"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const SERVICES_EN = [
  {
    id: "tenant-screening",
    icon: "🔍",
    title: "Tenant Placement",
    tagline: "Find reliable, responsible tenants every time.",
    body: [
      "Our tenant screening service gives landlords a comprehensive view of every applicant before a lease is signed. We combine credit history analysis, employment verification, rental reference checks, and background screening into a single, easy-to-read report.",
      "Screening through A-Z Housing is fully compliant with provincial privacy legislation (PIPEDA / PIPA), meaning you can collect and use applicant information with confidence. Reports are delivered within 24-48 hours, keeping your vacancy period short.",
    ],
    bullets: ["Full credit report & score", "Rental history & landlord references", "Employment & income verification", "Identity & background check", "PIPEDA / PIPA compliant"],
    cta: { label: "Start Looking for AAA Tenants", href: "/tenant-placement" },
    accent: "var(--accent)",
  },
  {
    id: "rental-arrangement",
    icon: "📋",
    title: "Rental Arrangement",
    tagline: "Watertight contracts. Less hassle.",
    body: [
      "A well-drafted rental agreement is your first line of defence. Our team provides province-specific standard lease templates that comply with the latest Residential Tenancies Act requirements in Ontario, BC, Alberta, and beyond.",
      "We also offer lease review services for custom agreements -- ensuring clauses around pets, parking, utilities, maintenance responsibilities, and notice periods are clear, enforceable, and fair to all parties.",
    ],
    bullets: ["Province-specific lease templates", "Custom lease review & advice", "Addendum creation (pets, parking, etc.)", "Digital signing integration", "Secure cloud storage of agreements"],
    cta: { label: "Get Lease Templates", href: "/contact" },
    accent: "#4a90d9",
  },
  {
    id: "property-management",
    icon: "🏘️",
    title: "Property Management",
    tagline: "Professional management so you can focus on what matters.",
    body: [
      "From rent collection to maintenance coordination, A-Z Housing property management partners handle every aspect of running your rental. Whether you own a single condo or a multi-unit portfolio, we match you with accredited local property managers who know your market.",
      "Our dashboard lets you track rent payments, maintenance tickets, and tenancy status in real time -- even when you are managing from out of province or overseas.",
    ],
    bullets: ["Rent collection & arrears management", "Maintenance coordination & contractor network", "Regular property inspections with photo reports", "Month-end financial statements", "Portfolio dashboard (single & multi-unit)"],
    cta: { label: "Get Property Management Service", href: "/tenant-placement" },
    accent: "var(--green)",
  },
  {
    id: "legal-advice",
    icon: "⚖️",
    title: "Legal Advice & Eviction Prep",
    tagline: "Know your rights. Act with confidence.",
    body: [
      "Navigating the Landlord and Tenant Board (LTB) or provincial tribunal process can be daunting. Our network of real estate lawyers and paralegal partners provides plain-language guidance on issuing notices (N4, N5, N12), filing applications, and preparing for hearings.",
      "We do not replace formal legal counsel -- we help you understand the process so you arrive prepared. Most initial consultations are offered at a flat rate through our platform.",
    ],
    bullets: ["Notice preparation (N4, N5, N12, N13 & equivalents)", "LTB application guidance", "Hearing preparation & documentation checklist", "Referrals to licensed paralegals & real estate lawyers", "Dispute resolution support"],
    cta: { label: "Get Free Consultation", href: "/contact" },
    accent: "#9b59b6",
  },
];

const SERVICES_ZH = [
  {
    id: "tenant-screening",
    icon: "🔍",
    title: "租户安置",
    tagline: "每次都找到可靠、负责任的租户。",
    body: [
      "我们的租户筛查服务在签订租约前，为房东提供每位申请人的全面视图。我们将信用历史分析、就业核实、租赁参考检查和背景筛查整合为一份清晰易读的报告。",
      "通过A-Z Housing进行筛查完全符合省级隐私法规（PIPEDA/PIPA），让您带着信心收集和使用申请人信息。报告通常24-48小时内交付，缩短空置期。",
    ],
    bullets: ["完整信用报告和分数", "租赁历史和房东推荐信", "就业和收入核实", "身份和背景检查", "符合PIPEDA/PIPA法规"],
    cta: { label: "开始寻找优质租户", href: "/tenant-placement" },
    accent: "var(--accent)",
  },
  {
    id: "rental-arrangement",
    icon: "📋",
    title: "租赁安排",
    tagline: "严密的合同。更少麻烦。",
    body: [
      "一份起草良好的租赁协议是您的第一道防线。我们的团队提供符合居住租赁法最新要求的省级标准租赁模板，适用于安大略、加拿大广大省和阿尔伯塔等地区。",
      "我们还提供定制协议的租赁审查服务，确保关于宠物、车位、水电、维修责任和通知期的条款清晰、可执行且对各方公平。",
    ],
    bullets: ["省级标准租赁模板", "定制租赁审查和建议", "附属条款创建（宠物、车位等）", "数字签名集成", "协议安全云存储"],
    cta: { label: "获取租赁模板", href: "/contact" },
    accent: "#4a90d9",
  },
  {
    id: "property-management",
    icon: "🏘️",
    title: "物业管理",
    tagline: "专业管理，让您专注于重要的事情。",
    body: [
      "从租金收取到维修协调，A-Z Housing物业管理合作伙伴处理您租赁的每个环节。无论您拥有单套公寓还是多套房产，我们将您与了解您市场的局部认证物业管理公司匹配。",
      "我们的仪表板让您实时跟踪租金支付、维修工单和租住状态，即使您身在外地或海外管理也没有问题。",
    ],
    bullets: ["租金收取和欠款管理", "维修协调和承包商网络", "带照片报告的定期物业检查", "月末财务报告", "房业管理仪表板（单套和多套）"],
    cta: { label: "获取物业管理服务", href: "/tenant-placement" },
    accent: "var(--green)",
  },
  {
    id: "legal-advice",
    icon: "⚖️",
    title: "法律咨询与驱逐准备",
    tagline: "了解您的权利。自信地行动。",
    body: [
      "应对房东和租户委员会（LTB）或省级裁判所的程序可能令人生畏。我们的房地产律师和辅助法律师合作伙伴网络，就发注通知（N4、N5、N12）、提交申请和听证准备提供通俗易懂的指导。",
      "我们不替代正式法律顾问——我们帮助您理解流程，让您做好准备再入场。我们平台上大多数初证和以固定费用提供。",
    ],
    bullets: ["通知准备（N4、N5、N12、N13及等效通知）", "LTB申请指导", "听证准备和文件清单", "转介持牌辅助法律师和房地产律师", "纠纷解决支持"],
    cta: { label: "获取免费咨询", href: "/contact" },
    accent: "#9b59b6",
  },
];

export default function LandlordsServicesPage() {
  const { t, lang } = useLanguage();
  const ls = t.landlordServices;
  const SERVICES = lang === 'zh' ? SERVICES_ZH : SERVICES_EN;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            {ls.heroBadge}
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            {ls.heroTitle} <span style={{ color: "var(--accent)" }}>{ls.heroTitleAccent}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>
            {ls.heroSub}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {SERVICES.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "9px 18px", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                {s.icon} {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Service sections */}
      {SERVICES.map((s, i) => (
        <section key={s.id} id={s.id} style={{ padding: "clamp(60px,8vw,100px) 24px", background: i % 2 === 0 ? "var(--cream)" : "#fff", scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 56, alignItems: "center" }}>
            <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>{s.icon}</div>
              <div style={{ display: "inline-block", background: s.accent, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>{ls.landlordServiceBadge}</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3.5vw,2.4rem)", color: "var(--dark)", marginBottom: 10, lineHeight: 1.25 }}>{s.title}</h2>
              <p style={{ color: s.accent, fontWeight: 600, marginBottom: 20, fontSize: "1.05rem" }}>{s.tagline}</p>
              {s.body.map((para, j) => <p key={j} style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 16 }}>{para}</p>)}
              <Link href={s.cta.href} style={{ display: "inline-block", background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, marginTop: 8 }}>
                {s.cta.label} →
              </Link>
            </div>
            <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: `2px solid ${s.accent}20` }}>
                <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 18, fontSize: 15 }}>{ls.whatsIncluded}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {s.bullets.map(b => (
                    <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "var(--mid)", fontSize: 14, lineHeight: 1.5 }}>
                      <span style={{ color: s.accent, fontWeight: 800, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section style={{ background: "var(--accent)", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>{ls.ctaTitle}</h2>
        <p style={{ color: "rgba(255,255,255,0.82)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontSize: "1.05rem" }}>{ls.ctaSub}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing" style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>{ls.postProperty}</Link>
          <Link href="/contact" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.4)" }}>{ls.speakAdvisor}</Link>
        </div>
      </section>
    </main>
  );
}
