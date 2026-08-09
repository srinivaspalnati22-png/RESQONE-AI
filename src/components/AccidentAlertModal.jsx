import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ShieldAlert, CheckCircle, Volume2, X } from 'lucide-react';
import { triggerEmergencySOS } from '../services/sos_service';
import { speakText } from '../services/voice_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';

export function AccidentAlertModal({ isOpen, onClose, accidentDetails }) {
  const { language } = useLanguage();
  const { setActiveDispatch } = useDemo();
  const [countdown, setCountdown] = useState(25);
  const [isActivated, setIsActivated] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isActivated) {
      setCountdown(25);
      speakText("Probable vehicle accident detected. Are you okay? Emergency SOS will trigger in 25 seconds.", language);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleConfirmAutoSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isActivated]);

  const handleConfirmAutoSOS = async () => {
    setIsActivated(true);
    
    // Trigger ambulance 3D mapping dispatch animation
    setActiveDispatch({
      active: true,
      hospitalCoords: { lat: 16.5167, lng: 80.6500 }, // GGH Vijayawada
      userCoords: { lat: 16.5180, lng: 80.6520 } // Live User Position
    });

    const result = await triggerEmergencySOS(16.5167, 80.6500, 'Vijayawada Highway Auto-Detected Crash Site');
    setSosResult(result);
    speakText("Emergency SOS dispatched automatically to contacts and rescue services.", language);
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActivated(false);
    setSosResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
        
        {/* Pulsing Alert Strobe */}
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/30 pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center z-10 overflow-hidden"
        >
          {!isActivated ? (
            <div>
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto mb-4 text-red-500 animate-pulse">
                <AlertOctagon className="w-9 h-9" />
              </div>

              <span className="bg-red-500/20 text-red-400 text-xs font-black px-3 py-1 rounded-full border border-red-500/40 uppercase tracking-wider">
                Multi-Sensor Crash Detection
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                ARE YOU OKAY?
              </h2>

              <p className="text-slate-300 text-sm mt-2 max-w-sm mx-auto">
                Severe impact & rapid speed drop detected. Alerting emergency contacts & trauma dispatch in:
              </p>

              {/* 25-Second Large Countdown Display */}
              <div className="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-red-500 bg-red-950/40 shadow-xl shadow-red-950"
                />
                <span className="text-6xl font-black text-red-400 font-mono">
                  {countdown}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-base shadow-lg transition-colors min-h-[52px]"
                >
                  I'M SAFE (CANCEL)
                </button>

                <button
                  onClick={handleConfirmAutoSOS}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-base shadow-lg shadow-red-950 transition-colors min-h-[52px]"
                >
                  I NEED HELP NOW
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                Emergency Rescue Dispatched
              </h3>

              <p className="text-slate-300 text-sm mb-6">
                Auto-detected crash tagged <code className="text-red-400 font-mono">source: auto_detected</code>. Live GPS pin & ambulance dispatched.
              </p>

              <button
                onClick={handleCancel}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-sm min-h-[44px]"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
