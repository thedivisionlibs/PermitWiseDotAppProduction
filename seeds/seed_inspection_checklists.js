// seeds/seed_inspection_checklists.js

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

const inspectionChecklistSchema = new mongoose.Schema({
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: "Jurisdiction" },
  vendorType: { type: String }, // null = All Vendor Types
  name: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["health", "fire", "safety", "general"],
    default: "general",
  },
  items: [
    {
      itemText: { type: String, required: true },
      description: { type: String },
      required: { type: Boolean, default: true },
      order: { type: Number },
    },
  ],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);
const InspectionChecklist = mongoose.model(
  "InspectionChecklist",
  inspectionChecklistSchema
);

function key(name, state) {
  return `${name}|${state}`;
}

// GLOBAL (jurisdiction-agnostic, all vendor types)
const GLOBAL_CHECKLISTS = [
  {
    jurisdictionName: null,
    state: null,
    vendorType: null,
    name: "Health Inspection Pre-Check",
    description:
      "Standard health inspection items vendors should review before official inspections.",
    category: "health",
    items: [
      "Handwashing station stocked with soap, towels, and warm water",
      "Food handlers using gloves when required",
      "Cold foods held at or below 41°F",
      "Hot foods held at or above 135°F",
      "No cross-contamination between raw and cooked foods",
      "All food stored off the ground and properly covered",
      "Food contact surfaces sanitized and debris-free",
      "Thermometers available and calibrated",
      "No expired or spoiled food in storage",
      "Fresh water tank filled and capped",
      "Wastewater tank empty and secure",
      "Cleaning chemicals stored away from food",
      "Employee food handler/manager certificate available",
      "Proper labeling on all packaged items",
      "No pest activity or attractants present",
    ],
  },
  {
    jurisdictionName: null,
    state: null,
    vendorType: null,
    name: "Fire Safety Pre-Check",
    description:
      "Fire safety items to verify before operating with propane, generators, or cooking equipment.",
    category: "fire",
    items: [
      "2A10BC fire extinguisher fully charged",
      "K-Class extinguisher present (if frying or using grease)",
      "Propane tanks secured and inspected for leaks",
      "Gas lines tight and free of damage",
      "Hood/vent system clean and functioning (if applicable)",
      "No open flames near flammable materials",
      "Generator placed safely and properly ventilated",
      "Electrical cords free of frays and properly routed",
      "Fire suppression system active (if installed)",
      "Emergency shutoff switches accessible",
      "Exit paths clear and unobstructed",
    ],
  },
  {
    jurisdictionName: null,
    state: null,
    vendorType: null,
    name: "General Safety & Operations Check",
    description:
      "Daily operational safety walk-through for mobile and pop-up vendors.",
    category: "safety",
    items: [
      "Truck/trailer level and stable",
      "No trip hazards (cords, equipment, hoses)",
      "Adequate lighting around work area",
      "First aid kit stocked and accessible",
      "Staff using appropriate PPE as needed",
      "Floors clean and non-slippery",
      "Trash containers covered and not overflowing",
      "Ventilation fans functioning properly",
      "Doors, windows, and screens intact",
      "No signs of pests",
    ],
  },
  {
    jurisdictionName: null,
    state: null,
    vendorType: null,
    name: "Pre-Event Readiness Checklist",
    description:
      "Use before arriving at an event to make sure permits, documents, and equipment are ready.",
    category: "general",
    items: [
      "All event-required permits are active",
      "Proof of insurance uploaded and unexpired",
      "Event documents (map, rules) reviewed",
      "Generator fueled and operational",
      "Extension cords and power equipment packed",
      "Clean water supply loaded",
      "Wastewater tanks empty and ready",
      "Menu and pricing prepared",
      "Equipment secured for transport",
      "Staff briefed on event rules and schedule",
    ],
  },
];

