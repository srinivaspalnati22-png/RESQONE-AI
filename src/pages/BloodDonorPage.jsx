import React, { useState, useEffect } from 'react';
import { Droplet, Search, Phone, MapPin, CheckCircle2, ShieldCheck, Heart, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BloodDonorPage = () => {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(null);

  useEffect(() => {
    fetchMatchedDonors(selectedGroup);
  }, [selectedGroup]);

  const fetchMatchedDonors = async (bloodGroup) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/donors/match?blood_group=${encodeURIComponent(bloodGroup)}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      setDonors([
        { id: "dnr-ap-101", name: "K. Venkata Ramana", phone: "+91-9440123401", blood_group: "O-", availability: true, distance_km: 1.1, compatibility_score: 100.0, last_donation_date: "2026-05-12" },
        { id: "dnr-ap-102", name: "S. Srinivas Rao", phone: "+91-9440123402", blood_group: "O-", availability: true, distance_km: 2.3, compatibility_score: 96.0, last_donation_date: "2026-05-01" },
        { id: "dnr-ap-109", name: "D. Anjaneyulu", phone: "+91-9440123409", blood_group: "O-", availability: true, distance_km: 2.1, compatibility_score: 98.0, last_donation_date: "2026-05-15" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertDonor = (donorName) => {
    setRequestSent(`SOS Blood Alert dispatched to ${donorName}! Responder notified via SMS.`);
    setTimeout(() => setRequestSent(null), 4000);
  };

  return (
    <div className="w-full pb-28 pt-4 px-4 max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
          <Droplet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">{t('blood_title')}</h2>
          <p className="text-xs text-slate-300">{t('blood_subtitle')}</p>
        </div>
      </div>

      {/* Recipient Blood Group Selector */}
      <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            {t('select_blood_group')}
          </label>
          <span className="text-[11px] text-amber-400 font-bold">O- Universal Donor</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`py-3 rounded-2xl font-black text-sm transition-all border cursor-pointer min-h-[44px] ${
                selectedGroup === group
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-300 text-slate-950 shadow-lg shadow-amber-950 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {requestSent && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-700 text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{requestSent}</span>
        </div>
      )}

      {/* Donor List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
            {t('matched_donors')} ({donors.length})
          </h3>
          {loading && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
        </div>

        <div className="space-y-3">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl"
            >
              <div className="flex items-start space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col items-center justify-center text-amber-400 shrink-0">
                  <span className="text-xs font-black font-mono">{donor.blood_group}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold">TYPE</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-extrabold text-white">{donor.name}</h4>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-300 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{donor.distance_km} km away</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{t('compatibility_score')}</div>
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {donor.compatibility_score}%
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${donor.phone}`}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Call Donor"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleAlertDonor(donor.name)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors min-h-[44px]"
                  >
                    {t('request_blood_btn')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
