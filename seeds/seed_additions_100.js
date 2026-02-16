// seeds/seed_additions_100.js
// Adds 100 new jurisdictions + permits on top of existing seed data.
// Run AFTER seed_jurisdictions.js and seed_permit_library.js
//
// Usage: MONGODB_URI="mongodb+srv://..." node seed_additions_100.js
// Or locally: node seed_additions_100.js

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/permitwise";

// ── Schemas (mirror server.js exactly) ───────────────────────────────
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

// ── All 6 core vendor types ──────────────────────────────────────────
const ALL_VENDOR_TYPES = [
  "food_truck", "mobile_bartender", "tent_vendor",
  "mobile_retail", "pop_up_shop", "farmers_market", "craft_vendor",
];
const FOOD_TYPES = ["food_truck", "mobile_bartender"];

// ── State sales tax URLs ─────────────────────────────────────────────
const STATE_TAX_URLS = {
  PA: "https://mypath.pa.gov/",
  CA: "https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax.htm",
  FL: "https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx",
  TX: "https://comptroller.texas.gov/taxes/sales/",
  AZ: "https://azdor.gov/transaction-privilege-tax",
  NC: "https://www.ncdor.gov/taxes-forms/sales-and-use-tax",
  GA: "https://dor.georgia.gov/taxes/sales-use-tax",
  TN: "https://www.tn.gov/revenue/taxes/sales-and-use-tax.html",
  SC: "https://dor.sc.gov/tax/sales-and-use",
  NJ: "https://www.nj.gov/treasury/taxation/su_over.shtml",
  VA: "https://www.tax.virginia.gov/sales-and-use-tax",
  MI: "https://www.michigan.gov/treasury/0,4679,7-121-44402_44404---,00.html",
  IN: "https://www.in.gov/dor/business-tax/sales-tax/",
  IA: "https://tax.iowa.gov/iowa-sales-and-use-tax",
  KS: "https://www.ksrevenue.gov/salesanduse.html",
  MD: "https://www.marylandtaxes.gov/business/sales-use/index.php",
  NM: "https://www.tax.newmexico.gov/gross-receipts-tax/",
  UT: "https://tax.utah.gov/sales",
  CO: "https://tax.colorado.gov/sales-tax",
  RI: "https://tax.ri.gov/tax-sections/sales-tax",
  CT: "https://portal.ct.gov/DRS/Sales-Tax/Sales-and-Use-Tax",
  WA: "https://dor.wa.gov/taxes-rates/sales-use-tax-rates",
  NY: "https://www.tax.ny.gov/bus/st/stidx.htm",
  MA: "https://www.mass.gov/guides/sales-and-use-tax",
  DE: "", // no sales tax
  NH: "", // no sales tax
  ME: "https://www.maine.gov/revenue/taxes/sales-use-tax",
  OR: "", // no sales tax
};

