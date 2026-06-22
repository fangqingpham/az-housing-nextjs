"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Landing Arrangement — standalone bilingual page (English default + Tiếng Việt toggle).
 *
 * Does NOT use the global useLanguage (EN/ZH) system. Manages its own local `lang`
 * state ('en' | 'vi') with parallel COPY.en / COPY.vi objects (identical keys).
 * The global EN/ZH navbar toggle stays visible but does not affect this page.
 *
 * Packages & Pricing is presented as a set of collapsible tabs:
 *   1. Single Property Viewing ($99)   2. Basic Package ($799)   3. Add-On Services
 *   4. Custodianship ($1,500)          5. Payment Terms & Methods (+ Excluded Fees)
 *   6. Order Now (the order form, open by default)
 */

type Lang = "en" | "vi";

type AddlBlock = { heading?: string; items?: string[]; note?: string };
type AddlItem = { title: string; blocks: AddlBlock[] };

const money = (amount: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(amount);

const PRICES = { basic: 799, viewing: 99, secondSearch: 399, airport: 199, busTour: 100, schoolWork: 150, banking: 150, custodianship: 1500 } as const;

// Service keys -> English payload labels sent to the API (must contain "Landing Arrangement"
// so the CRM classifies them correctly). Display labels are localized separately.
const SERVICE_PAYLOAD: Record<string, string> = {
  basic:         "Landing Arrangement — Basic Package (Before You Arrive)",
  viewing:       "Landing Arrangement — Single Property Viewing",
  secondSearch:  "Landing Arrangement — Second Home Search After Arrival",
  airport:       "Landing Arrangement — Airport Pickup & Drop-Off",
  busTour:       "Landing Arrangement — Bus Tour (4h)",
  schoolWork:    "Landing Arrangement — School / Workplace First-Day Intro",
  banking:       "Landing Arrangement — Banking + ID + TTC/Presto Setup",
  custodianship: "Landing Arrangement — Custodianship (Student Under 18)",
};

type FormData = {
  fullName: string; phone: string; email: string; vietnamAddress: string;
  gtaArea: string; gtaCity: string; neighbourhood: string; accommodationType: string;
  budget: string; bedrooms: string; bathrooms: string; arrivalDate: string;
  notes: string; consent: boolean;
};

const initialForm: FormData = {
  fullName: "", phone: "", email: "", vietnamAddress: "",
  gtaArea: "", gtaCity: "", neighbourhood: "", accommodationType: "",
  budget: "", bedrooms: "", bathrooms: "", arrivalDate: "",
  notes: "", consent: false,
};

const EN = {
  langButton: "Tiếng Việt",
  badge: "A-Z Housing Solutions",
  heroTitle: "Landing Arrangement Service",
  heroSub: "For individuals and families currently in Vietnam — we help you arrange your accommodation and settle into life before and after you arrive in the Greater Toronto Area (GTA).",

  introTitle: "Everything arranged before you land in Toronto",
  introBody: "Arriving in a new country can be stressful when you can't view homes in person or handle local procedures from abroad. A-Z Housing Solutions takes care of everything for you.",

  whyTitle: "Why arrange your housing while you're still in Vietnam?",
  whyItems: [
    "You're far away and can't inspect the home, its condition, or the furniture in person.",
    "You don't know whether the area is safe, close to a lively neighbourhood, or in a remote location.",
    "You don't know who the landlord is or whether they truly own the home — they could be a tenant subletting it, which risks the real owner reclaiming the property and leaving you unsettled.",
    "Risk of fraud: scammers often repost photos of someone else's home, take your deposit, and disappear.",
  ],

  beforeTitle: "How A-Z Housing Solutions helps you before you arrive in Toronto",
  beforeItems: [
    "Verify who the landlord is by checking utility (electricity / water) bills and the property's ownership records with the City of Toronto.",
    "Meet and interview the landlord in person to get a sense of who they are.",
    "Video call so you can view the home live from Vietnam.",
    "Advise you on the quality of the rooms, the layout, cleanliness, and potential roommates.",
    "Advise you on the location — whether the area is safe, quiet, or lively, and how close it is to where you need to be.",
    "Negotiate the rent so you get the best possible price.",
    "Help you review and understand the lease so you avoid terms that work against you.",
  ],

  afterTitle: "After you arrive, we also offer",
  afterItems: [
    "Airport pickup and drop-off to your home.",
    "Accompaniment to your school to register, or to your workplace, on your first day.",
    "Guidance on opening a bank account, getting photo ID, and setting up a TTC / Presto transit card.",
    "A guided bus tour showing you how to use public transit in Toronto.",
    "Advice on life in Canada — the climate, currency, finding work, and the dos and don'ts of living here — plus introductions to clubs and community groups so you can settle in, practise your English, and more.",
  ],

  gtaOnlyNote: "This service is currently available in the Greater Toronto Area (GTA) only.",

  pricingTitle: "Packages & Pricing",
  startingFrom: "Starting from $99",
  pricingNote: "All prices are in Canadian dollars (CAD) and exclude tax (HST). Services are available in the Greater Toronto Area (GTA) only.",
  pricingHint: "Tap each tab to expand the details.",
  orderNowTab: "Order Now",

  viewingTitle: "Single Property Viewing",
  viewingPrice: "$99",
  viewingFormNote: "One in-person viewing within 20 km (live video call, photos, and a short summary report). Beyond 20 km: +$10 per extra 5 km — confirmed by our team.",

  custodianshipTitle: "Custodianship (Student Under 18)",
  custodianshipPrice: "$1,500 / year",
  custodianshipFormNote: "Local Canadian custodian for an international student under 18, for the term of the agreement. Annual fee — not legal guardianship.",

  basicTitle: "Basic Package — \u201CBefore You Arrive\u201D",
  basicPrice: "$799 flat fee",
  basicIntro: "Online home search (up to 20 homes). Once you've shortlisted 5, we visit each one in person to:",
  basicBullets: [
    "Verify the landlord.",
    "Contact and interview the landlord in person.",
    "Let you view the home from Vietnam via live video call.",
    "Advise you on room quality and layout.",
    "Advise you on the location and neighbourhood.",
    "Negotiate the rent with the landlord.",
    "Provide the landlord with the documents needed to sign the lease.",
    "Review and check the lease.",
  ],
  basicFormNote: "Online search (up to 20 homes), in-person verification & viewing of your 5 shortlisted homes, rent negotiation, and lease signed from Vietnam.",

  addOnsTitle: "Add-On Services",

  secondSearchTitle: "Second home search after arrival",
  secondSearchPrice: "$399",
  secondSearchIntro: "For when you'd rather arrange a temporary stay for the first month instead of signing a long-term lease from abroad. Once you arrive, we start a fresh search (up to 5 homes). Includes:",
  secondSearchBullets: [
    "Administrative preparation: credit report, ID verification, income proof, etc.",
    "Driving you to view homes (up to 5).",
    "Reviewing and checking the lease.",
    "Verifying the landlord.",
    "Advising on room quality and layout.",
    "Advising on the location and neighbourhood.",
    "Negotiating the rent with the landlord.",
  ],
  secondSearchFormNote: "Fresh search after you arrive (up to 5 homes), including lease and admin prep (credit report, ID, income proof).",

  airportTitle: "Airport pickup & drop-off to your home",
  airportPrice: "$199",
  airportNote: "Maximum 2 people and 4 pieces of luggage.",
  busTourTitle: "Bus tour (up to 4 hours)",
  busTourPrice: "$100",
  schoolWorkTitle: "School / workplace first-day intro",
  schoolWorkPrice: "$150",
  schoolWorkNote: "Up to 4 hours.",
  bankingTitle: "Bank account + photo ID + TTC / Presto card",
  bankingPrice: "$150",
  bankingNote: "Up to 6 hours.",

  formTitle: "Order This Service",
  formSub: "Fill in your details, choose your services, and send your order directly to our team. We will contact you to confirm everything.",

  section1: "1. Your Information",
  fullName: "Full name *",
  phone: "Phone number *",
  email: "Email address *",
  vietnamAddress: "Your current address in Vietnam *",

  section2: "2. Your Move to the GTA",
  gtaArea: "Preferred area / destination in the GTA *",
  gtaCity: "Preferred city in the GTA *",
  gtaCityOptions: ["Toronto", "Mississauga", "Brampton", "Markham", "Scarborough", "North York", "Etobicoke", "Vaughan", "Richmond Hill", "Other"],
  neighbourhood: "Preferred neighbourhood (optional)",
  accommodationType: "Type of accommodation wanted *",
  accommodationOptions: ["Room", "Basement Apartment", "Condo Apartment", "Townhouse", "House", "Other"],
  budget: "Maximum monthly rent (CAD) *",
  bedrooms: "Bedrooms wanted",
  bathrooms: "Bathrooms wanted",
  arrivalDate: "Expected arrival date *",

  section3: "3. Choose Your Services",
  section4: "4. Additional Notes",
  notesPlaceholder: "Family size, children, pets, special requirements, or anything else we should know. Type N/A if none.",

  section5: "5. Consent",
  consentText: "I confirm the information provided above is true and accurate, and I authorize A-Z Housing Solutions to act on my behalf to arrange the services I have selected. *",

  estimatedTotal: "Estimated Total",
  estimatedNote: "Estimated service total before tax (HST). The final amount is confirmed by our team.",
  selectedServices: "Selected Services",
  noServiceSelected: "No service selected yet.",
  submitLocked: "Submit button is locked until completed:",
  consentCheckbox: "Consent checkbox",
  selectService: "Select at least one service",
  moreFields: "More required fields above",
  submitOrder: "Submit Order Request",
  submitting: "Submitting...",
  callText: "Or call / text: +1 (647) 948-4428",
  taxNote: "Prices exclude tax (HST). Service available in the GTA only.",

  validationError: "Please complete all required fields, give your consent, and select at least one service before submitting.",
  submitError: "The order could not be submitted. Please try again.",
  successTitle: "Thank you for your order — our A-Z Housing Solutions team will contact you soon.",
  successBody: "A copy of your order request has been sent to A-Z Housing Solutions.",

  excludedFeesTitle: "Excluded Fees",
  paymentTitle: "Payment Terms & Methods",
  additional: [
    {
      title: "Single Property Viewing",
      blocks: [
        { heading: "Includes", items: [
          "Attendance at one (1) property viewing",
          "Live video call during the viewing (up to 30 minutes)",
          "Basic photos and videos of the property",
          "General observations on the room, building, and surrounding area",
          "A short written summary report",
        ] },
        { heading: "Pricing", items: [
          "$99 per viewing within 20 km of our office",
          "Beyond 20 km: +$10 for every additional 5 km travelled",
        ] },
      ],
    },
    {
      title: "Custodianship for International Students Under 18",
      blocks: [
        { heading: "Includes", items: [
          "Acting as the student's local Canadian custodian for the term of the agreement",
          "Keeping current contact details for the student, parents, and school",
          "Being reasonably reachable by the student, parents, and school",
          "Responding to emergencies when necessary",
          "Helping the student access appropriate support services in a serious situation",
          "Communicating with parents about significant concerns affecting the student",
        ] },
        { heading: "Important — not included", note: "Custodianship is not legal guardianship, legal representation, immigration consulting, legal advice, educational consulting, healthcare, financial support, housing management, transportation, or day-to-day parental supervision." },
      ],
    },
    {
      title: "Excluded Fees",
      blocks: [
        { note: "Unless stated otherwise, service fees do not include:" },
        { items: [
          "Legal, lawyer, immigration consultant, and notary fees",
          "Government application, visa, and permit fees",
          "School fees",
          "Translation and courier fees",
          "Transportation, parking, and accommodation expenses",
          "Any other third-party charges",
        ] },
        { note: "Please contact us for additional details." },
      ],
    },
    {
      title: "Payment Terms & Methods",
      blocks: [
        { heading: "Services over $799", items: [
          "First payment (20%) — due on signing; fully refundable if you cancel at least 14 days before your arrival in Canada",
          "Second payment (40%) — due 3 days before arrival in Canada",
          "Final payment (40%) — due on completion of all agreed services",
        ] },
        { heading: "Single Property Viewing", items: [
          "Full payment at the time of booking",
          "Full refund if cancelled at least 7 days before the viewing date",
        ] },
        { heading: "Accepted payment methods", items: [
          "International wire transfer",
          "PayPal",
          "Interac e-Transfer (after arrival in Canada only)",
          "Cash (after arrival in Canada only)",
        ] },
      ],
    },
  ] as AddlItem[],

  fieldLabels: {
    fullName: "Full name", phone: "Phone number", email: "Email address",
    vietnamAddress: "Address in Vietnam", gtaArea: "Preferred area in the GTA",
    gtaCity: "Preferred city", accommodationType: "Accommodation type",
    budget: "Maximum monthly rent", arrivalDate: "Expected arrival date",
  } as Record<string, string>,
};

const VI: typeof EN = {
  langButton: "English",
  badge: "A-Z Housing Solutions",
  heroTitle: "Dịch vụ Hỗ trợ Sắp xếp Nhà ở",
  heroSub: "Dành cho các cá nhân và gia đình hiện đang ở Việt Nam — chúng tôi giúp bạn sắp xếp chỗ ở và ổn định cuộc sống trước và sau khi bạn đặt chân đến Khu vực Đại đô thị Toronto (GTA).",

  introTitle: "Mọi thứ được chuẩn bị sẵn sàng từ trước khi hạ cánh đến Toronto",
  introBody: "Vừa mới đến Canada có thể gặp nhiều khó khăn, căng thẳng khi bạn không thể trực tiếp xem nhà hoặc xử lý các thủ tục tại địa phương. A-Z Housing Solutions sẽ lo liệu mọi thứ thay bạn.",

  whyTitle: "Vì sao chọn dịch vụ Sắp xếp nhà ở từ khi còn ở Việt Nam?",
  whyItems: [
    "Bạn ở xa, bạn không thể tận mắt xem xét, kiểm tra chất lượng nhà cửa, nội thất.",
    "Bạn không biết khu vực mình ở có an ninh không, gần khu đô thị sầm uất không, hay là nơi hẻo lánh.",
    "Bạn không biết chủ nhà là ai, có thực sự sở hữu nhà đó không, hay là một người thuê cho thuê lại — việc này dẫn đến ở không yên tâm với nguy cơ bị chủ nhà chính lấy nhà lại.",
    "Nguy cơ bị lừa đảo: hiện nay có nhiều kẻ lừa đảo lấy hình ảnh nhà của chủ nhà đi đăng lại, gạt lấy cọc và biến mất.",
  ],

  beforeTitle: "Do đó A-Z Housing Solutions sẽ giúp bạn (trước khi bạn đến Toronto)",
  beforeItems: [
    "Xác minh chủ nhà là ai qua việc kiểm tra hóa đơn điện/nước và đăng ký chủ quyền nhà với chính quyền Toronto.",
    "Đến liên hệ và phỏng vấn trực tiếp chủ nhà để xem tính cách chủ nhà.",
    "Gọi trực tuyến để bạn có thể xem nhà từ Việt Nam.",
    "Tư vấn cho bạn về chất lượng phòng ốc, bố trí nhà cửa, sự sạch sẽ, và các bạn cùng nhà (roommates).",
    "Tư vấn cho bạn vị trí địa lý, khu vực nhà ở có an ninh, yên tĩnh, sầm uất hay không, có gần khu bạn ở hay không.",
    "Thương lượng giá thuê với chủ nhà để bạn có giá thuê hợp lý nhất.",
    "Giúp bạn xem xét & tư vấn về hợp đồng thuê để tránh những điều khoản bất lợi cho bạn.",
  ],

  afterTitle: "Sau khi bạn đến, chúng tôi còn có các dịch vụ khác như",
  afterItems: [
    "Đón tại sân bay và đưa về tận nhà.",
    "Đưa đến trường để đăng ký học hoặc đi làm trong ngày đầu tiên.",
    "Hướng dẫn mở tài khoản ngân hàng, làm thẻ căn cước (photo ID), và đăng ký thẻ đi lại xe buýt/tàu điện TTC / Presto.",
    "Một chuyến tham quan bằng xe buýt có người hướng dẫn để chỉ cho bạn cách sử dụng phương tiện giao thông công cộng tại Toronto.",
    "Tư vấn cho bạn cuộc sống tại Canada — khí hậu, tiền tệ, cách kiếm việc, những việc Nên và không Nên khi bạn sống ở Canada. Giới thiệu bạn đến các câu lạc bộ, hội nhóm để bạn có cơ hội hòa nhập cộng đồng, trau dồi tiếng Anh, v.v.",
  ],

  gtaOnlyNote: "Dịch vụ này hiện chỉ cung cấp tại Khu vực Đại đô thị Toronto (GTA).",

  pricingTitle: "Các Gói Dịch vụ & Bảng giá",
  startingFrom: "Chỉ từ $99",
  pricingNote: "Tất cả giá đều tính bằng đô la Canada (CAD) và chưa bao gồm thuế (HST). Các dịch vụ chỉ được cung cấp tại Khu vực Đại đô thị Toronto (GTA).",
  pricingHint: "Nhấn vào từng mục để xem chi tiết.",
  orderNowTab: "Đặt dịch vụ ngay",

  viewingTitle: "Xem nhà hộ (một lần)",
  viewingPrice: "$99",
  viewingFormNote: "Một lần xem nhà tận nơi trong bán kính 20 km (video call trực tiếp, hình ảnh, và báo cáo tóm tắt ngắn). Vượt quá 20 km: phụ thu thêm $10 cho mỗi 5 km — sẽ được đội ngũ của chúng tôi xác nhận.",

  custodianshipTitle: "Giám hộ (du học sinh dưới 18 tuổi)",
  custodianshipPrice: "$1,500/năm",
  custodianshipFormNote: "Người giám hộ tại Canada cho du học sinh dưới 18 tuổi trong suốt thời gian thỏa thuận. Phí theo năm — không phải giám hộ pháp lý.",

  basicTitle: "Gói Cơ bản \u201CTrước khi bạn đến\u201D",
  basicPrice: "Phí trọn gói $799",
  basicIntro: "Tìm kiếm nhà online (tối đa 20 căn). Sau khi bạn vừa ý 5 căn, chúng tôi sẽ đến tận nơi để:",
  basicBullets: [
    "Xác minh chủ nhà.",
    "Đến liên hệ và phỏng vấn trực tiếp chủ nhà.",
    "Xem nhà từ Việt Nam qua gọi video trực tuyến.",
    "Tư vấn cho bạn về chất lượng phòng ốc, bố trí nhà cửa.",
    "Tư vấn cho bạn vị trí địa lý, khu vực nhà ở.",
    "Thương lượng giá thuê với chủ nhà.",
    "Cung cấp cho chủ nhà những giấy tờ cần thiết để ký hợp đồng thuê.",
    "Xem xét & kiểm tra hợp đồng thuê.",
  ],
  basicFormNote: "Tìm kiếm online (tối đa 20 căn), xác minh & xem tận nơi 5 căn bạn chọn, thương lượng giá thuê, và ký hợp đồng từ Việt Nam.",

  addOnsTitle: "Các Dịch vụ Bổ sung",

  secondSearchTitle: "Tìm nhà lần hai sau khi đến",
  secondSearchPrice: "$399",
  secondSearchIntro: "Nếu bạn chỉ muốn sắp xếp ở tạm tháng đầu, không muốn ký hợp đồng dài hạn với chủ nhà, bạn có thể bắt đầu một đợt tìm nhà mới sau khi bạn đã tới nơi (tối đa 5 căn). Bao gồm:",
  secondSearchBullets: [
    "Chuẩn bị các thủ tục hành chính: báo cáo tín dụng (credit report), xác minh danh tính, chứng minh thu nhập, v.v.",
    "Chở bạn đi xem nhà (tối đa 5 căn).",
    "Xem xét & kiểm tra hợp đồng thuê.",
    "Xác minh chủ nhà.",
    "Tư vấn cho bạn về chất lượng phòng ốc, bố trí nhà cửa.",
    "Tư vấn cho bạn vị trí địa lý, khu vực nhà ở.",
    "Thương lượng giá thuê với chủ nhà.",
  ],
  secondSearchFormNote: "Tìm nhà mới sau khi đến (tối đa 5 căn), gồm hợp đồng và chuẩn bị thủ tục (báo cáo tín dụng, danh tính, chứng minh thu nhập).",

  airportTitle: "Đón sân bay & đưa về tận nhà",
  airportPrice: "$199",
  airportNote: "Tối đa 2 người và 4 kiện hành lý.",
  busTourTitle: "Chuyến tham quan bằng xe buýt (tối đa 4 giờ)",
  busTourPrice: "$100",
  schoolWorkTitle: "Đưa đến trường học / nơi làm việc ngày đầu tiên",
  schoolWorkPrice: "$150",
  schoolWorkNote: "Thời gian lên đến 4 giờ.",
  bankingTitle: "Mở tài khoản ngân hàng + làm photo ID + thẻ xe buýt TTC / Presto",
  bankingPrice: "$150",
  bankingNote: "Thời gian lên đến 6 giờ.",

  formTitle: "Đặt Dịch Vụ Này",
  formSub: "Điền thông tin cá nhân của bạn, chọn các dịch vụ mong muốn và gửi đơn trực tiếp cho đội ngũ của chúng tôi. Chúng tôi sẽ liên hệ lại với bạn để xác nhận mọi thông tin.",

  section1: "Phần 1 — Thông tin của bạn",
  fullName: "Họ và tên *",
  phone: "Số điện thoại *",
  email: "Địa chỉ Email *",
  vietnamAddress: "Địa chỉ hiện tại của bạn ở Việt Nam *",

  section2: "Phần 2 — Kế hoạch chuyển đến GTA của bạn",
  gtaArea: "Khu vực / điểm đến mong muốn tại GTA *",
  gtaCity: "Thành phố mong muốn tại GTA *",
  gtaCityOptions: ["Toronto", "Mississauga", "Brampton", "Markham", "Scarborough", "North York", "Etobicoke", "Vaughan", "Richmond Hill", "Khác"],
  neighbourhood: "Khu vực lân cận (neighbourhood) mong muốn (tùy chọn)",
  accommodationType: "Loại hình nhà ở mong muốn *",
  accommodationOptions: ["Phòng lẻ (Room)", "Căn hộ tầng hầm (Basement Apartment)", "Căn hộ chung cư (Condo Apartment)", "Nhà phố (Townhouse)", "Nhà nguyên căn (House)", "Khác"],
  budget: "Tiền thuê hàng tháng tối đa (CAD) *",
  bedrooms: "Số phòng ngủ mong muốn",
  bathrooms: "Số phòng tắm mong muốn",
  arrivalDate: "Ngày dự kiến đến *",

  section3: "Phần 3 — Chọn Dịch vụ của bạn",
  section4: "Phần 4 — Ghi chú thêm",
  notesPlaceholder: "Quy mô gia đình, trẻ em, thú cưng, yêu cầu đặc biệt, hoặc bất kỳ thông tin nào khác mà chúng tôi cần biết. Gõ N/A nếu không có.",

  section5: "Phần 5 — Chấp thuận",
  consentText: "Tôi xác nhận các thông tin cung cấp ở trên là đúng sự thật và chính xác, đồng thời tôi ủy quyền cho A-Z Housing Solutions thay mặt tôi sắp xếp các dịch vụ mà tôi đã chọn. *",

  estimatedTotal: "Tổng chi phí ước tính",
  estimatedNote: "Tổng chi phí dịch vụ ước tính chưa bao gồm thuế (HST). Số tiền cuối cùng sẽ được đội ngũ của chúng tôi xác nhận.",
  selectedServices: "Các dịch vụ đã chọn",
  noServiceSelected: "Chưa chọn dịch vụ nào.",
  submitLocked: "Nút gửi bị khóa cho đến khi hoàn tất:",
  consentCheckbox: "Ô chấp thuận",
  selectService: "Chọn ít nhất một dịch vụ",
  moreFields: "Còn các mục bắt buộc khác ở trên",
  submitOrder: "Gửi Yêu Cầu Đặt Dịch Vụ",
  submitting: "Đang gửi...",
  callText: "Hoặc gọi điện / nhắn tin: +1 (647) 948-4428",
  taxNote: "Giá chưa bao gồm thuế (HST). Dịch vụ chỉ cung cấp tại khu vực GTA.",

  validationError: "Vui lòng điền đầy đủ các mục bắt buộc, đồng ý chấp thuận, và chọn ít nhất một dịch vụ trước khi gửi.",
  submitError: "Không thể gửi đơn. Vui lòng thử lại.",
  successTitle: "Cảm ơn bạn đã đặt dịch vụ — đội ngũ A-Z Housing Solutions của chúng tôi sẽ sớm liên hệ với bạn.",
  successBody: "Một bản sao yêu cầu đặt dịch vụ của bạn đã được gửi đến A-Z Housing Solutions.",

  excludedFeesTitle: "Các chi phí không bao gồm",
  paymentTitle: "Chính sách & Hình thức Thanh toán",
  additional: [
    {
      title: "Xem nhà hộ (một lần)",
      blocks: [
        { heading: "Bao gồm", items: [
          "Đến tận nơi xem và kiểm tra nhà (1 căn)",
          "Video call trực tiếp trong quá trình xem nhà (tối đa 30 phút)",
          "Chụp hình và quay video cơ bản về nhà hoặc phòng",
          "Nhận xét tổng quan về phòng ở, tòa nhà và khu vực xung quanh",
          "Báo cáo tóm tắt ngắn sau buổi xem nhà",
        ] },
        { heading: "Chi phí", items: [
          "$99/lần đối với nhà trong bán kính 20 km tính từ địa chỉ công ty",
          "Vượt quá 20 km: phụ thu thêm $10 cho mỗi 5 km phát sinh",
        ] },
      ],
    },
    {
      title: "Giám hộ cho Du học sinh dưới 18 tuổi",
      blocks: [
        { heading: "Bao gồm", items: [
          "Đóng vai trò người giám hộ tại Canada cho học sinh trong suốt thời gian thỏa thuận",
          "Duy trì thông tin liên lạc hiện hành với học sinh, phụ huynh và nhà trường",
          "Có thể liên lạc được một cách hợp lý khi cần thiết",
          "Hỗ trợ phản hồi trong các trường hợp khẩn cấp",
          "Hướng dẫn học sinh tiếp cận các dịch vụ hỗ trợ phù hợp khi xảy ra vấn đề nghiêm trọng",
          "Liên lạc với phụ huynh khi có vấn đề quan trọng ảnh hưởng đến học sinh",
        ] },
        { heading: "Lưu ý — không bao gồm", note: "Dịch vụ giám hộ không bao gồm vai trò cha mẹ hợp pháp, đại diện pháp lý, tư vấn di trú, tư vấn pháp luật, tư vấn giáo dục, dịch vụ y tế, hỗ trợ tài chính, quản lý chỗ ở, dịch vụ đưa đón hoặc giám sát sinh hoạt hằng ngày của học sinh." },
      ],
    },
    {
      title: "Các chi phí không bao gồm",
      blocks: [
        { note: "Trừ khi có quy định khác, phí dịch vụ không bao gồm:" },
        { items: [
          "Phí luật sư, tư vấn pháp lý, tư vấn di trú và công chứng",
          "Phí nộp hồ sơ chính phủ, visa và giấy phép",
          "Học phí và các khoản phí của trường",
          "Phí dịch thuật và chuyển phát hồ sơ",
          "Chi phí đi lại, đậu xe và lưu trú",
          "Bất kỳ khoản phí phát sinh từ bên thứ ba nào khác",
        ] },
        { note: "Vui lòng liên hệ với chúng tôi để được tư vấn chi tiết." },
      ],
    },
    {
      title: "Chính sách & Hình thức Thanh toán",
      blocks: [
        { heading: "Dịch vụ trên $799", items: [
          "Đợt 1 (20%) — thanh toán khi ký hợp đồng; hoàn 100% nếu hủy ít nhất 14 ngày trước ngày dự kiến đến Canada",
          "Đợt 2 (40%) — thanh toán trước ngày đến Canada 3 ngày",
          "Đợt cuối (40%) — thanh toán sau khi hoàn thành toàn bộ dịch vụ trong hợp đồng",
        ] },
        { heading: "Dịch vụ Xem nhà hộ", items: [
          "Thanh toán toàn bộ khi đặt lịch",
          "Hoàn 100% nếu hủy ít nhất 7 ngày trước ngày xem nhà",
        ] },
        { heading: "Hình thức thanh toán được chấp nhận", items: [
          "Chuyển khoản quốc tế (International Wire Transfer)",
          "PayPal",
          "Chuyển khoản Interac e-Transfer (chỉ sau khi đến Canada)",
          "Tiền mặt (chỉ sau khi đến Canada)",
        ] },
      ],
    },
  ] as AddlItem[],

  fieldLabels: {
    fullName: "Họ và tên", phone: "Số điện thoại", email: "Địa chỉ Email",
    vietnamAddress: "Địa chỉ ở Việt Nam", gtaArea: "Khu vực mong muốn tại GTA",
    gtaCity: "Thành phố mong muốn", accommodationType: "Loại hình nhà ở",
    budget: "Tiền thuê hàng tháng tối đa", arrivalDate: "Ngày dự kiến đến",
  } as Record<string, string>,
};

const COPY: Record<Lang, typeof EN> = { en: EN, vi: VI };

const inputStyle: React.CSSProperties = {
  width: "100%", minWidth: 0, boxSizing: "border-box", border: "1px solid rgba(0,0,0,.16)",
  borderRadius: 12, padding: "13px 15px", background: "#fff", color: "var(--dark, #102247)",
  outline: "none", fontSize: 15, lineHeight: 1.4,
};
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, alignItems: "start" };
const fullStyle: React.CSSProperties = { ...inputStyle, gridColumn: "1 / -1" };

