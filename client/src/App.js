// PermitWise - Complete React Web Application
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import './App.css';

// ===========================================
// CONFIGURATION
// ===========================================
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
const BASE_URL = process.env.REACT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// Helper to get secure file URLs with authentication token
const getSecureFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  const token = localStorage.getItem('permitwise_token');
  if (!token) return fileUrl;
  
  // If it's already a full URL with the base, extract the path
  const url = fileUrl.includes('/uploads/') ? fileUrl : `${BASE_URL}${fileUrl}`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${token}`;
};

// ===========================================
// CONTEXT
// ===========================================
const AuthContext = createContext(null);
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ===========================================
// API HELPER
// ===========================================
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('permitwise_token');
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
  async upload(endpoint, formData) {
    const token = localStorage.getItem('permitwise_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers, body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};

// ===========================================
// ICONS (SVG Components)
// ===========================================
const Icons = {
  Dashboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Permit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Document: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13,2 13,9 20,9"/></svg>,
  Checklist: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Event: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Truck: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  MapPin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

// ===========================================
// CONSTANTS
// ===========================================
const VENDOR_TYPES = [
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'food_cart', label: 'Food Cart' },
  { value: 'tent_vendor', label: 'Tent/Booth Vendor' },
  { value: 'mobile_retail', label: 'Mobile Retail' },
  { value: 'farmers_market', label: "Farmer's Market Seller" },
  { value: 'craft_vendor', label: 'Craft Vendor' },
  { value: 'mobile_bartender', label: 'Mobile Bartender' },
  { value: 'mobile_groomer', label: 'Mobile Groomer' },
  { value: 'pop_up_shop', label: 'Pop-Up Shop' },
  { value: 'other', label: 'Other' },
];

// Vendor types that typically handle food (auto-suggest food permits)
const FOOD_VENDOR_TYPES = ['food_truck', 'food_cart', 'mobile_bartender', 'farmers_market'];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const daysUntil = (date) => {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

const getStatusLabel = (status) => {
  const labels = { active: 'Active', expired: 'Expired', pending_renewal: 'Expiring Soon', missing: 'Missing', in_progress: 'In Progress' };
  return labels[status] || status;
};

// ===========================================
// COMMON COMPONENTS
// ===========================================
const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', className = '' }) => (
  <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} onClick={onClick} disabled={disabled || loading}>
    {loading ? <span className="spinner" /> : children}
  </button>
);

const Input = ({ label, error, className = '', ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input className={`form-input ${error ? 'error' : ''} ${className}`} {...props} />
    {error && <span className="form-error">{error}</span>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <select className={`form-select ${error ? 'error' : ''}`} {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className="form-error">{error}</span>}
  </div>
);

const CitySearch = ({ label, state, value, onChange, placeholder = 'Search for your city...' }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

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

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onChange(term); // Update parent immediately
    setShowDropdown(true);
    
    // Debounce the API call
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchCities(term), 300);
  };

  const handleSelect = (jurisdiction) => {
    const cityName = jurisdiction.city || jurisdiction.name;
    setSearchTerm(cityName);
    onChange(cityName);
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div className="form-group city-search-wrapper" ref={wrapperRef}>
      {label && <label className="form-label">{label}</label>}
      <input
        className="form-input"
        placeholder={state ? placeholder : 'Select a state first'}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => state && searchTerm.length >= 2 && setShowDropdown(true)}
        disabled={!state}
      />
      {showDropdown && (results.length > 0 || loading) && (
        <div className="city-search-dropdown">
          {loading && <div className="city-search-loading">Searching...</div>}
          {!loading && results.length > 0 && results.map(j => (
            <div key={j._id} className="city-search-option" onClick={() => handleSelect(j)}>
              <span className="city-name">{j.city || j.name}</span>
              <span className="city-type">{j.type}</span>
            </div>
          ))}
          {!loading && results.length === 0 && searchTerm.length >= 2 && (
            <div className="city-search-empty">
              No matches found. You can still enter "{searchTerm}" manually.
            </div>
          )}
        </div>
      )}
      {!state && <span className="form-hint">Please select a state first</span>}
    </div>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div className={`card ${className}`} onClick={onClick}>{children}</div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><Icons.X /></button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

const Alert = ({ type = 'info', children, onClose }) => (
  <div className={`alert alert-${type}`}>
    <div className="alert-content">{children}</div>
    {onClose && <button className="alert-close" onClick={onClose}><Icons.X /></button>}
  </div>
);

const LoadingSpinner = () => <div className="loading-spinner"><div className="spinner" /></div>;
const Badge = ({ children, variant = 'default' }) => <span className={`badge badge-${variant}`}>{children}</span>;
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">{Icon && <div className="empty-state-icon"><Icon /></div>}<h3>{title}</h3>{description && <p>{description}</p>}{action}</div>
);

// Expired Subscription Banner - shows persistent banner for expired users
const ExpiredSubscriptionBanner = () => {
  const { isExpired } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  if (!isExpired) return null;
  
  return (
    <>
      <div className="expired-banner">
        <div className="expired-banner-content">
          <Icons.Alert />
          <span><strong>Your subscription has expired.</strong> You have read-only access. Upgrade to resume full functionality.</span>
        </div>
        <button className="expired-banner-btn" onClick={() => setShowUpgradeModal(true)}>Upgrade Now</button>
      </div>
      <UpgradeRequiredModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason="Your subscription has expired" />
    </>
  );
};

// Upgrade Required Modal - shows when expired users try to use premium features
const UpgradeRequiredModal = ({ isOpen, onClose, reason = 'This feature requires an active subscription', feature = null }) => {
  const { subscription } = useAuth();
  
  const planFeatures = {
    basic: ['Permit tracking for 1 city', 'Document storage', 'Email reminders', 'Basic compliance dashboard'],
    pro: ['Everything in Basic', 'Multi-city support (up to 3)', 'SMS alerts', 'Inspection checklists', 'PDF autofill'],
    elite: ['Everything in Pro', 'Unlimited cities', 'Event integration', 'Team accounts', 'Priority support', 'API access']
  };
  
  const planPrices = { basic: 29, pro: 49, elite: 99 };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Required" size="lg">
      <div className="upgrade-modal">
        <div className="upgrade-reason">
          <Icons.Lock />
          <div>
            <h3>{reason}</h3>
            <p>Choose a plan to continue using PermitWise with full access to all features.</p>
          </div>
        </div>
        
        {feature && (
          <div className="feature-highlight">
            <strong>Feature needed:</strong> {feature}
          </div>
        )}
        
        <div className="plans-grid">
          {['basic', 'pro', 'elite'].map(plan => (
            <div key={plan} className={`plan-card ${plan === 'pro' ? 'recommended' : ''}`}>
              {plan === 'pro' && <div className="plan-badge">Most Popular</div>}
              <h4>{plan.charAt(0).toUpperCase() + plan.slice(1)}</h4>
              <div className="plan-price">${planPrices[plan]}<span>/mo</span></div>
              <ul className="plan-features">
                {planFeatures[plan].map((f, i) => <li key={i}><Icons.Check /> {f}</li>)}
              </ul>
              <Button onClick={() => window.location.hash = 'settings'} className={plan === 'pro' ? '' : 'btn-outline'}>
                {subscription?.plan === plan ? 'Current Plan' : 'Choose Plan'}
              </Button>
            </div>
          ))}
        </div>
        
        <p className="upgrade-note">All plans include a 14-day free trial. Cancel anytime.</p>
      </div>
    </Modal>
  );
};

// Lock Icon overlay for premium sections (utility component for future use)
// eslint-disable-next-line no-unused-vars
const PremiumLock = ({ feature, children }) => {
  const { isExpired, subscriptionStatus } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  // Check if feature is available
  const hasFeature = subscriptionStatus?.features?.[feature] ?? false;
  const isLocked = isExpired || !hasFeature;
  
  if (!isLocked) return children;
  
  return (
    <>
      <div className="premium-locked" onClick={() => setShowUpgrade(true)}>
        <div className="locked-overlay">
          <Icons.Lock />
          <span>Premium Feature</span>
        </div>
        <div className="locked-content">{children}</div>
      </div>
      <UpgradeRequiredModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature={feature} />
    </>
  );
};

// ===========================================
// AUTH PROVIDER
// ===========================================
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('permitwise_token');
      if (!token) { setLoading(false); return; }
      const data = await api.get('/auth/me');
      setUser(data.user); setBusiness(data.business); setSubscription(data.subscription);
      setSubscriptionStatus(data.subscriptionStatus);
    } catch (error) { localStorage.removeItem('permitwise_token'); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('permitwise_token', data.token);
    setUser(data.user); await fetchUser(); return data;
  };

  const register = async (userData) => {
    const data = await api.post('/auth/register', userData);
    localStorage.setItem('permitwise_token', data.token);
    setUser(data.user); return data;
  };

  const logout = () => { localStorage.removeItem('permitwise_token'); setUser(null); setBusiness(null); setSubscription(null); setSubscriptionStatus(null); };

  // Check if subscription allows write operations
  const canWrite = subscriptionStatus?.canWrite ?? true;
  const isExpired = subscriptionStatus?.isExpired ?? false;

  return (
    <AuthContext.Provider value={{ user, business, subscription, subscriptionStatus, canWrite, isExpired, loading, login, register, logout, fetchUser, updateBusiness: setBusiness, updateSubscription: setSubscription, isAuthenticated: !!user, hasCompletedOnboarding: !!business }}>
      {children}
    </AuthContext.Provider>
  );
};

// ===========================================
// PAGES
// ===========================================
const LoginPage = ({ onSwitch, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page"><div className="auth-container">
      <div className="auth-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div><h1>Welcome back</h1></div>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <Alert type="error">{error}</Alert>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="password-input-wrapper">
          <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
        </div>
        <div className="forgot-password-link"><button type="button" onClick={() => onSwitch('forgot')}>Forgot password?</button></div>
        <Button type="submit" loading={loading} className="full-width">Log In</Button>
      </form>
      <div className="auth-footer"><p>Don't have an account? <button onClick={() => onSwitch('register')}>Sign up</button></p></div>
    </div></div>
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
  const strengthLabel = passedChecks <= 2 ? 'Weak' : passedChecks <= 4 ? 'Medium' : 'Strong';

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar"><div className={`strength-fill ${strength}`} style={{ width: `${(passedChecks / 5) * 100}%` }} /></div>
      <span className={`strength-label ${strength}`}>{strengthLabel}</span>
      <div className="strength-checks">
        <div className={checks.length ? 'check passed' : 'check'}>{checks.length ? <Icons.Check /> : <Icons.X />} At least 8 characters</div>
        <div className={checks.uppercase ? 'check passed' : 'check'}>{checks.uppercase ? <Icons.Check /> : <Icons.X />} Uppercase letter</div>
        <div className={checks.lowercase ? 'check passed' : 'check'}>{checks.lowercase ? <Icons.Check /> : <Icons.X />} Lowercase letter</div>
        <div className={checks.number ? 'check passed' : 'check'}>{checks.number ? <Icons.Check /> : <Icons.X />} Number</div>
        <div className={checks.special ? 'check passed' : 'check'}>{checks.special ? <Icons.Check /> : <Icons.X />} Special character (!@#$%^&*)</div>
      </div>
    </div>
  );
};

const RegisterPage = ({ onSwitch, onSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', accountType: 'vendor' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try { await register({ ...formData, isOrganizer: formData.accountType === 'organizer' }); onSuccess(); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page"><div className="auth-container">
      <div className="auth-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div><h1>Create account</h1><p>14-day free trial</p></div>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <Alert type="error">{error}</Alert>}
        
        <div className="account-type-selector">
          <label className="account-type-label">I am a:</label>
          <div className="account-type-options">
            <button type="button" className={`account-type-option ${formData.accountType === 'vendor' ? 'active' : ''}`} onClick={() => setFormData(f => ({ ...f, accountType: 'vendor' }))}>
              <div className="account-type-icon"><Icons.Truck /></div>
              <div className="account-type-info">
                <span className="account-type-title">Mobile Vendor</span>
                <span className="account-type-desc">Food truck, cart, or mobile business</span>
              </div>
            </button>
            <button type="button" className={`account-type-option ${formData.accountType === 'organizer' ? 'active' : ''}`} onClick={() => setFormData(f => ({ ...f, accountType: 'organizer' }))}>
              <div className="account-type-icon"><Icons.Event /></div>
              <div className="account-type-info">
                <span className="account-type-title">Event Organizer</span>
                <span className="account-type-desc">Manage events & vendor compliance</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="form-row"><Input label="First Name" value={formData.firstName} onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))} required /><Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))} required /></div>
        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))} />
        <div className="password-input-wrapper">
          <Input label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))} required />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
        </div>
        <PasswordStrengthIndicator password={formData.password} />
        <div className="password-input-wrapper">
          <Input label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData(f => ({ ...f, confirmPassword: e.target.value }))} required className={passwordsMatch ? 'input-success' : passwordsDontMatch ? 'input-error' : ''} />
          <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
        </div>
        {passwordsMatch && <div className="password-match success"><Icons.Check /> Passwords match</div>}
        {passwordsDontMatch && <div className="password-match error"><Icons.X /> Passwords do not match</div>}
        <Button type="submit" loading={loading} className="full-width">Create Account</Button>
      </form>
      <div className="auth-footer"><p>Have an account? <button onClick={() => onSwitch('login')}>Log in</button></p></div>
    </div></div>
  );
};

const ForgotPasswordPage = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="auth-page"><div className="auth-container">
        <div className="auth-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div><h1>Check your email</h1></div>
        <div className="auth-success">
          <div className="success-icon"><Icons.Check /></div>
          <p>If an account exists for <strong>{email}</strong>, we've sent password reset instructions.</p>
          <p className="muted">Check your spam folder if you don't see it within a few minutes.</p>
        </div>
        <div className="auth-footer"><button onClick={() => onSwitch('login')}>← Back to login</button></div>
      </div></div>
    );
  }

  return (
    <div className="auth-page"><div className="auth-container">
      <div className="auth-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div><h1>Reset password</h1><p>Enter your email and we'll send reset instructions</p></div>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <Alert type="error">{error}</Alert>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" loading={loading} className="full-width">Send Reset Link</Button>
      </form>
      <div className="auth-footer"><button onClick={() => onSwitch('login')}>← Back to login</button></div>
    </div></div>
  );
};

const ResetPasswordPage = ({ token, onSuccess }) => {
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      onSuccess();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page"><div className="auth-container">
      <div className="auth-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div><h1>Set new password</h1></div>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <Alert type="error">{error}</Alert>}
        <div className="password-input-wrapper">
          <Input label="New Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
        </div>
        <PasswordStrengthIndicator password={password} />
        <div className="password-input-wrapper">
          <Input label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={passwordsMatch ? 'input-success' : passwordsDontMatch ? 'input-error' : ''} />
          <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
        </div>
        {passwordsMatch && <div className="password-match success"><Icons.Check /> Passwords match</div>}
        {passwordsDontMatch && <div className="password-match error"><Icons.X /> Passwords do not match</div>}
        <Button type="submit" loading={loading} className="full-width">Reset Password</Button>
      </form>
    </div></div>
  );
};

const PermitChecker = ({ onClose, onGetStarted }) => {
  const [city, setCity] = useState(''); const [state, setState] = useState(''); const [vendorType, setVendorType] = useState('');
  const [results, setResults] = useState(null); const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const data = await api.get(`/permit-types/required?city=${city}&state=${state}&vendorType=${vendorType}`); setResults(data); } 
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getImportanceLabel = (permit) => {
    if (permit.importanceLevel === 'critical') return { text: 'Critical', variant: 'danger' };
    if (permit.importanceLevel === 'often_forgotten') return { text: 'Often Forgotten', variant: 'warning' };
    if (permit.importanceLevel === 'event_required') return { text: 'Required for Events', variant: 'info' };
    // Fallback to name-based detection
    const name = permit.name?.toLowerCase() || '';
    if (name.includes('health') || name.includes('food') || name.includes('business license')) return { text: 'Critical', variant: 'danger' };
    if (name.includes('fire') || name.includes('commissary')) return { text: 'Often Forgotten', variant: 'warning' };
    if (name.includes('event') || name.includes('special')) return { text: 'Required for Events', variant: 'info' };
    return null;
  };

  const isPartialCoverage = results && results.coverage === 'partial';

  return (
    <div className="permit-checker"><div className="permit-checker-container">
      <button className="close-btn" onClick={onClose}><Icons.X /></button>
      <h1>What permits do you need?</h1>
      <p className="checker-subtitle">Enter your city and business type to see required permits</p>
      <form onSubmit={handleCheck}>
        <div className="form-row"><Input label="City" placeholder="e.g. Austin" value={city} onChange={(e) => setCity(e.target.value)} required /><Select label="State" value={state} onChange={(e) => setState(e.target.value)} options={[{ value: '', label: 'Select' }, ...US_STATES.map(s => ({ value: s, label: s }))]} required /></div>
        <Select label="Business Type" value={vendorType} onChange={(e) => setVendorType(e.target.value)} options={[{ value: '', label: 'Select your business type' }, ...VENDOR_TYPES]} required />
        <Button type="submit" loading={loading} className="full-width">Check Requirements</Button>
      </form>
      {results && (<div className="checker-results">
        {results.permitTypes?.length > 0 ? (<>
          <h2><Icons.Check /> {results.permitTypes.length} permit{results.permitTypes.length > 1 ? 's' : ''} required in {city}, {state}</h2>
          {isPartialCoverage && (
            <div className="coverage-notice">
              <Icons.Alert />
              <p>We're still adding full permit coverage for {city}. You can still track all your permits manually. We'll notify you as soon as full support is ready.</p>
            </div>
          )}
          <ul className="permit-list">{results.permitTypes.map(pt => {
            const label = getImportanceLabel(pt);
            return (<li key={pt._id}>
              <div className="permit-list-header"><h3>{pt.name}</h3>{label && <Badge variant={label.variant}>{label.text}</Badge>}</div>
              <p>{pt.description}</p>
              {pt.issuingAuthorityName && <span className="permit-issuer">Issued by: {pt.issuingAuthorityName}</span>}
              {pt.estimatedCost && <span className="permit-cost">Typical cost: {pt.estimatedCost}</span>}
              <span className="permit-renewal">Renews every {pt.renewalPeriodMonths || 12} months</span>
            </li>);
          })}</ul>
          <div className="checker-cta"><p>Don't let these expire! PermitWise will remind you automatically.</p><Button onClick={() => onGetStarted('register')}>Track My Permits Free →</Button></div>
        </>) : (
          <div className="no-results">
            <Icons.MapPin />
            <h2>We're still building coverage for {city}</h2>
            <p>We're still adding full permit coverage for this city. You can still track all your permits manually — just enter them yourself. We'll notify you as soon as full support is ready.</p>
            <Button onClick={() => onGetStarted('register')}>Start Tracking Manually →</Button>
          </div>
        )}
      </div>)}
    </div></div>
  );
};

const OnboardingPage = ({ onComplete }) => {
  const { updateBusiness } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [formData, setFormData] = useState({ businessName: '', primaryVendorType: '', handlesFood: false, operatingCities: [{ city: '', state: '', isPrimary: true }] });
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedPermits, setSelectedPermits] = useState([]);
  const [loadingPermits, setLoadingPermits] = useState(false);
  const [coverageStatus, setCoverageStatus] = useState(null); // 'full', 'partial', 'none'
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Auto-set handlesFood based on vendor type
  useEffect(() => {
    if (formData.primaryVendorType) {
      const autoFood = FOOD_VENDOR_TYPES.includes(formData.primaryVendorType);
      setFormData(f => ({ ...f, handlesFood: autoFood }));
    }
  }, [formData.primaryVendorType]);

  const fetchSuggestedPermits = async () => {
    if (!formData.operatingCities[0].city || !formData.operatingCities[0].state) return;
    setLoadingPermits(true);
    try {
      const data = await api.get(`/permit-types/required?city=${formData.operatingCities[0].city}&state=${formData.operatingCities[0].state}&vendorType=${formData.primaryVendorType}&handlesFood=${formData.handlesFood}`);
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
        title: `Add coverage for ${formData.operatingCities[0].city}, ${formData.operatingCities[0].state}`,
        description: `Vendor type: ${formData.primaryVendorType}`,
        cityDetails: {
          city: formData.operatingCities[0].city,
          state: formData.operatingCities[0].state
        }
      });
      setSuggestionSubmitted(true);
      setShowSuggestionModal(false);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try { 
      const data = await api.post('/onboarding/complete', { ...formData, selectedPermitTypes: selectedPermits }); 
      updateBusiness(data.business); 
      localStorage.setItem('permitwise_onboarding_complete', 'true');
      onComplete(); 
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const getImportanceLabel = (permit) => {
    if (permit.importanceLevel === 'critical') return { text: 'Critical', variant: 'danger' };
    if (permit.importanceLevel === 'often_forgotten') return { text: 'Often Forgotten', variant: 'warning' };
    if (permit.importanceLevel === 'event_required') return { text: 'Required for Events', variant: 'info' };
    return null;
  };

  return (
    <div className="onboarding-page"><div className="onboarding-container">
      <div className="onboarding-header">
        <Icons.Shield />
        <div className="onboarding-progress"><span className={step >= 1 ? 'active' : ''}>1</span><span className={step >= 2 ? 'active' : ''}>2</span><span className={step >= 3 ? 'active' : ''}>3</span></div>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      
      {step === 1 && (
        <div className="onboarding-step">
          <h1>Tell us about your business</h1>
          <p className="step-subtitle">This helps us find the right permits for you</p>
          <Input label="Business Name *" placeholder="e.g. Taco Express" value={formData.businessName} onChange={(e) => setFormData(f => ({ ...f, businessName: e.target.value }))} />
          <Select label="What type of vendor are you? *" value={formData.primaryVendorType} onChange={(e) => setFormData(f => ({ ...f, primaryVendorType: e.target.value }))} options={[{ value: '', label: 'Select your business type' }, ...VENDOR_TYPES]} />
          
          {formData.primaryVendorType && !FOOD_VENDOR_TYPES.includes(formData.primaryVendorType) && (
            <label className="checkbox-row">
              <input type="checkbox" checked={formData.handlesFood} onChange={(e) => setFormData(f => ({ ...f, handlesFood: e.target.checked }))} />
              <span>My business handles or serves food</span>
            </label>
          )}
          
          <Button onClick={() => setStep(2)} disabled={!formData.businessName || !formData.primaryVendorType} className="full-width">Continue →</Button>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-step">
          <h1>Where do you operate?</h1>
          <p className="step-subtitle">We'll find the permits required in your city</p>
          <div className="form-row">
            <Select label="State *" value={formData.operatingCities[0].state} onChange={(e) => setFormData(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], state: e.target.value, city: '' }] }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
            <CitySearch 
              label="Primary City *" 
              state={formData.operatingCities[0].state}
              value={formData.operatingCities[0].city}
              onChange={(city) => setFormData(f => ({ ...f, operatingCities: [{ ...f.operatingCities[0], city }] }))}
              placeholder="Search for your city..."
            />
          </div>
          <p className="onboarding-note">You can add more cities later in Settings.</p>
          <div className="onboarding-actions">
            <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={handleStep2Complete} disabled={!formData.operatingCities[0].city || !formData.operatingCities[0].state}>Find My Permits →</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-step">
          <h1>Let's get your permits organized</h1>
          {loadingPermits ? <LoadingSpinner /> : (
            <>
              {coverageStatus === 'full' && (
                <p className="step-subtitle">Here are the permits most {VENDOR_TYPES.find(v => v.value === formData.primaryVendorType)?.label || 'vendors'}s need in {formData.operatingCities[0].city}.</p>
              )}
              {coverageStatus === 'partial' && (
                <div className="coverage-notice">
                  <Icons.Alert />
                  <p>We're still adding full permit coverage for {formData.operatingCities[0].city}. You can still track all your permits manually. We'll notify you as soon as full support is ready.</p>
                  {!suggestionSubmitted && <Button variant="outline" size="sm" onClick={() => setShowSuggestionModal(true)}>Request Full Coverage</Button>}
                  {suggestionSubmitted && <Badge variant="success">Request Submitted!</Badge>}
                </div>
              )}
              {coverageStatus === 'none' && (
                <div className="coverage-notice">
                  <Icons.Alert />
                  <p>We're still building coverage for {formData.operatingCities[0].city}. You can still track all your permits manually — just add them after setup. We'll notify you when full support is ready!</p>
                  {!suggestionSubmitted && <Button variant="outline" size="sm" onClick={() => setShowSuggestionModal(true)}>Request Coverage for My City</Button>}
                  {suggestionSubmitted && <Badge variant="success">Request Submitted - Thanks!</Badge>}
                </div>
              )}
              
              {suggestedPermits.length > 0 && (
                <div className="permit-suggestions">
                  <div className="permit-suggestions-header">
                    <span>{selectedPermits.length} of {suggestedPermits.length} selected</span>
                    <button type="button" onClick={selectAllPermits}>Select All</button>
                  </div>
                  <div className="permit-checkbox-list">
                    {suggestedPermits.map(permit => {
                      const label = getImportanceLabel(permit);
                      return (
                        <label key={permit._id} className={`permit-checkbox ${selectedPermits.includes(permit._id) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={selectedPermits.includes(permit._id)} onChange={() => togglePermit(permit._id)} />
                          <div className="permit-checkbox-content">
                            <div className="permit-checkbox-header">
                              <span className="permit-checkbox-name">{permit.name}</span>
                              {label && <Badge variant={label.variant}>{label.text}</Badge>}
                            </div>
                            {permit.issuingAuthorityName && <span className="permit-issuer">Issued by: {permit.issuingAuthorityName}</span>}
                            <span className="permit-renewal">Renews every {permit.renewalPeriodMonths || 12} months</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
          <div className="onboarding-actions">
            <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
            <Button onClick={handleSubmit} loading={loading}>Complete Setup →</Button>
          </div>
        </div>
      )}
      
      {/* City Coverage Suggestion Modal */}
      <Modal isOpen={showSuggestionModal} onClose={() => setShowSuggestionModal(false)} title="Request City Coverage">
        <p>We'll prioritize adding permit data for <strong>{formData.operatingCities[0].city}, {formData.operatingCities[0].state}</strong>.</p>
        <p>Once coverage is ready, you'll be able to see suggested permits and get renewal reminders specific to your city's requirements.</p>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowSuggestionModal(false)}>Cancel</Button>
          <Button onClick={submitCitySuggestion}>Submit Request</Button>
        </div>
      </Modal>
    </div></div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const { user, business, subscription } = useAuth();
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => { 
    const fetchStats = async () => { 
      try {
        // First sync to pick up any new permit types
        await api.post('/permits/sync');
        // Then get dashboard stats
        const data = await api.get('/stats/dashboard');
        setStats(data.stats);
      } 
      catch (error) { console.error(error); } 
      finally { setLoading(false); } 
    }; 
    fetchStats();
    // Check for first-time user after onboarding
    if (localStorage.getItem('permitwise_onboarding_complete') === 'true') {
      setShowWelcomeModal(true);
      localStorage.removeItem('permitwise_onboarding_complete');
    }
  }, []);

  const getExpiryLabel = (daysUntil) => {
    if (daysUntil <= 0) return { text: 'Expired!', variant: 'danger' };
    if (daysUntil <= 7) return { text: `Expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''} — inspectors often check this first!`, variant: 'danger' };
    if (daysUntil <= 30) return { text: `Expires in ${daysUntil} days — start renewal now`, variant: 'warning' };
    return { text: `${daysUntil} days left`, variant: 'warning' };
  };

  if (loading) return <LoadingSpinner />;

  const needsAttention = (stats?.permits?.missing || 0) + (stats?.permits?.expired || 0) + (stats?.permits?.pendingRenewal || 0);

  return (
    <div className="dashboard">
      {!user?.emailVerified && <div className="email-banner"><Icons.Bell /> Verify your email to ensure you receive permit alerts. <button onClick={() => api.post('/auth/resend-verification')}>Resend</button></div>}
      <div className="dashboard-header"><div><h1>Welcome, {business?.businessName}!</h1><p>Compliance overview</p></div>{subscription?.status === 'trial' && <Alert type="warning">Trial ends {formatDate(subscription.trialEndsAt)}</Alert>}</div>
      {needsAttention > 0 && (
        <Card className="aha-banner">
          <div className="aha-content">
            <div className="aha-icon"><Icons.Alert /></div>
            <div className="aha-text">
              <h2>Action Required</h2>
              <p>{stats?.permits?.missing > 0 && <span className="aha-item red">⚠️ {stats.permits.missing} permit{stats.permits.missing > 1 ? 's' : ''} missing</span>}
              {stats?.permits?.expired > 0 && <span className="aha-item red">🚨 {stats.permits.expired} expired — act now!</span>}
              {stats?.permits?.pendingRenewal > 0 && <span className="aha-item yellow">🟡 {stats.permits.pendingRenewal} expiring soon — inspectors check these first!</span>}</p>
            </div>
          </div>
          <div className="aha-actions"><Button onClick={() => onNavigate('permits')}>Fix Now →</Button></div>
        </Card>
      )}
      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-icon green"><Icons.Check /></div><div className="stat-info"><span className="stat-value">{stats?.permits?.active || 0}</span><span className="stat-label">Active</span></div></Card>
        <Card className="stat-card"><div className="stat-icon yellow"><Icons.Clock /></div><div className="stat-info"><span className="stat-value">{stats?.permits?.pendingRenewal || 0}</span><span className="stat-label">Expiring</span></div></Card>
        <Card className="stat-card"><div className="stat-icon red"><Icons.Alert /></div><div className="stat-info"><span className="stat-value">{stats?.permits?.expired || 0}</span><span className="stat-label">Expired</span></div></Card>
        <Card className="stat-card"><div className="stat-icon gray"><Icons.Document /></div><div className="stat-info"><span className="stat-value">{stats?.permits?.missing || 0}</span><span className="stat-label">Missing</span></div></Card>
      </div>
      <div className="dashboard-row">
        <Card className="compliance-card"><h2>Compliance Score</h2><div className="compliance-score"><div className="score-circle" style={{ '--score': stats?.complianceScore || 0 }}><span>{stats?.complianceScore || 0}%</span></div></div></Card>
        <Card className="upcoming-card">
          <h2>Upcoming Expirations</h2>
          {stats?.upcomingExpirations?.length > 0 ? (
            <ul className="expiration-list">
              {stats.upcomingExpirations.slice(0, 5).map(p => {
                const label = getExpiryLabel(p.daysUntil);
                return (
                  <li key={p.id} className="expiration-item">
                    <span className="expiration-name">{p.name}</span>
                    <Badge variant={label.variant}>{label.text}</Badge>
                  </li>
                );
              })}
            </ul>
          ) : <p>No upcoming expirations</p>}
        </Card>
      </div>

      {/* Post-Onboarding Welcome Modal */}
      <Modal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} title="">
        <div className="welcome-modal">
          <div className="welcome-icon"><Icons.Check /></div>
          <h2>You're all set! 🎉</h2>
          <p>We've added the permits you're likely to need. Upload your first document to start tracking expirations.</p>
          <div className="welcome-actions">
            <Button onClick={() => { setShowWelcomeModal(false); setShowUploadModal(true); }}><Icons.Upload /> Upload Now</Button>
            <Button variant="outline" onClick={() => setShowWelcomeModal(false)}>I'll do it later</Button>
          </div>
        </div>
      </Modal>
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={() => setShowUploadModal(false)} />
    </div>
  );
};

