import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Radio, Hospital, ShieldCheck, Activity, Users, Phone, MapPin, RefreshCw } from 'lucide-react';

export const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [repRes, hospRes, volRes, logRes] = await Promise.all([
        fetch('/api/emergency/reports').then(r => r.json()),
        fetch('/api/hospitals/nearest').then(r => r.json()),
        fetch('/api/volunteers').then(r => r.json()),
        fetch('/api/activity-logs').then(r => r.json())
      ]);

      setReports(repRes || []);
      setHospitals(hospRes || []);
      setVolunteers(volRes || []);
      setLogs(logRes || []);
    } catch (err) {
      console.warn("Failed fetching dashboard API, using local fallback state", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency Mission Control</h2>
            <p className="text-xs text-slate-400">Live telemetry, hospital ICU stock, & volunteer dispatch feed</p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Grid: Active Emergency Missions & Volunteer Trust */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Emergency Reports */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Active Rescue Missions ({reports.length})</span>
            </h3>
            <span className="text-[10px] text-red-400 font-mono font-bold">LIVE TELEMETRY</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    {rep.type} • {rep.severity}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    AI {rep.ai_confidence}% CONF
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium">"{rep.ai_explanation}"</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <span className="truncate max-w-[180px]">{rep.address}</span>
                  <span className="text-indigo-400 font-bold">STATUS: {rep.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer Response Network */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust-Scored Volunteers ({volunteers.length})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">CPR / TRAUMA CERT</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
            {volunteers.map((vol) => (
              <div key={vol.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{vol.name}</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                    TRUST: {vol.trust_score}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {vol.skills.map((sk, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md">
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

      {/* Regional Hospital Resource Telemetry Table */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Hospital className="w-4 h-4 text-indigo-400" />
            <span>Bangalore Metro Emergency Hospital Network ({hospitals.length})</span>
          </h3>
          <span className="text-[10px] text-indigo-400 font-semibold">ICU / AVS TELEMETRY</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Hospital Name</th>
                <th className="py-2.5 px-3">ICU Available</th>
                <th className="py-2.5 px-3">Antivenom Stock</th>
                <th className="py-2.5 px-3">Key Blood Reserve</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{h.name}</div>
                    <div className="text-[10px] text-slate-400">{h.address}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {h.icu_available} Beds
                  </td>
                  <td className="py-3 px-3">
                    {h.antivenom_available ? (
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        AVS IN STOCK
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        DEPLETED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    O-: {h.blood_stock?.["O-"] || 0} | O+: {h.blood_stock?.["O+"] || 0}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors text-[11px]"
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

    </div>
  );
};
