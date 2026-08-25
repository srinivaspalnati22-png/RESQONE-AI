import React, { useState } from 'react';
import { Home, Droplet, Activity, ShieldAlert, LayoutDashboard, User, Car } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOSModal } from './SOSModal';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const tabs = [
    { id: 'home', label: t('nav_home') || 'Home', icon: Home },
    { id: 'accident', label: 'Crash 3D', icon: Car },
    { id: 'blood', label: t('nav_blood') || 'Blood', icon: Droplet },
    { id: 'sos', label: 'SOS', icon: ShieldAlert, isSOSAnchor: true },
    { id: 'snakebite', label: 'Snake AI', icon: Activity },
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'auth', label: 'Profile', icon: User },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#04070D]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.85)] pb-safe">
        <div className="max-w-md mx-auto flex items-end justify-between px-1 pt-1.5 pb-1">

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSOSAnchor) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setIsSOSOpen(true)}
                  className="relative -top-3.5 flex flex-col items-center group min-w-[54px] justify-center cursor-pointer active:scale-90 transition-transform"
                  aria-label="Emergency SOS Beacon"
                >
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 ring-4 ring-[#04070D] shadow-red-900/90 border border-red-400/40">
                    <ShieldAlert className="w-6 h-6 stroke-[2.5] fill-white/15" />
                  </div>
                  <span className="text-[9px] font-telemetry font-bold text-red-400 mt-1 uppercase tracking-wider">
                    SOS
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[46px] cursor-pointer active:scale-95 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={tab.label}
              >
                <Icon
                  className={`w-4 h-4 mb-0.5 transition-transform ${
                    isActive ? 'stroke-[2.5] scale-110 text-cyan-300' : 'stroke-[1.8] text-slate-400'
                  }`}
                />
                <span
                  className={`text-[9px] font-semibold leading-tight truncate max-w-[48px] ${
                    isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </>
  );
};


