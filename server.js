// PermitWise Server - Complete Backend
// Node.js + Express + MongoDB + Stripe + Twilio

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const cron = require('node-cron');
const Stripe = require('stripe');
const twilio = require('twilio');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const crypto = require('crypto');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();

// ===========================================
// CONFIGURATION
// ===========================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/permitwise';
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? undefined : 'permitwise-dev-secret-key');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@permitwise.app';
const FROM_NAME = process.env.FROM_NAME || 'PermitWise';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// Google Play receipt validation
const GOOGLE_PLAY_PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.permitwise.app';
// Google service account credentials - supports JSON string in env var or file path
const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY; // JSON string
const GOOGLE_SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE; // or file path
// Apple App Store shared secret for receipt validation (legacy verifyReceipt)
const APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET;
// Apple App Store Server Notifications v2 (optional, for real-time subscription updates)
const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || 'com.permitwise.app';
// Toggle server-to-server IAP validation on/off
// Set to 'false' during testing to skip Google/Apple API calls and trust client receipts
// MUST be 'true' in production to prevent fraud
const GOOGLE_PLAY_VALIDATION_ENABLED = (process.env.GOOGLE_PLAY_VALIDATION_ENABLED || 'false').toLowerCase() === 'true';
const APPLE_VALIDATION_ENABLED = (process.env.APPLE_VALIDATION_ENABLED || 'false').toLowerCase() === 'true';
// Toggle Stripe payments on/off
// Set to 'false' during testing to skip Stripe env var requirements and mock checkout
// MUST be 'true' in production to process real payments
const STRIPE_ENABLED = (process.env.STRIPE_ENABLED || 'false').toLowerCase() === 'true';

// ===========================================
// PRODUCTION ENVIRONMENT VALIDATION
// ===========================================
if (IS_PRODUCTION) {
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
  if (STRIPE_ENABLED) {
    requiredEnvVars.push('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET');
  }
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }
}

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Initialize Twilio
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

// Initialize Google Play Android Publisher API (for receipt validation)
let androidPublisher = null;
(() => {
  try {
    let credentials = null;
    if (GOOGLE_SERVICE_ACCOUNT_KEY) {
      // Parse JSON string from env var (preferred for Railway/Heroku/Render)
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    } else if (GOOGLE_SERVICE_ACCOUNT_KEY_FILE && fs.existsSync(GOOGLE_SERVICE_ACCOUNT_KEY_FILE)) {
      // Load from file path
      credentials = JSON.parse(fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_KEY_FILE, 'utf-8'));
    }
    if (credentials) {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
      });
      androidPublisher = google.androidpublisher({ version: 'v3', auth });
      console.log('Google Play Android Publisher API initialized');
    }
  } catch (err) {
    console.warn('Google Play API initialization failed:', err.message);
  }
})();

// Log IAP validation status on startup
if (GOOGLE_PLAY_VALIDATION_ENABLED) {
  console.log('Google Play server-to-server validation: ENABLED');
} else {
  console.warn('⚠️  Google Play validation: DISABLED (GOOGLE_PLAY_VALIDATION_ENABLED != true)');
  if (IS_PRODUCTION) {
    console.error('🚨 WARNING: Google Play validation is DISABLED in PRODUCTION.');
  }
}
if (APPLE_VALIDATION_ENABLED) {
  console.log('Apple App Store server-to-server validation: ENABLED');
} else {
  console.warn('⚠️  Apple validation: DISABLED (APPLE_VALIDATION_ENABLED != true)');
  if (IS_PRODUCTION) {
    console.error('🚨 WARNING: Apple validation is DISABLED in PRODUCTION.');
  }
}

// Log Stripe status on startup
if (STRIPE_ENABLED && stripe) {
  console.log('Stripe payments: ENABLED');
} else if (STRIPE_ENABLED && !stripe) {
  console.error('🚨 STRIPE_ENABLED=true but STRIPE_SECRET_KEY is missing — payments will fail!');
} else {
  console.warn('⚠️  Stripe payments: DISABLED (STRIPE_ENABLED != true) — checkout/billing routes will return test URLs');
  if (IS_PRODUCTION) {
    console.error('🚨 WARNING: Stripe is DISABLED in PRODUCTION. Set STRIPE_ENABLED=true to process real payments.');
  }
}

// Initialize Nodemailer (fallback if SendGrid not configured)
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === '465',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Initialize SendGrid (primary email provider)
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid configured as primary email provider');
} else {
  console.log('⚠️  SendGrid not configured (set SENDGRID_API_KEY). Falling back to SMTP.');
}

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Trust proxy (Railway, Heroku, Render, etc.)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for serving React SPA
  crossOriginEmbedderPolicy: false
}));

// CORS - restrict to known origins in production
const allowedOrigins = IS_PRODUCTION
  ? [CLIENT_URL, BASE_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:19006', 'exp://localhost:19000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 500 : 5000, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 20 : 200, // strict limit for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Body parsing - Webhook MUST come before json parser
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Secure file serving - requires authentication and ownership verification
// Supports both Authorization header and ?token= query parameter for img/iframe compatibility
app.get('/uploads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Path traversal protection
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check for auth token (header or query param)
    const authHeader = req.headers.authorization;
    const adminToken = req.headers['x-admin-token'];
    const token = authHeader?.split(' ')[1] || req.query.token;
    
    if (!token && !adminToken) {
      return res.status(401).json({ error: 'Authentication required. Add ?token=YOUR_TOKEN to the URL.' });
    }
    
    // First, check if this is an admin token (either header or query param)
    let isAdmin = false;
    if (adminToken || token) {
      try {
        const tokenToCheck = adminToken || token;
        const decoded = jwt.verify(tokenToCheck, JWT_SECRET);
        if (decoded.isMasterAdmin) {
          isAdmin = true;
          // Admin can access any file - serve it directly
          return res.sendFile(filePath);
        }
      } catch (err) {
        // Not an admin token, continue to check user token
      }
    }
    
    // If not admin, require user token
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token and get user
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    // Organizers can access their own proof documents
    if (user.isOrganizer) {
      // Check if file is in organizer's proof documents
      const event = await Event.findOne({
        organizerId: user._id,
        'proofDocuments.fileUrl': { $regex: filename }
      });
      if (event) {
        return res.sendFile(filePath);
      }
      
      // Check organizer profile documents
      if (user.organizerProfile?.documents?.some(d => d.fileUrl?.includes(filename))) {
        return res.sendFile(filePath);
      }
    }
    
    // Vendors need a business to access files
    if (!user.vendorBusinessId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if this file belongs to user's business
    const document = await Document.findOne({ 
      fileName: filename,
      vendorBusinessId: user.vendorBusinessId
    });
    
    // Also check if it's the business logo
    const business = await VendorBusiness.findOne({
      _id: user.vendorBusinessId,
      logo: { $regex: filename }
    });
    
    // Also check inspection photos
    const inspection = await VendorInspection.findOne({
      vendorBusinessId: user.vendorBusinessId,
      photos: { $regex: filename }
    });
    
    if (!document && !business && !inspection) {
      return res.status(403).json({ error: 'Access denied to this file' });
    }
    
    // Serve the file with appropriate content type
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// ===========================================
// MONGOOSE SCHEMAS
// ===========================================

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['owner', 'manager', 'staff', 'admin', 'organizer'], default: 'owner' },
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
  // Organizer-specific fields
  isOrganizer: { type: Boolean, default: false },
  organizerProfile: {
    companyName: String,
    description: String,
    website: String,
    phone: String,
    logo: String,
    verified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'info_needed'], default: 'pending' },
    verificationNotes: String, // Admin notes to organizer (visible to organizer)
    adminNotes: String, // Internal admin notes (not visible to organizer)
    disabled: { type: Boolean, default: false },
    disabledReason: String,
    // Organizer documents (proof of business, event ownership, etc.)
    documents: [{
      name: String,
      fileName: String,
      fileUrl: String,
      fileType: String,
      category: { type: String, enum: ['business_license', 'event_permit', 'venue_contract', 'insurance', 'identity', 'other'] },
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      reviewNotes: String
    }]
  },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Vendor Business Schema
const vendorBusinessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  dbaName: { type: String },
  phone: { type: String },
  email: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'USA' }
  },
  ein: { type: String },
  primaryVendorType: { 
    type: String, 
    enum: ['food_truck', 'food_cart', 'tent_vendor', 'mobile_retail', 'farmers_market', 'craft_vendor', 'mobile_bartender', 'mobile_groomer', 'pop_up_shop', 'other'],
    required: true 
  },
  secondaryVendorTypes: [{ type: String }],
  handlesFood: { type: Boolean, default: false }, // Whether this vendor handles/serves food
  operatingCities: [{
    city: String,
    state: String,
    isPrimary: { type: Boolean, default: false }
  }],
  vehicleDetails: {
    type: { type: String },
    make: String,
    model: String,
    year: String,
    licensePlate: String,
    vin: String,
    color: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: String,
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
  },
  logo: { type: String },
  teamMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['manager', 'staff'] },
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Jurisdiction Schema
const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'county', 'state'], required: true },
  city: { type: String },
  county: { type: String },
  state: { type: String, required: true },
  notes: { type: String },
  contactInfo: {
    website: String,
    phone: String,
    email: String,
    address: String
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Permit Type Schema
const permitTypeSchema = new mongoose.Schema({
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction', required: true },
  vendorTypes: [{ type: String }], // Which vendor types need this permit
  requiresFoodHandling: { type: Boolean, default: false }, // If true, applies to any vendor that handles food
  name: { type: String, required: true },
  description: { type: String },
  issuingAuthorityName: { type: String },
  issuingAuthorityContact: {
    website: String,
    phone: String,
    email: String,
    address: String
  },
  defaultDurationDays: { type: Number, default: 365 },
  renewalPeriodMonths: { type: Number, default: 12 },
  estimatedCost: { type: String },
  applicationUrl: { type: String },
  pdfTemplateUrl: { type: String },
  requiredDocuments: [{ type: String }],
  renewalLeadTimeDays: { type: Number, default: 30 },
  importanceLevel: { 
    type: String, 
    enum: ['critical', 'often_forgotten', 'event_required'],
    default: 'critical'
  },
  formFields: [{
    fieldName: String,
    fieldType: { type: String, enum: ['text', 'date', 'checkbox', 'select'] },
    mappedTo: String, // Maps to vendor profile field
    required: Boolean
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Vendor Permit Schema
const vendorPermitSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  permitTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PermitType', required: true },
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction', required: true },
  status: { 
    type: String, 
    enum: ['missing', 'in_progress', 'active', 'expired', 'pending_renewal'],
    default: 'missing'
  },
  permitNumber: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, // Primary document (legacy)
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }], // Multiple documents
  notes: { type: String },
  remindersSent: [{
    daysBeforeExpiry: Number,
    sentAt: Date,
    type: { type: String, enum: ['email', 'sms'] }
  }],
  renewalHistory: [{
    previousExpiryDate: Date,
    renewedAt: Date,
    newExpiryDate: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  category: { 
    type: String, 
    enum: ['permit', 'insurance', 'inspection', 'food_handler', 'vehicle', 'commissary', 'license', 'other'],
    required: true 
  },
  relatedEntityType: { type: String, enum: ['permit', 'business', 'user', 'inspection'] },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
  expiryDate: { type: Date },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'basic', 'pro', 'elite', 'trial', 'promo', 'lifetime'], default: 'trial' },
  status: { type: String, enum: ['trial', 'active', 'past_due', 'canceled', 'paused', 'promo', 'lifetime', 'expired', 'grace_period'], default: 'trial' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  trialEndsAt: { type: Date },
  canceledAt: { type: Date },
  // Grace period tracking
  gracePeriodEndsAt: { type: Date }, // 3 days after payment failure
  lastPaymentFailedAt: { type: Date },
  paymentFailureCount: { type: Number, default: 0 },
  // Promo/Lifetime fields
  promoGrantedBy: { type: String }, // Admin who granted the promo
  promoGrantedAt: { type: Date },
  promoNote: { type: String }, // Reason for promo (e.g., "Beta tester", "Influencer deal")
  promoExpiresAt: { type: Date }, // For time-limited promos, null for lifetime
  // In-App Purchase tracking (Google Play / Apple App Store)
  iapPlatform: { type: String, enum: ['google_play', 'apple', null], default: null },
  iapProductId: { type: String },
  iapPurchaseToken: { type: String }, // Google Play purchase token
  iapOriginalTransactionId: { type: String }, // Apple original transaction ID
  features: {
    maxCities: { type: Number, default: 1 },
    smsAlerts: { type: Boolean, default: false },
    autofill: { type: Boolean, default: false },
    inspectionChecklists: { type: Boolean, default: false },
    teamAccounts: { type: Boolean, default: false },
    maxTeamMembers: { type: Number, default: 1 },
    eventIntegration: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  },
  // Pending plan change (for downgrades — applied at next renewal)
  pendingPlanChange: { type: String, enum: ['basic', 'pro', 'elite', null], default: null },
  pendingPlanChangeDate: { type: Date }, // When the change was requested
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Organizer Subscription Schema (separate from vendor subscriptions)
const organizerSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['trial', 'organizer', 'lifetime'], default: 'trial' },
  status: { type: String, enum: ['trial', 'active', 'past_due', 'canceled', 'expired', 'lifetime'], default: 'trial' },
  price: { type: Number, default: 79 }, // $79/month
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  iapPlatform: { type: String, enum: ['google_play', 'apple', null] },
  iapProductId: { type: String },
  iapPurchaseToken: { type: String },
  iapOriginalTransactionId: { type: String },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14 days
  canceledAt: { type: Date },
  gracePeriodEndsAt: { type: Date },
  lastPaymentFailedAt: { type: Date },
  paymentFailureCount: { type: Number, default: 0 },
  features: {
    unlimitedEvents: { type: Boolean, default: true },
    unlimitedInvitations: { type: Boolean, default: true },
    complianceTracking: { type: Boolean, default: true },
    customRequirements: { type: Boolean, default: true },
    applicationManagement: { type: Boolean, default: true },
    verifiedBadge: { type: Boolean, default: true },
    prioritySupport: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['email', 'sms', 'push'], required: true },
  channelAddress: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  sendAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'canceled'], default: 'pending' },
  relatedVendorPermitId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorPermit' },
  errorMessage: { type: String },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Inspection Checklist Schema
const inspectionChecklistSchema = new mongoose.Schema({
  jurisdictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction' },
  vendorType: { type: String }, // DEPRECATED: use vendorTypes array
  vendorTypes: [{ type: String }], // Array for multi-select
  forOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' }, // If set, only for this business
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['health', 'fire', 'safety', 'general'], default: 'general' },
  items: [{
    itemText: { type: String, required: true },
    description: { type: String },
    required: { type: Boolean, default: true },
    order: { type: Number }
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Vendor Inspection Schema
const vendorInspectionSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  checklistId: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionChecklist' }, // Can be null for user checklists
  userChecklistId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserChecklist' }, // For user-created checklists
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inspectionDate: { type: Date, default: Date.now },
  results: [{
    itemId: { type: mongoose.Schema.Types.ObjectId },
    itemText: String,
    status: { type: String, enum: ['pass', 'fail', 'na'], default: 'na' },
    passed: { type: Boolean, default: null }, // true = pass, false = fail, null = not evaluated
    notes: String
  }],
  overallStatus: { type: String, enum: ['pass', 'fail', 'incomplete'], default: 'incomplete' },
  notes: { type: String },
  photos: [{ type: String }],
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizerName: { type: String, required: true },
  organizerContact: {
    email: String,
    phone: String,
    website: String
  },
  eventName: { type: String, required: true },
  description: { type: String },
  location: {
    venueName: String,
    address: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: String,
    latitude: Number,
    longitude: Number
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  eventType: { type: String, enum: ['farmers_market', 'festival', 'fair', 'craft_show', 'food_event', 'night_market', 'other'] },
  requiredVendorTypes: [{ type: String }],
  requiredPermitTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PermitType' }],
  // Custom permit requirements (text-based for flexibility)
  customPermitRequirements: [{
    name: String,
    description: String,
    required: { type: Boolean, default: true }
  }],
  // Vendor spots and fees
  maxVendors: { type: Number },
  vendorFee: { type: Number },
  feeStructure: {
    applicationFee: { type: Number, default: 0 },
    boothFee: { type: Number, default: 0 },
    electricityFee: { type: Number, default: 0 },
    description: String
  },
  applicationDeadline: { type: Date },
  // Event status
  status: { type: String, enum: ['draft', 'published', 'closed', 'cancelled'], default: 'draft' },
  // Assigned/Invited vendors - vendors invited to this event by organizer
  assignedVendors: [{
    vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
    assignedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['invited', 'accepted', 'declined'], default: 'invited' },
    respondedAt: Date,
    notes: String,
    // Custom requirement completions for invited vendors
    customRequirementCompletions: [{
      requirementIndex: Number,
      completed: { type: Boolean, default: false },
      completedAt: Date,
      notes: String
    }]
  }],
  // Vendor applications - vendors who applied to this event
  vendorApplications: [{
    vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'waitlist', 'withdrawn'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicationNotes: String, // Vendor's application notes
    organizerNotes: String, // Organizer's private notes
    boothAssignment: String,
    withdrawnAt: Date,
    withdrawalReason: String,
    // Custom requirement completions - tracks vendor completion of organizer's custom requirements
    customRequirementCompletions: [{
      requirementIndex: Number, // Index in event's customPermitRequirements array
      completed: { type: Boolean, default: false },
      completedAt: Date,
      notes: String
    }],
    // Document uploads specific to this event
    uploadedDocuments: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  }],
  // Messages between organizer and vendors
  messages: [{
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toVendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
    message: String,
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  // Legacy field for backward compatibility
  registeredVendors: [{
    vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    paymentId: String
  }],
  // Event verification/proof documents (proof of ownership/rights to host)
  proofDocuments: [{
    name: String,
    fileName: String,
    fileUrl: String,
    fileType: String,
    category: { type: String, enum: ['venue_contract', 'event_permit', 'city_approval', 'insurance', 'other'] },
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewNotes: String
  }],
  // Event verification status
  verificationStatus: { type: String, enum: ['not_required', 'pending', 'approved', 'rejected', 'info_needed'], default: 'pending' },
  verificationNotes: String, // Notes from admin to organizer
  adminNotes: String, // Internal admin notes
  requiresProof: { type: Boolean, default: true }, // Whether this event requires proof documents
  // Cancellation tracking
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Suggestion/Ticket Schema - for user suggestions to admin
const suggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
  type: { 
    type: String, 
    enum: ['city_request', 'checklist_request', 'checklist_change', 'permit_type_request', 'event_request', 'general_feedback'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  // For city requests
  cityDetails: {
    city: String,
    state: String
  },
  // For checklist requests
  checklistDetails: {
    name: String,
    category: String,
    isUserSpecific: { type: Boolean, default: false }, // true = just for this user, false = for everyone
    items: [{ itemText: String, description: String }]
  },
  // For event requests
  eventDetails: {
    eventName: String,
    organizerName: String,
    city: String,
    state: String,
    startDate: Date,
    endDate: Date,
    eventType: String,
    website: String,
    additionalInfo: String
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending' 
  },
  adminNotes: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User-created Checklist Schema - for vendor's personal checklists
const userChecklistSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'custom' },
  items: [{
    itemText: { type: String, required: true },
    description: { type: String },
    required: { type: Boolean, default: true }
  }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Attending Event Schema - vendor self-tracked events for compliance readiness
const attendingEventSchema = new mongoose.Schema({
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  organizerName: { type: String },
  description: { type: String },
  location: {
    venueName: String,
    address: String,
    city: String,
    state: String,
    zip: String
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  eventType: { type: String, enum: ['farmers_market', 'festival', 'fair', 'craft_show', 'food_event', 'night_market', 'other'], default: 'other' },
  // Permits the vendor needs for this event (self-tracked)
  requiredPermits: [{
    name: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['needed', 'in_progress', 'obtained', 'not_applicable'], default: 'needed' },
    permitTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PermitType' }, // Optional link to system permit
    vendorPermitId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorPermit' }, // Optional link to vendor's permit
    notes: String,
    dueDate: Date
  }],
  // Custom compliance checklist items
  complianceChecklist: [{
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    notes: String
  }],
  notes: { type: String },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ===========================================
// DATABASE INDEXES (for production query performance)
// ===========================================
userSchema.index({ vendorBusinessId: 1 });
vendorBusinessSchema.index({ ownerId: 1 });
vendorPermitSchema.index({ vendorBusinessId: 1 });
vendorPermitSchema.index({ vendorBusinessId: 1, status: 1 });
vendorPermitSchema.index({ expiryDate: 1, status: 1 });
documentSchema.index({ vendorBusinessId: 1 });
subscriptionSchema.index({ vendorBusinessId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ iapPurchaseToken: 1 });
subscriptionSchema.index({ iapOriginalTransactionId: 1 });
organizerSubscriptionSchema.index({ userId: 1 });
organizerSubscriptionSchema.index({ iapPurchaseToken: 1 });
organizerSubscriptionSchema.index({ iapOriginalTransactionId: 1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ status: 1, sendAt: 1 });
attendingEventSchema.index({ vendorBusinessId: 1 });
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ organizerId: 1 });

// Models
const User = mongoose.model('User', userSchema);
const VendorBusiness = mongoose.model('VendorBusiness', vendorBusinessSchema);
const Jurisdiction = mongoose.model('Jurisdiction', jurisdictionSchema);
const PermitType = mongoose.model('PermitType', permitTypeSchema);
const VendorPermit = mongoose.model('VendorPermit', vendorPermitSchema);
const Document = mongoose.model('Document', documentSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const OrganizerSubscription = mongoose.model('OrganizerSubscription', organizerSubscriptionSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const InspectionChecklist = mongoose.model('InspectionChecklist', inspectionChecklistSchema);
const VendorInspection = mongoose.model('VendorInspection', vendorInspectionSchema);
const Event = mongoose.model('Event', eventSchema);
const Suggestion = mongoose.model('Suggestion', suggestionSchema);
const UserChecklist = mongoose.model('UserChecklist', userChecklistSchema);
const AttendingEvent = mongoose.model('AttendingEvent', attendingEventSchema);

// ===========================================
// MIDDLEWARE
// ===========================================

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check subscription features
const checkFeature = (feature) => async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    const isActive = isSubscriptionActive(subscription);
    
    if (!subscription || !isActive) {
      return res.status(403).json({ 
        error: 'subscription_expired',
        message: 'Your subscription has expired. Please upgrade to access this feature.',
        upgradeRequired: true,
        requiredFeature: feature
      });
    }
    if (feature && !subscription.features[feature]) {
      return res.status(403).json({ 
        error: 'feature_unavailable',
        message: `The ${feature} feature is not available in your current plan. Please upgrade.`,
        upgradeRequired: true,
        requiredFeature: feature,
        currentPlan: subscription.plan
      });
    }
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin middleware - supports both user admin role and master admin token
const adminMiddleware = (req, res, next) => {
  // Check for master admin token in header
  const adminToken = req.headers['x-admin-token'];
  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      if (decoded.isMasterAdmin) {
        req.isMasterAdmin = true;
        return next();
      }
    } catch (err) {
      // Invalid token, continue to check user role
    }
  }
  
  // Fall back to user role check
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required' });
};

// Master admin auth middleware (doesn't require user auth)
const masterAdminMiddleware = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken) {
    return res.status(401).json({ error: 'Admin token required' });
  }
  
  try {
    const decoded = jwt.verify(adminToken, JWT_SECRET);
    if (decoded.isMasterAdmin) {
      req.isMasterAdmin = true;
      return next();
    }
    return res.status(403).json({ error: 'Invalid admin token' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
};

// ===========================================
// SUBSCRIPTION STATUS HELPERS & MIDDLEWARE
// ===========================================

// Helper: Check if subscription is in a valid/active state
const isSubscriptionActive = (subscription) => {
  if (!subscription) return false;
  
  const now = new Date();
  const activeStatuses = ['active', 'trial', 'promo', 'lifetime', 'grace_period'];
  
  // Check basic status
  if (!activeStatuses.includes(subscription.status)) return false;
  
  // Check trial expiration
  if (subscription.status === 'trial' && subscription.trialEndsAt) {
    if (new Date(subscription.trialEndsAt) < now) return false;
  }
  
  // Check promo expiration
  if (subscription.status === 'promo' && subscription.promoExpiresAt) {
    if (new Date(subscription.promoExpiresAt) < now) return false;
  }
  
  // Check grace period expiration
  if (subscription.status === 'grace_period' && subscription.gracePeriodEndsAt) {
    if (new Date(subscription.gracePeriodEndsAt) < now) return false;
  }
  
  // Check current period end for active subscriptions
  if (subscription.status === 'active' && subscription.currentPeriodEnd) {
    if (new Date(subscription.currentPeriodEnd) < now) return false;
  }
  
  return true;
};

// Helper: Get subscription status details for API responses
const getSubscriptionStatus = async (vendorBusinessId) => {
  const subscription = await Subscription.findOne({ vendorBusinessId });
  
  if (!subscription) {
    return { 
      status: 'none', 
      isActive: false, 
      isExpired: true,
      canRead: true, 
      canWrite: false, 
      plan: 'free',
      message: 'No subscription found'
    };
  }
  
  const isActive = isSubscriptionActive(subscription);
  const now = new Date();
  
  let expirationDate = null;
  if (subscription.status === 'trial') expirationDate = subscription.trialEndsAt;
  else if (subscription.status === 'promo') expirationDate = subscription.promoExpiresAt;
  else if (subscription.status === 'grace_period') expirationDate = subscription.gracePeriodEndsAt;
  else if (subscription.status === 'active') expirationDate = subscription.currentPeriodEnd;
  
  const daysUntilExpiration = expirationDate ? Math.ceil((new Date(expirationDate) - now) / (1000 * 60 * 60 * 24)) : null;
  
  return {
    status: subscription.status,
    plan: subscription.plan,
    isActive,
    isExpired: !isActive,
    canRead: true, // Always allow read access
    canWrite: isActive, // Only allow write if active
    expirationDate,
    daysUntilExpiration,
    features: subscription.features,
    gracePeriodEndsAt: subscription.gracePeriodEndsAt,
    message: isActive ? null : 'Your subscription has expired. Upgrade to continue using premium features.'
  };
};

// Middleware: Require active subscription (for premium write operations)
// Blocks: create, update, delete on premium features
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user?.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    const isActive = isSubscriptionActive(subscription);
    
    if (!isActive) {
      return res.status(403).json({ 
        error: 'subscription_expired',
        message: 'Your subscription has expired. Please upgrade to continue using this feature.',
        upgradeRequired: true,
        currentPlan: subscription?.plan || 'free',
        expiredAt: subscription?.currentPeriodEnd || subscription?.trialEndsAt || subscription?.gracePeriodEndsAt
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware: Allow free tier (read-only) or paid users
// Allows: GET requests, basic profile/permit viewing
// Blocks: nothing - just attaches subscription info
const requireFreeOrPaid = async (req, res, next) => {
  try {
    if (!req.user?.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    const isActive = isSubscriptionActive(subscription);
    
    // Attach subscription status to request for downstream use
    req.subscription = subscription;
    req.subscriptionActive = isActive;
    req.canWrite = isActive;
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware: Check if write operations are allowed (for expired users trying to create/update)
const requireWriteAccess = async (req, res, next) => {
  try {
    // If subscription already attached, use it
    if (req.subscription !== undefined) {
      if (!req.canWrite) {
        return res.status(403).json({
          error: 'subscription_expired',
          message: 'Your subscription has expired. Upgrade to create or modify content.',
          upgradeRequired: true
        });
      }
      return next();
    }
    
    // Otherwise check subscription
    if (!req.user?.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    const isActive = isSubscriptionActive(subscription);
    
    if (!isActive) {
      return res.status(403).json({
        error: 'subscription_expired',
        message: 'Your subscription has expired. Upgrade to create or modify content.',
        upgradeRequired: true,
        currentPlan: subscription?.plan || 'free'
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware: Check plan limits (maxCities, maxTeamMembers, etc.)
const checkPlanLimit = (limitType) => async (req, res, next) => {
  try {
    if (!req.user?.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    const isActive = isSubscriptionActive(subscription);
    
    if (!isActive) {
      return res.status(403).json({
        error: 'subscription_expired',
        message: 'Your subscription has expired. Please upgrade to continue.',
        upgradeRequired: true
      });
    }
    
    const limits = subscription.features || {};
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    
    let currentCount = 0;
    let maxAllowed = 0;
    let itemName = '';
    
    switch (limitType) {
      case 'cities':
        currentCount = (business?.operatingCities || []).filter(c => c.city && c.state).length;
        maxAllowed = limits.maxCities || 1;
        itemName = 'operating cities';
        break;
      case 'teamMembers':
        const teamCount = await User.countDocuments({ vendorBusinessId: req.user.vendorBusinessId });
        currentCount = teamCount;
        maxAllowed = limits.maxTeamMembers || 1;
        itemName = 'team members';
        break;
      case 'permits':
        const permitCount = await VendorPermit.countDocuments({ vendorBusinessId: req.user.vendorBusinessId });
        currentCount = permitCount;
        maxAllowed = limits.maxPermits || 10;
        itemName = 'permits';
        break;
      default:
        return next(); // Unknown limit type, allow
    }
    
    if (currentCount >= maxAllowed) {
      return res.status(403).json({
        error: 'plan_limit_reached',
        message: `You've reached your plan limit of ${maxAllowed} ${itemName}. Please upgrade for more.`,
        upgradeRequired: true,
        limitType,
        currentCount,
        maxAllowed,
        currentPlan: subscription.plan
      });
    }
    
    req.subscription = subscription;
    req.planLimits = { currentCount, maxAllowed, limitType };
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware: Require specific premium feature
const requirePremiumFeature = (feature) => async (req, res, next) => {
  try {
    if (!req.user?.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    const isActive = isSubscriptionActive(subscription);
    
    if (!isActive) {
      return res.status(403).json({
        error: 'subscription_expired',
        message: 'Your subscription has expired. Please upgrade to access this feature.',
        upgradeRequired: true,
        requiredFeature: feature
      });
    }
    
    // Check if feature is available in plan
    if (feature && subscription.features && !subscription.features[feature]) {
      return res.status(403).json({
        error: 'feature_unavailable',
        message: `The ${feature} feature is not available in your current plan. Please upgrade.`,
        upgradeRequired: true,
        requiredFeature: feature,
        currentPlan: subscription.plan
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===========================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ===========================================

// Role hierarchy: owner > manager > staff
const ROLE_HIERARCHY = {
  owner: 3,
  manager: 2,
  staff: 1
};

// Helper: Get user's effective role for their business
const getUserBusinessRole = async (user) => {
  if (!user || !user.vendorBusinessId) return null;
  
  // If user is the business owner (User.role === 'owner')
  if (user.role === 'owner') {
    return 'owner';
  }
  
  // Otherwise, check teamMembers array for their role
  const business = await VendorBusiness.findById(user.vendorBusinessId);
  if (!business) return null;
  
  const teamMember = business.teamMembers.find(
    tm => tm.userId && tm.userId.toString() === user._id.toString()
  );
  
  return teamMember?.role || 'staff'; // Default to staff if in business but no explicit role
};

// Middleware: Require minimum role level
// Usage: requireRole('manager') - allows owner and manager
// Usage: requireRole('owner') - allows only owner
const requireRole = (...allowedRoles) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const userRole = await getUserBusinessRole(req.user);
    
    if (!userRole) {
      return res.status(403).json({ 
        error: 'access_denied',
        message: 'You do not have access to this business'
      });
    }
    
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      // Also allow higher roles (owner can do everything)
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 0));
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'insufficient_permissions',
          message: `This action requires ${allowedRoles.join(' or ')} permissions`,
          currentRole: userRole,
          requiredRoles: allowedRoles
        });
      }
    }
    
    req.userRole = userRole;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware: Attach user role (non-blocking, just adds info)
const attachUserRole = async (req, res, next) => {
  try {
    if (req.user && req.user.vendorBusinessId) {
      req.userRole = await getUserBusinessRole(req.user);
    }
    next();
  } catch (error) {
    // Don't block on role lookup failure
    next();
  }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Send email
const sendEmail = async (to, subject, html) => {
  // Primary: SendGrid
  if (SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error.response?.body || error.message);
      return { success: false, message: error.message };
    }
  }
  
  // Fallback: Nodemailer SMTP
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('Email not configured. Would send:', { to, subject });
    return { success: false, message: 'Email not configured — set SENDGRID_API_KEY or EMAIL_USER/EMAIL_PASS' };
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, message: error.message };
  }
};

// Send SMS
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send SMS:', { to, message });
    return { success: false, message: 'SMS not configured' };
  }
  try {
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to
    });
    return { success: true };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, message: error.message };
  }
};

// Calculate days until expiry
const daysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get permit status based on expiry
const getPermitStatus = (permit) => {
  if (!permit.expiryDate) return 'missing';
  const days = daysUntilExpiry(permit.expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'pending_renewal';
  return 'active';
};

// Stripe price IDs (you'll set these up in Stripe dashboard)
const STRIPE_PRICES = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  elite: process.env.STRIPE_PRICE_ELITE
};

// Plan ranking for upgrade/downgrade comparison (higher = better)
const PLAN_RANK = { free: 0, trial: 0, basic: 1, pro: 2, elite: 3, promo: 4, lifetime: 5 };

// Plan features
const PLAN_FEATURES = {
  free: {
    maxCities: 1,
    smsAlerts: false,
    autofill: false,
    inspectionChecklists: false,
    teamAccounts: false,
    maxTeamMembers: 1,
    eventIntegration: false,
    prioritySupport: false
  },
  basic: {
    maxCities: 1,
    smsAlerts: false,
    autofill: false,
    inspectionChecklists: false,
    teamAccounts: false,
    maxTeamMembers: 1,
    eventIntegration: false,
    prioritySupport: false
  },
  pro: {
    maxCities: 999,
    smsAlerts: true,
    autofill: true,
    inspectionChecklists: true,
    teamAccounts: false,
    maxTeamMembers: 1,
    eventIntegration: false,
    prioritySupport: false
  },
  elite: {
    maxCities: 999,
    smsAlerts: true,
    autofill: true,
    inspectionChecklists: true,
    teamAccounts: true,
    maxTeamMembers: 10,
    eventIntegration: true,
    prioritySupport: true
  },
  trial: {
    maxCities: 2,
    smsAlerts: false,
    autofill: true,
    inspectionChecklists: true,
    teamAccounts: false,
    maxTeamMembers: 1,
    eventIntegration: false,
    prioritySupport: false
  },
  promo: {
    maxCities: 999,
    smsAlerts: true,
    autofill: true,
    inspectionChecklists: true,
    teamAccounts: true,
    maxTeamMembers: 5,
    eventIntegration: true,
    prioritySupport: true
  },
  lifetime: {
    maxCities: 999,
    smsAlerts: true,
    autofill: true,
    inspectionChecklists: true,
    teamAccounts: true,
    maxTeamMembers: 10,
    eventIntegration: true,
    prioritySupport: true
  }
};

// ===========================================
// AUTH ROUTES
// ===========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, isOrganizer, companyName } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
    
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      firstName,
      lastName,
      verificationToken,
      isOrganizer: isOrganizer || false,
      role: isOrganizer ? 'organizer' : 'owner',
      organizerProfile: isOrganizer ? {
        companyName: companyName || '',
        verified: false,
        disabled: false,
        notifications: {
          applicationReceived: true,
          applicationDeadline: true,
          vendorCompliance: true,
          eventReminders: true,
          emailDigest: 'daily'
        }
      } : undefined
    });
    
    await user.save();
    
    // Create organizer subscription with trial
    if (isOrganizer) {
      const orgSubscription = new OrganizerSubscription({
        userId: user._id,
        plan: 'trial',
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      });
      await orgSubscription.save();
    }
    
    // Send verification email
    const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Welcome to PermitWise - Verify Your Email',
      `
        <h1>Welcome to PermitWise!</h1>
        <p>Hi ${firstName || 'there'},</p>
        <p>Thank you for signing up${isOrganizer ? ' as an Event Organizer' : ''}. Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
        ${isOrganizer ? '<p><strong>Note:</strong> Your organizer account will need to be verified by PermitWise before you can publish events. This usually takes 1-2 business days.</p>' : ''}
        <p>Best,<br>The PermitWise Team</p>
      `
    );
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isOrganizer: user.isOrganizer,
        organizerProfile: user.organizerProfile,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        vendorBusinessId: user.vendorBusinessId,
        emailVerified: user.emailVerified,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }
    
    const verificationToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    user.verificationToken = verificationToken;
    await user.save();
    
    const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      user.email,
      'PermitWise - Verify Your Email',
      `
        <h1>Verify Your Email</h1>
        <p>Please verify your email to ensure you receive permit alerts:</p>
        <a href="${verifyUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        <p>Or copy this link: ${verifyUrl}</p>
      `
    );
    
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent' });
    }
    
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    
    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'PermitWise - Password Reset',
      `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    );
    
    res.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const business = user.vendorBusinessId 
      ? await VendorBusiness.findById(user.vendorBusinessId)
      : null;
    const subscription = user.vendorBusinessId
      ? await Subscription.findOne({ vendorBusinessId: user.vendorBusinessId })
      : null;
    
    // Get detailed subscription status
    let subscriptionStatus = null;
    if (user.vendorBusinessId) {
      subscriptionStatus = await getSubscriptionStatus(user.vendorBusinessId);
    }
    
    // Get user's role in the business
    let businessRole = null;
    if (user.vendorBusinessId) {
      businessRole = await getUserBusinessRole(user);
    }
      
    res.json({ user, business, subscription, subscriptionStatus, businessRole });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone, notificationPreferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone, notificationPreferences, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = await bcrypt.hash(newPassword, 12);
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ONBOARDING ROUTES
// ===========================================

// Complete onboarding
app.post('/api/onboarding/complete', authMiddleware, async (req, res) => {
  try {
    const {
      businessName,
      dbaName,
      phone,
      email,
      address,
      ein,
      primaryVendorType,
      secondaryVendorTypes,
      handlesFood,
      operatingCities,
      vehicleDetails,
      insurance
    } = req.body;
    
    // Validate required fields
    if (!businessName) return res.status(400).json({ error: 'Business name is required' });
    if (!primaryVendorType) return res.status(400).json({ error: 'Business type is required' });
    
    const validVendorTypes = ['food_truck', 'food_cart', 'tent_vendor', 'mobile_retail', 'farmers_market', 'craft_vendor', 'mobile_bartender', 'mobile_groomer', 'pop_up_shop', 'other'];
    if (!validVendorTypes.includes(primaryVendorType)) {
      return res.status(400).json({ error: 'Invalid business type' });
    }
    
    // Auto-detect food handling for certain vendor types
    const foodVendorTypes = ['food_truck', 'food_cart', 'mobile_bartender', 'farmers_market'];
    const autoHandlesFood = foodVendorTypes.includes(primaryVendorType) || handlesFood === true;
    
    // Check if user already has a business
    const existingBusiness = await VendorBusiness.findOne({ ownerId: req.userId });
    if (existingBusiness) {
      return res.status(400).json({ error: 'You already have a business registered' });
    }
    
    // Create vendor business
    const business = new VendorBusiness({
      ownerId: req.userId,
      businessName,
      dbaName,
      phone,
      email,
      address,
      ein,
      primaryVendorType,
      secondaryVendorTypes,
      handlesFood: autoHandlesFood,
      operatingCities,
      vehicleDetails,
      insurance
    });
    
    await business.save();
    
    // Update user with business ID
    await User.findByIdAndUpdate(req.userId, { vendorBusinessId: business._id });
    
    // Create trial subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    
    const subscription = new Subscription({
      vendorBusinessId: business._id,
      userId: req.userId,
      plan: 'trial',
      status: 'trial',
      trialEndsAt: trialEnd,
      currentPeriodEnd: trialEnd,
      features: PLAN_FEATURES.trial
    });
    
    await subscription.save();
    
    // Auto-add required permits for primary city
    if (operatingCities && operatingCities.length > 0) {
      const primaryCity = operatingCities.find(c => c.isPrimary) || operatingCities[0];
      const jurisdiction = await Jurisdiction.findOne({
        city: new RegExp(primaryCity.city, 'i'),
        state: primaryCity.state
      });
      
      if (jurisdiction) {
        const permitTypes = await PermitType.find({
          jurisdictionId: jurisdiction._id,
          vendorTypes: primaryVendorType,
          active: true
        });
        
        for (const pt of permitTypes) {
          const vendorPermit = new VendorPermit({
            vendorBusinessId: business._id,
            permitTypeId: pt._id,
            jurisdictionId: jurisdiction._id,
            status: 'missing'
          });
          await vendorPermit.save();
        }
      }
    }
    
    res.status(201).json({
      message: 'Onboarding completed successfully',
      business,
      subscription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// VENDOR BUSINESS ROUTES
// ===========================================

// Get business details
app.get('/api/business', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found. Complete onboarding first.' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId)
      .populate('teamMembers.userId', 'email firstName lastName');
      
    res.json({ business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update business
app.put('/api/business', authMiddleware, requireRole('owner', 'manager'), async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const updates = { ...req.body, updatedAt: Date.now() };
    delete updates._id;
    delete updates.ownerId;
    
    // Clean up empty city entries (from Settings UI adding empty rows)
    if (updates.operatingCities) {
      updates.operatingCities = updates.operatingCities.filter(c => c.city && c.state);
    }
    
    const business = await VendorBusiness.findByIdAndUpdate(
      req.user.vendorBusinessId,
      updates,
      { new: true }
    );
    
    res.json({ business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add team member
app.post('/api/business/team', authMiddleware, checkFeature('teamAccounts'), requireRole('owner', 'manager'), async (req, res) => {
  try {
    const { email, role, firstName, lastName } = req.body;
    
    // Validate role - managers can only add staff
    const assignRole = role || 'staff';
    if (req.userRole === 'manager' && assignRole === 'manager') {
      return res.status(403).json({ error: 'Managers cannot add other managers. Only the owner can do this.' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Check team member limit
    if (business.teamMembers.length >= req.subscription.features.maxTeamMembers) {
      return res.status(400).json({ error: 'Team member limit reached' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Check if already a team member
      const existing = business.teamMembers.find(tm => tm.userId.toString() === user._id.toString());
      if (existing) {
        return res.status(400).json({ error: 'User is already a team member' });
      }
    } else {
      // Create new user
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: assignRole,
        vendorBusinessId: business._id
      });
      await user.save();
      
      // Send invite email
      await sendEmail(
        email,
        `You've been invited to PermitWise`,
        `
          <h1>Team Invitation</h1>
          <p>Hi ${firstName || 'there'},</p>
          <p>You've been invited to join ${business.businessName} on PermitWise.</p>
          <p>Your temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please login and change your password: <a href="${CLIENT_URL}/login">Login to PermitWise</a></p>
        `
      );
    }
    
    business.teamMembers.push({ userId: user._id, role: assignRole });
    await business.save();
    
    res.status(201).json({ message: 'Team member added', business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove team member
app.delete('/api/business/team/:userId', authMiddleware, requireRole('owner', 'manager'), async (req, res) => {
  try {
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Find the member being removed
    const memberToRemove = business.teamMembers.find(tm => tm.userId.toString() === req.params.userId);
    
    // Managers can only remove staff
    if (req.userRole === 'manager' && memberToRemove?.role === 'manager') {
      return res.status(403).json({ error: 'Managers cannot remove other managers. Only the owner can do this.' });
    }
    
    business.teamMembers = business.teamMembers.filter(
      tm => tm.userId.toString() !== req.params.userId
    );
    await business.save();
    
    res.json({ message: 'Team member removed', business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Team alias endpoints (for frontend compatibility)
app.get('/api/team', authMiddleware, async (req, res) => {
  try {
    const business = await VendorBusiness.findById(req.user.vendorBusinessId)
      .populate('teamMembers.userId', 'firstName lastName email');
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    const members = business.teamMembers.map(tm => ({
      _id: tm._id,
      userId: tm.userId,
      role: tm.role,
      status: 'active'
    }));
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team/invite', authMiddleware, checkFeature('teamAccounts'), requireRole('owner', 'manager'), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Validate role - managers can only invite staff, owners can invite anyone
    const inviteRole = role || 'staff';
    if (req.userRole === 'manager' && inviteRole === 'manager') {
      return res.status(403).json({ error: 'Managers cannot invite other managers. Only the owner can do this.' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    const maxTeamMembers = req.subscription?.features?.maxTeamMembers || 5;
    if (business.teamMembers.length >= maxTeamMembers) {
      return res.status(403).json({ 
        error: 'plan_limit_reached',
        message: `You've reached your plan limit of ${maxTeamMembers} team members. Please upgrade for more.`,
        upgradeRequired: true,
        limitType: 'teamMembers',
        currentCount: business.teamMembers.length,
        maxAllowed: maxTeamMembers,
        currentPlan: req.subscription?.plan
      });
    }
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const existing = business.teamMembers.find(tm => tm.userId.toString() === user._id.toString());
      if (existing) {
        return res.status(400).json({ error: 'User is already a team member' });
      }
    } else {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: inviteRole,
        vendorBusinessId: business._id
      });
      await user.save();
      await sendEmail(email, `You've been invited to PermitWise`,
        `<h1>Team Invitation</h1><p>You've been invited to join ${business.businessName} on PermitWise.</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Login at: <a href="${CLIENT_URL}/login">${CLIENT_URL}/login</a></p>`
      );
    }
    business.teamMembers.push({ userId: user._id, role: inviteRole });
    await business.save();
    res.status(201).json({ message: 'Team member invited' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/team/:id', authMiddleware, requireRole('owner', 'manager'), async (req, res) => {
  try {
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Find the team member being removed
    const memberToRemove = business.teamMembers.find(tm => tm._id.toString() === req.params.id);
    if (!memberToRemove) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    // Managers can only remove staff, not other managers
    if (req.userRole === 'manager' && memberToRemove.role === 'manager') {
      return res.status(403).json({ error: 'Managers cannot remove other managers. Only the owner can do this.' });
    }
    
    business.teamMembers = business.teamMembers.filter(tm => tm._id.toString() !== req.params.id);
    await business.save();
    res.json({ message: 'Team member removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload logo
app.post('/api/business/logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const logoUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    
    await VendorBusiness.findByIdAndUpdate(req.user.vendorBusinessId, { logo: logoUrl });
    
    res.json({ logoUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ORGANIZER ROUTES
// ===========================================

// Get organizer subscription
app.get('/api/organizer/subscription', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    // Find organizer subscription (stored on user record)
    const subscription = await OrganizerSubscription.findOne({ userId: req.userId });
    
    res.json({ subscription: subscription || { status: 'trial', trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update organizer profile
app.put('/api/organizer/profile', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const { companyName, description, website, phone, contactEmail } = req.body;
    
    const user = await User.findById(req.userId);
    user.organizerProfile = {
      ...user.organizerProfile,
      companyName,
      description,
      website,
      phone,
      contactEmail
    };
    user.updatedAt = new Date();
    await user.save();
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update organizer notification preferences
app.put('/api/organizer/notifications', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const { applicationReceived, applicationDeadline, vendorCompliance, eventReminders, emailDigest } = req.body;
    
    const user = await User.findById(req.userId);
    user.organizerProfile = {
      ...user.organizerProfile,
      notifications: {
        applicationReceived,
        applicationDeadline,
        vendorCompliance,
        eventReminders,
        emailDigest
      }
    };
    user.updatedAt = new Date();
    await user.save();
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Organizer subscription checkout
app.post('/api/organizer/subscription/checkout', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    if (!STRIPE_ENABLED || !stripe) {
      if (!STRIPE_ENABLED) {
        // Test mode — activate organizer subscription directly without payment
        console.warn('[STRIPE BYPASS] Organizer checkout skipped — activating directly');
        await OrganizerSubscription.findOneAndUpdate(
          { userId: req.userId },
          { userId: req.userId, plan: 'organizer', status: 'active', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), updatedAt: new Date() },
          { upsert: true, new: true }
        );
        return res.json({ url: `${CLIENT_URL}/app?success=true` });
      }
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    let subscription = await OrganizerSubscription.findOne({ userId: req.userId });
    let customerId = subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: { userId: req.userId.toString(), type: 'organizer' }
      });
      customerId = customer.id;
      
      if (subscription) {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }
    }
    
    // Use configured price ID or fall back to inline price
    const organizerPriceId = process.env.STRIPE_PRICE_ORGANIZER;
    const lineItems = organizerPriceId 
      ? [{ price: organizerPriceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PermitWise Organizer Plan',
              description: 'Unlimited events, vendor management, compliance tracking'
            },
            unit_amount: 7900,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${CLIENT_URL}/app?success=true`,
      cancel_url: `${CLIENT_URL}/app?canceled=true`,
      metadata: {
        userId: req.userId.toString(),
        type: 'organizer'
      }
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Organizer billing portal
app.post('/api/organizer/subscription/portal', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    if (!STRIPE_ENABLED || !stripe) {
      if (!STRIPE_ENABLED) {
        console.warn('[STRIPE BYPASS] Organizer billing portal skipped — Stripe disabled');
        return res.json({ url: null, message: 'Stripe is in test mode. Manage subscriptions via the admin panel.' });
      }
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    const subscription = await OrganizerSubscription.findOne({ userId: req.userId });
    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${CLIENT_URL}/app#settings`
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// JURISDICTION ROUTES
// ===========================================

// Get all jurisdictions
app.get('/api/jurisdictions', async (req, res) => {
  try {
    const { state, type, search } = req.query;
    const query = {};
    
    if (state) query.state = state;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { county: new RegExp(search, 'i') }
      ];
    }
    
    const jurisdictions = await Jurisdiction.find(query).sort({ state: 1, name: 1 });
    res.json({ jurisdictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get jurisdiction by ID
app.get('/api/jurisdictions/:id', async (req, res) => {
  try {
    const jurisdiction = await Jurisdiction.findById(req.params.id);
    if (!jurisdiction) {
      return res.status(404).json({ error: 'Jurisdiction not found' });
    }
    res.json({ jurisdiction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create jurisdiction (admin)
app.post('/api/jurisdictions', masterAdminMiddleware, async (req, res) => {
  try {
    const jurisdiction = new Jurisdiction(req.body);
    await jurisdiction.save();
    res.status(201).json({ jurisdiction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update jurisdiction (admin)
app.put('/api/jurisdictions/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const jurisdiction = await Jurisdiction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ jurisdiction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// PERMIT TYPE ROUTES
// ===========================================

// Get permit types
app.get('/api/permit-types', async (req, res) => {
  try {
    const { jurisdictionId, vendorType, search } = req.query;
    const query = { active: true };
    
    if (jurisdictionId) query.jurisdictionId = jurisdictionId;
    if (vendorType) query.vendorTypes = vendorType;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const permitTypes = await PermitType.find(query)
      .populate('jurisdictionId', 'name city state type')
      .sort({ name: 1 });
      
    res.json({ permitTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get permits required for city/vendor type
app.get('/api/permit-types/required', async (req, res) => {
  try {
    const { city, state, vendorType, handlesFood } = req.query;
    
    if (!city || !state || !vendorType) {
      return res.status(400).json({ error: 'city, state, and vendorType are required' });
    }
    
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ],
      active: true
    });
    
    if (!jurisdiction) {
      return res.json({ permitTypes: [], coverage: 'none', message: 'City not found in our database yet' });
    }
    
    // Build query: permits that match vendor type OR (if handlesFood) permits requiring food handling
    const handlesFoodBool = handlesFood === 'true' || handlesFood === true;
    
    let permitQuery = {
      jurisdictionId: jurisdiction._id,
      active: true
    };
    
    if (handlesFoodBool) {
      // If business handles food, get permits for vendor type OR food handling permits
      permitQuery.$or = [
        { vendorTypes: vendorType },
        { requiresFoodHandling: true }
      ];
    } else {
      // Just get permits for this vendor type
      permitQuery.vendorTypes = vendorType;
    }
    
    const permitTypes = await PermitType.find(permitQuery)
      .populate('jurisdictionId', 'name city state type');
    
    // If jurisdiction exists and has permits for this vendor type, it's full coverage
    // If jurisdiction exists but no permits, still "full" - we have data for the city
    const coverage = 'full';
    
    res.json({ jurisdiction, permitTypes, coverage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get permit types by state (for event organizers)
app.get('/api/permit-types/by-state', authMiddleware, async (req, res) => {
  try {
    const { state, city } = req.query;
    
    if (!state) {
      return res.status(400).json({ error: 'state is required' });
    }
    
    // Build jurisdiction query
    const jurisdictionQuery = { state, active: true };
    
    // If city is provided, filter to specific jurisdiction
    if (city) {
      jurisdictionQuery.$or = [
        { city: new RegExp(`^${city}$`, 'i') },
        { name: new RegExp(`^${city}$`, 'i') }
      ];
    }
    
    // Find jurisdictions
    const jurisdictions = await Jurisdiction.find(jurisdictionQuery);
    const jurisdictionIds = jurisdictions.map(j => j._id);
    
    // Get all permit types for matching jurisdictions
    const permitTypes = await PermitType.find({
      jurisdictionId: { $in: jurisdictionIds },
      active: true
    }).populate('jurisdictionId', 'name city state type').sort({ name: 1 });
    
    res.json({ permitTypes, state, city, jurisdictionCount: jurisdictions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create permit type (admin)
app.post('/api/permit-types', masterAdminMiddleware, async (req, res) => {
  try {
    const permitType = new PermitType(req.body);
    await permitType.save();
    res.status(201).json({ permitType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update permit type (admin)
app.put('/api/permit-types/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const permitType = await PermitType.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ permitType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// VENDOR PERMIT ROUTES
// ===========================================

// Sync permits - check for new permit types and add missing ones
app.post('/api/permits/sync', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Get user's existing permit type IDs
    const existingPermits = await VendorPermit.find({ vendorBusinessId: business._id });
    const existingPermitTypeIds = new Set(existingPermits.map(p => p.permitTypeId.toString()));
    
    let addedCount = 0;
    const addedPermits = [];
    
    // Check each operating city for new permit types
    for (const city of (business.operatingCities || [])) {
      // Find jurisdiction for this city
      const jurisdiction = await Jurisdiction.findOne({
        $or: [
          { city: new RegExp(`^${city.city}$`, 'i'), state: city.state },
          { name: new RegExp(`^${city.city}$`, 'i'), state: city.state }
        ],
        active: true
      });
      
      if (!jurisdiction) continue;
      
      // Find all permit types for this jurisdiction that match vendor type
      // Check both primary and secondary vendor types
      const vendorTypes = [business.primaryVendorType, ...(business.secondaryVendorTypes || [])].filter(Boolean);
      
      // Build query: permits for vendor types OR (if handlesFood) food handling permits
      let permitQuery = {
        jurisdictionId: jurisdiction._id,
        active: true
      };
      
      if (business.handlesFood) {
        // If business handles food, get permits for vendor types OR food handling permits
        permitQuery.$or = [
          { vendorTypes: { $in: vendorTypes } },
          { requiresFoodHandling: true }
        ];
      } else {
        // Just get permits for vendor types
        permitQuery.vendorTypes = { $in: vendorTypes };
      }
      
      const permitTypes = await PermitType.find(permitQuery);
      
      // Add any permit types the user doesn't have yet
      for (const pt of permitTypes) {
        if (!existingPermitTypeIds.has(pt._id.toString())) {
          const newPermit = new VendorPermit({
            vendorBusinessId: business._id,
            permitTypeId: pt._id,
            jurisdictionId: jurisdiction._id,
            status: 'missing'
          });
          await newPermit.save();
          existingPermitTypeIds.add(pt._id.toString()); // Prevent duplicates within same sync
          addedCount++;
          
          const populated = await VendorPermit.findById(newPermit._id)
            .populate('permitTypeId')
            .populate('jurisdictionId');
          addedPermits.push(populated);
        }
      }
    }
    
    res.json({ 
      synced: true, 
      addedCount,
      addedPermits,
      message: addedCount > 0 ? `Added ${addedCount} new permit(s) to your dashboard` : 'All permits up to date'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync food handling permits - add or remove based on toggle
app.post('/api/permits/sync-food-handling', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { handlesFood } = req.body;
    
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    let addedCount = 0;
    let removedCount = 0;
    const addedPermits = [];
    const removedPermits = [];
    
    if (handlesFood) {
      // Adding food handling - find and add all food handling permit types
      const existingPermits = await VendorPermit.find({ vendorBusinessId: business._id });
      const existingPermitTypeIds = new Set(existingPermits.map(p => p.permitTypeId.toString()));
      
      // Check each operating city for food handling permit types
      for (const city of (business.operatingCities || [])) {
        const jurisdiction = await Jurisdiction.findOne({
          $or: [
            { city: new RegExp(`^${city.city}$`, 'i'), state: city.state },
            { name: new RegExp(`^${city.city}$`, 'i'), state: city.state }
          ],
          active: true
        });
        
        if (!jurisdiction) continue;
        
        // Find permit types that require food handling
        const foodPermitTypes = await PermitType.find({
          jurisdictionId: jurisdiction._id,
          requiresFoodHandling: true,
          active: true
        });
        
        for (const pt of foodPermitTypes) {
          if (!existingPermitTypeIds.has(pt._id.toString())) {
            const newPermit = new VendorPermit({
              vendorBusinessId: business._id,
              permitTypeId: pt._id,
              jurisdictionId: jurisdiction._id,
              status: 'missing'
            });
            await newPermit.save();
            existingPermitTypeIds.add(pt._id.toString());
            addedCount++;
            
            const populated = await VendorPermit.findById(newPermit._id)
              .populate('permitTypeId')
              .populate('jurisdictionId');
            addedPermits.push(populated);
          }
        }
      }
    } else {
      // Removing food handling - only remove "missing" food permits without documents
      const existingPermits = await VendorPermit.find({ 
        vendorBusinessId: business._id 
      }).populate('permitTypeId');
      
      for (const permit of existingPermits) {
        // Only remove if:
        // 1. The permit type requires food handling
        // 2. The permit status is 'missing' (no data entered yet)
        // 3. The permit has no document attached
        if (permit.permitTypeId?.requiresFoodHandling && 
            permit.status === 'missing' && 
            !permit.documentId) {
          removedPermits.push(permit);
          await VendorPermit.findByIdAndDelete(permit._id);
          removedCount++;
        }
      }
    }
    
    res.json({
      synced: true,
      handlesFood,
      addedCount,
      removedCount,
      addedPermits,
      removedPermits: removedPermits.map(p => p._id),
      message: handlesFood 
        ? (addedCount > 0 ? `Added ${addedCount} food safety permit(s)` : 'No new food permits to add')
        : (removedCount > 0 ? `Removed ${removedCount} unused food permit(s)` : 'No permits removed')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vendor permits (dashboard)
app.get('/api/permits', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const { status, jurisdictionId } = req.query;
    const query = { vendorBusinessId: req.user.vendorBusinessId };
    
    if (status) query.status = status;
    if (jurisdictionId) query.jurisdictionId = jurisdictionId;
    
    const permits = await VendorPermit.find(query)
      .populate('permitTypeId')
      .populate('jurisdictionId', 'name city state type')
      .populate('documentId')
      .populate('documents')
      .sort({ expiryDate: 1 });
    
    // Update statuses based on expiry
    for (const permit of permits) {
      const newStatus = getPermitStatus(permit);
      if (permit.status !== newStatus && permit.status !== 'in_progress') {
        permit.status = newStatus;
        await permit.save();
      }
    }
    
    // Group by jurisdiction
    const grouped = {};
    permits.forEach(permit => {
      const key = permit.jurisdictionId?._id?.toString() || 'other';
      if (!grouped[key]) {
        grouped[key] = {
          jurisdiction: permit.jurisdictionId,
          permits: []
        };
      }
      grouped[key].permits.push(permit);
    });
    
    // Calculate summary
    const summary = {
      total: permits.length,
      active: permits.filter(p => p.status === 'active').length,
      expired: permits.filter(p => p.status === 'expired').length,
      pendingRenewal: permits.filter(p => p.status === 'pending_renewal').length,
      missing: permits.filter(p => p.status === 'missing').length,
      inProgress: permits.filter(p => p.status === 'in_progress').length
    };
    
    res.json({ permits, grouped: Object.values(grouped), summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single permit
app.get('/api/permits/:id', authMiddleware, async (req, res) => {
  try {
    const permit = await VendorPermit.findOne({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    })
      .populate('permitTypeId')
      .populate('jurisdictionId')
      .populate('documentId')
      .populate('documents');
      
    if (!permit) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add permit to dashboard
app.post('/api/permits', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { permitTypeId, jurisdictionId, status, permitNumber, issueDate, expiryDate, notes } = req.body;
    
    // Validate required fields
    if (!permitTypeId) return res.status(400).json({ error: 'Permit type is required' });
    if (!jurisdictionId) return res.status(400).json({ error: 'Jurisdiction is required' });
    
    // Verify permit type and jurisdiction exist
    const permitType = await PermitType.findById(permitTypeId);
    if (!permitType) return res.status(400).json({ error: 'Permit type not found' });
    
    const jurisdiction = await Jurisdiction.findById(jurisdictionId);
    if (!jurisdiction) return res.status(400).json({ error: 'Jurisdiction not found' });
    
    // Check if permit already exists
    const existing = await VendorPermit.findOne({
      vendorBusinessId: req.user.vendorBusinessId,
      permitTypeId
    });
    
    if (existing) {
      return res.status(400).json({ error: 'This permit is already in your dashboard' });
    }
    
    const permit = new VendorPermit({
      vendorBusinessId: req.user.vendorBusinessId,
      permitTypeId,
      jurisdictionId,
      status: status || 'missing',
      permitNumber,
      issueDate,
      expiryDate,
      notes
    });
    
    await permit.save();
    
    const populated = await VendorPermit.findById(permit._id)
      .populate('permitTypeId')
      .populate('jurisdictionId');
    
    res.status(201).json({ permit: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update permit
app.put('/api/permits/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { status, permitNumber, issueDate, expiryDate, notes } = req.body;
    
    const permit = await VendorPermit.findOneAndUpdate(
      { _id: req.params.id, vendorBusinessId: req.user.vendorBusinessId },
      { status, permitNumber, issueDate, expiryDate, notes, updatedAt: Date.now() },
      { new: true }
    )
      .populate('permitTypeId')
      .populate('jurisdictionId')
      .populate('documentId')
      .populate('documents');
    
    if (!permit) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove city and its permits - POST version (more reliable than DELETE with body)
app.post('/api/permits/remove-city', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { city, state } = req.body;
    
    if (!city || !state) {
      return res.status(400).json({ error: 'City and state are required' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Check if this is the primary/only city
    const cityIndex = business.operatingCities.findIndex(
      c => c.city.toLowerCase() === city.toLowerCase() && c.state === state
    );
    
    if (cityIndex === -1) {
      return res.status(404).json({ error: 'City not found in operating cities' });
    }
    
    if (business.operatingCities.length === 1) {
      return res.status(400).json({ error: 'Cannot remove the only operating city. Add another city first.' });
    }
    
    const removedCity = business.operatingCities[cityIndex];
    
    // Check if trying to remove primary city
    if (removedCity.isPrimary) {
      return res.status(400).json({ error: 'Cannot remove your primary city. Please set another city as primary first.' });
    }
    
    // Remove city from business
    business.operatingCities.splice(cityIndex, 1);
    await business.save();
    
    // Find jurisdiction for this city
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ]
    });
    
    let permitsRemoved = 0;
    let documentsPreserved = 0;
    
    if (jurisdiction) {
      // Find all permits for this jurisdiction
      const permits = await VendorPermit.find({
        vendorBusinessId: business._id,
        jurisdictionId: jurisdiction._id
      });
      
      for (const permit of permits) {
        // Check if permit has any documents attached
        const hasDocuments = permit.documentId || (permit.documents && permit.documents.length > 0);
        
        if (hasDocuments) {
          documentsPreserved++;
        }
        // Delete permit regardless - documents in Document collection are preserved
        await VendorPermit.findByIdAndDelete(permit._id);
        permitsRemoved++;
      }
    }
    
    res.json({ 
      message: `City removed. ${permitsRemoved} permit(s) removed.${documentsPreserved > 0 ? ` ${documentsPreserved} document(s) preserved in vault.` : ''}`,
      permitsRemoved,
      documentsPreserved,
      business
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove city and its permits (must be before /:id route)
app.delete('/api/permits/remove-city', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { city, state } = req.body;
    
    if (!city || !state) {
      return res.status(400).json({ error: 'City and state are required' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Check if this is the primary/only city
    const cityIndex = business.operatingCities.findIndex(
      c => c.city.toLowerCase() === city.toLowerCase() && c.state === state
    );
    
    if (cityIndex === -1) {
      return res.status(404).json({ error: 'City not found in operating cities' });
    }
    
    if (business.operatingCities.length === 1) {
      return res.status(400).json({ error: 'Cannot remove the only operating city. Add another city first.' });
    }
    
    const removedCity = business.operatingCities[cityIndex];
    
    // Check if trying to remove primary city
    if (removedCity.isPrimary) {
      return res.status(400).json({ error: 'Cannot remove your primary city. Please set another city as primary first.' });
    }
    
    // Remove city from business
    business.operatingCities.splice(cityIndex, 1);
    await business.save();
    
    // Find jurisdiction for this city
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ]
    });
    
    let permitsRemoved = 0;
    let documentsPreserved = 0;
    
    if (jurisdiction) {
      // Find all permits for this jurisdiction
      const permits = await VendorPermit.find({
        vendorBusinessId: business._id,
        jurisdictionId: jurisdiction._id
      });
      
      for (const permit of permits) {
        // Check if permit has any documents attached
        const hasDocuments = permit.documentId || (permit.documents && permit.documents.length > 0);
        
        if (hasDocuments) {
          documentsPreserved++;
        }
        // Delete permit regardless - documents in Document collection are preserved
        await VendorPermit.findByIdAndDelete(permit._id);
        permitsRemoved++;
      }
    }
    
    res.json({ 
      message: `City removed. ${permitsRemoved} permit(s) removed.${documentsPreserved > 0 ? ` ${documentsPreserved} document(s) preserved in vault.` : ''}`,
      permitsRemoved,
      documentsPreserved,
      business
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete permits by city using query params (must be before /:id route)
app.delete('/api/permits/by-city', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { city, state } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ error: 'City and state are required' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Find jurisdiction for this city
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ]
    });
    
    let removedCount = 0;
    let documentsPreserved = 0;
    
    if (jurisdiction) {
      // Find all permits for this jurisdiction
      const permits = await VendorPermit.find({
        vendorBusinessId: business._id,
        jurisdictionId: jurisdiction._id
      });
      
      for (const permit of permits) {
        // Check if permit has any documents attached
        const hasDocuments = permit.documentId || (permit.documents && permit.documents.length > 0);
        
        if (hasDocuments) {
          documentsPreserved++;
        }
        // Delete permit - documents in Document collection will remain
        await VendorPermit.findByIdAndDelete(permit._id);
        removedCount++;
      }
    }
    
    res.json({ 
      removedCount,
      documentsPreserved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete permit from dashboard
app.delete('/api/permits/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const permit = await VendorPermit.findOneAndDelete({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!permit) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    
    res.json({ message: 'Permit removed from dashboard' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add permits for a city
app.post('/api/permits/add-city', authMiddleware, requireWriteAccess, checkPlanLimit('cities'), async (req, res) => {
  try {
    const { city, state } = req.body;
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ],
      active: true
    });
    
    if (!jurisdiction) {
      // Add city anyway, just no auto permits
      const cityExists = business.operatingCities.find(
        c => c.city.toLowerCase() === city.toLowerCase() && c.state === state
      );
      if (!cityExists) {
        business.operatingCities.push({ city, state, isPrimary: false });
        await business.save();
      }
      return res.json({ message: `${city}, ${state} added. No permit templates found yet — you can track permits manually.`, permitsAdded: 0, business });
    }
    
    const permitTypes = await PermitType.find({
      jurisdictionId: jurisdiction._id,
      vendorTypes: business.primaryVendorType,
      active: true
    });
    
    let added = 0;
    for (const pt of permitTypes) {
      const existing = await VendorPermit.findOne({
        vendorBusinessId: business._id,
        permitTypeId: pt._id
      });
      
      if (!existing) {
        const permit = new VendorPermit({
          vendorBusinessId: business._id,
          permitTypeId: pt._id,
          jurisdictionId: jurisdiction._id,
          status: 'missing'
        });
        await permit.save();
        added++;
      }
    }
    
    // Add to operating cities
    const cityExists = business.operatingCities.find(
      c => c.city.toLowerCase() === city.toLowerCase() && c.state === state
    );
    if (!cityExists) {
      business.operatingCities.push({ city, state, isPrimary: false });
      await business.save();
    }
    
    res.json({ message: `${city}, ${state} added with ${added} permit${added !== 1 ? 's' : ''}.`, permitsAdded: added, business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// DOCUMENT ROUTES
// ===========================================

// Get all documents
app.get('/api/documents', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { vendorBusinessId: req.user.vendorBusinessId };
    
    if (category) query.category = category;
    
    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Enrich documents with permit information
    const enrichedDocuments = await Promise.all(documents.map(async (doc) => {
      const docObj = doc.toObject();
      if (doc.relatedEntityType === 'permit' && doc.relatedEntityId) {
        const permit = await VendorPermit.findById(doc.relatedEntityId)
          .populate('permitTypeId', 'name');
        if (permit) {
          docObj.permitName = permit.permitTypeId?.name || 'Unknown Permit';
          docObj.permitStatus = permit.status;
        }
      }
      return docObj;
    }));
      
    res.json({ documents: enrichedDocuments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
app.post('/api/documents', authMiddleware, requireWriteAccess, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { category, relatedEntityType, relatedEntityId, expiryDate, tags } = req.body;
    
    const document = new Document({
      vendorBusinessId: req.user.vendorBusinessId,
      uploadedBy: req.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `${BASE_URL}/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'other',
      relatedEntityType,
      relatedEntityId,
      expiryDate,
      tags: tags ? JSON.parse(tags) : []
    });
    
    await document.save();
    
    // If related to a permit, update the permit (verify ownership first)
    if (relatedEntityType === 'permit' && relatedEntityId) {
      const permit = await VendorPermit.findOne({
        _id: relatedEntityId,
        vendorBusinessId: req.user.vendorBusinessId
      });
      
      if (permit) {
        // Set documentId if not already set (for backward compatibility)
        if (!permit.documentId) {
          permit.documentId = document._id;
        }
        // Add to documents array
        if (!permit.documents) {
          permit.documents = [];
        }
        permit.documents.push(document._id);
        permit.updatedAt = new Date();
        await permit.save();
      }
    }
    
    res.status(201).json({ document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete('/api/documents/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete file from disk
    const filePath = path.join(__dirname, 'uploads', document.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// APPLICATION AUTOFILL ROUTES
// ===========================================

// Generate autofilled application
app.post('/api/autofill/generate', authMiddleware, checkFeature('autofill'), async (req, res) => {
  try {
    const { permitTypeId } = req.body;
    
    const permitType = await PermitType.findById(permitTypeId)
      .populate('jurisdictionId');
      
    if (!permitType) {
      return res.status(404).json({ error: 'Permit type not found' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    const user = await User.findById(req.userId);
    
    // Create a new PDF with autofilled data
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = 750;
    const lineHeight = 20;
    
    // Header
    page.drawText('VENDOR PERMIT APPLICATION', {
      x: 50,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    y -= lineHeight * 2;
    
    page.drawText(`${permitType.name}`, {
      x: 50,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3)
    });
    y -= lineHeight;
    
    page.drawText(`${permitType.jurisdictionId?.name || ''}, ${permitType.jurisdictionId?.state || ''}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });
    y -= lineHeight * 2;
    
    // Section: Business Information
    page.drawText('BUSINESS INFORMATION', {
      x: 50,
      y,
      size: 12,
      font: boldFont
    });
    y -= lineHeight;
    
    const businessFields = [
      { label: 'Business Name:', value: business.businessName },
      { label: 'DBA Name:', value: business.dbaName || 'N/A' },
      { label: 'EIN:', value: business.ein || 'N/A' },
      { label: 'Business Type:', value: business.primaryVendorType?.replace(/_/g, ' ').toUpperCase() },
      { label: 'Address:', value: `${business.address?.street || ''}, ${business.address?.city || ''}, ${business.address?.state || ''} ${business.address?.zip || ''}` },
      { label: 'Phone:', value: business.phone || user.phone || 'N/A' },
      { label: 'Email:', value: business.email || user.email }
    ];
    
    for (const field of businessFields) {
      page.drawText(field.label, { x: 50, y, size: 10, font: boldFont });
      page.drawText(field.value || '', { x: 180, y, size: 10, font });
      y -= lineHeight;
    }
    
    y -= lineHeight;
    
    // Section: Owner Information
    page.drawText('OWNER INFORMATION', {
      x: 50,
      y,
      size: 12,
      font: boldFont
    });
    y -= lineHeight;
    
    const ownerFields = [
      { label: 'Owner Name:', value: `${user.firstName || ''} ${user.lastName || ''}`.trim() },
      { label: 'Owner Phone:', value: user.phone || 'N/A' },
      { label: 'Owner Email:', value: user.email }
    ];
    
    for (const field of ownerFields) {
      page.drawText(field.label, { x: 50, y, size: 10, font: boldFont });
      page.drawText(field.value || '', { x: 180, y, size: 10, font });
      y -= lineHeight;
    }
    
    y -= lineHeight;
    
    // Section: Vehicle Information (if applicable)
    if (business.vehicleDetails && ['food_truck', 'mobile_retail', 'mobile_bartender', 'mobile_groomer'].includes(business.primaryVendorType)) {
      page.drawText('VEHICLE INFORMATION', {
        x: 50,
        y,
        size: 12,
        font: boldFont
      });
      y -= lineHeight;
      
      const vehicleFields = [
        { label: 'Make/Model:', value: `${business.vehicleDetails.make || ''} ${business.vehicleDetails.model || ''}` },
        { label: 'Year:', value: business.vehicleDetails.year || 'N/A' },
        { label: 'License Plate:', value: business.vehicleDetails.licensePlate || 'N/A' },
        { label: 'VIN:', value: business.vehicleDetails.vin || 'N/A' }
      ];
      
      for (const field of vehicleFields) {
        page.drawText(field.label, { x: 50, y, size: 10, font: boldFont });
        page.drawText(field.value || '', { x: 180, y, size: 10, font });
        y -= lineHeight;
      }
      
      y -= lineHeight;
    }
    
    // Section: Insurance Information
    if (business.insurance) {
      page.drawText('INSURANCE INFORMATION', {
        x: 50,
        y,
        size: 12,
        font: boldFont
      });
      y -= lineHeight;
      
      const insuranceFields = [
        { label: 'Insurance Provider:', value: business.insurance.provider || 'N/A' },
        { label: 'Policy Number:', value: business.insurance.policyNumber || 'N/A' },
        { label: 'Coverage Amount:', value: business.insurance.coverageAmount || 'N/A' },
        { label: 'Expiry Date:', value: business.insurance.expiryDate ? new Date(business.insurance.expiryDate).toLocaleDateString() : 'N/A' }
      ];
      
      for (const field of insuranceFields) {
        page.drawText(field.label, { x: 50, y, size: 10, font: boldFont });
        page.drawText(field.value || '', { x: 180, y, size: 10, font });
        y -= lineHeight;
      }
      
      y -= lineHeight;
    }
    
    // Footer with instructions
    y = 100;
    page.drawText('INSTRUCTIONS:', {
      x: 50,
      y,
      size: 10,
      font: boldFont
    });
    y -= lineHeight;
    
    page.drawText(`Submit this application to: ${permitType.issuingAuthorityName || 'Local Authority'}`, {
      x: 50,
      y,
      size: 9,
      font
    });
    y -= lineHeight;
    
    if (permitType.applicationUrl) {
      page.drawText(`Online submission: ${permitType.applicationUrl}`, {
        x: 50,
        y,
        size: 9,
        font
      });
    }
    
    // Signature line
    y = 50;
    page.drawText('_________________________', { x: 50, y: y + 10, size: 10, font });
    page.drawText('Signature', { x: 50, y, size: 8, font });
    page.drawText('_________________________', { x: 300, y: y + 10, size: 10, font });
    page.drawText('Date', { x: 300, y, size: 8, font });
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    // Sanitize filename - remove slashes, special chars, convert spaces to dashes
    const sanitizedName = permitType.name
      .replace(/[\/\\:*?"<>|]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, '-')           // Replace spaces with dashes
      .toLowerCase()
      .substring(0, 50);              // Limit length
    const fileName = `application-${sanitizedName}-${Date.now()}.pdf`;
    const uploadsDir = path.join(__dirname, 'uploads');
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBytes);
    
    // Save as document
    const document = new Document({
      vendorBusinessId: req.user.vendorBusinessId,
      uploadedBy: req.userId,
      fileName,
      originalName: fileName,
      fileUrl: `${BASE_URL}/uploads/${fileName}`,
      fileType: 'application/pdf',
      fileSize: pdfBytes.length,
      category: 'other',
      tags: ['autofill', 'application']
    });
    await document.save();
    
    res.json({
      message: 'Application generated successfully',
      document,
      downloadUrl: `${BASE_URL}/uploads/${fileName}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// INSPECTION CHECKLIST ROUTES
// ===========================================

// Get available checklists
app.get('/api/checklists', authMiddleware, async (req, res) => {
  try {
    const { jurisdictionId, vendorType, category } = req.query;
    
    // Get user's business to filter checklists by their operating cities
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    
    // Find jurisdictions matching user's operating cities
    let userJurisdictionIds = [];
    if (business?.operatingCities?.length > 0) {
      const jurisdictions = await Jurisdiction.find({
        $or: business.operatingCities.map(city => ({
          $or: [
            { city: new RegExp(`^${city.city}$`, 'i'), state: city.state },
            { name: new RegExp(`^${city.city}$`, 'i'), state: city.state }
          ]
        })),
        active: true
      });
      userJurisdictionIds = jurisdictions.map(j => j._id);
    }
    
    // Build query - only show checklists that:
    // 1. Match user's jurisdictions OR have no jurisdiction (global checklists)
    // 2. Match user's vendor type OR have no vendor type filter
    // 3. Are organization-specific to this business OR are public (no forOrganization)
    let query = { 
      active: true,
      $or: [
        { jurisdictionId: { $in: userJurisdictionIds } },
        { jurisdictionId: null },
        { jurisdictionId: { $exists: false } }
      ]
    };
    
    // Organization filter - only show public checklists or ones for this specific business
    if (business?._id) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { forOrganization: null },
          { forOrganization: { $exists: false } },
          { forOrganization: business._id }
        ]
      });
    }
    
    // Additional filters from query params
    if (jurisdictionId) query.jurisdictionId = jurisdictionId;
    if (vendorType) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { vendorTypes: vendorType },
          { vendorTypes: { $size: 0 } },
          { vendorTypes: { $exists: false } },
          { vendorType: vendorType }, // Legacy field
          { vendorType: null }
        ]
      });
    } else if (business?.primaryVendorType) {
      // Auto-filter by user's vendor type
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { vendorTypes: { $in: [business.primaryVendorType, ...(business.secondaryVendorTypes || [])] } },
          { vendorTypes: { $size: 0 } },
          { vendorTypes: { $exists: false } },
          { vendorType: { $in: [business.primaryVendorType, ...(business.secondaryVendorTypes || [])] } },
          { vendorType: null }
        ]
      });
    }
    if (category) query.category = category;
    
    const checklists = await InspectionChecklist.find(query)
      .populate('jurisdictionId', 'name city state')
      .sort({ name: 1 });
      
    res.json({ checklists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get checklist by ID
app.get('/api/checklists/:id', authMiddleware, async (req, res) => {
  try {
    const checklist = await InspectionChecklist.findById(req.params.id)
      .populate('jurisdictionId');
      
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    
    res.json({ checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create checklist (admin)
app.post('/api/checklists', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, category, items, jurisdictionId } = req.body;
    
    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Checklist name is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Checklist must have at least one item' });
    }
    
    // Validate each item has itemText
    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemText) {
        return res.status(400).json({ error: `Item ${i + 1} is missing itemText` });
      }
    }
    
    const checklist = new InspectionChecklist({ name, category, items, jurisdictionId });
    await checklist.save();
    res.status(201).json({ checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start inspection
app.post('/api/inspections', authMiddleware, requirePremiumFeature('inspectionChecklists'), async (req, res) => {
  try {
    const { checklistId, userChecklistId, items, notes, inspectionDate, location } = req.body;
    
    // items is optional - if not provided, create skeleton from checklist
    let results;
    let overallStatus = 'incomplete';
    
    if (items && items.length > 0) {
      // Use submitted items with pass/fail data
      results = items.map(item => ({
        itemText: item.itemText,
        status: item.passed === true ? 'pass' : item.passed === false ? 'fail' : 'na',
        passed: item.passed,
        notes: item.notes || ''
      }));
      
      // Calculate overall status based on results
      const allEvaluated = results.every(r => r.passed !== null && r.passed !== undefined);
      if (allEvaluated) {
        const anyFailed = results.some(r => r.passed === false);
        overallStatus = anyFailed ? 'fail' : 'pass';
      }
    } else {
      // Fallback: create skeleton from checklist
      const checklist = await InspectionChecklist.findById(checklistId);
      if (!checklist) {
        return res.status(404).json({ error: 'Checklist not found' });
      }
      results = checklist.items.map(item => ({
        itemId: item._id,
        itemText: item.itemText,
        status: 'na',
        passed: null,
        notes: ''
      }));
    }
    
    const inspection = new VendorInspection({
      vendorBusinessId: req.user.vendorBusinessId,
      checklistId: userChecklistId ? undefined : checklistId,
      userChecklistId: userChecklistId || undefined,
      completedBy: req.userId,
      inspectionDate: inspectionDate || new Date(),
      results,
      notes: notes || '',
      overallStatus,
      location
    });
    
    await inspection.save();
    
    // Populate and return
    const populated = await VendorInspection.findById(inspection._id)
      .populate('checklistId', 'name category')
      .populate('userChecklistId', 'name description')
      .populate('completedBy', 'firstName lastName');
    
    res.status(201).json({ inspection: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inspection
app.put('/api/inspections/:id', authMiddleware, requirePremiumFeature('inspectionChecklists'), async (req, res) => {
  try {
    const { results, notes, overallStatus, photos, location } = req.body;
    
    const inspection = await VendorInspection.findOneAndUpdate(
      { _id: req.params.id, vendorBusinessId: req.user.vendorBusinessId },
      { results, notes, overallStatus, photos, location, updatedAt: Date.now() },
      { new: true }
    ).populate('checklistId').populate('userChecklistId', 'name description');
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    res.json({ inspection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's inspections
app.get('/api/inspections', authMiddleware, async (req, res) => {
  try {
    const inspections = await VendorInspection.find({
      vendorBusinessId: req.user.vendorBusinessId
    })
      .populate('checklistId', 'name category')
      .populate('userChecklistId', 'name description')
      .populate('completedBy', 'firstName lastName')
      .sort({ inspectionDate: -1 });
      
    res.json({ inspections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// SUGGESTION/TICKET ROUTES
// ===========================================

// Create a suggestion/ticket
app.post('/api/suggestions', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, cityDetails, checklistDetails } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }
    
    const suggestion = new Suggestion({
      userId: req.userId,
      vendorBusinessId: req.user.vendorBusinessId,
      type,
      title,
      description,
      cityDetails,
      checklistDetails
    });
    
    await suggestion.save();
    res.status(201).json({ suggestion, message: 'Thank you for your suggestion! Our team will review it.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's own suggestions
app.get('/api/suggestions/mine', authMiddleware, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// USER CHECKLIST ROUTES (personal checklists)
// ===========================================

// Get user's personal checklists
app.get('/api/user-checklists', authMiddleware, async (req, res) => {
  try {
    const checklists = await UserChecklist.find({ 
      vendorBusinessId: req.user.vendorBusinessId,
      active: true 
    }).sort({ createdAt: -1 });
    res.json({ checklists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a personal checklist
app.post('/api/user-checklists', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { name, description, category, items } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Checklist name is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Checklist must have at least one item' });
    }
    
    const checklist = new UserChecklist({
      vendorBusinessId: req.user.vendorBusinessId,
      createdBy: req.userId,
      name,
      description,
      category: category || 'custom',
      items
    });
    
    await checklist.save();
    res.status(201).json({ checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a personal checklist
app.put('/api/user-checklists/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const { name, description, category, items, active } = req.body;
    
    const checklist = await UserChecklist.findOneAndUpdate(
      { _id: req.params.id, vendorBusinessId: req.user.vendorBusinessId },
      { name, description, category, items, active, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });
    res.json({ checklist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a personal checklist
app.delete('/api/user-checklists/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const checklist = await UserChecklist.findOneAndDelete({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!checklist) return res.status(404).json({ error: 'Checklist not found' });
    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// EVENT ROUTES
// ===========================================

// Get events
app.get('/api/events', async (req, res) => {
  try {
    const { city, state, eventType, status, startDate, endDate } = req.query;
    const query = {};
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = state;
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    else query.status = { $in: ['published', 'closed'] };
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .limit(50);
      
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's assigned events with readiness status
app.get('/api/events/my-events', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    // Find all events where this vendor is assigned OR has a pending/approved application
    const assignedEvents = await Event.find({
      'assignedVendors.vendorBusinessId': req.user.vendorBusinessId,
      status: { $in: ['draft', 'published', 'closed'] }
    })
      .populate('requiredPermitTypes')
      .populate('organizerId', 'isOrganizer')
      .sort({ startDate: 1 });
    
    const appliedEvents = await Event.find({
      'vendorApplications.vendorBusinessId': req.user.vendorBusinessId,
      'vendorApplications.status': { $in: ['pending', 'approved'] },
      status: { $in: ['draft', 'published', 'closed'] }
    })
      .populate('requiredPermitTypes')
      .populate('organizerId', 'isOrganizer')
      .sort({ startDate: 1 });
    
    // Combine and deduplicate
    const eventMap = new Map();
    [...assignedEvents, ...appliedEvents].forEach(e => {
      if (!eventMap.has(e._id.toString())) eventMap.set(e._id.toString(), e);
    });
    const events = Array.from(eventMap.values());
    
    // Get all vendor's permits
    const vendorPermits = await VendorPermit.find({
      vendorBusinessId: req.user.vendorBusinessId
    }).populate('permitTypeId');
    
    // Calculate readiness for each event
    const eventsWithReadiness = await Promise.all(events.map(async (event) => {
      const requiredPermits = event.requiredPermitTypes || [];
      const issues = [];
      let readyCount = 0;
      
      for (const required of requiredPermits) {
        const vendorPermit = vendorPermits.find(
          vp => vp.permitTypeId?._id.toString() === required._id.toString()
        );
        
        if (!vendorPermit || vendorPermit.status === 'missing') {
          issues.push({ type: 'missing', permit: required.name, permitTypeId: required._id, vendorPermitId: vendorPermit?._id || null });
        } else if (vendorPermit.status === 'expired' || (vendorPermit.expiryDate && new Date(vendorPermit.expiryDate) < event.startDate)) {
          issues.push({ type: 'expired', permit: required.name, permitTypeId: required._id, vendorPermitId: vendorPermit._id });
        } else if (vendorPermit.status === 'in_progress') {
          issues.push({ type: 'in_progress', permit: required.name, permitTypeId: required._id, vendorPermitId: vendorPermit._id });
        } else if (!vendorPermit.documentId) {
          issues.push({ type: 'missing_document', permit: required.name, permitTypeId: required._id, vendorPermitId: vendorPermit._id });
        } else {
          readyCount++;
        }
      }
      
      // Determine overall status
      let readinessStatus = 'ready';
      let readinessLabel = 'Ready';
      let readinessColor = 'success';
      
      if (issues.length > 0) {
        const hasMissing = issues.some(i => i.type === 'missing');
        const hasExpired = issues.some(i => i.type === 'expired');
        const hasMissingDoc = issues.some(i => i.type === 'missing_document');
        const hasInProgress = issues.some(i => i.type === 'in_progress');
        
        if (hasMissing) {
          readinessStatus = 'missing_permit';
          readinessLabel = `Missing: ${issues.filter(i => i.type === 'missing').map(i => i.permit).join(', ')}`;
          readinessColor = 'danger';
        } else if (hasExpired) {
          readinessStatus = 'expired_permit';
          readinessLabel = `Expired: ${issues.filter(i => i.type === 'expired').map(i => i.permit).join(', ')}`;
          readinessColor = 'danger';
        } else if (hasMissingDoc) {
          readinessStatus = 'missing_document';
          readinessLabel = `Missing document: ${issues.filter(i => i.type === 'missing_document').map(i => i.permit).join(', ')}`;
          readinessColor = 'warning';
        } else if (hasInProgress) {
          readinessStatus = 'in_progress';
          readinessLabel = `In progress: ${issues.filter(i => i.type === 'in_progress').map(i => i.permit).join(', ')}`;
          readinessColor = 'warning';
        }
      }
      
      // Determine event source: organizer invitation vs admin/marketplace
      const assignment = event.assignedVendors?.find(av => av.vendorBusinessId.toString() === req.user.vendorBusinessId.toString());
      const application = event.vendorApplications?.find(va => va.vendorBusinessId.toString() === req.user.vendorBusinessId.toString());
      
      // Event is "organizer invited" if an organizer (not admin) added them
      const isOrganizerInvited = event.organizerId?.isOrganizer && assignment && !application;
      // Event is from vendor application (marketplace browse)
      const isFromApplication = !!application;
      // Invitation status
      const invitationStatus = assignment?.status || (application?.status === 'approved' ? 'accepted' : application?.status);
      
      return {
        _id: event._id,
        eventName: event.eventName,
        organizerName: event.organizerName,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        status: event.status,
        requiredPermitTypes: requiredPermits.map(pt => ({ _id: pt._id, name: pt.name })),
        requiredPermitsCount: requiredPermits.length,
        readyCount,
        readinessStatus,
        readinessLabel,
        readinessColor,
        issues,
        // Source information
        eventSource: isOrganizerInvited ? 'organizer_invitation' : isFromApplication ? 'vendor_application' : 'admin_added',
        invitationStatus: invitationStatus
      };
    }));
    
    res.json({ events: eventsWithReadiness });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get published events (for vendors to browse/apply) - MUST be before /api/events/:id
app.get('/api/events/published', authMiddleware, async (req, res) => {
  try {
    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Show events that:
    // 1. Haven't started yet (startDate >= today), OR
    // 2. Are currently ongoing (endDate >= today), OR
    // 3. Single-day events happening today (startDate = today and no endDate)
    const events = await Event.find({
      status: 'published',
      $or: [
        { startDate: { $gte: today } },           // Future events
        { endDate: { $gte: today } },             // Ongoing events with endDate
        { startDate: { $gte: today }, endDate: null }  // Single-day future events
      ]
    })
      .populate('requiredPermitTypes', 'name')
      .sort({ startDate: 1 })
      .limit(50);
    
    // Include vendor's application status for each event
    const vendorBusinessId = req.user.vendorBusinessId;
    const eventsWithApplicationStatus = events.map(e => {
      const eventObj = e.toObject();
      // Check if this vendor has already applied
      const hasApplied = e.vendorApplications?.some(
        app => app.vendorBusinessId?.toString() === vendorBusinessId?.toString() && 
               ['pending', 'approved', 'waitlist'].includes(app.status)
      );
      // Check if vendor is assigned
      const isAssigned = e.assignedVendors?.some(
        av => av.vendorBusinessId?.toString() === vendorBusinessId?.toString()
      );
      eventObj.vendorHasApplied = hasApplied || isAssigned;
      // Don't expose full application data
      delete eventObj.vendorApplications;
      delete eventObj.assignedVendors;
      return eventObj;
    });
      
    res.json({ events: eventsWithApplicationStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event details
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('requiredPermitTypes');
      
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check event readiness
app.get('/api/events/:id/readiness', authMiddleware, requirePremiumFeature('eventIntegration'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('requiredPermitTypes');
      
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get vendor's permits for the event's jurisdiction
    const jurisdiction = await Jurisdiction.findOne({
      city: new RegExp(`^${event.location.city}$`, 'i'),
      state: event.location.state
    });
    
    const vendorPermits = await VendorPermit.find({
      vendorBusinessId: req.user.vendorBusinessId,
      jurisdictionId: jurisdiction?._id
    }).populate('permitTypeId');
    
    const requiredPermits = event.requiredPermitTypes || [];
    const missingPermits = [];
    const expiredPermits = [];
    const validPermits = [];
    
    for (const required of requiredPermits) {
      const vendorPermit = vendorPermits.find(
        vp => vp.permitTypeId?._id.toString() === required._id.toString()
      );
      
      if (!vendorPermit) {
        missingPermits.push(required);
      } else if (vendorPermit.status === 'expired' || (vendorPermit.expiryDate && new Date(vendorPermit.expiryDate) < event.startDate)) {
        expiredPermits.push({ permit: vendorPermit, required });
      } else if (vendorPermit.status === 'active') {
        validPermits.push({ permit: vendorPermit, required });
      } else {
        missingPermits.push(required);
      }
    }
    
    const isReady = missingPermits.length === 0 && expiredPermits.length === 0;
    
    res.json({
      event,
      isReady,
      summary: {
        total: requiredPermits.length,
        valid: validPermits.length,
        missing: missingPermits.length,
        expired: expiredPermits.length
      },
      validPermits,
      missingPermits,
      expiredPermits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== ORGANIZER PORTAL ENDPOINTS ======

// Get organizer's events
app.get('/api/events/organizer/my-events', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const events = await Event.find({ organizerId: req.user._id })
      .populate('requiredPermitTypes')
      .populate('vendorApplications.vendorBusinessId', 'businessName primaryVendorType')
      .populate('assignedVendors.vendorBusinessId', 'businessName primaryVendorType')
      .sort({ startDate: -1 });
      
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get registered vendors for organizer invites
app.get('/api/events/organizer/registered-vendors', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    // Get all vendor businesses with their owners
    const vendors = await VendorBusiness.find({})
      .populate('ownerId', 'email firstName lastName')
      .select('businessName primaryVendorType ownerId')
      .sort({ businessName: 1 })
      .limit(100);
    
    // Format for dropdown
    const formattedVendors = vendors.map(v => ({
      _id: v._id,
      businessName: v.businessName,
      vendorType: v.primaryVendorType,
      email: v.ownerId?.email,
      ownerName: v.ownerId ? `${v.ownerId.firstName} ${v.ownerId.lastName}` : null
    })).filter(v => v.email); // Only include vendors with email
    
    res.json({ vendors: formattedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizer documents
app.get('/api/organizer/documents', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    res.json({ documents: req.user.organizerProfile?.documents || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload organizer document
app.post('/api/organizer/documents', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, category } = req.body;
    
    const doc = {
      name: name || req.file.originalname,
      fileName: req.file.filename,
      fileUrl: `${BASE_URL}/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      category: category || 'other',
      uploadedAt: new Date(),
      status: 'pending'
    };
    
    const user = await User.findById(req.userId);
    if (!user.organizerProfile.documents) {
      user.organizerProfile.documents = [];
    }
    user.organizerProfile.documents.push(doc);
    await user.save();
    
    res.status(201).json({ document: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete organizer document
app.delete('/api/organizer/documents/:index', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const index = parseInt(req.params.index);
    const user = await User.findById(req.userId);
    
    if (!user.organizerProfile?.documents || index >= user.organizerProfile.documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    user.organizerProfile.documents.splice(index, 1);
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizer verification status
app.get('/api/organizer/verification-status', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const profile = req.user.organizerProfile || {};
    res.json({
      verified: profile.verified || false,
      verificationStatus: profile.verificationStatus || 'pending',
      verificationNotes: profile.verificationNotes || null,
      documentsCount: (profile.documents || []).length,
      documentsApproved: (profile.documents || []).filter(d => d.status === 'approved').length,
      documentsPending: (profile.documents || []).filter(d => d.status === 'pending').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload event proof document
app.post('/api/events/organizer/:id/proof', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const { name, category } = req.body;
    
    const doc = {
      name: name || req.file.originalname,
      fileName: req.file.filename,
      fileUrl: `${BASE_URL}/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      category: category || 'other',
      uploadedAt: new Date(),
      status: 'pending'
    };
    
    if (!event.proofDocuments) {
      event.proofDocuments = [];
    }
    event.proofDocuments.push(doc);
    
    // Update verification status if documents uploaded
    if (event.verificationStatus === 'info_needed') {
      event.verificationStatus = 'pending';
    }
    
    await event.save();
    
    res.status(201).json({ document: doc, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get previous event proofs for reuse
app.get('/api/events/organizer/previous-proofs', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    // Get all events by this organizer that have proof documents
    const events = await Event.find({ 
      organizerId: req.user._id,
      'proofDocuments.0': { $exists: true } // Has at least one proof document
    }).select('eventName proofDocuments');
    
    // Flatten all proofs with event info
    const proofs = [];
    for (const event of events) {
      for (const proof of event.proofDocuments || []) {
        if (proof.status === 'approved' || proof.status === 'pending') {
          proofs.push({
            _id: `${event._id}-${proof._id}`,
            eventId: event._id,
            eventName: event.eventName,
            proofId: proof._id,
            name: proof.name,
            category: proof.category,
            fileUrl: proof.fileUrl,
            status: proof.status
          });
        }
      }
    }
    
    res.json({ proofs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Copy proofs from previous events
app.post('/api/events/organizer/:id/copy-proofs', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const { proofIds } = req.body;
    if (!proofIds || proofIds.length === 0) {
      return res.status(400).json({ error: 'No proof IDs provided' });
    }
    
    // Parse proof IDs (format: eventId-proofId)
    for (const combinedId of proofIds) {
      const [sourceEventId, sourceProofId] = combinedId.split('-');
      const sourceEvent = await Event.findOne({ _id: sourceEventId, organizerId: req.user._id });
      if (sourceEvent) {
        const sourceProof = sourceEvent.proofDocuments?.find(p => p._id.toString() === sourceProofId);
        if (sourceProof) {
          // Copy the proof to the new event
          if (!event.proofDocuments) event.proofDocuments = [];
          event.proofDocuments.push({
            name: sourceProof.name,
            fileName: sourceProof.fileName,
            fileUrl: sourceProof.fileUrl,
            fileType: sourceProof.fileType,
            category: sourceProof.category,
            uploadedAt: new Date(),
            status: 'pending', // Needs re-approval for new event
            reviewNotes: `Copied from event: ${sourceEvent.eventName}`
          });
        }
      }
    }
    
    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (organizer)
app.post('/api/events/organizer/create', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    if (req.user.organizerProfile?.disabled) {
      return res.status(403).json({ error: 'Your organizer account has been disabled' });
    }
    
    const { eventName, description, startDate, endDate, location, city, state, address, eventType, maxVendors, applicationDeadline, feeStructure, requiredPermitTypes, customPermitRequirements, status } = req.body;
    
    // Unverified organizers can only create drafts
    const isVerified = req.user.organizerProfile?.verified;
    if (!isVerified && status === 'published') {
      return res.status(403).json({ error: 'Your organizer account must be verified by PermitWise to publish events. You can save events as drafts while awaiting verification.' });
    }
    
    if (!eventName) return res.status(400).json({ error: 'Event name is required' });
    if (!startDate) return res.status(400).json({ error: 'Start date is required' });
    if (!city || !state) return res.status(400).json({ error: 'City and state are required' });
    
    const event = new Event({
      organizerId: req.user._id,
      organizerName: req.user.organizerProfile?.companyName || `${req.user.firstName} ${req.user.lastName}`,
      organizerContact: {
        email: req.user.email,
        phone: req.user.organizerProfile?.phone,
        website: req.user.organizerProfile?.website
      },
      eventName,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      location: location || { city, state, address },
      eventType: eventType || 'other',
      maxVendors: maxVendors ? parseInt(maxVendors) : null,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      feeStructure: feeStructure || {},
      requiredPermitTypes: requiredPermitTypes || [],
      customPermitRequirements: customPermitRequirements || [],
      status: status || 'draft'
    });
    
    await event.save();
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event status (organizer)
app.put('/api/events/organizer/:id/status', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    // Check verification for publishing
    const isVerified = req.user.organizerProfile?.verified;
    if (!isVerified && req.body.status === 'published') {
      return res.status(403).json({ error: 'Your organizer account must be verified by PermitWise to publish events.' });
    }
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    event.status = req.body.status;
    event.updatedAt = new Date();
    await event.save();
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel event with vendor notifications
app.put('/api/events/organizer/:id/cancel', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const { reason } = req.body;
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id })
      .populate('vendorApplications.vendorBusinessId')
      .populate('assignedVendors.vendorBusinessId');
      
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.status === 'cancelled') {
      return res.status(400).json({ error: 'Event is already cancelled' });
    }
    
    // Check if event has already started
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate <= today) {
      return res.status(400).json({ error: 'Cannot cancel an event that has already started or passed. Use "Close" to mark it as completed instead.' });
    }
    
    // Require a cancellation reason
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'A cancellation reason is required' });
    }
    
    // Get all vendors to notify (approved vendors and pending applicants)
    const vendorsToNotify = new Set();
    
    // Add approved/assigned vendors
    for (const vendor of (event.assignedVendors || [])) {
      if (vendor.vendorBusinessId?.ownerId) {
        const owner = await User.findById(vendor.vendorBusinessId.ownerId);
        if (owner?.email) vendorsToNotify.add(owner.email);
      }
    }
    
    // Add applicants
    for (const app of (event.vendorApplications || [])) {
      if (app.vendorBusinessId?.ownerId) {
        const owner = await User.findById(app.vendorBusinessId.ownerId);
        if (owner?.email) vendorsToNotify.add(owner.email);
      }
    }
    
    // Update event status
    event.status = 'cancelled';
    event.cancelledAt = new Date();
    event.cancelledBy = req.user._id;
    event.cancellationReason = reason.trim();
    event.updatedAt = new Date();
    await event.save();
    
    // Send cancellation emails
    const emailPromises = Array.from(vendorsToNotify).map(email => {
      return sendEmail(
        email,
        `Event Cancelled: ${event.eventName}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Event Cancellation Notice</h2>
            <p>We regret to inform you that the following event has been cancelled by the organizer:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${event.eventName}</h3>
              <p style="margin: 4px 0; color: #666;">📅 Originally scheduled: ${new Date(event.startDate).toLocaleDateString()}</p>
              <p style="margin: 4px 0; color: #666;">📍 Location: ${event.location?.city}, ${event.location?.state}</p>
            </div>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; font-weight: bold;">Reason for Cancellation:</p>
              <p style="margin: 8px 0 0 0;">${reason.trim()}</p>
            </div>
            <p>If you have any questions, please contact the event organizer directly.</p>
            <p style="color: #666; margin-top: 24px;">— The PermitWise Team</p>
          </div>
        `
      ).catch(err => console.error('Failed to send cancellation email to', email, err.message || err));
    });
    
    await Promise.all(emailPromises);
    
    res.json({ event, notifiedCount: vendorsToNotify.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit event (organizer) - full update
app.put('/api/events/organizer/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check verification for publishing
    const isVerified = req.user.organizerProfile?.verified;
    if (!isVerified && req.body.status === 'published') {
      return res.status(403).json({ error: 'Your organizer account must be verified by PermitWise to publish events.' });
    }
    
    const { eventName, description, startDate, endDate, applicationDeadline, location, eventType, maxVendors, status, feeStructure, requiredPermitTypes, customPermitRequirements } = req.body;
    
    // Update all fields
    if (eventName) event.eventName = eventName;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (applicationDeadline) event.applicationDeadline = new Date(applicationDeadline);
    if (location) event.location = location;
    if (eventType) event.eventType = eventType;
    if (maxVendors !== undefined) event.maxVendors = maxVendors ? parseInt(maxVendors) : null;
    if (status) event.status = status;
    if (feeStructure) event.feeStructure = feeStructure;
    if (requiredPermitTypes !== undefined) event.requiredPermitTypes = requiredPermitTypes;
    if (customPermitRequirements !== undefined) event.customPermitRequirements = customPermitRequirements;
    
    event.updatedAt = new Date();
    await event.save();
    
    // Populate for response
    await event.populate('requiredPermitTypes');
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event applications (organizer)
app.get('/api/events/organizer/:id/applications', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id })
      .populate('vendorApplications.vendorBusinessId', 'businessName primaryVendorType')
      .populate('assignedVendors.vendorBusinessId', 'businessName primaryVendorType')
      .populate('requiredPermitTypes');
      
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Calculate compliance status for each application
    const applications = await Promise.all([
      ...(event.vendorApplications || []).map(async (app) => {
        const vendorPermits = await VendorPermit.find({ vendorBusinessId: app.vendorBusinessId?._id }).populate('permitTypeId');
        const requiredIds = (event.requiredPermitTypes || []).map(p => p._id.toString());
        const vendorPermitTypeIds = vendorPermits.filter(vp => vp.status === 'active').map(vp => vp.permitTypeId?._id.toString());
        const missingPermits = requiredIds.filter(id => !vendorPermitTypeIds.includes(id));
        
        return {
          ...app.toObject(),
          complianceStatus: missingPermits.length === 0 ? 'ready' : missingPermits.length < requiredIds.length / 2 ? 'partial' : 'missing',
          missingPermits
        };
      }),
      ...(event.assignedVendors || []).filter(av => av.status === 'invited').map(async (inv) => {
        return {
          _id: inv._id,
          vendorBusinessId: inv.vendorBusinessId,
          status: 'invited',
          appliedAt: inv.assignedAt,
          isInvitation: true
        };
      })
    ]);
    
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle vendor application (organizer)
app.put('/api/events/organizer/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const { status, organizerNotes, boothAssignment } = req.body;
    
    // Find the event containing this application
    const event = await Event.findOne({
      organizerId: req.user._id,
      'vendorApplications._id': req.params.applicationId
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = event.vendorApplications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    if (organizerNotes) application.organizerNotes = organizerNotes;
    if (boothAssignment) application.boothAssignment = boothAssignment;
    
    // If approved, add to assigned vendors
    if (status === 'approved') {
      if (!event.assignedVendors.find(av => av.vendorBusinessId.toString() === application.vendorBusinessId.toString())) {
        event.assignedVendors.push({
          vendorBusinessId: application.vendorBusinessId,
          status: 'accepted',
          assignedAt: new Date(),
          invitedBy: req.user._id
        });
      }
    }
    
    await event.save();
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite vendor to event (organizer)
app.post('/api/events/organizer/:id/invite', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    
    const { email, vendorBusinessId } = req.body;
    
    const event = await Event.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    let business;
    if (vendorBusinessId) {
      business = await VendorBusiness.findById(vendorBusinessId);
    } else if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user?.vendorBusinessId) {
        business = await VendorBusiness.findById(user.vendorBusinessId);
      }
    }
    
    if (!business) {
      return res.status(404).json({ error: 'Vendor business not found' });
    }
    
    // Check if already invited or applied
    const alreadyInvited = event.assignedVendors.find(av => av.vendorBusinessId.toString() === business._id.toString());
    const alreadyApplied = event.vendorApplications.find(va => va.vendorBusinessId.toString() === business._id.toString());
    
    if (alreadyInvited || alreadyApplied) {
      return res.status(400).json({ error: 'Vendor already invited or has applied' });
    }
    
    event.assignedVendors.push({
      vendorBusinessId: business._id,
      status: 'invited',
      assignedAt: new Date(),
      invitedBy: req.user._id
    });
    
    await event.save();
    
    // TODO: Send email notification to vendor
    
    res.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== VENDOR EVENT ENDPOINTS ======

// Apply to event (vendor)
app.post('/api/events/:id/apply', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'You need a business profile to apply' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ error: 'This event is not accepting applications' });
    }
    
    if (event.applicationDeadline && new Date() > new Date(event.applicationDeadline)) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }
    
    // Check if already applied
    const alreadyApplied = event.vendorApplications.find(
      va => va.vendorBusinessId?.toString() === req.user.vendorBusinessId.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied to this event' });
    }
    
    // Check if already invited
    const alreadyInvited = event.assignedVendors.find(
      av => av.vendorBusinessId?.toString() === req.user.vendorBusinessId.toString()
    );
    if (alreadyInvited) {
      return res.status(400).json({ error: 'You have already been invited to this event' });
    }
    
    // Check max vendors capacity
    if (event.maxVendors) {
      const approvedCount = event.vendorApplications.filter(a => a.status === 'approved').length;
      const assignedCount = event.assignedVendors.filter(a => a.status === 'accepted').length;
      if ((approvedCount + assignedCount) >= event.maxVendors) {
        return res.status(400).json({ error: 'This event has reached maximum vendor capacity' });
      }
    }
    
    event.vendorApplications.push({
      vendorBusinessId: req.user.vendorBusinessId,
      userId: req.user._id,
      status: 'pending',
      appliedAt: new Date(),
      applicationNotes: req.body.applicationNotes || ''
    });
    
    await event.save();
    res.json({ success: true, message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to event invitation (vendor)
app.put('/api/events/:id/respond-invitation', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const invitation = event.assignedVendors.find(
      av => av.vendorBusinessId.toString() === req.user.vendorBusinessId.toString() && av.status === 'invited'
    );
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    invitation.status = req.body.accept ? 'accepted' : 'declined';
    invitation.respondedAt = new Date();
    
    await event.save();
    res.json({ success: true, status: invitation.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw from event (vendor)
app.delete('/api/events/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const event = await Event.findById(req.params.id).populate('organizerId', 'email name');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    const vendorName = business?.businessName || 'A vendor';
    const reason = req.body?.reason || 'No reason provided';
    
    // Check if vendor is in assignedVendors
    const assignedIndex = event.assignedVendors.findIndex(
      av => av.vendorBusinessId.toString() === req.user.vendorBusinessId.toString()
    );
    
    // Check if vendor has an application
    const applicationIndex = event.vendorApplications.findIndex(
      va => va.vendorBusinessId.toString() === req.user.vendorBusinessId.toString()
    );
    
    if (assignedIndex === -1 && applicationIndex === -1) {
      return res.status(404).json({ error: 'You are not part of this event' });
    }
    
    // Remove from both arrays if present
    if (assignedIndex !== -1) {
      event.assignedVendors.splice(assignedIndex, 1);
    }
    if (applicationIndex !== -1) {
      // Mark application as withdrawn instead of removing completely
      event.vendorApplications[applicationIndex].status = 'withdrawn';
      event.vendorApplications[applicationIndex].withdrawnAt = new Date();
      event.vendorApplications[applicationIndex].withdrawalReason = reason;
    }
    
    await event.save();
    
    // Send email notification to organizer
    if (event.organizerId?.email) {
      try {
        await sendEmail(
          event.organizerId.email,
          `Vendor Withdrawal: ${event.eventName}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Vendor Withdrawal Notice</h2>
              <p><strong>${vendorName}</strong> has withdrawn from your event <strong>${event.eventName}</strong>.</p>
              ${reason && reason !== 'No reason provided' ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p style="margin-top: 20px; color: #666;">
                <small>Date of Event: ${new Date(event.startDate).toLocaleDateString()}</small><br>
                <small>Location: ${event.location?.city}, ${event.location?.state}</small>
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">This is an automated notification from PermitWise.</p>
            </div>
          `
        );
      } catch (emailErr) {
        console.error('Failed to send withdrawal notification email:', emailErr.message || emailErr);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ success: true, message: 'Successfully withdrawn from event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark custom requirement as complete (vendor)
app.put('/api/events/:id/custom-requirement/:index', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const requirementIndex = parseInt(req.params.index);
    const { completed, notes } = req.body;
    
    // Check if requirement exists
    if (!event.customPermitRequirements || requirementIndex >= event.customPermitRequirements.length) {
      return res.status(404).json({ error: 'Custom requirement not found' });
    }
    
    // Find vendor in assignedVendors or vendorApplications
    let vendorEntry = event.assignedVendors.find(
      av => av.vendorBusinessId.toString() === req.user.vendorBusinessId.toString()
    );
    
    if (!vendorEntry) {
      vendorEntry = event.vendorApplications.find(
        va => va.vendorBusinessId.toString() === req.user.vendorBusinessId.toString() && va.status === 'approved'
      );
    }
    
    if (!vendorEntry) {
      return res.status(403).json({ error: 'You are not assigned to this event' });
    }
    
    // Initialize customRequirementCompletions array if needed
    if (!vendorEntry.customRequirementCompletions) {
      vendorEntry.customRequirementCompletions = [];
    }
    
    // Find or create the completion record
    let completion = vendorEntry.customRequirementCompletions.find(c => c.requirementIndex === requirementIndex);
    
    if (completion) {
      completion.completed = completed;
      completion.completedAt = completed ? new Date() : null;
      if (notes) completion.notes = notes;
    } else {
      vendorEntry.customRequirementCompletions.push({
        requirementIndex,
        completed,
        completedAt: completed ? new Date() : null,
        notes: notes || ''
      });
    }
    
    await event.save();
    res.json({ success: true, completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all permit types (for event creation)
app.get('/api/permit-types/all', authMiddleware, async (req, res) => {
  try {
    const permitTypes = await PermitType.find({ active: true })
      .populate('jurisdictionId', 'city state')
      .sort({ name: 1 })
      .limit(200);
      
    res.json({ permitTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (admin only - not marketplace-style)
app.post('/api/events', masterAdminMiddleware, async (req, res) => {
  try {
    const { organizerName, eventName, location, startDate, endDate, eventType, vendorSpots, vendorFee, applicationDeadline, description } = req.body;
    
    // Validate required fields
    if (!organizerName) return res.status(400).json({ error: 'Organizer name is required' });
    if (!eventName) return res.status(400).json({ error: 'Event name is required' });
    if (!location?.city) return res.status(400).json({ error: 'Event city is required' });
    if (!location?.state) return res.status(400).json({ error: 'Event state is required' });
    if (!startDate) return res.status(400).json({ error: 'Start date is required' });
    if (!endDate) return res.status(400).json({ error: 'End date is required' });
    
    const event = new Event({
      organizerId: req.userId,
      organizerName,
      eventName,
      location,
      startDate,
      endDate,
      eventType,
      vendorSpots,
      vendorFee,
      applicationDeadline,
      description
    });
    await event.save();
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ORGANIZER PORTAL ROUTES
// ===========================================

// Middleware to check if user is an organizer
const organizerMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer access required' });
    }
    if (user.organizerProfile?.disabled) {
      return res.status(403).json({ error: 'Your organizer account has been disabled' });
    }
    req.organizer = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register as organizer (or update organizer profile)
app.post('/api/organizer/register', authMiddleware, async (req, res) => {
  try {
    const { companyName, description, website, phone } = req.body;
    
    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        isOrganizer: true,
        organizerProfile: {
          companyName,
          description,
          website,
          phone,
          verified: false,
          disabled: false
        }
      },
      { new: true }
    );
    
    res.json({ user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NOTE: Unused duplicate organizer routes removed. All organizer event operations use /api/events/organizer/* routes

// ===========================================
// ATTENDING EVENT ROUTES (Self-tracked events)
// ===========================================

// Get all attending events for vendor
app.get('/api/attending-events', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const attendingEvents = await AttendingEvent.find({
      vendorBusinessId: req.user.vendorBusinessId
    }).sort({ startDate: 1 });
    
    // Calculate readiness for each event
    const vendorPermits = await VendorPermit.find({
      vendorBusinessId: req.user.vendorBusinessId
    }).populate('permitTypeId');
    
    const eventsWithReadiness = attendingEvents.map(ae => {
      const aeObj = ae.toObject();
      const totalItems = (aeObj.requiredPermits?.length || 0) + (aeObj.complianceChecklist?.length || 0);
      const completedPermits = (aeObj.requiredPermits || []).filter(p => p.status === 'obtained' || p.status === 'not_applicable').length;
      const completedChecklist = (aeObj.complianceChecklist || []).filter(c => c.completed).length;
      const completedItems = completedPermits + completedChecklist;
      
      // Auto-link vendor permits if permitTypeId matches
      aeObj.requiredPermits = (aeObj.requiredPermits || []).map(rp => {
        if (rp.permitTypeId) {
          const vp = vendorPermits.find(vp => vp.permitTypeId?._id.toString() === rp.permitTypeId.toString());
          if (vp) {
            rp.linkedPermitStatus = vp.status;
            rp.linkedPermitExpiry = vp.expiryDate;
          }
        }
        return rp;
      });
      
      let readinessStatus = 'ready';
      let readinessColor = 'success';
      if (totalItems === 0) {
        readinessStatus = 'no_requirements';
        readinessColor = 'warning';
      } else if (completedItems < totalItems) {
        const needed = (aeObj.requiredPermits || []).filter(p => p.status === 'needed').length;
        if (needed > 0) {
          readinessStatus = 'permits_needed';
          readinessColor = 'danger';
        } else {
          readinessStatus = 'in_progress';
          readinessColor = 'warning';
        }
      }
      
      return {
        ...aeObj,
        readinessStatus,
        readinessColor,
        totalItems,
        completedItems,
        completedPermits,
        completedChecklist
      };
    });
    
    res.json({ attendingEvents: eventsWithReadiness });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create attending event
app.post('/api/attending-events', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const {
      eventName, organizerName, description, location,
      startDate, endDate, eventType, requiredPermits,
      complianceChecklist, notes
    } = req.body;
    
    if (!eventName || !startDate) {
      return res.status(400).json({ error: 'Event name and start date are required' });
    }
    
    const attendingEvent = new AttendingEvent({
      vendorBusinessId: req.user.vendorBusinessId,
      createdBy: req.userId,
      eventName,
      organizerName,
      description,
      location,
      startDate,
      endDate,
      eventType: eventType || 'other',
      requiredPermits: requiredPermits || [],
      complianceChecklist: complianceChecklist || [],
      notes
    });
    
    await attendingEvent.save();
    res.status(201).json({ attendingEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attending event
app.put('/api/attending-events/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const attendingEvent = await AttendingEvent.findOne({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!attendingEvent) {
      return res.status(404).json({ error: 'Attending event not found' });
    }
    
    const updates = req.body;
    delete updates._id;
    delete updates.vendorBusinessId;
    delete updates.createdBy;
    updates.updatedAt = Date.now();
    
    // Explicitly set arrays so Mongoose detects changes on subdocument arrays
    if (updates.requiredPermits !== undefined) {
      attendingEvent.requiredPermits = updates.requiredPermits;
      delete updates.requiredPermits;
    }
    if (updates.complianceChecklist !== undefined) {
      attendingEvent.complianceChecklist = updates.complianceChecklist;
      delete updates.complianceChecklist;
    }
    if (updates.location !== undefined) {
      attendingEvent.location = updates.location;
      delete updates.location;
    }
    
    Object.assign(attendingEvent, updates);
    attendingEvent.markModified('requiredPermits');
    attendingEvent.markModified('complianceChecklist');
    attendingEvent.markModified('location');
    await attendingEvent.save();
    
    res.json({ attendingEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific permit status on attending event
app.put('/api/attending-events/:id/permit/:permitIndex', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const attendingEvent = await AttendingEvent.findOne({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!attendingEvent) {
      return res.status(404).json({ error: 'Attending event not found' });
    }
    
    const index = parseInt(req.params.permitIndex);
    if (index < 0 || index >= attendingEvent.requiredPermits.length) {
      return res.status(400).json({ error: 'Invalid permit index' });
    }
    
    const { status, notes } = req.body;
    if (status) attendingEvent.requiredPermits[index].status = status;
    if (notes !== undefined) attendingEvent.requiredPermits[index].notes = notes;
    attendingEvent.updatedAt = Date.now();
    
    attendingEvent.markModified('requiredPermits');
    await attendingEvent.save();
    res.json({ attendingEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a specific checklist item on attending event
app.put('/api/attending-events/:id/checklist/:checkIndex', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const attendingEvent = await AttendingEvent.findOne({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!attendingEvent) {
      return res.status(404).json({ error: 'Attending event not found' });
    }
    
    const index = parseInt(req.params.checkIndex);
    if (index < 0 || index >= attendingEvent.complianceChecklist.length) {
      return res.status(400).json({ error: 'Invalid checklist index' });
    }
    
    const { completed, notes } = req.body;
    if (completed !== undefined) {
      attendingEvent.complianceChecklist[index].completed = completed;
      attendingEvent.complianceChecklist[index].completedAt = completed ? new Date() : null;
    }
    if (notes !== undefined) attendingEvent.complianceChecklist[index].notes = notes;
    attendingEvent.updatedAt = Date.now();
    
    attendingEvent.markModified('complianceChecklist');
    await attendingEvent.save();
    res.json({ attendingEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attending event
app.delete('/api/attending-events/:id', authMiddleware, async (req, res) => {
  try {
    const attendingEvent = await AttendingEvent.findOneAndDelete({
      _id: req.params.id,
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!attendingEvent) {
      return res.status(404).json({ error: 'Attending event not found' });
    }
    
    res.json({ message: 'Attending event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document for event application
app.post('/api/events/:id/documents', authMiddleware, requireWriteAccess, upload.single('file'), async (req, res) => {
  try {
    const { name } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const application = event.vendorApplications.find(
      a => a.vendorBusinessId?.toString() === req.user.vendorBusinessId?.toString()
    );
    
    if (!application) {
      return res.status(404).json({ error: 'No application found for your business' });
    }
    
    if (!application.uploadedDocuments) {
      application.uploadedDocuments = [];
    }
    
    application.uploadedDocuments.push({
      name: name || req.file?.originalname,
      url: req.file?.path || req.file?.location, // Depending on storage
      uploadedAt: Date.now()
    });
    
    await event.save();
    res.json({ message: 'Document uploaded', application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// NOTIFICATION ROUTES
// ===========================================

// Get notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { userId: req.userId };
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    const notifications = await Notification.find(query)
      .sort({ sendAt: -1 })
      .limit(50);
      
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule notification
app.post('/api/notifications', authMiddleware, requireActiveSubscription, async (req, res) => {
  try {
    const { type, channelAddress, subject, message, sendAt, relatedVendorPermitId } = req.body;
    
    // Validate required fields
    if (!type) return res.status(400).json({ error: 'Notification type is required (email, sms, or push)' });
    if (!['email', 'sms', 'push'].includes(type)) return res.status(400).json({ error: 'Type must be email, sms, or push' });
    if (!channelAddress) return res.status(400).json({ error: 'Channel address is required (email or phone number)' });
    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (!sendAt) return res.status(400).json({ error: 'Send date/time is required' });
    
    // Validate permit ownership if provided
    if (relatedVendorPermitId) {
      const permit = await VendorPermit.findOne({
        _id: relatedVendorPermitId,
        vendorBusinessId: req.user.vendorBusinessId
      });
      if (!permit) {
        return res.status(403).json({ error: 'Permit not found or access denied' });
      }
    }
    
    const notification = new Notification({
      vendorBusinessId: req.user.vendorBusinessId,
      userId: req.userId,
      type,
      channelAddress,
      subject,
      message,
      sendAt: new Date(sendAt),
      relatedVendorPermitId
    });
    
    await notification.save();
    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// SUBSCRIPTION/STRIPE ROUTES
// ===========================================

// Get subscription
app.get('/api/subscription', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status (for mobile purchase restore)
app.get('/api/subscription/status', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.json({ 
        hasSubscription: false, 
        status: 'no_business',
        message: 'No business profile found'
      });
    }
    
    const subscription = await Subscription.findOne({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!subscription) {
      return res.json({ 
        hasSubscription: false, 
        status: 'none',
        message: 'No subscription found'
      });
    }
    
    const isActive = isSubscriptionActive(subscription);
    const status = await getSubscriptionStatus(req.user.vendorBusinessId);
    
    res.json({ 
      hasSubscription: true,
      isActive,
      plan: subscription.plan,
      status: subscription.status,
      expiresAt: subscription.currentPeriodEnd,
      features: subscription.features,
      canWrite: status.canWrite,
      isExpired: status.isExpired,
      daysRemaining: status.daysRemaining
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create checkout session
app.post('/api/subscription/checkout', authMiddleware, requireRole('owner'), async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!STRIPE_ENABLED || !stripe) {
      if (!STRIPE_ENABLED) {
        // Test mode — activate vendor subscription directly without payment
        console.warn(`[STRIPE BYPASS] Vendor checkout skipped — activating plan=${plan} directly`);
        await Subscription.findOneAndUpdate(
          { vendorBusinessId: req.user.vendorBusinessId },
          {
            vendorBusinessId: req.user.vendorBusinessId, userId: req.userId, plan,
            status: 'active', features: PLAN_FEATURES[plan] || PLAN_FEATURES.basic,
            currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            pendingPlanChange: null, pendingPlanChangeDate: null,
            gracePeriodEndsAt: null, lastPaymentFailedAt: null, paymentFailureCount: 0, updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
        return res.json({ url: `${CLIENT_URL}/settings/billing?success=true` });
      }
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan — set STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO, STRIPE_PRICE_ELITE env vars' });
    }
    
    const user = await User.findById(req.userId);
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    
    // Create or get Stripe customer
    let subscription = await Subscription.findOne({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    let customerId = subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          vendorBusinessId: req.user.vendorBusinessId.toString(),
          userId: req.userId.toString()
        }
      });
      customerId = customer.id;
      
      if (subscription) {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${CLIENT_URL}/settings/billing?success=true`,
      cancel_url: `${CLIENT_URL}/settings/billing?canceled=true`,
      metadata: {
        plan,
        vendorBusinessId: req.user.vendorBusinessId.toString(),
        userId: req.userId.toString()
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create billing portal session
app.post('/api/subscription/portal', authMiddleware, requireRole('owner'), async (req, res) => {
  try {
    if (!STRIPE_ENABLED || !stripe) {
      if (!STRIPE_ENABLED) {
        console.warn('[STRIPE BYPASS] Billing portal skipped — Stripe disabled');
        return res.json({ url: null, message: 'Stripe is in test mode. Manage subscriptions via the admin panel.' });
      }
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    const subscription = await Subscription.findOne({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing account found' });
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${CLIENT_URL}/settings/billing`
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change subscription plan (upgrade or downgrade)
app.post('/api/subscription/change-plan', authMiddleware, requireRole('owner'), async (req, res) => {
  try {
    const { plan: newPlan } = req.body;
    if (!['basic', 'pro', 'elite'].includes(newPlan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    if (!subscription) {
      return res.status(400).json({ error: 'No subscription found', needsCheckout: true });
    }

    const currentPlan = subscription.plan;
    if (currentPlan === newPlan) {
      return res.status(400).json({ error: 'You are already on this plan' });
    }

    // If subscription is not active, redirect to checkout
    if (!['active', 'grace_period'].includes(subscription.status)) {
      return res.json({ needsCheckout: true, message: 'Please complete checkout to start your subscription' });
    }

    const currentRank = PLAN_RANK[currentPlan] || 0;
    const newRank = PLAN_RANK[newPlan] || 0;
    const isUpgrade = newRank > currentRank;

    if (!STRIPE_ENABLED || !stripe) {
      // --- TEST MODE ---
      if (isUpgrade) {
        // Upgrade: switch immediately
        subscription.plan = newPlan;
        subscription.features = PLAN_FEATURES[newPlan] || PLAN_FEATURES.basic;
        subscription.pendingPlanChange = null;
        subscription.pendingPlanChangeDate = null;
        subscription.updatedAt = new Date();
        await subscription.save();
        return res.json({ 
          success: true, action: 'upgrade', plan: newPlan,
          message: `Upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}! Your new features are active now.`
        });
      } else {
        // Downgrade: schedule for end of period, keep current features
        subscription.pendingPlanChange = newPlan;
        subscription.pendingPlanChangeDate = new Date();
        subscription.updatedAt = new Date();
        await subscription.save();
        return res.json({ 
          success: true, action: 'downgrade', plan: newPlan,
          effectiveDate: subscription.currentPeriodEnd,
          message: `Your plan will change to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You'll keep your current features until then.`
        });
      }
    }

    // --- STRIPE MODE ---
    if (!subscription.stripeSubscriptionId) {
      return res.json({ needsCheckout: true, message: 'Please complete checkout first' });
    }

    const newPriceId = STRIPE_PRICES[newPlan];
    if (!newPriceId) {
      return res.status(400).json({ error: 'Stripe price not configured for this plan' });
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const currentItemId = stripeSubscription.items.data[0].id;

    if (isUpgrade) {
      // Upgrade: change price immediately, prorate the difference
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{ id: currentItemId, price: newPriceId }],
        proration_behavior: 'always_invoice',
        metadata: { ...stripeSubscription.metadata, plan: newPlan }
      });
      // Update our DB immediately
      subscription.plan = newPlan;
      subscription.features = PLAN_FEATURES[newPlan] || PLAN_FEATURES.basic;
      subscription.stripePriceId = newPriceId;
      subscription.pendingPlanChange = null;
      subscription.pendingPlanChangeDate = null;
      subscription.updatedAt = new Date();
      await subscription.save();
      return res.json({ 
        success: true, action: 'upgrade', plan: newPlan,
        message: `Upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}! You'll be charged the prorated difference.`
      });
    } else {
      // Downgrade: keep current plan, schedule change at next renewal
      subscription.pendingPlanChange = newPlan;
      subscription.pendingPlanChangeDate = new Date();
      subscription.updatedAt = new Date();
      await subscription.save();
      // Update Stripe metadata so the webhook knows the pending change
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        metadata: { ...stripeSubscription.metadata, pendingPlan: newPlan }
      });
      return res.json({ 
        success: true, action: 'downgrade', plan: newPlan,
        effectiveDate: subscription.currentPeriodEnd,
        message: `Your plan will change to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You'll keep your current features until then.`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a pending plan change
app.post('/api/subscription/cancel-plan-change', authMiddleware, requireRole('owner'), async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    if (!subscription || !subscription.pendingPlanChange) {
      return res.status(400).json({ error: 'No pending plan change to cancel' });
    }
    const canceledPlan = subscription.pendingPlanChange;
    subscription.pendingPlanChange = null;
    subscription.pendingPlanChangeDate = null;
    subscription.updatedAt = new Date();
    await subscription.save();
    // Clear Stripe metadata too
    if (STRIPE_ENABLED && stripe && subscription.stripeSubscriptionId) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        const meta = { ...stripeSub.metadata };
        delete meta.pendingPlan;
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, { metadata: meta });
      } catch (e) { console.error('Failed to clear Stripe pending metadata:', e.message); }
    }
    res.json({ success: true, message: `Pending change to ${canceledPlan} has been canceled. You'll stay on your current plan.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// MOBILE IN-APP PURCHASE VALIDATION
// ===========================================

// Plan mapping from store product IDs to our plan names
const STORE_PLAN_MAP = {
  // Google Play — Vendor
  'permitwise_basic_monthly': 'basic',
  'permitwise_pro_monthly': 'pro',
  'permitwise_elite_monthly': 'elite',
  // Google Play — Organizer
  'permitwise_organizer_monthly': 'organizer',
  // Apple App Store — Vendor
  'com.permitwise.basic.monthly': 'basic',
  'com.permitwise.pro.monthly': 'pro',
  'com.permitwise.elite.monthly': 'elite',
  // Apple App Store — Organizer
  'com.permitwise.organizer.monthly': 'organizer',
};

// Quick lookup: is this an organizer product?
const isOrganizerProduct = (productId) => STORE_PLAN_MAP[productId] === 'organizer';

// Helper: activate subscription after a verified IAP purchase
const activateIAPSubscription = async (vendorBusinessId, userId, plan, platformData = {}) => {
  return await Subscription.findOneAndUpdate(
    { vendorBusinessId },
    {
      vendorBusinessId,
      userId,
      plan,
      status: 'active',
      features: PLAN_FEATURES[plan] || PLAN_FEATURES.basic,
      currentPeriodStart: platformData.startDate || new Date(),
      currentPeriodEnd: platformData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      iapPlatform: platformData.platform || null,
      iapProductId: platformData.productId || null,
      iapPurchaseToken: platformData.purchaseToken || null,
      iapOriginalTransactionId: platformData.originalTransactionId || null,
      gracePeriodEndsAt: null,
      lastPaymentFailedAt: null,
      paymentFailureCount: 0,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );
};

// Helper: activate ORGANIZER subscription after a verified IAP purchase
const activateOrganizerIAPSubscription = async (userId, platformData = {}) => {
  return await OrganizerSubscription.findOneAndUpdate(
    { userId },
    {
      userId,
      plan: 'organizer',
      status: 'active',
      currentPeriodStart: platformData.startDate || new Date(),
      currentPeriodEnd: platformData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      iapPlatform: platformData.platform || null,
      iapProductId: platformData.productId || null,
      iapPurchaseToken: platformData.purchaseToken || null,
      iapOriginalTransactionId: platformData.originalTransactionId || null,
      gracePeriodEndsAt: null,
      lastPaymentFailedAt: null,
      paymentFailureCount: 0,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );
};

// -----------------------------------------------
// GOOGLE PLAY — Server-to-Server Verification
// -----------------------------------------------
app.post('/api/subscription/verify-google', authMiddleware, async (req, res) => {
  try {
    const { purchaseToken, productId, packageName } = req.body;

    if (!purchaseToken || !productId) {
      return res.status(400).json({ error: 'Purchase token and product ID are required' });
    }

    const plan = STORE_PLAN_MAP[productId];
    if (!plan) {
      return res.status(400).json({ error: 'Unknown product ID' });
    }

    const isOrganizer = isOrganizerProduct(productId);
    const platformData = { platform: 'google_play', productId, purchaseToken, startDate: new Date(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };

    // Validate user type matches product
    if (isOrganizer && !req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer product purchased by non-organizer account' });
    }
    if (!isOrganizer && !req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required for vendor plans' });
    }

    // --- IAP validation toggle ---
    if (!GOOGLE_PLAY_VALIDATION_ENABLED) {
      console.warn(`[IAP BYPASS] Google Play validation SKIPPED (GOOGLE_PLAY_VALIDATION_ENABLED=false). Trusting client for product=${productId}`);
      const subscription = isOrganizer
        ? await activateOrganizerIAPSubscription(req.userId, platformData)
        : await activateIAPSubscription(req.user.vendorBusinessId, req.userId, plan, platformData);
      return res.json({ subscription, message: 'Subscription activated (validation bypassed)' });
    }

    if (!androidPublisher) {
      return res.status(503).json({
        error: 'Google Play validation not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_FILE env var.'
      });
    }

    // Call Google Play Developer API to verify the subscription
    const result = await androidPublisher.purchases.subscriptionsv2.get({
      packageName: packageName || GOOGLE_PLAY_PACKAGE_NAME,
      token: purchaseToken
    });

    const purchaseData = result.data;

    // Only activate for valid states
    const activeStates = [
      'SUBSCRIPTION_STATE_ACTIVE',
      'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'
    ];

    if (!activeStates.includes(purchaseData.subscriptionState)) {
      console.warn(`Google Play verify: not active, state=${purchaseData.subscriptionState}, product=${productId}`);
      return res.status(400).json({
        error: 'Subscription is not active',
        state: purchaseData.subscriptionState
      });
    }

    // Extract expiry from line item
    const lineItem = purchaseData.lineItems?.[0];
    const expiryDate = lineItem?.expiryTime
      ? new Date(lineItem.expiryTime)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Validate product ID matches
    if (lineItem?.productId && lineItem.productId !== productId) {
      return res.status(400).json({ error: 'Product ID mismatch' });
    }

    platformData.expiryDate = expiryDate;
    const subscription = isOrganizer
      ? await activateOrganizerIAPSubscription(req.userId, platformData)
      : await activateIAPSubscription(req.user.vendorBusinessId, req.userId, plan, platformData);

    console.log(`Google Play verified: user=${req.userId}, plan=${plan}, organizer=${isOrganizer}, state=${purchaseData.subscriptionState}, expires=${expiryDate.toISOString()}`);
    res.json({ subscription, message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Google Play verification error:', error.message || error);
    if (error.code === 410) {
      return res.status(400).json({ error: 'Purchase token expired or already consumed' });
    }
    if (error.code === 404) {
      return res.status(400).json({ error: 'Purchase not found — it may have been refunded' });
    }
    res.status(500).json({ error: 'Failed to verify Google Play purchase' });
  }
});

// -----------------------------------------------
// APPLE APP STORE — Server-to-Server Verification
// -----------------------------------------------
// Helper: call Apple verifyReceipt endpoint
const verifyAppleReceipt = async (url, receiptData) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': APPLE_SHARED_SECRET,
      'exclude-old-transactions': true
    })
  });
  return await response.json();
};

// Apple status code descriptions
const APPLE_STATUS_MESSAGES = {
  21000: 'App Store could not read the receipt',
  21002: 'Receipt data was malformed',
  21003: 'Receipt could not be authenticated',
  21004: 'Shared secret does not match',
  21005: 'Apple receipt server temporarily unavailable — retry',
  21006: 'Receipt is valid but subscription has expired',
  21007: 'Sandbox receipt sent to production (auto-retried)',
  21008: 'Production receipt sent to sandbox',
  21010: 'This receipt could not be authorized'
};

app.post('/api/subscription/verify-apple', authMiddleware, async (req, res) => {
  try {
    const { receiptData, productId } = req.body;

    if (!receiptData || !productId) {
      return res.status(400).json({ error: 'Receipt data and product ID are required' });
    }

    const plan = STORE_PLAN_MAP[productId];
    if (!plan) {
      return res.status(400).json({ error: 'Unknown product ID' });
    }

    const isOrganizer = isOrganizerProduct(productId);
    const platformData = { platform: 'apple', productId, startDate: new Date(), expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };

    // Validate user type matches product
    if (isOrganizer && !req.user.isOrganizer) {
      return res.status(403).json({ error: 'Organizer product purchased by non-organizer account' });
    }
    if (!isOrganizer && !req.user.vendorBusinessId) {
      return res.status(400).json({ error: 'Business profile required for vendor plans' });
    }

    // --- IAP validation toggle ---
    if (!APPLE_VALIDATION_ENABLED) {
      console.warn(`[IAP BYPASS] Apple validation SKIPPED (APPLE_VALIDATION_ENABLED=false). Trusting client for product=${productId}`);
      const subscription = isOrganizer
        ? await activateOrganizerIAPSubscription(req.userId, platformData)
        : await activateIAPSubscription(req.user.vendorBusinessId, req.userId, plan, platformData);
      return res.json({ subscription, message: 'Subscription activated (validation bypassed)' });
    }

    if (!APPLE_SHARED_SECRET) {
      return res.status(503).json({ error: 'Apple receipt validation not configured. Set APPLE_SHARED_SECRET env var.' });
    }

    // Try production first, fall back to sandbox (status 21007)
    let appleData = await verifyAppleReceipt('https://buy.itunes.apple.com/verifyReceipt', receiptData);
    if (appleData.status === 21007) {
      appleData = await verifyAppleReceipt('https://sandbox.itunes.apple.com/verifyReceipt', receiptData);
    }

    if (appleData.status !== 0) {
      const msg = APPLE_STATUS_MESSAGES[appleData.status] || `Unknown Apple status: ${appleData.status}`;
      console.warn(`Apple verify failed: status=${appleData.status} — ${msg}`);
      return res.status(400).json({ error: msg });
    }

    // Find the most recent receipt matching our product IDs
    const latestReceipts = (appleData.latest_receipt_info || [])
      .filter(r => STORE_PLAN_MAP[r.product_id])
      .sort((a, b) => parseInt(b.expires_date_ms || 0) - parseInt(a.expires_date_ms || 0));

    if (latestReceipts.length === 0) {
      return res.status(400).json({ error: 'No PermitWise subscription found in receipt' });
    }

    const latest = latestReceipts[0];
    const expiresMs = parseInt(latest.expires_date_ms || 0);
    const purchaseMs = parseInt(latest.purchase_date_ms || Date.now());
    const expiryDate = new Date(expiresMs);
    const now = new Date();

    // Check expiry, allowing for grace period / billing retry
    if (expiryDate < now) {
      const pendingRenewal = (appleData.pending_renewal_info || [])
        .find(p => p.product_id === latest.product_id);
      if (!pendingRenewal || pendingRenewal.expiration_intent === '1') {
        return res.status(400).json({ error: 'Subscription has expired' });
      }
      console.log(`Apple verify: billing retry in progress for product=${latest.product_id}`);
    }

    const receiptPlan = STORE_PLAN_MAP[latest.product_id] || plan;
    const receiptIsOrganizer = receiptPlan === 'organizer';

    platformData.productId = latest.product_id;
    platformData.originalTransactionId = latest.original_transaction_id;
    platformData.startDate = new Date(purchaseMs);
    platformData.expiryDate = expiryDate;

    const subscription = receiptIsOrganizer
      ? await activateOrganizerIAPSubscription(req.userId, platformData)
      : await activateIAPSubscription(req.user.vendorBusinessId, req.userId, receiptPlan, platformData);

    console.log(`Apple verified: user=${req.userId}, plan=${receiptPlan}, organizer=${receiptIsOrganizer}, expires=${expiryDate.toISOString()}, txn=${latest.original_transaction_id}`);
    res.json({ subscription, message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Apple verification error:', error.message || error);
    res.status(500).json({ error: 'Failed to verify Apple receipt' });
  }
});

// -----------------------------------------------
// RESTORE PURCHASES — Re-verifies with the stores
// -----------------------------------------------
app.post('/api/subscription/restore', authMiddleware, async (req, res) => {
  try {
    const { platform, purchaseToken, productId, packageName, receiptData } = req.body;

    // ---- Google Play restore ----
    if (platform === 'android' && purchaseToken && productId && androidPublisher) {
      try {
        const result = await androidPublisher.purchases.subscriptionsv2.get({
          packageName: packageName || GOOGLE_PLAY_PACKAGE_NAME,
          token: purchaseToken
        });
        const activeStates = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'];

        if (activeStates.includes(result.data.subscriptionState)) {
          const plan = STORE_PLAN_MAP[productId] || 'basic';
          const lineItem = result.data.lineItems?.[0];
          const expiryDate = lineItem?.expiryTime
            ? new Date(lineItem.expiryTime)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          const subscription = await activateIAPSubscription(
            req.user.vendorBusinessId, req.userId, plan,
            { platform: 'google_play', productId, purchaseToken, expiryDate }
          );
          return res.json({
            restored: true,
            subscription: { plan: subscription.plan, status: subscription.status, isActive: true, features: subscription.features }
          });
        }
      } catch (err) {
        console.warn('Google restore verify failed:', err.message);
      }
    }

    // ---- Apple restore ----
    if (platform === 'ios' && receiptData && APPLE_SHARED_SECRET) {
      try {
        let appleData = await verifyAppleReceipt('https://buy.itunes.apple.com/verifyReceipt', receiptData);
        if (appleData.status === 21007) {
          appleData = await verifyAppleReceipt('https://sandbox.itunes.apple.com/verifyReceipt', receiptData);
        }

        if (appleData.status === 0 && appleData.latest_receipt_info?.length > 0) {
          const latest = [...appleData.latest_receipt_info]
            .filter(r => STORE_PLAN_MAP[r.product_id])
            .sort((a, b) => parseInt(b.expires_date_ms || 0) - parseInt(a.expires_date_ms || 0))[0];

          if (latest && parseInt(latest.expires_date_ms) > Date.now()) {
            const plan = STORE_PLAN_MAP[latest.product_id] || 'basic';
            const subscription = await activateIAPSubscription(
              req.user.vendorBusinessId, req.userId, plan,
              { platform: 'apple', productId: latest.product_id, originalTransactionId: latest.original_transaction_id, expiryDate: new Date(parseInt(latest.expires_date_ms)) }
            );
            return res.json({
              restored: true,
              subscription: { plan: subscription.plan, status: subscription.status, isActive: true, features: subscription.features }
            });
          }
        }
      } catch (err) {
        console.warn('Apple restore verify failed:', err.message);
      }
    }

    // ---- Fallback: return current server-side subscription state ----
    const subscription = await Subscription.findOne({ vendorBusinessId: req.user.vendorBusinessId });
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found', restored: false });
    }
    const isActive = isSubscriptionActive(subscription);
    res.json({
      restored: isActive,
      subscription: { plan: subscription.plan, status: subscription.status, isActive, features: subscription.features }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------
// GOOGLE PLAY REAL-TIME DEVELOPER NOTIFICATIONS (RTDN)
// -----------------------------------------------
// Setup: Google Play Console → Monetize → Monetization setup → Real-time developer notifications
// Topic: your Cloud Pub/Sub topic → push subscription → URL: https://your-domain.com/webhooks/google-play
app.post('/webhooks/google-play', express.json(), async (req, res) => {
  try {
    const message = req.body.message;
    if (!message?.data) {
      return res.status(400).json({ error: 'Invalid notification format' });
    }

    // Decode base64 Pub/Sub payload
    const decoded = JSON.parse(Buffer.from(message.data, 'base64').toString('utf-8'));
    const notification = decoded.subscriptionNotification;

    if (!notification) {
      console.log('Google RTDN (non-subscription):', JSON.stringify(decoded));
      return res.json({ received: true });
    }

    const { purchaseToken, subscriptionId, notificationType } = notification;
    const pkg = decoded.packageName || GOOGLE_PLAY_PACKAGE_NAME;

    // https://developer.android.com/google/play/billing/rtdn-reference#sub
    // 1=RECOVERED, 2=RENEWED, 3=CANCELED, 4=PURCHASED, 5=ON_HOLD,
    // 6=IN_GRACE_PERIOD, 7=RESTARTED, 12=REVOKED, 13=EXPIRED
    const typeNames = { 1:'RECOVERED',2:'RENEWED',3:'CANCELED',4:'PURCHASED',5:'ON_HOLD',6:'IN_GRACE_PERIOD',7:'RESTARTED',12:'REVOKED',13:'EXPIRED' };
    console.log(`Google RTDN: ${typeNames[notificationType] || notificationType}, product=${subscriptionId}`);

    const plan = STORE_PLAN_MAP[subscriptionId];
    if (!plan) {
      console.warn(`Google RTDN: unknown product ${subscriptionId}`);
      return res.json({ received: true });
    }

    // Find existing subscription by purchase token (check both vendor and organizer)
    let sub = await Subscription.findOne({ iapPurchaseToken: purchaseToken });
    let isOrgSub = false;
    if (!sub) {
      sub = await OrganizerSubscription.findOne({ iapPurchaseToken: purchaseToken });
      isOrgSub = !!sub;
    }
    if (!sub) {
      console.warn(`Google RTDN: no subscription found for token (type=${notificationType})`);
      return res.json({ received: true });
    }
    const SubModel = isOrgSub ? OrganizerSubscription : Subscription;

    // For active/renewed events, fetch latest status from Google Play
    if (androidPublisher && [1, 2, 4, 5, 6, 7].includes(notificationType)) {
      try {
        const result = await androidPublisher.purchases.subscriptionsv2.get({ packageName: pkg, token: purchaseToken });
        const pd = result.data;
        const lineItem = pd.lineItems?.[0];
        const expiryDate = lineItem?.expiryTime ? new Date(lineItem.expiryTime) : null;

        const stateMap = {
          'SUBSCRIPTION_STATE_ACTIVE': 'active',
          'SUBSCRIPTION_STATE_IN_GRACE_PERIOD': 'grace_period',
          'SUBSCRIPTION_STATE_ON_HOLD': 'grace_period',
          'SUBSCRIPTION_STATE_PAUSED': 'paused',
          'SUBSCRIPTION_STATE_CANCELED': 'canceled',
          'SUBSCRIPTION_STATE_EXPIRED': 'expired',
        };
        const newStatus = stateMap[pd.subscriptionState] || 'active';

        const updateFields = {
          status: newStatus,
          ...(expiryDate && { currentPeriodEnd: expiryDate }),
          ...(newStatus === 'active' && { gracePeriodEndsAt: null, lastPaymentFailedAt: null, paymentFailureCount: 0 }),
          updatedAt: new Date()
        };
        if (!isOrgSub) {
          updateFields.plan = plan;
          updateFields.features = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
        }

        await SubModel.findByIdAndUpdate(sub._id, updateFields);
        console.log(`Google RTDN processed → ${isOrgSub ? 'organizer' : 'vendor'}, status=${newStatus}, expires=${expiryDate?.toISOString()}`);
      } catch (err) {
        console.error('Google RTDN API call failed:', err.message);
      }
    } else if ([3, 12, 13].includes(notificationType)) {
      // Canceled / Revoked / Expired — no API call needed
      const statusMap = { 3: 'canceled', 12: 'canceled', 13: 'expired' };
      await SubModel.findByIdAndUpdate(sub._id, {
        status: statusMap[notificationType],
        ...(notificationType === 3 && { canceledAt: new Date() }),
        updatedAt: new Date()
      });
      console.log(`Google RTDN → ${isOrgSub ? 'organizer' : 'vendor'} ${statusMap[notificationType]}`);
    }

    // Always 200 so Google stops retrying
    res.json({ received: true });
  } catch (error) {
    console.error('Google RTDN error:', error.message);
    res.json({ received: true });
  }
});

// -----------------------------------------------
// APPLE APP STORE SERVER NOTIFICATIONS v2
// -----------------------------------------------
// Setup: App Store Connect → Your App → General → App Store Server Notifications
// Production URL: https://your-domain.com/webhooks/apple
// Sandbox URL:    https://your-domain.com/webhooks/apple
app.post('/webhooks/apple', express.json(), async (req, res) => {
  try {
    const { signedPayload } = req.body;
    if (!signedPayload) {
      return res.status(400).json({ error: 'Missing signedPayload' });
    }

    // Decode the JWS payload (header.payload.signature)
    // Apple signs the payload with their private key. In production you should
    // verify the signature against Apple's root certificate chain. For now we
    // decode and trust — Apple only sends to your registered URL.
    const parts = signedPayload.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Invalid JWS format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    const { notificationType, subtype, data } = payload;
    console.log(`Apple Notification: type=${notificationType}, subtype=${subtype || 'none'}`);

    // Decode signedTransactionInfo
    let txnInfo = null;
    if (data?.signedTransactionInfo) {
      const txnParts = data.signedTransactionInfo.split('.');
      if (txnParts.length === 3) {
        txnInfo = JSON.parse(Buffer.from(txnParts[1], 'base64url').toString('utf-8'));
      }
    }

    // Decode signedRenewalInfo
    let renewalInfo = null;
    if (data?.signedRenewalInfo) {
      const rParts = data.signedRenewalInfo.split('.');
      if (rParts.length === 3) {
        renewalInfo = JSON.parse(Buffer.from(rParts[1], 'base64url').toString('utf-8'));
      }
    }

    if (!txnInfo) {
      console.warn('Apple notification: no transactionInfo');
      return res.json({ received: true });
    }

    const originalTxnId = txnInfo.originalTransactionId;
    const productId = txnInfo.productId;
    const plan = STORE_PLAN_MAP[productId];

    if (!plan) {
      console.warn(`Apple notification: unknown product ${productId}`);
      return res.json({ received: true });
    }

    const sub = await Subscription.findOne({ iapOriginalTransactionId: originalTxnId });
    let isOrgSub = false;
    let foundSub = sub;
    if (!foundSub) {
      foundSub = await OrganizerSubscription.findOne({ iapOriginalTransactionId: originalTxnId });
      isOrgSub = !!foundSub;
    }
    if (!foundSub) {
      console.warn(`Apple notification: no subscription for txn=${originalTxnId}`);
      return res.json({ received: true });
    }
    const SubModel = isOrgSub ? OrganizerSubscription : Subscription;

    const expiresDate = txnInfo.expiresDate ? new Date(txnInfo.expiresDate) : null;

    // https://developer.apple.com/documentation/appstoreservernotifications/notificationtype
    switch (notificationType) {
      case 'DID_RENEW':
      case 'SUBSCRIBED': {
        const updateFields = {
          status: 'active',
          ...(expiresDate && { currentPeriodEnd: expiresDate }),
          gracePeriodEndsAt: null, lastPaymentFailedAt: null, paymentFailureCount: 0,
          updatedAt: new Date()
        };
        if (!isOrgSub) {
          updateFields.plan = plan;
          updateFields.features = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
        }
        await SubModel.findByIdAndUpdate(foundSub._id, updateFields);
        console.log(`Apple → renewed/subscribed, ${isOrgSub ? 'organizer' : 'vendor'}, plan=${plan}, expires=${expiresDate?.toISOString()}`);
        break;
      }
      case 'DID_CHANGE_RENEWAL_STATUS': {
        // User toggled auto-renew — subscription stays active until period end
        console.log(`Apple → auto_renew ${subtype === 'AUTO_RENEW_DISABLED' ? 'OFF' : 'ON'}`);
        break;
      }
      case 'DID_FAIL_TO_RENEW': {
        const isGrace = subtype === 'GRACE_PERIOD';
        await SubModel.findByIdAndUpdate(foundSub._id, {
          status: 'grace_period',
          ...(isGrace && { gracePeriodEndsAt: expiresDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }),
          lastPaymentFailedAt: new Date(),
          paymentFailureCount: (foundSub.paymentFailureCount || 0) + 1,
          updatedAt: new Date()
        });
        console.log(`Apple → renewal failed${isGrace ? ' (grace period)' : ' (billing retry)'}`);
        break;
      }
      case 'EXPIRED': {
        await SubModel.findByIdAndUpdate(foundSub._id, { status: 'expired', updatedAt: new Date() });
        console.log('Apple → expired');
        break;
      }
      case 'GRACE_PERIOD_EXPIRED': {
        await SubModel.findByIdAndUpdate(foundSub._id, { status: 'expired', gracePeriodEndsAt: null, updatedAt: new Date() });
        console.log('Apple → grace period expired');
        break;
      }
      case 'REVOKE': {
        // Refund — immediately deactivate
        await SubModel.findByIdAndUpdate(foundSub._id, { status: 'canceled', canceledAt: new Date(), updatedAt: new Date() });
        console.log('Apple → revoked (refund)');
        break;
      }
      case 'DID_CHANGE_RENEWAL_PREF': {
        const newPid = renewalInfo?.autoRenewProductId || productId;
        const newPlan = STORE_PLAN_MAP[newPid] || plan;
        console.log(`Apple → plan change pending → ${newPlan} (effective next renewal)`);
        break;
      }
      default:
        console.log(`Apple notification (unhandled): ${notificationType}/${subtype}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Apple webhook error:', error.message);
    // Always 200 so Apple stops retrying
    res.json({ received: true });
  }
});

// Stripe webhook
app.post('/webhook', async (req, res) => {
  if (!STRIPE_ENABLED || !stripe) {
    return res.json({ received: true, message: 'Stripe disabled' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Check if this is an organizer or vendor checkout
        if (session.metadata.type === 'organizer') {
          // ORGANIZER checkout
          const { userId } = session.metadata;
          await OrganizerSubscription.findOneAndUpdate(
            { userId },
            {
              userId,
              plan: 'organizer',
              status: 'active',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
          console.log(`Organizer subscription activated for user ${userId}`);
        } else {
          // VENDOR checkout
          const { plan, vendorBusinessId, userId } = session.metadata;
          await Subscription.findOneAndUpdate(
            { vendorBusinessId },
            {
              vendorBusinessId,
              userId,
              plan,
              status: 'active',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              features: PLAN_FEATURES[plan] || PLAN_FEATURES.basic,
              pendingPlanChange: null,
              pendingPlanChangeDate: null,
              gracePeriodEndsAt: null,
              lastPaymentFailedAt: null,
              paymentFailureCount: 0,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
          console.log(`Vendor subscription activated for business ${vendorBusinessId}, plan: ${plan}`);
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        // Payment successful - restore to active, clear grace period
        // Try vendor subscription first, then organizer
        const vendorSub = await Subscription.findOne({ stripeCustomerId: invoice.customer });
        
        if (vendorSub) {
          const updateFields = {
            status: 'active',
            gracePeriodEndsAt: null,
            lastPaymentFailedAt: null,
            paymentFailureCount: 0,
            updatedAt: new Date()
          };
          
          // Apply pending plan change at renewal
          if (vendorSub.pendingPlanChange) {
            const newPlan = vendorSub.pendingPlanChange;
            updateFields.plan = newPlan;
            updateFields.features = PLAN_FEATURES[newPlan] || PLAN_FEATURES.basic;
            updateFields.pendingPlanChange = null;
            updateFields.pendingPlanChangeDate = null;
            
            // Also update Stripe subscription to new price if possible
            if (STRIPE_ENABLED && stripe && vendorSub.stripeSubscriptionId) {
              try {
                const newPriceId = STRIPE_PRICES[newPlan];
                if (newPriceId) {
                  const stripeSub = await stripe.subscriptions.retrieve(vendorSub.stripeSubscriptionId);
                  await stripe.subscriptions.update(vendorSub.stripeSubscriptionId, {
                    items: [{ id: stripeSub.items.data[0].id, price: newPriceId }],
                    proration_behavior: 'none',
                    metadata: { ...stripeSub.metadata, plan: newPlan, pendingPlan: null }
                  });
                  updateFields.stripePriceId = newPriceId;
                }
              } catch (e) { console.error('Failed to update Stripe price at renewal:', e.message); }
            }
            console.log(`Applied pending plan change to ${newPlan} for customer ${invoice.customer}`);
          }
          
          await Subscription.findOneAndUpdate(
            { stripeCustomerId: invoice.customer },
            updateFields
          );
        } else {
          // Try organizer subscription
          await OrganizerSubscription.findOneAndUpdate(
            { stripeCustomerId: invoice.customer },
            { status: 'active', updatedAt: new Date() }
          );
        }
        console.log(`Invoice paid for customer ${invoice.customer}`);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await Subscription.findOne({ stripeCustomerId: invoice.customer });
        
        if (subscription) {
          const failureCount = (subscription.paymentFailureCount || 0) + 1;
          const now = new Date();
          
          let gracePeriodEndsAt = subscription.gracePeriodEndsAt;
          let newStatus = 'grace_period';
          
          if (!gracePeriodEndsAt) {
            gracePeriodEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          }
          
          if (gracePeriodEndsAt < now) {
            newStatus = 'expired';
          }
          
          await Subscription.findOneAndUpdate(
            { stripeCustomerId: invoice.customer },
            { 
              status: newStatus,
              lastPaymentFailedAt: now,
              paymentFailureCount: failureCount,
              gracePeriodEndsAt,
              updatedAt: new Date()
            }
          );
          console.log(`Payment failed for vendor customer ${invoice.customer}, status: ${newStatus}`);
        } else {
          // Check organizer subscription
          const orgSub = await OrganizerSubscription.findOne({ stripeCustomerId: invoice.customer });
          if (orgSub) {
            await OrganizerSubscription.findOneAndUpdate(
              { stripeCustomerId: invoice.customer },
              { status: 'past_due', updatedAt: new Date() }
            );
            console.log(`Payment failed for organizer customer ${invoice.customer}`);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object;
        const plan = stripeSubscription.metadata?.plan || 'basic';
        
        // Map Stripe status to our status
        let ourStatus = 'active';
        if (stripeSubscription.status === 'past_due') ourStatus = 'grace_period';
        else if (stripeSubscription.status === 'canceled') ourStatus = 'canceled';
        else if (stripeSubscription.status === 'unpaid') ourStatus = 'expired';
        else if (stripeSubscription.status === 'paused') ourStatus = 'paused';
        else if (stripeSubscription.status === 'active') ourStatus = 'active';
        
        // Try vendor subscription first
        const vendorSub = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubscription.id },
          {
            status: ourStatus,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            features: PLAN_FEATURES[plan] || PLAN_FEATURES.basic,
            updatedAt: new Date()
          }
        );
        if (!vendorSub) {
          // Try organizer subscription
          await OrganizerSubscription.findOneAndUpdate(
            { stripeSubscriptionId: stripeSubscription.id },
            {
              status: ourStatus,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date()
            }
          );
        }
        console.log(`Subscription updated for ${stripeSubscription.id}, status: ${ourStatus}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object;
        // Try vendor subscription first
        const vendorSub = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: stripeSubscription.id },
          { status: 'canceled', canceledAt: new Date(), updatedAt: new Date() }
        );
        if (!vendorSub) {
          // Try organizer subscription
          await OrganizerSubscription.findOneAndUpdate(
            { stripeSubscriptionId: stripeSubscription.id },
            { status: 'canceled', canceledAt: new Date(), updatedAt: new Date() }
          );
        }
        console.log(`Subscription deleted/canceled for ${stripeSubscription.id}`);
        break;
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN SEED DATA ROUTE
// ===========================================

// Seed initial data (for demo)
app.post('/api/admin/seed', masterAdminMiddleware, async (req, res) => {
  try {
    // Sample jurisdictions
    const jurisdictions = [
      { name: 'Dallas', type: 'city', city: 'Dallas', state: 'TX', contactInfo: { website: 'https://dallascityhall.com' } },
      { name: 'Austin', type: 'city', city: 'Austin', state: 'TX', contactInfo: { website: 'https://austintexas.gov' } },
      { name: 'Denver', type: 'city', city: 'Denver', state: 'CO', contactInfo: { website: 'https://denvergov.org' } },
      { name: 'Tampa', type: 'city', city: 'Tampa', state: 'FL', contactInfo: { website: 'https://tampagov.net' } },
      { name: 'Nashville', type: 'city', city: 'Nashville', state: 'TN', contactInfo: { website: 'https://nashville.gov' } },
      { name: 'Portland', type: 'city', city: 'Portland', state: 'OR', contactInfo: { website: 'https://portland.gov' } },
      { name: 'Phoenix', type: 'city', city: 'Phoenix', state: 'AZ', contactInfo: { website: 'https://phoenix.gov' } },
      { name: 'Los Angeles', type: 'city', city: 'Los Angeles', state: 'CA', contactInfo: { website: 'https://lacity.org' } }
    ];
    
    for (const j of jurisdictions) {
      await Jurisdiction.findOneAndUpdate(
        { city: j.city, state: j.state },
        j,
        { upsert: true }
      );
    }
    
    // Get created jurisdictions
    const dallas = await Jurisdiction.findOne({ city: 'Dallas' });
    const austin = await Jurisdiction.findOne({ city: 'Austin' });
    const denver = await Jurisdiction.findOne({ city: 'Denver' });
    
    // Sample permit types
    const permitTypes = [
      {
        jurisdictionId: dallas._id,
        vendorTypes: ['food_truck', 'mobile_bartender'],
        name: 'Mobile Food Unit Permit',
        description: 'Required permit for operating a mobile food unit in Dallas',
        issuingAuthorityName: 'Dallas Health Department',
        defaultDurationDays: 365,
        estimatedCost: '$300-$500',
        requiredDocuments: ['Food Handler Certificate', 'Vehicle Inspection', 'Liability Insurance']
      },
      {
        jurisdictionId: dallas._id,
        vendorTypes: ['food_truck', 'tent_vendor', 'mobile_retail', 'pop_up_shop', 'farmers_market', 'craft_vendor'],
        name: 'Business License',
        description: 'General business license for operating in Dallas',
        issuingAuthorityName: 'Dallas City Secretary',
        defaultDurationDays: 365,
        estimatedCost: '$100-$250'
      },
      {
        jurisdictionId: dallas._id,
        vendorTypes: ['food_truck', 'mobile_bartender'],
        name: 'Fire Marshal Inspection Certificate',
        description: 'Fire safety inspection certification',
        issuingAuthorityName: 'Dallas Fire-Rescue',
        defaultDurationDays: 365,
        estimatedCost: '$75'
      },
      {
        jurisdictionId: austin._id,
        vendorTypes: ['food_truck', 'mobile_bartender'],
        name: 'Mobile Food Vendor Permit',
        description: 'Required permit for mobile food vendors in Austin',
        issuingAuthorityName: 'Austin Public Health',
        defaultDurationDays: 365,
        estimatedCost: '$200-$400'
      },
      {
        jurisdictionId: austin._id,
        vendorTypes: ['food_truck', 'tent_vendor', 'mobile_retail', 'pop_up_shop'],
        name: 'Austin Business License',
        description: 'General business operating license',
        issuingAuthorityName: 'City of Austin',
        defaultDurationDays: 365,
        estimatedCost: '$150'
      },
      {
        jurisdictionId: denver._id,
        vendorTypes: ['food_truck', 'mobile_bartender'],
        name: 'Mobile Food Establishment License',
        description: 'License for mobile food establishments',
        issuingAuthorityName: 'Denver Environmental Health',
        defaultDurationDays: 365,
        estimatedCost: '$350'
      },
      {
        jurisdictionId: denver._id,
        vendorTypes: ['food_truck', 'tent_vendor', 'mobile_retail', 'pop_up_shop', 'farmers_market', 'craft_vendor'],
        name: 'Denver Business License',
        description: 'General business license',
        issuingAuthorityName: 'Denver Excise and Licenses',
        defaultDurationDays: 365,
        estimatedCost: '$100'
      }
    ];
    
    for (const pt of permitTypes) {
      await PermitType.findOneAndUpdate(
        { jurisdictionId: pt.jurisdictionId, name: pt.name },
        pt,
        { upsert: true }
      );
    }
    
    // Sample inspection checklists
    const checklists = [
      {
        name: 'Food Truck Pre-Service Checklist',
        description: 'Daily checklist before starting service',
        category: 'health',
        vendorType: 'food_truck',
        items: [
          { itemText: 'Hand washing station stocked and operational', required: true, order: 1 },
          { itemText: 'Hot water available at hand sink (100°F minimum)', required: true, order: 2 },
          { itemText: 'Refrigeration units at 41°F or below', required: true, order: 3 },
          { itemText: 'Hot holding equipment at 135°F or above', required: true, order: 4 },
          { itemText: 'Food thermometer available and calibrated', required: true, order: 5 },
          { itemText: 'All food properly stored and covered', required: true, order: 6 },
          { itemText: 'Clean sanitizer solution prepared (50-100 ppm)', required: true, order: 7 },
          { itemText: 'Wastewater tank empty or less than 1/3 full', required: true, order: 8 },
          { itemText: 'Fresh water tank full', required: true, order: 9 },
          { itemText: 'All surfaces cleaned and sanitized', required: true, order: 10 },
          { itemText: 'First aid kit accessible', required: false, order: 11 },
          { itemText: 'Fire extinguisher charged and accessible', required: true, order: 12 }
        ]
      },
      {
        name: 'Fire Safety Inspection',
        description: 'Fire marshal inspection checklist',
        category: 'fire',
        vendorType: 'food_truck',
        items: [
          { itemText: 'Fire extinguisher (2A:10BC minimum) accessible', required: true, order: 1 },
          { itemText: 'Fire extinguisher inspection tag current', required: true, order: 2 },
          { itemText: 'Propane tanks secured and ventilated', required: true, order: 3 },
          { itemText: 'Gas connections tight and leak-free', required: true, order: 4 },
          { itemText: 'Exhaust hood and filters clean', required: true, order: 5 },
          { itemText: 'Automatic fire suppression system operational', required: true, order: 6 },
          { itemText: 'Emergency shutoff valves accessible', required: true, order: 7 },
          { itemText: 'Electrical connections in good condition', required: true, order: 8 },
          { itemText: 'No frayed wires or overloaded circuits', required: true, order: 9 },
          { itemText: 'Exit path clear and unobstructed', required: true, order: 10 }
        ]
      },
      {
        name: 'Pop-Up Booth Setup Checklist',
        description: 'Setup checklist for tent/booth vendors',
        category: 'safety',
        vendorType: 'tent_vendor',
        items: [
          { itemText: 'Tent properly anchored/weighted (min 40 lbs per leg)', required: true, order: 1 },
          { itemText: 'Fire extinguisher accessible', required: true, order: 2 },
          { itemText: 'Extension cords rated for outdoor use', required: true, order: 3 },
          { itemText: 'No tripping hazards in customer area', required: true, order: 4 },
          { itemText: 'Products properly displayed and secured', required: true, order: 5 },
          { itemText: 'Price tags visible on all items', required: false, order: 6 },
          { itemText: 'Business license displayed', required: true, order: 7 },
          { itemText: 'Cash handling area secured', required: false, order: 8 }
        ]
      }
    ];
    
    for (const cl of checklists) {
      await InspectionChecklist.findOneAndUpdate(
        { name: cl.name },
        cl,
        { upsert: true }
      );
    }
    
    // Sample events
    const events = [
      {
        organizerName: 'Dallas Food Truck Association',
        eventName: 'Dallas Food Truck Festival 2025',
        description: 'Annual gathering of the best food trucks in DFW',
        location: { city: 'Dallas', state: 'TX', address: 'Fair Park, 3921 Martin Luther King Jr Blvd' },
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-03-16'),
        eventType: 'food_event',
        requiredVendorTypes: ['food_truck'],
        vendorSpots: 50,
        vendorFee: 250,
        status: 'published'
      },
      {
        organizerName: 'Austin Farmers Market',
        eventName: 'Downtown Austin Farmers Market',
        description: 'Weekly farmers market in downtown Austin',
        location: { city: 'Austin', state: 'TX', address: '422 Guadalupe St' },
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-12-31'),
        eventType: 'farmers_market',
        requiredVendorTypes: ['farmers_market', 'craft_vendor', 'food_truck'],
        vendorSpots: 100,
        vendorFee: 50,
        status: 'published'
      },
      {
        organizerName: 'Denver Night Market',
        eventName: 'Denver Night Bazaar',
        description: 'Monthly night market featuring local vendors',
        location: { city: 'Denver', state: 'CO', address: 'RiNo Art District' },
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-01'),
        eventType: 'night_market',
        requiredVendorTypes: ['food_truck', 'craft_vendor', 'pop_up_shop'],
        vendorSpots: 75,
        vendorFee: 150,
        status: 'published'
      }
    ];
    
    for (const ev of events) {
      await Event.findOneAndUpdate(
        { eventName: ev.eventName },
        ev,
        { upsert: true }
      );
    }
    
    res.json({ 
      message: 'Seed data created successfully',
      counts: {
        jurisdictions: jurisdictions.length,
        permitTypes: permitTypes.length,
        checklists: checklists.length,
        events: events.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// MASTER ADMIN AUTHENTICATION
// ===========================================

// Admin Login - uses master credentials from .env
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      return res.status(500).json({ error: 'Admin credentials not configured on server' });
    }
    
    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    // Generate admin token
    const adminToken = jwt.sign({ isMasterAdmin: true, username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      success: true, 
      adminToken,
      message: 'Admin login successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify admin token
app.get('/api/admin/verify', masterAdminMiddleware, (req, res) => {
  res.json({ valid: true, isMasterAdmin: true });
});

// ===========================================
// ADMIN DASHBOARD API
// ===========================================

// Admin Stats
app.get('/api/admin/stats', masterAdminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [totalUsers, totalBusinesses, totalPermits, activeSubscriptions, totalJurisdictions, totalPermitTypes, newUsersToday, newUsersThisWeek] = await Promise.all([
      User.countDocuments(),
      VendorBusiness.countDocuments(),
      VendorPermit.countDocuments(),
      Subscription.countDocuments({ status: { $in: ['active', 'trial'] } }),
      Jurisdiction.countDocuments(),
      PermitType.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);
    
    // Calculate MRR
    const paidSubs = await Subscription.find({ status: 'active', plan: { $ne: 'trial' } });
    const mrr = paidSubs.reduce((sum, sub) => {
      const prices = { basic: 19, pro: 49, elite: 99 };
      return sum + (prices[sub.plan] || 0);
    }, 0);
    
    res.json({ totalUsers, totalBusinesses, totalPermits, activeSubscriptions, totalJurisdictions, totalPermitTypes, newUsersToday, newUsersThisWeek, mrr });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Users List
app.get('/api/admin/users', masterAdminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -verificationToken').sort({ createdAt: -1 }).limit(100);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete User
app.delete('/api/admin/users/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Businesses List
app.get('/api/admin/businesses', masterAdminMiddleware, async (req, res) => {
  try {
    const businesses = await VendorBusiness.find()
      .populate('ownerId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    // Get subscriptions for all businesses
    const businessIds = businesses.map(b => b._id);
    const subscriptions = await Subscription.find({ vendorBusinessId: { $in: businessIds } });
    const subMap = {};
    subscriptions.forEach(sub => {
      subMap[sub.vendorBusinessId.toString()] = sub;
    });
    
    // Attach subscription to each business
    const businessesWithSubs = businesses.map(biz => ({
      ...biz,
      subscription: subMap[biz._id.toString()] || null
    }));
    
    res.json({ businesses: businessesWithSubs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete Business
app.delete('/api/admin/businesses/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await VendorBusiness.findByIdAndDelete(req.params.id);
    res.json({ message: 'Business deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN ORGANIZER MANAGEMENT
// ===========================================

// Get all organizers
app.get('/api/admin/organizers', masterAdminMiddleware, async (req, res) => {
  try {
    const organizers = await User.find({ isOrganizer: true })
      .select('email firstName lastName isOrganizer organizerProfile createdAt')
      .sort({ createdAt: -1 });
    
    // Get event counts for each organizer
    const organizersWithCounts = await Promise.all(organizers.map(async (org) => {
      const eventCount = await Event.countDocuments({ organizerId: org._id });
      return {
        ...org.toObject(),
        eventCount
      };
    }));
    
    res.json({ organizers: organizersWithCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make user an organizer
app.post('/api/admin/organizers', masterAdminMiddleware, async (req, res) => {
  try {
    const { email, companyName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found with that email' });
    }
    
    if (user.isOrganizer) {
      return res.status(400).json({ error: 'User is already an organizer' });
    }
    
    user.isOrganizer = true;
    user.role = 'organizer';
    user.organizerProfile = {
      companyName: companyName || '',
      verified: false,
      disabled: false,
      verificationStatus: 'pending',
      notifications: {
        applicationReceived: true,
        applicationDeadline: true,
        vendorCompliance: true,
        eventReminders: true,
        emailDigest: 'daily'
      }
    };
    user.updatedAt = new Date();
    await user.save();
    
    // Create organizer subscription
    const orgSubscription = new OrganizerSubscription({
      userId: user._id,
      plan: 'trial',
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    await orgSubscription.save();
    
    res.json({ message: 'User is now an organizer', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve organizer (verify)
app.put('/api/admin/organizers/:id/approve', masterAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    
    user.organizerProfile = user.organizerProfile || {};
    user.organizerProfile.verified = true;
    user.organizerProfile.verifiedAt = new Date();
    user.organizerProfile.verifiedBy = req.adminId;
    user.organizerProfile.verificationStatus = 'approved';
    user.organizerProfile.disabled = false;
    user.organizerProfile.disabledReason = null;
    user.organizerProfile.adminNote = null;
    user.updatedAt = new Date();
    await user.save();
    
    // Send approval email
    await sendEmail(
      user.email,
      'Your PermitWise Organizer Account is Verified!',
      `
        <h1>Congratulations! 🎉</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Your event organizer account has been verified. You can now:</p>
        <ul>
          <li>Create and publish events</li>
          <li>Invite vendors to participate</li>
          <li>Track vendor compliance</li>
        </ul>
        <a href="${CLIENT_URL}/app" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        <p>Best,<br>The PermitWise Team</p>
      `
    );
    
    res.json({ success: true, message: 'Organizer approved and verified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject organizer
app.put('/api/admin/organizers/:id/reject', masterAdminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || !user.isOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    
    user.organizerProfile = user.organizerProfile || {};
    user.organizerProfile.verified = false;
    user.organizerProfile.disabled = true;
    user.organizerProfile.verificationStatus = 'rejected';
    user.organizerProfile.disabledReason = reason || 'Application rejected';
    user.organizerProfile.disabledAt = new Date();
    user.updatedAt = new Date();
    await user.save();
    
    // Send rejection email
    await sendEmail(
      user.email,
      'Update on Your PermitWise Organizer Application',
      `
        <h1>Application Status Update</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Unfortunately, we were unable to approve your event organizer application at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this was a mistake or have questions, please contact our support team.</p>
        <p>Best,<br>The PermitWise Team</p>
      `
    );
    
    res.json({ success: true, message: 'Organizer rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request more info from organizer
app.put('/api/admin/organizers/:id/request-info', masterAdminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || !user.isOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    
    user.organizerProfile = user.organizerProfile || {};
    user.organizerProfile.verificationStatus = 'info_requested';
    user.organizerProfile.adminNote = reason || 'Please provide additional information';
    user.organizerProfile.infoRequestedAt = new Date();
    user.updatedAt = new Date();
    await user.save();
    
    // Send info request email
    await sendEmail(
      user.email,
      'Additional Information Needed for Your PermitWise Application',
      `
        <h1>We Need More Information</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Thank you for applying to be an event organizer on PermitWise. To complete your verification, we need some additional information:</p>
        <p style="background: #f3f4f6; padding: 16px; border-radius: 8px;"><strong>${reason || 'Please provide additional information about your organization.'}</strong></p>
        <p>Please log in to your account and update your organization profile with the requested information.</p>
        <a href="${CLIENT_URL}/app" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Update Profile</a>
        <p>Best,<br>The PermitWise Team</p>
      `
    );
    
    res.json({ success: true, message: 'Information request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle organizer status (enable/disable)
app.put('/api/admin/organizers/:id/status', masterAdminMiddleware, async (req, res) => {
  try {
    const { disabled, disabledReason, verified } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user || !user.isOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    
    user.organizerProfile = user.organizerProfile || {};
    if (typeof disabled !== 'undefined') {
      user.organizerProfile.disabled = disabled;
      user.organizerProfile.disabledReason = disabledReason || '';
      if (disabled) {
        user.organizerProfile.disabledAt = new Date();
      }
    }
    if (typeof verified !== 'undefined') {
      user.organizerProfile.verified = verified;
      if (verified) {
        user.organizerProfile.verifiedAt = new Date();
        user.organizerProfile.verificationStatus = 'approved';
      }
    }
    user.updatedAt = new Date();
    await user.save();
    
    res.json({ message: disabled ? 'Organizer disabled' : 'Organizer enabled', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending verifications (organizers + events with pending documents)
app.get('/api/admin/verifications', masterAdminMiddleware, async (req, res) => {
  try {
    // Get organizers with documents (any status) - ordered by pending first
    const organizersWithDocs = await User.find({
      isOrganizer: true,
      'organizerProfile.documents.0': { $exists: true }
    }).select('firstName lastName email organizerProfile').sort({ 'organizerProfile.verified': 1 });
    
    // Get events with proof documents (any status) - ordered by verification status
    const eventsWithDocs = await Event.find({
      'proofDocuments.0': { $exists: true }
    }).select('eventName organizerName location startDate proofDocuments verificationStatus verificationNotes').sort({ verificationStatus: 1 });
    
    res.json({ 
      verifications: {
        organizers: organizersWithDocs,
        events: eventsWithDocs
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review organizer document
app.put('/api/admin/organizers/:id/documents/:docIndex/review', masterAdminMiddleware, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user || !user.isOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    
    const docIndex = parseInt(req.params.docIndex);
    if (!user.organizerProfile?.documents || docIndex >= user.organizerProfile.documents.length) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    user.organizerProfile.documents[docIndex].status = status;
    user.organizerProfile.documents[docIndex].reviewNotes = reviewNotes || '';
    user.organizerProfile.documents[docIndex].reviewedAt = new Date();
    
    // Check if all documents are now approved - auto-verify organizer
    const allApproved = user.organizerProfile.documents.every(d => d.status === 'approved');
    if (allApproved && user.organizerProfile.documents.length > 0) {
      user.organizerProfile.verified = true;
      user.organizerProfile.verificationStatus = 'approved';
      user.organizerProfile.verifiedAt = new Date();
    }
    
    await user.save();
    res.json({ message: `Document ${status}`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review event proof document
app.put('/api/admin/events/:id/documents/:docIndex/review', masterAdminMiddleware, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const docIndex = parseInt(req.params.docIndex);
    if (!event.proofDocuments || docIndex >= event.proofDocuments.length) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    event.proofDocuments[docIndex].status = status;
    event.proofDocuments[docIndex].reviewNotes = reviewNotes || '';
    event.proofDocuments[docIndex].reviewedAt = new Date();
    
    // Check if all documents are now approved - update event verification
    const allApproved = event.proofDocuments.every(d => d.status === 'approved');
    if (allApproved && event.proofDocuments.length > 0) {
      event.verificationStatus = 'approved';
    }
    
    await event.save();
    res.json({ message: `Document ${status}`, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event verification status
app.put('/api/admin/events/:id/verification', masterAdminMiddleware, async (req, res) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    event.verificationStatus = verificationStatus;
    event.verificationNotes = verificationNotes || '';
    
    // If approving, also approve all pending documents
    if (verificationStatus === 'approved') {
      event.proofDocuments = (event.proofDocuments || []).map(doc => ({
        ...doc,
        status: doc.status === 'pending' ? 'approved' : doc.status,
        reviewedAt: doc.status === 'pending' ? new Date() : doc.reviewedAt
      }));
    }
    
    await event.save();
    
    // Send email notification to organizer
    const organizer = await User.findById(event.organizerId);
    if (organizer?.email) {
      const statusText = verificationStatus === 'approved' ? 'approved' : 
                         verificationStatus === 'rejected' ? 'rejected' :
                         verificationStatus === 'info_needed' ? 'requires additional information' : verificationStatus;
      try {
        await sendEmail(
          organizer.email,
          `Event Verification Update: ${event.eventName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Event Verification Update</h2>
            <p>Your event "<strong>${event.eventName}</strong>" has been <strong>${statusText}</strong>.</p>
            ${verificationNotes ? `<p><strong>Note from admin:</strong> ${verificationNotes}</p>` : ''}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">This is an automated notification from PermitWise.</p>
          </div>`
        );
      } catch (emailErr) { console.error('Email error:', emailErr); }
    }
    
    res.json({ message: `Event verification updated to ${verificationStatus}`, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin edit event (SuperAdmin can edit any event)
app.put('/api/admin/events/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const { eventName, organizerName, description, startDate, endDate, city, state, address, status, maxVendors } = req.body;
    
    if (eventName) event.eventName = eventName;
    if (organizerName) event.organizerName = organizerName;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (city) event.location.city = city;
    if (state) event.location.state = state;
    if (address !== undefined) event.location.address = address;
    if (status) event.status = status;
    if (maxVendors !== undefined) event.maxVendors = maxVendors ? parseInt(maxVendors) : null;
    event.updatedAt = new Date();
    
    await event.save();
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN SUBSCRIPTION MANAGEMENT
// ===========================================

// Admin Get Subscription by Business ID
app.get('/api/admin/subscriptions/:businessId', masterAdminMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ vendorBusinessId: req.params.businessId })
      .populate('vendorBusinessId', 'businessName')
      .populate('userId', 'email firstName lastName');
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Extend Trial
app.post('/api/admin/subscriptions/:businessId/extend-trial', masterAdminMiddleware, async (req, res) => {
  try {
    const { days, note } = req.body;
    
    if (!days || days < 1 || days > 365) {
      return res.status(400).json({ error: 'Days must be between 1 and 365' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.params.businessId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Calculate new trial end date
    const currentEnd = subscription.trialEndsAt || subscription.currentPeriodEnd || new Date();
    const newTrialEnd = new Date(Math.max(currentEnd.getTime(), Date.now()));
    newTrialEnd.setDate(newTrialEnd.getDate() + parseInt(days));
    
    subscription.plan = 'trial';
    subscription.status = 'trial';
    subscription.trialEndsAt = newTrialEnd;
    subscription.currentPeriodEnd = newTrialEnd;
    subscription.promoNote = note || `Trial extended by ${days} days`;
    subscription.promoGrantedBy = 'admin';
    subscription.promoGrantedAt = new Date();
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    res.json({ 
      success: true, 
      subscription,
      message: `Trial extended by ${days} days until ${newTrialEnd.toLocaleDateString()}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Grant Promo Subscription
app.post('/api/admin/subscriptions/:businessId/grant-promo', masterAdminMiddleware, async (req, res) => {
  try {
    const { plan, durationDays, note } = req.body;
    
    // plan can be 'promo' (time-limited) or 'lifetime' (permanent)
    if (!['promo', 'lifetime', 'pro', 'elite'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be promo, lifetime, pro, or elite' });
    }
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.params.businessId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Set expiration for promo plans
    let promoExpires = null;
    if (plan === 'promo' && durationDays) {
      promoExpires = new Date();
      promoExpires.setDate(promoExpires.getDate() + parseInt(durationDays));
    }
    
    // Use appropriate features
    const featurePlan = plan === 'lifetime' ? 'lifetime' : (plan === 'promo' ? 'promo' : plan);
    
    subscription.plan = plan;
    subscription.status = plan === 'lifetime' ? 'lifetime' : (plan === 'promo' ? 'promo' : 'active');
    subscription.features = PLAN_FEATURES[featurePlan];
    subscription.promoGrantedBy = 'admin';
    subscription.promoGrantedAt = new Date();
    subscription.promoNote = note || `Granted ${plan} subscription`;
    subscription.promoExpiresAt = promoExpires;
    subscription.currentPeriodEnd = promoExpires || new Date('2099-12-31'); // Far future for lifetime
    subscription.trialEndsAt = null;
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    const expiryMsg = promoExpires 
      ? `until ${promoExpires.toLocaleDateString()}` 
      : 'permanently';
    
    res.json({ 
      success: true, 
      subscription,
      message: `Granted ${plan} subscription ${expiryMsg}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Revoke Promo/Reset to Trial
app.post('/api/admin/subscriptions/:businessId/revoke', masterAdminMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    
    const subscription = await Subscription.findOne({ vendorBusinessId: req.params.businessId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Reset to expired trial
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() - 1); // Expired yesterday
    
    subscription.plan = 'trial';
    subscription.status = 'trial';
    subscription.features = PLAN_FEATURES.trial;
    subscription.trialEndsAt = trialEnd;
    subscription.currentPeriodEnd = trialEnd;
    subscription.promoExpiresAt = null;
    subscription.promoNote = note || 'Subscription revoked by admin';
    subscription.promoGrantedBy = 'admin';
    subscription.promoGrantedAt = new Date();
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    res.json({ 
      success: true, 
      subscription,
      message: 'Subscription revoked, reset to expired trial'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Jurisdictions List
app.get('/api/admin/jurisdictions', masterAdminMiddleware, async (req, res) => {
  try {
    const jurisdictions = await Jurisdiction.find().sort({ state: 1, city: 1 });
    // Add permit type count
    const withCounts = await Promise.all(jurisdictions.map(async (j) => {
      const count = await PermitType.countDocuments({ jurisdictionId: j._id });
      return { ...j.toObject(), permitTypesCount: count };
    }));
    res.json({ jurisdictions: withCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Create Jurisdiction
app.post('/api/admin/jurisdictions', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, type, city, state, county, notes, contactInfo } = req.body;
    
    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!type) return res.status(400).json({ error: 'Type is required (city, county, or state)' });
    if (!['city', 'county', 'state'].includes(type)) return res.status(400).json({ error: 'Type must be city, county, or state' });
    if (!state) return res.status(400).json({ error: 'State is required' });
    
    const jurisdiction = new Jurisdiction({ name, type, city, state, county, notes, contactInfo });
    await jurisdiction.save();
    res.status(201).json({ jurisdiction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete Jurisdiction
app.delete('/api/admin/jurisdictions/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await Jurisdiction.findByIdAndDelete(req.params.id);
    await PermitType.deleteMany({ jurisdictionId: req.params.id });
    res.json({ message: 'Jurisdiction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Permit Types List
app.get('/api/admin/permit-types', masterAdminMiddleware, async (req, res) => {
  try {
    const permitTypes = await PermitType.find().populate('jurisdictionId', 'name city state').sort({ name: 1 });
    res.json({ permitTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Create Permit Type
app.post('/api/admin/permit-types', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, jurisdictionId, vendorTypes, description, issuingAuthorityName, renewalPeriodMonths, importanceLevel, estimatedCost, requiredDocuments, fees } = req.body;
    
    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Permit name is required' });
    if (!jurisdictionId) return res.status(400).json({ error: 'Jurisdiction is required' });
    
    // Verify jurisdiction exists
    const jurisdiction = await Jurisdiction.findById(jurisdictionId);
    if (!jurisdiction) return res.status(400).json({ error: 'Jurisdiction not found' });
    
    const permitType = new PermitType({ name, jurisdictionId, vendorTypes, description, issuingAuthorityName, renewalPeriodMonths, importanceLevel, estimatedCost, requiredDocuments, fees });
    await permitType.save();
    res.status(201).json({ permitType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Permit Type
app.put('/api/admin/permit-types/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, description, jurisdictionId, vendorTypes, renewalPeriodMonths, importanceLevel, issuingAuthorityName, estimatedCost, requiredDocuments, fees } = req.body;
    
    const permitType = await PermitType.findByIdAndUpdate(
      req.params.id,
      { 
        name, description, jurisdictionId, vendorTypes, renewalPeriodMonths, 
        importanceLevel, issuingAuthorityName, estimatedCost, requiredDocuments, fees,
        updatedAt: Date.now() 
      },
      { new: true }
    ).populate('jurisdictionId', 'name city state');
    
    if (!permitType) {
      return res.status(404).json({ error: 'Permit type not found' });
    }
    
    res.json({ permitType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete Permit Type
app.delete('/api/admin/permit-types/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await PermitType.findByIdAndDelete(req.params.id);
    res.json({ message: 'Permit type deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Duplicate Permit Type
app.post('/api/admin/permit-types/:id/duplicate', masterAdminMiddleware, async (req, res) => {
  try {
    const { newJurisdictionId } = req.body;
    const original = await PermitType.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Permit type not found' });
    }
    
    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    // Use new jurisdiction if provided
    if (newJurisdictionId) {
      duplicateData.jurisdictionId = newJurisdictionId;
    }
    // Keep the original name - no "(Copy)" suffix
    
    const duplicate = new PermitType(duplicateData);
    await duplicate.save();
    
    const populated = await PermitType.findById(duplicate._id).populate('jurisdictionId', 'name city state');
    res.status(201).json({ permitType: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN CHECKLISTS MANAGEMENT
// ===========================================

// Admin Get All Checklists
app.get('/api/admin/checklists', masterAdminMiddleware, async (req, res) => {
  try {
    const checklists = await InspectionChecklist.find()
      .populate('jurisdictionId', 'name city state')
      .sort({ createdAt: -1 });
    res.json({ checklists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Create Checklist
app.post('/api/admin/checklists', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, description, jurisdictionId, vendorType, vendorTypes, forOrganization, category, items } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Checklist name is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one checklist item is required' });
    }
    
    // Validate each item
    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemText) {
        return res.status(400).json({ error: `Item ${i + 1} is missing text` });
      }
    }
    
    // Support both single vendorType and vendorTypes array
    let finalVendorTypes = vendorTypes || [];
    if (vendorType && !finalVendorTypes.length) {
      finalVendorTypes = [vendorType];
    }
    
    const checklist = new InspectionChecklist({
      name,
      description,
      jurisdictionId: jurisdictionId || null,
      vendorType: vendorType || null, // For backward compatibility
      vendorTypes: finalVendorTypes,
      forOrganization: forOrganization || null,
      category: category || 'general',
      items: items.map((item, index) => ({
        itemText: item.itemText,
        description: item.description || '',
        required: item.required !== false,
        order: index
      })),
      active: true
    });
    
    await checklist.save();
    const populated = await InspectionChecklist.findById(checklist._id).populate('jurisdictionId', 'name city state');
    res.status(201).json({ checklist: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Checklist
app.put('/api/admin/checklists/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const { name, description, jurisdictionId, vendorType, vendorTypes, forOrganization, category, items, active } = req.body;
    
    const checklist = await InspectionChecklist.findById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    
    if (name) checklist.name = name;
    if (description !== undefined) checklist.description = description;
    if (jurisdictionId !== undefined) checklist.jurisdictionId = jurisdictionId || null;
    if (vendorType !== undefined) checklist.vendorType = vendorType || null;
    if (vendorTypes !== undefined) checklist.vendorTypes = vendorTypes || [];
    if (forOrganization !== undefined) checklist.forOrganization = forOrganization || null;
    if (category) checklist.category = category;
    if (active !== undefined) checklist.active = active;
    if (items && Array.isArray(items)) {
      checklist.items = items.map((item, index) => ({
        itemText: item.itemText,
        description: item.description || '',
        required: item.required !== false,
        order: index
      }));
    }
    checklist.updatedAt = new Date();
    
    await checklist.save();
    const populated = await InspectionChecklist.findById(checklist._id).populate('jurisdictionId', 'name city state');
    res.json({ checklist: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete Checklist
app.delete('/api/admin/checklists/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await InspectionChecklist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN EVENTS MANAGEMENT
// ===========================================

// Admin Get All Events
app.get('/api/admin/events', masterAdminMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('requiredPermitTypes', 'name')
      .populate('assignedVendors.vendorBusinessId', 'businessName')
      .sort({ startDate: -1 })
      .limit(100);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Create Event
app.post('/api/admin/events', masterAdminMiddleware, async (req, res) => {
  try {
    const { eventName, organizerName, organizerEmail, organizerPhone, description, eventType, startDate, endDate, city, state, address, vendorFee, maxVendors, status, requiredPermitTypes, vendorTypes } = req.body;
    
    if (!eventName) return res.status(400).json({ error: 'Event name is required' });
    if (!startDate) return res.status(400).json({ error: 'Start date is required' });
    if (!city || !state) return res.status(400).json({ error: 'City and state are required' });
    
    const event = new Event({
      eventName,
      organizerName: organizerName || 'PermitWise Admin',
      organizerContact: {
        email: organizerEmail || '',
        phone: organizerPhone || ''
      },
      description,
      eventType: eventType || 'festival',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      location: {
        city,
        state,
        address: address || ''
      },
      vendorFee: vendorFee ? parseFloat(vendorFee) : null,
      maxVendors: maxVendors ? parseInt(maxVendors) : null,
      status: status || 'draft',
      requiredPermitTypes: requiredPermitTypes || [],
      vendorTypes: vendorTypes || []
    });
    
    await event.save();
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Event
app.put('/api/admin/events/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const { eventName, organizerName, organizerEmail, organizerPhone, description, eventType, startDate, endDate, city, state, address, vendorFee, maxVendors, status, requiredPermitTypes, vendorTypes } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (eventName) event.eventName = eventName;
    if (organizerName) event.organizerName = organizerName;
    if (organizerEmail !== undefined) event.organizerContact.email = organizerEmail;
    if (organizerPhone !== undefined) event.organizerContact.phone = organizerPhone;
    if (description !== undefined) event.description = description;
    if (eventType) event.eventType = eventType;
    if (startDate) event.startDate = new Date(startDate);
    if (endDate) event.endDate = new Date(endDate);
    if (city) event.location.city = city;
    if (state) event.location.state = state;
    if (address !== undefined) event.location.address = address;
    if (vendorFee !== undefined) event.vendorFee = vendorFee ? parseFloat(vendorFee) : null;
    if (maxVendors !== undefined) event.maxVendors = maxVendors ? parseInt(maxVendors) : null;
    if (status) event.status = status;
    if (requiredPermitTypes) event.requiredPermitTypes = requiredPermitTypes;
    if (vendorTypes) event.vendorTypes = vendorTypes;
    event.updatedAt = new Date();
    
    await event.save();
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete Event
app.delete('/api/admin/events/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Assign Vendor to Event
app.post('/api/admin/events/:id/assign-vendor', masterAdminMiddleware, async (req, res) => {
  try {
    const { vendorBusinessId, notes } = req.body;
    
    if (!vendorBusinessId) {
      return res.status(400).json({ error: 'Vendor business ID is required' });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if vendor is already assigned
    const alreadyAssigned = event.assignedVendors?.some(
      v => v.vendorBusinessId.toString() === vendorBusinessId
    );
    if (alreadyAssigned) {
      return res.status(400).json({ error: 'Vendor is already assigned to this event' });
    }
    
    // Add vendor to assigned list
    if (!event.assignedVendors) event.assignedVendors = [];
    event.assignedVendors.push({
      vendorBusinessId,
      assignedAt: new Date(),
      notes: notes || ''
    });
    event.updatedAt = new Date();
    
    await event.save();
    
    // Populate and return
    const populated = await Event.findById(event._id)
      .populate('requiredPermitTypes')
      .populate('assignedVendors.vendorBusinessId', 'businessName primaryVendorType');
    
    res.json({ event: populated, message: 'Vendor assigned to event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Remove Vendor from Event
app.delete('/api/admin/events/:id/remove-vendor/:vendorId', masterAdminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    event.assignedVendors = (event.assignedVendors || []).filter(
      v => v.vendorBusinessId.toString() !== req.params.vendorId
    );
    event.updatedAt = new Date();
    
    await event.save();
    res.json({ message: 'Vendor removed from event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Get Event Details with Vendors
app.get('/api/admin/events/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('requiredPermitTypes')
      .populate('assignedVendors.vendorBusinessId', 'businessName primaryVendorType operatingCities');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// ADMIN SUGGESTION/TICKET MANAGEMENT
// ===========================================

// Get all suggestions (admin)
app.get('/api/admin/suggestions', masterAdminMiddleware, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const suggestions = await Suggestion.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('vendorBusinessId', 'businessName')
      .sort({ createdAt: -1 });
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update suggestion status (admin)
app.put('/api/admin/suggestions/:id', masterAdminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    
    if (status) suggestion.status = status;
    if (adminNotes !== undefined) suggestion.adminNotes = adminNotes;
    
    if (status === 'completed' || status === 'rejected') {
      suggestion.resolvedBy = req.userId;
      suggestion.resolvedAt = new Date();
    }
    
    suggestion.updatedAt = new Date();
    await suggestion.save();
    
    const populated = await Suggestion.findById(suggestion._id)
      .populate('userId', 'firstName lastName email')
      .populate('vendorBusinessId', 'businessName');
    
    res.json({ suggestion: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete suggestion (admin)
app.delete('/api/admin/suggestions/:id', masterAdminMiddleware, async (req, res) => {
  try {
    await Suggestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Suggestion deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// CRON JOBS - NOTIFICATION SCHEDULER
// ===========================================

// Process pending notifications every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      status: 'pending',
      sendAt: { $lte: now }
    }).populate('userId').limit(100);
    
    for (const notification of notifications) {
      try {
        if (notification.type === 'email') {
          await sendEmail(notification.channelAddress, notification.subject, notification.message);
        } else if (notification.type === 'sms') {
          await sendSMS(notification.channelAddress, notification.message);
        }
        
        notification.status = 'sent';
        notification.sentAt = new Date();
      } catch (error) {
        notification.status = 'failed';
        notification.errorMessage = error.message;
      }
      
      await notification.save();
    }
  } catch (error) {
    console.error('Notification cron error:', error);
  }
});

// Check for expiring permits daily at 8am
cron.schedule('0 8 * * *', async () => {
  try {
    const reminderDays = [30, 14, 7, 1];
    const now = new Date();
    
    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const expiringPermits = await VendorPermit.find({
        status: { $in: ['active', 'pending_renewal'] },
        expiryDate: { $gte: startOfDay, $lte: endOfDay }
      })
        .populate('permitTypeId')
        .populate('jurisdictionId')
        .populate({
          path: 'vendorBusinessId',
          populate: { path: 'ownerId' }
        });
      
      for (const permit of expiringPermits) {
        // Check if reminder already sent
        const alreadySent = permit.remindersSent?.find(
          r => r.daysBeforeExpiry === days
        );
        
        if (alreadySent) continue;
        
        const user = permit.vendorBusinessId?.ownerId;
        if (!user) continue;
        
        const subscription = await Subscription.findOne({
          vendorBusinessId: permit.vendorBusinessId._id,
          status: { $in: ['active', 'trial'] }
        });
        
        // Send email reminder
        if (user.notificationPreferences?.email !== false) {
          const emailHtml = `
            <h1>Permit Renewal Reminder</h1>
            <p>Hi ${user.firstName || 'there'},</p>
            <p>Your <strong>${permit.permitTypeId?.name || 'permit'}</strong> for ${permit.jurisdictionId?.name || 'your area'} expires in ${days} day${days > 1 ? 's' : ''}.</p>
            <p><strong>Expiry Date:</strong> ${new Date(permit.expiryDate).toLocaleDateString()}</p>
            <p>Log in to PermitWise to renew: <a href="${CLIENT_URL}/permits/${permit._id}">${CLIENT_URL}/permits/${permit._id}</a></p>
            <p>Don't let an expired permit shut you down!</p>
            <p>Best,<br>The PermitWise Team</p>
          `;
          
          const notification = new Notification({
            vendorBusinessId: permit.vendorBusinessId._id,
            userId: user._id,
            type: 'email',
            channelAddress: user.email,
            subject: `⚠️ Permit Expires in ${days} Day${days > 1 ? 's' : ''} - ${permit.permitTypeId?.name}`,
            message: emailHtml,
            sendAt: new Date(),
            relatedVendorPermitId: permit._id
          });
          await notification.save();
        }
        
        // Send SMS if Pro/Elite and enabled
        if (subscription?.features?.smsAlerts && user.notificationPreferences?.sms && user.phone) {
          const smsMessage = `PermitWise: Your ${permit.permitTypeId?.name || 'permit'} expires in ${days} day${days > 1 ? 's' : ''}. Renew now to avoid fines. ${CLIENT_URL}`;
          
          const notification = new Notification({
            vendorBusinessId: permit.vendorBusinessId._id,
            userId: user._id,
            type: 'sms',
            channelAddress: user.phone,
            message: smsMessage,
            sendAt: new Date(),
            relatedVendorPermitId: permit._id
          });
          await notification.save();
        }
        
        // Record reminder sent
        permit.remindersSent = permit.remindersSent || [];
        permit.remindersSent.push({
          daysBeforeExpiry: days,
          sentAt: new Date(),
          type: 'email'
        });
        await permit.save();
      }
    }
  } catch (error) {
    console.error('Permit reminder cron error:', error);
  }
});

// Update permit statuses daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    
    // Mark expired permits
    await VendorPermit.updateMany(
      { status: { $in: ['active', 'pending_renewal'] }, expiryDate: { $lt: now } },
      { status: 'expired' }
    );
    
    // Mark pending renewal (30 days or less)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    await VendorPermit.updateMany(
      { status: 'active', expiryDate: { $gte: now, $lte: thirtyDaysFromNow } },
      { status: 'pending_renewal' }
    );
    
    console.log('Permit statuses updated');
  } catch (error) {
    console.error('Permit status update error:', error);
  }
});

// ===========================================
// STATS/ANALYTICS ROUTES
// ===========================================

// Get dashboard stats
app.get('/api/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const permits = await VendorPermit.find({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    const documents = await Document.countDocuments({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    const inspections = await VendorInspection.countDocuments({
      vendorBusinessId: req.user.vendorBusinessId
    });
    
    // Upcoming expirations (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingExpirations = await VendorPermit.find({
      vendorBusinessId: req.user.vendorBusinessId,
      expiryDate: { $gte: new Date(), $lte: thirtyDaysFromNow }
    })
      .populate('permitTypeId', 'name')
      .sort({ expiryDate: 1 });
    
    const stats = {
      permits: {
        total: permits.length,
        active: permits.filter(p => p.status === 'active').length,
        expired: permits.filter(p => p.status === 'expired').length,
        pendingRenewal: permits.filter(p => p.status === 'pending_renewal').length,
        missing: permits.filter(p => p.status === 'missing').length,
        inProgress: permits.filter(p => p.status === 'in_progress').length
      },
      documents,
      inspections,
      upcomingExpirations: upcomingExpirations.map(p => ({
        id: p._id,
        name: p.permitTypeId?.name,
        expiryDate: p.expiryDate,
        daysUntil: daysUntilExpiry(p.expiryDate)
      })),
      complianceScore: permits.length > 0 
        ? Math.round((permits.filter(p => p.status === 'active').length / permits.length) * 100)
        : 0
    };
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Landing page route - MUST be before static middleware
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'landing.html'));
  } else {
    res.sendFile(path.join(__dirname, 'client/public', 'landing.html'));
  }
});

// App route (for React app in production)
app.get('/app', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(CLIENT_URL);
  }
});

// Password reset route (serves React app to handle token)
app.get('/reset-password', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(`${CLIENT_URL}/reset-password?token=${req.query.token || ''}`);
  }
});

// Email verification route (serves React app to handle token)
app.get('/verify-email', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(`${CLIENT_URL}/verify-email?token=${req.query.token || ''}`);
  }
});

// Legal pages served from server
app.get('/privacy', (req, res) => {
  res.redirect('/app#privacy');
});

app.get('/terms', (req, res) => {
  res.redirect('/app#terms');
});

// Superadmin page - served as React SPA (case-insensitive)
app.get('/superadmin', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(CLIENT_URL + '/superadmin');
  }
});

// Redirect uppercase to lowercase for consistency
app.get('/SUPERADMIN', (req, res) => {
  res.redirect('/superadmin');
});

// Catch-all for React app routes
app.get('/app/*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(CLIENT_URL);
  }
});

// Serve static files in production (AFTER explicit routes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build'), {
    index: false // Don't serve index.html for "/" - we handle that above
  }));
  
  // Final catch-all - serve React app for any unmatched routes (except API)
  app.get('*', (req, res) => {
    // Don't catch API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// ===========================================
// GLOBAL ERROR HANDLER
// ===========================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message || err);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 25MB.' });
  }
  
  // Don't expose stack traces in production
  res.status(err.status || 500).json({ 
    error: IS_PRODUCTION ? 'An unexpected error occurred' : err.message 
  });
});

// ===========================================
// START SERVER
// ===========================================

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('FATAL: Could not connect to MongoDB after multiple retries');
  process.exit(1);
};

connectWithRetry().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`PermitWise server running on port ${PORT} [${NODE_ENV}]`);
    console.log(`  Stripe:  ${STRIPE_ENABLED ? (stripe ? 'ENABLED ✓' : 'ENABLED but MISSING KEY ✗') : 'DISABLED (test mode)'}`);
    console.log(`  Google:  ${GOOGLE_PLAY_VALIDATION_ENABLED ? 'ENABLED ✓' : 'DISABLED (test mode)'}`);
    console.log(`  Apple:   ${APPLE_VALIDATION_ENABLED ? 'ENABLED ✓' : 'DISABLED (test mode)'}`);
    if (!twilioClient) console.warn('  Twilio:  not configured — SMS disabled');
    console.log(`  Email:   ${SENDGRID_API_KEY ? 'SendGrid ENABLED ✓' : EMAIL_USER ? 'SMTP ENABLED ✓' : 'not configured — notifications disabled'}`);
  });
  
  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
