import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = ({ activeTab = 'home' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050A14]">
      {/* Top Left Animated Emergency Red Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 30, 0],
          y: [0, -25, 0]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-red-600/20 rounded-full blur-[130px] z-10 pointer-events-none"
      />

      {/* Top Right Animated Cyan Glow */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.12, 0.25, 0.12],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-20 -right-20 w-[34rem] h-[34rem] bg-cyan-600/15 rounded-full blur-[150px] z-10 pointer-events-none"
      />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