// Jurisdiction-specific checklists
const JURISDICTION_CHECKLISTS = [
  // NYC – truck
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    vendorType: "food_truck",
    name: "NYC Mobile Vendor Pre-Check",
    description:
      "Pre-check for NYC mobile food vendors based on DOHMH and FDNY expectations.",
    category: "health",
    items: [
      "Mobile Food Vending Permit present",
      "Mobile Food Vendor License (personal) present",
      "Food Protection Certificate available",
      "Cart/truck layout matches approved DOHMH design",
      "Handwashing sink with hot and cold water working",
      "Mechanical refrigeration holding at or below 41°F",
      "No home-prepared foods",
      "Commissary logs and documentation available",
      "Permit decal visible and unobstructed",
      "Propane setup compliant with FDNY requirements (if applicable)",
    ],
  },
  // NYC – cart
  {
    jurisdictionName: "New York City, NY",
    state: "NY",
    vendorType: "food_cart",
    name: "NYC Mobile Vendor Pre-Check",
    description:
      "Pre-check for NYC mobile food cart vendors based on DOHMH and FDNY expectations.",
    category: "health",
    items: [
      "Mobile Food Vending Permit present",
      "Mobile Food Vendor License (personal) present",
      "Food Protection Certificate available",
      "Cart layout matches DOHMH-approved design",
      "Handwashing supplies available (if required)",
      "Cold holding methods adequate at or below 41°F",
      "No home-prepared foods",
      "Commissary logs and documentation available",
      "Permit decal visible and unobstructed",
      "Propane setup compliant with FDNY requirements (if applicable)",
    ],
  },
  // Austin – MFU truck
  {
    jurisdictionName: "Austin, TX",
    state: "TX",
    vendorType: "food_truck",
    name: "Texas MFU Pre-Check (Austin)",
    description:
      "Pre-inspection checklist for Texas Mobile Food Units operating in Austin.",
    category: "health",
    items: [
      "Certified Food Manager certificate posted",
      "Handwashing sink supplied correctly",
      "Hot water heater functioning properly",
      "Cold holding units at or below 41°F",
      "Hot holding units at or above 135°F",
      "Approved sanitizer prepared at correct concentration",
      "Wastewater disposal plan in place",
      "MFU permit decal visible",
      "Commissary agreement available (if required)",
      "Fire suppression system inspected and active (if installed)",
    ],
  },
  // Austin – MFU cart
  {
    jurisdictionName: "Austin, TX",
    state: "TX",
    vendorType: "food_cart",
    name: "Texas MFU Pre-Check (Austin)",
    description:
      "Pre-inspection checklist for small/mobile food carts operating under Texas MFU rules in Austin.",
    category: "health",
    items: [
      "Responsible person with required food safety training available",
      "Handwashing supplies available as required",
      "Cold holding methods adequate at or below 41°F",
      "No home-prepared foods",
      "Food kept covered and off the ground",
      "Wastewater captured and disposed of properly",
      "Commissary or base of operations documented",
      "Cart clean and in good repair",
    ],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  await mongoose.connect(uri);

  const jurisdictions = await Jurisdiction.find({ active: true });
  const jurMap = new Map(
    jurisdictions.map((j) => [key(j.name, j.state), j._id])
  );

  const allDefs = [...GLOBAL_CHECKLISTS, ...JURISDICTION_CHECKLISTS];

  let upserts = 0;

  for (const def of allDefs) {
    let jurisdictionId = null;

    if (def.jurisdictionName && def.state) {
      const jId = jurMap.get(key(def.jurisdictionName, def.state));
      if (!jId) {
        console.warn(
          `Skipping checklist "${def.name}" – missing jurisdiction: ${def.jurisdictionName} (${def.state})`
        );
        continue;
      }
      jurisdictionId = jId;
    }

    const items = def.items.map((text, idx) => ({
      itemText: text,
      description: "",
      required: true,
      order: idx + 1,
    }));

    const query = {
      jurisdictionId: jurisdictionId || null,
      vendorType: def.vendorType || null,
      name: def.name,
    };

    const update = {
      jurisdictionId: jurisdictionId || null,
      vendorType: def.vendorType || null,
      name: def.name,
      description: def.description || "",
      category: def.category || "general",
      items,
      active: true,
      updatedAt: new Date(),
    };

    await InspectionChecklist.findOneAndUpdate(
      query,
      { $set: update, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    upserts++;
  }

  console.log(`Upserted ${upserts} inspection checklists.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
