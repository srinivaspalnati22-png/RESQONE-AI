import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Bot, Droplet, Activity, Hospital, Radio, Zap, HeartPulse, CheckCircle2, ArrowRight, Award } from 'lucide-react';

export const LandingPage = ({ setActiveTab, onSimulateCrash }) => {
  return (
    <div className="w-full pb-28 pt-8 px-4 max-w-4xl mx-auto space-y-8">
      
      {/* Hero Section with Light Frosted Glass (backdrop-blur-xl) */}
      <section className="relative rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-red-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <div className="inline-flex items-center space-x-2 bg-red-950/80 text-red-300 border border-red-500/50 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
              <span>AI Emergency Intelligence Ecosystem</span>
            </div>
            
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>JUDGE DEMO READY</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            When Every Second Counts, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-red-500 bg-clip-text text-transparent">
              One AI Unifies Everything
            </span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed font-medium drop-shadow">
            Fragmented emergency apps waste critical minutes. RESQONE AI+ unifies Voice Copilot triage, AI blood compatibility matching, snakebite species identification, and hospital ICU/antivenom intelligence into one offline-first ecosystem.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => setActiveTab('copilot')}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-950/80 hover:shadow-red-900/90 transition-all flex items-center justify-center space-x-3 text-base border border-amber-300/60 cursor-pointer group min-h-[52px]"
            >
              <ShieldAlert className="w-6 h-6 fill-slate-950/20 stroke-[2.5]" />
              <span>REPORT EMERGENCY NOW</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto bg-slate-900/70 hover:bg-slate-800/90 text-slate-100 font-bold px-6 py-4 rounded-2xl border border-slate-700 backdrop-blur-md transition-colors text-sm flex items-center justify-center space-x-2 min-h-[52px]"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>View Mission Control</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 px-1 drop-shadow">
          Unified Emergency Intelligence Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Module 1: Flagship Copilot */}
          <div
            onClick={() => setActiveTab('copilot')}
            className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-red-500/40 hover:border-red-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600/25 border border-red-500/50 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <span className="bg-red-500/25 text-red-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-500/40">
                FLAGSHIP AI
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-red-400 transition-colors drop-shadow">
                AI Voice & Text Emergency Copilot
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Describe incident via voice or text. Real-time NLP classifies emergency severity (1-4), provides transparent reasoning, and auto-dispatches ambulance.
              </p>
            </div>
          </div>

          {/* Module 2: Blood Donor */}
          <div
            onClick={() => setActiveTab('blood')}
            className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-md">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="bg-amber-500/25 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/40">
                MEDICAL COMPATIBILITY
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors drop-shadow">
                Smart Blood Donor Matching
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                AI compatibility matrix (ABO/Rh rules) paired with GPS distance ranking to find nearest active blood donors during crisis.
              </p>
            </div>
          </div>

          {/* Module 3: Snakebite Emergency */}
          <div
            onClick={() => setActiveTab('snakebite')}
            className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <span className="bg-emerald-500/25 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                SPECIES & VENOM AI
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors drop-shadow">
                Snakebite Emergency AI
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Instant snake species identification (Cobra, Viper, Krait), venom toxicity risk analysis, and hospital antivenom (AVS) stock locator.
              </p>
            </div>
          </div>

          {/* Module 4: Hospital Intelligence */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/25 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-md">
                <Hospital className="w-6 h-6" />
              </div>
              <span className="bg-indigo-500/25 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                LIVE TELEMETRY
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-400 transition-colors drop-shadow">
                Hospital Resource Intelligence
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Real-time tracking of ICU bed availability, antivenom stock, and trauma center preparedness across regional hospital networks.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Telemetry Counter Bar */}
      <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-xl">
        <div>
          <div className="text-2xl font-black text-white font-mono">30+</div>
          <div className="text-[11px] text-slate-300 font-bold mt-0.5">AP Hospitals</div>
        </div>
        <div>
          <div className="text-2xl font-black text-red-400 font-mono">100%</div>
          <div className="text-[11px] text-slate-300 font-bold mt-0.5">Explainable AI</div>
        </div>
        <div>
          <div className="text-2xl font-black text-amber-400 font-mono">O-</div>
          <div className="text-[11px] text-slate-300 font-bold mt-0.5">Universal Donors</div>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-400 font-mono">&lt; 4m</div>
          <div className="text-[11px] text-slate-300 font-bold mt-0.5">Avg Dispatch ETA</div>
        </div>
      </section>

    </div>
  );
};
