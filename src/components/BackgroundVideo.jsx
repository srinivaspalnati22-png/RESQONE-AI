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

  // 1. Hardware concurrency check & prefers-reduced-motion
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

  // On tab / video change, reset video to paused state at frame 0
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch (e) {}
    }
  }, [videoSrc]);

  // 3. Smooth Damped Scroll Progress (0 at top, 1 at bottom)
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 35,
    restDelta: 0.001
  });

  const rafId = useRef(null);

  // 4. Move video strictly based on page scroll position
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || isLowSpec || isReducedMotion || !video.duration || isNaN(video.duration)) return;

    const clampedProgress = Math.max(0, Math.min(1, latest));
    const targetTime = clampedProgress * video.duration;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (videoRef.current) {
        try {
          if (Math.abs(videoRef.current.currentTime - targetTime) > 0.03) {
            videoRef.current.currentTime = targetTime;
          }
        } catch (e) {}
      }
    });
  });

  const handleLoadedMetadata = () => {
    setIsVideoReady(true);
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch (e) {}
    }
  };

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-slate-950 flex items-center justify-center"
    >
      {/* 1. Ambient Glowing Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-red-600/30 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-[38rem] h-[38rem] bg-amber-600/20 rounded-full blur-[160px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
      </div>

      {/* 2. Scroll-Scrubbed Background Video (Stays paused, only moves when scrolling) */}
      {!isLowSpec && (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleLoadedMetadata}
          className={`w-full h-[100dvh] object-cover transition-opacity duration-700 z-10 ${
            isVideoReady ? 'opacity-70' : 'opacity-30'
          }`}
        />
      )}

      {/* 3. Dark Contrast Overlay & Vignette Shading */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none z-20" />
    </div>
  );
}
