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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-5xl mx-auto space-y-6"
    >
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 border border-red-500/40 text-white flex items-center justify-center shadow-lg shadow-red-950/60">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">
                {t('sim_title') || '3D Real-Time Vehicle Crash & Autonomous Multi-Agency Rescue'}
              </h2>
              <span className="bg-red-600/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                SENSOR FUSION LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {t('sim_subtitle') || 'Live sensor fusion evaluating Accelerometer G-Force, 3D Gyroscope, and GPS Speed drop.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>MULTI-SENSOR ACTIVE</span>
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
