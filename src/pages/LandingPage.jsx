import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Bot, Droplet, Activity, Hospital, 
  Radio, HeartPulse, ArrowRight, 
  Phone, Users, Clock, Sparkles, Car,
  Shield, ChevronRight, Siren,
  MapPin, Volume2, RadioTower, Navigation, Crosshair,
  Compass, Zap, AlertTriangle, Play, Pause, Flame, CheckCircle2,
  Heart, Mic, Bell, User, Briefcase, Plus, Send, Waves,
  Layers, WifiOff, Globe, CheckCircle, Radio as RadioIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useViewMode } from '../context/ViewModeContext';
import { startVoiceRecognition } from '../services/voice_service';
import { speakEmergencyInstruction } from '../services/audio_service';

// ─── 1. HIGH-PRECISION NEON SVG ICONS ───

const NeonAccidentIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="rgba(255, 34, 68, 0.15)" stroke="rgba(255, 34, 68, 0.4)" strokeWidth="1.5" />
    <path d="M32 8 L34 16 L40 12 L36 18 L44 20 L36 23 L40 28 L33 25 L32 30 L31 25 L24 28 L28 23 L20 20 L28 18 L24 12 L30 16 Z" fill="#FFCC00" className="animate-pulse drop-shadow-[0_0_8px_#FFCC00]" />
    <path d="M16 42 L20 34 C22 30, 26 28, 32 28 C38 28, 42 30, 44 34 L48 42 C50 43, 50 46, 48 48 C46 50, 44 50, 44 50 L20 50 C20 50, 18 50, 16 48 C14 46, 14 43, 16 42 Z" fill="#FF2244" stroke="#FF5577" strokeWidth="1.5" className="drop-shadow-[0_0_10px_#FF2244]" />
    <path d="M22 34 L25 30 C27 29, 37 29, 39 30 L42 34 Z" fill="#FFAAAA" opacity="0.8" />
    <circle cx="21" cy="46" r="3.5" fill="#111" stroke="#FF5577" strokeWidth="1.5" />
    <circle cx="43" cy="46" r="3.5" fill="#111" stroke="#FF5577" strokeWidth="1.5" />
    <circle cx="17" cy="43" r="1.5" fill="#FFF" className="drop-shadow-[0_0_4px_#FFF]" />
    <circle cx="47" cy="43" r="1.5" fill="#FFF" className="drop-shadow-[0_0_4px_#FFF]" />
  </svg>
);

const NeonBloodIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="rgba(255, 45, 85, 0.15)" stroke="rgba(255, 45, 85, 0.4)" strokeWidth="1.5" />
    <path d="M32 14 C32 14, 18 30, 18 40 C18 48, 24 54, 32 54 C40 54, 46 48, 46 40 C46 30, 32 14, 32 14 Z" fill="url(#bloodGradExact3)" stroke="#FF4D6D" strokeWidth="1.5" className="drop-shadow-[0_0_12px_rgba(255,45,85,0.9)]" />
    <path d="M32 32 V46 M25 39 H39" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_4px_#FFFFFF]" />
    <defs>
      <linearGradient id="bloodGradExact3" x1="32" y1="14" x2="32" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF1E4B" />
        <stop offset="1" stopColor="#A80024" />
      </linearGradient>
    </defs>
  </svg>
);

const NeonSnakeIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="rgba(0, 229, 153, 0.15)" stroke="rgba(0, 229, 153, 0.4)" strokeWidth="1.5" />
    <path 
      d="M32 16 C37 16, 42 19, 42 24 C42 29, 36 32, 28 34 C20 36, 18 41, 18 45 C18 50, 24 53, 32 53 C41 53, 46 48, 46 43 C46 38, 40 37, 36 37" 
      stroke="#00E599" 
      strokeWidth="4" 
      strokeLinecap="round" 
      className="drop-shadow-[0_0_10px_#00E599]"
    />
    <path d="M32 16 C30 14, 25 15, 24 18 C23 21, 26 24, 30 24 Z" fill="#00FFB2" className="drop-shadow-[0_0_6px_#00FFB2]" />
    <circle cx="27" cy="18" r="1.5" fill="#000" />
    <path d="M23 17 L17 15 M17 15 L14 13 M17 15 L14 17" stroke="#FF2244" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NeonMedicalIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="rgba(168, 85, 247, 0.15)" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" />
    <rect x="18" y="24" width="28" height="24" rx="5" fill="#8B5CF6" stroke="#C084FC" strokeWidth="1.5" className="drop-shadow-[0_0_10px_#8B5CF6]" />
    <path d="M26 24 V20 C26 18, 28 16, 30 16 H34 C36 16, 38 18, 38 20 V24" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M32 30 V42 M26 36 H38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_4px_#FFFFFF]" />
  </svg>
);

