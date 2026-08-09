import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

export const ScrollBackgroundVideoSection = ({
  src,
  poster,
  children
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafId = useRef(null);

  const [duration, setDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver for lazy mounting
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        }
      },
      { rootMargin: '300px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track scroll progress across section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useTransform(scrollYProgress, [0.02, 0.98], [0, 1]);

  const handleCanPlay = () => {
    if (videoRef.current && !isVideoLoaded) {
      const dur = videoRef.current.duration || 0;
      setDuration(dur);
      setIsVideoLoaded(true);
      videoRef.current.play().catch(() => {});
    }
  };

  // Sync video time on scroll while maintaining smooth video playback
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));

    if (videoRef.current && duration > 0 && !prefersReducedMotion) {
      const seekTime = clamped * duration;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (videoRef.current) {
          try {
            videoRef.current.currentTime = seekTime;
          } catch (err) {}
        }
      });
    }
  });

  const showFallback = prefersReducedMotion || loadError || (!isVideoLoaded && duration === 0);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220vh] -mx-4 left-0 right-0 my-4"
    >
      {/* Clean Full-Screen Video Section */}
      <div className="sticky top-0 left-0 right-0 w-full h-screen overflow-hidden bg-slate-950 flex flex-col justify-center p-4 sm:p-8 z-20">
        
        {/* Full-Page Background Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {isVisible && !showFallback ? (
            <video
              ref={videoRef}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleCanPlay}
              onCanPlay={handleCanPlay}
              onError={() => setLoadError(true)}
              className="w-full h-full object-cover opacity-85 filter brightness-110 contrast-110 transition-opacity duration-500"
            />
          ) : (
            /* Reduced Motion Fallback */
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center text-center p-6 opacity-80">
              {poster && <img src={poster} alt="Video poster" className="w-full h-full object-cover opacity-60" />}
            </div>
          )}

          {/* High-Contrast Gradient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 pointer-events-none" />
        </div>

        {/* Middle UI Content Slot (Clean Glass Overlay) */}
        <div className="relative z-30 max-w-2xl mx-auto w-full my-auto max-h-[75vh] overflow-y-auto no-scrollbar p-2">
          {children}
        </div>

      </div>
    </div>
  );
};