// =====================================================================
// 50 PENNSYLVANIA JURISDICTIONS
// =====================================================================
const paJurisdictions = [
  // ── NEPA / Luzerne County (user's area) ──
  { city: "Pittston", county: "Luzerne", notes: "City of Pittston vendor permit required per Ch. 370; peddler/street vendor license through City Hall; PA Dept of Agriculture MFF license for food trucks.", contactInfo: { website: "https://www.pittstoncity.org/", phone: "(570) 654-0513", email: "", address: "35 Broad Street, Pittston, PA 18640" } },
  { city: "West Pittston", county: "Luzerne", notes: "Borough solicitation/vendor permit via Borough Building; PA Dept of Agriculture MFF license required; zoning approval may apply.", contactInfo: { website: "https://westpittstonborough.com/", phone: "(570) 655-7782", email: "code-zoning@westpittstonborough.com", address: "555 Exeter Avenue, West Pittston, PA 18643" } },
  { city: "Pittston Township", county: "Luzerne", notes: "Township vendor permit application required; between Scranton and Wilkes-Barre near I-476 and I-81.", contactInfo: { website: "https://pittstontownship.org/", phone: "(570) 654-0161", email: "", address: "" } },
  { city: "Wilkes-Barre", county: "Luzerne", notes: "City vendor/peddler license required; largest NEPA city; PA Dept of Agriculture MFF license.", contactInfo: { website: "https://www.wilkes-barre.city/", phone: "(570) 208-4100", email: "", address: "" } },
  { city: "Hazleton", county: "Luzerne", notes: "City business license + PA Dept of Agriculture MFF license; growing food truck scene.", contactInfo: { website: "https://www.hazletoncity.org/", phone: "(570) 459-4910", email: "", address: "" } },
  { city: "Nanticoke", county: "Luzerne", notes: "City vendor permit + PA Dept of Agriculture MFF license.", contactInfo: { website: "https://www.nanticokecity.com/", phone: "(570) 735-2800", email: "", address: "" } },
  { city: "Wyoming", county: "Luzerne", notes: "Borough vendor permit; small borough in Wyoming Valley.", contactInfo: { website: "https://www.wyomingboro.org/", phone: "(570) 693-1500", email: "", address: "" } },
  { city: "Exeter", county: "Luzerne", notes: "Borough vendor/peddler permit; adjacent to Pittston and West Pittston.", contactInfo: { website: "https://www.exeterborough.com/", phone: "(570) 654-2944", email: "", address: "" } },
  { city: "Forty Fort", county: "Luzerne", notes: "Borough vendor permit; part of Greater Wilkes-Barre area.", contactInfo: { website: "https://www.fortyfort.org/", phone: "(570) 288-0491", email: "", address: "" } },
  { city: "Duryea", county: "Luzerne", notes: "Borough vendor permit; adjacent to Pittston.", contactInfo: { website: "https://www.duryeaborough.com/", phone: "(570) 457-3671", email: "", address: "" } },

  // ── Lackawanna County / surrounding ──
  { city: "Dunmore", county: "Lackawanna", notes: "Borough vendor license; adjacent to Scranton; PA Dept of Agriculture MFF.", contactInfo: { website: "https://www.dunmorepa.gov/", phone: "(570) 343-6102", email: "", address: "" } },
  { city: "Carbondale", county: "Lackawanna", notes: "City vendor permit; historic coal mining city in northeast Lackawanna County.", contactInfo: { website: "https://www.carbondalecity.org/", phone: "(570) 282-2563", email: "", address: "" } },
  { city: "Old Forge", county: "Lackawanna", notes: "Borough vendor permit; famous pizza town; heavy foot traffic for food vendors.", contactInfo: { website: "https://www.oldforgeborough.com/", phone: "(570) 457-6621", email: "", address: "" } },
  { city: "Clarks Summit", county: "Lackawanna", notes: "Borough vendor permit; affluent Scranton suburb.", contactInfo: { website: "https://clarkssummitboro.org/", phone: "(570) 586-2544", email: "", address: "" } },

  // ── Central PA ──
  { city: "York", county: "York", notes: "City vendor permit + York County food license; growing food truck scene downtown.", contactInfo: { website: "https://www.yorkcity.org/", phone: "(717) 849-2221", email: "", address: "" } },
  { city: "State College", county: "Centre", notes: "Borough vendor permit; Penn State University drives heavy food truck demand; special event permits available.", contactInfo: { website: "https://www.statecollegepa.us/", phone: "(814) 234-7100", email: "", address: "" } },
  { city: "Williamsport", county: "Lycoming", notes: "City vendor license; Little League World Series drives seasonal vendor demand; PA Dept of Agriculture.", contactInfo: { website: "https://www.cityofwilliamsport.org/", phone: "(570) 327-7500", email: "", address: "" } },
  { city: "Chambersburg", county: "Franklin", notes: "Borough business license + PA Dept of Agriculture MFF; ChambersFest and other events.", contactInfo: { website: "https://www.chambersburgpa.gov/", phone: "(717) 264-5151", email: "", address: "" } },
  { city: "Carlisle", county: "Cumberland", notes: "Borough vendor permit; Carlisle Car Show and Dickinson College events drive vendor traffic.", contactInfo: { website: "https://www.carlislepa.org/", phone: "(717) 240-6900", email: "", address: "" } },
  { city: "Mechanicsburg", county: "Cumberland", notes: "Borough vendor permit; Harrisburg suburb with active farmer's market and vendor scene.", contactInfo: { website: "https://www.mechanicsburgborough.org/", phone: "(717) 691-3310", email: "", address: "" } },
  { city: "Gettysburg", county: "Adams", notes: "Borough vendor permit; National Battlefield tourism drives heavy seasonal vendor traffic.", contactInfo: { website: "https://www.gettysburgpa.gov/", phone: "(717) 334-1160", email: "", address: "" } },
  { city: "Hanover", county: "York", notes: "Borough vendor license; Dutch Days festival and downtown events.", contactInfo: { website: "https://www.hanoverboroughpa.gov/", phone: "(717) 637-3877", email: "", address: "" } },
  { city: "Lewisburg", county: "Union", notes: "Borough vendor permit; Bucknell University and downtown arts district drive foot traffic.", contactInfo: { website: "https://www.lewisburgborough.org/", phone: "(570) 523-3614", email: "", address: "" } },

  // ── Lehigh Valley ──
  { city: "Easton", county: "Northampton", notes: "City vendor permit + Northampton County health; active downtown farmer's market and food truck scene.", contactInfo: { website: "https://www.easton-pa.com/", phone: "(610) 250-6600", email: "", address: "" } },
  { city: "Emmaus", county: "Lehigh", notes: "Borough vendor permit; small-town food truck events; Lehigh County.", contactInfo: { website: "https://www.emmaus.org/", phone: "(610) 965-9292", email: "", address: "" } },

  // ── Western PA ──
  { city: "Johnstown", county: "Cambria", notes: "City vendor permit + Cambria County health; Thunder in the Valley motorcycle event drives vendors.", contactInfo: { website: "https://www.cityofjohnstownpa.net/", phone: "(814) 533-2001", email: "", address: "" } },
  { city: "New Castle", county: "Lawrence", notes: "City vendor permit; fireworks capital of the US; Lawrence County.", contactInfo: { website: "https://www.newcastlepa.org/", phone: "(724) 656-3500", email: "", address: "" } },
  { city: "Butler", county: "Butler", notes: "City vendor permit; Butler County health; growing food truck scene.", contactInfo: { website: "https://cityofbutler.org/", phone: "(724) 285-4124", email: "", address: "" } },
  { city: "Meadville", county: "Crawford", notes: "City vendor permit; Allegheny College campus; Crawford County.", contactInfo: { website: "https://www.meadvillepa.gov/", phone: "(814) 724-6000", email: "", address: "" } },
  { city: "Greensburg", county: "Westmoreland", notes: "City vendor permit; Westmoreland County seat; downtown revitalization.", contactInfo: { website: "https://www.greensburgpa.com/", phone: "(724) 834-7010", email: "", address: "" } },
  { city: "Indiana", county: "Indiana", notes: "Borough vendor permit; IUP campus; Indiana County.", contactInfo: { website: "https://www.indianaboro.com/", phone: "(724) 349-2135", email: "", address: "" } },
  { city: "Monroeville", county: "Allegheny", notes: "Municipality vendor permit; Allegheny County Health Dept (ACHD) food permit required; major eastern Pittsburgh suburb.", contactInfo: { website: "https://www.monroeville.pa.us/", phone: "(412) 856-1000", email: "", address: "" } },
  { city: "Cranberry Township", county: "Butler", notes: "Township vendor permit; fast-growing northern Pittsburgh suburb with heavy retail/food traffic.", contactInfo: { website: "https://www.cranberrytownship.org/", phone: "(724) 776-4806", email: "", address: "" } },

  // ── Suburban Philadelphia / Southeast PA ──
  { city: "Norristown", county: "Montgomery", notes: "Municipality vendor permit; Montgomery County seat; Montgomery County health dept (separate from PDA).", contactInfo: { website: "https://www.norristown.org/", phone: "(610) 272-3500", email: "", address: "" } },
  { city: "Chester", county: "Delaware", notes: "City vendor permit; Delaware County health dept (separate from PDA); waterfront redevelopment.", contactInfo: { website: "https://www.chestercity.com/", phone: "(610) 447-7700", email: "", address: "" } },
  { city: "West Chester", county: "Chester", notes: "Borough vendor permit; Chester County seat; WCU campus; active downtown food scene. Chester County health dept (separate from PDA).", contactInfo: { website: "https://www.west-chester.com/", phone: "(610) 696-5266", email: "", address: "" } },
  { city: "Phoenixville", county: "Chester", notes: "Borough vendor permit; fastest-growing PA borough; Blob Fest and events drive vendors; Chester County health.", contactInfo: { website: "https://www.phoenixville.org/", phone: "(610) 933-8801", email: "", address: "" } },
  { city: "Coatesville", county: "Chester", notes: "City vendor permit; Chester County health dept.", contactInfo: { website: "https://www.coatesville.org/", phone: "(610) 384-0300", email: "", address: "" } },
  { city: "Downingtown", county: "Chester", notes: "Borough vendor permit; Good Neighbor Day festival; Chester County health.", contactInfo: { website: "https://www.downingtown.org/", phone: "(610) 269-0344", email: "", address: "" } },
  { city: "Upper Merion Township", county: "Montgomery", notes: "Township vendor/peddler permit; King of Prussia area; massive retail and event traffic; Montgomery County health.", contactInfo: { website: "https://www.umtownship.org/", phone: "(610) 265-2600", email: "", address: "" } },
  { city: "Doylestown", county: "Bucks", notes: "Borough vendor permit; Bucks County seat; Bucks County health dept (separate from PDA); active arts/food scene.", contactInfo: { website: "https://www.doylestownborough.net/", phone: "(215) 345-4140", email: "", address: "" } },
  { city: "Bensalem", county: "Bucks", notes: "Township vendor permit; most populated Bucks County municipality (62K+); Bucks County health.", contactInfo: { website: "https://www.bensalemtwp.org/", phone: "(215) 633-3600", email: "", address: "" } },
  { city: "Bristol", county: "Bucks", notes: "Borough vendor permit; waterfront events; Bucks County health.", contactInfo: { website: "https://www.bristolborough.com/", phone: "(215) 788-3828", email: "", address: "" } },
  { city: "Media", county: "Delaware", notes: "Borough vendor permit; 'Everybody's Hometown'; Restaurant Row food scene; Delaware County health.", contactInfo: { website: "https://www.mediaborough.com/", phone: "(610) 566-5210", email: "", address: "" } },
  { city: "Upper Darby", county: "Delaware", notes: "Township vendor permit; most populated PA township (85K+); Delaware County health dept.", contactInfo: { website: "https://www.upperdarby.org/", phone: "(610) 734-7600", email: "", address: "" } },
  { city: "Pottstown", county: "Montgomery", notes: "Borough vendor permit; Pottstown Food Truck Festival; Montgomery County health.", contactInfo: { website: "https://www.pottstown.org/", phone: "(610) 970-6500", email: "", address: "" } },

  // ── NE PA / Poconos ──
  { city: "Pottsville", county: "Schuylkill", notes: "City vendor permit; Yuengling Brewery tourism; PA Dept of Agriculture MFF.", contactInfo: { website: "https://www.cityofpottsville.com/", phone: "(570) 622-1234", email: "", address: "" } },
  { city: "Stroudsburg", county: "Monroe", notes: "Borough vendor permit; Poconos gateway; heavy tourist/vendor traffic; PA Dept of Agriculture.", contactInfo: { website: "https://www.stroudsburgboro.com/", phone: "(570) 421-5444", email: "", address: "" } },
  { city: "East Stroudsburg", county: "Monroe", notes: "Borough vendor permit; ESU campus; adjacent to Stroudsburg; Poconos area.", contactInfo: { website: "https://www.eaststroudsburgboro.org/", phone: "(570) 421-8300", email: "", address: "" } },
  { city: "Jim Thorpe", county: "Carbon", notes: "Borough vendor permit; 'Switzerland of America' tourist town; heavy seasonal foot traffic.", contactInfo: { website: "https://www.jimthorpeborough.com/", phone: "(570) 325-2810", email: "", address: "" } },
];

