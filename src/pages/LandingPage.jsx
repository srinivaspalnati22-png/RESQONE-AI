import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Bot, Droplet, Activity, Hospital, 
  Radio, Zap, HeartPulse, CheckCircle2, ArrowRight, Award, 
  Phone, Users, Clock, AlertTriangle, Sparkles, Gauge, Car, AlertOctagon,
  Shield, Flame, HelpCircle, ChevronRight, Stethoscope, Compass, BellRing,
  User, MapPin, Siren, Eye, Volume2, RadioTower, RefreshCw, Filter, ListFilter
} from 'lucide-react';
import { PreventiveHealthHub } from '../components/PreventiveHealthHub';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { startVoiceRecognition, processVoiceIntent } from '../services/voice_service';

// Animated counter hook
function useAnimatedCounter(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) {
      setStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    if (startOnView && ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [startOnView, started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return { count, ref };
}

// Initial Mock Regional Live Emergency Logs
const INITIAL_LOGS = [
  {
    id: 'log-1',
    category: 'CRASH',
    tag: '3D RESCUE',
    color: 'border-red-500/40 bg-red-950/40 text-red-400',
    title: 'ALS-108 Ambulance En Route to NH-16 Gollapudi',
    desc: '4.85G crash impact verified. Paramedics dispatched (ETA 3.2 Mins). Trauma bay reserved at GGH Vijayawada.',
    time: 'Just Now',
    active: true
  },
  {
    id: 'log-2',
    category: 'BLOOD',
    tag: 'CRYO COURIER',
    color: 'border-amber-500/40 bg-amber-950/40 text-amber-400',
    title: '2 Units O- Negative Dispatched to Trauma Center',
    desc: 'ABO/Rh compatibility 100% matched from Rotary Blood Bank. 4°C cold-chain transport active.',
    time: '2m ago',
    active: true
  },
  {
    id: 'log-3',
    category: 'SNAKE',
    tag: 'AVS ALLOCATED',
    color: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400',
    title: 'Polyvalent Antivenom Reserved at Ramesh Hospital',
    desc: 'Spectacled Cobra envenomation protocol initialized. 10 AVS vials prepared for immediate infusion.',
    time: '6m ago',
    active: false
  },
  {
    id: 'log-4',
    category: 'MESH',
    tag: 'SENSOR FUSION',
    color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400',
    title: '5 Family SOS Contacts Notified via Direct SMS Intent',
    desc: 'Telemetry broadcasted live GPS coordinates (16.5412° N, 80.5843° E) with zero network latency.',
    time: '11m ago',
    active: false
  },
  {
    id: 'log-5',
    category: 'ICU',
    tag: 'RADAR ACTIVE',
    color: 'border-purple-500/40 bg-purple-950/40 text-purple-400',
    title: 'GGH Vijayawada Trauma ICU Telemetry Synced',
    desc: '12 ICU beds available, 150 AVS vials verified in stock, 3 trauma surgeons on standby.',
    time: '18m ago',
    active: false
  }
];

export const LandingPage = ({ setActiveTab, navigateWithQuery, onSimulateCrash }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const [assistantInput, setAssistantInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState(null);

  // Live Logs Feed State
  const [liveLogs, setLiveLogs] = useState(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'CRASH' | 'BLOOD' | 'SNAKE' | 'ICU'

  // Animated counters
  const responseTime = useAnimatedCounter(42, 1800);
  const hospitals = useAnimatedCounter(150, 2000);
  const bloodMatch = useAnimatedCounter(100, 1600);
  const responders = useAnimatedCounter(850, 2200);

  const handleEmergencyQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const lower = queryText.toLowerCase();

    // 1. Blood queries -> Navigate directly to Blood page with output
    if (lower.includes('blood') || lower.includes('రక్తం') || lower.includes('खून') || lower.includes('donor') || lower.includes('o-') || lower.includes('a+') || lower.includes('b+') || lower.includes('ab') || lower.includes('దాత')) {
      let group = 'O-';
      if (lower.includes('a+')) group = 'A+';
      else if (lower.includes('a-')) group = 'A-';
      else if (lower.includes('b+')) group = 'B+';
      else if (lower.includes('b-')) group = 'B-';
      else if (lower.includes('ab+')) group = 'AB+';
      else if (lower.includes('ab-')) group = 'AB-';
      else if (lower.includes('o+')) group = 'O+';
      else if (lower.includes('o-')) group = 'O-';

      if (navigateWithQuery) {
        navigateWithQuery('blood', { query: queryText, group, autoSearch: true });
      } else {
        setActiveTab('blood');
      }
      return;
    }

    // 2. Snakebite queries -> Navigate directly to Snakebite page with assessment output
    if (lower.includes('snake') || lower.includes('పాము') || lower.includes('सांप') || lower.includes('bite') || lower.includes('cobra') || lower.includes('viper') || lower.includes('krait') || lower.includes('antivenom') || lower.includes('avs') || lower.includes('కాటు')) {
      if (navigateWithQuery) {
        navigateWithQuery('snakebite', { query: queryText, autoAssess: true });
      } else {
        setActiveTab('snakebite');
      }
      return;
    }

    // 3. Crash / Accident queries -> Navigate directly to 3D Crash page with auto simulation
    if (lower.includes('crash') || lower.includes('accident') || lower.includes('ప్రమాదం') || lower.includes('दुर्घटना') || lower.includes('car') || lower.includes('bike') || lower.includes('vehicle') || lower.includes('hit') || lower.includes('g-force')) {
      if (navigateWithQuery) {
        navigateWithQuery('accident', { autoTrigger: true, query: queryText });
      } else {
        setActiveTab('accident');
      }
      return;
    }

    // 4. Hospital / ICU / Mission Control queries -> Navigate directly to Dashboard
    if (lower.includes('icu') || lower.includes('hospital') || lower.includes('ఆసుపత్రి') || lower.includes('अस्पताल') || lower.includes('bed') || lower.includes('ventilator') || lower.includes('emergency')) {
      if (navigateWithQuery) {
        navigateWithQuery('dashboard', { query: queryText });
      } else {
        setActiveTab('dashboard');
      }
      return;
    }

    // Fallback to voice intent
    const result = await processVoiceIntent(queryText, language, {
      setActiveTab,
      setLanguage,
      onOpenSOS: onSimulateCrash
    });
    if (result?.toast) {
      setVoiceToast(result.toast);
      setTimeout(() => setVoiceToast(null), 4000);
    }
  };

  const handleVoiceListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceToast(null);

    startVoiceRecognition(
      language,
      async (spokenText) => {
        setAssistantInput(spokenText);
        setIsListening(false);
        await handleEmergencyQuery(spokenText);
      },
      (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Daily Safety & Preparedness Tips Auto-Ticker
  const dailyTips = [
    {
      badge: 'ROAD SAFETY TIP',
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      text: 'Highway Braking Law: At 100 km/h, stopping distance exceeds 78 meters. Maintain at least a 3-second gap behind heavy vehicles.'
    },
    {
      badge: 'CPR LIFE-SAVER',
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      text: 'Cardiac Arrest Response: Immediate hands-only CPR at 110 BPM doubles victim survival rate before ambulance arrival.'
    },
    {
      badge: 'BLOOD DONATION FACT',
      color: 'text-red-400 border-red-500/40 bg-red-500/10',
      text: 'O-Negative Blood is the universal red blood cell donor in high-trauma emergencies when cross-matching time is zero.'
    },
    {
      badge: 'SNAKEBITE FIRST AID',
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      text: 'WHO Protocol: Never apply tourniquets or cut snakebites. Immobilize the limb like a fracture and reach an AVS hospital immediately.'
    }
  ];

  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIdx((prev) => (prev + 1) % dailyTips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dailyTips.length]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning') || 'Good Morning';
    if (hour < 17) return t('good_afternoon') || 'Good Afternoon';
    return t('good_evening') || 'Good Evening';
  };

  const filteredLogs = logFilter === 'ALL' 
    ? liveLogs 
    : liveLogs.filter(item => item.category === logFilter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-2 px-3 sm:px-4 max-w-md sm:max-w-2xl lg:max-w-5xl mx-auto space-y-6"
    >
      
      {/* 0. Personalized Welcome Banner */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-gradient-to-r from-[#0B1220]/95 via-[#0E1729]/95 to-[#0B1220]/95 backdrop-blur-xl px-4 py-3.5 rounded-3xl border border-cyan-500/30 flex items-center justify-between gap-3 shadow-xl"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-400/40 text-white flex items-center justify-center shadow-lg shadow-cyan-950/60 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs sm:text-sm font-black text-white truncate">
                {getGreeting()}, {user.name?.split(' ')[0] || 'User'} 👋
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {language === 'te' ? 'అత్యవసర ప్రొఫైల్ సిద్ధంగా ఉంది' : language === 'hi' ? 'आपातकालीन प्रोफाइल सक्रिय है' : 'Emergency profile active & protected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-black px-2.5 py-1 rounded-xl flex items-center space-x-1">
              <Droplet className="w-3 h-3" />
              <span>{user.blood_group || 'O-'}</span>
            </span>
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-1 rounded-xl hidden xs:flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>ACTIVE</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* 1. Daily Safety Tip Ticker Banner */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 shadow-lg overflow-hidden">
        <div className="flex items-center space-x-2 min-w-0">
          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border shrink-0 ${dailyTips[currentTipIdx].color}`}>
            {dailyTips[currentTipIdx].badge}
          </span>
          <p className="text-[11px] text-slate-300 truncate font-medium">
            {dailyTips[currentTipIdx].text}
          </p>
        </div>

        <button 
          onClick={() => setCurrentTipIdx((prev) => (prev + 1) % dailyTips.length)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold shrink-0 cursor-pointer p-1"
        >
          Next →
        </button>
      </div>

      {/* 2. Flagship Hero Section with High-Impact Visual Overlay */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#050A14] to-[#0B1220] shadow-2xl p-5 sm:p-8 space-y-5">
        
        {/* Background Visual Banner with gradient mask */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <img 
            src="/images/lifesaving_rescue_hero.jpg" 
            alt="Emergency Rescue" 
            className="w-full h-full object-cover object-center scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050A14] via-[#050A14]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-transparent" />
        </div>

        {/* Top Live Status Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-red-600/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>24/7 Live Emergency Intelligence</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-bold font-mono">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Multi-Sensor Fusion</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {t('hero_title') || 'Every Second Saves a Life.'} <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              {t('hero_subtitle') || 'Unified Emergency Platform.'}
            </span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
            {t('hero_desc') || 'Instant AI voice triage, real-time hospital ICU bed allocation, antivenom tracking, 3D crash detection, and universal blood donor matching.'}
          </p>
        </div>

        {/* 3. AI Multilingual Voice & Text Emergency Command Center */}
        <div className="relative z-10 bg-[#050A14]/95 backdrop-blur-2xl p-4 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>{language === 'te' ? 'AI అత్యవసర వాయిస్ సహాయకుడు' : language === 'hi' ? 'एआई वॉयस सहायक' : 'AI Multilingual Voice Assistant'}</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {language === 'te' ? 'మాట్లాడండి లేదా టైప్ చేయండి' : 'SPEAK OR TYPE'}
            </span>
          </div>

          {/* Spoken voice feedback toast */}
          {voiceToast && (
            <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span className="truncate">{voiceToast}</span>
            </div>
          )}

          {/* Input Bar with Mic & Send */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEmergencyQuery(assistantInput);
                }}
                placeholder={t('voice_placeholder') || "Speak or type emergency..."}
                className="w-full bg-[#0B1220] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none pr-9 transition-all min-h-[44px]"
              />

              {assistantInput && (
                <button
                  onClick={() => setAssistantInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Voice Assistant Microphone Button */}
            <button
              onClick={handleVoiceListen}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer min-w-[44px] min-h-[44px] ${
                isListening 
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse' 
                  : 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-600/30'
              }`}
              title="Voice Input"
            >
              <Radio className={`w-4 h-4 ${isListening ? 'animate-spin' : ''}`} />
            </button>

            {/* Direct Send Action Button */}
            <button
              onClick={() => handleEmergencyQuery(assistantInput)}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer shrink-0 min-h-[44px]"
            >
              <span>{t('submit_btn') || 'Submit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Keyword Direct Action Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: t('need_blood') || '🩸 Need Blood', val: 'Need blood donor' },
              { label: t('snake_bite') || '🐍 Snake Bite', val: 'Snake bite antivenom' },
              { label: t('car_accident') || '🚨 Car Accident', val: 'Vehicle crash accident' },
              { label: t('nearest_icu') || '🏥 Nearest ICU', val: 'Nearest ICU hospital' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAssistantInput(chip.val);
                  handleEmergencyQuery(chip.val);
                }}
                className="text-[10px] font-bold bg-[#0B1220] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer min-h-[32px]"
              >
                {chip.label}
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* 3. REAL-TIME REGIONAL EMERGENCY LOGS & TELEMETRY STREAM */}
      <section className="bg-[#0B1220]/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3.5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <RadioTower className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center space-x-2">
                <span>{language === 'te' ? 'ప్రత్యక్ష అత్యవసర కార్యకలాపాల లాగ్' : 'Live Regional Emergency Activity Logs'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-400">Live multi-agency telemetry feed from NH-16 corridor & regional hospitals</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRASH', 'BLOOD', 'SNAKE', 'ICU'].map((cat) => (
              <button
                key={cat}
                onClick={() => setLogFilter(cat)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                  logFilter === cat 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-[#050A14] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List Container */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-2xl border ${log.color} flex items-start justify-between gap-3 shadow-md`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-current bg-slate-950/60">
                    {log.tag}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {log.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  {log.desc}
                </p>
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                {log.time}
              </span>
            </motion.div>
          ))}
        </div>

      </section>

      {/* 4. Key Telemetry Metrics Bar - Animated Counters */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" ref={responseTime.ref}>
        {[
          { label: 'Avg Emergency Response', val: `< ${(responseTime.count / 10).toFixed(1)} Mins`, icon: Clock, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'Antivenom Hubs Active', val: `${hospitals.count}+ Hospitals`, icon: Hospital, color: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: 'Universal Blood Network', val: `${bloodMatch.count}% ABO Match`, icon: Droplet, color: 'text-amber-400', border: 'border-amber-500/30' },
          { label: 'Responders Connected', val: `${responders.count}+ Mesh`, icon: Users, color: 'text-purple-400', border: 'border-purple-500/30' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.05, duration: 0.3 }}
              className={`bg-[#0B1220]/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border ${item.border} flex items-center space-x-2.5 shadow-lg`}
            >
              <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-800 ${item.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-white truncate">{item.val}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* 5. Four Core Lifesaving Modules as Big Mobile-Friendly Action Buttons */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <span>{t('emergency_modules') || 'Emergency Modules'}</span>
          </h2>
          <span className="text-[10px] text-slate-400">Tap to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Button 1: 3D Crash Detection */}
          <button
            onClick={() => setActiveTab('accident')}
            className="w-full text-left bg-[#0B1220]/95 hover:bg-[#0E1729] rounded-3xl p-4 sm:p-5 border border-red-500/30 hover:border-red-400 cursor-pointer transition-all shadow-xl space-y-3 relative overflow-hidden group active:scale-98"
          >
            <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-800">
              <img 
                src="/images/crash_rescue_extraction.jpg" 
                alt="3D Crash Detection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />
              <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-black text-red-300 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-700/60 uppercase backdrop-blur-md">
                3D SENSOR FUSION
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                <span>{language === 'te' ? 'వాహన ప్రమాద గుర్తింపు' : 'Automatic 3D Accident Detection'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'te' ? 'యాక్సిలరోమీటర్ G-ఫోర్స్, 3D గైరోస్కోప్ మరియు GPS స్పీడ్ సెన్సార్ల లైవ్ సిమ్యులేషన్.' : 'Live analyzing Accelerometer G-Force, 3D Gyroscope tilt, and GPS Speed with a 25-second auto-dispatch window.'}
              </p>
            </div>
          </button>

          {/* Button 2: Hospital Mission Control & ICU Radar */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full text-left bg-[#0B1220]/95 hover:bg-[#0E1729] rounded-3xl p-4 sm:p-5 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all shadow-xl space-y-3 relative overflow-hidden group active:scale-98"
          >
            <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-800">
              <img 
                src="/images/aum.jpg" 
                alt="Hospital Mission Control" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />
              <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-black text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/60 uppercase backdrop-blur-md">
                HOSPITAL ICU RADAR
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>{language === 'te' ? 'ఆసుపత్రి మిషన్ కంట్రోల్ & ICU బెడ్లు' : 'Hospital Mission Control & ICU Beds'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'te' ? 'సమీప ఆసుపత్రులలో ICU బెడ్లు, వెంటిలేటర్లు మరియు వైద్యుల ప్రత్యక్ష సమాచారం.' : 'Real-time telemetry tracking of nearest regional trauma centers, ICU bed occupancy, and ambulance dispatch readiness.'}
              </p>
            </div>
          </button>

          {/* Button 3: Universal Blood Donor Matcher */}
          <button
            onClick={() => setActiveTab('blood')}
            className="w-full text-left bg-[#0B1220]/95 hover:bg-[#0E1729] rounded-3xl p-4 sm:p-5 border border-red-500/30 hover:border-red-400 cursor-pointer transition-all shadow-xl space-y-3 relative overflow-hidden group active:scale-98"
          >
            <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-800">
              <img 
                src="/images/blood_donation_hero.jpg" 
                alt="Blood Donor Matcher" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />
              <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-black text-red-300 bg-red-950/80 px-2.5 py-1 rounded-full border border-red-700/60 uppercase backdrop-blur-md">
                ABO/RH COMPATIBILITY
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                <span>{language === 'te' ? 'స్మార్ట్ రక్త దాతల నెట్‌వర్క్' : 'Emergency Blood Finder'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'te' ? 'ABO/Rh సరిపోలిక ఆధారంగా సమీప రక్త బ్యాంకులు మరియు దాతలను తక్షణమే కనుగొంటుంది.' : 'Deterministic ABO/Rh compatibility matching real NHP blood banks, nearby donors, and cold-chain courier tracking.'}
              </p>
            </div>
          </button>

          {/* Button 4: Snakebite Toxicology & AVS Locator */}
          <button
            onClick={() => setActiveTab('snakebite')}
            className="w-full text-left bg-[#0B1220]/95 hover:bg-[#0E1729] rounded-3xl p-4 sm:p-5 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all shadow-xl space-y-3 relative overflow-hidden group active:scale-98"
          >
            <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-800">
              <img 
                src="/images/snakebite_antivenom_lab.jpg" 
                alt="Snakebite Antivenom Hub" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent" />
              <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-700/60 uppercase backdrop-blur-md">
                AVS ANTIVENOM TRACKING
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm sm:text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                <span>{language === 'te' ? 'పాము కాటు & యాంటీవెనమ్ నిల్వలు' : 'Snakebite & Antivenom Locator'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'te' ? 'పాము జాతి గుర్తింపు, ప్రథమ చికిత్స మరియు పాలీవాలెంట్ AVS ఇంజెక్షన్ల సమాచారం.' : 'Big Four snake species identification, clinical symptom analysis, and instant Polyvalent AVS vial reservation.'}
              </p>
            </div>
          </button>

        </div>
      </section>

      {/* 6. Non-Emergency Safety, Health & First-Aid Readiness Hub */}
      <section className="space-y-3">
        <PreventiveHealthHub />
      </section>

      {/* 7. Instant 1-Tap 24/7 National Emergency Hotlines (Big Mobile Touch Tiles) */}
      <section className="bg-[#0B1220]/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{t('hotlines_title') || 'National Emergency Hotlines:'}</span>
          </span>
          <span className="text-emerald-400 font-mono text-[9px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            24/7 Free
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { name: language === 'te' ? 'ఆంబులెన్స్' : 'Ambulance', num: '108', desc: 'Medical 24/7' },
            { name: language === 'te' ? 'పోలీస్' : 'Police', num: '112', desc: 'Unified SOS' },
            { name: language === 'te' ? 'విపత్తు' : 'Disaster', num: '1070', desc: 'State Cell' },
            { name: language === 'te' ? 'మహిళా హెల్ప్' : 'Women Help', num: '181', desc: 'Protection' }
          ].map((h, idx) => (
            <a
              key={idx}
              href={`tel:${h.num}`}
              className="p-3 bg-[#050A14] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/60 rounded-2xl transition-all flex items-center justify-between group cursor-pointer shadow-md active:scale-95 min-h-[50px]"
            >
              <div className="min-w-0 pr-1">
                <div className="text-xs font-bold text-white group-hover:text-red-300 truncate">{h.name}</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">{h.desc}</div>
              </div>
              <span className="text-xs font-black font-mono text-red-400 bg-red-950/80 px-2 py-1 rounded-xl border border-red-800/40 shrink-0">
                {h.num}
              </span>
            </a>
          ))}
        </div>
      </section>

    </motion.div>
  );
};
