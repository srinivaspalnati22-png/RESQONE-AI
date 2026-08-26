import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, Heart, Stethoscope, CheckCircle2, 
  Lock, Mail, Phone, Droplet, Users, UserPlus, 
  Sparkles, AlertCircle, Eye, EyeOff, LogIn, HeartPulse, Siren, ChevronRight, Zap,
  LogOut, Camera, Upload, Edit3, Check, RefreshCw, Building2, Activity,
  Radio, Bed, ShieldAlert, Award, MapPin
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';
import { DataService } from '../services/data_service';

// Google Brand Multi-color SVG Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const DEFAULT_DEMO_CONTACTS = [
  { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456' },
  { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457' },
  { id: 'fc-3', name: 'Brother / Sister', relation: 'Sibling', phone: '+91-9440123458' },
  { id: 'fc-4', name: 'Best Friend', relation: 'Friend', phone: '+91-9440123459' },
  { id: 'fc-5', name: 'Family Physician / Doctor', relation: 'Doctor', phone: '+91-9440123460' },
];

const STAKEHOLDER_ROLES = [
  { id: 'user', icon: User, label: 'Citizen / Victim', badge: '👤 Citizen', color: 'cyan', desc: 'Emergency SOS & 5 Family Kin Alerts' },
  { id: 'donor', icon: Droplet, label: 'Blood Donor', badge: '🩸 Blood Donor', color: 'red', desc: 'Live Availability & ABO/Rh Matching' },
  { id: 'hospital', icon: Building2, label: 'Hospital ER / ICU', badge: '🏥 Hospital Admin', color: 'amber', desc: 'ICU Beds & Antivenom Stock Updates' },
  { id: 'volunteer', icon: ShieldAlert, label: 'First Responder', badge: '🛡️ Volunteer', color: 'emerald', desc: 'CPR, BLS & Snake Rescue Network' },
  { id: 'rescue', icon: Siren, label: '108 Rescue Team', badge: '🚑 108 ALS Unit', color: 'purple', desc: 'Telemetry Dispatch & Navigation' }
];

export const AuthPage = ({ onOnboardingComplete, onBack }) => {
  const { 
    user, 
    completeOnboarding,
    familyContacts,
    updateFamilyContacts,
    updateProfile,
    login,
    signup,
    logout,
    loginWithGoogle,
    loading,
    authError,
    setAuthError
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef(null);

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'donor' | 'hospital' | 'volunteer' | 'rescue'

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [registerStep, setRegisterStep] = useState(1);

  // Role-Specific Fields
  const [donorAvailability, setDonorAvailability] = useState(true);
  const [donorCity, setDonorCity] = useState('Vijayawada');
  const [hospitalName, setHospitalName] = useState('Apollo Emergency Trauma Center');
  const [hospitalCity, setHospitalCity] = useState('Governorpet, Vijayawada');
  const [hospitalIcuAvailable, setHospitalIcuAvailable] = useState(12);
  const [hospitalIcuCapacity, setHospitalIcuCapacity] = useState(24);
  const [hospitalAvsStock, setHospitalAvsStock] = useState(25);
  const [volunteerSkills, setVolunteerSkills] = useState(['CPR Certified', 'First Aid Medic']);
  const [volunteerActive, setVolunteerActive] = useState(true);
  const [volunteerCity, setVolunteerCity] = useState('Vijayawada Central');
  const [rescueUnitId, setRescueUnitId] = useState('108-ALS-AMB-04');

  // Google Setup Form State
  const [setupPhone, setSetupPhone] = useState(user?.phone || '+91-9876543210');
  const [setupBloodGroup, setSetupBloodGroup] = useState(user?.blood_group || 'O-');
  const [setupRole, setSetupRole] = useState(user?.role || 'user');

  // 5 Family Members state
  const [contactsList, setContactsList] = useState(familyContacts && familyContacts.length === 5 ? familyContacts : DEFAULT_DEMO_CONTACTS);

  const [message, setMessage] = useState(null);
  const [isEditingContacts, setIsEditingContacts] = useState(false);

  const handleContactChange = (index, field, value) => {
    const updated = [...contactsList];
    updated[index] = { ...updated[index], [field]: value };
    setContactsList(updated);
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    if (langCode === 'te') {
      speakEmergencyInstruction("తెలుగు భాష ఎంచుకోబడింది.", 'te');
    } else if (langCode === 'hi') {
      speakEmergencyInstruction("हिंदी भाषा चुनी गई है।", 'hi');
    } else if (langCode === 'ta') {
      speakEmergencyInstruction("தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது.", 'ta');
    } else if (langCode === 'kn') {
      speakEmergencyInstruction("ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ.", 'kn');
    } else {
      speakEmergencyInstruction("English language selected.", 'en');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (setAuthError) setAuthError(null);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      setMessage(language === 'te' ? 'లాగిన్ విజయవంతమైంది!' : language === 'hi' ? 'लॉगिन सफल रहा!' : 'Login successful! Entering RESQONE...');
      setTimeout(() => {
        if (onOnboardingComplete) onOnboardingComplete();
      }, 400);
    }
  };

  // Google OAuth Sign-In Handler
  const handleGoogleSignIn = async () => {
    if (setAuthError) setAuthError(null);
    setMessage(
      language === 'te' 
        ? 'Google ఖాతా ధృవీకరించబడుతోంది...' 
        : language === 'hi' 
        ? 'Google खाता सत्यापित किया जा रहा है...' 
        : 'Connecting with Google Secure OAuth...'
    );
    const res = await loginWithGoogle();
    if (res?.success) {
      setMessage(language === 'te' ? 'Google లాగిన్ విజయవంతమైంది!' : 'Google Login Successful! Welcome to RESQONE.');
      setTimeout(() => {
        if (onOnboardingComplete) onOnboardingComplete();
      }, 500);
    }
  };

  // 1-Tap Quick Mobile Guest / Demo Login for emergency access (Gives default numbers automatically)
  const handleQuickMobileLogin = () => {
    const guestUser = {
      id: `demo-${Date.now().toString().slice(-4)}`,
      name: 'Srinivas Palnati',
      email: 'srinivas@resqone.ai',
      phone: '+91-9876543210',
      blood_group: 'O-',
      role: selectedRole || 'user',
      medical_notes: 'No known allergies',
      avatar_url: '/images/lifesaving_rescue_hero.jpg',
      auth_provider: 'demo',
      hasSetupEmergencyContacts: true
    };
    completeOnboarding(guestUser, DEFAULT_DEMO_CONTACTS);

    // If Donor role in demo, also add to Supabase blood_donors
    if (selectedRole === 'donor') {
      DataService.registerBloodDonor({
        id: guestUser.id,
        name: guestUser.name,
        blood_group: 'O-',
        phone: guestUser.phone,
        availability: true,
        location_lat: 16.5167,
        location_lng: 80.6500
      });
    }

    setMessage(language === 'te' ? 'డెమో ప్రవేశం ప్రారంభమైంది!' : language === 'hi' ? 'त्वरित डेमो एक्सेस प्रदान किया गया!' : 'Demo Access Activated with Default 5 SOS Contacts!');
    setTimeout(() => {
      if (onOnboardingComplete) onOnboardingComplete();
    }, 300);
  };

  // Custom Avatar Image Upload Handler (Works for email, google, demo users)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      updateProfile({ avatar_url: base64Data });
      setMessage(language === 'te' ? 'ప్రొఫైల్ ఫోటో నవీకరించబడింది!' : language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपडेट किया गया!' : 'Profile photo updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Role-specific database persistence helper
  const persistRoleSpecificDetails = async (userId, userFullName, userPhone, userEmail, roleToUse) => {
    if (roleToUse === 'donor') {
      await DataService.registerBloodDonor({
        id: `dnr-${userId || Date.now()}`,
        profile_id: userId,
        name: userFullName,
        blood_group: bloodGroup || setupBloodGroup || 'O-',
        phone: userPhone,
        availability: donorAvailability,
        location_lat: 16.5167,
        location_lng: 80.6500,
        last_donation_date: 'Eligible Now'
      });
    } else if (roleToUse === 'hospital') {
      await DataService.registerHospital({
        id: `hosp-${userId || Date.now()}`,
        name: hospitalName || userFullName,
        address: hospitalCity,
        phone: userPhone,
        icu_available: hospitalIcuAvailable,
        icu_capacity: hospitalIcuCapacity,
        antivenom_stock: hospitalAvsStock,
        antivenom_available: hospitalAvsStock > 0,
        trauma_center: true,
        location_lat: 16.5167,
        location_lng: 80.6500
      });
    } else if (roleToUse === 'volunteer' || roleToUse === 'rescue') {
      await DataService.registerVolunteer({
        id: `vol-${userId || Date.now()}`,
        profile_id: userId,
        name: userFullName,
        phone: userPhone,
        skills: roleToUse === 'rescue' ? ['108 ALS Paramedic', 'Trauma Navigation'] : volunteerSkills,
        is_active: volunteerActive,
        trust_score: 99.0,
        location_lat: 16.5167,
        location_lng: 80.6500
      });
    }
  };

  // First-time Google user completes emergency details setup
  const handleCompleteGoogleSetup = async (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      phone: setupPhone,
      blood_group: setupBloodGroup,
      role: setupRole,
      hasSetupEmergencyContacts: true
    };
    
    // Save to role table in Supabase
    await persistRoleSpecificDetails(user.id, user.name, setupPhone, user.email, setupRole);
    
    completeOnboarding(updatedUser, contactsList);
    setMessage(language === 'te' ? 'అత్యవసర వివరాలు భద్రపరచబడ్డాయి!' : language === 'hi' ? 'आपातकालीन विवरण सुरक्षित कर लिए गए!' : 'Profile & Role Details Configured Successfully!');
    setTimeout(() => {
      if (onOnboardingComplete) onOnboardingComplete();
    }, 400);
  };

  // Auto-fill default contacts for Google user
  const handleUseDefaultContactsForGoogle = () => {
    setContactsList(DEFAULT_DEMO_CONTACTS);
    setMessage(language === 'te' ? 'డిఫాల్ట్ 5 కాంటాక్ట్‌లు నింపబడ్డాయి' : language === 'hi' ? 'डिफ़ॉल्ट 5 संपर्क भर दिए गए' : 'Default 5 SOS contacts loaded');
    setTimeout(() => setMessage(null), 2500);
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    setRegisterStep(2);
  };

  const handleRegisterComplete = async (e) => {
    e.preventDefault();
    if (setAuthError) setAuthError(null);
    
    const result = await signup(regEmail, regPassword, name, selectedRole, bloodGroup, phone, medicalNotes);
    
    if (result.success) {
      const profileData = {
        id: result.user?.id || `local-${Date.now()}`,
        name,
        email: regEmail,
        phone,
        blood_group: bloodGroup,
        role: selectedRole,
        medical_notes: medicalNotes,
        hasSetupEmergencyContacts: true
      };

      // Add to Supabase role table (blood_donors, hospitals, volunteers)
      await persistRoleSpecificDetails(profileData.id, name, phone, regEmail, selectedRole);

      completeOnboarding(profileData, contactsList);
      setMessage(language === 'te' ? 'రిజిస్ట్రేషన్ విజయవంతమైంది!' : language === 'hi' ? 'पंजीकरण सफल रहा!' : 'Account & Role registered successfully in Database!');
      setTimeout(() => {
        if (onOnboardingComplete) onOnboardingComplete();
      }, 400);
    }
  };

  // ================= SCENARIO 1: GOOGLE USER FIRST-TIME EMERGENCY SETUP =================
  if (user && !user.hasSetupEmergencyContacts) {
    return (
      <div className="w-full min-h-[88vh] flex items-center justify-center px-3 sm:px-4 py-6 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4"
        >
          {/* User Welcome Card */}
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shadow-emerald-950/60 shrink-0" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'G'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-black text-white truncate">{user.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <Check className="w-2.5 h-2.5" /> GOOGLE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Select Role on Google Setup */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-cyan-300 font-bold block">
              {language === 'te' ? 'మీ అత్యవసర పాత్రను ఎంచుకోండి:' : language === 'hi' ? 'अपनी भूमिका चुनें:' : 'Select Your Stakeholder Role:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {STAKEHOLDER_ROLES.map((r) => {
                const isSel = setupRole === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSetupRole(r.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSel 
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950' 
                        : 'bg-[#050A14] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-bold truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCompleteGoogleSetup} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'మీ ఫోన్ నంబర్' : language === 'hi' ? 'आपका फोन' : 'Your Phone'}</label>
                <input
                  type="tel"
                  value={setupPhone}
                  onChange={(e) => setSetupPhone(e.target.value)}
                  required
                  placeholder="+91-98765..."
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-10 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'రక్త గ్రూప్' : language === 'hi' ? 'रक्त समूह' : 'Blood Group'}</label>
                <select
                  value={setupBloodGroup}
                  onChange={(e) => setSetupBloodGroup(e.target.value)}
                  className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-red-400 font-bold min-h-10"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role-Specific Form Fields */}
            {setupRole === 'donor' && (
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-red-400" /> Blood Donor Availability
                  </span>
                  <button
                    type="button"
                    onClick={() => setDonorAvailability(!donorAvailability)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      donorAvailability 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {donorAvailability ? '🟢 Available Now' : '⚪ Unavailable'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="City / Area (e.g. Vijayawada)"
                  value={donorCity}
                  onChange={(e) => setDonorCity(e.target.value)}
                  className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            )}

            {setupRole === 'hospital' && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> Hospital ER Details
                </div>
                <input
                  type="text"
                  placeholder="Hospital Facility Name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="ICU Beds Available"
                    value={hospitalIcuAvailable}
                    onChange={(e) => setHospitalIcuAvailable(e.target.value)}
                    className="bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Antivenom Vials"
                    value={hospitalAvsStock}
                    onChange={(e) => setHospitalAvsStock(e.target.value)}
                    className="bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {setupRole === 'volunteer' && (
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> First Responder Skills
                </div>
                <div className="flex flex-wrap gap-1">
                  {['CPR Certified', 'First Aid Medic', 'Snake Catching', 'BLS Rescue'].map((sk) => {
                    const has = volunteerSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => {
                          setVolunteerSkills(has ? volunteerSkills.filter(s => s !== sk) : [...volunteerSkills, sk]);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer font-bold ${
                          has ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        {has ? '✓ ' : '+ '}{sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5 Family Contacts */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>5 SOS Emergency Contacts:</span>
                <button
                  type="button"
                  onClick={handleUseDefaultContactsForGoogle}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                >
                  Use Default Samples
                </button>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {contactsList.map((contact, index) => (
                  <div key={contact.id || index} className="bg-[#050A14] p-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
                    <span className="text-[10px] text-red-400 font-bold w-4 shrink-0">#{index + 1}</span>
                    <input
                      type="text"
                      placeholder="Name / Relation"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      required
                      className="flex-1 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      required
                      className="w-28 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-cyan-300 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-cyan-600 via-teal-500 to-emerald-500 hover:from-cyan-500 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-950 min-h-12 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'te' ? 'భద్రపరచి ప్లాట్‌ఫామ్‌లోకి ప్రవేశించండి' : language === 'hi' ? 'सहेजें और ऐप में प्रवेश करें' : 'Save Details & Enter Platform'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ================= SCENARIO 2: USER IS LOGGED IN (PROFILE VIEW WITH ROLE STATUS) =================
  if (user) {
    const userRoleConfig = STAKEHOLDER_ROLES.find(r => r.id === user.role) || STAKEHOLDER_ROLES[0];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-md mx-auto space-y-4 font-sans"
      >
        {/* Hidden File Input for Avatar Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        <div className="p-5 rounded-3xl bg-[#080E1C]/95 border border-white/8 shadow-2xl space-y-4">
          
          {/* Profile Header with Avatar & Change Photo Button */}
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-xl shadow-cyan-950/80" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-600/30">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md cursor-pointer border border-white/20 transition-all hover:scale-110"
                  title="Upload / Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <h3 className="text-base font-black text-white">{user.name || 'Citizen User'}</h3>
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    {userRoleConfig.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{user.phone || '+91-9440123456'}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-44">{user.email || 'user@resqone.ai'}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm">
                {user.blood_group || user.bloodGroup || 'O-'}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline flex items-center gap-0.5"
              >
                <Upload className="w-2.5 h-2.5" /> Photo
              </button>
            </div>
          </div>

          {/* ROLE SPECIFIC LIVE STATUS PANEL */}
          {user.role === 'donor' && (
            <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-red-400" /> Donor Live Availability Status
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const newAvail = !donorAvailability;
                    setDonorAvailability(newAvail);
                    await DataService.updateDonorAvailability(user.id, newAvail);
                    setMessage(newAvail ? 'Status: Available to Donate' : 'Status: Off-Duty');
                    setTimeout(() => setMessage(null), 2500);
                  }}
                  className={`text-xs font-bold px-3 py-1 rounded-xl border cursor-pointer transition-all ${
                    donorAvailability 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {donorAvailability ? '🟢 AVAILABLE TO DONATE' : '⚪ UNAVAILABLE'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Registered in live emergency blood network. Hospitals nearby can request urgent O-/compatible units.
              </p>
            </div>
          )}

          {user.role === 'hospital' && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-amber-400" /> Hospital Trauma ICU Hub</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-lg font-black text-cyan-400">{hospitalIcuAvailable} / {hospitalIcuCapacity}</div>
                  <div className="text-[10px] text-slate-400">ICU Beds Available</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-lg font-black text-emerald-400">{hospitalAvsStock} Vials</div>
                  <div className="text-[10px] text-slate-400">AVS Antivenom Stock</div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 border bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{message}</span>
            </motion.div>
          )}

          {/* 5 Registered Family SOS Kin */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span>{language === 'te' ? '5 అత్యవసర కుటుంబ కాంటాక్ట్‌లు' : language === 'hi' ? '5 आपातकालीन परिजन संपर्क' : '5 Emergency Kin SOS Contacts'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingContacts(!isEditingContacts)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingContacts ? 'Done' : 'Edit'}</span>
              </button>
            </div>

            {contactsList.map((contact, idx) => (
              <div key={contact.id || idx} className="p-2.5 rounded-2xl bg-[#040812] border border-white/6 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] text-red-400 font-bold w-4 shrink-0">#{idx + 1}</span>
                  {isEditingContacts ? (
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        className="flex-1 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                        className="w-28 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-white">{contact.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{contact.phone}</div>
                    </div>
                  )}
                </div>
                {!isEditingContacts && (
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors shrink-0"
                    title={`Call ${contact.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}

            {isEditingContacts && (
              <button
                type="button"
                onClick={() => {
                  updateFamilyContacts(contactsList);
                  setIsEditingContacts(false);
                  setMessage(language === 'te' ? 'కాంటాక్ట్‌లు భద్రపరచబడ్డాయి!' : language === 'hi' ? 'संपर्क सुरक्षित किए गए!' : 'Contacts updated successfully!');
                  setTimeout(() => setMessage(null), 2500);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all cursor-pointer"
              >
                Save Updated Contacts
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={logout}
              className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-red-500/15 text-slate-300 hover:text-red-400 border border-white/8 hover:border-red-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'te' ? 'లాగౌట్ / ఖాతా మార్చండి' : language === 'hi' ? 'साइन आउट / खाता बदलें' : 'Sign Out / Switch Account'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ================= SCENARIO 3: MAIN LOGIN & REGISTRATION SCREEN WITH ROLE PICKER =================
  return (
    <div className="w-full min-h-[88vh] flex items-center justify-center px-3 sm:px-4 py-6 max-w-md mx-auto">
      <div className="w-full space-y-4">

        {/* Mobile Header & Logo */}
        <div className="text-center space-y-1.5">
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-linear-to-br from-red-600 via-red-500 to-amber-500 border-2 border-red-400/40 text-white mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.4)]"
          >
            <HeartPulse className="w-8 h-8 sm:w-9 sm:h-9" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RESQ<span className="bg-linear-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">ONE</span> AI
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
            {language === 'te' ? 'అత్యవసర వైద్య రెస్క్యూ వేదిక' : language === 'hi' ? 'एकीकृत आपातकालीन इंटेलिजेंस प्लेटफॉर्म' : 'Unified Emergency Intelligence Platform'}
          </p>
        </div>

        {/* Mobile Language Selector */}
        <div className="flex items-center justify-center gap-1 bg-[#0B1220]/90 p-1.5 rounded-2xl border border-slate-800">
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'hi', label: 'हिन्दी' },
            { code: 'ta', label: 'தமிழ்' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleLanguageSelect(item.code)}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center min-h-8.5 ${
                language === item.code 
                  ? 'bg-cyan-600 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Stakeholder Role Selector Chips */}
        <div className="bg-[#0B1220]/90 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
          <label className="text-[10px] text-cyan-300 font-bold uppercase tracking-wide block">
            {language === 'te' ? 'మీ అత్యవసర పాత్రను ఎంచుకోండి:' : language === 'hi' ? 'अपनी भूमिका चुनें:' : 'Select Your Role:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {STAKEHOLDER_ROLES.map((r) => {
              const isSel = selectedRole === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSel 
                      ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md shadow-cyan-950/80 ring-1 ring-cyan-400/40' 
                      : 'bg-[#050A14] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold truncate">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prominent Mode Switcher: Sign In vs Register */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B1220]/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); if (setAuthError) setAuthError(null); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'login'
                ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'te' ? 'సైన్ ఇన్ (లాగిన్)' : language === 'hi' ? 'साइन इन' : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setRegisterStep(1); if (setAuthError) setAuthError(null); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'register'
                ? 'bg-linear-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'te' ? 'రిజిస్టర్ (కొత్త యూజర్)' : language === 'hi' ? 'पंजीकरण (नया खाता)' : 'Register (New User)'}</span>
          </button>
        </div>

        {/* Error / Success Notices */}
        {authError && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 border bg-red-950/80 border-red-500/60 text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{authError}</span>
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 border bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </motion.div>
        )}

        {/* ============== AUTH FORMS ============== */}
        <AnimatePresence mode="wait">
          {authMode === 'login' ? (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-3.5"
            >
              <div className="text-center border-b border-slate-800 pb-2.5">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {language === 'te' ? 'యూజర్ లాగిన్' : language === 'hi' ? 'यूजर लॉगिन' : 'User Sign In'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Role: <span className="text-cyan-400 font-bold">{STAKEHOLDER_ROLES.find(r => r.id === selectedRole)?.label}</span>
                </p>
              </div>

              {/* 1. Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer active:scale-98 min-h-11.5 border border-slate-200"
              >
                <GoogleIcon />
                <span>{language === 'te' ? 'Google తో కొనసాగించండి' : language === 'hi' ? 'Google के साथ जारी रखें' : 'Continue with Google'}</span>
              </button>

              {/* 2. Quick 1-Tap Guest Access Button (Automatic Default Numbers) */}
              <button
                type="button"
                onClick={handleQuickMobileLogin}
                className="w-full bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 min-h-11.5"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{language === 'te' ? '1-ట్యాప్ తక్షణ ప్రవేశం (డెమో)' : language === 'hi' ? '1-टैप त्वरित डेमो एक्सेस' : '1-Tap Quick Demo Access'}</span>
              </button>

              <div className="flex items-center space-x-2 my-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">{language === 'te' ? 'లేదా ఈమెయిల్‌తో లాగిన్' : language === 'hi' ? 'या ईमेल से लॉगिन' : 'or email login'}</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="text-[11px] text-slate-300 font-bold mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'te' ? 'ఈమెయిల్ చిరునామా' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="user@resqone.ai"
                    className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all min-h-11"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] text-slate-300 font-bold mb-1 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'te' ? 'పాస్‌వర్డ్' : language === 'hi' ? 'पासवर्ड' : 'Password'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all pr-10 min-h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-cyan-950/60 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 min-h-11.5 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Signing In...' : (language === 'te' ? 'లాగిన్ చేయండి' : language === 'hi' ? 'साइन इन करें' : 'Sign In')}</span>
                </button>
              </form>

              {/* Switch to Register Link */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setRegisterStep(1); if (setAuthError) setAuthError(null); }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center justify-center space-x-1 mx-auto cursor-pointer p-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'కొత్త ఖాతాను సృష్టించండి (రిజిస్టర్)' : language === 'hi' ? 'नया खाता बनाएं (पंजीकरण)' : 'New User? Create Account'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ============== REGISTER FORM (WITH ROLE-SPECIFIC DATABASE DATA) ============== */
            <motion.div
              key="register-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-red-500/30 shadow-2xl space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {language === 'te' ? 'కొత్త రిజిస్ట్రేషన్' : language === 'hi' ? 'नया खाता' : 'Create Account'}
                  </h2>
                  <p className="text-[10px] text-cyan-400 font-bold">Role: {STAKEHOLDER_ROLES.find(r => r.id === selectedRole)?.label} • Step {registerStep} of 2</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  {language === 'te' ? '← లాగిన్‌కు వెళ్లండి' : language === 'hi' ? '← लॉगिन पर वापस' : '← Back to Login'}
                </button>
              </div>

              {/* Continue with Google on Register */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer active:scale-98 min-h-11 border border-slate-200"
              >
                <GoogleIcon />
                <span>{language === 'te' ? 'Google తో రిజిస్టర్ చేయండి' : language === 'hi' ? 'Google के साथ पंजीकरण करें' : 'Sign Up with Google'}</span>
              </button>

              <div className="flex items-center space-x-2 my-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">{language === 'te' ? 'లేదా వివరాలు నమోదు చేయండి' : language === 'hi' ? 'या विवरण भरें' : 'or enter details'}</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {registerStep === 1 ? (
                <form onSubmit={handleRegisterStep1} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'పూర్తి పేరు' : language === 'hi' ? 'पूरा नाम' : 'Full Name'}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Srinivas Palnati"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-10.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'ఈమెయిల్' : language === 'hi' ? 'ईमेल' : 'Email'}</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-10.5"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'పాస్‌వర్డ్' : language === 'hi' ? 'पासवर्ड' : 'Password'}</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-10.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'ఫోన్ నంబర్' : language === 'hi' ? 'फोन नंबर' : 'Phone'}</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+91-98765..."
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-10.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">{language === 'te' ? 'రక్త గ్రూప్' : language === 'hi' ? 'रक्त समूह' : 'Blood Group'}</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-red-400 font-bold min-h-10.5"
                      >
                        {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Role Specific Prompts */}
                  {selectedRole === 'donor' && (
                    <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-300">🩸 Donor Availability:</span>
                        <button
                          type="button"
                          onClick={() => setDonorAvailability(!donorAvailability)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                            donorAvailability ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {donorAvailability ? '🟢 Available Now' : '⚪ Unavailable'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Location / City (e.g. Vijayawada)"
                        value={donorCity}
                        onChange={(e) => setDonorCity(e.target.value)}
                        className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  )}

                  {selectedRole === 'hospital' && (
                    <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                      <div className="text-xs font-bold text-amber-300">🏥 Hospital Resource Stocks:</div>
                      <input
                        type="text"
                        placeholder="Hospital Name (e.g. Apollo Trauma Center)"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Available ICU Beds"
                          value={hospitalIcuAvailable}
                          onChange={(e) => setHospitalIcuAvailable(e.target.value)}
                          className="bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="number"
                          placeholder="Antivenom Stock (Vials)"
                          value={hospitalAvsStock}
                          onChange={(e) => setHospitalAvsStock(e.target.value)}
                          className="bg-[#050A14] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'volunteer' && (
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                      <div className="text-xs font-bold text-emerald-300">🛡️ Volunteer Emergency Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {['CPR Certified', 'First Aid Medic', 'Snake Catching', 'BLS Rescue'].map((sk) => {
                          const has = volunteerSkills.includes(sk);
                          return (
                            <button
                              key={sk}
                              type="button"
                              onClick={() => {
                                setVolunteerSkills(has ? volunteerSkills.filter(s => s !== sk) : [...volunteerSkills, sk]);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer font-bold ${
                                has ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                            >
                              {has ? '✓ ' : '+ '}{sk}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer min-h-11 mt-2 shadow-lg shadow-red-950"
                  >
                    <span>{language === 'te' ? 'తరువాత: 5 కుటుంబ కాంటాక్ట్‌లను నమోదు చేయండి' : language === 'hi' ? 'आगे: 5 आपातकालीन संपर्क सेट करें' : 'Next: Setup 5 Family SOS Contacts'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterComplete} className="space-y-3">
                  <div className="text-xs text-slate-300 mb-1">
                    {language === 'te' ? 'స్వయంచాలక SOS SMS అందుకునే 5 కుటుంబ సభ్యుల ఫోన్ నంబర్లు:' : language === 'hi' ? 'स्वचालित SOS संदेश प्राप्त करने वाले 5 परिजनों के नंबर:' : 'Enter phone numbers of 5 emergency contacts who receive automatic SOS SMS:'}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {contactsList.map((contact, index) => (
                      <div key={contact.id || index} className="bg-[#050A14] p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                        <span className="text-[10px] text-red-400 font-bold w-4 shrink-0">#{index + 1}</span>
                        <input
                          type="text"
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          required
                          className="flex-1 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-white"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          required
                          className="w-28 bg-[#0B1220] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-cyan-300 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="px-4 py-2.5 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ← {language === 'te' ? 'వెనుకకు' : language === 'hi' ? 'वापस' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950"
                    >
                      <span>{language === 'te' ? 'రిజిస్ట్రేషన్ పూర్తి చేయండి' : language === 'hi' ? 'पंजीकरण पूरा करें' : 'Complete Registration'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
