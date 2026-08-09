import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // 1. Hardware check & prefers-reduced-motion
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

  // 2. Prefetch ALL section videos on mount so page transitions never hit a cold load
  useEffect(() => {
    ALL_VIDEOS.forEach((src) => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
    });
  }, []);

  const videoSrc = SECTION_VIDEO_MAP[activeTab] || ambulanceVideo;

  // Reset loaded state on section video change
  useEffect(() => {
    setIsVideoLoaded(false);
  }, [videoSrc]);

  // 3. Damped spring scroll progress for smooth currentTime scrubbing
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 35,
    restDelta: 0.001
  });

  // 4. Scrub video currentTime against damped scroll position
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || isLowSpec || isReducedMotion || !video.duration || isNaN(video.duration)) return;

    const clampedProgress = Math.max(0, Math.min(1, latest));
    const targetTime = clampedProgress * video.duration;

    requestAnimationFrame(() => {
      if (video) {
        try {
          if (Math.abs(video.currentTime - targetTime) > 0.04) {
            video.currentTime = targetTime;
          }
        } catch (e) {}
      }
    });
  });

  const handleCanPlayThrough = () => {
    setIsVideoLoaded(true);
    setIsBuffering(false);
    if (videoRef.current) {
      videoRef.current.pause(); // Pure scroll-scrubbed progression
    }
  };

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-slate-950 flex items-center justify-center"
    >
      {/* Instant Lightweight Static Poster Frame (renders instantly while video buffers) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 transition-opacity duration-700 z-10 ${
          isVideoLoaded && !isBuffering ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-full h-full bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* Scroll-Scrubbed Video Element (height: 100dvh, object-fit: cover) */}
      {!isLowSpec ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={handleCanPlayThrough}
          onLoadedData={handleCanPlayThrough}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          className={`w-full h-[100dvh] object-cover transition-opacity duration-700 ${
            isVideoLoaded ? 'opacity-95' : 'opacity-0'
          }`}
        />
      ) : (
        /* Low-End Hardware Device Fallback (navigator.hardwareConcurrency <= 2) */
        <div className="w-full h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        </div>
      )}

      {/* Reduced 25% Dark Overlay so video motion is vivid, alive, and clearly visible behind content */}
      <div className="absolute inset-0 bg-slate-950/25 pointer-events-none z-20" />

      {/* Subtle Vignette Edge Shading */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none z-20" />
    </div>
  );
}
