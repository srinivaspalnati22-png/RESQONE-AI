import React, { useState } from 'react';
import { Menu, Bell, Globe, ChevronDown, CheckCircle2, Car, Droplet, Activity, X, ArrowRight, Smartphone, Monitor, ShieldAlert, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useViewMode } from '../context/ViewModeContext';
import { useDemo } from '../context/DemoContext';
import { speakEmergencyInstruction } from '../services/audio_service';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'te', label: 'తె', name: 'Telugu (తెలుగు)' },
  { code: 'hi', label: 'हि', name: 'Hindi (हिन्दी)' },
  { code: 'ta', label: 'த', name: 'Tamil (தமிழ்)' },
  { code: 'kn', label: 'ಕ', name: 'Kannada (ಕನ್ನಡ)' },
];

export const Navbar = ({ setActiveTab }) => {
  const { language, setLanguage } = useLanguage();
  const { viewMode, setViewMode } = useViewMode();
  const { emergencyNotifications, setEmergencyNotifications } = useDemo();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const defaultNotifications = [
    {
      id: 'n1',
      title: 'ALS-108 Ambulance Dispatched',
      desc: '4.85G impact detected on NH-16 near Gollapudi. Trauma Bay #2 reserved.',
      time: '2m ago',
      type: 'accident',
      icon: Car,
      color: 'text-red-400',
      badge: 'CRASH ALERT',
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30'
    },
    {
      id: 'n2',
      title: 'Urgent Blood Match Required',
      desc: '2 units of O-Negative blood needed at GGH Vijayawada Trauma ICU.',
      time: '5m ago',
      type: 'blood',
      icon: Droplet,
      color: 'text-rose-400',
      badge: 'O- BLOOD',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    },
    {
      id: 'n3',
      title: 'Snakebite Protocol Activated',
      desc: '10 vials Polyvalent AVS reserved at Ramesh Emergency Hospital.',
      time: '8m ago',
      type: 'snakebite',
      icon: Activity,
      color: 'text-emerald-400',
      badge: 'AVS READY',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    }
  ];

  const dynamicNotifs = (emergencyNotifications || []).map(n => ({
    id: n.id,
    title: n.title,
    desc: n.message,
    time: n.timestamp,
    type: 'dashboard',
    icon: ShieldAlert,
    color: 'text-red-500',
    badge: 'SOS BROADCAST',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    familyNotified: n.familyNotified
  }));

  const allNotifications = [...dynamicNotifs, ...defaultNotifications];

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleNotificationClick = (notif) => {
    setNotifOpen(false);
    speakEmergencyInstruction(`Opening ${notif.title}`, language);
    if (setActiveTab) setActiveTab(notif.type || 'dashboard');
  };

  const handleClearAll = () => {
    if (setEmergencyNotifications) setEmergencyNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#04070D]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-3 shadow-2xl">
      <div className="max-w-md sm:max-w-2xl lg:max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left: Hamburger Menu */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('home')}
          className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Exact RESQONE AI+ Logo */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          aria-label="RESQONE AI Home"
        >
          <img 
            src="/resqone_logo.jpg" 
            alt="RESQONE AI+ Logo" 
            className="w-8 h-8 rounded-xl object-cover shadow-lg border border-red-500/40 group-hover:scale-105 transition-transform" 
          />
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-xl tracking-tight text-white font-sans">
              RESQ<span className="text-red-500">ONE</span>
            </span>
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-md shadow-amber-500/20 font-sans tracking-wide">
              AI+
            </span>
          </div>
        </button>

        {/* Right: Notifications, View Mode, & Language */}
        <div className="flex items-center space-x-2 relative">
          
          {/* Quick View Mode Toggle (Mobile / Desktop) */}
          <div className="hidden sm:flex items-center bg-white/[0.05] p-0.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                const newMode = viewMode === 'mobile' ? 'desktop' : 'mobile';
                setViewMode(newMode);
                window.dispatchEvent(new Event('viewModeChanged'));
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={`Switch to ${viewMode === 'mobile' ? 'Desktop' : 'Mobile'} View`}
            >
              {viewMode === 'mobile' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px]">Mobile</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px]">Desktop</span>
                </>
              )}
            </button>
          </div>

          {/* Notification Bell with red badge */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Active Notifications"
          >
            <Bell className="w-5 h-5" />
            {allNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                {allNotifications.length}
              </span>
            )}
          </button>

          {/* Minimal Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center space-x-1 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px]"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#0A111F] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 min-w-[130px] p-1 backdrop-blur-xl">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                      language === lang.code
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="font-telemetry font-bold w-4">{lang.label}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── NOTIFICATION DRAWER / POPOVER ── */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl bg-[#080E1C]/98 border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 backdrop-blur-2xl p-4 space-y-3">
              
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black text-white">Emergency Alerts & Family Broadcasts</span>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30">
                    {allNotifications.length} LIVE
                  </span>
                </div>
                {allNotifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {allNotifications.length === 0 ? (
                <div className="text-center py-6 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-xs font-bold text-white">All Clear</p>
                  <p className="text-[10px] text-slate-400">No active high-priority emergency incidents</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto thin-scrollbar pr-0.5">
                  {allNotifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="w-full p-3 rounded-2xl bg-[#050A14] hover:bg-[#0E1628] border border-white/[0.06] hover:border-white/[0.15] transition-all text-left flex items-start space-x-3 cursor-pointer group active:scale-98"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 ${notif.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${notif.badgeColor}`}>
                              {notif.badge}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">{notif.time}</span>
                          </div>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {notif.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {notif.desc}
                          </p>
                          {notif.familyNotified && notif.familyNotified.length > 0 && (
                            <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 pt-0.5">
                              <PhoneCall className="w-3 h-3" />
                              <span>2 Family Contacts SMS Sent</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-1 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    if (setActiveTab) setActiveTab('dashboard');
                  }}
                  className="w-full py-2 bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/50 hover:to-amber-600/50 border border-red-500/30 rounded-xl text-center text-xs font-bold text-white transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Open Missions CAD Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};
