"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Package data ─────────────────────────────────────────── */

const PACKAGES = [
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
    title: "Realtor MLS Full Leasing Package",
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

/* ─── Modal component ──────────────────────────────────────── */

function DetailModal({ pkg, onClose }: { pkg: typeof PACKAGES[0]; onClose: () => void }) {
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
              <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 12, fontSize: 14 }}>Subscription Options</div>
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
                Optional Add-ons
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
            href={pkg.id === "realtor-mls-leasing" ? "/contact" : "/contact"}
            style={{ display: "block", background: "var(--dark)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 700, fontSize: 14, textAlign: "center", marginTop: 8 }}
          >
            {pkg.id === "az-private-leasing" ? "Contact for more details →" : "Contact for more details→"}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */

export default function PricingPage() {
  const [openPkg, setOpenPkg] = useState<typeof PACKAGES[0] | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(60px,10vw,110px) 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,162,90,0.18)", border: "1px solid rgba(196,162,90,0.35)", color: "var(--accent)", fontSize: 16, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "5px 16px", marginBottom: 24 }}>
            Full Refund if Tenant Default 
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 1.2, marginBottom: 18 }}>
            Transparent Pricing,{" "}
            <span style={{ color: "var(--accent)" }}>No Surprises</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            Pay as you go. Choose the package that fits your needs — from a one-time leasing service to ongoing property management.
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
                      Details
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
                      {pkg.id === "az-private-leasing" ? "Order Here →" : "Get Started →"}
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
            Not sure which package is right for you?
          </h2>
          <p style={{ color: "var(--mid)", lineHeight: 1.8, marginBottom: 28, fontSize: "1rem" }}>
            Our team is happy to walk you through the options based on your property type, timeline, and goals. Reach out for a free, no-obligation consultation.
          </p>
          <Link
            href="/contact"
            style={{ display: "inline-block", background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 36px", fontWeight: 800, fontSize: 15 }}
          >
            Book a Free Consultation →
          </Link>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={{ background: "var(--accent)", padding: "clamp(50px,7vw,80px) 24px", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 14 }}>
          Ready to get started?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.82)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", fontSize: "1.05rem" }}>
          List your property or sign up for property management — all from your landlord portal.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing" style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 800, fontSize: 15 }}>Post a Property</Link>
          <Link href="/contact" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "13px 32px", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.4)" }}>Contact Us</Link>
        </div>
      </section>

      {/* ── Detail modal ── */}
      {openPkg && <DetailModal pkg={openPkg} onClose={() => setOpenPkg(null)} />}
    </main>
  );
}
