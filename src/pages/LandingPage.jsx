import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Droplet, Activity, Hospital,
  Sparkles, Car,
  Shield, ChevronRight,
  MapPin, Volume2,
  Zap, AlertTriangle,
  Mic, Bell, Users, WifiOff, CheckCircle,
  Search, ArrowRight, Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useViewMode } from '../context/ViewModeContext';
import { startVoiceRecognition } from '../services/voice_service';
import { speakEmergencyInstruction } from '../services/audio_service';
import { HomepageLiveMap } from '../components/HomepageLiveMap';

// ─── ANIMATED COUNTER ───────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── FLOATING ORB ────────────────────────────────────────────────────────────
const FloatingOrb = ({ style, color = '#00F0FF', size = 6, delay = 0 }) => (
  <div className="absolute rounded-full pointer-events-none" style={{
    width: size, height: size, background: color,
    boxShadow: `0 0 ${size * 3}px ${color}`,
    animation: `floatOrb ${3 + delay}s ease-in-out infinite ${delay}s`,
    ...style,
  }} />
);

// ─── ANIMATED ECG WAVE ───────────────────────────────────────────────────────
const AnimatedECGWave = ({ color = '#FF2244', height = 32 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = height;
    let offset = 0, raf;
    let isVisible = true;
    const handleVis = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVis);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!isVisible) return;
      offset += 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 3) {
        const m = (x + offset) % 140;
        const cy = canvas.height / 2;
        let y = cy;
        if (m >= 36 && m < 42) y = cy + ((m - 36) / 6) * 4;
        else if (m >= 42 && m < 52) y = cy - Math.sin(((m - 42) / 10) * Math.PI) * 13;
        else if (m >= 52 && m < 60) y = cy + Math.sin(((m - 52) / 8) * Math.PI) * 5;
        else if (m >= 76 && m < 100) y = cy - Math.sin(((m - 76) / 24) * Math.PI) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      ctx.shadowColor = color; ctx.shadowBlur = 6;
      ctx.stroke();
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [color, height]);
  return <canvas ref={canvasRef} className="w-full block" style={{ height }} />;
};

// ─── HOLOGRAPHIC BRAIN NODE ──────────────────────────────────────────────────
const BrainNode = () => (
  <div className="relative w-10 h-10 rounded-2xl bg-[#061226] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
    <span className="absolute -inset-1 rounded-2xl border border-cyan-400/25 animate-pulse pointer-events-none" />
    <svg className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
    </svg>
  </div>
);

