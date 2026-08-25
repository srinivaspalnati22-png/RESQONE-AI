import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for subtle repulsion
    let mouse = { x: -1000, y: -1000, radius: 120 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Particle nodes configuration
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 24000), 55);
    const particles = [];
    const colors = [
      'rgba(0, 240, 255, 0.7)',   // Cyan (Intelligence)
      'rgba(255, 34, 68, 0.65)',   // Crimson (Rescue)
      'rgba(0, 229, 153, 0.65)',  // Emerald (Hospital)
      'rgba(255, 179, 0, 0.65)',  // Amber (Blood)
      'rgba(255, 255, 255, 0.5)'  // White (Telemetry)
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pulse wave ripples
    const ripples = [];
    const addRipple = (x, y, color) => {
      ripples.push({
        x: x || Math.random() * width,
        y: y || Math.random() * height,
        radius: 0,
        maxRadius: Math.random() * 100 + 80,
        color: color || 'rgba(0, 240, 255, 0.4)',
        alpha: 0.6,
        speed: Math.random() * 0.8 + 0.6
      });
    };

    // Spawn periodic sonar ripples
    const rippleInterval = setInterval(() => {
      if (isVisible && ripples.length < 6) {
        addRipple();
      }
    }, 2400);

    // Render loop with traveling pulse packets
    let frameCount = 0;
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw expanding sonar pulse ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += rip.speed;
        rip.alpha *= 0.985;

        if (rip.alpha <= 0.01 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${rip.alpha * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Draw particle nodes and connecting constellation lines with traveling signal packets
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges smoothly
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Pulse size & glow
        p.pulseVal += p.pulseSpeed;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes & animate traveling signal pulses
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 120;

          if (distBetween < maxDist) {
            const alpha = (1 - distBetween / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();

            // Moving signal pulse packet along this link
            const pulseT = ((frameCount * 0.015 + (i * 17 + j * 23)) % 1);
            const pulseX = p.x + (p2.x - p.x) * pulseT;
            const pulseY = p.y + (p2.y - p.y) * pulseT;

            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 2.5})`;
            ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(rippleInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-[#03060B]"
    >
      {/* 1. Interactive Constellation Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-65 pointer-events-none"
      />

      {/* 2. Breathing Multi-Chromatic Aurora Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-Left Crimson SOS Aurora */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.12, 0.22, 0.12],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-44 -left-44 w-[38rem] h-[38rem] bg-red-600/30 rounded-full blur-[150px]"
        />

        {/* Top-Right Intelligence Cyan Aurora */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -35, 0],
            y: [0, 25, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[42rem] h-[42rem] bg-cyan-500/25 rounded-full blur-[160px]"
        />

        {/* Bottom-Center Hospital Emerald Aurora */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.08, 0.16, 0.08],
            y: [0, -30, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-500/18 rounded-full blur-[160px]"
        />
      </div>

      {/* 3. High-Precision Blueprint Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 240, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 4. Cinematic Dark Vignette */}
      <div className="absolute inset-0 bg-[#03060B]/35 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03060B] via-transparent to-[#03060B]/60 pointer-events-none z-10" />
    </div>
  );
}

