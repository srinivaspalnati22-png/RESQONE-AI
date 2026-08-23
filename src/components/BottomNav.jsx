import React, { useState } from 'react';
import { Home, Droplet, Activity, ShieldAlert, LayoutDashboard, User, AlertOctagon, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOSModal } from './SOSModal';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  // Tabs ordered with SOS in the center and Profile / 5 Family contacts on the right
  const tabs = [
    { id: 'home', label: t('nav_home') || 'Home', icon: Home },
    { id: 'accident', label: '3D Crash', icon: AlertOctagon },
    { id: 'blood', label: t('nav_blood') || 'Blood', icon: Droplet },
    { id: 'sos', label: 'SOS', icon: ShieldAlert, isSOSAnchor: true },
    { id: 'snakebite', label: 'Snake AI', icon: Activity },
    { id: 'dashboard', label: 'Mission', icon: LayoutDashboard },
    { id: 'auth', label: '5 SOS', icon: User }
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050A14]/95 backdrop-blur-xl border-t border-slate-800 px-1 py-1.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSOSAnchor) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setIsSOSOpen(true)}
                  className="relative -top-5 flex flex-col items-center group min-w-[50px] min-h-[50px] justify-center"
                  aria-label="Emergency SOS Alert Trigger"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-transform transform active:scale-95 bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 ring-4 ring-red-500/40 scale-105 shadow-red-950 animate-pulse">
                    <ShieldAlert className="w-5 h-5 stroke-[2.8] fill-white/10" />
                  </div>
                  <span className="text-[8px] font-black text-red-500 mt-1 uppercase tracking-wider">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-200 min-w-[40px] min-h-[40px] ${
                  isActive 
                    ? 'text-cyan-400 font-extrabold bg-cyan-950/40 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={tab.label}
              >
                <Icon className={`w-4 h-4 mb-0.5 transition-all ${isActive ? 'stroke-[2.5] scale-110 text-cyan-400' : 'stroke-[1.8] text-slate-400'}`} />
                <span className={`text-[8px] transition-colors ${isActive ? 'text-cyan-400 font-extrabold' : 'text-slate-400 font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>

      {/* SOS Modal Triggered by Bottom Bar Center Anchor */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </>
  );
};
