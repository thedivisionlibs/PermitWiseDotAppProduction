// PermitWise - React Native Mobile Application
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, RefreshControl, StatusBar, Platform, Image, FlatList, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';

// ===========================================
// CONFIGURATION
// ===========================================
const API_URL = 'http://localhost:5000/api'; // Change to your production URL

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
  Event: ({ size = 24, color = '#64748b' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" />
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
  { value: 'food_truck', label: 'Food Truck' }, { value: 'tent_vendor', label: 'Tent/Booth Vendor' },
  { value: 'mobile_retail', label: 'Mobile Retail' }, { value: 'farmers_market', label: "Farmer's Market" },
  { value: 'craft_vendor', label: 'Craft Vendor' }, { value: 'mobile_bartender', label: 'Mobile Bartender' },
  { value: 'pop_up_shop', label: 'Pop-Up Shop' }, { value: 'other', label: 'Other' },
];

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
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
const daysUntil = (date) => date ? Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
const getStatusLabel = (status) => ({ active: 'Active', expired: 'Expired', pending_renewal: 'Expiring Soon', missing: 'Missing', in_progress: 'In Progress' }[status] || status);
const getStatusColor = (status) => ({ active: COLORS.success, expired: COLORS.danger, pending_renewal: COLORS.warning, missing: COLORS.gray400 }[status] || COLORS.gray500);

// ===========================================
// AUTH CONTEXT
// ===========================================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('permitwise_token');
      if (!token) { setLoading(false); return; }
      const data = await api.get('/auth/me');
      setUser(data.user); setBusiness(data.business); setSubscription(data.subscription);
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
    setUser(null); setBusiness(null); setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{ user, business, subscription, loading, login, register, logout, fetchUser, updateBusiness: setBusiness, isAuthenticated: !!user, hasCompletedOnboarding: !!business }}>
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

