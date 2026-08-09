import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import ambulanceVideo from '../assets/videos/ambulance-journey.mp4';
import bloodVideo from '../assets/videos/blood-donation-journey.mp4';
import snakebiteVideo from '../assets/videos/snakebite-journey.mp4';

export const AnimatedBackground = ({ activeTab = 'home' }) => {
  const videoRef = useRef(null);
  const rafId = useRef(null);
  const [duration, setDuration] = useState(0);

  // Map active page tab to imported video asset
  const getVideoSrc = () => {
    switch (activeTab) {
      case 'blood':
        return bloodVideo;
      case 'snakebite':
        return snakebiteVideo;
      case 'copilot':
      case 'dashboard':
      case 'home':
      default:
        return ambulanceVideo;
    }
  };

  const currentVideoSrc = getVideoSrc();

  // Force video playback on mount and tab change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoSrc]);

  // Handle scroll syncing while playing
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalHeight > 0 && videoRef.current && duration > 0) {
        const progress = Math.max(0, Math.min(1, scrollY / totalHeight));
        const targetTime = progress * duration;

        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          if (videoRef.current) {
            try {
              videoRef.current.currentTime = targetTime;
            } catch (err) {}
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [duration, activeTab]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070e]">
      
      {/* FULL-BLEED AUTOPLAYING 3D BACKGROUND VIDEO LAYER */}
      <div className="absolute inset-0 z-0">
        <video
          key={currentVideoSrc}
          ref={videoRef}
          src={currentVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => {
            if (videoRef.current) videoRef.current.play().catch(() => {});
          }}
          className="w-full h-full object-cover opacity-80 filter brightness-110 contrast-110 transition-opacity duration-500"
        />
        {/* Vignette Overlay so text remains 100% crisp and readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070e] via-[#05070e]/50 to-[#05070e]/30 pointer-events-none" />
      </div>

      {/* Top Left Animated Emergency Red Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, 40, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-red-600/25 rounded-full blur-[130px] z-10 pointer-events-none"
      />

      {/* Top Right Animated Indigo Glow */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-20 -right-20 w-[34rem] h-[34rem] bg-indigo-600/20 rounded-full blur-[150px] z-10 pointer-events-none"
      />

      {/* Subtle Emergency Grid Pattern */}
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
