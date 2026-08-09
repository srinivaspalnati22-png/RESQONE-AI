import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, Navigation, MapPin, Hospital, Droplet, Radio, ShieldCheck, Zap } from 'lucide-react';

export const EmergencyRadar = ({ userLat = 12.9716, userLng = 77.5946 }) => {
  const [activeBlips, setActiveBlips] = useState([
    { id: 1, type: 'HOSPITAL', name: 'Victoria Govt Venom Center', distance: '1.2 km', angle: 45, radius: 35, color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/50' },
    { id: 2, type: 'AMBULANCE', name: 'RESQONE ALS-104 (En Route)', distance: '0.8 km', angle: 130, radius: 22, color: 'text-red-400 bg-red-500/20 border-red-500/50' },
    { id: 3, type: 'DONOR', name: 'Dr. Rajesh Sharma (O- Active)', distance: '1.5 km', angle: 220, radius: 45, color: 'text-amber-400 bg-amber-500/20 border-amber-500/50' },
    { id: 4, type: 'VOLUNTEER', name: 'Arjun K. (CPR Cert)', distance: '0.5 km', angle: 310, radius: 18, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50' }
  ]);

  const [selectedBlip, setSelectedBlip] = useState(activeBlips[1]);

  return (
    <div className="w-full glass-panel p-5 rounded-3xl border border-red-500/40 shadow-2xl space-y-4 relative overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40">
            <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              3D Live Emergency Telemetry Radar
            </h3>
            <p className="text-[10px] text-slate-300">GPS Radius Scan • Bangalore Metro Incident Grid</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-400 font-bold">RADAR ACTIVE</span>
        </div>
      </div>

      {/* 3D Radar Circle Graphic */}
      <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full border-2 border-red-500/30 bg-slate-950/80 flex items-center justify-center shadow-inner overflow-hidden my-2">
        
        {/* Radar Concentric Rings */}
        <div className="absolute inset-4 rounded-full border border-red-500/20 pointer-events-none" />
        <div className="absolute inset-12 rounded-full border border-red-500/15 pointer-events-none" />
        <div className="absolute inset-20 rounded-full border border-red-500/10 pointer-events-none" />

        {/* Crosshair Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-red-500/20" />
          <div className="h-full w-[1px] bg-red-500/20" />
        </div>

        {/* Sweeping Radar Line Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 origin-center pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(239, 68, 68, 0.35) 0deg, transparent 60deg)'
          }}
        />

        {/* Center User Pin */}
        <div className="relative z-20 w-5 h-5 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-red-900 animate-pulse">
          <Navigation className="w-3 h-3 stroke-[3]" />
        </div>

        {/* Interactive Radar Blips */}
        {activeBlips.map((blip) => {
          const rad = (blip.angle * Math.PI) / 180;
          const x = Math.cos(rad) * blip.radius * 2.2;
          const y = Math.sin(rad) * blip.radius * 2.2;

          return (
            <motion.div
              key={blip.id}
              onClick={() => setSelectedBlip(blip)}
              className={`absolute z-30 w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-transform hover:scale-125 shadow-md ${blip.color}`}
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              whileHover={{ scale: 1.3 }}
            >
              {blip.type === 'HOSPITAL' && <Hospital className="w-3.5 h-3.5" />}
              {blip.type === 'AMBULANCE' && <Navigation className="w-3.5 h-3.5" />}
              {blip.type === 'DONOR' && <Droplet className="w-3.5 h-3.5" />}
              {blip.type === 'VOLUNTEER' && <ShieldCheck className="w-3.5 h-3.5" />}
            </motion.div>
          );
        })}

      </div>

      {/* Selected Blip Info Card */}
      {selectedBlip && (
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${selectedBlip.color}`}>
              {selectedBlip.type === 'AMBULANCE' && <Navigation className="w-4 h-4" />}
              {selectedBlip.type === 'HOSPITAL' && <Hospital className="w-4 h-4" />}
              {selectedBlip.type === 'DONOR' && <Droplet className="w-4 h-4" />}
              {selectedBlip.type === 'VOLUNTEER' && <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-extrabold text-white">{selectedBlip.name}</div>
              <div className="text-[10px] text-slate-400">GPS Distance: {selectedBlip.distance}</div>
            </div>
          </div>

          <span className="bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg text-[10px] font-black border border-red-500/40">
            LOCKED ON RADAR
          </span>
        </div>
      )}

    </div>
  );
};
