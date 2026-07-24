"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { SHOW_LISTINGS } from "@/lib/features";

const SECTIONS_EN = [
  {
    id: "purchasing",
    icon: "🔑",
    color: "#4a90d9",
    title: "Purchasing Guidance",
    tagline: "Buy smart, not fast.",
    paras: [
      "The Canadian real estate market moves quickly -- but making an uninformed offer is a risk you do not need to take. Our purchasing guidance gives first-time buyers and experienced investors alike the knowledge to act confidently.",
      "We walk you through condition of finance clauses, home inspection considerations, offer strategies in competitive markets, and the full closing process from accepted offer to keys in hand.",
    ],
    features: ["First-time buyer resources & FHSA guide", "Offer strategy for competitive markets", "Home inspection checklist", "Closing cost estimator", "Lawyer & notary referrals"],
  },
  {
    id: "mortgage",
    icon: "💰",
    color: "var(--green)",
    title: "1st thing first - Get A Mortgage Pre-Approval",
    tagline: "Rates, terms & lenders -- simplified.",
    paras: [
      "Understanding your mortgage options can save you tens of thousands of dollars over the life of a loan. Our mortgage guidance hub explains the difference between fixed and variable rates, open and closed terms, stress test requirements, and how to compare lenders effectively.",
      "We partner with licensed mortgage brokers across Canada who can access dozens of lenders in a single application -- and many offer a no-fee service, paid by the lender.",
    ],
    features: ["Fixed vs variable rate breakdown", "Stress test calculator", "CMHC insurance guide", "Mortgage broker referrals (no fee)", "Renewal & refinance advice"],
  },
  {
    id: "renovation",
    icon: "🔨",
    color: "#e67e22",
    title: "Renovation & Maintenance",
    tagline: "Protect and grow your investment.",
    paras: [
      "Whether you are buying a fixer-upper or maintaining a long-held property, smart renovation decisions can significantly boost your home's resale value. We guide you on which improvements offer the best return on investment in the current Canadian market.",
      "Our maintenance calendar helps homeowners stay on top of seasonal upkeep -- preventing costly repairs down the line and keeping the property in top condition for eventual resale.",
    ],
    features: ["ROI-ranked renovation guide (kitchen, bath, curb appeal)", "Seasonal maintenance checklist", "Contractor vetting tips", "Permit & zoning guidance", "Energy efficiency upgrade resources"],
  },
  {
    id: "selling",
    icon: "🏷️",
    color: "var(--accent)",
    title: "House Selling Guidance",
    tagline: "Sell faster and for more.",
    paras: [
      "Selling a home is one of the largest financial decisions most Canadians will ever make. Our selling guidance service gives you a clear, step-by-step roadmap from understanding your local market to accepting an offer and closing the deal.",
      "We help you prepare a competitive listing strategy, understand comparable sales, time your listing for maximum exposure, and negotiate with confidence.",
    ],
    features: ["Comparative Market Analysis (CMA)", "Listing strategy & timing advice", "Professional photography checklist", "Staging tips & presentation guide", "Negotiation support & offer review"],
  },
];

