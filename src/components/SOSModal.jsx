import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, X, CheckCircle, AlertTriangle, MessageSquare, Check, Radio } from 'lucide-react';
import { triggerEmergencySOS, checkLocationPermission } from '../services/sos_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';

export function SOSModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { setActiveDispatch } = useDemo();
  const [countdown, setCountdown] = useState(5);
  const [isActivated, setIsActivated] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [stageProgress, setStageProgress] = useState([]);
  const [permGranted, setPermGranted] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isActivated) {
      setCountdown(5);
      setStageProgress([]);

      // Verify location permission on modal open
      checkLocationPermission().then((perm) => {
        setPermGranted(perm.granted);
        console.log(`[SOS Debug 1] Modal Opened. Location Permission: ${perm.granted ? 'GRANTED' : 'DENIED'}`);
      });

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleConfirmSOS();
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

  const handleConfirmSOS = async () => {
    setIsActivated(true);
    console.log('[SOS Debug 2] Confirm SOS Executed.');

    // Trigger ambulance 3D mapping dispatch animation
    setActiveDispatch({
      active: true,
      hospitalCoords: { lat: 16.5167, lng: 80.6500 }, // GGH Vijayawada
      userCoords: { lat: 16.5180, lng: 80.6520 } // Live User Position
    });

    const result = await triggerEmergencySOS(16.5167, 80.6500, 'Prakasam Barrage, Vijayawada', (progress) => {
      setStageProgress(prev => [...prev, progress.label]);
    });

    setSosResult(result);
  };

  const handleCancel = () => {
    console.log('[SOS Debug] Modal Cancelled / Closed.');
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActivated(false);
    setSosResult(null);
    setStageProgress([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        
        {/* Pulsing Strobe Background Overlay */}
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/20 pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 text-red-500 font-bold text-xl">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
              <span>{t('sos_countdown_title')}</span>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!permGranted && (
            <div className="mb-4 p-3 bg-amber-950/80 border border-amber-500/50 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Location permission is restricted. GPS default coordinates will be used.</span>
            </div>
          )}

          {!isActivated ? (
            <div>
              <p className="text-slate-300 text-base mb-6">
                {t('sos_countdown_subtitle')}
              </p>

              {/* Countdown Circular Ring */}
              <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-red-500/40 bg-red-950/30"
                />
                <span className="text-6xl font-extrabold text-red-500 font-mono">
                  {countdown}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-lg min-h-[52px] border border-slate-700 transition-colors"
                >
                  {t('cancel_sos')}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400"
              >
                <CheckCircle className="w-8 h-8" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Emergency SOS Active
              </h3>
              
              {/* Visible Stage Progress Checklist */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono text-emerald-400 mb-6 space-y-2">
                <div className="text-[10px] text-slate-400 font-semibold uppercase border-b border-slate-800 pb-1 mb-2 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Pipeline Dispatch Progress</span>
                </div>
                {stageProgress.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {sosResult?.nativeSmsUri && (
                <a
                  href={sosResult.nativeSmsUri}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 mb-3 shadow-lg shadow-red-600/30 min-h-[52px]"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Dispatch SMS to Relatives ({sosResult.notifiedCount})</span>
                </a>
              )}

              <button
                onClick={handleCancel}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm min-h-[44px]"
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
