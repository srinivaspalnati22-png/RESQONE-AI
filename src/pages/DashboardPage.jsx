import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Radio, Hospital, ShieldCheck, 
  Activity, Users, Phone, MapPin, RefreshCw, AlertTriangle, Shield,
  Siren, Droplet, User, CheckCircle2, ArrowRight, Clock, Send, Eye,
  Sparkles, Check, HeartHandshake, AlertOctagon, Zap, ShieldAlert, Award,
  Truck, Stethoscope, Compass, ExternalLink, Volume2, RadioTower, CheckCircle,
  X, Bell, MessageSquare, PhoneCall, Navigation, Route, Lock, Unlock, Bed, HeartPulse
} from 'lucide-react';
import { DataService } from '../services/data_service';
import { useDemo } from '../context/DemoContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { speakEmergencyInstruction, stopAllAudio } from '../services/audio_service';

export const DashboardPage = ({ setActiveTab }) => {
  const { 
    offlineQueue, 
    activeAlerts, 
    acceptAlert, 
    acceptedHospital, 
    setAcceptedHospital,
    activeRole,
    setActiveRole,
    emergencyNotifications,
    broadcastEmergencySOS,
    isDemoMode,
    toggleDemoMode
  } = useDemo();

  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [hospitals, setHospitals] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  useEffect(() => {
    // If not in demo mode, automatically lock to user's registered role
    if (!isDemoMode && user?.role) {
      setActiveRole(user.role);
    }
    return () => stopAllAudio();
  }, [isDemoMode, user]);

  // 5 Global Stakeholder Roles with Distinct Access Rules
  const roles = [
    { 
      id: 'user', 
      label: language === 'te' ? 'పౌరుడు / బాధితుడు' : language === 'hi' ? 'नागरिक / पीड़ित' : language === 'ta' ? 'குடிமகன்' : language === 'kn' ? 'ನಾಗರಿಕ' : 'Citizen / Public', 
      icon: User, 
      color: 'from-blue-600 to-cyan-600', 
      activeBorder: 'border-cyan-400',
      activeText: 'text-cyan-400',
      badge: 'MONITORING ONLY',
      desc: language === 'te' ? 'పౌరులకు వీక్షణ మాత్రమే — ఆసుపత్రి మరియు 108 ఆంబులెన్స్ లైవ్ స్థితిని ట్రాక్ చేయండి' : 'Public observation mode — live tracking of assigned hospital and 108 rescue team' 
    },
    { 
      id: 'hospital', 
      label: language === 'te' ? 'ఆసుపత్రి ER / ICU' : language === 'hi' ? 'अस्पताल ER / ICU' : language === 'ta' ? 'மருத்துவமனை ICU' : language === 'kn' ? 'ಆಸ್ಪತ್ರೆ ICU' : 'Hospital ER / ICU', 
      icon: Hospital, 
      color: 'from-cyan-600 to-teal-600', 
      activeBorder: 'border-cyan-400',
      activeText: 'text-cyan-300',
      badge: 'TRAUMA BAY LEAD',
      desc: language === 'te' ? 'ట్రామా & పాముకాటు కేసుల విశ్లేషణ, ICU బెడ్ల కేటాయింపు' : 'Evaluate incoming trauma cases, allocate ICU beds and ready trauma surgery bays' 
    },
    { 
      id: 'rescue', 
      label: language === 'te' ? '108 రెస్క్యూ బృందం' : language === 'hi' ? '108 बचाव दल' : language === 'ta' ? '108 மீட்புக்குழு' : language === 'kn' ? '108 ರక్షణా ಪಡೆ' : '108 Rescue Team', 
      icon: Siren, 
      color: 'from-red-600 to-amber-600', 
      activeBorder: 'border-red-400',
      activeText: 'text-red-400',
      badge: 'ALS PARAMEDIC UNIT',
      desc: language === 'te' ? 'ప్రమాద సమాచారం ఆధారంగా గ్రీన్ కారిడార్ ద్వారా వేగవంతమైన రెస్క్యూ' : 'High-speed crash telemetry triage, accept dispatch and speed via green corridor' 
    },
    { 
      id: 'donor', 
      label: language === 'te' ? 'రక్త దాత / బ్యాంక్' : language === 'hi' ? 'రక్త దాథ / బ్యాంక్' : language === 'ta' ? 'இரத்த வங்கி' : language === 'kn' ? 'ರಕ್ತ ಬ್ಯಾಂಕ್' : 'Blood Bank / Donor', 
      icon: Droplet, 
      color: 'from-red-600 to-rose-600', 
      activeBorder: 'border-rose-400',
      activeText: 'text-rose-400',
      badge: 'UNIVERSAL DONOR MESH',
      desc: language === 'te' ? 'అత్యవసర రక్త అవసరాల హెచ్చరికలు మరియు 4°C కోల్డ్-చైన్ కొరియర్' : 'Receive urgent ABO/Rh blood crisis alerts and initiate 4°C cold-chain couriers' 
    },
    { 
      id: 'volunteer', 
      label: language === 'te' ? 'మొదటి స్పందనకర్త' : language === 'hi' ? 'प्रथम उत्तरदाता' : language === 'ta' ? 'தன்னார்வலர்' : language === 'kn' ? 'ಸ್ವಯಂಸೇವಕ' : 'First Responder', 
      icon: HeartHandshake, 
      color: 'from-emerald-600 to-teal-600', 
      activeBorder: 'border-emerald-400',
      activeText: 'text-emerald-400',
      badge: 'COMMUNITY RESPONDER',
      desc: language === 'te' ? 'స్థానిక CPR అభ్యర్థనలు మరియు తక్షణ ప్రథమ చికిత్స నిర్వహణ' : 'Respond to localized CPR requests, high-water rescues, and first aid needs' 
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
    if (roleType === 'user') return;

    let msg = '';
    let details = {};

    if (roleType === 'rescue') {
      details = {
        acceptedAmbulance: 'ALS-108 (AP-TRAUMA-99)',
        eta: '3.2 Mins',
        status: 'AMBULANCE_DISPATCHED'
      };
      msg = language === 'te' 
        ? '108 రెస్క్యూ బృందం అత్యవసర కేస్ అంగీకరించింది! ఆంబులెన్స్ బయలుదేరింది.' 
        : '108 Rescue Team accepted emergency mission! ALS Ambulance dispatched.';
      speakEmergencyInstruction("108 Rescue Team accepted case. Ambulance en route.", language);
    } else if (roleType === 'hospital') {
      details = {
        hospitalName: 'Government General Hospital (GGH Vijayawada)',
        icuBed: 'Bay #4 Reserved',
        status: 'HOSPITAL_ACCEPTED'
      };
      msg = language === 'te' 
        ? 'ప్రభుత్వ జనరల్ ఆసుపత్రి (GGH) కేస్ అంగీకరించింది! ICU బెడ్ కేటాయించబడింది.' 
        : 'GGH Vijayawada accepted trauma case! ICU Bay #4 allocated.';
      speakEmergencyInstruction("Hospital accepted emergency SOS. ICU bed reserved.", language);
    } else if (roleType === 'donor') {
      details = {
        donorName: 'Srinivas (O- Verified)',
        courierStatus: 'CRYOCARRIER_ASSIGNED',
        status: 'BLOOD_SOS_ACCEPTED'
      };
      msg = language === 'te' 
        ? 'రక్త దాత అంగీకరించారు! కోల్డ్ చైన్ కొరియర్ బయలుదేరింది.' 
        : 'Blood donor confirmed! 4°C cold-chain courier assigned.';
      speakEmergencyInstruction("Blood donor confirmed. Cold chain courier assigned.", language);
    } else {
      details = {
        volunteerName: 'R. Krishna Murthy (CPR Certified)',
        status: 'FIRST_RESPONDER_EN_ROUTE'
      };
      msg = language === 'te' 
        ? 'మొదటి స్పందనకర్త సంఘటనా స్థలానికి చేరుకుంటున్నారు!' 
        : 'Community First Responder arriving at incident site!';
      speakEmergencyInstruction("First responder accepted emergency rescue mission.", language);
    }

    acceptAlert(alert.id, roleType, details);
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 5000);
  };

  // Determine effective role: In live mode, user's registered role is used; in demo mode, activeRole is used
  const effectiveRole = isDemoMode ? activeRole : (user?.role || activeRole || 'user');
  const currentRoleObj = roles.find(r => r.id === effectiveRole) || roles[0];
  const isCitizenRole = effectiveRole === 'user';

  const filteredAlerts = activeAlerts.filter(a => {
    if (selectedCategoryFilter === 'ALL') return true;
    if (selectedCategoryFilter === 'ACCIDENT') return a.type === 'ACCIDENT' || a.type === 'ACCIDENT_RESCUE' || a.type === '3D_CRASH';
    if (selectedCategoryFilter === 'BLOOD') return a.type === 'BLOOD_REQUEST' || a.type === 'BLOOD_SOS';
    if (selectedCategoryFilter === 'SNAKE') return a.type === 'SNAKEBITE' || a.type === 'SNAKEBITE_AVS_REQUEST';
    if (selectedCategoryFilter === 'VOLUNTEER') return a.type === 'VOLUNTEER_CPR';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-full overflow-x-hidden pb-28 pt-2 px-2 sm:px-4 space-y-4 font-sans"
    >
      
      {/* 1. Tactical Command Center Header */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-4 rounded-3xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 border border-cyan-500/40 text-white flex items-center justify-center shadow-lg shadow-cyan-950/80 shrink-0">
              <LayoutDashboard className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  {t('nav_dashboard') || 'Multi-Agency Incident Command Center'}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  CAD ONLINE 99.99%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {language === 'te' ? '108 రెస్క్యూ, ట్రామా ICU, రక్త దాతలు మరియు కుటుంబ సభ్యులకు ప్రత్యక్ష నోటిఫికేషన్లు' : 'Real-time multi-agency dispatch, CAD triage, and family emergency notification hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {/* Demo Mode Toggle Button */}
            <button
              onClick={toggleDemoMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                isDemoMode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle Demo Mode to explore all stakeholder roles"
            >
              {isDemoMode ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isDemoMode ? 'Demo Mode (All Roles Active)' : 'Live Mode (Role Locked)'}</span>
            </button>

            <button
              onClick={fetchHospitalsAndVolunteers}
              className="px-3 py-1.5 bg-[#050A14] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/[0.08] transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>{language === 'te' ? 'రిఫ్రెష్' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* 4 Live Tactical KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { label: language === 'te' ? 'ICU బెడ్లు' : 'Trauma ICU Beds', val: '42 Ready', icon: Hospital, color: 'text-cyan-400', border: 'border-cyan-500/30' },
            { label: language === 'te' ? '108 ఆంబులెన్స్‌లు' : '108 ALS Units', val: '18 Patrol', icon: Siren, color: 'text-red-400', border: 'border-red-500/30' },
            { label: language === 'te' ? 'కుటుంబ నోటిఫికేషన్లు' : 'Family Alerts Sent', val: '100% Active', icon: PhoneCall, color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: language === 'te' ? 'సార్వత్రిక రక్తం' : 'O- Blood Stock', val: '100% Eligible', icon: Droplet, color: 'text-rose-400', border: 'border-rose-500/30' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-[#050A14] p-2.5 rounded-2xl border ${stat.border} shadow-lg space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{stat.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${stat.color} shrink-0`} />
                </div>
                <div className="text-xs sm:text-sm font-black text-white">{stat.val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Stakeholder Role Bar (5 Switcher buttons in Demo Mode; Locked Banner in Live Authenticated Mode) */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-3.5 sm:p-4 rounded-3xl border border-slate-800 space-y-3 shadow-xl max-w-full">
        
        {isDemoMode ? (
          /* DEMO MODE: All 5 Switchable Stakeholder Dashboards */
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {language === 'te' ? 'డెమో మోడ్: డాష్‌బోర్డ్ రోల్ మార్చండి:' : 'Demo Mode: Switch Stakeholder View:'}
                </span>
              </div>
              <span className={`text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full border border-current bg-slate-950/80 ${currentRoleObj.activeText} self-start sm:self-auto`}>
                ACTIVE VIEW: {currentRoleObj.label.toUpperCase()} {isCitizenRole ? '• (OBSERVER MODE)' : '• (DISPATCH AUTHORIZED)'}
              </span>
            </div>

            {/* 5-Role Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = effectiveRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRole(r.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 min-h-[64px] active:scale-95 ${
                      isSelected 
                        ? `bg-gradient-to-br ${r.color} border-white/60 text-white shadow-xl shadow-cyan-950 ring-2 ring-cyan-400/50` 
                        : 'bg-[#050A14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white leading-tight truncate">{r.label}</div>
                      <div className={`text-[8px] font-mono truncate ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>{r.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* LIVE AUTHENTICATED MODE: Single Assigned Role Dashboard */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#050A14] border border-cyan-500/30">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center shrink-0">
                <currentRoleObj.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs sm:text-sm font-black text-white">{currentRoleObj.label} Dashboard</h4>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    AUTHENTICATED ROLE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Logged in as <strong className="text-white">{user?.name || 'Authorized Responder'}</strong> • {currentRoleObj.desc}
                </p>
              </div>
            </div>

            <button
              onClick={toggleDemoMode}
              className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer self-start sm:self-auto"
            >
              Switch to Demo Mode to test other roles →
            </button>
          </div>
        )}

        <div className="bg-[#050A14] p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center space-x-2">
          <span className="text-cyan-400 font-bold shrink-0">Access Policy:</span>
          <span className="truncate">
            {isCitizenRole 
              ? '👁️ Citizen/User view enabled. Accept action is disabled for public safety. Full live tracking & agency status active.' 
              : `⚡ Official agency responder access active (${currentRoleObj.label}). Authorized to accept and deploy units.`}
          </span>
        </div>
      </div>

      {/* 3. Role-Dedicated Operational Command Modules */}
      {effectiveRole === 'user' && (
        /* CITIZEN DASHBOARD PANEL */
        <div className="p-4 rounded-3xl bg-[#080E1C] border border-cyan-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Personal Emergency Safety & Kin Status</span>
            </h3>
            <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              CITIZEN ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Assigned Hospital</span>
              <div className="font-bold text-white">Government General Hospital (GGH)</div>
              <span className="text-[10px] text-emerald-400">✓ Trauma Bay #4 Reserved</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">108 ALS Ambulance</span>
              <div className="font-bold text-white">Unit ALS-108 (AP-TRAUMA-99)</div>
              <span className="text-[10px] text-amber-400">🚗 ETA: 3.2 Minutes En Route</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Family SMS Status</span>
              <div className="font-bold text-white">2 Emergency Relatives</div>
              <span className="text-[10px] text-emerald-400">✓ Live GPS Tracking Sent</span>
            </div>
          </div>
        </div>
      )}

      {effectiveRole === 'hospital' && (
        /* HOSPITAL ER / ICU DOCTOR DASHBOARD PANEL */
        <div className="p-4 rounded-3xl bg-[#080E1C] border border-cyan-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <Hospital className="w-4 h-4 text-cyan-400" />
              <span>Trauma Bay ICU & Antivenom Cold Storage</span>
            </h3>
            <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              ER DOCTOR COMMAND
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">ICU Ventilator Beds</span>
              <div className="text-sm font-black text-emerald-400">12 Beds Available</div>
              <span className="text-[10px] text-slate-400">Capacity: 24 Total ICU Beds</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Polyvalent AVS Stock</span>
              <div className="text-sm font-black text-cyan-400">395 Vials Cold-Locked</div>
              <span className="text-[10px] text-slate-400">WHO Standard Protocol Ready</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Trauma Surgery Suites</span>
              <div className="text-sm font-black text-amber-400">4 Suites On Standby</div>
              <span className="text-[10px] text-emerald-400">✓ On-Duty Neuro/Ortho Team</span>
            </div>
          </div>
        </div>
      )}

      {effectiveRole === 'rescue' && (
        /* 108 RESCUE TEAM DASHBOARD PANEL */
        <div className="p-4 rounded-3xl bg-[#080E1C] border border-red-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-400" />
              <span>108 ALS Fleet & Green Corridor Clearance</span>
            </h3>
            <span className="text-[9px] font-mono font-black text-red-300 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-500/30">
              PARAMEDIC ALS UNIT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Active Vehicle Unit</span>
              <div className="font-bold text-white">ALS-108 (AP-TRAUMA-99)</div>
              <span className="text-[10px] text-emerald-400">✓ Advanced Life Support Equipped</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Corridor Traffic Override</span>
              <div className="font-bold text-amber-400">NH-16 Corridor Signal Priority</div>
              <span className="text-[10px] text-emerald-400">✓ Green Wave Route Synced</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Hydraulic Rescue Gear</span>
              <div className="font-bold text-white">Extrication Cutters Loaded</div>
              <span className="text-[10px] text-slate-400">Ready for High-G Crash Extrication</span>
            </div>
          </div>
        </div>
      )}

      {effectiveRole === 'donor' && (
        /* BLOOD BANK / DONOR DASHBOARD PANEL */
        <div className="p-4 rounded-3xl bg-[#080E1C] border border-rose-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-400" />
              <span>Regional ABO/Rh Blood Bank & Cryo-Courier Matrix</span>
            </h3>
            <span className="text-[9px] font-mono font-black text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/30">
              BLOOD BANK DISPATCH
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Universal O- Negative</span>
              <div className="text-sm font-black text-rose-400">18 Units Available</div>
              <span className="text-[10px] text-slate-400">Red Cross Regional Center</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">4°C Cold-Chain Couriers</span>
              <div className="text-sm font-black text-emerald-400">2 Couriers On Active Run</div>
              <span className="text-[10px] text-slate-400">Active Temp: 4.0°C Locked</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Verified Donors Online</span>
              <div className="text-sm font-black text-white">6 Donors in Vijayawada</div>
              <span className="text-[10px] text-emerald-400">✓ 100% Eligible to Donate</span>
            </div>
          </div>
        </div>
      )}

      {effectiveRole === 'volunteer' && (
        /* FIRST RESPONDER DASHBOARD PANEL */
        <div className="p-4 rounded-3xl bg-[#080E1C] border border-emerald-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Community First Responder & CPR Mesh</span>
            </h3>
            <span className="text-[9px] font-mono font-black text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              FIRST RESPONDER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Volunteer CAD Radius</span>
              <div className="font-bold text-emerald-400">3.5 km High-Priority Radius</div>
              <span className="text-[10px] text-slate-400">Trust Score: 98% Verified</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Certified Responders</span>
              <div className="font-bold text-white">3 Responders Online Ready</div>
              <span className="text-[10px] text-emerald-400">✓ CPR, BLS, Snake Catchers</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#050A14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Average Arrival Time</span>
              <div className="font-bold text-amber-400">3.8 Minutes</div>
              <span className="text-[10px] text-slate-400">Faster than ALS in Traffic</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Notice */}
      <AnimatePresence>
        {actionToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-2xl"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
              <span className="truncate">{actionToast}</span>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('accident')}
              className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center space-x-1"
            >
              <span>Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Global Emergency Notifications & Family Alert Banner */}
      <div className="bg-[#080E1C] p-3.5 sm:p-4 rounded-3xl border border-red-500/40 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-red-400 animate-bounce" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              {language === 'te' ? 'అత్యవసర ప్రసారాలు & కుటుంబ హెచ్చరికలు' : 'Live Emergency Notifications & Family Broadcast'}
            </h3>
          </div>
          <span className="text-[9px] font-mono font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-500/30">
            AUTO-BROADCAST ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          {emergencyNotifications.map((notif) => (
            <div key={notif.id} className="p-3 rounded-2xl bg-[#050A14] border border-red-500/20 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <h4 className="text-xs font-black text-white truncate">{notif.title}</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-400 shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-300">{notif.message}</p>
              
              {/* Family Contacts Status Pill */}
              {notif.familyNotified && notif.familyNotified.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-emerald-300 font-mono">
                  <span className="font-bold text-slate-400">📱 Family SMS/WhatsApp:</span>
                  {notif.familyNotified.map((f, i) => (
                    <span key={i} className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md text-emerald-300 font-sans font-bold">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Live Emergency Incidents Feed */}
      <div className="bg-[#0B1220]/95 backdrop-blur-2xl p-3.5 sm:p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 min-w-0">
            <RadioTower className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
            <h3 className="text-xs sm:text-sm font-black text-white truncate">
              {language === 'te' ? 'అత్యవసర సంఘటనల జాబితా' : 'Live CAD Incident Command Feed'} ({filteredAlerts.length})
            </h3>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Incidents' },
              { id: 'ACCIDENT', label: '🚗 Crash' },
              { id: 'BLOOD', label: '🩸 Blood SOS' },
              { id: 'SNAKE', label: '🐍 Snake AVS' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0 ${
                  selectedCategoryFilter === f.id 
                    ? 'bg-cyan-600 text-slate-950 font-extrabold' 
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
            const isAccepted = alert.status === 'ACCEPTED' || alert.status?.includes('ACCEPTED') || alert.status?.includes('DISPATCHED');
            
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-3xl border transition-all space-y-3 ${
                  isAccepted ? 'bg-[#050A14] border-emerald-500/40 shadow-emerald-950/40' : 'bg-[#0B1220] border-red-500/40 shadow-red-950/40 ring-1 ring-red-500/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-[#050A14] border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      {alert.type === 'BLOOD_SOS' || alert.type === 'BLOOD_REQUEST' ? (
                        <Droplet className="w-5 h-5 text-rose-400" />
                      ) : alert.type === 'SNAKEBITE' ? (
                        <Activity className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                        {alert.title || alert.type}
                      </h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{alert.location || 'NH-16 Corridor, Vijayawada'}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-black px-2.5 py-1 rounded-full border shrink-0 ${
                    isAccepted 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  }`}>
                    {isAccepted ? '✓ DISPATCHED & ACCEPTED' : '🚨 ACTIVE SOS ALERT'}
                  </span>
                </div>

                {/* Incident Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#050A14] p-2.5 rounded-2xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Victim / Patient</span>
                    <span className="font-bold text-slate-200">{alert.victim || 'Emergency Citizen'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Severity Rating</span>
                    <span className="font-bold text-red-400">{alert.severity || 'CRITICAL'} • {alert.gForce || '4.85G'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Assigned Emergency ER</span>
                    <span className="font-bold text-cyan-300 truncate block">{alert.acceptedHospital || 'GGH Vijayawada'}</span>
                  </div>
                </div>

                {/* Family Notifications Confirmation */}
                {alert.familyAlerted && alert.familyAlerted.length > 0 && (
                  <div className="bg-[#050A14] p-2.5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px]">
                    <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Family SOS Dispatch:</span>
                    </div>
                    <div className="text-slate-300 truncate">
                      {alert.familyAlerted.join(' • ')}
                    </div>
                  </div>
                )}

                {/* Action Buttons Row: Strictly customized per role */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800 w-full">
                  
                  {/* CITIZEN / USER VIEW: NO ACCEPT BUTTON */}
                  {isCitizenRole ? (
                    <div className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>{language === 'te' ? 'ఆసుపత్రి & 108 సమన్వయం జరుగుతోంది (పౌరుడి వీక్షణ)' : 'Multi-Agency Response in Progress (Citizen Observer Mode)'}</span>
                    </div>
                  ) : (
                    /* RESPONDER OFFICIALS VIEW: ACCEPT BUTTONS */
                    !isAccepted ? (
                      <button
                        onClick={() => handleRoleAcceptance(alert, effectiveRole)}
                        className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer active:scale-95 transition-all min-h-[42px] ${
                          effectiveRole === 'hospital' 
                            ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-slate-950'
                            : effectiveRole === 'rescue'
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white'
                            : effectiveRole === 'donor'
                            ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {effectiveRole === 'hospital' && (language === 'te' ? '🏥 కేసును అంగీకరించి ICU బెడ్ రిజర్వ్ చేయండి' : '🏥 Accept Case & Reserve Trauma ICU Bed')}
                          {effectiveRole === 'rescue' && (language === 'te' ? '🚨 108 ఆంబులెన్స్‌ను డిస్పాచ్ చేయండి' : '🚨 Dispatch 108 ALS Ambulance & Navigate')}
                          {effectiveRole === 'donor' && (language === 'te' ? '🩸 రక్తాన్ని నిర్ధారించి కొరియర్ పంపండి' : '🩸 Confirm Blood & Dispatch Cryo-Courier')}
                          {effectiveRole === 'volunteer' && (language === 'te' ? '🤝 మొదటి స్పందనకర్తగా వెళ్లండి' : '🤝 Accept First Responder Run')}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-black text-center flex items-center justify-center space-x-1.5 min-h-[42px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ Mission Accepted & Dispatched</span>
                      </div>
                    )
                  )}

                  {/* Navigation Map Action */}
                  <button
                    onClick={() => setActiveTab && setActiveTab('accident')}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[42px]"
                  >
                    <Route className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'te' ? 'మ్యాప్‌లో చూడండి' : 'View GPS Map'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
};
