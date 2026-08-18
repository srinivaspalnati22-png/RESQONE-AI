import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import { DemoToggle } from '../components/DemoToggle';
import LiveLocationMap from '../components/LiveLocationMap';
import { CommandCore } from '../components/CommandCore';
import { AmbulanceMissionMap } from '../components/AmbulanceMissionMap';
import { LiveHospitalResponse } from '../components/LiveHospitalResponse';
import { speakEmergencyInstruction } from '../services/audio_service';
import { 
  Bot, Mic, MicOff, Send, ShieldAlert, AlertTriangle, 
  CheckCircle2, Sparkles, Phone, Hospital as HospIcon, 
  Info, RefreshCw, Volume2, Radio, XCircle 
} from 'lucide-react';

export const EmergencyCopilotPage = ({ setActiveTab }) => {
  const { isDemoMode, queueOfflineReport, activeDispatch, setActiveDispatch } = useDemo();
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [aiResult, setAiResult] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [ambulanceState, setAmbulanceState] = useState('EN_ROUTE');

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        const sampleVoices = [
          "Spectacled Cobra bite on right leg near Vijayawada Krishna river bank. Swelling & dizziness.",
          "Severe car accident on NH-16 highway near Visakhapatnam bypass with trapped passenger.",
          "Urgent blood crisis: Patient requires 3 units of O- Negative blood at Vijayawada GGH."
        ];
        const randomVoice = sampleVoices[Math.floor(Math.random() * sampleVoices.length)];
        setInputText(randomVoice);
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleSelectScenario = (scenario) => {
    setInputText(scenario.text_input);
    processClassification(scenario.text_input);
  };

  const processClassification = async (textToProcess = inputText) => {
    if (!textToProcess.trim()) {
      setError("Please describe the emergency or use voice input.");
      return;
    }

    setLoading(true);
    setError(null);
    setReportSuccess(null);

    const isSnake = textToProcess.toLowerCase().includes("snake") || textToProcess.toLowerCase().includes("cobra");
    const isBlood = textToProcess.toLowerCase().includes("blood") || textToProcess.toLowerCase().includes("o-");

    const triageType = isSnake ? "SNAKEBITE" : isBlood ? "BLOOD_CRISIS" : "ACCIDENT_RESCUE";
    const triageSeverity = "CRITICAL";

    const explanation = isSnake
      ? "Classified as high-risk venomous snakebite. Immediate AVS hospital allocation and ALS antivenom transport initialized."
      : isBlood
      ? "Classified as acute hemorrhagic blood crisis. Universal donor matrix activated and component courier notified."
      : "Multi-signal vehicular trauma emergency identified. ALS rescue ambulance dispatched with hydraulic extraction tools.";

    const report = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      type: triageType,
      severity: triageSeverity,
      title: `${triageType.replace('_', ' ')}: Active Response Mission`,
      eta: "3-5 MINS",
      reason: explanation,
      ai_confidence: 96.5,
      key_factors: [
        isSnake ? "Neurotoxic venom indicators" : isBlood ? "Severe acute blood loss" : "High-speed crash impact",
        "Trauma corridor priority routing",
        "Hospital ICU bed reserved"
      ],
      hospital_name: "Government General Hospital (GGH Vijayawada)",
      hospital_phone: "+91-866-2472777"
    };

    setAiResult(report);
    setAmbulanceState('EN_ROUTE');
    queueOfflineReport(report);
    setReportSuccess("Emergency report registered & 3D CommandCore rescue mission activated!");
    speakEmergencyInstruction(`Critical ${triageType} emergency detected. Rescue mission dispatched.`);
    setLoading(false);
  };

  const handleResetEmergency = () => {
    setAiResult(null);
    setReportSuccess(null);
    setActiveDispatch({
      active: false,
      ambulanceState: 'AVAILABLE',
      hospitalCoords: { lat: 16.5167, lng: 80.6500 },
      userCoords: { lat: 16.5180, lng: 80.6520 }
    });
  };

  const hasActiveEmergency = !!aiResult || activeDispatch?.active;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6"
    >
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-950/80">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>AI Emergency Copilot & 3D Command</span>
              <span className="text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full uppercase">
                {hasActiveEmergency ? 'EMERGENCY ACTIVE' : 'STANDBY READY'}
              </span>
            </h2>
            <p className="text-xs text-slate-300">Natural language incident triage & 5-orbit neural dispatch</p>
          </div>
        </div>
      </div>

      {/* Preset Demo Scenarios */}
      <DemoToggle onSelectScenario={handleSelectScenario} />

      {/* Input Panel with Dark Glassmorphism */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-red-500/30 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Describe Incident (Voice or Text)</span>
          </label>

          {hasActiveEmergency && (
            <button
              onClick={handleResetEmergency}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold px-3 py-1 bg-red-950/60 rounded-xl border border-red-800/60 cursor-pointer transition-all flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset Emergency Standby</span>
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'Cobra bit my leg near Vijayawada Krishna river bank' or 'Severe car crash on NH-16 highway'"
            className="w-full bg-[#050A14] border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner"
          />
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs bg-slate-900 px-2.5 py-1 rounded-md min-h-[34px] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-full sm:w-1/2 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border min-h-[46px] cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-950'
                : 'bg-[#050A14] hover:bg-slate-900 text-slate-200 border-slate-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white animate-spin" />
                <span>Listening to Audio...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-red-400" />
                <span>Tap for Voice Call Input</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => processClassification()}
            className="w-full sm:w-1/2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-red-950 transition-all text-xs border border-amber-300/60 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Evaluating AI Triage...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>TRIAGE & LAUNCH MISSION</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/90 border border-red-800 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {reportSuccess && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{reportSuccess}</span>
          </div>
        )}
      </div>

      {/* 3D CommandCore & 3D ALS Rescue Mission — RENDERED ONLY WHEN EMERGENCY IS ACTIVE */}
      <AnimatePresence>
        {hasActiveEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Active Emergency Callout Banner */}
            <div className="p-4 bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border border-red-500/60 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-2xl">
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    ⚠️ Active Emergency Mission Triggered: {aiResult?.type?.replace('_', ' ') || 'RESCUE DISPATCH'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Target Facility: <span className="font-bold text-white">{aiResult?.hospital_name || 'Government General Hospital (GGH)'}</span> • 3D Telemetry Orchestrating Live
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetEmergency}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Close 3D Mission View
              </button>
            </div>

            {/* Live Hospital Response & Stream matching Video Scenarios */}
            <LiveHospitalResponse
              emergencyType={aiResult?.type || 'ACCIDENT_RESCUE'}
              hospitalName={aiResult?.hospital_name || "Government General Hospital (GGH Vijayawada)"}
              hospitalPhone={aiResult?.hospital_phone || "+91-866-2472777"}
              etaMinutes={aiResult ? 4 : 6}
              onClose={handleResetEmergency}
            />

            {/* 3D CommandCore Neural Orchestrator */}
            <CommandCore 
              activeEmergency={aiResult}
              ambulanceState={ambulanceState}
            />

            {/* State-Driven Ambulance Mission Route */}
            <AmbulanceMissionMap
              state={ambulanceState}
              onStateChange={setAmbulanceState}
              hospitalName={aiResult?.hospital_name || "Government General Hospital (GGH Vijayawada)"}
              hospitalPhone={aiResult?.hospital_phone || "+91-866-2472777"}
              etaMinutes={aiResult ? 4 : 6}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Map Telemetry Grid */}
      <LiveLocationMap />

    </motion.div>
  );
};
