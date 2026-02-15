// PermitWise - React Native Mobile Application
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, RefreshControl, StatusBar, Platform, Image, FlatList, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as NavigationBar from 'expo-navigation-bar';
import { WebView } from 'react-native-webview';

// ===========================================
// CONFIGURATION
// ===========================================
const API_URL = 'https://permitwisedotappproduction-production.up.railway.app/api'; // Production URL
const SITE_URL = API_URL.replace('/api', ''); // Base site URL for legal pages

// ===========================================
// ICONS
// ===========================================
const Icons = {
  Dashboard: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Rect x="3" y="3" width="7" height="7" rx="1" /><Rect x="14" y="3" width="7" height="7" rx="1" />
      <Rect x="14" y="14" width="7" height="7" rx="1" /><Rect x="3" y="14" width="7" height="7" rx="1" />
    </Svg>
  ),
  Permit: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14,2 14,8 20,8" /><Line x1="16" y1="13" x2="8" y2="13" /><Line x1="16" y1="17" x2="8" y2="17" />
    </Svg>
  ),
  Document: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <Polyline points="13,2 13,9 20,9" />
    </Svg>
  ),
  Settings: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  ),
  Shield: ({ size = 24, color = '#2563eb' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  ),
  Check: ({ size = 24, color = '#22c55e' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Polyline points="20,6 9,17 4,12" />
    </Svg>
  ),
  Clock: ({ size = 24, color = '#f59e0b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Circle cx="12" cy="12" r="10" /><Polyline points="12,6 12,12 16,14" />
    </Svg>
  ),
  Alert: ({ size = 24, color = '#ef4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Circle cx="12" cy="12" r="10" /><Line x1="12" y1="8" x2="12" y2="12" /><Line x1="12" y1="16" x2="12.01" y2="16" />
    </Svg>
  ),
  Plus: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  ),
  MapPin: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  ChevronRight: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Polyline points="9,18 15,12 9,6" />
    </Svg>
  ),
  X: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Line x1="18" y1="6" x2="6" y2="18" /><Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  ),
  Edit: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  ),
  Truck: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M1 3h15v13H1z" /><Path d="M16 8h4l3 3v5h-7V8z" />
      <Circle cx="5.5" cy="18.5" r="2.5" /><Circle cx="18.5" cy="18.5" r="2.5" />
    </Svg>
  ),
  Event: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  ),
  Calendar: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  ),
  ChevronLeft: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Polyline points="15,18 9,12 15,6" />
    </Svg>
  ),
  ChevronDown: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Polyline points="6,9 12,15 18,9" />
    </Svg>
  ),
  Checklist: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M9 11l3 3L22 4" /><Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Svg>
  ),
  Bell: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  ),
  Eye: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><Circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  EyeOff: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  ),
  Lock: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  ),
  Upload: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><Polyline points="17,8 12,3 7,8" /><Line x1="12" y1="3" x2="12" y2="15" />
    </Svg>
  ),
  Trash: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Polyline points="3,6 5,6 21,6" /><Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  ),
  Info: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Circle cx="12" cy="12" r="10" /><Line x1="12" y1="16" x2="12" y2="12" /><Line x1="12" y1="8" x2="12.01" y2="8" />
    </Svg>
  ),
  Download: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><Polyline points="7,10 12,15 17,10" /><Line x1="12" y1="15" x2="12" y2="3" />
    </Svg>
  ),
};

// ===========================================
// CONSTANTS
// ===========================================
const COLORS = {
  primary: '#2563eb', primaryDark: '#1d4ed8', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
  gray50: '#f8fafc', gray100: '#f1f5f9', gray200: '#e2e8f0', gray300: '#cbd5e1', gray400: '#94a3b8',
  gray500: '#64748b', gray600: '#475569', gray700: '#334155', gray800: '#1e293b', gray900: '#0f172a', white: '#ffffff',
};

const VENDOR_TYPES = [
  { value: 'food_truck', label: 'Food Truck' }, { value: 'food_cart', label: 'Food Cart' },
  { value: 'tent_vendor', label: 'Tent/Booth Vendor' }, { value: 'mobile_retail', label: 'Mobile Retail' },
  { value: 'farmers_market', label: "Farmer's Market" }, { value: 'craft_vendor', label: 'Craft Vendor' },
  { value: 'mobile_bartender', label: 'Mobile Bartender' }, { value: 'mobile_groomer', label: 'Mobile Groomer' },
  { value: 'pop_up_shop', label: 'Pop-Up Shop' }, { value: 'other', label: 'Other' },
];

// Vendor types that typically handle food
const FOOD_VENDOR_TYPES = ['food_truck', 'food_cart', 'mobile_bartender', 'farmers_market'];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

// ===========================================
// API HELPER
// ===========================================
const api = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('permitwise_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      // Don't throw error for subscription_expired - just return null and let UI handle via banner
      if (data.error === 'subscription_expired') {
        console.log('Subscription expired - operation blocked');
        return { _subscriptionExpired: true };
      }
      const err = new Error(data.message || data.error || 'Request failed');
      err.data = data;
      throw err;
    }
    return data;
  },
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, body) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, body) => api.request(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
  // Upload method for FormData (file uploads) - doesn't set Content-Type, lets fetch handle it
  async upload(endpoint, formData) {
    const token = await AsyncStorage.getItem('permitwise_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'subscription_expired') {
        console.log('Subscription expired - upload blocked');
        return { _subscriptionExpired: true };
      }
      const err = new Error(data.message || data.error || 'Upload failed');
      err.data = data;
      throw err;
    }
    return data;
  }
};

// ===========================================
// UTILITIES
// ===========================================
const formatDate = (date) => {
  if (!date) return 'Not entered';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

// Format date input as user types - MM/DD/YYYY
const formatDateInput = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

// Convert formatted date (MM/DD/YYYY) to ISO string for API
const getDateISO = (formatted) => {
  if (!formatted) return '';
  const digits = formatted.replace(/\D/g, '');
  if (digits.length !== 8) return '';
  const month = parseInt(digits.slice(0, 2), 10);
  const day = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Convert ISO date (YYYY-MM-DD) to formatted (MM/DD/YYYY) for display in inputs
const isoToFormatted = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('T')[0].split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
};

// Validate date input
const validateDate = (value, options = {}) => {
  const { required = false } = options;
  if (!value) {
    if (required) return { valid: false, error: 'Date is required' };
    return { valid: true, error: null };
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return { valid: false, error: 'Date is incomplete (MM/DD/YYYY)' };
  if (digits.length > 8) return { valid: false, error: 'Date is too long' };
  
  const month = parseInt(digits.slice(0, 2), 10);
  const day = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);
  
  if (month < 1 || month > 12) return { valid: false, error: 'Invalid month (01-12)' };
  if (day < 1 || day > 31) return { valid: false, error: 'Invalid day (01-31)' };
  if (year < 1900 || year > 2100) return { valid: false, error: 'Invalid year' };
  
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1) return { valid: false, error: 'Invalid date for this month' };
  
  return { valid: true, error: null };
};

const daysUntil = (date) => date ? Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
const getStatusLabel = (status) => ({ active: 'Active', expired: 'Expired', pending_renewal: 'Expiring Soon', missing: 'Missing', in_progress: 'In Progress' }[status] || status);
const getStatusColor = (status) => ({ active: COLORS.success, expired: COLORS.danger, pending_renewal: COLORS.warning, missing: COLORS.gray400 }[status] || COLORS.gray500);

// Phone number formatting - US format: (###) ###-####
const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const phone = digits.startsWith('1') && digits.length > 10 ? digits.slice(1) : digits;
  if (phone.length === 0) return '';
  if (phone.length <= 3) return `(${phone}`;
  if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
};

const getPhoneDigits = (formatted) => {
  if (!formatted) return '';
  const digits = formatted.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : digits;
};

const validatePhone = (value) => {
  if (!value) return { valid: true, error: null };
  const digits = value.replace(/\D/g, '');
  const phone = digits.startsWith('1') && digits.length > 10 ? digits.slice(1) : digits;
  if (phone.length < 10) return { valid: false, error: 'Phone number is too short' };
  if (phone.length > 10) return { valid: false, error: 'Phone number is too long' };
  return { valid: true, error: null };
};

const validateEmail = (email) => {
  if (!email) return { valid: true, error: null };
  if (!email.includes('@')) return { valid: false, error: 'Email must contain @' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: 'Please enter a valid email' };
  return { valid: true, error: null };
};

// Get secure file URL with authentication token
const getSecureFileUrl = async (fileUrl) => {
  if (!fileUrl) return '';
  const token = await AsyncStorage.getItem('permitwise_token');
  if (!token) return fileUrl;
  const separator = fileUrl.includes('?') ? '&' : '?';
  return `${fileUrl}${separator}token=${token}`;
};

// ===========================================
// GOOGLE PLAY BILLING (Android) / APP STORE (iOS) IN-APP PURCHASE
// ===========================================
// Requires: npm install react-native-iap
// Setup: Follow react-native-iap setup guide for both platforms
// Google Play: Create subscriptions in Play Console
// App Store: Create subscriptions in App Store Connect

// Import react-native-iap (must be installed: npm install react-native-iap)
// import * as RNIap from 'react-native-iap';
let RNIap = null;
try {
  RNIap = require('react-native-iap');
} catch (e) {
  console.warn('react-native-iap not installed. IAP will fall back to Stripe checkout.');
}

const SUBSCRIPTION_SKUS = {
  basic: Platform.OS === 'android' ? 'permitwise_basic_monthly' : 'com.permitwise.basic.monthly',
  pro: Platform.OS === 'android' ? 'permitwise_pro_monthly' : 'com.permitwise.pro.monthly',
  elite: Platform.OS === 'android' ? 'permitwise_elite_monthly' : 'com.permitwise.elite.monthly',
  organizer: Platform.OS === 'android' ? 'permitwise_organizer_monthly' : 'com.permitwise.organizer.monthly',
};

const PLAN_DETAILS = {
  basic: { name: 'Basic', price: '$19/month', priceValue: 19, features: ['Up to 5 permits', 'Email reminders', '1 operating city'] },
  pro: { name: 'Pro', price: '$49/month', priceValue: 49, features: ['Up to 20 permits', 'SMS + Email reminders', '5 operating cities', 'Document storage', 'Inspection checklists'], popular: true },
  elite: { name: 'Elite', price: '$99/month', priceValue: 99, features: ['Unlimited permits', 'Priority support', 'Unlimited cities', 'Event readiness', 'Team access'] },
};

const ORGANIZER_PLAN_DETAILS = {
  organizer: { name: 'Organizer', price: '$79/month', priceValue: 79, features: ['Unlimited events', 'Vendor compliance tracking', 'Automated permit verification', 'Custom application forms', 'Payment processing', 'Analytics dashboard', 'Priority support'] },
};

// Billing service - handles Google Play, App Store, and Stripe fallback
const BillingService = {
  isNativeIAPAvailable: !!RNIap && (Platform.OS === 'android' || Platform.OS === 'ios'),
  _initialized: false,
  _purchaseListener: null,
  _errorListener: null,
  
  // Initialize billing - call on app start
  async initialize() {
    if (!this.isNativeIAPAvailable) {
      console.log('Native IAP not available, using Stripe checkout fallback');
      return true;
    }
    
    try {
      await RNIap.initConnection();
      this._initialized = true;
      
      // Listen for purchase updates
      this._purchaseListener = RNIap.purchaseUpdatedListener(async (purchase) => {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            // Determine plan from productId
            const planEntry = Object.entries(SUBSCRIPTION_SKUS).find(([_, sku]) => sku === purchase.productId);
            const plan = planEntry ? planEntry[0] : null;
            
            if (Platform.OS === 'android') {
              // Verify with our server
              await api.post('/subscription/verify-google', {
                purchaseToken: purchase.purchaseToken,
                productId: purchase.productId,
                packageName: purchase.packageNameAndroid
              });
            } else {
              // iOS - verify receipt with server
              await api.post('/subscription/verify-apple', {
                receiptData: receipt,
                productId: purchase.productId
              });
            }
            
            // Acknowledge the purchase (required for Google Play)
            if (Platform.OS === 'android') {
              await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
            }
            // Finish the transaction (required for both platforms)
            await RNIap.finishTransaction({ purchase, isConsumable: false });
          }
        } catch (err) {
          console.error('Purchase verification error:', err);
        }
      });
      
      // Listen for purchase errors
      this._errorListener = RNIap.purchaseErrorListener((error) => {
        if (error.code !== 'E_USER_CANCELLED') {
          console.error('Purchase error:', error);
        }
      });
      
      console.log('Native IAP initialized successfully');
      return true;
    } catch (err) {
      console.error('IAP initialization failed:', err);
      this.isNativeIAPAvailable = false;
      return false;
    }
  },

  // Get available subscriptions with prices from the store
  async getSubscriptions() {
    if (this.isNativeIAPAvailable && this._initialized) {
      try {
        const skus = Object.values(SUBSCRIPTION_SKUS);
        const subscriptions = await RNIap.getSubscriptions({ skus });
        return subscriptions.map(sub => {
          const planEntry = Object.entries(SUBSCRIPTION_SKUS).find(([_, sku]) => sku === sub.productId);
          const planKey = planEntry ? planEntry[0] : 'basic';
          const planInfo = PLAN_DETAILS[planKey] || {};
          return {
            productId: sub.productId,
            ...planInfo,
            // Use store price (localized) instead of hardcoded
            localizedPrice: sub.localizedPrice || planInfo.price,
            price: sub.localizedPrice || planInfo.price,
          };
        });
      } catch (err) {
        console.error('Failed to get subscriptions from store:', err);
      }
    }
    // Fallback: return hardcoded plan details
    return Object.entries(PLAN_DETAILS).map(([key, plan]) => ({
      productId: SUBSCRIPTION_SKUS[key],
      ...plan,
      localizedPrice: plan.price,
    }));
  },

  // Purchase subscription
  async purchaseSubscription(sku, plan) {
    if (this.isNativeIAPAvailable && this._initialized) {
      // Native IAP purchase - verification handled by purchaseUpdatedListener
      if (Platform.OS === 'android') {
        await RNIap.requestSubscription({ sku });
      } else {
        await RNIap.requestSubscription({ sku });
      }
      return { status: 'pending_verification' };
    }
    
    // Fallback: Stripe checkout via browser
    if (plan === 'organizer') {
      const data = await api.post('/organizer/subscription/checkout');
      if (data.url) await Linking.openURL(data.url);
      return data;
    }
    const data = await api.post('/subscription/checkout', { plan, platform: Platform.OS });
    if (data.url) {
      await Linking.openURL(data.url);
    }
    return data;
  },

  // Restore purchases (required by both App Store and Play Store policies)
  async restorePurchases() {
    if (this.isNativeIAPAvailable && this._initialized) {
      try {
        const purchases = await RNIap.getAvailablePurchases();
        if (purchases && purchases.length > 0) {
          // Verify the latest purchase with our server
          const latestPurchase = purchases[purchases.length - 1];
          if (Platform.OS === 'android') {
            await api.post('/subscription/verify-google', {
              purchaseToken: latestPurchase.purchaseToken,
              productId: latestPurchase.productId,
              packageName: latestPurchase.packageNameAndroid
            });
          } else {
            await api.post('/subscription/verify-apple', {
              receiptData: latestPurchase.transactionReceipt,
              productId: latestPurchase.productId
            });
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Restore purchases error:', err);
        return false;
      }
    }
    // Fallback: check server status
    try {
      const data = await api.post('/subscription/restore');
      return data.restored;
    } catch (e) {
      return false;
    }
  },

  // Manage subscription (opens platform subscription management)
  async manageSubscription() {
    if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  },
  
  // Cleanup listeners on unmount
  cleanup() {
    if (this._purchaseListener) {
      this._purchaseListener.remove();
      this._purchaseListener = null;
    }
    if (this._errorListener) {
      this._errorListener.remove();
      this._errorListener = null;
    }
    if (this.isNativeIAPAvailable && this._initialized) {
      RNIap.endConnection();
      this._initialized = false;
    }
  }
};

// ===========================================
// AUTH CONTEXT
// ===========================================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [businessRole, setBusinessRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('permitwise_token');
      if (!token) { setLoading(false); return; }
      const data = await api.get('/auth/me');
      setUser(data.user); setBusiness(data.business); setSubscription(data.subscription);
      setSubscriptionStatus(data.subscriptionStatus);
      setBusinessRole(data.businessRole);
    } catch (error) { await AsyncStorage.removeItem('permitwise_token'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchUser(); 
    // Initialize in-app purchases
    BillingService.initialize().catch(err => console.warn('IAP init:', err.message));
    return () => { BillingService.cleanup(); };
  }, [fetchUser]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('permitwise_token', data.token);
    setUser(data.user); await fetchUser(); return data;
  };

  const register = async (userData) => {
    const data = await api.post('/auth/register', userData);
    await AsyncStorage.setItem('permitwise_token', data.token);
    setUser(data.user); return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('permitwise_token');
    setUser(null); setBusiness(null); setSubscription(null); setSubscriptionStatus(null); setBusinessRole(null);
  };

  // Check if subscription allows write operations
  const canWrite = subscriptionStatus?.canWrite ?? true;
  const isExpired = subscriptionStatus?.isExpired ?? false;
  
  // Role-based permission helpers
  const isOwner = businessRole === 'owner';
  const isManager = businessRole === 'manager' || businessRole === 'owner';
  const canManageTeam = isManager;
  const canManageSubscription = isOwner;
  const canManageBusiness = isManager;

  return (
    <AuthContext.Provider value={{ 
      user, business, subscription, subscriptionStatus, businessRole,
      canWrite, isExpired, isOwner, isManager, canManageTeam, canManageSubscription, canManageBusiness,
      loading, login, register, logout, fetchUser, updateBusiness: setBusiness, 
      isAuthenticated: !!user, hasCompletedOnboarding: !!business 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ===========================================
// TOAST CONTEXT (Mobile)
// ===========================================
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };
  
  const getToastStyle = (type) => {
    switch(type) {
      case 'success': return { backgroundColor: '#dcfce7', borderColor: '#22c55e', iconColor: '#166534' };
      case 'error': return { backgroundColor: '#fee2e2', borderColor: '#ef4444', iconColor: '#dc2626' };
      case 'warning': return { backgroundColor: '#fef3c7', borderColor: '#f59e0b', iconColor: '#92400e' };
      default: return { backgroundColor: '#dbeafe', borderColor: '#3b82f6', iconColor: '#1d4ed8' };
    }
  };
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <View style={{ position: 'absolute', top: 50, left: 16, right: 16, zIndex: 9999 }}>
          {toasts.map(t => {
            const toastStyle = getToastStyle(t.type);
            return (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => removeToast(t.id)}
                style={{ 
                  backgroundColor: toastStyle.backgroundColor, 
                  borderLeftWidth: 4, 
                  borderLeftColor: toastStyle.borderColor,
                  borderRadius: 8, 
                  padding: 14, 
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5
                }}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: toastStyle.borderColor + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {t.type === 'success' && <Icons.Check size={16} color={toastStyle.iconColor} />}
                  {t.type === 'error' && <Icons.X size={16} color={toastStyle.iconColor} />}
                  {(t.type === 'info' || t.type === 'warning') && <Icons.Alert size={16} color={toastStyle.iconColor} />}
                </View>
                <Text style={{ flex: 1, color: '#1f2937', fontSize: 14 }}>{t.message}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ToastContext.Provider>
  );
};

// ===========================================
// CONFIRM CONTEXT (Mobile)
// ===========================================
const ConfirmContext = createContext(null);
const useConfirm = () => useContext(ConfirmContext);

const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: null,
    onCancel: null,
  });
  
  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        visible: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, visible: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, visible: false }));
          resolve(false);
        },
      });
    });
  }, []);
  
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={confirmState.visible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 340, overflow: 'hidden' }}>
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>{confirmState.title}</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>{confirmState.message}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
              <TouchableOpacity 
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e5e7eb' }}
                onPress={confirmState.onCancel}
              >
                <Text style={{ fontSize: 16, color: '#6b7280', fontWeight: '500' }}>{confirmState.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, padding: 14, alignItems: 'center', backgroundColor: confirmState.variant === 'danger' ? '#fee2e2' : '#eff6ff' }}
                onPress={confirmState.onConfirm}
              >
                <Text style={{ fontSize: 16, color: confirmState.variant === 'danger' ? '#dc2626' : '#2563eb', fontWeight: '600' }}>{confirmState.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
};

// ===========================================
// COMPONENTS
// ===========================================
const Button = ({ title, onPress, variant = 'primary', loading: isLoading, disabled, style }) => (
  <TouchableOpacity style={[styles.btn, styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`], disabled && styles.btnDisabled, style]} onPress={onPress} disabled={disabled || isLoading}>
    {isLoading ? <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary} /> : <Text style={[styles.btnText, variant !== 'primary' && styles.btnTextOutline]}>{title}</Text>}
  </TouchableOpacity>
);

// Expired Subscription Banner
const ExpiredSubscriptionBanner = ({ onUpgrade }) => {
  const { isExpired, subscriptionStatus } = useAuth();
  
  if (!isExpired) return null;
  
  return (
    <View style={styles.expiredBanner}>
      <View style={styles.expiredBannerContent}>
        <Icons.Alert size={20} color="#dc2626" />
        <Text style={styles.expiredBannerText}>
          <Text style={styles.expiredBannerBold}>Subscription expired.</Text> Read-only access.
        </Text>
      </View>
      <TouchableOpacity style={styles.expiredBannerBtn} onPress={onUpgrade}>
        <Text style={styles.expiredBannerBtnText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
};

const Input = ({ label, error, ...props }) => (
  <View style={styles.formGroup}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput style={[styles.input, error && styles.inputError]} placeholderTextColor={COLORS.gray400} {...props} />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Phone Input with auto-formatting
const PhoneInput = ({ label, value, onChangeText, error: externalError, required, ...props }) => {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value || ''));
  const [internalError, setInternalError] = useState(null);
  
  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value || ''));
  }, [value]);
  
  const handleChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setDisplayValue(formatted);
    const validation = validatePhone(formatted);
    setInternalError(validation.error);
    const digits = getPhoneDigits(formatted);
    onChangeText(digits);
  };
  
  const error = externalError || internalError;
  
  return (
    <View style={styles.formGroup}>
      {label && <Text style={styles.label}>{label}{required && ' *'}</Text>}
      <View style={styles.phoneInputWrapper}>
        <View style={styles.phonePrefix}><Text style={styles.phonePrefixText}>+1</Text></View>
        <TextInput 
          style={[styles.input, styles.phoneInput, error && styles.inputError]} 
          value={displayValue}
          onChangeText={handleChange}
          placeholder="(555) 123-4567"
          placeholderTextColor={COLORS.gray400}
          keyboardType="phone-pad"
          maxLength={14}
          {...props} 
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Email Input with validation
const EmailInput = ({ label, value, onChangeText, error: externalError, required, onBlur, ...props }) => {
  const [internalError, setInternalError] = useState(null);
  
  const handleBlur = () => {
    const validation = validateEmail(value);
    setInternalError(validation.error);
    if (onBlur) onBlur();
  };
  
  const handleChange = (text) => {
    if (internalError) setInternalError(null);
    onChangeText(text);
  };
  
  const error = externalError || internalError;
  
  return (
    <View style={styles.formGroup}>
      {label && <Text style={styles.label}>{label}{required && ' *'}</Text>}
      <TextInput 
        style={[styles.input, error && styles.inputError]} 
        value={value}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder="email@example.com"
        placeholderTextColor={COLORS.gray400}
        keyboardType="email-address"
        autoCapitalize="none"
        {...props} 
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Date Input with auto-formatting (MM/DD/YYYY)
const DateInput = ({ label, value, onChangeText, error: externalError, required, ...props }) => {
  // value comes in as ISO format (YYYY-MM-DD), display as MM/DD/YYYY
  const [displayValue, setDisplayValue] = useState(isoToFormatted(value || ''));
  const [internalError, setInternalError] = useState(null);
  
  useEffect(() => {
    setDisplayValue(isoToFormatted(value || ''));
  }, [value]);
  
  const handleChange = (text) => {
    const formatted = formatDateInput(text);
    setDisplayValue(formatted);
    const validation = validateDate(formatted, { required });
    setInternalError(validation.error);
    // Pass ISO format to parent for API
    const isoDate = getDateISO(formatted);
    onChangeText(isoDate);
  };
  
  const error = externalError || internalError;
  
  return (
    <View style={styles.formGroup}>
      {label && <Text style={styles.label}>{label}{required && ' *'}</Text>}
      <TextInput 
        style={[styles.input, error && styles.inputError]} 
        value={displayValue}
        onChangeText={handleChange}
        placeholder="MM/DD/YYYY"
        placeholderTextColor={COLORS.gray400}
        keyboardType="number-pad"
        maxLength={10}
        {...props} 
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const PasswordInput = ({ label, value, onChangeText, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={styles.formGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.passwordInputWrapper}>
        <TextInput 
          style={[styles.input, styles.passwordInput, error && styles.inputError]} 
          placeholderTextColor={COLORS.gray400} 
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          {...props} 
        />
        <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? <Icons.EyeOff size={20} color={COLORS.gray400} /> : <Icons.Eye size={20} color={COLORS.gray400} />}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const PasswordStrengthIndicator = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = passedChecks <= 2 ? 'weak' : passedChecks <= 4 ? 'medium' : 'strong';
  const strengthColors = { weak: COLORS.danger, medium: COLORS.warning, strong: COLORS.success };
  const strengthLabels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };

  if (!password) return null;

  return (
    <View style={styles.passwordStrength}>
      <View style={styles.strengthBar}>
        <View style={[styles.strengthFill, { width: `${(passedChecks / 5) * 100}%`, backgroundColor: strengthColors[strength] }]} />
      </View>
      <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>{strengthLabels[strength]}</Text>
      <View style={styles.strengthChecks}>
        <View style={styles.checkRow}>{checks.length ? <Icons.Check size={14} color={COLORS.success} /> : <Icons.X size={14} color={COLORS.gray300} />}<Text style={[styles.checkText, checks.length && styles.checkPassed]}>At least 8 characters</Text></View>
        <View style={styles.checkRow}>{checks.uppercase ? <Icons.Check size={14} color={COLORS.success} /> : <Icons.X size={14} color={COLORS.gray300} />}<Text style={[styles.checkText, checks.uppercase && styles.checkPassed]}>Uppercase letter</Text></View>
        <View style={styles.checkRow}>{checks.lowercase ? <Icons.Check size={14} color={COLORS.success} /> : <Icons.X size={14} color={COLORS.gray300} />}<Text style={[styles.checkText, checks.lowercase && styles.checkPassed]}>Lowercase letter</Text></View>
        <View style={styles.checkRow}>{checks.number ? <Icons.Check size={14} color={COLORS.success} /> : <Icons.X size={14} color={COLORS.gray300} />}<Text style={[styles.checkText, checks.number && styles.checkPassed]}>Number</Text></View>
        <View style={styles.checkRow}>{checks.special ? <Icons.Check size={14} color={COLORS.success} /> : <Icons.X size={14} color={COLORS.gray300} />}<Text style={[styles.checkText, checks.special && styles.checkPassed]}>Special character</Text></View>
      </View>
    </View>
  );
};

const PasswordMatchIndicator = ({ password, confirmPassword }) => {
  if (!password || !confirmPassword) return null;
  const match = password === confirmPassword;
  return (
    <View style={[styles.passwordMatch, match ? styles.passwordMatchSuccess : styles.passwordMatchError]}>
      {match ? <Icons.Check size={16} color={COLORS.success} /> : <Icons.X size={16} color={COLORS.danger} />}
      <Text style={{ color: match ? COLORS.success : COLORS.danger, marginLeft: 6, fontSize: 14 }}>
        {match ? 'Passwords match' : 'Passwords do not match'}
      </Text>
    </View>
  );
};

const Card = ({ children, style, onPress }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress} disabled={!onPress}>
    {children}
  </TouchableOpacity>
);

const Badge = ({ label, variant = 'default' }) => (
  <View style={[styles.badge, styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`]]}>
    <Text style={[styles.badgeText, styles[`badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}`]]}>{label}</Text>
  </View>
);

