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
  // NEW: aligns with your main PermitType schema
  requiresFoodHandling: { type: Boolean, default: false },
  formFields: [
    {
      fieldName: String,
      fieldType: {
        type: String,
        enum: ["text", "date", "checkbox", "select"],
      },
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

// Keep in sync with your VendorBusiness enum (server side)
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
  {
    fieldName: "Business Legal Name",
    fieldType: "text",
    mappedTo: "businessName",
    required: true,
  },
  {
    fieldName: "DBA Name",
    fieldType: "text",
    mappedTo: "dbaName",
    required: false,
  },
  {
    fieldName: "EIN",
    fieldType: "text",
    mappedTo: "ein",
    required: false,
  },
  {
    fieldName: "Business Phone",
    fieldType: "text",
    mappedTo: "phone",
    required: false,
  },
  {
    fieldName: "Business Email",
    fieldType: "text",
    mappedTo: "email",
    required: false,
  },
  {
    fieldName: "Street Address",
    fieldType: "text",
    mappedTo: "address.street",
    required: false,
  },
  {
    fieldName: "City",
    fieldType: "text",
    mappedTo: "address.city",
    required: false,
  },
  {
    fieldName: "State",
    fieldType: "text",
    mappedTo: "address.state",
    required: false,
  },
  {
    fieldName: "ZIP",
    fieldType: "text",
    mappedTo: "address.zip",
    required: false,
  },
];

// Generic bundle for every city – makes the library complete everywhere
function coreCityPermits(jurisdictionName, state) {
  return [
    {
      jurisdictionName,
      state,
      name: "General Business License / Registration",
      description:
        "Baseline business registration commonly required to operate within this city.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${jurisdictionName} Business Licensing`,
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: [
        "Government ID",
        "Business formation docs (if applicable)",
      ],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      requiresFoodHandling: false,
      formFields: DEFAULT_FORM_FIELDS,
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "State Sales / Use Tax Permit",
      description:
        "State sales/use tax registration required to collect and remit tax on taxable sales.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: `${state} Department of Revenue / Tax Agency`,
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 3650,
      renewalPeriodMonths: 0,
      estimatedCost: "Often free (varies by state)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["SSN/EIN"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      requiresFoodHandling: false,
      formFields: DEFAULT_FORM_FIELDS,
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "Liability Insurance Certificate",
      description:
        "Proof of general liability insurance often required by events, landlords, and municipalities.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: "Insurance Provider",
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "$200–$1,200 per year (varies)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Policy documentation / Certificate of Insurance"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      requiresFoodHandling: false,
      formFields: [],
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "Workers’ Compensation Insurance (if employees)",
      description:
        "Workers’ compensation policy typically required if you have employees.",
      vendorTypes: VENDOR_TYPES_ALL,
      issuingAuthorityName: "Insurance Provider / State WC Agency",
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Policy documentation"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      requiresFoodHandling: false,
      formFields: [],
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "Fire Safety Inspection (if using propane/generators)",
      description:
        "Fire inspection for vendors using propane, open flames, or generators.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Local Fire Department",
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies ($0–$200 typical)",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Fire extinguisher/suppression documentation"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      // Could also apply to non-food vendors with generators, so leave false
      requiresFoodHandling: false,
      formFields: [],
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "Food Safety Certification (Manager/Handler)",
      description:
        "Food manager/handler certification requirements for staff and/or owner.",
      vendorTypes: FOOD_VENDOR_TYPES,
      issuingAuthorityName: "Approved Training Provider",
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 1095,
      renewalPeriodMonths: 36,
      estimatedCost: "$10–$150",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Completion certificate(s)"],
      renewalLeadTimeDays: 30,
      importanceLevel: "critical",
      requiresFoodHandling: true,
      formFields: [],
      active: true,
    },
    {
      jurisdictionName,
      state,
      name: "Commissary / Service Area Agreement (if required)",
      description:
        "Proof of commissary or base-of-operations for mobile food vendors.",
      vendorTypes: ["food_truck", "food_cart", "mobile_bartender"],
      issuingAuthorityName: "Commissary / Shared Kitchen",
      issuingAuthorityContact: {
        website: "",
        phone: "",
        email: "",
        address: "",
      },
      defaultDurationDays: 365,
      renewalPeriodMonths: 12,
      estimatedCost: "Varies by commissary",
      applicationUrl: "",
      pdfTemplateUrl: "",
      requiredDocuments: ["Signed commissary agreement"],
      renewalLeadTimeDays: 30,
      importanceLevel: "often_forgotten",
      requiresFoodHandling: true,
      formFields: [],
      active: true,
    },
  ];
}

// PERMIT LIBRARY DEFINITIONS
const permitLibrary = [
  // === Austin, TX ===
  ...coreCityPermits("Austin, TX", "TX"),
  {
    jurisdictionName: "Austin, TX",
    state: "TX",
    name: "Mobile Food Vendor Permit (Austin MFU)",
    description:
      "Required permit for mobile food vendors operating in Austin via Austin Public Health.",
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
    estimatedCost: "Varies by unit and risk level",
    applicationUrl:
      "https://www.austintexas.gov/department/mobile-food-vendors",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Application",
      "Texas sales & use tax permit",
      "Insurance",
      "Commissary agreement (if required)",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: true,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // === Miami, FL ===
  ...coreCityPermits("Miami, FL", "FL"),
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "Florida DBPR Mobile Food Dispensing Vehicle (MFDV) License",
    description:
      "State license for mobile food dispensing vehicles (MFDVs) including trucks and carts.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName:
      "Florida Department of Business and Professional Regulation (DBPR)",
    issuingAuthorityContact: {
      website:
        "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "$250–$450 typical",
    applicationUrl:
      "https://www.myfloridalicense.com/DBPR/hotels-restaurants/licensing/mobile-food-dispensing-vehicles/",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Application",
      "Commissary agreement (if required)",
      "Vehicle and equipment details",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: true,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "Miami-Dade County Local Business Tax Receipt",
    description:
      "County business tax receipt required for operating in Miami-Dade County.",
    vendorTypes: VENDOR_TYPES_ALL,
    issuingAuthorityName: "Miami-Dade County Tax Collector",
    issuingAuthorityContact: {
      website: "https://www.miamidade.gov/",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "$45–$165 typical",
    applicationUrl: "",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Business registration/EIN",
      "Government ID",
      "DBPR license (if food)",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: false,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "Miami, FL",
    state: "FL",
    name: "City of Miami Business Tax Receipt (BTR)",
    description:
      "City-level business tax receipt to operate within City of Miami limits.",
    vendorTypes: VENDOR_TYPES_ALL,
    issuingAuthorityName: "City of Miami",
    issuingAuthorityContact: {
      website:
        "https://www.miamigov.com/Services/Business/Apply-for-or-Renew-a-Business-Tax-Receipt",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "$35–$100 typical",
    applicationUrl:
      "https://www.miamigov.com/Services/Business/Apply-for-or-Renew-a-Business-Tax-Receipt",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Miami-Dade business tax receipt",
      "Basic business registration",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: false,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // === New York City, NY ===
  ...coreCityPermits("New York City, NY", "NY"),
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Mobile Food Vending Unit Permit (NYC)",
    description:
      "Permit for the vending unit (truck or cart) issued by NYC DOHMH.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName:
      "NYC Department of Health and Mental Hygiene (DOHMH)",
    issuingAuthorityContact: {
      website:
        "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 730,
    renewalPeriodMonths: 24,
    estimatedCost: "$200+ depending on permit type",
    applicationUrl:
      "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Application",
      "Insurance",
      "Unit layout/photos (if required)",
      "Commissary letter",
    ],
    renewalLeadTimeDays: 45,
    importanceLevel: "critical",
    requiresFoodHandling: true,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Mobile Food Vending License (Personal License)",
    description:
      "Personal license for individuals vending food in NYC, separate from the unit permit.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName:
      "NYC Department of Health and Mental Hygiene (DOHMH)",
    issuingAuthorityContact: {
      website:
        "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 730,
    renewalPeriodMonths: 24,
    estimatedCost: "$50 typical",
    applicationUrl:
      "https://www.nyc.gov/site/doh/business/food-operators/mobile-food-vendors.page",
    pdfTemplateUrl: "",
    requiredDocuments: ["Government ID", "Photo"],
    renewalLeadTimeDays: 45,
    importanceLevel: "critical",
    requiresFoodHandling: true,
    formFields: [],
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "FDNY Propane / LPG Permit (if applicable)",
    description:
      "Permit required by FDNY for use of propane (LPG) on mobile food units.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "Fire Department of the City of New York (FDNY)",
    issuingAuthorityContact: {
      website: "",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "$100–$150 typical",
    applicationUrl: "",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "System diagram",
      "Vehicle registration",
      "Insurance",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "often_forgotten",
    requiresFoodHandling: true,
    formFields: [],
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "Commissary / Facility Use Letter",
    description:
      "Letter confirming use of an approved commissary/facility as required by NYC DOHMH.",
    vendorTypes: ["food_truck", "food_cart"],
    issuingAuthorityName: "Approved Commissary / Facility",
    issuingAuthorityContact: {
      website: "",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies by facility",
    applicationUrl: "",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Signed commissary agreement",
      "Facility permit/license copy",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "often_forgotten",
    requiresFoodHandling: true,
    formFields: [],
    active: true,
  },
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    name: "New York State Sales Tax Certificate of Authority",
    description:
      "State sales tax registration allowing collection of sales tax in New York.",
    vendorTypes: VENDOR_TYPES_ALL,
    issuingAuthorityName:
      "New York State Department of Taxation and Finance",
    issuingAuthorityContact: {
      website: "",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 3650,
    renewalPeriodMonths: 0,
    estimatedCost: "Often free",
    applicationUrl: "",
    pdfTemplateUrl: "",
    requiredDocuments: ["SSN/EIN", "Business registration"],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: false,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // === Dallas Township, PA (Back Mountain) ===
  ...coreCityPermits("Dallas Township, PA", "PA"),
  {
    jurisdictionName: "Dallas Township, PA",
    state: "PA",
    name: "Local Mobile Food Facilities / Booths Approval",
    description:
      "Local approval for mobile food facilities and booths in Dallas Township (Back Mountain).",
    vendorTypes: ["food_truck", "food_cart", "tent_vendor"],
    issuingAuthorityName: "Dallas Township",
    issuingAuthorityContact: {
      website: "https://www.dallastwp.org/",
      phone: "",
      email: "",
      address: "",
    },
    defaultDurationDays: 365,
    renewalPeriodMonths: 12,
    estimatedCost: "Varies by ordinance",
    applicationUrl: "https://www.dallastwp.org/",
    pdfTemplateUrl: "",
    requiredDocuments: [
      "Site/location details",
      "Insurance certificate",
      "Food permits (if applicable)",
    ],
    renewalLeadTimeDays: 30,
    importanceLevel: "critical",
    requiresFoodHandling: true,
    formFields: DEFAULT_FORM_FIELDS,
    active: true,
  },

  // === The rest of the cities get the core bundle only ===
  ...coreCityPermits("Kingston Township, PA", "PA"),
  ...coreCityPermits("Lehman Township, PA", "PA"),
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
  ...coreCityPermits("Nashville, TN", "TN"),
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  await mongoose.connect(uri);

  const jurisdictions = await Jurisdiction.find({ active: true });
  const jurMap = new Map(
    jurisdictions.map((j) => [`${j.name}|${j.state}`, j._id])
  );

  let upserts = 0;

  for (const p of permitLibrary) {
    const key = `${p.jurisdictionName}|${p.state}`;
    const jId = jurMap.get(key);

    if (!jId) {
      console.warn(
        `Skipping permit "${p.name}" – missing jurisdiction in DB: ${key}`
      );
      continue;
    }

    const doc = {
      jurisdictionId: jId,
      vendorTypes: p.vendorTypes || [],
      name: p.name,
      description: p.description || "",
      issuingAuthorityName: p.issuingAuthorityName || "",
      issuingAuthorityContact:
        p.issuingAuthorityContact || {
          website: "",
          phone: "",
          email: "",
          address: "",
        },
      defaultDurationDays:
        typeof p.defaultDurationDays === "number"
          ? p.defaultDurationDays
          : 365,
      renewalPeriodMonths:
        typeof p.renewalPeriodMonths === "number"
          ? p.renewalPeriodMonths
          : 12,
      estimatedCost: p.estimatedCost || "",
      applicationUrl: p.applicationUrl || "",
      pdfTemplateUrl: p.pdfTemplateUrl || "",
      requiredDocuments: p.requiredDocuments || [],
      renewalLeadTimeDays:
        typeof p.renewalLeadTimeDays === "number"
          ? p.renewalLeadTimeDays
          : 30,
      importanceLevel: p.importanceLevel || "critical",
      requiresFoodHandling: p.requiresFoodHandling === true,
      formFields: p.formFields || [],
      active: p.active !== false,
      updatedAt: new Date(),
    };

    await PermitType.findOneAndUpdate(
      { jurisdictionId: jId, name: p.name },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );
    upserts++;
  }

  console.log(`Upserted ${upserts} permit types.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
