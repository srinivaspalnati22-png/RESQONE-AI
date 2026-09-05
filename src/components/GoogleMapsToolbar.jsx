import React from 'react';

export function GoogleMapsToolbar({ currentLayer = 'dark', onLayerChange }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-lg text-[11px] max-w-full overflow-x-auto scrollbar-none">
      {/* Active Engine Badge */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden xs:inline sm:inline">Live Route Engine</span>
          <span className="inline xs:hidden sm:hidden">Live Route</span>
        </span>
      </div>

      {onLayerChange && <div className="h-3 w-px bg-white/20 mx-0.5 shrink-0"></div>}

      {/* Layer Switcher */}
      {onLayerChange && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onLayerChange('dark')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              currentLayer === 'dark' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
            }`}
            title="High-Tech Dark Mode Map"
          >
            Dark
          </button>
          <button
            onClick={() => onLayerChange('roadmap')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              currentLayer === 'roadmap' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'text-slate-400 hover:text-white'
            }`}
            title="Road Navigation Map"
          >
            Road
          </button>
          <button
            onClick={() => onLayerChange('hybrid')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
              currentLayer === 'hybrid' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
            }`}
            title="Satellite Hybrid Map"
          >
            Satellite
          </button>
        </div>
      )}
    </div>
  );
}
