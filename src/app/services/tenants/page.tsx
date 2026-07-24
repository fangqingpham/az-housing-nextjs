"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const REALTOR_RENTALS_URL = "https://www.realtor.ca/map#ZoomLevel=10&Center=43.708087%2C-79.376385&LatitudeMax=43.91916&LongitudeMax=-78.53181&LatitudeMin=43.49627&LongitudeMin=-80.22096&view=list&Sort=6-D&PGeoIds=g30_dpz89rm7&GeoName=Toronto%2C%20ON&PropertyTypeGroupID=1&TransactionTypeId=3&PropertySearchTypeId=0&Currency=CAD";
const REALTOR_FOR_SALE_URL = "https://www.realtor.ca/map#ZoomLevel=10&Center=43.708087%2C-79.376385&LatitudeMax=43.91916&LongitudeMax=-78.53181&LatitudeMin=43.49627&LongitudeMin=-80.22096&view=list&Sort=6-D&PGeoIds=g30_dpz89rm7&GeoName=Toronto%2C%20ON&PropertyTypeGroupID=1&TransactionTypeId=2&PropertySearchTypeId=0&Currency=CAD";

const LANDING_ARRANGEMENT = {
  en: {
    navLabel: "Landing Arrangement",
    eyebrow: "For Newcomers from Vietnam",
    title: "Landing Arrangement",
    tagline: "From Vietnam to the GTA — arranged before you arrive.",
    intro: "For individuals and families relocating from Vietnam, we arrange your accommodation and help you settle into the Greater Toronto Area — before and after you land.",
    whyHeading: "Why arrange your home from Vietnam?",
    why: [
      "You can't inspect the home, its condition, or the furniture in person.",
      "You don't know whether the area is safe, lively, or remote.",
      "You can't be sure the landlord truly owns the home — sublet and ownership risks.",
      "Risk of deposit scams using reposted photos of someone else's home.",
    ],
    beforeHeading: "What we arrange before you arrive",
    before: [
      "Verify the landlord via utility bills and City of Toronto ownership records.",
      "Meet and interview the landlord in person.",
      "Live video call so you can view the home from Vietnam.",
      "Advice on room quality, layout, cleanliness, and roommates.",
      "Advice on the location — safety, atmosphere, and distance to where you need to be.",
      "Negotiate the rent for the best price.",
      "Review the lease so you avoid unfavourable terms.",
    ],
    afterNote: "After you arrive: airport pickup, first-day school/workplace intro, banking, photo ID, TTC/Presto setup, and a guided transit tour.",
    cta: "View Landing Arrangement Service →",
    ctaNote: "Available in English & Tiếng Việt",
  },
  zh: {
    navLabel: "落地安置",
    eyebrow: "来自越南的新移民",
    title: "落地安置服务",
    tagline: "从越南到大多伦多地区——在您抵达之前安排妥当。",
    intro: "为从越南搬迁而来的个人和家庭，我们在您抵达大多伦多地区之前和之后，为您安排住所并帮助您安顿下来。",
    whyHeading: "为什么在越南时就安排好住房？",
    why: [
      "您无法亲自查看房屋、房况或家具。",
      "您不了解所在区域是否安全、繁华还是偏僻。",
      "您无法确认房东是否真正拥有该房屋——存在转租和产权风险。",
      "存在利用盗用他人房屋照片骗取押金的诈骗风险。",
    ],
    beforeHeading: "我们在您抵达前为您安排",
    before: [
      "通过水电费账单和多伦多市政产权登记核实房东身份。",
      "亲自联系并面谈房东。",
      "视频通话，让您在越南即可实时看房。",
      "就房间质量、布局、清洁度及室友提供建议。",
      "就地段提供建议——安全性、周边氛围以及与您目的地的距离。",
      "与房东协商租金，争取最优价格。",
      "审阅租约，帮您避开不利条款。",
    ],
    afterNote: "抵达之后：机场接机、首日陪同前往学校/工作单位、开设银行账户、办理身份证件、TTC/Presto 公交卡设置，以及公交导览。",
    cta: "查看落地安置服务 →",
    ctaNote: "提供英文和越南语版本",
  },
} as const;

