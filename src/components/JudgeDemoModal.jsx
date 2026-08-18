import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Play, CheckCircle2, ShieldAlert, Sparkles, HelpCircle, FileText, Zap, ChevronRight, Activity, Droplet, Car } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useLanguage } from '../context/LanguageContext';

export const JudgeDemoModal = ({ isOpen, onClose, setActiveTab, onSimulateCrash }) => {
  const { isDemoMode, toggleDemoMode, PRESET_SCENARIOS } = useDemo();
  const { setLanguage } = useLanguage();
  const [activeTab, setModalTab] = useState('scenarios'); // 'scenarios' | 'script' | 'qa'

  if (!isOpen) return null;

  const handleRunScenario = (scenarioKey, targetAppTab) => {
    setActiveTab(targetAppTab);
    onClose();
  };

  const handleRunCrashDemo = () => {
    if (onSimulateCrash) {
      onSimulateCrash();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-red-950/90 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-white tracking-wide">
                    RESQONE AI+ — Prototype Judge Presentation Hub
                  </h3>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    LIVE DEMO SUITE
                  </span>
                </div>
                <p className="text-xs text-amber-300/80">
                  Interactive 1-tap scenarios, timed pitch script & judge technical Q&A
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs inside Modal */}
          <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800 flex space-x-2">
            <button
              onClick={() => setModalTab('scenarios')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'scenarios'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1-Tap Demo Scenarios</span>
            </button>

            <button
              onClick={() => setModalTab('script')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'script'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>3-Min Pitch Script</span>
            </button>

            <button
              onClick={() => setModalTab('qa')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'qa'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Judge Q&A Sheet</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-200 leading-relaxed">
                  <strong>💡 How to use during evaluation:</strong> Click any scenario button below to jump straight to that interactive feature with pre-filled telemetry, transparent AI reasoning, and video dispatch.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Scenario 1: Crash */}
                  <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-red-500 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                          <Car className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-red-950 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                          AUTO SENSOR ACCIDENT
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Multi-Signal Highway Crash Detection
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Simulates 18.4G impact trigger, audio impact spike, 30s SOS countdown, auto-contacting contacts & hospital dispatch.
                      </p>
                    </div>
                    <button
                      onClick={handleRunCrashDemo}
                      className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Trigger Crash Auto-Detection</span>
                    </button>
                  </div>

                  {/* Scenario 2: Snakebite */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                          AI SPECIES IDENTIFIER
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Cobra Snakebite Emergency & Antivenom
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Spectacled Cobra triage, neurotoxic risk calculation, WHO first aid guide & Victoria Hospital Antivenom (AVS) reservation.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunScenario('snakebite', 'snakebite')}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Run Snakebite Triage Demo</span>
                    </button>
                  </div>

                  {/* Scenario 3: Blood Match */}
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-amber-500 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                          <Droplet className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          ABO/RH MATCHING
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Critical O- Universal Blood Shortage
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Medical compatibility matrix filters compatible donors, ranks by GPS distance & simulates emergency blood courier drone.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunScenario('blood', 'blood')}
                      className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Run Blood Donor Match Demo</span>
                    </button>
                  </div>

                  {/* Scenario 4: Copilot AI */}
                  <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-indigo-500 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                          VOICE & NLP TRIAGE
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        AI Emergency Copilot Multilingual Triage
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Natural language text/voice triage with 94.5% confidence score, transparent reasoning card, and scroll-scrubbed ambulance video.
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunScenario('copilot', 'copilot')}
                      className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Open Flagship Copilot Triage</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="border border-red-500/30 bg-red-950/20 p-4 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-red-400 text-sm flex items-center justify-between">
                    <span>⏱️ Step 1: The Problem & Vision (30 seconds)</span>
                    <span className="text-[10px] bg-red-900/80 px-2 py-0.5 rounded-full text-white font-mono">0:00 - 0:30</span>
                  </h4>
                  <p className="italic text-slate-300">
                    "Judges, in a medical emergency — whether it's a snakebite, a highway crash, or a severe blood shortage — seconds determine survival. Right now, victims waste precious time toggling between separate apps for blood, SOS alerts, and ambulances. <strong>RESQONE AI+</strong> unifies these into one AI-powered, offline-first emergency ecosystem."
                  </p>
                </div>

                <div className="border border-amber-500/30 bg-amber-950/20 p-4 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-amber-400 text-sm flex items-center justify-between">
                    <span>🤖 Step 2: Flagship AI Triage & Explainability (1.5 mins)</span>
                    <span className="text-[10px] bg-amber-900/80 px-2 py-0.5 rounded-full text-white font-mono">0:30 - 2:00</span>
                  </h4>
                  <p className="italic text-slate-300">
                    "Let's click <strong>AI Emergency Copilot</strong>. When a victim speaks or types an emergency in English, Telugu, or Hindi, our NLP model classifies the severity level, calculates a confidence score, and displays an <strong>AI Explainability Card</strong> explaining <em>why</em> this severity was assigned. It automatically reserves ICU beds and alerts emergency contacts."
                  </p>
                </div>

                <div className="border border-emerald-500/30 bg-emerald-950/20 p-4 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-emerald-400 text-sm flex items-center justify-between">
                    <span>📹 Step 3: Scroll-Scrubbed Journey & Specialized Modules (1 min)</span>
                    <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded-full text-white font-mono">2:00 - 3:00</span>
                  </h4>
                  <p className="italic text-slate-300">
                    "As you scroll down, observe our scroll-scrubbed 3D dispatch journey video — moving smoothly in sync with page position! In <strong>Snakebite AI</strong>, we identify species (Spectacled Cobra vs Russell's Viper) and pinpoint active antivenom stock. In <strong>Blood Donor Matching</strong>, we enforce medical ABO/Rh compatibility rules and rank donors by GPS proximity."
                  </p>
                </div>

                <div className="border border-indigo-500/30 bg-indigo-950/20 p-4 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-indigo-400 text-sm flex items-center justify-between">
                    <span>📡 Step 4: Mission Control & Offline Sync (30 seconds)</span>
                    <span className="text-[10px] bg-indigo-900/80 px-2 py-0.5 rounded-full text-white font-mono">3:00 - 3:30</span>
                  </h4>
                  <p className="italic text-slate-300">
                    "Finally, our <strong>Mission Control Dashboard</strong> monitors ICU beds and antivenom stock across Bangalore. Even without cellular service, our offline PWA engine queues emergency reports locally and syncs automatically when reconnected. Thank you!"
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Q1: How is your AI transparent and explainable?</span>
                  <p className="text-slate-300">
                    Emergency AI cannot be a black box. Our model extracts key factors (e.g. neurotoxic symptoms, impact G-force), assigns severity tiers (1-4), displays exact confidence percentages (e.g. 94.5%), and shows human-readable reasoning cards. If confidence is &lt;65%, it flags for human operator confirmation.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Q2: How does the application function completely offline?</span>
                  <p className="text-slate-300">
                    Using Service Workers, IndexedDB, and LocalStorage, emergency data (user profiles, medical records, contacts, snakebite first aid) is stored locally. Offline SOS reports queue in IndexedDB and sync to Supabase database once connectivity is restored.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Q3: How is medical data protected?</span>
                  <p className="text-slate-300">
                    We use Supabase Row Level Security (RLS) policies. Standard users can only view public hospital data and write their own emergency reports, while sensitive emergency contacts and blood donor phone numbers are restricted via JWT claims.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Q4: What powers the live telemetry maps?</span>
                  <p className="text-slate-300">
                    Interactive maps are powered by Google Maps JS API with customized dark mode styling, real-time marker clustering for hospitals and blood donors, and animated SVG pulse rings for active dispatch vehicles.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ResQOne AI+ Prototype Version 1.0.0</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors"
            >
              Close Hub
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
