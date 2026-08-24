import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, Heart, Stethoscope, CheckCircle2, 
  Lock, Mail, Phone, Droplet, Users, UserPlus, 
  Sparkles, AlertCircle, Eye, EyeOff, LogIn, HeartPulse, Siren, ChevronRight, Zap
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

export const AuthPage = ({ onOnboardingComplete }) => {
  const { 
    user, 
    completeOnboarding,
    familyContacts,
    login,
    signup,
    loading,
    authError,
    setAuthError
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

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

  // 5 Family Members
  const [contactsList, setContactsList] = useState(familyContacts || [
    { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456' },
    { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457' },
    { id: 'fc-3', name: 'Brother / Sister', relation: 'Sibling', phone: '+91-9440123458' },
    { id: 'fc-4', name: 'Best Friend', relation: 'Friend', phone: '+91-9440123459' },
    { id: 'fc-5', name: 'Family Physician / Doctor', relation: 'Doctor', phone: '+91-9440123460' },
  ]);

  const [message, setMessage] = useState(null);

  const handleContactChange = (index, field, value) => {
    const updated = [...contactsList];
    updated[index] = { ...updated[index], [field]: value };
    setContactsList(updated);
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    if (langCode === 'te') {
      speakEmergencyInstruction("తెలుగు భాష ఎంచుకోబడింది. లాగిన్ పేజీ సిద్ధంగా ఉంది.", 'te');
    } else if (langCode === 'hi') {
      speakEmergencyInstruction("हिंदी भाषा चुनी गई है। लॉगिन पेज तैयार है।", 'hi');
    } else {
      speakEmergencyInstruction("English language selected. Login is ready.", 'en');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      setMessage(language === 'te' ? 'లాగిన్ విజయవంతమైంది!' : 'Login successful! Entering RESQONE...');
      setTimeout(() => {
        if (onOnboardingComplete) onOnboardingComplete();
      }, 400);
    }
  };

  // 1-Tap Quick Mobile Guest / Demo Login for emergency access
  const handleQuickMobileLogin = () => {
    const guestUser = {
      id: `victim-${Date.now().toString().slice(-4)}`,
      name: 'Srinivas Palnati',
      email: 'srinivas@resqone.ai',
      phone: '+91-9876543210',
      blood_group: 'O-',
      role: 'user',
      medical_notes: 'No known allergies'
    };
    completeOnboarding(guestUser, contactsList);
    setMessage('Quick access granted! Entering emergency platform...');
    setTimeout(() => {
      if (onOnboardingComplete) onOnboardingComplete();
    }, 300);
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    setRegisterStep(2);
  };

  const handleRegisterComplete = async (e) => {
    e.preventDefault();
    setAuthError(null);
    
    const result = await signup(regEmail, regPassword, name, 'user', bloodGroup, phone, medicalNotes);
    
    if (result.success) {
      const profileData = {
        id: result.user?.id || `local-${Date.now()}`,
        name,
        email: regEmail,
        phone,
        blood_group: bloodGroup,
        role: 'user',
        medical_notes: medicalNotes
      };
      completeOnboarding(profileData, contactsList);
      setMessage(language === 'te' ? 'రిజిస్ట్రేషన్ విజయవంతమైంది!' : 'Account registered successfully!');
      setTimeout(() => {
        if (onOnboardingComplete) onOnboardingComplete();
      }, 400);
    }
  };

  return (
    <div className="w-full min-h-[92vh] flex items-center justify-center px-3 sm:px-4 py-6 max-w-md mx-auto">
      <div className="w-full space-y-5">

        {/* Mobile Header & Logo */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 border-2 border-red-400/40 text-white mx-auto flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.4)]"
          >
            <HeartPulse className="w-8 h-8 sm:w-10 sm:h-10" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            RESQ<span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">ONE</span> AI
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
            {language === 'te' ? 'అత్యవసర వైద్య రెస్క్యూ వేదిక' : 'Unified Emergency Intelligence Platform'}
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
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center min-h-[38px] ${
                language === item.code 
                  ? 'bg-cyan-600 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Prominent Mode Switcher: Sign In vs Register */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B1220]/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setAuthError(null); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'te' ? 'సైన్ ఇన్ (లాగిన్)' : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setRegisterStep(1); setAuthError(null); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'te' ? 'రిజిస్టర్ (కొత్త యూజర్)' : 'Register (New User)'}</span>
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
              className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="text-center border-b border-slate-800 pb-3">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {language === 'te' ? 'యూజర్ లాగిన్' : language === 'hi' ? 'यूजर लॉगिन' : 'User Sign In'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'te' ? 'మీ అత్యవసర ఖాతాలోకి ప్రవేశించండి' : 'Access your live emergency profile'}
                </p>
              </div>

              {/* Quick 1-Tap Guest Access Button */}
              <button
                type="button"
                onClick={handleQuickMobileLogin}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 text-slate-950 font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 min-h-[46px]"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{language === 'te' ? '1-ట్యాప్ తక్షణ ప్రవేశం (డెమో)' : '1-Tap Quick Demo Access'}</span>
              </button>

              <div className="flex items-center space-x-2 my-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">or email login</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Email */}
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'te' ? 'ఈమెయిల్' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="user@resqone.ai"
                    className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all min-h-[44px]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all pr-10 min-h-[44px]"
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
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-cyan-950/60 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 min-h-[48px] disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Signing In...' : (language === 'te' ? 'లాగిన్ చేయండి' : 'Sign In')}</span>
                </button>
              </form>

              {/* Switch to Register Link */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setRegisterStep(1); setAuthError(null); }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center justify-center space-x-1 mx-auto cursor-pointer p-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'కొత్త ఖాతాను సృష్టించండి (రిజిస్టర్)' : 'New User? Create Account'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ============== REGISTER FORM (CLEARLY ACCESSIBLE) ============== */
            <motion.div
              key="register-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0B1220]/95 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-red-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {language === 'te' ? 'కొత్త యూజర్ రిజిస్ట్రేషన్' : 'Create Emergency Account'}
                  </h2>
                  <p className="text-[10px] text-slate-400">Step {registerStep} of 2</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>

              {registerStep === 1 ? (
                <form onSubmit={handleRegisterStep1} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Srinivas Palnati"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+91-98765..."
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold block mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-[#050A14] border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-red-400 font-bold min-h-[44px]"
                      >
                        {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer min-h-[48px] mt-2 shadow-lg shadow-red-950"
                  >
                    <span>Next: Setup 5 Family SOS Contacts</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterComplete} className="space-y-3">
                  <div className="text-xs text-slate-300 mb-1">
                    Enter phone numbers of 5 emergency contacts who receive automatic SOS SMS:
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                      className="px-4 py-3 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-950"
                    >
                      <span>Complete Registration</span>
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
