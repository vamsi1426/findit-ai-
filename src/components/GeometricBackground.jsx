import React, { useEffect, useRef, useState } from "react";

export function GeometricBackground({
  color = "rgba(99, 102, 241, 0.3)", // Indigo
  accentColor = "rgba(20, 184, 166, 0.4)", // Teal
  lineWidth = 1,
  glowIntensity = 0.5
}) {
  const canvasRef = useRef(null);
  const [snowMode, setSnowMode] = useState(false);
  const snowModeRef = useRef(false);

  useEffect(() => {
    // Check initial state
    const saved = localStorage.getItem('snowMode') === 'true';
    setSnowMode(saved);
    snowModeRef.current = saved;

    const handler = (e) => {
        setSnowMode(e.detail);
        snowModeRef.current = e.detail;
    };
    window.addEventListener('toggle-snow', handler);
    return () => window.removeEventListener('toggle-snow', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // --- Hexagon Settings ---
    const hexSize = 40;
    const hexHeight = hexSize * 2;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexVerticalGap = hexHeight * 0.75;
    
    let animationFrame;
    let time = 0;

    const drawHexagon = (x, y, size, alpha) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      
      ctx.shadowBlur = 10 * glowIntensity;
      ctx.shadowColor = color;
      
      try {
        ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
      } catch (e) { ctx.strokeStyle = color; }
      
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // --- Stars Logic ---
    let stars = [];
    const initStars = () => {
        stars = [];
        const starCount = Math.floor((window.innerWidth * window.innerHeight) / 8000);
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.05 + 0.01,
            });
        }
    };

    const drawStars = () => {
        ctx.fillStyle = "white";
        stars.forEach(star => {
            const pulse = Math.sin(time * 50 * star.speed + star.phase); 
            const alpha = 0.1 + (pulse + 1) / 2 * 0.7; 
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
            star.y -= 0.05; 
            if (star.y < 0) {
                 star.y = canvas.height;
                 star.x = Math.random() * canvas.width;
            }
        });
        ctx.globalAlpha = 1.0; 
    };

    // --- Snow Logic ---
    let snow = [];
    const initSnow = () => {
        snow = [];
        const count = Math.floor((window.innerWidth * window.innerHeight) / 4000); // Thinner than rain
        for(let i=0; i<count; i++) {
            snow.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.5 + 0.5, // Tiny particles
                d: Math.random() * count,
                speed: Math.random() * 1 + 0.5, // Slow fall
                sway: Math.random() * 0.5 - 0.25
            });
        }
    };

    const drawSnow = () => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Subtle
        ctx.shadowBlur = 2;
        ctx.shadowColor = "white";
        ctx.beginPath();
        for(let i = 0; i < snow.length; i++) {
            let p = snow[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            
            p.y += p.speed;
            p.x += Math.sin(time + p.d) * 0.5;

            if (p.y > canvas.height) {
                p.y = -5;
                p.x = Math.random() * canvas.width;
            }
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Init All Particles
    initStars();
    initSnow();

    const handleResize = () => {
        resizeCanvas();
        initStars();
        initSnow();
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.005;

      // 1. Draw Stars (Always)
      drawStars();
      
      // 2. Draw Hexagons (Always)
      const cols = Math.ceil(canvas.width / hexWidth) + 2;
      const rows = Math.ceil(canvas.height / hexVerticalGap) + 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * hexWidth + (row % 2) * (hexWidth / 2);
          const y = row * hexVerticalGap;
          const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
          const wave = Math.sin(distance * 0.005 - time) * 0.5 + 0.5;
          const alpha = 0.05 + wave * 0.25; 
          drawHexagon(x, y, hexSize, alpha); 
        }
      }

      // 3. Draw Snow (Overlay Condition)
      if (snowModeRef.current) {
          drawSnow();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      // toggle-snow listener removed in other effect
      cancelAnimationFrame(animationFrame);
    };
  }, [color, lineWidth, glowIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none transition-colors duration-1000 ${snowMode ? 'bg-[#0f172a]' : 'bg-[#020617]'}`}
      style={{ zIndex: 0 }} 
    />
  );
}
