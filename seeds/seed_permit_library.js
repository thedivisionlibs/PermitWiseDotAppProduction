/**
 * seed_permit_library.js
 * Run: node seed_permit_library.js
 * Requires: MONGODB_URI in env
 */
const mongoose = require("mongoose");

const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["city", "county", "state"], required: true },
  city: String,
  county: String,
  state: { type: String, required: true },
  notes: String,
  contactInfo: { website: String, phone: String, email: String, address: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const permitTypeSchema = new mongoose.Schema({
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: "Jurisdiction", required: true },
  vendorTypes: [{ type: String }],
  name: { type: String, required: true },
  description: String,
  issuingAuthorityName: String,
  issuingAuthorityContact: { website: String, phone: String, email: String, address: String },
  defaultDurationDays: { type: Number, default: 365 },
  renewalPeriodMonths: { type: Number, default: 12 },
  estimatedCost: String,
  applicationUrl: String,
  pdfTemplateUrl: String,
  requiredDocuments: [{ type: String }],
  renewalLeadTimeDays: { type: Number, default: 30 },
  importanceLevel: { type: String, enum: ["critical", "often_forgotten", "event_required"], default: "critical" },
  formFields: [{
    fieldName: String,
    fieldType: { type: String, enum: ["text", "date", "checkbox", "select"] },
    mappedTo: String,
    required: Boolean
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);
const PermitType = mongoose.model("PermitType", permitTypeSchema);

// Keep in sync with your VendorBusiness enum (includes food_cart)
const VENDOR_TYPES_ALL = [
  "food_truck",
  "food_cart",
  "tent_vendor",
  "mobile_retail",
  "farmers_market",
  "craft_vendor",
  "mobile_bartender",
  "mobile_groomer",
  "pop_up_shop",
  "other",
];

const FOOD_VENDOR_TYPES = [
  "food_truck",
  "food_cart",
  "farmers_market",
  "tent_vendor",
  "mobile_bartender",
  "pop_up_shop",
];

const DEFAULT_FORM_FIELDS = [
  { fieldName: "Business Legal Name", fieldType: "text", mappedTo: "businessName", required: true },
  { fieldName: "DBA Name", fieldType: "text", mappedTo: "dbaName", required: false },
  { fieldName: "EIN", fieldType: "text", mappedTo: "ein", required: false },
  { fieldName: "Business Phone", fieldType: "text", mappedTo: "phone", required: false },
  { fieldName: "Business Email", fieldType: "text", mappedTo: "email", required: false },
  { fieldName: "Street Address", fieldType: "text", mappedTo: "address.street", required: false },
  { fieldName: "City", fieldType: "text", mappedTo: "address.city", required: false },
  { fieldName: "State", fieldType: "text", mappedTo: "address.state", required: false },
  { fieldName: "ZIP", fieldType: "text", mappedTo: "address.zip", required: false },
];

function coreCityPermits(jurisdictionName, state) {
  return [
    {
      jurisdictionName, state,
      name: "General Business License / Registration",
      description: "Baseline business registration commonly required to operate within the jurisdiction.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${jurisdictionName} Business Licensing`,
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Government ID", "Business formation docs (if applicable)"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      formFields: DEFAULT_FORM_FIELDS,
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Sales / Use Tax Permit (State)",
      description: "State sales tax registration for selling taxable goods/services (commonly needed by vendors).",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${state} Department of Revenue / Tax Agency`,
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 3650,
      renewalPeriodMonths: 0, // Treat as long-lived / non-expiring unless your UX enforces expiry
      estimatedCost: "Often free (varies by state)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["SSN/EIN"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      formFields: DEFAULT_FORM_FIELDS,
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Liability Insurance Certificate",
      description: "Proof of general liability insurance often required by events, property owners, or municipalities.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: "Insurance Provider",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "$200 - $1,200 (varies)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Policy documentation / COI"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      formFields: [],
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Workers’ Compensation Insurance (if employees)",
      description: "Required if you have employees in many jurisdictions.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: "Insurance Provider / State WC Agency",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Policy documentation"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      formFields: [],
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Fire Safety Inspection (if using propane/generators)",
      description: "Often required for food trucks/carts using propane, open flames, or generators.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Local Fire Department",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies ($0-$200 typical)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Fire suppression/extinguisher documentation (if applicable)"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      formFields: [],
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Food Safety Certification (Manager/Handler as required)",
      description: "Food manager/handler certification requirements vary by state/city; commonly required for food operations.",
      vendorTypes: FOOD_VENDOR_TYPES,
      issuingAuthorityName: "Approved Training Provider",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 1095,
      renewalPeriodMonths: 36,
      estimatedCost: "$10 - $150",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Completion certificate(s)"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      formFields: [],
      active: true,
    },
    {
      jurisdictionName, state,
      name: "Commissary / Service Area Agreement (if required)",
      description: "Many mobile food operations must operate from an approved commissary; keep agreement on file.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Commissary / Shared Kitchen",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Signed commissary/service agreement"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      formFields: [],
      active: true,
    },
  ];
}

const permitLibrary = [
  // ===== AUSTIN, TX =====
  ...coreCityPermits("Austin, TX", "TX"),
  {
    jurisdictionName: "Austin, TX",
    state: "TX",
    name: "Mobile Food Vendor Permit",
    description: "Required for mobile food vendors operating in Austin; managed through Austin Public Health.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "Austin Public Health",
    issuingAuthorityContact: {
      website: "https://www.austintexas.gov/department/mobile-food-vendors",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies (city fee schedule)",
    applicationUrl: "https://www.austintexas.gov/department/mobile-food-vendors",
    pdfTemplateUrl: "https://www.austintexas.gov/sites/default/files/files/Health/Environmental/Food/mobile_food_vendor_packet_english_1-15-15.pdf",
    requiredDocuments: ["Proof of Texas sales & use tax permit", "Insurance", "Commissary agreement (if required)"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // ===== MIAMI, FL =====
  ...coreCityPermits("Miami, FL", "FL"),
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "Florida DBPR Mobile Food Dispensing Vehicle (MFDV) License",
    description: "State food-service license for mobile food units (including MFDVs/hot dog carts).",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "Florida DBPR (Hotels & Restaurants)",
    issuingAuthorityContact: {
      website: "https://www2.myfloridalicense.com/hotels-restaurants/licensing/mfdv-guide/",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "$347 (license fee category listed by DBPR)",
    applicationUrl: "https://www2.myfloridalicense.com/hotels-restaurants/licensing/mfdv-guide/",
    pdfTemplateUrl: "",
    requiredDocuments: ["Application", "Commissary agreement (if applicable)", "Plan review/inspection as required"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "Miami-Dade County Local Business Tax Receipt",
    description: "Local business tax receipt required for businesses operating in Miami-Dade County.",
    vendorTypes: VENDOR_TYPES_ALL,
    issuingAuthorityName: "Miami-Dade County Tax Collector",
    issuingAuthorityContact: {
      website: "https://mdctaxcollector.gov/services/local-business-tax-receipt",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies by business type",
    applicationUrl: "https://mdctaxcollector.gov/services/local-business-tax-receipt",
    pdfTemplateUrl: "https://www.miamidade.gov/resources-port/documents/foodtruck-business-permit-guidelines.pdf",
    requiredDocuments: ["Business registration docs", "DBPR license (if food)", "Vehicle photos (often requested)"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "City of Miami Business Tax Receipt (BTR)",
    description: "City business tax receipt required to do business within the City of Miami.",
    vendorTypes: VENDOR_TYPES_ALL,
    issuingAuthorityName: "City of Miami",
    issuingAuthorityContact: {
      website: "https://www.miami.gov/Business-Licenses/Business-Licensing/Get-a-Business-Tax-Receipt-BTR",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies",
    applicationUrl: "https://www.miami.gov/Business-Licenses/Business-Licensing/Get-a-Business-Tax-Receipt-BTR",
    pdfTemplateUrl: "",
    requiredDocuments: ["County business tax receipt (often required first)", "Basic business info"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // ===== NEW YORK CITY, NY =====
  ...coreCityPermits("New York City, NY", "NY"),
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Mobile Food Vending Unit Permit (Full-Term)",
    description: "Permit for the vending unit (truck/cart). Full-term permits are typically 2 years; fee varies by unit class.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "NYC DOHMH",
    issuingAuthorityContact: { website: "https://nyc-business.nyc.gov/nycbusiness/description/mobile-food-vending-unit-permit-full-term", phone: "", email: "", address: "" },
    defaultDurationDays: 730,
    renewalPeriodMonths: 24,
    estimatedCost: "$200 (processing unit); $75 (non-processing unit) — varies by classification",
    applicationUrl: "https://nyc-business.nyc.gov/nycbusiness/description/mobile-food-vending-unit-permit-full-term",
    pdfTemplateUrl: "https://www.nyc.gov/assets/doh/downloads/pdf/sbs/mfv-new-permit-application.pdf",
    requiredDocuments: ["Application", "Insurance", "Unit details/photos (often requested)"],
    renewalLeadTimeDays: 45,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Mobile Food Vending License (Personal License)",
    description: "Individual license required to operate as a mobile food vendor in NYC.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "NYC DOHMH",
    issuingAuthorityContact: { website: "https://nyc-business.nyc.gov/nycbusiness/description/mobile-food-vending-license", phone: "", email: "", address: "" },
    defaultDurationDays: 730,
    renewalPeriodMonths: 24,
    estimatedCost: "$50 (2-year full-term license)",
    applicationUrl: "https://nyc-business.nyc.gov/nycbusiness/description/mobile-food-vending-license",
    pdfTemplateUrl: "",
    requiredDocuments: ["Government-issued ID"],
    renewalLeadTimeDays: 45,
    importanceLevel: "critical",
    formFields: [],
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Restricted Area Mobile Food Vending Permit (if operating in restricted zones)",
    description: "Additional permit if operating in NYC restricted areas; rules/fees vary by permit type.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "NYC",
    issuingAuthorityContact: { website: "https://nyc-business.nyc.gov/nycbusiness/description/restricted-area-permit", phone: "", email: "", address: "" },
    defaultDurationDays: 730,
    renewalPeriodMonths: 24,
    estimatedCost: "$200 (processing) / $75 (non-processing) shown on NYC business portal for restricted permits",
    applicationUrl: "https://nyc-business.nyc.gov/nycbusiness/description/restricted-area-permit",
    pdfTemplateUrl: "",
    requiredDocuments: ["Unit permit details", "Operating plan"],
    renewalLeadTimeDays: 45,
    importanceLevel: "event_required",
    formFields: [],
    active: true,
  },

  // ===== DALLAS TOWNSHIP, PA (Back Mountain area) =====
  ...coreCityPermits("Dallas Township, PA", "PA"),
  {
    jurisdictionName: "Dallas Township, PA",
    state: "PA",
    name: "Local Mobile Food Facilities / Booths Approval (Township)",
    description: "Local rules apply to mobile food facilities and booths in Dallas Township; confirm zoning/location and township approval requirements.",
    vendorTypes: ["food_truck", "food_cart", "tent_vendor"],
    issuingAuthorityName: "Dallas Township (Luzerne County, PA)",
    issuingAuthorityContact: { website: "https://www.dallastwp.org/", phone: "", email: "", address: "" },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies (see township ordinance / township office)",
    applicationUrl: "https://www.dallastwp.org/",
    pdfTemplateUrl: "https://www.dallastwp.org/wp-content/uploads/2021/03/Ordinance-2021-1-Mobile-Food-Facilities-Signed.pdf",
    requiredDocuments: ["Site/location details", "Insurance", "Food permits (if applicable)"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // ===== “Starter Packs” for added cities (fill URLs later; complete schema now) =====
  ...coreCityPermits("Philadelphia, PA", "PA"),
  ...coreCityPermits("Pittsburgh, PA", "PA"),
  ...coreCityPermits("Harrisburg, PA", "PA"),
  ...coreCityPermits("Allentown, PA", "PA"),
  ...coreCityPermits("Erie, PA", "PA"),
  ...coreCityPermits("Lancaster, PA", "PA"),
  ...coreCityPermits("Portland, OR", "OR"),
  ...coreCityPermits("Los Angeles, CA", "CA"),
  ...coreCityPermits("San Francisco, CA", "CA"),
  ...coreCityPermits("Houston, TX", "TX"),
  ...coreCityPermits("Denver, CO", "CO"),
  ...coreCityPermits("San Diego, CA", "CA"),
  ...coreCityPermits("Chicago, IL", "IL"),
  ...coreCityPermits("Phoenix, AZ", "AZ"),
  ...coreCityPermits("Atlanta, GA", "GA"),
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);

  // Build a lookup table for jurisdictionId by name+state
  const allJur = await Jurisdiction.find({ active: true });
  const jurMap = new Map(allJur.map(j => [`${j.name}|${j.state}`, j]));

  let upserts = 0;

  for (const p of permitLibrary) {
    const j = jurMap.get(`${p.jurisdictionName}|${p.state}`);
    if (!j) {
      console.warn(`Missing jurisdiction in DB: ${p.jurisdictionName} (${p.state})`);
      continue;
    }

    const doc = {
      jurisdictionId: j._id,
      vendorTypes: p.vendorTypes,
      name: p.name,
      description: p.description || "",
      issuingAuthorityName: p.issuingAuthorityName || "",
      issuingAuthorityContact: p.issuingAuthorityContact || { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: p.defaultDurationDays ?? 365,
      renewalPeriodMonths: p.renewalPeriodMonths ?? 12,
      estimatedCost: p.estimatedCost || "",
      applicationUrl: p.applicationUrl || "",
      pdfTemplateUrl: p.pdfTemplateUrl || "",
      requiredDocuments: p.requiredDocuments || [],
      renewalLeadTimeDays: p.renewalLeadTimeDays ?? 30,
      importanceLevel: p.importanceLevel || "critical",
      formFields: p.formFields || [],
      active: p.active !== false,
      updatedAt: new Date(),
    };

    await PermitType.findOneAndUpdate(
      { jurisdictionId: j._id, name: p.name },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    upserts++;
  }

  console.log(`Upserted ${upserts} permit types.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
