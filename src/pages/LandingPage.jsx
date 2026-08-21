import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Bot, Droplet, Activity, Hospital, 
  Radio, Zap, HeartPulse, CheckCircle2, ArrowRight, Award, 
  Phone, Users, Clock, AlertTriangle, Sparkles, Gauge, Car, AlertOctagon,
  Shield, Flame, HelpCircle, ChevronRight, Stethoscope, Compass, BellRing
} from 'lucide-react';
import { PreventiveHealthHub } from '../components/PreventiveHealthHub';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage = ({ setActiveTab, onSimulateCrash }) => {
  const { t } = useLanguage();

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-5xl mx-auto space-y-8"
    >
      
      {/* 1. Daily Safety Tip Ticker Banner */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-lg overflow-hidden">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className={`text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full border shrink-0 ${dailyTips[currentTipIdx].color}`}>
            {dailyTips[currentTipIdx].badge}
          </span>
          <p className="text-xs text-slate-300 truncate font-medium">
            {dailyTips[currentTipIdx].text}
          </p>
        </div>

        <button 
          onClick={() => setCurrentTipIdx((prev) => (prev + 1) % dailyTips.length)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold shrink-0 cursor-pointer hidden sm:block"
        >
          Next Tip →
        </button>
      </div>

      {/* 2. Sleek Glassmorphism Hero Section (Clean, Modern, No Clunky Images) */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#050A14] to-[#0B1220] shadow-2xl p-6 sm:p-10 space-y-6">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Live Status Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-400 border border-red-500/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>24/7 Unified Emergency Intelligence</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Sensor Sensor Fusion Active</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Every Second Saves a Life. <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              Unified Emergency Platform.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            Instant AI voice triage, real-time hospital ICU bed allocation, antivenom vial tracking, 3D crash sensor fusion, and universal blood matching in one connected network.
          </p>
        </div>

        {/* Hero CTA Launchers */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setActiveTab('copilot')}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-red-950/80 transition-all flex items-center justify-center space-x-2.5 text-sm border border-amber-300/80 cursor-pointer group min-h-[48px]"
          >
            <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            <span>REPORT EMERGENCY NOW</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </button>

          <button
            onClick={() => setActiveTab('accident')}
            className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl border border-red-500/40 backdrop-blur-xl transition-all text-sm flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
            <span>3D Crash Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto bg-slate-950/80 hover:bg-slate-900 text-slate-200 font-bold px-6 py-3.5 rounded-2xl border border-slate-700 backdrop-blur-xl transition-all text-sm flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Live Mission Radar</span>
          </button>
        </div>
      </section>

      {/* 3. Key Telemetry Metrics Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Emergency Response', val: '< 4.2 Mins', icon: Clock, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'Verified Antivenom Hubs', val: '150+ Hospitals', icon: Hospital, color: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: 'Universal Blood Network', val: '100% ABO/Rh Match', icon: Droplet, color: 'text-amber-400', border: 'border-amber-500/30' },
          { label: 'Active Volunteer Mesh', val: '850+ Responders', icon: Users, color: 'text-purple-400', border: 'border-purple-500/30' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`bg-[#0B1220]/90 backdrop-blur-xl p-4 rounded-2xl border ${item.border} flex items-center space-x-3.5 shadow-lg`}>
              <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white">{item.val}</div>
                <div className="text-[11px] text-slate-400 font-medium truncate">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. Four Core Lifesaving Modules (Clean UI/UX Cards with Glow & Badges) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <span>Emergency Intelligence Modules</span>
          </h2>
          <span className="text-[10px] text-slate-400">Tap any module to launch live workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: 3D Crash Detection & Sensor Fusion */}
          <div
            onClick={() => setActiveTab('accident')}
            className="group bg-[#0B1220]/90 hover:bg-[#0E1729] rounded-3xl p-6 border border-red-500/30 hover:border-red-400 cursor-pointer transition-all hover:scale-[1.01] shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 text-red-400 flex items-center justify-center shadow-lg shadow-red-950">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-black text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/60 uppercase">
                3D SENSOR FUSION
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                <span>Automatic Accident Detection</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live analyzing Accelerometer G-Force, 3D Gyroscope tilt, and GPS Speed with a 25-second auto-dispatch window.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              <span className="text-emerald-400 font-bold">● Live Three.js Simulation</span>
              <span>• Zero False Alarms</span>
            </div>
          </div>

          {/* Card 2: AI Voice Emergency Copilot */}
          <div
            onClick={() => setActiveTab('copilot')}
            className="group bg-[#0B1220]/90 hover:bg-[#0E1729] rounded-3xl p-6 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60 uppercase">
                VOICE & NLP TRIAGE
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                <span>AI Emergency Copilot</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe incident via voice or text. Evaluates severity, reserves hospital ICU beds, and notifies responders.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              <span className="text-amber-400 font-bold">● Web Speech AI</span>
              <span>• Transparent Rationale</span>
            </div>
          </div>

          {/* Card 3: Universal Blood Donor Matcher */}
          <div
            onClick={() => setActiveTab('blood')}
            className="group bg-[#0B1220]/90 hover:bg-[#0E1729] rounded-3xl p-6 border border-red-500/30 hover:border-red-400 cursor-pointer transition-all hover:scale-[1.01] shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 text-red-400 flex items-center justify-center shadow-lg shadow-red-950">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-black text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/60 uppercase">
                ABO/RH COMPATIBILITY
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white group-hover:text-red-400 transition-colors flex items-center justify-between">
                <span>Emergency Blood Finder</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deterministic ABO/Rh compatibility matching real NHP blood banks, nearby donors, and cold-chain courier tracking.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              <span className="text-red-400 font-bold">● NHP Blood Banks</span>
              <span>• 4°C Cryo Courier</span>
            </div>
          </div>

          {/* Card 4: Snakebite Toxicology & AVS Locator */}
          <div
            onClick={() => setActiveTab('snakebite')}
            className="group bg-[#0B1220]/90 hover:bg-[#0E1729] rounded-3xl p-6 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-black text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60 uppercase">
                AVS ANTIVENOM TRACKING
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                <span>Snakebite & Antivenom Locator</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Big Four snake species identification, clinical symptom analysis, and instant Polyvalent AVS vial reservation.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              <span className="text-cyan-400 font-bold">● Big Four Registry</span>
              <span>• WHO First Aid</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Non-Emergency Safety, Health & First-Aid Readiness Hub */}
      <section className="space-y-3">
        <PreventiveHealthHub />
      </section>

      {/* 6. Instant 1-Tap 24/7 National Emergency Hotlines */}
      <section className="bg-[#0B1220]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300">
          <span className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Direct 1-Tap National Emergency Hotlines:</span>
          </span>
          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
            Toll-Free 24/7 Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Ambulance & Medical', num: '108', desc: 'National Health Helpline' },
            { name: 'Police Emergency', num: '112', desc: 'Unified Emergency' },
            { name: 'Disaster Helpline', num: '1070', desc: 'State Emergency Cell' },
            { name: 'Women Safety', num: '181', desc: 'Women & Child Support' }
          ].map((h, idx) => (
            <a
              key={idx}
              href={`tel:${h.num}`}
              className="p-3.5 bg-[#050A14] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/60 rounded-2xl transition-all flex items-center justify-between group cursor-pointer shadow-md"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-red-300">{h.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{h.desc}</div>
              </div>
              <span className="text-sm font-black font-mono text-red-400 bg-red-950/80 px-2.5 py-1 rounded-xl border border-red-800/40">
                {h.num}
              </span>
            </a>
          ))}
        </div>
      </section>

    </motion.div>
  );
};
