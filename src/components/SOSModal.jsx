import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, PhoneCall, X, CheckCircle, AlertTriangle, MessageSquare, Check, Radio, Users, Send, ExternalLink } from 'lucide-react';
import { triggerEmergencySOS, checkLocationPermission } from '../services/sos_service';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import { speakEmergencyInstruction } from '../services/audio_service';

export function SOSModal({ isOpen, onClose }) {
  const { t, language } = useLanguage();
  const { setActiveDispatch, broadcastEmergencySOS } = useDemo();
  const { user, familyContacts } = useAuth();
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

      checkLocationPermission().then((perm) => {
        setPermGranted(perm.granted);
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

    setActiveDispatch({
      active: true,
      hospitalCoords: { lat: 16.5167, lng: 80.6500 },
      userCoords: { lat: 16.5180, lng: 80.6520 }
    });

    // Broadcast to all active agencies, dashboard, and family contacts
    if (broadcastEmergencySOS) {
      broadcastEmergencySOS({
        type: 'ACCIDENT_RESCUE',
        title: '🚨 CRITICAL EMERGENCY SOS: User Triggered Beacon',
        location: 'Prakasam Barrage / NH-16, Vijayawada',
        victim: 'Emergency Citizen (O- Blood)',
        severity: 'CRITICAL'
      });
    }

    speakEmergencyInstruction("Emergency SOS Beacon broadcasted to all rescue agencies and family members.", language);

    const result = await triggerEmergencySOS(
      16.5167,
      80.6500,
      'Prakasam Barrage, Vijayawada',
      (progress) => {
        setStageProgress(prev => [...prev, progress.label]);
      },
      user
    );

    setSosResult(result);
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActivated(false);
    setSosResult(null);
    setStageProgress([]);
    onClose();
  };

  if (!isOpen) return null;

  const contactsToDisplay = sosResult?.contacts || familyContacts || [];

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
          className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/60 rounded-2xl p-5 sm:p-7 shadow-2xl text-center z-10 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 text-red-500 font-bold text-lg">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span>{t('sos_countdown_title') || 'EMERGENCY SOS BEACON'}</span>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!permGranted && (
            <div className="mb-3 p-2.5 bg-amber-950/80 border border-amber-500/50 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Location permission is restricted. GPS default coordinates will be used.</span>
            </div>
          )}

          {!isActivated ? (
            <div className="overflow-y-auto">
              <p className="text-slate-300 text-sm mb-5">
                {t('sos_countdown_subtitle') || 'Broadcasting distress coordinates to 108 CAD, Trauma ICU, and 5 Family Relatives via Zero-Touch SMS & WhatsApp'}
              </p>

              {/* Countdown Circular Ring */}
              <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-red-500/40 bg-red-950/30"
                />
                <span className="text-5xl font-extrabold text-red-500 font-mono">
                  {countdown}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-base min-h-[48px] border border-slate-700 transition-colors cursor-pointer"
                >
                  {t('cancel_sos') || 'Cancel SOS'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 overflow-y-auto flex-1 pr-1 space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400"
              >
                <CheckCircle className="w-7 h-7" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Emergency SOS Broadcast Active
                </h3>
                <span className="inline-block mt-1 text-[11px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-semibold">
                  ⚡ Zero-Touch Automated Cloud Dispatch Triggered
                </span>
              </div>
              
              {/* Visible Stage Progress Checklist */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left text-xs font-mono text-emerald-400 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-semibold uppercase border-b border-slate-800 pb-1 mb-1.5 flex items-center gap-1.5">
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

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {sosResult?.nativeSmsUri && (
                  <a
                    href={sosResult.nativeSmsUri}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send / Resend Native SMS to All 5 Relatives</span>
                  </a>
                )}

                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs min-h-[40px] cursor-pointer"
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
