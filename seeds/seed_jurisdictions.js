// seeds/seed_jurisdictions.js

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

const Jurisdiction = mongoose.model("Jurisdiction", jurisdictionSchema);

const jurisdictions = [
  // === CORE ORIGINAL CITIES ===
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
    notes:
      "City of Miami + Miami-Dade business tax receipts; food trucks also need Florida DBPR licensing.",
    contactInfo: {
      website: "https://www.miamidade.gov/",
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
    notes:
      "NYC mobile food vending permit + personal license; additional permits for restricted areas and propane.",
    contactInfo: {
      website: "https://www.nyc.gov/",
      phone: "",
      email: "",
      address: "",
    },
  },

  // === PA BACK MOUNTAIN / DALLAS AREA ===
  {
    name: "Dallas Township, PA",
    type: "city",
    city: "Dallas Township",
    county: "Luzerne",
    state: "PA",
    notes:
      "Back Mountain municipality; local mobile food facility ordinance applies for events and street vending.",
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
    notes:
      "Back Mountain municipality; treat as separate jurisdiction for local vendor rules when known.",
    contactInfo: {
      website: "",
      phone: "",
      email: "",
      address: "",
    },
  },
  {
    name: "Lehman Township, PA",
    type: "city",
    city: "Lehman Township",
    county: "Luzerne",
    state: "PA",
    notes:
      "Back Mountain municipality; fairs and events often require local approvals.",
    contactInfo: {
      website: "",
      phone: "",
      email: "",
      address: "",
    },
  },

  // === EXTRA PA CITIES (GOOD COVERAGE) ===
  {
    name: "Philadelphia, PA",
    type: "city",
    city: "Philadelphia",
    county: "Philadelphia",
    state: "PA",
    notes: "Large urban food truck and cart market.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Pittsburgh, PA",
    type: "city",
    city: "Pittsburgh",
    county: "Allegheny",
    state: "PA",
    notes: "Strong event and brewery food truck scene.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Harrisburg, PA",
    type: "city",
    city: "Harrisburg",
    county: "Dauphin",
    state: "PA",
    notes: "Capitol-area events and festivals.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Allentown, PA",
    type: "city",
    city: "Allentown",
    county: "Lehigh",
    state: "PA",
    notes: "Regional events and mobile vendor markets.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Erie, PA",
    type: "city",
    city: "Erie",
    county: "Erie",
    state: "PA",
    notes: "Seasonal waterfront and event vendors.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Lancaster, PA",
    type: "city",
    city: "Lancaster",
    county: "Lancaster",
    state: "PA",
    notes: "Farmer's markets and seasonal food vendors.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },

  // === 10 EXTRA POPULAR FOOD-TRUCK / VENDOR CITIES ===
  {
    name: "Portland, OR",
    type: "city",
    city: "Portland",
    county: "Multnomah",
    state: "OR",
    notes: "Nationally known for food truck pods and carts.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Los Angeles, CA",
    type: "city",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    notes: "Huge mobile food market with complex permitting.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "San Francisco, CA",
    type: "city",
    city: "San Francisco",
    county: "San Francisco",
    state: "CA",
    notes: "Dense urban market with event-heavy vendors.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Houston, TX",
    type: "city",
    city: "Houston",
    county: "Harris",
    state: "TX",
    notes: "Year-round food truck operations and events.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Denver, CO",
    type: "city",
    city: "Denver",
    county: "Denver",
    state: "CO",
    notes: "Mobile vendors around breweries and events.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "San Diego, CA",
    type: "city",
    city: "San Diego",
    county: "San Diego",
    state: "CA",
    notes: "Coastal city with heavy event and tourist traffic.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Chicago, IL",
    type: "city",
    city: "Chicago",
    county: "Cook",
    state: "IL",
    notes: "Large metro with dense office and event zones.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Phoenix, AZ",
    type: "city",
    city: "Phoenix",
    county: "Maricopa",
    state: "AZ",
    notes: "Warm-weather mobile vendor market.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Atlanta, GA",
    type: "city",
    city: "Atlanta",
    county: "Fulton",
    state: "GA",
    notes: "Strong food truck presence at events and breweries.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Nashville, TN",
    type: "city",
    city: "Nashville",
    county: "Davidson",
    state: "TN",
    notes: "Music + nightlife = strong food truck and pop-up scene.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