const SECTIONS_ZH = [
  {
    id: "purchasing",
    icon: "🔑",
    color: "#4a90d9",
    title: "购房指导",
    tagline: "明智购房，而非仓促行事。",
    paras: [
      "加拿大房地产市场变化快速——但在信息不足的情况下出价是不必要的风险。我们的购房指导为首次购房者和经验丰富的投资者提供自信行动所需的知识。",
      "我们将引导您了解融资条件条款、房屋检查注意事项、竞争性市场中的出价策略，以及从接受报价到拿到钥匙的完整成交流程。",
    ],
    features: ["首次购房者资源和FHSA指南", "竞争性市场出价策略", "房屋检查清单", "成交费用估算", "律师和公证人推荐"],
  },
  {
    id: "mortgage",
    icon: "💰",
    color: "var(--green)",
    title: "第一步：获取贷款预批",
    tagline: "利率、条款和贷款方——简单明了。",
    paras: [
      "了解您的贷款选择可以在贷款期内为您节省数万美元。我们的贷款指导中心解释固定和浮动利率的区别、开放和封闭条款、压力测试要求，以及如何有效比较贷款方。",
      "我们与全加拿大的持牌抵押经纪合作，他们可以通过单次申请接触到数十家贷款方——许多提供无费服务，由贷款方支付。",
    ],
    features: ["固定与浮动利率解析", "压力测试计算器", "CMHC保险指南", "抵押经纪推荐（免费）", "续约和再融资建议"],
  },
  {
    id: "renovation",
    icon: "🔨",
    color: "#e67e22",
    title: "装修与维护",
    tagline: "保护和增值您的投资。",
    paras: [
      "无论您是购买翻修房还是维护长期持有的房产，明智的装修决策可以显著提升您房屋的转售价值。我们指导您了解在当前加拿大市场上哪些改善提供最佳投资回报。",
      "我们的维护日历帮助房主跟上季节性保养——防止未来代价高昂的维修，并保持房产在最终转售时处于最佳状态。",
    ],
    features: ["按投资回报率排名的装修指南（厨房、浴室、外观）", "季节性维护清单", "承包商审查技巧", "许可证和分区指导", "节能升级资源"],
  },
  {
    id: "selling",
    icon: "🏷️",
    color: "var(--accent)",
    title: "售房指导",
    tagline: "更快出售，获得更高价格。",
    paras: [
      "出售房屋是大多数加拿大人一生中最重要的财务决策之一。我们的售房指导服务为您提供清晰的分步路线图，从了解本地市场到接受报价并完成交易。",
      "我们帮助您制定有竞争力的挂牌策略，了解可比销售情况，为最大曝光度确定挂牌时机，以及自信地进行谈判。",
    ],
    features: ["比较市场分析（CMA）", "挂牌策略和时机建议", "专业摄影清单", "布置技巧和展示指南", "谈判支持和报价审查"],
  },
];

export default function BuyersSellersPage() {
  const { t, lang } = useLanguage();
  const bs = t.buyersSellers;
  const SECTIONS = lang === 'zh' ? SECTIONS_ZH : SECTIONS_EN;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1c1c2e 0%, #2d1b3d 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            {bs.heroBadge}
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            {bs.heroTitle} <span style={{ color: "var(--accent)" }}>{bs.heroTitleAccent}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 36px" }}>
            {bs.heroSub}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 500 }}>
                {s.icon} {s.id === 'mortgage' ? (lang === 'zh' ? '贷款' : 'Mortgage') : s.title.split(" ")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} style={{ padding: "clamp(60px,8vw,100px) 24px", background: i % 2 === 0 ? "var(--cream)" : "#fff", scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 52, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3.5vw,2.3rem)", color: "var(--dark)", marginBottom: 10, lineHeight: 1.25 }}>{s.title}</h2>
              <p style={{ color: s.color, fontWeight: 600, fontSize: "1.05rem", marginBottom: 18 }}>{s.tagline}</p>
              {s.paras.map((p, j) => <p key={j} style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 14 }}>{p}</p>)}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                {s.id === 'mortgage' && (
                  <a href="https://docs.google.com/forms/d/e/1FAIpQLScB8sezPbDQ8uawN-MlFSWfdP7E4ZrHhxlcbpqI4d68vtNlKQ/viewform" target="_blank" rel="noopener noreferrer" style={{ background: s.color, color: "#fff", textDecoration: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}>{bs.getPreApproval}</a>
                )}
                {SHOW_LISTINGS && s.id !== 'mortgage' && (
                  <Link href="/buy" style={{ background: s.color, color: "#fff", textDecoration: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 700, fontSize: 14 }}>{bs.browseListings}</Link>
                )}
                <Link href="/contact" style={{ background: "var(--cream)", color: "var(--dark)", textDecoration: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 600, fontSize: 14, border: "1px solid rgba(0,0,0,0.12)" }}>{bs.getAdvice}</Link>
              </div>
            </div>
            <div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "30px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: `2px solid ${s.color}25` }}>
                <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 16, fontSize: 15 }}>{bs.whatYouGet}</div>
                {s.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f5f2ed", fontSize: 14, color: "var(--mid)" }}>
                    <span style={{ color: s.color, fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section style={{ background: "var(--dark)", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>{bs.ctaTitle}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>{bs.ctaSub}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/contact" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>{bs.bookFreeConsultation}</Link>
          <Link href="/knowledge-hub/guides" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>{bs.readGuides}</Link>
        </div>
      </section>
    </main>
  );
}
