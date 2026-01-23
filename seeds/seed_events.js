// seeds/seed_events.js
// Simple, robust event seeder that uses your existing Mongoose models
// and dynamically assigns required permits based on jurisdiction + vendor types.

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Boot your existing server models (this registers all schemas)
require('../server');

const Event = mongoose.model('Event');
const Jurisdiction = mongoose.model('Jurisdiction');
const PermitType = mongoose.model('PermitType');

// Helper: date creator
const thisYear = new Date().getFullYear();
const nextYear = thisYear + 1;
const makeDate = (year, month, day) =>
  new Date(Date.UTC(year, month - 1, day, 15, 0, 0));

// NOTE: We now match jurisdictions by BOTH `name` and `city/state` to avoid mismatch.
// `jurisdictionName` should match the `name` field in your Jurisdiction seeds
// (e.g., "Austin, TX", "Dallas Township, PA", "Miami, FL", etc.).

const RAW_EVENTS = [
  {
    jurisdictionName: 'Austin, TX',
    city: 'Austin',
    state: 'TX',
    organizerName: 'Austin Street Food Alliance',
    organizerContact: { email: 'events@austinstreetfood.org' },
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
  },
  {
    jurisdictionName: 'Austin, TX',
    city: 'Austin',
    state: 'TX',
    organizerName: 'Austin Night Market Co.',
    organizerContact: { email: 'info@atxnightmarket.com' },
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
  },

  // Dallas / DFW area
  {
    jurisdictionName: 'Dallas, TX',
    city: 'Dallas',
    state: 'TX',
    organizerName: 'Dallas Food Truck Association',
    organizerContact: { email: 'events@dallasfta.org' },
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
  },

  // Back Mountain / Dallas Township, PA
  {
    jurisdictionName: 'Dallas Township, PA',
    city: 'Dallas Township',
    state: 'PA',
    organizerName: 'Dallas Harvest Festival Committee',
    organizerContact: { email: 'dallasfest@backmountain.org' },
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
  },

  // Miami, FL
  {
    jurisdictionName: 'Miami, FL',
    city: 'Miami',
    state: 'FL',
    organizerName: 'Miami Street Food Fest, LLC',
    organizerContact: { email: 'info@miamistreetfoodfest.com' },
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
  },

  // NYC
  {
    jurisdictionName: 'New York City, NY',
    city: 'New York',
    state: 'NY',
    organizerName: 'NYC Street Food Collective',
    organizerContact: { email: 'events@nycstreetfood.org' },
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
  },

  // Philadelphia
  {
    jurisdictionName: 'Philadelphia, PA',
    city: 'Philadelphia',
    state: 'PA',
    organizerName: 'Philly Night Market',
    organizerContact: { email: 'info@phillynightmarket.org' },
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
  },

  // Pittsburgh
  {
    jurisdictionName: 'Pittsburgh, PA',
    city: 'Pittsburgh',
    state: 'PA',
    organizerName: 'Pittsburgh Food Truck Park',
    organizerContact: { email: 'events@pghfoodtruckpark.com' },
    eventName: 'Pittsburgh Riverfront Food Truck Rally',
    description:
      'Seasonal riverfront event featuring local trucks, craft beer, and music.',
    venueName: 'The Strip District',
    address: '2401 Smallman St, Pittsburgh, PA 15222',
    startDate: makeDate(nextYear, 7, 12),
    endDate: makeDate(nextYear, 7, 13),
    eventType: 'food_event',
    vendorSpots: 40,
    vendorFee: 325,
    requiredVendorTypes: ['food_truck', 'tent_vendor'],
  },

  // Portland
  {
    jurisdictionName: 'Portland, OR',
    city: 'Portland',
    state: 'OR',
    organizerName: 'Portland Food Cart Alliance',
    organizerContact: { email: 'events@pdxfoodcarts.org' },
    eventName: 'Portland Food Cart & Beer Garden Fest',
    description:
      'Summer gathering of Portland food carts, breweries, and live music.',
    venueName: 'Tom McCall Waterfront Park',
    address: '98 SW Naito Pkwy, Portland, OR 97204',
    startDate: makeDate(nextYear, 8, 16),
    endDate: makeDate(nextYear, 8, 18),
    eventType: 'food_event',
    vendorSpots: 70,
    vendorFee: 475,
    requiredVendorTypes: ['food_truck', 'food_cart', 'tent_vendor'],
  },

  // Phoenix
  {
    jurisdictionName: 'Phoenix, AZ',
    city: 'Phoenix',
    state: 'AZ',
    organizerName: 'Phoenix Food Truck Coalition',
    organizerContact: { email: 'info@phxftc.org' },
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
  },

  // Los Angeles
  {
    jurisdictionName: 'Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    organizerName: 'LA Street Food Project',
    organizerContact: { email: 'events@lastreetfood.org' },
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
  },

  // Tampa
  {
    jurisdictionName: 'Tampa, FL',
    city: 'Tampa',
    state: 'FL',
    organizerName: 'Tampa Bay Food Truck Rally',
    organizerContact: { email: 'info@tbftr.com' },
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
  },

  // Nashville
  {
    jurisdictionName: 'Nashville, TN',
    city: 'Nashville',
    state: 'TN',
    organizerName: 'Nashville Food Truck Association',
    organizerContact: { email: 'events@nfta.org' },
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
  },
];

