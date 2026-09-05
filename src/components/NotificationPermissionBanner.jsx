import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, ShieldAlert, Download, CheckCircle2, X, Sparkles, Smartphone, Share, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speakEmergencyInstruction } from '../services/audio_service';
import { registerDeviceForBackgroundPush } from '../services/push_subscription_service.js';

export function NotificationPermissionBanner() {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    // 1. Detect if running as installed standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isSavedInstalled = localStorage.getItem('resqone_pwa_installed') === 'true';
    const isInstalledApp = isStandalone || isSavedInstalled;
    setIsInstalled(isInstalledApp);

    // 2. Detect iOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Check Notification Permission
    const hasGrantedNotif = 'Notification' in window && Notification.permission === 'granted';
    const isSavedNotif = localStorage.getItem('resqone_notif_enabled') === 'true';
    const isNotifActive = hasGrantedNotif || isSavedNotif;

    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    // 4. Capture native PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. If user installed OR enabled notifications OR dismissed, NEVER show popup
    const isDismissed = localStorage.getItem('resqone_popup_dismissed') === 'true';
    if (isInstalledApp || isNotifActive || isDismissed) {
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }

    // Show popup after 1.5s only for completely fresh users who haven't installed or enabled notifications
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // 1-Tap Combined Action: Enable Notifications + Trigger App Install
  const handleDualAction = async () => {
    setIsEnabling(true);
    // 1. Trigger Notification Request
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission === 'granted') {
          localStorage.setItem('resqone_notif_enabled', 'true');
          registerDeviceForBackgroundPush();
          try {
            new Notification("🚨 RESQONE AI+ Alerts Activated", {
              body: "24/7 High-speed crash telemetry and blood crisis dispatches are now active on your device.",
              icon: "/resqone_logo.jpg"
            });
          } catch {}
          speakEmergencyInstruction("24/7 Emergency alert notifications activated.", language);
        }
      } catch (err) {
        console.warn("Notification error:", err);
      }
    } else {
      localStorage.setItem('resqone_notif_enabled', 'true');
      registerDeviceForBackgroundPush();
    }

    // 2. Trigger PWA Install
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('resqone_pwa_installed', 'true');
        }
        setDeferredPrompt(null);
      } catch (e) {
        console.warn("PWA install error:", e);
      }
    } else {
      localStorage.setItem('resqone_pwa_installed', 'true');
    }

    localStorage.setItem('resqone_popup_dismissed', 'true');
    setIsEnabling(false);
    setShowModal(false);
  };

  // Only Notifications
  const handleEnableOnlyNotifications = async () => {
    if (!('Notification' in window)) {
      alert("Push notifications are not supported in this browser.");
      localStorage.setItem('resqone_popup_dismissed', 'true');
      setShowModal(false);
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        localStorage.setItem('resqone_notif_enabled', 'true');
        new Notification("🚨 RESQONE AI+ Alerts Activated", {
          body: "24/7 High-speed crash telemetry and blood crisis dispatches are active.",
          icon: "/resqone_logo.jpg"
        });
        speakEmergencyInstruction("Emergency notifications enabled.", language);
      }
    } catch (e) {}
    localStorage.setItem('resqone_popup_dismissed', 'true');
    setShowModal(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('resqone_popup_dismissed', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm sm:max-w-md bg-[#080E1C] border-2 border-red-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(239,68,68,0.4)] relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with App Logo */}
          <div className="text-center space-y-2 relative z-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl overflow-hidden border-2 border-red-400/60 mx-auto shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              <img src="/resqone_logo.jpg" alt="RESQONE AI+ Official Logo" className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">RESQ<span className="text-red-500">ONE</span></span>
                <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2 py-0.5 rounded shadow">AI+</span>
              </div>
              <p className="text-xs text-cyan-300 font-bold mt-0.5">
                {language === 'te' ? 'యాప్ ఇన్‌స్టాల్ & అత్యవసర హెచ్చరికలను ప్రారంభించండి' : language === 'hi' ? 'ऐप इंस्टॉल करें और आपातकालीन अलर्ट सक्षम करें' : 'Install App & Enable Emergency Alerts'}
              </p>
            </div>
          </div>

          {/* Value Prop Bullet Points */}
          <div className="space-y-2 bg-[#04070D]/90 p-3 rounded-2xl border border-slate-800/80 my-3.5 text-[11px] sm:text-xs">
            <div className="flex items-center space-x-2.5 text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <span>{language === 'te' ? '24/7 ప్రమాద మరియు రక్త కొరత తక్షణ నోటిఫికేషన్లు' : 'Instant 24/7 Crash & Blood Shortage Alerts'}</span>
            </div>

            <div className="flex items-center space-x-2.5 text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span>{language === 'te' ? 'మొబైల్ హోమ్ స్క్రీన్ నుండి 1-ట్యాప్ ఆఫ్‌లైన్ యాక్సెస్' : '1-Tap Fast Launch & Offline SOS Mode'}</span>
            </div>
          </div>

          {/* iOS Safari Special Instructions if on iPhone */}
          {isIOS && !isInstalled && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[10px] text-amber-300 mb-3 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Share className="w-3 h-3" /> iOS Installation:
              </div>
              <p>Tap Safari’s <strong>Share</strong> button below, then tap <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3 h-3" />.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* Primary Dual Action Button */}
            <button
              onClick={handleDualAction}
              disabled={isEnabling}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-red-950/80 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 min-h-12 border border-red-400/40"
            >
              <Download className="w-4 h-4" />
              <span>
                {deferredPrompt 
                  ? (language === 'te' ? 'ఇన్‌స్టాల్ చేసి అలర్ట్‌లను ప్రారంభించండి' : 'Install App & Enable Alerts') 
                  : (language === 'te' ? 'నోటిఫికేషన్లను ప్రారంభించండి' : 'Enable Emergency Notifications')}
              </span>
            </button>

            {/* Sub-actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleEnableOnlyNotifications}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Alerts Only</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-bold flex items-center justify-center cursor-pointer"
              >
                Continue in Web
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
