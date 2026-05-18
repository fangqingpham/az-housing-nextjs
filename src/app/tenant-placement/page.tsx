"use client";

import React, { useMemo, useState } from "react";

const money = (amount: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);

type FormData = {
  landlordName: string;
  companyName: string;
  phone: string;
  email: string;
  mailingAddress: string;
  propertyAddress: string;
  city: string;
  postalCode: string;
  propertyType: string;
  expectedRent: string;
  bedrooms: string;
  bathrooms: string;
  moveInDate: string;
  readyForShowing: string;
  notes: string;
  authorization: boolean;
};

const initialForm: FormData = {
  landlordName: "",
  companyName: "",
  phone: "",
  email: "",
  mailingAddress: "",
  propertyAddress: "",
  city: "",
  postalCode: "",
  propertyType: "",
  expectedRent: "",
  bedrooms: "",
  bathrooms: "",
  moveInDate: "",
  readyForShowing: "",
  notes: "",
  authorization: false,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  border: "1px solid rgba(0,0,0,.16)",
  borderRadius: 12,
  padding: "13px 15px",
  background: "#fff",
  color: "var(--dark, #102247)",
  outline: "none",
  fontSize: 15,
  lineHeight: 1.4,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  alignItems: "start",
};

const fullStyle: React.CSSProperties = {
  ...inputStyle,
  gridColumn: "1 / -1",
};

