"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  { icon: "🏠", title: "Easy Listing Creation",    description: "Post a property in minutes with our guided form. Upload photos, set pricing, and go live instantly." },
  { icon: "📊", title: "Performance Dashboard",    description: "Track views, enquiries, and saves in real time. Know exactly how your listing is performing." },
  { icon: "💬", title: "Tenant Messaging",         description: "Receive and manage enquiries directly in your dashboard. No missed leads, no lost messages." },
  { icon: "📸", title: "Photo Management",         description: "Upload up to 20 high-resolution photos per listing. Showcase every room in its best light." },
  { icon: "🔍", title: "Wide Reach",               description: "Your listings appear in search results across all of Canada. Reach thousands of active buyers and renters." },
  { icon: "⚡", title: "Fast Approvals",            description: "Our team reviews listings quickly. Most go live within a few hours of submission." },
];

const PLANS = [
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

const TESTIMONIALS = [
  { quote: "I listed my condo and had three qualified viewings booked within the first week. The process was incredibly smooth.", name: "Sarah M.", role: "Private Landlord, Toronto",    avatar: "S" },
  { quote: "Managing 8 rental units used to be chaotic. Now everything lives in one dashboard and I never miss an enquiry.",     name: "David K.", role: "Property Investor, Vancouver", avatar: "D" },
  { quote: "Our agency switched to A-Z six months ago and we have cut our listing admin time in half. The team support is excellent.", name: "Priya R.", role: "Agency Director, Calgary",    avatar: "P" },
];

const FAQS = [
  { q: "How long does it take for my listing to go live?",    a: "Most listings are reviewed and approved within 2-4 hours during business hours. You will receive an email confirmation as soon as your listing is live." },
  { q: "Can I edit my listing after it is published?",        a: "Yes. You can update photos, pricing, description, and availability at any time from your dashboard. Changes go live immediately." },
  { q: "Is my contact information kept private?",             a: "Absolutely. Prospective tenants and buyers send enquiries through our platform. Your email and phone number are never displayed publicly." },
  { q: "What types of properties can I list?",                a: "We support all residential property types: condos, houses, townhouses, basements, and commercial spaces. Both for-sale and for-rent listings are welcome." },
  { q: "Can I upgrade or downgrade my plan?",                 a: "Yes, you can change plans at any time. Upgrades take effect immediately; downgrades apply at the end of your current billing period." },
];

export default function LandlordPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark) 0%, #1a2a4a 100%)", color: "#fff", padding: "clamp(80px,12vw,140px) 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <span style={{ display: "inline-block", background: "rgba(196,162,90,0.2)", border: "1px solid rgba(196,162,90,0.4)", color: "var(--accent)", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", borderRadius: 20, padding: "6px 18px", marginBottom: 28 }}>
            For Landlords &amp; Agents
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,6vw,4rem)", lineHeight: 1.2, marginBottom: 24 }}>
            List Smarter. <br /><span style={{ color: "var(--accent)" }}>Rent Faster.</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Canada&apos;s most trusted platform for landlords and real estate agents. Post your property, reach thousands of qualified buyers and renters, and close deals faster.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/post-listing" style={{ background: "var(--accent)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 700, fontSize: 16 }}>Post a Listing Free</Link>
            <a href="#plans" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 16, border: "1px solid rgba(255,255,255,0.25)" }}>View Plans</a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 60, flexWrap: "wrap" }}>
            {[{ value: "12,000+", label: "Active Listings" }, { value: "85,000+", label: "Monthly Visitors" }, { value: "4.8★", label: "Landlord Rating" }].map(stat => (
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
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>Everything You Need to Succeed</h2>
          <p style={{ color: "var(--mid)", maxWidth: 520, margin: "0 auto", fontSize: "1.05rem" }}>Our platform is built specifically for Canadian landlords and agents.</p>
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
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>Landlord Service Packages</h2>
            <p style={{ color: "var(--mid)", fontSize: "1.05rem" }}>Choose the service option that fits your leasing and landlord support needs.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28, alignItems: "start" }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.highlight ? "var(--dark)" : "var(--cream)", borderRadius: 16, padding: "36px 32px", position: "relative", boxShadow: plan.highlight ? "0 12px 40px rgba(0,0,0,0.18)" : "0 2px 12px rgba(0,0,0,0.06)", transform: plan.highlight ? "scale(1.03)" : "scale(1)" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1, borderRadius: 20, padding: "5px 16px", whiteSpace: "nowrap" }}>MOST POPULAR</div>
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
                {plan.name === "A-Z Private Leasing Package" && (
                  <p style={{ fontSize: 11.5, color: plan.highlight ? "rgba(255,255,255,0.55)" : "var(--mid)", lineHeight: 1.65, marginBottom: 20 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>**</span> Conditions apply: if an A-Z-approved tenant remains in rent default for 45 or more consecutive calendar days within the first 90 calendar days of the lease start date, the Client may be eligible for a full refund. For more details, please contact Leasing Agent.
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
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--dark)", marginBottom: 14 }}>Loved by Canadian Landlords</h2>
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
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.4rem)", color: "var(--dark)", marginBottom: 14 }}>Frequently Asked Questions</h2>
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
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: 16 }}>Ready to List Your Property?</h2>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
          Join thousands of Canadian landlords already growing their portfolio with A-Z Housing.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/post-listing"  style={{ background: "#fff", color: "var(--accent)", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 800, fontSize: 16 }}>Post a Listing -- Free</Link>
          <Link href="/auth/register" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "14px 36px", fontWeight: 600, fontSize: 16, border: "1px solid rgba(255,255,255,0.4)" }}>Create an Account</Link>
        </div>
      </section>
    </main>
  );
}
