import React from 'react';
import { 
  Hospital, Navigation, Phone, CheckCircle2, Clock, 
  ShieldAlert, ExternalLink, Activity, Droplet, Zap, Radio, Building2
} from 'lucide-react';

export const LiveHospitalResponse = ({
  emergencyType = 'ACCIDENT_RESCUE',
  hospitalName = 'Government General Hospital (GGH Vijayawada)',
  hospitalPhone = '+91-866-2472777',
  etaMinutes = 4,
  distanceKm = 1.8,
  onClose = null
}) => {
  const type = (emergencyType || '').toUpperCase();
  
  const config = React.useMemo(() => {
    if (type.includes('SNAKE')) {
      return {
        badge: 'POLYVALENT AVS TOXICOLOGY RESERVED',
        resources: '150 Polyvalent Antivenom Vials Verified • Infusion Bay #2 Prepared • ICU Ventilator On Standby',
        team: 'Toxicology Lead: Dr. R. Verma • Rapid Response Paramedics',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/40',
        bgColor: 'bg-cyan-950/20'
      };
    }
    if (type.includes('BLOOD')) {
      return {
        badge: 'UNIVERSAL BLOOD MATRIX ALLOCATED',
        resources: '12 Compatible Units Matched • Active 4°C Cold-Chain Box Locked • Direct OT Delivery Assigned',
        team: 'Blood Bank Director: Dr. M. Rao • Certified Cryo-Courier',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-950/20'
      };
    }
    return {
      badge: 'LEVEL-1 TRAUMA ICU & SURGEON STANDBY',
      resources: 'Trauma Resuscitation Bay #1 Reserved • ICU Bed #4 Ready • Hydraulic Extraction ALS 101 Dispatched',
      team: 'Trauma ICU Lead: Dr. Sarah Jenkins, MD • 2 ALS Flight Paramedics',
      color: 'text-red-400',
      borderColor: 'border-red-500/40',
      bgColor: 'bg-red-950/20'
    };
  }, [type]);

  return (
    <div className={`w-full bg-[#0B1220]/95 backdrop-blur-2xl rounded-3xl border ${config.borderColor} shadow-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden animate-in fade-in`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#050A14] border border-slate-700 text-emerald-400 flex items-center justify-center shadow-lg">
            <Hospital className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
                HOSPITAL DISPATCH CONFIRMED & ACCEPTED
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              {hospitalName}
            </h3>
          </div>
        </div>

        {/* Live ER Contact & Navigation */}
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${hospitalPhone}`}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-red-950/60 min-h-[38px] cursor-pointer transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call ER Direct</span>
          </a>

          <a
            href="https://www.google.com/maps/dir/?api=1&destination=16.5167,80.6500"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#050A14] hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 min-h-[38px] cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Route GPS</span>
          </a>
        </div>
      </div>

      {/* Hospital Real-Time Allocation Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#050A14] p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Allocated Critical Resources:</div>
          <p className="font-bold text-emerald-300 leading-relaxed">{config.resources}</p>
        </div>
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Assigned Medical Response Team:</div>
          <p className="font-bold text-cyan-300 leading-relaxed">{config.team}</p>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#050A14] rounded-xl border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Estimated Transit ETA: <strong className="text-white">{etaMinutes} Mins ({distanceKm} km)</strong></span>
        </div>

        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>● REAL-TIME DISPATCH UPLINK ACTIVE</span>
        </div>
      </div>

    </div>
  );
};
