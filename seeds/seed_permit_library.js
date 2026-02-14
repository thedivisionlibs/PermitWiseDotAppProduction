// seeds/seed_permit_library.js

const mongoose = require("mongoose");

const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["city", "county", "state"], required: true },
  city: { type: String },
  county: { type: String },
  state: { type: String, required: true },
  notes: { type: String },
  contactInfo: {
    website: String,
    phone: String,
    email: String,
    address: String,
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const permitTypeSchema = new mongoose.Schema({
  jurisdictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Jurisdiction",
    required: true,
  },
  vendorTypes: [{ type: String }],
  name: { type: String, required: true },
  description: { type: String },
  issuingAuthorityName: { type: String },
  issuingAuthorityContact: {
    website: String,
    phone: String,
    email: String,
    address: String,
  },
  defaultDurationDays: { type: Number, default: 365 },
  renewalPeriodMonths: { type: Number, default: 12 },
  estimatedCost: { type: String },
  applicationUrl: { type: String },
  pdfTemplateUrl: { type: String },
  requiredDocuments: [{ type: String }],
  renewalLeadTimeDays: { type: Number, default: 30 },
  importanceLevel: {
    type: String,
    enum: ["critical", "often_forgotten", "event_required"],
    default: "critical",
  },
  requiresFoodHandling: { type: Boolean, default: false },
  formFields: [
    {
      fieldName: String,
      fieldType: { type: String, enum: ["text", "date", "checkbox", "select"] },
      mappedTo: String,
      required: Boolean,
    },
  ],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);
const PermitType = mongoose.model("PermitType", permitTypeSchema);

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

// =========================================================================
// STATE TAX / SALES TAX REGISTRATION URLS (all 50 states + DC)
// =========================================================================
const STATE_TAX_URLS = {
  AL: "https://myalabamataxes.alabama.gov/",
  AK: "", // No state sales tax
  AZ: "https://azdor.gov/transaction-privilege-tax",
  AR: "https://www.dfa.arkansas.gov/excise-tax/sales-use-tax/",
  CA: "https://www.cdtfa.ca.gov/taxes-and-fees/faq-sellers-permit.htm",
  CO: "https://tax.colorado.gov/sales-use-tax",
  CT: "https://portal.ct.gov/DRS/Sales-Tax/Sales-and-Use-Tax",
  DE: "", // No state sales tax
  DC: "https://otr.cfo.dc.gov/page/sales-and-use-tax",
  FL: "https://floridarevenue.com/taxes/taxesfees/pages/sales_tax.aspx",
  GA: "https://dor.georgia.gov/taxes/sales-use-tax",
  HI: "https://tax.hawaii.gov/geninfo/get/",
  ID: "https://tax.idaho.gov/i-1023.cfm",
  IL: "https://tax.illinois.gov/research/taxinformation/sales.html",
  IN: "https://www.in.gov/dor/business-tax/sales-tax/",
  IA: "https://tax.iowa.gov/iowa-sales-and-use-tax",
  KS: "https://www.ksrevenue.gov/salesanduse.html",
  KY: "https://revenue.ky.gov/Business/Sales-Use-Tax/Pages/default.aspx",
  LA: "https://revenue.louisiana.gov/SalesTax",
  ME: "https://www.maine.gov/revenue/taxes/sales-use-tax",
  MD: "https://www.marylandtaxes.gov/business/sales-use/",
  MA: "https://www.mass.gov/sales-and-use-tax",
  MI: "https://www.michigan.gov/taxes/business-taxes/sales-use-tax",
  MN: "https://www.revenue.state.mn.us/sales-and-use-tax",
  MS: "https://www.dor.ms.gov/business/sales-tax",
  MO: "https://dor.mo.gov/business/sales/",
  MT: "", // No state sales tax
  NE: "https://revenue.nebraska.gov/businesses/sales-and-use-tax",
  NV: "https://tax.nv.gov/FAQs/Sales_Tax_Information/",
  NH: "", // No state sales tax
  NJ: "https://www.nj.gov/treasury/taxation/su_over.shtml",
  NM: "https://www.tax.newmexico.gov/businesses/gross-receipts-overview/",
  NY: "https://www.tax.ny.gov/bus/st/stidx.htm",
  NC: "https://www.ncdor.gov/taxes-forms/sales-and-use-tax",
  ND: "https://www.tax.nd.gov/business/sales-and-use-tax",
  OH: "https://tax.ohio.gov/sales-and-use",
  OK: "https://oklahoma.gov/tax/businesses/sales-use-tax.html",
  OR: "", // No state sales tax
  PA: "https://www.revenue.pa.gov/TaxTypes/SUT/Pages/default.aspx",
  RI: "https://tax.ri.gov/tax-sections/sales-excise-taxes/sales-use-tax",
  SC: "https://dor.sc.gov/tax/sales",
  SD: "https://dor.sd.gov/businesses/taxes/sales-use-tax/",
  TN: "https://www.tn.gov/revenue/taxes/sales-and-use-tax.html",
  TX: "https://comptroller.texas.gov/taxes/permit/",
  UT: "https://tax.utah.gov/sales",
  VT: "https://tax.vermont.gov/business/sales-and-use-tax",
  VA: "https://www.tax.virginia.gov/sales-and-use-tax",
  WA: "https://dor.wa.gov/taxes-rates/retail-sales-tax",
  WV: "https://tax.wv.gov/Business/SalesAndUseTax/Pages/SalesAndUseTax.aspx",
  WI: "https://www.revenue.wi.gov/Pages/FAQS/pcs-sales.aspx",
  WY: "https://revenue.wyo.gov/tax-types/sales-use-tax",
};

// =========================================================================
// CORE CITY PERMITS – generic baseline bundle for every jurisdiction
// =========================================================================
function coreCityPermits(jurisdictionName, state) {
  return [
    {
      jurisdictionName, state,
      name: "General Business License / Registration",
      description: "Baseline business registration commonly required to operate within this jurisdiction.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${jurisdictionName} Business Licensing`,
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365, renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "", pdfTemplateUrl: "",
      requiredDocuments: ["Government ID", "Business formation docs (if applicable)"],
      renewalLeadTimeDays: 30, importanceLevel: "critical",
      requiresFoodHandling: false, formFields: DEFAULT_FORM_FIELDS, active: true,
    },
    {
      jurisdictionName, state,
      name: "State Sales / Use Tax Permit",
      description: "State sales/use tax registration required to collect and remit tax on taxable sales.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${state} Department of Revenue / Tax Agency`,
      issuingAuthorityContact: { website: STATE_TAX_URLS[state] || "", phone: "", email: "", address: "" },
      defaultDurationDays: 3650, renewalPeriodMonths: 0,
      estimatedCost: "Often free (varies by state)",
      applicationUrl: STATE_TAX_URLS[state] || "", pdfTemplateUrl: "",
      requiredDocuments: ["SSN/EIN"],
      renewalLeadTimeDays: 30, importanceLevel: "critical",
      requiresFoodHandling: false, formFields: DEFAULT_FORM_FIELDS, active: true,
    },
    {
      jurisdictionName, state,
      name: "Liability Insurance Certificate",
      description: "Proof of general liability insurance ($1M minimum) often required by events, landlords, and municipalities.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: "Insurance Provider",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365, renewalPeriodMonths: 12,
      estimatedCost: "$1,800–$8,000/yr",
      applicationUrl: "", pdfTemplateUrl: "",
      requiredDocuments: ["Certificate of insurance (COI) listing required additional insureds"],
      renewalLeadTimeDays: 15, importanceLevel: "critical",
      requiresFoodHandling: false, formFields: [], active: true,
    },
    {
      jurisdictionName, state,
      name: "Fire Safety Inspection / Fire Permit",
      description: "Fire inspection/permit for propane, generators, suppression systems, or event approvals.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Local Fire Department",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365, renewalPeriodMonths: 12,
      estimatedCost: "Varies ($0–$200 typical)",
      applicationUrl: "", pdfTemplateUrl: "",
      requiredDocuments: ["Fire extinguisher/suppression documentation"],
      renewalLeadTimeDays: 30, importanceLevel: "often_forgotten",
      requiresFoodHandling: false, formFields: [], active: true,
    },
    {
      jurisdictionName, state,
      name: "Food Safety Certification (Manager/Handler)",
      description: "Food manager/handler certification requirements for staff and/or owner.",
      vendorTypes: FOOD_VENDOR_TYPES,
      issuingAuthorityName: "Approved Training Provider",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 1095, renewalPeriodMonths: 36,
      estimatedCost: "$10–$175",
      applicationUrl: "", pdfTemplateUrl: "",
      requiredDocuments: ["Completion certificate(s)"],
      renewalLeadTimeDays: 30, importanceLevel: "critical",
      requiresFoodHandling: true, formFields: [], active: true,
    },
    {
      jurisdictionName, state,
      name: "Commissary / Service Base Agreement",
      description: "Proof of commissary or base-of-operations for mobile food vendors.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Commissary / Shared Kitchen",
      issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: 365, renewalPeriodMonths: 12,
      estimatedCost: "$150–$2,000/month",
      applicationUrl: "", pdfTemplateUrl: "",
      requiredDocuments: ["Signed commissary agreement"],
      renewalLeadTimeDays: 30, importanceLevel: "often_forgotten",
      requiresFoodHandling: true, formFields: [], active: true,
    },
  ];
}

// =========================================================================
// HELPER – shorthand for making a city-specific permit object
// =========================================================================
function sp(jur, st, name, desc, opts = {}) {
  return {
    jurisdictionName: jur, state: st, name, description: desc,
    vendorTypes: opts.vt || FOOD_VENDOR_TYPES,
    issuingAuthorityName: opts.auth || "",
    issuingAuthorityContact: { website: opts.url || "", phone: opts.phone || "", email: opts.email || "", address: opts.addr || "" },
    defaultDurationDays: opts.days || 365,
    renewalPeriodMonths: opts.renew || 12,
    estimatedCost: opts.cost || "Varies",
    applicationUrl: opts.appUrl || opts.url || "",
    pdfTemplateUrl: opts.pdf || "",
    requiredDocuments: opts.docs || ["Application", "Government ID"],
    renewalLeadTimeDays: opts.lead || 30,
    importanceLevel: opts.imp || "critical",
    requiresFoodHandling: opts.food !== false,
    formFields: opts.fields || DEFAULT_FORM_FIELDS,
    active: true,
  };
}

// =========================================================================
// PERMIT LIBRARY – research-backed city-specific permits + core bundles
// =========================================================================
const permitLibrary = [

  // =====================================================================
  // TEXAS
  // =====================================================================

  // --- Houston, TX ---
  ...coreCityPermits("Houston", "TX"),
  sp("Houston", "TX", "Houston Health Dept Mobile Food Unit (MFU) Medallion", "Annual medallion issued by Houston Health Dept to operate a mobile food unit within city limits.", { auth: "Houston Health Department", url: "https://www.houstonpermittingcenter.org/hhd1008", cost: "$400+", docs: ["Application", "Commissary agreement", "Menu", "Vehicle registration", "Floor plan"], days: 365 }),
  sp("Houston", "TX", "Houston Fire Dept LP-Gas Permit", "Fire Marshal LP-gas permit for propane-equipped food trucks.", { auth: "Houston Fire Department", cost: "$225", docs: ["LP-gas equipment documentation", "Fire suppression certification"], imp: "often_forgotten" }),
  sp("Houston", "TX", "Texas DSHS Food Manufacturer License", "State-level permit for mobile food establishments from TX Dept of State Health Services.", { auth: "Texas DSHS", url: "https://www.dshs.texas.gov/food-establishment-regulations/mobile-food-establishments", cost: "$258/yr", docs: ["Application", "Floor plan", "Menu", "Water/waste documentation"] }),

  // --- San Antonio, TX ---
  ...coreCityPermits("San Antonio", "TX"),
  sp("San Antonio", "TX", "SAMHD Food Establishment Permit", "San Antonio Metro Health District food establishment license for mobile food units.", { auth: "San Antonio Metropolitan Health District (SAMHD)", url: "https://www.sa.gov/Directory/Departments/SAMHD", cost: "$125–$325", docs: ["Application", "Commissary agreement", "Menu", "Floor plan", "Equipment list"] }),
  sp("San Antonio", "TX", "SA Fire Dept Mobile Vending Permit", "Fire safety inspection and permit for mobile food vendors.", { auth: "San Antonio Fire Department", cost: "$50–$100", imp: "often_forgotten" }),

  // --- Dallas, TX ---
  ...coreCityPermits("Dallas", "TX"),
  sp("Dallas", "TX", "Dallas County Health & Human Services MFU Permit", "Countywide mobile food unit permit issued by Dallas County DCHHS.", { auth: "Dallas County Health & Human Services (DCHHS)", url: "https://www.dallascounty.org/departments/dchhs/", cost: "$200–$400", docs: ["Application", "Commissary agreement", "Menu", "Vehicle info", "Insurance"] }),

  // --- Austin, TX ---
  ...coreCityPermits("Austin", "TX"),
  sp("Austin", "TX", "Austin Public Health Mobile Food Vendor Permit", "Required permit for mobile food vendors operating in Austin via Austin Public Health.", { auth: "Austin Public Health – Environmental Health Services", url: "https://www.austintexas.gov/department/mobile-food-vendors", cost: "$212–$239/yr", docs: ["Application", "TX sales tax permit", "Commissary agreement", "Menu", "Floor plan", "Insurance"], addr: "1520 Rutherford Lane, Austin, TX 78754" }),

  // --- Fort Worth, TX ---
  ...coreCityPermits("Fort Worth", "TX"),
  sp("Fort Worth", "TX", "Tarrant County Public Health MFU Permit", "Countywide mobile food unit permit covering all 41+ municipalities in Tarrant County.", { auth: "Tarrant County Public Health", url: "https://www.tarrantcountytx.gov/en/public-health.html", cost: "$200–$400", docs: ["Application", "Commissary agreement", "Floor plan", "Menu"] }),

  // --- El Paso, TX ---
  ...coreCityPermits("El Paso", "TX"),
  sp("El Paso", "TX", "El Paso Dept of Public Health MFU Permit", "City health dept mobile food unit permit.", { auth: "City of El Paso Dept of Public Health", url: "https://www.elpasotexas.gov/public-health/", cost: "$150–$300", docs: ["Application", "Commissary agreement", "Menu", "Floor plan"] }),

  // Remaining TX cities – core bundle only
  ...coreCityPermits("Arlington", "TX"),
  ...coreCityPermits("Corpus Christi", "TX"),
  ...coreCityPermits("Plano", "TX"),
  ...coreCityPermits("Lubbock", "TX"),
  ...coreCityPermits("Laredo", "TX"),
  ...coreCityPermits("Irving", "TX"),
  ...coreCityPermits("Amarillo", "TX"),
  ...coreCityPermits("Grand Prairie", "TX"),
  ...coreCityPermits("Brownsville", "TX"),
  ...coreCityPermits("McKinney", "TX"),
  ...coreCityPermits("Frisco", "TX"),
  ...coreCityPermits("Denton", "TX"),
  ...coreCityPermits("Midland", "TX"),
  ...coreCityPermits("Waco", "TX"),
  ...coreCityPermits("Odessa", "TX"),
  ...coreCityPermits("Richardson", "TX"),
  ...coreCityPermits("Round Rock", "TX"),
  ...coreCityPermits("Sugar Land", "TX"),
  ...coreCityPermits("Pearland", "TX"),
  ...coreCityPermits("College Station", "TX"),
  ...coreCityPermits("Killeen", "TX"),

  // =====================================================================
  // FLORIDA
  // =====================================================================

  // --- Miami, FL ---
  ...coreCityPermits("Miami", "FL"),
  sp("Miami", "FL", "Florida DBPR Mobile Food Dispensing Vehicle (MFDV) License", "State license for mobile food dispensing vehicles from FL DBPR.", { auth: "Florida DBPR", url: "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/", cost: "$347/yr full, $178.50 half-year + $50 app fee", docs: ["Application", "Commissary agreement", "Vehicle details", "Food manager cert"] }),
  sp("Miami", "FL", "Miami-Dade County Business Tax Receipt", "County business tax receipt for operating in Miami-Dade.", { auth: "Miami-Dade County Tax Collector", url: "https://www.miamidade.gov/", cost: "$45–$165", food: false, vt: VENDOR_TYPES_ALL }),
  sp("Miami", "FL", "City of Miami Business Tax Receipt (BTR)", "City-level BTR to operate within City of Miami.", { auth: "City of Miami", url: "https://www.miamigov.com/Services/Business/Apply-for-or-Renew-a-Business-Tax-Receipt", cost: "$35–$100", food: false, vt: VENDOR_TYPES_ALL }),

  // --- Jacksonville, FL ---
  ...coreCityPermits("Jacksonville", "FL"),
  sp("Jacksonville", "FL", "Florida DBPR MFDV License", "State mobile food dispensing vehicle license.", { auth: "Florida DBPR", url: "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/", cost: "$347/yr + $50 app fee" }),
  sp("Jacksonville", "FL", "Duval County Business Tax Receipt (LBTR)", "County-level local business tax receipt.", { auth: "Duval County Tax Collector", cost: "$50–$150", food: false, vt: VENDOR_TYPES_ALL }),
  sp("Jacksonville", "FL", "JFRD Fire Safety Inspection", "Jacksonville Fire & Rescue Dept fire safety inspection for food trucks.", { auth: "Jacksonville Fire & Rescue Department", cost: "$65/yr", imp: "often_forgotten" }),

  // --- Tampa, FL ---
  ...coreCityPermits("Tampa", "FL"),
  sp("Tampa", "FL", "Florida DBPR MFDV License", "State mobile food dispensing vehicle license.", { auth: "Florida DBPR", url: "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/", cost: "$347/yr + $50 app fee" }),
  sp("Tampa", "FL", "Hillsborough County Business Tax Receipt", "County BTR for Hillsborough County.", { auth: "Hillsborough County Tax Collector", cost: "$50–$150", food: false, vt: VENDOR_TYPES_ALL }),

  // --- Orlando, FL ---
  ...coreCityPermits("Orlando", "FL"),
  sp("Orlando", "FL", "Florida DBPR MFDV License", "State mobile food dispensing vehicle license.", { auth: "Florida DBPR", url: "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/", cost: "$347/yr + $50 app fee" }),
  sp("Orlando", "FL", "City of Orlando Business Tax Receipt", "City BTR for mobile food operations.", { auth: "City of Orlando", cost: "$50–$150", food: false, vt: VENDOR_TYPES_ALL }),

  // Remaining FL cities – core + state DBPR
  ...coreCityPermits("St. Petersburg", "FL"),
  ...coreCityPermits("Fort Lauderdale", "FL"),
  ...coreCityPermits("Tallahassee", "FL"),
  ...coreCityPermits("Hialeah", "FL"),
  ...coreCityPermits("Cape Coral", "FL"),
  ...coreCityPermits("Port St. Lucie", "FL"),
  ...coreCityPermits("West Palm Beach", "FL"),
  ...coreCityPermits("Gainesville", "FL"),
  ...coreCityPermits("Clearwater", "FL"),
  ...coreCityPermits("Lakeland", "FL"),
  ...coreCityPermits("Palm Bay", "FL"),
  ...coreCityPermits("Pembroke Pines", "FL"),
  ...coreCityPermits("Hollywood", "FL"),
  ...coreCityPermits("Coral Springs", "FL"),
  ...coreCityPermits("Sarasota", "FL"),
  ...coreCityPermits("Kissimmee", "FL"),

  // =====================================================================
  // CALIFORNIA
  // =====================================================================

  // --- Los Angeles, CA ---
  ...coreCityPermits("Los Angeles", "CA"),
  sp("Los Angeles", "CA", "LA County DPH Mobile Food Facility (MFF) Health Permit", "Public health permit for MFFs operating in LA County.", { auth: "LA County Dept of Public Health – Environmental Health", url: "https://publichealth.lacounty.gov/eh/business/food-trucks-carts.htm", cost: "$325–$761/yr by risk level + $439–$741 plan check", docs: ["Application", "Plan review submission", "Commissary agreement", "Menu", "Equipment specifications"] }),
  sp("Los Angeles", "CA", "CA Seller's Permit", "California seller's permit (no cost) for collecting sales tax.", { auth: "CA Dept of Tax and Fee Administration (CDTFA)", url: "https://www.cdtfa.ca.gov/taxes-and-fees/faq-sellers-permit.htm", cost: "Free", food: false, vt: VENDOR_TYPES_ALL, days: 3650, renew: 0 }),

  // --- San Diego, CA ---
  ...coreCityPermits("San Diego", "CA"),
  sp("San Diego", "CA", "San Diego County DEHQ MFF Permit", "County Dept of Environmental Health & Quality mobile food facility permit.", { auth: "San Diego County DEHQ", url: "https://www.sandiegocounty.gov/content/sdc/deh/fhd/mobilefood.html", cost: "$228–$760/yr by risk", phone: "(858) 505-6666", docs: ["Application", "Plan review", "Commissary agreement", "Menu"] }),

  // --- San Jose, CA ---
  ...coreCityPermits("San Jose", "CA"),
  sp("San Jose", "CA", "Santa Clara County DEH MFF Permit", "County mobile food facility permit.", { auth: "Santa Clara County DEH", url: "https://deh.santaclaracounty.gov/food-and-retail/compliance-retail-food-operations/mobile-food-facilities", cost: "$446 app + $138–$635 annual", docs: ["Application", "Plan review", "Commissary agreement"] }),

  // --- San Francisco, CA ---
  ...coreCityPermits("San Francisco", "CA"),
  sp("San Francisco", "CA", "SFDPH Health Permit – Mobile Food Facility", "SF Dept of Public Health food permit for mobile food facilities.", { auth: "San Francisco Dept of Public Health", cost: "$600–$900+", docs: ["Application", "Plan review", "Commissary agreement", "Menu"] }),
  sp("San Francisco", "CA", "SF Public Works Mobile Food Facility Location Permit", "Location permit from SF Public Works for operating on public property.", { auth: "SF Public Works", url: "https://sfpublicworks.org/services/permits/mobile-food-facilities", cost: "$251+ per location", docs: ["SFDPH permit", "Location application", "Site plan"], imp: "often_forgotten" }),

  // --- Sacramento, CA ---
  ...coreCityPermits("Sacramento", "CA"),
  sp("Sacramento", "CA", "Sacramento County EMD MFF Permit", "Environmental Management Dept mobile food facility permit.", { auth: "Sacramento County EMD", url: "https://emd.saccounty.gov/EH/FoodProtect-RetailFood/Pages/MobileFood.aspx", cost: "$300–$600", phone: "(916) 875-8440" }),

  // --- Long Beach, CA ---
  ...coreCityPermits("Long Beach", "CA"),
  sp("Long Beach", "CA", "Long Beach Health Dept MFF Permit", "Separate from LA County; Long Beach issues own health permits for MFFs.", { auth: "Long Beach Health Department", cost: "$300–$600", phone: "(562) 570-4132" }),

  // --- Oakland, CA ---
  ...coreCityPermits("Oakland", "CA"),
  sp("Oakland", "CA", "Alameda County DEH MFF Permit", "County environmental health mobile food facility permit.", { auth: "Alameda County DEH", url: "https://deh.acgov.org/", cost: "$300–$600", phone: "(510) 567-6724" }),

  // Remaining CA cities – core bundle (county health permit covered by notes)
  ...coreCityPermits("Fresno", "CA"),
  ...coreCityPermits("Bakersfield", "CA"),
  ...coreCityPermits("Anaheim", "CA"),
  ...coreCityPermits("Santa Ana", "CA"),
  ...coreCityPermits("Riverside", "CA"),
  ...coreCityPermits("Stockton", "CA"),
  ...coreCityPermits("Irvine", "CA"),
  ...coreCityPermits("Chula Vista", "CA"),
  ...coreCityPermits("Fremont", "CA"),
  ...coreCityPermits("San Bernardino", "CA"),
  ...coreCityPermits("Modesto", "CA"),
  ...coreCityPermits("Fontana", "CA"),
  ...coreCityPermits("Moreno Valley", "CA"),
  ...coreCityPermits("Glendale", "CA"),
  ...coreCityPermits("Huntington Beach", "CA"),
  ...coreCityPermits("Santa Clarita", "CA"),
  ...coreCityPermits("Garden Grove", "CA"),
  ...coreCityPermits("Oceanside", "CA"),
  ...coreCityPermits("Rancho Cucamonga", "CA"),
  ...coreCityPermits("Ontario", "CA"),
  ...coreCityPermits("Oxnard", "CA"),
  ...coreCityPermits("Elk Grove", "CA"),
  ...coreCityPermits("Corona", "CA"),
  ...coreCityPermits("Visalia", "CA"),
  ...coreCityPermits("Concord", "CA"),
  ...coreCityPermits("Santa Rosa", "CA"),
  ...coreCityPermits("Salinas", "CA"),
  ...coreCityPermits("Palmdale", "CA"),
  ...coreCityPermits("Lancaster", "CA"),
  ...coreCityPermits("Sunnyvale", "CA"),
  ...coreCityPermits("Pomona", "CA"),
  ...coreCityPermits("Escondido", "CA"),
  ...coreCityPermits("Torrance", "CA"),
  ...coreCityPermits("Hayward", "CA"),
  ...coreCityPermits("Pasadena", "CA"),

  // =====================================================================
  // ARIZONA
  // =====================================================================

  // --- Phoenix, AZ ---
  ...coreCityPermits("Phoenix", "AZ"),
  sp("Phoenix", "AZ", "Phoenix Mobile Vending License", "City Clerk mobile vending license for food trucks.", { auth: "Phoenix City Clerk", url: "https://www.phoenix.gov/cityclerk/services/licensing/regbusinfo/vending/mobile-vending", cost: "$350 app + $30/yr renewal", docs: ["Application", "Maricopa County health permit", "Vehicle info", "Insurance"] }),
  sp("Phoenix", "AZ", "Maricopa County Health Permit", "County environmental health permit for mobile food establishments.", { auth: "Maricopa County Environmental Services", cost: "$120–$610 by type (I/II/III)", docs: ["Application", "Plan review", "Menu", "Commissary agreement"] }),
  sp("Phoenix", "AZ", "Arizona TPT License", "Transaction Privilege Tax license required for all AZ businesses.", { auth: "Arizona Dept of Revenue", url: "https://azdor.gov/transaction-privilege-tax", cost: "$12 state + city fees", food: false, vt: VENDOR_TYPES_ALL, days: 3650, renew: 0 }),

  // --- Tucson, AZ ---
  ...coreCityPermits("Tucson", "AZ"),
  sp("Tucson", "AZ", "Tucson Mobile Vendor Permit", "City vendor permit for mobile food operations.", { auth: "City of Tucson", cost: "~$181.50/yr" }),
  sp("Tucson", "AZ", "Pima County Health Permit", "County health permit for mobile food establishments.", { auth: "Pima County Health Department", cost: "$120–$610 by type" }),

  // --- Mesa, AZ ---
  ...coreCityPermits("Mesa", "AZ"),
  sp("Mesa", "AZ", "Mesa Mobile Food Vendor License", "City mobile food vendor license.", { auth: "City of Mesa", url: "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License", cost: "$100/yr + $25 background + $10 app" }),

  // --- Scottsdale, AZ ---
  ...coreCityPermits("Scottsdale", "AZ"),
  sp("Scottsdale", "AZ", "Scottsdale Business License", "City business license for mobile food vendors.", { auth: "City of Scottsdale", cost: "$62 initial, $50 renewal", food: false, vt: VENDOR_TYPES_ALL }),

  // Remaining AZ
  ...coreCityPermits("Chandler", "AZ"),
  ...coreCityPermits("Gilbert", "AZ"),
  ...coreCityPermits("Tempe", "AZ"),
  ...coreCityPermits("Glendale", "AZ"),
  ...coreCityPermits("Peoria", "AZ"),
  ...coreCityPermits("Surprise", "AZ"),
  ...coreCityPermits("Flagstaff", "AZ"),
  ...coreCityPermits("Yuma", "AZ"),

  // =====================================================================
  // NEW YORK
  // =====================================================================

  // --- New York City, NY ---
  ...coreCityPermits("New York City", "NY"),
  sp("New York City", "NY", "NYC Mobile Food Vending License (Personal)", "Personal license for individuals vending food in NYC (separate from unit permit).", { auth: "NYC DOHMH", url: "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page", cost: "$50/2yr (free for veterans)", days: 730, renew: 24, docs: ["Government ID", "Photo", "Food Protection Course cert ($53)"] }),
  sp("New York City", "NY", "NYC Mobile Food Vending Unit Permit", "Permit for the vending unit (truck/cart); CAPPED with multi-year waitlist.", { auth: "NYC DOHMH", url: "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page", cost: "$200+", days: 730, renew: 24, docs: ["Application", "Insurance", "Unit layout/photos", "Commissary letter"] }),
  sp("New York City", "NY", "FDNY Certificate of Fitness (G-23) – Propane", "Fire dept certificate for propane usage on food trucks.", { auth: "FDNY", cost: "$25 exam fee", imp: "often_forgotten", docs: ["Study materials", "Pass written exam at FDNY"] }),
  sp("New York City", "NY", "NYC Restricted Area Permit (Private Property)", "For vending on private property – no unit cap; requires written permission from property owner.", { auth: "NYC DOHMH", cost: "Included in unit permit", docs: ["Property owner written permission", "Site plan"] }),

  // Remaining NY
  ...coreCityPermits("Buffalo", "NY"),
  ...coreCityPermits("Rochester", "NY"),
  ...coreCityPermits("Yonkers", "NY"),
  ...coreCityPermits("Syracuse", "NY"),
  ...coreCityPermits("Albany", "NY"),

  // =====================================================================
  // ILLINOIS
  // =====================================================================

  // --- Chicago, IL ---
  ...coreCityPermits("Chicago", "IL"),
  sp("Chicago", "IL", "Chicago Mobile Food Preparer License", "BACP license for food trucks that prepare food on-site.", { auth: "Chicago BACP", url: "https://www.chicago.gov/city/en/depts/bacp/supp_info/mobile_food_vendorlicenses.html", cost: "$1,000/2yr", days: 730, renew: 24, docs: ["Application", "GPS affidavit", "Commissary agreement", "Menu", "Health inspection", "Insurance"], phone: "(312) 744-6249" }),
  sp("Chicago", "IL", "Chicago Mobile Food Dispenser License", "BACP license for food trucks dispensing pre-packaged or pre-cooked food.", { auth: "Chicago BACP", url: "https://www.chicago.gov/city/en/depts/bacp/supp_info/mobile_food_vendorlicenses.html", cost: "$700/2yr", days: 730, renew: 24 }),

  // Remaining IL
  ...coreCityPermits("Aurora", "IL"),
  ...coreCityPermits("Naperville", "IL"),
  ...coreCityPermits("Rockford", "IL"),
  ...coreCityPermits("Joliet", "IL"),
  ...coreCityPermits("Springfield", "IL"),
  ...coreCityPermits("Elgin", "IL"),
  ...coreCityPermits("Peoria", "IL"),

  // =====================================================================
  // PENNSYLVANIA
  // =====================================================================

  // --- Philadelphia, PA ---
  ...coreCityPermits("Philadelphia", "PA"),
  sp("Philadelphia", "PA", "Philadelphia Commercial Activity License (CAL)", "Lifetime license + annual renewal required for all commercial vending.", { auth: "City of Philadelphia L&I", cost: "$300 lifetime + $50 annual renewal", food: false, vt: VENDOR_TYPES_ALL, days: 365, docs: ["Application", "Government ID", "Business registration"] }),
  sp("Philadelphia", "PA", "Philadelphia Food Establishment License", "Food establishment license for mobile food operations.", { auth: "Philadelphia Dept of Public Health", cost: "$300", docs: ["Application", "Plan review ($150)", "Health inspection ($190)"] }),
  sp("Philadelphia", "PA", "Philadelphia Motor Vehicle Vendor License", "License specific to motorized mobile food vehicles.", { auth: "City of Philadelphia L&I", cost: "$300", docs: ["Application", "Vehicle registration", "Insurance"] }),

  // --- Pittsburgh, PA ---
  ...coreCityPermits("Pittsburgh", "PA"),
  sp("Pittsburgh", "PA", "Allegheny County Health Dept MFF Permit", "County health permit for mobile food facilities.", { auth: "Allegheny County Health Department", url: "https://www.alleghenycounty.us/Services/Health-Department/Food-Safety/Permits-and-Registration/Mobile-Food-Facilities", cost: "$200–$400", docs: ["Application", "Plan review", "Commissary agreement", "Menu"] }),
  sp("Pittsburgh", "PA", "PA Dept of Agriculture MFF License (Type 4)", "State-level mobile food facility license.", { auth: "PA Dept of Agriculture", cost: "~$241", docs: ["Application", "Plan review", "Equipment list"] }),

  // Remaining PA
  ...coreCityPermits("Harrisburg", "PA"),
  ...coreCityPermits("Allentown", "PA"),
  ...coreCityPermits("Erie", "PA"),
  ...coreCityPermits("Lancaster", "PA"),
  ...coreCityPermits("Reading", "PA"),
  ...coreCityPermits("Scranton", "PA"),
  ...coreCityPermits("Bethlehem", "PA"),
  ...coreCityPermits("Dallas Township", "PA"),
  sp("Dallas Township", "PA", "Local Mobile Food Facilities Approval", "Local approval for mobile food facilities in Dallas Township (Back Mountain).", { auth: "Dallas Township", url: "https://www.dallastwp.org/", cost: "Varies by ordinance", docs: ["Site/location details", "Insurance certificate", "Food permits"] }),
  ...coreCityPermits("Kingston Township", "PA"),
  ...coreCityPermits("Lehman Township", "PA"),

  // =====================================================================
  // OHIO
  // =====================================================================
  ...coreCityPermits("Columbus", "OH"),
  sp("Columbus", "OH", "Columbus Public Health Food License", "City public health food license for mobile food operations.", { auth: "Columbus Public Health", cost: "$100–$303 combined", docs: ["Application", "Fire inspection", "Commissary agreement"] }),

  ...coreCityPermits("Cleveland", "OH"),
  sp("Cleveland", "OH", "Cleveland Mobile Food Shop Location Permit", "City permit to operate mobile food shop at approved locations.", { auth: "City of Cleveland", cost: "$100", docs: ["Application", "Health license", "Location approval"] }),
  sp("Cleveland", "OH", "Cuyahoga County Health License", "County health license for mobile food establishments.", { auth: "Cuyahoga County Board of Health", cost: "$303", docs: ["Application", "Statewide mobile food license", "Commissary agreement"] }),

  ...coreCityPermits("Cincinnati", "OH"),
  sp("Cincinnati", "OH", "Cincinnati Health Dept Mobile Food License", "City health dept mobile food licensing.", { auth: "Cincinnati Health Department", cost: "$150–$303" }),

  ...coreCityPermits("Toledo", "OH"),
  sp("Toledo", "OH", "Toledo Mobile Food Registration", "City registration for mobile food vendors.", { auth: "City of Toledo", url: "https://toledo.oh.gov/business/mobile-food", cost: "$50" }),

  ...coreCityPermits("Akron", "OH"),
  ...coreCityPermits("Dayton", "OH"),

  // =====================================================================
  // GEORGIA
  // =====================================================================
  ...coreCityPermits("Atlanta", "GA"),
  sp("Atlanta", "GA", "Atlanta Street Eats Program Permit", "City-run food truck program with electronic reservation system for designated zones.", { auth: "City of Atlanta", url: "https://www.atlantaga.gov/government/departments/city-planning/economic-development/vending-program", cost: "$75 annual + $350 reservation", email: "vending@atlantaga.gov", docs: ["Application", "County health permit", "Business Tax Certificate", "Insurance"] }),
  sp("Atlanta", "GA", "Fulton/DeKalb County Health Permit", "County health dept permit (county recognized statewide per 2022 reform).", { auth: "Fulton County Board of Health / DeKalb County Board of Health", cost: "$200–$400" }),

  ...coreCityPermits("Savannah", "GA"),
  sp("Savannah", "GA", "Savannah Food Truck Permit", "City Office of Special Events food truck permit.", { auth: "City of Savannah", url: "https://www.savannahga.gov/2466/Food-Trucks", cost: "$150 annual", phone: "(912) 651-6445", docs: ["Application", "Business Tax Certificate", "County health permit", "Insurance"] }),

  ...coreCityPermits("Augusta", "GA"),
  ...coreCityPermits("Columbus", "GA"),
  ...coreCityPermits("Macon", "GA"),
  ...coreCityPermits("Athens", "GA"),

  // =====================================================================
  // NORTH CAROLINA
  // =====================================================================
  ...coreCityPermits("Charlotte", "NC"),
  sp("Charlotte", "NC", "Mecklenburg County EH Mobile Food Unit Permit", "County environmental health MFU permit.", { auth: "Mecklenburg County Environmental Health", cost: "$200+ plan review", phone: "(980) 314-1620", docs: ["Application", "Plan review", "Commissary agreement", "Menu"] }),

  ...coreCityPermits("Raleigh", "NC"),
  sp("Raleigh", "NC", "Raleigh Food Truck Permit", "City food truck permit for private property and public ROW.", { auth: "City of Raleigh", url: "https://raleighnc.gov/permits/services/food-trucks-private-property-and-public-right-way", cost: "~$150", docs: ["Application", "Wake County health permit", "Insurance"] }),
  sp("Raleigh", "NC", "Wake County Vending Permit", "County health dept vending permit.", { auth: "Wake County Environmental Health", cost: "$100–$200" }),

  ...coreCityPermits("Greensboro", "NC"),
  sp("Greensboro", "NC", "Greensboro Mobile Food Vendor Permit", "City food truck permit.", { auth: "City of Greensboro", url: "https://www.greensboro-nc.gov/business/economic-development/food-trucks", cost: "$100–$200", phone: "(336) 641-3771" }),

  ...coreCityPermits("Durham", "NC"),
  ...coreCityPermits("Winston-Salem", "NC"),
  ...coreCityPermits("Fayetteville", "NC"),
  ...coreCityPermits("Wilmington", "NC"),
  ...coreCityPermits("Asheville", "NC"),

  // =====================================================================
  // TENNESSEE
  // =====================================================================
  ...coreCityPermits("Nashville", "TN"),
  sp("Nashville", "TN", "NDOT Mobile Food Vendor Permit", "Nashville DOT permit for mobile food vendors.", { auth: "Nashville Dept of Transportation", url: "https://www.nashville.gov/departments/transportation/permits/mobile-food-vendor", cost: "$55", docs: ["Application", "Metro Health cert", "Metro Fire cert", "Insurance"] }),
  sp("Nashville", "TN", "TDA Mobile Food Establishment License", "Tennessee Dept of Agriculture state license.", { auth: "Tennessee Dept of Agriculture", cost: "$210–$360+/yr", docs: ["Application", "Floor plan", "Menu", "Equipment list"] }),
  sp("Nashville", "TN", "State Fire Marshal Inspection", "TN State Fire Marshal inspection certificate.", { auth: "Tennessee State Fire Marshal", cost: "$300", imp: "often_forgotten" }),

  ...coreCityPermits("Memphis", "TN"),
  sp("Memphis", "TN", "Shelby County Health Dept Permit", "County health permit for mobile food establishments.", { auth: "Shelby County Health Department", cost: "$210–$360/yr" }),

  ...coreCityPermits("Knoxville", "TN"),
  sp("Knoxville", "TN", "Knoxville Mobile Food Unit Permit", "City MFU permit.", { auth: "City of Knoxville", url: "https://www.knoxvilletn.gov/government/city_departments_offices/Finance/business_license_tax_office/mobile_food_units", cost: "$200 initial, $50 renewal, $75 temporary", phone: "(865) 215-2083" }),

  ...coreCityPermits("Chattanooga", "TN"),
  ...coreCityPermits("Clarksville", "TN"),
  ...coreCityPermits("Murfreesboro", "TN"),

  // =====================================================================
  // MICHIGAN
  // =====================================================================
  ...coreCityPermits("Detroit", "MI"),
  sp("Detroit", "MI", "Detroit Health Dept MFE/STFU License", "City health dept mobile food establishment and special transitory food unit licensing.", { auth: "Detroit Health Department", url: "https://detroitmi.gov/departments/detroit-health-department/programs-and-services/food-safety/mobile-food-establishments-and-special-transitory-food-units", cost: "~$192 MFE, $135 STFU + $197 plan review", phone: "(313) 596-3932", docs: ["Application", "Plan review", "Commissary agreement", "Fire inspection", "STFU: 4-day advance notice"] }),

  ...coreCityPermits("Grand Rapids", "MI"),
  sp("Grand Rapids", "MI", "Kent County Health Dept MFE Permit", "County health permit for mobile food establishments.", { auth: "Kent County Health Department", cost: "$150–$300", phone: "(616) 456-3939" }),

  ...coreCityPermits("Ann Arbor", "MI"),
  ...coreCityPermits("Lansing", "MI"),
  ...coreCityPermits("Flint", "MI"),
  ...coreCityPermits("Kalamazoo", "MI"),

  // =====================================================================
  // WASHINGTON
  // =====================================================================
  ...coreCityPermits("Seattle", "WA"),
  sp("Seattle", "WA", "King County PH Mobile Food Business Permit", "County health permit for mobile food businesses; fees by risk level.", { auth: "King County Public Health", url: "https://kingcounty.gov/en/dept/dph/certificates-permits-licenses/food-business-permits/mobile-food-business-permit", cost: "Risk 1: $630, Risk 2: $1,008, Risk 3: $1,260 + $1,008 plan review", docs: ["Application", "Plan review", "Commissary agreement", "Menu", "WA Food Worker Card"] }),
  sp("Seattle", "WA", "SFD Fire Permit", "Seattle Fire Department permit for food trucks with propane/generators.", { auth: "Seattle Fire Department", cost: "$100–$200", imp: "often_forgotten" }),
  sp("Seattle", "WA", "WA Food Worker Card", "State-required food worker card for all food handlers.", { auth: "WA Dept of Health", cost: "$10/2yr", days: 730, renew: 24, docs: ["Complete online training and pass exam"] }),
  sp("Seattle", "WA", "L&I Conversion Vendor Unit Insignia", "WA Labor & Industries insignia for converted vendor vehicles.", { auth: "WA Dept of Labor & Industries", cost: "$150–$300", imp: "often_forgotten", docs: ["Vehicle conversion documentation", "Inspection"] }),

  ...coreCityPermits("Spokane", "WA"),
  ...coreCityPermits("Tacoma", "WA"),
  ...coreCityPermits("Vancouver", "WA"),
  ...coreCityPermits("Bellevue", "WA"),
  ...coreCityPermits("Olympia", "WA"),

  // =====================================================================
  // OREGON
  // =====================================================================
  ...coreCityPermits("Portland", "OR"),
  sp("Portland", "OR", "Multnomah County EH Food Cart License", "County environmental health food cart/truck license.", { auth: "Multnomah County Environmental Health", url: "https://multco.us/services/food-carts", cost: "Class 1/2/3: $760, Class 4: $920 + $790 plan review (rush: $2,380)", phone: "(503) 988-3400", docs: ["Application", "Plan review", "Commissary/restroom agreement", "Menu"] }),
  sp("Portland", "OR", "PBOT Street Vending Permit", "Portland Bureau of Transportation street vending permit for public right-of-way.", { auth: "Portland Bureau of Transportation", cost: "Varies", imp: "often_forgotten", docs: ["Application", "County health license", "Site plan"] }),
  sp("Portland", "OR", "OR Food Handler Card", "Oregon food handler certification.", { auth: "Oregon Health Authority", cost: "$15/3yr", days: 1095, renew: 36 }),

  ...coreCityPermits("Salem", "OR"),
  ...coreCityPermits("Eugene", "OR"),
  ...coreCityPermits("Bend", "OR"),

  // =====================================================================
  // COLORADO
  // =====================================================================
  ...coreCityPermits("Denver", "CO"),
  sp("Denver", "CO", "Denver Retail Food Mobile License", "City and County of Denver retail mobile food license.", { auth: "Denver DDPHE", url: "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Business-Licensing/Business-licenses/Retail-Food/Retail-food-mobile-license", cost: "App $150, annual $100 base + $25/food process, fire propane $200, zoning $50 = $440–$900 total", docs: ["Application", "Plan review", "Commissary agreement", "Fire propane permit", "Zoning approval"] }),
  sp("Denver", "CO", "CDPHE Retail Food License", "Colorado Dept of Public Health & Environment state retail food license.", { auth: "CDPHE", cost: "Plan review $155, new license ~$425–$580, renewals $300–$500", docs: ["Application", "Plan review", "Equipment list"] }),

  ...coreCityPermits("Colorado Springs", "CO"),
  ...coreCityPermits("Aurora", "CO"),
  ...coreCityPermits("Fort Collins", "CO"),
  ...coreCityPermits("Lakewood", "CO"),
  ...coreCityPermits("Boulder", "CO"),

  // =====================================================================
  // MASSACHUSETTS
  // =====================================================================
  ...coreCityPermits("Boston", "MA"),
  sp("Boston", "MA", "Boston Food Truck Permit (ISD)", "City Inspectional Services Dept food truck permit.", { auth: "Boston ISD", cost: "$500/yr", docs: ["Application", "Health permit", "Fire permit", "Insurance", "Commissary agreement"] }),
  sp("Boston", "MA", "Boston Board of Health Permit", "City health dept food establishment permit.", { auth: "Boston Board of Health", cost: "$100/yr" }),
  sp("Boston", "MA", "Boston Fire Dept Permit", "Fire safety permit for food trucks.", { auth: "Boston Fire Department", cost: "$150/yr", imp: "often_forgotten" }),
  sp("Boston", "MA", "MA Hawker & Peddler License", "State-level hawker and peddler license.", { auth: "Massachusetts Secretary of State / Local Licensing Authority", cost: "~$62", food: false, vt: VENDOR_TYPES_ALL }),

  ...coreCityPermits("Worcester", "MA"),
  ...coreCityPermits("Springfield", "MA"),
  ...coreCityPermits("Cambridge", "MA"),

  // =====================================================================
  // WASHINGTON DC
  // =====================================================================
  ...coreCityPermits("Washington", "DC"),
  sp("Washington", "DC", "DC Vending Business License (Class A – Food)", "DLCP vending business license for mobile food vendors.", { auth: "DC DLCP", url: "https://dlcp.dc.gov/page/vendinglicensingsteps", cost: "$300+/2yr", days: 730, renew: 24, phone: "(202) 442-5955", email: "vendingteam@dc.gov", docs: ["Application", "DC Health certificate", "Mobile site permit", "Insurance"] }),
  sp("Washington", "DC", "DC Health Certificate", "Health permit from DC Department of Health.", { auth: "DC Department of Health", cost: "$100 + $75 HACCP review", docs: ["Application", "HACCP plan", "Food manager cert"] }),
  sp("Washington", "DC", "DC Mobile Site Permit", "Permit designating approved vending locations.", { auth: "DC DLCP", cost: "$300/2yr", days: 730, renew: 24 }),

  // =====================================================================
  // MARYLAND
  // =====================================================================
  ...coreCityPermits("Baltimore", "MD"),
  sp("Baltimore", "MD", "Baltimore City Health Dept Food Control Permit", "City health dept food control permit.", { auth: "Baltimore City Health Department", cost: "$100–$300" }),
  sp("Baltimore", "MD", "Baltimore DOT Street/Mobile Vending Permit", "Dept of Transportation mobile vending permit.", { auth: "Baltimore DOT", url: "https://transportation.baltimorecity.gov/street-and-mobile-vending", cost: "$25 app fee", docs: ["Application", "Health permit", "Insurance", "Vehicle info"] }),
  sp("Baltimore", "MD", "MD Mobile Reciprocity License", "Statewide mobile food reciprocity license (SB 262) – valid 90-mile radius from home county.", { auth: "Maryland Dept of Health", cost: "Varies by county", docs: ["Home county health permit", "Application"], imp: "often_forgotten" }),

  ...coreCityPermits("Columbia", "MD"),

  // =====================================================================
  // VIRGINIA
  // =====================================================================
  ...coreCityPermits("Virginia Beach", "VA"),
  sp("Virginia Beach", "VA", "VDH Food Establishment Permit", "State-level food establishment permit from VA Dept of Health (valid statewide).", { auth: "Virginia Dept of Health", cost: "$40 plan review + $40 permit = $80 total", docs: ["Application", "Plan review", "Menu", "Equipment list"] }),
  sp("Virginia Beach", "VA", "VA Beach Peddler's Permit", "City peddler's permit for mobile vendors.", { auth: "City of Virginia Beach", cost: "$25" }),
  sp("Virginia Beach", "VA", "VA Fire Marshal Certificate", "State Fire Marshal annual inspection certificate.", { auth: "Virginia State Fire Marshal", cost: "$200/yr", imp: "often_forgotten" }),

  ...coreCityPermits("Norfolk", "VA"),
  sp("Norfolk", "VA", "Norfolk Food Truck Vendor Program", "City food truck vendor program with designated zones.", { auth: "City of Norfolk", url: "https://www.norfolk.gov/2259/Food-Truck-Vendor-Program", cost: "$40 state tracking decal + $30 local", docs: ["VDH permit", "Application", "Vehicle info"] }),

  ...coreCityPermits("Richmond", "VA"),
  ...coreCityPermits("Alexandria", "VA"),
  ...coreCityPermits("Chesapeake", "VA"),
  ...coreCityPermits("Arlington", "VA"),

  // =====================================================================
  // NEVADA
  // =====================================================================
  ...coreCityPermits("Las Vegas", "NV"),
  sp("Las Vegas", "NV", "Las Vegas City Business License", "City business license for mobile food vendors.", { auth: "City of Las Vegas Business Licensing", cost: "$150", food: false, vt: VENDOR_TYPES_ALL }),
  sp("Las Vegas", "NV", "SNHD Health Permit", "Southern Nevada Health District health permit for mobile food.", { auth: "Southern Nevada Health District", cost: "$385–$660/yr", phone: "(702) 759-1258", docs: ["Application", "Plan review", "Health card", "Commissary agreement", "Menu"] }),
  sp("Las Vegas", "NV", "SNHD Health Card", "Health card for food handlers.", { auth: "Southern Nevada Health District", cost: "$20 + $15 training", days: 365 }),
  sp("Las Vegas", "NV", "NV State Business License", "State business license required for all NV businesses.", { auth: "Nevada Secretary of State", cost: "$200/yr", food: false, vt: VENDOR_TYPES_ALL }),

  ...coreCityPermits("Henderson", "NV"),
  ...coreCityPermits("Reno", "NV"),
  ...coreCityPermits("North Las Vegas", "NV"),
  ...coreCityPermits("Sparks", "NV"),

  // =====================================================================
  // MINNESOTA
  // =====================================================================
  ...coreCityPermits("Minneapolis", "MN"),
  sp("Minneapolis", "MN", "Minneapolis Mobile Food Vendor Vehicle License", "City mobile food vendor vehicle license.", { auth: "City of Minneapolis", url: "https://www2.minneapolismn.gov/business-services/licenses-permits-inspections/business-licenses/food-restaurants/food-truck-cart/food-truck/", cost: "$200–$400", phone: "(612) 673-2301", docs: ["Application", "MDH/MDA food license", "Vehicle license", "Insurance"] }),
  sp("Minneapolis", "MN", "Minneapolis Right-of-Way Permit", "Permit to operate on public right-of-way.", { auth: "City of Minneapolis", cost: "$100–$200", imp: "often_forgotten" }),
  sp("Minneapolis", "MN", "MN Dept of Health Mobile Food License", "State MDH license for prepared-to-order mobile food.", { auth: "Minnesota Dept of Health", cost: "$200–$500, Apr 1–Mar 31", docs: ["Application", "Plan review", "Menu", "Commissary agreement"] }),

  ...coreCityPermits("St. Paul", "MN"),
  ...coreCityPermits("Rochester", "MN"),
  ...coreCityPermits("Duluth", "MN"),

  // =====================================================================
  // WISCONSIN
  // =====================================================================
  ...coreCityPermits("Milwaukee", "WI"),
  sp("Milwaukee", "WI", "Milwaukee Food Peddler License + MFU License", "City food peddler and mobile food unit licenses (statewide transferable).", { auth: "Milwaukee Health Department", url: "https://city.milwaukee.gov/Health/Services-and-Programs/CEH/mobilefood", cost: "Motorized $350, Pushed/Pedaled $315, Jul 1–Jun 30", email: "mobilefood@milwaukee.gov", docs: ["Application", "State unit license", "Service base license", "Insurance"] }),

  ...coreCityPermits("Madison", "WI"),
  sp("Madison", "WI", "PHMDC Food Vendor License", "Public Health Madison & Dane County food vendor license.", { auth: "PHMDC", url: "https://publichealthmdc.com/", cost: "$200–$400", phone: "(608) 242-6515" }),

  ...coreCityPermits("Green Bay", "WI"),

  // =====================================================================
  // MISSOURI
  // =====================================================================
  ...coreCityPermits("Kansas City", "MO"),
  sp("Kansas City", "MO", "KC Health Dept Mobile Food Permit", "City health dept food permit for mobile units.", { auth: "Kansas City Health Department", url: "https://www.kcmo.gov/city-hall/departments/health/food-permits-for-mobile-units-catering-farmers-markets-and-similar-vendors", cost: "$200–$400", phone: "(816) 513-2491" }),

  ...coreCityPermits("St. Louis", "MO"),
  sp("St. Louis", "MO", "St. Louis Street Dept Food Truck Permit", "City street dept food truck permit.", { auth: "St. Louis Street Department", url: "https://www.stlouis-mo.gov/government/departments/street/permits-inspections/vending/food-truck-permits.cfm", cost: "$500/annual or $125/quarterly", docs: ["Application", "Building inspection ($50 + $25)", "Health permit", "Insurance"] }),

  ...coreCityPermits("Springfield", "MO"),
  ...coreCityPermits("Columbia", "MO"),

  // =====================================================================
  // INDIANA
  // =====================================================================
  ...coreCityPermits("Indianapolis", "IN"),
  sp("Indianapolis", "IN", "Marion County Public Health Dept MFU Permit", "County public health mobile food unit permit.", { auth: "Marion County Public Health Department", cost: "$150–$300" }),
  sp("Indianapolis", "IN", "Indianapolis DBNS Vendor Cart License", "City vendor cart license from Dept of Business & Neighborhood Services.", { auth: "Indianapolis DBNS", url: "https://www.indy.gov/activity/vendor-cart-licenses", cost: "$100–$200", docs: ["Application", "Health permit", "Insurance"] }),

  ...coreCityPermits("Fort Wayne", "IN"),
  sp("Fort Wayne", "IN", "Fort Wayne-Allen County Health Dept MFU Permit", "County health permit requiring Type I Hood + fire suppression.", { auth: "Fort Wayne-Allen County Health Department", cost: "$150–$300", docs: ["Application", "Type I Hood certification", "Fire suppression system docs", "Commissary agreement"] }),

  ...coreCityPermits("South Bend", "IN"),
  sp("South Bend", "IN", "St. Joseph County Health Dept MFT Permit", "County mobile food truck permit.", { auth: "St. Joseph County Health Department", cost: "$325–$375 + $75/yr commissary", phone: "(574) 235-9721" }),

  ...coreCityPermits("Evansville", "IN"),

  // =====================================================================
  // SOUTH CAROLINA
  // =====================================================================
  ...coreCityPermits("Charleston", "SC"),
  sp("Charleston", "SC", "SCDA/DHEC State Permit", "State food permit from SC Dept of Agriculture or DHEC.", { auth: "SC Dept of Agriculture / DHEC", cost: "$100 app + $100–$250 annual", docs: ["Application", "Plan review", "Menu", "Equipment list"] }),
  sp("Charleston", "SC", "Charleston Fire Dept Operational Permit", "City fire dept permit for mobile food vendors.", { auth: "Charleston Fire Department", url: "https://www.charleston-sc.gov/1969/Mobile-Food-Vendors", cost: "$50–$100", imp: "often_forgotten" }),

  ...coreCityPermits("Columbia", "SC"),
  sp("Columbia", "SC", "Columbia City Business License + Zoning", "City business license + zoning approval; 100-ft restaurant buffer.", { auth: "City of Columbia", cost: "$50 + $10 zoning", phone: "(803) 545-3345", food: false, vt: VENDOR_TYPES_ALL }),

  ...coreCityPermits("Greenville", "SC"),
  sp("Greenville", "SC", "Greenville Mobile Food Vendor Permit", "City mobile food vendor permit; 250-ft restaurant distance requirement.", { auth: "City of Greenville", url: "https://www.greenvillesc.gov/329/Food-Trucks-Trailers", cost: "$100–$200", docs: ["Application", "Background check", "DHEC permit", "Insurance"] }),

  ...coreCityPermits("Myrtle Beach", "SC"),

  // =====================================================================
  // LOUISIANA
  // =====================================================================
  ...coreCityPermits("New Orleans", "LA"),
  sp("New Orleans", "LA", "New Orleans Occupational License", "City occupational license for food trucks.", { auth: "City of New Orleans", url: "https://nola.gov/food-truck-permit/", cost: "$150", phone: "(504) 658-1666" }),
  sp("New Orleans", "LA", "New Orleans Mayoralty Permit", "Mayoralty permit for mobile food vendors.", { auth: "City of New Orleans", cost: "$400.25 + $50 app + $50 sales tax deposit + $5 ID = ~$505.25" }),
  sp("New Orleans", "LA", "Louisiana State Health Permit", "LDH state health permit for food establishments.", { auth: "Louisiana Dept of Health", cost: "$150/yr" }),

  ...coreCityPermits("Baton Rouge", "LA"),
  sp("Baton Rouge", "LA", "Baton Rouge City-Parish Occupational License", "City-parish occupational license.", { auth: "City of Baton Rouge", cost: "$200", phone: "(225) 242-4870" }),

  ...coreCityPermits("Shreveport", "LA"),
  ...coreCityPermits("Lafayette", "LA"),

  // =====================================================================
  // KENTUCKY
  // =====================================================================
  ...coreCityPermits("Louisville", "KY"),
  sp("Louisville", "KY", "Louisville Mobile Vending Permit (3-Step)", "City mobile vending permit: Fire → Codes & Regulations → Metro Health.", { auth: "Louisville Metro Government", url: "https://louisvilleky.gov/government/alcoholic-beverage-control/food-truck-mobile-vending-permit", cost: "$200 app + $50/vendor ID", phone: "(502) 574-6650", docs: ["Fire inspection approval", "Codes & Regulations approval", "Metro Health Dept approval", "Insurance"] }),
  sp("Louisville", "KY", "KY Statewide Mobile Food Unit Permit", "State permit valid statewide with 48-hour advance notification.", { auth: "Kentucky Dept of Public Health", cost: "Varies by county", docs: ["Application", "Home county approval", "48-hr advance notification docs"] }),

  ...coreCityPermits("Lexington", "KY"),
  sp("Lexington", "KY", "Lexington-Fayette County Health Dept Permit", "County health dept food permit.", { auth: "Lexington-Fayette County Health Department", url: "https://www.lfchd.org/", cost: "$100 plumbing plan review + permit fees", phone: "(859) 231-9791" }),

  ...coreCityPermits("Bowling Green", "KY"),

  // =====================================================================
  // OKLAHOMA
  // =====================================================================
  ...coreCityPermits("Oklahoma City", "OK"),
  sp("Oklahoma City", "OK", "OCCHD Vehicle Food Sales License", "Oklahoma City-County Health Dept vehicle food sales license.", { auth: "Oklahoma City-County Health Department", cost: "$100–$250", phone: "(405) 297-2606" }),
  sp("Oklahoma City", "OK", "OSDH Statewide Mobile Food License", "Oklahoma State Dept of Health statewide license (HB 1076, effective Nov 2025).", { auth: "Oklahoma State Dept of Health", cost: "$425 first year, $335 renewal", docs: ["Application", "State Fire Marshal inspection/decal", "Plan review", "Menu"] }),

  ...coreCityPermits("Tulsa", "OK"),
  sp("Tulsa", "OK", "Tulsa Mobile Vendor License", "City mobile vendor/outdoor seller license.", { auth: "Tulsa Health Department", url: "https://tulsa-health.org/permits-inspections/food/food-service-and-restaurant-industry-resources/mobile-food-vending/", cost: "$20 app + $30 license", phone: "(918) 596-9456" }),

  ...coreCityPermits("Norman", "OK"),

  // =====================================================================
  // KANSAS
  // =====================================================================
  ...coreCityPermits("Wichita", "KS"),
  sp("Wichita", "KS", "Wichita Mobile Food Vendor License", "City mobile food vendor license per Chapter 3.15.", { auth: "City of Wichita", cost: "$100–$200" }),
  sp("Wichita", "KS", "KDA Food Establishment License", "Kansas Dept of Agriculture food establishment license.", { auth: "Kansas Dept of Agriculture", cost: "$200 one-time + $200–$500 annual, Apr 1–Mar 31", docs: ["Application", "Plan review", "Menu"] }),

  ...coreCityPermits("Overland Park", "KS"),
  ...coreCityPermits("Kansas City", "KS"),
  ...coreCityPermits("Topeka", "KS"),

  // =====================================================================
  // NEBRASKA
  // =====================================================================
  ...coreCityPermits("Omaha", "NE"),
  sp("Omaha", "NE", "Douglas County HD Mobile Vendor Sticker", "County health dept mobile vendor sticker.", { auth: "Douglas County Health Department", cost: "$50–$100" }),
  sp("Omaha", "NE", "Omaha City Mobile Vendor Permit", "City permit for mobile food vendors.", { auth: "City of Omaha", url: "https://www.parkomaha.com/resources/mobile-food-vendor-permit", cost: "$100/vehicle + $100 downtown BID", docs: ["Application", "County health sticker", "Insurance"] }),
  sp("Omaha", "NE", "NDA Food Establishment Permit", "Nebraska Dept of Agriculture food establishment permit (Apr 1–Mar 31).", { auth: "Nebraska Dept of Agriculture", cost: "$100–$300" }),

  ...coreCityPermits("Lincoln", "NE"),

  // =====================================================================
  // IOWA
  // =====================================================================
  ...coreCityPermits("Des Moines", "IA"),
  sp("Des Moines", "IA", "Iowa DIAL Mobile Food Unit License", "State DIAL (Dept of Inspections, Appeals & Licensing) mobile food license based on gross sales.", { auth: "Iowa DIAL", cost: "Based on gross sales tier", phone: "(515) 283-4240", docs: ["Application", "Commissary agreement", "Menu", "Fire inspection"] }),
  sp("Des Moines", "IA", "Des Moines City Clerk Vendor Permit", "City clerk vendor permit.", { auth: "Des Moines City Clerk", cost: "$50–$100" }),

  ...coreCityPermits("Cedar Rapids", "IA"),

  // =====================================================================
  // UTAH
  // =====================================================================
  ...coreCityPermits("Salt Lake City", "UT"),
  sp("Salt Lake City", "UT", "Salt Lake County HD Mobile Food Service Permit", "County health dept mobile food service permit; must attend Mobile Food Service Class.", { auth: "Salt Lake County Health Department", url: "https://www.saltlakecounty.gov/health/food-protection/permits/mobile/", cost: "$200–$400", phone: "(385) 468-3845", docs: ["Application", "Mobile Food Service Class completion", "Commissary agreement", "Menu", "Food handler cert (3yr)"] }),

  ...coreCityPermits("Provo", "UT"),
  ...coreCityPermits("West Valley City", "UT"),
  ...coreCityPermits("Ogden", "UT"),

  // =====================================================================
  // NEW MEXICO
  // =====================================================================
  ...coreCityPermits("Albuquerque", "NM"),
  sp("Albuquerque", "NM", "Albuquerque EHD Health Permit", "City Environmental Health Dept mobile food health permit.", { auth: "City of Albuquerque EHD", url: "https://www.cabq.gov/environmentalhealth/food-safety/mobile-food-guide", cost: "$135/yr", phone: "(505) 768-2738" }),
  sp("Albuquerque", "NM", "Albuquerque Business Registration", "City business registration.", { auth: "City of Albuquerque", cost: "$35/yr", food: false, vt: VENDOR_TYPES_ALL }),

  ...coreCityPermits("Las Cruces", "NM"),
  sp("Las Cruces", "NM", "NMED Retail Food Permit", "New Mexico Environment Dept retail food permit.", { auth: "NM Environment Department", cost: "$100" }),

  ...coreCityPermits("Santa Fe", "NM"),

  // =====================================================================
  // IDAHO
  // =====================================================================
  ...coreCityPermits("Boise", "ID"),
  sp("Boise", "ID", "Central District Health MFE Permit", "Central District Health Dept mobile food establishment permit.", { auth: "Central District Health", cost: "$150–$300", phone: "(208) 570-6559" }),

  ...coreCityPermits("Meridian", "ID"),
  ...coreCityPermits("Nampa", "ID"),

  // =====================================================================
  // HAWAII
  // =====================================================================
  ...coreCityPermits("Honolulu", "HI"),
  sp("Honolulu", "HI", "DOH Food Establishment Permit", "Hawaii Dept of Health food establishment permit + commissary permit.", { auth: "Hawaii Dept of Health", cost: "$200–$400" }),
  sp("Honolulu", "HI", "Honolulu Peddler's License", "City peddler's license from Business License Office.", { auth: "City of Honolulu", url: "https://www.honolulu.gov/csd/food-truck-information-and-resources/", cost: "$100–$200", phone: "(808) 768-9700" }),
  sp("Honolulu", "HI", "Hawaii GET License", "Hawaii General Excise Tax license (4% general, 4.5% Oahu).", { auth: "Hawaii Dept of Taxation", url: "https://tax.hawaii.gov/geninfo/get/", cost: "$20", food: false, vt: VENDOR_TYPES_ALL, days: 3650, renew: 0 }),

  // =====================================================================
  // ALASKA
  // =====================================================================
  ...coreCityPermits("Anchorage", "AK"),
  sp("Anchorage", "AK", "Anchorage Food Safety & Sanitation Permit", "Municipality of Anchorage FSS program (separate from state DEC).", { auth: "Municipality of Anchorage", cost: "$200–$400", phone: "(907) 343-4200" }),
  sp("Anchorage", "AK", "AK State Business License", "Alaska state business license.", { auth: "Alaska Division of Corporations", cost: "$50/yr", food: false, vt: VENDOR_TYPES_ALL }),

  ...coreCityPermits("Fairbanks", "AK"),
  sp("Fairbanks", "AK", "AK DEC Food Establishment Permit", "State DEC mobile food service permit.", { auth: "Alaska DEC", cost: "$215/yr + $215 plan review (Self-Contained: $460 + $460)", docs: ["Application", "Plan review", "Menu", "Equipment list"], phone: "(907) 459-6720" }),

  // =====================================================================
  // ALABAMA
  // =====================================================================
  ...coreCityPermits("Birmingham", "AL"),
  ...coreCityPermits("Montgomery", "AL"),
  ...coreCityPermits("Huntsville", "AL"),
  ...coreCityPermits("Mobile", "AL"),

  // =====================================================================
  // MISSISSIPPI
  // =====================================================================
  ...coreCityPermits("Jackson", "MS"),
  sp("Jackson", "MS", "MSDH Food Permit", "Mississippi State Dept of Health food permit.", { auth: "Mississippi State Dept of Health", cost: "Plan review $224.25, annual Risk 1 $40 to Risk 4 $264.50", phone: "(601) 364-2832" }),

  ...coreCityPermits("Gulfport", "MS"),

  // =====================================================================
  // ARKANSAS
  // =====================================================================
  ...coreCityPermits("Little Rock", "AR"),
  sp("Little Rock", "AR", "ADH Food Establishment Permit", "Arkansas Dept of Health food establishment permit.", { auth: "Arkansas Dept of Health", cost: "Plan review 1% of estimated cost ($50–$500), annual $35" }),

  ...coreCityPermits("Fayetteville", "AR"),

  // =====================================================================
  // WEST VIRGINIA
  // =====================================================================
  ...coreCityPermits("Charleston", "WV"),
  sp("Charleston", "WV", "WV Statewide Mobile Food Establishment Permit", "Statewide MFE permit (HB 5017, June 2024); county permit valid statewide, 72-hr advance notice required.", { auth: "West Virginia DHHR", cost: "Varies by county", docs: ["Application", "County health permit", "72-hr advance notice documentation"] }),
  sp("Charleston", "WV", "Charleston Street Vending Permit", "City street vending permit.", { auth: "City of Charleston", cost: "$20" }),

  ...coreCityPermits("Huntington", "WV"),
  sp("Huntington", "WV", "Huntington Mobile Food Vendor Permit", "City mobile food vendor permit.", { auth: "City of Huntington", cost: "$50" }),

  // =====================================================================
  // NEW JERSEY
  // =====================================================================
  ...coreCityPermits("Newark", "NJ"),
  sp("Newark", "NJ", "Newark Peddler/Vendor License", "City vendor license from Dept of Finance (May 1–Apr 30 period).", { auth: "Newark Dept of Finance – Central Licenses & Permits", url: "https://peddlerlicense.newarkportal.us/", cost: "$100–$300", docs: ["Application", "Health permit", "Insurance", "Background check"] }),
  sp("Newark", "NJ", "NJ Fire Suppression Inspection", "State fire suppression inspection required every 6 months.", { auth: "NJ Division of Fire Safety", cost: "$50–$100", days: 182, renew: 6, imp: "often_forgotten" }),

  ...coreCityPermits("Jersey City", "NJ"),
  ...coreCityPermits("Paterson", "NJ"),
  ...coreCityPermits("Trenton", "NJ"),
  ...coreCityPermits("Elizabeth", "NJ"),

  // =====================================================================
  // CONNECTICUT
  // =====================================================================
  ...coreCityPermits("Hartford", "CT"),
  sp("Hartford", "CT", "CT IFVE License (Reciprocal)", "Itinerant Food Vending Establishment license; reciprocal among CT jurisdictions since Nov 2022.", { auth: "Local Health Department", cost: "$100–$300", docs: ["Application", "Plan review", "Commissary agreement"] }),

  ...coreCityPermits("New Haven", "CT"),
  ...coreCityPermits("Stamford", "CT"),
  ...coreCityPermits("Bridgeport", "CT"),

  // =====================================================================
  // RHODE ISLAND
  // =====================================================================
  ...coreCityPermits("Providence", "RI"),
  sp("Providence", "RI", "RIDOH Mobile Food Establishment License", "State health dept license.", { auth: "RI Dept of Health", cost: "$100 inspection", docs: ["Application", "DBR MFE Registration", "State Fire Marshal approval"] }),
  sp("Providence", "RI", "RI DBR Mobile Food Establishment Registration", "Dept of Business Regulation MFE registration (prerequisite for Providence).", { auth: "RI DBR", cost: "$50–$100" }),

  // =====================================================================
  // DELAWARE
  // =====================================================================
  ...coreCityPermits("Wilmington", "DE"),
  sp("Wilmington", "DE", "DE Division of Public Health Food Permit", "State public health food establishment permit.", { auth: "Delaware Division of Public Health", cost: "No license cost" }),
  sp("Wilmington", "DE", "Wilmington Daily Use Fee", "Daily fee for designated mobile food vendor spots.", { auth: "City of Wilmington", url: "https://www.wilmingtonde.gov/business/foodtrucks", cost: "$22/day per spot" }),

  // =====================================================================
  // NEW HAMPSHIRE
  // =====================================================================
  ...coreCityPermits("Nashua", "NH"),
  sp("Nashua", "NH", "Nashua Mobile Food Service Vendor License", "City mobile food service vendor license.", { auth: "City of Nashua", url: "https://nashuanh.gov/1498/Mobile-Food-Service-Vendors", cost: "Plan review $125, annual $200, hawkers & peddlers $100" }),
  sp("Nashua", "NH", "NH DHHS Food Service License", "State Dept of Health & Human Services food service license.", { auth: "NH DHHS", cost: "Mobile Cook Unit (Class D) $225, Pushcart (Class F) $150, floor plan review $75" }),

  ...coreCityPermits("Manchester", "NH"),

  // =====================================================================
  // VERMONT
  // =====================================================================
  ...coreCityPermits("Burlington", "VT"),
  sp("Burlington", "VT", "VT Commercial Caterer License", "Vermont Dept of Health commercial caterer license for mobile food.", { auth: "Vermont Dept of Health", cost: "$260/yr (Limited Operations: $140/yr)" }),

  // =====================================================================
  // MAINE
  // =====================================================================
  ...coreCityPermits("Portland", "ME"),
  sp("Portland", "ME", "ME DHHS Health Inspection Program (HIP) License", "State license for prepared food vendors.", { auth: "Maine DHHS", cost: "$25–$500 by category" }),
  sp("Portland", "ME", "Portland Municipal Food License", "City-issued municipal-only food license (Portland can issue independently).", { auth: "City of Portland", cost: "$50–$200" }),

  // =====================================================================
  // NORTH DAKOTA / SOUTH DAKOTA
  // =====================================================================
  ...coreCityPermits("Fargo", "ND"),
  sp("Fargo", "ND", "Fargo-Cass Public Health MFU Permit", "County public health mobile food unit permit.", { auth: "Fargo Cass Public Health", cost: "$100–$200", phone: "(701) 476-6729" }),

  ...coreCityPermits("Bismarck", "ND"),

  ...coreCityPermits("Sioux Falls", "SD"),
  sp("Sioux Falls", "SD", "Sioux Falls Peddler/Mobile Food Vendor License", "City peddler/mobile food vendor license from Police Records.", { auth: "Sioux Falls Police Records", cost: "$50–$150" }),

  ...coreCityPermits("Rapid City", "SD"),

  // =====================================================================
  // MONTANA / WYOMING
  // =====================================================================
  ...coreCityPermits("Billings", "MT"),
  ...coreCityPermits("Missoula", "MT"),
  ...coreCityPermits("Cheyenne", "WY"),
  ...coreCityPermits("Casper", "WY"),

]; // end permitLibrary

// =========================================================================
// MAIN – upsert all permits into MongoDB
// =========================================================================
async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/permitwise";

  console.log("\n=== PermitWise - Seed Permit Library ===");
  console.log("Connecting to: " + uri.replace(/\/\/[^@]+@/, "//***:***@"));

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const jurisdictions = await Jurisdiction.find({ active: true });
  const jurMap = new Map(jurisdictions.map((j) => [`${j.name}|${j.state}`, j._id]));

  console.log(`Found ${jurisdictions.length} jurisdictions in DB`);


  if (jurisdictions.length === 0) {
    console.error("\nERROR: No jurisdictions found in DB! Run seed_jurisdictions.js first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const beforePermits = await PermitType.countDocuments();
  console.log(`Existing permit types in DB: ${beforePermits}`);
  console.log(`Permit definitions to process: ${permitLibrary.length}\n`);

  let upserts = 0;
  let skipped = 0;
  const missingJurisdictions = new Set();

  for (const p of permitLibrary) {
    const key = `${p.jurisdictionName}|${p.state}`;
    const jId = jurMap.get(key);

    if (!jId) {
      missingJurisdictions.add(key);
      skipped++;
      continue;
    }

    const doc = {
      jurisdictionId: jId,
      vendorTypes: p.vendorTypes || [],
      name: p.name,
      description: p.description || "",
      issuingAuthorityName: p.issuingAuthorityName || "",
      issuingAuthorityContact: p.issuingAuthorityContact || { website: "", phone: "", email: "", address: "" },
      defaultDurationDays: typeof p.defaultDurationDays === "number" ? p.defaultDurationDays : 365,
      renewalPeriodMonths: typeof p.renewalPeriodMonths === "number" ? p.renewalPeriodMonths : 12,
      estimatedCost: p.estimatedCost || "",
      applicationUrl: p.applicationUrl || "",
      pdfTemplateUrl: p.pdfTemplateUrl || "",
      requiredDocuments: Array.isArray(p.requiredDocuments) ? p.requiredDocuments : [],
      renewalLeadTimeDays: typeof p.renewalLeadTimeDays === "number" ? p.renewalLeadTimeDays : 30,
      importanceLevel: p.importanceLevel || "critical",
      requiresFoodHandling: p.requiresFoodHandling === true,
      formFields: Array.isArray(p.formFields) ? p.formFields : [],
      active: p.active !== false,
      updatedAt: new Date(),
    };

    try {
      await PermitType.findOneAndUpdate(
        { jurisdictionId: jId, name: doc.name },
        { $set: doc, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
      );
      upserts++;
    } catch (err) {
      console.error(`  ERROR upserting "${p.name}" for ${key}: ${err.message}`);
    }
  }

  const afterPermits = await PermitType.countDocuments();

  console.log("--- Results ---");
  console.log(`Upserted: ${upserts}`);
  console.log(`Skipped:  ${skipped}`);
  if (missingJurisdictions.size > 0) {
    console.log(`Missing jurisdictions (${missingJurisdictions.size}):`);
    [...missingJurisdictions].slice(0, 10).forEach(j => console.log(`  - ${j}`));
    if (missingJurisdictions.size > 10) console.log(`  ... and ${missingJurisdictions.size - 10} more`);
  }
  console.log(`Total permit types in DB: ${afterPermits}`);

  // Sample
  const sample = await PermitType.find().limit(5).populate("jurisdictionId", "name city state").select("name jurisdictionId");
  console.log("\nSample permits in DB:");
  sample.forEach(p => {
    const j = p.jurisdictionId;
    console.log(`  ${p.name} → ${j ? j.city + ", " + j.state : "unknown"}`);
  });

  await mongoose.disconnect();
  console.log("\nDone! Permit library seeded successfully.\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL:", err.message);
    process.exit(1);
  });