export default function TenantPlacementApplicationPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [privateLeasing, setPrivateLeasing] = useState(true);
  const [photography, setPhotography] = useState(false);
  const [showings, setShowings] = useState(false);
  const [keyHandover, setKeyHandover] = useState(false);
  const [moveInInspection, setMoveInInspection] = useState(false);
  const [extraApplicants, setExtraApplicants] = useState(0);
  const [managementPlan, setManagementPlan] = useState("none");
  const [urgentInspections, setUrgentInspections] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
  }, [privateLeasing, photography, showings, keyHandover, moveInInspection, extraApplicants, managementPlan, urgentInspections]);

  const selectedServices = useMemo(() => [
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
  ].filter(Boolean) as string[], [privateLeasing, photography, showings, keyHandover, moveInInspection, extraApplicants, managementPlan, urgentInspections]);

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const requiredFields: (keyof FormData)[] = [
    "landlordName", "phone", "email", "mailingAddress", "propertyAddress", "city", "postalCode",
    "propertyType", "expectedRent", "bedrooms", "bathrooms", "moveInDate", "readyForShowing", "notes"
  ];

  const allRequiredFilled = requiredFields.every(field => String(form[field]).trim().length > 0);
  const hasService = selectedServices.length > 0;
  const missingRequiredFields = requiredFields.filter(field => String(form[field]).trim().length === 0);
  const isFormValid = allRequiredFilled && form.authorization && hasService;

  const requiredFieldLabels: Record<string, string> = {
    landlordName: "Full legal name",
    phone: "Phone number",
    email: "Email address",
    mailingAddress: "Mailing address",
    propertyAddress: "Rental property address",
    city: "City",
    postalCode: "Postal code",
    propertyType: "Property type",
    expectedRent: "Expected monthly rent",
    bedrooms: "Number of bedrooms",
    bathrooms: "Number of bathrooms",
    moveInDate: "Available move-in date",
    readyForShowing: "Property ready for showing",
    notes: "Additional notes",
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Please complete all required fields, authorize the application, and select at least one service before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tenant-placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordName: form.landlordName,
          companyName: form.companyName,
          phone: form.phone,
          email: form.email,
          mailingAddress: form.mailingAddress,
          propertyAddress: form.propertyAddress,
          city: form.city,
          postalCode: form.postalCode,
          propertyType: form.propertyType,
          expectedRent: form.expectedRent,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          moveInDate: form.moveInDate,
          showingReady: form.readyForShowing,
          selectedServices,
          estimatedTotal: total,
          additionalNotes: form.notes,
          authorizationConfirmed: form.authorization,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "The order could not be submitted. Please try again.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The order could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main style={{ minHeight: "70vh", background: "var(--cream, #f7f4ef)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 760, background: "#fff", borderRadius: 24, padding: "48px 32px", textAlign: "center", boxShadow: "0 10px 35px rgba(0,0,0,.10)" }}>
          <h1 style={{ fontFamily: "var(--serif)", color: "var(--dark, #102247)", fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: 16 }}>
            Thank you for submitting the order, our A-Z Housing Solutions Team will contact you soon.
          </h1>
          <p style={{ color: "var(--mid, #666)", lineHeight: 1.7 }}>
            A copy of your order request has been sent to A-Z Housing Solutions.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream, #f7f4ef)", color: "var(--dark, #102247)" }}>
      <section style={{ background: "linear-gradient(135deg, var(--dark, #102247), #1a2a4a)", color: "#fff", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ color: "var(--accent, #f5a623)", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>A-Z Housing Solutions</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.15, marginBottom: 16 }}>Tenant Placement Application</h1>
          <p style={{ color: "rgba(255,255,255,.78)", fontSize: 18, lineHeight: 1.7, margin: "0 auto", maxWidth: 720 }}>
            Complete all required information, select your services, and submit your order request directly to our team.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, .6fr)", gap: 28 }}>
          <div style={{ display: "grid", gap: 24 }}>
            <Card title="1. Landlord Information">
              <div style={gridStyle}>
                <input required style={inputStyle} placeholder="Full Legal Name *" value={form.landlordName} onChange={e => update("landlordName", e.target.value)} />
                <input style={inputStyle} placeholder="Company Name, if applicable" value={form.companyName} onChange={e => update("companyName", e.target.value)} />
                <input required style={inputStyle} placeholder="Phone Number *" value={form.phone} onChange={e => update("phone", e.target.value)} />
                <input required type="email" style={inputStyle} placeholder="Email Address *" value={form.email} onChange={e => update("email", e.target.value)} />
                <input required style={fullStyle} placeholder="Mailing Address *" value={form.mailingAddress} onChange={e => update("mailingAddress", e.target.value)} />
              </div>
            </Card>

            <Card title="2. Property Information">
              <div style={gridStyle}>
                <input required style={fullStyle} placeholder="Rental Property Address *" value={form.propertyAddress} onChange={e => update("propertyAddress", e.target.value)} />
                <input required style={inputStyle} placeholder="City *" value={form.city} onChange={e => update("city", e.target.value)} />
                <input required style={inputStyle} placeholder="Postal Code *" value={form.postalCode} onChange={e => update("postalCode", e.target.value)} />
                <select required style={inputStyle} value={form.propertyType} onChange={e => update("propertyType", e.target.value)}>
                  <option value="">Property Type *</option>
                  <option>Detached House</option>
                  <option>Semi-Detached House</option>
                  <option>Townhouse</option>
                  <option>Condo Apartment</option>
                  <option>Basement Apartment</option>
                  <option>Room Rental</option>
                  <option>Other</option>
                </select>
                <input required style={inputStyle} placeholder="Expected Monthly Rent *" value={form.expectedRent} onChange={e => update("expectedRent", e.target.value)} />
                <input required style={inputStyle} placeholder="Number of Bedrooms *" value={form.bedrooms} onChange={e => update("bedrooms", e.target.value)} />
                <input required style={inputStyle} placeholder="Number of Bathrooms *" value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
                <input required style={inputStyle} placeholder="Available Move-In Date *" value={form.moveInDate} onChange={e => update("moveInDate", e.target.value)} />
                <select required style={inputStyle} value={form.readyForShowing} onChange={e => update("readyForShowing", e.target.value)}>
                  <option value="">Is the property ready for showing? *</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Not yet</option>
                </select>
              </div>
            </Card>

            <Card title="3. A-Z Private Leasing Package">
              <ServiceCheck checked={privateLeasing} onChange={setPrivateLeasing} title="A-Z Private Leasing Package" price="$799 flat fee" note="Marketing, applicant communication, tenant screening for up to 5 applicants, lease preparation, and compliance support." />
              <ul style={{ margin: "18px 0 0", paddingLeft: 18, color: "var(--mid, #666)", lineHeight: 1.75, fontSize: 14 }}>
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
              <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, marginBottom: 18 }}>Includes rent collection, landlord disbursement, routine tenant communication, emergency call coordination, maintenance coordination, inspection reports, lease document storage, and compliance recordkeeping.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                <PlanButton value="quarterly" selected={managementPlan} setSelected={setManagementPlan} title="Quarterly" price="$360" />
                <PlanButton value="halfYear" selected={managementPlan} setSelected={setManagementPlan} title="Half-Year" price="$600" />
                <PlanButton value="yearly" selected={managementPlan} setSelected={setManagementPlan} title="Yearly" price="$1,200" />
              </div>
              <button type="button" onClick={() => setManagementPlan("none")} style={{ margin: "14px 0 18px", border: "none", background: "none", color: "var(--accent, #c4a25a)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Clear property management selection</button>
              <NumberLine label="Urgent or Same-Day Inspection" note="$149 per visit" value={urgentInspections} setValue={setUrgentInspections} />
            </Card>

            <Card title="6. Additional Notes">
              <textarea required style={{ ...fullStyle, minHeight: 130, resize: "vertical" }} placeholder="Tenant requirements, preferred tenant profile, pets, smoking, lease term, or special instructions. Type N/A if none. *" value={form.notes} onChange={e => update("notes", e.target.value)} />
            </Card>

            <Card title="7. Authorization">
              <label style={{ display: "flex", gap: 12, lineHeight: 1.6, color: "var(--mid, #666)" }}>
                <input required type="checkbox" checked={form.authorization} onChange={e => update("authorization", e.target.checked)} style={{ marginTop: 5 }} />
                <span>I confirm I am the property owner or authorized representative, and the information provided is true and accurate to the best of my knowledge. *</span>
              </label>
            </Card>
          </div>

          <aside style={{ alignSelf: "start", position: "sticky", top: 86 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 10px 35px rgba(0,0,0,.10)", border: "1px solid rgba(0,0,0,.07)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "var(--mid, #666)" }}>Estimated Total</div>
              <div style={{ fontSize: 46, fontWeight: 900, margin: "12px 0", color: "var(--dark, #102247)" }}>{money(total)}</div>
              <p style={{ color: "var(--mid, #666)", lineHeight: 1.6, fontSize: 13 }}>Estimated service total before taxes, final confirmation, and customized quotes outside the GTA.</p>

              <div style={{ background: "var(--cream, #f7f4ef)", borderRadius: 14, padding: 16, marginTop: 20 }}>
                <strong>Selected Services</strong>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.7 }}>
                  {selectedServices.length ? selectedServices.map((s, i) => <li key={i}>{s}</li>) : <li>No service selected yet.</li>}
                </ul>
              </div>

              {!isFormValid && (
                <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: 12, padding: 12, marginTop: 16, color: "#9a1b1b", fontSize: 12.5, lineHeight: 1.5 }}>
                  <strong>Submit button is locked until completed:</strong>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                    {missingRequiredFields.slice(0, 5).map(field => <li key={field}>{requiredFieldLabels[field]}</li>)}
                    {!form.authorization && <li>Authorization checkbox</li>}
                    {!hasService && <li>Select at least one service</li>}
                    {missingRequiredFields.length > 5 && <li>More required fields above</li>}
                  </ul>
                </div>
              )}

              {error && <p style={{ color: "#b00020", fontSize: 13, lineHeight: 1.5, marginTop: 16 }}>{error}</p>}

              <button
                type="submit"
                disabled={!isFormValid || submitting}
                style={{
                  width: "100%", marginTop: 22, border: "none", borderRadius: 12, padding: "15px 18px", fontWeight: 800, textAlign: "center",
                  background: !isFormValid || submitting ? "#9aa3b2" : "var(--dark, #102247)", color: "#fff", cursor: !isFormValid || submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Order Request"}
              </button>

              <p style={{ textAlign: "center", color: "var(--mid, #666)", fontSize: 13, marginTop: 14 }}>Or call/text: +1 (647) 948-4428</p>
            </div>
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 16, padding: 18, marginTop: 18, color: "#7a6000", fontSize: 13, lineHeight: 1.7 }}>Prices are quoted for the GTA area only. Tenant screening is subject to applicant consent, information availability, and third-party verification results.</div>
          </aside>
        </section>
      </form>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.07)", overflow: "hidden" }}>
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--dark, #102247)", marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

