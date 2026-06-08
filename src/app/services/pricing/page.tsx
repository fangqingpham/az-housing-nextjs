"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

/* ─── Package data ─────────────────────────────────────────── */

const PACKAGES_EN = [
  {
    id: "az-private-leasing",
    badge: "STRESS-FREE RENTING",
    title: "A-Z Private Leasing Package",
    price: "$995",
    priceNote: "flat fee",
    accent: "var(--accent)",
    tagline: "Full-service private leasing — from marketing to signed lease.",
    summary: [
      "Our most popular package for landlords who want to stay off-MLS while still getting professional-grade leasing support. We handle everything from advertising to lease execution.",
      "Full Refund if Tenant Default Payment **",
    ],
    sections: [
      {
        heading: "Marketing & Advertising",
        items: [
          "Listing on A-Z Housing Solutions website",
          "Listing on Kijiji",
          "Listing on Facebook Marketplace",
          "Posting in selected Facebook housing groups",
          "Listing on Rentals.ca, where applicable",
          "Applicant inquiries and communication",
          "Pre-qualification and scheduling coordination",
        ],
      },
      {
        heading: "Tenant Screening (up to 5 applicants)",
        subNote: "Additional applicant screening: $29/applicant",
        items: [
          "Credit check",
          "Identity verification",
          "Bank account verification",
          "Fraud-risk screening",
          "Income and employment verification",
          "Previous landlord and reference checks",
          "Openroom and public filing search, where available",
        ],
      },
      {
        heading: "Lease Preparation",
        items: [
          "Ontario Standard Lease preparation",
          "RTA-compliant lease execution support",
          "Rental agreement review and signing coordination",
        ],
      },
      {
        heading: "Compliance Support",
        items: [
          "30-minute complimentary consultation with an independent licensed paralegal",
          "Access to landlord forms and templates through landlord portal",
          "Referral to experienced licensed paralegal when needed",
          "90-Day Rent Administration and Payment Monitoring",
        ],
      },
    ],
    addons: [
      { name: "MLS listing by Realtor (Listing only)", price: "$199" },
      { name: "Professional photography", price: "$149" },
      { name: "In-person showing - face-to-face screening for suitability assessment (max 5 times)", price: "$399/GTA only" },
      { name: "Key handover and move-in orientation", price: "$75" },
      { name: "Move-in inspection report", price: "$99" },
      { name: "Extra applicant screening after first 5 applicants", price: "$29/applicant" },
    ],
    disclaimer:
      "This package does not include MLS/Realtor.ca listing, Realtor representation, in-person showings, photography, or key handover unless added separately. ** Conditions apply: if an A-Z-approved tenant remains in rent default for 45 or more consecutive calendar days within the first 90 calendar days of the lease start date, the Client may be eligible for a full refund of the A-Z Private Leasing Package. For more details, please contact Leasing Agent.",
  },
  {
    id: "realtor-mls-leasing",
    badge: "Best for max exposure",
    title: "MLS Listing Full Package",
    price: "1 Month's Rent",
    priceNote: "commission",
    accent: "#4a90d9",
    tagline: "Maximum MLS/Realtor.ca exposure with licensed Realtor support.",
    summary: [
      "Best for landlords who want maximum exposure through MLS/Realtor.ca and licensed Realtor support. Aligned with the common Toronto/GTA leasing model where landlords pay a commission equal to one month's rent, typically split between the listing agent and the cooperating tenant's agent.",
    ],
    sections: [
      {
        heading: "Realtor/MLS Marketing",
        items: [
          "MLS listing through a licensed Realtor",
          "Realtor.ca exposure",
          "Cooperation with buyer/tenant agents",
          "Realtor inquiry handling",
          "Listing updates and status changes",
          "Market rent guidance",
        ],
      },
      {
        heading: "Leasing Support",
        items: [
          "Tenant and agent inquiry management",
          "Showing coordination through Realtor channels",
          "Offer-to-lease review and negotiation support",
          "Communication with cooperating agents",
          "Applicant package review",
          "Lease signing coordination",
        ],
      },
      {
        heading: "Tenant Screening Coordination",
        items: [
          "Collection and review of rental applications",
          "Credit, income, employment, ID, and reference review",
          "Applicant summary for landlord decision-making",
        ],
      },
      {
        heading: "Lease & Closing",
        items: [
          "Ontario Standard Lease preparation or coordination",
          "First month's rent and lawful last month's rent deposit coordination",
          "Final listing status update",
          "Signed lease and document delivery to landlord",
        ],
      },
    ],
    addons: [],
    disclaimer: "",
  },
  {
    id: "property-management",
    badge: "Ongoing service",
    title: "Property Management Service",
    price: "$120/month",
    priceNote: "per property (up to 3 rooms)",
    accent: "var(--green, #2e7d52)",
    tagline: "Hands-off ownership — we handle everything, every month.",
    summary: [
      "For 1 property with up to 3 rooms. Each extra room is +$30/month. Save with a subscription: Quarterly $360 · 6-Month $600 · Annual $1,200.",
    ],
    sections: [
      {
        heading: "Monthly Management Includes",
        items: [
          "Monthly rent collection",
          "Landlord disbursement",
          "Tenant communication for routine matters",
          "24/7 emergency call coordination",
          "Maintenance and repair coordination with technician referrals",
          "Move-in and move-out inspection at tenancy change",
          "One mid-term inspection per year",
          "Maintenance records and inspection reports",
          "Lease document storage",
          "Compliance recordkeeping",
          "First month's rent and lawful last month's rent deposit support, where applicable",
        ],
      },
    ],
    addons: [
      { name: "Urgent or same-day inspection", price: "$149/visit" },
    ],
    disclaimer: "",
    pricingTable: [
      { label: "Monthly", price: "$120/mo" },
      { label: "Quarterly", price: "$360" },
      { label: "½ Year", price: "$600" },
      { label: "Annual", price: "$1,200" },
    ],
  },
];