const PickerModal = ({ visible, onClose, title, options, value, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.pickerModal}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.pickerDone}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.pickerScroll}>
          {options.map(opt => (
            <TouchableOpacity key={opt.value} style={[styles.pickerItem, value === opt.value && styles.pickerItemSelected]} onPress={() => { onSelect(opt.value); onClose(); }}>
              <Text style={[styles.pickerItemText, value === opt.value && styles.pickerItemTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const CitySearchModal = ({ visible, onClose, state, onSelect, strictMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCities = async (term) => {
    if (!state || term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get(`/jurisdictions?state=${state}&search=${encodeURIComponent(term)}`);
      setResults(data.jurisdictions || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      setSearchTerm('');
      setResults([]);
    }
  }, [visible]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Debounce would be nice here, but for simplicity just search on each change
    if (term.length >= 2) {
      searchCities(term);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (jurisdiction) => {
    const cityName = jurisdiction.city || jurisdiction.name;
    onSelect(cityName);
    onClose();
  };

  const handleUseCustom = () => {
    if (searchTerm.trim()) {
      onSelect(searchTerm.trim());
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.citySearchModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Search City</Text>
            <TouchableOpacity onPress={onClose}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          <View style={styles.citySearchInputWrapper}>
            <TextInput
              style={styles.citySearchInput}
              placeholder={state ? "Type city name..." : "Select a state first"}
              value={searchTerm}
              onChangeText={handleSearch}
              editable={!!state}
              autoFocus={true}
            />
          </View>
          <ScrollView style={styles.pickerScroll}>
            {loading && (
              <View style={styles.citySearchLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.citySearchLoadingText}>Searching...</Text>
              </View>
            )}
            {!loading && results.length > 0 && results.map(j => (
              <TouchableOpacity key={j._id} style={styles.citySearchOption} onPress={() => handleSelect(j)}>
                <Text style={styles.citySearchName}>{j.city || j.name}</Text>
                <View style={styles.citySearchTypeBadge}><Text style={styles.citySearchTypeText}>{j.type}</Text></View>
              </TouchableOpacity>
            ))}
            {!loading && searchTerm.length >= 2 && !strictMode && (
              <TouchableOpacity 
                style={[styles.citySearchOption, { backgroundColor: COLORS.primaryLight, borderTopWidth: 1, borderTopColor: COLORS.gray200 }]} 
                onPress={handleUseCustom}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: COLORS.primary, fontSize: 16, marginRight: 8 }}>➕</Text>
                  <View>
                    <Text style={[styles.citySearchName, { color: COLORS.primary }]}>Use "{searchTerm}"</Text>
                    <Text style={{ color: COLORS.gray500, fontSize: 12 }}>Add for manual tracking</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            {!loading && results.length === 0 && searchTerm.length >= 2 && strictMode && (
              <View style={styles.citySearchEmpty}>
                <Text style={styles.citySearchEmptyText}>No cities found. Please select from available options.</Text>
              </View>
            )}
            {searchTerm.length < 2 && (
              <View style={styles.citySearchHint}>
                <Text style={styles.citySearchHintText}>Type at least 2 characters to search</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ===========================================
// AUTH SCREENS
// ===========================================
const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try { await login(email, password); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeader}>
          <Icons.Shield size={48} /><Text style={styles.authTitle}>PermitWise</Text><Text style={styles.authSubtitle}>Welcome back</Text>
        </View>
        {error ? <View style={styles.alertError}><Text style={styles.alertText}>{error}</Text></View> : null}
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <PasswordInput label="Password" value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.forgotPasswordLink} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
        <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        <TouchableOpacity style={styles.authLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.authLinkText}>Don't have an account? <Text style={styles.authLinkBold}>Sign up</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const LegalWebViewModal = ({ visible, onClose, url, title }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: COLORS.gray800 }}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Icons.X size={24} color={COLORS.gray500} />
        </TouchableOpacity>
      </View>
      <WebView source={{ uri: url }} style={{ flex: 1 }} startInLoadingState renderLoading={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>} />
    </SafeAreaView>
  </Modal>
);

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', accountType: 'vendor' });
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const handleRegister = async () => {
    setError('');
    if (!agreedToTerms) { setError('You must agree to the Terms of Service and Privacy Policy'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try { await register({ ...form, isOrganizer: form.accountType === 'organizer' }); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeader}>
          <Icons.Shield size={48} /><Text style={styles.authTitle}>PermitWise</Text>
          <Text style={styles.authSubtitle}>Create your account</Text>
          <Text style={styles.trialBadge}>Get 14 days on us — with most benefits</Text>
        </View>
        {error ? <View style={styles.alertError}><Text style={styles.alertText}>{error}</Text></View> : null}
        
        <Text style={styles.accountTypeLabel}>I am a:</Text>
        <View style={styles.accountTypeOptions}>
          <TouchableOpacity 
            style={[styles.accountTypeOption, form.accountType === 'vendor' && styles.accountTypeOptionActive]} 
            onPress={() => setForm(f => ({ ...f, accountType: 'vendor' }))}
          >
            <View style={[styles.accountTypeIcon, form.accountType === 'vendor' && styles.accountTypeIconActive]}>
              <Icons.Truck size={20} color={form.accountType === 'vendor' ? COLORS.white : COLORS.primary} />
            </View>
            <View style={styles.accountTypeInfo}>
              <Text style={styles.accountTypeTitle}>Mobile Vendor</Text>
              <Text style={styles.accountTypeDesc}>Food truck, cart, or mobile business</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.accountTypeOption, form.accountType === 'organizer' && styles.accountTypeOptionActive]} 
            onPress={() => setForm(f => ({ ...f, accountType: 'organizer' }))}
          >
            <View style={[styles.accountTypeIcon, form.accountType === 'organizer' && styles.accountTypeIconActive]}>
              <Icons.Event size={20} color={form.accountType === 'organizer' ? COLORS.white : COLORS.primary} />
            </View>
            <View style={styles.accountTypeInfo}>
              <Text style={styles.accountTypeTitle}>Event Organizer</Text>
              <Text style={styles.accountTypeDesc}>Manage events & vendor compliance</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInput}><Input label="First Name" value={form.firstName} onChangeText={v => setForm(f => ({ ...f, firstName: v }))} /></View>
          <View style={styles.halfInput}><Input label="Last Name" value={form.lastName} onChangeText={v => setForm(f => ({ ...f, lastName: v }))} /></View>
        </View>
        <EmailInput label="Email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} required />
        <PhoneInput label="Phone" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} />
        <PasswordInput label="Password" value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
        <PasswordStrengthIndicator password={form.password} />
        <PasswordInput label="Confirm Password" value={form.confirmPassword} onChangeText={v => setForm(f => ({ ...f, confirmPassword: v }))} />
        <PasswordMatchIndicator password={form.password} confirmPassword={form.confirmPassword} />
        <TouchableOpacity 
          onPress={() => setAgreedToTerms(!agreedToTerms)} 
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12, marginBottom: 4 }}
          activeOpacity={0.7}
        >
          <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: agreedToTerms ? COLORS.primary : COLORS.gray400, backgroundColor: agreedToTerms ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
            {agreedToTerms && <Icons.Check size={14} color={COLORS.white} />}
          </View>
          <Text style={{ fontSize: 13, color: COLORS.gray600, lineHeight: 20, flex: 1 }}>
            I agree to the{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '500' }} onPress={() => setLegalModal('terms')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '500' }} onPress={() => setLegalModal('privacy')}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        <Button title="Create Account" onPress={handleRegister} loading={loading} disabled={!agreedToTerms} style={{ marginTop: 8, opacity: agreedToTerms ? 1 : 0.5 }} />
        <TouchableOpacity style={styles.authLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authLinkText}>Have an account? <Text style={styles.authLinkBold}>Log in</Text></Text>
        </TouchableOpacity>

        <LegalWebViewModal visible={legalModal === 'terms'} onClose={() => setLegalModal(null)} url={`${SITE_URL}/terms`} title="Terms of Service" />
        <LegalWebViewModal visible={legalModal === 'privacy'} onClose={() => setLegalModal(null)} url={`${SITE_URL}/privacy`} title="Privacy Policy" />
      </ScrollView>
    </SafeAreaView>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authHeader}>
            <Icons.Shield size={48} /><Text style={styles.authTitle}>Check your email</Text>
          </View>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}><Icons.Check size={40} color={COLORS.success} /></View>
            <Text style={styles.successText}>If an account exists for <Text style={{ fontWeight: '600' }}>{email}</Text>, we've sent password reset instructions.</Text>
            <Text style={styles.successNote}>Check your spam folder if you don't see it within a few minutes.</Text>
          </View>
          <Button title="Back to Login" variant="outline" onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeader}>
          <Icons.Shield size={48} /><Text style={styles.authTitle}>Reset Password</Text>
          <Text style={styles.authSubtitle}>Enter your email and we'll send reset instructions</Text>
        </View>
        {error ? <View style={styles.alertError}><Text style={styles.alertText}>{error}</Text></View> : null}
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
        <TouchableOpacity style={styles.authLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authLinkText}>← Back to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===========================================
// ONBOARDING SCREEN
// ===========================================
const OnboardingScreen = () => {
  const { updateBusiness, fetchUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false); const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [form, setForm] = useState({ businessName: '', primaryVendorType: '', handlesFood: false, operatingCities: [{ city: '', state: '', isPrimary: true }] });
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedPermits, setSelectedPermits] = useState([]);
  const [loadingPermits, setLoadingPermits] = useState(false);
  const [coverageStatus, setCoverageStatus] = useState(null);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Auto-set handlesFood based on vendor type
  useEffect(() => {
    if (form.primaryVendorType) {
      const autoFood = FOOD_VENDOR_TYPES.includes(form.primaryVendorType);
      setForm(f => ({ ...f, handlesFood: autoFood }));
    }
  }, [form.primaryVendorType]);

  const fetchSuggestedPermits = async () => {
    if (!form.operatingCities[0].city || !form.operatingCities[0].state) return;
    setLoadingPermits(true);
    try {
      const data = await api.get('/permit-types/required?city=' + form.operatingCities[0].city + '&state=' + form.operatingCities[0].state + '&vendorType=' + form.primaryVendorType + '&handlesFood=' + form.handlesFood);
      setSuggestedPermits(data.permitTypes || []);
      setSelectedPermits((data.permitTypes || []).map(p => p._id));
      // Use server-returned coverage status (full if jurisdiction exists, none if not)
      setCoverageStatus(data.coverage || (data.permitTypes?.length > 0 ? 'full' : 'none'));
    } catch (err) { console.error(err); setCoverageStatus('none'); }
    finally { setLoadingPermits(false); }
  };

  const handleStep2Complete = () => {
    fetchSuggestedPermits();
    setStep(3);
  };

  const togglePermit = (id) => {
    setSelectedPermits(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const selectAllPermits = () => {
    setSelectedPermits(suggestedPermits.map(p => p._id));
  };

  const submitCitySuggestion = async () => {
    try {
      await api.post('/suggestions', {
        type: 'city_request',
        title: 'Add coverage for ' + form.operatingCities[0].city + ', ' + form.operatingCities[0].state,
        description: 'Vendor type: ' + form.primaryVendorType,
        cityDetails: { city: form.operatingCities[0].city, state: form.operatingCities[0].state }
      });
      setSuggestionSubmitted(true);
      toast.success('Your request has been submitted. We\'ll notify you when coverage is ready.');
    } catch (err) { toast.error(err.message); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try { 
      const data = await api.post('/onboarding/complete', { ...form, selectedPermitTypes: selectedPermits }); 
      updateBusiness(data.business);
      await AsyncStorage.setItem('permitwise_onboarding_complete', 'true');
      await fetchUser(); 
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', color: COLORS.danger };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', color: COLORS.warning };
    if (level === 'event_required') return { text: 'Event Required', color: COLORS.primary };
    return { text: 'Critical', color: COLORS.danger };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.onboardingScroll}>
        <View style={styles.onboardingHeader}>
          <Icons.Shield size={48} />
          <View style={styles.progressDots}>
            <View style={[styles.dot, step >= 1 && styles.dotActive]} />
            <View style={[styles.dot, step >= 2 && styles.dotActive]} />
            <View style={[styles.dot, step >= 3 && styles.dotActive]} />
          </View>
        </View>
        {error ? <View style={styles.alertError}><Text style={styles.alertText}>{error}</Text></View> : null}
        
        {step === 1 && (
          <View>
            <Text style={styles.onboardingHeaderTitle}>Tell us about your business</Text>
            <Text style={styles.onboardingHeaderSubtitle}>This helps us find the right permits for you</Text>
            <Input label="Business Name *" placeholder="e.g. Taco Express" value={form.businessName} onChangeText={v => setForm(f => ({ ...f, businessName: v }))} />
            <Text style={styles.label}>What type of vendor are you? *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
              <Text style={form.primaryVendorType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                {VENDOR_TYPES.find(t => t.value === form.primaryVendorType)?.label || 'Select your business type'}
              </Text>
            </TouchableOpacity>
            <PickerModal visible={showTypePicker} onClose={() => setShowTypePicker(false)} title="Business Type" options={VENDOR_TYPES} value={form.primaryVendorType} onSelect={v => setForm(f => ({ ...f, primaryVendorType: v }))} />
            
            {form.primaryVendorType && !FOOD_VENDOR_TYPES.includes(form.primaryVendorType) && (
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setForm(f => ({ ...f, handlesFood: !f.handlesFood }))}>
                <View style={[styles.checkbox, form.handlesFood && styles.checkboxChecked]}>
                  {form.handlesFood && <Icons.Check size={14} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>My business handles or serves food</Text>
              </TouchableOpacity>
            )}
            
            <Button title="Continue →" onPress={() => setStep(2)} disabled={!form.businessName || !form.primaryVendorType} style={{ marginTop: 16 }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.onboardingHeaderTitle}>Where do you operate?</Text>
            <Text style={styles.onboardingHeaderSubtitle}>We'll find the permits required in your city</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
                  <Text style={form.operatingCities[0].state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{form.operatingCities[0].state || 'Select State'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>City *</Text>
                <TouchableOpacity 
                  style={[styles.pickerButton, !form.operatingCities[0].state && styles.pickerButtonDisabled]} 
                  onPress={() => form.operatingCities[0].state && setShowCityPicker(true)}
                  disabled={!form.operatingCities[0].state}
                >
                  <Text style={form.operatingCities[0].city ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {form.operatingCities[0].city || (form.operatingCities[0].state ? 'Search city...' : 'Select state first')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <PickerModal visible={showStatePicker} onClose={() => setShowStatePicker(false)} title="State" options={US_STATES.map(s => ({ value: s, label: s }))} value={form.operatingCities[0].state} onSelect={v => setForm(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], state: v, city: '' }] }))} />
            <CitySearchModal 
              visible={showCityPicker} 
              onClose={() => setShowCityPicker(false)} 
              state={form.operatingCities[0].state}
              onSelect={city => setForm(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], city }] }))}
            />
            <Text style={styles.onboardingNote}>You can add more cities later in Settings.</Text>
            <View style={styles.onboardingActions}>
              <Button title="← Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
              <Button title="Find My Permits →" onPress={handleStep2Complete} disabled={!form.operatingCities[0].city || !form.operatingCities[0].state} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.onboardingHeaderTitle}>Let's get your permits organized</Text>
            {loadingPermits ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 32 }} />
            ) : (
              <>
                {coverageStatus === 'full' && (
                  <Text style={styles.onboardingHeaderSubtitle}>Here are the permits most vendors need in {form.operatingCities[0].city}.</Text>
                )}
                {(coverageStatus === 'partial' || coverageStatus === 'none') && (
                  <View style={styles.coverageNotice}>
                    <Icons.Alert size={20} color="#d97706" />
                    <Text style={styles.coverageNoticeText}>
                      {coverageStatus === 'partial' 
                        ? "We're still adding full coverage for " + form.operatingCities[0].city + ". You can track permits manually."
                        : "We're building coverage for " + form.operatingCities[0].city + ". Add permits manually after setup."}
                    </Text>
                    {!suggestionSubmitted && (
                      <TouchableOpacity style={styles.suggestButton} onPress={submitCitySuggestion}>
                        <Text style={styles.suggestButtonText}>Request Coverage for My City</Text>
                      </TouchableOpacity>
                    )}
                    {suggestionSubmitted && <Badge label="Request Submitted!" variant="success" style={{ marginTop: 8 }} />}
                  </View>
                )}
                
                {suggestedPermits.length > 0 && (
                  <View style={styles.permitSuggestions}>
                    <View style={styles.permitSuggestionsHeader}>
                      <Text style={styles.permitCount}>{selectedPermits.length} of {suggestedPermits.length} selected</Text>
                      <TouchableOpacity onPress={selectAllPermits}><Text style={styles.selectAllText}>Select All</Text></TouchableOpacity>
                    </View>
                    {suggestedPermits.map(permit => {
                      const label = getImportanceLabel(permit.importanceLevel);
                      const isSelected = selectedPermits.includes(permit._id);
                      return (
                        <TouchableOpacity key={permit._id} style={[styles.permitCheckbox, isSelected && styles.permitCheckboxSelected]} onPress={() => togglePermit(permit._id)}>
                          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                            {isSelected && <Icons.Check size={14} color="white" />}
                          </View>
                          <View style={styles.permitCheckboxContent}>
                            <View style={styles.permitCheckboxHeader}>
                              <Text style={styles.permitCheckboxName}>{permit.name}</Text>
                              <View style={[styles.importanceBadge, { backgroundColor: label.color + '20' }]}>
                                <Text style={[styles.importanceBadgeText, { color: label.color }]}>{label.text}</Text>
                              </View>
                            </View>
                            {permit.issuingAuthorityName && <Text style={styles.permitIssuer}>Issued by: {permit.issuingAuthorityName}</Text>}
                            <Text style={styles.permitRenewal}>Renews every {permit.renewalPeriodMonths || 12} months</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
            <View style={styles.onboardingActions}>
              <Button title="← Back" variant="outline" onPress={() => setStep(2)} style={{ flex: 1 }} />
              <Button title="Complete Setup →" onPress={handleSubmit} loading={loading} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ===========================================
// MAIN APP SCREENS
// ===========================================
const DashboardScreen = ({ navigation }) => {
  const { user, business, subscription } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const fetchStats = async () => {
    try {
      // First sync to pick up any new permit types
      await api.post('/permits/sync');
      // Then get dashboard stats
      const data = await api.get('/stats/dashboard');
      setStats(data.stats);
    }
    catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { 
    fetchStats();
    // Check for post-onboarding welcome
    AsyncStorage.getItem('permitwise_onboarding_complete').then(val => {
      if (val === 'true') { setShowWelcome(true); AsyncStorage.removeItem('permitwise_onboarding_complete'); }
    });
  }, []);

  const getExpiryLabel = (daysUntil) => {
    if (daysUntil <= 0) return 'Expired!';
    if (daysUntil <= 7) return `${daysUntil}d — inspectors check first!`;
    if (daysUntil <= 30) return `${daysUntil}d — start renewal`;
    return `${daysUntil} days`;
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const needsAttention = (stats?.permits?.missing || 0) + (stats?.permits?.expired || 0) + (stats?.permits?.pendingRenewal || 0);

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification');
      toast.success('A new verification email has been sent to your inbox. Please check your email and click the verification link.');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification email. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}>
        {!user?.emailVerified && (
          <View style={styles.emailBanner}>
            <Icons.Bell size={16} color="#92400e" />
            <Text style={styles.emailBannerText}>Verify your email for permit alerts</Text>
            <TouchableOpacity onPress={handleResendVerification}><Text style={styles.emailBannerLink}>Resend</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {business?.businessName}!</Text>
          <Text style={styles.headerSubtitle}>Compliance overview</Text>
        </View>
        {subscription?.status === 'trial' && (
          <View style={styles.trialBanner}><Text style={styles.trialText}>Your introductory period ends {formatDate(subscription.trialEndsAt)} — subscribe to keep full access</Text></View>
        )}
        {needsAttention > 0 && (
          <Card style={styles.ahaBanner}>
            <View style={styles.ahaContent}>
              <View style={styles.ahaIcon}><Icons.Alert size={24} color="#fff" /></View>
              <View style={styles.ahaText}>
                <Text style={styles.ahaTitle}>Action Required</Text>
                <Text style={styles.ahaItems}>
                  {stats?.permits?.missing > 0 && `⚠️ ${stats.permits.missing} missing  `}
                  {stats?.permits?.expired > 0 && `🚨 ${stats.permits.expired} expired — act now!  `}
                  {stats?.permits?.pendingRenewal > 0 && `🟡 ${stats.permits.pendingRenewal} expiring soon`}
                </Text>
              </View>
            </View>
            <Button title="Fix Now →" onPress={() => navigation.navigate('Permits')} style={styles.ahaButton} />
          </Card>
        )}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}><Icons.Check size={20} /></View><Text style={styles.statValue}>{stats?.permits?.active || 0}</Text><Text style={styles.statLabel}>Active</Text></Card>
          <Card style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}><Icons.Clock size={20} /></View><Text style={styles.statValue}>{stats?.permits?.pendingRenewal || 0}</Text><Text style={styles.statLabel}>Expiring</Text></Card>
          <Card style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}><Icons.Alert size={20} /></View><Text style={styles.statValue}>{stats?.permits?.expired || 0}</Text><Text style={styles.statLabel}>Expired</Text></Card>
          <Card style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: COLORS.gray100 }]}><Icons.Document size={20} color={COLORS.gray500} /></View><Text style={styles.statValue}>{stats?.permits?.missing || 0}</Text><Text style={styles.statLabel}>Missing</Text></Card>
        </View>
        <Card style={styles.complianceCard}>
          <Text style={styles.sectionTitle}>Compliance Score</Text>
          <View style={styles.scoreContainer}><Text style={styles.scoreValue}>{stats?.complianceScore || 0}%</Text></View>
        </Card>
        <Card style={styles.upcomingCard}>
          <Text style={styles.sectionTitle}>Upcoming Expirations</Text>
          {stats?.upcomingExpirations?.length > 0 ? stats.upcomingExpirations.slice(0, 5).map(p => (
            <View key={p.id} style={styles.expirationItem}>
              <Text style={styles.expirationName} numberOfLines={1}>{p.name}</Text>
              <Badge label={getExpiryLabel(p.daysUntil)} variant={p.daysUntil <= 7 ? 'danger' : 'warning'} />
            </View>
          )) : <Text style={styles.emptyText}>No upcoming expirations</Text>}
        </Card>
      </ScrollView>
      
      {/* Welcome Modal */}
      <Modal visible={showWelcome} transparent animationType="fade">
        <View style={styles.welcomeModalOverlay}>
          <View style={styles.welcomeModal}>
            <View style={styles.welcomeIcon}><Icons.Check size={40} color={COLORS.success} /></View>
            <Text style={styles.welcomeTitle}>You're all set! 🎉</Text>
            <Text style={styles.welcomeText}>We've added the permits you're likely to need. Upload your first document to start tracking.</Text>
            <Button title="Upload Now" onPress={() => { setShowWelcome(false); navigation.navigate('Documents'); }} style={{ marginBottom: 12 }} />
            <TouchableOpacity onPress={() => setShowWelcome(false)}><Text style={styles.welcomeLater}>I'll do it later</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const PermitsScreen = ({ navigation }) => {
  const { business, canWrite, isExpired, updateBusiness } = useAuth();
  const toast = useToast();
  const [permits, setPermits] = useState([]); const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingSuggestions, setAddingSuggestions] = useState(false);
  const [removingCity, setRemovingCity] = useState(null);
  const confirm = useConfirm();

  const handleRemoveCity = async (city, state) => {
    // Find the city to check if it's primary
    const cityObj = business?.operatingCities?.find(c => c.city === city && c.state === state);
    if (cityObj?.isPrimary) {
      toast.error('Cannot remove your primary city. Please go to Settings → Cities to set another city as primary first.');
      return;
    }
    
    const confirmed = await confirm({
      title: 'Remove City',
      message: `Remove ${city}, ${state}?\n\nPermits for this city will be deleted. Documents will remain in your vault.`,
      confirmText: 'Remove',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setRemovingCity(`${city}-${state}`);
    try {
      const result = await api.post('/permits/remove-city', { city, state });
      toast.success(result.message || `Removed ${city}.`);
      // Refresh business data
      const businessData = await api.get('/business');
      updateBusiness(businessData.business);
      fetchPermits();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingCity(null);
    }
  };

  const handleAddPermit = () => {
    if (!canWrite) {
      toast.error('Please upgrade your subscription to add new permits.');
      return;
    }
    navigation.navigate('AddPermit');
  };

  const syncAndFetchPermits = async () => {
    try {
      // First sync to pick up any new permit types
      await api.post('/permits/sync');
      // Then fetch all permits
      const data = await api.get('/permits');
      setPermits(data.permits);
      setSummary(data.summary);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  const fetchPermits = async () => {
    try { const data = await api.get('/permits'); setPermits(data.permits); setSummary(data.summary); }
    catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  const fetchSuggestedPermits = async () => {
    if (!canWrite) {
      toast.error('Please upgrade your subscription to add permits.');
      return;
    }
    if (!business?.operatingCities?.[0]) return;
    setLoadingSuggestions(true);
    try {
      const city = business.operatingCities.find(c => c.isPrimary) || business.operatingCities[0];
      const data = await api.get(`/permit-types/required?city=${city.city}&state=${city.state}&vendorType=${business.primaryVendorType}`);
      if (data.permitTypes?.length > 0) {
        setSuggestedPermits(data.permitTypes);
        setSelectedSuggestions(data.permitTypes.map(p => p._id));
        setShowSuggestModal(true);
      } else {
        toast.info('We don\'t have permit data for your city yet. You can add permits manually.');
      }
    } catch (err) { console.error(err); toast.error(err.message); }
    finally { setLoadingSuggestions(false); }
  };

  const toggleSuggestion = (id) => {
    setSelectedSuggestions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const addSuggestedPermits = async () => {
    if (selectedSuggestions.length === 0) { setShowSuggestModal(false); return; }
    setAddingSuggestions(true);
    try {
      for (const permitTypeId of selectedSuggestions) {
        const pt = suggestedPermits.find(p => p._id === permitTypeId);
        if (pt) {
          await api.post('/permits', { permitTypeId, jurisdictionId: pt.jurisdictionId._id || pt.jurisdictionId, status: 'missing' });
        }
      }
      setShowSuggestModal(false);
      fetchPermits();
      toast.success(`Added ${selectedSuggestions.length} permit(s)`);
    } catch (err) { toast.error(err.message); }
    finally { setAddingSuggestions(false); }
  };

  useEffect(() => { syncAndFetchPermits(); }, []); // Sync on initial load
  useEffect(() => { const unsubscribe = navigation.addListener('focus', syncAndFetchPermits); return unsubscribe; }, [navigation]);
  
  // Show suggestion modal when permits are empty
  useEffect(() => {
    if (!loading && permits.length === 0 && business?.operatingCities?.length > 0 && !showSuggestModal) {
      fetchSuggestedPermits();
    }
  }, [loading, permits.length, business]);

  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', color: COLORS.danger };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', color: COLORS.warning };
    if (level === 'event_required') return { text: 'Event Required', color: COLORS.primary };
    return null;
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Permits</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.addButton, { marginRight: 8, backgroundColor: COLORS.gray600 }]} onPress={() => setShowAddCityModal(true)}>
            <Icons.MapPin size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPermit}>
            <Icons.Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      {summary && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}><Text style={styles.summaryCount}>{summary.total}</Text><Text style={styles.summaryLabel}>Total</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryCount, { color: COLORS.success }]}>{summary.active}</Text><Text style={styles.summaryLabel}>Active</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryCount, { color: COLORS.warning }]}>{summary.pendingRenewal}</Text><Text style={styles.summaryLabel}>Expiring</Text></View>
          <View style={styles.summaryItem}><Text style={[styles.summaryCount, { color: COLORS.danger }]}>{summary.expired}</Text><Text style={styles.summaryLabel}>Expired</Text></View>
        </View>
      )}
      
      {/* Operating Cities Section */}
      {business?.operatingCities?.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.gray50, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 8 }}>Operating Cities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {business.operatingCities.map((city, idx) => (
                <View 
                  key={idx} 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: city.isPrimary ? COLORS.primaryLight : COLORS.white, 
                    borderWidth: 1, 
                    borderColor: city.isPrimary ? COLORS.primary : COLORS.gray200, 
                    borderRadius: 20, 
                    paddingLeft: 12, 
                    paddingRight: city.isPrimary || business.operatingCities.length <= 1 ? 12 : 4,
                    paddingVertical: 6,
                    marginRight: 8
                  }}
                >
                  <Text style={{ fontSize: 13, color: city.isPrimary ? COLORS.primary : COLORS.gray700, fontWeight: city.isPrimary ? '600' : '400' }}>
                    {city.city}, {city.state}
                  </Text>
                  {city.isPrimary && (
                    <View style={{ marginLeft: 6, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 9, color: COLORS.white, fontWeight: '600' }}>Primary</Text>
                    </View>
                  )}
                  {!city.isPrimary && business.operatingCities.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => handleRemoveCity(city.city, city.state)}
                      disabled={removingCity === `${city.city}-${city.state}`}
                      style={{ marginLeft: 4, padding: 4 }}
                    >
                      {removingCity === `${city.city}-${city.state}` ? (
                        <ActivityIndicator size="small" color={COLORS.gray500} />
                      ) : (
                        <Icons.X size={14} color={COLORS.gray500} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      
      <FlatList
        data={permits}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); syncAndFetchPermits(); }} />}
        renderItem={({ item }) => (
          <Card style={styles.permitCard} onPress={() => navigation.navigate('PermitDetail', { permit: item })}>
            <View style={styles.permitHeader}>
              <Text style={styles.permitName}>{item.isCustom ? item.customName : item.permitTypeId?.name}</Text>
              <Badge label={getStatusLabel(item.status)} variant={item.status === 'active' ? 'success' : item.status === 'expired' ? 'danger' : 'warning'} />
            </View>
            <Text style={styles.permitJurisdiction}>{item.isCustom ? `${item.customCity}, ${item.customState}` : `${item.jurisdictionId?.name}, ${item.jurisdictionId?.state}`}</Text>
            {item.expiryDate && (
              <View style={styles.expiryRow}><Icons.Clock size={14} color={COLORS.gray500} /><Text style={styles.expiryText}>Expires {formatDate(item.expiryDate)}</Text></View>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icons.Permit size={48} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No permits yet</Text>
            <Text style={styles.emptyText}>Let us suggest permits for your business</Text>
            <Button title={loadingSuggestions ? "Loading..." : "Get Suggestions"} onPress={fetchSuggestedPermits} loading={loadingSuggestions} style={{ marginTop: 16 }} />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <AddCityPermitsModal visible={showAddCityModal} onClose={() => setShowAddCityModal(false)} onSuccess={() => { setShowAddCityModal(false); fetchPermits(); }} updateBusiness={updateBusiness} />
      
      {/* Suggested Permits Modal */}
      <Modal visible={showSuggestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.suggestModal}>
            <View style={styles.suggestModalHeader}>
              <Text style={styles.suggestModalTitle}>Suggested Permits</Text>
              <TouchableOpacity onPress={() => setShowSuggestModal(false)}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
            </View>
            
            <ScrollView style={styles.suggestModalContent}>
              <Text style={styles.suggestModalIntro}>
                Based on your {VENDOR_TYPES.find(v => v.value === business?.primaryVendorType)?.label || 'business'} in {business?.operatingCities?.[0]?.city}, {business?.operatingCities?.[0]?.state}:
              </Text>
              
              <View style={styles.suggestSelectRow}>
                <Text style={styles.suggestSelectedCount}>{selectedSuggestions.length} of {suggestedPermits.length} selected</Text>
                <TouchableOpacity onPress={() => setSelectedSuggestions(suggestedPermits.map(p => p._id))}>
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
              </View>
              
              {suggestedPermits.map(permit => {
                const isSelected = selectedSuggestions.includes(permit._id);
                const label = getImportanceLabel(permit.importanceLevel);
                return (
                  <TouchableOpacity key={permit._id} style={[styles.suggestItem, isSelected && styles.suggestItemSelected]} onPress={() => toggleSuggestion(permit._id)}>
                    <View style={[styles.suggestCheckbox, isSelected && styles.suggestCheckboxSelected]}>
                      {isSelected && <Icons.Check size={14} color={COLORS.white} />}
                    </View>
                    <View style={styles.suggestItemContent}>
                      <View style={styles.suggestItemHeader}>
                        <Text style={styles.suggestItemName}>{permit.name}</Text>
                        {label && <View style={[styles.suggestBadge, { backgroundColor: label.color + '20' }]}><Text style={[styles.suggestBadgeText, { color: label.color }]}>{label.text}</Text></View>}
                      </View>
                      {permit.description && <Text style={styles.suggestItemDesc} numberOfLines={2}>{permit.description}</Text>}
                      <Text style={styles.suggestItemMeta}>
                        {permit.issuingAuthorityName && `${permit.issuingAuthorityName} • `}Renews every {permit.renewalPeriodMonths || 12} months
                        {permit.estimatedCost && ` • ${permit.estimatedCost}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <View style={styles.suggestModalFooter}>
              <Button title="Skip for Now" variant="outline" onPress={() => setShowSuggestModal(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button 
                title={addingSuggestions ? "Adding..." : `Add ${selectedSuggestions.length} Permit${selectedSuggestions.length !== 1 ? 's' : ''}`} 
                onPress={addSuggestedPermits} 
                loading={addingSuggestions}
                disabled={selectedSuggestions.length === 0}
                style={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Add City Permits Modal
const AddCityPermitsModal = ({ visible, onClose, onSuccess, updateBusiness }) => {
  const { business } = useAuth();
  const toast = useToast();
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(false);
  const [showCustomEntry, setShowCustomEntry] = useState(false);

  // Fetch jurisdictions when state changes
  useEffect(() => {
    if (!state) {
      setJurisdictions([]);
      setCity('');
      setCustomCity('');
      setShowCustomEntry(false);
      return;
    }
    const fetchJurisdictions = async () => {
      setLoadingJurisdictions(true);
      try {
        const data = await api.get('/jurisdictions');
        const filtered = (data.jurisdictions || []).filter(j => j.state === state);
        setJurisdictions(filtered);
        setCity('');
        setCustomCity('');
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJurisdictions(false);
      }
    };
    fetchJurisdictions();
  }, [state]);

  const handleAdd = async () => {
    const cityToAdd = showCustomEntry ? customCity : city;
    if (!cityToAdd || !state) {
      toast.error('Please enter city and state');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/permits/add-city', { city: cityToAdd, state });
      if (data.business) updateBusiness?.(data.business);
      toast.success(data.message || `${cityToAdd}, ${state} added successfully!`);
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCity('');
    setCustomCity('');
    setState('');
    setResult(null);
    setShowCustomEntry(false);
    onClose();
  };

  const cityOptions = [
    ...jurisdictions.map(j => ({ value: j.city || j.name, label: j.city || j.name })),
    { value: '__custom__', label: '➕ Add Other City...' }
  ];

  const handleCitySelect = (val) => {
    if (val === '__custom__') {
      setShowCustomEntry(true);
      setCity('');
      setShowCityPicker(false);
    } else {
      setCity(val);
      setShowCustomEntry(false);
      setCustomCity('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.addCityModal}>
          <View style={styles.addCityHeader}>
            <Text style={styles.addCityTitle}>Add Operating City</Text>
            <TouchableOpacity onPress={handleClose}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.addCityContent}>
            <Text style={styles.addCityDescription}>
              Add a city where you operate. Select from cities with permit data, or add a custom city for manual tracking.
            </Text>
            
            {result && (
              <View style={styles.successMessage}>
                <Icons.Check size={20} color={COLORS.success} />
                <Text style={styles.successText}>{result.message}</Text>
              </View>
            )}
            
            <Text style={[styles.label, { marginTop: 12 }]}>State</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
              <Text style={state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{state || 'Select state'}</Text>
            </TouchableOpacity>
            
            {!showCustomEntry ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>City</Text>
                <TouchableOpacity 
                  style={[styles.pickerButton, !state && styles.pickerButtonDisabled]} 
                  onPress={() => state && setShowCityPicker(true)}
                  disabled={!state}
                >
                  <Text style={city ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {city || (state ? (loadingJurisdictions ? 'Loading...' : 'Select city') : 'Select state first')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>City Name</Text>
                <TextInput
                  style={styles.input}
                  value={customCity}
                  onChangeText={setCustomCity}
                  placeholder="Enter city name"
                />
                <View style={{ backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 8, marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                  <Icons.Info size={16} color={COLORS.primary} />
                  <Text style={{ color: COLORS.gray700, marginLeft: 8, flex: 1, fontSize: 13 }}>
                    This city doesn't have permit data. You can track permits manually.
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => { setShowCustomEntry(false); setCustomCity(''); }}
                  style={{ marginTop: 12, alignSelf: 'flex-start' }}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: '500' }}>← Back to city selection</Text>
                </TouchableOpacity>
              </>
            )}
            
            <Button 
              title={loading ? 'Adding...' : 'Add City'} 
              onPress={handleAdd} 
              loading={loading} 
              disabled={!state || (!city && !customCity)} 
              style={{ marginTop: 24 }} 
            />
            <Button title="Cancel" variant="outline" onPress={handleClose} style={{ marginTop: 12 }} />
          </ScrollView>
          
          <PickerModal 
            visible={showStatePicker} 
            onClose={() => setShowStatePicker(false)} 
            title="State" 
            options={US_STATES.map(s => ({ value: s, label: s }))} 
            value={state} 
            onSelect={(v) => { setState(v); setCity(''); setCustomCity(''); setShowCustomEntry(false); }} 
          />
          <PickerModal 
            visible={showCityPicker} 
            onClose={() => setShowCityPicker(false)} 
            title="City" 
            options={state ? cityOptions : []} 
            value={city} 
            onSelect={handleCitySelect} 
          />
        </View>
      </View>
    </Modal>
  );
};

const PermitDetailScreen = ({ route, navigation }) => {
  const { permit: initialPermit } = route.params;
  const toast = useToast();
  const { subscription } = useAuth();
  const [permit, setPermit] = useState(initialPermit);
  const [loadingAutofill, setLoadingAutofill] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Refresh permit data when screen comes into focus (after editing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPermit();
    });
    return unsubscribe;
  }, [navigation, initialPermit?._id]);
  
  const refreshPermit = async () => {
    if (!initialPermit?._id) return;
    try {
      const data = await api.get(`/permits/${initialPermit._id}`);
      if (data.permit) {
        setPermit(data.permit);
      }
    } catch (err) {
      console.error('Failed to refresh permit:', err);
    }
  };
  
  // Early return if no permit data
  if (!permit || (!permit.permitTypeId && !permit.isCustom)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', color: COLORS.danger };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', color: COLORS.warning };
    if (level === 'event_required') return { text: 'Event Required', color: COLORS.primary };
    return null;
  };
  
  const handleAutofill = async () => {
    if (!permit?.permitTypeId?._id) return;
    setLoadingAutofill(true);
    try {
      const data = await api.post('/autofill/generate', { permitTypeId: permit.permitTypeId._id });
      if (data.downloadUrl) {
        const secureUrl = await getSecureFileUrl(data.downloadUrl);
        await Linking.openURL(secureUrl);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingAutofill(false);
    }
  };
  
  const handleUploadDocument = async () => {
    // Show options: browse files, camera, or photo library
    Alert.alert(
      'Upload Document',
      'Choose a source',
      [
        { text: 'Browse Files', onPress: () => pickDocument('file') },
        { text: 'Camera', onPress: () => pickDocument('camera') },
        { text: 'Photo Library', onPress: () => pickDocument('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const pickDocument = async (source) => {
    try {
      let fileData = null;
      
      if (source === 'file') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          fileData = {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name || `permit_${permit._id}.pdf`
          };
        }
      } else if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Please grant camera permissions.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          fileData = {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `permit_${permit._id}.jpg`
          };
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Please grant photo library permissions.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          fileData = {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || `permit_${permit._id}.jpg`
          };
        }
      }
      
      if (fileData) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileData);
        formData.append('category', 'permit');
        formData.append('relatedEntityType', 'permit');
        formData.append('relatedEntityId', permit._id);
        
        try {
          const docResponse = await api.upload('/documents', formData);
          toast.success('Document uploaded successfully');
          // Optimistic update — show document immediately
          if (docResponse.document) {
            setPermit(prev => ({
              ...prev,
              documentId: prev.documentId || docResponse.document,
              documents: [...(prev.documents || []), docResponse.document]
            }));
          }
          refreshPermit();
        } catch (err) {
          toast.error(err.message || 'Failed to upload document');
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error('Document picker error:', err);
      toast.error('Failed to pick document');
    }
  };
  
  const handleViewDocument = async () => {
    if (permit.documentId?.fileUrl) {
      const secureUrl = await getSecureFileUrl(permit.documentId.fileUrl);
      await Linking.openURL(secureUrl);
    }
  };
  
  const importanceLabel = permit.isCustom ? null : getImportanceLabel(permit.permitTypeId?.importanceLevel);
  const permitName = permit.isCustom ? permit.customName : permit.permitTypeId?.name;
  const permitLocation = permit.isCustom ? `${permit.customCity}, ${permit.customState}` : `${permit.jurisdictionId?.name}, ${permit.jurisdictionId?.state}`;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.detailScroll}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{permitName}</Text>
          <View style={styles.detailBadges}>
            <Badge label={getStatusLabel(permit.status)} variant={permit.status === 'active' ? 'success' : permit.status === 'expired' ? 'danger' : 'warning'} />
            {importanceLabel && (
              <View style={[styles.importanceBadge, { backgroundColor: importanceLabel.color + '20' }]}>
                <Text style={[styles.importanceBadgeText, { color: importanceLabel.color }]}>{importanceLabel.text}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Missing Permit CTA */}
        {permit.status === 'missing' && (
          <View style={styles.missingPermitCta}>
            <Icons.Alert size={20} color="#d97706" />
            <Text style={styles.missingPermitText}>You don't have this permit yet. Add details to track expiration reminders.</Text>
          </View>
        )}
        
        {/* Permit Type Info */}
        <Card style={styles.permitTypeInfo}>
          <Text style={styles.permitTypeInfoTitle}>Permit Information</Text>
          <View style={styles.permitInfoRow}>
            <Icons.Clock size={16} color={COLORS.gray400} />
            <View style={styles.permitInfoContent}>
              <Text style={styles.permitInfoLabel}>Renewal Frequency</Text>
              <Text style={styles.permitInfoValue}>Every {permit.permitTypeId?.renewalPeriodMonths || 12} months</Text>
            </View>
          </View>
          {permit.permitTypeId?.issuingAuthorityName && (
            <View style={styles.permitInfoRow}>
              <Icons.Shield size={16} color={COLORS.gray400} />
              <View style={styles.permitInfoContent}>
                <Text style={styles.permitInfoLabel}>Issued By</Text>
                <Text style={styles.permitInfoValue}>{permit.permitTypeId.issuingAuthorityName}</Text>
              </View>
            </View>
          )}
          {permit.permitTypeId?.estimatedCost && (
            <View style={styles.permitInfoRow}>
              <Icons.Document size={16} color={COLORS.gray400} />
              <View style={styles.permitInfoContent}>
                <Text style={styles.permitInfoLabel}>Typical Cost</Text>
                <Text style={styles.permitInfoValue}>{permit.permitTypeId.estimatedCost}</Text>
              </View>
            </View>
          )}
          {permit.permitTypeId?.requiredDocuments?.length > 0 && (
            <View style={styles.requiredDocs}>
              <Text style={styles.permitInfoLabel}>Usually Required:</Text>
              <Text style={styles.permitInfoValue}>{permit.permitTypeId.requiredDocuments.join(', ')}</Text>
            </View>
          )}
        </Card>
        
        {/* Your Permit Details */}
        <Card style={styles.detailCard}>
          <Text style={styles.permitTypeInfoTitle}>Your Permit Details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Jurisdiction</Text><Text style={styles.detailValue}>{permitLocation}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Permit Number</Text><Text style={styles.detailValue}>{permit.permitNumber || 'Not entered'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Issue Date</Text><Text style={styles.detailValue}>{formatDate(permit.issueDate)}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Expiry Date</Text><Text style={styles.detailValue}>{formatDate(permit.expiryDate)}</Text></View>
          {permit.expiryDate && (
            <View style={[styles.detailRow, styles.detailRowHighlight]}>
              <Text style={styles.detailLabel}>Days Until Expiry</Text>
              <Text style={[styles.detailValue, { fontWeight: '600' }]}>{daysUntil(permit.expiryDate)}</Text>
            </View>
          )}
        </Card>
        
        {/* Document Section */}
        <Card style={styles.detailCard}>
          <View style={styles.documentHeader}>
            <Text style={styles.permitTypeInfoTitle}>Documents</Text>
            {(permit.documents?.length > 0 || permit.documentId) && (
              <Text style={styles.documentCount}>({permit.documents?.length || 1})</Text>
            )}
          </View>
          
          {/* Show all documents */}
          {permit.documents && permit.documents.length > 0 ? (
            permit.documents.map((doc, index) => (
              <TouchableOpacity 
                key={doc._id || index} 
                style={[styles.documentPreview, index > 0 && { marginTop: 8 }]} 
                onPress={async () => {
                  if (doc.fileUrl) {
                    const secureUrl = await getSecureFileUrl(doc.fileUrl);
                    await Linking.openURL(secureUrl);
                  }
                }}
              >
                <Icons.Document size={24} color={COLORS.primary} />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>{doc.originalName || `Document ${index + 1}`}</Text>
                  <Text style={styles.documentHint}>Tap to view</Text>
                </View>
                <Icons.Download size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))
          ) : permit.documentId ? (
            <TouchableOpacity style={styles.documentPreview} onPress={handleViewDocument}>
              <Icons.Document size={24} color={COLORS.primary} />
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>{permit.documentId.originalName || 'Attached Document'}</Text>
                <Text style={styles.documentHint}>Tap to view</Text>
              </View>
              <Icons.Download size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}
          
          {/* Always show upload option */}
          <TouchableOpacity 
            style={[styles.uploadDocArea, (permit.documents?.length > 0 || permit.documentId) && { marginTop: 12, paddingVertical: 16 }]} 
            onPress={handleUploadDocument} 
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Icons.Upload size={24} color={COLORS.gray400} />
                <Text style={styles.uploadDocText}>
                  {(permit.documents?.length > 0 || permit.documentId) ? '+ Add Another Document' : 'Tap to upload document'}
                </Text>
                {!(permit.documents?.length > 0 || permit.documentId) && (
                  <Text style={styles.uploadDocHint}>Photo or scan of your permit</Text>
                )}
              </>
            )}
          </TouchableOpacity>
        </Card>
        
        {subscription?.features?.autofill && !permit.isCustom && (
          <Button 
            title={loadingAutofill ? 'Generating...' : 'Generate Application PDF'} 
            variant="outline" 
            onPress={handleAutofill} 
            loading={loadingAutofill}
            style={{ marginBottom: 12 }} 
          />
        )}
        <Button title="Edit Permit" onPress={() => navigation.navigate('EditPermit', { permit })} style={{ marginBottom: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const AddPermitScreen = ({ navigation }) => {
  const { business, canWrite, isExpired, updateBusiness } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [permitTypes, setPermitTypes] = useState([]);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [showCustomStatePicker, setShowCustomStatePicker] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);

  const operatingCities = business?.operatingCities || [];
  const vendorType = business?.primaryVendorType || '';

  // Auto-search when city selected
  useEffect(() => {
    if (!selectedCity || !vendorType) return;
    const [city, state] = selectedCity.split('||');
    if (!city || !state) return;
    setSearching(true);
    setSearched(false);
    setSelectedPermit(null);
    setPermitTypes([]);
    api.get(`/permit-types/required?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&vendorType=${encodeURIComponent(vendorType)}`)
      .then(data => { setPermitTypes(data.permitTypes || []); setSearched(true); })
      .catch(err => { console.error(err); setSearched(true); })
      .finally(() => setSearching(false));
  }, [selectedCity, vendorType]);

  const handleCitySelect = (val) => {
    setSelectedCity(val);
    setShowCityPicker(false);
    setShowCustom(false);
    setCustomName('');
  };

  const handleAdd = async () => {
    if (!selectedPermit) return;
    if (!canWrite) { toast.error('Please upgrade your subscription to add permits.'); return; }
    setLoading(true);
    try {
      const pt = permitTypes.find(p => p._id === selectedPermit);
      await api.post('/permits', { permitTypeId: selectedPermit, jurisdictionId: pt.jurisdictionId._id || pt.jurisdictionId, status: 'missing' });
      toast.success('Permit added!');
      navigation.goBack();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) return;
    if (!canWrite) { toast.error('Please upgrade your subscription to add permits.'); return; }
    setLoading(true);
    try {
      let city, state;
      if (selectedCity) {
        [city, state] = selectedCity.split('||');
      } else {
        city = customCity; state = customState;
      }
      if (!city || !state) { toast.error('Please select or enter a city'); setLoading(false); return; }
      await api.post('/permits/custom', { name: customName.trim(), city, state });
      toast.success('Custom permit added!');
      navigation.goBack();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const cityLabel = selectedCity
    ? operatingCities.find(c => `${c.city}||${c.state}` === selectedCity)
      ? `${selectedCity.split('||')[0]}, ${selectedCity.split('||')[1]}`
      : selectedCity.replace('||', ', ')
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formScroll}>
        <Text style={styles.label}>Operating City</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCityPicker(true)}>
          <Text style={cityLabel ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {cityLabel || 'Select an operating city'}
          </Text>
          <Icons.ChevronDown size={20} color={COLORS.gray500} />
        </TouchableOpacity>

        {operatingCities.length === 0 ? (
          <View style={{ marginTop: 4, marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: COLORS.gray500 }}>You haven't added any operating cities yet. </Text>
            <TouchableOpacity onPress={() => setShowAddCityModal(true)}>
              <Text style={{ fontSize: 13, color: COLORS.primary, textDecorationLine: 'underline', marginTop: 2 }}>Add a city first</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', marginTop: 4, marginBottom: 16, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13, color: COLORS.gray500 }}>Don't see your city? </Text>
            <TouchableOpacity onPress={() => setShowAddCityModal(true)}>
              <Text style={{ fontSize: 13, color: COLORS.primary, textDecorationLine: 'underline' }}>Add a new operating city</Text>
            </TouchableOpacity>
          </View>
        )}

        {searching && (
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ color: COLORS.gray500, marginTop: 8, fontSize: 14 }}>Finding required permits...</Text>
          </View>
        )}

        {searched && permitTypes.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Required permits for this city:</Text>
            {permitTypes.map(pt => (
              <TouchableOpacity key={pt._id} onPress={() => setSelectedPermit(pt._id)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: selectedPermit === pt._id ? COLORS.primary : COLORS.gray200, backgroundColor: selectedPermit === pt._id ? '#f0f0ff' : COLORS.white, marginBottom: 8 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedPermit === pt._id ? COLORS.primary : COLORS.gray300, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  {selectedPermit === pt._id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary }} />}
                </View>
                <Text style={{ fontSize: 15, fontWeight: selectedPermit === pt._id ? '600' : '400', color: COLORS.gray800 }}>{pt.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searched && permitTypes.length === 0 && (
          <View style={{ backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: COLORS.gray700 }}>No predefined permits found for this city yet. You can add a custom permit below.</Text>
          </View>
        )}

        {(searched || !selectedCity) && (
          <View style={{ borderTopWidth: 1, borderTopColor: COLORS.gray200, marginTop: 8, paddingTop: 16 }}>
            {!showCustom ? (
              <TouchableOpacity onPress={() => setShowCustom(true)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, borderStyle: 'dashed', backgroundColor: '#f9fafb' }}>
                <Icons.Plus size={18} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontWeight: '500', marginLeft: 8, fontSize: 14 }}>Add Custom Permit</Text>
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Custom Permit</Text>
                <Input label="Permit Name *" placeholder="e.g., Mobile Vending License" value={customName} onChangeText={setCustomName} />
                {!selectedCity && (
                  <>
                    <View style={styles.row}>
                      <View style={styles.halfInput}><Input label="City *" value={customCity} onChangeText={setCustomCity} /></View>
                      <View style={styles.halfInput}>
                        <Text style={styles.label}>State *</Text>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCustomStatePicker(true)}>
                          <Text style={customState ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{customState || 'Select'}</Text>
                          <Icons.ChevronDown size={20} color={COLORS.gray500} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <PickerModal visible={showCustomStatePicker} onClose={() => setShowCustomStatePicker(false)} title="Select State" options={US_STATES.map(s => ({ value: s, label: s }))} value={customState} onSelect={v => { setCustomState(v); setShowCustomStatePicker(false); }} />
                  </>
                )}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <Button title="Cancel" variant="outline" onPress={() => { setShowCustom(false); setCustomName(''); }} style={{ flex: 1 }} />
                  <Button title="Add Custom Permit" onPress={handleAddCustom} loading={loading} disabled={!customName.trim()} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </View>
        )}

        {selectedPermit && (
          <Button title="Add Permit" onPress={handleAdd} loading={loading} style={{ marginTop: 24 }} />
        )}

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '60%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Operating City</Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                {operatingCities.map((c, idx) => (
                  <TouchableOpacity key={idx} style={styles.pickerItem} onPress={() => handleCitySelect(`${c.city}||${c.state}`)}>
                    <Text style={styles.pickerItemText}>{c.city}, {c.state}{c.isPrimary ? ' (Primary)' : ''}</Text>
                    {selectedCity === `${c.city}||${c.state}` && <Icons.Check size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
                {operatingCities.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.gray500, fontSize: 14 }}>No operating cities added yet.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add City Modal */}
        <AddCityPermitsModal visible={showAddCityModal} onClose={() => setShowAddCityModal(false)} onSuccess={() => { setShowAddCityModal(false); }} updateBusiness={updateBusiness} />
      </ScrollView>
    </SafeAreaView>
  );
};

const EditPermitScreen = ({ route, navigation }) => {
  const { permit } = route.params;
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    permitNumber: permit?.permitNumber || '',
    issueDate: permit?.issueDate ? new Date(permit.issueDate).toISOString().split('T')[0] : '',
    expiryDate: permit?.expiryDate ? new Date(permit.expiryDate).toISOString().split('T')[0] : '',
    status: permit?.status || 'active'
  });

  // Early return if no permit
  if (!permit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Permit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await api.put(`/permits/${permit._id}`, {
        permitNumber: form.permitNumber,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        status: form.status
      });
      if (result?._subscriptionExpired) {
        toast.error('Subscription expired — upgrade to edit permits');
        return;
      }
      toast.success('Permit updated');
      navigation.goBack();
    } catch (e) { toast.error(e.message || 'Failed to save permit'); }
    finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Permit', 'Are you sure you want to delete this permit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/permits/${permit._id}`);
          navigation.navigate('PermitsList');
        } catch (e) { toast.error(e.message); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formScroll}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>{permit.isCustom ? permit.customName : permit.permitTypeId?.name}</Text>
          <Text style={styles.infoCardSubtitle}>{permit.isCustom ? `${permit.customCity}, ${permit.customState}` : `${permit.jurisdictionId?.name}, ${permit.jurisdictionId?.state}`}</Text>
        </Card>

        <Input label="Permit Number" value={form.permitNumber} onChangeText={v => setForm(f => ({ ...f, permitNumber: v }))} placeholder="e.g., HP-2024-12345" />
        <DateInput label="Issue Date" value={form.issueDate} onChangeText={v => setForm(f => ({ ...f, issueDate: v }))} />
        <DateInput label="Expiry Date" value={form.expiryDate} onChangeText={v => setForm(f => ({ ...f, expiryDate: v }))} />

        <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
        <View style={styles.statusOptions}>
          {['active', 'pending_renewal', 'expired', 'missing'].map(status => (
            <TouchableOpacity key={status} style={[styles.statusOption, form.status === status && styles.statusOptionActive]}
              onPress={() => setForm(f => ({ ...f, status }))}>
              <Text style={[styles.statusOptionText, form.status === status && styles.statusOptionTextActive]}>{getStatusLabel(status)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Save Changes" onPress={handleSubmit} loading={loading} style={{ marginTop: 24 }} />
        <Button title="Delete Permit" variant="outline" onPress={handleDelete} style={{ marginTop: 12, borderColor: COLORS.danger }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]); 
  const toast = useToast();
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchDocuments = async () => {
    try { const data = await api.get('/documents'); setDocuments(data.documents); }
    catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Document', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/documents/${id}`); fetchDocuments(); } catch (e) { toast.error(e.message); }
      }}
    ]);
  };

  const handleView = async (doc) => {
    if (doc.fileUrl) {
      const secureUrl = await getSecureFileUrl(doc.fileUrl);
      await Linking.openURL(secureUrl);
    }
  };
  
  const getCategoryLabel = (doc) => {
    const labels = { permit: 'Permit', insurance: 'Insurance', inspection: 'Inspection', food_handler: 'Food Handler', vehicle: 'Vehicle', commissary: 'Commissary', license: 'License', other: 'Other' };
    let label = labels[doc.category] || doc.category;
    if (doc.permitName) label += ` - ${doc.permitName}`;
    return label;
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Documents</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowUploadModal(true)}>
          <Icons.Upload size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={documents}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDocuments(); }} />}
        renderItem={({ item }) => (
          <Card style={styles.documentCard} onPress={() => handleView(item)}>
            <View style={styles.documentIcon}><Icons.Document size={24} color={COLORS.gray500} /></View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>{item.originalName}</Text>
              <Text style={styles.documentMeta}>{getCategoryLabel(item)} • {formatDate(item.createdAt)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
              <Icons.Trash size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icons.Document size={48} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyText}>Tap + to upload your first document</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <UploadDocumentModal 
        visible={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        onSuccess={() => { setShowUploadModal(false); fetchDocuments(); }} 
      />
    </SafeAreaView>
  );
};

// Upload Document Modal
const UploadDocumentModal = ({ visible, onClose, onSuccess }) => {
  const [category, setCategory] = useState('other');
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const DOCUMENT_CATEGORIES = [
    { value: 'permit', label: 'Permit' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'food_handler', label: 'Food Handler' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'license', label: 'License' },
    { value: 'other', label: 'Other' },
  ];

  const handleSelectFile = async (type) => {
    try {
      if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
            size: file.size
          });
        }
      } else if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Camera access is needed to take photos');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setSelectedFile({
            uri: asset.uri,
            name: `photo_${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
        }
      } else if (type === 'photos') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Photo library access is needed');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName || `photo_${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg'
          });
        }
      }
    } catch (error) {
      console.error('File selection error:', error);
      toast.error('Failed to select file');
    }
  };

  const showFileOptions = () => {
    Alert.alert('Select Source', 'Choose where to upload from', [
      { text: 'Browse Files', onPress: () => handleSelectFile('document') },
      { text: 'Take Photo', onPress: () => handleSelectFile('camera') },
      { text: 'Photo Library', onPress: () => handleSelectFile('photos') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.info('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type
      });
      formData.append('category', category);
      
      await api.upload('/documents', formData);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setCategory('other');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCategory('other');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.uploadModal}>
          <View style={styles.uploadModalHeader}>
            <Text style={styles.uploadModalTitle}>Upload Document</Text>
            <TouchableOpacity onPress={handleClose}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          
          <View style={styles.uploadContent}>
            <Text style={styles.label}>Document Category</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.pickerButtonText}>{DOCUMENT_CATEGORIES.find(c => c.value === category)?.label || 'Select category'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadArea} onPress={showFileOptions}>
              {selectedFile ? (
                <>
                  <Icons.Document size={40} color={COLORS.primary} />
                  <Text style={[styles.uploadAreaText, { color: COLORS.gray800 }]}>{selectedFile.name}</Text>
                  <Text style={styles.uploadAreaHint}>Tap to change file</Text>
                </>
              ) : (
                <>
                  <Icons.Upload size={40} color={COLORS.gray400} />
                  <Text style={styles.uploadAreaText}>Tap to select file</Text>
                  <Text style={styles.uploadAreaHint}>PDF, JPG, PNG up to 10MB</Text>
                </>
              )}
            </TouchableOpacity>

            <Button title={selectedFile ? "Upload Document" : "Select File"} onPress={selectedFile ? handleUpload : showFileOptions} loading={loading} style={{ marginTop: 16 }} />
          </View>

          <PickerModal 
            visible={showCategoryPicker} 
            onClose={() => setShowCategoryPicker(false)} 
            title="Category" 
            options={DOCUMENT_CATEGORIES} 
            value={category} 
            onSelect={setCategory} 
          />
        </View>
      </View>
    </Modal>
  );
};

