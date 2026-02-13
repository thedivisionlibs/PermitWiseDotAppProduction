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
    contactInfo: { website: "https://www.miamidade.gov/", phone: "", email: "", address: "" },
  },
  {
    name: "New York City, NY",
    type: "city",
    city: "New York",
    county: "New York",
    state: "NY",
    notes: "NYC mobile food vending permit + personal license; additional permits for propane, etc.",
    contactInfo: { website: "https://www.nyc.gov/", phone: "", email: "", address: "" },
  },

  // === PA BACK MOUNTAIN / DALLAS AREA ===
  {
    name: "Dallas Township, PA",
    type: "city",
    city: "Dallas Township",
    county: "Luzerne",
    state: "PA",
    notes: "Back Mountain municipality; local ordinance approvals may apply.",
    contactInfo: { website: "https://www.dallastwp.org/", phone: "", email: "", address: "" },
  },
  {
    name: "Kingston Township, PA",
    type: "city",
    city: "Kingston Township",
    county: "Luzerne",
    state: "PA",
    notes: "Back Mountain municipality; separate local vendor rules where applicable.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },
  {
    name: "Lehman Township, PA",
    type: "city",
    city: "Lehman Township",
    county: "Luzerne",
    state: "PA",
    notes: "Back Mountain municipality; fairs/events often require local approvals.",
    contactInfo: { website: "", phone: "", email: "", address: "" },
  },

  // === EXTRA PA CITIES ===
  { name: "Philadelphia, PA", type: "city", city: "Philadelphia", county: "Philadelphia", state: "PA", notes: "Large urban food truck and cart market.", contactInfo: { website: "https://www.phila.gov/", phone: "", email: "", address: "" } },
  { name: "Pittsburgh, PA", type: "city", city: "Pittsburgh", county: "Allegheny", state: "PA", notes: "Strong event and brewery food truck scene.", contactInfo: { website: "https://pittsburghpa.gov/", phone: "", email: "", address: "" } },
  { name: "Harrisburg, PA", type: "city", city: "Harrisburg", county: "Dauphin", state: "PA", notes: "Capitol-area events and festivals.", contactInfo: { website: "https://harrisburgpa.gov/", phone: "", email: "", address: "" } },
  { name: "Allentown, PA", type: "city", city: "Allentown", county: "Lehigh", state: "PA", notes: "Regional events and vendor markets.", contactInfo: { website: "https://www.allentownpa.gov/", phone: "", email: "", address: "" } },
  { name: "Erie, PA", type: "city", city: "Erie", county: "Erie", state: "PA", notes: "Seasonal waterfront and event vendors.", contactInfo: { website: "https://www.erie.pa.us/", phone: "", email: "", address: "" } },
  { name: "Lancaster, PA", type: "city", city: "Lancaster", county: "Lancaster", state: "PA", notes: "Farmer's markets and seasonal vendors.", contactInfo: { website: "https://cityoflancasterpa.gov/", phone: "", email: "", address: "" } },

  // === WEST COAST / HIGH-ACTIVITY VENDOR CITIES ===
  { name: "Los Angeles, CA", type: "city", city: "Los Angeles", county: "Los Angeles", state: "CA", notes: "Huge mobile food market with layered permitting (county health + city tax).", contactInfo: { website: "https://business.lacity.gov/", phone: "", email: "", address: "" } },
  { name: "San Francisco, CA", type: "city", city: "San Francisco", county: "San Francisco", state: "CA", notes: "Mobile food requires health permit + often Public Works permit for curbside.", contactInfo: { website: "https://www.sf.gov/", phone: "", email: "", address: "" } },
  { name: "San Diego, CA", type: "city", city: "San Diego", county: "San Diego", state: "CA", notes: "County health program + city permit may apply depending on location.", contactInfo: { website: "https://www.sandiego.gov/", phone: "", email: "", address: "" } },
  { name: "Seattle, WA", type: "city", city: "Seattle", county: "King", state: "WA", notes: "King County health permit + Seattle business license tax certificate.", contactInfo: { website: "https://www.seattle.gov/", phone: "", email: "", address: "" } },
  { name: "Portland, OR", type: "city", city: "Portland", county: "Multnomah", state: "OR", notes: "Food carts/pods: county licensing is a major requirement.", contactInfo: { website: "https://www.portland.gov/", phone: "", email: "", address: "" } },

  // === BIG METROS / EVENT CITIES ===
  { name: "Chicago, IL", type: "city", city: "Chicago", county: "Cook", state: "IL", notes: "BACP mobile food vendor licensing.", contactInfo: { website: "https://www.chicago.gov/", phone: "", email: "", address: "" } },
  { name: "Denver, CO", type: "city", city: "Denver", county: "Denver", state: "CO", notes: "Retail food mobile license required for food trucks/carts.", contactInfo: { website: "https://www.denvergov.org/", phone: "", email: "", address: "" } },
  { name: "Houston, TX", type: "city", city: "Houston", county: "Harris", state: "TX", notes: "Large market; health + fire expectations common for food trucks.", contactInfo: { website: "https://www.houstontx.gov/", phone: "", email: "", address: "" } },
  { name: "Phoenix, AZ", type: "city", city: "Phoenix", county: "Maricopa", state: "AZ", notes: "Warm-weather mobile vendor market.", contactInfo: { website: "https://www.phoenix.gov/", phone: "", email: "", address: "" } },
  { name: "Atlanta, GA", type: "city", city: "Atlanta", county: "Fulton", state: "GA", notes: "Strong event & brewery vendor scene.", contactInfo: { website: "https://www.atlantaga.gov/", phone: "", email: "", address: "" } },
  { name: "Nashville, TN", type: "city", city: "Nashville", county: "Davidson", state: "TN", notes: "Strong pop-up + mobile vendor scene.", contactInfo: { website: "https://www.nashville.gov/", phone: "", email: "", address: "" } },

  // === MORE MAJOR CITIES (core permits only unless added in permit library) ===
  { name: "Dallas, TX", type: "city", city: "Dallas", county: "Dallas", state: "TX", notes: "", contactInfo: { website: "https://dallascityhall.com/", phone: "", email: "", address: "" } },
  { name: "San Antonio, TX", type: "city", city: "San Antonio", county: "Bexar", state: "TX", notes: "", contactInfo: { website: "https://www.sanantonio.gov/", phone: "", email: "", address: "" } },
  { name: "Fort Worth, TX", type: "city", city: "Fort Worth", county: "Tarrant", state: "TX", notes: "", contactInfo: { website: "https://www.fortworthtexas.gov/", phone: "", email: "", address: "" } },
  { name: "Orlando, FL", type: "city", city: "Orlando", county: "Orange", state: "FL", notes: "", contactInfo: { website: "https://www.orlando.gov/", phone: "", email: "", address: "" } },
  { name: "Tampa, FL", type: "city", city: "Tampa", county: "Hillsborough", state: "FL", notes: "", contactInfo: { website: "https://www.tampa.gov/", phone: "", email: "", address: "" } },
  { name: "Jacksonville, FL", type: "city", city: "Jacksonville", county: "Duval", state: "FL", notes: "", contactInfo: { website: "https://www.coj.net/", phone: "", email: "", address: "" } },
  { name: "Boston, MA", type: "city", city: "Boston", county: "Suffolk", state: "MA", notes: "", contactInfo: { website: "https://www.boston.gov/", phone: "", email: "", address: "" } },
  { name: "Washington, DC", type: "city", city: "Washington", county: "District of Columbia", state: "DC", notes: "", contactInfo: { website: "https://dc.gov/", phone: "", email: "", address: "" } },
  { name: "Las Vegas, NV", type: "city", city: "Las Vegas", county: "Clark", state: "NV", notes: "", contactInfo: { website: "https://www.lasvegasnevada.gov/", phone: "", email: "", address: "" } },
  { name: "Charlotte, NC", type: "city", city: "Charlotte", county: "Mecklenburg", state: "NC", notes: "", contactInfo: { website: "https://www.charlottenc.gov/", phone: "", email: "", address: "" } },
  { name: "Columbus, OH", type: "city", city: "Columbus", county: "Franklin", state: "OH", notes: "", contactInfo: { website: "https://www.columbus.gov/", phone: "", email: "", address: "" } },
  { name: "Detroit, MI", type: "city", city: "Detroit", county: "Wayne", state: "MI", notes: "", contactInfo: { website: "https://detroitmi.gov/", phone: "", email: "", address: "" } },
  { name: "Minneapolis, MN", type: "city", city: "Minneapolis", county: "Hennepin", state: "MN", notes: "", contactInfo: { website: "https://www.minneapolismn.gov/", phone: "", email: "", address: "" } },
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
