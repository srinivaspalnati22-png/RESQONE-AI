import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, ShieldAlert, CheckCircle2, X, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speakEmergencyInstruction } from '../services/audio_service';

export function NotificationPermissionBanner() {
  const { language } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      const dismissed = localStorage.getItem('resqone_notif_prompt_dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        // Show after 2 seconds for smooth onboarding
        const timer = setTimeout(() => setShowPrompt(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop/push notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setShowPrompt(false);
      localStorage.setItem('resqone_notif_prompt_dismissed', 'true');

      if (permission === 'granted') {
        new Notification("🚨 RESQONE AI+ Emergency Alerts Enabled", {
          body: "You will now receive instant push alerts for high-speed crashes, urgent blood crises, and family SOS broadcasts.",
          icon: "/favicon.svg"
        });
        speakEmergencyInstruction("Critical emergency notifications enabled for all alerts and family broadcasts.", language);
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('resqone_notif_prompt_dismissed', 'true');
  };

  if (!showPrompt || permissionStatus === 'granted') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-[#080E1C]/98 backdrop-blur-2xl border-2 border-red-500/80 rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(239,68,68,0.35)] space-y-3 relative overflow-hidden">
          
          {/* Subtle Ambient Pulse */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-950/80 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                  {language === 'te' ? 'అత్యవసర నోటిఫికేషన్లను ప్రారంభించండి' : 'Enable Critical Emergency Notifications'}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {language === 'te' 
                    ? 'ప్రమాదాలు, పాముకాటు, రక్త నిల్వలు మరియు కుటుంబ సభ్యుల SOS అలర్ట్‌లను తక్షణమే పొందండి.' 
                    : 'Get real-time push & audible alerts for crashes, blood shortages, antivenom dispatches, and family SOS beacons.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss Notification Prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={handleEnableNotifications}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'te' ? 'నోటిఫికేషన్లను అనుమతించు' : 'Allow Emergency Alerts'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
            >
              {language === 'te' ? 'తర్వాత' : 'Later'}
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
