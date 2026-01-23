// seeds/seed_events.js
// Seed representative food-vendor events for PermitWise
// Run once, then remove or disable.

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// --- Adjust this if your connection string lives elsewhere ---
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/permitwise';

// Import models by requiring server.js so schemas are registered
require('../server');
const Event = mongoose.model('Event');
const Jurisdiction = mongoose.model('Jurisdiction');
const PermitType = mongoose.model('PermitType');

// Helper: build date in the current or next year
const thisYear = new Date().getFullYear();
const nextYear = thisYear + 1;
const makeDate = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 15, 0, 0));

// We’ll seed a few flagship / high-signal events per jurisdiction.
// requiredPermitNames MUST match your existing PermitType.name values
// as defined in your permit seeds / exports.

const RAW_EVENTS = [
  // =====================================
  // AUSTIN, TX
  // =====================================
  {
    city: 'Austin',
    state: 'TX',
    organizerName: 'Austin Street Food Alliance',
    organizerContact: {
      email: 'events@austinstreetfood.org',
      website: 'https://austintexas.gov'
    },
    eventName: 'Austin Food Truck Roundup',
    description:
      'Large downtown food truck festival featuring 40+ trucks, live music, and family activities.',
    venueName: 'Republic Square Park',
    address: '422 Guadalupe St, Austin, TX 78701',
    startDate: makeDate(nextYear, 4, 12),
    endDate: makeDate(nextYear, 4, 14),
    eventType: 'food_event',
    vendorSpots: 60,
    vendorFee: 450,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      // From your Austin permit library:contentReference[oaicite:2]{index=2}
      'Mobile Food Vendor Permit',
      'City of Austin Business License',
      'Fire Marshal Inspection Certificate',
      'Food Manager Certification'
    ]
  },
  {
    city: 'Austin',
    state: 'TX',
    organizerName: 'Austin Night Market Co.',
    organizerContact: {
      email: 'info@atxnightmarket.com'
    },
    eventName: 'East Side Night Market',
    description:
      'Monthly night market with rotating food trucks, craft vendors, and live DJs.',
    venueName: 'East 6th Street Corridor',
    address: 'E 6th St & Chicon St, Austin, TX',
    startDate: makeDate(nextYear, 5, 3),
    endDate: makeDate(nextYear, 5, 3),
    eventType: 'night_market',
    vendorSpots: 30,
    vendorFee: 225,
    requiredVendorTypes: ['food_truck', 'tent_vendor', 'craft_vendor'],
    requiredPermitNames: [
      'Mobile Food Vendor Permit',
      'City of Austin Business License',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // DALLAS, TX
  // (matches your Dallas seeds in server.js):contentReference[oaicite:3]{index=3}
  // =====================================
  {
    city: 'Dallas',
    state: 'TX',
    organizerName: 'Dallas Food Truck Association',
    organizerContact: {
      email: 'events@dallasfta.org'
    },
    eventName: 'Dallas Food Truck & Music Festival',
    description:
      'Signature food truck festival with music, beer garden, and family zone.',
    venueName: 'Klyde Warren Park',
    address: '2012 Woodall Rodgers Fwy, Dallas, TX 75201',
    startDate: makeDate(nextYear, 3, 21),
    endDate: makeDate(nextYear, 3, 23),
    eventType: 'food_event',
    vendorSpots: 75,
    vendorFee: 500,
    requiredVendorTypes: ['food_truck', 'mobile_bartender', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Unit Permit',
      'Business License',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // DENVER, CO
  // (matches Denver sample permits in server.js):contentReference[oaicite:4]{index=4}
  // =====================================
  {
    city: 'Denver',
    state: 'CO',
    organizerName: 'Denver Street Eats',
    organizerContact: {
      email: 'hello@denverstreeteats.com'
    },
    eventName: 'Denver Summer Food Truck Rally',
    description:
      'Downtown rally showcasing Colorado-based food trucks and pop-up vendors.',
    venueName: 'Civic Center Park',
    address: '101 W 14th Ave, Denver, CO 80204',
    startDate: makeDate(nextYear, 6, 7),
    endDate: makeDate(nextYear, 6, 9),
    eventType: 'food_event',
    vendorSpots: 55,
    vendorFee: 400,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Establishment License',
      'Denver Business License'
    ]
  },

  // =====================================
  // MIAMI, FL (Miami / Miami-Dade):contentReference[oaicite:5]{index=5}
  // =====================================
  {
    city: 'Miami',
    state: 'FL',
    organizerName: 'Miami Street Food Fest, LLC',
    organizerContact: {
      email: 'info@miamistreetfoodfest.com'
    },
    eventName: 'Wynwood Food Truck Fest',
    description:
      'Art district food truck festival featuring Latin, Caribbean, and fusion trucks.',
    venueName: 'Wynwood Marketplace',
    address: '2250 NW 2nd Ave, Miami, FL 33127',
    startDate: makeDate(nextYear, 2, 15),
    endDate: makeDate(nextYear, 2, 16),
    eventType: 'food_event',
    vendorSpots: 50,
    vendorFee: 425,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Dispensing Vehicle (MFDV) License',
      'Miami-Dade Business Tax Receipt',
      'City of Miami Local Business Tax Receipt',
      'Fire Inspection Certificate',
      'Commissary / Service Area Agreement'
    ]
  },

  // =====================================
  // NEW YORK CITY, NY
  // Uses your NYC permits from seed.js (names must match that file).
  // =====================================
  {
    city: 'New York',
    state: 'NY',
    organizerName: 'NYC Street Food Collective',
    organizerContact: {
      email: 'events@nycstreetfood.org'
    },
    eventName: 'NYC Street Eats Festival',
    description:
      'Curated lineup of licensed food carts and trucks along a closed Manhattan street.',
    venueName: 'Hudson River Park',
    address: '555 12th Ave, New York, NY 10036',
    startDate: makeDate(nextYear, 5, 24),
    endDate: makeDate(nextYear, 5, 26),
    eventType: 'food_event',
    vendorSpots: 80,
    vendorFee: 650,
    requiredVendorTypes: ['food_truck', 'food_cart'],
    requiredPermitNames: [
      'Mobile Food Vendor Permit',
      'Mobile Food Vendor License (Personal License)',
      'NYC Vendor Vehicle Inspection',
      'NYC Fire Dept Propane Permit',
      'Commissary Letter',
      'Worker’s Comp Insurance'
    ]
  },

  // =====================================
  // PHILADELPHIA, PA
  // =====================================
  {
    city: 'Philadelphia',
    state: 'PA',
    organizerName: 'Philly Night Market',
    organizerContact: {
      email: 'info@phillynightmarket.org'
    },
    eventName: 'Center City Night Market',
    description:
      'Rotating night market series featuring Philly-based food trucks and carts.',
    venueName: 'Market Street Corridor',
    address: '1300 Market St, Philadelphia, PA 19107',
    startDate: makeDate(nextYear, 6, 20),
    endDate: makeDate(nextYear, 6, 20),
    eventType: 'night_market',
    vendorSpots: 60,
    vendorFee: 350,
    requiredVendorTypes: ['food_truck', 'tent_vendor', 'food_cart'],
    requiredPermitNames: [
      'Philadelphia Commercial Activity License',
      'Philadelphia Food License',
      'Temporary Food Facility Permit',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // PITTSBURGH, PA
  // =====================================
  {
    city: 'Pittsburgh',
    state: 'PA',
    organizerName: 'Pittsburgh Food Truck Park',
    organizerContact: {
      email: 'events@pghfoodtruckpark.com'
    },
    eventName: 'Pittsburgh Riverfront Food Truck Rally',
    description:
      'Seasonal riverfront event featuring local trucks, craft beer, and music.',
    venueName: 'The Terminal - Strip District',
    address: '2401 Smallman St, Pittsburgh, PA 15222',
    startDate: makeDate(nextYear, 7, 12),
    endDate: makeDate(nextYear, 7, 13),
    eventType: 'food_event',
    vendorSpots: 40,
    vendorFee: 325,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Facility Permit',
      'Pittsburgh Business License',
      'Fire Marshal Inspection Certificate',
      'Temporary Food Facility Permit'
    ]
  },

  // =====================================
  // “BACK MOUNTAIN” / DALLAS TOWNSHIP, PA
  // (matches your Luzerne County-style permits):contentReference[oaicite:6]{index=6}
  // =====================================
  {
    city: 'Dallas',
    state: 'PA',
    organizerName: 'Dallas Harvest Festival Committee',
    organizerContact: {
      email: 'dallasfest@backmountain.org'
    },
    eventName: 'Back Mountain Harvest Food & Craft Fair',
    description:
      'Local harvest festival with food trucks, tent vendors, and craft booths for Luzerne County area.',
    venueName: 'Downtown Dallas Borough',
    address: 'Main St, Dallas, PA 18612',
    startDate: makeDate(nextYear, 9, 28),
    endDate: makeDate(nextYear, 9, 28),
    eventType: 'fair',
    vendorSpots: 45,
    vendorFee: 175,
    requiredVendorTypes: ['food_truck', 'tent_vendor', 'craft_vendor'],
    requiredPermitNames: [
      'Temporary Food Facility Permit',
      'Business License',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // PORTLAND, OR
  // =====================================
  {
    city: 'Portland',
    state: 'OR',
    organizerName: 'Portland Food Cart Alliance',
    organizerContact: {
      email: 'events@pdxfoodcarts.org'
    },
    eventName: 'Portland Food Cart & Beer Garden Fest',
    description:
      'Big summer gathering of Portland food carts, breweries, and live music.',
    venueName: 'Tom McCall Waterfront Park',
    address: '98 SW Naito Pkwy, Portland, OR 97204',
    startDate: makeDate(nextYear, 8, 16),
    endDate: makeDate(nextYear, 8, 18),
    eventType: 'food_event',
    vendorSpots: 70,
    vendorFee: 475,
    requiredVendorTypes: ['food_truck', 'food_cart', 'tent_vendor'],
    requiredPermitNames: [
      'Temporary Restaurant License',
      'Portland Business License',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // PHOENIX, AZ
  // =====================================
  {
    city: 'Phoenix',
    state: 'AZ',
    organizerName: 'Phoenix Food Truck Coalition',
    organizerContact: {
      email: 'info@phxftc.org'
    },
    eventName: 'Phoenix Desert Food Truck Fest',
    description:
      'Outdoor food truck festival with shade tents, misters, and family activities.',
    venueName: 'Steele Indian School Park',
    address: '300 E Indian School Rd, Phoenix, AZ 85012',
    startDate: makeDate(nextYear, 10, 11),
    endDate: makeDate(nextYear, 10, 12),
    eventType: 'food_event',
    vendorSpots: 55,
    vendorFee: 375,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Maricopa County Mobile Food Permit',
      'Phoenix Business License',
      'Fire Marshal Inspection Certificate'
    ]
  },

  // =====================================
  // LOS ANGELES, CA
  // =====================================
  {
    city: 'Los Angeles',
    state: 'CA',
    organizerName: 'LA Street Food Project',
    organizerContact: {
      email: 'events@lastreetfood.org'
    },
    eventName: 'LA Street Food Night Market',
    description:
      'Downtown LA night market with trucks, pop-ups, and live performances.',
    venueName: 'Grand Park',
    address: '200 N Grand Ave, Los Angeles, CA 90012',
    startDate: makeDate(nextYear, 7, 19),
    endDate: makeDate(nextYear, 7, 20),
    eventType: 'night_market',
    vendorSpots: 80,
    vendorFee: 600,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'LA County Mobile Food Facility Permit',
      'City of Los Angeles Business Tax Registration',
      'Temporary Food Facility Permit',
      'Fire Department Fire Safety Permit'
    ]
  },

  // =====================================
  // TAMPA, FL
  // =====================================
  {
    city: 'Tampa',
    state: 'FL',
    organizerName: 'Tampa Bay Food Truck Rally',
    organizerContact: {
      email: 'info@tbftr.com'
    },
    eventName: 'Tampa Bay Food Truck Rally',
    description:
      'Regional rally drawing trucks from across Tampa Bay with live music and activities.',
    venueName: 'Downtown Tampa Riverwalk',
    address: '600 N Ashley Dr, Tampa, FL 33602',
    startDate: makeDate(nextYear, 4, 26),
    endDate: makeDate(nextYear, 4, 27),
    eventType: 'food_event',
    vendorSpots: 60,
    vendorFee: 400,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Dispensing Vehicle (MFDV) License',
      'Hillsborough County Business Tax Receipt',
      'City of Tampa Business Tax Receipt',
      'Fire Inspection Certificate'
    ]
  },

  // =====================================
  // NASHVILLE, TN
  // =====================================
  {
    city: 'Nashville',
    state: 'TN',
    organizerName: 'Nashville Food Truck Association',
    organizerContact: {
      email: 'events@nfta.org'
    },
    eventName: 'Nashville Food Truck & Live Music Fest',
    description:
      'Music City style festival combining food trucks and local bands.',
    venueName: 'Riverfront Park',
    address: '100 1st Ave N, Nashville, TN 37201',
    startDate: makeDate(nextYear, 9, 6),
    endDate: makeDate(nextYear, 9, 7),
    eventType: 'food_event',
    vendorSpots: 50,
    vendorFee: 375,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
    requiredPermitNames: [
      'Mobile Food Vendor Permit',
      'Nashville Business License',
      'Fire Marshal Inspection Certificate',
      'Temporary Food Service Permit'
    ]
  },
    // =====================================
  // FARMERS MARKETS / PRODUCE + FOOD
  // =====================================
  {
    city: 'Lancaster',
    state: 'PA',
    organizerName: 'Lancaster Central Market Assoc.',
    organizerContact: {
      email: 'info@lancastercentralmarket.org',
      website: 'https://www.centralmarketlancaster.com'
    },
    eventName: 'Lancaster Farm & Produce Market Day',
    description:
      'Weekly farmers market featuring local produce, baked goods, small-batch foods, and prepared food vendors.',
    venueName: 'Central Market District',
    address: '23 N Market St, Lancaster, PA 17603',
    startDate: makeDate(nextYear, 5, 4),
    endDate: makeDate(nextYear, 5, 4),
    eventType: 'farmers_market',
    vendorSpots: 40,
    vendorFee: 90,
    requiredVendorTypes: ['farmers_market', 'tent_vendor', 'food_truck'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate',
      'Food Safety Certification (Manager/Handler)',
      'Commissary / Service Area Agreement (if required)'
    ]
  },
  {
    city: 'Allentown',
    state: 'PA',
    organizerName: 'Allentown Open-Air Market',
    organizerContact: {
      email: 'hello@allentownmarket.org'
    },
    eventName: 'Allentown Saturday Farmers Market',
    description:
      'Open-air weekly farmers market with produce, honey, jams, and prepared foods.',
    venueName: 'Downtown Market Square',
    address: '50 Market St, Allentown, PA 18101',
    startDate: makeDate(nextYear, 6, 7),
    endDate: makeDate(nextYear, 6, 7),
    eventType: 'farmers_market',
    vendorSpots: 30,
    vendorFee: 75,
    requiredVendorTypes: ['farmers_market', 'tent_vendor'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate',
      'Food Safety Certification (Manager/Handler)'
    ]
  },
  {
    city: 'Portland',
    state: 'OR',
    organizerName: 'Portland Farmers Market',
    organizerContact: {
      email: 'info@portlandfarmersmarket.org',
      website: 'https://www.portlandfarmersmarket.org'
    },
    eventName: 'Portland Downtown Farmers Market',
    description:
      'Portland farmers market with local farms, bakeries, coffee, and hot prepared foods.',
    venueName: 'Portland State University Park Blocks',
    address: '1803 SW Park Ave, Portland, OR 97201',
    startDate: makeDate(nextYear, 5, 10),
    endDate: makeDate(nextYear, 5, 10),
    eventType: 'farmers_market',
    vendorSpots: 55,
    vendorFee: 110,
    requiredVendorTypes: ['farmers_market', 'tent_vendor', 'food_truck'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate',
      'Food Safety Certification (Manager/Handler)',
      'Commissary / Service Area Agreement (if required)',
      'Fire Safety Inspection (if using propane/generators)'
    ]
  },
  {
    city: 'Phoenix',
    state: 'AZ',
    organizerName: 'Phoenix Urban Farm Markets',
    organizerContact: {
      email: 'markets@phxurbanfarm.org'
    },
    eventName: 'Phoenix Sunday Farmers & Artisan Market',
    description:
      'Sunday market mixing small farms, hot food vendors, and select artisan products.',
    venueName: 'Downtown Phoenix Plaza',
    address: '1 E Washington St, Phoenix, AZ 85004',
    startDate: makeDate(nextYear, 3, 16),
    endDate: makeDate(nextYear, 3, 16),
    eventType: 'farmers_market',
    vendorSpots: 45,
    vendorFee: 95,
    requiredVendorTypes: ['farmers_market', 'tent_vendor', 'food_truck'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate',
      'Food Safety Certification (Manager/Handler)',
      'Commissary / Service Area Agreement (if required)',
      'Fire Safety Inspection (if using propane/generators)'
    ]
  },
    // =====================================
  // NON-FOOD HEAVY CRAFT / RETAIL FAIRS
  // =====================================
  {
    city: 'Dallas',
    state: 'TX',
    organizerName: 'Dallas Makers Guild',
    organizerContact: {
      email: 'info@dallasmakersguild.org'
    },
    eventName: 'Dallas Handmade & Vintage Market',
    description:
      'Indoor/outdoor craft and vintage fair with limited packaged snack vendors.',
    venueName: 'Dallas Convention Center Plaza',
    address: '650 S Griffin St, Dallas, TX 75202',
    startDate: makeDate(nextYear, 11, 8),
    endDate: makeDate(nextYear, 11, 9),
    eventType: 'craft_show',
    vendorSpots: 80,
    vendorFee: 300,
    requiredVendorTypes: ['craft_vendor', 'mobile_retail', 'other'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate'
    ]
  },
  {
    city: 'Los Angeles',
    state: 'CA',
    organizerName: 'LA Makers Collective',
    organizerContact: {
      email: 'hello@lamakerscollective.com'
    },
    eventName: 'LA Indie Makers & Design Fair',
    description:
      'Curated maker fair focusing on apparel, jewelry, home goods, and art prints, with limited pre-packaged food vendors.',
    venueName: 'LA State Historic Park',
    address: '1245 N Spring St, Los Angeles, CA 90012',
    startDate: makeDate(nextYear, 10, 4),
    endDate: makeDate(nextYear, 10, 5),
    eventType: 'craft_show',
    vendorSpots: 100,
    vendorFee: 425,
    requiredVendorTypes: ['craft_vendor', 'mobile_retail', 'pop_up_shop'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate'
    ]
  },
  {
    city: 'Nashville',
    state: 'TN',
    organizerName: 'Nashville Makers Market',
    organizerContact: {
      email: 'events@nashvillemakersmarket.com'
    },
    eventName: 'Nashville Artisan & Handmade Market',
    description:
      'Local artisans, leather goods, prints, candles, and boutique pop-ups; one small area for coffee/snacks.',
    venueName: 'Nashville Farmers Market Pavilion',
    address: '900 Rosa L Parks Blvd, Nashville, TN 37208',
    startDate: makeDate(nextYear, 4, 19),
    endDate: makeDate(nextYear, 4, 19),
    eventType: 'craft_show',
    vendorSpots: 60,
    vendorFee: 225,
    requiredVendorTypes: ['craft_vendor', 'mobile_retail', 'other'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate'
      // Any food vendors would separately be flagged by the organizer,
      // but the core fair requirement is mostly non-food.
    ]
  },
  {
    city: 'Portland',
    state: 'OR',
    organizerName: 'Portland Craft & Design Fair',
    organizerContact: {
      email: 'info@pdxcraftdesign.com'
    },
    eventName: 'Portland Craft & Design Fair',
    description:
      'Design-focused craft fair: ceramics, textiles, prints, and handmade goods, with one small food court zone.',
    venueName: 'Oregon Convention Center',
    address: '777 NE Martin Luther King Jr Blvd, Portland, OR 97232',
    startDate: makeDate(nextYear, 11, 15),
    endDate: makeDate(nextYear, 11, 16),
    eventType: 'craft_show',
    vendorSpots: 90,
    vendorFee: 350,
    requiredVendorTypes: ['craft_vendor', 'mobile_retail', 'other'],
    requiredPermitNames: [
      'General Business License / Registration',
      'State Sales / Use Tax Permit',
      'Liability Insurance Certificate'
    ]
  }
];

async function seedEvents() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for event seeding');

  for (const raw of RAW_EVENTS) {
    try {
      // Find jurisdiction by city/state (case-insensitive on city)
      const jurisdiction = await Jurisdiction.findOne({
        city: new RegExp(`^${raw.city}$`, 'i'),
        state: raw.state
      });

      if (!jurisdiction) {
        console.warn(
          `⚠️  No jurisdiction found for ${raw.city}, ${raw.state}. Skipping event "${raw.eventName}".`
        );
        continue;
      }

      // Find permit types by name within that jurisdiction
      const permitTypes = await PermitType.find({
        jurisdictionId: jurisdiction._id,
        name: { $in: raw.requiredPermitNames }
      });

      if (permitTypes.length === 0) {
        console.warn(
          `⚠️  No matching PermitType docs for event "${raw.eventName}" in ${raw.city}, ${raw.state}. Check permit names.`
        );
      } else if (permitTypes.length < raw.requiredPermitNames.length) {
        console.warn(
          `⚠️  Partial permit match for "${raw.eventName}" in ${raw.city}, ${raw.state}. ` +
            `Found ${permitTypes.length}/${raw.requiredPermitNames.length}.`
        );
      }

      const existing = await Event.findOne({
        'location.city': raw.city,
        'location.state': raw.state,
        eventName: raw.eventName
      });

      const eventDoc = {
        organizerId: null, // seeded as system event, organizer can be added later
        organizerName: raw.organizerName,
        organizerContact: raw.organizerContact,
        eventName: raw.eventName,
        description: raw.description,
        location: {
          venueName: raw.venueName,
          address: raw.address,
          city: raw.city,
          state: raw.state
        },
        startDate: raw.startDate,
        endDate: raw.endDate,
        eventType: raw.eventType,
        requiredVendorTypes: raw.requiredVendorTypes,
        requiredPermitTypes: permitTypes.map((pt) => pt._id),
        vendorSpots: raw.vendorSpots,
        vendorFee: raw.vendorFee,
        applicationDeadline: new Date(
          raw.startDate.getTime() - 1000 * 60 * 60 * 24 * 30
        ), // 30 days before start
        status: 'published'
      };

      if (existing) {
        await Event.updateOne({ _id: existing._id }, eventDoc);
        console.log(`✅ Updated existing event: ${raw.eventName} (${raw.city}, ${raw.state})`);
      } else {
        await Event.create(eventDoc);
        console.log(`✅ Created event: ${raw.eventName} (${raw.city}, ${raw.state})`);
      }
    } catch (err) {
      console.error(`❌ Error seeding event "${raw.eventName}":`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done seeding events, connection closed.');
}

seedEvents()
  .then(() => {
    console.log('Event seeding completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Event seeding failed:', err);
    process.exit(1);
  });
