import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, ShieldAlert, Activity, Navigation, 
  Hospital, Users, Zap, Gauge, MapPin, Phone, 
  CheckCircle2, Clock, Car, Bike, Siren, AlertTriangle, 
  Radio, Compass, ArrowRight, Sparkles, Satellite, Route
} from 'lucide-react';
import { Vehicle3DSimulation } from '../components/Vehicle3DSimulation';
import { LiveAccidentDetector } from '../components/LiveAccidentDetector';
import { AccidentRescueWorkflow } from '../components/AccidentRescueWorkflow';
import { useLanguage } from '../context/LanguageContext';

export const AccidentPage = () => {
  const { language, t } = useLanguage();
  const [activeCrashDetails, setActiveCrashDetails] = useState(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const [activeMode, setActiveMode] = useState('live_detection'); // 'live_detection' | '3d_simulation'

  const handleAccidentConfirmed = (details) => {
    setActiveCrashDetails(details);
    setIsDispatched(true);
    // Smooth scroll down directly to the Live Interactive Rescue Map
    setTimeout(() => {
      const el = document.getElementById('rescue-mission-workflow');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 650, behavior: 'smooth' });
      }
    }, 250);
  };

  const handleResetAll = () => {
    setActiveCrashDetails(null);
    setIsDispatched(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Multilingual Header Text
  const getHeaderTitle = () => {
    if (activeMode === 'live_detection') {
      if (language === 'te') return 'ప్రత్యక్ష ప్రయాణం & ప్రమాద గుర్తింపు';
      if (language === 'hi') return 'लाइव ड्राइविंग और दुर्घटना पहचान';
      if (language === 'ta') return 'நேரலை விபத்து கண்டறிதல்';
      if (language === 'kn') return 'ಲೈವ್ ಅಪಘಾತ ಪತ್ತೆ';
      return 'Live Route & Accident Detection';
    }
    return t('sim_title') || '3D Real-Time Crash & Rescue';
  };

  const getHeaderDesc = () => {
    if (activeMode === 'live_detection') {
      if (language === 'te') return 'రియల్ టైమ్ GPS రోడ్డు మ్యాప్, స్పీడోమీటర్ మరియు G-ఫోర్స్ ప్రమాద పర్యవేక్షణ';
      if (language === 'hi') return 'रीयल-टाइम जीपीएस रोड मैप, स्पीडोमीटर और जी-फोर्स सेंसर निगरानी';
      if (language === 'ta') return 'நேரலை GPS வரைபடம் மற்றும் சென்சார் கண்காணிப்பு';
      if (language === 'kn') return 'ನೈಜ ಸಮಯದ ಜಿಪಿಎಸ್ ನಕ್ಷೆ ಮತ್ತು ಸಂವೇದಕಗಳ ಮೇಲ್ವಿಚಾರಣೆ';
      return 'Real-time GPS road map, live route navigation, G-force impact & crash detector';
    }
    return t('sim_desc') || 'Physics collision engine, vehicle telemetry & emergency rescue simulations';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 pb-32 sm:pb-40"
    >
      {/* Sleek Modern Header Bar with Segmented View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#080E1C]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 border border-red-500/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60 shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                {getHeaderTitle()}
              </h1>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono text-cyan-400 shrink-0">
                {activeMode === 'live_detection' ? 'GPS LIVE ROUTE' : '3D COLLISION'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {getHeaderDesc()}
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher Tabs: ONLY Live Route and 3D Crash */}
        <div className="grid grid-cols-2 sm:flex items-center bg-[#050A14] p-1 rounded-xl border border-white/[0.08] w-full md:w-auto shrink-0 gap-1.5 shadow-inner">
          <button
            onClick={() => setActiveMode('live_detection')}
            className={`min-h-9 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeMode === 'live_detection'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Route className="w-4 h-4 shrink-0 text-cyan-300" />
            <span className="truncate">{language === 'te' ? 'లైవ్ రూట్' : language === 'hi' ? 'लाइव मार्ग' : language === 'ta' ? 'நேரலை வழி' : language === 'kn' ? 'ಲೈವ್ ಮಾರ್ಗ' : 'Live Route'}</span>
          </button>

          <button
            onClick={() => setActiveMode('3d_simulation')}
            className={`min-h-9 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeMode === '3d_simulation'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Car className="w-4 h-4 shrink-0 text-amber-300" />
            <span className="truncate">{language === 'te' ? '3D క్రాష్' : language === 'hi' ? '3D क्रैश' : language === 'ta' ? '3D விபத்து' : language === 'kn' ? '3D ಅಪಘಾತ' : '3D Crash'}</span>
          </button>
        </div>
      </div>

      {/* RENDER SELECTED MODE */}
      {activeMode === 'live_detection' && (
        <LiveAccidentDetector 
          onAccidentConfirmed={handleAccidentConfirmed} 
          externalReset={handleResetAll}
        />
      )}



      {activeMode === '3d_simulation' && (
        <Vehicle3DSimulation 
          onAccidentConfirmed={handleAccidentConfirmed} 
          externalReset={handleResetAll} 
        />
      )}

      {/* 6-STAGE AUTONOMOUS RESCUE DISPATCH & TRAUMA WORKFLOW */}
      <AnimatePresence>
        {isDispatched && activeCrashDetails && (
          <div id="rescue-mission-workflow" className="pt-2">
            <AccidentRescueWorkflow 
              crashDetails={activeCrashDetails} 
              onReset={handleResetAll} 
            />
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
