import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Radio, Hospital, ShieldCheck, 
  Activity, Users, Phone, MapPin, RefreshCw, AlertTriangle, Shield 
} from 'lucide-react';
import { DataService } from '../services/data_service';
import { useDemo } from '../context/DemoContext';

export const DashboardPage = () => {
  const { offlineQueue } = useDemo();
  const [reports, setReports] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [accidentRecords, setAccidentRecords] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [hospList, accList] = await Promise.all([
        DataService.getHospitals(16.5167, 80.6500),
        DataService.getAccidentRecords()
      ]);

      setHospitals(hospList);
      setAccidentRecords(accList);

      // Volunteers mesh
      setVolunteers([
        { id: "vol-01", name: "R. Krishna Murthy", skills: ["CPR Certified", "High-Water Rescue"], trust_score: 98, phone: "+91-9440555001", response_rate: 99 },
        { id: "vol-02", name: "M. Subba Rao", skills: ["Snake Handler Specialist", "Trauma First Aid"], trust_score: 95, phone: "+91-9440555002", response_rate: 96 },
        { id: "vol-03", name: "Dr. Ananya Reddy", skills: ["Emergency Physician", "Triage Lead"], trust_score: 100, phone: "+91-9440555003", response_rate: 100 }
      ]);

      // Dynamic reports combined with queued items
      const baseReports = [
        {
          id: "rep-live-101",
          type: "ACCIDENT_RESCUE",
          severity: "CRITICAL",
          ai_confidence: 96.5,
          ai_explanation: "NH-16 Vijayawada Corridor crash: ALS-101 dispatched with ICU bed reserve.",
          address: "NH-16 Vijayawada Bypass, Andhra Pradesh",
          status: "EN_ROUTE"
        },
        {
          id: "rep-live-102",
          type: "SNAKEBITE",
          severity: "HIGH",
          ai_confidence: 94.0,
          ai_explanation: "Spectacled Cobra envenomation: GGH Vijayawada AVS reserved.",
          address: "Gunadala, Vijayawada",
          status: "DISPATCHED"
        }
      ];

      setReports([...offlineQueue, ...baseReports]);
    } catch (err) {
      console.warn("Failed fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-4 px-4 max-w-5xl mx-auto space-y-6"
    >
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency Mission Control</h2>
            <p className="text-xs text-slate-300">Live telemetry, hospital ICU stock, & volunteer dispatch feed</p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-[#0B1220] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Grid: Active Emergency Missions & Volunteer Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Emergency Reports */}
        <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Active Rescue Missions ({reports.length})</span>
            </h3>
            <span className="text-[10px] text-red-400 font-mono font-bold">LIVE TELEMETRY</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase border border-red-500/30">
                    {rep.type} • {rep.severity}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    AI {rep.ai_confidence || 95}% CONF
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  "{rep.ai_explanation || rep.reason || rep.title || 'Emergency mission in progress'}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <span className="truncate max-w-[200px]">{rep.address || 'AP / Bangalore Grid'}</span>
                  <span className="text-cyan-400 font-bold">STATUS: {rep.status || 'ACTIVE'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Response Network */}
        <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust-Scored Volunteers ({volunteers.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">CPR / RESCUE MESH</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {volunteers.map((vol) => (
              <div key={vol.id} className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{vol.name}</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    TRUST: {vol.trust_score}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {vol.skills.map((sk, idx) => (
                    <span key={idx} className="bg-[#0B1220] border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Response Rate: {vol.response_rate}%</span>
                  <a href={`tel:${vol.phone}`} className="text-emerald-400 font-bold flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>Call Responder</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Regional Hospital Resource Telemetry Table (Real NHP Hospitals Dataset) */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Hospital className="w-4 h-4 text-cyan-400" />
            <span>National Health Portal Hospital Telemetry ({hospitals.length})</span>
          </h3>
          <span className="text-[10px] text-cyan-400 font-semibold">ICU & AVS TELEMETRY</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Hospital Name</th>
                <th className="py-3 px-3">Location & Distance</th>
                <th className="py-3 px-3">ICU Available</th>
                <th className="py-3 px-3">Antivenom Stock</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white">{h.name}</div>
                    <div className="text-[10px] text-slate-400">{h.category || 'Government Center'}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    <div>{h.district}, {h.state}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{h.distanceKm} km away</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                    {h.icu_available} Beds
                  </td>
                  <td className="py-3.5 px-3">
                    {h.antivenom_available ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        AVS ({h.antivenom_stock || 150} Vials)
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        DEPLETED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <a
                      href={`tel:${h.contact_number || h.phone}`}
                      className="inline-flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-3 py-1.5 rounded-lg transition-colors text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Zenodo High-Risk Accident Corridors */}
      <div className="bg-[#0B1220]/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Zenodo Road Accident Analysis & Hot-Spot Zones</span>
          </h3>
          <span className="text-[10px] text-amber-400 font-mono font-bold">HISTORICAL INTELLIGENCE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accidentRecords.map((rec) => (
            <div key={rec.id} className="bg-[#050A14] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">{rec.highway}</span>
                <span className="text-[10px] font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md">
                  {rec.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Cause: </span>{rec.cause}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                <span>Casualties: {rec.persons_injured} Injured</span>
                <span className="text-amber-400">Risk: {rec.risk_hotspot_level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