const Input = ({ label, error, ...props }) => (
  <View style={styles.formGroup}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput style={[styles.input, error && styles.inputError]} placeholderTextColor={COLORS.gray400} {...props} />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

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
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
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
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try { await register(form); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeader}>
          <Icons.Shield size={48} /><Text style={styles.authTitle}>PermitWise</Text><Text style={styles.authSubtitle}>Create your account</Text>
        </View>
        {error ? <View style={styles.alertError}><Text style={styles.alertText}>{error}</Text></View> : null}
        <View style={styles.row}>
          <View style={styles.halfInput}><Input label="First Name" value={form.firstName} onChangeText={v => setForm(f => ({ ...f, firstName: v }))} /></View>
          <View style={styles.halfInput}><Input label="Last Name" value={form.lastName} onChangeText={v => setForm(f => ({ ...f, lastName: v }))} /></View>
        </View>
        <Input label="Email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
        <Input label="Password" value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} secureTextEntry />
        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={v => setForm(f => ({ ...f, confirmPassword: v }))} secureTextEntry />
        <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        <TouchableOpacity style={styles.authLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authLinkText}>Have an account? <Text style={styles.authLinkBold}>Log in</Text></Text>
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
  const [form, setForm] = useState({ businessName: '', primaryVendorType: '', operatingCities: [{ city: '', state: '', isPrimary: true }] });
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedPermits, setSelectedPermits] = useState([]);
  const [loadingPermits, setLoadingPermits] = useState(false);
  const [coverageStatus, setCoverageStatus] = useState(null);

  const fetchSuggestedPermits = async () => {
    if (!form.operatingCities[0].city || !form.operatingCities[0].state) return;
    setLoadingPermits(true);
    try {
      const data = await api.get('/permit-types/required?city=' + form.operatingCities[0].city + '&state=' + form.operatingCities[0].state + '&vendorType=' + form.primaryVendorType);
      setSuggestedPermits(data.permitTypes || []);
      setSelectedPermits((data.permitTypes || []).map(p => p._id));
      if (data.permitTypes?.length >= 4) setCoverageStatus('full');
      else if (data.permitTypes?.length > 0) setCoverageStatus('partial');
      else setCoverageStatus('none');
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
            <Button title="Continue →" onPress={() => setStep(2)} disabled={!form.businessName || !form.primaryVendorType} style={{ marginTop: 16 }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.onboardingHeaderTitle}>Where do you operate?</Text>
            <Text style={styles.onboardingHeaderSubtitle}>We'll find the permits required in your city</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}><Input label="Primary City *" placeholder="e.g. Austin" value={form.operatingCities[0].city} onChangeText={v => setForm(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], city: v }] }))} /></View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(true)}>
                  <Text style={form.operatingCities[0].state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{form.operatingCities[0].state || 'Select'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <PickerModal visible={showStatePicker} onClose={() => setShowStatePicker(false)} title="State" options={US_STATES.map(s => ({ value: s, label: s }))} value={form.operatingCities[0].state} onSelect={v => setForm(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], state: v }] }))} />
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
    try { const data = await api.get('/stats/dashboard'); setStats(data.stats); }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}>
        {!user?.emailVerified && (
          <View style={styles.emailBanner}>
            <Icons.Bell size={16} color="#92400e" />
            <Text style={styles.emailBannerText}>Verify your email for permit alerts</Text>
            <TouchableOpacity onPress={() => api.post('/auth/resend-verification')}><Text style={styles.emailBannerLink}>Resend</Text></TouchableOpacity>
          </View>
        )}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {business?.businessName}!</Text>
          <Text style={styles.headerSubtitle}>Compliance overview</Text>
        </View>
        {subscription?.status === 'trial' && (
          <View style={styles.trialBanner}><Text style={styles.trialText}>Trial ends {formatDate(subscription.trialEndsAt)}</Text></View>
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
  const [permits, setPermits] = useState([]); const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);

  const fetchPermits = async () => {
    try { const data = await api.get('/permits'); setPermits(data.permits); setSummary(data.summary); }
    catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPermits(); }, []);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Permits</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add Permit', 'Use the web app to add permits')}>
          <Icons.Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPermits(); }} />}
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
        ListEmptyComponent={<View style={styles.emptyContainer}><Icons.Permit size={48} color={COLORS.gray300} /><Text style={styles.emptyTitle}>No permits yet</Text><Text style={styles.emptyText}>Add a city to get started</Text></View>}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const PermitDetailScreen = ({ route, navigation }) => {
  const { permit } = route.params;
  
  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', color: COLORS.danger };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', color: COLORS.warning };
    if (level === 'event_required') return { text: 'Event Required', color: COLORS.primary };
    return null;
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
        <Button title="Edit in Web App" variant="outline" onPress={() => Alert.alert('Edit Permit', 'Use the web app for full editing capabilities')} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try { const data = await api.get('/documents'); setDocuments(data.documents); }
    catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}><Text style={styles.pageTitle}>Documents</Text></View>
      <FlatList
        data={documents}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDocuments(); }} />}
        renderItem={({ item }) => (
          <Card style={styles.documentCard}>
            <View style={styles.documentIcon}><Icons.Document size={24} color={COLORS.gray500} /></View>
            <View style={styles.documentInfo}><Text style={styles.documentName} numberOfLines={1}>{item.originalName}</Text><Text style={styles.documentMeta}>{item.category} • {formatDate(item.createdAt)}</Text></View>
            <Icons.ChevronRight size={20} color={COLORS.gray400} />
          </Card>
        )}
        ListEmptyComponent={<View style={styles.emptyContainer}><Icons.Document size={48} color={COLORS.gray300} /><Text style={styles.emptyTitle}>No documents yet</Text></View>}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const FEATURE_FLAGS = { inspections: false, events: false }; // Set to true to enable

