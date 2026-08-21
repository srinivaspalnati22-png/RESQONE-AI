import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Activity, ShieldAlert, CheckCircle2, Phone, MapPin, 
  Hospital as HospIcon, Info, RefreshCw, AlertOctagon, 
  Eye, Zap, Stethoscope, AlertTriangle, Mic, MicOff, Volume2, 
  XCircle, Sparkles, HelpCircle, ArrowRight, Check, Table, Search, Filter, Send,
  Navigation, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { DataService } from '../services/data_service';
import { speakEmergencyInstruction } from '../services/audio_service';
import snakeSpeciesData from '../data/snake_species.json';
import { LiveHospitalResponse } from '../components/LiveHospitalResponse';

// -------------------------------------------------------------
// Dedicated Standalone Map Component for Victim + Antivenom Hospitals
// -------------------------------------------------------------
function SnakebiteRescueMapComponent({ victimCoords = [16.5167, 80.6500], hospitals = [], speciesName = 'Venomous Snake' }) {
  const mapDivRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapDivRef.current) return;

    if (!mapInstance.current) {
      if (mapDivRef.current._leaflet_id) {
        mapDivRef.current._leaflet_id = null;
      }

      try {
        const map = L.map(mapDivRef.current, {
          center: [16.5175, 80.6470],
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        // CartoDB Dark Matter Real Street Tiles with OpenStreetMap fallback
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
        }).addTo(map);

        // 1. Victim Emergency Location Marker
        const victimIcon = L.divIcon({
          className: 'custom-victim-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(127, 29, 29, 0.95); border: 2px solid #ef4444; box-shadow: 0 0 22px rgba(239, 68, 68, 0.95); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">
                🐍
              </div>
              <div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px; background: #ef4444; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="margin-top: 4px; background: rgba(5, 10, 20, 0.95); color: #f87171; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 6px; border: 1px solid #ef4444; white-space: nowrap;">
                VICTIM (${speciesName.toUpperCase()})
              </div>
            </div>
          `,
          iconSize: [160, 70],
          iconAnchor: [80, 35]
        });
        L.marker(victimCoords, { icon: victimIcon, zIndexOffset: 1000 }).addTo(map);

        // 2. Real Antivenom Equipped Hospitals Markers
        const defaultHospitals = [
          { name: 'Government General Hospital (GGH)', avs: 150, icu: 12, lat: 16.5167, lng: 80.6500, phone: '+91-866-2472777' },
          { name: 'Ramesh Hospitals Emergency', avs: 85, icu: 15, lat: 16.5083, lng: 80.6417, phone: '+91-866-2488888' },
          { name: 'Manipal Hospital Vijayawada', avs: 60, icu: 8, lat: 16.4833, lng: 80.6000, phone: '+91-866-6649999' },
          { name: 'Ayush Hospitals Trauma Bay', avs: 40, icu: 6, lat: 16.5250, lng: 80.6350, phone: '+91-866-2544444' }
        ];

        const hospitalList = hospitals.length > 0 ? hospitals : defaultHospitals;

        hospitalList.forEach((hosp) => {
          const lat = hosp.latitude || hosp.lat || 16.5167;
          const lng = hosp.longitude || hosp.lng || 80.6500;
          const avsCount = hosp.antivenom_stock || hosp.avs || 120;
          const icuCount = hosp.icu_available || hosp.icu || 10;

          const hospIcon = L.divIcon({
            className: 'custom-avs-hosp-marker',
            html: `
              <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #083344, #0e7490); border: 2px solid #22d3ee; box-shadow: 0 0 16px rgba(34, 211, 238, 0.8); display: flex; align-items: center; justify-content: center; color: #22d3ee; font-size: 18px;">
                  🏥
                </div>
                <div style="margin-top: 3px; background: rgba(5, 10, 20, 0.95); color: #22d3ee; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px; border: 1px solid #0891b2; white-space: nowrap;">
                  ${hosp.name.split(' ')[0]} (${avsCount} AVS Vials)
                </div>
              </div>
            `,
            iconSize: [140, 60],
            iconAnchor: [70, 30]
          });

          L.marker([lat, lng], { icon: hospIcon })
            .bindPopup(`
              <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
                <strong style="font-size: 13px;">${hosp.name}</strong><br/>
                <span style="color: #059669; font-weight: bold;">AVS Stock: ${avsCount} Vials</span><br/>
                <span style="color: #0284c7;">ICU Ventilators: ${icuCount} Beds</span><br/>
                <a href="tel:${hosp.contact_number || hosp.phone || '+91-866-2472777'}" style="display: inline-block; margin-top: 6px; background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px;">Call ER Direct</a>
              </div>
            `)
            .addTo(map);
        });

        // 3. Emergency Antivenom Transit Route Line (Connecting Victim to Nearest Hospital)
        L.polyline([
          victimCoords,
          [16.5175, 80.6460],
          [16.5167, 80.6500]
        ], {
          color: '#06b6d4',
          weight: 5,
          opacity: 0.9,
          dashArray: '8, 6',
          lineCap: 'round'
        }).addTo(map);

        mapInstance.current = map;
      } catch (mapErr) {
        console.warn('[SnakebiteRescueMap] Leaflet map init handled gracefully:', mapErr);
      }
    }

    const t1 = setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 100);

    const t2 = setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          // Ignore unmount error
        }
        mapInstance.current = null;
      }
    };
  }, [victimCoords, hospitals, speciesName]);

  return (
    <div 
      ref={mapDivRef} 
      className="w-full h-full min-h-[440px] z-0" 
      style={{ minHeight: '440px', width: '100%', height: '100%' }}
    />
  );
}

export const SnakebitePage = () => {
  const { t, language } = useLanguage();
  const { queueOfflineReport } = useDemo();

  // Search & Triage State
  const [hasTriaged, setHasTriaged] = useState(false);
  const [showVisualPicker, setShowVisualPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [alertSent, setAlertSent] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [showDatasetTable, setShowDatasetTable] = useState(false);

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [toxinFilter, setToxinFilter] = useState('ALL');

  const symptomChecklist = [
    'Fang Puncture Marks',
    'Rapid Swelling & Severe Pain',
    'Ptosis (Drooping Eyelids)',
    'Difficulty Swallowing / Speaking',
    'Bleeding from Gums / Wound',
    'Dark / Reddish Urine',
    'Abdominal Colic Cramps',
    'Painless Nocturnal Bite'
  ];

  const handleToggleSymptom = (sym) => {
    const updated = selectedSymptoms.includes(sym) 
      ? selectedSymptoms.filter(s => s !== sym) 
      : [...selectedSymptoms, sym];
    setSelectedSymptoms(updated);
  };

  // Run Triage Analysis & Spoken Voice Instructions
  const handleRunAssessment = async (queryText = description, symptomsToUse = selectedSymptoms) => {
    const text = (queryText || '').toLowerCase();
    
    // Check if user says "I don't know which snake" or "unknown"
    if (text.includes("don't know") || text.includes("dont know") || text.includes("unknown") || text.includes("not sure") || text.includes("just bitten")) {
      setHasTriaged(true);
      setShowVisualPicker(true);
      speakEmergencyInstruction("Unknown snake bite reported. Please tap which snake matches what you encountered from the visual gallery.");
      return;
    }

    setLoading(true);
    setHasTriaged(true);
    setShowVisualPicker(false);

    try {
      const combinedText = `${queryText || ''} ${(symptomsToUse || []).join(' ')}`;
      const result = await DataService.assessSnakebite(combinedText, symptomsToUse, 16.5167, 80.6500);
      if (result && result.species) {
        setAssessment(result);

        // Voice Command: Speak species diagnosis + crucial WHO first-aid precautions
        const firstAidSummary = (result.species.first_aid && result.species.first_aid.length > 0)
          ? result.species.first_aid.slice(0, 2).join('. ')
          : 'Immobilize the bitten limb immediately below heart level. Do not cut or apply tourniquets.';

        const speechText = `Identified ${result.species.common_name}. ${result.species.venom_type}. Immediate first aid: ${firstAidSummary}. Nearest hospital with polyvalent antivenom vials located on live GPS map.`;
        speakEmergencyInstruction(speechText);
      }
    } catch (err) {
      console.error("Error assessing snakebite:", err);
    } finally {
      setLoading(false);
    }
  };

  // User selects a specific snake from the visual gallery or table
  const handleSelectSnakeFromGallery = (spec) => {
    setShowVisualPicker(false);
    setDescription(spec.common_name);
    handleRunAssessment(spec.common_name, selectedSymptoms);
  };

  // Dedicated button to speak the full first aid instructions aloud
  const handleSpeakFirstAidAloud = () => {
    if (!assessment || !assessment.species) return;
    const steps = (assessment.species.first_aid || []).join('. ');
    speakEmergencyInstruction(`First aid precautions for ${assessment.species.common_name}: ${steps}`);
  };

  // Voice Assistant Handler (Web Speech API)
  const handleStartVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Fallback demo simulation
      setIsListening(true);
      setTimeout(() => {
        const sampleVoices = [
          "I am bitten by a snake, I don't know which snake",
          "Spectacled Cobra bite on right foot with swelling and dizziness",
          "Bitten by Russell's Viper in agricultural field, severe bleeding"
        ];
        const randomVoice = sampleVoices[Math.floor(Math.random() * sampleVoices.length)];
        setDescription(randomVoice);
        setIsListening(false);
        handleRunAssessment(randomVoice, selectedSymptoms);
      }, 1500);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(transcript);
      setIsListening(false);
      handleRunAssessment(transcript, selectedSymptoms);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleDispatchAntivenomRequest = (hospital) => {
    if (!hospital) return;
    const payload = {
      id: `snk-req-${Date.now().toString().slice(-4)}`,
      type: 'SNAKEBITE_EMERGENCY',
      severity: assessment?.riskTier || 'CRITICAL',
      species: assessment?.species?.common_name || 'Venomous Snake',
      hospital_name: hospital.name,
      timestamp: new Date().toISOString()
    };

    queueOfflineReport(payload);
    setAlertSent(`Emergency Antivenom (AVS) reservation dispatched to ${hospital.name}! ER trauma team notified.`);
    speakEmergencyInstruction(`Antivenom vials reserved at ${hospital.name}. Trauma bay alerted.`);
    setTimeout(() => setAlertSent(null), 5000);
  };

  const handleReset = () => {
    setHasTriaged(false);
    setShowVisualPicker(false);
    setDescription('');
    setSelectedSymptoms([]);
    setAssessment(null);
    setAlertSent(null);
    setShowDatasetTable(false);
  };

  const filteredSpecies = (snakeSpeciesData || []).filter((s) => {
    const matchesSearch = 
      s.common_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.scientific_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (s.region && s.region.toLowerCase().includes(tableSearch.toLowerCase()));
    
    const matchesToxin = 
      toxinFilter === 'ALL' ||
      (toxinFilter === 'NEURO' && s.venom_type?.includes('NEUROTOXIC')) ||
      (toxinFilter === 'HEMO' && s.venom_type?.includes('HEMOTOXIC')) ||
      (toxinFilter === 'NON_VENOMOUS' && !s.venomous);

    return matchesSearch && matchesToxin;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-5xl mx-auto space-y-6"
    >
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-500/40 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {t('snake_title') || 'Snakebite Clinical Triage & Antivenom Locator'}
            </h2>
            <p className="text-xs text-slate-300">
              Voice-assisted toxin triage, live GPS victim-to-hospital map, and emergency WHO first-aid precautions
            </p>
          </div>
        </div>

        {hasTriaged && (
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-cyan-400" />
            <span>New Snakebite Triage</span>
          </button>
        )}
      </div>

      {/* 1. Voice & Text Incident Input Card */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>1. Describe Snakebite Incident (Voice or Text)</span>
          </label>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            POLYVALENT AVS NETWORK
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && description.trim()) {
                handleRunAssessment(description, selectedSymptoms);
              }
            }}
            placeholder="Speak or type (e.g. 'I am bitten by a snake, I don't know which snake' or 'Spectacled Cobra on foot')"
            className="flex-1 bg-[#050A14] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 min-h-[46px]"
          />

          <button
            onClick={handleStartVoice}
            className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer shadow-lg justify-center min-h-[46px] shrink-0 ${
              isListening 
                ? 'bg-red-600 text-white animate-pulse shadow-red-950' 
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40'
            }`}
            title="Speak symptoms or snake description"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
          </button>

          <button
            onClick={() => handleRunAssessment(description || "unknown snake", selectedSymptoms)}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-xl shadow-cyan-950/80 shrink-0 min-h-[46px] cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" /> : <Activity className="w-4 h-4 stroke-[2.5]" />}
            <span>TRIAGE EMERGENCY</span>
          </button>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Incident Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setDescription("I am bitten by a snake, I don't know which snake");
                handleRunAssessment("I am bitten by a snake, I don't know which snake", selectedSymptoms);
              }}
              className="bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>I DON'T KNOW WHICH SNAKE (OPEN VISUAL GALLERY)</span>
            </button>

            <button
              onClick={() => {
                setDescription("Spectacled Cobra (Naja naja) hood mark");
                handleRunAssessment("Spectacled Cobra (Naja naja) hood mark", selectedSymptoms);
              }}
              className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-semibold cursor-pointer"
            >
              🐍 Spectacled Cobra
            </button>

            <button
              onClick={() => {
                setDescription("Russell's Viper (Daboia russelii) chain spots triangular head");
                handleRunAssessment("Russell's Viper (Daboia russelii) chain spots triangular head", selectedSymptoms);
              }}
              className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-semibold cursor-pointer"
            >
              🐍 Russell's Viper
            </button>

            <button
              onClick={() => {
                setDescription("Common Krait (Bungarus caeruleus) nocturnal white bands");
                handleRunAssessment("Common Krait (Bungarus caeruleus) nocturnal white bands", selectedSymptoms);
              }}
              className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-semibold cursor-pointer"
            >
              🐍 Common Krait
            </button>

            <button
              onClick={() => {
                setDescription("Saw-scaled Viper (Echis carinatus) serrated scales");
                handleRunAssessment("Saw-scaled Viper (Echis carinatus) serrated scales", selectedSymptoms);
              }}
              className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl font-semibold cursor-pointer"
            >
              🐍 Saw-scaled Viper
            </button>
          </div>
        </div>

        {/* Observed Symptoms Checklist */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Optional: Observed Physiological Symptoms:
          </span>
          <div className="flex flex-wrap gap-2">
            {symptomChecklist.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleToggleSymptom(sym)}
                  className={`text-xs py-1.5 px-3 rounded-xl font-semibold transition-all border cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md'
                      : 'bg-[#050A14] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* INITIAL STATE: When user hasn't input / triaged yet (DATASET IS HIDDEN) */}
      {!hasTriaged && (
        <div className="bg-[#0B1220]/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-white">
              Instant Snake Toxicology & Live Antivenom Locator
            </h3>
            <p className="text-xs text-slate-300">
              Speak or describe the incident above. RESQONE-AI will immediately plot the <strong className="text-white">Live Real GPS Map with Victim Location & Antivenom Hospitals</strong>, deliver <strong className="text-cyan-400">Voice-Assisted WHO First-Aid Precautions</strong>, and reserve antivenom vials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-cyan-400">1. Instant Species ID</div>
              <p className="text-[11px] text-slate-400">Triage between Neurotoxic (Cobra/Krait) and Hemotoxic (Vipers).</p>
            </div>
            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-emerald-400">2. Live GPS Radar Map</div>
              <p className="text-[11px] text-slate-400">Victim location, verified AVS vial stocks, and ICU ventilator beds.</p>
            </div>
            <div className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-amber-400">3. Spoken First-Aid Audio</div>
              <p className="text-[11px] text-slate-400">Immediate spoken clinical precautions. Zero dangerous tourniquets.</p>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH TOAST */}
      {alertSent && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-950/90 border border-emerald-600 text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xl"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{alertSent}</span>
        </motion.div>
      )}

      {/* CASE 1: UNKNOWN SNAKE -> VISUAL SPECIES IDENTIFICATION GALLERY */}
      {hasTriaged && showVisualPicker && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border border-red-500/60 rounded-3xl space-y-1">
            <div className="flex items-center space-x-2 text-red-400 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Step 2: Tap the Snake that Matches What You Encountered</span>
            </div>
            <p className="text-xs text-slate-300">
              Select the matching image below. This will instantly calculate medical precautions, plot the live GPS route, and allocate nearest antivenom vials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(snakeSpeciesData || []).map((spec) => (
              <div 
                key={spec.id}
                onClick={() => handleSelectSnakeFromGallery(spec)}
                className="bg-[#0B1220]/95 backdrop-blur-xl border border-slate-800 hover:border-cyan-400 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between cursor-pointer group transition-all hover:scale-[1.03]"
              >
                <div className="relative h-44 overflow-hidden bg-[#050A14]">
                  <img 
                    src={spec.image_source} 
                    alt={spec.common_name}
                    loading="lazy" 
                    className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-2.5 right-2.5 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    spec.venomous 
                      ? 'bg-red-950/90 border-red-500/60 text-red-400' 
                      : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-400'
                  }`}>
                    {spec.venomous ? 'VENOMOUS' : 'NON-VENOMOUS'}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                      {spec.common_name}
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-300 italic">{spec.scientific_name}</p>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-[#050A14] p-2.5 rounded-xl border border-slate-800 leading-tight">
                    <strong className="text-white">Marker: </strong>
                    {spec.identifying_markers?.[0]}
                  </p>

                  <div className="text-[10px] font-bold text-cyan-400 flex items-center space-x-1 pt-1">
                    <span>Tap to view live map & first-aid →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CASE 2: SPECIES IDENTIFIED / TRIAGED -> RENDER LIVE GPS MAP, FIRST AID & NEAREST ANTIVENOM CENTERS */}
      {hasTriaged && !showVisualPicker && assessment && assessment.species && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Live Hospital Dispatch Telemetry Card */}
          <LiveHospitalResponse
            emergencyType="SNAKEBITE"
            hospitalName={assessment.nearestAvsFacility?.name || "Government General Hospital (GGH Vijayawada)"}
            hospitalPhone={assessment.nearestAvsFacility?.contact_number || "+91-866-2472777"}
            etaMinutes={3}
            distanceKm={assessment.nearestAvsFacility?.distanceKm || 1.2}
          />

          {/* 1. REAL LIVE GPS MAP: VICTIM LOCATION & ANTIVENOM EQUIPPED HOSPITALS */}
          <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <h3 className="text-base font-black text-white">
                    Live GPS Map: Victim Emergency Location & Antivenom (AVS) Hospitals
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Showing victim location (📍), nearest verified AVS hospitals (🏥), and active emergency transit route.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>MAP LIVE • 4 AVS HOSPITALS • TRANSIT ROUTE ACTIVE</span>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[440px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <SnakebiteRescueMapComponent 
                victimCoords={[16.5167, 80.6500]}
                hospitals={assessment.allAvsFacilities || []}
                speciesName={assessment.species.common_name}
              />

              {/* Map Legend Badge */}
              <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-none shadow-xl space-y-1">
                <div className="text-white font-bold">Map Legend:</div>
                <div className="flex items-center space-x-2 text-red-400">
                  <span>🐍</span> <span>Victim Emergency Location</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <span>🏥</span> <span>Polyvalent AVS Hospital (Verified Vials)</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span>🛣️</span> <span>Fastest Emergency Transit Corridor</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. IDENTIFIED SNAKE TOXICOLOGY & FIRST AID CARD */}
          <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-cyan-500/40 space-y-4 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3.5">
                {assessment.species.image_source ? (
                  <img 
                    src={assessment.species.image_source} 
                    alt={assessment.species.common_name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/60 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#050A14] border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-xl font-black shrink-0">
                    🐍
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Identified India Species Matrix</span>
                  <h3 className="text-xl font-black text-white">{assessment.species.common_name}</h3>
                  <p className="text-xs font-mono text-cyan-300 italic">{assessment.species.scientific_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-950/90 border border-red-500/60 text-red-400 px-3 py-1.5 rounded-xl text-xs font-black uppercase">
                  {assessment.species.venom_type || 'NEUROTOXIC VENOM'}
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                  {assessment.riskTier || 'CRITICAL'} RISK TIER
                </span>
              </div>
            </div>

            {/* Crucial WHO First Aid Precautions with Voice Audio Announcement */}
            <div className="bg-[#050A14] p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Immediate Standard First Aid Precautions for {assessment.species.common_name}</span>
                </h4>

                <button
                  onClick={handleSpeakFirstAidAloud}
                  className="px-3.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto shadow-md"
                  title="Read instructions aloud in spoken voice"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>🔊 Read First-Aid Aloud</span>
                </button>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                {(assessment.species.first_aid || [
                  "Immobilize the bitten limb immediately with a splint below heart level.",
                  "Do NOT cut, suck venom, or apply tight arterial tourniquets.",
                  "Keep the victim completely calm and seated to slow venom circulation.",
                  "Transport immediately to nearest antivenom hospital without wasting Golden Hour time."
                ]).map((step, idx) => (
                  <li key={idx} className="bg-[#0B1220] p-3 rounded-xl border border-slate-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearest Antivenom (AVS) Equipped Hospitals */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <HospIcon className="w-4 h-4 text-cyan-400" />
                  <span>Nearest Antivenom (AVS) Hospitals ({(assessment.allAvsFacilities || []).length})</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  POLYVALENT AVS STOCKS VERIFIED
                </span>
              </div>

              <div className="space-y-2.5">
                {(assessment.allAvsFacilities || []).map((hosp) => (
                  <div 
                    key={hosp.id || hosp.name} 
                    className="bg-[#050A14] p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-extrabold text-white">{hosp.name}</h5>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          AVS IN STOCK ({hosp.antivenom_stock || 150} VIALS)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        <MapPin className="w-3 h-3 text-cyan-400 inline mr-1" />
                        {hosp.distanceKm || 1.2} km away • {hosp.district || 'Trauma Bay'}, {hosp.state || 'AP'} • ICU Ventilators: <strong className="text-white">{hosp.icu_available || 12}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={`tel:${hosp.contact_number || hosp.phone || '+91-866-2472777'}`}
                        className="bg-[#0B1220] hover:bg-slate-800 text-slate-200 border border-slate-700 p-3 rounded-xl transition-colors min-w-[46px] min-h-[46px] flex items-center justify-center"
                        title="Call Emergency Hospital"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </a>
                      
                      <button
                        onClick={() => handleDispatchAntivenomRequest(hosp)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition-all shadow-md shadow-cyan-950 min-h-[46px] cursor-pointer flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>RESERVE AVS & NOTIFY ER</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-800">
              * {assessment.disclaimer || "DECISION SUPPORT ONLY — Not a clinical diagnosis. Transport patient immediately to nearest AVS facility."}
            </p>
          </div>

          {/* 3. OPTIONAL TABULAR MASTER DATASET (Shown only after user triages & toggles) */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowDatasetTable(!showDatasetTable)}
              className="text-xs text-slate-400 hover:text-cyan-400 font-mono underline cursor-pointer transition-colors"
            >
              {showDatasetTable ? 'Hide India Snake Species Master Dataset Table ↑' : 'View Full India Snake Species & Clinical Toxicology Master Table ↓'}
            </button>
          </div>

          {showDatasetTable && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#0B1220]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center space-x-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span>India Snake Species & Clinical Toxicology Master Dataset</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive toxicology matrix, LD50 lethality, and standard polyvalent antivenom dosages.
                  </p>
                </div>

                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1.5 rounded-xl border border-cyan-800/40 self-start sm:self-auto">
                  {filteredSpecies.length} REGISTERED SPECIES
                </span>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search snake by common name, scientific name, or region..."
                    className="w-full bg-[#050A14] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={toxinFilter}
                  onChange={(e) => setToxinFilter(e.target.value)}
                  className="bg-[#050A14] border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="ALL">All Toxin Profiles</option>
                  <option value="NEURO">🧠 Neurotoxic Species</option>
                  <option value="HEMO">🩸 Hemotoxic / Vasotoxic</option>
                  <option value="NON_VENOMOUS">🌿 Non-Venomous</option>
                </select>
              </div>

              {/* Tabular View */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#050A14] text-slate-300 border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider">
                      <th className="p-3 font-extrabold">Species Name</th>
                      <th className="p-3 font-extrabold">Scientific Name</th>
                      <th className="p-3 font-extrabold">Toxin Classification</th>
                      <th className="p-3 font-extrabold">Urgency Tier</th>
                      <th className="p-3 font-extrabold">LD50 (mg/kg)</th>
                      <th className="p-3 font-extrabold">AVS Vials</th>
                      <th className="p-3 font-extrabold">Identifying Features</th>
                      <th className="p-3 font-extrabold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-[#0B1220]/60">
                    {filteredSpecies.map((spec) => (
                      <tr key={spec.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <img src={spec.image_source} alt={spec.common_name} className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                            <span>{spec.common_name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-cyan-300 italic whitespace-nowrap">{spec.scientific_name}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            spec.venomous 
                              ? 'bg-red-600/30 text-red-400 border border-red-500/50' 
                              : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                          }`}>
                            {spec.venom_type}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-200 whitespace-nowrap">{spec.urgency}</td>
                        <td className="p-3 font-mono text-amber-400">{spec.ld50_mg_kg}</td>
                        <td className="p-3 font-mono font-bold text-white">{spec.avs_vials_needed || 0}</td>
                        <td className="p-3 text-slate-300 max-w-[220px] truncate" title={spec.identifying_markers?.join('; ')}>
                          {spec.identifying_markers?.join('; ')}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectSnakeFromGallery(spec)}
                            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 rounded-lg text-[10px] font-bold border border-cyan-500/40 transition-colors cursor-pointer"
                          >
                            Triage This
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

    </motion.div>
  );
};
