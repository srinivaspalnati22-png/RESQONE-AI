import React, { useState, useEffect } from 'react';
import { Key, Map, Layers, Check, X, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { getGoogleMapsApiKey, setGoogleMapsApiKey } from '../services/routing_service';

export function GoogleMapsToolbar({ currentLayer = 'dark', onLayerChange }) {
  const [apiKey, setApiKey] = useState(getGoogleMapsApiKey());
  const [modalOpen, setModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyChange = (e) => {
      setApiKey(e.detail?.apiKey || getGoogleMapsApiKey());
    };
    window.addEventListener('resqone_google_key_changed', handleKeyChange);
    return () => window.removeEventListener('resqone_google_key_changed', handleKeyChange);
  }, []);

  const handleOpenModal = () => {
    setInputKey(apiKey || '');
    setModalOpen(true);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setGoogleMapsApiKey(inputKey.trim());
    setApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setSavedSuccess(false);
    }, 1000);
  };

  const handleClear = () => {
    setGoogleMapsApiKey('');
    setApiKey('');
    setInputKey('');
  };

  return (
    <>
      <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-lg text-[11px]">
        {/* Active Engine Badge */}
        <div className="flex items-center gap-1">
          {apiKey ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Google Maps Engine</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>OSM Real Road Routing</span>
            </span>
          )}
        </div>

        <div className="h-3 w-px bg-white/20 mx-1"></div>

        {/* Layer Switcher (if onLayerChange provided) */}
        {onLayerChange && (
          <div className="flex items-center gap-1">
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
              title="Google Maps Roadmap"
            >
              Road
            </button>
            <button
              onClick={() => onLayerChange('hybrid')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                currentLayer === 'hybrid' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
              }`}
              title="Google Maps Satellite Hybrid"
            >
              Satellite
            </button>
          </div>
        )}

        {/* API Key Modal Button */}
        <button
          onClick={handleOpenModal}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
            apiKey
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
          title="Configure Google Maps API Key"
        >
          <Key className="w-3 h-3" />
          <span>{apiKey ? 'API Key Active' : 'Add Google Key'}</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Maps Real Live Routing</h3>
                  <p className="text-[11px] text-slate-400">Configure Google Maps JavaScript & Directions API</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Enter your <span className="text-blue-400 font-bold">Google Maps API Key</span> to enable real Google Satellite/Roadmap tiles, Google Directions road calculation, and live traffic geometry.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Google Maps API Key (VITE_GOOGLE_MAPS_API_KEY)
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Break Guarantee</span>
                </div>
                <p>
                  If left blank, RESQONE-AI+ automatically uses real street navigation via the OpenStreetMap + OSRM high-precision road network without any watermark or payment!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-red-400 cursor-pointer"
              >
                Clear Key
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/40"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{savedSuccess ? 'Saved!' : 'Save & Activate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
