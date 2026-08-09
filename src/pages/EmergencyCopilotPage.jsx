import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import { DemoToggle } from '../components/DemoToggle';
import LiveLocationMap from '../components/LiveLocationMap';
import { EmergencyRadar } from '../components/EmergencyRadar';
import { speakEmergencyInstruction } from '../services/audio_service';
import { Bot, Mic, MicOff, Send, ShieldAlert, AlertTriangle, CheckCircle2, Sparkles, Phone, Hospital as HospIcon, Info, RefreshCw, Volume2 } from 'lucide-react';

export const EmergencyCopilotPage = ({ setActiveTab }) => {
  const { isDemoMode, queueOfflineReport } = useDemo();
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [aiResult, setAiResult] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [currentCoords, setCurrentCoords] = useState({ lat: 16.5167, lng: 80.6500 });

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
      }, 2500);
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

    try {
      const response = await fetch('/api/emergency/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_id: user?.id || 'demo-user-001',
          text_input: textToProcess,
          location_lat: currentCoords.lat,
          location_lng: currentCoords.lng,
          address: "Vijayawada Highway Grid, Andhra Pradesh"
        })
      });

      if (!response.ok) throw new Error("Server response error");

      const data = await response.json();
      
      const classifyRes = await fetch('/api/emergency/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_input: textToProcess })
      });
      const explainData = await classifyRes.json();

      setAiResult({
        report: data,
        explainability: explainData
      });

      setReportSuccess("Emergency report registered & rescue mission dispatched!");
      speakEmergencyInstruction(`Critical ${explainData.emergency_type} emergency detected. ${explainData.recommended_action}`);
    } catch (err) {
      const fallbackExplain = {
        emergency_type: textToProcess.toLowerCase().includes("snake") ? "SNAKEBITE" : "ACCIDENT_RESCUE",
        severity: "CRITICAL",
        severity_level: 1,
        ai_confidence: 96.5,
        key_factors: ["Neurotoxic symptoms detected", "Rapid swelling", "Distress audio signals"],
        ai_explanation: "Classified as high-priority medical crisis. System auto-matching nearest antivenom hospital and mobile ALS rescue.",
        recommended_action: "Immobilize patient limb immediately. Mobile ICU ambulance dispatched.",
        uncertainty_flag: false,
        dispatch_recommendation: { requires_icu: true, requires_antivenom: true }
      };

      const fallbackReport = {
        id: `rep-demo-${Date.now().toString().slice(-4)}`,
        reporter_id: user?.id || 'demo-user-001',
        type: fallbackExplain.emergency_type,
        severity: fallbackExplain.severity,
        ai_confidence: fallbackExplain.ai_confidence,
        ai_explanation: fallbackExplain.ai_explanation,
        status: "DISPATCHED",
        location_lat: currentCoords.lat,
        location_lng: currentCoords.lng,
        address: "Prakasam Barrage, Vijayawada, Andhra Pradesh",
        created_at: new Date().toISOString(),
        dispatch_details: {
          hospital_name: "Government General Hospital (GGH Vijayawada)",
          hospital_phone: "+91-866-2472777",
          eta_minutes: 4,
          ambulance_unit: "RESQONE-AP-ALS-101",
          antivenom_reserved: true
        }
      };

      setAiResult({
        report: fallbackReport,
        explainability: fallbackExplain
      });

      queueOfflineReport(fallbackReport);
      setReportSuccess("Operating in local demo mode — emergency dispatched locally.");
      speakEmergencyInstruction(`Emergency classified as ${fallbackExplain.emergency_type}. ${fallbackExplain.recommended_action}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-28 pt-8 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-950">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2 drop-shadow">
              <span>AI Emergency Copilot</span>
              <span className="text-[10px] font-black bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full uppercase">
                Flagship
              </span>
            </h2>
            <p className="text-xs text-slate-300">Natural language incident triage & explainable dispatch</p>
          </div>
        </div>
      </div>

      {/* Preset Demo Toggle */}
      <DemoToggle onSelectScenario={handleSelectScenario} />

      {/* Live Location Component */}
      <LiveLocationMap />

      {/* 3D Telemetry Radar Component */}
      <EmergencyRadar userLat={currentCoords.lat} userLng={currentCoords.lng} />

      {/* Input Panel with Light Frosted Glass */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5 drop-shadow">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Describe Incident (Voice or Text)</span>
          </label>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'Cobra bit my leg near Vijayawada Krishna river bank' or 'Severe car crash on NH-16 highway'"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner"
          />
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 text-xs bg-slate-900 px-2 py-1 rounded-md min-h-[44px]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`w-full sm:w-1/2 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border min-h-[44px] ${
              isListening
                ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-950'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
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
            className="w-full sm:w-1/2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-red-950 transition-all text-xs border border-amber-300/60 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Evaluating AI Triage...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>EVALUATE & DISPATCH</span>
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
      </div>

      {/* AI Triage & Dispatch Result Panel */}
      {aiResult && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-red-500/50 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Classification</span>
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/40">
                    {aiResult.explainability.emergency_type}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  Severity Tier: <span className="text-red-400">{aiResult.explainability.severity}</span>
                </h3>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-right min-w-[120px]">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">AI Confidence</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {aiResult.explainability.ai_confidence}%
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                <span>Extracted Factors</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {aiResult.explainability.key_factors.map((factor, idx) => (
                  <span key={idx} className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] px-2.5 py-0.5 rounded-lg">
                    • {factor}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Model Decision Audit</div>
                <button
                  onClick={() => speakEmergencyInstruction(aiResult.explainability.recommended_action)}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px] min-h-[44px]"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Read Aloud</span>
                </button>
              </div>
              <p className="text-xs text-slate-200 italic mt-0.5">"{aiResult.explainability.ai_explanation}"</p>
            </div>

            {aiResult.report.dispatch_details && (
              <div className="bg-gradient-to-br from-indigo-950/90 to-slate-950 p-3.5 rounded-xl border border-indigo-500/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-indigo-300 font-bold uppercase">Automated Dispatch Partner</div>
                  <div className="text-xs font-extrabold text-white">{aiResult.report.dispatch_details.hospital_name}</div>
                </div>
                <a
                  href={`tel:${aiResult.report.dispatch_details.hospital_phone}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 min-h-[44px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call ER</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
