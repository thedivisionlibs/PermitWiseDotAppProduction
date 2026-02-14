// seeds/seed_jurisdictions.js
// Run: MONGODB_URI="mongodb+srv://..." node seed_jurisdictions.js
// Or locally: node seed_jurisdictions.js (uses localhost default)

const mongoose = require('mongoose');

// Match server.js default so it works without env var
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/permitwise';

// Schema mirrors server.js lines 473-489 exactly
const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'county', 'state'], required: true },
  city: { type: String },
  county: { type: String },
  state: { type: String, required: true },
  notes: { type: String },
  contactInfo: { website: String, phone: String, email: String, address: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Jurisdiction = mongoose.model('Jurisdiction', jurisdictionSchema);

const jurisdictions = [
  {
    "name": "Houston",
    "type": "city",
    "city": "Houston",
    "county": "Harris",
    "state": "TX",
    "notes": "Houston Health Dept issues MFU Medallion; Fire Dept LP-Gas permit required.",
    "contactInfo": {
      "website": "https://www.houstonpermittingcenter.org/hhd1008",
      "phone": "(832) 393-5100",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "San Antonio",
    "type": "city",
    "city": "San Antonio",
    "county": "Bexar",
    "state": "TX",
    "notes": "SAMHD Food Establishment License + Fire Dept Mobile Vending Permit.",
    "contactInfo": {
      "website": "https://www.sa.gov/Directory/Departments/SAMHD",
      "phone": "(210) 207-6000",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Dallas",
    "type": "city",
    "city": "Dallas",
    "county": "Dallas",
    "state": "TX",
    "notes": "Dallas County Health & Human Services countywide MFU permit.",
    "contactInfo": {
      "website": "https://www.dallascounty.org/departments/dchhs/",
      "phone": "(214) 819-2115",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Austin",
    "type": "city",
    "city": "Austin",
    "county": "Travis",
    "state": "TX",
    "notes": "Austin Public Health Environmental Health Services.",
    "contactInfo": {
      "website": "https://www.austintexas.gov/department/mobile-food-vendors",
      "phone": "(512) 978-0300",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fort Worth",
    "type": "city",
    "city": "Fort Worth",
    "county": "Tarrant",
    "state": "TX",
    "notes": "Tarrant County Public Health countywide permit covers 41+ municipalities.",
    "contactInfo": {
      "website": "https://www.tarrantcountytx.gov/en/public-health.html",
      "phone": "(817) 248-6299",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "El Paso",
    "type": "city",
    "city": "El Paso",
    "county": "El Paso",
    "state": "TX",
    "notes": "City of El Paso Dept of Public Health.",
    "contactInfo": {
      "website": "https://www.elpasotexas.gov/public-health/",
      "phone": "(915) 212-0200",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Arlington",
    "type": "city",
    "city": "Arlington",
    "county": "Tarrant",
    "state": "TX",
    "notes": "Tarrant County Public Health permit.",
    "contactInfo": {
      "website": "https://www.arlingtontx.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Corpus Christi",
    "type": "city",
    "city": "Corpus Christi",
    "county": "Nueces",
    "state": "TX",
    "notes": "Nueces County Public Health District.",
    "contactInfo": {
      "website": "https://www.corpuschristitx.gov/department-directory/health-district/",
      "phone": "(361) 826-7222",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Plano",
    "type": "city",
    "city": "Plano",
    "county": "Collin",
    "state": "TX",
    "notes": "Environmental Health Division.",
    "contactInfo": {
      "website": "https://www.plano.gov/345/Mobile-Food-Establishments",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lubbock",
    "type": "city",
    "city": "Lubbock",
    "county": "Lubbock",
    "state": "TX",
    "notes": "Mobile Food Vending Permit $250.",
    "contactInfo": {
      "website": "https://www.mylubbock.us/",
      "phone": "(806) 767-2123",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Laredo",
    "type": "city",
    "city": "Laredo",
    "county": "Webb",
    "state": "TX",
    "notes": "City of Laredo Health Dept.",
    "contactInfo": {
      "website": "https://www.cityoflaredo.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Irving",
    "type": "city",
    "city": "Irving",
    "county": "Dallas",
    "state": "TX",
    "notes": "Dallas County Health permits.",
    "contactInfo": {
      "website": "https://www.cityofirving.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Amarillo",
    "type": "city",
    "city": "Amarillo",
    "county": "Potter",
    "state": "TX",
    "notes": "City of Amarillo Environmental Health.",
    "contactInfo": {
      "website": "https://www.amarillo.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Grand Prairie",
    "type": "city",
    "city": "Grand Prairie",
    "county": "Dallas",
    "state": "TX",
    "notes": "Dallas County Health permits.",
    "contactInfo": {
      "website": "https://www.gptx.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Brownsville",
    "type": "city",
    "city": "Brownsville",
    "county": "Cameron",
    "state": "TX",
    "notes": "City of Brownsville Health Dept.",
    "contactInfo": {
      "website": "https://www.cob.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "McKinney",
    "type": "city",
    "city": "McKinney",
    "county": "Collin",
    "state": "TX",
    "notes": "Collin County Health permits.",
    "contactInfo": {
      "website": "https://www.mckinneytexas.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Frisco",
    "type": "city",
    "city": "Frisco",
    "county": "Collin",
    "state": "TX",
    "notes": "Health & Food Safety Division.",
    "contactInfo": {
      "website": "https://friscotexas.gov/204/Mobile-Temporary-Food-Vendors",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Denton",
    "type": "city",
    "city": "Denton",
    "county": "Denton",
    "state": "TX",
    "notes": "City Health & Food Safety Division.",
    "contactInfo": {
      "website": "https://www.cityofdenton.com/",
      "phone": "(940) 349-8600",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Midland",
    "type": "city",
    "city": "Midland",
    "county": "Midland",
    "state": "TX",
    "notes": "Code Administration Vendor Permit $100.",
    "contactInfo": {
      "website": "https://develop.midlandtexas.gov/168/Vendor-Permits",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Waco",
    "type": "city",
    "city": "Waco",
    "county": "McLennan",
    "state": "TX",
    "notes": "Waco-McLennan County Public Health District.",
    "contactInfo": {
      "website": "https://www.waco-texas.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Odessa",
    "type": "city",
    "city": "Odessa",
    "county": "Ector",
    "state": "TX",
    "notes": "Ector County Health Dept.",
    "contactInfo": {
      "website": "https://www.odessa-tx.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Richardson",
    "type": "city",
    "city": "Richardson",
    "county": "Dallas",
    "state": "TX",
    "notes": "Mobile Food Vendor Permit $250.",
    "contactInfo": {
      "website": "https://www.cor.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Round Rock",
    "type": "city",
    "city": "Round Rock",
    "county": "Williamson",
    "state": "TX",
    "notes": "Williamson County & Cities Health District.",
    "contactInfo": {
      "website": "https://www.roundrocktexas.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sugar Land",
    "type": "city",
    "city": "Sugar Land",
    "county": "Fort Bend",
    "state": "TX",
    "notes": "Fort Bend County Health & Human Services.",
    "contactInfo": {
      "website": "https://www.sugarlandtx.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Pearland",
    "type": "city",
    "city": "Pearland",
    "county": "Brazoria",
    "state": "TX",
    "notes": "Brazoria County Health Dept.",
    "contactInfo": {
      "website": "https://www.pearlandtx.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "College Station",
    "type": "city",
    "city": "College Station",
    "county": "Brazos",
    "state": "TX",
    "notes": "Brazos County Health Dept.",
    "contactInfo": {
      "website": "https://www.cstx.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Killeen",
    "type": "city",
    "city": "Killeen",
    "county": "Bell",
    "state": "TX",
    "notes": "Bell County Public Health District.",
    "contactInfo": {
      "website": "https://www.killeentexas.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Miami",
    "type": "city",
    "city": "Miami",
    "county": "Miami-Dade",
    "state": "FL",
    "notes": "DBPR MFDV license + Miami-Dade County BTRs.",
    "contactInfo": {
      "website": "https://www.miamidade.gov/permits/mobile-sales.asp",
      "phone": "(305) 375-2877",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Jacksonville",
    "type": "city",
    "city": "Jacksonville",
    "county": "Duval",
    "state": "FL",
    "notes": "Duval County LBTR + JFRD Fire Safety ($65/yr).",
    "contactInfo": {
      "website": "https://www.coj.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tampa",
    "type": "city",
    "city": "Tampa",
    "county": "Hillsborough",
    "state": "FL",
    "notes": "Hillsborough County BTR + Fire Marshal inspection.",
    "contactInfo": {
      "website": "https://www.tampa.gov/special-events-coordination/food-truck",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Orlando",
    "type": "city",
    "city": "Orlando",
    "county": "Orange",
    "state": "FL",
    "notes": "City BTR + Fire Marshal inspection.",
    "contactInfo": {
      "website": "https://www.orlando.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "St. Petersburg",
    "type": "city",
    "city": "St. Petersburg",
    "county": "Pinellas",
    "state": "FL",
    "notes": "Business Tax Receipt.",
    "contactInfo": {
      "website": "https://www.stpete.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fort Lauderdale",
    "type": "city",
    "city": "Fort Lauderdale",
    "county": "Broward",
    "state": "FL",
    "notes": "Broward County AND City BTRs.",
    "contactInfo": {
      "website": "https://www.fortlauderdale.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tallahassee",
    "type": "city",
    "city": "Tallahassee",
    "county": "Leon",
    "state": "FL",
    "notes": "City BTR + Leon County Health Dept.",
    "contactInfo": {
      "website": "https://www.talgov.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Hialeah",
    "type": "city",
    "city": "Hialeah",
    "county": "Miami-Dade",
    "state": "FL",
    "notes": "Miami-Dade County permits apply.",
    "contactInfo": {
      "website": "https://www.hialeahfl.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cape Coral",
    "type": "city",
    "city": "Cape Coral",
    "county": "Lee",
    "state": "FL",
    "notes": "Lee County Health Dept.",
    "contactInfo": {
      "website": "https://www.capecoral.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Port St. Lucie",
    "type": "city",
    "city": "Port St. Lucie",
    "county": "St. Lucie",
    "state": "FL",
    "notes": "St. Lucie County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.cityofpsl.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "West Palm Beach",
    "type": "city",
    "city": "West Palm Beach",
    "county": "Palm Beach",
    "state": "FL",
    "notes": "Palm Beach County + City BTRs.",
    "contactInfo": {
      "website": "https://www.wpb.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Gainesville",
    "type": "city",
    "city": "Gainesville",
    "county": "Alachua",
    "state": "FL",
    "notes": "Alachua County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.gainesvillefl.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Clearwater",
    "type": "city",
    "city": "Clearwater",
    "county": "Pinellas",
    "state": "FL",
    "notes": "Pinellas County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.myclearwater.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lakeland",
    "type": "city",
    "city": "Lakeland",
    "county": "Polk",
    "state": "FL",
    "notes": "Polk County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.lakelandgov.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Palm Bay",
    "type": "city",
    "city": "Palm Bay",
    "county": "Brevard",
    "state": "FL",
    "notes": "Brevard County Health Dept.",
    "contactInfo": {
      "website": "https://www.palmbayfl.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Pembroke Pines",
    "type": "city",
    "city": "Pembroke Pines",
    "county": "Broward",
    "state": "FL",
    "notes": "Broward County permits.",
    "contactInfo": {
      "website": "https://www.ppines.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Hollywood",
    "type": "city",
    "city": "Hollywood",
    "county": "Broward",
    "state": "FL",
    "notes": "Broward County permits + City BTR.",
    "contactInfo": {
      "website": "https://www.hollywoodfl.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Coral Springs",
    "type": "city",
    "city": "Coral Springs",
    "county": "Broward",
    "state": "FL",
    "notes": "Broward County permits.",
    "contactInfo": {
      "website": "https://www.coralsprings.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sarasota",
    "type": "city",
    "city": "Sarasota",
    "county": "Sarasota",
    "state": "FL",
    "notes": "Sarasota County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.sarasotafl.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Kissimmee",
    "type": "city",
    "city": "Kissimmee",
    "county": "Osceola",
    "state": "FL",
    "notes": "Osceola County Health Dept + City BTR.",
    "contactInfo": {
      "website": "https://www.kissimmee.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Los Angeles",
    "type": "city",
    "city": "Los Angeles",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH health permit + City BTRC.",
    "contactInfo": {
      "website": "https://publichealth.lacounty.gov/eh/business/food-trucks-carts.htm",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "San Diego",
    "type": "city",
    "city": "San Diego",
    "county": "San Diego",
    "state": "CA",
    "notes": "San Diego County DEHQ MFF permit $228-$760/yr.",
    "contactInfo": {
      "website": "https://www.sandiegocounty.gov/content/sdc/deh/fhd/mobilefood.html",
      "phone": "(858) 505-6666",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "San Jose",
    "type": "city",
    "city": "San Jose",
    "county": "Santa Clara",
    "state": "CA",
    "notes": "Santa Clara County DEH MFF permit.",
    "contactInfo": {
      "website": "https://deh.santaclaracounty.gov/food-and-retail/compliance-retail-food-operations/mobile-food-facilities",
      "phone": "(408) 918-1908",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "San Francisco",
    "type": "city",
    "city": "San Francisco",
    "county": "San Francisco",
    "state": "CA",
    "notes": "SFDPH + SF Public Works + Fire Dept.",
    "contactInfo": {
      "website": "https://sfpublicworks.org/services/permits/mobile-food-facilities",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fresno",
    "type": "city",
    "city": "Fresno",
    "county": "Fresno",
    "state": "CA",
    "notes": "City Mobile Vendor Permit + Fresno County EH.",
    "contactInfo": {
      "website": "https://www.fresno.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sacramento",
    "type": "city",
    "city": "Sacramento",
    "county": "Sacramento",
    "state": "CA",
    "notes": "Sacramento County EMD MFF permit.",
    "contactInfo": {
      "website": "https://emd.saccounty.gov/EH/FoodProtect-RetailFood/Pages/MobileFood.aspx",
      "phone": "(916) 875-8440",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Long Beach",
    "type": "city",
    "city": "Long Beach",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "Separate from LA County; own permits.",
    "contactInfo": {
      "website": "https://www.longbeach.gov/",
      "phone": "(562) 570-4132",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Oakland",
    "type": "city",
    "city": "Oakland",
    "county": "Alameda",
    "state": "CA",
    "notes": "Alameda County DEH MFF permit.",
    "contactInfo": {
      "website": "https://deh.acgov.org/",
      "phone": "(510) 567-6724",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bakersfield",
    "type": "city",
    "city": "Bakersfield",
    "county": "Kern",
    "state": "CA",
    "notes": "Kern County Public Health MFF permit.",
    "contactInfo": {
      "website": "https://www.kernpublichealth.com/",
      "phone": "(661) 862-8700",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Anaheim",
    "type": "city",
    "city": "Anaheim",
    "county": "Orange",
    "state": "CA",
    "notes": "OC Health Care Agency MFF permit $183-$488/yr.",
    "contactInfo": {
      "website": "https://ochealthinfo.com/",
      "phone": "(714) 433-6416",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Santa Ana",
    "type": "city",
    "city": "Santa Ana",
    "county": "Orange",
    "state": "CA",
    "notes": "OC HCA + City MFF permit.",
    "contactInfo": {
      "website": "https://www.santa-ana.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Riverside",
    "type": "city",
    "city": "Riverside",
    "county": "Riverside",
    "state": "CA",
    "notes": "Riverside County DEH MFF permit.",
    "contactInfo": {
      "website": "https://rivcoeh.org/mobile-food-facilities",
      "phone": "(760) 320-1048",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Stockton",
    "type": "city",
    "city": "Stockton",
    "county": "San Joaquin",
    "state": "CA",
    "notes": "San Joaquin County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.stocktonca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Irvine",
    "type": "city",
    "city": "Irvine",
    "county": "Orange",
    "state": "CA",
    "notes": "OC HCA + City business license.",
    "contactInfo": {
      "website": "https://www.cityofirvine.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Chula Vista",
    "type": "city",
    "city": "Chula Vista",
    "county": "San Diego",
    "state": "CA",
    "notes": "San Diego County DEHQ permit.",
    "contactInfo": {
      "website": "https://www.chulavistaca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fremont",
    "type": "city",
    "city": "Fremont",
    "county": "Alameda",
    "state": "CA",
    "notes": "Alameda County DEH MFF permit.",
    "contactInfo": {
      "website": "https://www.fremont.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "San Bernardino",
    "type": "city",
    "city": "San Bernardino",
    "county": "San Bernardino",
    "state": "CA",
    "notes": "SB County DPH EHS MFF permit.",
    "contactInfo": {
      "website": "https://ehs.sbcounty.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Modesto",
    "type": "city",
    "city": "Modesto",
    "county": "Stanislaus",
    "state": "CA",
    "notes": "Stanislaus County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.modestogov.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fontana",
    "type": "city",
    "city": "Fontana",
    "county": "San Bernardino",
    "state": "CA",
    "notes": "SB County DPH EHS MFF permit.",
    "contactInfo": {
      "website": "https://www.fontana.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Moreno Valley",
    "type": "city",
    "city": "Moreno Valley",
    "county": "Riverside",
    "state": "CA",
    "notes": "Riverside County DEH MFF permit.",
    "contactInfo": {
      "website": "https://www.moval.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Glendale",
    "type": "city",
    "city": "Glendale",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.glendaleca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Huntington Beach",
    "type": "city",
    "city": "Huntington Beach",
    "county": "Orange",
    "state": "CA",
    "notes": "OC HCA MFF permit.",
    "contactInfo": {
      "website": "https://www.huntingtonbeachca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Santa Clarita",
    "type": "city",
    "city": "Santa Clarita",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.santa-clarita.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Garden Grove",
    "type": "city",
    "city": "Garden Grove",
    "county": "Orange",
    "state": "CA",
    "notes": "OC HCA MFF permit.",
    "contactInfo": {
      "website": "https://ggcity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Oceanside",
    "type": "city",
    "city": "Oceanside",
    "county": "San Diego",
    "state": "CA",
    "notes": "San Diego County DEHQ permit.",
    "contactInfo": {
      "website": "https://www.ci.oceanside.ca.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Rancho Cucamonga",
    "type": "city",
    "city": "Rancho Cucamonga",
    "county": "San Bernardino",
    "state": "CA",
    "notes": "SB County DPH EHS MFF permit.",
    "contactInfo": {
      "website": "https://www.cityofrc.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Ontario",
    "type": "city",
    "city": "Ontario",
    "county": "San Bernardino",
    "state": "CA",
    "notes": "SB County DPH EHS MFF permit.",
    "contactInfo": {
      "website": "https://www.ontarioca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Oxnard",
    "type": "city",
    "city": "Oxnard",
    "county": "Ventura",
    "state": "CA",
    "notes": "Ventura County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.oxnard.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Elk Grove",
    "type": "city",
    "city": "Elk Grove",
    "county": "Sacramento",
    "state": "CA",
    "notes": "Sacramento County EMD permit.",
    "contactInfo": {
      "website": "https://www.elkgrovecity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Corona",
    "type": "city",
    "city": "Corona",
    "county": "Riverside",
    "state": "CA",
    "notes": "Riverside County DEH permit.",
    "contactInfo": {
      "website": "https://www.coronaca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Visalia",
    "type": "city",
    "city": "Visalia",
    "county": "Tulare",
    "state": "CA",
    "notes": "Tulare County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.visalia.city/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Concord",
    "type": "city",
    "city": "Concord",
    "county": "Contra Costa",
    "state": "CA",
    "notes": "Contra Costa Health MFF permit.",
    "contactInfo": {
      "website": "https://www.cityofconcord.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Santa Rosa",
    "type": "city",
    "city": "Santa Rosa",
    "county": "Sonoma",
    "state": "CA",
    "notes": "Sonoma County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.srcity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Salinas",
    "type": "city",
    "city": "Salinas",
    "county": "Monterey",
    "state": "CA",
    "notes": "Monterey County EH MFF permit.",
    "contactInfo": {
      "website": "https://www.cityofsalinas.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Palmdale",
    "type": "city",
    "city": "Palmdale",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.cityofpalmdale.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lancaster",
    "type": "city",
    "city": "Lancaster",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.cityoflancasterca.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sunnyvale",
    "type": "city",
    "city": "Sunnyvale",
    "county": "Santa Clara",
    "state": "CA",
    "notes": "Santa Clara County DEH MFF permit.",
    "contactInfo": {
      "website": "https://www.sunnyvale.ca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Pomona",
    "type": "city",
    "city": "Pomona",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.pomonaca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Escondido",
    "type": "city",
    "city": "Escondido",
    "county": "San Diego",
    "state": "CA",
    "notes": "San Diego County DEHQ permit.",
    "contactInfo": {
      "website": "https://www.escondido.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Torrance",
    "type": "city",
    "city": "Torrance",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "LA County DPH EH permit.",
    "contactInfo": {
      "website": "https://www.torranceca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Hayward",
    "type": "city",
    "city": "Hayward",
    "county": "Alameda",
    "state": "CA",
    "notes": "Alameda County DEH MFF permit.",
    "contactInfo": {
      "website": "https://www.hayward-ca.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Pasadena",
    "type": "city",
    "city": "Pasadena",
    "county": "Los Angeles",
    "state": "CA",
    "notes": "Pasadena Public Health Dept (separate from LA County).",
    "contactInfo": {
      "website": "https://www.cityofpasadena.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Phoenix",
    "type": "city",
    "city": "Phoenix",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "City Clerk Mobile Vending License ($350 app + $30/yr) + Maricopa County health.",
    "contactInfo": {
      "website": "https://www.phoenix.gov/cityclerk/services/licensing/regbusinfo/vending/mobile-vending",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tucson",
    "type": "city",
    "city": "Tucson",
    "county": "Pima",
    "state": "AZ",
    "notes": "Vendor permit ~$181.50/yr; Pima County health.",
    "contactInfo": {
      "website": "https://www.tucsonaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Mesa",
    "type": "city",
    "city": "Mesa",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Mobile Food Vendor License $100/yr.",
    "contactInfo": {
      "website": "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Chandler",
    "type": "city",
    "city": "Chandler",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Mobile Food Unit Permit + Tax License ($45).",
    "contactInfo": {
      "website": "https://www.chandleraz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Scottsdale",
    "type": "city",
    "city": "Scottsdale",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Business License ($62 initial, $50 renewal).",
    "contactInfo": {
      "website": "https://www.scottsdaleaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Gilbert",
    "type": "city",
    "city": "Gilbert",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Business License ($35 initial); Maricopa County health.",
    "contactInfo": {
      "website": "https://www.gilbertaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tempe",
    "type": "city",
    "city": "Tempe",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Maricopa County health + TPT.",
    "contactInfo": {
      "website": "https://www.tempe.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Glendale",
    "type": "city",
    "city": "Glendale",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Maricopa County health + City license.",
    "contactInfo": {
      "website": "https://www.glendaleaz.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Peoria",
    "type": "city",
    "city": "Peoria",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Maricopa County health + City license.",
    "contactInfo": {
      "website": "https://www.peoriaaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Surprise",
    "type": "city",
    "city": "Surprise",
    "county": "Maricopa",
    "state": "AZ",
    "notes": "Maricopa County health + City license.",
    "contactInfo": {
      "website": "https://www.surpriseaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Flagstaff",
    "type": "city",
    "city": "Flagstaff",
    "county": "Coconino",
    "state": "AZ",
    "notes": "Coconino County Health Dept permit.",
    "contactInfo": {
      "website": "https://www.flagstaff.az.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Yuma",
    "type": "city",
    "city": "Yuma",
    "county": "Yuma",
    "state": "AZ",
    "notes": "Yuma County health + City license.",
    "contactInfo": {
      "website": "https://www.yumaaz.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "New York City",
    "type": "city",
    "city": "New York City",
    "county": "New York",
    "state": "NY",
    "notes": "DOHMH license ($50/2yr) + unit permit (capped); FDNY G-23 for propane.",
    "contactInfo": {
      "website": "https://www.nyc.gov/site/doh/business/food-operators/mobile-and-temporary-food-vendors.page",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Buffalo",
    "type": "city",
    "city": "Buffalo",
    "county": "Erie",
    "state": "NY",
    "notes": "Erie County Health Dept + City vendor license.",
    "contactInfo": {
      "website": "https://www.buffalony.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Rochester",
    "type": "city",
    "city": "Rochester",
    "county": "Monroe",
    "state": "NY",
    "notes": "Monroe County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityofrochester.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Yonkers",
    "type": "city",
    "city": "Yonkers",
    "county": "Westchester",
    "state": "NY",
    "notes": "Westchester County Health Dept permit.",
    "contactInfo": {
      "website": "https://www.yonkersny.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Syracuse",
    "type": "city",
    "city": "Syracuse",
    "county": "Onondaga",
    "state": "NY",
    "notes": "Onondaga County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.syrgov.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Albany",
    "type": "city",
    "city": "Albany",
    "county": "Albany",
    "state": "NY",
    "notes": "Albany County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.albanyny.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Chicago",
    "type": "city",
    "city": "Chicago",
    "county": "Cook",
    "state": "IL",
    "notes": "BACP Mobile Food Preparer ($1,000/2yr) or Dispenser ($700/2yr); GPS affidavit.",
    "contactInfo": {
      "website": "https://www.chicago.gov/city/en/depts/bacp/supp_info/mobile_food_vendorlicenses.html",
      "phone": "(312) 744-6249",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Aurora",
    "type": "city",
    "city": "Aurora",
    "county": "Kane",
    "state": "IL",
    "notes": "Kane County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.aurora-il.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Naperville",
    "type": "city",
    "city": "Naperville",
    "county": "DuPage",
    "state": "IL",
    "notes": "DuPage County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.naperville.il.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Rockford",
    "type": "city",
    "city": "Rockford",
    "county": "Winnebago",
    "state": "IL",
    "notes": "Winnebago County Health Dept + City license.",
    "contactInfo": {
      "website": "https://rockfordil.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Joliet",
    "type": "city",
    "city": "Joliet",
    "county": "Will",
    "state": "IL",
    "notes": "Will County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.joliet.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Springfield",
    "type": "city",
    "city": "Springfield",
    "county": "Sangamon",
    "state": "IL",
    "notes": "Sangamon County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.springfield.il.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Elgin",
    "type": "city",
    "city": "Elgin",
    "county": "Kane",
    "state": "IL",
    "notes": "Kane County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityofelgin.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Peoria",
    "type": "city",
    "city": "Peoria",
    "county": "Peoria",
    "state": "IL",
    "notes": "Peoria County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.peoriagov.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Philadelphia",
    "type": "city",
    "city": "Philadelphia",
    "county": "Philadelphia",
    "state": "PA",
    "notes": "CAL ($300 lifetime + $50 annual) + Food License ($300) + Motor Vehicle Vendor ($300).",
    "contactInfo": {
      "website": "https://www.phila.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Pittsburgh",
    "type": "city",
    "city": "Pittsburgh",
    "county": "Allegheny",
    "state": "PA",
    "notes": "Mobile Vehicle Vendor License + Allegheny County Health.",
    "contactInfo": {
      "website": "https://www.alleghenycounty.us/Services/Health-Department/Food-Safety/Permits-and-Registration/Mobile-Food-Facilities",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Harrisburg",
    "type": "city",
    "city": "Harrisburg",
    "county": "Dauphin",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license + City license.",
    "contactInfo": {
      "website": "https://harrisburgpa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Allentown",
    "type": "city",
    "city": "Allentown",
    "county": "Lehigh",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license + City permit.",
    "contactInfo": {
      "website": "https://www.allentownpa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Erie",
    "type": "city",
    "city": "Erie",
    "county": "Erie",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license + City permit.",
    "contactInfo": {
      "website": "https://www.erie.pa.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lancaster",
    "type": "city",
    "city": "Lancaster",
    "county": "Lancaster",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license.",
    "contactInfo": {
      "website": "https://cityoflancasterpa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Reading",
    "type": "city",
    "city": "Reading",
    "county": "Berks",
    "state": "PA",
    "notes": "Berks County operates independently.",
    "contactInfo": {
      "website": "https://www.readingpa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Scranton",
    "type": "city",
    "city": "Scranton",
    "county": "Lackawanna",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license + City license.",
    "contactInfo": {
      "website": "https://www.scrantonpa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bethlehem",
    "type": "city",
    "city": "Bethlehem",
    "county": "Northampton",
    "state": "PA",
    "notes": "PA Dept of Agriculture MFF license + City permit.",
    "contactInfo": {
      "website": "https://www.bethlehem-pa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Dallas Township",
    "type": "city",
    "city": "Dallas Township",
    "county": "Luzerne",
    "state": "PA",
    "notes": "Back Mountain municipality; local ordinance approvals.",
    "contactInfo": {
      "website": "https://www.dallastwp.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Kingston Township",
    "type": "city",
    "city": "Kingston Township",
    "county": "Luzerne",
    "state": "PA",
    "notes": "Back Mountain municipality.",
    "contactInfo": {
      "website": "",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lehman Township",
    "type": "city",
    "city": "Lehman Township",
    "county": "Luzerne",
    "state": "PA",
    "notes": "Back Mountain municipality.",
    "contactInfo": {
      "website": "",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Columbus",
    "type": "city",
    "city": "Columbus",
    "county": "Franklin",
    "state": "OH",
    "notes": "City permit + Columbus Public Health + Fire inspection.",
    "contactInfo": {
      "website": "https://www.columbus.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cleveland",
    "type": "city",
    "city": "Cleveland",
    "county": "Cuyahoga",
    "state": "OH",
    "notes": "Mobile Food Shop Location Permit ($100) + Health ($303).",
    "contactInfo": {
      "website": "https://www.clevelandohio.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cincinnati",
    "type": "city",
    "city": "Cincinnati",
    "county": "Hamilton",
    "state": "OH",
    "notes": "Cincinnati Health Dept Mobile Food Licensing.",
    "contactInfo": {
      "website": "https://www.cincinnati-oh.gov/health/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Toledo",
    "type": "city",
    "city": "Toledo",
    "county": "Lucas",
    "state": "OH",
    "notes": "City registration ($50) + statewide license.",
    "contactInfo": {
      "website": "https://toledo.oh.gov/business/mobile-food",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Akron",
    "type": "city",
    "city": "Akron",
    "county": "Summit",
    "state": "OH",
    "notes": "Summit County Public Health + City license.",
    "contactInfo": {
      "website": "https://www.akronohio.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Dayton",
    "type": "city",
    "city": "Dayton",
    "county": "Montgomery",
    "state": "OH",
    "notes": "Montgomery County PH + City license.",
    "contactInfo": {
      "website": "https://www.daytonohio.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Atlanta",
    "type": "city",
    "city": "Atlanta",
    "county": "Fulton",
    "state": "GA",
    "notes": "Street Eats: $75 annual + $350 reservation; county health.",
    "contactInfo": {
      "website": "https://www.atlantaga.gov/government/departments/city-planning/economic-development/vending-program",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Savannah",
    "type": "city",
    "city": "Savannah",
    "county": "Chatham",
    "state": "GA",
    "notes": "City Office of Special Events; $150 annual.",
    "contactInfo": {
      "website": "https://www.savannahga.gov/2466/Food-Trucks",
      "phone": "(912) 651-6445",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Augusta",
    "type": "city",
    "city": "Augusta",
    "county": "Richmond",
    "state": "GA",
    "notes": "Augusta-Richmond County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.augustaga.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Columbus",
    "type": "city",
    "city": "Columbus",
    "county": "Muscogee",
    "state": "GA",
    "notes": "Columbus-Muscogee County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.columbusga.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Macon",
    "type": "city",
    "city": "Macon",
    "county": "Bibb",
    "state": "GA",
    "notes": "North Central Health District + City license.",
    "contactInfo": {
      "website": "https://www.maconbibb.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Athens",
    "type": "city",
    "city": "Athens",
    "county": "Clarke",
    "state": "GA",
    "notes": "NE Georgia Health District + City license.",
    "contactInfo": {
      "website": "https://www.accgov.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Charlotte",
    "type": "city",
    "city": "Charlotte",
    "county": "Mecklenburg",
    "state": "NC",
    "notes": "Mecklenburg County EH MFU permit + City license.",
    "contactInfo": {
      "website": "https://www.charlottenc.gov/",
      "phone": "(980) 314-1620",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Raleigh",
    "type": "city",
    "city": "Raleigh",
    "county": "Wake",
    "state": "NC",
    "notes": "City food truck permit (~$150) + Wake County Vending Permit.",
    "contactInfo": {
      "website": "https://raleighnc.gov/permits/services/food-trucks-private-property-and-public-right-way",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Greensboro",
    "type": "city",
    "city": "Greensboro",
    "county": "Guilford",
    "state": "NC",
    "notes": "City permit + Guilford County Health Dept.",
    "contactInfo": {
      "website": "https://www.greensboro-nc.gov/business/economic-development/food-trucks",
      "phone": "(336) 641-3771",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Durham",
    "type": "city",
    "city": "Durham",
    "county": "Durham",
    "state": "NC",
    "notes": "Durham County Health Dept + City license.",
    "contactInfo": {
      "website": "https://durhamnc.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Winston-Salem",
    "type": "city",
    "city": "Winston-Salem",
    "county": "Forsyth",
    "state": "NC",
    "notes": "Forsyth County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityofws.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fayetteville",
    "type": "city",
    "city": "Fayetteville",
    "county": "Cumberland",
    "state": "NC",
    "notes": "Cumberland County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.fayettevillenc.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Wilmington",
    "type": "city",
    "city": "Wilmington",
    "county": "New Hanover",
    "state": "NC",
    "notes": "New Hanover County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.wilmingtonnc.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Asheville",
    "type": "city",
    "city": "Asheville",
    "county": "Buncombe",
    "state": "NC",
    "notes": "Buncombe County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.ashevillenc.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Nashville",
    "type": "city",
    "city": "Nashville",
    "county": "Davidson",
    "state": "TN",
    "notes": "NDOT Mobile Food Vendor Permit ($55); Metro Health + Fire.",
    "contactInfo": {
      "website": "https://www.nashville.gov/departments/transportation/permits/mobile-food-vendor",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Memphis",
    "type": "city",
    "city": "Memphis",
    "county": "Shelby",
    "state": "TN",
    "notes": "Shelby County Health Dept ($210-$360/yr).",
    "contactInfo": {
      "website": "https://shelbycountytn.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Knoxville",
    "type": "city",
    "city": "Knoxville",
    "county": "Knox",
    "state": "TN",
    "notes": "City MFU Permit: $200 initial, $50 renewal.",
    "contactInfo": {
      "website": "https://www.knoxvilletn.gov/government/city_departments_offices/Finance/business_license_tax_office/mobile_food_units",
      "phone": "(865) 215-2083",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Chattanooga",
    "type": "city",
    "city": "Chattanooga",
    "county": "Hamilton",
    "state": "TN",
    "notes": "Hamilton County Health Dept permit.",
    "contactInfo": {
      "website": "https://www.chattanooga.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Clarksville",
    "type": "city",
    "city": "Clarksville",
    "county": "Montgomery",
    "state": "TN",
    "notes": "Montgomery County Health Dept + TDA.",
    "contactInfo": {
      "website": "https://www.cityofclarksville.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Murfreesboro",
    "type": "city",
    "city": "Murfreesboro",
    "county": "Rutherford",
    "state": "TN",
    "notes": "Rutherford County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.murfreesborotn.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Detroit",
    "type": "city",
    "city": "Detroit",
    "county": "Wayne",
    "state": "MI",
    "notes": "Detroit Health Dept MFE/STFU licensing.",
    "contactInfo": {
      "website": "https://detroitmi.gov/departments/detroit-health-department/programs-and-services/food-safety/mobile-food-establishments-and-special-transitory-food-units",
      "phone": "(313) 596-3932",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Grand Rapids",
    "type": "city",
    "city": "Grand Rapids",
    "county": "Kent",
    "state": "MI",
    "notes": "Kent County Health Dept + City Clerk; Fire inspection.",
    "contactInfo": {
      "website": "https://www.grandrapidsmi.gov/",
      "phone": "(616) 456-3939",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Ann Arbor",
    "type": "city",
    "city": "Ann Arbor",
    "county": "Washtenaw",
    "state": "MI",
    "notes": "Washtenaw County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.a2gov.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lansing",
    "type": "city",
    "city": "Lansing",
    "county": "Ingham",
    "state": "MI",
    "notes": "Ingham County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.lansingmi.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Flint",
    "type": "city",
    "city": "Flint",
    "county": "Genesee",
    "state": "MI",
    "notes": "Genesee County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityofflint.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Kalamazoo",
    "type": "city",
    "city": "Kalamazoo",
    "county": "Kalamazoo",
    "state": "MI",
    "notes": "Kalamazoo County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.kalamazoocity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Seattle",
    "type": "city",
    "city": "Seattle",
    "county": "King",
    "state": "WA",
    "notes": "King County PH (Risk 1: $630, Risk 3: $1,260) + SFD fire.",
    "contactInfo": {
      "website": "https://kingcounty.gov/en/dept/dph/certificates-permits-licenses/food-business-permits/mobile-food-business-permit",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Spokane",
    "type": "city",
    "city": "Spokane",
    "county": "Spokane",
    "state": "WA",
    "notes": "Spokane Regional Health District + City license.",
    "contactInfo": {
      "website": "https://www.spokanecity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tacoma",
    "type": "city",
    "city": "Tacoma",
    "county": "Pierce",
    "state": "WA",
    "notes": "Tacoma-Pierce County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityoftacoma.org/",
      "phone": "(253) 649-1706",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Vancouver",
    "type": "city",
    "city": "Vancouver",
    "county": "Clark",
    "state": "WA",
    "notes": "Clark County Public Health + City license.",
    "contactInfo": {
      "website": "https://www.cityofvancouver.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bellevue",
    "type": "city",
    "city": "Bellevue",
    "county": "King",
    "state": "WA",
    "notes": "King County PH + City license.",
    "contactInfo": {
      "website": "https://bellevuewa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Olympia",
    "type": "city",
    "city": "Olympia",
    "county": "Thurston",
    "state": "WA",
    "notes": "Thurston County PH + City license.",
    "contactInfo": {
      "website": "https://www.olympiawa.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Portland",
    "type": "city",
    "city": "Portland",
    "county": "Multnomah",
    "state": "OR",
    "notes": "Multnomah County EH food cart ($760-$920); PBOT for public ROW.",
    "contactInfo": {
      "website": "https://multco.us/services/food-carts",
      "phone": "(503) 988-3400",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Salem",
    "type": "city",
    "city": "Salem",
    "county": "Marion",
    "state": "OR",
    "notes": "City MFU License + Marion County EH.",
    "contactInfo": {
      "website": "https://www.cityofsalem.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Eugene",
    "type": "city",
    "city": "Eugene",
    "county": "Lane",
    "state": "OR",
    "notes": "Lane County EH + City license.",
    "contactInfo": {
      "website": "https://www.eugene-or.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bend",
    "type": "city",
    "city": "Bend",
    "county": "Deschutes",
    "state": "OR",
    "notes": "Deschutes County EH + City license.",
    "contactInfo": {
      "website": "https://www.bendoregon.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Denver",
    "type": "city",
    "city": "Denver",
    "county": "Denver",
    "state": "CO",
    "notes": "Retail Food Mobile License; app $150, annual $100+ per process.",
    "contactInfo": {
      "website": "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Business-Licensing/Business-licenses/Retail-Food/Retail-food-mobile-license",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Colorado Springs",
    "type": "city",
    "city": "Colorado Springs",
    "county": "El Paso",
    "state": "CO",
    "notes": "City Clerk mobile food vendor license.",
    "contactInfo": {
      "website": "https://coloradosprings.gov/",
      "phone": "(719) 578-3199",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Aurora",
    "type": "city",
    "city": "Aurora",
    "county": "Arapahoe",
    "state": "CO",
    "notes": "Tri-County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.auroragov.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fort Collins",
    "type": "city",
    "city": "Fort Collins",
    "county": "Larimer",
    "state": "CO",
    "notes": "Larimer County EH + City license.",
    "contactInfo": {
      "website": "https://www.fcgov.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lakewood",
    "type": "city",
    "city": "Lakewood",
    "county": "Jefferson",
    "state": "CO",
    "notes": "Jefferson County Public Health + City license.",
    "contactInfo": {
      "website": "https://www.lakewood.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Boulder",
    "type": "city",
    "city": "Boulder",
    "county": "Boulder",
    "state": "CO",
    "notes": "Boulder County PH + City food truck license.",
    "contactInfo": {
      "website": "https://bouldercolorado.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Boston",
    "type": "city",
    "city": "Boston",
    "county": "Suffolk",
    "state": "MA",
    "notes": "Food Truck $500/yr (ISD) + Health $100 + Fire $150 + Biz $65.",
    "contactInfo": {
      "website": "https://www.boston.gov/",
      "phone": "(617) 635-3534",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Worcester",
    "type": "city",
    "city": "Worcester",
    "county": "Worcester",
    "state": "MA",
    "notes": "Local Board of Health + City license.",
    "contactInfo": {
      "website": "https://www.worcesterma.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Springfield",
    "type": "city",
    "city": "Springfield",
    "county": "Hampden",
    "state": "MA",
    "notes": "Local Board of Health + City license.",
    "contactInfo": {
      "website": "https://www.springfield-ma.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cambridge",
    "type": "city",
    "city": "Cambridge",
    "county": "Middlesex",
    "state": "MA",
    "notes": "Cambridge Public Health Dept + License Commission.",
    "contactInfo": {
      "website": "https://www.cambridgema.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Washington",
    "type": "city",
    "city": "Washington",
    "county": "District of Columbia",
    "state": "DC",
    "notes": "DLCP Vending License (Class A Food, 2yr) + DC Health + Mobile Site.",
    "contactInfo": {
      "website": "https://dlcp.dc.gov/page/vendinglicensingsteps",
      "phone": "(202) 442-5955",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Baltimore",
    "type": "city",
    "city": "Baltimore",
    "county": "Baltimore City",
    "state": "MD",
    "notes": "City Health Dept + DOT Mobile Vending Permit ($25).",
    "contactInfo": {
      "website": "https://transportation.baltimorecity.gov/street-and-mobile-vending",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Columbia",
    "type": "city",
    "city": "Columbia",
    "county": "Howard",
    "state": "MD",
    "notes": "Howard County Health Dept + County license.",
    "contactInfo": {
      "website": "https://www.howardcountymd.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Virginia Beach",
    "type": "city",
    "city": "Virginia Beach",
    "county": "Virginia Beach City",
    "state": "VA",
    "notes": "Peddler's $25 + Police solicitor + Biz License $50.",
    "contactInfo": {
      "website": "https://www.vbgov.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Norfolk",
    "type": "city",
    "city": "Norfolk",
    "county": "Norfolk City",
    "state": "VA",
    "notes": "Food Truck Vendor Program with designated zones.",
    "contactInfo": {
      "website": "https://www.norfolk.gov/2259/Food-Truck-Vendor-Program",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Richmond",
    "type": "city",
    "city": "Richmond",
    "county": "Richmond City",
    "state": "VA",
    "notes": "Richmond City Health District + City license.",
    "contactInfo": {
      "website": "https://www.rva.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Alexandria",
    "type": "city",
    "city": "Alexandria",
    "county": "Alexandria City",
    "state": "VA",
    "notes": "Mobile Food Truck Vendor Permit.",
    "contactInfo": {
      "website": "https://www.alexandriava.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Chesapeake",
    "type": "city",
    "city": "Chesapeake",
    "county": "Chesapeake City",
    "state": "VA",
    "notes": "VDH permit + City license.",
    "contactInfo": {
      "website": "https://www.cityofchesapeake.net/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Arlington",
    "type": "city",
    "city": "Arlington",
    "county": "Arlington",
    "state": "VA",
    "notes": "VDH permit + County license.",
    "contactInfo": {
      "website": "https://www.arlingtonva.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Las Vegas",
    "type": "city",
    "city": "Las Vegas",
    "county": "Clark",
    "state": "NV",
    "notes": "City License $150 + SNHD Health ($385-$660/yr) + Health Card + Fire.",
    "contactInfo": {
      "website": "https://www.lasvegasnevada.gov/",
      "phone": "(702) 759-1258",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Henderson",
    "type": "city",
    "city": "Henderson",
    "county": "Clark",
    "state": "NV",
    "notes": "SNHD health permit + Henderson license.",
    "contactInfo": {
      "website": "https://www.cityofhenderson.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Reno",
    "type": "city",
    "city": "Reno",
    "county": "Washoe",
    "state": "NV",
    "notes": "Northern Nevada Public Health + City license.",
    "contactInfo": {
      "website": "https://www.reno.gov/",
      "phone": "(775) 334-2090",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "North Las Vegas",
    "type": "city",
    "city": "North Las Vegas",
    "county": "Clark",
    "state": "NV",
    "notes": "SNHD health + City license.",
    "contactInfo": {
      "website": "https://www.cityofnorthlasvegas.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sparks",
    "type": "city",
    "city": "Sparks",
    "county": "Washoe",
    "state": "NV",
    "notes": "NNPH permits + City license.",
    "contactInfo": {
      "website": "https://www.cityofsparks.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Minneapolis",
    "type": "city",
    "city": "Minneapolis",
    "county": "Hennepin",
    "state": "MN",
    "notes": "City Mobile Food Vendor Vehicle License + ROW Permit.",
    "contactInfo": {
      "website": "https://www2.minneapolismn.gov/business-services/licenses-permits-inspections/business-licenses/food-restaurants/food-truck-cart/food-truck/",
      "phone": "(612) 673-2301",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "St. Paul",
    "type": "city",
    "city": "St. Paul",
    "county": "Ramsey",
    "state": "MN",
    "notes": "City DSI food vendor license + Ramsey County.",
    "contactInfo": {
      "website": "https://www.stpaul.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Rochester",
    "type": "city",
    "city": "Rochester",
    "county": "Olmsted",
    "state": "MN",
    "notes": "Olmsted County Health + City license.",
    "contactInfo": {
      "website": "https://www.rochestermn.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Duluth",
    "type": "city",
    "city": "Duluth",
    "county": "St. Louis",
    "state": "MN",
    "notes": "MDA/MDH license + City license.",
    "contactInfo": {
      "website": "https://duluthmn.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Milwaukee",
    "type": "city",
    "city": "Milwaukee",
    "county": "Milwaukee",
    "state": "WI",
    "notes": "Food Peddler + MFU License; Motorized $350.",
    "contactInfo": {
      "website": "https://city.milwaukee.gov/Health/Services-and-Programs/CEH/mobilefood",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Madison",
    "type": "city",
    "city": "Madison",
    "county": "Dane",
    "state": "WI",
    "notes": "PHMDC food vendor license.",
    "contactInfo": {
      "website": "https://publichealthmdc.com/",
      "phone": "(608) 242-6515",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Green Bay",
    "type": "city",
    "city": "Green Bay",
    "county": "Brown",
    "state": "WI",
    "notes": "Brown County Health Dept + City license.",
    "contactInfo": {
      "website": "https://greenbaywi.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Kansas City",
    "type": "city",
    "city": "Kansas City",
    "county": "Jackson",
    "state": "MO",
    "notes": "KC Health Dept food permit for mobile units.",
    "contactInfo": {
      "website": "https://www.kcmo.gov/city-hall/departments/health/food-permits-for-mobile-units-catering-farmers-markets-and-similar-vendors",
      "phone": "(816) 513-2491",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "St. Louis",
    "type": "city",
    "city": "St. Louis",
    "county": "St. Louis City",
    "state": "MO",
    "notes": "Street Dept Food Truck Permit $500/annual.",
    "contactInfo": {
      "website": "https://www.stlouis-mo.gov/government/departments/street/permits-inspections/vending/food-truck-permits.cfm",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Springfield",
    "type": "city",
    "city": "Springfield",
    "county": "Greene",
    "state": "MO",
    "notes": "Springfield-Greene County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.springfieldmo.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Columbia",
    "type": "city",
    "city": "Columbia",
    "county": "Boone",
    "state": "MO",
    "notes": "Columbia/Boone County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.como.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Indianapolis",
    "type": "city",
    "city": "Indianapolis",
    "county": "Marion",
    "state": "IN",
    "notes": "Marion County PH + DBNS Vendor Cart Licenses.",
    "contactInfo": {
      "website": "https://www.indy.gov/activity/vendor-cart-licenses",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fort Wayne",
    "type": "city",
    "city": "Fort Wayne",
    "county": "Allen",
    "state": "IN",
    "notes": "Fort Wayne-Allen County Health; Type I Hood + suppression.",
    "contactInfo": {
      "website": "https://www.cityoffortwayne.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "South Bend",
    "type": "city",
    "city": "South Bend",
    "county": "St. Joseph",
    "state": "IN",
    "notes": "St. Joseph County Health Dept MFT permit ($325-$375).",
    "contactInfo": {
      "website": "https://www.southbendin.gov/",
      "phone": "(574) 235-9721",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Evansville",
    "type": "city",
    "city": "Evansville",
    "county": "Vanderburgh",
    "state": "IN",
    "notes": "Peddler's Permit from City Controller.",
    "contactInfo": {
      "website": "https://www.evansvillegov.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Charleston",
    "type": "city",
    "city": "Charleston",
    "county": "Charleston",
    "state": "SC",
    "notes": "City Fire Dept + SCDA/DHEC state permit.",
    "contactInfo": {
      "website": "https://www.charleston-sc.gov/1969/Mobile-Food-Vendors",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Columbia",
    "type": "city",
    "city": "Columbia",
    "county": "Richland",
    "state": "SC",
    "notes": "City license + $10 zoning + DHEC; 100-ft restaurant buffer.",
    "contactInfo": {
      "website": "https://www.columbiasc.gov/",
      "phone": "(803) 545-3345",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Greenville",
    "type": "city",
    "city": "Greenville",
    "county": "Greenville",
    "state": "SC",
    "notes": "Mobile Food Vendor Permit + DHEC; 250-ft buffer.",
    "contactInfo": {
      "website": "https://www.greenvillesc.gov/329/Food-Trucks-Trailers",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Myrtle Beach",
    "type": "city",
    "city": "Myrtle Beach",
    "county": "Horry",
    "state": "SC",
    "notes": "DHEC state permit + City license.",
    "contactInfo": {
      "website": "https://www.cityofmyrtlebeach.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "New Orleans",
    "type": "city",
    "city": "New Orleans",
    "county": "Orleans",
    "state": "LA",
    "notes": "Total ~$655 (occupational + mayoralty + app/tax/id); ~100 permits.",
    "contactInfo": {
      "website": "https://nola.gov/food-truck-permit/",
      "phone": "(504) 658-1666",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Baton Rouge",
    "type": "city",
    "city": "Baton Rouge",
    "county": "East Baton Rouge",
    "state": "LA",
    "notes": "City-Parish Occupational License $200 + LDH.",
    "contactInfo": {
      "website": "https://www.brla.gov/",
      "phone": "(225) 242-4870",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Shreveport",
    "type": "city",
    "city": "Shreveport",
    "county": "Caddo",
    "state": "LA",
    "notes": "Caddo Parish Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.shreveportla.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lafayette",
    "type": "city",
    "city": "Lafayette",
    "county": "Lafayette",
    "state": "LA",
    "notes": "Lafayette Parish Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.lafayettela.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Louisville",
    "type": "city",
    "city": "Louisville",
    "county": "Jefferson",
    "state": "KY",
    "notes": "3-step: Fire > Codes > Metro Health; $200 app + $50/ID.",
    "contactInfo": {
      "website": "https://louisvilleky.gov/government/alcoholic-beverage-control/food-truck-mobile-vending-permit",
      "phone": "(502) 574-6650",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lexington",
    "type": "city",
    "city": "Lexington",
    "county": "Fayette",
    "state": "KY",
    "notes": "Lexington-Fayette County Health Dept.",
    "contactInfo": {
      "website": "https://www.lfchd.org/",
      "phone": "(859) 231-9791",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bowling Green",
    "type": "city",
    "city": "Bowling Green",
    "county": "Warren",
    "state": "KY",
    "notes": "Barren River Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.bgky.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Oklahoma City",
    "type": "city",
    "city": "Oklahoma City",
    "county": "Oklahoma",
    "state": "OK",
    "notes": "OCCHD Vehicle Food Sales ($100-$250); statewide OSDH Nov 2025+.",
    "contactInfo": {
      "website": "https://www.okc.gov/",
      "phone": "(405) 297-2606",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Tulsa",
    "type": "city",
    "city": "Tulsa",
    "county": "Tulsa",
    "state": "OK",
    "notes": "Mobile Vendor License $20 app + $30 license.",
    "contactInfo": {
      "website": "https://tulsa-health.org/permits-inspections/food/food-service-and-restaurant-industry-resources/mobile-food-vending/",
      "phone": "(918) 596-9456",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Norman",
    "type": "city",
    "city": "Norman",
    "county": "Cleveland",
    "state": "OK",
    "notes": "Cleveland County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.normanok.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Wichita",
    "type": "city",
    "city": "Wichita",
    "county": "Sedgwick",
    "state": "KS",
    "notes": "Mobile Food Vendor License per Chapter 3.15.",
    "contactInfo": {
      "website": "https://www.wichita.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Overland Park",
    "type": "city",
    "city": "Overland Park",
    "county": "Johnson",
    "state": "KS",
    "notes": "Johnson County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.opkansas.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Kansas City",
    "type": "city",
    "city": "Kansas City",
    "county": "Wyandotte",
    "state": "KS",
    "notes": "Unified Government/Wyandotte County Health.",
    "contactInfo": {
      "website": "https://www.wycokck.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Topeka",
    "type": "city",
    "city": "Topeka",
    "county": "Shawnee",
    "state": "KS",
    "notes": "Shawnee County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.topeka.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Omaha",
    "type": "city",
    "city": "Omaha",
    "county": "Douglas",
    "state": "NE",
    "notes": "Douglas County HD Sticker + City permit ($100/vehicle).",
    "contactInfo": {
      "website": "https://www.parkomaha.com/resources/mobile-food-vendor-permit",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Lincoln",
    "type": "city",
    "city": "Lincoln",
    "county": "Lancaster",
    "state": "NE",
    "notes": "Lincoln-Lancaster County HD + City Vendor Truck.",
    "contactInfo": {
      "website": "https://www.lincoln.ne.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Des Moines",
    "type": "city",
    "city": "Des Moines",
    "county": "Polk",
    "state": "IA",
    "notes": "City Clerk vendor + Iowa DIAL MF License + Fire.",
    "contactInfo": {
      "website": "https://www.dsm.city/",
      "phone": "(515) 283-4240",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cedar Rapids",
    "type": "city",
    "city": "Cedar Rapids",
    "county": "Linn",
    "state": "IA",
    "notes": "Linn County PH + DIAL + City permit.",
    "contactInfo": {
      "website": "https://www.cedar-rapids.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Salt Lake City",
    "type": "city",
    "city": "Salt Lake City",
    "county": "Salt Lake",
    "state": "UT",
    "notes": "SLC License + Salt Lake County HD Mobile Food Service.",
    "contactInfo": {
      "website": "https://www.saltlakecounty.gov/health/food-protection/permits/mobile/",
      "phone": "(385) 468-3845",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Provo",
    "type": "city",
    "city": "Provo",
    "county": "Utah",
    "state": "UT",
    "notes": "Utah County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.provo.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "West Valley City",
    "type": "city",
    "city": "West Valley City",
    "county": "Salt Lake",
    "state": "UT",
    "notes": "Salt Lake County HD + City license.",
    "contactInfo": {
      "website": "https://www.wvc-ut.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Ogden",
    "type": "city",
    "city": "Ogden",
    "county": "Weber",
    "state": "UT",
    "notes": "Weber-Morgan Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.ogdencity.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Albuquerque",
    "type": "city",
    "city": "Albuquerque",
    "county": "Bernalillo",
    "state": "NM",
    "notes": "City EHD Health $135/yr + Business registration $35/yr.",
    "contactInfo": {
      "website": "https://www.cabq.gov/environmentalhealth/food-safety/mobile-food-guide",
      "phone": "(505) 768-2738",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Las Cruces",
    "type": "city",
    "city": "Las Cruces",
    "county": "Dona Ana",
    "state": "NM",
    "notes": "NMED Retail Food Permit $100 + City license.",
    "contactInfo": {
      "website": "https://www.lascruces.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Santa Fe",
    "type": "city",
    "city": "Santa Fe",
    "county": "Santa Fe",
    "state": "NM",
    "notes": "NMED permit + City license.",
    "contactInfo": {
      "website": "https://www.santafenm.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Boise",
    "type": "city",
    "city": "Boise",
    "county": "Ada",
    "state": "ID",
    "notes": "Central District Health permit + Fire Dept permit.",
    "contactInfo": {
      "website": "https://www.cityofboise.org/",
      "phone": "(208) 570-6559",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Meridian",
    "type": "city",
    "city": "Meridian",
    "county": "Ada",
    "state": "ID",
    "notes": "Central District Health + City license.",
    "contactInfo": {
      "website": "https://meridiancity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Nampa",
    "type": "city",
    "city": "Nampa",
    "county": "Canyon",
    "state": "ID",
    "notes": "SW District Health + City license.",
    "contactInfo": {
      "website": "https://www.cityofnampa.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Honolulu",
    "type": "city",
    "city": "Honolulu",
    "county": "Honolulu",
    "state": "HI",
    "notes": "Peddler's License + DOH food establishment permit.",
    "contactInfo": {
      "website": "https://www.honolulu.gov/csd/food-truck-information-and-resources/",
      "phone": "(808) 768-9700",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Anchorage",
    "type": "city",
    "city": "Anchorage",
    "county": "Anchorage",
    "state": "AK",
    "notes": "Separate from state DEC; Anchorage FSS Program.",
    "contactInfo": {
      "website": "https://www.muni.org/",
      "phone": "(907) 343-4200",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fairbanks",
    "type": "city",
    "city": "Fairbanks",
    "county": "Fairbanks North Star",
    "state": "AK",
    "notes": "City license ($50) + state DEC permit.",
    "contactInfo": {
      "website": "https://www.fairbanksalaska.us/",
      "phone": "(907) 459-6720",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Birmingham",
    "type": "city",
    "city": "Birmingham",
    "county": "Jefferson",
    "state": "AL",
    "notes": "Jefferson County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.birminghamal.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Montgomery",
    "type": "city",
    "city": "Montgomery",
    "county": "Montgomery",
    "state": "AL",
    "notes": "Montgomery County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.montgomeryal.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Huntsville",
    "type": "city",
    "city": "Huntsville",
    "county": "Madison",
    "state": "AL",
    "notes": "Madison County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.huntsvilleal.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Mobile",
    "type": "city",
    "city": "Mobile",
    "county": "Mobile",
    "state": "AL",
    "notes": "Mobile County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.cityofmobile.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Jackson",
    "type": "city",
    "city": "Jackson",
    "county": "Hinds",
    "state": "MS",
    "notes": "MSDH Food Permit (plan review $224.25) + City license.",
    "contactInfo": {
      "website": "https://www.jacksonms.gov/",
      "phone": "(601) 364-2832",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Gulfport",
    "type": "city",
    "city": "Gulfport",
    "county": "Harrison",
    "state": "MS",
    "notes": "MSDH permit + City license.",
    "contactInfo": {
      "website": "https://www.gulfport-ms.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Little Rock",
    "type": "city",
    "city": "Little Rock",
    "county": "Pulaski",
    "state": "AR",
    "notes": "ADH permit (plan review 1% est cost, annual $35) + City license.",
    "contactInfo": {
      "website": "https://www.littlerock.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fayetteville",
    "type": "city",
    "city": "Fayetteville",
    "county": "Washington",
    "state": "AR",
    "notes": "ADH permit + City license.",
    "contactInfo": {
      "website": "https://www.fayetteville-ar.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Charleston",
    "type": "city",
    "city": "Charleston",
    "county": "Kanawha",
    "state": "WV",
    "notes": "Statewide MFE Permit (HB 5017); Street Vending $20.",
    "contactInfo": {
      "website": "https://www.charlestonwv.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Huntington",
    "type": "city",
    "city": "Huntington",
    "county": "Cabell",
    "state": "WV",
    "notes": "Mobile Food Vendor Permit $50.",
    "contactInfo": {
      "website": "https://www.cityofhuntington.com/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Newark",
    "type": "city",
    "city": "Newark",
    "county": "Essex",
    "state": "NJ",
    "notes": "Vendor license May 1-Apr 30 period.",
    "contactInfo": {
      "website": "https://peddlerlicense.newarkportal.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Jersey City",
    "type": "city",
    "city": "Jersey City",
    "county": "Hudson",
    "state": "NJ",
    "notes": "Vendor licenses capped; waitlist possible.",
    "contactInfo": {
      "website": "https://www.jerseycitynj.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Paterson",
    "type": "city",
    "city": "Paterson",
    "county": "Passaic",
    "state": "NJ",
    "notes": "City vendor license + Passaic County health.",
    "contactInfo": {
      "website": "https://www.patersonnj.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Trenton",
    "type": "city",
    "city": "Trenton",
    "county": "Mercer",
    "state": "NJ",
    "notes": "Mercer County health + City license.",
    "contactInfo": {
      "website": "https://www.trentonnj.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Elizabeth",
    "type": "city",
    "city": "Elizabeth",
    "county": "Union",
    "state": "NJ",
    "notes": "Union County health + City license.",
    "contactInfo": {
      "website": "https://www.elizabethnj.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Hartford",
    "type": "city",
    "city": "Hartford",
    "county": "Hartford",
    "state": "CT",
    "notes": "IFVE license; reciprocal since Nov 2022.",
    "contactInfo": {
      "website": "https://www.hartfordct.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "New Haven",
    "type": "city",
    "city": "New Haven",
    "county": "New Haven",
    "state": "CT",
    "notes": "New Haven Health Dept IFVE license.",
    "contactInfo": {
      "website": "https://www.newhavenct.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Stamford",
    "type": "city",
    "city": "Stamford",
    "county": "Fairfield",
    "state": "CT",
    "notes": "Stamford Health Dept IFVE license.",
    "contactInfo": {
      "website": "https://www.stamfordct.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bridgeport",
    "type": "city",
    "city": "Bridgeport",
    "county": "Fairfield",
    "state": "CT",
    "notes": "Bridgeport Health Dept IFVE license.",
    "contactInfo": {
      "website": "https://www.bridgeportct.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Providence",
    "type": "city",
    "city": "Providence",
    "county": "Providence",
    "state": "RI",
    "notes": "RIDOH ($100) + DBR MFE Registration + State Fire Marshal.",
    "contactInfo": {
      "website": "https://www.providenceri.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Wilmington",
    "type": "city",
    "city": "Wilmington",
    "county": "New Castle",
    "state": "DE",
    "notes": "No license cost; daily use fee $22/day.",
    "contactInfo": {
      "website": "https://www.wilmingtonde.gov/business/foodtrucks",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Nashua",
    "type": "city",
    "city": "Nashua",
    "county": "Hillsborough",
    "state": "NH",
    "notes": "Plan Review $125 + Annual Mobile $200 + Hawkers $100.",
    "contactInfo": {
      "website": "https://nashuanh.gov/1498/Mobile-Food-Service-Vendors",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Manchester",
    "type": "city",
    "city": "Manchester",
    "county": "Hillsborough",
    "state": "NH",
    "notes": "DHHS Food Service License + City license.",
    "contactInfo": {
      "website": "https://www.manchesternh.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Burlington",
    "type": "city",
    "city": "Burlington",
    "county": "Chittenden",
    "state": "VT",
    "notes": "VT DOH Commercial Caterer License ($260/yr) + City permit.",
    "contactInfo": {
      "website": "https://www.burlingtonvt.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Portland",
    "type": "city",
    "city": "Portland",
    "county": "Cumberland",
    "state": "ME",
    "notes": "Municipal-only license; DHHS HIP ($25-$500).",
    "contactInfo": {
      "website": "https://www.portlandmaine.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Fargo",
    "type": "city",
    "city": "Fargo",
    "county": "Cass",
    "state": "ND",
    "notes": "Fargo-Cass Public Health + City license.",
    "contactInfo": {
      "website": "https://fargond.gov/",
      "phone": "(701) 476-6729",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Bismarck",
    "type": "city",
    "city": "Bismarck",
    "county": "Burleigh",
    "state": "ND",
    "notes": "Bismarck-Burleigh PH + City license.",
    "contactInfo": {
      "website": "https://www.bismarcknd.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Sioux Falls",
    "type": "city",
    "city": "Sioux Falls",
    "county": "Minnehaha",
    "state": "SD",
    "notes": "Peddler/Mobile Food Vendor License + SD DOH.",
    "contactInfo": {
      "website": "https://www.siouxfalls.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Rapid City",
    "type": "city",
    "city": "Rapid City",
    "county": "Pennington",
    "state": "SD",
    "notes": "SD DOH permit + City license.",
    "contactInfo": {
      "website": "https://www.rcgov.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Billings",
    "type": "city",
    "city": "Billings",
    "county": "Yellowstone",
    "state": "MT",
    "notes": "Yellowstone County/City Health Dept.",
    "contactInfo": {
      "website": "https://www.billingsmt.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Missoula",
    "type": "city",
    "city": "Missoula",
    "county": "Missoula",
    "state": "MT",
    "notes": "Missoula County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.ci.missoula.mt.us/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Cheyenne",
    "type": "city",
    "city": "Cheyenne",
    "county": "Laramie",
    "state": "WY",
    "notes": "Cheyenne-Laramie County Health Dept.",
    "contactInfo": {
      "website": "https://www.cheyennecity.org/",
      "phone": "",
      "email": "",
      "address": ""
    }
  },
  {
    "name": "Casper",
    "type": "city",
    "city": "Casper",
    "county": "Natrona",
    "state": "WY",
    "notes": "Natrona County Health Dept + City license.",
    "contactInfo": {
      "website": "https://www.casperwy.gov/",
      "phone": "",
      "email": "",
      "address": ""
    }
  }
];

async function main() {
  console.log("\n=== PermitWise - Seed Jurisdictions ===");
  console.log("Connecting to: " + MONGODB_URI.replace(/\/\/[^@]+@/, "//***:***@"));

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const before = await Jurisdiction.countDocuments();
  console.log("Existing jurisdictions in DB: " + before);
  console.log("Jurisdictions to upsert: " + jurisdictions.length + "\n");

  let created = 0, updated = 0, errors = 0;

  for (const j of jurisdictions) {
    try {
      const result = await Jurisdiction.findOneAndUpdate(
        { city: j.city, state: j.state },
        { $set: { ...j, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true, rawResult: true }
      );
      if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
        updated++;
      } else {
        created++;
      }
    } catch (err) {
      errors++;
      console.error("  ERROR upserting " + j.name + ", " + j.state + ": " + err.message);
    }
  }

  const after = await Jurisdiction.countDocuments();
  const stateCount = await Jurisdiction.distinct("state");

  console.log("--- Results ---");
  console.log("Created: " + created);
  console.log("Updated: " + updated);
  console.log("Errors:  " + errors);
  console.log("Total jurisdictions in DB: " + after);
  console.log("States covered: " + stateCount.length + " (" + stateCount.sort().join(", ") + ")");

  // Quick sample
  const sample = await Jurisdiction.find().limit(5).select("name city state");
  console.log("\nSample:");
  sample.forEach(function(j) { console.log("  " + j.name + " (" + j.city + ", " + j.state + ")"); });

  await mongoose.disconnect();
  console.log("\nDone! Next: run  node seed_permit_library.js\n");
}

main()
  .then(function() { process.exit(0); })
  .catch(function(err) { console.error("FATAL: " + err.message); process.exit(1); });
