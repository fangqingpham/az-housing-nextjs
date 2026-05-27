"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const TEAM = [
  { name: "Katie Pham",  role: "Founder & Mortgage Agent",             initial: "KP", bg: "var(--accent)", bio: "Licensed # M26000130. Strong experience in Canadian residential & commercial Mortgages, Business Loans, HLOC, and more. Built A-Z to make the market work for everyone, not just insiders." },
  { name: "Bill Ngo",      role: "Property Manager",             initial: "BN", bg: "#4a90d9",       bio: "Certified Property Manager (CPM), long-term experience in managing properties and tenant placement, always standby whenever in need." },
  { name: "Alex Whites",       role: "Head of Landlord Services",    initial: "PN", bg: "var(--green)",  bio: "Leads landlord-focused services, supporting property owners with tenant placement, screening, leasing coordination, property management support, and practical rental guidance to help them rent with confidence and reduce operational stress." },
  { name: "Yuan Zhou",    role: "Head of Buyer/Seller Support", initial: "YZ", bg: "#9b59b6",       bio: "Licensed # 5049011. Licensed real estate salesperson in Ontario and has many years experience home buying, selling, renting, as well as investment strategy." },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const a = t.about;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(70px,10vw,120px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
              {a.badge}
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 20 }}>
              {a.heroTitle}{" "}
              <span style={{ color: "var(--accent)" }}>{a.heroTitleAccent}</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: 16 }}>
              {a.heroP1}
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: 32 }}>
              {a.heroP2}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/map-search" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15 }}>{a.browseListings}</Link>
              <Link href="/contact"    style={{ background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>{a.getInTouch}</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { val: "1K+",  lab: a.activeListings },
              { val: "85K+", lab: a.monthlyVisitors },
              { val: "4.8★", lab: a.userRating },
              { val: "Free", lab: a.basicListingTier },
            ].map(s => (
              <div key={s.lab} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--accent)", fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: "#fff", padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 16 }}>{a.ourMission}</h2>
          <p style={{ color: "var(--mid)", fontSize: "1.1rem", lineHeight: 1.85 }}>{a.missionBody}</p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 40, textAlign: "center" }}>{a.whatWeStandFor}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 24 }}>
            {a.values.map(v => (
              <div key={v.title} style={{ background: "#fff", borderRadius: 14, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--dark)", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 40, textAlign: "center" }}>{a.meetTheTeam}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 24 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ background: "#fff", borderRadius: 14, padding: "28px 22px", boxShadow: "0 2px 14px rgba(0,0,0,0.07)", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: m.bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, margin: "0 auto 16px" }}>{m.initial}</div>
                <div style={{ fontWeight: 700, color: "var(--dark)", fontSize: 16, marginBottom: 4 }}>{m.name}</div>
                <div style={{ color: m.bg, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{m.role}</div>
                <p style={{ color: "var(--mid)", fontSize: 13, lineHeight: 1.65 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--dark)", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>{a.readyToStart}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>{a.readyBody}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>{a.createAccount}</Link>
          <Link href="/contact"       style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>{a.contactTeam}</Link>
        </div>
      </section>
    </main>
  );
}
