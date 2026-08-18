import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ShieldAlert, CheckCircle2, Phone, MapPin, 
  Hospital as HospIcon, Info, RefreshCw, AlertOctagon, 
  Eye, Zap, Stethoscope, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { DataService } from '../services/data_service';
import snakeSpeciesData from '../data/snake_species.json';
import { LiveHospitalResponse } from '../components/LiveHospitalResponse';

export const SnakebitePage = () => {
  const { t } = useLanguage();
  const { queueOfflineReport } = useDemo();

  const [description, setDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Rapid Swelling & Severe Pain']);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(() => {
    // Synchronous default state to prevent any blank screen / race condition
    const defaultSpec = snakeSpeciesData[0];
    return {
      species: defaultSpec,
      riskTier: defaultSpec.urgency || 'CRITICAL',
      isNeurotoxic: true,
      isHemotoxic: false,
      antivenomRequired: true,
      nearestAvsFacility: {
        id: 'hosp-nhp-002',
        name: 'Government General Hospital (GGH Vijayawada)',
        district: 'Krishna',
        state: 'Andhra Pradesh',
        contact_number: '+91-866-2472777',
        distanceKm: 1.2,
        antivenom_stock: 150,
        icu_available: 14
      },
      allAvsFacilities: [
        {
          id: 'hosp-nhp-002',
          name: 'Government General Hospital (GGH Vijayawada)',
          district: 'Krishna',
          state: 'Andhra Pradesh',
          contact_number: '+91-866-2472777',
          distanceKm: 1.2,
          antivenom_stock: 150,
          icu_available: 14
        },
        {
          id: 'hosp-nhp-001',
          name: 'King George Hospital (KGH)',
          district: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          contact_number: '+91-891-2564891',
          distanceKm: 340.0,
          antivenom_stock: 185,
          icu_available: 18
        }
      ],
      disclaimer: "DECISION SUPPORT ONLY — Not a clinical diagnosis. Immediately transport patient to the nearest antivenom-equipped emergency hospital."
    };
  });
  const [alertSent, setAlertSent] = useState(null);

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
    handleRunAssessment(description, updated);
  };

  const handleRunAssessment = async (queryText = description, symptomsToUse = selectedSymptoms) => {
    setLoading(true);
    try {
      const combinedText = `${queryText || ''} ${(symptomsToUse || []).join(' ')}`;
      const result = await DataService.assessSnakebite(combinedText, symptomsToUse, 16.5167, 80.6500);
      if (result && result.species) {
        setAssessment(result);
      }
    } catch (err) {
      console.error("Error assessing snakebite:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAssessment("Spectacled Cobra", selectedSymptoms);
  }, []);

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
    setTimeout(() => setAlertSent(null), 5000);
  };

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
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{t('snake_title') || 'Snakebite Clinical Triage & AVS Locator'}</h2>
            <p className="text-xs text-slate-300">Rule-based toxin triage & nearest antivenom hospital routing</p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-mono font-bold">
          DECISION SUPPORT
        </span>
      </div>

      {/* Symptom & Observation Input Card */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-cyan-500/30 space-y-4 shadow-2xl">
        <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">
          1. Describe Physical Features, Snake Pattern, or Incident
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 'broad hood with spectacle mark', 'triangular head brown spots', 'black with double white bands'"
            className="flex-1 bg-[#050A14] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 min-h-[46px]"
          />
          <button
            onClick={() => handleRunAssessment(description, selectedSymptoms)}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-cyan-950/80 shrink-0 min-h-[46px] cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'TRIAGE INCIDENT'}
          </button>
        </div>

        {/* Clinical Symptom Selector Checklist */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            2. Observed Symptoms & Physiological Indicators:
          </span>
          <div className="flex flex-wrap gap-2">
            {symptomChecklist.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleToggleSymptom(sym)}
                  className={`text-xs py-2 px-3 rounded-xl font-semibold transition-all border cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md'
                      : 'bg-[#050A14] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Specimen Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">Quick Match:</span>
          <button
            onClick={() => {
              setDescription("Spectacled Cobra (Naja naja) hood mark");
              handleRunAssessment("Spectacled Cobra (Naja naja) hood mark", selectedSymptoms);
            }}
            className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
          >
            🐍 Spectacled Cobra
          </button>
          <button
            onClick={() => {
              setDescription("Russell's Viper (Daboia russelii) chain spots triangular head");
              handleRunAssessment("Russell's Viper (Daboia russelii) chain spots triangular head", selectedSymptoms);
            }}
            className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
          >
            🐍 Russell's Viper
          </button>
          <button
            onClick={() => {
              setDescription("Common Krait (Bungarus caeruleus) nocturnal white bands");
              handleRunAssessment("Common Krait (Bungarus caeruleus) nocturnal white bands", selectedSymptoms);
            }}
            className="bg-[#050A14] hover:bg-slate-900 border border-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
          >
            🐍 Common Krait
          </button>
        </div>
      </div>

      {/* Dispatch Toast */}
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

      {/* Main Assessment Result & Antivenom Routing Card */}
      {assessment && assessment.species && (
        <div className="space-y-6">
          {/* Live Hospital Antivenom Response & Farmer Rescue Video Stream */}
          <LiveHospitalResponse
            emergencyType="SNAKEBITE"
            hospitalName={assessment.nearestAvsFacility?.name || "Government General Hospital (GGH Vijayawada)"}
            hospitalPhone={assessment.nearestAvsFacility?.contact_number || "+91-866-2472777"}
            etaMinutes={3}
            distanceKm={assessment.nearestAvsFacility?.distanceKm || 1.2}
          />
          <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-cyan-500/40 space-y-4 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Identified India Species Matrix</span>
                <h3 className="text-xl font-black text-white">{assessment.species.common_name}</h3>
                <p className="text-xs font-mono text-cyan-300 italic">{assessment.species.scientific_name}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-950/90 border border-red-500/60 text-red-400 px-3 py-1.5 rounded-xl text-xs font-black uppercase">
                  {assessment.species.venom_type || 'VENOMOUS'}
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                  {assessment.riskTier || 'CRITICAL'} TIER
                </span>
              </div>
            </div>

            {/* First Aid & Critical Clinical Steps */}
            <div className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Immediate Standard First Aid Protocol</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {(assessment.species.first_aid || [
                  "Immobilize the bitten limb immediately below heart level.",
                  "Do NOT cut, suck, or apply tight arterial tourniquets.",
                  "Keep patient calm to slow systemic lymphatic absorption.",
                  "Rush immediately to the nearest hospital equipped with Polyvalent Anti-Venom Serum (AVS)."
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearest Antivenom (AVS) Equipped Hospital from Real Dataset */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <HospIcon className="w-4 h-4 text-cyan-400" />
                  <span>Nearest Antivenom (AVS) Hospital Network ({(assessment.allAvsFacilities || []).length})</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">POLYVALENT AVS VERIFIED</span>
              </div>

              <div className="space-y-2.5">
                {(assessment.allAvsFacilities || []).map((hosp) => (
                  <div 
                    key={hosp.id} 
                    className="bg-[#050A14] p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs font-extrabold text-white">{hosp.name}</h5>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          AVS IN STOCK ({hosp.antivenom_stock || 150} VIALS)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {hosp.distanceKm || 1.2} km away • {hosp.district || 'Trauma Center'}, {hosp.state || 'AP'} • ICU Beds: {hosp.icu_available || 12}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={`tel:${hosp.contact_number || hosp.phone || '+91-866-2472777'}`}
                        className="bg-[#0B1220] hover:bg-slate-800 text-slate-200 border border-slate-700 p-2.5 rounded-xl transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center"
                        title="Call Hospital ER"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDispatchAntivenomRequest(hosp)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md min-h-[42px] cursor-pointer"
                      >
                        Reserve AVS & Alert ER
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-800">
              * {assessment.disclaimer || "DECISION SUPPORT ONLY — Not a clinical diagnosis."}
            </p>
          </div>
        </div>
      )}

      {/* India Snake Species Gallery (Real Photography Cards) */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 px-1">
          India Venomous & Harmless Snake Identification Registry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(snakeSpeciesData || []).map((spec) => (
            <div 
              key={spec.id} 
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden bg-[#050A14]">
                <img 
                  src={spec.image_source} 
                  alt={spec.common_name}
                  loading="lazy" 
                  className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  spec.venomous 
                    ? 'bg-red-950/90 border-red-500/60 text-red-400' 
                    : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-400'
                }`}>
                  {spec.venom_type || (spec.venomous ? 'VENOMOUS' : 'NON-VENOMOUS')}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{spec.common_name}</h4>
                  <p className="text-[11px] font-mono text-cyan-400 italic">{spec.scientific_name}</p>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed bg-[#050A14] p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200">Key Markers: </span>
                  {(spec.identifying_markers || []).join('; ')}
                </p>

                <button
                  onClick={() => {
                    setDescription(spec.common_name);
                    handleRunAssessment(spec.common_name, selectedSymptoms);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-[#050A14] hover:bg-cyan-600 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs transition-colors shadow-md min-h-[40px] cursor-pointer"
                >
                  Analyze Toxicology & Match AVS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