const PermitsPage = () => {
  const { business, canWrite, isExpired } = useAuth();
  const [permits, setPermits] = useState([]); const [summary, setSummary] = useState(null); const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false); const [showCityModal, setShowCityModal] = useState(false); const [selectedPermit, setSelectedPermit] = useState(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestedPermits, setSuggestedPermits] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingSuggestions, setAddingSuggestions] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Handler for Add Permit button - checks subscription
  const handleAddPermit = () => {
    if (!canWrite) {
      setShowUpgradeModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const syncAndFetchPermits = async () => {
    try {
      // First sync to pick up any new permit types
      await api.post('/permits/sync');
      // Then fetch all permits
      const data = await api.get('/permits');
      setPermits(data.permits);
      setSummary(data.summary);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  
  const fetchPermits = async () => { try { const data = await api.get('/permits'); setPermits(data.permits); setSummary(data.summary); } catch (error) { console.error(error); } finally { setLoading(false); } };
  
  const fetchSuggestedPermits = async () => {
    if (!canWrite) return; // Don't show suggestions if can't add permits
    if (!business?.operatingCities?.[0]) return;
    setLoadingSuggestions(true);
    try {
      const city = business.operatingCities.find(c => c.isPrimary) || business.operatingCities[0];
      const data = await api.get(`/permit-types/required?city=${city.city}&state=${city.state}&vendorType=${business.primaryVendorType}`);
      if (data.permitTypes?.length > 0) {
        setSuggestedPermits(data.permitTypes);
        setSelectedSuggestions(data.permitTypes.map(p => p._id));
        setShowSuggestModal(true);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingSuggestions(false); }
  };

  useEffect(() => { 
    syncAndFetchPermits(); // Sync on initial load to pick up new permit types
  }, []);

  // Show suggestion modal when permits are empty and user has a business
  useEffect(() => {
    if (!loading && permits.length === 0 && business?.operatingCities?.length > 0 && canWrite) {
      fetchSuggestedPermits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, permits.length, business, canWrite]);

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
    } catch (err) { alert(err.message); }
    finally { setAddingSuggestions(false); }
  };

  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', variant: 'danger' };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', variant: 'warning' };
    if (level === 'event_required') return { text: 'Event Required', variant: 'info' };
    return null;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="permits-page">
      <div className="page-header"><div><h1>Permits</h1><p>Track all your permits</p></div><div className="header-actions"><Button variant="outline" onClick={() => setShowCityModal(true)}><Icons.MapPin /> Add City</Button><Button onClick={handleAddPermit}><Icons.Plus /> Add Permit</Button></div></div>
      {summary && <div className="permits-summary"><div className="summary-item"><span className="count">{summary.total}</span><span>Total</span></div><div className="summary-item green"><span className="count">{summary.active}</span><span>Active</span></div><div className="summary-item yellow"><span className="count">{summary.pendingRenewal}</span><span>Expiring</span></div><div className="summary-item red"><span className="count">{summary.expired}</span><span>Expired</span></div></div>}
      {permits.length > 0 ? (
        <div className="permits-grid">{permits.map(permit => (<Card key={permit._id} className="permit-card" onClick={() => setSelectedPermit(permit)}><div className="permit-header"><h3>{permit.permitTypeId?.name}</h3><Badge variant={permit.status === 'active' ? 'success' : permit.status === 'expired' ? 'danger' : 'warning'}>{getStatusLabel(permit.status)}</Badge></div><p>{permit.jurisdictionId?.name}, {permit.jurisdictionId?.state}</p>{permit.expiryDate && <div className="expiry-info"><Icons.Clock /><span>Expires {formatDate(permit.expiryDate)}</span></div>}</Card>))}</div>
      ) : (
        <div className="empty-permits">
          <EmptyState icon={Icons.Permit} title="No permits yet" description="Add the permits you need to track or let us suggest them based on your city." action={<div className="empty-actions"><Button onClick={() => canWrite ? fetchSuggestedPermits() : setShowUpgradeModal(true)}><Icons.Search /> Get Suggestions</Button><Button variant="outline" onClick={() => setShowCityModal(true)}><Icons.MapPin /> Add City</Button></div>} />
        </div>
      )}
      <AddCityModal isOpen={showCityModal} onClose={() => setShowCityModal(false)} onSuccess={fetchPermits} />
      <AddPermitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchPermits} />
      <PermitDetailModal permit={selectedPermit} onClose={() => setSelectedPermit(null)} onUpdate={fetchPermits} />
      
      {/* Suggested Permits Modal */}
      <Modal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} title="Suggested Permits" size="lg">
        <div className="suggest-modal">
          <p className="suggest-intro">Based on your business in <strong>{business?.operatingCities?.[0]?.city}, {business?.operatingCities?.[0]?.state}</strong>, here are the permits most {VENDOR_TYPES.find(v => v.value === business?.primaryVendorType)?.label || 'vendors'}s need:</p>
          
          {loadingSuggestions ? <LoadingSpinner /> : (
            <>
              <div className="suggest-header">
                <span>{selectedSuggestions.length} of {suggestedPermits.length} selected</span>
                <button type="button" onClick={() => setSelectedSuggestions(suggestedPermits.map(p => p._id))}>Select All</button>
              </div>
              
              <div className="suggest-list">
                {suggestedPermits.map(permit => {
                  const label = getImportanceLabel(permit.importanceLevel);
                  const isSelected = selectedSuggestions.includes(permit._id);
                  return (
                    <label key={permit._id} className={`suggest-item ${isSelected ? 'selected' : ''}`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSuggestion(permit._id)} />
                      <div className="suggest-content">
                        <div className="suggest-item-header">
                          <span className="suggest-name">{permit.name}</span>
                          {label && <Badge variant={label.variant}>{label.text}</Badge>}
                        </div>
                        {permit.description && <p className="suggest-desc">{permit.description}</p>}
                        <div className="suggest-meta">
                          {permit.issuingAuthorityName && <span>Issued by: {permit.issuingAuthorityName}</span>}
                          <span>Renews every {permit.renewalPeriodMonths || 12} months</span>
                          {permit.estimatedCost && <span>Cost: {permit.estimatedCost}</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {suggestedPermits.length === 0 && (
                <div className="suggest-empty">
                  <p>We don't have permit data for your city yet. You can add permits manually.</p>
                </div>
              )}
            </>
          )}
          
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setShowSuggestModal(false)}>Skip for Now</Button>
            <Button onClick={addSuggestedPermits} loading={addingSuggestions} disabled={selectedSuggestions.length === 0}>
              Add {selectedSuggestions.length} Permit{selectedSuggestions.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Upgrade Modal for expired subscriptions */}
      <UpgradeRequiredModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        reason={isExpired ? "Your subscription has expired" : "This feature requires an active subscription"}
        feature="Permit Management"
      />
    </div>
  );
};

const AddCityModal = ({ isOpen, onClose, onSuccess }) => {
  const [city, setCity] = useState(''); const [state, setState] = useState(''); const [loading, setLoading] = useState(false); const [result, setResult] = useState(null);
  const handleAdd = async () => { setLoading(true); try { const data = await api.post('/permits/add-city', { city, state }); setResult(data); onSuccess(); } catch (err) { alert(err.message); } finally { setLoading(false); } };
  return (<Modal isOpen={isOpen} onClose={onClose} title="Add Operating City">{result && <Alert type="success">{result.message}</Alert>}<p>Add a city where you operate.</p><div className="form-row"><Input label="City" value={city} onChange={(e) => setCity(e.target.value)} /><Select label="State" value={state} onChange={(e) => setState(e.target.value)} options={[{ value: '', label: 'Select' }, ...US_STATES.map(s => ({ value: s, label: s }))]} /></div><div className="modal-actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleAdd} loading={loading} disabled={!city || !state}>Add City</Button></div></Modal>);
};

const AddPermitModal = ({ isOpen, onClose, onSuccess }) => {
  const [city, setCity] = useState(''); const [state, setState] = useState(''); const [vendorType, setVendorType] = useState('');
  const [permitTypes, setPermitTypes] = useState([]); const [selectedPermit, setSelectedPermit] = useState(''); const [loading, setLoading] = useState(false);
  const searchPermits = async () => { if (!city || !state || !vendorType) return; try { const data = await api.get(`/permit-types/required?city=${city}&state=${state}&vendorType=${vendorType}`); setPermitTypes(data.permitTypes || []); } catch (err) { console.error(err); } };
  const handleAdd = async () => { if (!selectedPermit) return; setLoading(true); try { const pt = permitTypes.find(p => p._id === selectedPermit); await api.post('/permits', { permitTypeId: selectedPermit, jurisdictionId: pt.jurisdictionId._id, status: 'missing' }); onSuccess(); onClose(); } catch (err) { alert(err.message); } finally { setLoading(false); } };
  return (<Modal isOpen={isOpen} onClose={onClose} title="Add Permit" size="lg"><div className="form-row"><Input label="City" value={city} onChange={(e) => setCity(e.target.value)} /><Select label="State" value={state} onChange={(e) => setState(e.target.value)} options={[{ value: '', label: 'Select' }, ...US_STATES.map(s => ({ value: s, label: s }))]} /></div><Select label="Business Type" value={vendorType} onChange={(e) => setVendorType(e.target.value)} options={[{ value: '', label: 'Select' }, ...VENDOR_TYPES]} /><Button onClick={searchPermits} variant="outline"><Icons.Search /> Search</Button>{permitTypes.length > 0 && <div className="permit-options">{permitTypes.map(pt => (<label key={pt._id} className={`permit-option ${selectedPermit === pt._id ? 'selected' : ''}`}><input type="radio" name="permit" value={pt._id} checked={selectedPermit === pt._id} onChange={(e) => setSelectedPermit(e.target.value)} /><span>{pt.name}</span></label>))}</div>}<div className="modal-actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleAdd} loading={loading} disabled={!selectedPermit}>Add Permit</Button></div></Modal>);
};

const PermitDetailModal = ({ permit, onClose, onUpdate }) => {
  const { subscription } = useAuth();
  const [editing, setEditing] = useState(false); 
  const [formData, setFormData] = useState({}); 
  const [loading, setLoading] = useState(false); 
  const [uploading, setUploading] = useState(false); 
  const [uploadError, setUploadError] = useState('');
  const [localPermit, setLocalPermit] = useState(null);
  
  useEffect(() => { 
    if (permit) {
      setLocalPermit(permit);
      setFormData({ 
        status: permit.status, 
        permitNumber: permit.permitNumber || '', 
        issueDate: permit.issueDate?.split('T')[0] || '', 
        expiryDate: permit.expiryDate?.split('T')[0] || '', 
        notes: permit.notes || '' 
      });
    }
  }, [permit]);
  
  // Early return if no permit
  if (!permit || !localPermit) return null;
  
  const handleSave = async () => { 
    setLoading(true); 
    try { 
      const response = await api.put(`/permits/${localPermit._id}`, formData); 
      setLocalPermit(response.permit);
      setFormData({ 
        status: response.permit.status, 
        permitNumber: response.permit.permitNumber || '', 
        issueDate: response.permit.issueDate?.split('T')[0] || '', 
        expiryDate: response.permit.expiryDate?.split('T')[0] || '', 
        notes: response.permit.notes || '' 
      });
      onUpdate(); 
      setEditing(false); 
    } catch (error) { console.error(error); } finally { setLoading(false); } 
  };
  
  const handleUpload = async (e) => { 
    const file = e.target.files[0]; 
    if (!file) return;
    setUploadError('');
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      setUploadError('Invalid file type. Allowed: PDF, JPG, PNG, GIF, WebP');
      e.target.value = ''; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      e.target.value = ''; return;
    }
    setUploading(true); 
    const fd = new FormData(); 
    fd.append('file', file); 
    fd.append('category', 'permit'); 
    fd.append('relatedEntityType', 'permit'); 
    fd.append('relatedEntityId', localPermit._id); 
    try { 
      const docResponse = await api.upload('/documents', fd);
      // Update local permit with the new document
      setLocalPermit(prev => ({ ...prev, documentId: docResponse.document }));
      onUpdate(); 
    } catch (error) { setUploadError(error.message); } finally { setUploading(false); e.target.value = ''; } 
  };
  const handleAutofill = async () => { try { const data = await api.post('/autofill/generate', { permitTypeId: localPermit.permitTypeId._id }); window.open(getSecureFileUrl(data.downloadUrl), '_blank'); } catch (error) { alert(error.message); } };
  
  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', variant: 'danger' };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', variant: 'warning' };
    if (level === 'event_required') return { text: 'Required for Events', variant: 'info' };
    return null;
  };
  const importanceLabel = getImportanceLabel(localPermit.permitTypeId?.importanceLevel);

  return (
    <Modal isOpen={!!permit} onClose={onClose} title={localPermit.permitTypeId?.name} size="lg">
      <div className="permit-detail">
        <div className="detail-header">
          <div className="detail-badges">
            <Badge variant={localPermit.status === 'active' ? 'success' : localPermit.status === 'expired' ? 'danger' : 'warning'}>{getStatusLabel(localPermit.status)}</Badge>
            {importanceLabel && <Badge variant={importanceLabel.variant}>{importanceLabel.text}</Badge>}
          </div>
          <span>{localPermit.jurisdictionId?.name}, {localPermit.jurisdictionId?.state}</span>
        </div>
        
        {/* Missing Permit CTA */}
        {localPermit.status === 'missing' && (
          <div className="missing-permit-cta">
            <Icons.Alert />
            <p>You don't have this permit yet. Add details now so we can track expiration reminders.</p>
            <Button size="sm" onClick={() => setEditing(true)}>Add Details →</Button>
          </div>
        )}
        
        {/* Permit Type Info Panel */}
        <div className="permit-type-info">
          <h4>Permit Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <Icons.Clock />
              <div><span className="info-label">Renewal Frequency</span><span className="info-value">Renews every {localPermit.permitTypeId?.renewalPeriodMonths || 12} months</span></div>
            </div>
            {localPermit.permitTypeId?.issuingAuthorityName && (
              <div className="info-item">
                <Icons.Shield />
                <div><span className="info-label">Issued By</span><span className="info-value">{localPermit.permitTypeId.issuingAuthorityName}</span></div>
              </div>
            )}
            {localPermit.permitTypeId?.estimatedCost && (
              <div className="info-item">
                <Icons.Document />
                <div><span className="info-label">Typical Cost</span><span className="info-value">{localPermit.permitTypeId.estimatedCost}</span></div>
              </div>
            )}
          </div>
          {localPermit.permitTypeId?.requiredDocuments?.length > 0 && (
            <div className="required-docs">
              <span className="info-label">Usually Required:</span>
              <span className="info-value">{localPermit.permitTypeId.requiredDocuments.join(', ')}</span>
            </div>
          )}
        </div>
        
        {editing ? (
          <div className="detail-form">
            <Select label="Status" value={formData.status} onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))} options={[{ value: 'missing', label: 'Missing' }, { value: 'in_progress', label: 'In Progress' }, { value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }]} />
            <Input label="Permit Number" value={formData.permitNumber} onChange={(e) => setFormData(f => ({ ...f, permitNumber: e.target.value }))} />
            <div className="form-row">
              <Input label="Issue Date" type="date" value={formData.issueDate} onChange={(e) => setFormData(f => ({ ...f, issueDate: e.target.value }))} />
              <Input label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="detail-info">
            <h4>Your Permit Details</h4>
            <div className="info-row"><span>Permit Number</span><span>{localPermit.permitNumber || 'Not entered'}</span></div>
            <div className="info-row"><span>Issue Date</span><span>{localPermit.issueDate ? formatDate(localPermit.issueDate) : 'Not entered'}</span></div>
            <div className="info-row"><span>Expiry Date</span><span>{localPermit.expiryDate ? formatDate(localPermit.expiryDate) : 'Not entered'}</span></div>
            {localPermit.expiryDate && <div className="info-row highlight"><span>Days Until Expiry</span><span>{daysUntil(localPermit.expiryDate)}</span></div>}
          </div>
        )}
        
        <div className="detail-document">
          <h4>Document</h4>
          {uploadError && <Alert type="error">{uploadError}</Alert>}
          {localPermit.documentId ? (
            <div className="document-preview"><Icons.Document /><span>{localPermit.documentId.originalName}</span><a href={getSecureFileUrl(localPermit.documentId.fileUrl)} target="_blank" rel="noopener noreferrer"><Icons.Download /></a></div>
          ) : (
            <div className="upload-area">
              <input type="file" id="permit-upload" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" onChange={handleUpload} hidden />
              <label htmlFor="permit-upload">{uploading ? 'Uploading...' : 'Upload Document (PDF, JPG, PNG)'}</label>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          {editing ? (
            <><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={handleSave} loading={loading}>Save</Button></>
          ) : (
            <>{subscription?.features?.autofill && <Button variant="outline" onClick={handleAutofill}><Icons.Download /> Generate Application</Button>}<Button onClick={() => setEditing(true)}><Icons.Edit /> Edit</Button></>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]); const [loading, setLoading] = useState(true); const [showUploadModal, setShowUploadModal] = useState(false);
  const fetchDocuments = async () => { try { const data = await api.get('/documents'); setDocuments(data.documents); } catch (error) { console.error(error); } finally { setLoading(false); } };
  useEffect(() => { fetchDocuments(); }, []);
  const handleDelete = async (id) => { if (!window.confirm('Delete this document?')) return; try { await api.delete(`/documents/${id}`); fetchDocuments(); } catch (error) { console.error(error); } };
  if (loading) return <LoadingSpinner />;
  return (<div className="documents-page"><div className="page-header"><div><h1>Document Vault</h1><p>Store all your documents</p></div><Button onClick={() => setShowUploadModal(true)}><Icons.Upload /> Upload</Button></div>{documents.length > 0 ? (<div className="documents-grid">{documents.map(doc => (<Card key={doc._id} className="document-card"><div className="document-icon"><Icons.Document /></div><div className="document-info"><h3>{doc.originalName}</h3><span>{doc.category}</span><span>{formatDate(doc.createdAt)}</span></div><div className="document-actions"><a href={getSecureFileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer"><Icons.Download /></a><button onClick={() => handleDelete(doc._id)}><Icons.Trash /></button></div></Card>))}</div>) : (<EmptyState icon={Icons.Document} title="No documents yet" action={<Button onClick={() => setShowUploadModal(true)}><Icons.Upload /> Upload</Button>} />)}<UploadDocumentModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={fetchDocuments} /></div>);
};

const UploadDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null); const [category, setCategory] = useState('other'); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; setError('');
    if (!selectedFile) return;
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(ext)) {
      setError(`Invalid file type. Allowed: PDF, JPG, PNG, GIF, WebP`);
      e.target.value = ''; setFile(null); return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      e.target.value = ''; setFile(null); return;
    }
    setFile(selectedFile);
  };
  const handleUpload = async () => { if (!file) return; setLoading(true); const fd = new FormData(); fd.append('file', file); fd.append('category', category); try { await api.upload('/documents', fd); onSuccess(); onClose(); setFile(null); setError(''); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  return (<Modal isOpen={isOpen} onClose={onClose} title="Upload Document"><div className="upload-form">{error && <Alert type="error">{error}</Alert>}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileChange} /><p className="upload-hint">Accepted: PDF, JPG, PNG, GIF, WebP (max 10MB)</p><Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: 'permit', label: 'Permit' }, { value: 'insurance', label: 'Insurance' }, { value: 'inspection', label: 'Inspection' }, { value: 'food_handler', label: 'Food Handler' }, { value: 'vehicle', label: 'Vehicle' }, { value: 'other', label: 'Other' }]} /></div><div className="modal-actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUpload} loading={loading} disabled={!file}>Upload</Button></div></Modal>);
};
const UploadModal = UploadDocumentModal; // Alias for Dashboard use

const InspectionsPage = () => {
  const { subscription, isExpired } = useAuth();
  const [checklists, setChecklists] = useState([]); // Recommended checklists
  const [userChecklists, setUserChecklists] = useState([]); // User's custom checklists
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true); const [activeChecklist, setActiveChecklist] = useState(null);
  const [inspectionData, setInspectionData] = useState({ items: [], notes: '' });
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
    }
    catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!hasAccess) { setLoading(false); return; }
    fetchData();
  }, [hasAccess]);

  const startInspection = (checklist, isUserChecklist = false) => {
    setActiveChecklist({ ...checklist, isUserChecklist });
    const items = checklist.items || [];
    setInspectionData({ items: items.map(item => ({ itemText: item.itemText || item.name, description: item.description, passed: null, notes: '', photos: [] })), notes: '' });
  };

  const updateItem = (index, field, value) => {
    const items = [...inspectionData.items];
    items[index] = { ...items[index], [field]: value };
    setInspectionData(d => ({ ...d, items }));
  };

  const submitInspection = async () => {
    try {
      await api.post('/inspections', { checklistId: activeChecklist._id, items: inspectionData.items, notes: inspectionData.notes, inspectionDate: new Date() });
      setActiveChecklist(null);
      fetchData();
    } catch (err) { alert(err.message); }
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
    } catch (err) { alert(err.message); }
  };

  const deleteUserChecklist = async (id) => {
    if (!window.confirm('Delete this checklist?')) return;
    try {
      await api.delete(`/user-checklists/${id}`);
      fetchData();
    } catch (err) { alert(err.message); }
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
      alert('Thank you! Your suggestion has been submitted.');
    } catch (err) { alert(err.message); }
  };

  if (!hasAccess) {
    return (
      <div className="upgrade-feature-page">
        <div className="upgrade-feature-content">
          <div className="upgrade-feature-icon">{isExpired ? <Icons.Lock /> : <Icons.Checklist />}</div>
          <h1>{isExpired ? 'Subscription Expired' : 'Inspection Checklists'}</h1>
          <Badge variant={isExpired ? 'danger' : 'warning'}>{isExpired ? 'Renew to Access' : 'Pro Plan Required'}</Badge>
          <p className="upgrade-feature-description">
            {isExpired 
              ? 'Your subscription has expired. Renew now to access inspection checklists and ensure you never fail a health inspection.'
              : 'Never fail a health inspection again. Walk through every requirement step-by-step before the inspector arrives.'}
          </p>
          
          <div className="upgrade-feature-grid">
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>City-Specific Checklists</h3>
              <p>Pre-built checklists based on your operating cities' health department requirements</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Offline Mode</h3>
              <p>Access checklists anywhere, even without internet connection on your mobile device</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Photo Documentation</h3>
              <p>Capture photos as proof of compliance for each inspection item</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Violation Alerts</h3>
              <p>Get warnings about commonly failed inspection items so you can prepare</p>
            </div>
          </div>

          <div className="upgrade-pricing-card">
            <span className="upgrade-plan-label">Pro Plan</span>
            <div className="upgrade-price">$49<span>/month</span></div>
            <p>Also includes SMS alerts, PDF autofill & multi-city support</p>
          </div>

          <Button size="lg" onClick={() => window.location.hash = 'settings'}>{isExpired ? 'Renew Subscription' : 'Upgrade to Pro'}</Button>
          <p className="upgrade-note">{isExpired ? 'Restore full access immediately' : '14-day free trial • Cancel anytime'}</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (activeChecklist) {
    return (
      <div className="inspection-active">
        <div className="page-header"><button className="back-btn" onClick={() => setActiveChecklist(null)}><Icons.X /></button><h1>{activeChecklist.name}</h1></div>
        <div className="inspection-items">
          {inspectionData.items.map((item, i) => (
            <Card key={i} className={`inspection-item ${item.passed === true ? 'passed' : item.passed === false ? 'failed' : ''}`}>
              <div className="item-header"><span className="item-number">{i + 1}</span><h3>{item.itemText || item.name}</h3></div>
              {item.description && <p className="item-description">{item.description}</p>}
              <div className="item-actions">
                <button className={`pass-btn ${item.passed === true ? 'active' : ''}`} onClick={() => updateItem(i, 'passed', true)}><Icons.Check /> Pass</button>
                <button className={`fail-btn ${item.passed === false ? 'active' : ''}`} onClick={() => updateItem(i, 'passed', false)}><Icons.X /> Fail</button>
              </div>
              {item.passed === false && <Input placeholder="Notes on failure..." value={item.notes} onChange={(e) => updateItem(i, 'notes', e.target.value)} />}
            </Card>
          ))}
        </div>
        <Card className="inspection-summary">
          <h3>Summary</h3>
          <div className="summary-stats">
            <span className="passed">{inspectionData.items.filter(i => i.passed === true).length} Passed</span>
            <span className="failed">{inspectionData.items.filter(i => i.passed === false).length} Failed</span>
            <span className="pending">{inspectionData.items.filter(i => i.passed === null).length} Pending</span>
          </div>
          <Input label="Overall Notes" value={inspectionData.notes} onChange={(e) => setInspectionData(d => ({ ...d, notes: e.target.value }))} />
          <Button onClick={submitInspection} disabled={inspectionData.items.some(i => i.passed === null)}>Complete Inspection</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="inspections-page">
      <div className="page-header">
        <h1>Inspections</h1>
        <div className="page-header-actions">
          <Button variant="outline" onClick={() => setShowSuggestModal(true)}><Icons.Plus /> Suggest Checklist</Button>
          <Button onClick={() => setShowCreateModal(true)}><Icons.Plus /> Create My Own</Button>
        </div>
      </div>
      <div className="inspections-grid">
        <div className="checklists-section">
          <h2>Recommended Checklists</h2>
          {checklists.length > 0 ? checklists.map(cl => (
            <Card key={cl._id} className="checklist-card">
              <div className="checklist-info">
                <h3>{cl.name}</h3>
                <p>{cl.description}</p>
                <span className="item-count">{cl.items?.length || 0} items</span>
                {cl.category && <Badge variant={cl.category === 'health' ? 'danger' : cl.category === 'fire' ? 'warning' : 'default'}>{cl.category}</Badge>}
              </div>
              <Button onClick={() => startInspection(cl)}>Start</Button>
            </Card>
          )) : <EmptyState icon={Icons.Checklist} title="No recommended checklists" description="Checklists for your jurisdiction coming soon. You can create your own!" />}
          
          <h2 style={{ marginTop: '2rem' }}>My Checklists</h2>
          {userChecklists.length > 0 ? userChecklists.map(cl => (
            <Card key={cl._id} className="checklist-card user-checklist">
              <div className="checklist-info">
                <h3>{cl.name} <Badge variant="primary">Custom</Badge></h3>
                <p>{cl.description || 'Custom checklist'}</p>
                <span className="item-count">{cl.items?.length || 0} items</span>
              </div>
              <div className="checklist-actions">
                <Button onClick={() => startInspection(cl, true)}>Start</Button>
                <button className="delete-btn" onClick={() => deleteUserChecklist(cl._id)}><Icons.Trash /></button>
              </div>
            </Card>
          )) : <p className="empty-text">No custom checklists yet. Create one above!</p>}
        </div>
        <div className="history-section">
          <h2>Recent Inspections</h2>
          {inspections.length > 0 ? inspections.map(insp => (
            <Card key={insp._id} className="inspection-history-card clickable" onClick={() => setViewingInspection(insp)}>
              <h3>{insp.checklistId?.name || 'Inspection'}</h3>
              <p>{formatDate(insp.inspectionDate)}</p>
              <div className="inspection-result">
                <Badge variant={insp.overallStatus === 'pass' ? 'success' : insp.overallStatus === 'fail' ? 'danger' : 'warning'}>
                  {insp.overallStatus === 'pass' ? 'PASSED' : insp.overallStatus === 'fail' ? 'FAILED' : 'INCOMPLETE'}
                </Badge>
              </div>
            </Card>
          )) : <p className="empty-text">No inspections recorded yet</p>}
        </div>
      </div>

      {/* View Inspection Modal */}
      <Modal isOpen={!!viewingInspection} onClose={() => setViewingInspection(null)} title="Inspection Results" size="lg">
        {viewingInspection && (
          <div className="inspection-view">
            <div className="inspection-view-header">
              <div>
                <h3>{viewingInspection.checklistId?.name || 'Inspection'}</h3>
                <p className="inspection-date">{formatDate(viewingInspection.inspectionDate)}</p>
              </div>
              <Badge variant={viewingInspection.overallStatus === 'pass' ? 'success' : viewingInspection.overallStatus === 'fail' ? 'danger' : 'warning'} size="lg">
                {viewingInspection.overallStatus === 'pass' ? 'PASSED' : viewingInspection.overallStatus === 'fail' ? 'FAILED' : 'INCOMPLETE'}
              </Badge>
            </div>
            
            <div className="inspection-items-list">
              <h4>Checklist Items</h4>
              {viewingInspection.results?.map((item, i) => (
                <div key={i} className={`inspection-item-result ${item.passed === true ? 'passed' : item.passed === false ? 'failed' : 'pending'}`}>
                  <div className="inspection-item-status">
                    {item.passed === true ? <Icons.Check /> : item.passed === false ? <Icons.X /> : <Icons.Clock />}
                  </div>
                  <div className="inspection-item-content">
                    <span className="inspection-item-text">{item.itemText}</span>
                    {item.notes && <p className="inspection-item-notes">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {viewingInspection.notes && (
              <div className="inspection-notes">
                <h4>Notes</h4>
                <p>{viewingInspection.notes}</p>
              </div>
            )}
            
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setViewingInspection(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Checklist Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Custom Checklist" size="lg">
        <Input label="Checklist Name *" placeholder="e.g., Pre-Event Safety Check" value={newChecklist.name} onChange={(e) => setNewChecklist(c => ({ ...c, name: e.target.value }))} />
        <Input label="Description" placeholder="What is this checklist for?" value={newChecklist.description} onChange={(e) => setNewChecklist(c => ({ ...c, description: e.target.value }))} />
        <div className="form-section">
          <label>Checklist Items</label>
          {newChecklist.items.map((item, i) => (
            <div key={i} className="checklist-item-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ minWidth: '30px' }}>{i + 1}.</span>
              <Input placeholder="Item text" value={item.itemText} onChange={(e) => {
                const items = [...newChecklist.items];
                items[i] = { itemText: e.target.value };
                setNewChecklist(c => ({ ...c, items }));
              }} />
              {newChecklist.items.length > 1 && (
                <button type="button" className="delete-btn" onClick={() => setNewChecklist(c => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }))}><Icons.Trash /></button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setNewChecklist(c => ({ ...c, items: [...c.items, { itemText: '' }] }))}>
            <Icons.Plus /> Add Item
          </Button>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={createUserChecklist} disabled={!newChecklist.name || !newChecklist.items.some(i => i.itemText.trim())}>Create Checklist</Button>
        </div>
      </Modal>

      {/* Suggest Checklist Modal */}
      <Modal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} title="Suggest a Checklist">
        <p>Is there a checklist you'd like us to add for all vendors in your area? Let us know!</p>
        <Input 
          label="Your Suggestion" 
          placeholder="e.g., Fire safety checklist for Austin food trucks, or specific items to add to existing checklists" 
          value={suggestionText} 
          onChange={(e) => setSuggestionText(e.target.value)}
          multiline
        />
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowSuggestModal(false)}>Cancel</Button>
          <Button onClick={submitSuggestion} disabled={!suggestionText.trim()}>Submit Suggestion</Button>
        </div>
      </Modal>
    </div>
  );
};

const EventsPage = () => {
  const { user, subscription, business, isExpired, canWrite } = useAuth();
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ eventName: '', organizerName: '', city: '', state: '', startDate: '', endDate: '', eventType: '', website: '', additionalInfo: '' });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Organizer portal state
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [organizerTab, setOrganizerTab] = useState('my-events'); // 'my-events', 'applications', 'create'
  const [newOrgEvent, setNewOrgEvent] = useState({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', eventType: 'food_event', maxVendors: '', applicationDeadline: '', feeStructure: { applicationFee: 0, boothFee: 0, electricityFee: 0, description: '' }, requiredPermitTypes: [], customPermitRequirements: [], status: 'draft' });
  const [selectedOrgEvent, setSelectedOrgEvent] = useState(null);
  const [vendorApplications, setVendorApplications] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [availablePermitTypes, setAvailablePermitTypes] = useState([]);
  
  // Vendor events discovery
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState('');

  // Plan check: Elite, Promo, or Lifetime required for vendors
  const hasAccess = subscription?.plan === 'elite' || subscription?.plan === 'promo' || subscription?.plan === 'lifetime' || subscription?.features?.eventIntegration;
  
  // Check if user is an organizer
  const isOrganizer = user?.isOrganizer && !user?.organizerProfile?.disabled;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isOrganizer) {
          // Fetch organizer's events
          const orgData = await api.get('/events/organizer/my-events');
          setOrganizerEvents(orgData.events || []);
          // Fetch available permit types for event requirements
          const ptData = await api.get('/permit-types/all');
          setAvailablePermitTypes(ptData.permitTypes || []);
        }
        if (hasAccess) {
          // Fetch vendor's assigned events
          const data = await api.get('/events/my-events');
          setEvents(data.events || []);
          // Fetch published events vendor can apply to
          const pubData = await api.get('/events/published');
          setPublishedEvents(pubData.events || []);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [hasAccess, isOrganizer]);

  const submitEventRequest = async () => {
    setRequestSubmitting(true);
    try {
      await api.post('/suggestions', {
        type: 'event_request',
        title: `Event Request: ${requestForm.eventName}`,
        description: requestForm.additionalInfo,
        eventDetails: {
          eventName: requestForm.eventName,
          organizerName: requestForm.organizerName,
          city: requestForm.city,
          state: requestForm.state,
          startDate: requestForm.startDate,
          endDate: requestForm.endDate,
          eventType: requestForm.eventType,
          website: requestForm.website,
          additionalInfo: requestForm.additionalInfo
        }
      });
      setRequestSubmitted(true);
      setTimeout(() => { setShowRequestModal(false); setRequestSubmitted(false); setRequestForm({ eventName: '', organizerName: '', city: '', state: '', startDate: '', endDate: '', eventType: '', website: '', additionalInfo: '' }); }, 2000);
    } catch (err) { alert(err.message); }
    finally { setRequestSubmitting(false); }
  };

  // Organizer functions
  const createOrganizerEvent = async () => {
    try {
      const eventData = {
        ...newOrgEvent,
        location: { city: newOrgEvent.city, state: newOrgEvent.state, address: newOrgEvent.address }
      };
      await api.post('/events/organizer/create', eventData);
      const orgData = await api.get('/events/organizer/my-events');
      setOrganizerEvents(orgData.events || []);
      setNewOrgEvent({ eventName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', eventType: 'food_event', maxVendors: '', applicationDeadline: '', feeStructure: { applicationFee: 0, boothFee: 0, electricityFee: 0, description: '' }, requiredPermitTypes: [], customPermitRequirements: [], status: 'draft' });
      setOrganizerTab('my-events');
      alert('Event created successfully!');
    } catch (err) { alert(err.message); }
  };

  const updateEventStatus = async (eventId, status) => {
    try {
      await api.put(`/events/organizer/${eventId}/status`, { status });
      const orgData = await api.get('/events/organizer/my-events');
      setOrganizerEvents(orgData.events || []);
    } catch (err) { alert(err.message); }
  };

  const fetchEventApplications = async (eventId) => {
    try {
      const data = await api.get(`/events/organizer/${eventId}/applications`);
      setVendorApplications(data.applications || []);
      setSelectedOrgEvent(organizerEvents.find(e => e._id === eventId));
    } catch (err) { alert(err.message); }
  };

  const handleApplication = async (applicationId, action) => {
    try {
      await api.put(`/events/organizer/applications/${applicationId}`, { status: action });
      if (selectedOrgEvent) fetchEventApplications(selectedOrgEvent._id);
    } catch (err) { alert(err.message); }
  };

  const inviteVendor = async (eventId) => {
    if (!inviteEmail) return;
    try {
      await api.post(`/events/organizer/${eventId}/invite`, { email: inviteEmail });
      setInviteEmail('');
      alert('Invitation sent!');
      fetchEventApplications(eventId);
    } catch (err) { alert(err.message); }
  };

  // Vendor functions
  const applyToEvent = async (eventId) => {
    // Check if user can write (subscription is active)
    if (!canWrite) {
      setShowApplyModal(null);
      setShowUpgradeModal(true);
      return;
    }
    try {
      await api.post(`/events/${eventId}/apply`, { applicationNotes });
      setShowApplyModal(null);
      setApplicationNotes('');
      const pubData = await api.get('/events/published');
      setPublishedEvents(pubData.events || []);
      const data = await api.get('/events/my-events');
      setEvents(data.events || []);
      alert('Application submitted!');
    } catch (err) { 
      if (err.message?.includes('subscription') || err.message?.includes('expired')) {
        setShowUpgradeModal(true);
      } else {
        alert(err.message); 
      }
    }
  };

  const respondToInvitation = async (eventId, accept) => {
    // Check if user can write (subscription is active)
    if (!canWrite) {
      setShowUpgradeModal(true);
      return;
    }
    try {
      await api.put(`/events/${eventId}/respond-invitation`, { accept });
      const data = await api.get('/events/my-events');
      setEvents(data.events || []);
    } catch (err) { 
      if (err.message?.includes('subscription') || err.message?.includes('expired')) {
        setShowUpgradeModal(true);
      } else {
        alert(err.message); 
      }
    }
  };

  // ORGANIZER PORTAL VIEW
  if (isOrganizer) {
    return (
      <div className="events-page organizer-portal">
        <div className="page-header">
          <div>
            <h1>Event Organizer Portal</h1>
            <p>Manage your events, vendors, and compliance</p>
          </div>
          <Badge variant="primary">Organizer Account</Badge>
        </div>
        
        <div className="organizer-tabs">
          {['my-events', 'applications', 'create'].map(tab => (
            <button key={tab} className={organizerTab === tab ? 'active' : ''} onClick={() => { setOrganizerTab(tab); setSelectedOrgEvent(null); }}>
              {tab === 'my-events' ? '🎪 My Events' : tab === 'applications' ? '📋 Applications' : '➕ Create Event'}
            </button>
          ))}
        </div>

        {organizerTab === 'my-events' && !selectedOrgEvent && (
          <div className="organizer-events-list">
            {organizerEvents.length > 0 ? organizerEvents.map(event => (
              <Card key={event._id} className="organizer-event-card">
                <div className="event-header">
                  <div>
                    <h3>{event.eventName}</h3>
                    <p className="event-date"><Icons.Calendar /> {formatDate(event.startDate)} {event.endDate && event.endDate !== event.startDate && `- ${formatDate(event.endDate)}`}</p>
                    <p className="event-location"><Icons.MapPin /> {event.location?.city}, {event.location?.state}</p>
                  </div>
                  <div className="event-status-actions">
                    <Badge variant={event.status === 'published' ? 'success' : event.status === 'closed' ? 'warning' : 'default'}>{event.status}</Badge>
                    <div className="event-stats">
                      <span>{event.vendorApplications?.length || 0} applications</span>
                      <span>{event.assignedVendors?.length || 0} vendors</span>
                    </div>
                  </div>
                </div>
                <div className="event-actions">
                  <Button size="sm" variant="outline" onClick={() => fetchEventApplications(event._id)}>Manage Vendors</Button>
                  {event.status === 'draft' && <Button size="sm" onClick={() => updateEventStatus(event._id, 'published')}>Publish</Button>}
                  {event.status === 'published' && <Button size="sm" variant="outline" onClick={() => updateEventStatus(event._id, 'closed')}>Close Applications</Button>}
                </div>
              </Card>
            )) : (
              <EmptyState icon={Icons.Event} title="No events yet" description="Create your first event to start accepting vendor applications." />
            )}
          </div>
        )}

        {organizerTab === 'my-events' && selectedOrgEvent && (
          <div className="event-management">
            <button className="back-link" onClick={() => setSelectedOrgEvent(null)}>← Back to Events</button>
            <Card className="event-management-header">
              <h2>{selectedOrgEvent.eventName}</h2>
              <p>{formatDate(selectedOrgEvent.startDate)} • {selectedOrgEvent.location?.city}, {selectedOrgEvent.location?.state}</p>
              <div className="invite-vendor-form">
                <Input placeholder="Vendor email to invite" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <Button onClick={() => inviteVendor(selectedOrgEvent._id)} disabled={!inviteEmail}>Invite Vendor</Button>
              </div>
            </Card>
            
            <h3>Vendor Applications & Invitations</h3>
            {vendorApplications.length > 0 ? (
              <div className="applications-list">
                {vendorApplications.map(app => (
                  <Card key={app._id} className={`application-card ${app.status}`}>
                    <div className="application-info">
                      <h4>{app.vendorBusinessId?.businessName || 'Unknown Vendor'}</h4>
                      <p className="vendor-type">{app.vendorBusinessId?.primaryVendorType}</p>
                      <p className="applied-date">Applied: {formatDate(app.appliedAt)}</p>
                      {app.applicationNotes && <p className="app-notes">"{app.applicationNotes}"</p>}
                    </div>
                    <div className="compliance-status">
                      <Badge variant={app.complianceStatus === 'ready' ? 'success' : app.complianceStatus === 'partial' ? 'warning' : 'danger'}>
                        {app.complianceStatus === 'ready' ? 'Compliant' : app.complianceStatus === 'partial' ? 'Partial' : 'Missing Permits'}
                      </Badge>
                      {app.missingPermits?.length > 0 && <small>{app.missingPermits.length} missing</small>}
                    </div>
                    <div className="application-actions">
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'waitlist' ? 'warning' : 'default'}>{app.status}</Badge>
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApplication(app._id, 'approved')}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleApplication(app._id, 'waitlist')}>Waitlist</Button>
                          <Button size="sm" variant="danger" onClick={() => handleApplication(app._id, 'rejected')}>Reject</Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="empty-text">No applications yet</p>
            )}
          </div>
        )}

        {organizerTab === 'applications' && (
          <div className="all-applications">
            <h3>All Pending Applications</h3>
            <p className="section-description">Review applications across all your events</p>
            {organizerEvents.flatMap(e => (e.vendorApplications || []).filter(a => a.status === 'pending').map(a => ({ ...a, eventName: e.eventName, eventId: e._id }))).length > 0 ? (
              <div className="applications-list">
                {organizerEvents.flatMap(e => (e.vendorApplications || []).filter(a => a.status === 'pending').map(a => ({ ...a, eventName: e.eventName, eventId: e._id }))).map(app => (
                  <Card key={app._id} className="application-card pending">
                    <div className="application-info">
                      <small className="event-name">{app.eventName}</small>
                      <h4>{app.vendorBusinessId?.businessName || 'Unknown Vendor'}</h4>
                      <p className="applied-date">Applied: {formatDate(app.appliedAt)}</p>
                    </div>
                    <div className="application-actions">
                      <Button size="sm" onClick={() => { fetchEventApplications(app.eventId); setOrganizerTab('my-events'); }}>Review</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Icons.Checklist} title="No pending applications" description="All applications have been reviewed" />
            )}
          </div>
        )}

        {organizerTab === 'create' && (
          <Card className="create-event-form">
            <h3>Create New Event</h3>
            <div className="form-section">
              <Input label="Event Name *" placeholder="Downtown Food Festival 2024" value={newOrgEvent.eventName} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, eventName: e.target.value }))} />
              <Input label="Description" placeholder="Annual food truck festival..." value={newOrgEvent.description} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, description: e.target.value }))} />
            </div>
            <div className="form-section">
              <div className="form-section-title">Date & Location</div>
              <div className="form-row">
                <Input label="Start Date *" type="date" value={newOrgEvent.startDate} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, startDate: e.target.value }))} />
                <Input label="End Date" type="date" value={newOrgEvent.endDate} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, endDate: e.target.value }))} />
                <Input label="Application Deadline" type="date" value={newOrgEvent.applicationDeadline} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, applicationDeadline: e.target.value }))} />
              </div>
              <div className="form-row">
                <Input label="City *" placeholder="Austin" value={newOrgEvent.city} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, city: e.target.value }))} />
                <Select label="State *" value={newOrgEvent.state} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, state: e.target.value }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
              </div>
              <Input label="Venue Address" placeholder="123 Main Street" value={newOrgEvent.address} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, address: e.target.value }))} />
            </div>
            <div className="form-section">
              <div className="form-section-title">Event Details</div>
              <div className="form-row">
                <Select label="Event Type" value={newOrgEvent.eventType} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, eventType: e.target.value }))} options={[
                  { value: 'food_event', label: 'Food Event' },
                  { value: 'farmers_market', label: 'Farmers Market' },
                  { value: 'festival', label: 'Festival' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'craft_show', label: 'Craft Show' },
                  { value: 'night_market', label: 'Night Market' },
                  { value: 'other', label: 'Other' }
                ]} />
                <Input label="Max Vendors" type="number" placeholder="50" value={newOrgEvent.maxVendors} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, maxVendors: e.target.value }))} />
                <Select label="Status" value={newOrgEvent.status} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, status: e.target.value }))} options={[
                  { value: 'draft', label: 'Draft (not visible)' },
                  { value: 'published', label: 'Published (accepting applications)' }
                ]} />
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title">Fees</div>
              <div className="form-row">
                <Input label="Application Fee ($)" type="number" value={newOrgEvent.feeStructure.applicationFee} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, feeStructure: { ...ev.feeStructure, applicationFee: parseFloat(e.target.value) || 0 } }))} />
                <Input label="Booth Fee ($)" type="number" value={newOrgEvent.feeStructure.boothFee} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, feeStructure: { ...ev.feeStructure, boothFee: parseFloat(e.target.value) || 0 } }))} />
                <Input label="Electricity Fee ($)" type="number" value={newOrgEvent.feeStructure.electricityFee} onChange={(e) => setNewOrgEvent(ev => ({ ...ev, feeStructure: { ...ev.feeStructure, electricityFee: parseFloat(e.target.value) || 0 } }))} />
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title">Required Permits</div>
              <p className="form-hint">Select permits vendors must have to participate in your event</p>
              {availablePermitTypes.length > 0 ? (
                <div className="permit-type-checkboxes">
                  {availablePermitTypes.slice(0, 30).map(pt => (
                    <label key={pt._id} className="checkbox-label">
                      <input type="checkbox" checked={newOrgEvent.requiredPermitTypes?.includes(pt._id)} onChange={(e) => {
                        if (e.target.checked) {
                          setNewOrgEvent(ev => ({ ...ev, requiredPermitTypes: [...(ev.requiredPermitTypes || []), pt._id] }));
                        } else {
                          setNewOrgEvent(ev => ({ ...ev, requiredPermitTypes: (ev.requiredPermitTypes || []).filter(id => id !== pt._id) }));
                        }
                      }} />
                      <span>{pt.name} <small>({pt.jurisdictionId?.city}, {pt.jurisdictionId?.state})</small></span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="empty-text">Loading permit types...</p>
              )}
            </div>
            <div className="form-actions">
              <Button onClick={createOrganizerEvent} disabled={!newOrgEvent.eventName || !newOrgEvent.startDate || !newOrgEvent.city || !newOrgEvent.state}>
                Create Event
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // VENDOR VIEW - requires Elite plan
  // Show different messaging for expired vs no plan
  if (!hasAccess) {
    return (
      <div className="upgrade-feature-page">
        <div className="upgrade-feature-content">
          <div className="upgrade-feature-icon">{isExpired ? <Icons.Lock /> : <Icons.Event />}</div>
          <h1>{isExpired ? 'Subscription Expired' : 'Event Readiness'}</h1>
          <Badge variant={isExpired ? 'danger' : 'warning'}>{isExpired ? 'Renew to Access' : 'Elite Plan Required'}</Badge>
          <p className="upgrade-feature-description">
            {isExpired 
              ? 'Your subscription has expired. Renew now to access event readiness features and see your compliance status for upcoming events.'
              : 'See your permit compliance status for events you\'ve been invited to participate in. Know instantly if you\'re ready or what\'s missing.'}
          </p>
          
          <div className="upgrade-feature-grid">
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Readiness Dashboard</h3>
              <p>See at a glance which events you're ready for and which need attention</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Apply to Events</h3>
              <p>Browse and apply to events looking for vendors like you</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Missing Permit Alerts</h3>
              <p>Know exactly which permits or documents you need for each event</p>
            </div>
            <div className="upgrade-feature-item">
              <div className="upgrade-feature-item-icon"><Icons.Check /></div>
              <h3>Organizer Integration</h3>
              <p>Event organizers can verify your compliance directly</p>
            </div>
          </div>

          <div className="upgrade-pricing-card elite">
            <span className="upgrade-plan-label">Elite Plan</span>
            <div className="upgrade-price">$99<span>/month</span></div>
            <p>Includes everything in Pro + team accounts & priority support</p>
          </div>

          <Button size="lg" onClick={() => window.location.hash = 'settings'}>{isExpired ? 'Renew Subscription' : 'Upgrade to Elite'}</Button>
          <p className="upgrade-note">{isExpired ? 'Restore full access immediately' : '14-day free trial • Cancel anytime'}</p>
          
          <div className="request-event-section">
            <p>Know of an event that should be on PermitWise?</p>
            <Button variant="outline" onClick={() => setShowRequestModal(true)}>Request an Event</Button>
          </div>
        </div>
        
        {/* Event Request Modal - available even without Elite */}
        <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request an Event">
          {requestSubmitted ? (
            <div className="request-success">
              <div className="success-icon"><Icons.Check /></div>
              <h3>Request Submitted!</h3>
              <p>We'll review your event request and add it to PermitWise soon.</p>
            </div>
          ) : (
            <>
              <p className="modal-intro">Tell us about an event you'd like to see on PermitWise for permit compliance tracking.</p>
              <Input label="Event Name *" placeholder="Downtown Food Festival" value={requestForm.eventName} onChange={(e) => setRequestForm(f => ({ ...f, eventName: e.target.value }))} />
              <Input label="Organizer Name" placeholder="City Events Department" value={requestForm.organizerName} onChange={(e) => setRequestForm(f => ({ ...f, organizerName: e.target.value }))} />
              <div className="form-row">
                <Input label="City *" placeholder="Austin" value={requestForm.city} onChange={(e) => setRequestForm(f => ({ ...f, city: e.target.value }))} />
                <Select label="State *" value={requestForm.state} onChange={(e) => setRequestForm(f => ({ ...f, state: e.target.value }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
              </div>
              <div className="form-row">
                <Input label="Start Date" type="date" value={requestForm.startDate} onChange={(e) => setRequestForm(f => ({ ...f, startDate: e.target.value }))} />
                <Input label="End Date" type="date" value={requestForm.endDate} onChange={(e) => setRequestForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <Input label="Event Website" placeholder="https://example.com" value={requestForm.website} onChange={(e) => setRequestForm(f => ({ ...f, website: e.target.value }))} />
              <Input label="Additional Info" placeholder="Any other details about the event..." value={requestForm.additionalInfo} onChange={(e) => setRequestForm(f => ({ ...f, additionalInfo: e.target.value }))} />
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                <Button onClick={submitEventRequest} loading={requestSubmitting} disabled={!requestForm.eventName || !requestForm.city || !requestForm.state}>Submit Request</Button>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const getReadinessIcon = (status) => {
    if (status === 'ready') return <Icons.Check />;
    if (status === 'missing_permit' || status === 'expired_permit') return <Icons.Alert />;
    return <Icons.Clock />;
  };

  // Separate events by source
  const organizerInvitations = events.filter(e => e.eventSource === 'organizer_invitation');
  const marketplaceEvents = events.filter(e => e.eventSource === 'admin_added' || e.eventSource === 'vendor_application');

  // Check for events vendor can still apply to (not already applied or invited)
  const appliedEventIds = new Set([
    ...events.map(e => e._id),
    ...publishedEvents.filter(e => e.vendorApplications?.some(a => a.vendorBusinessId === business?._id)).map(e => e._id)
  ]);
  const availableEvents = publishedEvents.filter(e => !appliedEventIds.has(e._id) && e.status === 'published');

  const renderEventCard = (event) => (
    <Card key={event._id} className={`event-readiness-card ${event.readinessStatus}`}>
      <div className="event-readiness-header">
        <div className="event-date-badge">
          <span className="month">{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="day">{new Date(event.startDate).getDate()}</span>
        </div>
        <div className="event-info">
          <h3>{event.eventName}</h3>
          <p className="organizer">Organized by {event.organizerName}</p>
          <p className="location"><Icons.MapPin /> {event.location?.city}, {event.location?.state}</p>
          {event.invitationStatus === 'invited' && (
            <div className="invitation-actions">
              <Badge variant="warning">Invitation Pending</Badge>
              <Button size="sm" onClick={() => respondToInvitation(event._id, true)}>Accept</Button>
              <Button size="sm" variant="outline" onClick={() => respondToInvitation(event._id, false)}>Decline</Button>
            </div>
          )}
        </div>
        <div className={`readiness-badge ${event.readinessColor}`}>
          {getReadinessIcon(event.readinessStatus)}
          <span>{event.readinessStatus === 'ready' ? 'Ready' : 'Action Needed'}</span>
        </div>
      </div>
      
      <div className="event-readiness-details">
        <div className="permit-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${event.requiredPermitsCount > 0 ? (event.readyCount / event.requiredPermitsCount) * 100 : 100}%` }}></div>
          </div>
          <span className="progress-text">{event.readyCount}/{event.requiredPermitsCount} permits ready</span>
        </div>
        
        {event.readinessStatus !== 'ready' && (
          <div className="readiness-issues">
            <p className="readiness-label">{event.readinessLabel}</p>
            <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>View Details</Button>
          </div>
        )}
        
        {event.readinessStatus === 'ready' && (
          <div className="readiness-success">
            <Icons.Check /> All permits and documents are in order
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h1>Event Readiness</h1>
          <p>Your compliance status for events</p>
        </div>
        <Button variant="outline" onClick={() => setShowRequestModal(true)}>
          <Icons.Plus /> Request Event
        </Button>
      </div>
      
      {/* Organizer Invitations Section - Always show */}
      <div className="events-section">
        <div className="events-section-header">
          <h2>📩 Organizer Invitations <span className="section-count">{organizerInvitations.length}</span></h2>
          <p className="section-description">Events you've been personally invited to by organizers</p>
        </div>
        {organizerInvitations.length > 0 ? (
          <div className="events-readiness-list">
            {organizerInvitations.map(event => (
              <Card key={event._id} className={`readiness-card invitation-card ${event.invitationStatus === 'invited' ? 'pending-response' : ''}`}>
                <div className="readiness-header">
                  <div className="event-date-badge">
                    <span className="month">{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="day">{new Date(event.startDate).getDate()}</span>
                  </div>
                  <div className="readiness-info">
                    <h3>{event.eventName}</h3>
                    <p className="organizer">by {event.organizerName}</p>
                    <p className="location"><Icons.MapPin /> {event.location?.city}, {event.location?.state}</p>
                  </div>
                  {event.invitationStatus === 'invited' ? (
                    <Badge variant="warning">Pending Response</Badge>
                  ) : event.invitationStatus === 'accepted' ? (
                    <Badge variant="success">Accepted</Badge>
                  ) : (
                    <Badge variant="danger">Declined</Badge>
                  )}
                </div>
                
                {event.invitationStatus === 'invited' && (
                  <div className="invitation-actions">
                    <p className="invitation-prompt">You've been invited to participate in this event!</p>
                    <div className="invitation-buttons">
                      <Button size="sm" onClick={() => respondToInvitation(event._id, true)}>Accept Invitation</Button>
                      <Button size="sm" variant="outline" onClick={() => respondToInvitation(event._id, false)}>Decline</Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedEvent(event)}>View Details</Button>
                    </div>
                  </div>
                )}
                
                {event.invitationStatus === 'accepted' && (
                  <>
                    <div className="readiness-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${event.requiredPermitsCount > 0 ? (event.readyCount / event.requiredPermitsCount) * 100 : 100}%` }}></div>
                      </div>
                      <span className="progress-text">{event.readyCount}/{event.requiredPermitsCount} permits ready</span>
                    </div>
                    <div className="readiness-footer" onClick={() => setSelectedEvent(event)}>
                      {event.readinessStatus === 'ready' ? (
                        <span className="status-ready"><Icons.Check /> All permits ready</span>
                      ) : (
                        <span className="status-issues">{event.readinessLabel} <span className="view-link">View Details →</span></span>
                      )}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="section-empty">
            <p>No invitations yet. When organizers invite you to their events, they'll appear here.</p>
          </div>
        )}
      </div>
      
      {/* Available Events to Apply (Marketplace) - Always show */}
      <div className="events-section">
        <div className="events-section-header">
          <h2>🔍 Browse Events <span className="section-count">{availableEvents.length}</span></h2>
          <p className="section-description">Open events accepting vendor applications</p>
        </div>
        {availableEvents.length > 0 ? (
          <div className="available-events-grid">
            {availableEvents.map(event => (
              <Card key={event._id} className="available-event-card">
                <div className="event-date-badge">
                  <span className="month">{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="day">{new Date(event.startDate).getDate()}</span>
                </div>
                <div className="event-info">
                  <h3>{event.eventName}</h3>
                  <p className="location"><Icons.MapPin /> {event.location?.city}, {event.location?.state}</p>
                  <p className="organizer">By {event.organizerName}</p>
                  {event.applicationDeadline && <p className="deadline">Apply by {formatDate(event.applicationDeadline)}</p>}
                </div>
                <Button size="sm" onClick={() => setShowApplyModal(event)}>Apply</Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="section-empty">
            <p>No events currently accepting applications. Check back soon!</p>
          </div>
        )}
      </div>
      
      {/* Marketplace / Routine Events (Admin-added or vendor applied) - Always show */}
      <div className="events-section">
        <div className="events-section-header">
          <h2>🎪 Your Participating Events <span className="section-count">{marketplaceEvents.length}</span></h2>
          <p className="section-description">Events you've applied to or routine events in your area</p>
        </div>
        {marketplaceEvents.length > 0 ? (
          <div className="events-readiness-list">
            {marketplaceEvents.map(renderEventCard)}
          </div>
        ) : (
          <div className="section-empty">
            <p>No participating events yet. Apply to events above or wait for admin-assigned routine events.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal - Enhanced */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.eventName}>
        {selectedEvent && (
          <div className="event-detail-modal">
            {/* Event Info Section */}
            <div className="event-detail-section">
              <h4>Event Information</h4>
              <div className="event-info-grid">
                <div className="info-item">
                  <span className="info-label">Date</span>
                  <span className="info-value">{formatDate(selectedEvent.startDate)}{selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate ? ` - ${formatDate(selectedEvent.endDate)}` : ''}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{selectedEvent.location?.city}, {selectedEvent.location?.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Organizer</span>
                  <span className="info-value">{selectedEvent.organizerName}</span>
                </div>
                {selectedEvent.description && (
                  <div className="info-item full-width">
                    <span className="info-label">Description</span>
                    <span className="info-value">{selectedEvent.description}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Invitation Status & Actions */}
            {selectedEvent.eventSource === 'organizer_invitation' && selectedEvent.invitationStatus === 'invited' && (
              <div className="event-detail-section invitation-section">
                <div className="invitation-banner">
                  <Icons.Bell />
                  <div>
                    <h4>You've Been Invited!</h4>
                    <p>The organizer has personally invited you to participate in this event.</p>
                  </div>
                </div>
                <div className="invitation-response-buttons">
                  <Button onClick={() => { respondToInvitation(selectedEvent._id, true); setSelectedEvent(null); }}>Accept Invitation</Button>
                  <Button variant="outline" onClick={() => { respondToInvitation(selectedEvent._id, false); setSelectedEvent(null); }}>Decline</Button>
                </div>
              </div>
            )}
            
            {/* Required Permits Section */}
            {selectedEvent.requiredPermitTypes && selectedEvent.requiredPermitTypes.length > 0 && (
              <div className="event-detail-section">
                <h4>Required Permits ({selectedEvent.requiredPermitTypes.length})</h4>
                <div className="required-permits-list">
                  {selectedEvent.requiredPermitTypes.map((pt, i) => (
                    <div key={i} className="required-permit-item">
                      <Icons.Document />
                      <span>{typeof pt === 'object' ? pt.name : pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Compliance Status Section */}
            {(selectedEvent.invitationStatus === 'accepted' || selectedEvent.eventSource !== 'organizer_invitation' || !selectedEvent.invitationStatus) && (
              <div className="event-detail-section">
                <h4>Your Compliance Status</h4>
                <div className="compliance-overview">
                  <div className="compliance-progress">
                    <div className="progress-bar large">
                      <div className="progress-fill" style={{ width: `${selectedEvent.requiredPermitsCount > 0 ? (selectedEvent.readyCount / selectedEvent.requiredPermitsCount) * 100 : 100}%` }}></div>
                    </div>
                    <span className="progress-label">{selectedEvent.readyCount} of {selectedEvent.requiredPermitsCount} permits ready</span>
                  </div>
                </div>
                
                {selectedEvent.issues?.length > 0 ? (
                  <div className="issues-list">
                    <p className="issues-intro">The following issues need to be resolved:</p>
                    {selectedEvent.issues.map((issue, i) => (
                      <div key={i} className={`issue-item ${issue.type}`}>
                        {issue.type === 'missing' && <><Icons.Alert /> <span><strong>{issue.permit}</strong> - Permit not found</span></>}
                        {issue.type === 'expired' && <><Icons.Clock /> <span><strong>{issue.permit}</strong> - Expired or will expire before event</span></>}
                        {issue.type === 'missing_document' && <><Icons.Document /> <span><strong>{issue.permit}</strong> - Document not uploaded</span></>}
                        {issue.type === 'in_progress' && <><Icons.Clock /> <span><strong>{issue.permit}</strong> - Application in progress</span></>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="all-good">
                    <Icons.Check /> All requirements met! You're ready for this event.
                  </div>
                )}
              </div>
            )}
            
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
              {selectedEvent.issues?.length > 0 && (
                <Button onClick={() => { setSelectedEvent(null); window.location.hash = 'permits'; }}>Go to Permits</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Apply to Event Modal */}
      <Modal isOpen={!!showApplyModal} onClose={() => setShowApplyModal(null)} title={`Apply to ${showApplyModal?.eventName}`}>
        {showApplyModal && (
          <div className="apply-modal">
            <div className="event-summary">
              <p><strong>Date:</strong> {formatDate(showApplyModal.startDate)}</p>
              <p><strong>Location:</strong> {showApplyModal.location?.city}, {showApplyModal.location?.state}</p>
              {showApplyModal.feeStructure?.boothFee > 0 && <p><strong>Booth Fee:</strong> ${showApplyModal.feeStructure.boothFee}</p>}
            </div>
            <Input label="Application Notes (optional)" placeholder="Tell the organizer about your business..." value={applicationNotes} onChange={(e) => setApplicationNotes(e.target.value)} />
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowApplyModal(null)}>Cancel</Button>
              <Button onClick={() => applyToEvent(showApplyModal._id)}>Submit Application</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Event Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request an Event">
        {requestSubmitted ? (
          <div className="request-success">
            <div className="success-icon"><Icons.Check /></div>
            <h3>Request Submitted!</h3>
            <p>We'll review your event request and add it to PermitWise soon.</p>
          </div>
        ) : (
          <>
            <p className="modal-intro">Tell us about an event you'd like to see on PermitWise for permit compliance tracking.</p>
            <Input label="Event Name *" placeholder="Downtown Food Festival" value={requestForm.eventName} onChange={(e) => setRequestForm(f => ({ ...f, eventName: e.target.value }))} />
            <Input label="Organizer Name" placeholder="City Events Department" value={requestForm.organizerName} onChange={(e) => setRequestForm(f => ({ ...f, organizerName: e.target.value }))} />
            <div className="form-row">
              <Input label="City *" placeholder="Austin" value={requestForm.city} onChange={(e) => setRequestForm(f => ({ ...f, city: e.target.value }))} />
              <Select label="State *" value={requestForm.state} onChange={(e) => setRequestForm(f => ({ ...f, state: e.target.value }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
            </div>
            <div className="form-row">
              <Input label="Start Date" type="date" value={requestForm.startDate} onChange={(e) => setRequestForm(f => ({ ...f, startDate: e.target.value }))} />
              <Input label="End Date" type="date" value={requestForm.endDate} onChange={(e) => setRequestForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <Input label="Event Website" placeholder="https://example.com" value={requestForm.website} onChange={(e) => setRequestForm(f => ({ ...f, website: e.target.value }))} />
            <Input label="Additional Info" placeholder="Any other details about the event..." value={requestForm.additionalInfo} onChange={(e) => setRequestForm(f => ({ ...f, additionalInfo: e.target.value }))} />
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
              <Button onClick={submitEventRequest} loading={requestSubmitting} disabled={!requestForm.eventName || !requestForm.city || !requestForm.state}>Submit Request</Button>
            </div>
          </>
        )}
      </Modal>
      
      {/* Upgrade Modal for expired subscriptions */}
      <UpgradeRequiredModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        reason={isExpired ? "Your subscription has expired" : "This feature requires an active subscription"}
        feature="Event Integration"
      />
    </div>
  );
};

const SettingsPage = () => {
  const { user, business, subscription, fetchUser, updateBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); const [loading, setLoading] = useState(false); const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', notificationPreferences: user?.notificationPreferences || { email: true, sms: false, push: true } });
  const [businessData, setBusinessData] = useState({ 
    businessName: business?.businessName || '', dbaName: business?.dbaName || '', 
    phone: business?.phone || '', email: business?.email || '', ein: business?.ein || '',
    handlesFood: business?.handlesFood || false,
    address: business?.address || { street: '', city: '', state: '', zip: '' },
    operatingCities: business?.operatingCities || [{ city: '', state: '', isPrimary: true }],
    vehicleDetails: business?.vehicleDetails || { type: '', make: '', model: '', year: '', licensePlate: '' },
    insurance: business?.insurance || { provider: '', policyNumber: '', expiryDate: '' }
  });
  const [teamMembers, setTeamMembers] = useState([]); const [newMember, setNewMember] = useState({ email: '', role: 'member' });

  useEffect(() => {
    if (subscription?.features?.teamAccounts) {
      api.get('/team').then(data => setTeamMembers(data.members || [])).catch(console.error);
    }
  }, [subscription]);

  const handleProfileSave = async () => { setLoading(true); try { await api.put('/auth/profile', profileData); await fetchUser(); setMessage('Profile updated'); } catch (err) { setMessage(err.message); } finally { setLoading(false); } };
  const handleBusinessSave = async () => { setLoading(true); try { const data = await api.put('/business', businessData); updateBusiness(data.business); setMessage('Business updated'); } catch (err) { setMessage(err.message); } finally { setLoading(false); } };
  
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
        setMessage(`Food handling enabled! Added ${syncResult.addedCount} food safety permit(s) to your dashboard.`);
      } else if (!checked && syncResult.removedCount > 0) {
        setMessage(`Food handling disabled. Removed ${syncResult.removedCount} empty food safety permit(s). Permits with documents were kept.`);
      } else {
        setMessage(checked ? 'Food handling enabled.' : 'Food handling disabled.');
      }
    } catch (err) { 
      setMessage(err.message); 
      // Revert on error
      setBusinessData(d => ({ ...d, handlesFood: !checked }));
    } finally { setLoading(false); }
  };
  
  const handleUpgrade = async (plan) => { try { const data = await api.post('/subscription/checkout', { plan }); if (data.url) window.location.href = data.url; } catch (err) { alert(err.message); } };
  const addCity = () => setBusinessData(d => ({ ...d, operatingCities: [...d.operatingCities, { city: '', state: '', isPrimary: false }] }));
  const updateCity = (i, field, value) => { const cities = [...businessData.operatingCities]; cities[i] = { ...cities[i], [field]: value }; setBusinessData(d => ({ ...d, operatingCities: cities })); };
  const removeCity = (i) => { if (businessData.operatingCities.length > 1) setBusinessData(d => ({ ...d, operatingCities: d.operatingCities.filter((_, idx) => idx !== i) })); };
  const inviteMember = async () => { try { await api.post('/team/invite', newMember); setNewMember({ email: '', role: 'member' }); const data = await api.get('/team'); setTeamMembers(data.members || []); setMessage('Invitation sent'); } catch (err) { alert(err.message); } };
  const removeMember = async (id) => { if (window.confirm('Remove this team member?')) { try { await api.delete(`/team/${id}`); setTeamMembers(m => m.filter(t => t._id !== id)); } catch (err) { alert(err.message); } } };

  const tabs = ['profile', 'business', 'cities', 'notifications', 'billing'];
  if (subscription?.features?.teamAccounts) tabs.splice(4, 0, 'team');

  return (
    <div className="settings-page">
      <div className="page-header"><h1>Settings</h1></div>
      <div className="settings-layout">
        <div className="settings-nav">{tabs.map(tab => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>)}</div>
        <div className="settings-content">
          {message && <Alert type="info" onClose={() => setMessage('')}>{message}</Alert>}
          
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile</h2>
              <div className="form-row"><Input label="First Name" value={profileData.firstName} onChange={(e) => setProfileData(d => ({ ...d, firstName: e.target.value }))} /><Input label="Last Name" value={profileData.lastName} onChange={(e) => setProfileData(d => ({ ...d, lastName: e.target.value }))} /></div>
              <Input label="Email" value={user?.email} disabled />
              <Input label="Phone" value={profileData.phone} onChange={(e) => setProfileData(d => ({ ...d, phone: e.target.value }))} placeholder="+1 (555) 123-4567" />
              <Button onClick={handleProfileSave} loading={loading}>Save Profile</Button>
            </div>
          )}
          
          {activeTab === 'business' && (
            <div className="settings-section">
              <h2>Business Information</h2>
              <Input label="Business Name" value={businessData.businessName} onChange={(e) => setBusinessData(d => ({ ...d, businessName: e.target.value }))} />
              <Input label="DBA Name (Doing Business As)" value={businessData.dbaName} onChange={(e) => setBusinessData(d => ({ ...d, dbaName: e.target.value }))} />
              <Input label="EIN (Tax ID)" value={businessData.ein} onChange={(e) => setBusinessData(d => ({ ...d, ein: e.target.value }))} placeholder="XX-XXXXXXX" />
              <div className="form-row"><Input label="Business Phone" value={businessData.phone} onChange={(e) => setBusinessData(d => ({ ...d, phone: e.target.value }))} /><Input label="Business Email" value={businessData.email} onChange={(e) => setBusinessData(d => ({ ...d, email: e.target.value }))} /></div>
              
              <h3>Food Handling</h3>
              <Card className="notification-card">
                <label className="toggle-row">
                  <span>My business handles or serves food</span>
                  <input type="checkbox" checked={businessData.handlesFood || false} onChange={(e) => handleFoodHandlingToggle(e.target.checked)} disabled={loading} />
                </label>
                <p className="toggle-description">Enable this if your business prepares, serves, or sells food. This will automatically add or remove food safety permits from your dashboard.</p>
              </Card>
              
              <h3>Business Address</h3>
              <Input label="Street Address" value={businessData.address.street} onChange={(e) => setBusinessData(d => ({ ...d, address: { ...d.address, street: e.target.value } }))} />
              <div className="form-row">
                <Input label="City" value={businessData.address.city} onChange={(e) => setBusinessData(d => ({ ...d, address: { ...d.address, city: e.target.value } }))} />
                <Select label="State" value={businessData.address.state} onChange={(e) => setBusinessData(d => ({ ...d, address: { ...d.address, state: e.target.value } }))} options={[{ value: '', label: 'Select' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
                <Input label="ZIP" value={businessData.address.zip} onChange={(e) => setBusinessData(d => ({ ...d, address: { ...d.address, zip: e.target.value } }))} />
              </div>
              <h3>Vehicle Information</h3>
              <div className="form-row">
                <Select label="Type" value={businessData.vehicleDetails.type} onChange={(e) => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, type: e.target.value } }))} options={[{ value: '', label: 'Select' }, { value: 'truck', label: 'Food Truck' }, { value: 'trailer', label: 'Trailer' }, { value: 'cart', label: 'Cart' }, { value: 'tent', label: 'Tent/Booth' }, { value: 'other', label: 'Other' }]} />
                <Input label="Make" value={businessData.vehicleDetails.make} onChange={(e) => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, make: e.target.value } }))} />
              </div>
              <div className="form-row">
                <Input label="Model" value={businessData.vehicleDetails.model} onChange={(e) => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, model: e.target.value } }))} />
                <Input label="Year" value={businessData.vehicleDetails.year} onChange={(e) => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, year: e.target.value } }))} />
                <Input label="License Plate" value={businessData.vehicleDetails.licensePlate} onChange={(e) => setBusinessData(d => ({ ...d, vehicleDetails: { ...d.vehicleDetails, licensePlate: e.target.value } }))} />
              </div>
              <h3>Insurance</h3>
              <div className="form-row">
                <Input label="Provider" value={businessData.insurance.provider} onChange={(e) => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, provider: e.target.value } }))} />
                <Input label="Policy Number" value={businessData.insurance.policyNumber} onChange={(e) => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, policyNumber: e.target.value } }))} />
                <Input label="Expiry Date" type="date" value={businessData.insurance.expiryDate ? businessData.insurance.expiryDate.split('T')[0] : ''} onChange={(e) => setBusinessData(d => ({ ...d, insurance: { ...d.insurance, expiryDate: e.target.value } }))} />
              </div>
              <Button onClick={handleBusinessSave} loading={loading}>Save Business Info</Button>
            </div>
          )}
          
          {activeTab === 'cities' && (
            <div className="settings-section">
              <h2>Operating Cities</h2>
              <p className="section-description">Add all the cities where you operate. We'll track permit requirements for each location.</p>
              {businessData.operatingCities.map((city, i) => (
                <Card key={i} className="city-card">
                  <div className="form-row">
                    <Select label="State" value={city.state} onChange={(e) => updateCity(i, 'state', e.target.value)} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
                    <CitySearch 
                      label="City" 
                      state={city.state}
                      value={city.city}
                      onChange={(cityName) => updateCity(i, 'city', cityName)}
                      placeholder="Search for your city..."
                    />
                    {businessData.operatingCities.length > 1 && <button className="remove-btn" onClick={() => removeCity(i)}><Icons.Trash /></button>}
                  </div>
                  <label className="checkbox-label"><input type="checkbox" checked={city.isPrimary} onChange={(e) => updateCity(i, 'isPrimary', e.target.checked)} /> Primary location</label>
                </Card>
              ))}
              <Button variant="outline" onClick={addCity}><Icons.Plus /> Add City</Button>
              <Button onClick={handleBusinessSave} loading={loading} style={{ marginLeft: '1rem' }}>Save Cities</Button>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <Card className="notification-card">
                <label className="toggle-row"><span>Email Notifications</span><input type="checkbox" checked={profileData.notificationPreferences.email} onChange={(e) => setProfileData(d => ({ ...d, notificationPreferences: { ...d.notificationPreferences, email: e.target.checked } }))} /></label>
                <p className="toggle-description">Receive permit expiration reminders and updates via email</p>
              </Card>
              <Card className="notification-card">
                <label className="toggle-row"><span>SMS Alerts {!subscription?.features?.smsAlerts && <Badge variant="warning">Pro</Badge>}</span><input type="checkbox" checked={profileData.notificationPreferences.sms} onChange={(e) => setProfileData(d => ({ ...d, notificationPreferences: { ...d.notificationPreferences, sms: e.target.checked } }))} disabled={!subscription?.features?.smsAlerts} /></label>
                <p className="toggle-description">Get text messages for urgent permit deadlines</p>
              </Card>
              <Card className="notification-card">
                <label className="toggle-row"><span>Push Notifications</span><input type="checkbox" checked={profileData.notificationPreferences.push} onChange={(e) => setProfileData(d => ({ ...d, notificationPreferences: { ...d.notificationPreferences, push: e.target.checked } }))} /></label>
                <p className="toggle-description">Receive in-app notifications</p>
              </Card>
              <Button onClick={handleProfileSave} loading={loading}>Save Preferences</Button>
            </div>
          )}
          
          {activeTab === 'team' && subscription?.features?.teamAccounts && (
            <div className="settings-section">
              <h2>Team Management</h2>
              <p className="section-description">Invite team members to help manage permits and documents.</p>
              <Card className="invite-card">
                <h3>Invite Team Member</h3>
                <div className="form-row">
                  <Input label="Email" value={newMember.email} onChange={(e) => setNewMember(m => ({ ...m, email: e.target.value }))} placeholder="team@example.com" />
                  <Select label="Role" value={newMember.role} onChange={(e) => setNewMember(m => ({ ...m, role: e.target.value }))} options={[{ value: 'member', label: 'Member' }, { value: 'admin', label: 'Admin' }]} />
                </div>
                <Button onClick={inviteMember} disabled={!newMember.email}>Send Invite</Button>
              </Card>
              <h3>Team Members</h3>
              {teamMembers.length > 0 ? teamMembers.map(member => (
                <Card key={member._id} className="team-member-card">
                  <div className="member-info"><span className="member-name">{member.userId?.firstName} {member.userId?.lastName}</span><span className="member-email">{member.userId?.email}</span></div>
                  <div className="member-meta"><Badge variant={member.role === 'admin' ? 'primary' : 'default'}>{member.role}</Badge><Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge></div>
                  {member.role !== 'owner' && <button className="remove-btn" onClick={() => removeMember(member._id)}><Icons.Trash /></button>}
                </Card>
              )) : <p className="empty-text">No team members yet</p>}
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="settings-section">
              <h2>Billing & Subscription</h2>
              <Card className="current-plan">
                <div className="plan-header"><h3>Current Plan</h3><Badge variant="primary">{subscription?.plan?.toUpperCase() || 'TRIAL'}</Badge></div>
                <p>Status: <strong>{subscription?.status}</strong></p>
                {subscription?.status === 'trial' && subscription?.trialEndsAt && <p className="trial-warning">Trial ends {formatDate(subscription.trialEndsAt)}</p>}
                {subscription?.currentPeriodEnd && <p>Next billing: {formatDate(subscription.currentPeriodEnd)}</p>}
              </Card>
              <h3>Available Plans</h3>
              <div className="plans-grid">
                {[
                  { id: 'basic', name: 'Starter', price: 19, features: ['Permit tracking', 'Email reminders', 'Document vault', '1 user'] },
                  { id: 'pro', name: 'Pro', price: 49, features: ['Everything in Starter', 'SMS alerts', 'PDF autofill', 'Inspection checklists', 'Multi-city support'] },
                  { id: 'elite', name: 'Elite', price: 99, features: ['Everything in Pro', 'Event readiness', 'Team accounts (5 users)', 'Priority support', 'API access'] }
                ].map(plan => (
                  <Card key={plan.id} className={`plan-card ${subscription?.plan === plan.id ? 'current' : ''}`}>
                    <h3>{plan.name}</h3>
                    <div className="price">${plan.price}<span>/mo</span></div>
                    <ul className="plan-features">{plan.features.map((f, i) => <li key={i}><Icons.Check /> {f}</li>)}</ul>
                    <Button variant={subscription?.plan === plan.id ? 'outline' : 'primary'} onClick={() => handleUpgrade(plan.id)} disabled={subscription?.plan === plan.id}>{subscription?.plan === plan.id ? 'Current Plan' : 'Upgrade'}</Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===========================================
// LEGAL PAGES
// ===========================================
const TermsPage = ({ onBack }) => (
  <div className="legal-page">
    <div className="legal-container">
      <button className="back-link" onClick={onBack}><Icons.X /> Back</button>
      <h1>Terms of Service</h1>
      <p className="legal-updated">Last Updated: January 2025</p>
      
      <div className="legal-content">
        <p>Welcome to PermitWise ("PermitWise," "we," "our," or "us"). PermitWise provides software tools that help mobile vendors organize permits, track compliance deadlines, store documents, and receive reminders.</p>
        <p>By creating an account or using PermitWise in any way, you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
        
        <h2>1. Eligibility</h2>
        <p>You must be at least 18 years old and legally capable of entering into contracts. You are responsible for ensuring that your use of PermitWise complies with local, state, and federal laws.</p>
        
        <h2>2. Description of Service</h2>
        <p>PermitWise is a software platform that offers:</p>
        <ul>
          <li>Permit tracking and reminders</li>
          <li>Document storage</li>
          <li>Compliance checklists</li>
          <li>Auto-filled permit application tools (where applicable)</li>
          <li>Multi-city permit requirement data</li>
          <li>Optional SMS/email notifications</li>
          <li>Team accounts (for higher-tier plans)</li>
        </ul>
        <p><strong>PermitWise does not file permits on your behalf or guarantee approval of any permits or inspections.</strong></p>
        
        <h2>3. No Legal or Regulatory Advice</h2>
        <p>PermitWise is not a legal service, regulatory authority, or compliance consultant. All information presented in the app is for general guidance only and may not reflect the most current regulations. You are solely responsible for confirming requirements with the appropriate agencies.</p>
        
        <h2>4. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate and complete information</li>
          <li>Maintain the confidentiality of your credentials</li>
          <li>Upload only documents you have the right to store</li>
          <li>Use PermitWise only for lawful purposes</li>
          <li>Not abuse, harm, or attempt to reverse-engineer the platform</li>
        </ul>
        <p>You are fully responsible for any activity under your account.</p>
        
        <h2>5. Subscriptions & Billing</h2>
        <p>PermitWise offers monthly and yearly subscription plans. By subscribing, you authorize us or our payment processor to charge the applicable fees. All fees are non-refundable unless required by law. You may cancel at any time; service will remain active until the end of the billing period. We may modify pricing with advance notice.</p>
        
        <h2>6. Data Storage & Security</h2>
        <p>PermitWise stores uploaded documents securely using modern cloud storage practices. However, no system is 100% secure. You understand and accept this risk.</p>
        
        <h2>7. Termination</h2>
        <p>We may suspend or terminate your account for violating these Terms, non-payment, misuse of the platform, or fraudulent activity. You may cancel your account at any time through your settings.</p>
        
        <h2>8. Disclaimers</h2>
        <p>PermitWise is provided "as is" without warranties of any kind. We do not guarantee permit approvals, accuracy or completeness of regulatory data, avoidance of fines, shutdowns, or penalties, or continuous or error-free service.</p>
        
        <h2>9. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, PermitWise shall not be liable for loss of revenue, missed deadlines or expired permits, errors in regulatory information, damages arising from reliance on the platform, or indirect or consequential damages. Our maximum liability is limited to the amount you paid in the past 12 months.</p>
        
        <h2>10. Changes to Terms</h2>
        <p>We may update these Terms at any time. Continued use of PermitWise after changes constitutes acceptance.</p>
        
        <h2>11. Contact</h2>
        <p>For questions: <a href="mailto:support@permitwise.com">support@permitwise.com</a></p>
      </div>
    </div>
  </div>
);

const PrivacyPage = ({ onBack }) => (
  <div className="legal-page">
    <div className="legal-container">
      <button className="back-link" onClick={onBack}><Icons.X /> Back</button>
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last Updated: January 2025</p>
      
      <div className="legal-content">
        <p>PermitWise ("PermitWise," "we," "our") respects your privacy. This Privacy Policy explains how we collect, use, store, and protect information when you use our services.</p>
        
        <h2>1. Information We Collect</h2>
        <h3>1.1 Information You Provide Directly</h3>
        <ul>
          <li>Name and contact details</li>
          <li>Business information</li>
          <li>Permit details</li>
          <li>Uploaded documents (permits, insurance, inspections, etc.)</li>
          <li>Payment information (processed by Stripe—we do NOT store card numbers)</li>
        </ul>
        
        <h3>1.2 Automatically Collected Information</h3>
        <ul>
          <li>Device data (browser, OS, IP address)</li>
          <li>Usage logs</li>
          <li>Cookies and analytics data</li>
        </ul>
        
        <h3>1.3 Third-Party Data</h3>
        <p>We may collect data from publicly available sources or city websites to build permit requirement templates.</p>
        
        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>Delivering core app functionality</li>
          <li>Sending reminders and notifications</li>
          <li>Providing customer support</li>
          <li>Improving platform performance</li>
          <li>Processing payments</li>
          <li>Researching compliance requirements across cities</li>
        </ul>
        <p><strong>We never sell your data.</strong></p>
        
        <h2>3. Document Storage</h2>
        <p>Documents you upload (permits, inspections, insurance, etc.) are encrypted in transit and stored securely. You control what files are uploaded and when files are removed.</p>
        
        <h2>4. Communication</h2>
        <p>By creating an account, you may receive renewal reminders, account-related communications, security alerts, and optional SMS notifications (Pro plans). Marketing messages are opt-in and can be opted out anytime.</p>
        
        <h2>5. Sharing of Information</h2>
        <p>We may share limited data with service providers (email, SMS, cloud hosting), payment processors (for subscription management), and regulatory agencies (only when you explicitly request it via application export). We do not sell personal data to advertisers or third parties.</p>
        
        <h2>6. Data Retention</h2>
        <p>We retain data for as long as your account is active. You may request deletion at any time. Deleted data is permanently removed from active systems within a reasonable timeframe.</p>
        
        <h2>7. Security</h2>
        <p>We use encryption, access controls, secure API design, and industry-standard hosting. However, no platform is 100% secure. You agree to use PermitWise at your own risk.</p>
        
        <h2>8. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have rights to access your data, correct inaccuracies, delete your data, request copies of your documents, and opt out of marketing. Requests can be sent to <a href="mailto:privacy@permitwise.com">privacy@permitwise.com</a>.</p>
        
        <h2>9. Children's Privacy</h2>
        <p>PermitWise is not intended for individuals under 18.</p>
        
        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy at any time.</p>
        
        <h2>11. Contact</h2>
        <p>For privacy-related questions: <a href="mailto:privacy@permitwise.com">privacy@permitwise.com</a></p>
      </div>
    </div>
  </div>
);

// ===========================================
// ADMIN PAGE
// ===========================================
const SuperAdminPage = ({ onBack }) => {
  // Admin authentication state
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin panel state
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ users: [], businesses: [], permits: [], jurisdictions: [], permitTypes: [], checklists: [], events: [], organizers: [], stats: null });
  const [message, setMessage] = useState('');
  const [newJurisdiction, setNewJurisdiction] = useState({ name: '', city: '', state: '', county: '', type: 'city' });
  const [newPermitType, setNewPermitType] = useState({ name: '', description: '', jurisdictionId: '', vendorTypes: [], requiresFoodHandling: false, renewalPeriodMonths: 12, importanceLevel: 'critical', issuingAuthorityName: '', estimatedCost: '', requiredDocuments: '', fees: { application: 0, renewal: 0 } });
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [duplicateJurisdiction, setDuplicateJurisdiction] = useState('');
  const [editingPermitType, setEditingPermitType] = useState(null);
  
  // Subscription management state
  const [managingSubscription, setManagingSubscription] = useState(null); // Business being managed
  const [subscriptionAction, setSubscriptionAction] = useState(''); // 'extend', 'grant', 'revoke'
  const [subscriptionForm, setSubscriptionForm] = useState({ days: 30, plan: 'promo', durationDays: 90, note: '' });
  
  // Checklist management state
  const [newChecklist, setNewChecklist] = useState({ name: '', description: '', jurisdictionId: '', vendorTypes: [], category: 'health', items: [{ itemText: '', description: '', required: true }] });
  const [editingChecklist, setEditingChecklist] = useState(null);
  
  // Suggestion/ticket management state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionFilter, setSuggestionFilter] = useState('pending');
  
  // Event management state
  const [newEvent, setNewEvent] = useState({ eventName: '', organizerName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', vendorFee: '', maxVendors: '', status: 'draft', requiredPermits: [] });
  
  // Event vendor management state
  const [managingEvent, setManagingEvent] = useState(null);
  const [vendorToAssign, setVendorToAssign] = useState('');

  // Verify existing admin token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const adminToken = localStorage.getItem('superadminToken');
      if (!adminToken) {
        setAdminLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/admin/verify`, {
          headers: { 'X-Admin-Token': adminToken }
        });
        if (response.ok) {
          setAdminAuthenticated(true);
        } else {
          localStorage.removeItem('superadminToken');
        }
      } catch (err) {
        localStorage.removeItem('superadminToken');
      }
      setAdminLoading(false);
    };
    verifyToken();
  }, []);

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Login failed');
      localStorage.setItem('superadminToken', result.adminToken);
      setAdminAuthenticated(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Admin logout
  const handleAdminLogout = () => {
    localStorage.removeItem('superadminToken');
    setAdminAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  // Admin API helper
  const adminApi = async (endpoint, method = 'GET', body = null) => {
    const adminToken = localStorage.getItem('superadminToken');
    const options = { method, headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      if (type === 'users') { const result = await adminApi('/admin/users'); setData(d => ({ ...d, users: result.users || [] })); }
      else if (type === 'businesses') { const result = await adminApi('/admin/businesses'); setData(d => ({ ...d, businesses: result.businesses || [] })); }
      else if (type === 'organizers') { const result = await adminApi('/admin/organizers'); setData(d => ({ ...d, organizers: result.organizers || [] })); }
      else if (type === 'jurisdictions') { const result = await adminApi('/admin/jurisdictions'); setData(d => ({ ...d, jurisdictions: result.jurisdictions || [] })); }
      else if (type === 'permitTypes') { const result = await adminApi('/admin/permit-types'); setData(d => ({ ...d, permitTypes: result.permitTypes || [] })); }
      else if (type === 'checklists') { const result = await adminApi('/admin/checklists'); setData(d => ({ ...d, checklists: result.checklists || [] })); }
      else if (type === 'events') { const result = await adminApi('/admin/events'); setData(d => ({ ...d, events: result.events || [] })); }
      else if (type === 'suggestions') { const result = await adminApi(`/admin/suggestions?status=${suggestionFilter}`); setSuggestions(result.suggestions || []); }
      else if (type === 'stats') { const result = await adminApi('/admin/stats'); setData(d => ({ ...d, stats: result })); }
    } catch (err) { setMessage(err.message); }
    finally { setLoading(false); }
  };

  // Organizer management
  const toggleOrganizerStatus = async (userId, disabled) => {
    try {
      await adminApi(`/admin/organizers/${userId}/status`, 'PUT', { disabled });
      fetchData('organizers');
      setMessage(disabled ? 'Organizer disabled' : 'Organizer enabled');
    } catch (err) { setMessage(err.message); }
  };

  const createOrganizerAccount = async (email) => {
    try {
      await adminApi('/admin/organizers', 'POST', { email });
      fetchData('organizers');
      setMessage('Organizer account created');
    } catch (err) { setMessage(err.message); }
  };

  const convertEventRequestToEvent = async (suggestion) => {
    try {
      const eventDetails = suggestion.eventDetails;
      await adminApi('/admin/events', 'POST', {
        eventName: eventDetails.eventName,
        organizerName: eventDetails.organizerName || 'TBD',
        description: eventDetails.additionalInfo,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate || eventDetails.startDate,
        city: eventDetails.city,
        state: eventDetails.state,
        status: 'draft'
      });
      await updateSuggestion(suggestion._id, 'completed', 'Converted to event');
      setMessage('Event created from request');
    } catch (err) { setMessage(err.message); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (adminAuthenticated) fetchData(activeTab); }, [activeTab, adminAuthenticated]);
  
  // Initial stats fetch
  useEffect(() => { if (adminAuthenticated) fetchData('stats'); }, [adminAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const createJurisdiction = async () => {
    try {
      await adminApi('/admin/jurisdictions', 'POST', newJurisdiction);
      setNewJurisdiction({ name: '', city: '', state: '', county: '', type: 'city' });
      fetchData('jurisdictions');
      setMessage('Jurisdiction created');
    } catch (err) { setMessage(err.message); }
  };

  const createPermitType = async () => {
    const payload = { ...newPermitType, requiredDocuments: newPermitType.requiredDocuments.split(',').map(d => d.trim()).filter(Boolean) };
    try {
      await adminApi('/admin/permit-types', 'POST', payload);
      setNewPermitType({ name: '', description: '', jurisdictionId: '', vendorTypes: [], requiresFoodHandling: false, renewalPeriodMonths: 12, importanceLevel: 'critical', issuingAuthorityName: '', estimatedCost: '', requiredDocuments: '', fees: { application: 0, renewal: 0 } });
      fetchData('permitTypes');
      setMessage('Permit type created');
    } catch (err) { setMessage(err.message); }
  };

  const duplicatePermitType = async () => {
    if (!duplicateTarget) return;
    try {
      await adminApi(`/admin/permit-types/${duplicateTarget}/duplicate`, 'POST', { newJurisdictionId: duplicateJurisdiction || undefined });
      setDuplicateTarget(null);
      setDuplicateJurisdiction('');
      fetchData('permitTypes');
      setMessage('Permit type duplicated');
    } catch (err) { setMessage(err.message); }
  };

  const deleteUser = async (id) => { if (window.confirm('Delete this user?')) { try { await adminApi(`/admin/users/${id}`, 'DELETE'); fetchData('users'); setMessage('User deleted'); } catch (err) { setMessage(err.message); } } };
  const deleteBusiness = async (id) => { if (window.confirm('Delete this business?')) { try { await adminApi(`/admin/businesses/${id}`, 'DELETE'); fetchData('businesses'); setMessage('Business deleted'); } catch (err) { setMessage(err.message); } } };
  const deleteJurisdiction = async (id) => { if (window.confirm('Delete this jurisdiction?')) { try { await adminApi(`/admin/jurisdictions/${id}`, 'DELETE'); fetchData('jurisdictions'); setMessage('Jurisdiction deleted'); } catch (err) { setMessage(err.message); } } };
  const deletePermitType = async (id) => { if (window.confirm('Delete this permit type?')) { try { await adminApi(`/admin/permit-types/${id}`, 'DELETE'); fetchData('permitTypes'); setMessage('Permit type deleted'); } catch (err) { setMessage(err.message); } } };
  
  // Checklist CRUD functions
  const createChecklist = async () => {
    try {
      await adminApi('/admin/checklists', 'POST', {
        name: newChecklist.name,
        description: newChecklist.description,
        jurisdictionId: newChecklist.jurisdictionId || null,
        vendorTypes: newChecklist.vendorTypes || [],
        category: newChecklist.category,
        items: newChecklist.items.filter(i => i.itemText.trim())
      });
      setNewChecklist({ name: '', description: '', jurisdictionId: '', vendorTypes: [], category: 'health', items: [{ itemText: '', description: '', required: true }] });
      fetchData('checklists');
      setMessage('Checklist created');
    } catch (err) { setMessage(err.message); }
  };
  
  const updateChecklist = async () => {
    if (!editingChecklist) return;
    try {
      await adminApi(`/admin/checklists/${editingChecklist._id}`, 'PUT', {
        name: editingChecklist.name,
        description: editingChecklist.description,
        jurisdictionId: editingChecklist.jurisdictionId || null,
        vendorTypes: editingChecklist.vendorTypes || [],
        category: editingChecklist.category,
        items: editingChecklist.items?.filter(i => i.itemText?.trim()) || [],
        active: editingChecklist.active
      });
      setEditingChecklist(null);
      fetchData('checklists');
      setMessage('Checklist updated');
    } catch (err) { setMessage(err.message); }
  };
  
  const deleteChecklist = async (id) => { if (window.confirm('Delete this checklist?')) { try { await adminApi(`/admin/checklists/${id}`, 'DELETE'); fetchData('checklists'); setMessage('Checklist deleted'); } catch (err) { setMessage(err.message); } } };

  // Suggestion functions
  const updateSuggestion = async (id, status, adminNotes) => {
    try {
      await adminApi(`/admin/suggestions/${id}`, 'PUT', { status, adminNotes });
      fetchData('suggestions');
      setMessage(`Suggestion marked as ${status}`);
    } catch (err) { setMessage(err.message); }
  };
  const deleteSuggestion = async (id) => { if (window.confirm('Delete this suggestion?')) { try { await adminApi(`/admin/suggestions/${id}`, 'DELETE'); fetchData('suggestions'); setMessage('Suggestion deleted'); } catch (err) { setMessage(err.message); } } };

  // Event CRUD functions
  const createEvent = async () => {
    try {
      await adminApi('/admin/events', 'POST', {
        eventName: newEvent.eventName,
        organizerName: newEvent.organizerName,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate || newEvent.startDate,
        city: newEvent.city,
        state: newEvent.state,
        address: newEvent.address,
        vendorFee: newEvent.vendorFee,
        maxVendors: newEvent.maxVendors,
        status: newEvent.status,
        requiredPermitTypes: newEvent.requiredPermits || []
      });
      setNewEvent({ eventName: '', organizerName: '', description: '', startDate: '', endDate: '', city: '', state: '', address: '', vendorFee: '', maxVendors: '', status: 'draft', requiredPermits: [] });
      fetchData('events');
      setMessage('Event created');
    } catch (err) { setMessage(err.message); }
  };
  const deleteEvent = async (id) => { if (window.confirm('Delete this event?')) { try { await adminApi(`/admin/events/${id}`, 'DELETE'); fetchData('events'); setMessage('Event deleted'); } catch (err) { setMessage(err.message); } } };
  
  // Event vendor assignment functions
  const assignVendorToEvent = async () => {
    if (!managingEvent || !vendorToAssign) return;
    try {
      const result = await adminApi(`/admin/events/${managingEvent._id}/assign-vendor`, 'POST', { vendorBusinessId: vendorToAssign });
      setManagingEvent(result.event);
      setVendorToAssign('');
      fetchData('events');
      setMessage('Vendor assigned to event');
    } catch (err) { setMessage(err.message); }
  };
  
  const removeVendorFromEvent = async (vendorId) => {
    if (!managingEvent || !window.confirm('Remove this vendor from the event?')) return;
    try {
      await adminApi(`/admin/events/${managingEvent._id}/remove-vendor/${vendorId}`, 'DELETE');
      setManagingEvent(prev => ({
        ...prev,
        assignedVendors: prev.assignedVendors.filter(v => v.vendorBusinessId?._id !== vendorId)
      }));
      fetchData('events');
      setMessage('Vendor removed from event');
    } catch (err) { setMessage(err.message); }
  };
  
  const updatePermitType = async () => {
    if (!editingPermitType) return;
    try {
      const payload = {
        ...editingPermitType,
        jurisdictionId: editingPermitType.jurisdictionId?._id || editingPermitType.jurisdictionId,
        requiredDocuments: typeof editingPermitType.requiredDocuments === 'string' 
          ? editingPermitType.requiredDocuments.split(',').map(d => d.trim()).filter(Boolean)
          : editingPermitType.requiredDocuments
      };
      await adminApi(`/admin/permit-types/${editingPermitType._id}`, 'PUT', payload);
      setEditingPermitType(null);
      fetchData('permitTypes');
      setMessage('Permit type updated');
    } catch (err) { setMessage(err.message); }
  };

  // Subscription management functions
  const extendTrial = async () => {
    if (!managingSubscription) return;
    try {
      const result = await adminApi(`/admin/subscriptions/${managingSubscription._id}/extend-trial`, 'POST', {
        days: subscriptionForm.days,
        note: subscriptionForm.note
      });
      setMessage(result.message);
      setManagingSubscription(null);
      setSubscriptionAction('');
      fetchData('businesses');
    } catch (err) { setMessage(err.message); }
  };

  const grantPromo = async () => {
    if (!managingSubscription) return;
    try {
      const result = await adminApi(`/admin/subscriptions/${managingSubscription._id}/grant-promo`, 'POST', {
        plan: subscriptionForm.plan,
        durationDays: subscriptionForm.plan === 'promo' ? subscriptionForm.durationDays : null,
        note: subscriptionForm.note
      });
      setMessage(result.message);
      setManagingSubscription(null);
      setSubscriptionAction('');
      fetchData('businesses');
    } catch (err) { setMessage(err.message); }
  };

  const revokeSubscription = async () => {
    if (!managingSubscription) return;
    if (!window.confirm('Are you sure you want to revoke this subscription? The user will lose access to paid features.')) return;
    try {
      const result = await adminApi(`/admin/subscriptions/${managingSubscription._id}/revoke`, 'POST', {
        note: subscriptionForm.note
      });
      setMessage(result.message);
      setManagingSubscription(null);
      setSubscriptionAction('');
      fetchData('businesses');
    } catch (err) { setMessage(err.message); }
  };

  const openSubscriptionManager = (business) => {
    setManagingSubscription(business);
    setSubscriptionAction('');
    setSubscriptionForm({ days: 30, plan: 'promo', durationDays: 90, note: '' });
  };

  const getSubscriptionStatusColor = (sub) => {
    if (!sub) return 'gray';
    if (sub.status === 'lifetime') return 'purple';
    if (sub.status === 'promo') return 'blue';
    if (sub.status === 'active') return 'green';
    if (sub.status === 'trial') {
      const daysLeft = sub.trialEndsAt ? Math.ceil((new Date(sub.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
      return daysLeft > 0 ? 'yellow' : 'red';
    }
    return 'red';
  };

  const getImportanceLabel = (level) => {
    if (level === 'critical') return { text: 'Critical', variant: 'danger' };
    if (level === 'often_forgotten') return { text: 'Often Forgotten', variant: 'warning' };
    if (level === 'event_required') return { text: 'Event Required', variant: 'info' };
    return { text: 'Critical', variant: 'danger' };
  };

  // Filter permit types by search
  const filteredPermitTypes = data.permitTypes.filter(pt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return pt.name?.toLowerCase().includes(search) || pt.jurisdictionId?.name?.toLowerCase().includes(search) || pt.jurisdictionId?.city?.toLowerCase().includes(search);
  });

  // Show loading while checking auth
  if (adminLoading) {
    return (
      <div className="admin-login">
        <LoadingSpinner />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!adminAuthenticated) {
    return (
      <div className="admin-login">
        <button className="back-link" onClick={onBack}><Icons.X /> Back to Site</button>
        <Card className="admin-login-card">
          <div className="admin-login-icon"><Icons.Lock /></div>
          <h1>Super Admin</h1>
          <p>Enter your credentials to access the admin dashboard.</p>
          <form onSubmit={handleAdminLogin} className="admin-login-form">
            {loginError && <Alert type="error">{loginError}</Alert>}
            <Input 
              label="Username" 
              value={loginData.username} 
              onChange={(e) => setLoginData(d => ({ ...d, username: e.target.value }))} 
              required 
              autoFocus
            />
            <Input 
              label="Password" 
              type="password" 
              value={loginData.password} 
              onChange={(e) => setLoginData(d => ({ ...d, password: e.target.value }))} 
              required 
            />
            <Button type="submit" loading={loginLoading} className="full-width">Login</Button>
          </form>
          <p className="admin-login-hint">Credentials are set in environment variables (ADMIN_USERNAME & ADMIN_PASSWORD)</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="back-link" onClick={onBack}><Icons.X /> Exit</button>
        <h1>PermitWise Super Admin</h1>
        <Button variant="outline" onClick={handleAdminLogout}>Logout</Button>
      </div>
      {message && <Alert type="info" onClose={() => setMessage('')}>{message}</Alert>}
      
      <div className="admin-tabs">
        {['stats', 'users', 'businesses', 'organizers', 'jurisdictions', 'permitTypes', 'checklists', 'events', 'suggestions'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab === 'permitTypes' ? 'Permit Types' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading && <LoadingSpinner />}
        
        {activeTab === 'stats' && data.stats && (
          <div className="admin-stats">
            <div className="stats-grid">
              <Card className="stat-card"><span className="stat-value">{data.stats.totalUsers || 0}</span><span className="stat-label">Total Users</span></Card>
              <Card className="stat-card"><span className="stat-value">{data.stats.totalBusinesses || 0}</span><span className="stat-label">Businesses</span></Card>
              <Card className="stat-card"><span className="stat-value">{data.stats.totalPermits || 0}</span><span className="stat-label">Permits Tracked</span></Card>
              <Card className="stat-card"><span className="stat-value">{data.stats.activeSubscriptions || 0}</span><span className="stat-label">Active Subscriptions</span></Card>
              <Card className="stat-card"><span className="stat-value">{data.stats.totalJurisdictions || 0}</span><span className="stat-label">Jurisdictions</span></Card>
              <Card className="stat-card"><span className="stat-value">{data.stats.totalPermitTypes || 0}</span><span className="stat-label">Permit Types</span></Card>
            </div>
            <Card className="recent-signups">
              <h3>Recent Activity</h3>
              <p>New users today: {data.stats.newUsersToday || 0}</p>
              <p>New users this week: {data.stats.newUsersThisWeek || 0}</p>
              <p>MRR: ${data.stats.mrr || 0}</p>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {data.users.map(user => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td><Badge variant={user.role === 'admin' ? 'primary' : 'default'}>{user.role}</Badge></td>
                    <td>{user.emailVerified ? '✓' : '✗'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td><button className="delete-btn" onClick={() => deleteUser(user._id)}><Icons.Trash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'businesses' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Business Name</th><th>Owner</th><th>Type</th><th>Cities</th><th>Plan / Status</th><th>Expires</th><th>Actions</th></tr></thead>
              <tbody>
                {data.businesses.map(biz => {
                  const sub = biz.subscription;
                  const statusColor = getSubscriptionStatusColor(sub);
                  const expiryDate = sub?.promoExpiresAt || sub?.trialEndsAt || sub?.currentPeriodEnd;
                  const isExpired = expiryDate && new Date(expiryDate) < new Date();
                  return (
                    <tr key={biz._id}>
                      <td><strong>{biz.businessName}</strong></td>
                      <td>{biz.ownerId?.email || 'N/A'}</td>
                      <td>{biz.primaryVendorType}</td>
                      <td>{biz.operatingCities?.map(c => c.city).join(', ') || 'None'}</td>
                      <td>
                        <Badge variant={statusColor === 'green' ? 'success' : statusColor === 'red' ? 'danger' : statusColor === 'purple' ? 'primary' : 'warning'}>
                          {sub?.plan?.toUpperCase() || 'TRIAL'}
                        </Badge>
                        {sub?.promoNote && <span className="promo-note" title={sub.promoNote}>🎁</span>}
                      </td>
                      <td className={isExpired ? 'text-danger' : ''}>
                        {sub?.status === 'lifetime' ? '∞ Never' : (expiryDate ? formatDate(expiryDate) : 'N/A')}
                        {isExpired && sub?.status !== 'lifetime' && ' (Expired)'}
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit" onClick={() => openSubscriptionManager(biz)} title="Manage Subscription"><Icons.Settings /></button>
                        <button className="delete-btn" onClick={() => deleteBusiness(biz._id)} title="Delete"><Icons.Trash /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'organizers' && (
          <div>
            <Card className="create-form admin-form-enhanced">
              <div className="form-header">
                <h3>👤 Make User an Organizer</h3>
                <p className="form-hint">Enter the email of an existing user to grant them organizer access.</p>
              </div>
              <div className="form-section">
                <div className="form-row">
                  <Input label="User Email" placeholder="organizer@example.com" id="newOrganizerEmail" />
                  <Button onClick={() => createOrganizerAccount(document.getElementById('newOrganizerEmail').value)}>
                    <Icons.Plus /> Make Organizer
                  </Button>
                </div>
              </div>
            </Card>
            
            <div className="admin-section-header">
              <h3>🎪 Event Organizers ({data.organizers.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Events</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.organizers.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">No organizers yet</td></tr>
                  ) : data.organizers.map(org => (
                    <tr key={org._id}>
                      <td><strong>{org.firstName} {org.lastName}</strong></td>
                      <td>{org.email}</td>
                      <td>{org.organizerProfile?.companyName || 'N/A'}</td>
                      <td>{org.eventCount || 0} events</td>
                      <td>
                        <Badge variant={org.organizerProfile?.disabled ? 'danger' : org.organizerProfile?.verified ? 'success' : 'warning'}>
                          {org.organizerProfile?.disabled ? 'Disabled' : org.organizerProfile?.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="actions-cell">
                        {org.organizerProfile?.disabled ? (
                          <Button size="sm" onClick={() => toggleOrganizerStatus(org._id, false)}>Enable</Button>
                        ) : (
                          <Button size="sm" variant="danger" onClick={() => toggleOrganizerStatus(org._id, true)}>Disable</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jurisdictions' && (
          <div>
            <Card className="create-form admin-form-enhanced">
              <div className="form-header">
                <h3>➕ Add New Jurisdiction (City/County)</h3>
                <p className="form-hint">A jurisdiction represents a city or county that issues permits.</p>
              </div>
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <Select label="Type *" value={newJurisdiction.type} onChange={(e) => setNewJurisdiction(j => ({ ...j, type: e.target.value }))} options={[{ value: 'city', label: 'City' }, { value: 'county', label: 'County' }, { value: 'state', label: 'State' }]} />
                  </div>
                  <div className="form-group">
                    <Input label="City *" placeholder="Austin" value={newJurisdiction.city} onChange={(e) => {
                      const city = e.target.value;
                      setNewJurisdiction(j => ({ ...j, city, name: city ? `City of ${city}` : '' }));
                    }} />
                  </div>
                  <div className="form-group">
                    <Select label="State *" value={newJurisdiction.state} onChange={(e) => setNewJurisdiction(j => ({ ...j, state: e.target.value }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
                  </div>
                </div>
                <Input label="Display Name" placeholder="City of Austin (auto-generated)" value={newJurisdiction.name} onChange={(e) => setNewJurisdiction(j => ({ ...j, name: e.target.value }))} />
                <Input label="County (optional)" placeholder="Travis County" value={newJurisdiction.county || ''} onChange={(e) => setNewJurisdiction(j => ({ ...j, county: e.target.value }))} />
              </div>
              <div className="form-actions">
                <Button onClick={createJurisdiction} disabled={!newJurisdiction.city || !newJurisdiction.state}>
                  <Icons.Plus /> Add Jurisdiction
                </Button>
                {newJurisdiction.city && newJurisdiction.state && (
                  <span className="form-preview">Will create: <strong>{newJurisdiction.name || `City of ${newJurisdiction.city}`}</strong> ({newJurisdiction.city}, {newJurisdiction.state})</span>
                )}
              </div>
            </Card>
            
            <div className="admin-section-header">
              <h3>📍 Existing Jurisdictions ({data.jurisdictions.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>City</th><th>State</th><th>Permit Types</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.jurisdictions.length === 0 ? (
                    <tr><td colSpan="5" className="empty-row">No jurisdictions yet. Add your first one above!</td></tr>
                  ) : data.jurisdictions.map(j => (
                    <tr key={j._id}>
                      <td><strong>{j.name}</strong></td>
                      <td>{j.city}</td>
                      <td>{j.state}</td>
                      <td><Badge variant={j.permitTypesCount > 0 ? 'success' : 'default'}>{j.permitTypesCount || 0} permit{j.permitTypesCount !== 1 ? 's' : ''}</Badge></td>
                      <td><button className="delete-btn" onClick={() => deleteJurisdiction(j._id)} title="Delete"><Icons.Trash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'permitTypes' && (
          <div>
            <Card className="create-form admin-form-enhanced">
              <div className="form-header">
                <h3>📋 Add New Permit Type</h3>
                <p className="form-hint">Define a permit that vendors need in a specific jurisdiction.</p>
              </div>
              
              {/* Basic Info Section */}
              <div className="form-section">
                <div className="form-section-title">Basic Information</div>
                <div className="form-row">
                  <div className="form-group flex-2">
                    <Input label="Permit Name *" placeholder="Mobile Food Vendor Permit" value={newPermitType.name} onChange={(e) => setNewPermitType(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <Select label="Jurisdiction *" value={newPermitType.jurisdictionId} onChange={(e) => setNewPermitType(p => ({ ...p, jurisdictionId: e.target.value }))} options={[{ value: '', label: 'Select Jurisdiction' }, ...data.jurisdictions.map(j => ({ value: j._id, label: `${j.city}, ${j.state}` }))]} />
                  </div>
                </div>
                <Input label="Description" placeholder="Required permit for operating a mobile food establishment..." value={newPermitType.description} onChange={(e) => setNewPermitType(p => ({ ...p, description: e.target.value }))} />
              </div>
              
              {/* Classification Section */}
              <div className="form-section">
                <div className="form-section-title">Classification & Priority</div>
                <div className="form-row">
                  <div className="form-group">
                    <Select label="Importance Level *" value={newPermitType.importanceLevel} onChange={(e) => setNewPermitType(p => ({ ...p, importanceLevel: e.target.value }))} options={[
                      { value: 'critical', label: '🔴 Critical - Required to operate' },
                      { value: 'often_forgotten', label: '🟡 Often Forgotten - Easy to miss' },
                      { value: 'event_required', label: '🔵 Event Required - For special events' }
                    ]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vendor Types (who needs this?)</label>
                    <div className="vendor-type-checkboxes">
                      {VENDOR_TYPES.map(vt => (
                        <label key={vt.value} className="vendor-checkbox">
                          <input 
                            type="checkbox" 
                            checked={newPermitType.vendorTypes?.includes(vt.value)} 
                            onChange={(e) => {
                              const types = newPermitType.vendorTypes || [];
                              if (e.target.checked) {
                                setNewPermitType(p => ({ ...p, vendorTypes: [...types, vt.value] }));
                              } else {
                                setNewPermitType(p => ({ ...p, vendorTypes: types.filter(t => t !== vt.value) }));
                              }
                            }}
                          />
                          <span>{vt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="checkbox-row" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={newPermitType.requiresFoodHandling || false}
                    onChange={(e) => setNewPermitType(p => ({ ...p, requiresFoodHandling: e.target.checked }))}
                  />
                  <span>Required for any business that handles food</span>
                </label>
                <p className="form-hint" style={{ marginTop: '0' }}>When checked, this permit will be suggested to ALL vendors who have "handles food" enabled, regardless of their vendor type. Use for food handler certificates, health permits, etc.</p>
                <div className="importance-hints">
                  <div className="hint critical"><strong>Critical:</strong> Health permits, business licenses, food handler certs</div>
                  <div className="hint warning"><strong>Often Forgotten:</strong> Fire inspections, commissary agreements, vehicle permits</div>
                  <div className="hint info"><strong>Event Required:</strong> Special event permits, temporary vendor licenses</div>
                </div>
              </div>
              
              {/* Authority & Cost Section */}
              <div className="form-section">
                <div className="form-section-title">Issuing Authority & Costs</div>
                <div className="form-row">
                  <Input label="Issuing Authority" placeholder="Austin Public Health" value={newPermitType.issuingAuthorityName} onChange={(e) => setNewPermitType(p => ({ ...p, issuingAuthorityName: e.target.value }))} />
                  <Input label="Estimated Cost Range" placeholder="$300–$500" value={newPermitType.estimatedCost} onChange={(e) => setNewPermitType(p => ({ ...p, estimatedCost: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Input label="Renewal Period (months)" type="number" min="1" value={newPermitType.renewalPeriodMonths} onChange={(e) => setNewPermitType(p => ({ ...p, renewalPeriodMonths: parseInt(e.target.value) || 12 }))} />
                  <Input label="Application Fee ($)" type="number" min="0" value={newPermitType.fees.application} onChange={(e) => setNewPermitType(p => ({ ...p, fees: { ...p.fees, application: parseFloat(e.target.value) || 0 } }))} />
                  <Input label="Renewal Fee ($)" type="number" min="0" value={newPermitType.fees.renewal} onChange={(e) => setNewPermitType(p => ({ ...p, fees: { ...p.fees, renewal: parseFloat(e.target.value) || 0 } }))} />
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="form-section">
                <div className="form-section-title">Required Documents</div>
                <Input label="Documents (comma-separated)" placeholder="Food Handler Certificate, Proof of Insurance, Commissary Agreement, Vehicle Registration" value={newPermitType.requiredDocuments} onChange={(e) => setNewPermitType(p => ({ ...p, requiredDocuments: e.target.value }))} />
                <p className="form-hint">Common documents: Food Handler Certificate, Proof of Insurance, Commissary Agreement, Business License, Vehicle Registration, Fire Extinguisher Certificate</p>
              </div>
              
              {/* Preview & Submit */}
              <div className="form-actions">
                <Button onClick={createPermitType} disabled={!newPermitType.name || !newPermitType.jurisdictionId}>
                  <Icons.Plus /> Create Permit Type
                </Button>
                {newPermitType.name && newPermitType.jurisdictionId && (
                  <div className="permit-preview">
                    <strong>Preview:</strong> {newPermitType.name} • {data.jurisdictions.find(j => j._id === newPermitType.jurisdictionId)?.city} • 
                    <Badge variant={newPermitType.importanceLevel === 'critical' ? 'danger' : newPermitType.importanceLevel === 'often_forgotten' ? 'warning' : 'info'}>
                      {newPermitType.importanceLevel === 'critical' ? 'Critical' : newPermitType.importanceLevel === 'often_forgotten' ? 'Often Forgotten' : 'Event Required'}
                    </Badge> • 
                    Renews every {newPermitType.renewalPeriodMonths} months
                  </div>
                )}
              </div>
            </Card>
            
            {/* Search Bar */}
            <div className="admin-section-header">
              <h3>📋 Existing Permit Types ({data.permitTypes.length})</h3>
              <div className="admin-search inline">
                <Input placeholder="Search by name, city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <span className="search-results">{filteredPermitTypes.length} result{filteredPermitTypes.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Jurisdiction</th><th>Importance</th><th>Renewal</th><th>App Fee</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredPermitTypes.length === 0 ? (
                    <tr><td colSpan="6" className="empty-row">{searchTerm ? 'No permits match your search.' : 'No permit types yet. Add your first one above!'}</td></tr>
                  ) : filteredPermitTypes.map(pt => {
                    const label = getImportanceLabel(pt.importanceLevel);
                    return (
                      <tr key={pt._id}>
                        <td><strong>{pt.name}</strong>{pt.description && <span className="table-subtitle">{pt.description.substring(0, 50)}...</span>}</td>
                        <td>{pt.jurisdictionId?.city}, {pt.jurisdictionId?.state}</td>
                        <td><Badge variant={label.variant}>{label.text}</Badge></td>
                        <td>{pt.renewalPeriodMonths} mo</td>
                        <td>${pt.fees?.application || 0}</td>
                        <td className="actions-cell">
                          <button className="action-btn edit" onClick={() => setEditingPermitType({...pt, requiredDocuments: pt.requiredDocuments?.join(', ') || ''})} title="Edit"><Icons.Edit /></button>
                          <button className="action-btn duplicate" onClick={() => setDuplicateTarget(pt._id)} title="Duplicate to another city"><Icons.Plus /></button>
                          <button className="delete-btn" onClick={() => deletePermitType(pt._id)} title="Delete"><Icons.Trash /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div>
            <Card className="create-form admin-form-enhanced">
              <div className="form-header">
                <h3>➕ Create Inspection Checklist</h3>
                <p className="form-hint">Create checklists for vendors to self-inspect before official inspections.</p>
              </div>
              <div className="form-section">
                <Input label="Checklist Name *" placeholder="Health Inspection Pre-Check" value={newChecklist.name} onChange={(e) => setNewChecklist(c => ({ ...c, name: e.target.value }))} />
                <Input label="Description" placeholder="Standard health department inspection items" value={newChecklist.description} onChange={(e) => setNewChecklist(c => ({ ...c, description: e.target.value }))} />
                <div className="form-row">
                  <Select label="Category" value={newChecklist.category} onChange={(e) => setNewChecklist(c => ({ ...c, category: e.target.value }))} options={[
                    { value: 'health', label: '🏥 Health' },
                    { value: 'fire', label: '🔥 Fire Safety' },
                    { value: 'safety', label: '⚠️ General Safety' },
                    { value: 'general', label: '📋 General' }
                  ]} />
                  <Select label="Jurisdiction (optional)" value={newChecklist.jurisdictionId} onChange={(e) => setNewChecklist(c => ({ ...c, jurisdictionId: e.target.value }))} options={[{ value: '', label: 'All Jurisdictions' }, ...data.jurisdictions.map(j => ({ value: j._id, label: `${j.city}, ${j.state}` }))]} />
                  <Select label="For Organization (optional)" value={newChecklist.forOrganization || ''} onChange={(e) => setNewChecklist(c => ({ ...c, forOrganization: e.target.value }))} options={[{ value: '', label: 'All Vendors (Public)' }, ...data.businesses.map(b => ({ value: b._id, label: b.businessName }))]} />
                </div>
                <div className="form-section-title">Applicable Vendor Types</div>
                <p className="form-hint">Select which vendor types this checklist applies to. Leave all unchecked for "All Vendor Types".</p>
                <div className="vendor-type-checkboxes">
                  {VENDOR_TYPES.map(vt => (
                    <label key={vt.value} className="checkbox-inline">
                      <input 
                        type="checkbox" 
                        checked={newChecklist.vendorTypes?.includes(vt.value) || false} 
                        onChange={(e) => {
                          const types = newChecklist.vendorTypes || [];
                          if (e.target.checked) {
                            setNewChecklist(c => ({ ...c, vendorTypes: [...types, vt.value] }));
                          } else {
                            setNewChecklist(c => ({ ...c, vendorTypes: types.filter(t => t !== vt.value) }));
                          }
                        }}
                      />
                      <span>{vt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-section">
                <div className="form-section-title">Checklist Items</div>
                {newChecklist.items.map((item, i) => (
                  <div key={i} className="checklist-item-row">
                    <span className="item-number">{i + 1}.</span>
                    <Input placeholder="Item text (e.g., 'Food stored at proper temperature')" value={item.itemText} onChange={(e) => {
                      const items = [...newChecklist.items];
                      items[i] = { ...items[i], itemText: e.target.value };
                      setNewChecklist(c => ({ ...c, items }));
                    }} />
                    <button type="button" className="delete-btn" onClick={() => {
                      if (newChecklist.items.length > 1) {
                        setNewChecklist(c => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }));
                      }
                    }}><Icons.Trash /></button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setNewChecklist(c => ({ ...c, items: [...c.items, { itemText: '', description: '', required: true }] }))}>
                  <Icons.Plus /> Add Item
                </Button>
              </div>
              <div className="form-actions">
                <Button onClick={createChecklist} disabled={!newChecklist.name || !newChecklist.items.some(i => i.itemText)}>
                  <Icons.Plus /> Create Checklist
                </Button>
              </div>
            </Card>
            
            <div className="admin-section-header">
              <h3>📋 Existing Checklists ({data.checklists.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Category</th><th>Jurisdiction</th><th>Vendor Types</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.checklists.map(cl => (
                    <tr key={cl._id}>
                      <td>
                        <strong>{cl.name}</strong>
                        {cl.description && <><br /><small>{cl.description}</small></>}
                        {cl.forOrganization && <><br /><Badge variant="info">Organization-Specific</Badge></>}
                      </td>
                      <td><Badge variant={cl.category === 'health' ? 'danger' : cl.category === 'fire' ? 'warning' : 'default'}>{cl.category}</Badge></td>
                      <td>{cl.jurisdictionId ? `${cl.jurisdictionId.city}, ${cl.jurisdictionId.state}` : 'All'}</td>
                      <td>{cl.vendorTypes?.length > 0 ? cl.vendorTypes.map(vt => VENDOR_TYPES.find(v => v.value === vt)?.label || vt).join(', ') : (cl.vendorType || 'All')}</td>
                      <td>{cl.items?.length || 0}</td>
                      <td><Badge variant={cl.active ? 'success' : 'default'}>{cl.active ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="actions-cell">
                        <button className="action-btn edit" onClick={() => setEditingChecklist({...cl, vendorTypes: cl.vendorTypes || (cl.vendorType ? [cl.vendorType] : [])})} title="Edit"><Icons.Edit /></button>
                        <button className="delete-btn" onClick={() => deleteChecklist(cl._id)} title="Delete"><Icons.Trash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Edit Checklist Modal */}
            {editingChecklist && (
              <Modal isOpen={!!editingChecklist} onClose={() => setEditingChecklist(null)} title="Edit Checklist" size="lg">
                <Input label="Checklist Name *" value={editingChecklist.name} onChange={(e) => setEditingChecklist(c => ({ ...c, name: e.target.value }))} />
                <Input label="Description" value={editingChecklist.description || ''} onChange={(e) => setEditingChecklist(c => ({ ...c, description: e.target.value }))} />
                <div className="form-row">
                  <Select label="Category" value={editingChecklist.category} onChange={(e) => setEditingChecklist(c => ({ ...c, category: e.target.value }))} options={[
                    { value: 'health', label: '🏥 Health' },
                    { value: 'fire', label: '🔥 Fire Safety' },
                    { value: 'safety', label: '⚠️ General Safety' },
                    { value: 'general', label: '📋 General' }
                  ]} />
                  <Select label="Status" value={editingChecklist.active ? 'active' : 'inactive'} onChange={(e) => setEditingChecklist(c => ({ ...c, active: e.target.value === 'active' }))} options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]} />
                </div>
                <div className="form-section-title">Applicable Vendor Types</div>
                <div className="vendor-type-checkboxes">
                  {VENDOR_TYPES.map(vt => (
                    <label key={vt.value} className="checkbox-inline">
                      <input 
                        type="checkbox" 
                        checked={editingChecklist.vendorTypes?.includes(vt.value) || false} 
                        onChange={(e) => {
                          const types = editingChecklist.vendorTypes || [];
                          if (e.target.checked) {
                            setEditingChecklist(c => ({ ...c, vendorTypes: [...types, vt.value] }));
                          } else {
                            setEditingChecklist(c => ({ ...c, vendorTypes: types.filter(t => t !== vt.value) }));
                          }
                        }}
                      />
                      <span>{vt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="form-section-title">Checklist Items</div>
                {editingChecklist.items?.map((item, i) => (
                  <div key={i} className="checklist-item-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ minWidth: '30px' }}>{i + 1}.</span>
                    <Input placeholder="Item text" value={item.itemText || ''} onChange={(e) => {
                      const items = [...(editingChecklist.items || [])];
                      items[i] = { ...items[i], itemText: e.target.value };
                      setEditingChecklist(c => ({ ...c, items }));
                    }} />
                    <button type="button" className="delete-btn" onClick={() => {
                      if (editingChecklist.items?.length > 1) {
                        setEditingChecklist(c => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }));
                      }
                    }}><Icons.Trash /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setEditingChecklist(c => ({ ...c, items: [...(c.items || []), { itemText: '', description: '', required: true }] }))}>
                  <Icons.Plus /> Add Item
                </Button>
                <div className="modal-actions">
                  <Button variant="outline" onClick={() => setEditingChecklist(null)}>Cancel</Button>
                  <Button onClick={updateChecklist}>Save Changes</Button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <Card className="create-form admin-form-enhanced">
              <div className="form-header">
                <h3>➕ Create Event</h3>
                <p className="form-hint">Create events for organizers using PermitWise. Vendors will see their compliance status for assigned events.</p>
              </div>
              <div className="form-section">
                <Input label="Event Name *" placeholder="Downtown Food Festival" value={newEvent.eventName} onChange={(e) => setNewEvent(ev => ({ ...ev, eventName: e.target.value }))} />
                <Input label="Organizer Name" placeholder="City Events Department" value={newEvent.organizerName} onChange={(e) => setNewEvent(ev => ({ ...ev, organizerName: e.target.value }))} />
                <Input label="Description" placeholder="Annual food truck festival featuring local vendors" value={newEvent.description} onChange={(e) => setNewEvent(ev => ({ ...ev, description: e.target.value }))} />
              </div>
              <div className="form-section">
                <div className="form-section-title">Date & Location</div>
                <div className="form-row">
                  <Input label="Start Date *" type="date" value={newEvent.startDate} onChange={(e) => setNewEvent(ev => ({ ...ev, startDate: e.target.value }))} />
                  <Input label="End Date" type="date" value={newEvent.endDate} onChange={(e) => setNewEvent(ev => ({ ...ev, endDate: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Input label="City *" placeholder="Austin" value={newEvent.city} onChange={(e) => setNewEvent(ev => ({ ...ev, city: e.target.value }))} />
                  <Select label="State *" value={newEvent.state} onChange={(e) => setNewEvent(ev => ({ ...ev, state: e.target.value }))} options={[{ value: '', label: 'Select State' }, ...US_STATES.map(s => ({ value: s, label: s }))]} />
                </div>
                <Input label="Address" placeholder="123 Main Street" value={newEvent.address} onChange={(e) => setNewEvent(ev => ({ ...ev, address: e.target.value }))} />
              </div>
              <div className="form-section">
                <div className="form-section-title">Requirements & Status</div>
                <div className="form-row">
                  <Select label="Status" value={newEvent.status} onChange={(e) => setNewEvent(ev => ({ ...ev, status: e.target.value }))} options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'closed', label: 'Closed' }
                  ]} />
                  <Input label="Vendor Fee ($)" type="number" placeholder="150" value={newEvent.vendorFee} onChange={(e) => setNewEvent(ev => ({ ...ev, vendorFee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Required Permits</label>
                  <p className="form-hint">Select which permits vendors must have to participate</p>
                  <div className="permit-type-checkboxes">
                    {data.permitTypes.slice(0, 20).map(pt => (
                      <label key={pt._id} className="checkbox-label">
                        <input type="checkbox" checked={newEvent.requiredPermits?.includes(pt._id)} onChange={(e) => {
                          if (e.target.checked) {
                            setNewEvent(ev => ({ ...ev, requiredPermits: [...(ev.requiredPermits || []), pt._id] }));
                          } else {
                            setNewEvent(ev => ({ ...ev, requiredPermits: (ev.requiredPermits || []).filter(id => id !== pt._id) }));
                          }
                        }} />
                        <span>{pt.name} <small>({pt.jurisdictionId?.city}, {pt.jurisdictionId?.state})</small></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <Button onClick={createEvent} disabled={!newEvent.eventName || !newEvent.startDate || !newEvent.city || !newEvent.state}>
                  <Icons.Plus /> Create Event
                </Button>
              </div>
            </Card>
            
            <div className="admin-section-header">
              <h3>🎪 Events ({data.events.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Required Permits</th><th>Assigned Vendors</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.events.map(ev => (
                    <tr key={ev._id}>
                      <td><strong>{ev.eventName}</strong>{ev.organizerName && <><br /><small>by {ev.organizerName}</small></>}</td>
                      <td>{formatDate(ev.startDate)}</td>
                      <td>{ev.location?.city}, {ev.location?.state}</td>
                      <td>{ev.requiredPermitTypes?.length || 0} permits</td>
                      <td>{ev.assignedVendors?.length || 0} vendors</td>
                      <td><Badge variant={ev.status === 'published' ? 'success' : ev.status === 'canceled' ? 'danger' : 'default'}>{ev.status}</Badge></td>
                      <td className="actions-cell">
                        <button className="action-btn edit" onClick={() => setManagingEvent(ev)} title="Manage Vendors"><Icons.Settings /></button>
                        <button className="delete-btn" onClick={() => deleteEvent(ev._id)} title="Delete"><Icons.Trash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div>
            <div className="admin-section-header">
              <h3>📬 User Suggestions & Requests</h3>
              <div className="filter-tabs">
                {['pending', 'in_progress', 'completed', 'rejected'].map(status => (
                  <button 
                    key={status} 
                    className={suggestionFilter === status ? 'active' : ''} 
                    onClick={() => { setSuggestionFilter(status); fetchData('suggestions'); }}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Type</th><th>Title</th><th>User</th><th>Business</th><th>Details</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {suggestions.length === 0 ? (
                    <tr><td colSpan="7" className="empty-row">No {suggestionFilter} suggestions</td></tr>
                  ) : suggestions.map(s => (
                    <tr key={s._id}>
                      <td><Badge variant={s.type === 'city_request' ? 'primary' : s.type === 'checklist_request' ? 'warning' : s.type === 'event_request' ? 'success' : 'default'}>{s.type.replace(/_/g, ' ')}</Badge></td>
                      <td><strong>{s.title}</strong>{s.description && <><br /><small>{s.description.substring(0, 80)}...</small></>}</td>
                      <td>{s.userId?.firstName} {s.userId?.lastName}<br /><small>{s.userId?.email}</small></td>
                      <td>{s.vendorBusinessId?.businessName || 'N/A'}</td>
                      <td>
                        {s.cityDetails && <small>City: {s.cityDetails.city}, {s.cityDetails.state}</small>}
                        {s.checklistDetails?.name && <small>Checklist: {s.checklistDetails.name}</small>}
                        {s.eventDetails && (
                          <div className="event-request-details">
                            <small><strong>{s.eventDetails.eventName}</strong></small><br />
                            <small>{s.eventDetails.city}, {s.eventDetails.state}</small><br />
                            {s.eventDetails.startDate && <small>Date: {formatDate(s.eventDetails.startDate)}</small>}
                            {s.eventDetails.organizerName && <><br /><small>Organizer: {s.eventDetails.organizerName}</small></>}
                            {s.eventDetails.website && <><br /><small><a href={s.eventDetails.website} target="_blank" rel="noopener noreferrer">Website</a></small></>}
                          </div>
                        )}
                      </td>
                      <td>{formatDate(s.createdAt)}</td>
                      <td className="actions-cell">
                        {suggestionFilter === 'pending' && (
                          <>
                            {s.type === 'event_request' && s.eventDetails && (
                              <button className="action-btn primary" onClick={() => convertEventRequestToEvent(s)} title="Convert to Event"><Icons.Plus /></button>
                            )}
                            <button className="action-btn edit" onClick={() => updateSuggestion(s._id, 'in_progress')} title="Mark In Progress"><Icons.Clock /></button>
                            <button className="action-btn success" onClick={() => updateSuggestion(s._id, 'completed')} title="Mark Completed"><Icons.Check /></button>
                          </>
                        )}
                        {suggestionFilter === 'in_progress' && (
                          <>
                            {s.type === 'event_request' && s.eventDetails && (
                              <button className="action-btn primary" onClick={() => convertEventRequestToEvent(s)} title="Convert to Event"><Icons.Plus /></button>
                            )}
                            <button className="action-btn success" onClick={() => updateSuggestion(s._id, 'completed')} title="Mark Completed"><Icons.Check /></button>
                          </>
                        )}
                        <button className="delete-btn" onClick={() => deleteSuggestion(s._id)} title="Delete"><Icons.Trash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Duplicate Modal */}
      <Modal isOpen={!!duplicateTarget} onClose={() => { setDuplicateTarget(null); setDuplicateJurisdiction(''); }} title="Duplicate Permit Type">
        <p>Create a copy of this permit type. Optionally select a different jurisdiction.</p>
        <Select label="Target Jurisdiction (optional)" value={duplicateJurisdiction} onChange={(e) => setDuplicateJurisdiction(e.target.value)} options={[{ value: '', label: 'Same jurisdiction' }, ...data.jurisdictions.map(j => ({ value: j._id, label: `${j.name} (${j.city}, ${j.state})` }))]} />
        <div className="modal-actions">
          <Button variant="outline" onClick={() => { setDuplicateTarget(null); setDuplicateJurisdiction(''); }}>Cancel</Button>
          <Button onClick={duplicatePermitType}>Duplicate</Button>
        </div>
      </Modal>
      
      {/* Edit Permit Type Modal */}
      <Modal isOpen={!!editingPermitType} onClose={() => setEditingPermitType(null)} title="Edit Permit Type" size="lg">
        {editingPermitType && (
          <div className="admin-form-enhanced">
            <div className="form-section">
              <div className="form-section-title">Basic Information</div>
              <Input label="Permit Name *" value={editingPermitType.name} onChange={(e) => setEditingPermitType(p => ({ ...p, name: e.target.value }))} />
              <Input label="Description" value={editingPermitType.description || ''} onChange={(e) => setEditingPermitType(p => ({ ...p, description: e.target.value }))} />
              <Select label="Jurisdiction *" value={editingPermitType.jurisdictionId?._id || editingPermitType.jurisdictionId} onChange={(e) => setEditingPermitType(p => ({ ...p, jurisdictionId: e.target.value }))} options={[{ value: '', label: 'Select Jurisdiction' }, ...data.jurisdictions.map(j => ({ value: j._id, label: `${j.city}, ${j.state}` }))]} />
            </div>
            <div className="form-section">
              <div className="form-section-title">Classification</div>
              <div className="form-row">
                <Select label="Importance Level" value={editingPermitType.importanceLevel} onChange={(e) => setEditingPermitType(p => ({ ...p, importanceLevel: e.target.value }))} options={[
                  { value: 'critical', label: '🔴 Critical' },
                  { value: 'often_forgotten', label: '🟡 Often Forgotten' },
                  { value: 'event_required', label: '🔵 Event Required' }
                ]} />
                <Input label="Renewal Period (months)" type="number" value={editingPermitType.renewalPeriodMonths} onChange={(e) => setEditingPermitType(p => ({ ...p, renewalPeriodMonths: parseInt(e.target.value) || 12 }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Vendor Types</label>
                <div className="vendor-type-checkboxes">
                  {VENDOR_TYPES.map(vt => (
                    <label key={vt.value} className="vendor-checkbox">
                      <input 
                        type="checkbox" 
                        checked={editingPermitType.vendorTypes?.includes(vt.value)} 
                        onChange={(e) => {
                          const types = editingPermitType.vendorTypes || [];
                          if (e.target.checked) {
                            setEditingPermitType(p => ({ ...p, vendorTypes: [...types, vt.value] }));
                          } else {
                            setEditingPermitType(p => ({ ...p, vendorTypes: types.filter(t => t !== vt.value) }));
                          }
                        }}
                      />
                      <span>{vt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title">Authority & Cost</div>
              <div className="form-row">
                <Input label="Issuing Authority" value={editingPermitType.issuingAuthorityName || ''} onChange={(e) => setEditingPermitType(p => ({ ...p, issuingAuthorityName: e.target.value }))} />
                <Input label="Estimated Cost" placeholder="$50-100" value={editingPermitType.estimatedCost || ''} onChange={(e) => setEditingPermitType(p => ({ ...p, estimatedCost: e.target.value }))} />
              </div>
              <div className="form-row">
                <Input label="Application Fee" type="number" value={editingPermitType.fees?.application || 0} onChange={(e) => setEditingPermitType(p => ({ ...p, fees: { ...p.fees, application: parseFloat(e.target.value) || 0 } }))} />
                <Input label="Renewal Fee" type="number" value={editingPermitType.fees?.renewal || 0} onChange={(e) => setEditingPermitType(p => ({ ...p, fees: { ...p.fees, renewal: parseFloat(e.target.value) || 0 } }))} />
              </div>
              <Input label="Required Documents (comma-separated)" placeholder="Business license, Food handler cert" value={editingPermitType.requiredDocuments || ''} onChange={(e) => setEditingPermitType(p => ({ ...p, requiredDocuments: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setEditingPermitType(null)}>Cancel</Button>
              <Button onClick={updatePermitType}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Subscription Management Modal */}
      <Modal isOpen={!!managingSubscription} onClose={() => { setManagingSubscription(null); setSubscriptionAction(''); }} title={`Manage Subscription: ${managingSubscription?.businessName}`} size="lg">
        {managingSubscription && (
          <div className="subscription-manager">
            <div className="sub-current-status">
              <h4>Current Status</h4>
              <div className="sub-info-grid">
                <div><span className="sub-label">Plan:</span> <Badge variant={getSubscriptionStatusColor(managingSubscription.subscription) === 'green' ? 'success' : 'primary'}>{managingSubscription.subscription?.plan?.toUpperCase() || 'TRIAL'}</Badge></div>
                <div><span className="sub-label">Status:</span> {managingSubscription.subscription?.status || 'trial'}</div>
                <div><span className="sub-label">Expires:</span> {managingSubscription.subscription?.status === 'lifetime' ? 'Never' : formatDate(managingSubscription.subscription?.promoExpiresAt || managingSubscription.subscription?.trialEndsAt || managingSubscription.subscription?.currentPeriodEnd)}</div>
                {managingSubscription.subscription?.promoNote && <div><span className="sub-label">Note:</span> {managingSubscription.subscription.promoNote}</div>}
              </div>
            </div>
            
            <div className="sub-actions">
              <h4>Actions</h4>
              <div className="sub-action-buttons">
                <Button variant={subscriptionAction === 'extend' ? 'primary' : 'outline'} onClick={() => setSubscriptionAction('extend')}>
                  <Icons.Clock /> Extend Trial
                </Button>
                <Button variant={subscriptionAction === 'grant' ? 'primary' : 'outline'} onClick={() => setSubscriptionAction('grant')}>
                  <Icons.Check /> Grant Promo/Lifetime
                </Button>
                <Button variant={subscriptionAction === 'revoke' ? 'danger' : 'outline'} onClick={() => setSubscriptionAction('revoke')}>
                  <Icons.X /> Revoke Access
                </Button>
              </div>
            </div>
            
            {subscriptionAction === 'extend' && (
              <div className="sub-action-form">
                <h4>🕐 Extend Trial Period</h4>
                <p className="form-hint">Add additional days to the user's trial period.</p>
                <Input label="Days to Add" type="number" min="1" max="365" value={subscriptionForm.days} onChange={(e) => setSubscriptionForm(f => ({ ...f, days: parseInt(e.target.value) || 30 }))} />
                <Input label="Note (optional)" placeholder="e.g., Customer service extension" value={subscriptionForm.note} onChange={(e) => setSubscriptionForm(f => ({ ...f, note: e.target.value }))} />
                <div className="modal-actions">
                  <Button variant="outline" onClick={() => setSubscriptionAction('')}>Cancel</Button>
                  <Button onClick={extendTrial}>Extend Trial by {subscriptionForm.days} Days</Button>
                </div>
              </div>
            )}
            
            {subscriptionAction === 'grant' && (
              <div className="sub-action-form">
                <h4>🎁 Grant Promotional Subscription</h4>
                <p className="form-hint">Give the user free access to paid features.</p>
                <Select label="Plan Type" value={subscriptionForm.plan} onChange={(e) => setSubscriptionForm(f => ({ ...f, plan: e.target.value }))} options={[
                  { value: 'promo', label: '🎉 Promo (Time-Limited Full Access)' },
                  { value: 'lifetime', label: '♾️ Lifetime (Permanent Full Access)' },
                  { value: 'pro', label: '⭐ Pro Plan Features' },
                  { value: 'elite', label: '👑 Elite Plan Features' }
                ]} />
                {subscriptionForm.plan === 'promo' && (
                  <Input label="Duration (days)" type="number" min="1" max="3650" value={subscriptionForm.durationDays} onChange={(e) => setSubscriptionForm(f => ({ ...f, durationDays: parseInt(e.target.value) || 90 }))} />
                )}
                <Input label="Note (required for audit)" placeholder="e.g., Beta tester reward, Influencer deal" value={subscriptionForm.note} onChange={(e) => setSubscriptionForm(f => ({ ...f, note: e.target.value }))} />
                <div className="modal-actions">
                  <Button variant="outline" onClick={() => setSubscriptionAction('')}>Cancel</Button>
                  <Button onClick={grantPromo} disabled={!subscriptionForm.note}>
                    Grant {subscriptionForm.plan === 'lifetime' ? 'Lifetime' : subscriptionForm.plan === 'promo' ? `${subscriptionForm.durationDays}-Day Promo` : subscriptionForm.plan.toUpperCase()} Access
                  </Button>
                </div>
              </div>
            )}
            
            {subscriptionAction === 'revoke' && (
              <div className="sub-action-form">
                <h4>⚠️ Revoke Subscription</h4>
                <p className="form-hint" style={{ color: 'var(--danger)' }}>This will remove the user's paid access and reset them to an expired trial. They will need to subscribe to regain access.</p>
                <Input label="Reason (required)" placeholder="e.g., Refund processed, Abuse detected" value={subscriptionForm.note} onChange={(e) => setSubscriptionForm(f => ({ ...f, note: e.target.value }))} />
                <div className="modal-actions">
                  <Button variant="outline" onClick={() => setSubscriptionAction('')}>Cancel</Button>
                  <Button variant="danger" onClick={revokeSubscription} disabled={!subscriptionForm.note}>Revoke Access</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Event Vendor Management Modal */}
      <Modal isOpen={!!managingEvent} onClose={() => { setManagingEvent(null); setVendorToAssign(''); }} title={`Manage Event: ${managingEvent?.eventName}`} size="lg">
        {managingEvent && (
          <div className="event-management">
            <div className="event-info-summary">
              <p><strong>Date:</strong> {formatDate(managingEvent.startDate)}</p>
              <p><strong>Location:</strong> {managingEvent.location?.city}, {managingEvent.location?.state}</p>
              <p><strong>Status:</strong> <Badge variant={managingEvent.status === 'published' ? 'success' : 'default'}>{managingEvent.status}</Badge></p>
            </div>
            
            <div className="event-required-permits">
              <h4>Required Permits ({managingEvent.requiredPermitTypes?.length || 0})</h4>
              {managingEvent.requiredPermitTypes?.length > 0 ? (
                <ul className="permit-list">
                  {managingEvent.requiredPermitTypes.map(pt => (
                    <li key={pt._id || pt}>{pt.name || pt}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No permits required</p>
              )}
            </div>
            
            <div className="event-assigned-vendors">
              <h4>Assigned Vendors ({managingEvent.assignedVendors?.length || 0})</h4>
              
              <div className="assign-vendor-form">
                <Select 
                  label="Add Vendor" 
                  value={vendorToAssign} 
                  onChange={(e) => setVendorToAssign(e.target.value)}
                  options={[
                    { value: '', label: 'Select a business...' },
                    ...data.businesses
                      .filter(b => !managingEvent.assignedVendors?.some(v => v.vendorBusinessId?._id === b._id || v.vendorBusinessId === b._id))
                      .map(b => ({ value: b._id, label: `${b.businessName} (${b.primaryVendorType})` }))
                  ]}
                />
                <Button onClick={assignVendorToEvent} disabled={!vendorToAssign}>
                  <Icons.Plus /> Assign
                </Button>
              </div>
              
              {managingEvent.assignedVendors?.length > 0 ? (
                <table className="admin-table">
                  <thead><tr><th>Business</th><th>Type</th><th>Assigned</th><th>Actions</th></tr></thead>
                  <tbody>
                    {managingEvent.assignedVendors.map(v => (
                      <tr key={v.vendorBusinessId?._id || v.vendorBusinessId}>
                        <td>{v.vendorBusinessId?.businessName || 'Unknown'}</td>
                        <td>{v.vendorBusinessId?.primaryVendorType || '-'}</td>
                        <td>{formatDate(v.assignedAt)}</td>
                        <td>
                          <button className="delete-btn" onClick={() => removeVendorFromEvent(v.vendorBusinessId?._id || v.vendorBusinessId)}>
                            <Icons.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">No vendors assigned yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===========================================
// LAYOUT
// ===========================================
const Sidebar = ({ activePage, onNavigate, onLogout }) => {
  const { business, subscription } = useAuth();
  const navItems = [{ id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard }, { id: 'permits', label: 'Permits', icon: Icons.Permit }, { id: 'documents', label: 'Documents', icon: Icons.Document }, { id: 'inspections', label: 'Inspections', icon: Icons.Checklist }, { id: 'events', label: 'Events', icon: Icons.Event }, { id: 'settings', label: 'Settings', icon: Icons.Settings }];
  return (<aside className="sidebar"><div className="sidebar-header"><div className="logo"><Icons.Shield /><span>PermitWise</span></div></div>{business && <div className="sidebar-business"><span>{business.businessName}</span><Badge>{subscription?.plan?.toUpperCase() || 'TRIAL'}</Badge></div>}<nav className="sidebar-nav">{navItems.map(item => <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}><item.icon /><span>{item.label}</span></button>)}</nav><div className="sidebar-footer"><button className="nav-item" onClick={onLogout}><Icons.Logout /><span>Logout</span></button></div></aside>);
};

const AppLayout = ({ children, activePage, onNavigate, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (<div className="app-layout"><Sidebar activePage={activePage} onNavigate={(p) => { onNavigate(p); setMobileMenuOpen(false); }} onLogout={onLogout} /><div className="mobile-header"><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Icons.Menu /></button><div className="logo"><Icons.Shield /><span>PermitWise</span></div></div>{mobileMenuOpen && <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}><Sidebar activePage={activePage} onNavigate={(p) => { onNavigate(p); setMobileMenuOpen(false); }} onLogout={onLogout} /></div>}<main className="main-content"><ExpiredSubscriptionBanner />{children}</main></div>);
};

// ===========================================
// MAIN APP
// ===========================================
const App = () => {
  const { isAuthenticated, hasCompletedOnboarding, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState(null);
  const [showPermitChecker, setShowPermitChecker] = useState(false);
  const [legalPage, setLegalPage] = useState(null); // 'privacy', 'terms', 'superadmin'
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => { 
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) { alert('Subscription activated!'); window.history.replaceState({}, '', window.location.pathname); }
    if (params.get('canceled')) { alert('Checkout canceled.'); window.history.replaceState({}, '', window.location.pathname); }
    // Check for password reset token
    if (params.get('token') && window.location.pathname.includes('reset-password')) {
      setResetToken(params.get('token'));
      return;
    }
    // Auto-detect login/register from URL params (from landing page links)
    if (params.get('register') === 'true') { setAuthView('register'); window.history.replaceState({}, '', window.location.pathname); }
    else if (params.get('login') === 'true' || window.location.pathname === '/app') { setAuthView('login'); }
    // Handle direct URL access to legal/superadmin pages
    const path = window.location.pathname;
    const pathLower = path.toLowerCase();
    if (path === '/privacy') setLegalPage('privacy');
    else if (path === '/terms') setLegalPage('terms');
    else if (pathLower === '/superadmin') setLegalPage('superadmin');
  }, []);

  // Password reset page (accessible without auth)
  if (resetToken) {
    return <ResetPasswordPage token={resetToken} onSuccess={() => { setResetToken(null); setAuthView('login'); window.history.replaceState({}, '', '/app'); alert('Password reset successful! Please log in.'); }} />;
  }

  // Legal pages are accessible without authentication
  if (legalPage === 'privacy') return <PrivacyPage onBack={() => { setLegalPage(null); window.history.pushState({}, '', '/app'); }} />;
  if (legalPage === 'terms') return <TermsPage onBack={() => { setLegalPage(null); window.history.pushState({}, '', '/app'); }} />;
  // Superadmin page - standalone with its own auth
  if (legalPage === 'superadmin') {
    return <SuperAdminPage onBack={() => { setLegalPage(null); window.history.pushState({}, '', '/'); }} />;
  }

  if (loading) return <div className="loading-screen"><LoadingSpinner /><p>Loading...</p></div>;
  if (!isAuthenticated) {
    if (showPermitChecker) return <PermitChecker onClose={() => setShowPermitChecker(false)} onGetStarted={(v) => { setShowPermitChecker(false); setAuthView(v); }} />;
    if (authView === 'login') return <LoginPage onSwitch={setAuthView} onSuccess={() => setAuthView(null)} />;
    if (authView === 'register') return <RegisterPage onSwitch={setAuthView} onSuccess={() => setAuthView(null)} />;
    if (authView === 'forgot') return <ForgotPasswordPage onSwitch={setAuthView} />;
    return <LoginPage onSwitch={setAuthView} onSuccess={() => setAuthView(null)} />;
  }
  if (!hasCompletedOnboarding) return <OnboardingPage onComplete={() => window.location.reload()} />;
  const renderPage = () => { switch (currentPage) { case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />; case 'permits': return <PermitsPage />; case 'documents': return <DocumentsPage />; case 'inspections': return <InspectionsPage />; case 'events': return <EventsPage />; case 'settings': return <SettingsPage />; default: return <Dashboard onNavigate={setCurrentPage} />; } };
  return <AppLayout activePage={currentPage} onNavigate={setCurrentPage} onLogout={logout}>{renderPage()}</AppLayout>;
};

const AppWithAuth = () => <AuthProvider><App /></AuthProvider>;
export default AppWithAuth;