export default function TenantsServicesPage() {
  const { t, lang } = useLanguage();
  const ts = t.tenantServices;
  const la = LANDING_ARRANGEMENT[lang];

  const STEPS = [
    { n: "1", title: ts.step1Title, body: ts.step1Body },
    { n: "2", title: ts.step2Title, body: ts.step2Body },
    { n: "3", title: ts.step3Title, body: ts.step3Body },
    { n: "4", title: ts.step4Title, body: ts.step4Body },
  ];

  const TIPS = [
    { icon: "📄", tip: ts.tip1 },
    { icon: "📞", tip: ts.tip2 },
    { icon: "💳", tip: ts.tip3 },
    { icon: "🤝", tip: ts.tip4 },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a3a5c 0%, #0f2a46 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(74,144,217,0.2)", border: "1px solid rgba(74,144,217,0.4)", color: "#7ab8e8", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            {ts.heroBadge}
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            {ts.heroTitle} <span style={{ color: "#7ab8e8" }}>{ts.heroTitleAccent}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>
            {ts.heroSub}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#property-search" style={{ background: "#4a90d9", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700 }}>{ts.propertySearch}</a>
            <a href="#landing-arrangement" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 500 }}>{la.navLabel}</a>
          </div>
        </div>
      </section>

      {/* Property Search */}
      <section id="property-search" style={{ padding: "clamp(60px,8vw,100px) 24px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>{ts.propertySearch}</h2>
            <p style={{ color: "var(--mid)", maxWidth: 560, margin: "0 auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
              {ts.searchDescription}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 24, marginBottom: 48 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background: "#fff", borderRadius: 14, padding: "28px 24px", boxShadow: "0 2px 14px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "#4a90d920", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#4a90d9" }}>{s.n}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--dark)", marginBottom: 10, paddingRight: 40 }}>{s.title}</h3>
                <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href={REALTOR_RENTALS_URL} target="_blank" rel="noopener noreferrer" style={{ background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 600, fontSize: 15 }}>{ts.browseRentals}</a>
            <a href={REALTOR_FOR_SALE_URL} target="_blank" rel="noopener noreferrer" style={{ background: "var(--cream)", color: "var(--dark)", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(0,0,0,0.12)" }}>{ts.browseForSale}</a>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section style={{ background: "#fff", padding: "clamp(50px,6vw,80px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", color: "var(--dark)", marginBottom: 28 }}>{ts.tenantTips}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ background: "var(--cream)", borderRadius: 12, padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.icon}</span>
                <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Arrangement (Vietnam → GTA) */}
      <section id="landing-arrangement" style={{ padding: "clamp(60px,8vw,100px) 24px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 56, alignItems: "start" }}>
          <div>
            <div style={{ display: "inline-block", background: "#fff4e0", border: "1px solid #ffd98a", color: "#a86b00", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>{la.eyebrow}</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 12 }}>{la.title}</h2>
            <p style={{ color: "#4a90d9", fontWeight: 600, marginBottom: 18 }}>{la.tagline}</p>
            <p style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 22 }}>{la.intro}</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--dark)", marginBottom: 12 }}>{la.whyHeading}</h3>
            <ul style={{ listStyle: "none", margin: "0 0 26px", padding: 0, display: "grid", gap: 9 }}>
              {la.why.map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--mid)", lineHeight: 1.65, fontSize: 14 }}>
                  <span aria-hidden="true" style={{ color: "#c98a00", fontWeight: 900, flexShrink: 0, marginTop: 1 }}>!</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/landing-arrangement" style={{ background: "#4a90d9", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: 14 }}>{la.cta}</Link>
              <span style={{ color: "var(--mid)", fontSize: 13 }}>{la.ctaNote}</span>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "26px 24px", boxShadow: "0 2px 14px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--dark)", marginBottom: 16 }}>{la.beforeHeading}</h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 11 }}>
              {la.before.map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--mid)", lineHeight: 1.6, fontSize: 14 }}>
                  <span aria-hidden="true" style={{ color: "#1a8f5c", fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.08)", color: "var(--mid)", fontSize: 13, lineHeight: 1.6 }}>{la.afterNote}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#4a90d9", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>{ts.ctaTitle}</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>{ts.ctaSub}</p>
        <Link href="/rent" style={{ background: "#fff", color: "#4a90d9", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 800, fontSize: 16 }}>{ts.startSearching}</Link>
      </section>
    </main>
  );
}
