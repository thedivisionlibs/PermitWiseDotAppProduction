// PermitWise - React Native Mobile Application
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl, StatusBar, Platform, Image, FlatList, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// ===========================================
// CONFIGURATION
// ===========================================
const API_URL = 'https://permitwisedotappproduction-production.up.railway.app/api'; // Production URL

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
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get: (endpoint) => api.request(endpoint),
  post: (endpoint, body) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

// ===========================================
// UTILITIES
// ===========================================
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not entered';
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
// GOOGLE PLAY BILLING (Android) / IN-APP PURCHASE
// ===========================================
// Note: For production, integrate with react-native-iap or expo-in-app-purchases
// This provides the integration structure - actual billing requires native setup
const SUBSCRIPTION_SKUS = {
  basic: Platform.OS === 'android' ? 'permitwise_basic_monthly' : 'com.permitwise.basic.monthly',
  pro: Platform.OS === 'android' ? 'permitwise_pro_monthly' : 'com.permitwise.pro.monthly',
  elite: Platform.OS === 'android' ? 'permitwise_elite_monthly' : 'com.permitwise.elite.monthly',
};

const PLAN_DETAILS = {
  basic: { name: 'Basic', price: '$19/month', priceValue: 19, features: ['Up to 5 permits', 'Email reminders', '1 operating city'] },
  pro: { name: 'Pro', price: '$49/month', priceValue: 49, features: ['Up to 20 permits', 'SMS + Email reminders', '5 operating cities', 'Document storage', 'Inspection checklists'], popular: true },
  elite: { name: 'Elite', price: '$99/month', priceValue: 99, features: ['Unlimited permits', 'Priority support', 'Unlimited cities', 'Event readiness', 'Team access'] },
};

