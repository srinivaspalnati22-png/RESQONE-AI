import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, ShieldAlert, X } from 'lucide-react';

export const FlashBeacon = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsActive(true)}
        className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
        title="Activate Emergency Strobe Beacon"
      >
        <Zap className="w-3.5 h-3.5 fill-current text-red-400 animate-pulse" />
        <span>SOS BEACON</span>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black"
          >
            {/* Pulsing Strobe Overlay */}
            <motion.div
              animate={{
                backgroundColor: ['#ef4444', '#000000', '#3b82f6', '#000000', '#ffffff', '#000000']
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 z-0 opacity-90 pointer-events-none"
            />

            {/* Top Close Bar */}
            <div className="relative z-10 w-full flex justify-between items-center max-w-md bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-2 text-white font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-ping" />
                <span>Night Rescue Strobe Beacon Active</span>
              </div>
              <button
                onClick={() => setIsActive(false)}
                className="p-2 bg-red-600 text-white rounded-xl font-bold shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Instructions */}
            <div className="relative z-10 bg-slate-950/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl text-center space-y-3 max-w-sm">
              <div className="text-2xl font-black text-white">RESCUE SIGNAL</div>
              <p className="text-xs text-slate-300">
                Hold phone high in the air. Strobe pattern signals location to incoming ALS emergency responders and rescue helicopter units.
              </p>
              <button
                onClick={() => setIsActive(false)}
                className="w-full bg-red-600 text-white font-extrabold py-3 rounded-xl text-xs shadow-xl"
              >
                Deactivate Beacon
              </button>
            </div>

            <div></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
