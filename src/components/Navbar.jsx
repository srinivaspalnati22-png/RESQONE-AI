import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050A14]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-center sm:justify-start">
        
        {/* Clean Project Title & Logo Only */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group text-left transition-transform active:scale-95"
          aria-label="RESQONE AI Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-950/70 border border-red-400/40 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-white/15 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-lg tracking-tight text-white font-sans">
                RESQ<span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">ONE</span>
              </span>
              <span className="bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium tracking-wide">
              {t('app_tagline') || 'Unified Emergency Intelligence Platform'}
            </p>
          </div>
        </button>

      </div>
    </header>
  );
};
