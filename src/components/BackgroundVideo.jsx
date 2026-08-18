import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent, motion } from 'framer-motion';
import ambulanceVideo from '../assets/videos/ambulance-journey.mp4';
import bloodVideo from '../assets/videos/blood-donation-journey.mp4';
import snakeVideo from '../assets/videos/snakebite-journey.mp4';

const SECTION_VIDEO_MAP = {
  home: ambulanceVideo,
  copilot: ambulanceVideo,
  blood: bloodVideo,
  snakebite: snakeVideo,
  dashboard: ambulanceVideo
};

const ALL_VIDEOS = [ambulanceVideo, bloodVideo, snakeVideo];

export function BackgroundVideo({ activeTab = 'home' }) {
  const videoRef = useRef(null);
  const [isLowSpec, setIsLowSpec] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 1. Hardware concurrency & reduced motion detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lowConcurrency = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsLowSpec(Boolean(lowConcurrency));
      setIsReducedMotion(mediaQuery.matches);

      const handleChange = () => setIsReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // 2. Prefetch section videos
  useEffect(() => {
    ALL_VIDEOS.forEach((src) => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
    });
  }, []);

  const videoSrc = SECTION_VIDEO_MAP[activeTab] || ambulanceVideo;

  // Ensure video plays continuously on tab change
  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsVideoReady(true)).catch(() => {});
      }
    }
  }, [videoSrc]);

  // 3. Smooth scroll progress handler for video scrubbing without stutter
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.005
  });

  const lastSeekTime = useRef(0);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || isLowSpec || isReducedMotion || !video.duration || isNaN(video.duration)) return;

    const clampedProgress = Math.max(0, Math.min(1, latest));
    const targetTime = clampedProgress * video.duration;
    const now = Date.now();

    // Throttle seeks to 150ms to prevent browser video hardware decoding stalls & buffering flicker
    if (now - lastSeekTime.current > 150 && Math.abs(video.currentTime - targetTime) > 0.25) {
      lastSeekTime.current = now;
      try {
        video.currentTime = targetTime;
      } catch (e) {}
    }
  });

  const handleCanPlay = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-slate-950 flex items-center justify-center"
    >
      {/* 1. Ambient Glowing Background Orbs (Always rendering to prevent blank screen) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-red-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.35, 0.15],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-[38rem] h-[38rem] bg-amber-600/20 rounded-full blur-[160px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
      </div>

      {/* 2. Full-bleed Autopolaying Looped Background Video */}
      {!isLowSpec && (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={handleCanPlay}
          onLoadedData={handleCanPlay}
          className={`w-full h-[100dvh] object-cover transition-opacity duration-700 z-10 ${
            isVideoReady ? 'opacity-70' : 'opacity-30'
          }`}
        />
      )}

      {/* 3. Dark Contrast Overlay & Vignette (Ensures text readability & smooth background depth) */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none z-20" />
    </div>
  );
}
