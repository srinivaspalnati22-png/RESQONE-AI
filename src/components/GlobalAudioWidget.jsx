import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Play, Check, Globe, Siren, Bell, Radio, Smartphone } from 'lucide-react';
import { speakEmergencyInstruction, stopAllAudio, getAudioMuted, toggleAudioMute } from '../services/audio_service';
import { simulateCommunityDisasterAlert, requestNotificationPermission } from '../services/broadcast_service';
import { scheduleTestClosedAppPush } from '../services/push_subscription_service';
import { useLanguage } from '../context/LanguageContext';

export const GlobalAudioWidget = () => {
  const { language, setLanguage } = useLanguage();
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [pushTesting, setPushTesting] = useState(false);

  useEffect(() => {
    const handleSpeechStatus = (e) => {
      setIsSpeaking(e.detail?.isSpeaking || false);
      setActiveSpeechText(e.detail?.text || '');
    };

    const handleMuteChange = (e) => {
      setIsMuted(e.detail?.muted || false);
    };

    window.addEventListener('resqone_speech_status', handleSpeechStatus);
    window.addEventListener('resqone_audio_mute_changed', handleMuteChange);

    return () => {
      window.removeEventListener('resqone_speech_status', handleSpeechStatus);
      window.removeEventListener('resqone_audio_mute_changed', handleMuteChange);
    };
  }, []);

  const handleToggleMute = () => {
    const newMuted = toggleAudioMute();
    setIsMuted(newMuted);
  };

  const handleTestAudio = (lang = language) => {
    const testPhrases = {
      te: "నమస్కారం! రెస్క్యూ వన్ వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.",
      hi: "नमस्ते! रेस्क्यू वन वॉयस असिस्टेंट पूरी तरह तैयार है।",
      ta: "வணக்கம்! ரெஸ்க்யூ ஒன் குரல் வழிகாட்டி தயாராக உள்ளது.",
      kn: "ನಮಸ್ಕಾರ! ರೆಸ್ಕ್ಯೂ ಒನ್ ಧ್ವನಿ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.",
      en: "Hello! RESQONE Emergency Voice Assistant is active and ready."
    };

    const phrase = testPhrases[lang] || testPhrases.en;
    speakEmergencyInstruction(phrase, lang);
  };

  const getLangBadge = () => {
    if (language === 'te') return 'తెలుగు (TE)';
    if (language === 'hi') return 'हिंदी (HI)';
    if (language === 'ta') return 'தமிழ் (TA)';
    if (language === 'kn') return 'ಕನ್ನಡ (KN)';
    return 'English (EN)';
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 font-sans">
      {/* Floating Control Capsule */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#080E1C]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-950/80">
        
        {/* Mute / Unmute Button */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
          className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
            isMuted 
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' 
              : isSpeaking 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                : 'bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Status / Active Text Preview */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
        >
          {isSpeaking ? (
            <div className="flex items-center gap-1">
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider">
                SPEAKING
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-[10px] font-bold text-slate-300">
                {getLangBadge()}
              </span>
            </div>
          )}
        </div>

        {/* Quick Test Voice Button */}
        <button
          onClick={() => handleTestAudio(language)}
          title="Test Voice Audio in current language"
          className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-950"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Test Voice</span>
        </button>

        {/* Government Disaster Siren Test Trigger */}
        <button
          onClick={() => simulateCommunityDisasterAlert()}
          title="Simulate Government Disaster / Cyclone-Style Emergency Alert Broadcast"
          className="px-2 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-red-950/80 animate-pulse"
        >
          <Siren className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Disaster Alert</span>
        </button>
      </div>

      {/* Expanded Multi-Language Audio Test Drawer */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 bg-[#0B1220] border border-blue-500/40 rounded-2xl shadow-2xl p-3 space-y-2.5 mb-1 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Voice & Disaster Broadcast</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug">
            Tap any language below to preview instant speech synthesis across Telugu, Hindi, Tamil, Kannada, and English:
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { code: 'te', label: 'తెలుగు (Telugu)' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'ta', label: 'தமிழ் (Tamil)' },
              { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              { code: 'en', label: 'English' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  handleTestAudio(lang.code);
                }}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-white/5'
                }`}
              >
                <span className="truncate">{lang.label}</span>
                <Play className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </button>
            ))}
          </div>

          {activeSpeechText && isSpeaking && (
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-[10px] text-cyan-300 font-mono line-clamp-2">
              🔊 "{activeSpeechText}"
            </div>
          )}

          {/* Government Disaster / Cyclone-Style Siren & Mesh Broadcast Simulation */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Disaster Alert Broadcast</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                EAS 853Hz Siren
              </span>
            </div>

            <button
              onClick={() => {
                simulateCommunityDisasterAlert();
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/80 transition-all active:scale-95"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Simulate Disaster Alert Broadcast</span>
            </button>

            <button
              onClick={requestNotificationPermission}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Enable Background Alert Notifications</span>
            </button>

            {/* Test alert when app is closed / phone is locked */}
            <button
              onClick={async () => {
                setPushTesting(true);
                await scheduleTestClosedAppPush(4);
                setTimeout(() => setPushTesting(false), 5000);
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-purple-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{pushTesting ? "⏳ Lock Phone Now! Firing in 4s..." : "Test Closed-App Push (Lock Phone)"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-slate-500">
            <span>Dual Engine: Web Speech + TTS Stream</span>
            <button 
              onClick={stopAllAudio} 
              className="text-red-400 hover:underline cursor-pointer font-bold"
            >
              Stop Speech
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
