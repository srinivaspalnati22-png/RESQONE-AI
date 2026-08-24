import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Radio, Hospital, ShieldCheck, 
  Activity, Users, Phone, MapPin, RefreshCw, AlertTriangle, Shield,
  Siren, Droplet, User, CheckCircle2, ArrowRight, Clock, Send, Eye,
  Sparkles, Check, HeartHandshake, AlertOctagon, Zap, ShieldAlert, Award,
  Truck, Stethoscope, Compass, ExternalLink, Volume2, RadioTower, CheckCircle
} from 'lucide-react';
import { DataService } from '../services/data_service';
import { useDemo } from '../context/DemoContext';
import { useLanguage } from '../context/LanguageContext';
import { speakEmergencyInstruction } from '../services/audio_service';

export const DashboardPage = ({ setActiveTab }) => {
  const { 
    offlineQueue, 
    activeAlerts, 
    acceptAlert, 
    acceptedHospital, 
    setAcceptedHospital,
    activeRole,
    setActiveRole 
  } = useDemo();

  const { language, t } = useLanguage();
  const [hospitals, setHospitals] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // 5 Global Stakeholder Roles with Custom Color Themes
  const roles = [
    { 
      id: 'user', 
      label: 'Citizen / Victim', 
      icon: User, 
      color: 'from-blue-600 to-cyan-600', 
      activeBorder: 'border-cyan-400',
      activeText: 'text-cyan-400',
      badge: 'CITIZEN VIEW',
      desc: 'Live real-time view of which hospital accepted and which ambulance is dispatched' 
    },
    { 
      id: 'hospital', 
      label: 'Hospital ER / ICU', 
      icon: Hospital, 
      color: 'from-cyan-600 to-teal-600', 
      activeBorder: 'border-cyan-400',
      activeText: 'text-cyan-300',
      badge: 'TRAUMA BAY LEAD',
      desc: 'Evaluate incoming trauma & snakebite cases, allocate ICU beds and ready surgery bays' 
    },
    { 
      id: 'rescue', 
      label: '108 Rescue Team', 
      icon: Siren, 
      color: 'from-red-600 to-amber-600', 
      activeBorder: 'border-red-400',
      activeText: 'text-red-400',
      badge: 'ALS PARAMEDIC UNIT',
      desc: 'Evaluate high-speed crash telemetry, accept dispatch and speed via green corridor' 
    },
    { 
      id: 'donor', 
      label: 'Blood Donor', 
      icon: Droplet, 
      color: 'from-red-600 to-rose-600', 
      activeBorder: 'border-rose-400',
      activeText: 'text-rose-400',
      badge: 'UNIVERSAL DONOR MESH',
      desc: 'Receive urgent ABO/Rh blood crisis alerts and initiate 4°C cold-chain couriers' 
    },
    { 
      id: 'volunteer', 
      label: 'First Responder', 
      icon: HeartHandshake, 
      color: 'from-emerald-600 to-teal-600', 
      activeBorder: 'border-emerald-400',
      activeText: 'text-emerald-400',
      badge: 'COMMUNITY RESPONDER',
      desc: 'Respond to localized CPR requests, high-water rescues, and first aid needs' 
    },
  ];

  useEffect(() => {
    fetchHospitalsAndVolunteers();
  }, []);

  const fetchHospitalsAndVolunteers = async () => {
    setLoading(true);
    try {
      const hospList = await DataService.getHospitals(16.5167, 80.6500);
      setHospitals(hospList);
      setVolunteers([
        { id: "vol-01", name: "R. Krishna Murthy", skills: ["CPR Certified", "High-Water Rescue"], trust_score: 98, phone: "+91-9440555001", status: "ONLINE READY", eta: "4 Mins" },
        { id: "vol-02", name: "M. Subba Rao", skills: ["Snake Handler Specialist", "Trauma First Aid"], trust_score: 95, phone: "+91-9440555002", status: "ONLINE READY", eta: "6 Mins" },
        { id: "vol-03", name: "Dr. Ananya Reddy", skills: ["Emergency Physician", "Triage Lead"], trust_score: 100, phone: "+91-9440555003", status: "ONLINE READY", eta: "2 Mins" }
      ]);
    } catch (err) {
      console.warn("Failed fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAcceptance = (alert, roleType) => {
    let msg = '';
    let details = {};

    if (roleType === 'rescue') {
      details = {
        acceptedAmbulance: 'ALS-108 (AP-TRAUMA-99)',
        eta: '3.2 Mins',
        status: 'AMBULANCE_DISPATCHED'
      };
      msg = language === 'te' 
        ? '108 రెస్క్యూ బృందం అత్యవసర కేసును అంగీకరించింది! ఆంబులెన్స్ బయలుదేరింది.' 
        : '108 Rescue Team accepted emergency mission! ALS Ambulance dispatched.';
      speakEmergencyInstruction("108 Rescue Team accepted case. Ambulance en route.");
    } else if (roleType === 'hospital') {
      details = {
        hospitalName: 'Government General Hospital (GGH Vijayawada)',
        icuBed: 'Bay #4 Reserved',
        status: 'HOSPITAL_ACCEPTED'
      };
      msg = language === 'te' 
        ? 'ప్రభుత్వ జనరల్ ఆసుపత్రి (GGH) కేసును అంగీకరించింది! ICU బెడ్ కేటాయించబడింది.' 
        : 'GGH Vijayawada accepted trauma case! ICU Bay #4 allocated.';
      speakEmergencyInstruction("Hospital accepted emergency SOS. ICU bed reserved.");
    } else if (roleType === 'donor') {
      details = {
        donorName: 'Srinivas (O- Verified)',
        courierStatus: 'CRYOCARRIER_ASSIGNED',
        status: 'BLOOD_SOS_ACCEPTED'
      };
      msg = language === 'te' 
        ? 'రక్త దాత అంగీకరించారు! కోల్డ్ చైన్ కొరియర్ బయలుదేరింది.' 
        : 'Blood donor confirmed! 4°C cold-chain courier assigned.';
      speakEmergencyInstruction("Blood donor accepted emergency request. Cold chain courier en route.");
    } else if (roleType === 'volunteer') {
      details = {
        volunteerName: 'R. Krishna Murthy (CPR Lead)',
        status: 'VOLUNTEER_DEPLOYED'
      };
      msg = language === 'te' 
        ? 'వాలంటీర్ మొదటి రెస్పాండర్ బయలుదేరారు!' 
        : 'Volunteer First Responder deployed to scene.';
      speakEmergencyInstruction("Volunteer accepted assignment. Responding immediately.");
    }

    acceptAlert(alert.id, roleType, details);
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 5000);
  };

  const filteredAlerts = selectedCategoryFilter === 'ALL'
    ? activeAlerts
    : activeAlerts.filter(a => a.type.includes(selectedCategoryFilter));

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="w-full pb-28 pt-2 px-3 sm:px-4 max-w-md sm:max-w-2xl lg:max-w-5xl mx-auto space-y-5"
    >
      
      {/* 1. Header Bar with Dynamic Pulsing Status Indicator */}
      <div className="bg-gradient-to-r from-[#0B1220]/95 via-[#0E1729]/95 to-[#0B1220]/95 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 border-2 border-cyan-400/40 text-white flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Universal Mission Control
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE RADAR</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unified emergency mesh connecting Citizens, Hospitals, 108 Rescue, Donors & Volunteers
            </p>
          </div>
        </div>

        <button
          onClick={fetchHospitalsAndVolunteers}
          className="p-2.5 bg-[#050A14] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto text-xs font-bold"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Radar</span>
        </button>
      </div>

      {/* 2. Top Emergency KPI Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Trauma ICU Beds', val: '42 Available', sub: 'Across 4 Hubs', icon: Hospital, color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'Active 108 Units', val: '18 On Patrol', sub: 'NH-16 Corridor', icon: Siren, color: 'text-red-400', border: 'border-red-500/30' },
          { label: 'AVS Antivenom', val: '395 Vials', sub: 'Verified in Stock', icon: Activity, color: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: 'Verified Donors', val: '100% Eligible', sub: 'ABO/Rh Match Ready', icon: Droplet, color: 'text-rose-400', border: 'border-rose-500/30' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-[#0B1220]/90 backdrop-blur-xl p-3.5 rounded-2xl border ${stat.border} shadow-lg space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-sm sm:text-base font-black text-white">{stat.val}</div>
              <div className="text-[9px] text-slate-500 font-mono">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Interactive Stakeholder Role Switcher Bar */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Experience Dashboard As:
            </span>
          </div>
          <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-current bg-slate-950/80 ${currentRoleObj.activeText}`}>
            ACTIVE: {currentRoleObj.label.toUpperCase()}
          </span>
        </div>

        {/* Tactile 5-Role Button Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 min-h-[72px] active:scale-95 ${
                  isSelected 
                    ? `bg-gradient-to-br ${r.color} border-white/60 text-white shadow-xl shadow-cyan-950 ring-2 ring-cyan-400/50` 
                    : 'bg-[#050A14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black text-white leading-tight">{r.label}</div>
                  <div className={`text-[9px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{r.badge}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[#050A14] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
          <span className="text-cyan-400 font-bold shrink-0">Role Perspective:</span>
          <span className="truncate">{currentRoleObj.desc}</span>
        </div>
      </div>

      {/* Action Toast Notice */}
      <AnimatePresence>
        {actionToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-500 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-2xl shadow-emerald-950/80"
          >
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
              <span>{actionToast}</span>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('accident')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center space-x-1"
            >
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. LIVE EMERGENCY BROADCASTS & NOTIFICATION STREAM */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        
        {/* Feed Header with Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <RadioTower className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <span>Live Regional Emergency Broadcast Feed</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-400">Incoming emergency dispatches requiring immediate stakeholder response</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'ACCIDENT', label: '🚗 Crash' },
              { id: 'BLOOD', label: '🩸 Blood' },
              { id: 'SNAKE', label: '🐍 Snake' },
              { id: 'VOLUNTEER', label: '🤝 Volunteer' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategoryFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                  selectedCategoryFilter === f.id 
                    ? 'bg-cyan-600 text-slate-950 shadow-md font-extrabold' 
                    : 'bg-[#050A14] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Cards List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isAccepted = alert.status === 'ACCEPTED' || alert.status.includes('ACCEPTED') || alert.status.includes('DISPATCHED');
            
            return (
              <div 
                key={alert.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3.5 shadow-xl relative overflow-hidden ${
                  isAccepted 
                    ? 'bg-[#050A14]/90 border-emerald-500/60 shadow-emerald-950/40' 
                    : 'bg-[#050A14]/95 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {/* Status Glow Edge */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isAccepted ? 'bg-emerald-500' : 'bg-red-500'}`} />

                {/* Top Row: Severity Badge & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 pl-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-red-600/20 text-red-400 border-red-500/50 animate-pulse' 
                        : 'bg-amber-600/20 text-amber-400 border-amber-500/50'
                    }`}>
                      {alert.severity}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">{alert.title}</h4>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-[#0B1220] px-2.5 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    {alert.time}
                  </span>
                </div>

                {/* Telemetry Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300 pl-2">
                  <div className="bg-[#0B1220] p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="truncate">{alert.location}</span>
                  </div>
                  <div className="bg-[#0B1220] p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{alert.victim}</span>
                  </div>
                  <div className="bg-[#0B1220] p-2.5 rounded-xl border border-slate-800/80 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Status: <strong className={isAccepted ? 'text-emerald-400' : 'text-amber-400'}>{alert.status}</strong>
                    </span>
                  </div>
                </div>

                {/* Accepted Status Detail Banner */}
                {isAccepted && (
                  <div className="bg-emerald-950/70 p-3 rounded-2xl border border-emerald-500/40 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono pl-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Accepted by <strong>{alert.acceptedBy?.toUpperCase() || 'HOSPITAL ER'}</strong> at {alert.acceptedAt || 'Just Now'}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 font-bold self-start sm:self-auto">
                      ● MISSION IN PROGRESS
                    </span>
                  </div>
                )}

                {/* Role-Specific Action Controls */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pl-2">
                  
                  {/* FOR 108 RESCUE TEAM */}
                  {activeRole === 'rescue' && (
                    <button
                      onClick={() => handleRoleAcceptance(alert, 'rescue')}
                      disabled={isAccepted}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-red-950 min-h-[46px] disabled:opacity-50 active:scale-98 transition-all"
                    >
                      <Siren className="w-4 h-4 animate-pulse" />
                      <span>{isAccepted ? 'RESCUE MISSION ACCEPTED' : '🚨 ACCEPT RESCUE & DISPATCH AMBULANCE'}</span>
                    </button>
                  )}

                  {/* FOR HOSPITAL ER */}
                  {activeRole === 'hospital' && (
                    <button
                      onClick={() => handleRoleAcceptance(alert, 'hospital')}
                      disabled={isAccepted}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 hover:from-cyan-500 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-950 min-h-[46px] disabled:opacity-50 active:scale-98 transition-all"
                    >
                      <Hospital className="w-4 h-4" />
                      <span>{isAccepted ? 'ICU BED ALLOCATED & RESERVED' : '🏥 ACCEPT PATIENT & RESERVE ICU BED'}</span>
                    </button>
                  )}

                  {/* FOR BLOOD DONOR */}
                  {activeRole === 'donor' && (
                    <button
                      onClick={() => handleRoleAcceptance(alert, 'donor')}
                      disabled={isAccepted}
                      className="w-full sm:w-auto bg-gradient-to-r from-rose-600 via-red-500 to-pink-600 hover:from-rose-500 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-950 min-h-[46px] disabled:opacity-50 active:scale-98 transition-all"
                    >
                      <Droplet className="w-4 h-4" />
                      <span>{isAccepted ? 'DONOR DISPATCH CONFIRMED' : '🩸 ACCEPT BLOOD SOS & START COURIER'}</span>
                    </button>
                  )}

                  {/* FOR VOLUNTEER */}
                  {activeRole === 'volunteer' && (
                    <button
                      onClick={() => handleRoleAcceptance(alert, 'volunteer')}
                      disabled={isAccepted}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 text-slate-950 font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-950 min-h-[46px] disabled:opacity-50 active:scale-98 transition-all"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>{isAccepted ? 'VOLUNTEER DEPLOYED' : '🤝 ACCEPT VOLUNTEER DISPATCH'}</span>
                    </button>
                  )}

                  {/* FOR USER (CITIZEN VIEW): Clean Status Readout */}
                  {activeRole === 'user' && (
                    <div className="text-xs text-slate-300 flex items-center space-x-2">
                      <span className="text-slate-400">Hospital Acceptance:</span>
                      <strong className="text-emerald-400">{acceptedHospital?.name || 'GGH Vijayawada (Trauma Bay Reserved)'}</strong>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 ml-auto">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ref: {alert.id}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Regional Trauma Hospitals & Bed Inventory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Hospital className="w-4 h-4 text-cyan-400" />
            <span>Regional Trauma Centers & ICU Bed Inventory ({hospitals.length})</span>
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">VIJAYAWADA REGION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="bg-[#0B1220]/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">{hosp.name}</h4>
                <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800/40 shrink-0 font-mono">
                  {hosp.distanceKm || 1.8} km away
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#050A14] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ICU Beds Free:</span>
                  <span className="text-emerald-400 font-bold">{hosp.icu_available || 12} Beds</span>
                </div>
                <div className="bg-[#050A14] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">AVS Antivenom:</span>
                  <span className="text-cyan-400 font-bold">{hosp.antivenom_stock || 150} Vials</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Ambulance: {hosp.ambulance_status || 'ALS Unit Ready'}</span>
                <a 
                  href={`tel:${hosp.contact_number || hosp.phone || '+91-866-2472777'}`}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl transition-colors flex items-center space-x-1 text-xs font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ER Direct</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
