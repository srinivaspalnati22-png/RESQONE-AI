import React, { useState } from 'react';
import { Home, Droplet, Activity, ShieldAlert, LayoutDashboard, User, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOSModal } from './SOSModal';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  // Mobile-first bottom navigation tabs with high-contrast tactile active states
  const tabs = [
    { id: 'home', label: t('nav_home') || 'Home', icon: Home },
    { id: 'accident', label: '3D Crash', icon: AlertOctagon },
    { id: 'blood', label: t('nav_blood') || 'Blood', icon: Droplet },
    { id: 'sos', label: 'SOS', icon: ShieldAlert, isSOSAnchor: true },
    { id: 'snakebite', label: 'Snake AI', icon: Activity },
    { id: 'dashboard', label: 'Mission', icon: LayoutDashboard },
    { id: 'auth', label: 'Profile', icon: User }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050A14]/95 backdrop-blur-2xl border-t border-slate-800/80 px-1 py-1.5 shadow-[0_-4px_30px_rgba(0,0,0,0.8)] pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between px-1 relative">
          
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSOSAnchor) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setIsSOSOpen(true)}
                  className="relative -top-4 flex flex-col items-center group min-w-[52px] min-h-[52px] justify-center cursor-pointer active:scale-90 transition-transform"
                  aria-label="Emergency SOS Alert Trigger"
                >
                  <div className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 ring-4 ring-[#050A14] shadow-red-900/90 animate-pulse">
                    <ShieldAlert className="w-6 h-6 stroke-[2.8] fill-white/15" />
                  </div>
                  <span className="text-[9px] font-black text-red-400 mt-1 uppercase tracking-wider">
                    SOS
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 min-h-[46px] cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'text-cyan-400 font-extrabold bg-cyan-950/60 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={tab.label}
              >
                <Icon className={`w-4 h-4 mb-0.5 transition-transform ${isActive ? 'stroke-[2.5] scale-110 text-cyan-400' : 'stroke-[1.8] text-slate-400'}`} />
                <span className={`text-[9px] leading-tight transition-colors truncate max-w-[48px] ${isActive ? 'text-cyan-400 font-black' : 'text-slate-400 font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>

      {/* SOS Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </>
  );
};