// ─── 2. ANIMATED ECG HEARTBEAT COMPONENT ───
const AnimatedECGWave = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.clientWidth || 240);
    let height = (canvas.height = 38);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 38;
    };
    window.addEventListener('resize', handleResize);

    let offset = 0;
    const step = 2;

    const getHeartbeatY = (x) => {
      const period = 140;
      const modX = (x + offset) % period;
      const centerY = height / 2;

      if (modX >= 16 && modX < 28) return centerY - Math.sin(((modX - 16) / 12) * Math.PI) * 3;
      if (modX >= 36 && modX < 42) return centerY + ((modX - 36) / 6) * 4.5;
      if (modX >= 42 && modX < 52) return centerY - Math.sin(((modX - 42) / 10) * Math.PI) * 15;
      if (modX >= 52 && modX < 60) return centerY + Math.sin(((modX - 52) / 8) * Math.PI) * 5.5;
      if (modX >= 76 && modX < 100) return centerY - Math.sin(((modX - 76) / 24) * Math.PI) * 4;
      return centerY + Math.sin(x * 0.08) * 0.5;
    };

    const render = () => {
      offset += 2.2;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const y = getHeartbeatY(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#FF2244';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#FF2244';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-9 relative flex items-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// ─── 3. HOLOGRAPHIC GLOWING AI BRAIN NODE ───
const HolographicBrainNode = () => {
  return (
    <div className="relative w-11 h-11 rounded-2xl bg-[#061226] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
      <span className="absolute -inset-1 rounded-2xl border border-cyan-400/30 animate-pulse pointer-events-none" />
      <span className="absolute -inset-2 rounded-2xl border border-cyan-400/15 animate-ping pointer-events-none" />
      
      <svg className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
      </svg>
    </div>
  );
};

// ─── 4. EXACT LIVE EMERGENCY MAP (PIXEL-MATCHING REFERENCE MOCKUP) ───
const ExactLiveEmergencyMap = () => {
  return (
    <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-[#04091A] border border-cyan-500/20 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.85)]">
      
      {/* Background Starry / Deep Nebula Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 75% 50%, rgba(255, 34, 68, 0.3) 0%, transparent 60%), radial-gradient(rgba(0, 240, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 14px 14px'
        }}
      />

      <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMidYMid meet">
        
        {/* ── 1. LEFT SIDE: REALISTIC INDIA CONSTELLATION MESH ── */}
        <g transform="translate(10, 6)">
          <path
            d="M 125 15
               C 128 8, 140 8, 145 18
               C 148 24, 156 28, 160 36
               C 164 42, 174 48, 178 56
               C 185 64, 198 66, 202 76
               C 206 86, 218 90, 222 100
               C 225 110, 214 118, 208 126
               C 200 136, 192 150, 182 168
               C 174 180, 162 190, 150 196
               C 144 185, 136 170, 128 152
               C 118 132, 106 115, 96 102
               C 88 86, 80 72, 74 62
               C 68 52, 54 45, 60 35
               C 64 25, 78 22, 82 12
               C 85 4, 98 2, 106 0
               Z"
            fill="rgba(0, 150, 255, 0.05)"
            stroke="#00D9FF"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
            className="drop-shadow-[0_0_10px_rgba(0,217,255,0.6)]"
          />

          <g stroke="rgba(0, 217, 255, 0.4)" strokeWidth="0.8">
            <line x1="130" y1="32" x2="88" y2="78" />
            <line x1="130" y1="32" x2="185" y2="72" />
            <line x1="88" y1="78" x2="140" y2="122" />
            <line x1="185" y1="72" x2="140" y2="122" />
            <line x1="88" y1="78" x2="72" y2="112" />
            <line x1="72" y1="112" x2="140" y2="122" />
            <line x1="140" y1="122" x2="120" y2="175" />
            <line x1="140" y1="122" x2="160" y2="155" />
            <line x1="185" y1="72" x2="205" y2="102" />
            <line x1="205" y1="102" x2="140" y2="122" />
            <line x1="140" y1="122" x2="290" y2="100" stroke="rgba(255, 34, 68, 0.4)" strokeDasharray="3 2" />
            <line x1="185" y1="72" x2="290" y2="100" stroke="rgba(255, 34, 68, 0.3)" strokeDasharray="3 2" />
          </g>

          {[
            { cx: 130, cy: 32 },
            { cx: 88, cy: 78 },
            { cx: 72, cy: 112 },
            { cx: 185, cy: 72 },
            { cx: 120, cy: 175 },
            { cx: 160, cy: 155 },
            { cx: 205, cy: 102 },
            { cx: 105, cy: 52 },
            { cx: 150, cy: 68 },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r="2" fill="#00F0FF" className="animate-pulse" />
              <circle cx={pt.cx} cy={pt.cy} r="4.5" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="0.8" />
            </g>
          ))}

          {[
            { cx: 160, cy: 92 },
            { cx: 108, cy: 132 },
            { cx: 140, cy: 122 },
          ].map((pt, i) => (
            <g key={i}>
              <circle cx={pt.cx} cy={pt.cy} r="2.5" fill="#FF2244" />
              <circle cx={pt.cx} cy={pt.cy} r="6.5" stroke="rgba(255, 34, 68, 0.6)" strokeWidth="1" className="animate-ping" />
            </g>
          ))}
        </g>

        {/* ── 2. RIGHT SIDE: EXACT CONCENTRIC RED RADAR SONAR ── */}
        <g transform="translate(300, 100)">
          <line x1="-90" y1="0" x2="90" y2="0" stroke="rgba(255, 34, 68, 0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="0" y1="-90" x2="0" y2="90" stroke="rgba(255, 34, 68, 0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="-60" y1="-60" x2="60" y2="60" stroke="rgba(255, 34, 68, 0.2)" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="-60" y1="60" x2="60" y2="-60" stroke="rgba(255, 34, 68, 0.2)" strokeWidth="0.6" strokeDasharray="2 2" />

          <circle cx="0" cy="0" r="18" fill="none" stroke="#FF2244" strokeWidth="1.2" opacity="0.9" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="#FF2244" strokeWidth="1.0" opacity="0.75" />
          <circle cx="0" cy="0" r="56" fill="none" stroke="#FF2244" strokeWidth="0.8" opacity="0.55" />
          <circle cx="0" cy="0" r="76" fill="none" stroke="#FF2244" strokeWidth="0.6" opacity="0.35" />
          <circle cx="0" cy="0" r="95" fill="none" stroke="#FF2244" strokeWidth="0.4" opacity="0.2" />

          <circle cx="0" cy="0" r="45" fill="none" stroke="#FF2244" strokeWidth="1.5" className="animate-ping" opacity="0.75" />

          <circle cx="0" cy="0" r="12" fill="rgba(255, 34, 68, 0.4)" className="animate-pulse" />
          <circle cx="0" cy="0" r="7" fill="#FF1E4B" className="drop-shadow-[0_0_18px_#FF0033]" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>

      </svg>

    </div>
  );
};

export const LandingPage = ({ setActiveTab, navigateWithQuery, onSimulateCrash }) => {
  const { language } = useLanguage();
  const { viewMode } = useViewMode();
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState(null);

  // Exact Smart Voice Parser & Direct Output Navigator
  const handleVoiceRoute = (spokenText) => {
    if (!spokenText || !spokenText.trim()) return;
    const lower = spokenText.toLowerCase();

    // 1. Blood Requests with exact group extraction (e.g. "need O positive blood", "O- blood", "A+ blood")
    if (lower.includes('blood') || lower.includes('రక్తం') || lower.includes('खून') || lower.includes('donor') || lower.includes('positive') || lower.includes('negative') || lower.includes('o+') || lower.includes('o-') || lower.includes('a+') || lower.includes('a-') || lower.includes('b+') || lower.includes('b-') || lower.includes('ab')) {
      let group = 'O-';
      if (lower.includes('o positive') || lower.includes('o+') || lower.includes('ఓ పాజిటివ్') || lower.includes('ओ पॉजिटिव')) group = 'O+';
      else if (lower.includes('o negative') || lower.includes('o-') || lower.includes('ఓ నెగెటివ్') || lower.includes('ओ नेगेटिव')) group = 'O-';
      else if (lower.includes('a positive') || lower.includes('a+') || lower.includes('ఎ పాజిటివ్') || lower.includes('ए पॉजिटिव')) group = 'A+';
      else if (lower.includes('a negative') || lower.includes('a-') || lower.includes('ఎ నెగెటివ్') || lower.includes('ए नेगेटिव')) group = 'A-';
      else if (lower.includes('b positive') || lower.includes('b+') || lower.includes('బి పాజిటివ్') || lower.includes('बी पॉजिटिव')) group = 'B+';
      else if (lower.includes('b negative') || lower.includes('b-') || lower.includes('బి నెగెటివ్') || lower.includes('बी नेगेटिव')) group = 'B-';
      else if (lower.includes('ab positive') || lower.includes('ab+')) group = 'AB+';
      else if (lower.includes('ab negative') || lower.includes('ab-')) group = 'AB-';

      speakEmergencyInstruction(`Searching compatible ${group} blood donors. Loading live registry.`, language);
      setVoiceToast(`Matching ${group} Blood Donors...`);
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('blood', { query: spokenText, group: group, autoMatch: true });
        } else if (setActiveTab) {
          setActiveTab('blood');
        }
      }, 500);
      return;
    }

    // 2. Snakebite Triage with diagnosis
    if (lower.includes('snake') || lower.includes('పాము') || lower.includes('सांप') || lower.includes('bite') || lower.includes('cobra') || lower.includes('viper') || lower.includes('krait') || lower.includes('antivenom') || lower.includes('avs') || lower.includes('కాటు')) {
      speakEmergencyInstruction(`Starting snakebite triage for ${spokenText}. Checking antivenom stock.`, language);
      setVoiceToast(`Triaging Snakebite Alert: "${spokenText}"...`);
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('snakebite', { query: spokenText, autoTriage: true });
        } else if (setActiveTab) {
          setActiveTab('snakebite');
        }
      }, 500);
      return;
    }

    // 3. Crash & Accidents
    if (lower.includes('crash') || lower.includes('accident') || lower.includes('ప్రమాదం') || lower.includes('दुर्घटना') || lower.includes('car') || lower.includes('bike') || lower.includes('vehicle') || lower.includes('impact') || lower.includes('ambulance') || lower.includes('map')) {
      speakEmergencyInstruction('Opening Crash 3D telemetry and autonomous rescue mission.', language);
      setVoiceToast('Opening Crash Telemetry & 108 Dispatch...');
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('accident', { autoTrigger: true });
        } else if (setActiveTab) {
          setActiveTab('accident');
        }
      }, 500);
      return;
    }

    // 4. ICU & Hospital Command
    if (lower.includes('icu') || lower.includes('hospital') || lower.includes('ఆసుపత్రి') || lower.includes('अस्पताल') || lower.includes('bed') || lower.includes('command') || lower.includes('mission')) {
      speakEmergencyInstruction('Opening Mission Control Command Dashboard.', language);
      setVoiceToast('Opening Mission Control...');
      setTimeout(() => {
        setVoiceToast(null);
        if (setActiveTab) setActiveTab('dashboard');
      }, 500);
      return;
    }

    // 5. Profile & Kin
    if (lower.includes('profile') || lower.includes('contact') || lower.includes('family') || lower.includes('kin') || lower.includes('sos')) {
      speakEmergencyInstruction('Opening Profile and Family Contacts.', language);
      setVoiceToast('Opening Profile...');
      setTimeout(() => {
        setVoiceToast(null);
        if (setActiveTab) setActiveTab('auth');
      }, 500);
      return;
    }

    setVoiceToast(`Processed: "${spokenText}"`);
    setTimeout(() => {
      setVoiceToast(null);
      if (setActiveTab) setActiveTab('dashboard');
    }, 700);
  };

  const handleVoiceListen = () => {
    if (isListening) { 
      setIsListening(false); 
      return; 
    }
    setIsListening(true);
    setVoiceToast('Listening... Speak (e.g. "I need O positive blood", "Snake bite")');
    startVoiceRecognition(
      language,
      async (spokenText) => {
        setIsListening(false);
        handleVoiceRoute(spokenText);
      },
      () => {
        setIsListening(false);
        setVoiceToast(null);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const mobileContent = (
    <div className="w-full max-w-md mx-auto space-y-3.5">
      {/* ── CARD 1: AI EMERGENCY COMMANDER ── */}
      <section className="p-4 rounded-3xl bg-[#080E1C]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-wide text-white">
                AI EMERGENCY COMMANDER
              </h2>
              <p className="text-[9px] text-slate-400">
                Monitoring • Analyzing • Protecting
              </p>
            </div>
          </div>
          <span className="flex items-center space-x-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
            <span>SYSTEMS ONLINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2.5 pt-1">
          <div className="flex-1">
            <AnimatedECGWave />
          </div>
          <HolographicBrainNode />
        </div>
      </section>

      {/* ── CARD 2: 4-CARD 2x2 EMERGENCY GRID WITH ATTRACTIVE PHOTO ACCENTS ── */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveTab('accident')}
          className="card-neon-accident p-3.5 rounded-3xl text-left cursor-pointer flex flex-col justify-between space-y-2 group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <NeonAccidentIcon />
            <img src="/images/car.jpg" alt="3D Vehicle" className="w-8 h-8 rounded-xl object-cover opacity-60 border border-red-500/30 shadow-md group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white leading-tight">
              ACCIDENT<br />DETECTION
            </h3>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-red-500/20">
              <span className="text-[9px] text-slate-400 font-medium">AI Crash Alert</span>
              <span className="w-4.5 h-4.5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 text-[10px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('blood')}
          className="card-neon-blood p-3.5 rounded-3xl text-left cursor-pointer flex flex-col justify-between space-y-2 group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <NeonBloodIcon />
            <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/40">
              O- / ALL
            </span>
          </div>
          <div>
            <h3 className="text-xs font-black text-white leading-tight">
              BLOOD<br />DONATION
            </h3>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-red-500/20">
              <span className="text-[9px] text-slate-400 font-medium">Find Donors</span>
              <span className="w-4.5 h-4.5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 text-[10px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('snakebite')}
          className="card-neon-snake p-3.5 rounded-3xl text-left cursor-pointer flex flex-col justify-between space-y-2 group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <NeonSnakeIcon />
            <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/40">
              AVS AI
            </span>
          </div>
          <div>
            <h3 className="text-xs font-black text-white leading-tight">
              SNAKEBITE<br />ASSISTANT
            </h3>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-500/20">
              <span className="text-[9px] text-slate-400 font-medium">Toxin Triage AI</span>
              <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-[10px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="card-neon-medical p-3.5 rounded-3xl text-left cursor-pointer flex flex-col justify-between space-y-2 group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <NeonMedicalIcon />
            <img src="/images/aum.jpg" alt="Ambulance" className="w-8 h-8 rounded-xl object-cover opacity-60 border border-purple-500/30 shadow-md group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white leading-tight">
              MEDICAL<br />EMERGENCY
            </h3>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-500/20">
              <span className="text-[9px] text-slate-400 font-medium">Hospital Finder</span>
              <span className="w-4.5 h-4.5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-[10px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* ── CARD 3: EXACT LIVE EMERGENCY MAP WITH METRICS ── */}
      <section className="p-3.5 sm:p-4 rounded-3xl bg-[#080E1C]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-black text-xs">
            <span className="text-cyan-400 font-bold">☩</span>
            <span className="tracking-wide">LIVE EMERGENCY MAP</span>
          </div>
          <span className="flex items-center space-x-1 text-[8px] font-black text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE</span>
          </span>
        </div>

        <ExactLiveEmergencyMap />

        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          <div className="bg-[#040814] p-1.5 rounded-xl border border-white/[0.06] text-center">
            <Car className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-white">108</div>
            <div className="text-[7.5px] text-slate-400 font-medium leading-none mt-0.5">Rescue Units</div>
          </div>

          <div className="bg-[#040814] p-1.5 rounded-xl border border-white/[0.06] text-center">
            <Hospital className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-white">254</div>
            <div className="text-[7.5px] text-slate-400 font-medium leading-none mt-0.5">Hospitals</div>
          </div>

          <div className="bg-[#040814] p-1.5 rounded-xl border border-white/[0.06] text-center">
            <Users className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-white">12.8K</div>
            <div className="text-[7.5px] text-slate-400 font-medium leading-none mt-0.5">Volunteers</div>
          </div>

          <div className="bg-[#040814] p-1.5 rounded-xl border border-white/[0.06] text-center">
            <Bell className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-white">3.6K</div>
            <div className="text-[7.5px] text-slate-400 font-medium leading-none mt-0.5">Active Alerts</div>
          </div>
        </div>
      </section>

      {/* ── CARD 4: VOICE ASSISTANT WITH EQUALIZER WAVE (BELOW LIVE MAP) ── */}
      <section className="card-voice-assistant p-3.5 sm:p-4 rounded-3xl space-y-1.5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-[11px] font-black text-white uppercase tracking-wider">
              VOICE ASSISTANT
            </h3>
            <div className="h-5 flex items-center space-x-1 py-0.5">
              {[6, 12, 16, 9, 20, 14, 22, 11, 18, 13, 19, 10, 17, 12, 7].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-purple-500 transition-all duration-200"
                  style={{
                    height: isListening ? `${h * 1.1}px` : `${h * 0.65}px`,
                    animation: isListening ? `pulse 0.8s ease-in-out infinite ${i * 0.05}s` : 'none'
                  }}
                />
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-medium">
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </p>
          </div>

          <button
            onClick={handleVoiceListen}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-600 shadow-red-600/60 animate-pulse ring-4 ring-red-500/30'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-purple-600/40 hover:scale-105 active:scale-95'
            }`}
            aria-label="Voice Assistant Microphone"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full min-h-[90vh] pb-28 pt-2 px-2 sm:px-4 font-sans"
    >
      {voiceToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0A1828]/95 border border-cyan-500/60 text-cyan-300 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center space-x-2 animate-bounce backdrop-blur-xl">
          <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="truncate max-w-[260px]">{voiceToast}</span>
        </div>
      )}

      {viewMode === 'desktop' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
          {/* Desktop Left Showcase Panel (Fills vertical height cleanly) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Header branding */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-red-500/30 border border-red-400/40">
                <Shield className="w-6 h-6 fill-white/20 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-2xl tracking-tight text-white font-sans">
                    RESQ<span className="text-red-500">ONE</span>
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow">
                    AI+
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  AI-Powered Emergency Intelligence
                </p>
              </div>
            </div>

            {/* 1. Background Animation Showcase */}
            <div className="p-5 rounded-3xl bg-[#080E1C]/80 border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-xs font-black tracking-wider text-cyan-400 uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>BACKGROUND ANIMATION</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>LIVE INDIA NETWORK</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-4.5">
                    Pulsing connection between citizens, hospitals, donors and rescue units.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>PARTICLE FLOW</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-4.5">
                    Real-time data particles flow across the network.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>EMERGENCY PULSES</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-4.5">
                    Red pulses highlight live incidents and alerts.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>ECG WAVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-4.5">
                    Heartbeat line represents our mission to save lives.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Key Capabilities */}
            <div className="p-5 rounded-3xl bg-[#080E1C]/80 border border-white/[0.08] shadow-2xl space-y-3.5">
              <div className="flex items-center space-x-2 text-xs font-black tracking-wider text-cyan-400 uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>KEY CAPABILITIES</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Activity, title: 'Real-time Detection', desc: 'AI detects emergencies in real-time.', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
                  { icon: Zap, title: 'Instant Response', desc: 'Nearby units & hospitals get instant alerts.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
                  { icon: MapPin, title: 'Live Tracking', desc: 'Track ambulances & rescue units live.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                  { icon: Droplet, title: 'Smart Matching', desc: 'Find compatible blood donors quickly.', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
                  { icon: Mic, title: 'Voice Assistant', desc: 'Talk in your language, we are here to help.', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                  { icon: WifiOff, title: 'Offline Support', desc: 'Works offline, runs when network returns.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="p-3 rounded-2xl bg-[#050A14] border border-white/[0.06] space-y-1.5">
                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center ${f.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-white leading-tight">{f.title}</div>
                      <p className="text-[10px] text-slate-400 leading-snug">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Bottom Gap Filler: Live Multi-Agency Telemetry & Rescue Squad Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#140816] via-[#0C1224] to-[#08101E] border border-white/[0.1] shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                    <Shield className="w-5 h-5 fill-red-400/20 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">One App. One Mission.</h4>
                    <p className="text-xs text-red-300 font-semibold">Saving Lives, Together.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>24/7 ACTIVE MESH</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.08]">
                <div className="p-2 rounded-xl bg-[#050A14] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">108 SQUADS</span>
                  <strong className="text-xs font-black text-white">108 UNITS</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#050A14] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">COLD-CHAIN</span>
                  <strong className="text-xs font-black text-rose-400">42 HUBS</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#050A14] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">AVS DEPOTS</span>
                  <strong className="text-xs font-black text-emerald-400">38 READY</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#050A14] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">LATENCY</span>
                  <strong className="text-xs font-black text-cyan-400">&lt; 15ms</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Desktop Right Panel (The Mobile App Screen) */}
          <div className="lg:col-span-5 w-full">
            {mobileContent}
          </div>

          {/* Centered Voice Assistant Bar at the Bottom Middle of Desktop Page */}
          <div className="lg:col-span-12 w-full max-w-4xl mx-auto mt-2">
            <div className="card-voice-assistant p-4 sm:p-5 rounded-3xl space-y-2.5 shadow-2xl border border-cyan-500/30 bg-[#080E1C]/95 backdrop-blur-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                      <span>VOICE EMERGENCY COMMANDER</span>
                      <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        AI NLP ACTIVE
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Speak hands-free in your language (e.g. "I need O+ blood", "Snake bite triage", "Crash 3D")
                    </p>
                  </div>
                </div>

                {/* Equalizer Frequency Visualization */}
                <div className="flex-1 max-w-xs h-7 flex items-center justify-center space-x-1.5 px-3">
                  {[8, 16, 24, 12, 28, 18, 30, 14, 26, 18, 28, 12, 24, 16, 8, 14, 22, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-200"
                      style={{
                        height: isListening ? `${h * 1.1}px` : `${h * 0.55}px`,
                        animation: isListening ? `pulse 0.8s ease-in-out infinite ${i * 0.04}s` : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Voice Action Button */}
                <button
                  onClick={handleVoiceListen}
                  className={`px-5 py-2.5 rounded-2xl flex items-center space-x-2 text-white font-bold text-xs shadow-xl transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isListening
                      ? 'bg-red-600 shadow-red-600/60 animate-pulse ring-4 ring-red-500/30'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-purple-600/40 hover:scale-105'
                  }`}
                  aria-label="Voice Assistant Microphone"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isListening ? 'Listening... Speak' : 'Tap to Speak'}</span>
                </button>
              </div>

              {/* Quick Sample Voice Prompts */}
              <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.08] overflow-x-auto text-[10px]">
                <span className="text-slate-400 font-mono shrink-0">Try saying:</span>
                <button 
                  onClick={() => handleVoiceRoute("I need O positive blood")}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  🩸 "I need O positive blood"
                </button>
                <button 
                  onClick={() => handleVoiceRoute("Russell's viper snake bite")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  🐍 "Russell's viper snake bite"
                </button>
                <button 
                  onClick={() => handleVoiceRoute("Accident crash 3D")}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  🚗 "Crash 3D Telemetry"
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        mobileContent
      )}
    </motion.div>
  );
};
