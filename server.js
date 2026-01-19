// PermitWise Server - Complete Backend
// Node.js + Express + MongoDB + Stripe + Twilio

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Stripe = require('stripe');
const twilio = require('twilio');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const app = express();

// ===========================================
// CONFIGURATION
// ===========================================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/permitwise';
const JWT_SECRET = process.env.JWT_SECRET || 'permitwise-secret-key-change-in-production';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Initialize Twilio
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Middleware
app.use(cors());
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Secure file serving - requires authentication and ownership verification
// Supports both Authorization header and ?token= query parameter for img/iframe compatibility
app.get('/uploads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check for auth token (header or query param)
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Add ?token=YOUR_TOKEN to the URL.' });
    }
    
    // Verify token and get user
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const user = await User.findById(userId);
    if (!user || !user.vendorBusinessId) {
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
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
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
  role: { type: String, enum: ['owner', 'manager', 'staff', 'admin'], default: 'owner' },
  vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
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
    enum: ['food_truck', 'tent_vendor', 'mobile_retail', 'farmers_market', 'craft_vendor', 'mobile_bartender', 'mobile_groomer', 'pop_up_shop', 'other'],
    required: true 
  },
  secondaryVendorTypes: [{ type: String }],
  operatingCities: [{
    city: String,
    state: String,
    isPrimary: { type: Boolean, default: false }
  }],
  vehicleDetails: {
    make: String,
    model: String,
    year: String,
    plateNumber: String,
    vin: String,
    color: String
  },
  insurance: {
    carrier: String,
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
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
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
  plan: { type: String, enum: ['basic', 'pro', 'elite', 'trial'], default: 'trial' },
  status: { type: String, enum: ['trial', 'active', 'past_due', 'canceled', 'paused'], default: 'trial' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  trialEndsAt: { type: Date },
  canceledAt: { type: Date },
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
  vendorType: { type: String },
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
  checklistId: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionChecklist', required: true },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inspectionDate: { type: Date, default: Date.now },
  results: [{
    itemId: { type: mongoose.Schema.Types.ObjectId },
    itemText: String,
    status: { type: String, enum: ['pass', 'fail', 'na'], default: 'na' },
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
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  vendorSpots: { type: Number },
  vendorFee: { type: Number },
  applicationDeadline: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'closed', 'completed', 'canceled'], default: 'draft' },
  registeredVendors: [{
    vendorBusinessId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBusiness' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    paymentId: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const VendorBusiness = mongoose.model('VendorBusiness', vendorBusinessSchema);
const Jurisdiction = mongoose.model('Jurisdiction', jurisdictionSchema);
const PermitType = mongoose.model('PermitType', permitTypeSchema);
const VendorPermit = mongoose.model('VendorPermit', vendorPermitSchema);
const Document = mongoose.model('Document', documentSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const InspectionChecklist = mongoose.model('InspectionChecklist', inspectionChecklistSchema);
const VendorInspection = mongoose.model('VendorInspection', vendorInspectionSchema);
const Event = mongoose.model('Event', eventSchema);

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
      vendorBusinessId: req.user.vendorBusinessId,
      status: { $in: ['active', 'trial'] }
    });
    if (!subscription) {
      return res.status(403).json({ error: 'No active subscription' });
    }
    if (feature && !subscription.features[feature]) {
      return res.status(403).json({ error: `Feature '${feature}' not available in your plan. Please upgrade.` });
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
// HELPER FUNCTIONS
// ===========================================

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Send email
const sendEmail = async (to, subject, html) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('Email not configured. Would send:', { to, subject });
    return { success: false, message: 'Email not configured' };
  }
  try {
    await transporter.sendMail({
      from: `"PermitWise" <${EMAIL_USER}>`,
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

// Plan features
const PLAN_FEATURES = {
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
  }
};

// ===========================================
// AUTH ROUTES
// ===========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName } = req.body;
    
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
      verificationToken
    });
    
    await user.save();
    
    // Send verification email
    const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Welcome to PermitWise - Verify Your Email',
      `
        <h1>Welcome to PermitWise!</h1>
        <p>Hi ${firstName || 'there'},</p>
        <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
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
      
    res.json({ user, business, subscription });
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
      operatingCities,
      vehicleDetails,
      insurance
    } = req.body;
    
    // Validate required fields
    if (!businessName) return res.status(400).json({ error: 'Business name is required' });
    if (!primaryVendorType) return res.status(400).json({ error: 'Business type is required' });
    
    const validVendorTypes = ['food_truck', 'tent_vendor', 'mobile_retail', 'farmers_market', 'craft_vendor', 'mobile_bartender', 'mobile_groomer', 'pop_up_shop', 'other'];
    if (!validVendorTypes.includes(primaryVendorType)) {
      return res.status(400).json({ error: 'Invalid business type' });
    }
    
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
app.put('/api/business', authMiddleware, async (req, res) => {
  try {
    if (!req.user.vendorBusinessId) {
      return res.status(404).json({ error: 'No business found' });
    }
    
    const updates = { ...req.body, updatedAt: Date.now() };
    delete updates._id;
    delete updates.ownerId;
    
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
app.post('/api/business/team', authMiddleware, checkFeature('teamAccounts'), async (req, res) => {
  try {
    const { email, role, firstName, lastName } = req.body;
    
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
        role,
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
    
    business.teamMembers.push({ userId: user._id, role });
    await business.save();
    
    res.status(201).json({ message: 'Team member added', business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove team member
app.delete('/api/business/team/:userId', authMiddleware, async (req, res) => {
  try {
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
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

app.post('/api/team/invite', authMiddleware, checkFeature('teamAccounts'), async (req, res) => {
  try {
    const { email, role } = req.body;
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    if (business.teamMembers.length >= (req.subscription?.features?.maxTeamMembers || 5)) {
      return res.status(400).json({ error: 'Team member limit reached' });
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
        role: role || 'member',
        vendorBusinessId: business._id
      });
      await user.save();
      await sendEmail(email, `You've been invited to PermitWise`,
        `<h1>Team Invitation</h1><p>You've been invited to join ${business.businessName} on PermitWise.</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Login at: <a href="${CLIENT_URL}/login">${CLIENT_URL}/login</a></p>`
      );
    }
    business.teamMembers.push({ userId: user._id, role: role || 'member' });
    await business.save();
    res.status(201).json({ message: 'Team member invited' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/team/:id', authMiddleware, async (req, res) => {
  try {
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
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
// JURISDICTION ROUTES
// ===========================================

// Get all jurisdictions
app.get('/api/jurisdictions', async (req, res) => {
  try {
    const { state, type, search } = req.query;
    const query = { active: true };
    
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
    const { city, state, vendorType } = req.query;
    
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
      return res.json({ permitTypes: [], message: 'City not found in our database yet' });
    }
    
    const permitTypes = await PermitType.find({
      jurisdictionId: jurisdiction._id,
      vendorTypes: vendorType,
      active: true
    }).populate('jurisdictionId', 'name city state type');
    
    res.json({ jurisdiction, permitTypes });
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
      .populate('documentId');
      
    if (!permit) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add permit to dashboard
app.post('/api/permits', authMiddleware, async (req, res) => {
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
app.put('/api/permits/:id', authMiddleware, async (req, res) => {
  try {
    const { status, permitNumber, issueDate, expiryDate, notes } = req.body;
    
    const permit = await VendorPermit.findOneAndUpdate(
      { _id: req.params.id, vendorBusinessId: req.user.vendorBusinessId },
      { status, permitNumber, issueDate, expiryDate, notes, updatedAt: Date.now() },
      { new: true }
    )
      .populate('permitTypeId')
      .populate('jurisdictionId')
      .populate('documentId');
    
    if (!permit) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    
    res.json({ permit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete permit from dashboard
app.delete('/api/permits/:id', authMiddleware, async (req, res) => {
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
app.post('/api/permits/add-city', authMiddleware, async (req, res) => {
  try {
    const { city, state } = req.body;
    
    // Check city limit based on subscription
    const subscription = await Subscription.findOne({
      vendorBusinessId: req.user.vendorBusinessId,
      status: { $in: ['active', 'trial'] }
    });
    
    const business = await VendorBusiness.findById(req.user.vendorBusinessId);
    if (business.operatingCities.length >= (subscription?.features?.maxCities || 1)) {
      return res.status(403).json({ error: 'City limit reached. Please upgrade your plan.' });
    }
    
    const jurisdiction = await Jurisdiction.findOne({
      $or: [
        { city: new RegExp(`^${city}$`, 'i'), state },
        { name: new RegExp(`^${city}$`, 'i'), state }
      ],
      active: true
    });
    
    if (!jurisdiction) {
      // Add city anyway, just no auto permits
      business.operatingCities.push({ city, state, isPrimary: false });
      await business.save();
      return res.json({ message: 'City added but no permit templates found yet', permitsAdded: 0 });
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
    
    res.json({ message: `${added} permits added for ${city}, ${state}`, permitsAdded: added });
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
      
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
app.post('/api/documents', authMiddleware, upload.single('file'), async (req, res) => {
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
      await VendorPermit.findOneAndUpdate(
        { _id: relatedEntityId, vendorBusinessId: req.user.vendorBusinessId },
        { documentId: document._id }
      );
    }
    
    res.status(201).json({ document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete('/api/documents/:id', authMiddleware, async (req, res) => {
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
        { label: 'License Plate:', value: business.vehicleDetails.plateNumber || 'N/A' },
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
        { label: 'Insurance Carrier:', value: business.insurance.carrier || 'N/A' },
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
    const fileName = `application-${permitType.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, 'uploads', fileName);
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
    const query = { active: true };
    
    if (jurisdictionId) query.jurisdictionId = jurisdictionId;
    if (vendorType) query.$or = [{ vendorType }, { vendorType: null }];
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
app.post('/api/inspections', authMiddleware, checkFeature('inspectionChecklists'), async (req, res) => {
  try {
    const { checklistId, location } = req.body;
    
    const checklist = await InspectionChecklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }
    
    const inspection = new VendorInspection({
      vendorBusinessId: req.user.vendorBusinessId,
      checklistId,
      completedBy: req.userId,
      results: checklist.items.map(item => ({
        itemId: item._id,
        itemText: item.itemText,
        status: 'na',
        notes: ''
      })),
      location
    });
    
    await inspection.save();
    
    res.status(201).json({ inspection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inspection
app.put('/api/inspections/:id', authMiddleware, async (req, res) => {
  try {
    const { results, notes, overallStatus, photos, location } = req.body;
    
    const inspection = await VendorInspection.findOneAndUpdate(
      { _id: req.params.id, vendorBusinessId: req.user.vendorBusinessId },
      { results, notes, overallStatus, photos, location, updatedAt: Date.now() },
      { new: true }
    ).populate('checklistId');
    
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
      .populate('completedBy', 'firstName lastName')
      .sort({ inspectionDate: -1 });
      
    res.json({ inspections });
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
app.get('/api/events/:id/readiness', authMiddleware, checkFeature('eventIntegration'), async (req, res) => {
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

// Apply to event
app.post('/api/events/:id/apply', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not accepting applications' });
    }
    
    // Check if already applied
    const existing = event.registeredVendors.find(
      rv => rv.vendorBusinessId.toString() === req.user.vendorBusinessId.toString()
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this event' });
    }
    
    event.registeredVendors.push({
      vendorBusinessId: req.user.vendorBusinessId,
      status: 'pending'
    });
    
    await event.save();
    
    res.json({ message: 'Application submitted', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (organizer)
app.post('/api/events', authMiddleware, async (req, res) => {
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
app.post('/api/notifications', authMiddleware, async (req, res) => {
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

// Create checkout session
app.post('/api/subscription/checkout', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }
    
    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
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
app.post('/api/subscription/portal', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
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

// Stripe webhook
app.post('/webhook', async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ error: 'Stripe not configured' });
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
        const { plan, vendorBusinessId, userId } = session.metadata;
        
        // Get subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Update or create subscription
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
            features: PLAN_FEATURES[plan]
          },
          { upsert: true, new: true }
        );
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { status: 'active' }
        );
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { status: 'past_due' }
        );
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const plan = subscription.metadata?.plan || 'basic';
        
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: subscription.status === 'active' ? 'active' : subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            features: PLAN_FEATURES[plan]
          }
        );
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { status: 'canceled', canceledAt: new Date() }
        );
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
    
    // Use new jurisdiction if provided, otherwise keep original
    if (newJurisdictionId) {
      duplicateData.jurisdictionId = newJurisdictionId;
    }
    duplicateData.name = `${duplicateData.name} (Copy)`;
    
    const duplicate = new PermitType(duplicateData);
    await duplicate.save();
    
    const populated = await PermitType.findById(duplicate._id).populate('jurisdictionId', 'name city state');
    res.status(201).json({ permitType: populated });
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
    res.redirect('http://localhost:3000');
  }
});

// Password reset route (serves React app to handle token)
app.get('/reset-password', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(`http://localhost:3000/reset-password?token=${req.query.token || ''}`);
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
    res.redirect('http://localhost:3000/superadmin');
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
    res.redirect('http://localhost:3000');
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
// START SERVER
// ===========================================

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`PermitWise server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
