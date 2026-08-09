import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Navigation, ShieldCheck, Activity, Gauge, MapPin, Zap } from 'lucide-react';

export const ScrollScrubbedVideo = ({
  src,
  poster,
  title = "Emergency Rescue Vehicle Telemetry",
  subtitle = "Scroll down page to advance vehicle along 3D route",
  badge = "3D SCROLL-CONTROLLED VEHICLE"
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafId = useRef(null);

  const [duration, setDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver for lazy load
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '300px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track container scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  // Buttery-smooth rAF video scrubbing
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    setScrubProgress(clamped);

    if (videoRef.current && duration > 0 && !prefersReducedMotion) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (videoRef.current) {
          try {
            videoRef.current.currentTime = clamped * duration;
          } catch (err) {}
        }
      });
    }
  });

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsVideoLoaded(true);
      videoRef.current.currentTime = 0;
    }
  };

  const showFallback = prefersReducedMotion || loadError || (!isVideoLoaded && duration === 0);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[140vh] my-6 overflow-visible"
    >
      {/* Sticky Frame for 3D Video Scrubbing */}
      <div className="sticky top-20 w-full h-[65vh] max-h-[520px] rounded-3xl overflow-hidden glass-panel border border-red-500/30 shadow-2xl p-2 sm:p-3 flex flex-col justify-between">
        
        {/* Top Header Overlay */}
        <div className="relative z-20 flex items-center justify-between bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-black text-red-400 uppercase tracking-wider">{badge}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 text-slate-300 font-mono">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>{Math.round(scrubProgress * 65 + 20)} km/h</span>
            </div>
            <div className="bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-red-500/30">
              {Math.round(scrubProgress * 100)}% DISTANCE
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full h-full my-2 overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center">
          
          {isVisible && !showFallback ? (
            <video
              ref={videoRef}
              src={src}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setLoadError(true)}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            /* Low Motion / Poster Fallback */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-center p-6">
              {poster ? (
                <img src={poster} alt={title} className="w-full h-full object-cover rounded-2xl opacity-70" />
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-lg">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">{title}</h3>
                  <p className="text-xs text-slate-400">
                    Vehicle dispatch telemetry prepped at destination.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Real-time Progress Bar at Bottom of Video */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/80">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-75"
              style={{ width: `${scrubProgress * 100}%` }}
            />
          </div>

          {/* Interactive Scroll Cue Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/40 shadow-xl flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span className="text-[11px] font-bold text-slate-200">
              Scroll page to drive 3D vehicle
            </span>
          </div>

        </div>

        {/* Footer Details */}
        <div className="relative z-20 flex items-center justify-between px-2 text-slate-300 text-xs font-medium">
          <div className="truncate font-semibold text-slate-100">{title}</div>
          <div className="text-[11px] text-slate-400 shrink-0 ml-2">{subtitle}</div>
        </div>

      </div>
    </div>
  );
};