const SettingsScreen = ({ navigation }) => {
  const { user, business, subscription, logout, fetchUser, updateBusiness } = useAuth();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [businessData, setBusinessData] = useState({
    businessName: business?.businessName || '', dbaName: business?.dbaName || '', ein: business?.ein || '',
    phone: business?.phone || '', email: business?.email || '',
    address: business?.address || { street: '', city: '', state: '', zip: '' },
    operatingCities: business?.operatingCities || [{ city: '', state: '', isPrimary: true }]
  });
  const [showStatePicker, setShowStatePicker] = useState(false);

  const handleLogout = () => { Alert.alert('Log Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: logout }]); };
  const handleProfileSave = async () => { setLoading(true); try { await api.put('/auth/profile', profileData); await fetchUser(); Alert.alert('Success', 'Profile updated'); setActiveSection(null); } catch (err) { Alert.alert('Error', err.message); } finally { setLoading(false); } };
  const handleBusinessSave = async () => { setLoading(true); try { const data = await api.put('/business', businessData); updateBusiness(data.business); Alert.alert('Success', 'Business updated'); setActiveSection(null); } catch (err) { Alert.alert('Error', err.message); } finally { setLoading(false); } };
  const addCity = () => setBusinessData(d => ({ ...d, operatingCities: [...d.operatingCities, { city: '', state: '', isPrimary: false }] }));
  const updateCity = (i, field, value) => { const cities = [...businessData.operatingCities]; cities[i] = { ...cities[i], [field]: value }; setBusinessData(d => ({ ...d, operatingCities: cities })); };
  const removeCity = (i) => { if (businessData.operatingCities.length > 1) setBusinessData(d => ({ ...d, operatingCities: d.operatingCities.filter((_, idx) => idx !== i) })); };

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
            <Input label="Phone" value={profileData.phone} onChangeText={v => setProfileData(d => ({ ...d, phone: v }))} keyboardType="phone-pad" />
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
              <View style={styles.halfInput}><Input label="Phone" value={businessData.phone} onChangeText={v => setBusinessData(d => ({ ...d, phone: v }))} /></View>
              <View style={styles.halfInput}><Input label="Email" value={businessData.email} onChangeText={v => setBusinessData(d => ({ ...d, email: v }))} /></View>
            </View>
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
                  <View style={styles.halfInput}><Input placeholder="City" value={city.city} onChangeText={v => updateCity(i, 'city', v)} /></View>
                  <View style={styles.halfInput}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStatePicker(i)}>
                      <Text style={city.state ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>{city.state || 'State'}</Text>
                    </TouchableOpacity>
                  </View>
                  {businessData.operatingCities.length > 1 && <TouchableOpacity onPress={() => removeCity(i)} style={styles.removeBtn}><Icons.X size={18} color={COLORS.danger} /></TouchableOpacity>}
                </View>
              </View>
            ))}
            <Button title="+ Add City" variant="outline" onPress={addCity} style={{ marginBottom: 12 }} />
            <Button title="Save Cities" onPress={handleBusinessSave} loading={loading} />
          </Card>
        )}

        <Card style={styles.settingsCard}>
          <Text style={styles.settingsSection}>Subscription</Text>
          <View style={styles.settingsRow}><Text style={styles.settingsLabel}>Plan</Text><Badge label={subscription?.plan?.toUpperCase() || 'TRIAL'} variant="primary" /></View>
          <View style={styles.settingsRow}><Text style={styles.settingsLabel}>Status</Text><Text style={styles.settingsValue}>{subscription?.status}</Text></View>
          {subscription?.status === 'trial' && <Text style={styles.trialNote}>Trial ends {formatDate(subscription.trialEndsAt)}</Text>}
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.settingsSection}>Legal</Text>
          <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('https://permitwise.com/privacy')}>
            <Text style={styles.settingsLabel}>Privacy Policy</Text>
            <Icons.ChevronRight size={18} color={COLORS.gray400} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('https://permitwise.com/terms')}>
            <Text style={styles.settingsLabel}>Terms of Service</Text>
            <Icons.ChevronRight size={18} color={COLORS.gray400} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={() => Linking.openURL('mailto:support@permitwise.com')}>
            <Text style={styles.settingsLabel}>Contact Support</Text>
            <Icons.ChevronRight size={18} color={COLORS.gray400} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.appVersion}>PermitWise v1.0.0</Text>

        <Button title="Log Out" variant="outline" onPress={handleLogout} style={styles.logoutButton} />

        <PickerModal visible={showStatePicker !== false} onClose={() => setShowStatePicker(false)} title="State" options={US_STATES.map(s => ({ value: s, label: s }))} 
          value={showStatePicker === 'address' ? businessData.address.state : businessData.operatingCities[showStatePicker]?.state}
          onSelect={v => { if (showStatePicker === 'address') setBusinessData(d => ({ ...d, address: { ...d.address, state: v } })); else updateCity(showStatePicker, 'state', v); }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InspectionsScreen = () => {
  if (!FEATURE_FLAGS.inspections) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}><Icons.Checklist size={48} color={COLORS.primary} /></View>
          <Text style={styles.comingSoonTitle}>Inspection Checklists</Text>
          <Badge label="Coming Soon" variant="primary" />
          <Text style={styles.comingSoonText}>Walk through health inspections step-by-step before the inspector arrives.</Text>
          <View style={styles.comingSoonFeatures}>
            <Text style={styles.featureItem}>✓ Pre-inspection checklists by city</Text>
            <Text style={styles.featureItem}>✓ Offline mode for on-site prep</Text>
            <Text style={styles.featureItem}>✓ Photo documentation</Text>
            <Text style={styles.featureItem}>✓ Common violation alerts</Text>
          </View>
          <Text style={styles.comingSoonNote}>Available with Pro plan when launched</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
  // Full implementation would go here when enabled
  return <SafeAreaView style={styles.container}><Text>Inspections feature enabled</Text></SafeAreaView>;
};

