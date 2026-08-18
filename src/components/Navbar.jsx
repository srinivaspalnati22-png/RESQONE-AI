import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { useLanguage } from '../context/LanguageContext';
import { FlashBeacon } from './FlashBeacon';
import { VoiceControlWidget } from './VoiceControlWidget';
import { SOSModal } from './SOSModal';
import { EmergencyContactsModal } from './EmergencyContactsModal';
import { JudgeDemoModal } from './JudgeDemoModal';
import { Shield, Radio, Globe, ShieldAlert, Users, LogOut, Zap, AlertOctagon, User, Award } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onSimulateCrash }) => {
  const { user, logout } = useAuth();
  const { isDemoMode, toggleDemoMode, isOnline } = useDemo();
  const { language, setLanguage, t } = useLanguage();

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [isHoldingSOS, setIsHoldingSOS] = useState(false);
  const holdTimerRef = useRef(null);

  // Press-and-Hold SOS Trigger (2-3 seconds)
  const handleSOSMouseDown = () => {
    setIsHoldingSOS(true);
    holdTimerRef.current = setTimeout(() => {
      setIsHoldingSOS(false);
      setIsSOSOpen(true);
    }, 2000);
  };

  const handleSOSMouseUp = () => {
    setIsHoldingSOS(false);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-red-900/50 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 fill-white/10 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  RESQ<span className="text-red-500">ONE</span>
                </span>
                <span className="bg-gradient-to-r from-red-500 to-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                  AI+
                </span>
              </div>
              <p className="text-[10px] text-slate-300 -mt-0.5 tracking-wide font-semibold hidden sm:block">
                {t('app_tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'home' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('nav_home')}
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'copilot' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('nav_copilot')}
            </button>
            <button
              onClick={() => setActiveTab('blood')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'blood' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('nav_blood')}
            </button>
            <button
              onClick={() => setActiveTab('snakebite')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'snakebite' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('nav_snakebite')}
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t('nav_dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                activeTab === 'auth' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Profile
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">

            {/* Judge Demo Presentation Mode Button */}
            <button
              onClick={() => setIsJudgeDemoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-amber-300 text-xs font-black transition-all min-h-[44px] shadow-sm animate-pulse"
              title="Open Prototype Judge Presentation Suite"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Judge Demo Hub</span>
            </button>
            
            {/* Crash Detection Simulator Badge */}
            {onSimulateCrash && (
              <button
                onClick={onSimulateCrash}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/50 text-amber-300 text-xs font-bold transition-colors min-h-[44px]"
                title="Test Multi-Signal Crash Auto-Detection"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Crash</span>
              </button>
            )}

            {/* Authentication Action Button */}
            {user ? (
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5"
                title="Sign Out of ResQOne Account"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5 shadow-md shadow-red-950"
                title="Sign In / Register Profile"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}

            {/* Multi-Language Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 min-h-[44px]">
              <Globe className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">EN (English)</option>
                <option value="te" className="bg-slate-900 text-white">TE (తెలుగు)</option>
                <option value="hi" className="bg-slate-900 text-white">HI (हिंदी)</option>
              </select>
            </div>

            {/* Voice Control Widget */}
            <div className="hidden sm:block">
              <VoiceControlWidget setActiveTab={setActiveTab} onOpenSOS={() => setIsSOSOpen(true)} />
            </div>

            {/* Emergency Contacts Button */}
            <button
              onClick={() => setIsContactsOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={t('emergency_contacts_title')}
            >
              <Users className="w-4 h-4 text-red-400" />
            </button>

            {/* Press-and-Hold SOS Beacon Trigger */}
            <button
              onMouseDown={handleSOSMouseDown}
              onMouseUp={handleSOSMouseUp}
              onTouchStart={handleSOSMouseDown}
              onTouchEnd={handleSOSMouseUp}
              className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-lg min-h-[44px] ${
                isHoldingSOS
                  ? 'bg-red-700 text-white scale-105 animate-ping'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
              }`}
              title="Press and hold 2 seconds for SOS Emergency Alert"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden xs:inline">{isHoldingSOS ? 'HOLDING...' : t('nav_sos')}</span>
            </button>

          </div>
        </div>
      </header>

      {/* Judge Presentation Hub Modal */}
      <JudgeDemoModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        setActiveTab={setActiveTab}
        onSimulateCrash={onSimulateCrash}
      />

      {/* SOS Countdown & Alert Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

      {/* Emergency Contacts Management Modal */}
      <EmergencyContactsModal isOpen={isContactsOpen} onClose={() => setIsContactsOpen(false)} />
    </>
  );
};