// pick important permits based on vendorTypes & importanceLevel
async function getRequiredPermits(jurisdictionId, vendorTypes) {
  // match any permit that applies to these vendor types and is important enough
  const permits = await PermitType.find({
    jurisdictionId,
    vendorTypes: { $in: vendorTypes },
    importanceLevel: { $in: ['critical', 'often_forgotten'] },
    active: true
  });

  return permits;
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error('Missing MONGODB_URI / DATABASE_URL env var.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const raw of RAW_EVENTS) {
    try {
      const jurisdiction = await Jurisdiction.findOne({
        $or: [
          { name: raw.jurisdictionName },
          { city: new RegExp(`^${raw.city}$`, 'i'), state: raw.state }
        ]
      });

      if (!jurisdiction) {
        console.warn(
          `⚠️  No jurisdiction found for ${raw.jurisdictionName || (raw.city + ', ' + raw.state)}. Skipping event "${raw.eventName}".`
        );
        continue;
      }

      const permits = await getRequiredPermits(
        jurisdiction._id,
        raw.requiredVendorTypes || []
      );

      if (!permits.length) {
        console.warn(
          `⚠️  No PermitType matches found for "${raw.eventName}" in ${jurisdiction.name}. Event will be created with empty requiredPermitTypes.`
        );
      }

      const eventDoc = {
        organizerId: null, // organizer can be attached later via the app
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
        requiredVendorTypes: raw.requiredVendorTypes || [],
        requiredPermitTypes: permits.map((p) => p._id),
        vendorSpots: raw.vendorSpots,
        vendorFee: raw.vendorFee,
        applicationDeadline: new Date(
          raw.startDate.getTime() - 1000 * 60 * 60 * 24 * 30
        ),
        status: 'published'
      };

      const existing = await Event.findOne({
        eventName: raw.eventName,
        'location.city': raw.city,
        'location.state': raw.state
      });

      if (existing) {
        await Event.updateOne({ _id: existing._id }, eventDoc);
        console.log(`✅ Updated event: ${raw.eventName} (${raw.city}, ${raw.state})`);
      } else {
        await Event.create(eventDoc);
        console.log(`✅ Created event: ${raw.eventName} (${raw.city}, ${raw.state})`);
      }
    } catch (err) {
      console.error(`❌ Error seeding event "${raw.eventName}":`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done seeding events.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Event seeding failed:', err);
  process.exit(1);
});
