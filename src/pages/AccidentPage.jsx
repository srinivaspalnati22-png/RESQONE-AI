import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, ShieldAlert, Activity, Navigation, 
  Hospital, Users, Zap, Gauge, MapPin, Phone, 
  CheckCircle2, Clock, Car, Bike, Siren, AlertTriangle, 
  Radio, Compass, ArrowRight, Sparkles
} from 'lucide-react';
import { Vehicle3DSimulation } from '../components/Vehicle3DSimulation';
import { AccidentRescueWorkflow } from '../components/AccidentRescueWorkflow';
import { useLanguage } from '../context/LanguageContext';

export const AccidentPage = () => {
  const { t } = useLanguage();
  const [activeCrashDetails, setActiveCrashDetails] = useState(null);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleAccidentConfirmed = (details) => {
    setActiveCrashDetails(details);
    setIsDispatched(true);
    // Smooth scroll down directly to the Live Interactive Rescue Map
    setTimeout(() => {
      const el = document.getElementById('rescue-mission-workflow');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 580, behavior: 'smooth' });
      }
    }, 250);
  };

  const handleResetAll = () => {
    setActiveCrashDetails(null);
    setIsDispatched(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full pb-28 pt-2 px-2 sm:px-4 space-y-4 font-sans"
    >
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 border border-red-500/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60 shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-wide">
                {t('sim_title') || '3D Real-Time Crash & Rescue'}
              </h2>
              <span className="bg-red-600/20 text-red-400 border border-red-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Sensor fusion evaluating Accelerometer G-Force, 3D Gyroscope & GPS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 self-start sm:self-auto bg-[#050A14] px-2.5 py-1 rounded-xl border border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SENSORS ACTIVE</span>
        </div>
      </div>

      {/* 1. Flagship Photorealistic 3D Vehicle Highway Simulation & Real-time Live Sensor Screening */}
      <Vehicle3DSimulation 
        onAccidentConfirmed={handleAccidentConfirmed}
        externalReset={handleResetAll}
      />

      {/* 2. Autonomous Multi-Hospital Radar & Real Animated Route Map (Revealed upon Crash Confirmation) */}
      <AnimatePresence>
        {isDispatched && (
          <div id="rescue-mission-workflow" className="scroll-mt-6">
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