// =====================================================================
// 50 HIGH-TRAFFIC FOOD TRUCK CITIES (non-PA)
// =====================================================================
const highTrafficJurisdictions = [
  // ── California (6) - top food truck density ──
  { city: "Santa Barbara", county: "Santa Barbara", state: "CA", notes: "Santa Barbara County EH MFF permit; UCSB area; strong tourist food truck scene.", contactInfo: { website: "https://www.countyofsb.org/phd/food-safety", phone: "(805) 681-4900", email: "", address: "" } },
  { city: "Berkeley", county: "Alameda", state: "CA", notes: "Alameda County DEH MFF permit; UC Berkeley campus drives heavy food truck demand; Gourmet Ghetto.", contactInfo: { website: "https://deh.acgov.org/", phone: "(510) 567-6724", email: "", address: "" } },
  { city: "Santa Cruz", county: "Santa Cruz", state: "CA", notes: "Santa Cruz County EH MFF permit; UCSC, beach boardwalk, and downtown food pods.", contactInfo: { website: "https://www.scceh.com/", phone: "(831) 454-2022", email: "", address: "" } },
  { city: "Palo Alto", county: "Santa Clara", state: "CA", notes: "Santa Clara County DEH MFF permit; Stanford campus; tech office parks drive lunchtime truck demand.", contactInfo: { website: "https://deh.santaclaracounty.gov/", phone: "(408) 918-1908", email: "", address: "" } },
  { city: "Santa Monica", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit + City business license; beach boardwalk and 3rd Street Promenade food trucks.", contactInfo: { website: "https://www.santamonica.gov/", phone: "(310) 458-8301", email: "", address: "" } },
  { city: "Redondo Beach", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit + City license; beachfront and Riviera Village food truck nights.", contactInfo: { website: "https://www.redondo.org/", phone: "(310) 318-0610", email: "", address: "" } },

  // ── Florida (5) - tourist/beach high traffic ──
  { city: "Key West", county: "Monroe", state: "FL", notes: "Monroe County Health Dept + City business tax receipt; limited street vending spots; heavy tourist foot traffic.", contactInfo: { website: "https://www.cityofkeywest-fl.gov/", phone: "(305) 809-3700", email: "", address: "" } },
  { city: "Naples", county: "Collier", state: "FL", notes: "Collier County Health Dept + City BTR; affluent market; 5th Avenue food truck events.", contactInfo: { website: "https://www.naplesgov.com/", phone: "(239) 213-1000", email: "", address: "" } },
  { city: "Boca Raton", county: "Palm Beach", state: "FL", notes: "Palm Beach County Health Dept + City BTR; food truck parks and corporate campus lunch runs.", contactInfo: { website: "https://www.myboca.us/", phone: "(561) 393-7700", email: "", address: "" } },
  { city: "Pensacola", county: "Escambia", state: "FL", notes: "Escambia County Health Dept + City BTR; beach area and NAS Pensacola drive vendor traffic.", contactInfo: { website: "https://www.cityofpensacola.com/", phone: "(850) 435-1603", email: "", address: "" } },
  { city: "St. Augustine", county: "St. Johns", state: "FL", notes: "St. Johns County Health Dept + City BTR; oldest US city; heavy tourist foot traffic year-round.", contactInfo: { website: "https://www.citystaug.com/", phone: "(904) 825-1000", email: "", address: "" } },

  // ── Texas (4) - growing markets ──
  { city: "Galveston", county: "Galveston", state: "TX", notes: "City food truck permit + Galveston County Health District; Seawall Blvd food truck zone; beach tourism.", contactInfo: { website: "https://www.galvestontx.gov/", phone: "(409) 797-3500", email: "", address: "" } },
  { city: "San Marcos", county: "Hays", state: "TX", notes: "City vendor permit + Hays County; Texas State University 38K students; I-35 corridor.", contactInfo: { website: "https://www.sanmarcostx.gov/", phone: "(512) 393-8000", email: "", address: "" } },
  { city: "New Braunfels", county: "Comal", state: "TX", notes: "City vendor permit; Wurstfest, Schlitterbahn, and tubing tourism drive heavy seasonal vendor demand.", contactInfo: { website: "https://www.nbtexas.org/", phone: "(830) 221-4000", email: "", address: "" } },
  { city: "Bryan", county: "Brazos", state: "TX", notes: "City vendor permit; paired with College Station/Texas A&M; Brazos County Health Dept.", contactInfo: { website: "https://www.bryantx.gov/", phone: "(979) 209-5100", email: "", address: "" } },

  // ── Southeast - foodie/tourist (6) ──
  { city: "Chapel Hill", county: "Orange", state: "NC", notes: "Town vendor permit + Orange County Health Dept; UNC campus (30K students); Franklin Street food trucks.", contactInfo: { website: "https://www.townofchapelhill.org/", phone: "(919) 968-2743", email: "", address: "" } },
  { city: "Nags Head", county: "Dare", state: "NC", notes: "Town vendor permit; Outer Banks beach tourism; seasonal food truck demand peaks in summer.", contactInfo: { website: "https://www.nagsheadnc.gov/", phone: "(252) 441-5508", email: "", address: "" } },
  { city: "Decatur", county: "DeKalb", state: "GA", notes: "City vendor permit + DeKalb County Board of Health; Atlanta's top foodie suburb; food truck rallies.", contactInfo: { website: "https://www.decaturga.com/", phone: "(404) 370-4100", email: "", address: "" } },
  { city: "Franklin", county: "Williamson", state: "TN", notes: "City vendor permit + Williamson County Health; historic downtown Main Street; Nashville suburb food trucks.", contactInfo: { website: "https://www.franklintn.gov/", phone: "(615) 791-3217", email: "", address: "" } },
  { city: "Mount Pleasant", county: "Charleston", state: "SC", notes: "Town vendor permit + DHEC; affluent Charleston suburb; Shem Creek food truck area.", contactInfo: { website: "https://www.tompsc.com/", phone: "(843) 884-8517", email: "", address: "" } },
  { city: "Hilton Head Island", county: "Beaufort", state: "SC", notes: "Town vendor permit + DHEC; resort island; heavy tourist food truck demand.", contactInfo: { website: "https://www.hiltonheadislandsc.gov/", phone: "(843) 341-4600", email: "", address: "" } },

  // ── Southwest / Mountain (5) ──
  { city: "Sedona", county: "Yavapai", state: "AZ", notes: "City vendor permit + Yavapai County health; tourist destination; limited vending locations.", contactInfo: { website: "https://www.sedonaaz.gov/", phone: "(928) 204-7127", email: "", address: "" } },
  { city: "Prescott", county: "Yavapai", state: "AZ", notes: "City vendor permit + Yavapai County health; Courthouse Square events; growing food truck scene.", contactInfo: { website: "https://www.prescott-az.gov/", phone: "(928) 777-1100", email: "", address: "" } },
  { city: "Taos", county: "Taos", state: "NM", notes: "Town vendor permit + NMED; ski resort and art colony tourism; seasonal demand.", contactInfo: { website: "https://www.taosgov.com/", phone: "(575) 751-2000", email: "", address: "" } },
  { city: "Park City", county: "Summit", state: "UT", notes: "City vendor permit + Summit County Health Dept; Sundance Film Festival and ski tourism.", contactInfo: { website: "https://www.parkcity.org/", phone: "(435) 615-5000", email: "", address: "" } },
  { city: "Durango", county: "La Plata", state: "CO", notes: "City vendor permit + San Juan Basin Health Dept; ski/outdoor tourism and college (Fort Lewis).", contactInfo: { website: "https://www.durangogov.org/", phone: "(970) 375-5000", email: "", address: "" } },

  // ── Midwest (5) - college/foodie ──
  { city: "Traverse City", county: "Grand Traverse", state: "MI", notes: "City vendor permit + Grand Traverse County Health Dept; Cherry Festival and wine tourism food trucks.", contactInfo: { website: "https://www.traversecitymi.gov/", phone: "(231) 922-4480", email: "", address: "" } },
  { city: "Royal Oak", county: "Oakland", state: "MI", notes: "City vendor permit + Oakland County Health Dept; top Detroit suburb for food trucks and nightlife.", contactInfo: { website: "https://www.romi.gov/", phone: "(248) 246-3000", email: "", address: "" } },
  { city: "Iowa City", county: "Johnson", state: "IA", notes: "City vendor permit + Johnson County Health; University of Iowa (31K students); Ped Mall food trucks.", contactInfo: { website: "https://www.icgov.org/", phone: "(319) 356-5000", email: "", address: "" } },
  { city: "Lawrence", county: "Douglas", state: "KS", notes: "City vendor permit + Douglas County Health Dept; University of Kansas; Massachusetts Street food trucks.", contactInfo: { website: "https://www.lawrenceks.org/", phone: "(785) 832-3000", email: "", address: "" } },
  { city: "Bloomington", county: "Monroe", state: "IN", notes: "City vendor permit + Monroe County Health Dept; Indiana University (45K students); active food truck scene.", contactInfo: { website: "https://bloomington.in.gov/", phone: "(812) 349-3400", email: "", address: "" } },

  // ── Mid-Atlantic (6) ──
  { city: "Hoboken", county: "Hudson", state: "NJ", notes: "City vendor license (capped permits); heavy lunch food truck demand from NYC commuters; waterfront.", contactInfo: { website: "https://www.hobokennj.gov/", phone: "(201) 420-2000", email: "", address: "" } },
  { city: "Asbury Park", county: "Monmouth", state: "NJ", notes: "City vendor permit; beach boardwalk and downtown food truck rallies; revitalized foodie destination.", contactInfo: { website: "https://www.cityofasburypark.com/", phone: "(732) 775-2100", email: "", address: "" } },
  { city: "Montclair", county: "Essex", state: "NJ", notes: "Township vendor permit; top NJ foodie suburb; Montclair Center food truck nights.", contactInfo: { website: "https://www.montclairnjusa.org/", phone: "(973) 509-4950", email: "", address: "" } },
  { city: "Rehoboth Beach", county: "Sussex", state: "DE", notes: "City vendor permit; Delaware beach tourism; boardwalk food vendors; no state sales tax.", contactInfo: { website: "https://www.cityofrehoboth.com/", phone: "(302) 227-6181", email: "", address: "" } },
  { city: "Ocean City", county: "Worcester", state: "MD", notes: "Town vendor permit + Worcester County Health Dept; boardwalk and beach food vendors; seasonal demand.", contactInfo: { website: "https://www.oceancitymd.gov/", phone: "(410) 289-8951", email: "", address: "" } },
  { city: "Annapolis", county: "Anne Arundel", state: "MD", notes: "City vendor permit + Anne Arundel County Health Dept; Naval Academy area; tourist/boating traffic.", contactInfo: { website: "https://www.annapolis.gov/", phone: "(410) 263-7997", email: "", address: "" } },

  // ── Pacific Northwest (2) ──
  { city: "Astoria", county: "Clatsop", state: "OR", notes: "City vendor permit + Clatsop County EH; coastal tourist town; food cart pods.", contactInfo: { website: "https://www.astoria.or.us/", phone: "(503) 325-5821", email: "", address: "" } },
  { city: "Bellingham", county: "Whatcom", state: "WA", notes: "City vendor permit + Whatcom County Health Dept; WWU campus; border town food truck scene.", contactInfo: { website: "https://cob.org/", phone: "(360) 778-8000", email: "", address: "" } },

  // ── College towns / tourist (11) ──
  { city: "Ithaca", county: "Tompkins", state: "NY", notes: "City vendor permit + Tompkins County Health Dept; Cornell/IC campuses (30K+ students); Ithaca Commons food trucks.", contactInfo: { website: "https://www.cityofithaca.org/", phone: "(607) 274-6501", email: "", address: "" } },
  { city: "Saratoga Springs", county: "Saratoga", state: "NY", notes: "City vendor permit; horse racing season and SPAC events drive heavy seasonal food truck traffic.", contactInfo: { website: "https://www.saratoga-springs.org/", phone: "(518) 587-3550", email: "", address: "" } },
  { city: "Bar Harbor", county: "Hancock", state: "ME", notes: "Town vendor permit; Acadia National Park gateway; 3.5M+ annual visitors; seasonal food vendor hotspot.", contactInfo: { website: "https://www.barharbormaine.gov/", phone: "(207) 288-4098", email: "", address: "" } },
  { city: "Northampton", county: "Hampshire", state: "MA", notes: "City vendor permit + Hampshire County health; Smith College; top foodie small city in New England.", contactInfo: { website: "https://www.northamptonma.gov/", phone: "(413) 587-1249", email: "", address: "" } },
  { city: "Portsmouth", county: "Rockingham", state: "NH", notes: "City vendor permit; historic seaport foodie destination; strong food truck and vendor scene.", contactInfo: { website: "https://www.cityofportsmouth.com/", phone: "(603) 610-7200", email: "", address: "" } },
  { city: "Charlottesville", county: "Charlottesville City", state: "VA", notes: "City vendor permit + VDH; UVA campus (25K students); Downtown Mall food trucks.", contactInfo: { website: "https://www.charlottesville.gov/", phone: "(434) 970-3101", email: "", address: "" } },
  { city: "Fredericksburg", county: "Fredericksburg City", state: "VA", notes: "City vendor permit + VDH; historic downtown; Civil War tourism; University of Mary Washington.", contactInfo: { website: "https://www.fredericksburgva.gov/", phone: "(540) 372-1010", email: "", address: "" } },
  { city: "Williamsburg", county: "James City", state: "VA", notes: "City vendor permit + VDH; Colonial Williamsburg tourism (2M+ visitors/yr); William & Mary campus.", contactInfo: { website: "https://www.williamsburgva.gov/", phone: "(757) 220-6100", email: "", address: "" } },
  { city: "Newport", county: "Newport", state: "RI", notes: "City vendor permit + RIDOH; mansion tours and sailing tourism; heavy summer food vendor traffic.", contactInfo: { website: "https://www.cityofnewport.com/", phone: "(401) 845-5300", email: "", address: "" } },
  { city: "Mystic", county: "New London", state: "CT", notes: "Village vendor permit (within Stonington/Groton); Mystic Seaport tourism; food truck events.", contactInfo: { website: "https://www.thisismystic.com/", phone: "", email: "", address: "" } },
  { city: "Beaufort", county: "Beaufort", state: "SC", notes: "City vendor permit + DHEC; Lowcountry tourism; Waterfront Park food vendors.", contactInfo: { website: "https://www.cityofbeaufort.org/", phone: "(843) 525-7070", email: "", address: "" } },
];

// =====================================================================
// CORE PERMIT BUNDLES (6 permits per jurisdiction)
// =====================================================================
function coreBundleForPA(jurisdictionName) {
  return [
    {
      jurisdictionName,
      state: "PA",
      name: "PA Dept of Agriculture Mobile Food Facility License",
      description: "State-level license for mobile food facilities issued by PA Dept of Agriculture Bureau of Food Safety. Required for all food trucks operating in PDA-jurisdiction areas. Plan review + inspection.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "PA Department of Agriculture",
      issuingAuthorityContact: { website: "https://www.pa.gov/agencies/pda/food/food-safety/retail-food/fairs-and-other-temporary-events/", phone: "(717) 787-4315", email: "", address: "2301 N. Cameron St, Room 112, Harrisburg, PA 17110" },
      estimatedCost: "$100–$400 (varies by risk level)",
      requiredDocuments: ["Application Packet - Mobile Food Facilities", "Detailed floor plan", "Menu", "Equipment list", "Commissary agreement", "Water/waste documentation"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
    {
      jurisdictionName,
      state: "PA",
      name: "PA Sales, Use & Hotel Occupancy Tax License",
      description: "Required before selling any taxable prepared food. PA base rate 6% + local surtax (Allegheny 1%, Philadelphia 2%). Register via myPATH.",
      vendorTypes: ALL_VENDOR_TYPES,
      issuingAuthorityName: "PA Department of Revenue",
      issuingAuthorityContact: { website: "https://mypath.pa.gov/", phone: "(717) 787-1064", email: "", address: "" },
      estimatedCost: "Free",
      requiredDocuments: ["myPATH registration", "EIN or SSN"],
      defaultDurationDays: 3650,
      importanceLevel: "critical",
    },
    {
      jurisdictionName,
      state: "PA",
      name: "General Liability Insurance Certificate ($1M minimum)",
      description: "Commercial general liability insurance naming the municipality as additional insured. Most PA municipalities require $1M per occurrence.",
      vendorTypes: ALL_VENDOR_TYPES,
      issuingAuthorityName: "Private Insurance Provider",
      estimatedCost: "$500–$2,000/year",
      requiredDocuments: ["Certificate of insurance", "Additional insured endorsement"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
    {
      jurisdictionName,
      state: "PA",
      name: "Fire Safety Inspection / Fire Permit",
      description: "Fire Marshal inspection for propane, suppression systems, fire extinguishers, and electrical. Required for any cooking-equipped mobile unit.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "Local Fire Department / Fire Marshal",
      estimatedCost: "$50–$200",
      requiredDocuments: ["Fire suppression certification", "Propane equipment documentation", "Fire extinguisher inspection tag"],
      defaultDurationDays: 365,
      importanceLevel: "often_forgotten",
    },
    {
      jurisdictionName,
      state: "PA",
      name: "Food Safety Certification (Manager/Handler)",
      description: "Person-in-Charge must be present at all times per PA Food Code. ANSI-accredited food safety certification (ServSafe or equivalent).",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "ServSafe / ANSI-accredited provider",
      estimatedCost: "$15–$180",
      requiredDocuments: ["Food safety certification card", "Exam completion certificate"],
      defaultDurationDays: 1825,
      renewalPeriodMonths: 60,
      importanceLevel: "critical",
      requiresFoodHandling: true,
    },
    {
      jurisdictionName,
      state: "PA",
      name: "Commissary / Service Base Agreement",
      description: "Written commissary agreement required. Mobile food facility must return daily for cleaning, waste discharge, water refill, and food storage. Cannot be a personal kitchen.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "Licensed Commissary Kitchen",
      estimatedCost: "$200–$1,000/month",
      requiredDocuments: ["Written commissary agreement", "Commissary license copy", "Floor plan showing separation from residential areas"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
  ];
}

function coreBundleForState(jurisdictionName, state) {
  const taxUrl = STATE_TAX_URLS[state] || "";
  return [
    {
      jurisdictionName, state,
      name: "General Business License/Registration",
      description: "Local business license or registration required to operate in this jurisdiction.",
      vendorTypes: ALL_VENDOR_TYPES,
      issuingAuthorityName: "City/Town Clerk or Business Licensing Office",
      estimatedCost: "$25–$350",
      requiredDocuments: ["Business license application", "EIN or SSN", "Proof of insurance"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
    {
      jurisdictionName, state,
      name: "State Sales/Use Tax Permit",
      description: "State tax registration for collecting sales tax on taxable food and goods.",
      vendorTypes: ALL_VENDOR_TYPES,
      issuingAuthorityName: "State Department of Revenue/Taxation",
      issuingAuthorityContact: { website: taxUrl },
      estimatedCost: "Free–$25",
      requiredDocuments: ["State tax registration", "EIN or SSN"],
      defaultDurationDays: 3650,
      importanceLevel: "critical",
    },
    {
      jurisdictionName, state,
      name: "General Liability Insurance Certificate ($1M minimum)",
      description: "Commercial general liability insurance required by most jurisdictions.",
      vendorTypes: ALL_VENDOR_TYPES,
      issuingAuthorityName: "Private Insurance Provider",
      estimatedCost: "$500–$2,000/year",
      requiredDocuments: ["Certificate of insurance", "Additional insured endorsement"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
    {
      jurisdictionName, state,
      name: "Fire Safety Inspection / Fire Permit",
      description: "Fire Marshal or Fire Dept inspection for cooking equipment, propane, suppression, and electrical safety.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "Local Fire Department / Fire Marshal",
      estimatedCost: "$50–$200",
      requiredDocuments: ["Fire suppression certification", "Propane documentation", "Fire extinguisher tag"],
      defaultDurationDays: 365,
      importanceLevel: "often_forgotten",
    },
    {
      jurisdictionName, state,
      name: "Food Safety Certification (Manager/Handler)",
      description: "ANSI-accredited food safety certification (ServSafe or equivalent) for food handlers.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "ServSafe / ANSI-accredited provider",
      estimatedCost: "$10–$180",
      requiredDocuments: ["Food safety certification card"],
      defaultDurationDays: 1825,
      renewalPeriodMonths: 60,
      importanceLevel: "critical",
      requiresFoodHandling: true,
    },
    {
      jurisdictionName, state,
      name: "Commissary / Service Base Agreement",
      description: "Written agreement with a licensed commercial kitchen for daily cleaning, waste disposal, water refill, and food storage.",
      vendorTypes: FOOD_TYPES,
      issuingAuthorityName: "Licensed Commissary Kitchen",
      estimatedCost: "$200–$1,000/month",
      requiredDocuments: ["Written commissary agreement", "Commissary facility license"],
      defaultDurationDays: 365,
      importanceLevel: "critical",
    },
  ];
}

// =====================================================================
// CITY-SPECIFIC PERMITS (researched)
// =====================================================================
function sp(jurisdictionName, state, name, description, opts = {}) {
  return {
    jurisdictionName,
    state,
    name,
    description,
    vendorTypes: opts.types || FOOD_TYPES,
    issuingAuthorityName: opts.auth || "",
    issuingAuthorityContact: { website: opts.url || "", phone: opts.phone || "", email: opts.email || "", address: opts.addr || "" },
    estimatedCost: opts.cost || "",
    requiredDocuments: opts.docs || [],
    defaultDurationDays: opts.days || 365,
    renewalPeriodMonths: opts.months || 12,
    importanceLevel: opts.imp || "critical",
    requiresFoodHandling: opts.foodHandling || false,
  };
}

const citySpecificPermits = [
  // ── PA City-Specific ──
  sp("Pittston", "PA", "City of Pittston Vendor/Peddler Permit", "Vendor permit required per City Code Ch. 370; unlawful to operate without proper permits/licenses; food trucks must not remain stationary >10 min/hr as mobile vendors.", { auth: "City of Pittston", url: "https://www.pittstoncity.org/", phone: "(570) 654-0513", cost: "$25–$100", docs: ["Permit application", "Photo ID", "Proof of insurance", "Vehicle registration"] }),
  sp("West Pittston", "PA", "West Pittston Borough Solicitation/Vendor Permit", "Borough solicitation and vendor permit via Borough Building or email to code-zoning office.", { auth: "West Pittston Borough", url: "https://westpittstonborough.com/", phone: "(570) 655-7782", email: "code-zoning@westpittstonborough.com", cost: "$25–$75", docs: ["Solicitation/vendor application", "Photo ID", "Proof of insurance"] }),
  sp("Pittston Township", "PA", "Pittston Township Vendor Permit", "Township vendor permit application; between Scranton and Wilkes-Barre.", { auth: "Pittston Township", url: "https://pittstontownship.org/", phone: "(570) 654-0161", cost: "$25–$75", docs: ["Vendor permit application", "Photo ID", "Insurance certificate"] }),
  sp("Wilkes-Barre", "PA", "Wilkes-Barre Vendor/Peddler License", "City vendor and peddler license for food trucks operating in the city.", { auth: "City of Wilkes-Barre", url: "https://www.wilkes-barre.city/", phone: "(570) 208-4100", cost: "$50–$200", docs: ["License application", "Photo ID", "Insurance", "Health permit"] }),
  sp("State College", "PA", "State College Borough Vendor Permit", "Borough vendor license; high demand during Penn State game days and events.", { auth: "State College Borough", url: "https://www.statecollegepa.us/", phone: "(814) 234-7100", cost: "$100–$300", docs: ["Vendor application", "Insurance certificate", "Health permit", "Menu"] }),
  sp("York", "PA", "York City Vendor Permit", "City vendor permit for mobile food vendors in downtown York.", { auth: "City of York", url: "https://www.yorkcity.org/", phone: "(717) 849-2221", cost: "$50–$150", docs: ["Vendor permit application", "Insurance certificate", "Health permit"] }),
  sp("Monroeville", "PA", "Allegheny County Health Dept MFF Permit", "Annual health permit from ACHD required for mobile food facilities in Allegheny County (separate from PDA).", { auth: "Allegheny County Health Department", url: "https://www.alleghenycounty.us/Services/Health-Department/Food-Safety/Permits-and-Registration/Mobile-Food-Facilities", cost: "$150–$500", docs: ["ACHD application", "Floor plan", "Menu", "Commissary agreement", "Equipment list"] }),
  sp("Norristown", "PA", "Montgomery County Health Dept MFF Permit", "Montgomery County has its own health department (separate from PDA); mobile food permit required.", { auth: "Montgomery County Health Department", url: "https://www.montcopa.org/224/Health-Department", cost: "$100–$400", docs: ["Health permit application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("Chester", "PA", "Delaware County Health Dept MFF Permit", "Delaware County has its own health department (separate from PDA); mobile food facility permit required.", { auth: "Delaware County Health Department", cost: "$100–$400", docs: ["Health permit application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("West Chester", "PA", "Chester County Health Dept MFF Permit", "Chester County has its own health department (separate from PDA); mobile food permit required.", { auth: "Chester County Health Department", url: "https://www.chesco.org/224/Health-Department", cost: "$100–$350", docs: ["Health permit application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("Doylestown", "PA", "Bucks County Health Dept MFF Permit", "Bucks County Health Dept issues mobile food unit licenses (separate from PDA); plan review required.", { auth: "Bucks County Health Department", url: "https://www.buckscounty.gov/1153/Mobile-Food-Units-including-food-trucks", cost: "$100–$400", docs: ["Plan Review Application for Mobile Food Units", "Floor plan", "Menu", "Equipment list", "Commissary agreement"] }),
  sp("Stroudsburg", "PA", "Stroudsburg Borough Vendor Permit", "Borough vendor permit for Poconos gateway town; heavy tourist traffic.", { auth: "Stroudsburg Borough", url: "https://www.stroudsburgboro.com/", phone: "(570) 421-5444", cost: "$50–$150", docs: ["Vendor application", "Insurance", "Health permit"] }),

  // ── High-Traffic City-Specific ──
  sp("Santa Barbara", "CA", "Santa Barbara County EH MFF Permit", "County Environmental Health mobile food facility permit; risk-based annual fee.", { auth: "Santa Barbara County Public Health Dept", url: "https://www.countyofsb.org/phd/food-safety", phone: "(805) 681-4900", cost: "$200–$600", docs: ["Application", "Floor plan", "Menu", "Commissary agreement", "Equipment list"] }),
  sp("Berkeley", "CA", "City of Berkeley Business License", "City business license tax certificate required in addition to Alameda County health permit.", { auth: "City of Berkeley Finance Dept", url: "https://www.berkeleyca.gov/", cost: "$50–$200", docs: ["Business license application", "EIN"], types: ALL_VENDOR_TYPES }),
  sp("Key West", "FL", "Monroe County Health Dept MFV Permit", "County health dept mobile food vendor permit for all food service on the island.", { auth: "Monroe County Health Department", cost: "$150–$400", docs: ["Application", "Floor plan", "Menu", "Commissary letter"] }),
  sp("Galveston", "TX", "Galveston County Health District MFU Permit", "County health district permit for mobile food units; Seawall Blvd food truck zone.", { auth: "Galveston County Health District", url: "https://www.gchd.org/", cost: "$150–$350", docs: ["Application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("Hoboken", "NJ", "Hoboken Vendor License", "City vendor license with capped permits; competitive due to high demand from NYC commuter lunch traffic.", { auth: "City of Hoboken", url: "https://www.hobokennj.gov/", cost: "$100–$500", docs: ["Vendor license application", "Insurance certificate", "Health permit", "Vehicle registration"], types: ALL_VENDOR_TYPES }),
  sp("Chapel Hill", "NC", "Chapel Hill Mobile Food Vendor Permit", "Town permit for food trucks; designated areas near UNC campus and downtown.", { auth: "Town of Chapel Hill", url: "https://www.townofchapelhill.org/", cost: "$100–$250", docs: ["Vendor permit application", "Insurance", "Health permit", "Menu"] }),
  sp("Decatur", "GA", "DeKalb County Board of Health Food Permit", "County health permit required for all mobile food service in DeKalb County.", { auth: "DeKalb County Board of Health", cost: "$100–$300", docs: ["Application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("Park City", "UT", "Park City Mobile Vendor License", "City mobile vendor license; special event permits for Sundance and ski season.", { auth: "Park City Municipal", url: "https://www.parkcity.org/", cost: "$150–$500", docs: ["Vendor license application", "Insurance", "Health permit", "Summit County HD approval"] }),
  sp("Traverse City", "MI", "Grand Traverse County HD Food License", "County health dept food service license for mobile food establishments.", { auth: "Grand Traverse County Health Department", cost: "$100–$350", docs: ["Application", "Floor plan", "Menu", "Equipment list", "Commissary agreement"] }),
  sp("Iowa City", "IA", "Iowa City Vendor Permit", "City vendor permit + Iowa DIAL mobile food license required.", { auth: "City of Iowa City", url: "https://www.icgov.org/", cost: "$50–$200", docs: ["Vendor permit application", "Insurance", "Iowa DIAL license", "Menu"] }),
  sp("Annapolis", "MD", "Annapolis Vendor Permit", "City vendor permit for mobile food operations; downtown and waterfront zones.", { auth: "City of Annapolis", url: "https://www.annapolis.gov/", cost: "$100–$300", docs: ["Vendor application", "Insurance", "Anne Arundel County health permit"] }),
  sp("Ithaca", "NY", "Tompkins County Health Dept MFF Permit", "County health mobile food facility permit for Cornell/IC campus area.", { auth: "Tompkins County Health Department", cost: "$100–$300", docs: ["Application", "Floor plan", "Menu", "Commissary agreement"] }),
  sp("Charlottesville", "VA", "Charlottesville Mobile Vendor Permit", "City mobile vendor permit for food trucks; UVA campus and Downtown Mall areas.", { auth: "City of Charlottesville", url: "https://www.charlottesville.gov/", cost: "$50–$200", docs: ["Vendor permit application", "VDH health permit", "Insurance", "Menu"] }),
  sp("Williamsburg", "VA", "Williamsburg Vendor Permit", "City vendor permit; Colonial Williamsburg and William & Mary campus food truck areas.", { auth: "City of Williamsburg", url: "https://www.williamsburgva.gov/", cost: "$50–$200", docs: ["Vendor application", "VDH permit", "Insurance"] }),
  sp("Newport", "RI", "Newport Vendor License", "City vendor license for mobile food; waterfront and mansion tour area traffic.", { auth: "City of Newport", url: "https://www.cityofnewport.com/", cost: "$100–$300", docs: ["Vendor license application", "RIDOH license", "Insurance", "DBR MFE registration"] }),
  sp("Bloomington", "IN", "Monroe County Health Dept MFF License", "County health mobile food license for IU campus and downtown area.", { auth: "Monroe County Health Department", cost: "$100–$300", docs: ["Application", "Floor plan", "Menu", "Commissary agreement"] }),
];

// =====================================================================
// MAIN
// =====================================================================
async function main() {
  console.log("\n=== PermitWise - Seed 100 Additional Jurisdictions ===");
  console.log("Connecting to: " + MONGODB_URI.replace(/\/\/[^@]+@/, "//***:***@"));

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB\n");

  // ── Step 1: Upsert jurisdictions ──
  const allNewJurisdictions = [
    ...paJurisdictions.map(j => ({ ...j, state: "PA", type: "city", name: j.city })),
    ...highTrafficJurisdictions.map(j => ({ ...j, type: "city", name: j.city })),
  ];

  const beforeJur = await Jurisdiction.countDocuments();
  console.log("Existing jurisdictions: " + beforeJur);
  console.log("New jurisdictions to upsert: " + allNewJurisdictions.length);

  let jurCreated = 0, jurUpdated = 0, jurErrors = 0;

  for (const j of allNewJurisdictions) {
    try {
      const result = await Jurisdiction.findOneAndUpdate(
        { city: j.city, state: j.state },
        { $set: { ...j, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true, rawResult: true }
      );
      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        jurUpdated++;
      } else {
        jurCreated++;
      }
    } catch (err) {
      jurErrors++;
      console.error("  ERROR jurisdiction " + j.city + ", " + j.state + ": " + err.message);
    }
  }

  const afterJur = await Jurisdiction.countDocuments();
  console.log("\nJurisdictions - Created: " + jurCreated + ", Updated: " + jurUpdated + ", Errors: " + jurErrors);
  console.log("Total jurisdictions in DB: " + afterJur);

  // ── Step 2: Build jurisdiction lookup map ──
  const jurisdictions = await Jurisdiction.find({ active: true });
  const jurMap = new Map(jurisdictions.map(j => [j.name + "|" + j.state, j._id]));
  console.log("\nJurisdiction lookup map: " + jurMap.size + " entries");

  // ── Step 3: Build permit library ──
  const permitLibrary = [];

  // Core bundles for PA cities
  for (const j of paJurisdictions) {
    permitLibrary.push(...coreBundleForPA(j.city));
  }

  // Core bundles for non-PA cities
  for (const j of highTrafficJurisdictions) {
    permitLibrary.push(...coreBundleForState(j.city, j.state));
  }

  // City-specific permits
  permitLibrary.push(...citySpecificPermits);

  console.log("Permit definitions to process: " + permitLibrary.length);

  // ── Step 4: Upsert permits ──
  const beforePerm = await PermitType.countDocuments();
  let permUpserts = 0, permSkipped = 0, permErrors = 0;
  const missingJurisdictions = new Set();

  for (const p of permitLibrary) {
    const key = p.jurisdictionName + "|" + p.state;
    const jId = jurMap.get(key);

    if (!jId) {
      missingJurisdictions.add(key);
      permSkipped++;
      continue;
    }

    const doc = {
      jurisdictionId: jId,
      vendorTypes: p.vendorTypes || [],
      name: p.name,
      description: p.description || "",
      issuingAuthorityName: p.issuingAuthorityName || "",
      issuingAuthorityContact: p.issuingAuthorityContact || {},
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
      console.error("  ERROR permit '" + p.name + "' for " + key + ": " + err.message);
    }
  }

  const afterPerm = await PermitType.countDocuments();

  console.log("\n--- Permit Results ---");
  console.log("Upserted: " + permUpserts);
  console.log("Skipped:  " + permSkipped);
  console.log("Errors:   " + permErrors);
  if (missingJurisdictions.size > 0) {
    console.log("Missing jurisdictions (" + missingJurisdictions.size + "):");
    [...missingJurisdictions].slice(0, 10).forEach(function(j) { console.log("  - " + j); });
  }
  console.log("Total permit types in DB: " + afterPerm);

  // ── Verification ──
  const paCount = await Jurisdiction.countDocuments({ state: "PA" });
  const stateCount = await Jurisdiction.distinct("state");
  console.log("\n--- Summary ---");
  console.log("PA jurisdictions: " + paCount);
  console.log("Total states: " + stateCount.length);
  console.log("Total jurisdictions: " + afterJur);
  console.log("Total permit types: " + afterPerm);

  // Sample
  const sample = await PermitType.find().sort({ createdAt: -1 }).limit(5).populate("jurisdictionId", "name city state").select("name jurisdictionId");
  console.log("\nNewest permits:");
  sample.forEach(function(p) {
    var j = p.jurisdictionId;
    console.log("  " + p.name + " -> " + (j ? j.city + ", " + j.state : "unknown"));
  });

  await mongoose.disconnect();
  console.log("\nDone! 100 additional jurisdictions and permits seeded.\n");
}

main()
  .then(function() { process.exit(0); })
  .catch(function(err) { console.error("FATAL: " + err.message); process.exit(1); });
