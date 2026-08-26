import React, { useEffect, useRef } from 'react';

export function BackgroundVideo({ activeTab = 'home' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // On mobile devices, use ultra-lightweight particle count for 60fps buttery smoothness
    const PARTICLE_COUNT = isMobile ? 14 : Math.min(Math.floor((width * height) / 28000), 45);
    const particles = [];
    const colors = [
      'rgba(0, 240, 255, 0.65)',  // Cyan
      'rgba(255, 34, 68, 0.6)',   // Crimson
      'rgba(0, 229, 153, 0.6)',  // Emerald
      'rgba(255, 179, 0, 0.6)'   // Amber
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
        vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
        radius: Math.random() * 1.5 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    let lastFrameTime = performance.now();
    const frameInterval = isMobile ? 1000 / 30 : 1000 / 60; // 30fps on mobile for 0 battery drain, 60fps on desktop

    const render = (now) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = now - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = now - (elapsed % frameInterval);

      ctx.clearRect(0, 0, width, height);

      // Draw and move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw connections only on desktop to maintain ultra-high mobile responsiveness
        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = dx * dx + dy * dy;
            if (dist < 10000) {
              const alpha = (1 - dist / 10000) * 0.15;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Optimized ambient gradient spots */}
      <div 
        className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-600/10 blur-3xl"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-red-600/10 blur-3xl"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
