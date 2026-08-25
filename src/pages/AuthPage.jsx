import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, Phone, CheckCircle2, 
  ArrowLeft, ArrowRight, HeartPulse, Sparkles, AlertCircle,
  LogOut, Smartphone, Monitor
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

export const AuthPage = ({ onOnboardingComplete, onBack, viewMode, setViewMode }) => {
  const { 
    user, 
    completeOnboarding,
    familyContacts,
    login,
    logout
  } = useAuth();

  const { language, setLanguage } = useLanguage();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [currentViewMode, setCurrentViewMode] = useState(
    localStorage.getItem('resqone_view_mode') || 'mobile'
  );

  const [contactsList, setContactsList] = useState(familyContacts || [
    { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456' },
    { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457' },
    { id: 'fc-3', name: 'Sister / Brother', relation: 'Sibling', phone: '+91-9440123458' },
    { id: 'fc-4', name: 'Family Physician', relation: 'Doctor', phone: '+91-9440123459' },
  ]);

  const [message, setMessage] = useState(null);

  const handleToggleViewMode = (mode) => {
    setCurrentViewMode(mode);
    localStorage.setItem('resqone_view_mode', mode);
    if (setViewMode) setViewMode(mode);
    window.dispatchEvent(new Event('viewModeChanged'));
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    const userData = {
      id: `user-${Date.now()}`,
      name: name || `Citizen ${phone.slice(-4)}`,
      phone: phone.startsWith('+91') ? phone : `+91-${phone}`,
      bloodGroup: bloodGroup || 'O-',
      email: `${phone.replace(/\D/g, '')}@resqone.ai`,
      familyContacts: contactsList
    };

    if (completeOnboarding) completeOnboarding(userData);
    else if (login) login(userData.email, 'pass123');

    setMessage({ type: 'success', text: 'Welcome to RESQONE AI+ Emergency Network' });
    speakEmergencyInstruction('Welcome to RESQONE AI+. Systems connected.', language);
    if (onOnboardingComplete) onOnboardingComplete(userData);
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: 'Guest Citizen',
      phone: '+91-9000000000',
      bloodGroup: 'O-',
      email: 'guest@resqone.ai',
      familyContacts: contactsList
    };
    if (completeOnboarding) completeOnboarding(guestUser);
    setMessage({ type: 'success', text: 'Logged in as Guest' });
    if (onOnboardingComplete) onOnboardingComplete(guestUser);
  };

  // If already logged in, show Profile and Kin Management
  if (user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full pb-28 pt-3 px-4 max-w-md mx-auto space-y-4 font-sans"
      >
        <div className="p-5 rounded-3xl bg-[#080E1C]/90 border border-white/[0.08] shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/30">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{user.name || 'Citizen User'}</h3>
                <p className="text-xs text-slate-400 font-telemetry">{user.phone || '+91-9440123456'}</p>
              </div>
            </div>
            <span className="text-xs font-telemetry font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
              {user.bloodGroup || 'O-'}
            </span>
          </div>

          {/* View Mode Switcher in Profile */}
          <div className="p-3 rounded-2xl bg-[#040812] border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Device Layout View</span>
            <div className="flex bg-[#080E1C] p-0.5 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => handleToggleViewMode('mobile')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  currentViewMode === 'mobile'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => handleToggleViewMode('desktop')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  currentViewMode === 'desktop'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* 5 Registered Family SOS Kin */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Emergency Kin SOS Contacts</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {contactsList.length} SYNCED
              </span>
            </div>

            {contactsList.map((contact, idx) => (
              <div key={contact.id || idx} className="p-3 rounded-2xl bg-[#040812] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{contact.name}</div>
                  <div className="text-[10px] text-slate-400 font-telemetry">{contact.phone}</div>
                </div>
                <a href={`tel:${contact.phone}`} className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-white/[0.05] hover:bg-red-500/15 text-slate-300 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    );
  }

  // Exact Screen 5: Login / Welcome Screen with View Mode Option
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="w-full min-h-[85vh] flex flex-col justify-between pb-28 pt-2 px-4 max-w-md mx-auto font-sans"
    >
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* View Mode Toggle: Mobile / Desktop */}
        <div className="flex items-center bg-[#050A14] p-1 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => handleToggleViewMode('mobile')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentViewMode === 'mobile'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile View</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleViewMode('desktop')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentViewMode === 'desktop'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop View</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-center text-center space-y-4 my-auto">
        
        {/* Large Glowing 3D Shield with White Medical Cross */}
        <div className="relative w-22 h-22 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-[2px] shadow-[0_0_45px_rgba(255,34,68,0.5)]">
          <div className="w-full h-full rounded-[22px] bg-[#0A0D18] flex items-center justify-center">
            <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none">
              <path d="M24 4 L38 9 V22 C38 31 32 39 24 44 C16 39 10 31 10 22 V9 L24 4 Z" fill="url(#shieldGradAuth)" stroke="#FF4D6D" strokeWidth="1.5" />
              <path d="M24 16 V32 M16 24 H32" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_6px_#FFFFFF]" />
              <defs>
                <linearGradient id="shieldGradAuth" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF1E4B" />
                  <stop offset="1" stopColor="#8A001E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="absolute -inset-2 rounded-3xl border border-red-500/30 animate-pulse pointer-events-none" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1">
          <p className="text-slate-300 text-xs font-medium">Welcome to</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="font-black text-2xl tracking-tight text-white font-sans">
              RESQ<span className="text-red-500">ONE</span>
            </span>
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow font-sans">
              AI+
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">
            AI-Powered Emergency Intelligence
          </p>
        </div>

        {/* Language Selection Pills */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5 flex-wrap">
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'ta', label: 'தமிழ்' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code === 'ta' ? 'en' : lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                language === lang.code
                  ? 'bg-white/[0.12] text-white border-white/[0.3] shadow-sm'
                  : 'bg-[#050A14] text-slate-400 border-white/[0.06] hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`w-full text-xs font-bold p-3 rounded-xl border flex items-center space-x-2 ${
            message.type === 'error' ? 'bg-red-950/60 border-red-500/40 text-red-300' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Phone Input & Continue Button */}
        <form onSubmit={handlePhoneSubmit} className="w-full space-y-3 pt-1">
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full bg-[#050A14] border border-white/[0.1] focus:border-red-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_0_25px_rgba(255,34,68,0.4)] cursor-pointer active:scale-98"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Continue with Phone</span>
          </button>
        </form>

        {/* Continue as Guest */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer py-1"
          >
            Continue as Guest
          </button>
        </div>

      </div>

      {/* Footer Terms */}
      <div className="text-center pt-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-slate-400 underline cursor-pointer">Terms & Privacy Policy</span>
        </p>
      </div>

    </motion.div>
  );
};
