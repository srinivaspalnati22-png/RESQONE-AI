import React from 'react';
import { useDemo } from '../context/DemoContext';
import { Zap, Play, CheckCircle } from 'lucide-react';

export const DemoToggle = ({ onSelectScenario }) => {
  const { isDemoMode, toggleDemoMode, PRESET_SCENARIOS } = useDemo();

  return (
    <div className="w-full glass-panel-subtle rounded-2xl p-4 border border-amber-500/20 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Rapid Emergency Scenarios
            </h4>
            <p className="text-[11px] text-slate-400">
              One-tap preset emergency scenarios for instantaneous AI evaluation & 3D dispatch
            </p>
          </div>
        </div>

        <button
          onClick={toggleDemoMode}
          className={`self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isDemoMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {isDemoMode ? 'MODE: DEMO PRESETS' : 'MODE: LIVE INFERENCE'}
        </button>
      </div>

      {isDemoMode && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          {Object.entries(PRESET_SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => onSelectScenario(scenario)}
              className="flex items-center justify-between bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 px-3 py-2 rounded-xl text-left transition-all text-xs group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                {scenario.title}
              </div>
              <Play className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
