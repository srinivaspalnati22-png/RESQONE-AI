import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, ShieldAlert, Activity, Navigation, 
  Hospital, Users, Zap, Gauge, MapPin, Phone, 
  CheckCircle2, Clock, Car, Bike, Siren, AlertTriangle, 
  Radio, Compass, ArrowRight, Sparkles, Satellite
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
      return 'Live Drive & Accident Detection';
    }
    return t('sim_title') || '3D Real-Time Crash & Rescue';
  };

  const getHeaderDesc = () => {
    if (activeMode === 'live_detection') {
      if (language === 'te') return 'రియల్ టైమ్ GPS రోడ్డు మ్యాప్, స్పీడోమీటర్ మరియు G-ఫోర్స్ ప్రమాద పర్యవేక్షణ';
      if (language === 'hi') return 'रीयल-टाइम जीपीएस रोड मैप, स्पीडोमीटर और जी-फोर्स सेंसर निगरानी';
      if (language === 'ta') return 'நேரலை GPS வரைபடம் மற்றும் சென்சார் கண்காணிப்பு';
      if (language === 'kn') return 'ನೈಜ ಸಮಯದ ಜಿಪಿಎಸ್ ನಕ್ಷೆ ಮತ್ತು ಸಂವೇದಕಗಳ ಮೇಲ್ವಿಚಾರಣೆ';
      return 'Real-time GPS road map, speedometer thresholds, G-force impact & live driving detector';
    }
    return t('sim_subtitle') || '3D WebGL Highway decision support simulation with collision dynamics';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-full overflow-x-hidden pb-28 pt-2 px-2 sm:px-4 space-y-4 font-sans"
    >
      
      {/* Page Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 border border-red-500/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60 shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                {getHeaderTitle()}
              </h2>
              <span className="bg-red-600/20 text-red-400 border border-red-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                {language === 'te' ? 'సెన్సార్లు ఆన్' : language === 'hi' ? 'सक्रिय सेंसर' : 'ACTIVE SENSORS'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2 sm:line-clamp-1">
              {getHeaderDesc()}
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center bg-[#050A14] p-1 rounded-2xl border border-white/[0.08] w-full sm:w-auto shrink-0 gap-1 sm:gap-0">
          <button
            onClick={() => setActiveMode('live_detection')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeMode === 'live_detection'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="truncate">
              {language === 'te' ? 'లైవ్ డ్రైవ్' : language === 'hi' ? 'लाइव ड्राइव' : 'Live Drive'}
            </span>
          </button>

          <button
            onClick={() => setActiveMode('3d_simulation')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeMode === '3d_simulation'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span className="truncate">
              {language === 'te' ? '3D క్రాష్ డెమో' : language === 'hi' ? '3D क्रैश डेमो' : '3D Crash Demo'}
            </span>
          </button>
        </div>
      </div>

      {/* RENDER SELECTED MODE */}
      {activeMode === 'live_detection' ? (
        <LiveAccidentDetector 
          onAccidentConfirmed={handleAccidentConfirmed} 
          externalReset={handleResetAll}
        />
      ) : (
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