// ===========================================
// ORGANIZER SETTINGS SCREEN (Mobile)
// ===========================================
const OrganizerSettingsScreen = ({ navigation }) => {
  const { user, fetchUser, logout } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  
  const [organizationData, setOrganizationData] = useState({
    companyName: user?.organizerProfile?.companyName || '',
    description: user?.organizerProfile?.description || '',
    website: user?.organizerProfile?.website || '',
    phone: user?.organizerProfile?.phone || '',
    contactEmail: user?.organizerProfile?.contactEmail || user?.email || ''
  });
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    applicationReceived: user?.organizerProfile?.notifications?.applicationReceived ?? true,
    applicationDeadline: user?.organizerProfile?.notifications?.applicationDeadline ?? true,
    vendorCompliance: user?.organizerProfile?.notifications?.vendorCompliance ?? true,
    eventReminders: user?.organizerProfile?.notifications?.eventReminders ?? true
  });

  useEffect(() => {
    api.get('/organizer/subscription').then(data => setSubscription(data.subscription)).catch(console.error);
  }, []);

  const isVerified = user?.organizerProfile?.verified;

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', profileData);
      await fetchUser();
      toast.success('Profile updated');
      setActiveSection(null);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleOrganizationSave = async () => {
    setLoading(true);
    try {
      await api.put('/organizer/profile', organizationData);
      await fetchUser();
      toast.success('Organization profile updated');
      setActiveSection(null);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      await api.put('/organizer/notifications', notificationPrefs);
      await fetchUser();
      toast.success('Notification preferences saved');
      setActiveSection(null);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleUpgrade = () => {
    setShowSubscriptionModal(true);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Organizer Settings</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Badge variant="primary">Organizer</Badge>
            {user?.organizerProfile?.disabled ? (
              <Badge variant="danger">Disabled</Badge>
            ) : isVerified ? (
              <Badge variant="success">✓ Verified</Badge>
            ) : user?.organizerProfile?.verificationStatus === 'info_requested' ? (
              <Badge variant="warning">Info Requested</Badge>
            ) : user?.organizerProfile?.verificationStatus === 'rejected' ? (
              <Badge variant="danger">Rejected</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )}
          </View>
        </View>

        {/* Status Alerts */}
        {user?.organizerProfile?.verificationStatus === 'info_requested' && (
          <Card style={[styles.card, { backgroundColor: '#fef3c7', marginHorizontal: 20, marginBottom: 16 }]}>
            <Text style={{ color: '#92400e', fontSize: 14, fontWeight: '600' }}>⚠️ Additional Information Requested</Text>
            <Text style={{ color: '#92400e', fontSize: 14, marginTop: 8 }}>
              {user?.organizerProfile?.adminNote || 'Please update your organization profile with the requested information.'}
            </Text>
          </Card>
        )}

        {user?.organizerProfile?.verificationStatus === 'rejected' && (
          <Card style={[styles.card, { backgroundColor: '#fee2e2', marginHorizontal: 20, marginBottom: 16 }]}>
            <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: '600' }}>❌ Application Not Approved</Text>
            <Text style={{ color: '#991b1b', fontSize: 14, marginTop: 8 }}>
              {user?.organizerProfile?.disabledReason || 'Your organizer application was not approved. Please contact support.'}
            </Text>
          </Card>
        )}

        {user?.organizerProfile?.disabled && user?.organizerProfile?.verificationStatus !== 'rejected' && (
          <Card style={[styles.card, { backgroundColor: '#fee2e2', marginHorizontal: 20, marginBottom: 16 }]}>
            <Text style={{ color: '#991b1b', fontSize: 14, fontWeight: '600' }}>🚫 Account Disabled</Text>
            <Text style={{ color: '#991b1b', fontSize: 14, marginTop: 8 }}>
              {user?.organizerProfile?.disabledReason || 'Your organizer account has been disabled. Please contact support.'}
            </Text>
          </Card>
        )}

        {!isVerified && !user?.organizerProfile?.disabled && user?.organizerProfile?.verificationStatus !== 'info_requested' && user?.organizerProfile?.verificationStatus !== 'rejected' && (
          <Card style={[styles.card, { backgroundColor: '#dbeafe', marginHorizontal: 20, marginBottom: 16 }]}>
            <Text style={{ color: '#1e40af', fontSize: 14 }}>
              <Text style={{ fontWeight: '600' }}>⏳ Verification Pending: </Text>
              Your account is awaiting verification. You can create draft events while waiting.
            </Text>
          </Card>
        )}

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </Card>

        {/* Profile Settings */}
        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}>
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Profile Settings</Text>
            <Icons.Edit size={18} color={COLORS.gray400} />
          </Card>
        </TouchableOpacity>
        {activeSection === 'profile' && (
          <Card style={styles.editCard}>
            <Input label="First Name" value={profileData.firstName} onChangeText={v => setProfileData(d => ({ ...d, firstName: v }))} />
            <Input label="Last Name" value={profileData.lastName} onChangeText={v => setProfileData(d => ({ ...d, lastName: v }))} />
            <PhoneInput label="Phone" value={profileData.phone} onChangeText={v => setProfileData(d => ({ ...d, phone: v }))} />
            <Button title="Save Profile" onPress={handleProfileSave} loading={loading} />
          </Card>
        )}

        {/* Organization Settings */}
        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'organization' ? null : 'organization')}>
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Organization Profile</Text>
            <Icons.Edit size={18} color={COLORS.gray400} />
          </Card>
        </TouchableOpacity>
        {activeSection === 'organization' && (
          <Card style={styles.editCard}>
            <Input label="Organization Name" value={organizationData.companyName} onChangeText={v => setOrganizationData(d => ({ ...d, companyName: v }))} placeholder="e.g., Austin Food Events LLC" />
            <Input label="Description" value={organizationData.description} onChangeText={v => setOrganizationData(d => ({ ...d, description: v }))} placeholder="Tell vendors about your organization..." multiline />
            <Input label="Website" value={organizationData.website} onChangeText={v => setOrganizationData(d => ({ ...d, website: v }))} placeholder="https://yourorganization.com" keyboardType="url" />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <PhoneInput label="Contact Phone" value={organizationData.phone} onChangeText={v => setOrganizationData(d => ({ ...d, phone: v }))} />
              </View>
              <View style={styles.halfInput}>
                <EmailInput label="Contact Email" value={organizationData.contactEmail} onChangeText={v => setOrganizationData(d => ({ ...d, contactEmail: v }))} />
              </View>
            </View>
            <Button title="Save Organization" onPress={handleOrganizationSave} loading={loading} />
          </Card>
        )}

        {/* Notification Settings */}
        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}>
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Notifications</Text>
            <Icons.Edit size={18} color={COLORS.gray400} />
          </Card>
        </TouchableOpacity>
        {activeSection === 'notifications' && (
          <Card style={styles.editCard}>
            <TouchableOpacity style={styles.toggleRow} onPress={() => setNotificationPrefs(d => ({ ...d, applicationReceived: !d.applicationReceived }))}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>New Vendor Applications</Text>
                <Text style={styles.toggleDesc}>Get notified when vendors apply</Text>
              </View>
              <View style={[styles.toggleSwitch, notificationPrefs.applicationReceived && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, notificationPrefs.applicationReceived && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toggleRow} onPress={() => setNotificationPrefs(d => ({ ...d, applicationDeadline: !d.applicationDeadline }))}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Application Deadlines</Text>
                <Text style={styles.toggleDesc}>Reminders before deadlines close</Text>
              </View>
              <View style={[styles.toggleSwitch, notificationPrefs.applicationDeadline && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, notificationPrefs.applicationDeadline && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toggleRow} onPress={() => setNotificationPrefs(d => ({ ...d, vendorCompliance: !d.vendorCompliance }))}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Vendor Compliance Updates</Text>
                <Text style={styles.toggleDesc}>When vendor permit status changes</Text>
              </View>
              <View style={[styles.toggleSwitch, notificationPrefs.vendorCompliance && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, notificationPrefs.vendorCompliance && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toggleRow} onPress={() => setNotificationPrefs(d => ({ ...d, eventReminders: !d.eventReminders }))}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Event Reminders</Text>
                <Text style={styles.toggleDesc}>Reminders before your events start</Text>
              </View>
              <View style={[styles.toggleSwitch, notificationPrefs.eventReminders && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, notificationPrefs.eventReminders && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>
            
            <Button title="Save Preferences" onPress={handleNotificationsSave} loading={loading} style={{ marginTop: 12 }} />
          </Card>
        )}

        {/* Subscription */}
        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'billing' ? null : 'billing')}>
          <Card style={[styles.settingsCard, { backgroundColor: '#ecfdf5', borderColor: '#10b981', borderWidth: 1 }]}>
            <View>
              <Text style={[styles.settingsSection, { color: '#065f46' }]}>Organizer Plan</Text>
              <Text style={{ color: '#047857', fontSize: 12 }}>
                {subscription?.status === 'active' ? 'Active' : subscription?.status === 'trial' ? `Intro period — ${Math.max(0, Math.ceil((new Date(subscription?.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))} days left` : 'Inactive'}
              </Text>
            </View>
            <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 18 }}>$79/mo</Text>
          </Card>
        </TouchableOpacity>
        {activeSection === 'billing' && (
          <Card style={styles.editCard}>
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 8 }}>Organizer Plan Features</Text>
              <View style={{ width: '100%' }}>
                {['Unlimited events', 'Unlimited vendor invitations', 'Vendor compliance tracking', 'Custom permit requirements', 'Application management', 'Verified organizer badge', 'Priority support'].map((feature, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                    <Icons.Check size={16} color="#10b981" />
                    <Text style={{ color: COLORS.gray700 }}>{feature}</Text>
                  </View>
                ))}
              </View>
              {subscription?.status !== 'active' && (
                <Button title="Upgrade - $79/month" onPress={handleUpgrade} style={{ marginTop: 16, backgroundColor: '#10b981' }} />
              )}
            </View>
          </Card>
        )}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout}>
          <Card style={[styles.settingsCard, styles.logoutCard]}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Card>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <SubscriptionModal visible={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} currentPlan={subscription?.plan} onSubscribe={() => { fetchUser(); api.get('/organizer/subscription').then(data => setSubscription(data.subscription)).catch(console.error); }} />
    </SafeAreaView>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { user, business, subscription, subscriptionStatus, logout, fetchUser, updateBusiness } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [businessData, setBusinessData] = useState({
    businessName: business?.businessName || '', dbaName: business?.dbaName || '', ein: business?.ein || '',
    phone: business?.phone || '', email: business?.email || '',
    handlesFood: business?.handlesFood || false,
    address: business?.address || { street: '', city: '', state: '', zip: '' },
    operatingCities: business?.operatingCities || [{ city: '', state: '', isPrimary: true }],
    vehicleDetails: business?.vehicleDetails || { type: '', make: '', model: '', year: '', licensePlate: '' },
    insurance: business?.insurance || { provider: '', policyNumber: '', expiryDate: '' }
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.notificationPreferences?.email ?? true,
    sms: user?.notificationPreferences?.sms ?? false,
    reminderDays: user?.notificationPreferences?.reminderDays || [30, 14, 7]
  });
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(null); // Index of city being edited
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showVehicleTypePicker, setShowVehicleTypePicker] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch team members if subscription allows
  useEffect(() => {
    if (subscription?.features?.teamAccounts) {
      api.get('/team').then(data => setTeamMembers(data.members || [])).catch(console.error);
    }
  }, [subscription]);

  const handleLogout = () => { Alert.alert('Log Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: logout }]); };
  
  const [deletingAccount, setDeletingAccount] = useState(false);
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account Permanently',
      'This action is PERMANENT and cannot be undone.\n\n• All your permits, documents, and business data will be deleted\n• Your subscription will be automatically cancelled\n• Team members will lose access\n• You will not be able to recover any data\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete My Account', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Your account and all data will be permanently erased and your subscription cancelled immediately.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Yes, Permanently Delete', 
                  style: 'destructive', 
                  onPress: async () => {
                    setDeletingAccount(true);
                    try {
                      await api.delete('/account');
                      Alert.alert('Account Deleted', 'Your account has been permanently deleted. We\'re sorry to see you go.');
                      logout();
                    } catch (err) {
                      toast.error(err.message || 'Failed to delete account');
                    } finally {
                      setDeletingAccount(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };
  
  const handleProfileSave = async () => { setLoading(true); try { await api.put('/auth/profile', profileData); await fetchUser(); toast.success('Profile updated'); setActiveSection(null); } catch (err) { toast.error(err.message); } finally { setLoading(false); } };
  
  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveSection(null);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };
  
  const handleBusinessSave = async () => { setLoading(true); try { const data = await api.put('/business', businessData); updateBusiness(data.business); toast.success('Business updated'); setActiveSection(null); } catch (err) { toast.error(err.message); } finally { setLoading(false); } };
  
  const handleFoodHandlingToggle = async (checked) => {
    setBusinessData(d => ({ ...d, handlesFood: checked }));
    setLoading(true);
    try {
      // First save the business with the new handlesFood value
      const data = await api.put('/business', { ...businessData, handlesFood: checked });
      updateBusiness(data.business);
      
      // Then sync permits to add/remove food handling permits
      const syncResult = await api.post('/permits/sync-food-handling', { handlesFood: checked });
      
      if (checked && syncResult.addedCount > 0) {
        toast.success(`Added ${syncResult.addedCount} food safety permit(s) to your dashboard.`);
      } else if (!checked && syncResult.removedCount > 0) {
        toast.info(`Removed ${syncResult.removedCount} empty food safety permit(s). Permits with documents were kept.`);
      } else {
        toast.success(checked ? 'Food handling enabled.' : 'Food handling disabled.');
      }
    } catch (err) { 
      toast.error(err.message);
      // Revert on error
      setBusinessData(d => ({ ...d, handlesFood: !checked }));
    } finally { setLoading(false); }
  };
  
  const handleNotificationSave = async () => { setLoading(true); try { await api.put('/auth/profile', { notificationPreferences: notificationPrefs }); await fetchUser(); toast.success('Notification preferences updated'); setActiveSection(null); } catch (err) { toast.error(err.message); } finally { setLoading(false); } };
  const addCity = () => {
    const maxCities = subscription?.features?.maxCities || 1;
    const currentCities = businessData.operatingCities.filter(c => c.city && c.state).length;
    if (currentCities >= maxCities) {
      toast.error(`You've reached your plan limit of ${maxCities} operating ${maxCities === 1 ? 'city' : 'cities'}. Please upgrade for more.`);
      return;
    }
    setBusinessData(d => ({ ...d, operatingCities: [...d.operatingCities, { city: '', state: '', isPrimary: false }] }));
  };
  const updateCity = (i, field, value) => { const cities = [...businessData.operatingCities]; cities[i] = { ...cities[i], [field]: value }; setBusinessData(d => ({ ...d, operatingCities: cities })); };
  
  const removeCity = async (i) => {
    if (businessData.operatingCities.length <= 1) {
      toast.error('Cannot remove the only operating city. Add another city first.');
      return;
    }
    const cityToRemove = businessData.operatingCities[i];
    
    // Check if trying to remove primary city
    if (cityToRemove.isPrimary) {
      toast.error('Cannot remove your primary city. Please set another city as primary first.');
      return;
    }
    
    if (!cityToRemove.city) {
      // If city is empty, just remove it locally
      setBusinessData(d => ({ ...d, operatingCities: d.operatingCities.filter((_, idx) => idx !== i) }));
      return;
    }
    
    const confirmed = await confirm({
      title: 'Remove City',
      message: `Remove ${cityToRemove.city}, ${cityToRemove.state}?\n\nPermits for this city will be removed, but uploaded documents will be preserved.`,
      confirmText: 'Remove',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setLoading(true);
    try {
      // Call API to remove city and its permits
      const result = await api.post('/permits/remove-city', { city: cityToRemove.city, state: cityToRemove.state });
      // Update local state from API response
      if (result.business?.operatingCities) {
        setBusinessData(d => ({ ...d, operatingCities: result.business.operatingCities }));
        updateBusiness({ ...business, operatingCities: result.business.operatingCities });
      } else {
        const newCities = businessData.operatingCities.filter((_, idx) => idx !== i);
        setBusinessData(d => ({ ...d, operatingCities: newCities }));
        updateBusiness({ ...business, operatingCities: newCities });
      }
      toast.success(result.message || `Removed ${cityToRemove.city}.`);
    } catch (err) { toast.error(err.message); } 
    finally { setLoading(false); }
  };
  
  const inviteTeamMember = async () => {
    if (!newMemberEmail) return;
    setLoading(true);
    try {
      await api.post('/team/invite', { email: newMemberEmail, role: 'staff' });
      setNewMemberEmail('');
      const data = await api.get('/team');
      setTeamMembers(data.members || []);
      toast.success('Invitation sent');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const removeTeamMember = (id, name) => {
    Alert.alert('Remove Member', `Remove ${name} from your team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/team/${id}`);
          setTeamMembers(m => m.filter(t => t._id !== id));
        } catch (err) { toast.error(err.message); }
      }}
    ]);
  };

  const getSubscriptionStatusText = () => {
    if (subscription?.status === 'trial') {
      const daysLeft = daysUntil(subscription.trialEndsAt);
      return `Intro period — ${daysLeft} days left to subscribe`;
    }
    if (subscription?.status === 'active') return 'Active subscription';
    return 'Inactive';
  };

  const VEHICLE_TYPES = [
    { value: 'truck', label: 'Food Truck' },
    { value: 'trailer', label: 'Trailer' },
    { value: 'cart', label: 'Cart' },
    { value: 'tent', label: 'Tent/Booth' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.pageHeader}><Text style={styles.pageTitle}>Settings</Text></View>
        <Card style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.profileInitials}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>
          <View style={styles.profileInfo}><Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text><Text style={styles.profileEmail}>{user?.email}</Text></View>
        </Card>

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Profile Settings</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'profile' && (
          <Card style={styles.editCard}>
            <Input label="First Name" value={profileData.firstName} onChangeText={v => setProfileData(d => ({ ...d, firstName: v }))} />
            <Input label="Last Name" value={profileData.lastName} onChangeText={v => setProfileData(d => ({ ...d, lastName: v }))} />
            <PhoneInput label="Phone" value={profileData.phone} onChangeText={v => setProfileData(d => ({ ...d, phone: v }))} />
            <Button title="Save Profile" onPress={handleProfileSave} loading={loading} />
          </Card>
        )}

        <TouchableOpacity onPress={() => { setActiveSection(activeSection === 'password' ? null : 'password'); setPasswordError(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Change Password</Text><Icons.Lock size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'password' && (
          <Card style={styles.editCard}>
            {passwordError ? <Text style={{ color: COLORS.danger, marginBottom: 12 }}>{passwordError}</Text> : null}
            <Input label="Current Password" value={passwordData.currentPassword} onChangeText={v => setPasswordData(d => ({ ...d, currentPassword: v }))} secureTextEntry />
            <Input label="New Password" value={passwordData.newPassword} onChangeText={v => setPasswordData(d => ({ ...d, newPassword: v }))} secureTextEntry />
            <Input label="Confirm New Password" value={passwordData.confirmPassword} onChangeText={v => setPasswordData(d => ({ ...d, confirmPassword: v }))} secureTextEntry />
            <Button title="Change Password" onPress={handlePasswordChange} loading={savingPassword} />
          </Card>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'business' ? null : 'business')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Business Information</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'business' && (
          <Card style={styles.editCard}>
            <Input label="Business Name" value={businessData.businessName} onChangeText={v => setBusinessData(d => ({ ...d, businessName: v }))} />
            <Input label="DBA Name" value={businessData.dbaName} onChangeText={v => setBusinessData(d => ({ ...d, dbaName: v }))} />
            <Input label="EIN" value={businessData.ein} onChangeText={v => setBusinessData(d => ({ ...d, ein: v }))} placeholder="XX-XXXXXXX" />
            <View style={styles.row}>
              <View style={styles.halfInput}><PhoneInput label="Phone" value={businessData.phone} onChangeText={v => setBusinessData(d => ({ ...d, phone: v }))} /></View>
              <View style={styles.halfInput}><EmailInput label="Email" value={businessData.email} onChangeText={v => setBusinessData(d => ({ ...d, email: v }))} /></View>
            </View>
            
            <Text style={[styles.label, { marginTop: 16 }]}>Food Handling</Text>
            <TouchableOpacity style={[styles.toggleRow, loading && { opacity: 0.5 }]} onPress={() => !loading && handleFoodHandlingToggle(!businessData.handlesFood)} disabled={loading}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>My business handles or serves food</Text>
                <Text style={styles.toggleDesc}>This will automatically add or remove food safety permits</Text>
              </View>
              <View style={[styles.toggleSwitch, businessData.handlesFood && styles.toggleSwitchActive]}>
                <View style={[styles.toggleKnob, businessData.handlesFood && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.label, { marginTop: 12 }]}>Business Address</Text>
            <Input placeholder="Street" value={businessData.address.street} onChangeText={v => setBusinessData(d => ({ ...d, address: { ...d.address, street: v } }))} />
            <View style={styles.row}>
              <View style={styles.halfInput}><Input placeholder="City" value={businessData.address.city} onChangeText={v => setBusinessData(d => ({ ...d, address: { ...d.address, city: v } }))} /></View>
              <View style={styles.halfInput}>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker('address')}>
                  <Text style={businessData.address.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{businessData.address.state || 'State'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Input placeholder="ZIP" value={businessData.address.zip} onChangeText={v => setBusinessData(d => ({ ...d, address: { ...d.address, zip: v } }))} keyboardType="number-pad" />
            <Button title="Save Business" onPress={handleBusinessSave} loading={loading} style={{ marginTop: 12 }} />
          </Card>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'cities' ? null : 'cities')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Operating Cities ({businessData.operatingCities.length})</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'cities' && (
          <Card style={styles.editCard}>
            {businessData.operatingCities.map((city, i) => (
              <View key={i} style={[styles.cityRow, { marginBottom: 16, paddingBottom: 16, borderBottomWidth: i < businessData.operatingCities.length - 1 ? 1 : 0, borderBottomColor: COLORS.gray100 }]}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(i)}>
                      <Text style={city.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{city.state || 'State'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfInput}>
                    <TouchableOpacity 
                      style={[styles.pickerButton, !city.state && styles.pickerButtonDisabled]} 
                      onPress={() => city.state && setShowCityPicker(i)}
                      disabled={!city.state}
                    >
                      <Text style={city.city ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                        {city.city || (city.state ? 'Search city...' : 'Select state first')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center' }} 
                    onPress={() => {
                      if (!city.isPrimary) {
                        // Set this city as primary and unset others
                        const newCities = businessData.operatingCities.map((c, idx) => ({
                          ...c,
                          isPrimary: idx === i
                        }));
                        setBusinessData(d => ({ ...d, operatingCities: newCities }));
                      }
                    }}
                  >
                    <View style={[
                      { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: city.isPrimary ? COLORS.primary : COLORS.gray300, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
                      city.isPrimary && { backgroundColor: COLORS.primary }
                    ]}>
                      {city.isPrimary && <Icons.Check size={14} color={COLORS.white} />}
                    </View>
                    <Text style={{ color: COLORS.gray700 }}>Primary location</Text>
                    {city.isPrimary && <View style={{ marginLeft: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}><Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '600' }}>Current</Text></View>}
                  </TouchableOpacity>
                  {businessData.operatingCities.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeCity(i)} 
                      style={[styles.removeBtn, city.isPrimary && { opacity: 0.4 }]}
                      disabled={city.isPrimary}
                    >
                      <Icons.Trash size={16} color={COLORS.danger} />
                      <Text style={{ color: COLORS.danger, fontSize: 12, marginLeft: 4 }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            {businessData.operatingCities.map((city, i) => (
              <React.Fragment key={`pickers-${i}`}>
                <PickerModal 
                  visible={showStatePicker === i} 
                  onClose={() => setShowStatePicker(false)} 
                  title="State" 
                  options={US_STATES.map(s => ({ value: s, label: s }))} 
                  value={city.state} 
                  onSelect={v => { updateCity(i, 'state', v); updateCity(i, 'city', ''); }} 
                />
                <CitySearchModal 
                  visible={showCityPicker === i} 
                  onClose={() => setShowCityPicker(null)} 
                  state={city.state}
                  onSelect={cityName => updateCity(i, 'city', cityName)}
                  strictMode={false}
                />
              </React.Fragment>
            ))}
            <Button title="+ Add City" variant="outline" onPress={addCity} style={{ marginBottom: 12 }} />
            <Button title="Save Cities" onPress={handleBusinessSave} loading={loading} />
          </Card>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Notification Preferences</Text><Icons.Bell size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'notifications' && (
          <Card style={styles.editCard}>
            <TouchableOpacity style={styles.switchRow} onPress={() => setNotificationPrefs(p => ({ ...p, email: !p.email }))}>
              <Text style={styles.switchLabel}>Email Reminders</Text>
              <View style={[styles.switch, notificationPrefs.email && styles.switchOn]}><View style={[styles.switchThumb, notificationPrefs.email && styles.switchThumbOn]} /></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchRow} onPress={() => setNotificationPrefs(p => ({ ...p, sms: !p.sms }))}>
              <Text style={styles.switchLabel}>SMS Reminders</Text>
              <View style={[styles.switch, notificationPrefs.sms && styles.switchOn]}><View style={[styles.switchThumb, notificationPrefs.sms && styles.switchThumbOn]} /></View>
            </TouchableOpacity>
            <Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>Remind me before expiration:</Text>
            <View style={styles.reminderOptions}>
              {[30, 14, 7, 3, 1].map(days => (
                <TouchableOpacity key={days} style={[styles.reminderChip, notificationPrefs.reminderDays?.includes(days) && styles.reminderChipActive]}
                  onPress={() => setNotificationPrefs(p => ({ ...p, reminderDays: p.reminderDays?.includes(days) ? p.reminderDays.filter(d => d !== days) : [...(p.reminderDays || []), days].sort((a,b) => b-a) }))}>
                  <Text style={[styles.reminderChipText, notificationPrefs.reminderDays?.includes(days) && styles.reminderChipTextActive]}>{days}d</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Save Preferences" onPress={handleNotificationSave} loading={loading} style={{ marginTop: 16 }} />
          </Card>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'vehicle' ? null : 'vehicle')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Vehicle Information</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'vehicle' && (
          <Card style={styles.editCard}>
            <Text style={styles.label}>Vehicle Type</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowVehicleTypePicker(true)}>
              <Text style={businessData.vehicleDetails.type ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                {VEHICLE_TYPES.find(v => v.value === businessData.vehicleDetails.type)?.label || 'Select Type'}
              </Text>
            </TouchableOpacity>
            <View style={styles.row}>
              <View style={styles.halfInput}><Input label="Make" value={businessData.vehicleDetails.make} onChangeText={v => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, make: v } }))} /></View>
              <View style={styles.halfInput}><Input label="Model" value={businessData.vehicleDetails.model} onChangeText={v => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, model: v } }))} /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}><Input label="Year" value={businessData.vehicleDetails.year} onChangeText={v => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, year: v } }))} keyboardType="number-pad" /></View>
              <View style={styles.halfInput}><Input label="License Plate" value={businessData.vehicleDetails.licensePlate} onChangeText={v => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, licensePlate: v } }))} /></View>
            </View>
            <Button title="Save Vehicle Info" onPress={handleBusinessSave} loading={loading} style={{ marginTop: 12 }} />
          </Card>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'insurance' ? null : 'insurance')}>
          <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Insurance</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
        </TouchableOpacity>
        {activeSection === 'insurance' && (
          <Card style={styles.editCard}>
            <Input label="Insurance Provider" value={businessData.insurance.provider} onChangeText={v => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, provider: v } }))} placeholder="e.g., State Farm, GEICO" />
            <Input label="Policy Number" value={businessData.insurance.policyNumber} onChangeText={v => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, policyNumber: v } }))} />
            <DateInput label="Expiry Date" value={businessData.insurance.expiryDate ? businessData.insurance.expiryDate.split('T')[0] : ''} onChangeText={v => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, expiryDate: v } }))} />
            <Button title="Save Insurance Info" onPress={handleBusinessSave} loading={loading} style={{ marginTop: 12 }} />
          </Card>
        )}

        {subscription?.features?.teamAccounts && (
          <>
            <TouchableOpacity onPress={() => setActiveSection(activeSection === 'team' ? null : 'team')}>
              <Card style={styles.settingsCard}><Text style={styles.settingsSection}>Team Members ({teamMembers.length})</Text><Icons.Edit size={18} color={COLORS.gray400} /></Card>
            </TouchableOpacity>
            {activeSection === 'team' && (
              <Card style={styles.editCard}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Invite Team Member</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}><Input placeholder="Email address" value={newMemberEmail} onChangeText={setNewMemberEmail} keyboardType="email-address" autoCapitalize="none" /></View>
                  <Button title="Invite" onPress={inviteTeamMember} loading={loading} style={{ marginLeft: 8 }} />
                </View>
                {teamMembers.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.label, { marginBottom: 8 }]}>Current Members</Text>
                    {teamMembers.map(member => (
                      <View key={member._id} style={styles.teamMemberRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.teamMemberName}>{member.firstName} {member.lastName}</Text>
                          <Text style={styles.teamMemberEmail}>{member.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeTeamMember(member._id, member.firstName)} style={styles.deleteButton}>
                          <Icons.X size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            )}
          </>
        )}

        <TouchableOpacity onPress={() => setShowSubscriptionModal(true)}>
          <Card style={[styles.settingsCard, subscriptionStatus?.isExpired && styles.settingsCardExpired]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsSection}>Subscription</Text>
              <Text style={[styles.subscriptionStatus, subscriptionStatus?.isExpired && { color: COLORS.danger }]}>
                {subscriptionStatus?.isExpired ? 'Expired - Upgrade to restore access' : getSubscriptionStatusText()}
              </Text>
            </View>
            <Badge label={subscription?.plan?.toUpperCase() || 'FULL ACCESS'} variant={subscriptionStatus?.isExpired ? 'danger' : 'primary'} />
          </Card>
        </TouchableOpacity>
        
        {/* Manage Subscription - opens Google Play / Apple subscription settings */}
        {subscription?.stripeSubscriptionId && (
          <TouchableOpacity onPress={() => BillingService.manageSubscription()}>
            <Card style={styles.settingsCard}>
              <Text style={styles.settingsLabel}>Manage Subscription</Text>
              <Text style={[styles.settingsHint, { marginTop: 2 }]}>Update payment method, cancel, or view history</Text>
              <Icons.ChevronRight size={18} color={COLORS.gray400} />
            </Card>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setActiveSection(activeSection === 'legal' ? null : 'legal')}>
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Legal & Support</Text>
            <Icons.ChevronRight size={18} color={COLORS.gray400} />
          </Card>
        </TouchableOpacity>
        {activeSection === 'legal' && (
          <Card style={styles.editCard}>
            <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL('https://permitwise.app/privacy')}>
              <Text style={styles.legalLabel}>Privacy Policy</Text>
              <Icons.ChevronRight size={18} color={COLORS.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalRow} onPress={() => Linking.openURL('https://permitwise.app/terms')}>
              <Text style={styles.legalLabel}>Terms of Service</Text>
              <Icons.ChevronRight size={18} color={COLORS.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.legalRow, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL('mailto:support@permitwise.app')}>
              <Text style={styles.legalLabel}>Contact Support</Text>
              <Icons.ChevronRight size={18} color={COLORS.gray400} />
            </TouchableOpacity>
            
            <View style={{ borderTopWidth: 1, borderTopColor: '#fee2e2', marginTop: 16, paddingTop: 16 }}>
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 12 }}>
                Permanently delete your account and all data.{subscription?.stripeSubscriptionId ? ' Your subscription will be automatically cancelled.' : ''} This cannot be undone.
              </Text>
              <TouchableOpacity 
                onPress={handleDeleteAccount} 
                disabled={deletingAccount}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.danger, backgroundColor: deletingAccount ? '#fee2e2' : COLORS.white }}>
                {deletingAccount ? <ActivityIndicator size="small" color={COLORS.danger} /> : <Icons.Alert size={18} color={COLORS.danger} />}
                <Text style={{ color: COLORS.danger, fontWeight: '600', fontSize: 14 }}>Delete Account Permanently</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        <Text style={styles.appVersion}>PermitWise v1.0.0</Text>

        <Button title="Log Out" variant="outline" onPress={handleLogout} style={styles.logoutButton} />

        <PickerModal visible={showStatePicker !== false} onClose={() => setShowStatePicker(false)} title="State" options={US_STATES.map(s => ({ value: s, label: s }))} 
          value={showStatePicker === 'address' ? businessData.address.state : businessData.operatingCities[showStatePicker]?.state}
          onSelect={v => { if (showStatePicker === 'address') setBusinessData(d => ({ ...d, address: { ...d.address, state: v } })); else updateCity(showStatePicker, 'state', v); }} />
        
        <PickerModal visible={showVehicleTypePicker} onClose={() => setShowVehicleTypePicker(false)} title="Vehicle Type" options={VEHICLE_TYPES}
          value={businessData.vehicleDetails.type}
          onSelect={v => { setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, type: v } })); setShowVehicleTypePicker(false); }} />
        
        <SubscriptionModal visible={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} currentPlan={subscription?.plan} onSubscribe={fetchUser} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ===========================================