export default function LandingArrangementPage() {
  const [lang, setLang] = useState<Lang>("en");
  const L = COPY[lang];

  const [form, setForm] = useState<FormData>(initialForm);
  const [basic, setBasic] = useState(true);
  const [viewing, setViewing] = useState(false);
  const [secondSearch, setSecondSearch] = useState(false);
  const [airport, setAirport] = useState(false);
  const [busTour, setBusTour] = useState(false);
  const [schoolWork, setSchoolWork] = useState(false);
  const [banking, setBanking] = useState(false);
  const [custodianship, setCustodianship] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth <= 900);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const checks: Record<string, boolean> = { basic, viewing, secondSearch, airport, busTour, schoolWork, banking, custodianship };
  const priceOf: Record<string, number> = {
    basic: PRICES.basic, viewing: PRICES.viewing, secondSearch: PRICES.secondSearch, airport: PRICES.airport,
    busTour: PRICES.busTour, schoolWork: PRICES.schoolWork, banking: PRICES.banking, custodianship: PRICES.custodianship,
  };
  const titleOf = (key: string): string => (L as any)[`${key}Title`];

  const total = useMemo(
    () => Object.keys(checks).reduce((sum, k) => sum + (checks[k] ? priceOf[k] : 0), 0),
    [basic, viewing, secondSearch, airport, busTour, schoolWork, banking, custodianship] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // English payload for the API (drives CRM classification). Order is stable.
  const selectedServices = useMemo(
    () => Object.keys(checks)
      .filter(k => checks[k])
      .map(k => `${SERVICE_PAYLOAD[k]} - ${money(priceOf[k])}`),
    [basic, viewing, secondSearch, airport, busTour, schoolWork, banking, custodianship] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Localized display for the summary.
  const selectedDisplay = useMemo(
    () => Object.keys(checks).filter(k => checks[k]).map(k => `${titleOf(k)} — ${money(priceOf[k])}`),
    [basic, viewing, secondSearch, airport, busTour, schoolWork, banking, custodianship, lang] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const update = (field: keyof FormData, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const requiredFields: (keyof FormData)[] = ["fullName", "phone", "email", "vietnamAddress", "gtaArea", "gtaCity", "accommodationType", "budget", "arrivalDate"];
  const missingRequiredFields = requiredFields.filter(f => String(form[f]).trim().length === 0);
  const allRequiredFilled = missingRequiredFields.length === 0;
  const hasService = selectedServices.length > 0;
  const isFormValid = allRequiredFilled && form.consent && hasService;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!isFormValid) { setError(L.validationError); return; }
    setSubmitting(true);
    try {
      const response = await fetch("/api/landing-arrangement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName, phone: form.phone, email: form.email,
          vietnamAddress: form.vietnamAddress, gtaArea: form.gtaArea, gtaCity: form.gtaCity,
          neighbourhood: form.neighbourhood, accommodationType: form.accommodationType,
          budget: form.budget, bedrooms: form.bedrooms, bathrooms: form.bathrooms,
          arrivalDate: form.arrivalDate, selectedServices, estimatedTotal: total,
          additionalNotes: form.notes, consent: form.consent, language: lang,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || L.submitError);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : L.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  const LangToggle = (
    <button type="button" onClick={() => setLang(lang === "en" ? "vi" : "en")}
      style={{ border: "1.5px solid var(--accent, #f5a623)", background: "transparent", color: "var(--accent, #f5a623)", borderRadius: 999, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 14, letterSpacing: 0.5 }}>
      {L.langButton}
    </button>
  );

  if (submitted) {
    return (
      <main style={{ minHeight: "70vh", background: "var(--cream, #f7f4ef)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 760, background: "#fff", borderRadius: 24, padding: "48px 32px", textAlign: "center", boxShadow: "0 10px 35px rgba(0,0,0,.10)" }}>
          <h1 style={{ fontFamily: "var(--serif)", color: "var(--dark, #102247)", fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: 16 }}>{L.successTitle}</h1>
          <p style={{ color: "var(--mid, #666)", lineHeight: 1.7 }}>{L.successBody}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream, #f7f4ef)", color: "var(--dark, #102247)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--dark, #102247), #1a2a4a)", color: "#fff", padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>{LangToggle}</div>
          <div style={{ color: "var(--accent, #f5a623)", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{L.badge}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.15, marginBottom: 16 }}>{L.heroTitle}</h1>
          <p style={{ color: "rgba(255,255,255,.78)", fontSize: 18, lineHeight: 1.7, margin: "0 auto", maxWidth: 720 }}>{L.heroSub}</p>
        </div>
      </section>

      {/* Intro + why + before + after */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "32px 16px" : "56px 24px", display: "grid", gap: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "clamp(20px,4vw,34px)", boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: "1px solid rgba(0,0,0,.07)" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "var(--dark, #102247)", marginBottom: 14 }}>{L.introTitle}</h2>
          <p style={{ color: "var(--mid, #666)", lineHeight: 1.8 }}>{L.introBody}</p>
        </div>

        {/* Why (risk points) — warning tint */}
        <div style={{ background: "#fff8e1", borderRadius: 20, padding: "clamp(20px,4vw,30px)", border: "1px solid #ffe082" }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--dark, #102247)", marginBottom: 14 }}>{L.whyTitle}</h3>
          <CheckList items={L.whyItems} marker="!" markerColor="#c98a00" textColor="#6b5a1e" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
          <InfoCard title={L.beforeTitle} items={L.beforeItems} accent />
          <InfoCard title={L.afterTitle} items={L.afterItems} />
        </div>

        <p style={{ alignSelf: "center", display: "inline-block", background: "#fff", border: "1px solid rgba(0,0,0,.10)", borderRadius: 12, padding: "10px 16px", color: "var(--dark, #102247)", fontSize: 14, fontWeight: 600, textAlign: "center" }}>{L.gtaOnlyNote}</p>
      </section>

      {/* Packages & Pricing — collapsible tabs */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "8px 16px 40px" : "8px 24px 64px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem,3vw,2.1rem)", color: "var(--dark, #102247)", textAlign: "center", marginBottom: 6 }}>{L.pricingTitle}</h2>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--serif)", fontWeight: 900, color: "var(--accent, #c4901a)", fontSize: "clamp(1.7rem,4.5vw,2.6rem)", lineHeight: 1.1 }}>{L.startingFrom}</span>
        </div>
        <p style={{ color: "var(--mid, #666)", textAlign: "center", maxWidth: 720, margin: "0 auto 6px", fontSize: 14, lineHeight: 1.7 }}>{L.pricingNote}</p>
        <p style={{ color: "var(--mid, #666)", textAlign: "center", fontSize: 13, marginBottom: 24 }}>{L.pricingHint}</p>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Tab 1 — Single Property Viewing */}
          <Accordion title={L.viewingTitle} price={L.viewingPrice}>
            <Blocks blocks={L.additional[0].blocks} />
          </Accordion>

          {/* Tab 2 — Basic Package */}
          <Accordion title={L.basicTitle} price={L.basicPrice}>
            <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, margin: "4px 0 12px", fontSize: 14 }}>{L.basicIntro}</p>
            <CheckList items={L.basicBullets} size={13.5} />
          </Accordion>

          {/* Tab 3 — Add-On Services */}
          <Accordion title={L.addOnsTitle}>
            <div style={{ background: "var(--cream, #f7f4ef)", borderRadius: 14, padding: 16, marginTop: 6, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 8, flexWrap: "wrap" }}>
                <strong style={{ color: "var(--dark, #102247)", fontSize: 15 }}>{L.secondSearchTitle}</strong>
                <span style={{ color: "var(--accent, #c4901a)", fontWeight: 900, fontSize: 16, whiteSpace: "nowrap" }}>{L.secondSearchPrice}</span>
              </div>
              <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, margin: "0 0 10px", fontSize: 13.5 }}>{L.secondSearchIntro}</p>
              <CheckList items={L.secondSearchBullets} size={13.5} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <PriceCard title={L.airportTitle} price={L.airportPrice} note={L.airportNote} />
              <PriceCard title={L.busTourTitle} price={L.busTourPrice} />
              <PriceCard title={L.schoolWorkTitle} price={L.schoolWorkPrice} note={L.schoolWorkNote} />
              <PriceCard title={L.bankingTitle} price={L.bankingPrice} note={L.bankingNote} />
            </div>
          </Accordion>

          {/* Tab 4 — Custodianship (includes + exclusions together) */}
          <Accordion title={L.custodianshipTitle} price={L.custodianshipPrice}>
            <Blocks blocks={L.additional[1].blocks} />
          </Accordion>

          {/* Tab 5 — Payment Terms & Methods (+ Excluded Fees) */}
          <Accordion title={L.paymentTitle}>
            <Blocks blocks={L.additional[3].blocks} />
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,.08)" }}>
              <div style={{ fontWeight: 700, color: "var(--dark, #102247)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{L.excludedFeesTitle}</div>
              <Blocks blocks={L.additional[2].blocks} />
            </div>
          </Accordion>

          {/* Tab 6 — Order Now (form, open by default) */}
          <Accordion title={L.orderNowTab} defaultOpen>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 18, marginTop: 6 }}>
                <p style={{ color: "var(--mid, #666)", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{L.formSub}</p>

                <Card title={L.section1}>
                  <div style={gridStyle}>
                    <input required style={inputStyle} placeholder={L.fullName} value={form.fullName} onChange={e => update("fullName", e.target.value)} />
                    <input required style={inputStyle} placeholder={L.phone} value={form.phone} onChange={e => update("phone", e.target.value)} />
                    <input required type="email" style={inputStyle} placeholder={L.email} value={form.email} onChange={e => update("email", e.target.value)} />
                    <input required style={fullStyle} placeholder={L.vietnamAddress} value={form.vietnamAddress} onChange={e => update("vietnamAddress", e.target.value)} />
                  </div>
                </Card>

                <Card title={L.section2}>
                  <div style={gridStyle}>
                    <input required style={fullStyle} placeholder={L.gtaArea} value={form.gtaArea} onChange={e => update("gtaArea", e.target.value)} />
                    <select required style={inputStyle} value={form.gtaCity} onChange={e => update("gtaCity", e.target.value)}>
                      <option value="">{L.gtaCity}</option>
                      {L.gtaCityOptions.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <input style={inputStyle} placeholder={L.neighbourhood} value={form.neighbourhood} onChange={e => update("neighbourhood", e.target.value)} />
                    <select required style={inputStyle} value={form.accommodationType} onChange={e => update("accommodationType", e.target.value)}>
                      <option value="">{L.accommodationType}</option>
                      {L.accommodationOptions.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <input required style={inputStyle} placeholder={L.budget} value={form.budget} onChange={e => update("budget", e.target.value)} />
                    <input style={inputStyle} placeholder={L.bedrooms} value={form.bedrooms} onChange={e => update("bedrooms", e.target.value)} />
                    <input style={inputStyle} placeholder={L.bathrooms} value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
                    <input required style={inputStyle} placeholder={L.arrivalDate} value={form.arrivalDate} onChange={e => update("arrivalDate", e.target.value)} />
                  </div>
                </Card>

                <Card title={L.section3}>
                  <ServiceCheck checked={basic}         onChange={setBasic}         title={L.basicTitle}         price={L.basicPrice}         note={L.basicFormNote} />
                  <ServiceCheck checked={viewing}       onChange={setViewing}       title={L.viewingTitle}       price={L.viewingPrice}       note={L.viewingFormNote} />
                  <ServiceCheck checked={secondSearch}  onChange={setSecondSearch}  title={L.secondSearchTitle}  price={L.secondSearchPrice}  note={L.secondSearchFormNote} />
                  <ServiceCheck checked={airport}       onChange={setAirport}       title={L.airportTitle}       price={L.airportPrice}       note={L.airportNote} />
                  <ServiceCheck checked={busTour}       onChange={setBusTour}       title={L.busTourTitle}       price={L.busTourPrice} />
                  <ServiceCheck checked={schoolWork}    onChange={setSchoolWork}    title={L.schoolWorkTitle}    price={L.schoolWorkPrice}    note={L.schoolWorkNote} />
                  <ServiceCheck checked={banking}       onChange={setBanking}       title={L.bankingTitle}       price={L.bankingPrice}       note={L.bankingNote} />
                  <ServiceCheck checked={custodianship} onChange={setCustodianship} title={L.custodianshipTitle} price={L.custodianshipPrice} note={L.custodianshipFormNote} />
                </Card>

                <Card title={L.section4}>
                  <textarea style={{ ...fullStyle, minHeight: 120, resize: "vertical" }} placeholder={L.notesPlaceholder} value={form.notes} onChange={e => update("notes", e.target.value)} />
                </Card>

                <Card title={L.section5}>
                  <label style={{ display: "flex", gap: 12, lineHeight: 1.6, color: "var(--mid, #666)" }}>
                    <input required type="checkbox" checked={form.consent} onChange={e => update("consent", e.target.checked)} style={{ marginTop: 5 }} />
                    <span>{L.consentText}</span>
                  </label>
                </Card>

                {/* Summary + submit */}
                <div style={{ background: "#fff", borderRadius: 20, padding: 26, boxShadow: "0 10px 35px rgba(0,0,0,.10)", border: "1px solid rgba(0,0,0,.07)" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "var(--mid, #666)" }}>{L.estimatedTotal}</div>
                  <div style={{ fontSize: 46, fontWeight: 900, margin: "12px 0", color: "var(--dark, #102247)" }}>{money(total)}</div>
                  <p style={{ color: "var(--mid, #666)", lineHeight: 1.6, fontSize: 13 }}>{L.estimatedNote}</p>

                  <div style={{ background: "var(--cream, #f7f4ef)", borderRadius: 14, padding: 16, marginTop: 20 }}>
                    <strong>{L.selectedServices}</strong>
                    <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.7 }}>
                      {selectedDisplay.length ? selectedDisplay.map((s, i) => <li key={i}>{s}</li>) : <li>{L.noServiceSelected}</li>}
                    </ul>
                  </div>

                  {!isFormValid && (
                    <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", borderRadius: 12, padding: 12, marginTop: 16, color: "#9a1b1b", fontSize: 12.5, lineHeight: 1.5 }}>
                      <strong>{L.submitLocked}</strong>
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                        {missingRequiredFields.slice(0, 5).map(f => <li key={f}>{L.fieldLabels[f] || f}</li>)}
                        {!form.consent && <li>{L.consentCheckbox}</li>}
                        {!hasService && <li>{L.selectService}</li>}
                        {missingRequiredFields.length > 5 && <li>{L.moreFields}</li>}
                      </ul>
                    </div>
                  )}

                  {error && <p style={{ color: "#b00020", fontSize: 13, lineHeight: 1.5, marginTop: 16 }}>{error}</p>}

                  <button type="submit" disabled={!isFormValid || submitting}
                    style={{ width: "100%", marginTop: 22, border: "none", borderRadius: 12, padding: "15px 18px", fontWeight: 800, textAlign: "center", background: !isFormValid || submitting ? "#9aa3b2" : "var(--dark, #102247)", color: "#fff", cursor: !isFormValid || submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? L.submitting : L.submitOrder}
                  </button>

                  <p style={{ textAlign: "center", color: "var(--mid, #666)", fontSize: 13, marginTop: 14 }}>{L.callText}</p>
                </div>

                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 16, padding: 18, color: "#7a6000", fontSize: 13, lineHeight: 1.7 }}>{L.taxNote}</div>
              </div>
            </form>
          </Accordion>
        </div>
      </section>
    </main>
  );
}

