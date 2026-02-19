// seeds/seed_nepa_pa_expansion.js
// Adds 220 more PA jurisdictions (entire NEPA + rest of PA) and their permits.
// Run AFTER the previous seed files.
//
// Usage: MONGODB_URI="mongodb+srv://..." node seed_nepa_pa_expansion.js
// Or locally: node seed_nepa_pa_expansion.js

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/permitwise";

// ── Schemas ──────────────────────────────────────────────────────────
const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["city", "county", "state"], required: true },
  city: { type: String },
  county: { type: String },
  state: { type: String, required: true },
  notes: { type: String },
  contactInfo: { website: String, phone: String, email: String, address: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const permitTypeSchema = new mongoose.Schema({
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: "Jurisdiction", required: true },
  vendorTypes: [{ type: String }],
  requiresFoodHandling: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String },
  issuingAuthorityName: { type: String },
  issuingAuthorityContact: { website: String, phone: String, email: String, address: String },
  defaultDurationDays: { type: Number, default: 365 },
  renewalPeriodMonths: { type: Number, default: 12 },
  estimatedCost: { type: String },
  applicationUrl: { type: String },
  pdfTemplateUrl: { type: String },
  requiredDocuments: [{ type: String }],
  renewalLeadTimeDays: { type: Number, default: 30 },
  importanceLevel: { type: String, enum: ["critical", "often_forgotten", "event_required"], default: "critical" },
  formFields: [{ fieldName: String, fieldType: { type: String, enum: ["text", "date", "checkbox", "select"] }, mappedTo: String, required: Boolean }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);
const PermitType = mongoose.model("PermitType", permitTypeSchema);

const ALL_VENDOR_TYPES = [
  "food_truck", "mobile_bartender", "tent_vendor",
  "mobile_retail", "pop_up_shop", "farmers_market", "craft_vendor",
];
const FOOD_TYPES = ["food_truck", "mobile_bartender"];

// =====================================================================
// 220 PENNSYLVANIA JURISDICTIONS
// =====================================================================
const jurisdictions = [
  { city: "Shavertown", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ashley", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Avoca", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bear Creek Village", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Conyngham", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Courtdale", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dallas", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dupont", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Edwardsville", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Freeland", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Harveys Lake", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hughestown", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jeddo", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Kingston", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Laflin", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Larksville", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Laurel Run", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Luzerne", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nescopeck", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "New Columbus", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nuangola", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Penn Lake Park", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Plymouth", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Pringle", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Shickshinny", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Sugar Notch", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Swoyersville", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Warrior Run", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "West Hazleton", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "West Wyoming", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "White Haven", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Yatesville", county: "Luzerne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bear Creek Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Black Creek Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Buck Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Butler Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Conyngham Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dennison Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dorrance Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Exeter Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Fairmount Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Foster Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Franklin Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hanover Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hazle Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hollenback Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hunlock Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Huntington Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jackson Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jenkins Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lake Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nescopeck Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Newport Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Plains Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Plymouth Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Rice Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ross Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Salem Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Slocum Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Sugarloaf Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Union Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Wilkes-Barre Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Wright Township", county: "Luzerne", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Archbald", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Blakely", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Clarks Green", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dalton", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dickson City", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jermyn", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jessup", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Mayfield", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Moosic", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Moscow", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Olyphant", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Taylor", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Throop", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Vandling", county: "Lackawanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Abington Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Benton Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Clifton Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Covington Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Elmhurst Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Fell Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Glenburn Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Greenfield Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jefferson Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "La Plume Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Madison Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Newton Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "North Abington Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ransom Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Roaring Brook Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Scott Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "South Abington Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Spring Brook Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Thornhurst Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "West Abington Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Waverly Township", county: "Lackawanna", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Factoryville", county: "Wyoming", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Laceyville", county: "Wyoming", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Meshoppen", county: "Wyoming", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nicholson", county: "Wyoming", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Tunkhannock", county: "Wyoming", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Braintrim Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Clinton Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Eaton Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Falls Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Forkston Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lemon Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Mehoopany Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Meshoppen Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Monroe Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nicholson Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "North Branch Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Noxen Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Northmoreland Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Overfield Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Tunkhannock Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Washington Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Windham Township", county: "Wyoming", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Mount Pocono", county: "Monroe", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Tobyhanna Township", county: "Monroe", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Pocono Township", county: "Monroe", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Tannersville", county: "Monroe", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bartonsville", county: "Monroe", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Marshalls Creek", county: "Monroe", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Milford", county: "Pike", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Dingmans Ferry", county: "Pike", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Matamoras", county: "Pike", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Honesdale", county: "Wayne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hawley", county: "Wayne", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Montrose", county: "Susquehanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "New Milford", county: "Susquehanna", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Towanda", county: "Bradford", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Sayre", county: "Bradford", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Athens", county: "Bradford", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bloomsburg", county: "Columbia", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Berwick", county: "Columbia", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Laporte", county: "Sullivan", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lehighton", county: "Carbon", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Palmerton", county: "Carbon", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nesquehoning", county: "Carbon", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Tamaqua", county: "Schuylkill", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Shenandoah", county: "Schuylkill", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Minersville", county: "Schuylkill", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ashland", county: "Schuylkill", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Mahanoy City", county: "Schuylkill", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Altoona", county: "Blair", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lebanon", county: "Lebanon", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Uniontown", county: "Fayette", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Washington", county: "Washington", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Connellsville", county: "Fayette", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Oil City", county: "Venango", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lock Haven", county: "Clinton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Sunbury", county: "Northumberland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Shamokin", county: "Northumberland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Mount Carmel", county: "Northumberland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "DuBois", county: "Clearfield", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "St. Marys", county: "Elk", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Warren", county: "Warren", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bradford", county: "McKean", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Titusville", county: "Crawford", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Clearfield", county: "Clearfield", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Huntingdon", county: "Huntingdon", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bellefonte", county: "Centre", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Selinsgrove", county: "Snyder", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Milton", county: "Northumberland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Danville", county: "Montour", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Shamokin Dam", county: "Snyder", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Waynesboro", county: "Franklin", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Shippensburg", county: "Cumberland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Kutztown", county: "Berks", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Boyertown", county: "Berks", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Spring City", county: "Chester", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Chester County has its own health dept (separate from PDA); Chester County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lititz", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ephrata", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Elizabethtown", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Columbia", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Manheim", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "New Holland", county: "Lancaster", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Quakertown", county: "Bucks", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Bucks County has its own health dept (separate from PDA); Bucks County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Perkasie", county: "Bucks", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Bucks County has its own health dept (separate from PDA); Bucks County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lansdale", county: "Montgomery", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Ambler", county: "Montgomery", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Conshohocken", county: "Montgomery", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jenkintown", county: "Montgomery", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Swarthmore", county: "Delaware", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Wayne", county: "Delaware", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Springfield Township", county: "Delaware", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Radnor Township", county: "Delaware", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Haverford Township", county: "Delaware", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Marple Township", county: "Delaware", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Delaware County has its own health dept (separate from PDA); Delaware County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Cheltenham Township", county: "Montgomery", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Lower Merion Township", county: "Montgomery", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Whitemarsh Township", county: "Montgomery", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. Montgomery County has its own health dept (separate from PDA); Montgomery County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Latrobe", county: "Westmoreland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Jeannette", county: "Westmoreland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Murrysville", county: "Westmoreland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Irwin", county: "Westmoreland", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "McKeesport", county: "Allegheny", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Allegheny County has its own health dept (separate from PDA); Allegheny County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Penn Hills", county: "Allegheny", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Allegheny County has its own health dept (separate from PDA); Allegheny County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "West Mifflin", county: "Allegheny", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Allegheny County has its own health dept (separate from PDA); Allegheny County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bethel Park", county: "Allegheny", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Allegheny County has its own health dept (separate from PDA); Allegheny County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Upper St. Clair", county: "Allegheny", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. Allegheny County has its own health dept (separate from PDA); Allegheny County Health Department MFF permit required.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "North Huntingdon Township", county: "Westmoreland", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hermitage", county: "Mercer", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Sharon", county: "Mercer", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Grove City", county: "Mercer", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Whitehall Township", county: "Lehigh", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "South Whitehall Township", county: "Lehigh", state: "PA", notes: "Township vendor/peddler permit may be required; contact township offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Macungie", county: "Lehigh", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Nazareth", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bangor", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Bath", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Pen Argyl", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Wind Gap", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Northampton", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Catasauqua", county: "Lehigh", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Hellertown", county: "Northampton", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { city: "Coopersburg", county: "Lehigh", state: "PA", notes: "Borough/city vendor permit may be required; contact municipal offices. PA Dept of Agriculture MFF license required for food trucks.", contactInfo: { website: "", phone: "", email: "", address: "" } },
];

// =====================================================================
// PERMIT GENERATION - 6 core permits per jurisdiction
// =====================================================================
const COUNTY_HEALTH_DEPTS = {
  "Allegheny": { name: "Allegheny County Health Department", url: "https://www.alleghenycounty.us/Services/Health-Department/Food-Safety/Permits-and-Registration/Mobile-Food-Facilities", phone: "(412) 578-8044" },
  "Bucks": { name: "Bucks County Health Department", url: "https://www.buckscounty.gov/1153/Mobile-Food-Units-including-food-trucks", phone: "(215) 345-3318" },
  "Chester": { name: "Chester County Health Department", url: "https://www.chesco.org/224/Health-Department", phone: "(610) 344-6225" },
  "Delaware": { name: "Delaware County Health Department", url: "https://www.delcopa.gov/publichealth/", phone: "(610) 447-3250" },
  "Erie": { name: "Erie County Department of Health", url: "https://eriecountypa.gov/departments/health/", phone: "(814) 451-6700" },
  "Montgomery": { name: "Montgomery County Health Department", url: "https://www.montcopa.org/224/Health-Department", phone: "(610) 278-5117" },
  "Philadelphia": { name: "Philadelphia Dept of Public Health", url: "https://www.phila.gov/departments/department-of-public-health/", phone: "(215) 685-5488" },
};

function corePermitsForPA(jurisdictionName, county) {
  var hasCountyHD = COUNTY_HEALTH_DEPTS[county];
  var permits = [];

  // 1. Health/MFF License
  if (hasCountyHD) {
    permits.push({
      name: hasCountyHD.name + " MFF Permit",
      description: county + " County has its own health department (separate from PDA). Mobile food facility permit required for all food trucks.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: hasCountyHD.name,
      issuingAuthorityContact: { website: hasCountyHD.url, phone: hasCountyHD.phone, email: "", address: "" },
      estimatedCost: "$150-$500",
      requiredDocuments: ["Application", "Floor plan", "Menu", "Equipment list", "Commissary agreement"],
      importanceLevel: "critical",
    });
  } else {
    permits.push({
      name: "PA Dept of Agriculture Mobile Food Facility License",
      description: "State-level license for mobile food facilities issued by PA Dept of Agriculture Bureau of Food Safety. Required for all food trucks in PDA-jurisdiction areas.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "PA Department of Agriculture",
      issuingAuthorityContact: { website: "https://www.pa.gov/agencies/pda/food/food-safety/retail-food/fairs-and-other-temporary-events/", phone: "(717) 787-4315", email: "", address: "2301 N. Cameron St, Room 112, Harrisburg, PA 17110" },
      estimatedCost: "$100-$400",
      requiredDocuments: ["Application Packet - Mobile Food Facilities", "Floor plan", "Menu", "Equipment list", "Commissary agreement", "Water/waste documentation"],
      importanceLevel: "critical",
    });
  }

  // 2. PA Sales Tax License
  permits.push({
    name: "PA Sales, Use & Hotel Occupancy Tax License",
    description: "Required before selling taxable prepared food. PA base rate 6% + local surtax. Register via myPATH.",
    vendorTypes: ALL_VENDOR_TYPES,
    issuingAuthorityName: "PA Department of Revenue",
    issuingAuthorityContact: { website: "https://mypath.pa.gov/", phone: "(717) 787-1064", email: "", address: "" },
    estimatedCost: "Free",
    requiredDocuments: ["myPATH registration", "EIN or SSN"],
    defaultDurationDays: 3650,
    importanceLevel: "critical",
  });

  // 3. General Liability Insurance
  permits.push({
    name: "General Liability Insurance Certificate ($1M minimum)",
    description: "Commercial general liability insurance naming the municipality as additional insured.",
    vendorTypes: ALL_VENDOR_TYPES,
    issuingAuthorityName: "Private Insurance Provider",
    issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
    estimatedCost: "$500-$2,000/year",
    requiredDocuments: ["Certificate of insurance", "Additional insured endorsement"],
    importanceLevel: "critical",
  });

  // 4. Fire Safety
  permits.push({
    name: "Fire Safety Inspection / Fire Permit",
    description: "Fire Marshal inspection for propane, suppression systems, fire extinguishers, and electrical.",
    vendorTypes: FOOD_TYPES,
    issuingAuthorityName: "Local Fire Department / Fire Marshal",
    issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
    estimatedCost: "$50-$200",
    requiredDocuments: ["Fire suppression certification", "Propane documentation", "Fire extinguisher inspection tag"],
    importanceLevel: "often_forgotten",
  });

  // 5. Food Safety Certification
  permits.push({
    name: "Food Safety Certification (Manager/Handler)",
    description: "Person-in-Charge must be present at all times per PA Food Code. ANSI-accredited food safety certification required.",
    vendorTypes: FOOD_TYPES,
    issuingAuthorityName: "ServSafe / ANSI-accredited provider",
    issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
    estimatedCost: "$15-$180",
    requiredDocuments: ["Food safety certification card", "Exam completion certificate"],
    defaultDurationDays: 1825,
    renewalPeriodMonths: 60,
    importanceLevel: "critical",
    requiresFoodHandling: true,
  });

  // 6. Commissary Agreement
  permits.push({
    name: "Commissary / Service Base Agreement",
    description: "Written commissary agreement required. MFF must return daily for cleaning, waste discharge, water refill, and food storage.",
    vendorTypes: FOOD_TYPES,
    issuingAuthorityName: "Licensed Commissary Kitchen",
    issuingAuthorityContact: { website: "", phone: "", email: "", address: "" },
    estimatedCost: "$200-$1,000/month",
    requiredDocuments: ["Written commissary agreement", "Commissary license copy", "Floor plan"],
    importanceLevel: "critical",
  });

  return permits.map(function(p) {
    return Object.assign({ jurisdictionName: jurisdictionName, state: "PA" }, p);
  });
}

// =====================================================================
// MAIN
// =====================================================================
async function main() {
  console.log("\n=== PermitWise - NEPA + PA Expansion (220 jurisdictions) ===");
  console.log("Connecting to: " + MONGODB_URI.replace(/\/\/[^@]+@/, "//***:***@"));

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB\n");

  // Step 1: Upsert jurisdictions
  var allJur = jurisdictions.map(function(j) {
    return {
      name: j.city,
      type: "city",
      city: j.city,
      county: j.county,
      state: j.state,
      notes: j.notes,
      contactInfo: j.contactInfo,
      active: true,
    };
  });

  var beforeJur = await Jurisdiction.countDocuments();
  console.log("Existing jurisdictions: " + beforeJur);
  console.log("New jurisdictions to upsert: " + allJur.length);

  var jurCreated = 0, jurUpdated = 0, jurErrors = 0;

  for (var i = 0; i < allJur.length; i++) {
    var j = allJur[i];
    try {
      var result = await Jurisdiction.findOneAndUpdate(
        { city: j.city, state: j.state },
        { $set: Object.assign({}, j, { updatedAt: new Date() }), $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true, rawResult: true }
      );
      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        jurUpdated++;
      } else {
        jurCreated++;
      }
    } catch (err) {
      jurErrors++;
      console.error("  ERROR " + j.city + ", " + j.state + ": " + err.message);
    }
  }

  var afterJur = await Jurisdiction.countDocuments();
  console.log("\nJurisdictions - Created: " + jurCreated + ", Updated: " + jurUpdated + ", Errors: " + jurErrors);
  console.log("Total jurisdictions in DB: " + afterJur);

  // Step 2: Jurisdiction lookup map
  var allInDB = await Jurisdiction.find({ active: true });
  var jurMap = new Map();
  allInDB.forEach(function(j) { jurMap.set(j.name + "|" + j.state, j._id); });
  console.log("\nJurisdiction lookup: " + jurMap.size + " entries");

  // Step 3: Generate permits
  var permitLibrary = [];
  for (var k = 0; k < jurisdictions.length; k++) {
    var jur = jurisdictions[k];
    var bundle = corePermitsForPA(jur.city, jur.county);
    for (var b = 0; b < bundle.length; b++) {
      permitLibrary.push(bundle[b]);
    }
  }
  console.log("Permit definitions: " + permitLibrary.length);

  // Step 4: Upsert permits
  var beforePerm = await PermitType.countDocuments();
  var permUpserts = 0, permSkipped = 0, permErrors = 0;
  var missing = new Set();

  for (var p = 0; p < permitLibrary.length; p++) {
    var permit = permitLibrary[p];
    var key = permit.jurisdictionName + "|" + permit.state;
    var jId = jurMap.get(key);

    if (!jId) {
      missing.add(key);
      permSkipped++;
      continue;
    }

    var doc = {
      jurisdictionId: jId,
      vendorTypes: permit.vendorTypes || [],
      name: permit.name,
      description: permit.description || "",
      issuingAuthorityName: permit.issuingAuthorityName || "",
      issuingAuthorityContact: permit.issuingAuthorityContact || {},
      defaultDurationDays: typeof permit.defaultDurationDays === "number" ? permit.defaultDurationDays : 365,
      renewalPeriodMonths: typeof permit.renewalPeriodMonths === "number" ? permit.renewalPeriodMonths : 12,
      estimatedCost: permit.estimatedCost || "",
      applicationUrl: permit.applicationUrl || "",
      pdfTemplateUrl: permit.pdfTemplateUrl || "",
      requiredDocuments: Array.isArray(permit.requiredDocuments) ? permit.requiredDocuments : [],
      renewalLeadTimeDays: 30,
      importanceLevel: permit.importanceLevel || "critical",
      requiresFoodHandling: permit.requiresFoodHandling === true,
      formFields: [],
      active: true,
      updatedAt: new Date(),
    };

    try {
      await PermitType.findOneAndUpdate(
        { jurisdictionId: jId, name: doc.name },
        { $set: doc, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
      );
      permUpserts++;
    } catch (err) {
      permErrors++;
      console.error("  ERROR permit '" + permit.name + "' for " + key + ": " + err.message);
    }
  }

  var afterPerm = await PermitType.countDocuments();

  console.log("\n--- Permit Results ---");
  console.log("Upserted: " + permUpserts);
  console.log("Skipped:  " + permSkipped);
  console.log("Errors:   " + permErrors);
  if (missing.size > 0) {
    console.log("Missing jurisdictions: " + missing.size);
    var arr = Array.from(missing);
    for (var x = 0; x < Math.min(arr.length, 10); x++) console.log("  - " + arr[x]);
  }
  console.log("Total permit types in DB: " + afterPerm);

  // Summary
  var paCount = await Jurisdiction.countDocuments({ state: "PA" });
  var stateCount = await Jurisdiction.distinct("state");
  var luzCount = await Jurisdiction.countDocuments({ state: "PA", county: "Luzerne" });
  var lackCount = await Jurisdiction.countDocuments({ state: "PA", county: "Lackawanna" });
  var wyoCount = await Jurisdiction.countDocuments({ state: "PA", county: { $regex: /^Wyoming/i } });

  console.log("\n--- Grand Summary ---");
  console.log("PA jurisdictions: " + paCount);
  console.log("  Luzerne County: " + luzCount);
  console.log("  Lackawanna County: " + lackCount);
  console.log("  Wyoming County: " + wyoCount);
  console.log("Total states: " + stateCount.length);
  console.log("Total jurisdictions: " + afterJur);
  console.log("Total permit types: " + afterPerm);

  var sample = await Jurisdiction.find({ county: "Luzerne" }).sort({ city: 1 }).limit(10).select("name city county");
  console.log("\nSample Luzerne County:");
  sample.forEach(function(j) { console.log("  " + j.city + " (" + j.county + ")"); });

  await mongoose.disconnect();
  console.log("\nDone! " + allJur.length + " jurisdictions + " + permitLibrary.length + " permits seeded.\n");
}

main()
  .then(function() { process.exit(0); })
  .catch(function(err) { console.error("FATAL: " + err.message); process.exit(1); });
