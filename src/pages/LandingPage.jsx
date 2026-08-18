import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Bot, Droplet, Activity, Hospital, 
  Radio, Zap, HeartPulse, CheckCircle2, ArrowRight, Award, 
  Phone, Users, Clock, AlertTriangle, Sparkles
} from 'lucide-react';

export const LandingPage = ({ setActiveTab, onSimulateCrash }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-5xl mx-auto space-y-8"
    >
      
      {/* 1. Cinematic Visual Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-red-500/40 shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-end">
        {/* Background Image with Dark Vignette & Gradient */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/lifesaving_rescue_hero.jpg" 
            alt="Emergency ALS Rescue Team" 
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#0B1220]/80 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#050A14]/50 to-[#050A14]/90" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 p-6 sm:p-10 w-full space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-red-600/90 text-white border border-red-400/50 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xl shadow-red-950">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>24/7 Lifesaving Emergency AI</span>
            </div>
            
            <div className="inline-flex items-center space-x-1.5 bg-slate-900/90 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Latency 3D Dispatch</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              Every Second Saves a Life. <br />
              <span className="bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                Unified Emergency Intelligence.
              </span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base max-w-xl font-medium drop-shadow">
              Instant AI voice triage, real-time hospital ICU allocation, antivenom tracking, and universal blood matching in one ecosystem.
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setActiveTab('copilot')}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl shadow-2xl shadow-red-950 transition-all flex items-center justify-center space-x-2.5 text-sm border border-amber-300/80 cursor-pointer group min-h-[48px]"
            >
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
              <span>REPORT EMERGENCY NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto bg-slate-950/80 hover:bg-slate-900 text-slate-100 font-bold px-6 py-3.5 rounded-2xl border border-slate-700 backdrop-blur-xl transition-colors text-sm flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
            >
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Live Mission Radar</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Telemetry Metrics Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Emergency Response', val: '< 4.2 Mins', icon: Clock, color: 'text-cyan-400' },
          { label: 'Verified Antivenom Hubs', val: '150+ Hospitals', icon: Hospital, color: 'text-emerald-400' },
          { label: 'Universal Blood Network', val: '100% ABO/Rh Match', icon: Droplet, color: 'text-amber-400' },
          { label: 'Active Volunteer Mesh', val: '850+ Responders', icon: Users, color: 'text-purple-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-[#0B1220]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 flex items-center space-x-3 shadow-lg">
              <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">{item.val}</div>
                <div className="text-[10px] text-slate-400 font-medium truncate">{item.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Visual-First Emergency Lifesaving Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4 text-red-500" />
            <span>Lifesaving Emergency Services</span>
          </h2>
          <span className="text-[10px] text-slate-400">Tap any module to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: AI Emergency Copilot */}
          <div
            onClick={() => setActiveTab('copilot')}
            className="group relative rounded-3xl overflow-hidden border border-red-500/30 hover:border-red-400 cursor-pointer transition-all hover:scale-[1.01] shadow-2xl h-64 sm:h-72 flex flex-col justify-end p-5"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/lifesaving_rescue_hero.jpg" 
                alt="AI Emergency Copilot" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/75 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-red-600/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  3D AI Commander
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                AI Voice Copilot & 3D Dispatch
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2">
                Speak or type incident details. Coordinates 5-orbit neural dispatch and 3D ALS rescue routing.
              </p>
            </div>
          </div>

          {/* Card 2: Blood Donation Lifesaver */}
          <div
            onClick={() => setActiveTab('blood')}
            className="group relative rounded-3xl overflow-hidden border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] shadow-2xl h-64 sm:h-72 flex flex-col justify-end p-5"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/blood_donation_hero.jpg" 
                alt="Blood Donation Hero" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/75 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/90 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  Universal Blood Matrix
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                Emergency Blood & Donor Match
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2">
                ABO/Rh compatibility engine matching verified National Health Portal blood banks and registered heroes.
              </p>
            </div>
          </div>

          {/* Card 3: Snakebite Toxicology */}
          <div
            onClick={() => setActiveTab('snakebite')}
            className="group relative rounded-3xl overflow-hidden border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] shadow-2xl h-64 sm:h-72 flex flex-col justify-end p-5"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/snakebite_antivenom_lab.jpg" 
                alt="Antivenom Toxicology Lab" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/75 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-cyan-500/90 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  AVS Antivenom Stock
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                Snakebite & Antivenom Locator
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2">
                Big Four India snake species identification, clinical symptom analysis, and direct AVS hospital routing.
              </p>
            </div>
          </div>

          {/* Card 4: Crash Extraction & Sensor */}
          <div
            onClick={onSimulateCrash}
            className="group relative rounded-3xl overflow-hidden border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.01] shadow-2xl h-64 sm:h-72 flex flex-col justify-end p-5"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/crash_rescue_extraction.jpg" 
                alt="Highway Crash Rescue" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/75 to-transparent" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-purple-500/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  Sensor Auto-Dispatch
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-white group-hover:bg-purple-600 transition-colors">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                Accident Crash Detection
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2">
                Simulate accelerometer G-force and gyroscope multi-sensor collision detection with 25s auto-alert.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Instant 24/7 National Emergency Hotline Dialers */}
      <section className="bg-[#0B1220]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direct 1-Tap National Emergency Hotlines:</span>
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">Toll-Free 24/7</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { name: 'Ambulance & Medical', num: '108', desc: 'National Health Helpline' },
            { name: 'Police Emergency', num: '112', desc: 'Unified Emergency' },
            { name: 'Disaster Helpline', num: '1070', desc: 'State Emergency Cell' },
            { name: 'Women Safety', num: '181', desc: 'Women & Child Support' }
          ].map((h, idx) => (
            <a
              key={idx}
              href={`tel:${h.num}`}
              className="p-3 bg-[#050A14] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/60 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-red-300">{h.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{h.desc}</div>
              </div>
              <span className="text-sm font-black font-mono text-red-400 bg-red-950/80 px-2 py-1 rounded-lg border border-red-800/40">
                {h.num}
              </span>
            </a>
          ))}
        </div>
      </section>

    </motion.div>
  );
};
