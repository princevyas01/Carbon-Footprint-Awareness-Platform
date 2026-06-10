'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Pause completely
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 40;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, // Slow drift
        vy: (Math.random() - 0.5) * 0.15,
        radius: 1.5,
        opacity: 0.4,
      });
    }

    // 8 larger stationary stars
    const stationaryStars: { x: number; y: number; radius: number; opacity: number }[] = [];
    for (let i = 0; i < 8; i++) {
      stationaryStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2.5,
        opacity: 0.6,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Reposition stationary stars randomly in the new space
      stationaryStars.forEach((star) => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw stationary stars
      stationaryStars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        const isLight = document.documentElement.classList.contains('light');
        const color = isLight ? `rgba(0, 163, 84, ${star.opacity})` : `rgba(0, 255, 135, ${star.opacity})`;
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw moving drift particles
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Use css variables to draw correctly in light vs dark mode
        const isLight = document.documentElement.classList.contains('light');
        const color = isLight ? `rgba(0, 163, 84, ${p.opacity})` : `rgba(0, 255, 135, ${p.opacity})`;
        
        ctx.fillStyle = color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