function Accordion({ title, price, defaultOpen = false, children }: { title: string; price?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: open ? "1px solid var(--accent, #f5a623)" : "1px solid rgba(0,0,0,.10)", overflow: "hidden", transition: "border-color .2s" }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 18px", background: open ? "var(--cream, #f7f4ef)" : "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ fontWeight: 800, color: "var(--dark, #102247)", fontSize: 15.5 }}>{title}</span>
          {price && <span style={{ color: "var(--accent, #c4901a)", fontWeight: 900, fontSize: 15, whiteSpace: "nowrap" }}>{price}</span>}
        </span>
        <span aria-hidden="true" style={{ flexShrink: 0, color: "var(--accent, #f5a623)", fontSize: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▼</span>
      </button>
      {open && <div style={{ padding: "4px 18px 20px" }}>{children}</div>}
    </div>
  );
}

function Blocks({ blocks }: { blocks: AddlBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 8 : 16 }}>
          {b.heading && <div style={{ fontWeight: 700, color: "var(--dark, #102247)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{b.heading}</div>}
          {b.items && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 7 }}>
              {b.items.map((it, j) => (
                <li key={j} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "var(--mid, #666)", lineHeight: 1.6, fontSize: 13.5 }}>
                  <span aria-hidden="true" style={{ color: "var(--accent, #f5a623)", fontWeight: 900, flexShrink: 0, lineHeight: 1.5 }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
          {b.note && <p style={{ color: "var(--mid, #666)", fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>{b.note}</p>}
        </div>
      ))}
    </>
  );
}

function CheckList({ items, marker = "✓", markerColor = "#1a8f5c", textColor = "var(--mid, #666)", size = 14.5 }: { items: string[]; marker?: string; markerColor?: string; textColor?: string; size?: number }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: textColor, lineHeight: 1.7, fontSize: size }}>
          <span aria-hidden="true" style={{ color: markerColor, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{marker}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <section style={{ background: "#fff", borderRadius: 20, padding: "clamp(20px,4vw,30px)", boxShadow: "0 4px 24px rgba(0,0,0,.07)", border: accent ? "2px solid var(--accent, #f5a623)" : "1px solid rgba(0,0,0,.07)", height: "100%" }}>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.35rem", color: "var(--dark, #102247)", marginBottom: 14, lineHeight: 1.3 }}>{title}</h3>
      <CheckList items={items} />
    </section>
  );
}

function PriceCard({ title, price, note }: { title: string; price: string; note?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,.06)", border: "1px solid rgba(0,0,0,.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <strong style={{ color: "var(--dark, #102247)", fontSize: 15 }}>{title}</strong>
        <span style={{ color: "var(--accent, #c4901a)", fontWeight: 900, whiteSpace: "nowrap" }}>{price}</span>
      </div>
      {note && <p style={{ color: "var(--mid, #666)", fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" }}>{note}</p>}
    </div>
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