// SUBSCRIPTION MODAL (Google Play / Stripe)
// ===========================================
const SubscriptionModal = ({ visible, onClose, currentPlan, onSubscribe }) => {
  const { user, subscription } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;
  const plans = isOrganizer ? ORGANIZER_PLAN_DETAILS : PLAN_DETAILS;

  const PLAN_RANK = { free: 0, trial: 0, basic: 1, pro: 2, elite: 3, promo: 4, lifetime: 5 };
  const currentRank = PLAN_RANK[currentPlan] || 0;
  
  const getPlanAction = (planKey) => {
    if (currentPlan === planKey) return 'current';
    if (subscription?.pendingPlanChange === planKey) return 'pending';
    if (!currentPlan || !['active', 'grace_period'].includes(subscription?.status)) return 'upgrade';
    return (PLAN_RANK[planKey] || 0) > currentRank ? 'upgrade' : 'downgrade';
  };

  const handlePlanAction = async (planKey) => {
    const action = getPlanAction(planKey);
    setLoading(true);
    setSelectedPlan(planKey);
    try {
      if (action === 'downgrade') {
        // Downgrade via server — keep current features until renewal
        const data = await api.post('/subscription/change-plan', { plan: planKey });
        if (data.success) {
          toast.success(data.message);
          if (onSubscribe) onSubscribe();
        } else if (data.needsCheckout) {
          // Fallback to IAP checkout
          await BillingService.purchaseSubscription(SUBSCRIPTION_SKUS[planKey], planKey);
          toast.success('Subscription updated');
          if (onSubscribe) onSubscribe();
        }
      } else if (action === 'upgrade' && ['active', 'grace_period'].includes(subscription?.status)) {
        // In-place upgrade via server
        const data = await api.post('/subscription/change-plan', { plan: planKey });
        if (data.success) {
          toast.success(data.message);
          if (onSubscribe) onSubscribe();
        } else if (data.needsCheckout) {
          await BillingService.purchaseSubscription(SUBSCRIPTION_SKUS[planKey], planKey);
          toast.success('Redirecting to checkout...');
          if (onSubscribe) onSubscribe();
        }
      } else {
        // New subscription — go through IAP
        await BillingService.purchaseSubscription(SUBSCRIPTION_SKUS[planKey], planKey);
        toast.success('Redirecting to checkout...');
        if (onSubscribe) onSubscribe();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await BillingService.restorePurchases();
      if (restored) {
        toast.success('Purchases restored');
        onSubscribe();
        onClose();
      } else {
        toast.info('No purchases to restore');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleManage = async () => {
    await BillingService.manageSubscription();
  };
  
  const handleCancelPendingChange = async () => {
    try {
      const data = await api.post('/subscription/cancel-plan-change');
      if (data.success) { toast.success(data.message); if (onSubscribe) onSubscribe(); }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.subscriptionModal}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>{isOrganizer ? 'Organizer Plan' : currentRank > 0 ? 'Change Plan' : 'Choose Your Plan'}</Text>
            <TouchableOpacity onPress={onClose}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.plansContainer}>
            <Text style={styles.subscriptionSubtitle}>{isOrganizer ? 'Manage events and vendor compliance' : 'Get 14 days on us — with most benefits'}</Text>
            
            {subscription?.pendingPlanChange && (
              <View style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fbbf24', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#92400e' }}>
                  <Text style={{ fontWeight: '600' }}>Scheduled change: </Text>
                  Switching to {subscription.pendingPlanChange.charAt(0).toUpperCase() + subscription.pendingPlanChange.slice(1)} on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'next renewal'}
                </Text>
                <TouchableOpacity onPress={handleCancelPendingChange} style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 13, color: COLORS.danger, textDecorationLine: 'underline' }}>Cancel change</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {Object.entries(plans).map(([key, plan]) => {
              const action = getPlanAction(key);
              const btnLabel = action === 'current' ? 'Current Plan' 
                : action === 'pending' ? 'Downgrade Scheduled'
                : loading && selectedPlan === key ? 'Processing...' 
                : action === 'downgrade' ? `Downgrade to ${plan.name}`
                : `Upgrade to ${plan.name}`;
              
              return (
                <TouchableOpacity 
                  key={key} 
                  style={[styles.planCard, action === 'current' && styles.planCardCurrent, plan.popular && styles.planCardPopular]}
                  onPress={() => handlePlanAction(key)}
                  disabled={loading || action === 'current' || action === 'pending'}
                >
                  {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>Most Popular</Text></View>}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </View>
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.planFeature}>
                        <Icons.Check size={14} color={COLORS.success} />
                        <Text style={styles.planFeatureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  {action === 'current' ? (
                    <View style={styles.currentPlanBadge}><Text style={styles.currentPlanText}>Current Plan</Text></View>
                  ) : action === 'pending' ? (
                    <View style={[styles.currentPlanBadge, { backgroundColor: '#fef3c7' }]}><Text style={[styles.currentPlanText, { color: '#92400e' }]}>Downgrade Scheduled</Text></View>
                  ) : (
                    <View>
                      <Button 
                        title={btnLabel} 
                        variant={action === 'downgrade' ? 'outline' : undefined}
                        loading={loading && selectedPlan === key}
                        style={{ marginTop: 12 }}
                      />
                      {action === 'downgrade' && (
                        <Text style={{ fontSize: 11, color: COLORS.gray500, textAlign: 'center', marginTop: 4 }}>Keeps current features until renewal</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={styles.subscriptionActions}>
              {currentPlan && (
                <Button title="Manage Subscription" variant="outline" onPress={handleManage} style={{ marginBottom: 12 }} />
              )}
              <Button title={restoring ? 'Restoring...' : 'Restore Purchases'} variant="outline" onPress={handleRestore} loading={restoring} />
            </View>

            <Text style={styles.subscriptionDisclaimer}>
              {Platform.OS === 'android' 
                ? 'Payment will be charged to your Google Play account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.'
                : 'Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.'
              }
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const InspectionsScreen = () => {
  const { subscription } = useAuth();
  const toast = useToast();
  const [checklists, setChecklists] = useState([]);
  const [userChecklists, setUserChecklists] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState(null);
  const [inspectionData, setInspectionData] = useState({ items: [], notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('checklists'); // 'checklists' or 'history'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [viewingInspection, setViewingInspection] = useState(null); // For viewing completed inspection
  const [newChecklist, setNewChecklist] = useState({ name: '', description: '', items: [{ itemText: '' }] });
  const [suggestionText, setSuggestionText] = useState('');

  // Plan check: Pro, Elite, Promo, or Lifetime required
  const hasAccess = subscription?.plan === 'pro' || subscription?.plan === 'elite' || subscription?.plan === 'promo' || subscription?.plan === 'lifetime' || subscription?.features?.inspectionChecklists;

  const fetchData = async () => {
    try {
      const [cl, ucl, insp] = await Promise.all([
        api.get('/checklists'), 
        api.get('/user-checklists'),
        api.get('/inspections')
      ]);
      setChecklists(cl.checklists || []);
      setUserChecklists(ucl.checklists || []);
      setInspections(insp.inspections || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (hasAccess) fetchData(); else setLoading(false); }, [hasAccess]);

  const startInspection = (checklist, isUserChecklist = false) => {
    setActiveChecklist({ ...checklist, isUserChecklist });
    // Handle both items array directly or items within sections
    const items = checklist.items || (checklist.sections || []).flatMap(s => s.items || []);
    setInspectionData({ 
      items: items.map(item => ({ 
        itemText: item.itemText || item.description || item.name,
        description: item.description,
        passed: null, 
        notes: '' 
      })), 
      notes: '' 
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...inspectionData.items];
    items[index] = { ...items[index], [field]: value };
    setInspectionData(d => ({ ...d, items }));
  };

  const submitInspection = async () => {
    setSubmitting(true);
    try {
      const payload = { 
        items: inspectionData.items, 
        notes: inspectionData.notes, 
        inspectionDate: new Date() 
      };
      if (activeChecklist.isUserChecklist) {
        payload.userChecklistId = activeChecklist._id;
      } else {
        payload.checklistId = activeChecklist._id;
      }
      await api.post('/inspections', payload);
      toast.success('Inspection completed!');
      setActiveChecklist(null);
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const createUserChecklist = async () => {
    try {
      await api.post('/user-checklists', {
        name: newChecklist.name,
        description: newChecklist.description,
        items: newChecklist.items.filter(i => i.itemText.trim())
      });
      setNewChecklist({ name: '', description: '', items: [{ itemText: '' }] });
      setShowCreateModal(false);
      fetchData();
      toast.success('Checklist created!');
    } catch (err) { toast.error(err.message); }
  };

  const deleteUserChecklist = async (id) => {
    Alert.alert('Delete Checklist', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete('/user-checklists/' + id);
          fetchData();
        } catch (err) { toast.error(err.message); }
      }}
    ]);
  };

  const submitSuggestion = async () => {
    try {
      await api.post('/suggestions', {
        type: 'checklist_request',
        title: 'Checklist suggestion/request',
        description: suggestionText,
        checklistDetails: { isUserSpecific: false }
      });
      setSuggestionText('');
      setShowSuggestModal(false);
      toast.success('Your suggestion has been submitted.');
    } catch (err) { toast.error(err.message); }
  };

  // Show upgrade modal for non-Pro users
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.upgradeModalContainer}>
          <View style={styles.upgradeModalIcon}>
            <Icons.Checklist size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.upgradeModalTitle}>Inspection Checklists</Text>
          <View style={styles.upgradeModalBadge}>
            <Text style={styles.upgradeModalBadgeText}>PRO FEATURE</Text>
          </View>
          
          <Text style={styles.upgradeModalDescription}>
            Never fail a health inspection again. Walk through every requirement step-by-step before the inspector arrives.
          </Text>
          
          <View style={styles.upgradeModalFeatures}>
            <Text style={styles.upgradeModalFeaturesTitle}>What you'll get:</Text>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>City-Specific Checklists</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Pre-built checklists based on your operating cities' health department requirements</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Offline Mode</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Access checklists anywhere, even without internet connection</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Photo Documentation</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Capture photos as proof of compliance for each item</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Violation Alerts</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Get warnings about commonly failed inspection items</Text>
              </View>
            </View>
          </View>

          <View style={styles.upgradeModalPricing}>
            <Text style={styles.upgradeModalPricingLabel}>Pro Plan</Text>
            <Text style={styles.upgradeModalPrice}>$49<Text style={styles.upgradeModalPriceUnit}>/month</Text></Text>
            <Text style={styles.upgradeModalPricingNote}>Also includes SMS alerts, PDF autofill & multi-city support</Text>
          </View>

          <Button title="Upgrade to Pro" onPress={() => toast.info('Go to Settings > Subscription to upgrade your plan.')} style={styles.upgradeModalButton} />
          <Text style={styles.upgradeModalCancel}>14 days on us • Cancel anytime</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  // Active inspection flow
  if (activeChecklist) {
    const passedCount = inspectionData.items.filter(i => i.passed === true).length;
    const failedCount = inspectionData.items.filter(i => i.passed === false).length;
    const pendingCount = inspectionData.items.filter(i => i.passed === null).length;
    const progress = inspectionData.items.length > 0 ? Math.round(((passedCount + failedCount) / inspectionData.items.length) * 100) : 0;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inspectionHeader}>
          <TouchableOpacity onPress={() => setActiveChecklist(null)} style={styles.backButton}>
            <Icons.X size={24} color={COLORS.gray600} />
          </TouchableOpacity>
          <View style={styles.inspectionHeaderText}>
            <Text style={styles.inspectionTitle}>{activeChecklist.name}</Text>
            <Text style={styles.inspectionProgress}>{progress}% complete</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View>
        
        <ScrollView contentContainerStyle={styles.inspectionScroll}>
          {inspectionData.items.map((item, i) => (
            <Card key={i} style={[styles.inspectionItemCard, item.passed === true && styles.itemPassed, item.passed === false && styles.itemFailed]}>
              <View style={styles.inspectionItemHeader}>
                <View style={styles.itemNumberBadge}><Text style={styles.itemNumberText}>{i + 1}</Text></View>
                <Text style={styles.inspectionItemText}>{item.itemText}</Text>
              </View>
              {item.description && <Text style={styles.inspectionItemDesc}>{item.description}</Text>}
              <View style={styles.passFailButtons}>
                <TouchableOpacity 
                  style={[styles.passBtn, item.passed === true && styles.passBtnActive]} 
                  onPress={() => updateItem(i, 'passed', true)}
                >
                  <Icons.Check size={18} color={item.passed === true ? COLORS.white : COLORS.success} />
                  <Text style={[styles.passBtnText, item.passed === true && styles.passBtnTextActive]}>Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.failBtn, item.passed === false && styles.failBtnActive]} 
                  onPress={() => updateItem(i, 'passed', false)}
                >
                  <Icons.X size={18} color={item.passed === false ? COLORS.white : COLORS.danger} />
                  <Text style={[styles.failBtnText, item.passed === false && styles.failBtnTextActive]}>Fail</Text>
                </TouchableOpacity>
              </View>
              {item.passed === false && (
                <TextInput
                  style={styles.failNoteInput}
                  placeholder="Notes on failure..."
                  value={item.notes}
                  onChangeText={(v) => updateItem(i, 'notes', v)}
                  multiline
                />
              )}
            </Card>
          ))}
          
          <Card style={styles.inspectionSummaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryStatCount, { color: COLORS.success }]}>{passedCount}</Text>
                <Text style={styles.summaryStatLabel}>Passed</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryStatCount, { color: COLORS.danger }]}>{failedCount}</Text>
                <Text style={styles.summaryStatLabel}>Failed</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryStatCount, { color: COLORS.gray500 }]}>{pendingCount}</Text>
                <Text style={styles.summaryStatLabel}>Pending</Text>
              </View>
            </View>
            <Text style={[styles.label, { marginTop: 12 }]}>Overall Notes</Text>
            <TextInput
              style={styles.overallNotesInput}
              placeholder="Add any overall notes..."
              value={inspectionData.notes}
              onChangeText={(v) => setInspectionData(d => ({ ...d, notes: v }))}
              multiline
            />
            <Button 
              title={submitting ? "Submitting..." : "Complete Inspection"} 
              onPress={submitInspection} 
              loading={submitting}
              disabled={pendingCount > 0}
              style={{ marginTop: 16 }}
            />
            {pendingCount > 0 && <Text style={styles.pendingWarning}>Complete all items before submitting</Text>}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Inspections</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowSuggestModal(true)}>
            <Icons.Plus size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowCreateModal(true)}>
            <Icons.Checklist size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Buttons */}
      <View style={styles.inspectionTabs}>
        <TouchableOpacity 
          style={[styles.inspectionTab, activeTab === 'checklists' && styles.inspectionTabActive]} 
          onPress={() => setActiveTab('checklists')}
        >
          <Text style={[styles.inspectionTabText, activeTab === 'checklists' && styles.inspectionTabTextActive]}>Checklists</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.inspectionTab, activeTab === 'history' && styles.inspectionTabActive]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.inspectionTabText, activeTab === 'history' && styles.inspectionTabTextActive]}>History ({inspections.length})</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'checklists' ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.sectionTitle}>Recommended</Text>
          {checklists.length > 0 ? checklists.map(item => (
            <Card key={item._id} style={styles.checklistCard} onPress={() => startInspection(item)}>
              <View style={styles.checklistHeader}>
                <Icons.Checklist size={24} color={COLORS.primary} />
                <View style={styles.checklistInfo}>
                  <Text style={styles.checklistName}>{item.name}</Text>
                  <Text style={styles.checklistMeta}>{item.items?.length || 0} items • {item.jurisdictionId?.name || 'General'}</Text>
                </View>
                <View style={styles.startBtnSmall}><Text style={styles.startBtnText}>Start</Text></View>
              </View>
              {item.description && <Text style={styles.checklistDesc}>{item.description}</Text>}
            </Card>
          )) : (
            <Text style={styles.emptyText}>No recommended checklists yet</Text>
          )}
          
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Checklists</Text>
          {userChecklists.length > 0 ? userChecklists.map(item => (
            <Card key={item._id} style={styles.checklistCard}>
              <View style={styles.checklistHeader}>
                <Icons.Checklist size={24} color={COLORS.primary} />
                <View style={styles.checklistInfo}>
                  <Text style={styles.checklistName}>{item.name}</Text>
                  <Text style={styles.checklistMeta}>{item.items?.length || 0} items • Custom</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.startBtnSmall} onPress={() => startInspection(item, true)}>
                    <Text style={styles.startBtnText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUserChecklist(item._id)}>
                    <Icons.Trash size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              {item.description && <Text style={styles.checklistDesc}>{item.description}</Text>}
            </Card>
          )) : (
            <View style={styles.emptyContainerSmall}>
              <Text style={styles.emptyText}>No custom checklists yet</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(true)}>
                <Text style={styles.linkText}>Create your first checklist</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={inspections}
          keyExtractor={item => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setViewingInspection(item)}>
              <Card style={styles.inspectionHistoryCard}>
                <View style={styles.inspectionHistoryHeader}>
                  <View>
                    <Text style={styles.inspectionHistoryName}>{item.checklistId?.name || item.userChecklistId?.name || 'Inspection'}</Text>
                    <Text style={styles.inspectionHistoryDate}>{formatDate(item.inspectionDate)}</Text>
                  </View>
                  <Badge 
                    label={item.overallStatus === 'pass' ? 'PASSED' : item.overallStatus === 'fail' ? 'FAILED' : 'INCOMPLETE'} 
                    variant={item.overallStatus === 'pass' ? 'success' : item.overallStatus === 'fail' ? 'danger' : 'warning'} 
                  />
                </View>
                {item.results && (
                  <View style={styles.inspectionHistoryStats}>
                    <Text style={styles.historyStatText}>
                      ✓ {item.results.filter(i => i.passed === true).length} passed
                    </Text>
                    <Text style={styles.historyStatText}>
                      ✗ {item.results.filter(i => i.passed === false).length} failed
                    </Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icons.Checklist size={48} color={COLORS.gray300} />
              <Text style={styles.emptyTitle}>No inspections yet</Text>
              <Text style={styles.emptyText}>Complete a checklist to see your history here</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* View Inspection Modal */}
      <Modal visible={!!viewingInspection} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.inspectionViewModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{viewingInspection?.checklistId?.name || viewingInspection?.userChecklistId?.name || 'Inspection Results'}</Text>
                <Text style={styles.inspectionViewDate}>{viewingInspection && formatDate(viewingInspection.inspectionDate)}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingInspection(null)}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
            </View>
            <View style={styles.inspectionViewBadge}>
              <Badge 
                label={viewingInspection?.overallStatus === 'pass' ? 'PASSED' : viewingInspection?.overallStatus === 'fail' ? 'FAILED' : 'INCOMPLETE'} 
                variant={viewingInspection?.overallStatus === 'pass' ? 'success' : viewingInspection?.overallStatus === 'fail' ? 'danger' : 'warning'} 
              />
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.inspectionViewSectionTitle}>Checklist Items</Text>
              {viewingInspection?.results?.map((item, i) => (
                <View key={i} style={[styles.inspectionViewItem, item.passed === true ? styles.inspectionViewItemPassed : item.passed === false ? styles.inspectionViewItemFailed : styles.inspectionViewItemPending]}>
                  <View style={[styles.inspectionViewItemIcon, item.passed === true ? styles.inspectionViewIconPassed : item.passed === false ? styles.inspectionViewIconFailed : styles.inspectionViewIconPending]}>
                    {item.passed === true ? <Icons.Check size={14} color="white" /> : item.passed === false ? <Icons.X size={14} color="white" /> : <Icons.Clock size={14} color="white" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inspectionViewItemText}>{item.itemText}</Text>
                    {item.notes ? <Text style={styles.inspectionViewItemNotes}>{item.notes}</Text> : null}
                  </View>
                </View>
              ))}
              {viewingInspection?.notes && (
                <View style={styles.inspectionViewNotes}>
                  <Text style={styles.inspectionViewSectionTitle}>Notes</Text>
                  <Text style={styles.inspectionViewNotesText}>{viewingInspection.notes}</Text>
                </View>
              )}
            </ScrollView>
            <Button title="Close" variant="outline" onPress={() => setViewingInspection(null)} />
          </View>
        </View>
      </Modal>

      {/* Create Checklist Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Checklist</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              <Input label="Checklist Name *" placeholder="e.g., Pre-Event Safety Check" value={newChecklist.name} onChangeText={v => setNewChecklist(c => ({ ...c, name: v }))} />
              <Input label="Description" placeholder="What is this checklist for?" value={newChecklist.description} onChangeText={v => setNewChecklist(c => ({ ...c, description: v }))} />
              <Text style={styles.label}>Checklist Items</Text>
              {newChecklist.items.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ marginRight: 8 }}>{i + 1}.</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Item text"
                    value={item.itemText}
                    onChangeText={v => {
                      const items = [...newChecklist.items];
                      items[i] = { itemText: v };
                      setNewChecklist(c => ({ ...c, items }));
                    }}
                  />
                  {newChecklist.items.length > 1 && (
                    <TouchableOpacity onPress={() => setNewChecklist(c => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }))} style={{ marginLeft: 8 }}>
                      <Icons.Trash size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addItemBtn} onPress={() => setNewChecklist(c => ({ ...c, items: [...c.items, { itemText: '' }] }))}>
                <Icons.Plus size={16} color={COLORS.primary} />
                <Text style={styles.addItemBtnText}>Add Item</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setShowCreateModal(false)} style={{ flex: 1 }} />
              <Button title="Create" onPress={createUserChecklist} disabled={!newChecklist.name || !newChecklist.items.some(i => i.itemText.trim())} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Suggest Checklist Modal */}
      <Modal visible={showSuggestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suggest a Checklist</Text>
              <TouchableOpacity onPress={() => setShowSuggestModal(false)}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>Is there a checklist you'd like us to add for all vendors? Let us know!</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="e.g., Fire safety checklist for Austin food trucks..."
              value={suggestionText}
              onChangeText={setSuggestionText}
              multiline
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setShowSuggestModal(false)} style={{ flex: 1 }} />
              <Button title="Submit" onPress={submitSuggestion} disabled={!suggestionText.trim()} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const EventsScreen = () => {
  const { user, subscription, business } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [vendorApplications, setVendorApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOrgEvent, setSelectedOrgEvent] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState('');
  const [applyingToEvent, setApplyingToEvent] = useState(false);
  const [requestForm, setRequestForm] = useState({ eventName: '', organizerName: '', city: '', state: '', startDate: '', additionalInfo: '' });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [organizerTab, setOrganizerTab] = useState('my-events');
  const [inviteEmail, setInviteEmail] = useState('');
  const [registeredVendors, setRegisteredVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [showVendorPicker, setShowVendorPicker] = useState(false);
  const [newEvent, setNewEvent] = useState({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', eventType: 'food_event', maxVendors: '', status: 'draft', requiredPermitTypes: [], customPermitRequirements: [] });
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  // Jurisdictions for location selection
  const [jurisdictions, setJurisdictions] = useState([]);
  const [showLocationRequestModal, setShowLocationRequestModal] = useState(false);
  const [locationRequest, setLocationRequest] = useState({ city: '', state: '', reason: '' });
  const [locationRequestSubmitting, setLocationRequestSubmitting] = useState(false);
  
  // Available permit types for event creation
  const [availablePermitTypes, setAvailablePermitTypes] = useState([]);
  
  // Edit event state
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editPermitTypes, setEditPermitTypes] = useState([]);
  
  // Event proof documents state
  const [eventProofFiles, setEventProofFiles] = useState([]);
  const [previousEventProofs, setPreviousEventProofs] = useState([]);
  const [selectedPreviousProofs, setSelectedPreviousProofs] = useState([]);
  const [showProofCategoryPicker, setShowProofCategoryPicker] = useState(null);
  
  // Cancel event modal state
  const [showCancelModal, setShowCancelModal] = useState(null); // stores event to cancel
  const [cancelReason, setCancelReason] = useState('');

  // Attending events state (self-tracked)
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [showAddAttendingModal, setShowAddAttendingModal] = useState(false);
  const [editingAttendingEvent, setEditingAttendingEvent] = useState(null);
  const [attendingForm, setAttendingForm] = useState({ eventName: '', organizerName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', venueName: '', eventType: 'other', notes: '', requiredPermits: [], complianceChecklist: [] });
  const [newPermitName, setNewPermitName] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedAttendingEvent, setSelectedAttendingEvent] = useState(null);
  const [showAttendingStatePicker, setShowAttendingStatePicker] = useState(false);
  const [showAttendingTypePicker, setShowAttendingTypePicker] = useState(false);
  const [attendingCitySelection, setAttendingCitySelection] = useState(''); // 'city||state' or '__custom__'
  const [showAttendingCityPicker, setShowAttendingCityPicker] = useState(false);
  const [attendingSuggestedPermits, setAttendingSuggestedPermits] = useState([]);
  const [vendorPermitsList, setVendorPermitsList] = useState([]);
  const [selectedExistingPermit, setSelectedExistingPermit] = useState(null);
  const [showPermitPicker, setShowPermitPicker] = useState(false);

  // Check if user is an organizer
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;
  const organizerVerified = user?.organizerProfile?.verified;
  const verificationStatus = user?.organizerProfile?.verificationStatus || 'pending';
  
  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Plan check for vendors: Elite, Promo, or Lifetime required
  const hasAccess = isOrganizer || subscription?.plan === 'elite' || subscription?.plan === 'promo' || subscription?.plan === 'lifetime' || subscription?.features?.eventIntegration;

  // Get unique states from jurisdictions
  const getAvailableStates = () => [...new Set(jurisdictions.map(j => j.state))].sort();
  
  // Get unique cities for selected state
  const getAvailableCities = (state) => {
    if (!state) return [];
    return [...new Set(jurisdictions.filter(j => j.state === state).map(j => j.city))].sort();
  };

  // Fetch organizer's events
  const fetchOrganizerEvents = async () => {
    try {
      const [eventsData, jurData, vendorsData] = await Promise.all([
        api.get('/events/organizer/my-events'),
        api.get('/jurisdictions'),
        api.get('/events/organizer/registered-vendors')
      ]);
      setOrganizerEvents(eventsData.events || []);
      setJurisdictions(jurData.jurisdictions || []);
      setRegisteredVendors(vendorsData.vendors || []);
    } catch (error) { 
      console.error('Error fetching organizer data:', error);
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Fetch vendor's events and published events for browsing
  const fetchMyEvents = async () => {
    try {
      const [myData, pubData, attData, permData] = await Promise.all([
        api.get('/events/my-events'),
        api.get('/events/published'),
        api.get('/attending-events'),
        api.get('/permits')
      ]);
      setEvents(myData.events || []);
      setPublishedEvents(pubData.events || []);
      setAttendingEvents(attData.attendingEvents || []);
      setVendorPermitsList(permData.permits || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Apply to an event
  const applyToEvent = async () => {
    if (!showApplyModal) return;
    setApplyingToEvent(true);
    try {
      await api.post(`/events/${showApplyModal._id}/apply`, { applicationNotes });
      toast.success('Application submitted!');
      setShowApplyModal(null);
      setApplicationNotes('');
      fetchMyEvents();
    } catch (error) { toast.error(error.message); }
    finally { setApplyingToEvent(false); }
  };

  // Respond to event invitation (accept/decline)
  const respondToInvitation = async (eventId, accept) => {
    try {
      await api.put(`/events/${eventId}/respond-invitation`, { accept });
      toast.success(accept ? 'Invitation accepted!' : 'Invitation declined');
      fetchMyEvents();
    } catch (error) { toast.error(error.message); }
  };

  // Withdraw from event state
  const [showWithdrawModal, setShowWithdrawModal] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const withdrawFromEvent = async () => {
    if (!showWithdrawModal) return;
    setWithdrawing(true);
    try {
      await api.delete(`/events/${showWithdrawModal._id}/withdraw`, { reason: withdrawReason });
      setShowWithdrawModal(null);
      setWithdrawReason('');
      fetchMyEvents();
      fetchPublishedEvents();
      toast.success('Withdrawn from event. The organizer has been notified.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  // Fetch applications for an event
  const fetchEventApplications = async (eventId) => {
    try {
      const data = await api.get(`/events/organizer/${eventId}/applications`);
      setVendorApplications(data.applications || []);
      const event = organizerEvents.find(e => e._id === eventId);
      setSelectedOrgEvent(event);
    } catch (error) { toast.error(error.message); }
  };

  // Handle vendor application
  const handleApplication = async (applicationId, status) => {
    try {
      await api.put(`/events/organizer/applications/${applicationId}`, { status });
      fetchEventApplications(selectedOrgEvent._id);
      toast.success(`Application ${status}`);
    } catch (error) { toast.error(error.message); }
  };

  // Invite vendor
  const inviteVendor = async () => {
    if (!inviteEmail || !selectedOrgEvent) return;
    try {
      await api.post(`/events/organizer/${selectedOrgEvent._id}/invite`, { email: inviteEmail });
      setInviteEmail('');
      toast.success('Invitation sent');
      fetchEventApplications(selectedOrgEvent._id);
    } catch (error) { toast.error(error.message); }
  };

  // Edit event functions
  const openEditEventModal = async (event) => {
    setEditingEvent({
      ...event,
      eventName: event.eventName || '',
      description: event.description || '',
      startDate: event.startDate?.split('T')[0] || '',
      endDate: event.endDate?.split('T')[0] || '',
      applicationDeadline: event.applicationDeadline?.split('T')[0] || '',
      city: event.location?.city || '',
      state: event.location?.state || '',
      address: event.location?.address || '',
      eventType: event.eventType || 'food_event',
      maxVendors: event.maxVendors?.toString() || '',
      status: event.status || 'draft',
      feeStructure: event.feeStructure || { applicationFee: 0, boothFee: 0, electricityFee: 0 },
      requiredPermitTypes: event.requiredPermitTypes?.map(pt => pt._id || pt) || [],
      customPermitRequirements: event.customPermitRequirements || []
    });
    if (event.location?.state) {
      try {
        const ptData = await api.get(`/permit-types/by-state?state=${event.location.state}`);
        setEditPermitTypes(ptData.permitTypes || []);
      } catch (err) { console.error(err); }
    }
    setShowEditEventModal(true);
  };

  const handleEditEventStateChange = async (newState) => {
    setEditingEvent(ev => ({ ...ev, state: newState, city: '', requiredPermitTypes: [] }));
    if (newState) {
      try {
        const ptData = await api.get(`/permit-types/by-state?state=${newState}`);
        setEditPermitTypes(ptData.permitTypes || []);
      } catch (err) { console.error(err); }
    } else {
      setEditPermitTypes([]);
    }
  };

  const saveEditedEvent = async () => {
    if (!editingEvent) return;
    try {
      const eventData = {
        eventName: editingEvent.eventName,
        description: editingEvent.description,
        startDate: editingEvent.startDate,
        endDate: editingEvent.endDate,
        applicationDeadline: editingEvent.applicationDeadline,
        location: { city: editingEvent.city, state: editingEvent.state, address: editingEvent.address },
        eventType: editingEvent.eventType,
        maxVendors: editingEvent.maxVendors,
        status: editingEvent.status,
        feeStructure: editingEvent.feeStructure,
        requiredPermitTypes: editingEvent.requiredPermitTypes,
        customPermitRequirements: editingEvent.customPermitRequirements
      };
      await api.put(`/events/organizer/${editingEvent._id}`, eventData);
      const orgData = await api.get('/events/organizer/my-events');
      setOrganizerEvents(orgData.events || []);
      setShowEditEventModal(false);
      setEditingEvent(null);
      toast.success('Event updated');
    } catch (err) { toast.error(err.message); }
  };

  // Fetch permit types by state
  const fetchPermitTypesByState = async (state, city = null) => {
    if (!state) {
      setAvailablePermitTypes([]);
      return;
    }
    try {
      // If city is provided, filter by specific jurisdiction
      const url = city 
        ? `/permit-types/by-state?state=${state}&city=${encodeURIComponent(city)}`
        : `/permit-types/by-state?state=${state}`;
      const ptData = await api.get(url);
      setAvailablePermitTypes(ptData.permitTypes || []);
    } catch (err) {
      console.error('Error fetching permit types:', err);
      // Fallback to all permit types
      try {
        const ptData = await api.get('/permit-types/all');
        setAvailablePermitTypes(ptData.permitTypes || []);
      } catch { setAvailablePermitTypes([]); }
    }
  };

  // Handle state change in event form - clear city and permits when state changes
  const handleEventStateChange = (state) => {
    setNewEvent(f => ({ ...f, state, city: '', requiredPermitTypes: [] }));
    setShowStatePicker(false);
    setAvailablePermitTypes([]); // Clear permits until city is selected
  };
  
  // Handle city change in event form - fetch permits for specific city
  const handleEventCityChange = (city) => {
    setNewEvent(f => ({ ...f, city, requiredPermitTypes: [] }));
    setShowCityPicker(false);
    if (city && newEvent.state) {
      fetchPermitTypesByState(newEvent.state, city);
    } else {
      setAvailablePermitTypes([]);
    }
  };

  // Toggle permit type selection
  const togglePermitType = (permitId) => {
    setNewEvent(f => {
      const current = f.requiredPermitTypes || [];
      if (current.includes(permitId)) {
        return { ...f, requiredPermitTypes: current.filter(id => id !== permitId) };
      } else {
        return { ...f, requiredPermitTypes: [...current, permitId] };
      }
    });
  };

  // Add custom requirement
  const addCustomRequirement = () => {
    setNewEvent(f => ({
      ...f,
      customPermitRequirements: [...(f.customPermitRequirements || []), { name: '', description: '', required: true }]
    }));
  };

  // Update custom requirement
  const updateCustomRequirement = (index, field, value) => {
    setNewEvent(f => {
      const updated = [...(f.customPermitRequirements || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, customPermitRequirements: updated };
    });
  };

  // Remove custom requirement
  const removeCustomRequirement = (index) => {
    setNewEvent(f => ({
      ...f,
      customPermitRequirements: (f.customPermitRequirements || []).filter((_, i) => i !== index)
    }));
  };

  // Submit location request
  const submitLocationRequest = async () => {
    if (!locationRequest.city || !locationRequest.state) return;
    setLocationRequestSubmitting(true);
    try {
      await api.post('/suggestions', {
        type: 'city_request',
        details: `New location request for event: ${locationRequest.city}, ${locationRequest.state}`,
        additionalInfo: locationRequest.reason
      });
      toast.success('Location request submitted! Our team will review and add it soon.');
      setShowLocationRequestModal(false);
      setLocationRequest({ city: '', state: '', reason: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLocationRequestSubmitting(false);
    }
  };

  // Update event status
  const updateEventStatus = async (eventId, status) => {
    // For closing events, show a confirmation dialog
    if (status === 'closed') {
      const confirmed = await confirm({
        title: 'Close Event',
        message: 'Are you sure you want to close this event?\n\n• New applications will stop\n• Event moves to Past Events\n• Vendors can still view details',
        confirmText: 'Yes, Close Event',
        cancelText: 'Keep Open',
        variant: 'primary'
      });
      if (!confirmed) return;
    }
    
    try {
      await api.put(`/events/organizer/${eventId}/status`, { status });
      fetchOrganizerEvents();
      if (status === 'closed') {
        toast.success('Event closed successfully.');
      } else {
        toast.success(`Event ${status}`);
      }
    } catch (error) { toast.error(error.message); }
  };
  
  // Cancel event - opens modal to get reason
  const initiateCancelEvent = (event) => {
    // Check if event date has passed
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate <= today) {
      toast.error('Cannot cancel an event that has already started. Use "Close" instead.');
      return;
    }
    
    setShowCancelModal(event);
    setCancelReason('');
  };
  
  // Execute cancel event after getting reason
  const executeCancelEvent = async () => {
    if (!cancelReason || cancelReason.trim() === '') {
      toast.error('A cancellation reason is required.');
      return;
    }
    
    const confirmed = await confirm({
      title: 'Confirm Cancellation',
      message: `Are you sure you want to cancel this event?\n\nReason: "${cancelReason}"\n\nAll vendors will be notified.`,
      confirmText: 'Yes, Cancel Event',
      cancelText: 'No',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    try {
      await api.put(`/events/organizer/${showCancelModal._id}/cancel`, { reason: cancelReason.trim() });
      setShowCancelModal(null);
      setCancelReason('');
      fetchOrganizerEvents();
      toast.success('Event cancelled. All vendors have been notified.');
    } catch (error) { toast.error(error.message); }
  };

  // Create event
  const createEvent = async () => {
    if (!newEvent.eventName || !newEvent.startDate || !newEvent.city || !newEvent.state) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const eventData = {
        ...newEvent,
        location: { city: newEvent.city, state: newEvent.state }
      };
      const response = await api.post('/events/organizer/create', eventData);
      const createdEvent = response.event;
      
      // Upload new proof documents if any
      if (eventProofFiles.length > 0) {
        for (const fileData of eventProofFiles) {
          const fd = new FormData();
          fd.append('file', {
            uri: fileData.uri,
            name: fileData.name,
            type: fileData.type || 'application/octet-stream'
          });
          fd.append('name', fileData.name);
          fd.append('category', fileData.category || 'venue_contract');
          await api.upload(`/events/organizer/${createdEvent._id}/proof`, fd);
        }
      }
      
      // Copy selected previous proofs if any
      if (selectedPreviousProofs.length > 0) {
        await api.post(`/events/organizer/${createdEvent._id}/copy-proofs`, { proofIds: selectedPreviousProofs });
      }
      
      setShowCreateModal(false);
      setNewEvent({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', eventType: 'food_event', maxVendors: '', status: 'draft', requiredPermitTypes: [], customPermitRequirements: [] });
      setEventProofFiles([]);
      setSelectedPreviousProofs([]);
      setAvailablePermitTypes([]);
      fetchOrganizerEvents();
      toast.success('Event created');
    } catch (error) { toast.error(error.message); }
  };
  
  // Fetch previous event proofs for reuse
  const fetchPreviousEventProofs = async () => {
    try {
      const data = await api.get('/events/organizer/previous-proofs');
      setPreviousEventProofs(data.proofs || []);
    } catch (err) { console.error(err); }
  };
  
  // Handle document picker for proof files
  const pickProofDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: true
      });
      
      if (result.canceled) return;
      
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
        category: 'venue_contract'
      }));
      
      setEventProofFiles([...eventProofFiles, ...newFiles]);
    } catch (err) {
      toast.error('Could not pick document');
    }
  };

  useEffect(() => {
    // Only fetch when user is loaded
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Check organizer status directly from user object
    const userIsOrganizer = user.isOrganizer && !user.organizerProfile?.disabled;
    
    if (userIsOrganizer) {
      fetchOrganizerEvents();
    } else if (hasAccess) {
      fetchMyEvents();
    } else {
      setLoading(false);
    }
  }, [user, subscription]);

  // Sync selectedAttendingEvent with fresh data after re-fetches
  useEffect(() => {
    if (selectedAttendingEvent) {
      const updated = attendingEvents.find(ae => ae._id === selectedAttendingEvent._id);
      if (updated) setSelectedAttendingEvent(updated);
    }
  }, [attendingEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selectedEvent with fresh event data after re-fetches
  useEffect(() => {
    if (selectedEvent) {
      const allEvents = [...events, ...publishedEvents];
      const updated = allEvents.find(e => e._id === selectedEvent._id);
      if (updated) setSelectedEvent(updated);
    }
  }, [events, publishedEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitEventRequest = async () => {
    setRequestSubmitting(true);
    try {
      await api.post('/suggestions', {
        type: 'event_request',
        title: `Event Request: ${requestForm.eventName}`,
        description: requestForm.additionalInfo,
        eventDetails: requestForm
      });
      setRequestSubmitted(true);
      setTimeout(() => { setShowRequestModal(false); setRequestSubmitted(false); setRequestForm({ eventName: '', organizerName: '', city: '', state: '', startDate: '', additionalInfo: '' }); }, 2000);
    } catch (err) { toast.error(err.message); }
    finally { setRequestSubmitting(false); }
  };

  // ============ ORGANIZER PORTAL VIEW ============
  if (isOrganizer) {
    if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    // Get all pending applications across events
    const allPendingApplications = organizerEvents.flatMap(event => 
      (event.vendorApplications || []).filter(a => a.status === 'pending').map(a => ({ ...a, eventName: event.eventName, eventId: event._id }))
    );

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Organizer Portal</Text>
            <Text style={styles.pageSubtitle}>Manage your events and vendors</Text>
          </View>
          <View style={styles.organizerBadge}><Text style={styles.organizerBadgeText}>ORGANIZER</Text></View>
        </View>

        {/* Organizer Tabs */}
        <View style={styles.organizerTabs}>
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcomingCount = organizerEvents.filter(e => {
              const eventDate = new Date(e.endDate || e.startDate);
              return eventDate >= today && e.status !== 'closed' && e.status !== 'cancelled';
            }).length;
            const pastCount = organizerEvents.filter(e => {
              const eventDate = new Date(e.endDate || e.startDate);
              return eventDate < today || e.status === 'closed' || e.status === 'cancelled';
            }).length;
            return [
              { key: 'my-events', label: `🎪 Upcoming (${upcomingCount})` }, 
              { key: 'past-events', label: `📜 Past (${pastCount})` }, 
              { key: 'applications', label: '📋 Apps' }
            ].map(tab => (
              <TouchableOpacity key={tab.key} style={[styles.organizerTab, organizerTab === tab.key && styles.organizerTabActive]} onPress={() => { setOrganizerTab(tab.key); setSelectedOrgEvent(null); }}>
                <Text style={[styles.organizerTabText, organizerTab === tab.key && styles.organizerTabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ));
          })()}
          <TouchableOpacity style={styles.createEventButton} onPress={() => {
            if (!organizerVerified) {
              setShowVerificationModal(true);
            } else {
              fetchPreviousEventProofs();
              setShowCreateModal(true);
            }
          }}>
            <Icons.Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* My Events Tab (Upcoming only) */}
        {organizerTab === 'my-events' && !selectedOrgEvent && (
          <FlatList
            data={organizerEvents.filter(e => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const eventDate = new Date(e.endDate || e.startDate);
              return eventDate >= today && e.status !== 'closed' && e.status !== 'cancelled';
            })}
            keyExtractor={item => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrganizerEvents(); }} />}
            renderItem={({ item }) => (
              <Card style={styles.organizerEventCard}>
                <View style={styles.organizerEventHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.organizerEventName}>{item.eventName}</Text>
                    <View style={styles.organizerEventMeta}>
                      <Icons.Calendar size={14} color={COLORS.gray500} />
                      <Text style={styles.organizerEventMetaText}>{formatDate(item.startDate)}{item.endDate && item.endDate !== item.startDate ? ` - ${formatDate(item.endDate)}` : ''}</Text>
                    </View>
                    <View style={styles.organizerEventMeta}>
                      <Icons.MapPin size={14} color={COLORS.gray500} />
                      <Text style={styles.organizerEventMetaText}>{item.location?.city}, {item.location?.state}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'published' ? '#dcfce7' : item.status === 'closed' ? '#fef3c7' : '#f3f4f6' }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'published' ? '#166534' : item.status === 'closed' ? '#92400e' : '#374151' }]}>{item.status?.toUpperCase()}</Text>
                  </View>
                </View>
                
                {/* Proof Status Button */}
                {item.requiresProof !== false && item.status !== 'cancelled' && (
                  <TouchableOpacity 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: 12, 
                      marginBottom: 12,
                      borderWidth: 2, 
                      borderStyle: 'dashed',
                      borderColor: item.verificationStatus === 'approved' ? COLORS.success : 
                                   item.verificationStatus === 'rejected' ? COLORS.danger : '#f59e0b',
                      borderRadius: 8,
                      backgroundColor: item.verificationStatus === 'approved' ? '#dcfce7' : 
                                       item.verificationStatus === 'rejected' ? '#fee2e2' : '#fef3c7'
                    }}
                    onPress={() => {
                      if (item.verificationStatus !== 'approved') {
                        toast.info('Please use the web app to upload proof documents for this event.');
                      }
                    }}
                    disabled={item.verificationStatus === 'approved'}
                  >
                    {item.verificationStatus === 'approved' ? (
                      <><Icons.Check size={18} color="#166534" /><Text style={{ color: '#166534', fontWeight: '500' }}>Verified</Text></>
                    ) : item.verificationStatus === 'rejected' ? (
                      <><Icons.Alert size={18} color={COLORS.danger} /><Text style={{ color: COLORS.danger, fontWeight: '500' }}>Rejected - Upload New Proof</Text></>
                    ) : item.verificationStatus === 'info_needed' ? (
                      <><Icons.Alert size={18} color="#92400e" /><Text style={{ color: '#92400e', fontWeight: '500' }}>Info Needed - Upload More</Text></>
                    ) : (item.proofDocuments?.length || 0) > 0 ? (
                      <><Icons.Clock size={18} color="#92400e" /><Text style={{ color: '#92400e', fontWeight: '500' }}>Proof Pending Review</Text></>
                    ) : (
                      <><Icons.Upload size={18} color="#92400e" /><Text style={{ color: '#92400e', fontWeight: '500' }}>Upload Proof Documents</Text></>
                    )}
                  </TouchableOpacity>
                )}
                
                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.gray100, paddingVertical: 12, marginVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Event Type</Text>
                    <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>{item.eventType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Max Vendors</Text>
                    <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>{item.maxVendors || 'Unlimited'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Applications</Text>
                    <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>{item.vendorApplications?.length || 0}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Approved Vendors</Text>
                    <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>{item.assignedVendors?.length || 0}</Text>
                  </View>
                  {item.requiredPermitTypes?.length > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Required Permits</Text>
                      <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>{item.requiredPermitTypes.length}</Text>
                    </View>
                  )}
                  {item.feeStructure?.boothFee > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: COLORS.gray500, fontSize: 13 }}>Booth Fee</Text>
                      <Text style={{ color: COLORS.gray700, fontSize: 13, fontWeight: '500' }}>${item.feeStructure.boothFee}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.organizerEventActions}>
                  {item.status === 'closed' || item.status === 'cancelled' ? (
                    <Button title="View" variant="outline" size="sm" onPress={() => fetchEventApplications(item._id)} style={{ minWidth: 80 }} />
                  ) : (
                    <>
                      <Button title={item.status === 'published' ? 'Edit Name' : 'Edit'} variant="outline" size="sm" onPress={() => openEditEventModal(item)} style={{ minWidth: 80 }} />
                      <Button title="Manage" variant="outline" size="sm" onPress={() => fetchEventApplications(item._id)} style={{ minWidth: 80 }} />
                    </>
                  )}
                  {item.status === 'draft' && <Button title="Publish" size="sm" onPress={() => updateEventStatus(item._id, 'published')} style={{ minWidth: 80 }} />}
                  {item.status === 'published' && <Button title="Close" variant="outline" size="sm" onPress={() => updateEventStatus(item._id, 'closed')} style={{ minWidth: 70 }} />}
                  {(item.status === 'draft' || item.status === 'published') && (
                    <Button title="Cancel" variant="danger" size="sm" onPress={() => initiateCancelEvent(item)} style={{ minWidth: 70 }} />
                  )}
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icons.Event size={48} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>No upcoming events</Text>
                <Text style={styles.emptyText}>Create a new event to start accepting vendor applications.</Text>
                <Button title="Create Event" onPress={() => { if (organizerVerified) { fetchPreviousEventProofs(); setShowCreateModal(true); } else { setShowVerificationModal(true); } }} style={{ marginTop: 16 }} />
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Event Management View */}
        {organizerTab === 'my-events' && selectedOrgEvent && (
          <ScrollView style={styles.listContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedOrgEvent(null)}>
              <Icons.ChevronLeft size={20} color={COLORS.primary} />
              <Text style={styles.backButtonText}>Back to Events</Text>
            </TouchableOpacity>
            
            <Card style={styles.eventManagementCard}>
              <Text style={styles.eventManagementTitle}>{selectedOrgEvent.eventName}</Text>
              <Text style={styles.eventManagementMeta}>{formatDate(selectedOrgEvent.startDate)} • {selectedOrgEvent.location?.city}, {selectedOrgEvent.location?.state}</Text>
              
              <View style={styles.inviteSection}>
                <Text style={styles.inviteSectionTitle}>Invite Vendor</Text>
                
                {/* Registered vendors picker */}
                <Text style={styles.inviteLabel}>Select from registered vendors:</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowVendorPicker(true)}>
                  <Text style={selectedVendorId ? styles.pickerValue : styles.pickerPlaceholder}>
                    {selectedVendorId ? registeredVendors.find(v => v._id === selectedVendorId)?.businessName : 'Select a vendor...'}
                  </Text>
                  <Icons.ChevronDown size={20} color={COLORS.gray400} />
                </TouchableOpacity>
                
                <Text style={styles.inviteDividerText}>— OR —</Text>
                
                <Text style={styles.inviteLabel}>Enter email directly:</Text>
                <View style={styles.inviteForm}>
                  <TextInput 
                    style={[styles.input, { flex: 1 }]} 
                    placeholder="vendor@example.com" 
                    value={inviteEmail} 
                    onChangeText={(text) => { setInviteEmail(text); setSelectedVendorId(''); }} 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                  />
                </View>
                
                <Button title="Invite Vendor" onPress={inviteVendor} disabled={!inviteEmail} style={{ marginTop: 12 }} />
              </View>
            </Card>
            
            {/* Vendor Picker Modal */}
            <Modal visible={showVendorPicker} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.pickerModalContent}>
                  <View style={styles.pickerModalHeader}>
                    <Text style={styles.pickerModalTitle}>Select Vendor</Text>
                    <TouchableOpacity onPress={() => setShowVendorPicker(false)}>
                      <Icons.X size={24} color={COLORS.gray500} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={registeredVendors}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.pickerOption, selectedVendorId === item._id && styles.pickerOptionSelected]}
                        onPress={() => {
                          setSelectedVendorId(item._id);
                          setInviteEmail(item.email);
                          setShowVendorPicker(false);
                        }}
                      >
                        <View>
                          <Text style={styles.pickerOptionText}>{item.businessName}</Text>
                          <Text style={styles.pickerOptionSubtext}>{item.vendorType || 'Vendor'} • {item.email}</Text>
                        </View>
                        {selectedVendorId === item._id && <Icons.Check size={20} color={COLORS.primary} />}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No registered vendors found</Text>
                      </View>
                    }
                  />
                </View>
              </View>
            </Modal>

            <Text style={styles.sectionTitle}>Applications & Invitations</Text>
            {vendorApplications.length > 0 ? vendorApplications.map(app => (
              <Card key={app._id} style={[styles.applicationCard, { borderLeftWidth: 3, borderLeftColor: app.status === 'pending' ? COLORS.warning : app.status === 'approved' ? COLORS.success : COLORS.danger }]}>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationBusinessName}>{app.vendorBusinessId?.businessName || 'Unknown Vendor'}</Text>
                  <Text style={styles.applicationVendorType}>{app.vendorBusinessId?.primaryVendorType}</Text>
                  {app.applicationNotes && <Text style={styles.applicationNotes}>"{app.applicationNotes}"</Text>}
                </View>
                <View style={styles.applicationActions}>
                  <View style={[styles.complianceBadge, { backgroundColor: app.complianceStatus === 'ready' ? '#dcfce7' : app.complianceStatus === 'partial' ? '#fef3c7' : '#fee2e2' }]}>
                    <Text style={[styles.complianceBadgeText, { color: app.complianceStatus === 'ready' ? '#166534' : app.complianceStatus === 'partial' ? '#92400e' : '#dc2626' }]}>
                      {app.complianceStatus === 'ready' ? '✓ Compliant' : app.complianceStatus === 'partial' ? '⚠ Partial' : '✗ Missing'}
                    </Text>
                  </View>
                  {app.status === 'pending' && (
                    <View style={styles.applicationButtonRow}>
                      <TouchableOpacity style={[styles.appActionBtn, styles.appActionApprove]} onPress={() => handleApplication(app._id, 'approved')}><Text style={styles.appActionBtnText}>Approve</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.appActionBtn, styles.appActionReject]} onPress={() => handleApplication(app._id, 'rejected')}><Text style={[styles.appActionBtnText, { color: COLORS.danger }]}>Reject</Text></TouchableOpacity>
                    </View>
                  )}
                  {app.status !== 'pending' && (
                    <View style={[styles.statusBadge, { backgroundColor: app.status === 'approved' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#fef3c7' }]}>
                      <Text style={[styles.statusBadgeText, { color: app.status === 'approved' ? '#166534' : app.status === 'rejected' ? '#dc2626' : '#92400e' }]}>{app.status?.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </Card>
            )) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No applications yet</Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {/* Past Events Tab */}
        {organizerTab === 'past-events' && (
          <FlatList
            data={organizerEvents.filter(e => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const eventDate = new Date(e.endDate || e.startDate);
              return eventDate < today || e.status === 'closed' || e.status === 'cancelled';
            })}
            keyExtractor={item => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrganizerEvents(); }} />}
            renderItem={({ item }) => {
              const approvedVendors = item.vendorApplications?.filter(v => v.status === 'approved') || [];
              const totalAttended = item.assignedVendors?.length || approvedVendors.length;
              const statusLabel = item.status === 'cancelled' ? 'CANCELLED' : item.status === 'closed' ? 'CLOSED' : 'COMPLETED';
              const statusBgColor = item.status === 'cancelled' ? '#fef2f2' : item.status === 'closed' ? '#fef3c7' : '#f3f4f6';
              const statusTextColor = item.status === 'cancelled' ? COLORS.danger : item.status === 'closed' ? '#d97706' : '#374151';
              return (
                <Card style={[styles.organizerEventCard, { opacity: 0.9 }]}>
                  <View style={styles.organizerEventHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.organizerEventName}>{item.eventName}</Text>
                      <View style={styles.organizerEventMeta}>
                        <Icons.Calendar size={14} color={COLORS.gray500} />
                        <Text style={styles.organizerEventMetaText}>{formatDate(item.startDate)}</Text>
                      </View>
                      <View style={styles.organizerEventMeta}>
                        <Icons.MapPin size={14} color={COLORS.gray500} />
                        <Text style={styles.organizerEventMetaText}>{item.location?.city}, {item.location?.state}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                      <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>{statusLabel}</Text>
                    </View>
                  </View>
                  
                  {/* Summary Stats */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.gray100, marginVertical: 12 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.primary }}>{totalAttended}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.gray500, textTransform: 'uppercase' }}>Vendors</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.primary }}>{item.vendorApplications?.length || 0}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.gray500, textTransform: 'uppercase' }}>Applications</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, fontWeight: '700', color: COLORS.primary }}>{item.proofDocuments?.length || 0}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.gray500, textTransform: 'uppercase' }}>Documents</Text>
                    </View>
                  </View>
                  
                  <Button title="View Details" variant="outline" size="sm" onPress={() => fetchEventApplications(item._id)} />
                </Card>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icons.Clock size={48} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>No past events</Text>
                <Text style={styles.emptyText}>Your completed events will appear here.</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Applications Tab */}
        {organizerTab === 'applications' && (
          <FlatList
            data={allPendingApplications}
            keyExtractor={item => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrganizerEvents(); }} />}
            renderItem={({ item }) => (
              <Card style={[styles.applicationCard, { borderLeftWidth: 3, borderLeftColor: COLORS.warning }]}>
                <Text style={styles.applicationEventName}>{item.eventName}</Text>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationBusinessName}>{item.vendorBusinessId?.businessName || 'Unknown Vendor'}</Text>
                  <Text style={styles.applicationVendorType}>{item.vendorBusinessId?.primaryVendorType}</Text>
                </View>
                <View style={styles.applicationButtonRow}>
                  <TouchableOpacity style={[styles.appActionBtn, styles.appActionApprove]} onPress={() => { fetchEventApplications(item.eventId).then(() => handleApplication(item._id, 'approved')); }}><Text style={styles.appActionBtnText}>Approve</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.appActionBtn, styles.appActionReject]} onPress={() => { fetchEventApplications(item.eventId).then(() => handleApplication(item._id, 'rejected')); }}><Text style={[styles.appActionBtnText, { color: COLORS.danger }]}>Reject</Text></TouchableOpacity>
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icons.Check size={48} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptyText}>No pending applications to review.</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Create Event Modal */}
        <Modal visible={showCreateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Event</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Input label="Event Name *" placeholder="Downtown Food Festival" value={newEvent.eventName} onChangeText={v => setNewEvent(f => ({ ...f, eventName: v }))} />
                <Input label="Description" placeholder="Annual food truck festival..." value={newEvent.description} onChangeText={v => setNewEvent(f => ({ ...f, description: v }))} multiline />
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <DateInput label="Start Date *" required value={newEvent.startDate} onChangeText={v => setNewEvent(f => ({ ...f, startDate: v }))} />
                  </View>
                  <View style={styles.halfInput}>
                    <DateInput label="End Date" value={newEvent.endDate} onChangeText={v => setNewEvent(f => ({ ...f, endDate: v }))} />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>State *</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
                      <Text style={newEvent.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{newEvent.state || 'Select'}</Text>
                      <Icons.ChevronDown size={16} color={COLORS.gray400} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>City *</Text>
                    <TouchableOpacity style={[styles.pickerButton, !newEvent.state && styles.pickerButtonDisabled]} onPress={() => newEvent.state && setShowCityPicker(true)} disabled={!newEvent.state}>
                      <Text style={newEvent.city ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{newEvent.city || (newEvent.state ? 'Select' : 'Select state first')}</Text>
                      <Icons.ChevronDown size={16} color={COLORS.gray400} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowLocationRequestModal(true)} style={{ marginBottom: 16 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, textDecorationLine: 'underline' }}>Location not listed? Request a new location</Text>
                </TouchableOpacity>
                <Text style={styles.label}>Event Type</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
                  <Text style={styles.pickerButtonText}>{newEvent.eventType.replace('_', ' ')}</Text>
                  <Icons.ChevronDown size={16} color={COLORS.gray400} />
                </TouchableOpacity>
                <Input label="Max Vendors" placeholder="50" value={newEvent.maxVendors} onChangeText={v => setNewEvent(f => ({ ...f, maxVendors: v }))} keyboardType="number-pad" />
                
                {/* Required Permits Section */}
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { fontWeight: '600' }]}>Required Permits</Text>
                  <Text style={{ color: COLORS.gray500, fontSize: 13, marginBottom: 12 }}>Select permits vendors must have</Text>
                  {!newEvent.city ? (
                    <Text style={{ color: COLORS.gray400, fontStyle: 'italic' }}>Select a city above to see available permits</Text>
                  ) : availablePermitTypes.length > 0 ? (
                    <View style={{ gap: 8 }}>
                      {availablePermitTypes.map(pt => (
                        <TouchableOpacity 
                          key={pt._id} 
                          style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: (newEvent.requiredPermitTypes || []).includes(pt._id) ? '#e0f2fe' : COLORS.gray50, borderRadius: 8, borderWidth: 1, borderColor: (newEvent.requiredPermitTypes || []).includes(pt._id) ? COLORS.primary : COLORS.gray200 }}
                          onPress={() => togglePermitType(pt._id)}
                        >
                          <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: (newEvent.requiredPermitTypes || []).includes(pt._id) ? COLORS.primary : COLORS.gray300, backgroundColor: (newEvent.requiredPermitTypes || []).includes(pt._id) ? COLORS.primary : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                            {(newEvent.requiredPermitTypes || []).includes(pt._id) && <Icons.Check size={14} color={COLORS.white} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.gray800 }}>{pt.name}</Text>
                            <Text style={{ fontSize: 12, color: COLORS.gray500 }}>{pt.jurisdictionId?.city || 'State-wide'}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ color: COLORS.gray400, fontStyle: 'italic' }}>No permits found for {newEvent.city}, {newEvent.state}</Text>
                  )}
                </View>

                {/* Custom Requirements Section */}
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { fontWeight: '600' }]}>Custom Requirements</Text>
                  <Text style={{ color: COLORS.gray500, fontSize: 13, marginBottom: 12 }}>Add additional requirements (insurance, certifications, etc.)</Text>
                  {(newEvent.customPermitRequirements || []).map((req, index) => (
                    <View key={index} style={{ padding: 12, backgroundColor: COLORS.gray50, borderRadius: 8, marginBottom: 12 }}>
                      <TextInput 
                        style={[styles.input, { marginBottom: 8 }]} 
                        placeholder="Requirement name (e.g., General Liability Insurance)" 
                        placeholderTextColor={COLORS.gray400}
                        value={req.name} 
                        onChangeText={v => updateCustomRequirement(index, 'name', v)} 
                      />
                      <TextInput 
                        style={[styles.input, { marginBottom: 8 }]} 
                        placeholder="Description (optional)" 
                        placeholderTextColor={COLORS.gray400}
                        value={req.description || ''} 
                        onChangeText={v => updateCustomRequirement(index, 'description', v)} 
                      />
                      <TouchableOpacity onPress={() => removeCustomRequirement(index)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icons.X size={16} color={COLORS.danger} />
                        <Text style={{ marginLeft: 4, color: COLORS.danger, fontSize: 14 }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    onPress={addCustomRequirement} 
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 8, borderStyle: 'dashed' }}
                  >
                    <Icons.Plus size={18} color={COLORS.primary} />
                    <Text style={{ marginLeft: 8, color: COLORS.primary, fontWeight: '500' }}>Add Custom Requirement</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Event Proof Documents Section */}
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.label, { fontWeight: '600', marginBottom: 4 }]}>Venue/Event Proof Documents</Text>
                  <Text style={{ color: COLORS.gray500, fontSize: 13, marginBottom: 12 }}>Upload documents proving your ownership or rights to host events at this venue</Text>
                  
                  {/* Previous proofs from other events */}
                  {previousEventProofs.length > 0 && (
                    <View style={{ marginBottom: 16, backgroundColor: COLORS.gray50, borderRadius: 8, padding: 12 }}>
                      <Text style={{ fontWeight: '500', marginBottom: 8 }}>Use proof from previous events:</Text>
                      {previousEventProofs.map((proof, idx) => (
                        <TouchableOpacity 
                          key={idx}
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            padding: 10,
                            backgroundColor: selectedPreviousProofs.includes(proof._id) ? '#e0f2fe' : COLORS.white,
                            borderRadius: 6,
                            marginBottom: 6,
                            borderWidth: 1,
                            borderColor: selectedPreviousProofs.includes(proof._id) ? COLORS.primary : COLORS.gray200
                          }}
                          onPress={() => {
                            if (selectedPreviousProofs.includes(proof._id)) {
                              setSelectedPreviousProofs(selectedPreviousProofs.filter(id => id !== proof._id));
                            } else {
                              setSelectedPreviousProofs([...selectedPreviousProofs, proof._id]);
                            }
                          }}
                        >
                          <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: selectedPreviousProofs.includes(proof._id) ? COLORS.primary : COLORS.gray300, backgroundColor: selectedPreviousProofs.includes(proof._id) ? COLORS.primary : COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                            {selectedPreviousProofs.includes(proof._id) && <Icons.Check size={14} color={COLORS.white} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '500', fontSize: 14 }}>{proof.name}</Text>
                            <Text style={{ color: COLORS.gray500, fontSize: 12 }}>{proof.category?.replace(/_/g, ' ')} • from {proof.eventName}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Upload new documents */}
                  <TouchableOpacity 
                    onPress={pickProofDocument}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: 14,
                      backgroundColor: COLORS.primary,
                      borderRadius: 8
                    }}
                  >
                    <Icons.Upload size={18} color={COLORS.white} />
                    <Text style={{ marginLeft: 8, color: COLORS.white, fontWeight: '600' }}>Choose Files</Text>
                  </TouchableOpacity>
                  <Text style={{ color: COLORS.gray500, fontSize: 12, marginTop: 6 }}>Accepted: PDF, JPG, PNG (max 10MB each)</Text>
                  
                  {/* List of selected files */}
                  {eventProofFiles.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                      {eventProofFiles.map((fileData, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, padding: 10, borderRadius: 6, marginBottom: 6 }}>
                          <Icons.Document size={20} color={COLORS.gray500} />
                          <Text style={{ flex: 1, marginLeft: 8, fontSize: 13 }} numberOfLines={1}>{fileData.name}</Text>
                          <TouchableOpacity 
                            onPress={() => setShowProofCategoryPicker(idx)}
                            style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.gray200, borderRadius: 4, marginRight: 8 }}
                          >
                            <Text style={{ fontSize: 12, color: COLORS.gray700 }}>{fileData.category?.replace(/_/g, ' ')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEventProofFiles(eventProofFiles.filter((_, i) => i !== idx))}>
                            <Icons.X size={18} color={COLORS.danger} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.modalFooter}>
                  <Button title="Cancel" variant="outline" onPress={() => setShowCreateModal(false)} style={{ flex: 1 }} />
                  <Button title="Create Event" onPress={createEvent} disabled={!newEvent.eventName || !newEvent.startDate || !newEvent.city || !newEvent.state} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        {/* Verification Required Modal */}
        <Modal visible={showVerificationModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { padding: 24 }]}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: verificationStatus === 'rejected' ? '#fee2e2' : verificationStatus === 'info_needed' ? '#fef3c7' : '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {verificationStatus === 'rejected' ? (
                    <Icons.X size={32} color={COLORS.danger} />
                  ) : verificationStatus === 'info_needed' ? (
                    <Icons.Alert size={32} color="#f59e0b" />
                  ) : (
                    <Icons.Clock size={32} color={COLORS.primary} />
                  )}
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.gray800, marginBottom: 8 }}>
                  {verificationStatus === 'rejected' ? 'Account Not Approved' : 
                   verificationStatus === 'info_needed' ? 'Additional Info Needed' : 
                   'Verification Required'}
                </Text>
              </View>
              
              {verificationStatus === 'rejected' && (
                <Text style={{ color: COLORS.gray600, textAlign: 'center', marginBottom: 16 }}>
                  {user?.organizerProfile?.verificationNotes || 'Your organizer application was not approved. Please contact support for more information.'}
                </Text>
              )}
              
              {verificationStatus === 'info_needed' && (
                <Text style={{ color: COLORS.gray600, textAlign: 'center', marginBottom: 16 }}>
                  {user?.organizerProfile?.verificationNotes || 'Please upload the required verification documents to continue.'}
                </Text>
              )}
              
              {verificationStatus === 'pending' && (
                <>
                  <Text style={{ color: COLORS.gray600, textAlign: 'center', marginBottom: 12 }}>
                    To create events, you must first verify your organizer account by uploading required documentation.
                  </Text>
                  <View style={{ backgroundColor: COLORS.gray50, padding: 16, borderRadius: 8, marginBottom: 16 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 8 }}>Required Documents:</Text>
                    <Text style={{ color: COLORS.gray600 }}>• Business License or Registration</Text>
                    <Text style={{ color: COLORS.gray600 }}>• Government-issued ID</Text>
                    <Text style={{ color: COLORS.gray600 }}>• Proof of event organizing experience (optional)</Text>
                  </View>
                  <Text style={{ color: COLORS.gray500, textAlign: 'center', fontSize: 13 }}>
                    Once uploaded, our team will review within 1-2 business days.
                  </Text>
                </>
              )}
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <Button title="Close" variant="outline" onPress={() => setShowVerificationModal(false)} style={{ flex: 1 }} />
                <Button title={verificationStatus === 'pending' ? 'Upload Documents' : 'Go to Settings'} onPress={() => { setShowVerificationModal(false); navigation.navigate('Settings'); }} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </Modal>

        {/* State Picker Modal - uses jurisdictions */}
        <Modal visible={showStatePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select State</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <FlatList 
                data={getAvailableStates()} 
                keyExtractor={item => item} 
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.pickerItem} onPress={() => handleEventStateChange(item)}>
                    <Text style={styles.pickerItemText}>{item}</Text>
                    {newEvent.state === item && <Icons.Check size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.gray500, textAlign: 'center' }}>No states available. Please try refreshing the app.</Text>
                    <Text style={{ color: COLORS.gray400, fontSize: 12, marginTop: 8 }}>Jurisdictions loaded: {jurisdictions.length}</Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Event Type Picker Modal */}
        <Modal visible={showTypePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Type</Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <FlatList data={[{ value: 'food_event', label: 'Food Event' }, { value: 'farmers_market', label: 'Farmers Market' }, { value: 'festival', label: 'Festival' }, { value: 'fair', label: 'Fair' }, { value: 'craft_show', label: 'Craft Show' }, { value: 'night_market', label: 'Night Market' }, { value: 'other', label: 'Other' }]} keyExtractor={item => item.value} renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => { setNewEvent(f => ({ ...f, eventType: item.value })); setShowTypePicker(false); }}>
                  <Text style={styles.pickerItemText}>{item.label}</Text>
                  {newEvent.eventType === item.value && <Icons.Check size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )} />
            </View>
          </View>
        </Modal>

        {/* City Picker Modal */}
        <Modal visible={showCityPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select City</Text>
                <TouchableOpacity onPress={() => setShowCityPicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <FlatList data={getAvailableCities(newEvent.state)} keyExtractor={item => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => handleEventCityChange(item)}>
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {newEvent.city === item && <Icons.Check size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )} ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.gray500, textAlign: 'center' }}>No cities available for this state.</Text>
                  <TouchableOpacity onPress={() => { setShowCityPicker(false); setShowLocationRequestModal(true); }} style={{ marginTop: 12 }}>
                    <Text style={{ color: COLORS.primary, textDecorationLine: 'underline' }}>Request a new location</Text>
                  </TouchableOpacity>
                </View>
              } />
            </View>
          </View>
        </Modal>

        {/* Location Request Modal */}
        <Modal visible={showLocationRequestModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request New Location</Text>
                <TouchableOpacity onPress={() => setShowLocationRequestModal(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={{ color: COLORS.gray600, marginBottom: 16 }}>Can't find your event location? Request it to be added by our team.</Text>
                <Input label="City *" placeholder="Enter city name" value={locationRequest.city} onChangeText={v => setLocationRequest(l => ({ ...l, city: v }))} />
                <Input label="State *" placeholder="e.g., TX, CA, NY" value={locationRequest.state} onChangeText={v => setLocationRequest(l => ({ ...l, state: v.toUpperCase().slice(0, 2) }))} autoCapitalize="characters" maxLength={2} />
                <Input label="Reason (optional)" placeholder="Why do you need this location?" value={locationRequest.reason} onChangeText={v => setLocationRequest(l => ({ ...l, reason: v }))} multiline />
                <View style={styles.modalFooter}>
                  <Button title="Cancel" variant="outline" onPress={() => setShowLocationRequestModal(false)} style={{ flex: 1 }} />
                  <Button title="Submit Request" onPress={submitLocationRequest} loading={locationRequestSubmitting} disabled={!locationRequest.city || !locationRequest.state || locationRequest.state.length !== 2} style={{ flex: 1 }} />
                </View>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Proof Category Picker Modal */}
        <Modal visible={showProofCategoryPicker !== null} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Document Category</Text>
                <TouchableOpacity onPress={() => setShowProofCategoryPicker(null)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <FlatList 
                data={[
                  { value: 'venue_contract', label: 'Venue Contract' },
                  { value: 'event_permit', label: 'Event Permit' },
                  { value: 'city_approval', label: 'City Approval' },
                  { value: 'insurance', label: 'Insurance' },
                  { value: 'other', label: 'Other' }
                ]} 
                keyExtractor={item => item.value} 
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.pickerItem} 
                    onPress={() => {
                      if (showProofCategoryPicker !== null) {
                        const updated = [...eventProofFiles];
                        updated[showProofCategoryPicker].category = item.value;
                        setEventProofFiles(updated);
                      }
                      setShowProofCategoryPicker(null);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{item.label}</Text>
                    {showProofCategoryPicker !== null && eventProofFiles[showProofCategoryPicker]?.category === item.value && <Icons.Check size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                )} 
              />
            </View>
          </View>
        </Modal>
        
        {/* Edit Event Modal */}
        <Modal visible={showEditEventModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Event</Text>
                <TouchableOpacity onPress={() => { setShowEditEventModal(false); setEditingEvent(null); }}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              {editingEvent && (
                <ScrollView style={styles.modalBody}>
                  <Input label="Event Name *" value={editingEvent.eventName} onChangeText={v => setEditingEvent(e => ({ ...e, eventName: v }))} />
                  <Input label="Description" value={editingEvent.description} onChangeText={v => setEditingEvent(e => ({ ...e, description: v }))} multiline />
                  
                  <Text style={[styles.label, { fontWeight: '600', marginTop: 16 }]}>Date & Location</Text>
                  <Input label="Start Date *" placeholder="YYYY-MM-DD" value={editingEvent.startDate} onChangeText={v => setEditingEvent(e => ({ ...e, startDate: v }))} />
                  <Input label="End Date" placeholder="YYYY-MM-DD" value={editingEvent.endDate} onChangeText={v => setEditingEvent(e => ({ ...e, endDate: v }))} />
                  
                  <TouchableOpacity style={styles.pickerButton} onPress={() => toast.info('Please enter state abbreviation below')}>
                    <Text style={styles.label}>State *</Text>
                    <Text style={styles.pickerButtonText}>{editingEvent.state || 'Select State'}</Text>
                  </TouchableOpacity>
                  <Input placeholder="State (e.g., TX, CA)" value={editingEvent.state} onChangeText={v => handleEditEventStateChange(v.toUpperCase().slice(0, 2))} autoCapitalize="characters" maxLength={2} />
                  
                  <Input label="City *" value={editingEvent.city} onChangeText={v => setEditingEvent(e => ({ ...e, city: v }))} />
                  <Input label="Venue Address" value={editingEvent.address || ''} onChangeText={v => setEditingEvent(e => ({ ...e, address: v }))} />
                  
                  <Text style={[styles.label, { fontWeight: '600', marginTop: 16 }]}>Event Details</Text>
                  <Input label="Max Vendors" value={editingEvent.maxVendors} onChangeText={v => setEditingEvent(e => ({ ...e, maxVendors: v }))} keyboardType="numeric" />
                  
                  <Text style={[styles.label, { fontWeight: '600', marginTop: 16 }]}>Fees</Text>
                  <Input label="Application Fee ($)" value={String(editingEvent.feeStructure?.applicationFee || 0)} onChangeText={v => setEditingEvent(e => ({ ...e, feeStructure: { ...e.feeStructure, applicationFee: parseFloat(v) || 0 } }))} keyboardType="numeric" />
                  <Input label="Booth Fee ($)" value={String(editingEvent.feeStructure?.boothFee || 0)} onChangeText={v => setEditingEvent(e => ({ ...e, feeStructure: { ...e.feeStructure, boothFee: parseFloat(v) || 0 } }))} keyboardType="numeric" />
                  
                  {/* Required Permits Section */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.label, { fontWeight: '600' }]}>Required Permits</Text>
                    {!editingEvent.state ? (
                      <Text style={{ color: COLORS.gray400, fontStyle: 'italic' }}>Select a state to see available permits</Text>
                    ) : editPermitTypes.length > 0 ? (
                      editPermitTypes.map(pt => {
                        const isSelected = (editingEvent.requiredPermitTypes || []).includes(pt._id);
                        return (
                          <TouchableOpacity key={pt._id} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: isSelected ? '#eff6ff' : COLORS.white, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: isSelected ? COLORS.primary : COLORS.gray200 }} onPress={() => {
                            if (isSelected) {
                              setEditingEvent(e => ({ ...e, requiredPermitTypes: (e.requiredPermitTypes || []).filter(id => id !== pt._id) }));
                            } else {
                              setEditingEvent(e => ({ ...e, requiredPermitTypes: [...(e.requiredPermitTypes || []), pt._id] }));
                            }
                          }}>
                            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: isSelected ? COLORS.primary : COLORS.gray300, backgroundColor: isSelected ? COLORS.primary : COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                              {isSelected && <Icons.Check size={14} color={COLORS.white} />}
                            </View>
                            <Text style={{ flex: 1, color: COLORS.gray700 }}>{pt.name}</Text>
                            <Text style={{ color: COLORS.gray400, fontSize: 12 }}>{pt.jurisdictionId?.city || 'State-wide'}</Text>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <Text style={{ color: COLORS.gray400, fontStyle: 'italic' }}>No permits found for {editingEvent.state}</Text>
                    )}
                  </View>
                  
                  {/* Custom Requirements Section */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.label, { fontWeight: '600' }]}>Custom Requirements</Text>
                    {(editingEvent.customPermitRequirements || []).map((req, index) => (
                      <View key={index} style={{ padding: 12, backgroundColor: COLORS.gray50, borderRadius: 8, marginBottom: 12 }}>
                        <TextInput 
                          style={[styles.input, { marginBottom: 8 }]} 
                          placeholder="Requirement name" 
                          placeholderTextColor={COLORS.gray400}
                          value={req.name} 
                          onChangeText={v => {
                            const updated = [...(editingEvent.customPermitRequirements || [])];
                            updated[index] = { ...updated[index], name: v };
                            setEditingEvent(e => ({ ...e, customPermitRequirements: updated }));
                          }} 
                        />
                        <TextInput 
                          style={[styles.input, { marginBottom: 8 }]} 
                          placeholder="Description (optional)" 
                          placeholderTextColor={COLORS.gray400}
                          value={req.description || ''} 
                          onChangeText={v => {
                            const updated = [...(editingEvent.customPermitRequirements || [])];
                            updated[index] = { ...updated[index], description: v };
                            setEditingEvent(e => ({ ...e, customPermitRequirements: updated }));
                          }} 
                        />
                        <TouchableOpacity onPress={() => {
                          const updated = (editingEvent.customPermitRequirements || []).filter((_, i) => i !== index);
                          setEditingEvent(e => ({ ...e, customPermitRequirements: updated }));
                        }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icons.X size={16} color={COLORS.danger} />
                          <Text style={{ marginLeft: 4, color: COLORS.danger, fontSize: 14 }}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity 
                      onPress={() => setEditingEvent(e => ({ ...e, customPermitRequirements: [...(e.customPermitRequirements || []), { name: '', description: '', required: true }] }))} 
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 8, borderStyle: 'dashed' }}
                    >
                      <Icons.Plus size={18} color={COLORS.primary} />
                      <Text style={{ marginLeft: 8, color: COLORS.primary, fontWeight: '500' }}>Add Custom Requirement</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.modalFooter, { marginTop: 20 }]}>
                    <Button title="Cancel" variant="outline" onPress={() => { setShowEditEventModal(false); setEditingEvent(null); }} style={{ flex: 1 }} />
                    <Button title="Save Changes" onPress={saveEditedEvent} disabled={!editingEvent.eventName || !editingEvent.startDate || !editingEvent.city || !editingEvent.state} style={{ flex: 1 }} />
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============ VENDOR VIEW ============
  // Show upgrade modal for non-Elite users
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.upgradeModalContainer}>
          <View style={styles.upgradeModalIcon}>
            <Icons.Event size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.upgradeModalTitle}>Event Readiness</Text>
          <View style={[styles.upgradeModalBadge, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.upgradeModalBadgeText, { color: '#92400e' }]}>ELITE FEATURE</Text>
          </View>
          
          <Text style={styles.upgradeModalDescription}>
            See your permit compliance status for events you've been invited to participate in. Know instantly if you're ready or what's missing.
          </Text>
          
          <View style={styles.upgradeModalFeatures}>
            <Text style={styles.upgradeModalFeaturesTitle}>What you'll get:</Text>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Readiness Dashboard</Text>
                <Text style={styles.upgradeModalFeatureDesc}>See at a glance which events you're ready for and which need attention</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Apply to Events</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Browse and apply to events looking for vendors like you</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Missing Permit Alerts</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Know exactly which permits or documents you need for each event</Text>
              </View>
            </View>
            <View style={styles.upgradeModalFeatureRow}>
              <Icons.Check size={18} color={COLORS.success} />
              <View style={styles.upgradeModalFeatureContent}>
                <Text style={styles.upgradeModalFeatureTitle}>Organizer Integration</Text>
                <Text style={styles.upgradeModalFeatureDesc}>Event organizers using PermitWise can verify your compliance directly</Text>
              </View>
            </View>
          </View>

          <View style={styles.upgradeModalPricing}>
            <Text style={styles.upgradeModalPricingLabel}>Elite Plan</Text>
            <Text style={styles.upgradeModalPrice}>$99<Text style={styles.upgradeModalPriceUnit}>/month</Text></Text>
            <Text style={styles.upgradeModalPricingNote}>Includes everything in Pro + team accounts & priority support</Text>
          </View>

          <Button title="Upgrade to Elite" onPress={() => toast.info('Go to Settings > Subscription to upgrade your plan.')} style={styles.upgradeModalButton} />
          <Text style={styles.upgradeModalCancel}>14 days on us • Cancel anytime</Text>
          
          <View style={styles.requestEventSection}>
            <Text style={styles.requestEventText}>Know of an event that should be on PermitWise?</Text>
            <TouchableOpacity style={styles.requestEventButton} onPress={() => setShowRequestModal(true)}>
              <Text style={styles.requestEventButtonText}>Request an Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Event Request Modal */}
        <Modal visible={showRequestModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request an Event</Text>
                <TouchableOpacity onPress={() => setShowRequestModal(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              
              {requestSubmitted ? (
                <View style={styles.requestSuccess}>
                  <View style={styles.requestSuccessIcon}><Icons.Check size={32} color={COLORS.success} /></View>
                  <Text style={styles.requestSuccessTitle}>Request Submitted!</Text>
                  <Text style={styles.requestSuccessText}>We'll review your event request and add it to PermitWise soon.</Text>
                </View>
              ) : (
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.requestIntro}>Tell us about an event you'd like to see on PermitWise for permit compliance tracking.</Text>
                  <Input label="Event Name *" placeholder="Downtown Food Festival" value={requestForm.eventName} onChangeText={v => setRequestForm(f => ({ ...f, eventName: v }))} />
                  <Input label="Organizer Name" placeholder="City Events Department" value={requestForm.organizerName} onChangeText={v => setRequestForm(f => ({ ...f, organizerName: v }))} />
                  <View style={styles.row}>
                    <View style={styles.halfInput}><Input label="City *" placeholder="Austin" value={requestForm.city} onChangeText={v => setRequestForm(f => ({ ...f, city: v }))} /></View>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>State *</Text>
                      <TextInput style={styles.input} placeholder="TX" value={requestForm.state} onChangeText={v => setRequestForm(f => ({ ...f, state: v }))} />
                    </View>
                  </View>
                  <Input label="Additional Info" placeholder="Any other details..." value={requestForm.additionalInfo} onChangeText={v => setRequestForm(f => ({ ...f, additionalInfo: v }))} multiline />
                  <View style={styles.modalFooter}>
                    <Button title="Cancel" variant="outline" onPress={() => setShowRequestModal(false)} style={{ flex: 1 }} />
                    <Button title={requestSubmitting ? "Submitting..." : "Submit"} onPress={submitEventRequest} disabled={!requestForm.eventName || !requestForm.city || requestSubmitting} style={{ flex: 1 }} />
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const getReadinessColor = (color) => {
    if (color === 'success') return COLORS.success;
    if (color === 'danger') return COLORS.danger;
    if (color === 'warning') return COLORS.warning;
    return COLORS.gray500;
  };

  // Separate events by source
  const organizerInvitations = events.filter(e => e.eventSource === 'organizer_invitation' && e.status !== 'closed' && e.status !== 'cancelled');
  const participatingEvents = events.filter(e => (e.eventSource === 'admin_added' || e.eventSource === 'vendor_application') && e.status !== 'closed' && e.status !== 'cancelled');
  
  // Past events: closed, cancelled, or date has passed
  const pastVendorEvents = events.filter(e => {
    if (e.status === 'closed' || e.status === 'cancelled') return true;
    const eventDate = new Date(e.endDate || e.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  });
  
  // Available events to apply to (not already applied) - use both local and server flags
  const appliedEventIds = new Set([
    ...events.map(e => e._id?.toString?.() || e._id)
  ]);
  const availableEvents = publishedEvents.filter(e => {
    const eventIdStr = e._id?.toString?.() || e._id;
    // Filter out if: in my events list, already applied (server flag), or not published
    return !appliedEventIds.has(eventIdStr) && !e.vendorHasApplied && e.status === 'published';
  });

  // ====== ATTENDING EVENT FUNCTIONS ======
  const resetAttendingForm = () => {
    setAttendingForm({ eventName: '', organizerName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', venueName: '', eventType: 'other', notes: '', requiredPermits: [], complianceChecklist: [] });
    setAttendingCitySelection('');
    setAttendingSuggestedPermits([]);
    setNewPermitName('');
    setNewChecklistItem('');
    setEditingAttendingEvent(null);
    setSelectedExistingPermit(null);
  };

  const openAddAttendingModal = () => { resetAttendingForm(); setShowAddAttendingModal(true); };

  const handleAttendingCityChange = async (selection) => {
    setAttendingCitySelection(selection);
    setShowAttendingCityPicker(false);
    setAttendingSuggestedPermits([]);
    if (!selection || selection === '__custom__') {
      if (selection === '__custom__') setAttendingForm(f => ({ ...f, city: '', state: '' }));
      return;
    }
    const [city, state] = selection.split('||');
    setAttendingForm(f => ({ ...f, city, state }));
    const vendorType = business?.primaryVendorType;
    if (city && state && vendorType) {
      try {
        const data = await api.get(`/permit-types/required?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&vendorType=${encodeURIComponent(vendorType)}`);
        setAttendingSuggestedPermits(data.permitTypes || []);
      } catch (err) { console.error(err); }
    }
  };

  const addSuggestedPermitToForm = (pt) => {
    const alreadyAdded = attendingForm.requiredPermits.some(rp => rp.permitTypeId === pt._id);
    if (alreadyAdded) return;
    const vendorPermit = vendorPermitsList.find(vp => vp.permitTypeId?._id === pt._id);
    setAttendingForm(f => ({
      ...f,
      requiredPermits: [...f.requiredPermits, {
        name: pt.name,
        status: vendorPermit?.status === 'active' ? 'obtained' : vendorPermit?.status === 'in_progress' ? 'in_progress' : 'needed',
        permitTypeId: pt._id,
        vendorPermitId: vendorPermit?._id || undefined,
        notes: ''
      }]
    }));
  };
  
  const openEditAttendingModal = (ae) => {
    setEditingAttendingEvent(ae);
    const city = ae.location?.city || '';
    const state = ae.location?.state || '';
    const opCities = business?.operatingCities || [];
    const match = opCities.find(c => c.city.toLowerCase() === city.toLowerCase() && c.state === state);
    setAttendingCitySelection(match ? `${match.city}||${match.state}` : (city ? '__custom__' : ''));
    setAttendingForm({
      eventName: ae.eventName || '', organizerName: ae.organizerName || '', description: ae.description || '',
      startDate: ae.startDate ? new Date(ae.startDate).toISOString().split('T')[0] : '',
      endDate: ae.endDate ? new Date(ae.endDate).toISOString().split('T')[0] : '',
      city: ae.location?.city || '', state: ae.location?.state || '', address: ae.location?.address || '',
      venueName: ae.location?.venueName || '', eventType: ae.eventType || 'other', notes: ae.notes || '',
      requiredPermits: (ae.requiredPermits || []).map(p => ({
        name: p.name || '', status: p.status || 'needed', notes: p.notes || '',
        permitTypeId: p.permitTypeId || null, vendorPermitId: p.vendorPermitId || null, dueDate: p.dueDate || null
      })),
      complianceChecklist: (ae.complianceChecklist || []).map(c => ({
        item: c.item || '', completed: c.completed || false, notes: c.notes || ''
      }))
    });
    setSelectedExistingPermit(null);
    setShowAddAttendingModal(true);
  };

  const addExistingPermitToForm = (permit) => {
    if (!permit) return;
    const alreadyAdded = attendingForm.requiredPermits.some(rp => rp.vendorPermitId === permit._id);
    if (alreadyAdded) return;
    const permitName = permit.isCustom ? permit.customName : (permit.permitTypeId?.name || 'Unnamed Permit');
    setAttendingForm(f => ({
      ...f,
      requiredPermits: [...f.requiredPermits, {
        name: permitName,
        status: (permit.status === 'active') ? 'obtained' : (permit.status === 'in_progress') ? 'in_progress' : 'needed',
        permitTypeId: permit.permitTypeId?._id || undefined,
        vendorPermitId: permit._id,
        notes: ''
      }]
    }));
    setShowPermitPicker(false);
  };

  const addPermitToForm = () => {
    if (!newPermitName.trim()) return;
    setAttendingForm(f => ({ ...f, requiredPermits: [...f.requiredPermits, { name: newPermitName.trim(), status: 'needed', notes: '' }] }));
    setNewPermitName('');
  };

  const addChecklistItemToForm = () => {
    if (!newChecklistItem.trim()) return;
    setAttendingForm(f => ({ ...f, complianceChecklist: [...f.complianceChecklist, { item: newChecklistItem.trim(), completed: false }] }));
    setNewChecklistItem('');
  };

  const saveAttendingEvent = async () => {
    try {
      const payload = {
        eventName: attendingForm.eventName, organizerName: attendingForm.organizerName, description: attendingForm.description,
        location: { city: attendingForm.city, state: attendingForm.state, address: attendingForm.address, venueName: attendingForm.venueName },
        startDate: attendingForm.startDate, endDate: attendingForm.endDate || undefined,
        eventType: attendingForm.eventType, notes: attendingForm.notes,
        requiredPermits: attendingForm.requiredPermits.map(p => ({
          name: p.name, status: p.status || 'needed', notes: p.notes || '',
          permitTypeId: p.permitTypeId || undefined, vendorPermitId: p.vendorPermitId || undefined, dueDate: p.dueDate || undefined
        })),
        complianceChecklist: attendingForm.complianceChecklist.map(c => ({
          item: c.item, completed: c.completed || false, notes: c.notes || ''
        }))
      };
      if (editingAttendingEvent) {
        await api.put(`/attending-events/${editingAttendingEvent._id}`, payload);
        toast.success('Event updated');
      } else {
        await api.post('/attending-events', payload);
        toast.success('Event added to your tracker');
      }
      setShowAddAttendingModal(false);
      resetAttendingForm();
      fetchMyEvents();
    } catch (error) { toast.error(error.message || 'Failed to save event'); }
  };

  const deleteAttendingEvent = async (id) => {
    const ok = await confirm({ title: 'Delete Event', message: 'Delete this event from your tracker?', confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/attending-events/${id}`);
      toast.success('Event removed');
      setSelectedAttendingEvent(null);
      fetchMyEvents();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const updateAttendingPermitStatus = async (eventId, index, status) => {
    // Optimistic update — update UI immediately
    if (selectedAttendingEvent && selectedAttendingEvent._id === eventId) {
      setSelectedAttendingEvent(prev => {
        const updated = { ...prev, requiredPermits: prev.requiredPermits.map((p, i) => i === index ? { ...p, status } : p) };
        updated.completedPermits = updated.requiredPermits.filter(p => p.status === 'obtained' || p.status === 'not_applicable').length;
        return updated;
      });
    }
    try {
      await api.put(`/attending-events/${eventId}/permit/${index}`, { status });
      fetchMyEvents();
    } catch (error) { toast.error('Failed to update'); fetchMyEvents(); }
  };

  const updateAttendingChecklistItem = async (eventId, index, completed) => {
    // Optimistic update — update UI immediately
    if (selectedAttendingEvent && selectedAttendingEvent._id === eventId) {
      setSelectedAttendingEvent(prev => {
        const updated = { ...prev, complianceChecklist: prev.complianceChecklist.map((c, i) => i === index ? { ...c, completed } : c) };
        updated.completedChecklist = updated.complianceChecklist.filter(c => c.completed).length;
        return updated;
      });
    }
    try {
      await api.put(`/attending-events/${eventId}/checklist/${index}`, { completed });
      fetchMyEvents();
    } catch (error) { toast.error('Failed to update'); fetchMyEvents(); }
  };

  const upcomingAttendingEvents = attendingEvents.filter(ae => ae.status === 'upcoming' && new Date(ae.endDate || ae.startDate) >= new Date());
  const pastAttendingEvents = attendingEvents.filter(ae => ae.status !== 'upcoming' || new Date(ae.endDate || ae.startDate) < new Date());

  const PERMIT_STATUSES = [
    { value: 'needed', label: '❌ Needed' }, { value: 'in_progress', label: '🔄 In Progress' },
    { value: 'obtained', label: '✅ Obtained' }, { value: 'not_applicable', label: '➖ N/A' }
  ];

  const renderEventCard = (item) => (
    <Card key={item._id} style={styles.eventReadinessCard}>
      <View style={styles.eventReadinessHeader}>
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateMonth}>{new Date(item.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
          <Text style={styles.eventDateDay}>{new Date(item.startDate).getDate()}</Text>
        </View>
        <View style={styles.eventReadinessInfo}>
          <Text style={styles.eventReadinessName}>{item.eventName}</Text>
          <Text style={styles.eventReadinessOrganizer}>by {item.organizerName}</Text>
          <View style={styles.eventReadinessLocation}>
            <Icons.MapPin size={12} color={COLORS.gray500} />
            <Text style={styles.eventReadinessLocationText}>{item.location?.city}, {item.location?.state}</Text>
          </View>
        </View>
        <View style={[styles.readinessBadge, { backgroundColor: getReadinessColor(item.readinessColor) + '20' }]}>
          {item.readinessStatus === 'ready' ? (
            <Icons.Check size={16} color={getReadinessColor(item.readinessColor)} />
          ) : (
            <Icons.Alert size={16} color={getReadinessColor(item.readinessColor)} />
          )}
        </View>
      </View>
      
      {item.eventSource === 'organizer_invitation' && (
        <View style={[styles.eventSourceBadge, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.eventSourceBadgeText, { color: COLORS.primary }]}>📩 Organizer Invitation</Text>
        </View>
      )}
      
      <View style={styles.eventReadinessProgress}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${item.requiredPermitsCount > 0 ? (item.readyCount / item.requiredPermitsCount) * 100 : 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.readyCount}/{item.requiredPermitsCount} ready</Text>
      </View>
      
      {item.readinessStatus === 'ready' ? (
        <View style={styles.readinessSuccess}>
          <Icons.Check size={16} color={COLORS.success} />
          <Text style={styles.readinessSuccessText}>All permits ready</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.readinessIssues} onPress={() => setSelectedEvent(item)}>
          <Text style={styles.readinessIssueText} numberOfLines={1}>{item.readinessLabel}</Text>
          <Text style={styles.readinessViewDetails}>View Details →</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.eventCardActions}>
        <TouchableOpacity style={styles.eventCardActionBtn} onPress={() => setSelectedEvent(item)}>
          <Text style={styles.eventCardActionText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.eventCardActionBtn, styles.withdrawBtn]} onPress={() => setShowWithdrawModal(item)}>
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.pageHeader, { flexWrap: 'wrap', rowGap: 10 }]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.pageTitle}>Event Readiness</Text>
          <Text style={styles.pageSubtitle}>Your compliance status for events</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0 }}>
          <TouchableOpacity style={[styles.requestEventButtonSmall, { backgroundColor: COLORS.primary }]} onPress={openAddAttendingModal}>
            <Icons.Plus size={16} color="#fff" />
            <Text style={[styles.requestEventButtonSmallText, { color: '#fff' }]}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.requestEventButtonSmall} onPress={() => setShowRequestModal(true)}>
            <Icons.Plus size={16} color={COLORS.primary} />
            <Text style={styles.requestEventButtonSmallText}>Request</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyEvents(); }} />}
      >
        {/* Event Readiness Section - Self-tracked attending events */}
        <View style={[styles.eventSection, { backgroundColor: '#f5f7ff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0e7ff' }]}>
          <View style={styles.eventSectionHeader}>
            <Text style={styles.eventSectionTitle}>📋 Event Readiness</Text>
            <Text style={styles.eventSectionCount}>{upcomingAttendingEvents.length}</Text>
          </View>
          <Text style={styles.eventSectionDesc}>Events you're attending — track your permit readiness</Text>
          {upcomingAttendingEvents.length > 0 ? (
            upcomingAttendingEvents.map(ae => (
              <Card key={ae._id} style={[styles.eventReadinessCard, { borderLeftWidth: 4, borderLeftColor: ae.readinessColor === 'success' ? COLORS.success : ae.readinessColor === 'warning' ? COLORS.warning : COLORS.danger }]}>
                <View style={styles.eventReadinessHeader}>
                  <View style={[styles.eventDateBadge, { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.eventDateMonth, { color: '#fff' }]}>{new Date(ae.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    <Text style={[styles.eventDateDay, { color: '#fff' }]}>{new Date(ae.startDate).getDate()}</Text>
                  </View>
                  <View style={styles.eventReadinessInfo}>
                    <Text style={styles.eventReadinessName}>{ae.eventName}</Text>
                    {ae.organizerName ? <Text style={styles.eventReadinessOrganizer}>by {ae.organizerName}</Text> : null}
                    {ae.location?.city ? (
                      <View style={styles.eventReadinessLocation}>
                        <Icons.MapPin size={12} color={COLORS.gray500} />
                        <Text style={styles.eventReadinessLocationText}>{ae.location.city}{ae.location.state ? `, ${ae.location.state}` : ''}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.invitationStatusBadge, { backgroundColor: ae.readinessColor === 'success' ? '#dcfce7' : ae.readinessColor === 'warning' ? '#fef3c7' : '#fee2e2' }]}>
                    <Text style={[styles.invitationStatusText, { color: ae.readinessColor === 'success' ? '#166534' : ae.readinessColor === 'warning' ? '#92400e' : '#dc2626' }]}>
                      {ae.readinessStatus === 'ready' ? 'Ready' : ae.readinessStatus === 'no_requirements' ? 'No Items' : ae.readinessStatus === 'permits_needed' ? 'Needed' : 'In Progress'}
                    </Text>
                  </View>
                </View>
                {ae.totalItems > 0 && (
                  <View style={styles.eventReadinessProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${(ae.completedItems / ae.totalItems) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{ae.completedItems}/{ae.totalItems} items</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingHorizontal: 16, paddingBottom: 16 }}>
                  <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primary }} onPress={() => setSelectedAttendingEvent(ae)}>
                    <Icons.Eye size={14} color="#fff" />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, backgroundColor: COLORS.white }} onPress={() => openEditAttendingModal(ae)}>
                    <Icons.Edit size={14} color={COLORS.gray700} />
                    <Text style={{ fontSize: 13, fontWeight: '500', color: COLORS.gray700 }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2' }} onPress={() => deleteAttendingEvent(ae._id)}>
                    <Icons.Trash size={14} color={COLORS.danger} />
                    <Text style={{ fontSize: 13, fontWeight: '500', color: COLORS.danger }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.sectionEmpty}>
              <Text style={styles.sectionEmptyText}>No upcoming events tracked. Tap "Add Event" to track an event you'll attend.</Text>
            </View>
          )}
        </View>
        {/* Organizer Invitations Section - Always show */}
        <View style={styles.eventSection}>
          <View style={styles.eventSectionHeader}>
            <Text style={styles.eventSectionTitle}>📩 Organizer Invitations</Text>
            <Text style={styles.eventSectionCount}>{organizerInvitations.length}</Text>
          </View>
          <Text style={styles.eventSectionDesc}>Events you've been personally invited to</Text>
          {organizerInvitations.length > 0 ? (
            organizerInvitations.map(item => (
              <Card key={item._id} style={[styles.eventReadinessCard, item.invitationStatus === 'invited' && styles.pendingInvitationCard]}>
                <View style={styles.eventReadinessHeader}>
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateMonth}>{new Date(item.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    <Text style={styles.eventDateDay}>{new Date(item.startDate).getDate()}</Text>
                  </View>
                  <View style={styles.eventReadinessInfo}>
                    <Text style={styles.eventReadinessName}>{item.eventName}</Text>
                    <Text style={styles.eventReadinessOrganizer}>by {item.organizerName}</Text>
                    <View style={styles.eventReadinessLocation}>
                      <Icons.MapPin size={12} color={COLORS.gray500} />
                      <Text style={styles.eventReadinessLocationText}>{item.location?.city}, {item.location?.state}</Text>
                    </View>
                  </View>
                  <View style={[styles.invitationStatusBadge, { backgroundColor: item.invitationStatus === 'invited' ? '#fef3c7' : item.invitationStatus === 'accepted' ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.invitationStatusText, { color: item.invitationStatus === 'invited' ? '#92400e' : item.invitationStatus === 'accepted' ? '#166534' : '#dc2626' }]}>
                      {item.invitationStatus === 'invited' ? 'Pending' : item.invitationStatus === 'accepted' ? 'Accepted' : 'Declined'}
                    </Text>
                  </View>
                </View>
                
                {item.invitationStatus === 'invited' && (
                  <View style={styles.invitationActions}>
                    <Text style={styles.invitationPrompt}>You've been invited to participate!</Text>
                    <View style={styles.invitationButtons}>
                      <TouchableOpacity style={styles.acceptButton} onPress={() => respondToInvitation(item._id, true)}>
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineButton} onPress={() => respondToInvitation(item._id, false)}>
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.viewDetailsButton} onPress={() => setSelectedEvent(item)}>
                        <Text style={styles.viewDetailsButtonText}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {item.invitationStatus === 'accepted' && (
                  <>
                    <View style={styles.eventReadinessProgress}>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${item.requiredPermitsCount > 0 ? (item.readyCount / item.requiredPermitsCount) * 100 : 100}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{item.readyCount}/{item.requiredPermitsCount} ready</Text>
                    </View>
                    {item.readinessStatus === 'ready' ? (
                      <View style={styles.readinessSuccess}>
                        <Icons.Check size={16} color={COLORS.success} />
                        <Text style={styles.readinessSuccessText}>All permits ready</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.readinessIssues} onPress={() => setSelectedEvent(item)}>
                        <Text style={styles.readinessIssueText} numberOfLines={1}>{item.readinessLabel}</Text>
                        <Text style={styles.readinessViewDetails}>View Details →</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </Card>
            ))
          ) : (
            <View style={styles.sectionEmpty}>
              <Text style={styles.sectionEmptyText}>No invitations yet. When organizers invite you, they'll appear here.</Text>
            </View>
          )}
        </View>
        
        {/* Browse Events Section - Always show */}
        <View style={styles.eventSection}>
          <View style={styles.eventSectionHeader}>
            <Text style={styles.eventSectionTitle}>🔍 Browse Events</Text>
            <Text style={styles.eventSectionCount}>{availableEvents.length}</Text>
          </View>
          <Text style={styles.eventSectionDesc}>Open events accepting vendor applications</Text>
          {availableEvents.length > 0 ? (
            availableEvents.map(event => (
              <Card key={event._id} style={styles.browseEventCard}>
                <View style={styles.browseEventHeader}>
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateMonth}>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    <Text style={styles.eventDateDay}>{new Date(event.startDate).getDate()}</Text>
                  </View>
                  <View style={styles.browseEventInfo}>
                    <Text style={styles.browseEventName}>{event.eventName}</Text>
                    <View style={styles.eventReadinessLocation}>
                      <Icons.MapPin size={12} color={COLORS.gray500} />
                      <Text style={styles.eventReadinessLocationText}>{event.location?.city}, {event.location?.state}</Text>
                    </View>
                    <Text style={styles.browseEventOrganizer}>By {event.organizerName}</Text>
                  </View>
                </View>
                <Button title="Apply" size="sm" onPress={() => setShowApplyModal(event)} style={{ marginTop: 12 }} />
              </Card>
            ))
          ) : (
            <View style={styles.sectionEmpty}>
              <Text style={styles.sectionEmptyText}>No events currently accepting applications. Check back soon!</Text>
            </View>
          )}
        </View>
        
        {/* Participating Events Section - Always show */}
        <View style={styles.eventSection}>
          <View style={styles.eventSectionHeader}>
            <Text style={styles.eventSectionTitle}>🎪 Your Participating Events</Text>
            <Text style={styles.eventSectionCount}>{participatingEvents.length}</Text>
          </View>
          <Text style={styles.eventSectionDesc}>Events you've applied to or routine events</Text>
          {participatingEvents.length > 0 ? (
            participatingEvents.map(renderEventCard)
          ) : (
            <View style={styles.sectionEmpty}>
              <Text style={styles.sectionEmptyText}>No participating events yet. Apply to events above!</Text>
            </View>
          )}
        </View>
        
        {/* Past Events Section */}
        {pastVendorEvents.length > 0 && (
          <View style={[styles.eventSection, { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: 16 }]}>
            <View style={styles.eventSectionHeader}>
              <Text style={[styles.eventSectionTitle, { color: COLORS.gray500 }]}>📜 Past Events</Text>
              <Text style={styles.eventSectionCount}>{pastVendorEvents.length}</Text>
            </View>
            <Text style={styles.eventSectionDesc}>Completed, closed, or cancelled events</Text>
            {pastVendorEvents.map(event => (
              <Card key={event._id} style={[styles.eventReadinessCard, { opacity: 0.8, backgroundColor: COLORS.gray50 }]}>
                <View style={styles.eventReadinessHeader}>
                  <View style={[styles.eventDateBadge, { backgroundColor: COLORS.gray200 }]}>
                    <Text style={[styles.eventDateMonth, { color: COLORS.gray600 }]}>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    <Text style={[styles.eventDateDay, { color: COLORS.gray600 }]}>{new Date(event.startDate).getDate()}</Text>
                  </View>
                  <View style={styles.eventReadinessInfo}>
                    <Text style={styles.eventReadinessName}>{event.eventName}</Text>
                    <Text style={styles.eventReadinessOrganizer}>by {event.organizerName}</Text>
                    <View style={styles.eventReadinessLocation}>
                      <Icons.MapPin size={12} color={COLORS.gray500} />
                      <Text style={styles.eventReadinessLocationText}>{event.location?.city}, {event.location?.state}</Text>
                    </View>
                    {event.status === 'cancelled' && (
                      <View style={{ marginTop: 8 }}>
                        <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' }}>
                          <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '600' }}>Cancelled</Text>
                        </View>
                        {event.cancellationReason && (
                          <Text style={{ fontSize: 12, color: COLORS.gray600, fontStyle: 'italic', marginTop: 4 }}>Reason: {event.cancellationReason}</Text>
                        )}
                      </View>
                    )}
                    {event.status === 'closed' && (
                      <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8 }}>
                        <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '600' }}>Closed</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
        
        {/* Past Attending Events Section */}
        {pastAttendingEvents.length > 0 && (
          <View style={[styles.eventSection, { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: 16 }]}>
            <View style={styles.eventSectionHeader}>
              <Text style={[styles.eventSectionTitle, { color: COLORS.gray500 }]}>📋 Past Tracked Events</Text>
              <Text style={styles.eventSectionCount}>{pastAttendingEvents.length}</Text>
            </View>
            <Text style={styles.eventSectionDesc}>Attending events that have ended or been completed</Text>
            {pastAttendingEvents.map(ae => (
              <Card key={ae._id} style={[styles.eventReadinessCard, { opacity: 0.8, backgroundColor: COLORS.gray50, borderLeftWidth: 4, borderLeftColor: COLORS.gray300 }]}>
                <View style={styles.eventReadinessHeader}>
                  <View style={[styles.eventDateBadge, { backgroundColor: COLORS.gray200 }]}>
                    <Text style={[styles.eventDateMonth, { color: COLORS.gray600 }]}>{new Date(ae.startDate).toLocaleDateString('en-US', { month: 'short' })}</Text>
                    <Text style={[styles.eventDateDay, { color: COLORS.gray600 }]}>{new Date(ae.startDate).getDate()}</Text>
                  </View>
                  <View style={styles.eventReadinessInfo}>
                    <Text style={styles.eventReadinessName}>{ae.eventName}</Text>
                    {ae.organizerName ? <Text style={styles.eventReadinessOrganizer}>by {ae.organizerName}</Text> : null}
                    {ae.location?.city ? (
                      <View style={styles.eventReadinessLocation}>
                        <Icons.MapPin size={12} color={COLORS.gray500} />
                        <Text style={styles.eventReadinessLocationText}>{ae.location.city}{ae.location.state ? `, ${ae.location.state}` : ''}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.invitationStatusBadge, { backgroundColor: ae.readinessStatus === 'ready' ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={[styles.invitationStatusText, { color: ae.readinessStatus === 'ready' ? '#166534' : '#92400e' }]}>
                      {ae.completedItems}/{ae.totalItems} done
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity style={[styles.eventCardActionBtn, { flex: 1 }]} onPress={() => setSelectedAttendingEvent(ae)}>
                    <Text style={styles.eventCardActionBtnText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.eventCardActionBtn, { paddingHorizontal: 12 }]} onPress={() => deleteAttendingEvent(ae._id)}>
                    <Icons.Trash size={14} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Apply to Event Modal */}
      <Modal visible={!!showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply to Event</Text>
              <TouchableOpacity onPress={() => { setShowApplyModal(null); setApplicationNotes(''); }}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.applyEventName}>{showApplyModal?.eventName}</Text>
              <View style={styles.applyEventMeta}>
                <Text style={styles.applyEventMetaText}>📅 {showApplyModal && formatDate(showApplyModal.startDate)}</Text>
                <Text style={styles.applyEventMetaText}>📍 {showApplyModal?.location?.city}, {showApplyModal?.location?.state}</Text>
              </View>
              <Input 
                label="Application Notes (optional)" 
                placeholder="Tell the organizer about your business..." 
                value={applicationNotes} 
                onChangeText={setApplicationNotes} 
                multiline 
              />
              <View style={styles.modalFooter}>
                <Button title="Cancel" variant="outline" onPress={() => { setShowApplyModal(null); setApplicationNotes(''); }} style={{ flex: 1 }} />
                <Button title={applyingToEvent ? "Applying..." : "Submit Application"} onPress={applyToEvent} disabled={applyingToEvent} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Withdraw from Event Modal */}
      <Modal visible={!!showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw from Event</Text>
              <TouchableOpacity onPress={() => { setShowWithdrawModal(null); setWithdrawReason(''); }}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <Icons.Alert size={24} color={COLORS.danger} />
                <Text style={{ flex: 1, color: '#991b1b' }}>You are about to withdraw from <Text style={{ fontWeight: '600' }}>{showWithdrawModal?.eventName}</Text>. The organizer will be notified.</Text>
              </View>
              <View style={{ backgroundColor: COLORS.gray50, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: COLORS.gray600 }}>📅 {showWithdrawModal && formatDate(showWithdrawModal.startDate)}</Text>
                <Text style={{ color: COLORS.gray600 }}>📍 {showWithdrawModal?.location?.city}, {showWithdrawModal?.location?.state}</Text>
              </View>
              <Input 
                label="Reason for withdrawal (optional)" 
                placeholder="e.g., Schedule conflict, unable to attend..." 
                value={withdrawReason} 
                onChangeText={setWithdrawReason} 
                multiline 
              />
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 4 }}>This note will be sent to the event organizer.</Text>
              <View style={[styles.modalFooter, { marginTop: 20 }]}>
                <Button title="Cancel" variant="outline" onPress={() => { setShowWithdrawModal(null); setWithdrawReason(''); }} style={{ flex: 1 }} />
                <Button title={withdrawing ? "Withdrawing..." : "Withdraw"} onPress={withdrawFromEvent} disabled={withdrawing} style={{ flex: 1, backgroundColor: COLORS.danger }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Cancel Event Modal - for organizers */}
      <Modal visible={!!showCancelModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Event</Text>
              <TouchableOpacity onPress={() => { setShowCancelModal(null); setCancelReason(''); }}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <Icons.Alert size={24} color={COLORS.danger} />
                <Text style={{ flex: 1, color: '#991b1b' }}>You are about to cancel <Text style={{ fontWeight: '600' }}>{showCancelModal?.eventName}</Text>. All vendors will be notified.</Text>
              </View>
              <View style={{ backgroundColor: COLORS.gray50, padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: COLORS.gray600 }}>📅 {showCancelModal && formatDate(showCancelModal.startDate)}</Text>
                <Text style={{ color: COLORS.gray600 }}>📍 {showCancelModal?.location?.city}, {showCancelModal?.location?.state}</Text>
              </View>
              <Input 
                label="Reason for cancellation (required)" 
                placeholder="e.g., Venue unavailable, weather conditions..." 
                value={cancelReason} 
                onChangeText={setCancelReason} 
                multiline 
              />
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 4 }}>This reason will be shared with all vendors who applied or were invited.</Text>
              <View style={[styles.modalFooter, { marginTop: 20 }]}>
                <Button title="Go Back" variant="outline" onPress={() => { setShowCancelModal(null); setCancelReason(''); }} style={{ flex: 1 }} />
                <Button title="Cancel Event" onPress={executeCancelEvent} disabled={!cancelReason.trim()} style={{ flex: 1, backgroundColor: COLORS.danger }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Event Details Modal - Enhanced */}
      <Modal visible={!!selectedEvent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEvent?.eventName}</Text>
              <TouchableOpacity onPress={() => setSelectedEvent(null)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Event Info Section */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Event Information</Text>
                <View style={styles.eventDetailSummary}>
                  <Text style={styles.eventDetailText}><Text style={styles.eventDetailLabel}>Date:</Text> {selectedEvent && formatDate(selectedEvent.startDate)}</Text>
                  <Text style={styles.eventDetailText}><Text style={styles.eventDetailLabel}>Location:</Text> {selectedEvent?.location?.city}, {selectedEvent?.location?.state}</Text>
                  <Text style={styles.eventDetailText}><Text style={styles.eventDetailLabel}>Organizer:</Text> {selectedEvent?.organizerName}</Text>
                  {selectedEvent?.description && (
                    <Text style={styles.eventDetailText}><Text style={styles.eventDetailLabel}>Description:</Text> {selectedEvent.description}</Text>
                  )}
                </View>
              </View>
              
              {/* Invitation Actions for Pending */}
              {selectedEvent?.eventSource === 'organizer_invitation' && selectedEvent?.invitationStatus === 'invited' && (
                <View style={[styles.detailSection, styles.invitationBanner]}>
                  <View style={styles.invitationBannerContent}>
                    <Icons.Bell size={24} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invitationBannerTitle}>You've Been Invited!</Text>
                      <Text style={styles.invitationBannerText}>The organizer has personally invited you to participate.</Text>
                    </View>
                  </View>
                  <View style={styles.invitationResponseButtons}>
                    <Button title="Accept Invitation" onPress={() => { respondToInvitation(selectedEvent._id, true); setSelectedEvent(null); }} style={{ flex: 1 }} />
                    <Button title="Decline" variant="outline" onPress={() => { respondToInvitation(selectedEvent._id, false); setSelectedEvent(null); }} style={{ flex: 1 }} />
                  </View>
                </View>
              )}
              
              {/* Required Permits Section */}
              {selectedEvent?.requiredPermitTypes && selectedEvent.requiredPermitTypes.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Required Permits ({selectedEvent.requiredPermitTypes.length})</Text>
                  {selectedEvent.requiredPermitTypes.map((pt, i) => (
                    <View key={i} style={styles.requiredPermitItem}>
                      <Icons.Document size={16} color={COLORS.gray400} />
                      <Text style={styles.requiredPermitText}>{typeof pt === 'object' ? pt.name : pt}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Compliance Status - Only show if accepted or not an invitation */}
              {(selectedEvent?.invitationStatus === 'accepted' || selectedEvent?.eventSource !== 'organizer_invitation' || !selectedEvent?.invitationStatus) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Your Compliance Status</Text>
                  <View style={styles.complianceOverview}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${selectedEvent?.requiredPermitsCount > 0 ? (selectedEvent.readyCount / selectedEvent.requiredPermitsCount) * 100 : 100}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{selectedEvent?.readyCount} of {selectedEvent?.requiredPermitsCount} permits ready</Text>
                  </View>
                  
                  {selectedEvent?.issues?.length > 0 ? (
                    <View style={styles.issuesList}>
                      <Text style={styles.issuesIntro}>Issues to resolve:</Text>
                      {selectedEvent.issues.map((issue, i) => {
                        const matchingPermit = issue.vendorPermitId ? vendorPermitsList.find(p => p._id === issue.vendorPermitId) : null;
                        const Wrapper = matchingPermit ? TouchableOpacity : View;
                        const wrapperProps = matchingPermit ? {
                          onPress: () => {
                            setSelectedEvent(null);
                            navigation.navigate('Permits', { screen: 'PermitDetail', params: { permit: matchingPermit } });
                          }
                        } : {};
                        return (
                          <Wrapper key={i} style={[styles.issueItem, { borderLeftColor: issue.type === 'missing' || issue.type === 'expired' ? COLORS.danger : COLORS.warning }]} {...wrapperProps}>
                            {issue.type === 'missing' && <Text style={styles.issueItemText}>🚫 <Text style={styles.issueBold}>{issue.permit}</Text> - Permit not found</Text>}
                            {issue.type === 'expired' && <Text style={styles.issueItemText}>⏰ <Text style={styles.issueBold}>{issue.permit}</Text> - Expired</Text>}
                            {issue.type === 'missing_document' && <Text style={styles.issueItemText}>📄 <Text style={styles.issueBold}>{issue.permit}</Text> - Document missing</Text>}
                            {issue.type === 'in_progress' && <Text style={styles.issueItemText}>⏳ <Text style={styles.issueBold}>{issue.permit}</Text> - In progress</Text>}
                            {matchingPermit && <Text style={{ fontSize: 11, color: COLORS.primary, marginTop: 4 }}>Tap to view permit →</Text>}
                          </Wrapper>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.allGood}>
                      <Icons.Check size={20} color={COLORS.success} />
                      <Text style={styles.allGoodText}>All requirements met! You're ready for this event.</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button title="Close" onPress={() => setSelectedEvent(null)} variant="outline" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Event Request Modal */}
      <Modal visible={showRequestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request an Event</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            
            {requestSubmitted ? (
              <View style={styles.requestSuccess}>
                <View style={styles.requestSuccessIcon}><Icons.Check size={32} color={COLORS.success} /></View>
                <Text style={styles.requestSuccessTitle}>Request Submitted!</Text>
                <Text style={styles.requestSuccessText}>We'll review your event request and add it to PermitWise soon.</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.requestIntro}>Tell us about an event you'd like to see on PermitWise.</Text>
                <Input label="Event Name *" placeholder="Downtown Food Festival" value={requestForm.eventName} onChangeText={v => setRequestForm(f => ({ ...f, eventName: v }))} />
                <Input label="Organizer Name" placeholder="City Events Department" value={requestForm.organizerName} onChangeText={v => setRequestForm(f => ({ ...f, organizerName: v }))} />
                <View style={styles.row}>
                  <View style={styles.halfInput}><Input label="City *" placeholder="Austin" value={requestForm.city} onChangeText={v => setRequestForm(f => ({ ...f, city: v }))} /></View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>State</Text>
                    <TextInput style={styles.input} placeholder="TX" value={requestForm.state} onChangeText={v => setRequestForm(f => ({ ...f, state: v }))} />
                  </View>
                </View>
                <Input label="Additional Info" placeholder="Any other details..." value={requestForm.additionalInfo} onChangeText={v => setRequestForm(f => ({ ...f, additionalInfo: v }))} multiline />
                <View style={styles.modalFooter}>
                  <Button title="Cancel" variant="outline" onPress={() => setShowRequestModal(false)} style={{ flex: 1 }} />
                  <Button title={requestSubmitting ? "Submitting..." : "Submit"} onPress={submitEventRequest} disabled={!requestForm.eventName || !requestForm.city || requestSubmitting} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Add/Edit Attending Event Modal */}
      <Modal visible={showAddAttendingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAttendingEvent ? 'Edit Attending Event' : 'Add Attending Event'}</Text>
              <TouchableOpacity onPress={() => { setShowAddAttendingModal(false); resetAttendingForm(); }}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.requestIntro, { marginBottom: 12 }]}>Track an event you plan to attend and monitor your compliance readiness.</Text>
              <Input label="Event Name *" placeholder="Downtown Food Festival" value={attendingForm.eventName} onChangeText={v => setAttendingForm(f => ({ ...f, eventName: v }))} />
              <Input label="Organizer Name" placeholder="City Events Dept" value={attendingForm.organizerName} onChangeText={v => setAttendingForm(f => ({ ...f, organizerName: v }))} />
              <Input label="Venue Name" placeholder="Main Street Plaza" value={attendingForm.venueName} onChangeText={v => setAttendingForm(f => ({ ...f, venueName: v }))} />
              
              <Text style={styles.label}>City / State</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAttendingCityPicker(true)}>
                <Text style={attendingCitySelection ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                  {attendingCitySelection === '__custom__' ? 'Custom City' : attendingCitySelection ? attendingCitySelection.replace('||', ', ') : 'Select a city'}
                </Text>
                <Icons.ChevronDown size={20} color={COLORS.gray500} />
              </TouchableOpacity>
              <Modal visible={showAttendingCityPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { maxHeight: '60%' }]}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select City</Text>
                      <TouchableOpacity onPress={() => setShowAttendingCityPicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                      {(business?.operatingCities || []).map((c, idx) => (
                        <TouchableOpacity key={idx} style={styles.pickerItem} onPress={() => handleAttendingCityChange(`${c.city}||${c.state}`)}>
                          <Text style={styles.pickerItemText}>{c.city}, {c.state}{c.isPrimary ? ' (Primary)' : ''}</Text>
                          {attendingCitySelection === `${c.city}||${c.state}` && <Icons.Check size={20} color={COLORS.primary} />}
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.pickerItem, { borderTopWidth: 1, borderTopColor: COLORS.gray200 }]} onPress={() => handleAttendingCityChange('__custom__')}>
                        <Text style={[styles.pickerItemText, { color: COLORS.primary }]}>— Enter custom city —</Text>
                        {attendingCitySelection === '__custom__' && <Icons.Check size={20} color={COLORS.primary} />}
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
              
              {attendingCitySelection === '__custom__' && (
                <>
                  <View style={styles.row}>
                    <View style={styles.halfInput}><Input label="City" placeholder="Austin" value={attendingForm.city} onChangeText={v => setAttendingForm(f => ({ ...f, city: v }))} /></View>
                    <View style={styles.halfInput}>
                      <Text style={styles.label}>State</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAttendingStatePicker(true)}>
                        <Text style={attendingForm.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{attendingForm.state || 'Select'}</Text>
                        <Icons.ChevronDown size={20} color={COLORS.gray500} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <PickerModal visible={showAttendingStatePicker} onClose={() => setShowAttendingStatePicker(false)} title="Select State" options={US_STATES.map(s => ({ value: s, label: s }))} value={attendingForm.state} onSelect={v => { setAttendingForm(f => ({ ...f, state: v })); setShowAttendingStatePicker(false); }} />
                  <View style={{ backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <Text style={{ color: '#1e40af', fontSize: 13 }}>💡 Add this city to your Operating Cities in Settings to get permit suggestions and tracking.</Text>
                  </View>
                </>
              )}
              
              {attendingSuggestedPermits.length > 0 && (
                <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#166534', marginBottom: 8 }}>Permits required in this city:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {attendingSuggestedPermits.map(pt => {
                      const alreadyAdded = attendingForm.requiredPermits.some(rp => rp.permitTypeId === pt._id);
                      return (
                        <TouchableOpacity key={pt._id} disabled={alreadyAdded} onPress={() => addSuggestedPermitToForm(pt)}
                          style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: alreadyAdded ? '#d1d5db' : '#10b981', backgroundColor: alreadyAdded ? '#f3f4f6' : '#ecfdf5' }}>
                          <Text style={{ fontSize: 13, color: alreadyAdded ? '#9ca3af' : '#065f46' }}>{alreadyAdded ? '✓ ' : '+ '}{pt.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              
              <Input label="Address" placeholder="123 Main St" value={attendingForm.address} onChangeText={v => setAttendingForm(f => ({ ...f, address: v }))} />
              <View style={styles.row}>
                <View style={styles.halfInput}><DateInput label="Start Date *" required value={attendingForm.startDate} onChangeText={v => setAttendingForm(f => ({ ...f, startDate: v }))} /></View>
                <View style={styles.halfInput}><DateInput label="End Date" value={attendingForm.endDate} onChangeText={v => setAttendingForm(f => ({ ...f, endDate: v }))} /></View>
              </View>
              <Input label="Notes" placeholder="Any notes about this event..." value={attendingForm.notes} onChangeText={v => setAttendingForm(f => ({ ...f, notes: v }))} multiline />
              
              <Text style={styles.label}>Event Type</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowAttendingTypePicker(true)}>
                <Text style={styles.pickerButtonText}>{({ food_event: 'Food Event', farmers_market: 'Farmers Market', festival: 'Festival', fair: 'Fair', craft_show: 'Craft Show', night_market: 'Night Market', other: 'Other' })[attendingForm.eventType] || 'Select Type'}</Text>
                <Icons.ChevronDown size={20} color={COLORS.gray500} />
              </TouchableOpacity>
              <Modal visible={showAttendingTypePicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { maxHeight: '50%' }]}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Event Type</Text>
                      <TouchableOpacity onPress={() => setShowAttendingTypePicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
                    </View>
                    <FlatList data={[{ value: 'food_event', label: 'Food Event' }, { value: 'farmers_market', label: 'Farmers Market' }, { value: 'festival', label: 'Festival' }, { value: 'fair', label: 'Fair' }, { value: 'craft_show', label: 'Craft Show' }, { value: 'night_market', label: 'Night Market' }, { value: 'other', label: 'Other' }]} keyExtractor={item => item.value} renderItem={({ item }) => (
                      <TouchableOpacity style={styles.pickerItem} onPress={() => { setAttendingForm(f => ({ ...f, eventType: item.value })); setShowAttendingTypePicker(false); }}>
                        <Text style={styles.pickerItemText}>{item.label}</Text>
                        {attendingForm.eventType === item.value && <Icons.Check size={20} color={COLORS.primary} />}
                      </TouchableOpacity>
                    )} />
                  </View>
                </View>
              </Modal>
              
              <Text style={{ fontWeight: '600', fontSize: 15, marginTop: 16, marginBottom: 4 }}>Required Permits</Text>
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 8 }}>Select from your existing permits or add custom ones</Text>
              {attendingForm.requiredPermits.map((p, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, padding: 10, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ flex: 1, fontSize: 14 }}>{p.name} {p.vendorPermitId ? <Text style={{ color: COLORS.gray500, fontSize: 12 }}>(linked)</Text> : null}</Text>
                  <TouchableOpacity onPress={() => setAttendingForm(f => ({ ...f, requiredPermits: f.requiredPermits.filter((_, idx) => idx !== i) }))}>
                    <Text style={{ color: COLORS.danger, fontSize: 18, fontWeight: '600' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {vendorPermitsList.filter(p => (p.permitTypeId?.name || p.isCustom) && !attendingForm.requiredPermits.some(rp => rp.vendorPermitId === p._id)).length > 0 && (
                <>
                  <TouchableOpacity onPress={() => setShowPermitPicker(true)} style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, borderStyle: 'dashed', alignItems: 'center', marginBottom: 8, backgroundColor: '#f9fafb' }}>
                    <Text style={{ color: COLORS.primary, fontWeight: '500' }}>📋 Select from Your Permits</Text>
                  </TouchableOpacity>
                  <Modal visible={showPermitPicker} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                      <View style={[styles.modalContent, { maxHeight: '70%' }]}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>Select a Permit</Text>
                          <TouchableOpacity onPress={() => setShowPermitPicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                          {vendorPermitsList.filter(p => (p.permitTypeId?.name || p.isCustom) && !attendingForm.requiredPermits.some(rp => rp.vendorPermitId === p._id)).map(p => (
                            <TouchableOpacity key={p._id} onPress={() => addExistingPermitToForm(p)} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 }}>
                              <Text style={{ fontWeight: '500', fontSize: 15 }}>{p.isCustom ? p.customName : p.permitTypeId?.name}</Text>
                              <Text style={{ fontSize: 13, color: COLORS.gray500, marginTop: 2 }}>{p.isCustom ? `${p.customCity || 'Custom'}` : `${p.jurisdictionId?.city || 'Unknown city'}`} — {p.status}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                </>
              )}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}><Input placeholder="Or type custom permit name..." value={newPermitName} onChangeText={setNewPermitName} /></View>
                <Button title="Add" variant="outline" size="sm" onPress={addPermitToForm} disabled={!newPermitName.trim()} />
              </View>
              
              <Text style={{ fontWeight: '600', fontSize: 15, marginTop: 16, marginBottom: 4 }}>Compliance Checklist</Text>
              <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 8 }}>Add items to complete before this event</Text>
              {attendingForm.complianceChecklist.map((c, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, padding: 10, borderRadius: 8, marginBottom: 6 }}>
                  <Text style={{ flex: 1, fontSize: 14 }}>{c.item}</Text>
                  <TouchableOpacity onPress={() => setAttendingForm(f => ({ ...f, complianceChecklist: f.complianceChecklist.filter((_, idx) => idx !== i) }))}>
                    <Text style={{ color: COLORS.danger, fontSize: 18, fontWeight: '600' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <View style={{ flex: 1 }}><Input placeholder="e.g. Print business license" value={newChecklistItem} onChangeText={setNewChecklistItem} /></View>
                <Button title="Add" variant="outline" size="sm" onPress={addChecklistItemToForm} disabled={!newChecklistItem.trim()} />
              </View>
              
              <View style={styles.modalFooter}>
                <Button title="Cancel" variant="outline" onPress={() => { setShowAddAttendingModal(false); resetAttendingForm(); }} style={{ flex: 1 }} />
                <Button title={editingAttendingEvent ? "Save Changes" : "Add Event"} onPress={saveAttendingEvent} disabled={!attendingForm.eventName || !attendingForm.startDate} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Attending Event Detail Modal */}
      <Modal visible={!!selectedAttendingEvent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedAttendingEvent?.eventName}</Text>
              <TouchableOpacity onPress={() => setSelectedAttendingEvent(null)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
            </View>
            {selectedAttendingEvent && (
              <ScrollView style={styles.modalBody}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 4 }}>📅 {formatDate(selectedAttendingEvent.startDate)}{selectedAttendingEvent.endDate ? ` - ${formatDate(selectedAttendingEvent.endDate)}` : ''}</Text>
                  {selectedAttendingEvent.location?.city ? <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 4 }}>📍 {selectedAttendingEvent.location.venueName ? `${selectedAttendingEvent.location.venueName}, ` : ''}{selectedAttendingEvent.location.city}{selectedAttendingEvent.location.state ? `, ${selectedAttendingEvent.location.state}` : ''}</Text> : null}
                  {selectedAttendingEvent.organizerName ? <Text style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 4 }}>🏢 {selectedAttendingEvent.organizerName}</Text> : null}
                  {selectedAttendingEvent.notes ? <Text style={{ fontSize: 13, color: COLORS.gray600, marginTop: 8 }}>{selectedAttendingEvent.notes}</Text> : null}
                </View>
                
                {selectedAttendingEvent.requiredPermits?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: '600', fontSize: 15, marginBottom: 8 }}>Required Permits ({selectedAttendingEvent.completedPermits}/{selectedAttendingEvent.requiredPermits.length})</Text>
                    {selectedAttendingEvent.requiredPermits.map((p, i) => (
                      <View key={i} style={{ padding: 12, backgroundColor: p.status === 'obtained' ? '#f0fdf4' : COLORS.gray50, borderRadius: 8, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: p.status === 'obtained' ? COLORS.success : p.status === 'in_progress' ? COLORS.warning : p.status === 'not_applicable' ? COLORS.gray400 : COLORS.danger }}>
                        <Text style={{ fontWeight: '500', marginBottom: 6 }}>{p.name}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {PERMIT_STATUSES.map(s => (
                            <TouchableOpacity key={s.value} onPress={() => updateAttendingPermitStatus(selectedAttendingEvent._id, i, s.value)} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: p.status === s.value ? COLORS.primary : COLORS.gray100 }}>
                              <Text style={{ fontSize: 12, color: p.status === s.value ? '#fff' : COLORS.gray700 }}>{s.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                
                {selectedAttendingEvent.complianceChecklist?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: '600', fontSize: 15, marginBottom: 8 }}>Compliance Checklist ({selectedAttendingEvent.completedChecklist}/{selectedAttendingEvent.complianceChecklist.length})</Text>
                    {selectedAttendingEvent.complianceChecklist.map((c, i) => (
                      <TouchableOpacity key={i} onPress={() => updateAttendingChecklistItem(selectedAttendingEvent._id, i, !c.completed)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: c.completed ? '#f0fdf4' : COLORS.gray50, borderRadius: 8, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: c.completed ? COLORS.success : COLORS.gray300 }}>
                        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: c.completed ? COLORS.success : COLORS.gray400, backgroundColor: c.completed ? COLORS.success : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                          {c.completed && <Icons.Check size={14} color="#fff" />}
                        </View>
                        <Text style={[{ flex: 1, fontSize: 14 }, c.completed && { textDecorationLine: 'line-through', color: COLORS.gray500 }]}>{c.item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <View style={[styles.modalFooter, { marginTop: 8 }]}>
                  <Button title="Edit" variant="outline" onPress={() => { const ae = selectedAttendingEvent; setSelectedAttendingEvent(null); openEditAttendingModal(ae); }} style={{ flex: 1 }} />
                  <Button title="Delete" variant="outline" onPress={() => deleteAttendingEvent(selectedAttendingEvent._id)} style={{ flex: 1 }} color={COLORS.danger} />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ===========================================
// NAVIGATION
// ===========================================
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const PermitsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="PermitsList" component={PermitsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PermitDetail" component={PermitDetailScreen} options={{ title: 'Permit Details', headerStyle: { backgroundColor: COLORS.white }, headerTintColor: COLORS.gray800 }} />
    <Stack.Screen name="AddPermit" component={AddPermitScreen} options={{ title: 'Add Permit', headerStyle: { backgroundColor: COLORS.white }, headerTintColor: COLORS.gray800 }} />
    <Stack.Screen name="EditPermit" component={EditPermitScreen} options={{ title: 'Edit Permit', headerStyle: { backgroundColor: COLORS.white }, headerTintColor: COLORS.gray800 }} />
  </Stack.Navigator>
);

// Vendor tabs - full access
const VendorTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.gray400,
    tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.gray200, paddingBottom: Platform.OS === 'ios' ? 20 : 8, height: Platform.OS === 'ios' ? 85 : 65 },
    tabBarIcon: ({ color, size }) => {
      const icons = { Dashboard: Icons.Dashboard, Permits: Icons.Permit, Documents: Icons.Document, Inspections: Icons.Checklist, Events: Icons.Event, Settings: Icons.Settings };
      const Icon = icons[route.name];
      return Icon ? <Icon size={size} color={color} /> : null;
    },
  })}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Permits" component={PermitsStack} />
    <Tab.Screen name="Documents" component={DocumentsScreen} />
    <Tab.Screen name="Inspections" component={InspectionsScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Organizer tabs - Events and Settings only
const OrganizerTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.gray400,
    tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.gray200, paddingBottom: Platform.OS === 'ios' ? 20 : 8, height: Platform.OS === 'ios' ? 85 : 65 },
    tabBarIcon: ({ color, size }) => {
      const icons = { Events: Icons.Event, Settings: Icons.Settings };
      const Icon = icons[route.name];
      return Icon ? <Icon size={size} color={color} /> : null;
    },
  })}>
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="Settings" component={OrganizerSettingsScreen} />
  </Tab.Navigator>
);

// Dynamic tabs based on user type
const MainTabs = () => {
  const { user } = useAuth();
  // Check if user is organizer (even if disabled - we'll show disabled message in OrganizerTabs)
  const isOrganizer = user?.isOrganizer;
  return isOrganizer ? <OrganizerTabs /> : <VendorTabs />;
};

// Disabled Account Screen
const DisabledAccountScreen = ({ reason, type }) => {
  const { logout } = useAuth();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Icons.Alert size={40} color="#dc2626" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.gray900, marginBottom: 12, textAlign: 'center' }}>
          Account {type === 'rejected' ? 'Not Approved' : 'Disabled'}
        </Text>
        <Text style={{ fontSize: 15, color: COLORS.gray600, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
          {reason || (type === 'rejected' 
            ? 'Your organizer application was not approved.' 
            : 'Your account has been disabled by an administrator.')}
        </Text>
        <View style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, width: '100%', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: COLORS.gray700, textAlign: 'center' }}>
            If you believe this is an error, please contact support at{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>support@permitwise.app</Text>
          </Text>
        </View>
        <Button title="Log Out" variant="outline" onPress={logout} style={{ width: '100%' }} />
      </View>
    </SafeAreaView>
  );
};

// Wrapper that includes subscription banner
const MainTabsWithBanner = () => {
  const { user, isExpired } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isOrganizer = user?.isOrganizer;
  const isDisabled = user?.organizerProfile?.disabled || user?.organizerProfile?.verificationStatus === 'rejected';
  
  // Show disabled screen for disabled organizers
  if (isOrganizer && isDisabled) {
    return (
      <DisabledAccountScreen 
        reason={user?.organizerProfile?.disabledReason} 
        type={user?.organizerProfile?.verificationStatus === 'rejected' ? 'rejected' : 'disabled'}
      />
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      {isExpired && (
        <View style={styles.expiredBanner}>
          <View style={styles.expiredBannerContent}>
            <Icons.Alert size={20} color="#dc2626" />
            <Text style={styles.expiredBannerText}>
              <Text style={styles.expiredBannerBold}>Subscription expired.</Text> Read-only access.
            </Text>
          </View>
          <TouchableOpacity style={styles.expiredBannerBtn} onPress={() => setShowUpgradeModal(true)}>
            <Text style={styles.expiredBannerBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}
      <MainTabs />
      <SubscriptionModal visible={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </View>
  );
};

// ===========================================
// APP ROOT
// ===========================================
const AppContent = () => {
  const { user, isAuthenticated, hasCompletedOnboarding, loading } = useAuth();
  const isOrganizer = user?.isOrganizer;

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading PermitWise...</Text></View>;
  if (!isAuthenticated) return <AuthNavigator />;
  // Organizers skip onboarding (they don't need business setup)
  if (!hasCompletedOnboarding && !isOrganizer) return <OnboardingScreen />;
  return <MainTabsWithBanner />;
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={false} />
              <AppContent />
            </NavigationContainer>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// ===========================================
// STYLES
// ===========================================
const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray50 },
  loadingText: { marginTop: 16, color: COLORS.gray500 },
  // Button
  btn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnOutline: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray300 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  btnTextOutline: { color: COLORS.gray700 },
  // Form
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.gray700, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.gray800 },
  inputError: { borderColor: COLORS.danger },
  phoneInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  phonePrefix: { backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray300, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 12, paddingVertical: 12, borderRightWidth: 0 },
  phonePrefixText: { fontSize: 16, color: COLORS.gray600, fontWeight: '500' },
  phoneInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  errorText: { fontSize: 13, color: COLORS.danger, marginTop: 4 },
  // Card
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, backgroundColor: COLORS.gray100 },
  badgeText: { fontSize: 12, fontWeight: '500', color: COLORS.gray600 },
  badgeSuccess: { backgroundColor: '#dcfce7' }, badgeTextSuccess: { color: '#166534' },
  badgeWarning: { backgroundColor: '#fef3c7' }, badgeTextWarning: { color: '#92400e' },
  badgeDanger: { backgroundColor: '#fee2e2' }, badgeTextDanger: { color: '#991b1b' },
  badgePrimary: { backgroundColor: '#dbeafe' }, badgeTextPrimary: { color: '#1e40af' },
  // Alert
  alertError: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  alertText: { color: '#991b1b', fontSize: 14 },
  // Auth
  authContainer: { flex: 1, backgroundColor: COLORS.gray50 },
  authScroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  authHeader: { alignItems: 'center', marginBottom: 32 },
  authTitle: { fontSize: 28, fontWeight: '700', color: COLORS.gray900, marginTop: 12 },
  authSubtitle: { fontSize: 16, color: COLORS.gray500, marginTop: 4 },
  authLink: { marginTop: 24, alignItems: 'center' },
  authLinkText: { fontSize: 14, color: COLORS.gray600 },
  authLinkBold: { color: COLORS.primary, fontWeight: '600' },
  // Onboarding
  onboardingScroll: { flexGrow: 1, padding: 24 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 16 },
  progressStep: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray200, justifyContent: 'center', alignItems: 'center' },
  progressStepActive: { backgroundColor: COLORS.primary },
  progressText: { fontSize: 16, fontWeight: '600', color: COLORS.gray500 },
  progressTextActive: { color: COLORS.white },
  onboardingTitle: { fontSize: 22, fontWeight: '600', color: COLORS.gray800, marginBottom: 24 },
  onboardingActions: { flexDirection: 'row', marginTop: 32 },
  onboardingHeader: { alignItems: 'center', marginBottom: 32 },
  onboardingHeaderTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray900, marginTop: 16 },
  onboardingHeaderSubtitle: { fontSize: 15, color: COLORS.gray500, marginTop: 4, textAlign: 'center' },
  onboardingNote: { fontSize: 13, color: COLORS.gray500, textAlign: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  // Email Banner
  emailBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f59e0b', padding: 12, borderRadius: 8, marginHorizontal: 20, marginTop: 12, gap: 8 },
  emailBannerText: { flex: 1, fontSize: 13, color: '#92400e' },
  emailBannerLink: { fontSize: 13, color: '#b45309', fontWeight: '600', textDecorationLine: 'underline' },
  // Aha Banner
  ahaBanner: { marginHorizontal: 20, marginBottom: 8, backgroundColor: '#fef2f2', borderWidth: 2, borderColor: '#ef4444' },
  ahaContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  ahaIcon: { width: 44, height: 44, backgroundColor: '#ef4444', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  ahaText: { flex: 1 },
  ahaTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b', marginBottom: 4 },
  ahaItems: { fontSize: 14, color: '#dc2626' },
  ahaButton: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  // Picker
  pickerButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray300, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14 },
  pickerButtonText: { fontSize: 16, color: COLORS.gray800 },
  pickerButtonPlaceholder: { fontSize: 16, color: COLORS.gray400 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalDesc: { fontSize: 14, color: COLORS.gray600, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pickerModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  pickerTitle: { fontSize: 18, fontWeight: '600' },
  pickerDone: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  pickerScroll: { padding: 8 },
  pickerItem: { padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerItemSelected: { backgroundColor: COLORS.gray100 },
  pickerItemText: { fontSize: 16, color: COLORS.gray700 },
  pickerItemTextSelected: { color: COLORS.primary, fontWeight: '500' },
  pickerButtonDisabled: { backgroundColor: COLORS.gray100, opacity: 0.6 },
  // City Search Modal
  citySearchModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' },
  citySearchInputWrapper: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  citySearchInput: { backgroundColor: COLORS.gray100, borderRadius: 8, padding: 12, fontSize: 16 },
  citySearchOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  citySearchName: { fontSize: 16, fontWeight: '500', color: COLORS.gray800 },
  citySearchTypeBadge: { backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  citySearchTypeText: { fontSize: 12, color: COLORS.gray500, textTransform: 'capitalize' },
  citySearchLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8 },
  citySearchLoadingText: { fontSize: 14, color: COLORS.gray500 },
  citySearchEmpty: { padding: 20, alignItems: 'center' },
  citySearchEmptyText: { fontSize: 14, color: COLORS.gray500, marginBottom: 12, textAlign: 'center' },
  useCustomButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  useCustomButtonText: { color: COLORS.white, fontWeight: '500' },
  citySearchHint: { padding: 20, alignItems: 'center' },
  citySearchHintText: { fontSize: 14, color: COLORS.gray400 },
  // Layout
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  // Header
  header: { padding: 20, paddingTop: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray900 },
  headerSubtitle: { fontSize: 14, color: COLORS.gray500, marginTop: 2 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 8 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray900 },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  // Trial banner
  trialBanner: { backgroundColor: '#fef3c7', padding: 12, marginHorizontal: 20, borderRadius: 8, marginBottom: 16 },
  trialText: { color: '#92400e', fontSize: 14, textAlign: 'center' },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 8 },
  statCard: { width: '46%', margin: '2%', alignItems: 'center', paddingVertical: 20 },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.gray900 },
  statLabel: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  // Compliance
  complianceCard: { marginHorizontal: 20, marginBottom: 12 },
  scoreContainer: { alignItems: 'center', paddingVertical: 20 },
  scoreValue: { fontSize: 48, fontWeight: '700', color: COLORS.primary },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray700, marginBottom: 12 },
  // Upcoming
  upcomingCard: { marginHorizontal: 20, marginBottom: 20 },
  expirationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  expirationName: { fontSize: 14, color: COLORS.gray700, flex: 1 },
  emptyText: { fontSize: 14, color: COLORS.gray400, textAlign: 'center', paddingVertical: 20 },
  // Permits
  summaryBar: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryCount: { fontSize: 24, fontWeight: '700', color: COLORS.gray900 },
  summaryLabel: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  listContent: { padding: 20, paddingTop: 0 },
  permitCard: { flexDirection: 'column' },
  permitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  permitName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, flex: 1, marginRight: 8 },
  permitJurisdiction: { fontSize: 14, color: COLORS.gray500, marginBottom: 8 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expiryText: { fontSize: 13, color: COLORS.gray600 },
  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray700, marginTop: 16 },
  // Detail
  detailScroll: { padding: 20 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  detailTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gray900, flex: 1, marginRight: 12 },
  detailCard: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  detailLabel: { fontSize: 14, color: COLORS.gray500 },
  detailValue: { fontSize: 14, fontWeight: '500', color: COLORS.gray800 },
  // Documents
  documentCard: { flexDirection: 'row', alignItems: 'center' },
  documentIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 15, fontWeight: '500', color: COLORS.gray800 },
  documentMeta: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  // Settings
  profileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInitials: { fontSize: 20, fontWeight: '600', color: COLORS.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  profileEmail: { fontSize: 14, color: COLORS.gray500, marginTop: 2 },
  settingsCard: { marginHorizontal: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsSection: { fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  settingsLabel: { fontSize: 15, color: COLORS.gray700 },
  settingsValue: { fontSize: 15, color: COLORS.gray500 },
  editCard: { marginHorizontal: 20, marginBottom: 16, marginTop: -8 },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  legalLabel: { fontSize: 15, color: COLORS.gray700 },
  cityRow: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  removeBtn: { padding: 8, marginLeft: 8 },
  trialNote: { fontSize: 13, color: COLORS.warning, marginTop: 8 },
  appVersion: { textAlign: 'center', fontSize: 12, color: COLORS.gray400, marginTop: 16, marginBottom: 8 },
  logoutButton: { marginHorizontal: 20, marginTop: 8, marginBottom: 40 },
  // Coming Soon
  comingSoonContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  comingSoonIcon: { width: 80, height: 80, backgroundColor: '#e0e7ff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  comingSoonTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray900, marginBottom: 12, textAlign: 'center' },
  comingSoonText: { fontSize: 15, color: COLORS.gray600, textAlign: 'center', lineHeight: 22, marginTop: 12, marginBottom: 20, paddingHorizontal: 16 },
  comingSoonFeatures: { backgroundColor: COLORS.gray50, borderRadius: 12, padding: 16, width: '100%', marginBottom: 20 },
  featureItem: { fontSize: 14, color: COLORS.gray700, paddingVertical: 6 },
  comingSoonNote: { fontSize: 13, color: COLORS.gray500, fontStyle: 'italic' },
  // Onboarding Progress
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gray200 },
  dotActive: { backgroundColor: COLORS.primary },
  onboardingActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  // Coverage Notice
  coverageNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: '#fef3c7', borderRadius: 12, marginBottom: 16 },
  coverageNoticeText: { flex: 1, color: '#92400e', fontSize: 14, lineHeight: 20 },
  // Permit Suggestions
  permitSuggestions: { marginTop: 16 },
  permitSuggestionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  permitCount: { fontSize: 14, color: COLORS.gray500 },
  selectAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  permitCheckbox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, marginBottom: 8 },
  permitCheckboxSelected: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.gray300, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  permitCheckboxContent: { flex: 1 },
  permitCheckboxHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  permitCheckboxName: { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  importanceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  importanceBadgeText: { fontSize: 11, fontWeight: '600' },
  permitIssuer: { fontSize: 12, color: COLORS.gray500, marginBottom: 2 },
  permitRenewal: { fontSize: 12, color: COLORS.gray500 },
  // Welcome Modal
  welcomeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeModal: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  welcomeIcon: { width: 80, height: 80, backgroundColor: '#dcfce7', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gray900, marginBottom: 8 },
  welcomeText: { fontSize: 15, color: COLORS.gray600, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  welcomeLater: { fontSize: 14, color: COLORS.gray500 },
  // Permit Detail Enhancements
  detailBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  missingPermitCta: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: '#fef3c7', borderRadius: 12, marginHorizontal: 20, marginBottom: 16 },
  missingPermitText: { flex: 1, color: '#92400e', fontSize: 14, lineHeight: 20 },
  permitTypeInfo: { marginHorizontal: 20, marginBottom: 16, padding: 16 },
  permitTypeInfoTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray700, marginBottom: 12 },
  permitInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  permitInfoContent: { flex: 1 },
  permitInfoLabel: { fontSize: 12, color: COLORS.gray500, marginBottom: 2 },
  permitInfoValue: { fontSize: 14, color: COLORS.gray800 },
  requiredDocs: { paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  detailRowHighlight: { backgroundColor: '#fef3c7', marginHorizontal: -16, paddingHorizontal: 16, marginTop: 8 },
  // Password Strength
  passwordInputWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  passwordToggle: { position: 'absolute', right: 12, top: 12, padding: 4 },
  passwordStrength: { marginTop: 8, marginBottom: 12 },
  strengthBar: { height: 4, backgroundColor: COLORS.gray200, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  strengthChecks: { gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { fontSize: 12, color: COLORS.gray400 },
  checkPassed: { color: COLORS.success },
  passwordMatch: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  passwordMatchSuccess: { color: COLORS.success },
  passwordMatchError: { color: COLORS.danger },
  // Forgot Password
  forgotPasswordLink: { alignItems: 'flex-end', marginTop: 4, marginBottom: 16 },
  forgotPasswordText: { fontSize: 14, color: COLORS.primary },
  trialBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  trialBadgeText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  // Account Type Selector
  accountTypeLabel: { fontSize: 15, fontWeight: '500', color: COLORS.gray700, marginBottom: 8, marginTop: 16 },
  accountTypeOptions: { flexDirection: 'column', gap: 12, marginBottom: 16 },
  accountTypeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.gray50, borderWidth: 2, borderColor: COLORS.gray200, borderRadius: 12 },
  accountTypeOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  accountTypeIcon: { width: 44, height: 44, backgroundColor: '#e0e7ff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  accountTypeIconActive: { backgroundColor: COLORS.primary },
  accountTypeInfo: { flex: 1 },
  accountTypeTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  accountTypeDesc: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  successContainer: { alignItems: 'center', padding: 24 },
  successIcon: { width: 80, height: 80, backgroundColor: '#dcfce7', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successText: { fontSize: 15, color: COLORS.gray700, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  successNote: { fontSize: 13, color: COLORS.gray500, textAlign: 'center' },
  // Form Screen
  formScroll: { padding: 20 },
  infoCard: { marginBottom: 20, padding: 16 },
  infoCardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  infoCardSubtitle: { fontSize: 14, color: COLORS.gray500, marginTop: 4 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  statusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusOptionText: { fontSize: 14, color: COLORS.gray600 },
  statusOptionTextActive: { color: COLORS.white, fontWeight: '500' },
  deleteButton: { padding: 8 },
  teamMemberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  teamMemberName: { fontSize: 15, fontWeight: '500', color: COLORS.gray800 },
  teamMemberEmail: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  // Upload Modal
  uploadModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  uploadModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  uploadModalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  uploadContent: { padding: 20 },
  uploadArea: { alignItems: 'center', padding: 40, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.gray300, borderRadius: 12, marginTop: 16 },
  uploadAreaText: { fontSize: 16, color: COLORS.gray600, marginTop: 12 },
  uploadAreaHint: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
  // Notification Settings
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  switchLabel: { fontSize: 16, color: COLORS.gray700 },
  switch: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.gray200, padding: 2 },
  switchOn: { backgroundColor: COLORS.primary },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white },
  switchThumbOn: { transform: [{ translateX: 22 }] },
  reminderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  reminderChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.gray200 },
  reminderChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  reminderChipText: { fontSize: 14, color: COLORS.gray600 },
  reminderChipTextActive: { color: COLORS.white },
  subscriptionStatus: { fontSize: 13, color: COLORS.gray500, marginTop: 4 },
  // Subscription Modal
  subscriptionModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  subscriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  subscriptionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray800 },
  subscriptionSubtitle: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  plansContainer: { padding: 20 },
  planCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: COLORS.gray200 },
  planCardPopular: { borderColor: COLORS.primary },
  planCardCurrent: { borderColor: COLORS.success, backgroundColor: '#f0fdf4' },
  popularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  planHeader: { marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  planPrice: { fontSize: 24, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  planFeatures: { marginBottom: 12 },
  planFeature: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  planFeatureText: { fontSize: 14, color: COLORS.gray600 },
  currentPlanBadge: { backgroundColor: '#dcfce7', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  currentPlanText: { fontSize: 14, fontWeight: '600', color: '#166534' },
  subscriptionActions: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  subscriptionDisclaimer: { fontSize: 11, color: COLORS.gray400, textAlign: 'center', marginTop: 16, lineHeight: 16 },
  // Checklist styles
  checklistScroll: { padding: 20 },
  checklistSection: { marginBottom: 24 },
  checklistSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 12 },
  checklistItem: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: COLORS.white, borderRadius: 8, marginBottom: 8 },
  checklistItemContent: { flex: 1 },
  checklistItemText: { fontSize: 14, color: COLORS.gray700, lineHeight: 20 },
  checklistItemChecked: { textDecorationLine: 'line-through', color: COLORS.gray400 },
  checklistTip: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  checklistCard: { marginHorizontal: 20 },
  checklistHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checklistInfo: { flex: 1 },
  checklistName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800 },
  checklistMeta: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  checklistDesc: { fontSize: 13, color: COLORS.gray600, marginTop: 8 },
  startBtnSmall: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  startBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  progressBarContainer: { height: 4, backgroundColor: COLORS.gray200, marginHorizontal: 20 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  progressText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  pageTitleSmall: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, flex: 1, textAlign: 'center' },
  // Inspection tabs
  inspectionTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  inspectionTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.gray100 },
  inspectionTabActive: { backgroundColor: COLORS.primary },
  inspectionTabText: { fontSize: 14, fontWeight: '500', color: COLORS.gray600 },
  inspectionTabTextActive: { color: COLORS.white },
  // Inspection active flow
  inspectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { padding: 4 },
  inspectionHeaderText: { flex: 1, marginLeft: 12 },
  inspectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800 },
  inspectionProgress: { fontSize: 13, color: COLORS.gray500 },
  inspectionScroll: { padding: 20 },
  inspectionItemCard: { marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  itemPassed: { borderColor: COLORS.success, backgroundColor: '#f0fdf4' },
  itemFailed: { borderColor: COLORS.danger, backgroundColor: '#fef2f2' },
  inspectionItemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gray200, alignItems: 'center', justifyContent: 'center' },
  itemNumberText: { fontSize: 13, fontWeight: '600', color: COLORS.gray600 },
  inspectionItemText: { flex: 1, fontSize: 15, color: COLORS.gray800, lineHeight: 22 },
  inspectionItemDesc: { fontSize: 13, color: COLORS.gray500, marginTop: 8, marginLeft: 40 },
  passFailButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  passBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8, borderWidth: 2, borderColor: COLORS.success, backgroundColor: COLORS.white },
  passBtnActive: { backgroundColor: COLORS.success },
  passBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.success },
  passBtnTextActive: { color: COLORS.white },
  failBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 8, borderWidth: 2, borderColor: COLORS.danger, backgroundColor: COLORS.white },
  failBtnActive: { backgroundColor: COLORS.danger },
  failBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  failBtnTextActive: { color: COLORS.white },
  failNoteInput: { marginTop: 12, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.gray700, minHeight: 60 },
  inspectionSummaryCard: { marginTop: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 12 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: COLORS.gray50, borderRadius: 8 },
  summaryStat: { alignItems: 'center' },
  summaryStatCount: { fontSize: 24, fontWeight: '700' },
  summaryStatLabel: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  overallNotesInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 8, padding: 12, fontSize: 14, color: COLORS.gray700, minHeight: 80, textAlignVertical: 'top' },
  pendingWarning: { fontSize: 12, color: COLORS.warning, textAlign: 'center', marginTop: 8 },
  // Inspection history
  inspectionHistoryCard: { marginHorizontal: 20 },
  inspectionHistoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inspectionHistoryName: { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  inspectionHistoryDate: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  inspectionHistoryStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  historyStatText: { fontSize: 13, color: COLORS.gray600 },
  // Inspection View Modal
  inspectionViewModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', marginTop: 'auto', padding: 20 },
  inspectionViewDate: { fontSize: 13, color: COLORS.gray500, marginTop: 4 },
  inspectionViewBadge: { alignItems: 'flex-start', marginBottom: 16 },
  inspectionViewSectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  inspectionViewItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, marginBottom: 8, borderRadius: 8 },
  inspectionViewItemPassed: { backgroundColor: '#f0fdf4' },
  inspectionViewItemFailed: { backgroundColor: '#fef2f2' },
  inspectionViewItemPending: { backgroundColor: '#fffbeb' },
  inspectionViewItemIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  inspectionViewIconPassed: { backgroundColor: '#22c55e' },
  inspectionViewIconFailed: { backgroundColor: '#ef4444' },
  inspectionViewIconPending: { backgroundColor: '#f59e0b' },
  inspectionViewItemText: { fontSize: 14, fontWeight: '500', color: COLORS.gray800 },
  inspectionViewItemNotes: { fontSize: 13, color: COLORS.gray600, fontStyle: 'italic', marginTop: 4 },
  inspectionViewNotes: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  inspectionViewNotesText: { fontSize: 14, color: COLORS.gray700, lineHeight: 20 },
  // Suggested Permits Modal
  suggestModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', marginTop: 'auto' },
  suggestModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  suggestModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  suggestModalContent: { padding: 20, maxHeight: 400 },
  suggestModalIntro: { fontSize: 14, color: COLORS.gray600, marginBottom: 16, lineHeight: 20 },
  suggestSelectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  suggestSelectedCount: { fontSize: 13, color: COLORS.gray500 },
  selectAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  suggestItem: { flexDirection: 'row', padding: 12, borderRadius: 8, backgroundColor: COLORS.gray50, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  suggestItemSelected: { borderColor: COLORS.primary, backgroundColor: '#eff6ff' },
  suggestCheckbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  suggestCheckboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  suggestItemContent: { flex: 1 },
  suggestItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  suggestItemName: { fontSize: 14, fontWeight: '600', color: COLORS.gray800, flex: 1 },
  suggestBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  suggestBadgeText: { fontSize: 11, fontWeight: '600' },
  suggestItemDesc: { fontSize: 12, color: COLORS.gray500, marginTop: 4, lineHeight: 18 },
  suggestItemMeta: { fontSize: 11, color: COLORS.gray400, marginTop: 6 },
  suggestModalFooter: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: COLORS.gray100, gap: 12 },
  // Document upload in permit detail
  documentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  documentCount: { fontSize: 12, color: COLORS.gray500, marginLeft: 4 },
  documentPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.gray50, borderRadius: 8 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  documentHint: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  uploadDocArea: { alignItems: 'center', justifyContent: 'center', padding: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.gray300, borderRadius: 8, backgroundColor: COLORS.gray50 },
  uploadDocText: { fontSize: 14, fontWeight: '500', color: COLORS.gray600, marginTop: 8 },
  uploadDocHint: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  // Event styles
  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.gray100 },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 14, fontWeight: '500', color: COLORS.gray600 },
  filterTabTextActive: { color: COLORS.white },
  eventCard: { marginHorizontal: 20 },
  eventName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800 },
  eventOrganizer: { fontSize: 14, color: COLORS.gray500, marginTop: 2 },
  eventDetails: { flexDirection: 'row', gap: 16, marginTop: 12 },
  eventDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventDetailText: { fontSize: 13, color: COLORS.gray600 },
  eventFee: { fontSize: 14, fontWeight: '500', color: COLORS.gray700, marginTop: 8 },
  // Event Readiness styles
  eventReadinessCard: { marginHorizontal: 20, padding: 0, overflow: 'hidden' },
  eventReadinessHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  eventDateBadge: { width: 50, alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 8 },
  eventDateMonth: { fontSize: 11, color: COLORS.white, textTransform: 'uppercase' },
  eventDateDay: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  eventReadinessInfo: { flex: 1 },
  eventReadinessName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800 },
  eventReadinessOrganizer: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  eventReadinessLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  eventReadinessLocationText: { fontSize: 12, color: COLORS.gray500 },
  readinessBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  eventReadinessProgress: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  progressBarContainer: { flex: 1, height: 6, backgroundColor: COLORS.gray200, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 3 },
  progressText: { fontSize: 12, color: COLORS.gray500 },
  readinessSuccess: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', padding: 12, marginHorizontal: 16, marginBottom: 16, borderRadius: 8 },
  readinessSuccessText: { fontSize: 13, color: COLORS.success },
  readinessIssues: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.gray50, padding: 12, marginHorizontal: 16, marginBottom: 16, borderRadius: 8 },
  readinessIssueText: { flex: 1, fontSize: 13, color: COLORS.danger },
  readinessViewDetails: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  eventCardActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  eventCardActionBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, alignItems: 'center' },
  eventCardActionText: { fontSize: 14, color: COLORS.gray700, fontWeight: '500' },
  withdrawBtn: { borderColor: COLORS.danger },
  withdrawBtnText: { fontSize: 14, color: COLORS.danger, fontWeight: '500' },
  eventDetailSummary: { backgroundColor: COLORS.gray50, padding: 16, borderRadius: 12, marginBottom: 16 },
  eventDetailLabel: { fontWeight: '600' },
  issuesList: { marginTop: 8 },
  issuesTitle: { fontSize: 15, fontWeight: '600', color: COLORS.danger, marginBottom: 12 },
  issueItem: { backgroundColor: COLORS.gray50, padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3 },
  issueItemText: { fontSize: 14, color: COLORS.gray700 },
  issueBold: { fontWeight: '600' },
  allGood: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', padding: 16, borderRadius: 12 },
  allGoodText: { fontSize: 15, color: COLORS.success, fontWeight: '500' },
  // Upgrade Modal styles
  upgradeModalContainer: { flexGrow: 1, padding: 24, backgroundColor: COLORS.white },
  upgradeModalIcon: { width: 100, height: 100, backgroundColor: '#e0e7ff', borderRadius: 50, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, marginBottom: 20 },
  upgradeModalTitle: { fontSize: 28, fontWeight: '700', color: COLORS.gray900, textAlign: 'center', marginBottom: 12 },
  upgradeModalBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, alignSelf: 'center', marginBottom: 16 },
  upgradeModalBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 1 },
  upgradeModalDescription: { fontSize: 16, color: COLORS.gray600, textAlign: 'center', lineHeight: 24, marginBottom: 24, paddingHorizontal: 8 },
  upgradeModalFeatures: { backgroundColor: COLORS.gray50, borderRadius: 16, padding: 20, marginBottom: 24 },
  upgradeModalFeaturesTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 16 },
  upgradeModalFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  upgradeModalFeatureContent: { flex: 1 },
  upgradeModalFeatureTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray800, marginBottom: 2 },
  upgradeModalFeatureDesc: { fontSize: 13, color: COLORS.gray500, lineHeight: 18 },
  upgradeModalPricing: { backgroundColor: '#f0f9ff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#bae6fd' },
  upgradeModalPricingLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 4 },
  upgradeModalPrice: { fontSize: 36, fontWeight: '700', color: COLORS.gray900 },
  upgradeModalPriceUnit: { fontSize: 16, fontWeight: '400', color: COLORS.gray500 },
  upgradeModalPricingNote: { fontSize: 13, color: COLORS.gray500, textAlign: 'center', marginTop: 8 },
  upgradeModalButton: { marginBottom: 12 },
  upgradeModalCancel: { fontSize: 13, color: COLORS.gray400, textAlign: 'center' },
  // Event Request styles
  requestEventSection: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: COLORS.gray200, alignItems: 'center' },
  requestEventText: { fontSize: 14, color: COLORS.gray600, marginBottom: 12, textAlign: 'center' },
  requestEventButton: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
  requestEventButtonText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  requestEventButtonSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.gray100, borderRadius: 8 },
  requestEventButtonSmallText: { fontSize: 13, fontWeight: '500', color: COLORS.primary },
  requestEventButtonLarge: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.gray100, borderRadius: 8 },
  requestEventButtonLargeText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  requestSuccess: { alignItems: 'center', paddingVertical: 40 },
  requestSuccessIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  requestSuccessTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800, marginBottom: 8 },
  requestSuccessText: { fontSize: 14, color: COLORS.gray600, textAlign: 'center' },
  requestIntro: { fontSize: 14, color: COLORS.gray600, marginBottom: 16, lineHeight: 20 },
  // Organizer Portal Styles
  organizerBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  organizerBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  organizerTabs: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  organizerTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.gray100, borderRadius: 8, alignItems: 'center' },
  organizerTabActive: { backgroundColor: COLORS.primary },
  organizerTabText: { fontSize: 14, fontWeight: '500', color: COLORS.gray600 },
  organizerTabTextActive: { color: COLORS.white },
  createEventButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  organizerEventCard: { marginBottom: 12, marginHorizontal: 16 },
  organizerEventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  organizerEventName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 4 },
  organizerEventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  organizerEventMetaText: { fontSize: 13, color: COLORS.gray500 },
  organizerEventStats: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  organizerEventStat: { fontSize: 13, color: COLORS.gray500 },
  organizerEventActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  eventManagementCard: { marginBottom: 16 },
  eventManagementTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800, marginBottom: 4 },
  eventManagementMeta: { fontSize: 14, color: COLORS.gray500, marginBottom: 16 },
  inviteSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  inviteSectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray700, marginBottom: 12 },
  inviteLabel: { fontSize: 13, color: COLORS.gray500, marginBottom: 6, marginTop: 8 },
  inviteDividerText: { textAlign: 'center', color: COLORS.gray400, fontSize: 12, marginVertical: 12 },
  inviteForm: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pickerModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', marginTop: 'auto' },
  pickerModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  pickerModalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  pickerOptionSelected: { backgroundColor: '#f0f9ff' },
  pickerOptionText: { fontSize: 15, fontWeight: '500', color: COLORS.gray800 },
  pickerOptionSubtext: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 12, paddingHorizontal: 16 },
  applicationCard: { marginBottom: 12, marginHorizontal: 16 },
  applicationEventName: { fontSize: 12, color: COLORS.primary, fontWeight: '500', marginBottom: 4 },
  applicationInfo: { flex: 1 },
  applicationBusinessName: { fontSize: 15, fontWeight: '600', color: COLORS.gray800 },
  applicationVendorType: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  applicationNotes: { fontSize: 13, fontStyle: 'italic', color: COLORS.gray600, marginTop: 6 },
  applicationActions: { marginTop: 12, alignItems: 'flex-start', gap: 8 },
  complianceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  complianceBadgeText: { fontSize: 12, fontWeight: '500' },
  applicationButtonRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  appActionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1 },
  appActionApprove: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  appActionReject: { backgroundColor: COLORS.white, borderColor: COLORS.gray200 },
  appActionBtnText: { fontSize: 14, fontWeight: '500', color: '#16a34a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  // Event Sections
  eventSection: { marginBottom: 24 },
  eventSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  eventSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800 },
  eventSectionCount: { fontSize: 14, color: COLORS.gray500, backgroundColor: COLORS.gray100, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  eventSourceBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  eventSourceBadgeText: { fontSize: 12, fontWeight: '500' },
  eventSectionDesc: { fontSize: 13, color: COLORS.gray500, marginBottom: 12, paddingHorizontal: 4 },
  browseEventCard: { marginBottom: 12 },
  browseEventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  browseEventInfo: { flex: 1 },
  browseEventName: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 4 },
  browseEventOrganizer: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  applyEventName: { fontSize: 18, fontWeight: '600', color: COLORS.gray800, marginBottom: 8 },
  applyEventMeta: { marginBottom: 16 },
  applyEventMetaText: { fontSize: 14, color: COLORS.gray600, marginBottom: 4 },
  // Section Empty State
  sectionEmpty: { padding: 24, backgroundColor: COLORS.gray50, borderRadius: 12, alignItems: 'center' },
  sectionEmptyText: { fontSize: 14, color: COLORS.gray500, textAlign: 'center' },
  // Invitation Card Styles
  pendingInvitationCard: { borderWidth: 2, borderColor: COLORS.warning, backgroundColor: '#fffbeb' },
  invitationStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  invitationStatusText: { fontSize: 12, fontWeight: '600' },
  invitationActions: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  invitationPrompt: { fontSize: 14, fontWeight: '500', color: COLORS.gray700, marginBottom: 10 },
  invitationButtons: { flexDirection: 'row', gap: 8 },
  acceptButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  acceptButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  declineButton: { flex: 1, backgroundColor: COLORS.white, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray300 },
  declineButtonText: { color: COLORS.gray700, fontWeight: '500', fontSize: 14 },
  viewDetailsButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.gray100 },
  viewDetailsButtonText: { color: COLORS.primary, fontWeight: '500', fontSize: 14 },
  // Event Detail Modal Sections
  detailSection: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  detailSectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 12 },
  invitationBanner: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 16, borderBottomWidth: 0 },
  invitationBannerContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  invitationBannerTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 4 },
  invitationBannerText: { fontSize: 14, color: COLORS.gray600 },
  invitationResponseButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  requiredPermitItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: COLORS.gray50, borderRadius: 8, marginBottom: 8 },
  requiredPermitText: { fontSize: 14, color: COLORS.gray700, flex: 1 },
  complianceOverview: { marginBottom: 16 },
  progressLabel: { fontSize: 14, color: COLORS.gray600, marginTop: 8 },
  issuesIntro: { fontSize: 14, color: COLORS.gray600, marginBottom: 12 },
  // Legacy upgrade styles (keeping for compatibility)
  upgradeContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  upgradeIcon: { width: 80, height: 80, backgroundColor: '#e0e7ff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  upgradeTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray900, marginBottom: 12, textAlign: 'center' },
  upgradeText: { fontSize: 15, color: COLORS.gray600, textAlign: 'center', lineHeight: 22, marginTop: 12, marginBottom: 20, paddingHorizontal: 16 },
  upgradeFeatures: { backgroundColor: COLORS.gray50, borderRadius: 12, padding: 16, width: '100%', marginBottom: 8 },
  upgradeFeature: { fontSize: 14, color: COLORS.gray700, paddingVertical: 6 },
  // Header buttons
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  // Add City Modal
  addCityModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', marginTop: 'auto' },
  addCityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  addCityTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800 },
  addCityContent: { padding: 20 },
  addCityDescription: { fontSize: 14, color: COLORS.gray600, marginBottom: 20, lineHeight: 20 },
  successMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', padding: 12, borderRadius: 8, marginBottom: 16 },
  successText: { fontSize: 14, color: '#166534', flex: 1 },
  // Toggle styles for settings
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '500', color: COLORS.gray700 },
  toggleDesc: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  toggleSwitch: { width: 50, height: 28, borderRadius: 14, backgroundColor: COLORS.gray200, padding: 2, justifyContent: 'center' },
  toggleSwitchActive: { backgroundColor: COLORS.primary },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white },
  toggleKnobActive: { transform: [{ translateX: 22 }] },
  // Checkbox row styles for onboarding
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, marginTop: 8 },
  checkboxLabel: { flex: 1, fontSize: 15, color: COLORS.gray700 },
  // Suggest button styles
  suggestButton: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#d97706' },
  suggestButtonText: { fontSize: 14, fontWeight: '500', color: '#92400e', textAlign: 'center' },
  // Inspections header icon buttons
  headerIconBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  // Empty container small for inline empty states
  emptyContainerSmall: { alignItems: 'center', paddingVertical: 20 },
  linkText: { fontSize: 14, color: COLORS.primary, fontWeight: '500', marginTop: 8 },
  // Add item button for checklist creation
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  addItemBtnText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  // Modal styles for create/suggest checklist
  modalDesc: { fontSize: 14, color: COLORS.gray600, marginBottom: 16, lineHeight: 20 },
  // Expired Subscription Banner
  expiredBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fef2f2', borderBottomWidth: 1, borderBottomColor: '#fca5a5' },
  expiredBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  expiredBannerText: { fontSize: 13, color: '#991b1b', flex: 1 },
  expiredBannerBold: { fontWeight: '600' },
  expiredBannerBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#dc2626', borderRadius: 6 },
  expiredBannerBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  // Settings card expired state
  settingsCardExpired: { borderWidth: 1, borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  settingsHint: { fontSize: 12, color: COLORS.gray500 },
});
