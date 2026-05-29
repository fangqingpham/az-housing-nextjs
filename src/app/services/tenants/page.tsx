"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function TenantsServicesPage() {
  const { t } = useLanguage();
  const ts = t.tenantServices;

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

  const FEATURES = [
    { icon: "🔒", title: ts.feature1Title, body: ts.feature1Body },
    { icon: "📬", title: ts.feature2Title, body: ts.feature2Body },
    { icon: "📅", title: ts.feature3Title, body: ts.feature3Body },
    { icon: "⚡", title: ts.feature4Title, body: ts.feature4Body },
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
            <a href="#contact-landlords" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 500 }}>{ts.contactLandlords}</a>
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
            <Link href="/map-search" style={{ background: "#4a90d9", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 700, fontSize: 15 }}>{ts.searchOnMap}</Link>
            <Link href="/rent" style={{ background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 600, fontSize: 15 }}>{ts.browseRentals}</Link>
            <Link href="/buy" style={{ background: "var(--cream)", color: "var(--dark)", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(0,0,0,0.12)" }}>{ts.browseForSale}</Link>
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

      {/* Contact Landlords */}
      <section id="contact-landlords" style={{ padding: "clamp(60px,8vw,100px) 24px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 56, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 14 }}>{ts.contactLandlordsTitle}</h2>
            <p style={{ color: "#4a90d9", fontWeight: 600, marginBottom: 18 }}>{ts.contactLandlordsTagline}</p>
            <p style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 16 }}>{ts.contactLandlordsP1}</p>
            <p style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 24 }}>{ts.contactLandlordsP2}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/auth/register" style={{ background: "#4a90d9", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 700, fontSize: 14 }}>{ts.createFreeAccount}</Link>
              <Link href="/map-search" style={{ background: "var(--cream)", color: "var(--dark)", textDecoration: "none", borderRadius: 10, padding: "12px 26px", fontWeight: 600, fontSize: 14, border: "1px solid rgba(0,0,0,0.12)" }}>{ts.browseListings}</Link>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 4, fontSize: 14 }}>{f.title}</div>
                  <div style={{ color: "var(--mid)", fontSize: 13, lineHeight: 1.6 }}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#4a90d9", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>{ts.ctaTitle}</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>{ts.ctaSub}</p>
        <Link href="/map-search" style={{ background: "#fff", color: "#4a90d9", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 800, fontSize: 16 }}>{ts.startSearching}</Link>
      </section>
    </main>
  );
}
