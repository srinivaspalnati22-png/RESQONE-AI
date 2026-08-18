import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundVideo({ activeTab = 'home' }) {
  // Pure Ambient Dark Background with zero video overhead
  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-[#050A14] flex items-center justify-center"
    >
      {/* 1. Ambient Glowing Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-red-600/25 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-[38rem] h-[38rem] bg-cyan-600/20 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.16, 0.08]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-[150px]"
        />
        
        {/* Subtle dot matrix grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 2. Dark Contrast Vignette Overlay */}
      <div className="absolute inset-0 bg-[#050A14]/30 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-transparent to-[#050A14]/50 pointer-events-none z-10" />
    </div>
  );
}
