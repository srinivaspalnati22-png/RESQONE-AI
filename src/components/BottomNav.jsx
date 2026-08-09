import React, { useState } from 'react';
import { Home, Droplet, Activity, ShieldAlert, LayoutDashboard, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOSModal } from './SOSModal';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  // Tabs ordered with SOS exactly in the center
  const tabs = [
    { id: 'home', label: t('nav_home') || 'Home', icon: Home },
    { id: 'blood', label: t('nav_blood') || 'Blood', icon: Droplet },
    { id: 'snakebite', label: 'Snake ID', icon: Activity },
    { id: 'sos', label: 'SOS', icon: ShieldAlert, isSOSAnchor: true },
    { id: 'dashboard', label: 'Disaster', icon: LayoutDashboard },
    { id: 'auth', label: 'Profile', icon: User }
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-850 px-1 py-1.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSOSAnchor) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setIsSOSOpen(true)}
                  className="relative -top-5 flex flex-col items-center group min-w-[60px] min-h-[60px] justify-center"
                  aria-label="Emergency SOS Alert Trigger"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform transform active:scale-95 bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 ring-4 ring-red-500/40 scale-105 shadow-red-950 animate-pulse">
                    <ShieldAlert className="w-7 h-7 stroke-[2.8] fill-white/10" />
                  </div>
                  <span className="text-[10px] font-black text-red-500 mt-1 uppercase tracking-wider">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 min-w-[48px] min-h-[48px] ${
                  isActive 
                    ? 'text-red-500 font-extrabold bg-red-950/50 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
                aria-label={tab.label}
              >
                <Icon className={`w-5 h-5 mb-0.5 transition-all ${isActive ? 'stroke-[2.5] scale-110 text-red-500 fill-red-500/10' : 'stroke-[1.8] text-slate-400'}`} />
                <span className={`text-[10px] transition-colors ${isActive ? 'text-red-500 font-extrabold' : 'text-slate-400 font-medium'}`}>
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