const PACKAGES_ZH = [
  {
    id: "az-private-leasing",
    badge: "无忧租赁",
    title: "A-Z私人租赁套餐",
    price: "$995",
    priceNote: "统一收费",
    accent: "var(--accent)",
    tagline: "全套私人租赁服务——从营销到签署租约。",
    summary: [
      "我们最受欢迎的套餐，适合想要在MLS平台以外同时获得专业租赁支持的房东。我们处理从广告宣传到租约执行的一切。",
      "租户违约全额退款 **",
    ],
    sections: [
      {
        heading: "营销与广告",
        items: [
          "在A-Z Housing Solutions网站上挂牌",
          "在Kijiji上挂牌",
          "在Facebook Marketplace上挂牌",
          "在精选Facebook租房群组中发布",
          "在Rentals.ca上挂牌（适用时）",
          "申请人咨询和沟通",
          "预资格审查和排期协调",
        ],
      },
      {
        heading: "租户筛查（最多5名申请人）",
        subNote: "额外申请人筛查：每人$29",
        items: [
          "信用查询",
          "身份验证",
          "银行账户验证",
          "欺诈风险筛查",
          "收入和就业核实",
          "前房东和推荐人查核",
          "Openroom和公共记录查询（如适用）",
        ],
      },
      {
        heading: "租约准备",
        items: [
          "安省标准租约准备",
          "符合RTA的租约执行支持",
          "租赁协议审查和签署协调",
        ],
      },
      {
        heading: "合规支持",
        items: [
          "与独立持牌辅助法律师30分钟免费咨询",
          "通过房东门户获取房东表格和模板",
          "需要时转介经验丰富的持牌辅助法律师",
          "90天租金管理和付款监控",
        ],
      },
    ],
    addons: [
      { name: "经纪人MLS挂牌（仅挂牌）", price: "$199" },
      { name: "专业摄影", price: "$149" },
      { name: "现场看房——面对面适合性评估（最多5次，仅限GTA）", price: "$399" },
      { name: "交钥匙和入住说明", price: "$75" },
      { name: "入住检查报告", price: "$99" },
      { name: "前5名申请人后的额外筛查", price: "$29/人" },
    ],
    disclaimer:
      "本套餐不包括MLS/Realtor.ca挂牌、经纪人代理、现场看房、摄影或交钥匙服务（除非单独添加）。** 条件适用：如果经A-Z批准的租户在租约开始后前90个日历日内连续45个或以上日历日拖欠租金，客户可能有资格获得A-Z私人租赁套餐的全额退款。详情请联系租赁代理。",
  },
  {
    id: "realtor-mls-leasing",
    badge: "最大曝光度",
    title: "MLS全套挂牌套餐",
    price: "一个月租金",
    priceNote: "佣金",
    accent: "#4a90d9",
    tagline: "通过MLS/Realtor.ca获得最大曝光，并有持牌经纪人支持。",
    summary: [
      "适合希望通过MLS/Realtor.ca获得最大曝光度和持牌经纪人支持的房东。与多伦多/GTA常见租赁模式一致，房东支付相当于一个月租金的佣金，通常在挂牌代理和合作租客代理之间分配。",
    ],
    sections: [
      {
        heading: "经纪人/MLS营销",
        items: [
          "通过持牌经纪人进行MLS挂牌",
          "Realtor.ca曝光",
          "与买家/租客代理合作",
          "经纪人询问处理",
          "挂牌更新和状态变更",
          "市场租金指导",
        ],
      },
      {
        heading: "租赁支持",
        items: [
          "租客和代理询问管理",
          "通过经纪人渠道协调看房",
          "报价转租约审查和谈判支持",
          "与合作代理的沟通",
          "申请人资料审查",
          "租约签署协调",
        ],
      },
      {
        heading: "租户筛查协调",
        items: [
          "租赁申请的收集和审查",
          "信用、收入、就业、身份和推荐人审查",
          "供房东决策的申请人摘要",
        ],
      },
      {
        heading: "租约和成交",
        items: [
          "安省标准租约准备或协调",
          "首月租金和合法最后一个月租金押金协调",
          "最终挂牌状态更新",
          "签署的租约和文件交付给房东",
        ],
      },
    ],
    addons: [],
    disclaimer: "",
  },
  {
    id: "property-management",
    badge: "持续服务",
    title: "物业管理服务",
    price: "$120/月",
    priceNote: "每套房产（最多3间）",
    accent: "var(--green, #2e7d52)",
    tagline: "放手式拥有——我们每月处理一切。",
    summary: [
      "适用于1套最多3间房的房产。每增加1间+$30/月。订阅节省：季度$360 · 半年$600 · 年度$1,200。",
    ],
    sections: [
      {
        heading: "每月管理包含",
        items: [
          "每月租金收取",
          "房东付款",
          "日常事务租客沟通",
          "24/7紧急电话协调",
          "维修和修缮协调及技术人员推荐",
          "租住变更时的入住和退租检查",
          "每年一次中期检查",
          "维护记录和检查报告",
          "租赁文件存储",
          "合规记录",
          "首月租金和合法最后一个月租金押金支持（如适用）",
        ],
      },
    ],
    addons: [
      { name: "紧急或当日检查", price: "$149/次" },
    ],
    disclaimer: "",
    pricingTable: [
      { label: "月付", price: "$120/月" },
      { label: "季度", price: "$360" },
      { label: "半年", price: "$600" },
      { label: "年度", price: "$1,200" },
    ],
  },
];

