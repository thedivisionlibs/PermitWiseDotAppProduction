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
  // ========================================================
  // TEXAS
  // ========================================================
  { name: "Houston, TX", type: "city", city: "Houston", county: "Harris", state: "TX", notes: "Houston Health Dept issues MFU Medallion; Fire Dept LP-Gas permit required.", contactInfo: { website: "https://www.houstonpermittingcenter.org/hhd1008", phone: "(832) 393-5100", email: "", address: "" } },
  { name: "San Antonio, TX", type: "city", city: "San Antonio", county: "Bexar", state: "TX", notes: "SAMHD Food Establishment License + Fire Dept Mobile Vending Permit.", contactInfo: { website: "https://www.sa.gov/Directory/Departments/SAMHD", phone: "(210) 207-6000", email: "", address: "" } },
  { name: "Dallas, TX", type: "city", city: "Dallas", county: "Dallas", state: "TX", notes: "Dallas County Health & Human Services issues countywide MFU permit.", contactInfo: { website: "https://www.dallascounty.org/departments/dchhs/", phone: "(214) 819-2115", email: "", address: "" } },
  { name: "Austin, TX", type: "city", city: "Austin", county: "Travis", state: "TX", notes: "Austin Public Health Environmental Health Services; inspections Tue/Thu at 1520 Rutherford Lane.", contactInfo: { website: "https://www.austintexas.gov/department/mobile-food-vendors", phone: "(512) 978-0300", email: "", address: "1520 Rutherford Lane, Austin, TX 78754" } },
  { name: "Fort Worth, TX", type: "city", city: "Fort Worth", county: "Tarrant", state: "TX", notes: "Tarrant County Public Health countywide permit covers all 41+ municipalities.", contactInfo: { website: "https://www.tarrantcountytx.gov/en/public-health.html", phone: "(817) 248-6299", email: "", address: "" } },
  { name: "El Paso, TX", type: "city", city: "El Paso", county: "El Paso", state: "TX", notes: "City of El Paso Dept of Public Health; Fire Marshal inspection required.", contactInfo: { website: "https://www.elpasotexas.gov/public-health/", phone: "(915) 212-0200", email: "", address: "" } },
  { name: "Arlington, TX", type: "city", city: "Arlington", county: "Tarrant", state: "TX", notes: "Falls under Tarrant County Public Health countywide permit.", contactInfo: { website: "https://www.arlingtontx.gov/", phone: "", email: "", address: "" } },
  { name: "Corpus Christi, TX", type: "city", city: "Corpus Christi", county: "Nueces", state: "TX", notes: "Nueces County Public Health District; Health Permit $140/yr, Vending Permit $120/yr.", contactInfo: { website: "https://www.corpuschristitx.gov/department-directory/health-district/", phone: "(361) 826-7222", email: "", address: "" } },
  { name: "Plano, TX", type: "city", city: "Plano", county: "Collin", state: "TX", notes: "Environmental Health Division; inspections Tuesdays 8:30 AM–Noon by appointment.", contactInfo: { website: "https://www.plano.gov/345/Mobile-Food-Establishments", phone: "", email: "", address: "" } },
  { name: "Lubbock, TX", type: "city", city: "Lubbock", county: "Lubbock", state: "TX", notes: "Mobile Food Vending Permit $250; no vending in residential zones.", contactInfo: { website: "https://www.mylubbock.us/", phone: "(806) 767-2123", email: "", address: "" } },
  { name: "Laredo, TX", type: "city", city: "Laredo", county: "Webb", state: "TX", notes: "City of Laredo Health Dept issues mobile food permits.", contactInfo: { website: "https://www.cityoflaredo.com/", phone: "", email: "", address: "" } },
  { name: "Irving, TX", type: "city", city: "Irving", county: "Dallas", state: "TX", notes: "Falls under Dallas County Health permits.", contactInfo: { website: "https://www.cityofirving.org/", phone: "", email: "", address: "" } },
  { name: "Amarillo, TX", type: "city", city: "Amarillo", county: "Potter", state: "TX", notes: "City of Amarillo Environmental Health.", contactInfo: { website: "https://www.amarillo.gov/", phone: "", email: "", address: "" } },
  { name: "Grand Prairie, TX", type: "city", city: "Grand Prairie", county: "Dallas", state: "TX", notes: "Dallas County Health permits apply.", contactInfo: { website: "https://www.gptx.org/", phone: "", email: "", address: "" } },
  { name: "Brownsville, TX", type: "city", city: "Brownsville", county: "Cameron", state: "TX", notes: "City of Brownsville Health Dept.", contactInfo: { website: "https://www.cob.us/", phone: "", email: "", address: "" } },
  { name: "McKinney, TX", type: "city", city: "McKinney", county: "Collin", state: "TX", notes: "Collin County Health permits.", contactInfo: { website: "https://www.mckinneytexas.org/", phone: "", email: "", address: "" } },
  { name: "Frisco, TX", type: "city", city: "Frisco", county: "Collin", state: "TX", notes: "Health & Food Safety Division permit portal.", contactInfo: { website: "https://friscotexas.gov/204/Mobile-Temporary-Food-Vendors", phone: "", email: "", address: "" } },
  { name: "Denton, TX", type: "city", city: "Denton", county: "Denton", state: "TX", notes: "City of Denton Health & Food Safety Division; Classes I–IV.", contactInfo: { website: "https://www.cityofdenton.com/", phone: "(940) 349-8600", email: "health@cityofdenton.com", address: "" } },
  { name: "Midland, TX", type: "city", city: "Midland", county: "Midland", state: "TX", notes: "Code Administration Vendor Permit $100; background check required.", contactInfo: { website: "https://develop.midlandtexas.gov/168/Vendor-Permits", phone: "", email: "", address: "" } },
  { name: "Waco, TX", type: "city", city: "Waco", county: "McLennan", state: "TX", notes: "Waco-McLennan County Public Health District.", contactInfo: { website: "https://www.waco-texas.com/", phone: "", email: "", address: "" } },
  { name: "Odessa, TX", type: "city", city: "Odessa", county: "Ector", state: "TX", notes: "Ector County Health Dept.", contactInfo: { website: "https://www.odessa-tx.gov/", phone: "", email: "", address: "" } },
  { name: "Richardson, TX", type: "city", city: "Richardson", county: "Dallas", state: "TX", notes: "Mobile Food Vendor Permit $250; vehicle-mounted units only.", contactInfo: { website: "https://www.cor.net/departments/health-department/health-permits/food-truck-permit", phone: "", email: "", address: "" } },
  { name: "Round Rock, TX", type: "city", city: "Round Rock", county: "Williamson", state: "TX", notes: "Williamson County & Cities Health District.", contactInfo: { website: "https://www.roundrocktexas.gov/", phone: "", email: "", address: "" } },
  { name: "Sugar Land, TX", type: "city", city: "Sugar Land", county: "Fort Bend", state: "TX", notes: "Fort Bend County Health & Human Services.", contactInfo: { website: "https://www.sugarlandtx.gov/", phone: "", email: "", address: "" } },
  { name: "Pearland, TX", type: "city", city: "Pearland", county: "Brazoria", state: "TX", notes: "Brazoria County Health Dept.", contactInfo: { website: "https://www.pearlandtx.gov/", phone: "", email: "", address: "" } },
  { name: "College Station, TX", type: "city", city: "College Station", county: "Brazos", state: "TX", notes: "Brazos County Health Dept.", contactInfo: { website: "https://www.cstx.gov/", phone: "", email: "", address: "" } },
  { name: "Killeen, TX", type: "city", city: "Killeen", county: "Bell", state: "TX", notes: "Bell County Public Health District.", contactInfo: { website: "https://www.killeentexas.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // FLORIDA
  // ========================================================
  { name: "Miami, FL", type: "city", city: "Miami", county: "Miami-Dade", state: "FL", notes: "DBPR MFDV license + Miami-Dade County Certificate of Use + Business Tax Receipts.", contactInfo: { website: "https://www.miamidade.gov/permits/mobile-sales.asp", phone: "(305) 375-2877", email: "", address: "" } },
  { name: "Jacksonville, FL", type: "city", city: "Jacksonville", county: "Duval", state: "FL", notes: "Duval County LBTR + JFRD Fire Safety Inspection ($65/yr).", contactInfo: { website: "https://www.coj.net/", phone: "", email: "", address: "" } },
  { name: "Tampa, FL", type: "city", city: "Tampa", county: "Hillsborough", state: "FL", notes: "Hillsborough County Business Tax Receipt + Fire Marshal inspection.", contactInfo: { website: "https://www.tampa.gov/special-events-coordination/food-truck", phone: "", email: "", address: "" } },
  { name: "Orlando, FL", type: "city", city: "Orlando", county: "Orange", state: "FL", notes: "City Business Tax Receipt + Fire Marshal inspection required.", contactInfo: { website: "https://www.orlando.gov/", phone: "", email: "", address: "" } },
  { name: "St. Petersburg, FL", type: "city", city: "St. Petersburg", county: "Pinellas", state: "FL", notes: "Business Tax Receipt; land development regulations §16.50.440 govern locations.", contactInfo: { website: "https://www.stpete.org/", phone: "", email: "", address: "" } },
  { name: "Fort Lauderdale, FL", type: "city", city: "Fort Lauderdale", county: "Broward", state: "FL", notes: "Both Broward County AND City BTRs required.", contactInfo: { website: "https://www.fortlauderdale.gov/", phone: "", email: "", address: "" } },
  { name: "Tallahassee, FL", type: "city", city: "Tallahassee", county: "Leon", state: "FL", notes: "City Business Tax Receipt + Leon County Health Dept.", contactInfo: { website: "https://www.talgov.com/", phone: "", email: "", address: "" } },
  { name: "Hialeah, FL", type: "city", city: "Hialeah", county: "Miami-Dade", state: "FL", notes: "Miami-Dade County permits apply.", contactInfo: { website: "https://www.hialeahfl.gov/", phone: "", email: "", address: "" } },
  { name: "Cape Coral, FL", type: "city", city: "Cape Coral", county: "Lee", state: "FL", notes: "Ordinance 89-22 regulates mobile vendors; Lee County Health Dept.", contactInfo: { website: "https://www.capecoral.gov/", phone: "", email: "", address: "" } },
  { name: "Port St. Lucie, FL", type: "city", city: "Port St. Lucie", county: "St. Lucie", state: "FL", notes: "St. Lucie County Health Dept + City BTR.", contactInfo: { website: "https://www.cityofpsl.com/", phone: "", email: "", address: "" } },
  { name: "West Palm Beach, FL", type: "city", city: "West Palm Beach", county: "Palm Beach", state: "FL", notes: "Palm Beach County + City Business Tax Receipts.", contactInfo: { website: "https://www.wpb.org/", phone: "", email: "", address: "" } },
  { name: "Gainesville, FL", type: "city", city: "Gainesville", county: "Alachua", state: "FL", notes: "Alachua County Health Dept + City BTR.", contactInfo: { website: "https://www.gainesvillefl.gov/", phone: "", email: "", address: "" } },
  { name: "Clearwater, FL", type: "city", city: "Clearwater", county: "Pinellas", state: "FL", notes: "Pinellas County Health Dept + City BTR.", contactInfo: { website: "https://www.myclearwater.com/", phone: "", email: "", address: "" } },
  { name: "Lakeland, FL", type: "city", city: "Lakeland", county: "Polk", state: "FL", notes: "Polk County Health Dept + City BTR.", contactInfo: { website: "https://www.lakelandgov.net/", phone: "", email: "", address: "" } },
  { name: "Palm Bay, FL", type: "city", city: "Palm Bay", county: "Brevard", state: "FL", notes: "No local fees per state preemption; Brevard County Health Dept.", contactInfo: { website: "https://www.palmbayfl.gov/", phone: "", email: "", address: "" } },
  { name: "Pembroke Pines, FL", type: "city", city: "Pembroke Pines", county: "Broward", state: "FL", notes: "Broward County permits apply.", contactInfo: { website: "https://www.ppines.com/", phone: "", email: "", address: "" } },
  { name: "Hollywood, FL", type: "city", city: "Hollywood", county: "Broward", state: "FL", notes: "Broward County permits apply + City BTR.", contactInfo: { website: "https://www.hollywoodfl.org/", phone: "", email: "", address: "" } },
  { name: "Coral Springs, FL", type: "city", city: "Coral Springs", county: "Broward", state: "FL", notes: "Broward County permits apply.", contactInfo: { website: "https://www.coralsprings.gov/", phone: "", email: "", address: "" } },
  { name: "Sarasota, FL", type: "city", city: "Sarasota", county: "Sarasota", state: "FL", notes: "Sarasota County Health Dept + City BTR.", contactInfo: { website: "https://www.sarasotafl.gov/", phone: "", email: "", address: "" } },
  { name: "Kissimmee, FL", type: "city", city: "Kissimmee", county: "Osceola", state: "FL", notes: "Osceola County Health Dept + City BTR.", contactInfo: { website: "https://www.kissimmee.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // CALIFORNIA
  // ========================================================
  { name: "Los Angeles, CA", type: "city", city: "Los Angeles", county: "Los Angeles", state: "CA", notes: "LA County DPH health permit + City BTRC; county-based system.", contactInfo: { website: "https://publichealth.lacounty.gov/eh/business/food-trucks-carts.htm", phone: "", email: "", address: "" } },
  { name: "San Diego, CA", type: "city", city: "San Diego", county: "San Diego", state: "CA", notes: "San Diego County DEHQ MFF permit; fees $228–$760/yr by risk.", contactInfo: { website: "https://www.sandiegocounty.gov/content/sdc/deh/fhd/mobilefood.html", phone: "(858) 505-6666", email: "", address: "" } },
  { name: "San Jose, CA", type: "city", city: "San Jose", county: "Santa Clara", state: "CA", notes: "Santa Clara County DEH MFF permit ($446 app + $138–$635 annual) + SJPD permit for public property.", contactInfo: { website: "https://deh.santaclaracounty.gov/food-and-retail/compliance-retail-food-operations/mobile-food-facilities", phone: "(408) 918-1908", email: "", address: "" } },
  { name: "San Francisco, CA", type: "city", city: "San Francisco", county: "San Francisco", state: "CA", notes: "SFDPH health permit + SF Public Works location permit + Fire Dept approval + Business Registration.", contactInfo: { website: "https://sfpublicworks.org/services/permits/mobile-food-facilities", phone: "", email: "", address: "" } },
  { name: "Fresno, CA", type: "city", city: "Fresno", county: "Fresno", state: "CA", notes: "City of Fresno Mobile Vendor Permit + Fresno County EH.", contactInfo: { website: "https://www.fresno.gov/", phone: "", email: "", address: "" } },
  { name: "Sacramento, CA", type: "city", city: "Sacramento", county: "Sacramento", state: "CA", notes: "Sacramento County EMD Environmental Health MFF permit.", contactInfo: { website: "https://emd.saccounty.gov/EH/FoodProtect-RetailFood/Pages/MobileFood.aspx", phone: "(916) 875-8440", email: "", address: "" } },
  { name: "Long Beach, CA", type: "city", city: "Long Beach", county: "Los Angeles", state: "CA", notes: "Separate from LA County; Long Beach Health Dept issues own permits.", contactInfo: { website: "https://www.longbeach.gov/", phone: "(562) 570-4132", email: "", address: "" } },
  { name: "Oakland, CA", type: "city", city: "Oakland", county: "Alameda", state: "CA", notes: "Alameda County DEH MFF permit.", contactInfo: { website: "https://deh.acgov.org/", phone: "(510) 567-6724", email: "", address: "" } },
  { name: "Bakersfield, CA", type: "city", city: "Bakersfield", county: "Kern", state: "CA", notes: "Kern County Public Health MFF permit.", contactInfo: { website: "https://www.kernpublichealth.com/", phone: "(661) 862-8700", email: "", address: "" } },
  { name: "Anaheim, CA", type: "city", city: "Anaheim", county: "Orange", state: "CA", notes: "OC Health Care Agency MFF permit ($183–$488/yr).", contactInfo: { website: "https://ochealthinfo.com/services-programs/environment-food-safety/food/food-safety-programs/mobile-food-trucks-and-carts", phone: "(714) 433-6416", email: "", address: "" } },
  { name: "Santa Ana, CA", type: "city", city: "Santa Ana", county: "Orange", state: "CA", notes: "OC HCA permit + City mobile food facility permit.", contactInfo: { website: "https://www.santa-ana.org/question/8-mobile-food-facility-permit/", phone: "", email: "", address: "" } },
  { name: "Riverside, CA", type: "city", city: "Riverside", county: "Riverside", state: "CA", notes: "Riverside County DEH MFF permit; own food handler card program.", contactInfo: { website: "https://rivcoeh.org/mobile-food-facilities", phone: "(760) 320-1048", email: "", address: "" } },
  { name: "Stockton, CA", type: "city", city: "Stockton", county: "San Joaquin", state: "CA", notes: "San Joaquin County EH MFF permit.", contactInfo: { website: "https://www.stocktonca.gov/", phone: "", email: "", address: "" } },
  { name: "Irvine, CA", type: "city", city: "Irvine", county: "Orange", state: "CA", notes: "OC HCA permit + City business license.", contactInfo: { website: "https://www.cityofirvine.org/", phone: "", email: "", address: "" } },
  { name: "Chula Vista, CA", type: "city", city: "Chula Vista", county: "San Diego", state: "CA", notes: "San Diego County DEHQ permit.", contactInfo: { website: "https://www.chulavistaca.gov/", phone: "", email: "", address: "" } },
  { name: "Fremont, CA", type: "city", city: "Fremont", county: "Alameda", state: "CA", notes: "Alameda County DEH MFF permit.", contactInfo: { website: "https://www.fremont.gov/", phone: "", email: "", address: "" } },
  { name: "San Bernardino, CA", type: "city", city: "San Bernardino", county: "San Bernardino", state: "CA", notes: "SB County DPH EHS MFF permit; own food handler program.", contactInfo: { website: "https://ehs.sbcounty.gov/", phone: "", email: "", address: "" } },
  { name: "Modesto, CA", type: "city", city: "Modesto", county: "Stanislaus", state: "CA", notes: "Stanislaus County EH MFF permit.", contactInfo: { website: "https://www.modestogov.com/", phone: "", email: "", address: "" } },
  { name: "Fontana, CA", type: "city", city: "Fontana", county: "San Bernardino", state: "CA", notes: "SB County DPH EHS MFF permit.", contactInfo: { website: "https://www.fontana.org/", phone: "", email: "", address: "" } },
  { name: "Moreno Valley, CA", type: "city", city: "Moreno Valley", county: "Riverside", state: "CA", notes: "Riverside County DEH MFF permit.", contactInfo: { website: "https://www.moval.org/", phone: "", email: "", address: "" } },
  { name: "Glendale, CA", type: "city", city: "Glendale", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.glendaleca.gov/", phone: "", email: "", address: "" } },
  { name: "Huntington Beach, CA", type: "city", city: "Huntington Beach", county: "Orange", state: "CA", notes: "OC HCA MFF permit.", contactInfo: { website: "https://www.huntingtonbeachca.gov/", phone: "", email: "", address: "" } },
  { name: "Santa Clarita, CA", type: "city", city: "Santa Clarita", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.santa-clarita.com/", phone: "", email: "", address: "" } },
  { name: "Garden Grove, CA", type: "city", city: "Garden Grove", county: "Orange", state: "CA", notes: "OC HCA MFF permit.", contactInfo: { website: "https://ggcity.org/", phone: "", email: "", address: "" } },
  { name: "Oceanside, CA", type: "city", city: "Oceanside", county: "San Diego", state: "CA", notes: "San Diego County DEHQ permit.", contactInfo: { website: "https://www.ci.oceanside.ca.us/", phone: "", email: "", address: "" } },
  { name: "Rancho Cucamonga, CA", type: "city", city: "Rancho Cucamonga", county: "San Bernardino", state: "CA", notes: "SB County DPH EHS MFF permit.", contactInfo: { website: "https://www.cityofrc.us/", phone: "", email: "", address: "" } },
  { name: "Ontario, CA", type: "city", city: "Ontario", county: "San Bernardino", state: "CA", notes: "SB County DPH EHS MFF permit.", contactInfo: { website: "https://www.ontarioca.gov/", phone: "", email: "", address: "" } },
  { name: "Oxnard, CA", type: "city", city: "Oxnard", county: "Ventura", state: "CA", notes: "Ventura County EH MFF permit.", contactInfo: { website: "https://www.oxnard.org/", phone: "", email: "", address: "" } },
  { name: "Elk Grove, CA", type: "city", city: "Elk Grove", county: "Sacramento", state: "CA", notes: "Sacramento County EMD permit.", contactInfo: { website: "https://www.elkgrovecity.org/", phone: "", email: "", address: "" } },
  { name: "Corona, CA", type: "city", city: "Corona", county: "Riverside", state: "CA", notes: "Riverside County DEH permit.", contactInfo: { website: "https://www.coronaca.gov/", phone: "", email: "", address: "" } },
  { name: "Visalia, CA", type: "city", city: "Visalia", county: "Tulare", state: "CA", notes: "Tulare County EH MFF permit.", contactInfo: { website: "https://www.visalia.city/", phone: "", email: "", address: "" } },
  { name: "Concord, CA", type: "city", city: "Concord", county: "Contra Costa", state: "CA", notes: "Contra Costa Health MFF permit.", contactInfo: { website: "https://www.cityofconcord.org/", phone: "", email: "", address: "" } },
  { name: "Santa Rosa, CA", type: "city", city: "Santa Rosa", county: "Sonoma", state: "CA", notes: "Sonoma County EH MFF permit.", contactInfo: { website: "https://www.srcity.org/", phone: "", email: "", address: "" } },
  { name: "Salinas, CA", type: "city", city: "Salinas", county: "Monterey", state: "CA", notes: "Monterey County EH MFF permit.", contactInfo: { website: "https://www.cityofsalinas.org/", phone: "", email: "", address: "" } },
  { name: "Palmdale, CA", type: "city", city: "Palmdale", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.cityofpalmdale.org/", phone: "", email: "", address: "" } },
  { name: "Lancaster, CA", type: "city", city: "Lancaster", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.cityoflancasterca.org/", phone: "", email: "", address: "" } },
  { name: "Sunnyvale, CA", type: "city", city: "Sunnyvale", county: "Santa Clara", state: "CA", notes: "Santa Clara County DEH MFF permit.", contactInfo: { website: "https://www.sunnyvale.ca.gov/", phone: "", email: "", address: "" } },
  { name: "Pomona, CA", type: "city", city: "Pomona", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.pomonaca.gov/", phone: "", email: "", address: "" } },
  { name: "Escondido, CA", type: "city", city: "Escondido", county: "San Diego", state: "CA", notes: "San Diego County DEHQ permit.", contactInfo: { website: "https://www.escondido.org/", phone: "", email: "", address: "" } },
  { name: "Torrance, CA", type: "city", city: "Torrance", county: "Los Angeles", state: "CA", notes: "LA County DPH EH permit.", contactInfo: { website: "https://www.torranceca.gov/", phone: "", email: "", address: "" } },
  { name: "Hayward, CA", type: "city", city: "Hayward", county: "Alameda", state: "CA", notes: "Alameda County DEH MFF permit.", contactInfo: { website: "https://www.hayward-ca.gov/", phone: "", email: "", address: "" } },
  { name: "Pasadena, CA", type: "city", city: "Pasadena", county: "Los Angeles", state: "CA", notes: "Pasadena Public Health Dept (separate from LA County).", contactInfo: { website: "https://www.cityofpasadena.net/", phone: "", email: "", address: "" } },

  // ========================================================
  // ARIZONA
  // ========================================================
  { name: "Phoenix, AZ", type: "city", city: "Phoenix", county: "Maricopa", state: "AZ", notes: "City Clerk Mobile Vending License ($350 app + $30/yr) + Maricopa County health.", contactInfo: { website: "https://www.phoenix.gov/cityclerk/services/licensing/regbusinfo/vending/mobile-vending", phone: "", email: "", address: "" } },
  { name: "Tucson, AZ", type: "city", city: "Tucson", county: "Pima", state: "AZ", notes: "Vendor permit ~$181.50/yr; Pima County health permit required.", contactInfo: { website: "https://www.tucsonaz.gov/", phone: "", email: "", address: "" } },
  { name: "Mesa, AZ", type: "city", city: "Mesa", county: "Maricopa", state: "AZ", notes: "Mobile Food Vendor License $100/yr + $25 background + $10 app.", contactInfo: { website: "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License", phone: "", email: "", address: "" } },
  { name: "Chandler, AZ", type: "city", city: "Chandler", county: "Maricopa", state: "AZ", notes: "Mobile Food Unit Permit + Tax License ($45).", contactInfo: { website: "https://www.chandleraz.gov/", phone: "", email: "", address: "" } },
  { name: "Scottsdale, AZ", type: "city", city: "Scottsdale", county: "Maricopa", state: "AZ", notes: "Business License ($62 initial, $50 renewal) + mobile food vendor application.", contactInfo: { website: "https://www.scottsdaleaz.gov/", phone: "", email: "", address: "" } },
  { name: "Gilbert, AZ", type: "city", city: "Gilbert", county: "Maricopa", state: "AZ", notes: "Business License ($35 initial, $15 renewal); Maricopa County health permit.", contactInfo: { website: "https://www.gilbertaz.gov/", phone: "", email: "", address: "" } },
  { name: "Tempe, AZ", type: "city", city: "Tempe", county: "Maricopa", state: "AZ", notes: "No general business license required; Maricopa County health + TPT.", contactInfo: { website: "https://www.tempe.gov/", phone: "", email: "", address: "" } },
  { name: "Glendale, AZ", type: "city", city: "Glendale", county: "Maricopa", state: "AZ", notes: "Maricopa County health permit + City business license.", contactInfo: { website: "https://www.glendaleaz.com/", phone: "", email: "", address: "" } },
  { name: "Peoria, AZ", type: "city", city: "Peoria", county: "Maricopa", state: "AZ", notes: "Maricopa County health permit + City license.", contactInfo: { website: "https://www.peoriaaz.gov/", phone: "", email: "", address: "" } },
  { name: "Surprise, AZ", type: "city", city: "Surprise", county: "Maricopa", state: "AZ", notes: "Maricopa County health permit + City license.", contactInfo: { website: "https://www.surpriseaz.gov/", phone: "", email: "", address: "" } },
  { name: "Flagstaff, AZ", type: "city", city: "Flagstaff", county: "Coconino", state: "AZ", notes: "City TPT License ($20 renewal); Coconino County Health Dept permit.", contactInfo: { website: "https://www.flagstaff.az.gov/", phone: "", email: "", address: "" } },
  { name: "Yuma, AZ", type: "city", city: "Yuma", county: "Yuma", state: "AZ", notes: "Yuma County health permit + City license.", contactInfo: { website: "https://www.yumaaz.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // NEW YORK
  // ========================================================
  { name: "New York City, NY", type: "city", city: "New York", county: "New York", state: "NY", notes: "DOHMH personal license ($50/2yr) + unit permit (capped with waitlist); FDNY G-23 for propane.", contactInfo: { website: "https://www.nyc.gov/site/doh/business/food-operators/mobile-and-temporary-food-vendors.page", phone: "", email: "", address: "" } },
  { name: "Buffalo, NY", type: "city", city: "Buffalo", county: "Erie", state: "NY", notes: "Erie County Health Dept food permit + City vendor license.", contactInfo: { website: "https://www.buffalony.gov/", phone: "", email: "", address: "" } },
  { name: "Rochester, NY", type: "city", city: "Rochester", county: "Monroe", state: "NY", notes: "Monroe County Health Dept permit + City vendor license.", contactInfo: { website: "https://www.cityofrochester.gov/", phone: "", email: "", address: "" } },
  { name: "Yonkers, NY", type: "city", city: "Yonkers", county: "Westchester", state: "NY", notes: "Westchester County Health Dept permit.", contactInfo: { website: "https://www.yonkersny.gov/", phone: "", email: "", address: "" } },
  { name: "Syracuse, NY", type: "city", city: "Syracuse", county: "Onondaga", state: "NY", notes: "Onondaga County Health Dept permit + City vendor license.", contactInfo: { website: "https://www.syrgov.net/", phone: "", email: "", address: "" } },
  { name: "Albany, NY", type: "city", city: "Albany", county: "Albany", state: "NY", notes: "Albany County Health Dept permit + City license.", contactInfo: { website: "https://www.albanyny.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // ILLINOIS
  // ========================================================
  { name: "Chicago, IL", type: "city", city: "Chicago", county: "Cook", state: "IL", notes: "BACP Mobile Food Preparer ($1,000/2yr) or Dispenser ($700/2yr); GPS affidavit required.", contactInfo: { website: "https://www.chicago.gov/city/en/depts/bacp/supp_info/mobile_food_vendorlicenses.html", phone: "(312) 744-6249", email: "", address: "" } },
  { name: "Aurora, IL", type: "city", city: "Aurora", county: "Kane", state: "IL", notes: "Kane County Health Dept + City business license.", contactInfo: { website: "https://www.aurora-il.org/", phone: "", email: "", address: "" } },
  { name: "Naperville, IL", type: "city", city: "Naperville", county: "DuPage", state: "IL", notes: "DuPage County Health Dept + City business license.", contactInfo: { website: "https://www.naperville.il.us/", phone: "", email: "", address: "" } },
  { name: "Rockford, IL", type: "city", city: "Rockford", county: "Winnebago", state: "IL", notes: "Winnebago County Health Dept + City food vendor license.", contactInfo: { website: "https://rockfordil.gov/", phone: "", email: "", address: "" } },
  { name: "Joliet, IL", type: "city", city: "Joliet", county: "Will", state: "IL", notes: "Will County Health Dept + City license.", contactInfo: { website: "https://www.joliet.gov/", phone: "", email: "", address: "" } },
  { name: "Springfield, IL", type: "city", city: "Springfield", county: "Sangamon", state: "IL", notes: "Sangamon County Health Dept + City license.", contactInfo: { website: "https://www.springfield.il.us/", phone: "", email: "", address: "" } },
  { name: "Elgin, IL", type: "city", city: "Elgin", county: "Kane", state: "IL", notes: "Kane County Health Dept + City license.", contactInfo: { website: "https://www.cityofelgin.org/", phone: "", email: "", address: "" } },
  { name: "Peoria, IL", type: "city", city: "Peoria", county: "Peoria", state: "IL", notes: "Peoria County Health Dept + City license.", contactInfo: { website: "https://www.peoriagov.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // PENNSYLVANIA
  // ========================================================
  { name: "Philadelphia, PA", type: "city", city: "Philadelphia", county: "Philadelphia", state: "PA", notes: "Commercial Activity License ($300 lifetime + $50 annual) + Food Establishment License ($300) + Motor Vehicle Vendor License ($300).", contactInfo: { website: "https://www.phila.gov/", phone: "", email: "", address: "" } },
  { name: "Pittsburgh, PA", type: "city", city: "Pittsburgh", county: "Allegheny", state: "PA", notes: "Mobile Vehicle Vendor License + Allegheny County Health Dept permit.", contactInfo: { website: "https://www.alleghenycounty.us/Services/Health-Department/Food-Safety/Permits-and-Registration/Mobile-Food-Facilities", phone: "", email: "", address: "" } },
  { name: "Harrisburg, PA", type: "city", city: "Harrisburg", county: "Dauphin", state: "PA", notes: "PA Dept of Agriculture MFF license + City license.", contactInfo: { website: "https://harrisburgpa.gov/", phone: "", email: "", address: "" } },
  { name: "Allentown, PA", type: "city", city: "Allentown", county: "Lehigh", state: "PA", notes: "PA Dept of Agriculture MFF license + City vendor permit.", contactInfo: { website: "https://www.allentownpa.gov/", phone: "", email: "", address: "" } },
  { name: "Erie, PA", type: "city", city: "Erie", county: "Erie", state: "PA", notes: "PA Dept of Agriculture MFF license + City vendor permit.", contactInfo: { website: "https://www.erie.pa.us/", phone: "", email: "", address: "" } },
  { name: "Lancaster, PA", type: "city", city: "Lancaster", county: "Lancaster", state: "PA", notes: "PA Dept of Agriculture MFF license; farmer's market and seasonal vendor focus.", contactInfo: { website: "https://cityoflancasterpa.gov/", phone: "", email: "", address: "" } },
  { name: "Reading, PA", type: "city", city: "Reading", county: "Berks", state: "PA", notes: "Berks County operates independently from PA Dept of Agriculture.", contactInfo: { website: "https://www.readingpa.gov/", phone: "", email: "", address: "" } },
  { name: "Scranton, PA", type: "city", city: "Scranton", county: "Lackawanna", state: "PA", notes: "PA Dept of Agriculture MFF license + City vendor license.", contactInfo: { website: "https://www.scrantonpa.gov/", phone: "", email: "", address: "" } },
  { name: "Bethlehem, PA", type: "city", city: "Bethlehem", county: "Northampton", state: "PA", notes: "PA Dept of Agriculture MFF license + City permit.", contactInfo: { website: "https://www.bethlehem-pa.gov/", phone: "", email: "", address: "" } },
  // PA Back Mountain
  { name: "Dallas Township, PA", type: "city", city: "Dallas Township", county: "Luzerne", state: "PA", notes: "Back Mountain municipality; local ordinance approvals may apply.", contactInfo: { website: "https://www.dallastwp.org/", phone: "", email: "", address: "" } },
  { name: "Kingston Township, PA", type: "city", city: "Kingston Township", county: "Luzerne", state: "PA", notes: "Back Mountain municipality; separate local vendor rules.", contactInfo: { website: "", phone: "", email: "", address: "" } },
  { name: "Lehman Township, PA", type: "city", city: "Lehman Township", county: "Luzerne", state: "PA", notes: "Back Mountain municipality; fairs/events often require local approvals.", contactInfo: { website: "", phone: "", email: "", address: "" } },

  // ========================================================
  // OHIO
  // ========================================================
  { name: "Columbus, OH", type: "city", city: "Columbus", county: "Franklin", state: "OH", notes: "City permit + Columbus Public Health food license + Division of Fire inspection.", contactInfo: { website: "https://www.columbus.gov/", phone: "", email: "", address: "" } },
  { name: "Cleveland, OH", type: "city", city: "Cleveland", county: "Cuyahoga", state: "OH", notes: "Mobile Food Shop Location Permit ($100) + Health license ($303 combined).", contactInfo: { website: "https://www.clevelandohio.gov/", phone: "", email: "", address: "" } },
  { name: "Cincinnati, OH", type: "city", city: "Cincinnati", county: "Hamilton", state: "OH", notes: "Cincinnati Health Dept Mobile Food Licensing.", contactInfo: { website: "https://www.cincinnati-oh.gov/health/", phone: "", email: "", address: "" } },
  { name: "Toledo, OH", type: "city", city: "Toledo", county: "Lucas", state: "OH", notes: "City registration ($50) + statewide mobile food license.", contactInfo: { website: "https://toledo.oh.gov/business/mobile-food", phone: "", email: "", address: "" } },
  { name: "Akron, OH", type: "city", city: "Akron", county: "Summit", state: "OH", notes: "Summit County Public Health + City vendor license.", contactInfo: { website: "https://www.akronohio.gov/", phone: "", email: "", address: "" } },
  { name: "Dayton, OH", type: "city", city: "Dayton", county: "Montgomery", state: "OH", notes: "Montgomery County PH + City vendor license.", contactInfo: { website: "https://www.daytonohio.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // GEORGIA
  // ========================================================
  { name: "Atlanta, GA", type: "city", city: "Atlanta", county: "Fulton", state: "GA", notes: "Street Eats program: $75 annual + $350 electronic reservation; Fulton/DeKalb County health permit.", contactInfo: { website: "https://www.atlantaga.gov/government/departments/city-planning/economic-development/vending-program", phone: "", email: "vending@atlantaga.gov", address: "" } },
  { name: "Savannah, GA", type: "city", city: "Savannah", county: "Chatham", state: "GA", notes: "City Office of Special Events; $150 annual fee + Business Tax Certificate.", contactInfo: { website: "https://www.savannahga.gov/2466/Food-Trucks", phone: "(912) 651-6445", email: "", address: "" } },
  { name: "Augusta, GA", type: "city", city: "Augusta", county: "Richmond", state: "GA", notes: "Augusta-Richmond County Health Dept + City business license.", contactInfo: { website: "https://www.augustaga.gov/", phone: "", email: "", address: "" } },
  { name: "Columbus, GA", type: "city", city: "Columbus", county: "Muscogee", state: "GA", notes: "Columbus-Muscogee County Health Dept + City license.", contactInfo: { website: "https://www.columbusga.gov/", phone: "", email: "", address: "" } },
  { name: "Macon, GA", type: "city", city: "Macon", county: "Bibb", state: "GA", notes: "North Central Health District + City license.", contactInfo: { website: "https://www.maconbibb.us/", phone: "", email: "", address: "" } },
  { name: "Athens, GA", type: "city", city: "Athens", county: "Clarke", state: "GA", notes: "NE Georgia Health District + City license.", contactInfo: { website: "https://www.accgov.com/", phone: "", email: "", address: "" } },

  // ========================================================
  // NORTH CAROLINA
  // ========================================================
  { name: "Charlotte, NC", type: "city", city: "Charlotte", county: "Mecklenburg", state: "NC", notes: "Mecklenburg County EH MFU permit + City business privilege license.", contactInfo: { website: "https://www.charlottenc.gov/", phone: "(980) 314-1620", email: "", address: "" } },
  { name: "Raleigh, NC", type: "city", city: "Raleigh", county: "Wake", state: "NC", notes: "City food truck permit (~$150) + Wake County Vending Permit.", contactInfo: { website: "https://raleighnc.gov/permits/services/food-trucks-private-property-and-public-right-way", phone: "", email: "", address: "" } },
  { name: "Greensboro, NC", type: "city", city: "Greensboro", county: "Guilford", state: "NC", notes: "City permit + Guilford County Health Dept.", contactInfo: { website: "https://www.greensboro-nc.gov/business/economic-development/food-trucks", phone: "(336) 641-3771", email: "", address: "" } },
  { name: "Durham, NC", type: "city", city: "Durham", county: "Durham", state: "NC", notes: "Durham County Health Dept + City business license.", contactInfo: { website: "https://durhamnc.gov/", phone: "", email: "", address: "" } },
  { name: "Winston-Salem, NC", type: "city", city: "Winston-Salem", county: "Forsyth", state: "NC", notes: "Forsyth County Health Dept + City license.", contactInfo: { website: "https://www.cityofws.org/", phone: "", email: "", address: "" } },
  { name: "Fayetteville, NC", type: "city", city: "Fayetteville", county: "Cumberland", state: "NC", notes: "Cumberland County Health Dept + City license.", contactInfo: { website: "https://www.fayettevillenc.gov/", phone: "", email: "", address: "" } },
  { name: "Wilmington, NC", type: "city", city: "Wilmington", county: "New Hanover", state: "NC", notes: "New Hanover County Health Dept + City license.", contactInfo: { website: "https://www.wilmingtonnc.gov/", phone: "", email: "", address: "" } },
  { name: "Asheville, NC", type: "city", city: "Asheville", county: "Buncombe", state: "NC", notes: "Buncombe County Health Dept + City license.", contactInfo: { website: "https://www.ashevillenc.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // TENNESSEE
  // ========================================================
  { name: "Nashville, TN", type: "city", city: "Nashville", county: "Davidson", state: "TN", notes: "NDOT Mobile Food Vendor Permit ($55); Metro Health + Metro Fire cert required.", contactInfo: { website: "https://www.nashville.gov/departments/transportation/permits/mobile-food-vendor", phone: "", email: "", address: "" } },
  { name: "Memphis, TN", type: "city", city: "Memphis", county: "Shelby", state: "TN", notes: "Shelby County Health Dept permit ($210–$360/yr).", contactInfo: { website: "https://shelbycountytn.gov/", phone: "", email: "", address: "" } },
  { name: "Knoxville, TN", type: "city", city: "Knoxville", county: "Knox", state: "TN", notes: "City MFU Permit: $200 initial, $50 renewal, $75 temporary.", contactInfo: { website: "https://www.knoxvilletn.gov/government/city_departments_offices/Finance/business_license_tax_office/mobile_food_units", phone: "(865) 215-2083", email: "", address: "" } },
  { name: "Chattanooga, TN", type: "city", city: "Chattanooga", county: "Hamilton", state: "TN", notes: "Hamilton County Health Dept permit; approved parking zones only.", contactInfo: { website: "https://www.chattanooga.gov/", phone: "", email: "", address: "" } },
  { name: "Clarksville, TN", type: "city", city: "Clarksville", county: "Montgomery", state: "TN", notes: "Montgomery County Health Dept + TDA state permit.", contactInfo: { website: "https://www.cityofclarksville.com/", phone: "", email: "", address: "" } },
  { name: "Murfreesboro, TN", type: "city", city: "Murfreesboro", county: "Rutherford", state: "TN", notes: "Rutherford County Health Dept + City license.", contactInfo: { website: "https://www.murfreesborotn.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // MICHIGAN
  // ========================================================
  { name: "Detroit, MI", type: "city", city: "Detroit", county: "Wayne", state: "MI", notes: "Detroit Health Dept MFE/STFU licensing; STFU notice 4+ days before operating.", contactInfo: { website: "https://detroitmi.gov/departments/detroit-health-department/programs-and-services/food-safety/mobile-food-establishments-and-special-transitory-food-units", phone: "(313) 596-3932", email: "", address: "" } },
  { name: "Grand Rapids, MI", type: "city", city: "Grand Rapids", county: "Kent", state: "MI", notes: "Kent County Health Dept + City Clerk's Office; Fire inspection required.", contactInfo: { website: "https://www.grandrapidsmi.gov/", phone: "(616) 456-3939", email: "", address: "" } },
  { name: "Ann Arbor, MI", type: "city", city: "Ann Arbor", county: "Washtenaw", state: "MI", notes: "Washtenaw County Health Dept + City vendor license.", contactInfo: { website: "https://www.a2gov.org/", phone: "", email: "", address: "" } },
  { name: "Lansing, MI", type: "city", city: "Lansing", county: "Ingham", state: "MI", notes: "Ingham County Health Dept + City license.", contactInfo: { website: "https://www.lansingmi.gov/", phone: "", email: "", address: "" } },
  { name: "Flint, MI", type: "city", city: "Flint", county: "Genesee", state: "MI", notes: "Genesee County Health Dept + City license.", contactInfo: { website: "https://www.cityofflint.com/", phone: "", email: "", address: "" } },
  { name: "Kalamazoo, MI", type: "city", city: "Kalamazoo", county: "Kalamazoo", state: "MI", notes: "Kalamazoo County Health Dept + City license.", contactInfo: { website: "https://www.kalamazoocity.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // WASHINGTON
  // ========================================================
  { name: "Seattle, WA", type: "city", city: "Seattle", county: "King", state: "WA", notes: "King County PH permit (Risk 1: $630, Risk 3: $1,260) + SFD fire permit.", contactInfo: { website: "https://kingcounty.gov/en/dept/dph/certificates-permits-licenses/food-business-permits/mobile-food-business-permit", phone: "", email: "", address: "" } },
  { name: "Spokane, WA", type: "city", city: "Spokane", county: "Spokane", state: "WA", notes: "Spokane Regional Health District + City business license.", contactInfo: { website: "https://www.spokanecity.org/", phone: "", email: "", address: "" } },
  { name: "Tacoma, WA", type: "city", city: "Tacoma", county: "Pierce", state: "WA", notes: "Tacoma-Pierce County Health Dept + City business license.", contactInfo: { website: "https://www.cityoftacoma.org/", phone: "(253) 649-1706", email: "", address: "" } },
  { name: "Vancouver, WA", type: "city", city: "Vancouver", county: "Clark", state: "WA", notes: "Clark County Public Health + City license.", contactInfo: { website: "https://www.cityofvancouver.us/", phone: "", email: "", address: "" } },
  { name: "Bellevue, WA", type: "city", city: "Bellevue", county: "King", state: "WA", notes: "King County PH permit + City business license.", contactInfo: { website: "https://bellevuewa.gov/", phone: "", email: "", address: "" } },
  { name: "Olympia, WA", type: "city", city: "Olympia", county: "Thurston", state: "WA", notes: "Thurston County PH + City license.", contactInfo: { website: "https://www.olympiawa.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // OREGON
  // ========================================================
  { name: "Portland, OR", type: "city", city: "Portland", county: "Multnomah", state: "OR", notes: "Multnomah County EH food cart license ($760–$920); PBOT street vending permit for public ROW.", contactInfo: { website: "https://multco.us/services/food-carts", phone: "(503) 988-3400", email: "", address: "" } },
  { name: "Salem, OR", type: "city", city: "Salem", county: "Marion", state: "OR", notes: "City Mobile Food Unit License + Marion County EH.", contactInfo: { website: "https://www.cityofsalem.net/", phone: "", email: "", address: "" } },
  { name: "Eugene, OR", type: "city", city: "Eugene", county: "Lane", state: "OR", notes: "Lane County EH + City business license.", contactInfo: { website: "https://www.eugene-or.gov/", phone: "", email: "", address: "" } },
  { name: "Bend, OR", type: "city", city: "Bend", county: "Deschutes", state: "OR", notes: "Deschutes County EH + City license.", contactInfo: { website: "https://www.bendoregon.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // COLORADO
  // ========================================================
  { name: "Denver, CO", type: "city", city: "Denver", county: "Denver", state: "CO", notes: "Retail Food Mobile License; app $150, annual $100 base + $25/food process.", contactInfo: { website: "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Business-Licensing/Business-licenses/Retail-Food/Retail-food-mobile-license", phone: "", email: "", address: "" } },
  { name: "Colorado Springs, CO", type: "city", city: "Colorado Springs", county: "El Paso", state: "CO", notes: "City Clerk mobile food vendor license; El Paso County PH.", contactInfo: { website: "https://coloradosprings.gov/", phone: "(719) 578-3199", email: "", address: "" } },
  { name: "Aurora, CO", type: "city", city: "Aurora", county: "Arapahoe", state: "CO", notes: "Tri-County Health Dept + City license.", contactInfo: { website: "https://www.auroragov.org/", phone: "", email: "", address: "" } },
  { name: "Fort Collins, CO", type: "city", city: "Fort Collins", county: "Larimer", state: "CO", notes: "Larimer County EH + City license.", contactInfo: { website: "https://www.fcgov.com/", phone: "", email: "", address: "" } },
  { name: "Lakewood, CO", type: "city", city: "Lakewood", county: "Jefferson", state: "CO", notes: "Jefferson County Public Health + City license.", contactInfo: { website: "https://www.lakewood.org/", phone: "", email: "", address: "" } },
  { name: "Boulder, CO", type: "city", city: "Boulder", county: "Boulder", state: "CO", notes: "Boulder County PH + City food truck license.", contactInfo: { website: "https://bouldercolorado.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // MASSACHUSETTS
  // ========================================================
  { name: "Boston, MA", type: "city", city: "Boston", county: "Suffolk", state: "MA", notes: "Food Truck Permit $500/yr (ISD) + Health Permit $100 + Fire Permit $150 + Business Cert $65.", contactInfo: { website: "https://www.boston.gov/", phone: "(617) 635-3534", email: "", address: "" } },
  { name: "Worcester, MA", type: "city", city: "Worcester", county: "Worcester", state: "MA", notes: "Local Board of Health permit + City license.", contactInfo: { website: "https://www.worcesterma.gov/", phone: "", email: "", address: "" } },
  { name: "Springfield, MA", type: "city", city: "Springfield", county: "Hampden", state: "MA", notes: "Local Board of Health + City vendor license.", contactInfo: { website: "https://www.springfield-ma.gov/", phone: "", email: "", address: "" } },
  { name: "Cambridge, MA", type: "city", city: "Cambridge", county: "Middlesex", state: "MA", notes: "Cambridge Public Health Dept + City License Commission.", contactInfo: { website: "https://www.cambridgema.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // WASHINGTON DC
  // ========================================================
  { name: "Washington, DC", type: "city", city: "Washington", county: "District of Columbia", state: "DC", notes: "DLCP Vending Business License (Class A = Food, 2yr) + DC Health Certificate ($100 + $75 HACCP) + Mobile Site Permit ($300/2yr).", contactInfo: { website: "https://dlcp.dc.gov/page/vendinglicensingsteps", phone: "(202) 442-5955", email: "vendingteam@dc.gov", address: "" } },

  // ========================================================
  // MARYLAND
  // ========================================================
  { name: "Baltimore, MD", type: "city", city: "Baltimore", county: "Baltimore City", state: "MD", notes: "Baltimore City Health Dept food control permit + DOT Street/Mobile Vending Permit ($25).", contactInfo: { website: "https://transportation.baltimorecity.gov/street-and-mobile-vending", phone: "", email: "", address: "" } },
  { name: "Columbia, MD", type: "city", city: "Columbia", county: "Howard", state: "MD", notes: "Howard County Health Dept + County business license.", contactInfo: { website: "https://www.howardcountymd.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // VIRGINIA
  // ========================================================
  { name: "Virginia Beach, VA", type: "city", city: "Virginia Beach", county: "Virginia Beach City", state: "VA", notes: "Peddler's Permit $25 + Police solicitor permit + Business License $50.", contactInfo: { website: "https://www.vbgov.com/", phone: "", email: "", address: "" } },
  { name: "Norfolk, VA", type: "city", city: "Norfolk", county: "Norfolk City", state: "VA", notes: "Food Truck Vendor Program with designated zones; tracking decal $40 state + $30 local.", contactInfo: { website: "https://www.norfolk.gov/2259/Food-Truck-Vendor-Program", phone: "", email: "", address: "" } },
  { name: "Richmond, VA", type: "city", city: "Richmond", county: "Richmond City", state: "VA", notes: "Richmond City Health District + City business license.", contactInfo: { website: "https://www.rva.gov/", phone: "", email: "", address: "" } },
  { name: "Alexandria, VA", type: "city", city: "Alexandria", county: "Alexandria City", state: "VA", notes: "Mobile Food Truck Vendor Permit.", contactInfo: { website: "https://www.alexandriava.gov/", phone: "", email: "", address: "" } },
  { name: "Chesapeake, VA", type: "city", city: "Chesapeake", county: "Chesapeake City", state: "VA", notes: "VDH permit + City business license.", contactInfo: { website: "https://www.cityofchesapeake.net/", phone: "", email: "", address: "" } },
  { name: "Arlington, VA", type: "city", city: "Arlington", county: "Arlington", state: "VA", notes: "VDH permit + County business license.", contactInfo: { website: "https://www.arlingtonva.us/", phone: "", email: "", address: "" } },

  // ========================================================
  // NEVADA
  // ========================================================
  { name: "Las Vegas, NV", type: "city", city: "Las Vegas", county: "Clark", state: "NV", notes: "City Business License $150 + SNHD Health Permit ($385–$660/yr) + Health Card ($20+$15) + Fire inspection ~$150.", contactInfo: { website: "https://www.lasvegasnevada.gov/", phone: "(702) 759-1258", email: "", address: "" } },
  { name: "Henderson, NV", type: "city", city: "Henderson", county: "Clark", state: "NV", notes: "Same SNHD health permit + Henderson business license.", contactInfo: { website: "https://www.cityofhenderson.com/", phone: "", email: "", address: "" } },
  { name: "Reno, NV", type: "city", city: "Reno", county: "Washoe", state: "NV", notes: "Northern Nevada Public Health permits + City business license.", contactInfo: { website: "https://www.reno.gov/", phone: "(775) 334-2090", email: "", address: "" } },
  { name: "North Las Vegas, NV", type: "city", city: "North Las Vegas", county: "Clark", state: "NV", notes: "SNHD health permit + City business license.", contactInfo: { website: "https://www.cityofnorthlasvegas.com/", phone: "", email: "", address: "" } },
  { name: "Sparks, NV", type: "city", city: "Sparks", county: "Washoe", state: "NV", notes: "NNPH permits + City business license.", contactInfo: { website: "https://www.cityofsparks.us/", phone: "", email: "", address: "" } },

  // ========================================================
  // MINNESOTA
  // ========================================================
  { name: "Minneapolis, MN", type: "city", city: "Minneapolis", county: "Hennepin", state: "MN", notes: "City Mobile Food Vendor Vehicle License + Right-of-Way Permit.", contactInfo: { website: "https://www2.minneapolismn.gov/business-services/licenses-permits-inspections/business-licenses/food-restaurants/food-truck-cart/food-truck/", phone: "(612) 673-2301", email: "", address: "" } },
  { name: "St. Paul, MN", type: "city", city: "St. Paul", county: "Ramsey", state: "MN", notes: "City of St. Paul DSI food vendor license + Ramsey County.", contactInfo: { website: "https://www.stpaul.gov/", phone: "", email: "", address: "" } },
  { name: "Rochester, MN", type: "city", city: "Rochester", county: "Olmsted", state: "MN", notes: "Olmsted County Health + City license.", contactInfo: { website: "https://www.rochestermn.gov/", phone: "", email: "", address: "" } },
  { name: "Duluth, MN", type: "city", city: "Duluth", county: "St. Louis", state: "MN", notes: "MDA/MDH license + City license.", contactInfo: { website: "https://duluthmn.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // WISCONSIN
  // ========================================================
  { name: "Milwaukee, WI", type: "city", city: "Milwaukee", county: "Milwaukee", state: "WI", notes: "Food Peddler License + MFU License; Motorized $350, Pushed/Pedaled $315.", contactInfo: { website: "https://city.milwaukee.gov/Health/Services-and-Programs/CEH/mobilefood", phone: "", email: "mobilefood@milwaukee.gov", address: "" } },
  { name: "Madison, WI", type: "city", city: "Madison", county: "Dane", state: "WI", notes: "PHMDC food vendor license.", contactInfo: { website: "https://publichealthmdc.com/", phone: "(608) 242-6515", email: "", address: "" } },
  { name: "Green Bay, WI", type: "city", city: "Green Bay", county: "Brown", state: "WI", notes: "Brown County Health Dept + City license.", contactInfo: { website: "https://greenbaywi.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // MISSOURI
  // ========================================================
  { name: "Kansas City, MO", type: "city", city: "Kansas City", county: "Jackson", state: "MO", notes: "KC Health Dept food permit for mobile units.", contactInfo: { website: "https://www.kcmo.gov/city-hall/departments/health/food-permits-for-mobile-units-catering-farmers-markets-and-similar-vendors", phone: "(816) 513-2491", email: "", address: "" } },
  { name: "St. Louis, MO", type: "city", city: "St. Louis", county: "St. Louis City", state: "MO", notes: "Street Dept Food Truck Permit $500/annual or $125/quarterly + Building inspection $50.", contactInfo: { website: "https://www.stlouis-mo.gov/government/departments/street/permits-inspections/vending/food-truck-permits.cfm", phone: "", email: "", address: "" } },
  { name: "Springfield, MO", type: "city", city: "Springfield", county: "Greene", state: "MO", notes: "Springfield-Greene County Health Dept + City license.", contactInfo: { website: "https://www.springfieldmo.gov/", phone: "", email: "", address: "" } },
  { name: "Columbia, MO", type: "city", city: "Columbia", county: "Boone", state: "MO", notes: "Columbia/Boone County Health Dept + City license.", contactInfo: { website: "https://www.como.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // INDIANA
  // ========================================================
  { name: "Indianapolis, IN", type: "city", city: "Indianapolis", county: "Marion", state: "IN", notes: "Marion County Public Health Dept + DBNS Vendor Cart Licenses.", contactInfo: { website: "https://www.indy.gov/activity/vendor-cart-licenses", phone: "", email: "", address: "" } },
  { name: "Fort Wayne, IN", type: "city", city: "Fort Wayne", county: "Allen", state: "IN", notes: "Fort Wayne-Allen County Health Dept; Fire Dept Type I Hood + suppression required.", contactInfo: { website: "https://www.cityoffortwayne.org/", phone: "", email: "", address: "" } },
  { name: "South Bend, IN", type: "city", city: "South Bend", county: "St. Joseph", state: "IN", notes: "St. Joseph County Health Dept MFT permit ($325–$375) + Commissary ($75/yr).", contactInfo: { website: "https://www.southbendin.gov/", phone: "(574) 235-9721", email: "", address: "" } },
  { name: "Evansville, IN", type: "city", city: "Evansville", county: "Vanderburgh", state: "IN", notes: "Peddler's Permit from City Controller.", contactInfo: { website: "https://www.evansvillegov.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // SOUTH CAROLINA
  // ========================================================
  { name: "Charleston, SC", type: "city", city: "Charleston", county: "Charleston", state: "SC", notes: "City Fire Dept operational permit + SCDA/DHEC state permit.", contactInfo: { website: "https://www.charleston-sc.gov/1969/Mobile-Food-Vendors", phone: "", email: "", address: "" } },
  { name: "Columbia, SC", type: "city", city: "Columbia", county: "Richland", state: "SC", notes: "City business license + $10 zoning + DHEC approval; 100-ft restaurant buffer.", contactInfo: { website: "https://www.columbiasc.gov/", phone: "(803) 545-3345", email: "", address: "" } },
  { name: "Greenville, SC", type: "city", city: "Greenville", county: "Greenville", state: "SC", notes: "Mobile Food Vendor Permit + background check + DHEC; 250-ft restaurant distance.", contactInfo: { website: "https://www.greenvillesc.gov/329/Food-Trucks-Trailers", phone: "", email: "", address: "" } },
  { name: "Myrtle Beach, SC", type: "city", city: "Myrtle Beach", county: "Horry", state: "SC", notes: "DHEC state permit + City business license.", contactInfo: { website: "https://www.cityofmyrtlebeach.com/", phone: "", email: "", address: "" } },

  // ========================================================
  // LOUISIANA
  // ========================================================
  { name: "New Orleans, LA", type: "city", city: "New Orleans", county: "Orleans", state: "LA", notes: "Total new permit ~$655.25 (occupational $150 + mayoralty $400.25 + app $50); only ~100 permits issued.", contactInfo: { website: "https://nola.gov/food-truck-permit/", phone: "(504) 658-1666", email: "", address: "" } },
  { name: "Baton Rouge, LA", type: "city", city: "Baton Rouge", county: "East Baton Rouge", state: "LA", notes: "City-Parish Occupational License $200 + LDH health permit.", contactInfo: { website: "https://www.brla.gov/", phone: "(225) 242-4870", email: "", address: "" } },
  { name: "Shreveport, LA", type: "city", city: "Shreveport", county: "Caddo", state: "LA", notes: "Caddo Parish Health Dept + City license.", contactInfo: { website: "https://www.shreveportla.gov/", phone: "", email: "", address: "" } },
  { name: "Lafayette, LA", type: "city", city: "Lafayette", county: "Lafayette", state: "LA", notes: "Lafayette Parish Health Dept + City license.", contactInfo: { website: "https://www.lafayettela.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // KENTUCKY
  // ========================================================
  { name: "Louisville, KY", type: "city", city: "Louisville", county: "Jefferson", state: "KY", notes: "3-step: Fire inspection → Codes & Regulations → Metro Health; app fee $200 + $50/Vendor ID.", contactInfo: { website: "https://louisvilleky.gov/government/alcoholic-beverage-control/food-truck-mobile-vending-permit", phone: "(502) 574-6650", email: "", address: "" } },
  { name: "Lexington, KY", type: "city", city: "Lexington", county: "Fayette", state: "KY", notes: "Lexington-Fayette County Health Dept; plumbing plan review $100.", contactInfo: { website: "https://www.lfchd.org/", phone: "(859) 231-9791", email: "", address: "" } },
  { name: "Bowling Green, KY", type: "city", city: "Bowling Green", county: "Warren", state: "KY", notes: "Barren River Health Dept + City license.", contactInfo: { website: "https://www.bgky.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // OKLAHOMA
  // ========================================================
  { name: "Oklahoma City, OK", type: "city", city: "Oklahoma City", county: "Oklahoma", state: "OK", notes: "OCCHD Vehicle Food Sales license ($100–$250); statewide OSDH license valid Nov 2025+.", contactInfo: { website: "https://www.okc.gov/", phone: "(405) 297-2606", email: "", address: "" } },
  { name: "Tulsa, OK", type: "city", city: "Tulsa", county: "Tulsa", state: "OK", notes: "Mobile Vendor/Outdoor Seller License $20 app + $30 license; Tulsa Health Dept.", contactInfo: { website: "https://tulsa-health.org/permits-inspections/food/food-service-and-restaurant-industry-resources/mobile-food-vending/", phone: "(918) 596-9456", email: "", address: "" } },
  { name: "Norman, OK", type: "city", city: "Norman", county: "Cleveland", state: "OK", notes: "Cleveland County Health Dept + City license.", contactInfo: { website: "https://www.normanok.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // KANSAS
  // ========================================================
  { name: "Wichita, KS", type: "city", city: "Wichita", county: "Sedgwick", state: "KS", notes: "Mobile Food Vendor License per Chapter 3.15.", contactInfo: { website: "https://www.wichita.gov/", phone: "", email: "", address: "" } },
  { name: "Overland Park, KS", type: "city", city: "Overland Park", county: "Johnson", state: "KS", notes: "Johnson County Health Dept + City license.", contactInfo: { website: "https://www.opkansas.org/", phone: "", email: "", address: "" } },
  { name: "Kansas City, KS", type: "city", city: "Kansas City", county: "Wyandotte", state: "KS", notes: "Unified Government/Wyandotte County Health Dept.", contactInfo: { website: "https://www.wycokck.org/", phone: "", email: "", address: "" } },
  { name: "Topeka, KS", type: "city", city: "Topeka", county: "Shawnee", state: "KS", notes: "Shawnee County Health Dept + City license.", contactInfo: { website: "https://www.topeka.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // NEBRASKA
  // ========================================================
  { name: "Omaha, NE", type: "city", city: "Omaha", county: "Douglas", state: "NE", notes: "Douglas County HD Mobile Vendor Sticker + City permit ($100/vehicle) + Downtown BID ($100).", contactInfo: { website: "https://www.parkomaha.com/resources/mobile-food-vendor-permit", phone: "", email: "", address: "" } },
  { name: "Lincoln, NE", type: "city", city: "Lincoln", county: "Lancaster", state: "NE", notes: "Lincoln-Lancaster County HD + City Vendor Truck permit.", contactInfo: { website: "https://www.lincoln.ne.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // IOWA
  // ========================================================
  { name: "Des Moines, IA", type: "city", city: "Des Moines", county: "Polk", state: "IA", notes: "City Clerk vendor permit + Iowa DIAL MF License + Fire Dept inspection.", contactInfo: { website: "https://www.dsm.city/", phone: "(515) 283-4240", email: "", address: "" } },
  { name: "Cedar Rapids, IA", type: "city", city: "Cedar Rapids", county: "Linn", state: "IA", notes: "Linn County PH + Iowa DIAL license + City permit.", contactInfo: { website: "https://www.cedar-rapids.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // UTAH
  // ========================================================
  { name: "Salt Lake City, UT", type: "city", city: "Salt Lake City", county: "Salt Lake", state: "UT", notes: "SLC Business License + Salt Lake County HD Mobile Food Service Permit; must attend Mobile Food Service Class.", contactInfo: { website: "https://www.saltlakecounty.gov/health/food-protection/permits/mobile/", phone: "(385) 468-3845", email: "", address: "" } },
  { name: "Provo, UT", type: "city", city: "Provo", county: "Utah", state: "UT", notes: "Utah County Health Dept + City business license.", contactInfo: { website: "https://www.provo.org/", phone: "", email: "", address: "" } },
  { name: "West Valley City, UT", type: "city", city: "West Valley City", county: "Salt Lake", state: "UT", notes: "Salt Lake County HD + City license.", contactInfo: { website: "https://www.wvc-ut.gov/", phone: "", email: "", address: "" } },
  { name: "Ogden, UT", type: "city", city: "Ogden", county: "Weber", state: "UT", notes: "Weber-Morgan Health Dept + City license.", contactInfo: { website: "https://www.ogdencity.com/", phone: "", email: "", address: "" } },

  // ========================================================
  // NEW MEXICO
  // ========================================================
  { name: "Albuquerque, NM", type: "city", city: "Albuquerque", county: "Bernalillo", state: "NM", notes: "City Environmental Health Dept; Health permit $135/yr + Business registration $35/yr.", contactInfo: { website: "https://www.cabq.gov/environmentalhealth/food-safety/mobile-food-guide", phone: "(505) 768-2738", email: "", address: "" } },
  { name: "Las Cruces, NM", type: "city", city: "Las Cruces", county: "Dona Ana", state: "NM", notes: "NMED Retail Food Permit $100 + City license.", contactInfo: { website: "https://www.lascruces.gov/", phone: "", email: "", address: "" } },
  { name: "Santa Fe, NM", type: "city", city: "Santa Fe", county: "Santa Fe", state: "NM", notes: "NMED permit + City business license.", contactInfo: { website: "https://www.santafenm.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // IDAHO
  // ========================================================
  { name: "Boise, ID", type: "city", city: "Boise", county: "Ada", state: "ID", notes: "Central District Health permit + Boise Fire Dept permit.", contactInfo: { website: "https://www.cityofboise.org/", phone: "(208) 570-6559", email: "", address: "" } },
  { name: "Meridian, ID", type: "city", city: "Meridian", county: "Ada", state: "ID", notes: "Central District Health permit + City license.", contactInfo: { website: "https://meridiancity.org/", phone: "", email: "", address: "" } },
  { name: "Nampa, ID", type: "city", city: "Nampa", county: "Canyon", state: "ID", notes: "SW District Health + City license.", contactInfo: { website: "https://www.cityofnampa.us/", phone: "", email: "", address: "" } },

  // ========================================================
  // HAWAII
  // ========================================================
  { name: "Honolulu, HI", type: "city", city: "Honolulu", county: "Honolulu", state: "HI", notes: "Peddler's License from City Business License Office; DOH food establishment permit.", contactInfo: { website: "https://www.honolulu.gov/csd/food-truck-information-and-resources/", phone: "(808) 768-9700", email: "", address: "" } },

  // ========================================================
  // ALASKA
  // ========================================================
  { name: "Anchorage, AK", type: "city", city: "Anchorage", county: "Anchorage", state: "AK", notes: "Separate permitting from state DEC; Anchorage FSS Program.", contactInfo: { website: "https://www.muni.org/", phone: "(907) 343-4200", email: "", address: "" } },
  { name: "Fairbanks, AK", type: "city", city: "Fairbanks", county: "Fairbanks North Star", state: "AK", notes: "City business license ($50) + state DEC permit.", contactInfo: { website: "https://www.fairbanksalaska.us/", phone: "(907) 459-6720", email: "", address: "" } },

  // ========================================================
  // ALABAMA
  // ========================================================
  { name: "Birmingham, AL", type: "city", city: "Birmingham", county: "Jefferson", state: "AL", notes: "Jefferson County Health Dept + City business license.", contactInfo: { website: "https://www.birminghamal.gov/", phone: "", email: "", address: "" } },
  { name: "Montgomery, AL", type: "city", city: "Montgomery", county: "Montgomery", state: "AL", notes: "Montgomery County Health Dept + City license.", contactInfo: { website: "https://www.montgomeryal.gov/", phone: "", email: "", address: "" } },
  { name: "Huntsville, AL", type: "city", city: "Huntsville", county: "Madison", state: "AL", notes: "Madison County Health Dept + City license.", contactInfo: { website: "https://www.huntsvilleal.gov/", phone: "", email: "", address: "" } },
  { name: "Mobile, AL", type: "city", city: "Mobile", county: "Mobile", state: "AL", notes: "Mobile County Health Dept + City license.", contactInfo: { website: "https://www.cityofmobile.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // MISSISSIPPI
  // ========================================================
  { name: "Jackson, MS", type: "city", city: "Jackson", county: "Hinds", state: "MS", notes: "MSDH Food Permit (plan review $224.25) + City license.", contactInfo: { website: "https://www.jacksonms.gov/", phone: "(601) 364-2832", email: "", address: "" } },
  { name: "Gulfport, MS", type: "city", city: "Gulfport", county: "Harrison", state: "MS", notes: "MSDH permit + City license.", contactInfo: { website: "https://www.gulfport-ms.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // ARKANSAS
  // ========================================================
  { name: "Little Rock, AR", type: "city", city: "Little Rock", county: "Pulaski", state: "AR", notes: "ADH Food Establishment Permit (plan review 1% est cost, annual $35) + City license.", contactInfo: { website: "https://www.littlerock.gov/", phone: "", email: "", address: "" } },
  { name: "Fayetteville, AR", type: "city", city: "Fayetteville", county: "Washington", state: "AR", notes: "ADH permit + City license.", contactInfo: { website: "https://www.fayetteville-ar.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // WEST VIRGINIA
  // ========================================================
  { name: "Charleston, WV", type: "city", city: "Charleston", county: "Kanawha", state: "WV", notes: "Statewide Mobile Food Establishment Permit (HB 5017); Street Vending Permit $20.", contactInfo: { website: "https://www.charlestonwv.gov/", phone: "", email: "", address: "" } },
  { name: "Huntington, WV", type: "city", city: "Huntington", county: "Cabell", state: "WV", notes: "Mobile Food Vendor Permit $50.", contactInfo: { website: "https://www.cityofhuntington.com/", phone: "", email: "", address: "" } },

  // ========================================================
  // NEW JERSEY
  // ========================================================
  { name: "Newark, NJ", type: "city", city: "Newark", county: "Essex", state: "NJ", notes: "Dept of Finance Central Licenses & Permits; license period May 1–April 30.", contactInfo: { website: "https://peddlerlicense.newarkportal.us/", phone: "", email: "", address: "" } },
  { name: "Jersey City, NJ", type: "city", city: "Jersey City", county: "Hudson", state: "NJ", notes: "Vendor licenses capped; may need waitlist. City health permit.", contactInfo: { website: "https://www.jerseycitynj.gov/", phone: "", email: "", address: "" } },
  { name: "Paterson, NJ", type: "city", city: "Paterson", county: "Passaic", state: "NJ", notes: "City vendor license + Passaic County health.", contactInfo: { website: "https://www.patersonnj.gov/", phone: "", email: "", address: "" } },
  { name: "Trenton, NJ", type: "city", city: "Trenton", county: "Mercer", state: "NJ", notes: "Mercer County health + City license.", contactInfo: { website: "https://www.trentonnj.org/", phone: "", email: "", address: "" } },
  { name: "Elizabeth, NJ", type: "city", city: "Elizabeth", county: "Union", state: "NJ", notes: "Union County health + City license.", contactInfo: { website: "https://www.elizabethnj.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // CONNECTICUT
  // ========================================================
  { name: "Hartford, CT", type: "city", city: "Hartford", county: "Hartford", state: "CT", notes: "Local health dept IFVE license; reciprocal licensing among participating jurisdictions.", contactInfo: { website: "https://www.hartfordct.gov/", phone: "", email: "", address: "" } },
  { name: "New Haven, CT", type: "city", city: "New Haven", county: "New Haven", state: "CT", notes: "New Haven Health Dept IFVE license.", contactInfo: { website: "https://www.newhavenct.gov/", phone: "", email: "", address: "" } },
  { name: "Stamford, CT", type: "city", city: "Stamford", county: "Fairfield", state: "CT", notes: "Stamford Health Dept IFVE license.", contactInfo: { website: "https://www.stamfordct.gov/", phone: "", email: "", address: "" } },
  { name: "Bridgeport, CT", type: "city", city: "Bridgeport", county: "Fairfield", state: "CT", notes: "Bridgeport Health Dept IFVE license.", contactInfo: { website: "https://www.bridgeportct.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // RHODE ISLAND
  // ========================================================
  { name: "Providence, RI", type: "city", city: "Providence", county: "Providence", state: "RI", notes: "RIDOH license ($100) + DBR MFE Registration + State Fire Marshal + City permit.", contactInfo: { website: "https://www.providenceri.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // DELAWARE
  // ========================================================
  { name: "Wilmington, DE", type: "city", city: "Wilmington", county: "New Castle", state: "DE", notes: "No license cost; daily use fee $22/day for designated spots. Division of PH permit.", contactInfo: { website: "https://www.wilmingtonde.gov/business/foodtrucks", phone: "", email: "", address: "" } },

  // ========================================================
  // NEW HAMPSHIRE
  // ========================================================
  { name: "Nashua, NH", type: "city", city: "Nashua", county: "Hillsborough", state: "NH", notes: "Plan Review $125 + Annual Mobile Food Vendor $200 + Hawkers & Peddlers $100.", contactInfo: { website: "https://nashuanh.gov/1498/Mobile-Food-Service-Vendors", phone: "", email: "", address: "" } },
  { name: "Manchester, NH", type: "city", city: "Manchester", county: "Hillsborough", state: "NH", notes: "DHHS Food Service License + City license.", contactInfo: { website: "https://www.manchesternh.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // VERMONT
  // ========================================================
  { name: "Burlington, VT", type: "city", city: "Burlington", county: "Chittenden", state: "VT", notes: "VT Dept of Health Commercial Caterer License ($260/yr) + City permit.", contactInfo: { website: "https://www.burlingtonvt.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // MAINE
  // ========================================================
  { name: "Portland, ME", type: "city", city: "Portland", county: "Cumberland", state: "ME", notes: "Municipal-only license available; DHHS HIP for prepared food ($25–$500).", contactInfo: { website: "https://www.portlandmaine.gov/", phone: "", email: "", address: "" } },

  // ========================================================
  // NORTH DAKOTA / SOUTH DAKOTA
  // ========================================================
  { name: "Fargo, ND", type: "city", city: "Fargo", county: "Cass", state: "ND", notes: "Fargo-Cass Public Health + City license.", contactInfo: { website: "https://fargond.gov/", phone: "(701) 476-6729", email: "", address: "" } },
  { name: "Bismarck, ND", type: "city", city: "Bismarck", county: "Burleigh", state: "ND", notes: "Bismarck-Burleigh PH + City license.", contactInfo: { website: "https://www.bismarcknd.gov/", phone: "", email: "", address: "" } },
  { name: "Sioux Falls, SD", type: "city", city: "Sioux Falls", county: "Minnehaha", state: "SD", notes: "Peddler/Mobile Food Vendor License from Police Records + SD DOH.", contactInfo: { website: "https://www.siouxfalls.gov/", phone: "", email: "", address: "" } },
  { name: "Rapid City, SD", type: "city", city: "Rapid City", county: "Pennington", state: "SD", notes: "SD DOH permit + City license.", contactInfo: { website: "https://www.rcgov.org/", phone: "", email: "", address: "" } },

  // ========================================================
  // MONTANA / WYOMING
  // ========================================================
  { name: "Billings, MT", type: "city", city: "Billings", county: "Yellowstone", state: "MT", notes: "Yellowstone County/City Health Dept + City license.", contactInfo: { website: "https://www.billingsmt.gov/", phone: "", email: "", address: "" } },
  { name: "Missoula, MT", type: "city", city: "Missoula", county: "Missoula", state: "MT", notes: "Missoula County Health Dept + City license.", contactInfo: { website: "https://www.ci.missoula.mt.us/", phone: "", email: "", address: "" } },
  { name: "Cheyenne, WY", type: "city", city: "Cheyenne", county: "Laramie", state: "WY", notes: "Cheyenne-Laramie County Health Dept + City license.", contactInfo: { website: "https://www.cheyennecity.org/", phone: "", email: "", address: "" } },
  { name: "Casper, WY", type: "city", city: "Casper", county: "Natrona", state: "WY", notes: "Natrona County Health Dept + City license.", contactInfo: { website: "https://www.casperwy.gov/", phone: "", email: "", address: "" } },
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
