"use client";

import React, { useMemo, useState } from "react";

const money = (amount: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TenantPlacementApplicationPage() {
  const [privateLeasing, setPrivateLeasing] = useState(true);
  const [photography, setPhotography] = useState(false);
  const [showings, setShowings] = useState(false);
  const [keyHandover, setKeyHandover] = useState(false);
  const [moveInInspection, setMoveInInspection] = useState(false);
  const [extraApplicants, setExtraApplicants] = useState(0);
  const [managementPlan, setManagementPlan] = useState("none");
  const [urgentInspections, setUrgentInspections] = useState(0);

  const total = useMemo(() => {
    const management =
      managementPlan === "quarterly" ? 360 :
      managementPlan === "halfYear" ? 600 :
      managementPlan === "yearly" ? 1200 : 0;

    return (
      (privateLeasing ? 799 : 0) +
      (photography ? 149 : 0) +
      (showings ? 399 : 0) +
      (keyHandover ? 75 : 0) +
      (moveInInspection ? 99 : 0) +
      extraApplicants * 29 +
      management +
      urgentInspections * 149
    );
  }, [
    privateLeasing,
    photography,
    showings,
    keyHandover,
    moveInInspection,
    extraApplicants,
    managementPlan,
    urgentInspections,
  ]);

  const selectedServices = [
    privateLeasing ? `A-Z Private Leasing Package - ${money(799)}` : null,
    photography ? `Professional Photography - ${money(149)}` : null,
    showings ? `In-Person Showings, max 5 - ${money(399)}` : null,
    keyHandover ? `Key Handover and Move-In Orientation - ${money(75)}` : null,
    moveInInspection ? `Move-In Inspection Report - ${money(99)}` : null,
    extraApplicants > 0 ? `Extra Applicant Screening x ${extraApplicants} - ${money(extraApplicants * 29)}` : null,
    managementPlan === "quarterly" ? `Property Management: Quarterly Subscription - ${money(360)}` : null,
    managementPlan === "halfYear" ? `Property Management: Half-Year Subscription - ${money(600)}` : null,
    managementPlan === "yearly" ? `Property Management: Yearly Subscription - ${money(1200)}` : null,
    urgentInspections > 0 ? `Urgent / Same-Day Inspection x ${urgentInspections} - ${money(urgentInspections * 149)}` : null,
  ].filter(Boolean);

  const emailBody = encodeURIComponent(
    `Hello A-Z Housing Solutions,\n\nI would like to order tenant placement / property management services.\n\nSelected services:\n${
      selectedServices.length ? selectedServices.map((s) => `- ${s}`).join("\n") : "- No service selected yet"
    }\n\nEstimated total: ${money(total)}\n\nLandlord Name:\nPhone Number:\nRental Property Address:\nPreferred Move-In Date:\nAdditional Notes:\n\nThank you.`
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream, #f7f4ef)", color: "var(--dark, #102247)" }}>
      <section style={{ background: "linear-gradient(135deg, var(--dark, #102247), #1a2a4a)", color: "#fff", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ color: "var(--accent, #f5a623)", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            A-Z Housing Solutions
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.15, marginBottom: 16 }}>
            Tenant Placement Application
          </h1>
          <p style={{ color: "rgba(255,255,255,.78)", fontSize: 18, lineHeight: 1.7, margin: "0 auto", maxWidth: 720 }}>
            Select your leasing, screening, move-in, and property management services. The estimated total updates automatically before you submit your request.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, .6fr)", gap: 28 }}>
        <div style={{ display: "grid", gap: 24 }}>
          <Card title="1. Landlord Information">
            <div className="form-grid">
              <input className="az-input" placeholder="Full Legal Name" />
              <input className="az-input" placeholder="Company Name, if applicable" />
              <input className="az-input" placeholder="Phone Number" />
              <input className="az-input" placeholder="Email Address" />
              <input className="az-input full" placeholder="Mailing Address" />
            </div>
          </Card>

          <Card title="2. Property Information">
            <div className="form-grid">
              <input className="az-input full" placeholder="Rental Property Address" />
              <input className="az-input" placeholder="City" />
              <input className="az-input" placeholder="Postal Code" />
              <select className="az-input">
                <option>Property Type</option>
                <option>Detached House</option>
                <option>Semi-Detached House</option>
                <option>Townhouse</option>
                <option>Condo Apartment</option>
                <option>Basement Apartment</option>
                <option>Room Rental</option>
              </select>
              <input className="az-input" placeholder="Expected Monthly Rent" />
              <input className="az-input" placeholder="Number of Bedrooms" />
              <input className="az-input" placeholder="Number of Bathrooms" />
              <input className="az-input" placeholder="Available Move-In Date" />
              <select className="az-input">
                <option>Is the property ready for showing?</option>
                <option>Yes</option>
                <option>No</option>
                <option>Not yet</option>
              </select>
            </div>
          </Card>

          <Card title="3. A-Z Private Leasing Package">
            <ServiceCheck
              checked={privateLeasing}
              onChange={setPrivateLeasing}
              title="A-Z Private Leasing Package"
              price="$799 flat fee"
              note="Marketing, applicant communication, tenant screening for up to 5 applicants, lease preparation, and compliance support."
            />
            <ul className="included-list">
              <li>Listing on A-Z Housing Solutions website, Kijiji, Facebook Marketplace, selected Facebook housing groups, and Rentals.ca where applicable</li>
              <li>Applicant inquiries, pre-qualification, and scheduling coordination</li>
              <li>Credit check, identity verification, bank account verification, fraud-risk screening, income and employment verification</li>
              <li>Previous landlord and reference checks; Openroom and public filing search where available</li>
              <li>Ontario Standard Lease preparation and signing coordination</li>
              <li>30-minute complimentary consultation with an independent licensed paralegal</li>
            </ul>
          </Card>

          <Card title="4. Optional Add-On Services">
            <ServiceCheck checked={photography} onChange={setPhotography} title="Professional Photography" price="$149" />
            <ServiceCheck checked={showings} onChange={setShowings} title="In-Person Showings — Maximum 5 Showings, GTA only" price="$399" note="Includes initial face-to-face screening to help assess tenant suitability." />
            <ServiceCheck checked={keyHandover} onChange={setKeyHandover} title="Key Handover and Move-In Orientation" price="$75" />
            <ServiceCheck checked={moveInInspection} onChange={setMoveInInspection} title="Move-In Inspection Report" price="$99" />
            <NumberLine label="Extra Applicant Screening After First 5 Applicants" note="$29 per additional applicant" value={extraApplicants} setValue={setExtraApplicants} />
          </Card>

          <Card title="5. Property Management Service">
            <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, marginBottom: 18 }}>
              Includes rent collection, landlord disbursement, routine tenant communication, emergency call coordination, maintenance coordination, inspection reports, lease document storage, and compliance recordkeeping.
            </p>
            <div className="plan-grid">
              <PlanButton value="quarterly" selected={managementPlan} setSelected={setManagementPlan} title="Quarterly" price="$360" />
              <PlanButton value="halfYear" selected={managementPlan} setSelected={setManagementPlan} title="Half-Year" price="$600" />
              <PlanButton value="yearly" selected={managementPlan} setSelected={setManagementPlan} title="Yearly" price="$1,200" />
            </div>
            <button type="button" onClick={() => setManagementPlan("none")} className="clear-btn">Clear property management selection</button>
            <NumberLine label="Urgent or Same-Day Inspection" note="$149 per visit" value={urgentInspections} setValue={setUrgentInspections} />
          </Card>

          <Card title="6. Additional Notes">
            <textarea className="az-input full" style={{ minHeight: 130 }} placeholder="Tenant requirements, preferred tenant profile, pets, smoking, lease term, or special instructions." />
          </Card>
        </div>

        <aside style={{ alignSelf: "start", position: "sticky", top: 86 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 10px 35px rgba(0,0,0,.10)", border: "1px solid rgba(0,0,0,.07)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "var(--mid, #666)" }}>
              Estimated Total
            </div>
            <div style={{ fontSize: 46, fontWeight: 900, margin: "12px 0", color: "var(--dark, #102247)" }}>{money(total)}</div>
            <p style={{ color: "var(--mid, #666)", lineHeight: 1.6, fontSize: 13 }}>
              Estimated service total before taxes, final confirmation, and customized quotes outside the GTA.
            </p>

            <div style={{ background: "var(--cream, #f7f4ef)", borderRadius: 14, padding: 16, marginTop: 20 }}>
              <strong>Selected Services</strong>
              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.7 }}>
                {selectedServices.length ? selectedServices.map((s, i) => <li key={i}>{s}</li>) : <li>No service selected yet.</li>}
              </ul>
            </div>

            <a
              href={`mailto:azhousing.solutions@outlook.com?subject=Tenant Placement Application&body=${emailBody}`}
              style={{ display: "block", marginTop: 22, background: "var(--dark, #102247)", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "14px 18px", fontWeight: 800, textAlign: "center" }}
            >
              Submit Order Request
            </a>

            <p style={{ textAlign: "center", color: "var(--mid, #666)", fontSize: 13, marginTop: 14 }}>
              Or call/text: +1 (647) 948-4428
            </p>
          </div>

          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 16, padding: 18, marginTop: 18, color: "#7a6000", fontSize: 13, lineHeight: 1.7 }}>
            Prices are quoted for the GTA area only. Tenant screening is subject to applicant consent, information availability, and third-party verification results.
          </div>
        </aside>
      </section>

      <style jsx>{`
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .az-input { width: 100%; border: 1px solid rgba(0,0,0,.15); border-radius: 12px; padding: 13px 15px; background: #fff; color: var(--dark, #102247); outline: none; }
        .az-input:focus { border-color: var(--accent, #c4a25a); }
        .full { grid-column: 1 / -1; }
        .included-list { margin: 18px 0 0; padding-left: 18px; color: var(--mid, #666); line-height: 1.75; font-size: 14px; }
        .plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .clear-btn { margin: 14px 0 18px; border: none; background: none; color: var(--accent, #c4a25a); font-weight: 700; cursor: pointer; text-decoration: underline; }
        @media (max-width: 900px) {
          section[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
          .form-grid, .plan-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.07)" }}>
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--dark, #102247)", marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

function ServiceCheck({ checked, onChange, title, price, note }: { checked: boolean; onChange: (value: boolean) => void; title: string; price: string; note?: string }) {
  return (
    <label style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", border: "1px solid rgba(0,0,0,.10)", borderRadius: 14, padding: 16, marginBottom: 12, cursor: "pointer" }}>
      <span style={{ display: "flex", gap: 12 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          <strong>{title}</strong>
          {note && <span style={{ display: "block", color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{note}</span>}
        </span>
      </span>
      <strong style={{ whiteSpace: "nowrap", color: "var(--dark, #102247)" }}>{price}</strong>
    </label>
  );
}

function NumberLine({ label, note, value, setValue }: { label: string; note: string; value: number; setValue: (value: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", border: "1px solid rgba(0,0,0,.10)", borderRadius: 14, padding: 16, marginTop: 12 }}>
      <div>
        <strong>{label}</strong>
        <div style={{ color: "var(--mid, #666)", fontSize: 13, marginTop: 4 }}>{note}</div>
      </div>
      <input type="number" min={0} value={value} onChange={(e) => setValue(Math.max(0, Number(e.target.value)))} style={{ width: 86, border: "1px solid rgba(0,0,0,.18)", borderRadius: 10, padding: 10 }} />
    </div>
  );
}

function PlanButton({ value, selected, setSelected, title, price }: { value: string; selected: string; setSelected: (value: string) => void; title: string; price: string }) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      style={{
        border: active ? "2px solid var(--dark, #102247)" : "1px solid rgba(0,0,0,.12)",
        background: active ? "var(--dark, #102247)" : "#fff",
        color: active ? "#fff" : "var(--dark, #102247)",
        borderRadius: 14,
        padding: 18,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <strong>{title}</strong>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{price}</div>
    </button>
  );
}
