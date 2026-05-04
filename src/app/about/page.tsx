"use client";

import Link from "next/link";

const TEAM = [
  { name: "Alexandra Zoric",  role: "Co-Founder & CEO",             initial: "AZ", bg: "var(--accent)", bio: "Former mortgage broker with 15 years in Canadian residential real estate. Built A-Z to make the market work for everyone, not just insiders." },
  { name: "Marcus Chen",      role: "Co-Founder & CTO",             initial: "MC", bg: "#4a90d9",       bio: "Full-stack engineer and landlord with properties in Toronto and Vancouver. Obsessed with making property data accessible and useful." },
  { name: "Priya Nair",       role: "Head of Landlord Services",    initial: "PN", bg: "var(--green)",  bio: "Certified Property Manager (CPM) and former LTB hearing officer. Knows tenant-landlord law inside and out." },
  { name: "David Okonkwo",    role: "Head of Buyer/Seller Support", initial: "DO", bg: "#9b59b6",       bio: "Licensed real estate salesperson in Ontario and Alberta. Specialises in first-time buyer education and investment strategy." },
];

const VALUES = [
  { icon: "🤝", title: "Transparency",   body: "We publish market data, pricing, and process guides openly. No hidden agendas, no mystery fees." },
  { icon: "🍁", title: "Canadian-First", body: "Built in Canada, for Canadians. Every guide, tool, and feature reflects the real rules and realities of our market." },
  { icon: "⚖️", title: "Fairness",       body: "We serve landlords, tenants, buyers and sellers equally. Great outcomes come from informed participants on both sides." },
  { icon: "🔒", title: "Privacy",        body: "Your personal information is never sold. We are fully PIPEDA compliant and never share data with third-party advertisers." },
];

const MILESTONES = [
  { year: "2018", label: "Founded in Toronto" },
  { year: "2019", label: "First 1,000 listings" },
  { year: "2021", label: "Expanded to all provinces" },
  { year: "2022", label: "Launched landlord screening tools" },
  { year: "2023", label: "10,000+ active listings" },
  { year: "2024", label: "Knowledge Hub launched" },
  { year: "2025", label: "85,000+ monthly visitors" },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(70px,10vw,120px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
              About A-Z Housing
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 20 }}>
              {"Canada's Platform for the "}
              <span style={{ color: "var(--accent)" }}>Full Property Journey</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: 16 }}>
              A-Z Housing Solutions was founded with one belief: that the Canadian real estate market should work better for everyone. Too many buyers, tenants, and landlords are navigating one of the most complex financial decisions of their lives without adequate support.
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: 32 }}>
              We built a platform that combines verified property listings with real, actionable guidance covering every step from first search to final closing.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/map-search" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15 }}>Browse Listings</Link>
              <Link href="/contact"    style={{ background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>Get in Touch</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { val: "12K+",  lab: "Active Listings" },
              { val: "85K+",  lab: "Monthly Visitors" },
              { val: "10",    lab: "Provinces Covered" },
              { val: "4.8★",  lab: "User Rating" },
              { val: "2018",  lab: "Founded" },
              { val: "Free",  lab: "Basic Listing Tier" },
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
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 16 }}>Our Mission</h2>
          <p style={{ color: "var(--mid)", fontSize: "1.1rem", lineHeight: 1.85 }}>
            To make every stage of the Canadian property journey transparent, informed, and accessible to all. We believe that when buyers, tenants, and landlords are better informed, the entire housing market becomes healthier.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 40, textAlign: "center" }}>What We Stand For</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 24 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{ background: "#fff", borderRadius: 14, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--dark)", marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: "var(--mid)", fontSize: 14, lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: "#fff", padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 40, textAlign: "center" }}>Our Journey</h2>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--accent)", opacity: 0.25 }} />
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 28, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ position: "absolute", left: -38, top: 4, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", border: "2px solid #fff", boxShadow: "0 0 0 2px var(--accent)" }} />
                <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.year}</div>
                <div style={{ color: "var(--dark)", fontSize: 15, fontWeight: 500, paddingTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "clamp(60px,8vw,90px) 24px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 40, textAlign: "center" }}>Meet the Team</h2>
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
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>Ready to get started?</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>Join tens of thousands of Canadians already using A-Z Housing to search, list, and learn.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/register" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>Create Free Account</Link>
          <Link href="/contact"       style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.25)" }}>Contact the Team</Link>
        </div>
      </section>
    </main>
  );
}
