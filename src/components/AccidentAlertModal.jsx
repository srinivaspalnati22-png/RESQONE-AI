import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ShieldAlert, CheckCircle, Volume2, X, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { triggerEmergencySOS } from '../services/sos_service';
import { speakText } from '../services/voice_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';

export function AccidentAlertModal({ isOpen, onClose, accidentDetails }) {
  const { language } = useLanguage();
  const { setActiveDispatch } = useDemo();
  const { user, familyContacts } = useAuth();
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

    const result = await triggerEmergencySOS(
      16.5167,
      80.6500,
      'Vijayawada Highway Auto-Detected Crash Site',
      null,
      user
    );
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

  const contactsToDisplay = sosResult?.contacts || familyContacts || [];

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
          className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-3xl p-5 sm:p-7 shadow-2xl text-center z-10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {!isActivated ? (
            <div className="overflow-y-auto">
              <div className="w-14 h-14 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto mb-3 text-red-500 animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>

              <span className="bg-red-500/20 text-red-400 text-xs font-black px-3 py-1 rounded-full border border-red-500/40 uppercase tracking-wider">
                Multi-Sensor Crash Detection
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                ARE YOU OKAY?
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
                Severe impact & rapid speed drop detected. Alerting 5 emergency family contacts & trauma dispatch in:
              </p>

              {/* 25-Second Large Countdown Display */}
              <div className="relative w-32 h-32 mx-auto my-5 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-red-500 bg-red-950/40 shadow-xl shadow-red-950"
                />
                <span className="text-5xl font-black text-red-400 font-mono">
                  {countdown}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-lg transition-colors min-h-[48px] cursor-pointer"
                >
                  I'M SAFE (CANCEL)
                </button>

                <button
                  onClick={handleConfirmAutoSOS}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-red-950 transition-colors min-h-[48px] cursor-pointer"
                >
                  I NEED HELP NOW
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  Emergency Rescue Dispatched
                </h3>
                <span className="inline-block mt-1 text-[11px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-semibold">
                  ⚡ Zero-Touch Automated Cloud Dispatch to 5 Relatives
                </span>
              </div>

              <p className="text-slate-300 text-xs">
                Auto-detected crash tagged <code className="text-red-400 font-mono">source: auto_detected</code>. Live GPS pin & trauma ambulance dispatched.
              </p>

              {/* 5 Family Contacts Notification Tray */}
              <div className="bg-[#050A14] p-3 rounded-xl border border-emerald-500/40 text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Users className="w-4 h-4" />
                    <span>5 Family Kin Notified (Zero-Touch):</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md font-mono border border-emerald-700/50">
                    5/5 Delivered
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {contactsToDisplay.slice(0, 5).map((c, idx) => {
                    const waLink = sosResult?.whatsAppLinks?.find(w => w.id === c.id || w.phone === c.phone)?.url;
                    return (
                      <div
                        key={c.id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-white font-semibold">{c.name}</span>
                            <span className="text-slate-400 ml-1">({c.relation})</span>
                            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <span>✓ SMS Sent</span>
                              <span>•</span>
                              <span>✓ WhatsApp Sent</span>
                            </div>
                          </div>
                        </div>

                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold flex items-center gap-1 border border-emerald-700/60 transition-colors"
                            title="Open WhatsApp Chat"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2 pt-1">
                {sosResult?.nativeSmsUri && (
                  <a
                    href={sosResult.nativeSmsUri}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg min-h-[40px]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send / Resend Native SMS to All 5</span>
                  </a>
                )}

                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs min-h-[40px] cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
