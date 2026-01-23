/**
 * seed_jurisdictions.js
 * Run: node seed_jurisdictions.js
 * Requires: MONGODB_URI in env
 */
const mongoose = require("mongoose");

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

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);

const jurisdictions = [
  // === ORIGINAL CITIES ===
  {
    name: "Austin, TX",
    type: "city",
    city: "Austin",
    county: "Travis",
    state: "TX",
    notes: "Mobile food vendors permitted via Austin Public Health.",
    contactInfo: {
      website: "https://www.austintexas.gov/department/mobile-food-vendors",
      phone: "",
      email: "",
      address: "",
    },
  },
  {
    name: "Miami, FL",
    type: "city",
    city: "Miami",
    county: "Miami-Dade",
    state: "FL",
    notes: "City BTR + Miami-Dade local business tax receipt; food trucks also need FL DBPR licensing.",
    contactInfo: {
      website: "https://www.miami.gov/Business-Licenses/Business-Licensing/Get-a-Business-Tax-Receipt-BTR",
      phone: "",
      email: "",
      address: "",
    },
  },
  {
    name: "New York City, NY",
    type: "city",
    city: "New York",
    county: "New York",
    state: "NY",
    notes: "NYC mobile food vending permit + individual license; restricted-area permits may apply.",
    contactInfo: {
      website: "https://nyc-business.nyc.gov/",
      phone: "",
      email: "",
      address: "",
    },
  },

  // === PA: Dallas / Back Mountain area ===
  {
    name: "Dallas Township, PA",
    type: "city",
    city: "Dallas Township",
    county: "Luzerne",
    state: "PA",
    notes: "Local mobile food facilities ordinance applies; PA Dept. of Agriculture permits also apply to many food vendors.",
    contactInfo: {
      website: "https://www.dallastwp.org/",
      phone: "",
      email: "",
      address: "",
    },
  },
  {
    name: "Kingston Township, PA",
    type: "city",
    city: "Kingston Township",
    county: "Luzerne",
    state: "PA",
    notes: "Back Mountain municipality; treat as separate city jurisdiction for local rules where applicable.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Lehman Township, PA",
    type: "city",
    city: "Lehman Township",
    county: "Luzerne",
    state: "PA",
    notes: "Back Mountain municipality; add local permits as you confirm requirements.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },

  // === EXTRA PA CITIES (high vendor volume / good launch coverage) ===
  { name: "Philadelphia, PA", type: "city", city: "Philadelphia", county: "Philadelphia", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Pittsburgh, PA", type: "city", city: "Pittsburgh", county: "Allegheny", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Harrisburg, PA", type: "city", city: "Harrisburg", county: "Dauphin", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Allentown, PA", type: "city", city: "Allentown", county: "Lehigh", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Erie, PA", type: "city", city: "Erie", county: "Erie", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Lancaster, PA", type: "city", city: "Lancaster", county: "Lancaster", state: "PA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },

  // === OTHER STATES / HIGH FOOD-TRUCK MARKETS (expansion targets) ===
  { name: "Portland, OR", type: "city", city: "Portland", county: "Multnomah", state: "OR", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Los Angeles, CA", type: "city", city: "Los Angeles", county: "Los Angeles", state: "CA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "San Francisco, CA", type: "city", city: "San Francisco", county: "San Francisco", state: "CA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Houston, TX", type: "city", city: "Houston", county: "Harris", state: "TX", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Denver, CO", type: "city", city: "Denver", county: "Denver", state: "CO", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "San Diego, CA", type: "city", city: "San Diego", county: "San Diego", state: "CA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Chicago, IL", type: "city", city: "Chicago", county: "Cook", state: "IL", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Phoenix, AZ", type: "city", city: "Phoenix", county: "Maricopa", state: "AZ", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Atlanta, GA", type: "city", city: "Atlanta", county: "Fulton", state: "GA", notes: "", contactInfo: { website: "", phone: "", email: "", address: "" } },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);

  for (const j of jurisdictions) {
    await Jurisdiction.findOneAndUpdate(
      { name: j.name, state: j.state, type: j.type },
      { ...j, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  console.log(`Upserted ${jurisdictions.length} jurisdictions.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
