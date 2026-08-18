import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, Search, Phone, MapPin, CheckCircle2, 
  ShieldCheck, Heart, RefreshCw, Send, AlertTriangle, 
  Info, Building2, User, Clock, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDemo } from '../context/DemoContext';
import { DataService } from '../services/data_service';

export const BloodDonorPage = () => {
  const { t } = useLanguage();
  const { queueOfflineReport, isOnline } = useDemo();

  // Form State
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('Government General Hospital (GGH Vijayawada)');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgencyLevel, setUrgencyLevel] = useState('CRITICAL');

  // Matching State
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  // Initial lookup on mount or group change
  useEffect(() => {
    handleRunCompatibilityMatch(selectedGroup, unitsNeeded);
  }, [selectedGroup]);

  const handleRunCompatibilityMatch = async (groupToMatch = selectedGroup, units = unitsNeeded) => {
    setLoading(true);
    try {
      const results = await DataService.matchBloodResources(groupToMatch, units, 16.5167, 80.6500);
      setMatchResults(results);
    } catch (err) {
      console.error("Error matching blood resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchBloodAlert = (bankOrDonor) => {
    const payload = {
      id: `bld-req-${Date.now().toString().slice(-4)}`,
      type: 'BLOOD_REQUEST',
      severity: urgencyLevel,
      blood_group: selectedGroup,
      units_needed: unitsNeeded,
      patient_name: patientName || 'Emergency Patient',
      hospital_name: hospitalName,
      target_resource: bankOrDonor.name,
      timestamp: new Date().toISOString()
    };

    queueOfflineReport(payload);
    setRequestStatus(`Blood SOS successfully dispatched to ${bankOrDonor.name}! Automated alerts sent.`);
    setTimeout(() => setRequestStatus(null), 5000);
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
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/50">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{t('blood_title') || 'Emergency Blood & Component Matrix'}</h2>
            <p className="text-xs text-slate-300">Hard-rule ABO/Rh compatibility matching & nearest bank triage</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>REAL NHP DATASET</span>
        </div>
      </div>

      {/* Interactive Blood Request Submission Form */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-amber-500/30 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Heart className="w-4 h-4 text-amber-400" />
            <span>1. Select Recipient Blood Group</span>
          </label>
          <span className="text-[11px] text-amber-400 font-bold">
            {selectedGroup === 'O-' ? '★ O- Universal Donor' : selectedGroup === 'AB+' ? '★ AB+ Universal Recipient' : `Target: ${selectedGroup}`}
          </span>
        </div>

        {/* 8 Standard ABO/Rh Blood Groups */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`py-3 rounded-2xl font-black text-sm transition-all border cursor-pointer min-h-[46px] ${
                selectedGroup === group
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-300 text-slate-950 shadow-lg shadow-amber-950 scale-105'
                  : 'bg-[#050A14] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Input parameters (Patient, Hospital, Units, Urgency) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Patient / Case Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Trauma Surgery Case"
              className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Units Required
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={unitsNeeded}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setUnitsNeeded(val);
                handleRunCompatibilityMatch(selectedGroup, val);
              }}
              className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Urgency Level
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="CRITICAL">🔴 CRITICAL (Immediate Operation)</option>
              <option value="HIGH">🟡 HIGH (Next 2 Hours)</option>
              <option value="MODERATE">🔵 MODERATE (Standard Elective)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {requestStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-950/90 border border-emerald-600 text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xl"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{requestStatus}</span>
        </motion.div>
      )}

      {/* Hard-Rule Compatibility Rule Breakdown Card */}
      {matchResults && (
        <div className="bg-[#0B1220]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-4 h-4" />
              <span>Deterministic Compatibility Rules for {selectedGroup}</span>
            </h4>
            <span className="text-[10px] text-slate-400">Medical Decision Support</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Recipient with blood group <span className="font-extrabold text-white">{selectedGroup}</span> can safely receive red blood cells from compatible donor groups: 
            <span className="text-amber-400 font-mono font-bold ml-1">
              [{matchResults.compatibleGroups.join(', ')}]
            </span>.
          </p>
        </div>
      )}

      {/* Ranked Blood Banks & Regional Stock (from National Health Portal Dataset) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Ranked Blood Banks & Reserve Facilities ({matchResults?.results?.length || 0})
          </h3>
          {loading && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
        </div>

        <div className="space-y-3">
          {matchResults?.results?.map((bank) => (
            <div
              key={bank.id}
              className="bg-[#0B1220]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#050A14] border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-white">{bank.name}</h4>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                        {bank.matchScore}% MATCH
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{bank.distanceKm} km away • {bank.address}</span>
                    </p>
                  </div>
                </div>

                {/* Stock Breakdown */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Compatible Units:</span>
                  {Object.entries(bank.stockBreakdown || {}).map(([grp, count]) => (
                    <span 
                      key={grp}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                        grp === selectedGroup 
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' 
                          : 'bg-[#050A14] text-slate-300 border border-slate-800'
                      }`}
                    >
                      {grp}: {count}
                    </span>
                  ))}
                </div>

                {/* Reason Explanation */}
                <p className="text-[11px] text-slate-300 italic">
                  💡 <span className="text-slate-200 font-semibold">Triage Reason: </span>{bank.reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
                <a
                  href={`tel:${bank.contact_number}`}
                  className="p-3 bg-[#050A14] hover:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl transition-colors min-w-[46px] min-h-[46px] flex items-center justify-center"
                  title="Call Blood Bank"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleDispatchBloodAlert(bank)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg shadow-amber-950/60 transition-all min-h-[46px] flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>REQUEST BLOOD SOS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
