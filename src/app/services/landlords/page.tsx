"use client";

import Link from "next/link";

const SERVICES = [
  {
    id: "tenant-screening",
    icon: "🔍",
    title: "Tenant Screening",
    tagline: "Find reliable, responsible tenants every time.",
    body: [
      "Our tenant screening service gives landlords a comprehensive view of every applicant before a lease is signed. We combine credit history analysis, employment verification, rental reference checks, and background screening into a single, easy-to-read report.",
      "Screening through A-Z Housing is fully compliant with provincial privacy legislation (PIPEDA / PIPA), meaning you can collect and use applicant information with confidence. Reports are delivered within 24-48 hours, keeping your vacancy period short.",
    ],
    bullets: ["Full credit report & score", "Rental history & landlord references", "Employment & income verification", "Identity & background check", "PIPEDA / PIPA compliant"],
    cta: { label: "Start Screening Applicants", href: "/contact" },
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
    cta: { label: "Connect with a Manager", href: "/contact" },
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
    cta: { label: "Book a Consultation", href: "/contact" },
    accent: "#9b59b6",
  },
];

export default function LandlordsServicesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            Services for Landlords
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            Everything You Need to Be a <span style={{ color: "var(--accent)" }}>Great Landlord</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>
            From finding the right tenant to handling difficult situations, A-Z Housing supports you at every stage of your rental journey.
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
              <div style={{ display: "inline-block", background: s.accent, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", borderRadius: 20, padding: "4px 14px", marginBottom: 16 }}>Landlord Service</div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3.5vw,2.4rem)", color: "var(--dark)", marginBottom: 10, lineHeight: 1.25 }}>{s.title}</h2>
              <p style={{ color: s.accent, fontWeight: 600, marginBottom: 20, fontSize: "1.05rem" }}>{s.tagline}</p>
              {s.body.map((para, j) => <p key={j} style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 16 }}>{para}</p>)}
              <Link href={s.cta.href} style={{ display: "inline-block", background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, marginTop: 8 }}>
                {s.cta.label} →
              </Link>
            </div>
            <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: `2px solid ${s.accent}20` }}>
                <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 18, fontSize: 15 }}>{"What's included:"}</div>
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
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>Ready to manage your property with confidence?</h2>
        <p style={{ color: "rgba(255,255,255,0.82)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontSize: "1.05rem" }}>List your property for free and access all landlord tools from your dashboard.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing" style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>Post a Property</Link>
          <Link href="/contact"      style={{ background: "rgba(255,255,255,0.18)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.4)" }}>Speak to an Advisor</Link>
        </div>
      </section>
    </main>
  );
}