// ─── FEATURE CARD (with image) ───────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, image, title, desc, color, onClick, badge, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      className="relative rounded-2xl text-left overflow-hidden group w-full cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${color}14 0%, rgba(8,14,24,0.92) 100%)`, border: `1px solid ${color}35` }}
    >
      {image && (
        <div className="relative h-24 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, rgba(8,14,24,0.95) 100%)` }} />
          {badge && (
            <span className="absolute top-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full backdrop-blur-sm"
              style={{ background: `${color}30`, border: `1px solid ${color}50`, color }}>{badge}</span>
          )}
        </div>
      )}
      <div className="p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black text-white">{title}</div>
          <div className="text-[8px] text-slate-400 mt-0.5">{desc}</div>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: `${color}80` }} />
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 20px ${color}15` }} />
    </motion.button>
  );
};

// ─── STAT PILL ───────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label, color, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.85 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.45, ease: 'backOut' }}
      className="flex flex-col items-center p-2.5 rounded-xl text-center"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
      <Icon className="w-3.5 h-3.5 mb-1" style={{ color }} />
      <div className="text-sm font-black text-white"><AnimatedCounter target={value} suffix={suffix} /></div>
      <div className="text-[8px] text-slate-400 font-medium mt-0.5 leading-tight">{label}</div>
    </motion.div>
  );
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export const LandingPage = ({ setActiveTab, navigateWithQuery, onSimulateCrash }) => {
  const { language, t } = useLanguage();
  const { viewMode } = useViewMode();
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState(null);
  const [typedInput, setTypedInput] = useState('');

  // Intelligent Multi-Sector AI Emergency Triage Router
  const handleVoiceRoute = (text) => {
    if (!text?.trim()) return;
    const l = text.toLowerCase();

    // 1. BLOOD SECTOR ANALYSIS (Multi-language keywords)
    const isBlood = 
      l.includes('blood') || l.includes('donor') || l.includes('platelet') || l.includes('transfusion') ||
      l.includes('రక్తం') || l.includes('రక్తదాత') || l.includes('రక్త') ||
      l.includes('खून') || l.includes('रक्त') || l.includes('रक्तदाता') ||
      l.includes('ரத்தம்') || l.includes('ரத்த') || l.includes('ರಕ್ತ') ||
      ['o+','o-','a+','a-','b+','b-','ab+','ab-'].some(g => l.includes(g));

    if (isBlood) {
      let group = 'O-';
      if (l.includes('o+') || l.includes('o positive') || l.includes('ఓ పాజిటివ్') || l.includes('ओ पॉजिटिव')) group = 'O+';
      else if (l.includes('a+') || l.includes('a positive') || l.includes('ఏ పాజిటివ్') || l.includes('ए पॉजिटिव')) group = 'A+';
      else if (l.includes('a-') || l.includes('a negative') || l.includes('ఏ నెగటివ్')) group = 'A-';
      else if (l.includes('b+') || l.includes('b positive') || l.includes('బి పాజిటివ్') || l.includes('बी पॉजिटिव')) group = 'B+';
      else if (l.includes('b-') || l.includes('b negative') || l.includes('బి నెగటివ్')) group = 'B-';
      else if (l.includes('ab+') || l.includes('ab positive') || l.includes('ఏబీ పాజిటివ్')) group = 'AB+';
      else if (l.includes('ab-') || l.includes('ab negative') || l.includes('ఏబీ నెగటివ్')) group = 'AB-';

      const audioMsg = language === 'te' 
        ? `రక్త అత్యవసర విభాగాన్ని గుర్తించాము. ${group} రక్త నిల్వలు మరియు సమీప బ్లడ్ బ్యాంక్‌లను శోధిస్తున్నాము.`
        : language === 'hi'
        ? `रक्त आपातकाल सेक्टर की पहचान की गई। ${group} रक्त दाताओं और ब्लड बैंकों की खोज की जा रही है।`
        : `Blood emergency sector identified. Searching ${group} blood donors and regional blood banks.`;
      speakEmergencyInstruction(audioMsg, language);

      setVoiceToast(`🩸 Sector: Blood Bank & Donors • Matching ${group} Units...`);
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('blood', { group, query: text, autoMatch: true });
        } else {
          setActiveTab?.('blood');
        }
      }, 700);
      return;
    }

    // 2. SNAKEBITE SECTOR ANALYSIS (Multi-language keywords)
    const isSnake = 
      l.includes('snake') || l.includes('bite') || l.includes('cobra') || l.includes('viper') || l.includes('krait') ||
      l.includes('antivenom') || l.includes('avs') || l.includes('venom') ||
      l.includes('పాము') || l.includes('పాముకాటు') || l.includes('త్రాచు') || l.includes('కట్లపాము') || l.includes('రక్తపింజర') || l.includes('విషం') ||
      l.includes('सांप') || l.includes('सर्पदंश') || l.includes('कोबरा') || l.includes('जहर') ||
      l.includes('பாம்பு') || l.includes('பாம்புக்கடி') || l.includes('ಹಾವು');

    if (isSnake) {
      let species = 'Spectacled Cobra';
      if (l.includes('viper') || l.includes('రక్తపింజర') || l.includes('वाइपर')) species = "Russell's Viper";
      else if (l.includes('krait') || l.includes('కట్లపాము') || l.includes('करैत')) species = "Common Krait";
      else if (l.includes('saw') || l.includes('చిన్న రక్తపింజర')) species = "Saw-scaled Viper";
      else if (l.includes("don't know") || l.includes("dont know") || l.includes("unknown") || l.includes("తెలియదు") || l.includes("पता नहीं")) species = "Unknown Snake";

      const audioMsg = language === 'te'
        ? `పాముకాటు అత్యవసర విభాగాన్ని గుర్తించాము. యాంటీవెనమ్ నిల్వలు ఉన్న సమీప ఆసుపత్రులను కేటాయిస్తున్నాము.`
        : language === 'hi'
        ? `सर्पदंश आपातकाल सेक्टर की पहचान की गई। एंटीवेनम वाले निकटतम अस्पतालों का आवंटन किया जा रहा है।`
        : `Snakebite emergency sector identified. Locating hospitals with polyvalent antivenom stocks.`;
      speakEmergencyInstruction(audioMsg, language);

      setVoiceToast(`🐍 Sector: Snakebite Antivenom • Triaging ${species}...`);
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('snakebite', { species, query: text, autoTriage: true });
        } else {
          setActiveTab?.('snakebite');
        }
      }, 700);
      return;
    }

    // 3. VEHICLE CRASH & ACCIDENT SECTOR ANALYSIS
    const isAccident = 
      l.includes('crash') || l.includes('accident') || l.includes('collision') || l.includes('ambulance') || l.includes('108') ||
      l.includes('highway') || l.includes('trapped') || l.includes('fracture') ||
      l.includes('ప్రమాదం') || l.includes('దుర్ఘటన') || l.includes('యాక్సిడెంట్') || l.includes('ఆంబులెన్స్') ||
      l.includes('दुर्घटना') || l.includes('हादसा') || l.includes('एम्बुलेंस') ||
      l.includes('விபத்து') || l.includes('ಅಪಘಾತ');

    if (isAccident) {
      const audioMsg = language === 'te'
        ? `వాహన ప్రమాద విభాగాన్ని గుర్తించాము. 108 ఆంబులెన్స్ మరియు లైవ్ సెన్సార్ మ్యాపింగ్ ప్రారంభిస్తున్నాము.`
        : language === 'hi'
        ? `सड़क दुर्घटना सेक्टर की पहचान की गई। 108 एम्बुलेंस और लाइव सेंसर मैपिंग शुरू की जा रही है।`
        : `Vehicle crash sector identified. Opening 3D crash triage and 108 ALS rescue routing.`;
      speakEmergencyInstruction(audioMsg, language);

      setVoiceToast(`🚗 Sector: Vehicle Crash Rescue • Activating 108 CAD...`);
      setTimeout(() => {
        setVoiceToast(null);
        if (navigateWithQuery) {
          navigateWithQuery('accident', { autoTrigger: true, query: text });
        } else {
          setActiveTab?.('accident');
        }
      }, 700);
      return;
    }

    // 4. MULTI-AGENCY CAD / SOS SECTOR
    const audioMsg = language === 'te' 
      ? `కమాండ్ సెంటర్ ప్రారంభించబడింది: ${text}` 
      : language === 'hi'
      ? `कमांड सेंटर खोला जा रहा है: ${text}`
      : `Opening Multi-Agency Command Center for ${text}`;
    speakEmergencyInstruction(audioMsg, language);

    setVoiceToast(`📡 Sector: Multi-Agency CAD • Processing: "${text}"`);
    setTimeout(() => {
      setVoiceToast(null);
      setActiveTab?.('dashboard');
    }, 700);
  };

  const handleVoiceListen = () => {
    if (isListening) { setIsListening(false); return; }
    setIsListening(true);
    setVoiceToast(t('voice_listening') || 'Listening... Speak your emergency');
    startVoiceRecognition(
      language, 
      async (tText) => { 
        setIsListening(false); 
        handleVoiceRoute(tText); 
      }, 
      () => { 
        setIsListening(false); 
        setVoiceToast(null); 
      }, 
      () => setIsListening(false)
    );
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const input = typedInput;
    setTypedInput('');
    handleVoiceRoute(input);
  };

  // ─── MOBILE LAYOUT ────────────────────────────────────────────────────────
  const mobilePage = (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        className="relative rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,34,68,0.3)' }}>
        <div className="relative h-36 overflow-hidden">
          <img src="/images/lifesaving_rescue_hero.jpg" alt="Emergency Response" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080E1C] via-[#080E1C]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080E1C]/70 to-transparent" />
          <FloatingOrb style={{ top: '20%', left: '72%' }} color="#FF2244" size={5} delay={0} />
          <FloatingOrb style={{ top: '60%', left: '87%' }} color="#00F0FF" size={4} delay={1} />
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 backdrop-blur-md px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span className="text-[8px] font-black text-red-300">{t('landing_live_ops')}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-3.5 h-3.5 text-white fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black text-white tracking-tight">RESQ<span className="text-red-400">ONE</span></span>
                <span className="text-[8px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black px-1.5 py-0.5 rounded">AI+</span>
              </div>
              <p className="text-[8px] text-slate-400">{t('landing_hero_tagline')}</p>
            </div>
          </div>
          <AnimatedECGWave color="#FF2244" height={22} />
        </div>
      </motion.div>

      {/* AI Commander */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}
        className="p-3 rounded-2xl bg-[#080E1C]/95 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
            <div>
              <div className="text-[10px] font-black text-white">{t('landing_ai_commander')}</div>
              <div className="text-[8px] text-slate-400">{t('landing_monitoring')}</div>
            </div>
          </div>
          <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0">
            <span>{t('landing_online')}</span><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1"><AnimatedECGWave height={26} /></div>
          <BrainNode />
        </div>
      </motion.div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-2 gap-2">
        <FeatureCard icon={Car} image="/images/crash_rescue_extraction.jpg" title={t('card_accident_title')} desc={t('card_accident_desc')} color="#FF2244" badge="AI ACTIVE" onClick={() => setActiveTab?.('accident')} delay={0.1} />
        <FeatureCard icon={Droplet} image="/images/blood_donation_hero.jpg" title={t('card_blood_title')} desc={t('card_blood_desc')} color="#FF4D6D" badge="O- / ALL" onClick={() => setActiveTab?.('blood')} delay={0.15} />
        <FeatureCard icon={AlertTriangle} image="/images/snakebite_antivenom_lab.jpg" title={t('card_snake_title')} desc={t('card_snake_desc')} color="#00E599" badge="AVS AI" onClick={() => setActiveTab?.('snakebite')} delay={0.2} />
        <FeatureCard icon={Hospital} image="/images/aum.jpg" title={t('card_medical_title')} desc={t('card_medical_desc')} color="#A855F7" badge="LIVE BEDS" onClick={() => setActiveTab?.('dashboard')} delay={0.25} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1.5">
        <StatPill icon={Car} value={108} label={t('stat_rescue_units')} color="#00F0FF" />
        <StatPill icon={Hospital} value={254} label={t('stat_hospitals')} color="#00F0FF" />
        <StatPill icon={Users} value={12800} suffix="+" label={t('stat_volunteers')} color="#00E599" />
        <StatPill icon={Bell} value={3600} suffix="+" label={t('stat_alerts')} color="#FFB300" />
      </div>

      {/* Live Map */}
      <HomepageLiveMap compact />

      {/* Interactive Emergency Voice & NLP Input Assistant */}
      <div className="card-voice-assistant p-3.5 rounded-3xl space-y-2.5 bg-[#080E1C]/95 border border-cyan-500/40 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{t('voice_assistant_title') || 'AI Emergency Voice & NLP Router'}</span>
            </div>
            <p className="text-[8px] text-slate-400">
              {isListening ? (language === 'te' ? 'వినబడుతోంది... మీ అత్యవసర పరిస్థితిని మాట్లాడండి' : 'Listening... Speak your emergency now') : (language === 'te' ? 'రక్తం, పాముకాటు లేదా ప్రమాదం గురించి మాట్లాడండి/టైప్ చేయండి' : 'Speak or type: Blood, Snakebite, or Crash')}
            </p>
          </div>

          <button onClick={handleVoiceListen}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all cursor-pointer shrink-0 ${isListening ? 'bg-red-600 animate-pulse ring-4 ring-red-500/40' : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 hover:scale-105 active:scale-95'}`}
            aria-label="Voice Assistant">
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Typed Input Bar */}
        <form onSubmit={handleTextSubmit} className="flex items-center gap-1.5 bg-[#050A14] p-1 rounded-xl border border-slate-800">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={language === 'te' ? 'ఉదా: O- రక్తం కావాలి లేదా పాముకాటు...' : 'e.g., Need O- blood, Cobra snakebite, or NH-16 Crash...'}
            className="flex-1 bg-transparent px-2.5 py-1 text-[10px] text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Quick NLP Emergency Chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          <button onClick={() => handleVoiceRoute("Need O negative blood emergency")} className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[8px] font-bold cursor-pointer">🩸 O- Blood</button>
          <button onClick={() => handleVoiceRoute("Cobra snake bite emergency near Vijayawada")} className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[8px] font-bold cursor-pointer">🐍 Snake Bite AVS</button>
          <button onClick={() => handleVoiceRoute("Car accident on highway")} className="px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[8px] font-bold cursor-pointer">🚗 108 Crash</button>
        </div>
      </div>
    </div>
  );

  // ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────
  const desktopPage = (
    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 items-start">

      {/* ══ LEFT COLUMN (8 cols) ══ */}
      <div className="col-span-8 flex flex-col gap-5">

        {/* Branding Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-xl shadow-red-500/30 border border-red-400/40">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white">RESQ<span className="text-red-500">ONE</span></span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded shadow">AI+</span>
            </div>
            <p className="text-xs text-slate-400">{t('landing_hero_tagline')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('landing_online')}</span>
          </div>
        </motion.div>

        {/* Hero Banner Image */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,34,68,0.2)' }}>
          <div className="relative h-56 overflow-hidden">
            <img src="/images/lifesaving_rescue_hero.jpg" alt="RESQONE AI Emergency Response" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#03060B]/90 via-[#03060B]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03060B]/80 to-transparent" />
            <FloatingOrb style={{ top: '22%', right: '22%' }} color="#FF2244" size={6} delay={0} />
            <FloatingOrb style={{ top: '55%', right: '38%' }} color="#00F0FF" size={4} delay={1.5} />
            <FloatingOrb style={{ top: '14%', right: '12%' }} color="#FFB300" size={3} delay={0.8} />
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/40 border border-red-500/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-[9px] font-black text-red-300 tracking-widest">{t('landing_live_ops')}</span>
            </div>
            <div className="absolute bottom-0 left-0 p-5">
              <h1 className="text-2xl font-black text-white leading-tight">
                {t('landing_hero_title')}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                {t('landing_hero_desc')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard icon={Car} image="/images/crash_rescue_extraction.jpg" title={t('card_accident_title')} desc={t('card_accident_desc')} color="#FF2244" badge="AI ACTIVE" onClick={() => setActiveTab?.('accident')} delay={0.1} />
          <FeatureCard icon={Droplet} image="/images/blood_donation_hero.jpg" title={t('card_blood_title')} desc={t('card_blood_desc')} color="#FF4D6D" badge="O- / ALL" onClick={() => setActiveTab?.('blood')} delay={0.15} />
          <FeatureCard icon={AlertTriangle} image="/images/snakebite_antivenom_lab.jpg" title={t('card_snake_title')} desc={t('card_snake_desc')} color="#00E599" badge="AVS AI" onClick={() => setActiveTab?.('snakebite')} delay={0.2} />
          <FeatureCard icon={Hospital} image="/images/aum.jpg" title={t('card_medical_title')} desc={t('card_medical_desc')} color="#A855F7" badge="LIVE BEDS" onClick={() => setActiveTab?.('dashboard')} delay={0.25} />
        </div>

      </div>

      {/* ══ RIGHT COLUMN (4 cols) — map, stats, voice only ══ */}
      <div className="col-span-4 flex flex-col gap-4 sticky top-4">

        {/* AI Commander Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="p-4 rounded-2xl bg-[#080E1C]/95 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <div>
                <div className="text-[10px] font-black text-white">{t('landing_ai_commander')}</div>
                <div className="text-[8px] text-slate-400">{t('landing_monitoring')}</div>
              </div>
            </div>
            <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {t('landing_online')} <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1"><AnimatedECGWave height={30} /></div>
            <BrainNode />
          </div>
        </motion.div>

        {/* Live Stats Grid */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-2">
          <StatPill icon={Car} value={108} label={t('stat_rescue_units')} color="#00F0FF" />
          <StatPill icon={Hospital} value={254} label={t('stat_hospitals')} color="#00F0FF" />
          <StatPill icon={Users} value={12800} suffix="+" label={t('stat_volunteers')} color="#00E599" />
          <StatPill icon={Bell} value={3600} suffix="+" label={t('stat_alerts')} color="#FFB300" />
        </motion.div>

        {/* Live Emergency Map */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <HomepageLiveMap compact />
        </motion.div>

        {/* Voice Assistant */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="card-voice-assistant p-4 rounded-3xl space-y-3 bg-[#080E1C]/95 border border-cyan-500/40 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-white uppercase tracking-wider">{t('voice_assistant_title')}</div>
              <div className="text-[8px] text-slate-400 mt-0.5">Speak hands-free in your language</div>
            </div>
            <button onClick={handleVoiceListen}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white font-bold text-[10px] shadow-lg transition-all cursor-pointer shrink-0 ${isListening ? 'bg-red-600 animate-pulse ring-2 ring-red-500/30' : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105'}`}
              aria-label="Voice">
              <Mic className="w-3 h-3" />
              <span>{isListening ? t('voice_listening') : (language === 'te' ? 'మాట్లాడండి' : language === 'hi' ? 'बोलें' : 'Speak')}</span>
            </button>
          </div>

          {/* Equalizer */}
          <div className="h-6 flex items-center gap-1 px-1">
            {[6,14,22,10,26,16,28,12,24,16,26,10,22,14,6,12,20,8].map((h, i) => (
              <div key={i} className="flex-1 rounded-full bg-gradient-to-t from-cyan-400 via-indigo-400 to-purple-500 transition-all duration-200"
                style={{ height: isListening ? `${h}px` : `${Math.max(h * 0.45, 2)}px` }} />
            ))}
          </div>

          {/* Typed Search Input */}
          <form onSubmit={handleTextSubmit} className="flex items-center gap-1.5 bg-[#050A14] p-1.5 rounded-xl border border-slate-800">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={language === 'te' ? 'ఉదా: O- రక్తం కావాలి లేదా పాముకాటు...' : 'e.g., Need O- blood, Cobra bite, or Crash...'}
              className="flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick prompts */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.08]">
            <div className="text-[8px] text-slate-400 font-mono">{t('try_saying')}</div>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => handleVoiceRoute("I need O positive blood")} className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[8px] font-medium cursor-pointer transition-colors">🩸 O+ Blood</button>
              <button onClick={() => handleVoiceRoute("Russell's viper snake bite")} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[8px] font-medium cursor-pointer transition-colors">🐍 Snake Bite</button>
              <button onClick={() => handleVoiceRoute("Accident crash")} className="px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[8px] font-medium cursor-pointer transition-colors">🚗 Crash 3D</button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full min-h-[90vh] pb-28 pt-2 px-3 sm:px-5 font-sans"
    >
      {/* Voice Sector Analysis Toast */}
      <AnimatePresence>
        {voiceToast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0A1828]/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ring-4 ring-cyan-500/20"
          >
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-md">{voiceToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'desktop' ? desktopPage : mobilePage}
    </motion.div>
  );
};
