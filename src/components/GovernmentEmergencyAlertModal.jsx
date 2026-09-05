import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, Siren, Volume2, VolumeX, Navigation, 
  Phone, ShieldAlert, CheckCircle2, X, MapPin, 
  Activity, HeartPulse, ExternalLink, Radio, Compass
} from 'lucide-react';
import { 
  subscribeToDisasterAlerts, 
  dismissDisasterAlert,
  getMyDeviceId 
} from '../services/broadcast_service.js';
import { 
  playDisasterAlertSiren, 
  stopDisasterAlertSiren, 
  speakEmergencyInstruction 
} from '../services/audio_service.js';
import { useLanguage } from '../context/LanguageContext';

export const GovernmentEmergencyAlertModal = () => {
  const { language } = useLanguage();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isSirenActive, setIsSirenActive] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  const [userDistanceKm, setUserDistanceKm] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToDisasterAlerts(
      (alert) => {
        // DONT SHOW ON VICTIM'S OWN PHONE!
        const myDeviceId = getMyDeviceId();
        if (!alert.isSimulation && alert.senderDeviceId && alert.senderDeviceId === myDeviceId) {
          return;
        }

        setActiveAlert(alert);
        setIsSirenActive(true);
        setHasResponded(false);

        // Compute distance from user's live coordinates if available
        try {
          const savedCoords = localStorage.getItem('resqone_live_coords');
          if (savedCoords && alert.lat && alert.lng) {
            const [uLat, uLng] = JSON.parse(savedCoords);
            const R = 6371; // Earth radius in km
            const dLat = (alert.lat - uLat) * (Math.PI / 180);
            const dLng = (alert.lng - uLng) * (Math.PI / 180);
            const a = 
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(uLat * (Math.PI / 180)) * Math.cos(alert.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = (R * c).toFixed(1);
            setUserDistanceKm(dist);
          }
        } catch {}

        // Speak spoken voice instruction in selected language customized per category
        const cat = (alert.category || 'ACCIDENT').toUpperCase();
        let spokenText = '';

        if (cat === 'BLOOD_URGENT') {
          spokenText = language === 'te'
            ? `అత్యవసర బ్లడ్ అలర్ట్! ${alert.victimName} కోసం ${alert.bloodGroup} రక్తం కావాలి. స్థలం: ${alert.locationName}. దయచేసి వెంటనే స్పందించండి.`
            : language === 'hi'
              ? `आपातकालीन रक्त चेतावनी! ${alert.victimName} के लिए ${alert.bloodGroup} रक्त की तत्काल आवश्यकता है। स्थान: ${alert.locationName}.`
              : `Critical Blood Alert! ${alert.bloodGroup} blood urgently needed for ${alert.victimName} at ${alert.locationName}. Immediate blood donors required.`;
        } else if (cat === 'SNAKEBITE') {
          spokenText = language === 'te'
            ? `పాముకాటు అత్యవసర హెచ్చరిక! ${alert.victimName} కి పాముకాటు జరిగింది. స్థలం: ${alert.locationName}. సమీప యాంటీవెనమ్ ఆసుపత్రికి రూట్ గుర్తించబడింది.`
            : language === 'hi'
              ? `सर्पदंश आपातकालीन चेतावनी! ${alert.victimName} को सर्पदंश हुआ है। स्थान: ${alert.locationName}. तुरंत सहायता करें।`
              : `Snakebite emergency alert! Snakebite reported for ${alert.victimName} at ${alert.locationName}. Antivenom hospital route alerted.`;
        } else if (cat === 'SOS_BEACON') {
          spokenText = language === 'te'
            ? `అత్యవసర SOS హెచ్చరిక! ${alert.victimName} ఆపదలో ఉన్నారు. స్థలం: ${alert.locationName}. వెంటనే సహాయం చేయండి.`
            : language === 'hi'
              ? `आपातकालीन एसओएस चेतावनी! ${alert.victimName} संकट में हैं। स्थान: ${alert.locationName}. तुरंत सहायता करें।`
              : `Critical SOS Alert! Distress beacon triggered by ${alert.victimName} at ${alert.locationName}. Immediate assistance required.`;
        } else {
          spokenText = language === 'te'
            ? `అత్యవసర హెచ్చరిక! ${alert.victimName} కోసం తీవ్రమైన వాహన ప్రమాదం గుర్తించబడింది. స్థలం: ${alert.locationName}. వెంటనే సహాయం చేయండి.`
            : language === 'hi'
              ? `आपातकालीन चेतावनी! ${alert.victimName} के लिए वाहन दुर्घटना की सूचना मिली है। स्थान: ${alert.locationName}. तुरंत सहायता करें।`
              : `Critical Emergency Alert! Severe vehicle crash detected for ${alert.victimName} at ${alert.locationName}. Immediate rescue assistance required.`;
        }

        speakEmergencyInstruction(spokenText, language);
      },
      () => {
        setActiveAlert(null);
        stopDisasterAlertSiren();
      }
    );

    return () => {
      unsubscribe();
      stopDisasterAlertSiren();
    };
  }, [language]);

  if (!activeAlert) return null;

  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopDisasterAlertSiren();
      setIsSirenActive(false);
    } else {
      playDisasterAlertSiren(8);
      setIsSirenActive(true);
    }
  };

  const handleDismiss = () => {
    dismissDisasterAlert();
    setActiveAlert(null);
    stopDisasterAlertSiren();
  };

  const handleRespondEnRoute = () => {
    setHasResponded(true);
    stopDisasterAlertSiren();
    setIsSirenActive(false);

    speakEmergencyInstruction(
      language === 'te' 
        ? 'మీ స్పందన నమోదయింది. మీరు రెస్క్యూ కోసం వెళ్తున్నారు.' 
        : language === 'hi' 
          ? 'आपकी सहायता प्रतिक्रिया दर्ज की गई है। सुरक्षित यात्रा करें।' 
          : 'Response confirmed. Proceeding to assist victim.',
      language
    );
  };

  const handleNavigateToVictim = () => {
    stopDisasterAlertSiren();
    // Navigate via Google Maps directions or Leaflet
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeAlert.lat},${activeAlert.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const category = (activeAlert.category || 'ACCIDENT').toUpperCase();
  const isBlood = category === 'BLOOD_URGENT';
  const isSnakebite = category === 'SNAKEBITE';
  const isSos = category === 'SOS_BEACON';

  const getHeaderGradient = () => {
    if (isBlood) return 'from-rose-700 via-red-600 to-amber-700';
    if (isSnakebite) return 'from-emerald-700 via-teal-600 to-amber-600';
    if (isSos) return 'from-amber-600 via-rose-600 to-red-700';
    return 'from-red-600 via-rose-600 to-amber-600';
  };

  const getHeaderTitle = () => {
    if (isBlood) return `🩸 CRITICAL BLOOD NEEDED: ${activeAlert.bloodGroup}`;
    if (isSnakebite) return `🐍 SNAKEBITE EMERGENCY: ${activeAlert.species || 'Venomous'}`;
    if (isSos) return `⚡ EMERGENCY SOS DISTRESS BEACON`;
    return `🚨 HIGH-SPEED VEHICLE COLLISION DETECTED`;
  };

  const getHeaderCategoryBadge = () => {
    if (isBlood) return 'CIVIL BLOOD DONOR DISPATCH NETWORK';
    if (isSnakebite) return 'NEURAL VISION SNAKEBITE & ANTIVENOM RESCUE';
    if (isSos) return 'CRITICAL SOS DISTRESS BROADCAST';
    return 'NATIONAL DISASTER & CRASH RESCUE BROADCAST';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto">
        
        {/* Disaster Strobe Alert Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#090E18] border-2 border-red-500/80 shadow-2xl shadow-red-950/90 overflow-hidden ring-4 ring-red-500/20 my-auto"
        >
          {/* Top Flashing Disaster Banner */}
          <div className={`bg-gradient-to-r ${getHeaderGradient()} px-4 py-3 text-white flex items-center justify-between shadow-lg`}>
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center shrink-0">
                <Siren className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono tracking-widest uppercase font-black text-amber-200 block truncate">
                  {getHeaderCategoryBadge()}
                </span>
                <h3 className="text-xs sm:text-sm font-black tracking-wide truncate">
                  {getHeaderTitle()}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Mute/Sound Siren Button */}
              <button
                onClick={handleToggleSiren}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSirenActive 
                    ? 'bg-black/40 text-amber-300 border border-amber-400/40 hover:bg-black/60' 
                    : 'bg-black/20 text-slate-300 hover:text-white'
                }`}
                title={isSirenActive ? "Mute Siren" : "Play Siren"}
              >
                {isSirenActive ? <Volume2 className="w-4 h-4 animate-pulse text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span className="text-[10px] font-mono hidden xs:inline">{isSirenActive ? 'SIREN ON' : 'MUTED'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert Body */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Status Radar & Distance Pill */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center space-x-2 text-xs font-mono text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="truncate">BROADCASTED TO ALL REGISTERED APP USERS</span>
              </div>
              {userDistanceKm && (
                <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold shrink-0">
                  📍 {userDistanceKm} km away
                </div>
              )}
            </div>

            {/* Victim Identity & Medical Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    {isBlood ? 'Patient Needing Blood' : 'Citizen in Distress'}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-1.5">
                    <span>{activeAlert.victimName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600/30 text-red-300 border border-red-500/40 font-mono font-bold">
                      {activeAlert.bloodGroup}
                    </span>
                  </h4>
                  <p className="text-xs text-cyan-400 font-medium">
                    {activeAlert.relation || 'App User'} • {activeAlert.victimPhone}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">Incident Time</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{activeAlert.timeStr}</span>
                </div>
              </div>

              {/* Dynamic Telemetry Chips Based on Category */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                {isBlood ? (
                  <>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Group Required</span>
                      <span className="font-bold font-mono text-red-400">{activeAlert.bloodGroup}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Units Needed</span>
                      <span className="font-bold font-mono text-amber-300">{activeAlert.unitsNeeded || 2} Units</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Courier Status</span>
                      <span className="font-bold font-mono text-emerald-400">Cold-Chain Active</span>
                    </div>
                  </>
                ) : isSnakebite ? (
                  <>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Envenomation</span>
                      <span className="font-bold font-mono text-emerald-400">{activeAlert.species || 'Venomous'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Antivenom Protocol</span>
                      <span className="font-bold font-mono text-amber-300">10 Vials Polyvalent</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Hospital Target</span>
                      <span className="font-bold font-mono text-cyan-400 truncate block">{activeAlert.hospitalName || 'GGH Trauma Center'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Impact Force</span>
                      <span className="font-bold font-mono text-red-400">{activeAlert.impactG || 5.12} G Force</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Speed at Impact</span>
                      <span className="font-bold font-mono text-amber-300">{activeAlert.speedAtImpact || 82} KM/H</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">CAD Dispatch</span>
                      <span className="font-bold font-mono text-emerald-400">108 ALS En Route</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live GPS Location Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>{isBlood ? 'Hospital / Transfusion Site' : isSnakebite ? 'Bite Incident Site' : 'Exact Crash / Distress Site'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeAlert.lat?.toFixed(4)}°N, {activeAlert.lng?.toFixed(4)}°E
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white leading-snug">
                {activeAlert.locationName}
              </p>
            </div>

            {/* Response Status (if user tapped en route) */}
            {hasResponded && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Thank you! Your responder status has been broadcasted. Proceed to the victim safely.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleNavigateToVictim}
                className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-2xl shadow-cyan-950/80 cursor-pointer active:scale-98 transition-all ring-2 ring-cyan-400/50"
              >
                <Navigation className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
                <span>
                  {isBlood ? 'NAVIGATE TO BLOOD RECIPIENT / HOSPITAL' : isSnakebite ? 'NAVIGATE TO SNAKEBITE VICTIM / ANTIVENOM' : 'NAVIGATE TO VICTIM (OPEN LIVE ROAD ROUTE)'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:108"
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-red-950 cursor-pointer transition-all text-center"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>CALL 108 CAD</span>
                </a>

                <button
                  onClick={handleRespondEnRoute}
                  className={`font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 border cursor-pointer transition-all ${
                    hasResponded 
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{hasResponded ? 'I AM ASSISTING' : 'I AM EN ROUTE'}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