/* ─── Modal component ──────────────────────────────────────── */

function DetailModal({ pkg, onClose, px }: { pkg: typeof PACKAGES_EN[0]; onClose: () => void; px: any }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, maxWidth: 680, width: "100%",
          maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
      >
        {/* Modal header */}
        <div style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", borderRadius: "20px 20px 0 0", padding: "28px 32px", color: "#fff", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "inline-block", background: "rgba(196,162,90,0.2)", border: "1px solid rgba(196,162,90,0.4)", color: "var(--accent)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "4px 14px", marginBottom: 10 }}>
                {pkg.badge}
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem,3vw,1.8rem)", marginBottom: 6 }}>{pkg.title}</h2>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)" }}>
                {pkg.price} <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>— {pkg.priceNote}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}
              aria-label="Close"
            >×</button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: "28px 32px" }}>
          {pkg.summary.map((p, i) => (
            i === 1 && pkg.id === "az-private-leasing" ? (
              <p key={i} style={{ color: "var(--dark)", fontWeight: 700, lineHeight: 1.8, marginBottom: 16, fontSize: 14 }}>
                {p.replace(" **", "")} <span style={{ color: "var(--accent)", fontWeight: 900 }}>**</span>
              </p>
            ) : (
              <p key={i} style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 16, fontSize: 14 }}>{p}</p>
            )
          ))}

          {/* Pricing table (Property Management) */}
          {"pricingTable" in pkg && pkg.pricingTable && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 12, fontSize: 14 }}>{px.subscriptionOptions}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
                {pkg.pricingTable.map(row => (
                  <div key={row.label} style={{ background: "#f7f4ef", borderRadius: 10, padding: "12px 14px", textAlign: "center", border: "1px solid rgba(0,0,0,0.07)" }}>
                    <div style={{ fontSize: 11, color: "var(--mid)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{row.label}</div>
                    <div style={{ fontWeight: 800, color: "var(--dark)", fontSize: 16 }}>{row.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service sections */}
          {pkg.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 8, fontSize: 14, borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 6 }}>
                {sec.heading}
              </div>
              {"subNote" in sec && sec.subNote && (
                <p style={{ fontSize: 12, color: "var(--accent)", fontStyle: "italic", marginBottom: 8 }}>{sec.subNote}</p>
              )}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {sec.items.map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--mid)", fontSize: 13.5, lineHeight: 1.6 }}>
                    <span style={{ color: pkg.accent, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Add-ons */}
          {pkg.addons.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 10, fontSize: 14, borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 6 }}>
                {px.optionalAddons}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pkg.addons.map(a => (
                  <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f7f4ef", borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ color: "var(--mid)", fontSize: 13.5 }}>{a.name}</span>
                    <span style={{ fontWeight: 700, color: "var(--dark)", fontSize: 13.5, flexShrink: 0, marginLeft: 12 }}>{a.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {pkg.disclaimer && (
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 12.5, color: "#7a6000", lineHeight: 1.7, margin: 0 }}>⚠️ {pkg.disclaimer}</p>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/contact"
            style={{ display: "block", background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 700, fontSize: 14, textAlign: "center", marginTop: 8 }}
          >
            {px.contactForDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */

export default function PricingPage() {
  const [openPkg, setOpenPkg] = useState<typeof PACKAGES_EN[0] | null>(null);
  const { t, lang } = useLanguage();
  const px = t.pricing;
  const PACKAGES = lang === 'zh' ? PACKAGES_ZH : PACKAGES_EN;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            {px.heroBadge}
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            {px.heroTitle}{" "}
            <span style={{ color: "var(--accent)" }}>{px.heroTitleAccent}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            {px.heroSub}
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section style={{ padding: "clamp(60px,8vw,100px) 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 4px 28px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform .18s, box-shadow .18s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.13)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 28px rgba(0,0,0,0.08)";
                }}
              >
                {/* Card header */}
                <div style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", padding: "28px 26px 24px", color: "#fff" }}>
                  <div style={{ display: "inline-block", background: "rgba(196,162,90,0.2)", border: "1px solid rgba(196,162,90,0.4)", color: "var(--accent)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 20, padding: "3px 12px", marginBottom: 14 }}>
                    {pkg.badge}
                  </div>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.1rem,2.5vw,1.45rem)", lineHeight: 1.3, marginBottom: 14 }}>
                    {pkg.title}
                  </h2>
                  <div style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--accent)" }}>
                    {pkg.price}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{pkg.priceNote}</div>
                </div>

                {/* Card body */}
                <div style={{ padding: "24px 26px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <p style={{ color: "var(--mid)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 20 }}>{pkg.tagline}</p>

                  {/* Highlights from first section */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                    {pkg.sections[0].items.slice(0, 5).map(item => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "var(--mid)", fontSize: 13, lineHeight: 1.55 }}>
                        <span style={{ color: pkg.accent, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>{item}
                      </li>
                    ))}
                    {pkg.sections[0].items.length > 5 && (
                      <li style={{ color: "var(--mid)", fontSize: 13, fontStyle: "italic", paddingLeft: 22 }}>
                        + {pkg.sections[0].items.length - 5} more included…
                      </li>
                    )}
                  </ul>

                  {/* Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      onClick={() => setOpenPkg(pkg)}
                      style={{
                        background: "transparent",
                        border: `2px solid ${pkg.accent}`,
                        color: "var(--dark)",
                        borderRadius: 10,
                        padding: "11px 20px",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "background .15s, color .15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = pkg.accent;
                        (e.currentTarget as HTMLElement).style.color = "#fff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--dark)";
                      }}
                    >
                      {px.details}
                    </button>
                    <Link
                      href={pkg.id === "realtor-mls-leasing" ? "/contact" : "/tenant-placement"}
                      style={{
                        display: "block",
                        background: "var(--dark)",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: 10,
                        padding: "11px 20px",
                        fontWeight: 700,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {pkg.id === "az-private-leasing" ? px.orderHere : px.getStarted}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ / note band ── */}
      <section style={{ background: "#fff", padding: "clamp(48px,7vw,80px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.4rem,3vw,2rem)", color: "var(--dark)", marginBottom: 14 }}>
            {px.faqTitle}
          </h2>
          <p style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 28, fontSize: "1rem" }}>
            {px.faqSub}
          </p>
          <Link
            href="/contact"
            style={{ display: "inline-block", background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 36px", fontWeight: 800, fontSize: 15 }}
          >
            {px.bookFreeConsultation}
          </Link>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={{ background: "var(--accent)", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>
          {px.ctaTitle}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.82)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontSize: "1.05rem" }}>
          {px.ctaSub}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing" style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>{px.postProperty}</Link>
          <Link href="/contact" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.4)" }}>{px.contactUs}</Link>
        </div>
      </section>

      {/* ── Detail modal ── */}
      {openPkg && <DetailModal pkg={openPkg} onClose={() => setOpenPkg(null)} px={px} />}
    </main>
  );
}
