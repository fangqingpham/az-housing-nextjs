"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import LeadTrackingFields from "@/components/LeadTrackingFields";
import { getStoredLeadTracking } from "@/lib/client/lead-tracking";
import { trackFormEventOnce, trackMarketingEvent } from "@/lib/client/marketing-events";

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
  const { t, lang } = useLanguage();
  const tp = t.tenantPlacement;

  const [form, setForm] = useState<FormData>(initialForm);
  const [privateLeasing, setPrivateLeasing] = useState(true);
  const [mlsListing, setMlsListing] = useState(false);
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
  const [isMobile, setIsMobile] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth <= 900);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const total = useMemo(() => {
    const management =
      managementPlan === "quarterly" ? 360 :
      managementPlan === "halfYear" ? 600 :
      managementPlan === "yearly" ? 1200 : 0;
    return (
      (privateLeasing ? 995 : 0) +
      (mlsListing ? 199 : 0) +
      (photography ? 149 : 0) +
      (showings ? 399 : 0) +
      (keyHandover ? 75 : 0) +
      (moveInInspection ? 99 : 0) +
      extraApplicants * 29 +
      management +
      urgentInspections * 149
    );
  }, [privateLeasing, mlsListing, photography, showings, keyHandover, moveInInspection, extraApplicants, managementPlan, urgentInspections]);

  const selectedServices = useMemo(() => [
    privateLeasing    ? `A-Z Private Leasing Package - ${money(995)}` : null,
    mlsListing        ? `MLS Listing by Realtor (Listing only) - ${money(199)}` : null,
    photography       ? `Professional Photography - ${money(149)}` : null,
    showings          ? `In-Person Showings, max 5 - ${money(399)}` : null,
    keyHandover       ? `Key Handover and Move-In Orientation - ${money(75)}` : null,
    moveInInspection  ? `Move-In Inspection Report - ${money(99)}` : null,
    extraApplicants > 0 ? `Extra Applicant Screening x ${extraApplicants} - ${money(extraApplicants * 29)}` : null,
    managementPlan === "quarterly" ? `Property Management: Quarterly Subscription - ${money(360)}` : null,
    managementPlan === "halfYear"  ? `Property Management: Half-Year Subscription - ${money(600)}` : null,
    managementPlan === "yearly"    ? `Property Management: Yearly Subscription - ${money(1200)}` : null,
    urgentInspections > 0 ? `Urgent / Same-Day Inspection x ${urgentInspections} - ${money(urgentInspections * 149)}` : null,
  ].filter(Boolean) as string[], [privateLeasing, mlsListing, photography, showings, keyHandover, moveInInspection, extraApplicants, managementPlan, urgentInspections]);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    void trackMarketingEvent("order_form_start", { service: "tenant_placement", form_name: "tenant_placement_order" });
  };

  const update = (field: keyof FormData, value: string | boolean) => {
    markStarted();
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

  // Field labels vary by language
  const fieldLabels: Record<string, string> = lang === 'zh' ? {
    landlordName:    "法定全名",
    phone:           "电话号码",
    email:           "电子邮件地址",
    mailingAddress:  "通讯地址",
    propertyAddress: "出租房产地址",
    city:            "城市",
    postalCode:      "邮政编码",
    propertyType:    "房产类型",
    expectedRent:    "预期月租金",
    bedrooms:        "卧室数量",
    bathrooms:       "浴室数量",
    moveInDate:      "可入住日期",
    readyForShowing: "房产是否可供看房",
    notes:           "补充说明",
  } : {
    landlordName:    "Full legal name",
    phone:           "Phone number",
    email:           "Email address",
    mailingAddress:  "Mailing address",
    propertyAddress: "Rental property address",
    city:            "City",
    postalCode:      "Postal code",
    propertyType:    "Property type",
    expectedRent:    "Expected monthly rent",
    bedrooms:        "Number of bedrooms",
    bathrooms:       "Number of bathrooms",
    moveInDate:      "Available move-in date",
    readyForShowing: "Property ready for showing",
    notes:           "Additional notes",
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isFormValid) {
      setError(lang === 'zh'
        ? "请完整填写所有必填项、勾选授权确认，并至少选择一项服务后再提交。"
        : "Please complete all required fields, authorize the application, and select at least one service before submitting.");
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
          leadTracking: getStoredLeadTracking(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || (lang === 'zh' ? "提交失败，请重试。" : "The order could not be submitted. Please try again."));
      }
      trackFormEventOnce("order_form_submit", data?.orderId || form.email, {
        service: "tenant_placement",
        form_name: "tenant_placement_order",
        order_id: data?.orderId,
        metadata: { estimated_total: total, selected_services_count: selectedServices.length },
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === 'zh' ? "提交失败，请重试。" : "The order could not be submitted. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main style={{ minHeight: "70vh", background: "var(--cream, #f7f4ef)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 760, background: "#fff", borderRadius: 24, padding: "48px 32px", textAlign: "center", boxShadow: "0 10px 35px rgba(0,0,0,.10)" }}>
          <h1 style={{ fontFamily: "var(--serif)", color: "var(--dark, #102247)", fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: 16 }}>
            {lang === 'zh'
              ? "感谢您的提交，A-Z Housing Solutions 团队将很快与您联系。"
              : "Thank you for submitting the order, our A-Z Housing Solutions Team will contact you soon."}
          </h1>
          <p style={{ color: "var(--mid, #666)", lineHeight: 1.7 }}>
            {lang === 'zh'
              ? "您的订单请求副本已发送至 A-Z Housing Solutions。"
              : "A copy of your order request has been sent to A-Z Housing Solutions."}
          </p>
        </div>
      </main>
    );
  }

  // Bilingual labels for sections and fields
  const L = lang === 'zh' ? {
    badge: "A-Z Housing Solutions",
    heroTitle: "租客安置申请",
    heroSub: "填写所有必填信息，选择您需要的服务，并将您的订单请求直接提交给我们的团队。",
    section1: "1. 房东信息",
    fullName: "法定全名 *",
    companyName: "公司名称（如适用）",
    phone: "电话号码 *",
    email: "电子邮件地址 *",
    mailingAddress: "通讯地址 *",
    section2: "2. 房产信息",
    propertyAddress: "出租房产地址 *",
    city: "城市 *",
    postalCode: "邮政编码 *",
    propertyType: "房产类型 *",
    propertyTypePlaceholder: "房产类型 *",
    propertyTypeOptions: ["独立屋", "半独立屋", "联排别墅", "共管公寓", "地下室公寓", "单间出租", "其他"],
    expectedRent: "预期月租金 *",
    bedrooms: "卧室数量 *",
    bathrooms: "浴室数量 *",
    moveInDate: "可入住日期 *",
    showingReady: "房产是否可供看房？ *",
    showingOptions: ["是", "否", "暂时不行"],
    section3: "3. A-Z 私人租赁套餐",
    privateLeasingTitle: "A-Z 私人租赁套餐",
    privateLeasingPrice: "$995 固定费用",
    privateLeasingNote: "营销、申请人沟通、最多5名申请人的租户筛查、租约准备及合规支持。",
    bullets: [
      "在 A-Z Housing Solutions 网站、Kijiji、Facebook Marketplace、特定 Facebook 房屋群及适用的 Rentals.ca 上进行房源发布",
      "申请人询问、预资格审核及看房安排协调",
      "信用检查、身份验证、银行账户核实、欺诈风险筛查、收入和就业核实",
      "前房东和推荐人查询；在可用情况下进行 Openroom 及公开档案查询",
      "安大略省标准租约准备及签署协调",
      "30分钟免费独立持牌律师法律咨询",
      "90天租金管理和付款监控",
    ],
    refundTitle: "如租客违约付款可获全额退款",
    refundStar: "**",
    refundNote: "** 条件适用：如 A-Z 批准的租户在租约开始日期起90个日历天内的45个或更多连续日历天内持续拖欠租金，客户可能有资格获得 A-Z 私人租赁套餐的全额退款。详情请联系租赁代理人。",
    section4: "4. 可选附加服务",
    mlsListing: "MLS 房源发布（由 Realtor 发布，仅发布）",
    mlsListingPrice: "$199",
    photography: "专业摄影",
    photographyPrice: "$149",
    showings: "面对面看房 — 最多5次，仅限大多伦多地区",
    showingsPrice: "$399",
    showingsNote: "包括初步面对面筛查，帮助评估租户适合性。",
    keyHandover: "钥匙交接与入住说明",
    keyHandoverPrice: "$75",
    moveInInspection: "入住检查报告",
    moveInInspectionPrice: "$99",
    extraApplicants: "超出5名申请人后的额外申请人筛查",
    extraApplicantsNote: "每位额外申请人 $29",
    section5: "5. 物业管理服务",
    mgmtDesc: "包括租金收取、房东划款、日常租户沟通、紧急电话协调、维修协调、检查报告、租约文件存档及合规记录保管。",
    quarterly: "季度",
    halfYear: "半年",
    yearly: "年度",
    clearMgmt: "清除物业管理选择",
    urgentInspection: "紧急或当日检查",
    urgentNote: "每次 $149",
    section6: "6. 补充说明",
    notesPlaceholder: "租户要求、偏好租户类型、宠物、吸烟、租约期限或特殊说明。如无请填写 N/A。*",
    section7: "7. 授权",
    authText: "我确认我是房产所有者或授权代表，并且所提供的信息在我所知范围内真实准确。*",
    estimatedTotal: "预估总额",
    estimatedNote: "大多伦多地区以外的服务预估总额（含税前）、最终确认及定制报价。",
    selectedServices: "已选服务",
    noServiceSelected: "尚未选择任何服务。",
    submitLocked: "提交按钮锁定，请完成以下项目：",
    authCheckbox: "授权勾选",
    selectService: "至少选择一项服务",
    moreFields: "以上还有更多必填项",
    submitOrder: "提交订单请求",
    submitting: "提交中...",
    callText: "或致电/发短信：+1 (647) 6932-932",
    gtaNote: "价格仅适用于大多伦多地区。租户筛查须获申请人同意，并依赖信息可用性及第三方核实结果。",
  } : {
    badge: "A-Z Housing Solutions",
    heroTitle: "Tenant Placement Application",
    heroSub: "Complete all required information, select your services, and submit your order request directly to our team.",
    section1: "1. Landlord Information",
    fullName: "Full Legal Name *",
    companyName: "Company Name, if applicable",
    phone: "Phone Number *",
    email: "Email Address *",
    mailingAddress: "Mailing Address *",
    section2: "2. Property Information",
    propertyAddress: "Rental Property Address *",
    city: "City *",
    postalCode: "Postal Code *",
    propertyType: "Property Type",
    propertyTypePlaceholder: "Property Type *",
    propertyTypeOptions: ["Detached House", "Semi-Detached House", "Townhouse", "Condo Apartment", "Basement Apartment", "Room Rental", "Other"],
    expectedRent: "Expected Monthly Rent *",
    bedrooms: "Number of Bedrooms *",
    bathrooms: "Number of Bathrooms *",
    moveInDate: "Available Move-In Date *",
    showingReady: "Is the property ready for showing?",
    showingOptions: ["Yes", "No", "Not yet"],
    section3: "3. A-Z Private Leasing Package",
    privateLeasingTitle: "A-Z Private Leasing Package",
    privateLeasingPrice: "$995 flat fee",
    privateLeasingNote: "Marketing, applicant communication, tenant screening for up to 5 applicants, lease preparation, and compliance support.",
    bullets: [
      "Listing on A-Z Housing Solutions website, Kijiji, Facebook Marketplace, selected Facebook housing groups, and Rentals.ca where applicable",
      "Applicant inquiries, pre-qualification, and scheduling coordination",
      "Credit check, identity verification, bank account verification, fraud-risk screening, income and employment verification",
      "Previous landlord and reference checks; Openroom and public filing search where available",
      "Ontario Standard Lease preparation and signing coordination",
      "30-minute complimentary consultation with an independent licensed paralegal",
      "90-Day Rent Administration and Payment Monitoring",
    ],
    refundTitle: "Full Refund if Tenant Default Payment",
    refundStar: "**",
    refundNote: "** Conditions apply: if an A-Z-approved tenant remains in rent default for 45 or more consecutive calendar days within the first 90 calendar days of the lease start date, the Client may be eligible for a full refund of the A-Z Private Leasing Package. For more details, please contact Leasing Agent.",
    section4: "4. Optional Add-On Services",
    mlsListing: "MLS Listing by Realtor (Listing only)",
    mlsListingPrice: "$199",
    photography: "Professional Photography",
    photographyPrice: "$149",
    showings: "In-Person Showings — Maximum 5 Showings, GTA only",
    showingsPrice: "$399",
    showingsNote: "Includes initial face-to-face screening to help assess tenant suitability.",
    keyHandover: "Key Handover and Move-In Orientation",
    keyHandoverPrice: "$75",
    moveInInspection: "Move-In Inspection Report",
    moveInInspectionPrice: "$99",
    extraApplicants: "Extra Applicant Screening After First 5 Applicants",
    extraApplicantsNote: "$29 per additional applicant",
    section5: "5. Property Management Service",
    mgmtDesc: "Includes rent collection, landlord disbursement, routine tenant communication, emergency call coordination, maintenance coordination, inspection reports, lease document storage, and compliance recordkeeping.",
    quarterly: "Quarterly",
    halfYear: "Half-Year",
    yearly: "Yearly",
    clearMgmt: "Clear property management selection",
    urgentInspection: "Urgent or Same-Day Inspection",
    urgentNote: "$149 per visit",
    section6: "6. Additional Notes",
    notesPlaceholder: "Tenant requirements, preferred tenant profile, pets, smoking, lease term, or special instructions. Type N/A if none. *",
    section7: "7. Authorization",
    authText: "I confirm I am the property owner or authorized representative, and the information provided is true and accurate to the best of my knowledge. *",
    estimatedTotal: "Estimated Total",
    estimatedNote: "Estimated service total before taxes, final confirmation, and customized quotes outside the GTA.",
    selectedServices: "Selected Services",
    noServiceSelected: "No service selected yet.",
    submitLocked: "Submit button is locked until completed:",
    authCheckbox: "Authorization checkbox",
    selectService: "Select at least one service",
    moreFields: "More required fields above",
    submitOrder: "Submit Order Request",
    submitting: "Submitting...",
    callText: "Or call/text: +1 (647) 6932-932",
    gtaNote: "Prices are quoted for the GTA area only. Tenant screening is subject to applicant consent, information availability, and third-party verification results.",
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream, #f7f4ef)", color: "var(--dark, #102247)" }}>
      <section style={{ background: "linear-gradient(135deg, var(--dark, #102247), #1a2a4a)", color: "#fff", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ color: "var(--accent, #f5a623)", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{L.badge}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.15, marginBottom: 16 }}>{L.heroTitle}</h1>
          <p style={{ color: "rgba(255,255,255,.78)", fontSize: 18, lineHeight: 1.7, margin: "0 auto", maxWidth: 720 }}>{L.heroSub}</p>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <LeadTrackingFields />
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 14px" : "48px 24px", display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1.4fr) minmax(300px, .6fr)", gap: isMobile ? 18 : 28, overflowX: "hidden" }}>
          <div style={{ display: "grid", gap: 24 }}>

            <Card title={L.section1}>
              <div style={gridStyle}>
                <input required style={inputStyle} placeholder={L.fullName} value={form.landlordName} onChange={e => update("landlordName", e.target.value)} />
                <input style={inputStyle} placeholder={L.companyName} value={form.companyName} onChange={e => update("companyName", e.target.value)} />
                <input required style={inputStyle} placeholder={L.phone} value={form.phone} onChange={e => update("phone", e.target.value)} />
                <input required type="email" style={inputStyle} placeholder={L.email} value={form.email} onChange={e => update("email", e.target.value)} />
                <input required style={fullStyle} placeholder={L.mailingAddress} value={form.mailingAddress} onChange={e => update("mailingAddress", e.target.value)} />
              </div>
            </Card>

            <Card title={L.section2}>
              <div style={gridStyle}>
                <input required style={fullStyle} placeholder={L.propertyAddress} value={form.propertyAddress} onChange={e => update("propertyAddress", e.target.value)} />
                <input required style={inputStyle} placeholder={L.city} value={form.city} onChange={e => update("city", e.target.value)} />
                <input required style={inputStyle} placeholder={L.postalCode} value={form.postalCode} onChange={e => update("postalCode", e.target.value)} />
                <select required style={inputStyle} value={form.propertyType} onChange={e => update("propertyType", e.target.value)}>
                  <option value="">{L.propertyTypePlaceholder}</option>
                  {L.propertyTypeOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <input required style={inputStyle} placeholder={L.expectedRent} value={form.expectedRent} onChange={e => update("expectedRent", e.target.value)} />
                <input required style={inputStyle} placeholder={L.bedrooms} value={form.bedrooms} onChange={e => update("bedrooms", e.target.value)} />
                <input required style={inputStyle} placeholder={L.bathrooms} value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
                <input required style={inputStyle} placeholder={L.moveInDate} value={form.moveInDate} onChange={e => update("moveInDate", e.target.value)} />
                <select required style={inputStyle} value={form.readyForShowing} onChange={e => update("readyForShowing", e.target.value)}>
                  <option value="">{L.showingReady}</option>
                  {L.showingOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </Card>

            <Card title={L.section3}>
              <ServiceCheck checked={privateLeasing} onChange={setPrivateLeasing} title={L.privateLeasingTitle} price={L.privateLeasingPrice} note={L.privateLeasingNote} />
              <ul style={{ margin: "18px 0 0", paddingLeft: 18, color: "var(--mid, #666)", lineHeight: 1.75, fontSize: 14 }}>
                {L.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <p style={{ margin: "14px 0 0", color: "var(--dark, #102247)", fontWeight: 700, fontSize: 14 }}>
                {L.refundTitle}{" "}<span style={{ color: "var(--accent, #f5a623)" }}>{L.refundStar}</span>
              </p>
              <p style={{ margin: "6px 0 0", color: "var(--mid, #666)", fontSize: 12.5, lineHeight: 1.65 }}>
                <span style={{ color: "var(--accent, #f5a623)", fontWeight: 700 }}>{L.refundStar}</span>{" "}{L.refundNote}
              </p>
            </Card>

            <Card title={L.section4}>
              <ServiceCheck checked={mlsListing}      onChange={setMlsListing}     title={L.mlsListing}    price={L.mlsListingPrice} />
              <ServiceCheck checked={photography}      onChange={setPhotography}     title={L.photography}    price={L.photographyPrice} />
              <ServiceCheck checked={showings}         onChange={setShowings}        title={L.showings}       price={L.showingsPrice}     note={L.showingsNote} />
              <ServiceCheck checked={keyHandover}      onChange={setKeyHandover}     title={L.keyHandover}    price={L.keyHandoverPrice} />
              <ServiceCheck checked={moveInInspection} onChange={setMoveInInspection} title={L.moveInInspection} price={L.moveInInspectionPrice} />
              <NumberLine label={L.extraApplicants} note={L.extraApplicantsNote} value={extraApplicants} setValue={setExtraApplicants} />
            </Card>

            <Card title={L.section5}>
              <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, marginBottom: 18 }}>{L.mgmtDesc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                <PlanButton value="quarterly" selected={managementPlan} setSelected={setManagementPlan} title={L.quarterly} price="$360" />
                <PlanButton value="halfYear"  selected={managementPlan} setSelected={setManagementPlan} title={L.halfYear}  price="$600" />
                <PlanButton value="yearly"    selected={managementPlan} setSelected={setManagementPlan} title={L.yearly}    price="$1,200" />
              </div>
              <button type="button" onClick={() => setManagementPlan("none")} style={{ margin: "14px 0 18px", border: "none", background: "none", color: "var(--accent, #c4a25a)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                {L.clearMgmt}
              </button>
              <NumberLine label={L.urgentInspection} note={L.urgentNote} value={urgentInspections} setValue={setUrgentInspections} />
            </Card>

            <Card title={L.section6}>
              <textarea required style={{ ...fullStyle, minHeight: 130, resize: "vertical" }} placeholder={L.notesPlaceholder} value={form.notes} onChange={e => update("notes", e.target.value)} />
            </Card>

            <Card title={L.section7}>
              <label style={{ display: "flex", gap: 12, lineHeight: 1.6, color: "var(--mid, #666)" }}>
                <input required type="checkbox" checked={form.authorization} onChange={e => update("authorization", e.target.checked)} style={{ marginTop: 5 }} />
                <span>{L.authText}</span>
              </label>
            </Card>
          </div>

          <aside style={{ alignSelf: "start", position: isMobile ? "static" : "sticky", top: isMobile ? "auto" : 86, width: "100%", minWidth: 0 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 10px 35px rgba(0,0,0,.10)", border: "1px solid rgba(0,0,0,.07)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "var(--mid, #666)" }}>{L.estimatedTotal}</div>
              <div style={{ fontSize: 46, fontWeight: 900, margin: "12px 0", color: "var(--dark, #102247)" }}>{money(total)}</div>
              <p style={{ color: "var(--mid, #666)", lineHeight: 1.6, fontSize: 13 }}>{L.estimatedNote}</p>

              <div style={{ background: "var(--cream, #f7f4ef)", borderRadius: 14, padding: 16, marginTop: 20 }}>
                <strong>{L.selectedServices}</strong>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.7 }}>
                  {selectedServices.length ? selectedServices.map((s, i) => <li key={i}>{s}</li>) : <li>{L.noServiceSelected}</li>}
                </ul>
              </div>

              {!isFormValid && (
                <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: 12, padding: 12, marginTop: 16, color: "#9a1b1b", fontSize: 12.5, lineHeight: 1.5 }}>
                  <strong>{L.submitLocked}</strong>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                    {missingRequiredFields.slice(0, 5).map(field => <li key={field}>{fieldLabels[field]}</li>)}
                    {!form.authorization && <li>{L.authCheckbox}</li>}
                    {!hasService && <li>{L.selectService}</li>}
                    {missingRequiredFields.length > 5 && <li>{L.moreFields}</li>}
                  </ul>
                </div>
              )}

              {error && <p style={{ color: "#b00020", fontSize: 13, lineHeight: 1.5, marginTop: 16 }}>{error}</p>}

              <button
                type="submit"
                disabled={!isFormValid || submitting}
                style={{
                  width: "100%", marginTop: 22, border: "none", borderRadius: 12, padding: "15px 18px", fontWeight: 800, textAlign: "center",
                  background: !isFormValid || submitting ? "#9aa3b2" : "var(--dark, #102247)", color: "#fff",
                  cursor: !isFormValid || submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? L.submitting : L.submitOrder}
              </button>

              <p style={{ textAlign: "center", color: "var(--mid, #666)", fontSize: 13, marginTop: 14 }}>{L.callText}</p>
            </div>
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 16, padding: 18, marginTop: 18, color: "#7a6000", fontSize: 13, lineHeight: 1.7 }}>
              {L.gtaNote}
            </div>
          </aside>
        </section>
      </form>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 20, padding: "clamp(18px, 4vw, 26px)", boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.07)", overflow: "hidden", minWidth: 0 }}>
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", color: "var(--dark, #102247)", marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

function ServiceCheck({ checked, onChange, title, price, note }: { checked: boolean; onChange: (v: boolean) => void; title: string; price: string; note?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", border: checked ? "2px solid var(--accent, #f5a623)" : "1px solid rgba(0,0,0,.10)", borderRadius: 14, padding: 16, marginBottom: 12, cursor: "pointer", flexWrap: "wrap", background: checked ? "#fffaf0" : "#fff", color: "var(--dark, #102247)", textAlign: "left" }} aria-pressed={checked}>
      <span style={{ display: "flex", gap: 12, minWidth: 0, flex: "1 1 260px" }}>
        <span style={{ width: 20, height: 20, borderRadius: 5, border: checked ? "2px solid var(--accent, #f5a623)" : "2px solid rgba(0,0,0,.25)", background: checked ? "var(--accent, #f5a623)" : "#fff", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>
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

function NumberLine({ label, note, value, setValue }: { label: string; note: string; value: number; setValue: (v: number) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", border: "1px solid rgba(0,0,0,.10)", borderRadius: 14, padding: 16, marginTop: 12, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, flex: "1 1 260px" }}>
        <strong>{label}</strong>
        <div style={{ color: "var(--mid, #666)", fontSize: 13, marginTop: 4 }}>{note}</div>
      </div>
      <input type="number" min={0} value={value} onChange={e => setValue(Math.max(0, Number(e.target.value)))} style={{ ...inputStyle, width: 100 }} />
    </div>
  );
}

function PlanButton({ value, selected, setSelected, title, price }: { value: string; selected: string; setSelected: (v: string) => void; title: string; price: string }) {
  const active = selected === value;
  return (
    <button type="button" onClick={() => setSelected(value)} style={{ border: active ? "2px solid var(--dark, #102247)" : "1px solid rgba(0,0,0,.12)", background: active ? "var(--dark, #102247)" : "#fff", color: active ? "#fff" : "var(--dark, #102247)", borderRadius: 14, padding: 18, textAlign: "left", cursor: "pointer" }}>
      <strong>{title}</strong>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{price}</div>
    </button>
  );
}
