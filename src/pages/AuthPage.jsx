import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, User, Heart, Stethoscope, Building2, CheckCircle2, 
  Lock, Mail, Phone, Droplet, Users, UserPlus, Trash2, 
  Send, Sparkles, AlertCircle, Save, ExternalLink, Activity, Globe, ArrowRight, Check
} from 'lucide-react';
import { speakEmergencyInstruction } from '../services/audio_service';

export const AuthPage = ({ onOnboardingComplete }) => {
  const { 
    user, 
    completeOnboarding,
    familyContacts,
    updateFamilyContacts,
    updateProfile
  } = useAuth();

  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState(user?.name || 'Srinivas Palnati');
  const [phone, setPhone] = useState(user?.phone || '+91-9876543210');
  const [email, setEmail] = useState(user?.email || 'victim.emergency@resqone.ai');
  const [role, setRole] = useState(user?.role || 'user');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || 'O-');
  const [medicalNotes, setMedicalNotes] = useState(user?.medical_notes || 'Universal O- blood preferred. No known drug allergies.');

  // 5 Family Members Editable State
  const [contactsList, setContactsList] = useState(familyContacts || [
    { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456' },
    { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457' },
    { id: 'fc-3', name: 'Brother / Sister', relation: 'Sibling', phone: '+91-9440123458' },
    { id: 'fc-4', name: 'Best Friend', relation: 'Friend', phone: '+91-9440123459' },
    { id: 'fc-5', name: 'Family Physician / Doctor', relation: 'Doctor', phone: '+91-9440123460' },
  ]);

  const [message, setMessage] = useState(null);

  const handleContactChange = (index, field, value) => {
    const updated = [...contactsList];
    updated[index] = { ...updated[index], [field]: value };
    setContactsList(updated);
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    if (langCode === 'te') {
      speakEmergencyInstruction("తెలుగు భాష ఎంచుకోబడింది. రెస్క్యూ వన్ యాప్ సిద్ధంగా ఉంది.", 'te');
    } else if (langCode === 'hi') {
      speakEmergencyInstruction("हिंदी भाषा चुनी गई है। रेस्क्यू वन ऐप तैयार है।", 'hi');
    } else {
      speakEmergencyInstruction("English language selected. RESQONE is ready.", 'en');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profileData = {
      name,
      email,
      phone,
      blood_group: bloodGroup,
      role,
      medical_notes: medicalNotes
    };
    completeOnboarding(profileData, contactsList);
    if (onOnboardingComplete) onOnboardingComplete();
  };

  return (
    <div className="w-full pb-28 pt-4 px-3 sm:px-4 max-w-2xl mx-auto space-y-6">
      
      {/* 1. Prominent Multilingual Language Switcher Bar */}
      <div className="bg-[#0B1220]/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>{language === 'te' ? 'యాప్ భాషను ఎంచుకోండి' : 'Choose Application Language'}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {language === 'te' ? 'తెలుగు యాక్టివ్' : language === 'hi' ? 'हिन्दी सक्रिय' : 'ENGLISH ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { code: 'en', label: 'English', sub: 'Global' },
            { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
            { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
            { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
            { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleLanguageSelect(item.code)}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                language === item.code 
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/40' 
                  : 'bg-[#050A14] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-black flex items-center space-x-1">
                <span>{item.label}</span>
                {language === item.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Header Welcome Card */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 border border-red-500/40 text-white mx-auto flex items-center justify-center shadow-lg shadow-red-950/60">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {language === 'te' ? 'అత్యవసర ప్రొఫైల్ & 5 కుటుంబ సభ్యుల SOS నెట్‌వర్క్' : 'Emergency Profile & 5-Family SOS Safety Net'}
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          {language === 'te' 
            ? 'ప్రమాదం జరిగినప్పుడు, మీ లైవ్ GPS మరియు క్రాష్ రిపోర్ట్ ఆటోమేటిక్‌గా ఈ 5 కుటుంబ నంబర్లకు & సమీప ఆసుపత్రులకు చేరుతుంది.' 
            : 'When an accident happens, your live GPS coordinates & crash report are automatically transmitted to these 5 family contacts & 4 nearest hospitals.'}
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center space-x-3 border shadow-lg bg-emerald-950/90 border-emerald-500 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* 3. Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Victim / User Personal Details */}
        <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{language === 'te' ? 'బాధితుడి / మీ అత్యవసర వివరాలు' : 'Victim / Your Emergency Medical Details'}</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {language === 'te' ? 'ఆటో సింక్' : 'AUTO-SYNC'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">{language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">{language === 'te' ? 'ఫోన్ నంబర్' : 'Phone Number'}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">{language === 'te' ? 'రక్త గ్రూప్' : 'Blood Group (ABO/Rh)'}</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-red-400 font-bold focus:outline-none focus:border-red-500"
              >
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                  <option key={bg} value={bg}>{bg} Blood Group</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">{language === 'te' ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050A14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 5 Registered Family SOS Contacts */}
        <div className="bg-[#0B1220]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-red-500/30 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{language === 'te' ? '5 కుటుంబ సభ్యుల అత్యవసర SOS నంబర్లు' : '5 Priority Family SOS Contacts (Crash Alert Targets)'}</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              5/5 SLOTS
            </span>
          </div>

          <div className="space-y-3">
            {contactsList.map((contact, index) => (
              <div key={contact.id || index} className="bg-[#050A14] p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name & Relation"
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    required
                    className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />

                  <input
                    type="text"
                    placeholder="Relation"
                    value={contact.relation}
                    onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number (+91...)"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    required
                    className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Save & Enter Live App */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black py-4 px-6 rounded-2xl text-sm shadow-[0_0_35px_rgba(239,68,68,0.7)] flex items-center justify-center space-x-2.5 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>{language === 'te' ? 'లాగిన్ చేసి RESQONE AI లోకి ప్రవేశించండి' : 'Save & Enter Live RESQONE AI'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </form>
    </div>
  );
};