// Billing service abstraction - handles both Google Play and Stripe
const BillingService = {
  isGooglePlayAvailable: Platform.OS === 'android',
  
  // Initialize billing - call on app start
  async initialize() {
    if (this.isGooglePlayAvailable) {
      // In production: Initialize Google Play Billing
      // await RNIap.initConnection();
      console.log('Google Play Billing would initialize here');
    }
    return true;
  },

  // Get available subscriptions
  async getSubscriptions() {
    if (this.isGooglePlayAvailable) {
      // In production: Fetch from Google Play
      // return await RNIap.getSubscriptions(Object.values(SUBSCRIPTION_SKUS));
      return Object.entries(PLAN_DETAILS).map(([key, plan]) => ({
        productId: SUBSCRIPTION_SKUS[key],
        ...plan,
        localizedPrice: plan.price,
      }));
    }
    return Object.entries(PLAN_DETAILS).map(([key, plan]) => ({ productId: key, ...plan }));
  },

  // Purchase subscription
  async purchaseSubscription(sku, plan) {
    if (this.isGooglePlayAvailable) {
      // In production: Use Google Play Billing
      // const purchase = await RNIap.requestSubscription(sku);
      // Then verify purchase with backend
      console.log('Would purchase via Google Play:', sku);
      // For now, fall back to Stripe
    }
    // Stripe checkout via backend
    const data = await api.post('/subscription/checkout', { plan, platform: Platform.OS });
    if (data.url) {
      await Linking.openURL(data.url);
    }
    return data;
  },

  // Restore purchases (required for App Store/Play Store)
  async restorePurchases() {
    if (this.isGooglePlayAvailable) {
      // In production: RNIap.getAvailablePurchases()
      console.log('Would restore purchases from Google Play');
    }
    // Verify with backend
    try {
      await api.get('/subscription/status');
      return true;
    } catch (e) {
      return false;
    }
  },

  // Manage subscription (opens platform subscription management)
  async manageSubscription() {
    if (this.isGooglePlayAvailable) {
      // Opens Google Play subscription management
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      // Opens App Store subscription management
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  },
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
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('permitwise_token');
      if (!token) { setLoading(false); return; }
      const data = await api.get('/auth/me');
      setUser(data.user); setBusiness(data.business); setSubscription(data.subscription);
      setSubscriptionStatus(data.subscriptionStatus);
    } catch (error) { await AsyncStorage.removeItem('permitwise_token'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

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
    setUser(null); setBusiness(null); setSubscription(null); setSubscriptionStatus(null);
  };

  // Check if subscription allows write operations
  const canWrite = subscriptionStatus?.canWrite ?? true;
  const isExpired = subscriptionStatus?.isExpired ?? false;

  return (
    <AuthContext.Provider value={{ user, business, subscription, subscriptionStatus, canWrite, isExpired, loading, login, register, logout, fetchUser, updateBusiness: setBusiness, isAuthenticated: !!user, hasCompletedOnboarding: !!business }}>
      {children}
    </AuthContext.Provider>
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

const CitySearchModal = ({ visible, onClose, state, onSelect }) => {
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
            {!loading && results.length === 0 && searchTerm.length >= 2 && (
              <View style={styles.citySearchEmpty}>
                <Text style={styles.citySearchEmptyText}>No matches found in our database.</Text>
                <TouchableOpacity style={styles.useCustomButton} onPress={handleUseCustom}>
                  <Text style={styles.useCustomButtonText}>Use "{searchTerm}" anyway</Text>
                </TouchableOpacity>
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', accountType: 'vendor' });
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
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
          <Text style={styles.trialBadge}>Full access for 14 days before payment</Text>
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
        <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        <TouchableOpacity style={styles.authLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authLinkText}>Have an account? <Text style={styles.authLinkBold}>Log in</Text></Text>
        </TouchableOpacity>
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
      Alert.alert('Thank You!', 'Your request has been submitted. We\'ll notify you when coverage is ready.');
    } catch (err) { Alert.alert('Error', err.message); }
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
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox. Please check your email and click the verification link.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification email. Please try again.');
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
          <View style={styles.trialBanner}><Text style={styles.trialText}>Full access ends {formatDate(subscription.trialEndsAt)} • Then payment begins</Text></View>
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
  const { business, canWrite, isExpired } = useAuth();
  const [permits, setPermits] = useState([]); const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingSuggestions, setAddingSuggestions] = useState(false);

  const handleAddPermit = () => {
    if (!canWrite) {
      Alert.alert('Subscription Expired', 'Please upgrade your subscription to add new permits.');
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
      Alert.alert('Subscription Expired', 'Please upgrade your subscription to add permits.');
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
        Alert.alert('No Suggestions', 'We don\'t have permit data for your city yet. You can add permits manually.');
      }
    } catch (err) { console.error(err); Alert.alert('Error', err.message); }
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
      Alert.alert('Success', `Added ${selectedSuggestions.length} permit(s)`);
    } catch (err) { Alert.alert('Error', err.message); }
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
      <FlatList
        data={permits}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); syncAndFetchPermits(); }} />}
        renderItem={({ item }) => (
          <Card style={styles.permitCard} onPress={() => navigation.navigate('PermitDetail', { permit: item })}>
            <View style={styles.permitHeader}>
              <Text style={styles.permitName}>{item.permitTypeId?.name}</Text>
              <Badge label={getStatusLabel(item.status)} variant={item.status === 'active' ? 'success' : item.status === 'expired' ? 'danger' : 'warning'} />
            </View>
            <Text style={styles.permitJurisdiction}>{item.jurisdictionId?.name}, {item.jurisdictionId?.state}</Text>
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
      <AddCityPermitsModal visible={showAddCityModal} onClose={() => setShowAddCityModal(false)} onSuccess={() => { setShowAddCityModal(false); fetchPermits(); }} />
      
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
const AddCityPermitsModal = ({ visible, onClose, onSuccess }) => {
  const { business } = useAuth();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const handleAdd = async () => {
    if (!city || !state) {
      Alert.alert('Error', 'Please enter city and state');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/permits/add-city', { city, state });
      setResult(data);
      Alert.alert('Success', data.message || 'Permits added for ' + city);
      onSuccess();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCity('');
    setState('');
    setResult(null);
    onClose();
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
              Add a city where you operate. We'll automatically add all required permits for your business type in that location.
            </Text>
            
            {result && (
              <View style={styles.successMessage}>
                <Icons.Check size={20} color={COLORS.success} />
                <Text style={styles.successText}>{result.message}</Text>
              </View>
            )}
            
            <Input label="City" value={city} onChangeText={setCity} placeholder="e.g., Austin" />
            
            <Text style={[styles.label, { marginTop: 12 }]}>State</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
              <Text style={state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{state || 'Select state'}</Text>
            </TouchableOpacity>
            
            <Button title={loading ? 'Adding Permits...' : 'Add City'} onPress={handleAdd} loading={loading} disabled={!city || !state} style={{ marginTop: 24 }} />
            <Button title="Cancel" variant="outline" onPress={handleClose} style={{ marginTop: 12 }} />
          </ScrollView>
          
          <PickerModal visible={showStatePicker} onClose={() => setShowStatePicker(false)} title="State" options={US_STATES.map(s => ({ value: s, label: s }))} value={state} onSelect={setState} />
        </View>
      </View>
    </Modal>
  );
};

const PermitDetailScreen = ({ route, navigation }) => {
  const { permit: initialPermit } = route.params;
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
  if (!permit || !permit.permitTypeId) {
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
      Alert.alert('Error', error.message);
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
          Alert.alert('Permission Required', 'Please grant camera permissions.');
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
          Alert.alert('Permission Required', 'Please grant photo library permissions.');
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
        formData.append('permitId', permit._id);
        
        try {
          await api.upload('/documents', formData);
          Alert.alert('Success', 'Document uploaded successfully');
          refreshPermit();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to upload document');
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };
  
  const handleViewDocument = async () => {
    if (permit.documentId?.fileUrl) {
      const secureUrl = await getSecureFileUrl(permit.documentId.fileUrl);
      await Linking.openURL(secureUrl);
    }
  };
  
  const importanceLabel = getImportanceLabel(permit.permitTypeId?.importanceLevel);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.detailScroll}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{permit.permitTypeId?.name}</Text>
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
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Jurisdiction</Text><Text style={styles.detailValue}>{permit.jurisdictionId?.name}, {permit.jurisdictionId?.state}</Text></View>
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
          <Text style={styles.permitTypeInfoTitle}>Document</Text>
          {permit.documentId ? (
            <TouchableOpacity style={styles.documentPreview} onPress={handleViewDocument}>
              <Icons.Document size={24} color={COLORS.primary} />
              <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>{permit.documentId.originalName || 'Attached Document'}</Text>
                <Text style={styles.documentHint}>Tap to view</Text>
              </View>
              <Icons.Download size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.uploadDocArea} onPress={handleUploadDocument} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <>
                  <Icons.Upload size={32} color={COLORS.gray400} />
                  <Text style={styles.uploadDocText}>Tap to upload document</Text>
                  <Text style={styles.uploadDocHint}>Photo or scan of your permit</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Card>
        
        {subscription?.features?.autofill && (
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
  const { business, canWrite, isExpired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permitTypes, setPermitTypes] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [selectedPermitType, setSelectedPermitType] = useState(null);
  const [showJurisdictionPicker, setShowJurisdictionPicker] = useState(false);
  const [showPermitTypePicker, setShowPermitTypePicker] = useState(false);
  const [form, setForm] = useState({ permitNumber: '', issueDate: '', expiryDate: '' });

  useEffect(() => {
    const fetchJurisdictions = async () => {
      try {
        const data = await api.get('/jurisdictions');
        setJurisdictions(data.jurisdictions || []);
      } catch (e) { console.error(e); }
    };
    fetchJurisdictions();
  }, []);

  const fetchPermitTypes = async (jurisdictionId) => {
    try {
      const data = await api.get(`/permit-types?jurisdictionId=${jurisdictionId}`);
      setPermitTypes(data.permitTypes || []);
    } catch (e) { console.error(e); }
  };

  const handleJurisdictionSelect = (jId) => {
    const j = jurisdictions.find(j => j._id === jId);
    setSelectedJurisdiction(j);
    setSelectedPermitType(null);
    fetchPermitTypes(jId);
  };

  const handleSubmit = async () => {
    // Check if user can write (subscription is active)
    if (!canWrite) {
      Alert.alert('Subscription Expired', 'Please upgrade your subscription to add new permits.');
      return;
    }
    
    if (!selectedJurisdiction || !selectedPermitType) {
      Alert.alert('Error', 'Please select jurisdiction and permit type');
      return;
    }
    setLoading(true);
    try {
      await api.post('/permits', {
        permitTypeId: selectedPermitType._id,
        jurisdictionId: selectedJurisdiction._id,
        vendorBusinessId: business._id,
        permitNumber: form.permitNumber,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        status: form.expiryDate ? 'active' : 'missing'
      });
      Alert.alert('Success', 'Permit added');
      navigation.goBack();
    } catch (e) { 
      // Handle subscription_expired error from server
      if (e.message?.includes('subscription') || e.message?.includes('expired')) {
        Alert.alert('Subscription Expired', 'Please upgrade your subscription to add new permits.');
      } else {
        Alert.alert('Error', e.message); 
      }
    }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formScroll}>
        <Text style={styles.label}>Jurisdiction *</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowJurisdictionPicker(true)}>
          <Text style={selectedJurisdiction ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {selectedJurisdiction ? `${selectedJurisdiction.name}, ${selectedJurisdiction.state}` : 'Select jurisdiction'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Permit Type *</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPermitTypePicker(true)} disabled={!selectedJurisdiction}>
          <Text style={selectedPermitType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {selectedPermitType ? selectedPermitType.name : (selectedJurisdiction ? 'Select permit type' : 'Select jurisdiction first')}
          </Text>
        </TouchableOpacity>

        <Input label="Permit Number (optional)" value={form.permitNumber} onChangeText={v => setForm(f => ({ ...f, permitNumber: v }))} placeholder="e.g., HP-2024-12345" />
        <Input label="Issue Date (optional)" value={form.issueDate} onChangeText={v => setForm(f => ({ ...f, issueDate: v }))} placeholder="YYYY-MM-DD" />
        <Input label="Expiry Date (optional)" value={form.expiryDate} onChangeText={v => setForm(f => ({ ...f, expiryDate: v }))} placeholder="YYYY-MM-DD" />

        <Button title="Add Permit" onPress={handleSubmit} loading={loading} style={{ marginTop: 24 }} />

        <PickerModal visible={showJurisdictionPicker} onClose={() => setShowJurisdictionPicker(false)} title="Select Jurisdiction"
          options={jurisdictions.map(j => ({ value: j._id, label: `${j.name}, ${j.state}` }))}
          value={selectedJurisdiction?._id} onSelect={handleJurisdictionSelect} />
        
        <PickerModal visible={showPermitTypePicker} onClose={() => setShowPermitTypePicker(false)} title="Select Permit Type"
          options={permitTypes.map(pt => ({ value: pt._id, label: pt.name }))}
          value={selectedPermitType?._id} onSelect={v => setSelectedPermitType(permitTypes.find(pt => pt._id === v))} />
      </ScrollView>
    </SafeAreaView>
  );
};

const EditPermitScreen = ({ route, navigation }) => {
  const { permit } = route.params;
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
      await api.put(`/permits/${permit._id}`, {
        permitNumber: form.permitNumber,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        status: form.status
      });
      Alert.alert('Success', 'Permit updated');
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Permit', 'Are you sure you want to delete this permit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/permits/${permit._id}`);
          navigation.navigate('PermitsList');
        } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.formScroll}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>{permit.permitTypeId?.name}</Text>
          <Text style={styles.infoCardSubtitle}>{permit.jurisdictionId?.name}, {permit.jurisdictionId?.state}</Text>
        </Card>

        <Input label="Permit Number" value={form.permitNumber} onChangeText={v => setForm(f => ({ ...f, permitNumber: v }))} placeholder="e.g., HP-2024-12345" />
        <Input label="Issue Date" value={form.issueDate} onChangeText={v => setForm(f => ({ ...f, issueDate: v }))} placeholder="YYYY-MM-DD" />
        <Input label="Expiry Date" value={form.expiryDate} onChangeText={v => setForm(f => ({ ...f, expiryDate: v }))} placeholder="YYYY-MM-DD" />

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
        try { await api.delete(`/documents/${id}`); fetchDocuments(); } catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  };

  const handleView = async (doc) => {
    if (doc.fileUrl) {
      const secureUrl = await getSecureFileUrl(doc.fileUrl);
      await Linking.openURL(secureUrl);
    }
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
              <Text style={styles.documentMeta}>{item.category} • {formatDate(item.createdAt)}</Text>
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
          Alert.alert('Permission Required', 'Camera access is needed to take photos');
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
          Alert.alert('Permission Required', 'Photo library access is needed');
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
      Alert.alert('Error', 'Failed to select file');
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
      Alert.alert('Select File', 'Please select a file to upload');
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
      Alert.alert('Success', 'Document uploaded successfully');
      setSelectedFile(null);
      setCategory('other');
      onSuccess();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to upload document');
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
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  
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
      Alert.alert('Success', 'Profile updated');
      setActiveSection(null);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const handleOrganizationSave = async () => {
    setLoading(true);
    try {
      await api.put('/organizer/profile', organizationData);
      await fetchUser();
      Alert.alert('Success', 'Organization profile updated');
      setActiveSection(null);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      await api.put('/organizer/notifications', notificationPrefs);
      await fetchUser();
      Alert.alert('Success', 'Notification preferences saved');
      setActiveSection(null);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const handleUpgrade = async () => {
    try {
      const data = await api.post('/organizer/subscription/checkout');
      if (data.url) Linking.openURL(data.url);
    } catch (err) { Alert.alert('Error', err.message); }
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
                {subscription?.status === 'active' ? 'Active' : subscription?.status === 'trial' ? `Trial - ${Math.max(0, Math.ceil((new Date(subscription?.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))} days left` : 'Inactive'}
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
    </SafeAreaView>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { user, business, subscription, subscriptionStatus, logout, fetchUser, updateBusiness } = useAuth();
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

  // Fetch team members if subscription allows
  useEffect(() => {
    if (subscription?.features?.teamAccounts) {
      api.get('/team').then(data => setTeamMembers(data.members || [])).catch(console.error);
    }
  }, [subscription]);

  const handleLogout = () => { Alert.alert('Log Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: logout }]); };
  const handleProfileSave = async () => { setLoading(true); try { await api.put('/auth/profile', profileData); await fetchUser(); Alert.alert('Success', 'Profile updated'); setActiveSection(null); } catch (err) { Alert.alert('Error', err.message); } finally { setLoading(false); } };
  const handleBusinessSave = async () => { setLoading(true); try { const data = await api.put('/business', businessData); updateBusiness(data.business); Alert.alert('Success', 'Business updated'); setActiveSection(null); } catch (err) { Alert.alert('Error', err.message); } finally { setLoading(false); } };
  
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
        Alert.alert('Food Handling Enabled', `Added ${syncResult.addedCount} food safety permit(s) to your dashboard.`);
      } else if (!checked && syncResult.removedCount > 0) {
        Alert.alert('Food Handling Disabled', `Removed ${syncResult.removedCount} empty food safety permit(s). Permits with documents were kept.`);
      } else {
        Alert.alert('Success', checked ? 'Food handling enabled.' : 'Food handling disabled.');
      }
    } catch (err) { 
      Alert.alert('Error', err.message);
      // Revert on error
      setBusinessData(d => ({ ...d, handlesFood: !checked }));
    } finally { setLoading(false); }
  };
  
  const handleNotificationSave = async () => { setLoading(true); try { await api.put('/auth/profile', { notificationPreferences: notificationPrefs }); await fetchUser(); Alert.alert('Success', 'Notification preferences updated'); setActiveSection(null); } catch (err) { Alert.alert('Error', err.message); } finally { setLoading(false); } };
  const addCity = () => setBusinessData(d => ({ ...d, operatingCities: [...d.operatingCities, { city: '', state: '', isPrimary: false }] }));
  const updateCity = (i, field, value) => { const cities = [...businessData.operatingCities]; cities[i] = { ...cities[i], [field]: value }; setBusinessData(d => ({ ...d, operatingCities: cities })); };
  const removeCity = (i) => { if (businessData.operatingCities.length > 1) setBusinessData(d => ({ ...d, operatingCities: d.operatingCities.filter((_, idx) => idx !== i) })); };
  
  const inviteTeamMember = async () => {
    if (!newMemberEmail) return;
    setLoading(true);
    try {
      await api.post('/team/invite', { email: newMemberEmail, role: 'member' });
      setNewMemberEmail('');
      const data = await api.get('/team');
      setTeamMembers(data.members || []);
      Alert.alert('Success', 'Invitation sent');
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const removeTeamMember = (id, name) => {
    Alert.alert('Remove Member', `Remove ${name} from your team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/team/${id}`);
          setTeamMembers(m => m.filter(t => t._id !== id));
        } catch (err) { Alert.alert('Error', err.message); }
      }}
    ]);
  };

  const getSubscriptionStatusText = () => {
    if (subscription?.status === 'trial') {
      const daysLeft = daysUntil(subscription.trialEndsAt);
      return `Full access for ${daysLeft} more days before payment`;
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
              <View key={i} style={styles.cityRow}>
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
                  {businessData.operatingCities.length > 1 && <TouchableOpacity onPress={() => removeCity(i)} style={styles.removeBtn}><Icons.X size={18} color={COLORS.danger} /></TouchableOpacity>}
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
            <Input label="Expiry Date" value={businessData.insurance.expiryDate ? businessData.insurance.expiryDate.split('T')[0] : ''} onChangeText={v => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, expiryDate: v } }))} placeholder="YYYY-MM-DD" />
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
          <TouchableOpacity onPress={() => InAppPurchase.manageSubscription()}>
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
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan);
    try {
      await BillingService.purchaseSubscription(SUBSCRIPTION_SKUS[plan], plan);
      Alert.alert('Success', 'Redirecting to checkout...');
      onSubscribe();
    } catch (error) {
      Alert.alert('Error', error.message);
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
        Alert.alert('Success', 'Purchases restored');
        onSubscribe();
        onClose();
      } else {
        Alert.alert('Info', 'No purchases to restore');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleManage = async () => {
    await BillingService.manageSubscription();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.subscriptionModal}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>Choose Your Plan</Text>
            <TouchableOpacity onPress={onClose}><Icons.X size={24} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.plansContainer}>
            <Text style={styles.subscriptionSubtitle}>Full access for 14 days before payment begins</Text>
            
            {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
              <TouchableOpacity 
                key={key} 
                style={[styles.planCard, currentPlan === key && styles.planCardCurrent, plan.popular && styles.planCardPopular]}
                onPress={() => handlePurchase(key)}
                disabled={loading || currentPlan === key}
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
                {currentPlan === key ? (
                  <View style={styles.currentPlanBadge}><Text style={styles.currentPlanText}>Current Plan</Text></View>
                ) : (
                  <Button 
                    title={loading && selectedPlan === key ? 'Processing...' : `Subscribe to ${plan.name}`} 
                    loading={loading && selectedPlan === key}
                    style={{ marginTop: 12 }}
                  />
                )}
              </TouchableOpacity>
            ))}

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

  const startInspection = (checklist) => {
    setActiveChecklist(checklist);
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
      await api.post('/inspections', { 
        checklistId: activeChecklist._id, 
        items: inspectionData.items, 
        notes: inspectionData.notes, 
        inspectionDate: new Date() 
      });
      Alert.alert('Success', 'Inspection completed!');
      setActiveChecklist(null);
      fetchData();
    } catch (err) { Alert.alert('Error', err.message); }
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
      Alert.alert('Success', 'Checklist created!');
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const deleteUserChecklist = async (id) => {
    Alert.alert('Delete Checklist', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete('/user-checklists/' + id);
          fetchData();
        } catch (err) { Alert.alert('Error', err.message); }
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
      Alert.alert('Thank You!', 'Your suggestion has been submitted.');
    } catch (err) { Alert.alert('Error', err.message); }
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

          <Button title="Upgrade to Pro" onPress={() => Alert.alert('Upgrade', 'Go to Settings > Subscription to upgrade your plan.')} style={styles.upgradeModalButton} />
          <Text style={styles.upgradeModalCancel}>14-day free trial • Cancel anytime</Text>
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
                  <TouchableOpacity style={styles.startBtnSmall} onPress={() => startInspection(item)}>
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
                    <Text style={styles.inspectionHistoryName}>{item.checklistId?.name || 'Inspection'}</Text>
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
                <Text style={styles.modalTitle}>{viewingInspection?.checklistId?.name || 'Inspection Results'}</Text>
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
  const [newEvent, setNewEvent] = useState({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', eventType: 'food_event', maxVendors: '', status: 'draft' });
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Check if user is an organizer
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;

  // Plan check for vendors: Elite, Promo, or Lifetime required
  const hasAccess = isOrganizer || subscription?.plan === 'elite' || subscription?.plan === 'promo' || subscription?.plan === 'lifetime' || subscription?.features?.eventIntegration;

  // Fetch organizer's events
  const fetchOrganizerEvents = async () => {
    try {
      const data = await api.get('/events/organizer/my-events');
      setOrganizerEvents(data.events || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Fetch vendor's events and published events for browsing
  const fetchMyEvents = async () => {
    try {
      const [myData, pubData] = await Promise.all([
        api.get('/events/my-events'),
        api.get('/events/published')
      ]);
      setEvents(myData.events || []);
      setPublishedEvents(pubData.events || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  // Apply to an event
  const applyToEvent = async () => {
    if (!showApplyModal) return;
    setApplyingToEvent(true);
    try {
      await api.post(`/events/${showApplyModal._id}/apply`, { notes: applicationNotes });
      Alert.alert('Success', 'Application submitted!');
      setShowApplyModal(null);
      setApplicationNotes('');
      fetchMyEvents();
    } catch (error) { Alert.alert('Error', error.message); }
    finally { setApplyingToEvent(false); }
  };

  // Respond to event invitation (accept/decline)
  const respondToInvitation = async (eventId, accept) => {
    try {
      await api.put(`/events/${eventId}/respond-invitation`, { accept });
      Alert.alert('Success', accept ? 'Invitation accepted!' : 'Invitation declined');
      fetchMyEvents();
    } catch (error) { Alert.alert('Error', error.message); }
  };

  // Fetch applications for an event
  const fetchEventApplications = async (eventId) => {
    try {
      const data = await api.get(`/events/organizer/${eventId}/applications`);
      setVendorApplications(data.applications || []);
      const event = organizerEvents.find(e => e._id === eventId);
      setSelectedOrgEvent(event);
    } catch (error) { Alert.alert('Error', error.message); }
  };

  // Handle vendor application
  const handleApplication = async (applicationId, status) => {
    try {
      await api.put(`/events/organizer/applications/${applicationId}`, { status });
      fetchEventApplications(selectedOrgEvent._id);
      Alert.alert('Success', `Application ${status}`);
    } catch (error) { Alert.alert('Error', error.message); }
  };

  // Invite vendor
  const inviteVendor = async () => {
    if (!inviteEmail || !selectedOrgEvent) return;
    try {
      await api.post(`/events/organizer/${selectedOrgEvent._id}/invite`, { email: inviteEmail });
      setInviteEmail('');
      Alert.alert('Success', 'Invitation sent');
      fetchEventApplications(selectedOrgEvent._id);
    } catch (error) { Alert.alert('Error', error.message); }
  };

  // Update event status
  const updateEventStatus = async (eventId, status) => {
    try {
      await api.put(`/events/organizer/${eventId}/status`, { status });
      fetchOrganizerEvents();
      Alert.alert('Success', `Event ${status}`);
    } catch (error) { Alert.alert('Error', error.message); }
  };

  // Create event
  const createEvent = async () => {
    if (!newEvent.eventName || !newEvent.startDate || !newEvent.city || !newEvent.state) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    try {
      await api.post('/events/organizer/create', newEvent);
      setShowCreateModal(false);
      setNewEvent({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', eventType: 'food_event', maxVendors: '', status: 'draft' });
      fetchOrganizerEvents();
      Alert.alert('Success', 'Event created');
    } catch (error) { Alert.alert('Error', error.message); }
  };

  useEffect(() => {
    if (isOrganizer) fetchOrganizerEvents();
    else if (hasAccess) fetchMyEvents();
    else setLoading(false);
  }, [isOrganizer, hasAccess]);

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
    } catch (err) { Alert.alert('Error', err.message); }
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
          {[{ key: 'my-events', label: '🎪 Events' }, { key: 'applications', label: '📋 Applications' }].map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.organizerTab, organizerTab === tab.key && styles.organizerTabActive]} onPress={() => { setOrganizerTab(tab.key); setSelectedOrgEvent(null); }}>
              <Text style={[styles.organizerTabText, organizerTab === tab.key && styles.organizerTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.createEventButton} onPress={() => setShowCreateModal(true)}>
            <Icons.Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* My Events Tab */}
        {organizerTab === 'my-events' && !selectedOrgEvent && (
          <FlatList
            data={organizerEvents}
            keyExtractor={item => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrganizerEvents(); }} />}
            renderItem={({ item }) => (
              <Card style={styles.organizerEventCard}>
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
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'published' ? '#dcfce7' : item.status === 'closed' ? '#fef3c7' : '#f3f4f6' }]}>
                    <Text style={[styles.statusBadgeText, { color: item.status === 'published' ? '#166534' : item.status === 'closed' ? '#92400e' : '#374151' }]}>{item.status?.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.organizerEventStats}>
                  <Text style={styles.organizerEventStat}>{item.vendorApplications?.length || 0} applications</Text>
                  <Text style={styles.organizerEventStat}>{item.assignedVendors?.length || 0} vendors</Text>
                </View>
                <View style={styles.organizerEventActions}>
                  <Button title="Manage" variant="outline" size="sm" onPress={() => fetchEventApplications(item._id)} style={{ flex: 1 }} />
                  {item.status === 'draft' && <Button title="Publish" size="sm" onPress={() => updateEventStatus(item._id, 'published')} style={{ flex: 1 }} />}
                  {item.status === 'published' && <Button title="Close" variant="outline" size="sm" onPress={() => updateEventStatus(item._id, 'closed')} style={{ flex: 1 }} />}
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icons.Event size={48} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>No events yet</Text>
                <Text style={styles.emptyText}>Create your first event to start accepting vendor applications.</Text>
                <Button title="Create Event" onPress={() => setShowCreateModal(true)} style={{ marginTop: 16 }} />
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
                <View style={styles.inviteForm}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Vendor email" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" />
                  <Button title="Invite" onPress={inviteVendor} disabled={!inviteEmail} />
                </View>
              </View>
            </Card>

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
                    <Text style={styles.label}>Start Date *</Text>
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newEvent.startDate} onChangeText={v => setNewEvent(f => ({ ...f, startDate: v }))} />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>End Date</Text>
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newEvent.endDate} onChangeText={v => setNewEvent(f => ({ ...f, endDate: v }))} />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.halfInput}><Input label="City *" placeholder="Austin" value={newEvent.city} onChangeText={v => setNewEvent(f => ({ ...f, city: v }))} /></View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>State *</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
                      <Text style={newEvent.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{newEvent.state || 'Select'}</Text>
                      <Icons.ChevronDown size={16} color={COLORS.gray400} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.label}>Event Type</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTypePicker(true)}>
                  <Text style={styles.pickerButtonText}>{newEvent.eventType.replace('_', ' ')}</Text>
                  <Icons.ChevronDown size={16} color={COLORS.gray400} />
                </TouchableOpacity>
                <Input label="Max Vendors" placeholder="50" value={newEvent.maxVendors} onChangeText={v => setNewEvent(f => ({ ...f, maxVendors: v }))} keyboardType="number-pad" />
                <View style={styles.modalFooter}>
                  <Button title="Cancel" variant="outline" onPress={() => setShowCreateModal(false)} style={{ flex: 1 }} />
                  <Button title="Create Event" onPress={createEvent} disabled={!newEvent.eventName || !newEvent.startDate || !newEvent.city || !newEvent.state} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* State Picker Modal */}
        <Modal visible={showStatePicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select State</Text>
                <TouchableOpacity onPress={() => setShowStatePicker(false)}><Icons.X size={24} color={COLORS.gray500} /></TouchableOpacity>
              </View>
              <FlatList data={US_STATES} keyExtractor={item => item} renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => { setNewEvent(f => ({ ...f, state: item })); setShowStatePicker(false); }}>
                  <Text style={styles.pickerItemText}>{item}</Text>
                  {newEvent.state === item && <Icons.Check size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )} />
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

          <Button title="Upgrade to Elite" onPress={() => Alert.alert('Upgrade', 'Go to Settings > Subscription to upgrade your plan.')} style={styles.upgradeModalButton} />
          <Text style={styles.upgradeModalCancel}>14-day free trial • Cancel anytime</Text>
          
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
  const organizerInvitations = events.filter(e => e.eventSource === 'organizer_invitation');
  const participatingEvents = events.filter(e => e.eventSource === 'admin_added' || e.eventSource === 'vendor_application');
  
  // Available events to apply to (not already applied)
  const appliedEventIds = new Set([
    ...events.map(e => e._id),
    ...publishedEvents.filter(e => e.vendorApplications?.some(a => a.vendorBusinessId === business?._id)).map(e => e._id)
  ]);
  const availableEvents = publishedEvents.filter(e => !appliedEventIds.has(e._id) && e.status === 'published');

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
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Event Readiness</Text>
          <Text style={styles.pageSubtitle}>Your compliance status for events</Text>
        </View>
        <TouchableOpacity style={styles.requestEventButtonSmall} onPress={() => setShowRequestModal(true)}>
          <Icons.Plus size={16} color={COLORS.primary} />
          <Text style={styles.requestEventButtonSmallText}>Request</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyEvents(); }} />}
      >
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
                      {selectedEvent.issues.map((issue, i) => (
                        <View key={i} style={[styles.issueItem, { borderLeftColor: issue.type === 'missing' || issue.type === 'expired' ? COLORS.danger : COLORS.warning }]}>
                          {issue.type === 'missing' && <Text style={styles.issueItemText}>🚫 <Text style={styles.issueBold}>{issue.permit}</Text> - Permit not found</Text>}
                          {issue.type === 'expired' && <Text style={styles.issueItemText}>⏰ <Text style={styles.issueBold}>{issue.permit}</Text> - Expired</Text>}
                          {issue.type === 'missing_document' && <Text style={styles.issueItemText}>📄 <Text style={styles.issueBold}>{issue.permit}</Text> - Document missing</Text>}
                          {issue.type === 'in_progress' && <Text style={styles.issueItemText}>⏳ <Text style={styles.issueBold}>{issue.permit}</Text> - In progress</Text>}
                        </View>
                      ))}
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
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;
  return isOrganizer ? <OrganizerTabs /> : <VendorTabs />;
};

// Wrapper that includes subscription banner
const MainTabsWithBanner = () => {
  const { user, isExpired } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;
  
  return (
    <View style={{ flex: 1 }}>
      {isExpired && !isOrganizer && (
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
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading PermitWise...</Text></View>;
  if (!isAuthenticated) return <AuthNavigator />;
  // Organizers skip onboarding (they don't need business setup)
  if (!hasCompletedOnboarding && !isOrganizer) return <OnboardingScreen />;
  return <MainTabsWithBanner />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
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
  pickerModal: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  pickerTitle: { fontSize: 18, fontWeight: '600' },
  pickerDone: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  pickerScroll: { padding: 8 },
  pickerItem: { padding: 16, borderRadius: 8 },
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
  permitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
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
  documentPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: COLORS.gray50, borderRadius: 8 },
  documentInfo: { flex: 1 },
  documentName: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  documentHint: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  uploadDocArea: { alignItems: 'center', justifyContent: 'center', padding: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.gray300, borderRadius: 8, backgroundColor: COLORS.gray50 },
  uploadDocText: { fontSize: 14, fontWeight: '500', color: COLORS.gray600, marginTop: 12 },
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
  organizerEventActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: '500' },
  eventManagementCard: { marginBottom: 16 },
  eventManagementTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray800, marginBottom: 4 },
  eventManagementMeta: { fontSize: 14, color: COLORS.gray500, marginBottom: 16 },
  inviteSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  inviteSectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray700, marginBottom: 8 },
  inviteForm: { flexDirection: 'row', gap: 8, alignItems: 'center' },
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

