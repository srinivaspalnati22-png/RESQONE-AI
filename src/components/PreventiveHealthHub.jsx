import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, HeartPulse, Droplet, Activity, 
  Sparkles, CheckCircle2, AlertTriangle, Info, 
  HelpCircle, Play, Pause, Volume2, ArrowRight, 
  Car, Compass, Zap, Stethoscope, Eye, Clock, Shield,
  Award, AlertOctagon, Flame, PhoneCall, ChevronRight, Check
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';
import { useLanguage } from '../context/LanguageContext';

export function PreventiveHealthHub() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('road_safety'); // 'road_safety' | 'blood_health' | 'snake_safety' | 'cpr_guide' | 'readiness_quiz'

  // Interactive Speed Braking Calculator State
  const [speedVal, setSpeedVal] = useState(60); // km/h
  const reactionDist = +(speedVal * (1.5 / 3.6)).toFixed(1); // 1.5s perception-reaction
  const brakingDist = +((speedVal * speedVal) / (2 * 9.81 * 0.7 * 3.6 * 3.6)).toFixed(1); // dry asphalt f=0.7
  const totalStopDist = +(+reactionDist + +brakingDist).toFixed(1);

  // Interactive CPR Metronome State
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [compressionCount, setCompressionCount] = useState(0);
  const metronomeIntervalRef = useRef(null);

  useEffect(() => {
    if (isMetronomeActive) {
      // 110 BPM (approx 545ms per beat)
      metronomeIntervalRef.current = setInterval(() => {
        setCompressionCount((prev) => (prev >= 30 ? 1 : prev + 1));
      }, 545);
    } else {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      setCompressionCount(0);
    }
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [isMetronomeActive]);

  // Blood Eligibility Checker State
  const [eligibility, setEligibility] = useState({
    age: true,
    weight: true,
    interval: true,
    health: true
  });
  const isFullyEligible = Object.values(eligibility).every(Boolean);

  // Home Emergency Readiness Scorecard State
  const [quizState, setQuizState] = useState({
    hasFirstAidKit: true,
    knowsBloodGroup: true,
    hasEmergencyContacts: true,
    knowsCPRBasics: false,
    hasTorchlight: true
  });

  const readinessScore = useMemo(() => {
    const total = Object.keys(quizState).length;
    const passed = Object.values(quizState).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  }, [quizState]);

  return (
    <div className="w-full bg-[#070D1A]/95 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-7 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 border border-emerald-400/50 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/60 shrink-0">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-xl font-black text-white">
                {t('hub_title') || 'Daily Safety, Health & First-Aid Readiness Hub'}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase hidden sm:inline">
                NON-EMERGENCY MODE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Interactive clinical tools and safety simulations for everyday road safety, blood health, and life-saving first-aid.
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap gap-1.5 bg-[#050A14] p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto">
          {[
            { id: 'road_safety', label: 'Road Braking', icon: Car, color: 'text-amber-400' },
            { id: 'cpr_guide', label: 'CPR 110 BPM', icon: HeartPulse, color: 'text-emerald-400' },
            { id: 'blood_health', label: 'Blood Eligibility', icon: Droplet, color: 'text-red-400' },
            { id: 'snake_safety', label: 'Snake Safety', icon: Activity, color: 'text-cyan-400' },
            { id: 'readiness_quiz', label: 'Safety Score', icon: Award, color: 'text-purple-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-lg border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Content Area */}
      <AnimatePresence mode="wait">
        
        {/* 1. Road Safety & Speed Braking Calculator */}
        {activeTab === 'road_safety' && (
          <motion.div
            key="road_safety"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Interactive Braking Distance Simulation */}
            <div className="bg-[#0B1220] p-5 sm:p-6 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Interactive Stopping Distance & Fatal Risk Zone Simulator</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Slide velocity to see how human perception-reaction delay (1.5s) compounds with mechanical tire-asphalt friction.
                  </p>
                </div>

                <div className="text-right bg-[#050A14] px-3.5 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <span className="text-2xl font-black font-mono text-amber-400">{speedVal}</span>
                  <span className="text-xs text-slate-400 font-mono ml-1">km/h</span>
                </div>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min="20"
                  max="140"
                  step="5"
                  value={speedVal}
                  onChange={(e) => setSpeedVal(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>20 km/h (School Zone)</span>
                  <span>60 km/h (City Road)</span>
                  <span>100 km/h (NH-16 Highway)</span>
                  <span>140 km/h (Fatal Zone)</span>
                </div>
              </div>

              {/* Visual Distance Breakdown Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    Total Stopping Distance: <strong className="text-white font-black">{totalStopDist} meters</strong>
                  </span>
                  <span className={`font-black ${
                    speedVal >= 100 ? 'text-red-400 animate-pulse' : speedVal >= 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {speedVal >= 100 ? '⚠️ High Fatal Probability (>85%)' : speedVal >= 60 ? '⚡ Severe Injury / Trauma Risk' : '✓ Controllable Safe Braking Zone'}
                  </span>
                </div>

                <div className="h-5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    style={{ width: `${(reactionDist / totalStopDist) * 100}%` }} 
                    className="bg-cyan-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] font-black text-slate-950 font-mono"
                    title={`Perception-Reaction Distance: ${reactionDist}m`}
                  >
                    Reaction {reactionDist}m
                  </div>
                  <div 
                    style={{ width: `${(brakingDist / totalStopDist) * 100}%` }} 
                    className="bg-amber-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] font-black text-slate-950 font-mono"
                    title={`Mechanical Braking: ${brakingDist}m`}
                  >
                    Braking {brakingDist}m
                  </div>
                </div>
              </div>
            </div>

            {/* Crucial Road Safety Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-amber-500/50 transition-colors">
                <div className="text-xs font-black text-amber-400 uppercase flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>1. The Golden Hour Law</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The initial 60 minutes post-trauma dictates patient survival. RESQONE-AI's zero-latency 25s auto-dispatch reduces notification lag from 22 minutes to under 30 seconds.
                </p>
              </div>

              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-cyan-500/50 transition-colors">
                <div className="text-xs font-black text-cyan-400 uppercase flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>2. Highway 3-Second Rule</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On expressways at night, maintain at least 3 seconds of buffer space behind heavy commercial trucks. Avoid high-beam glare in oncoming traffic.
                </p>
              </div>

              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-emerald-500/50 transition-colors">
                <div className="text-xs font-black text-emerald-400 uppercase flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>3. Certified Helmet & Belt</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ISI/DOT certified full-face helmets reduce fatal head trauma by 74%. Rear passenger seatbelts eliminate centrifugal ejection during rollovers.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Interactive CPR 110 BPM Metronome Trainer */}
        {activeTab === 'cpr_guide' && (
          <motion.div
            key="cpr_guide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Metronome Hero Card */}
            <div className="bg-[#0B1220] p-5 sm:p-6 rounded-3xl border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-emerald-400" />
                    <span>Interactive CPR Rhythm Metronome (110 BPM AHA Standard)</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Push hard and fast in the center of the chest. Maintain 100-120 compressions per minute at 5-6 cm depth.
                  </p>
                </div>

                <button
                  onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                  className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-lg min-h-[44px] ${
                    isMetronomeActive
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  }`}
                >
                  {isMetronomeActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isMetronomeActive ? 'STOP CADENCE' : 'START 110 BPM METRONOME'}</span>
                </button>
              </div>

              {/* Compression Cadence Meter */}
              {isMetronomeActive && (
                <div className="p-4 bg-[#050A14] rounded-2xl border border-emerald-500/50 flex flex-wrap items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-emerald-400 font-mono shadow-lg">
                      {compressionCount}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Compression Count: {compressionCount}/30</div>
                      <div className="text-[10px] text-emerald-300 font-mono">110 BPM Rhythm: Push Down 5-6 cm</div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-800">
                    {compressionCount >= 30 ? 'GIVE 2 RESCUE BREATHS NOW' : 'PRESS HARD & FAST'}
                  </span>
                </div>
              )}
            </div>

            {/* 4 Step Life Support Chain */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { step: '01', title: 'Check Response', desc: 'Tap shoulders firmly and shout: "Are you okay?" Check for normal chest rise & breathing.' },
                { step: '02', title: 'Call 108 / SOS', desc: 'Trigger RESQONE-AI SOS beacon or dial 108 immediately for an ALS defibrillator.' },
                { step: '03', title: '30 Compressions', desc: 'Interlock hands in the center of the breastbone. Push 5-6 cm deep at 110 BPM.' },
                { step: '04', title: 'AED Application', desc: 'Attach Automated External Defibrillator pads to bare chest; follow automated voice prompts.' }
              ].map((s) => (
                <div key={s.step} className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="text-xs font-black font-mono text-emerald-400">STEP {s.step}</div>
                  <div className="text-xs font-extrabold text-white">{s.title}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. Blood Donation & Health Habits */}
        {activeTab === 'blood_health' && (
          <motion.div
            key="blood_health"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Interactive Eligibility Checker */}
            <div className="bg-[#0B1220] p-5 sm:p-6 rounded-3xl border border-red-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-red-400" />
                  <span>Interactive Blood Donor Quick Eligibility Test</span>
                </h4>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  isFullyEligible 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {isFullyEligible ? '✓ ELIGIBLE TO DONATE' : '⚠️ REVIEW CRITERIA'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'age', label: 'Age is between 18 and 65 years' },
                  { key: 'weight', label: 'Body weight is at least 45 kg (100 lbs)' },
                  { key: 'interval', label: 'Last whole blood donation was > 90 days ago' },
                  { key: 'health', label: 'No active fever, antibiotic course, or low Hb' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setEligibility(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      eligibility[item.key]
                        ? 'bg-[#050A14] border-emerald-500/50 text-white'
                        : 'bg-[#050A14]/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold ${
                      eligibility[item.key] ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {eligibility[item.key] ? '✓' : '✕'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Benefits of Regular Donation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-red-500/50 transition-colors">
                <div className="text-xs font-black text-red-400 uppercase">Stimulates Red Cell Genesis</div>
                <p className="text-xs text-slate-300">
                  Donating 350-450ml prompts bone marrow to produce fresh red blood cells within 48 hours, improving oxygen transport and stamina.
                </p>
              </div>

              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-amber-500/50 transition-colors">
                <div className="text-xs font-black text-amber-400 uppercase">Balances Systemic Iron</div>
                <p className="text-xs text-slate-300">
                  Excess serum ferritin can stiffen arteries and stress the heart. Regular donation naturally maintains optimal iron homeostasis.
                </p>
              </div>

              <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-cyan-500/50 transition-colors">
                <div className="text-xs font-black text-cyan-400 uppercase">Full Medical Screening</div>
                <p className="text-xs text-slate-300">
                  Every donation includes automated clinical testing for Blood Group ABO/Rh, Hemoglobin, HIV, Hepatitis B/C, and Malaria.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. Snake Encounter Safety & Rural Farm Guidelines */}
        {activeTab === 'snake_safety' && (
          <motion.div
            key="snake_safety"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-[#0B1220] p-5 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-2 shadow-xl">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Agricultural & Night Safety Precautions in India</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                90% of snakebites in India occur between 5 PM and 7 AM in agricultural and rural regions. Following these WHO-standard rules prevents 85%+ of envenomations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-[#050A14] p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="text-xs font-black text-emerald-400 uppercase flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DOs — Safe Practices</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Always carry a bright LED torchlight and a ground-tapping stick when walking after dark.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Wear ankle-high rubber gumboots and heavy jeans in tall grass and farm fields.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Sleep on elevated cots with mosquito nets firmly tucked beneath the mattress.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#050A14] p-4 sm:p-5 rounded-2xl border border-red-500/30 space-y-2">
                <div className="text-xs font-black text-red-400 uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>DON'Ts — Deadly Mistakes</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>NEVER tie tight arterial tourniquets (causes severe limb necrosis & amputation).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>NEVER cut, suck venom, or apply herbal pastes / battery acid.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>DO NOT waste the Golden Hour visiting traditional faith healers. Go straight to an AVS hospital.</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. Home Emergency Readiness Scorecard */}
        {activeTab === 'readiness_quiz' && (
          <motion.div
            key="readiness_quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-[#0B1220] p-5 sm:p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Personal Emergency Readiness Scorecard</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Tap the checklist items to audit your household's emergency preparedness.
                  </p>
                </div>

                <div className="text-right bg-[#050A14] px-4 py-2 rounded-2xl border border-purple-500/40">
                  <div className="text-[10px] font-mono text-slate-400">READINESS SCORE</div>
                  <div className="text-2xl font-black font-mono text-purple-400">{readinessScore}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'hasFirstAidKit', label: 'Home First-Aid Kit with sterile bandages & antiseptic' },
                  { key: 'knowsBloodGroup', label: 'Know exact ABO/Rh blood groups for all family members' },
                  { key: 'hasEmergencyContacts', label: 'Saved 108 & nearby hospital ER numbers in phone speed dial' },
                  { key: 'knowsCPRBasics', label: 'At least 1 person in household trained in 110 BPM CPR' },
                  { key: 'hasTorchlight', label: 'Working emergency LED torchlight and backup power bank' }
                ].map((q) => (
                  <button
                    key={q.key}
                    type="button"
                    onClick={() => setQuizState(prev => ({ ...prev, [q.key]: !prev[q.key] }))}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      quizState[q.key]
                        ? 'bg-[#050A14] border-purple-500/50 text-white'
                        : 'bg-[#050A14]/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-semibold">{q.label}</span>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ml-2 ${
                      quizState[q.key] ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {quizState[q.key] ? '✓' : '✕'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