function ServiceCheck({ checked, onChange, title, price, note }: { checked: boolean; onChange: (value: boolean) => void; title: string; price: string; note?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "flex-start",
        border: checked ? "2px solid var(--accent, #f5a623)" : "1px solid rgba(0,0,0,.10)",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        cursor: "pointer",
        flexWrap: "wrap",
        background: checked ? "#fffaf0" : "#fff",
        color: "var(--dark, #102247)",
        textAlign: "left",
      }}
      aria-pressed={checked}
    >
      <span style={{ display: "flex", gap: 12, minWidth: 0, flex: "1 1 260px" }}>
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            border: checked ? "2px solid var(--accent, #f5a623)" : "2px solid rgba(0,0,0,.25)",
            background: checked ? "var(--accent, #f5a623)" : "#fff",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 900,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {checked ? "✓" : ""}
        </span>
        <span style={{ minWidth: 0 }}>
          <strong>{title}</strong>
          {note && <span style={{ display: "block", color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{note}</span>}
        </span>
      </span>
      <strong style={{ whiteSpace: "nowrap", color: "var(--dark, #102247)" }}>{price}</strong>
    </button>
  );
}

function NumberLine({ label, note, value, setValue }: { label: string; note: string; value: number; setValue: (value: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", border: "1px solid rgba(0,0,0,.10)", borderRadius: 14, padding: 16, marginTop: 12, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>
        <strong>{label}</strong>
        <div style={{ color: "var(--mid, #666)", fontSize: 13, marginTop: 4 }}>{note}</div>
      </div>
      <input type="number" min={0} value={value} onChange={(e) => setValue(Math.max(0, Number(e.target.value)))} style={{ ...inputStyle, width: 100 }} />
    </div>
  );
}

function PlanButton({ value, selected, setSelected, title, price }: { value: string; selected: string; setSelected: (value: string) => void; title: string; price: string }) {
  const active = selected === value;
  return (
    <button type="button" onClick={() => setSelected(value)} style={{ border: active ? "2px solid var(--dark, #102247)" : "1px solid rgba(0,0,0,.12)", background: active ? "var(--dark, #102247)" : "#fff", color: active ? "#fff" : "var(--dark, #102247)", borderRadius: 14, padding: 18, textAlign: "left", cursor: "pointer" }}>
      <strong>{title}</strong>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{price}</div>
    </button>
  );
}
