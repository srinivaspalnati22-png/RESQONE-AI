import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Bot, Droplet, Activity, Hospital, 
  Radio, Zap, HeartPulse, CheckCircle2, ArrowRight, Award, Flame
} from 'lucide-react';

export const LandingPage = ({ setActiveTab, onSimulateCrash }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-6 px-4 max-w-5xl mx-auto space-y-8"
    >
      
      {/* Hero Section with Dark Glassmorphism */}
      <section className="relative rounded-3xl bg-[#0B1220]/85 backdrop-blur-2xl border border-red-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <div className="inline-flex items-center space-x-2 bg-red-950/80 text-red-300 border border-red-500/40 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span>AI Emergency Intelligence Ecosystem</span>
            </div>
            
            <div className="inline-flex items-center space-x-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D COMMANDCORE INTEGRATED</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            When Every Second Counts, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              One AI Unifies Everything
            </span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
            Fragmented emergency apps waste critical minutes. RESQONE AI+ unifies Voice Copilot triage, 3D CommandCore neural dispatch, hard-rule blood compatibility matching, snakebite toxicology intelligence, and hospital ICU telemetry into one offline-first ecosystem.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
            <button
              onClick={() => setActiveTab('copilot')}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-950/80 transition-all flex items-center justify-center space-x-3 text-base border border-amber-300/60 cursor-pointer group min-h-[52px]"
            >
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              <span>REPORT EMERGENCY NOW</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto bg-[#050A14]/80 hover:bg-slate-900 text-slate-100 font-bold px-6 py-4 rounded-2xl border border-slate-700 backdrop-blur-md transition-colors text-sm flex items-center justify-center space-x-2 min-h-[52px] cursor-pointer"
            >
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>View Mission Control</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 px-1">
          Unified Emergency Intelligence Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Module 1: Flagship Copilot */}
          <div
            onClick={() => setActiveTab('copilot')}
            className="bg-[#0B1220]/80 backdrop-blur-xl p-5 rounded-3xl border border-red-500/30 hover:border-red-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-red-500/30">
                3D COMMANDER
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-red-400 transition-colors">
                AI Emergency Copilot & 3D Core
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Describe incident via voice or text. 3D CommandCore coordinates 5 resource orbits, calculates priority & ETA, and dispatches state-driven ALS rescue.
              </p>
            </div>
          </div>

          {/* Module 2: Blood Donor */}
          <div
            onClick={() => setActiveTab('blood')}
            className="bg-[#0B1220]/80 backdrop-blur-xl p-5 rounded-3xl border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-md">
                <Droplet className="w-6 h-6" />
              </div>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/30">
                HARD COMPATIBILITY
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors">
                Emergency Blood & Donor Matrix
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Submit urgent blood requirements. Evaluates hard-rule ABO/Rh medical compatibility against National Health Portal blood banks and donor ranks.
              </p>
            </div>
          </div>

          {/* Module 3: Snakebite Assistant */}
          <div
            onClick={() => setActiveTab('snakebite')}
            className="bg-[#0B1220]/80 backdrop-blur-xl p-5 rounded-3xl border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                AVS LOCATOR
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                Snakebite Toxicology & Antivenom Locator
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Structured clinical symptom input and Big Four India snake identification. Routes directly to the nearest hospital with verified Polyvalent AVS stock.
              </p>
            </div>
          </div>

          {/* Module 4: Crash Detection Sensor */}
          <div
            onClick={onSimulateCrash}
            className="bg-[#0B1220]/80 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.01] group space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-500/30">
                MULTI-SENSOR FUSION
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white group-hover:text-purple-400 transition-colors">
                Automated Accident Detection
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Corroborates accelerometer G-force spike, sudden GPS speed drop, and gyroscope orientation before triggering an automated 25-second rescue countdown.
              </p>
            </div>
          </div>

        </div>
      </section>

    </motion.div>
  );
};