const EventsScreen = () => {
  if (!FEATURE_FLAGS.events) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.comingSoonContainer}>
          <View style={styles.comingSoonIcon}><Icons.Event size={48} color={COLORS.primary} /></View>
          <Text style={styles.comingSoonTitle}>Event Marketplace</Text>
          <Badge label="Coming Soon" variant="primary" />
          <Text style={styles.comingSoonText}>Find festivals, farmers markets, and pop-up opportunities in your area.</Text>
          <View style={styles.comingSoonFeatures}>
            <Text style={styles.featureItem}>✓ Browse local events</Text>
            <Text style={styles.featureItem}>✓ One-click permit readiness check</Text>
            <Text style={styles.featureItem}>✓ Apply directly through PermitWise</Text>
            <Text style={styles.featureItem}>✓ Get notified of opportunities</Text>
          </View>
          <Text style={styles.comingSoonNote}>Available with Elite plan when launched</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
  // Full implementation would go here when enabled
  return <SafeAreaView style={styles.container}><Text>Events feature enabled</Text></SafeAreaView>;
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
  </AuthStack.Navigator>
);

const PermitsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="PermitsList" component={PermitsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PermitDetail" component={PermitDetailScreen} options={{ title: 'Permit Details', headerStyle: { backgroundColor: COLORS.white }, headerTintColor: COLORS.gray800 }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.gray400,
    tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.gray200, paddingBottom: Platform.OS === 'ios' ? 20 : 8, height: Platform.OS === 'ios' ? 85 : 65 },
    tabBarIcon: ({ color, size }) => {
      const icons = { Dashboard: Icons.Dashboard, Permits: Icons.Permit, Documents: Icons.Document, Settings: Icons.Settings };
      const Icon = icons[route.name];
      return Icon ? <Icon size={size} color={color} /> : null;
    },
  })}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Permits" component={PermitsStack} />
    <Tab.Screen name="Documents" component={DocumentsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// ===========================================
// APP ROOT
// ===========================================
const AppContent = () => {
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAuth();

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading PermitWise...</Text></View>;
  if (!isAuthenticated) return <AuthNavigator />;
  if (!hasCompletedOnboarding) return <OnboardingScreen />;
  return <MainTabs />;
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
});
