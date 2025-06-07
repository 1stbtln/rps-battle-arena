import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  className?: string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);
  const targetFPS = 30; // Lower FPS for background effects

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Performance optimization: Reduce canvas resolution on mobile
    const isMobile = window.innerWidth < 768;
    const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(pixelRatio, pixelRatio);
    };

    // Reduce particle count significantly for performance
    const numberOfParticles = isMobile ? 15 : 30;
    const particlesArray: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas.width / pixelRatio);
        this.y = Math.random() * (canvas.height / pixelRatio);
        this.size = Math.random() * 3 + 1; // Smaller particles
        this.speedX = (Math.random() - 0.5) * 0.5; // Slower movement
        this.speedY = (Math.random() - 0.5) * 0.5;

        const colors = [
          "rgba(239, 68, 68, 0.3)",
          "rgba(59, 130, 246, 0.3)",
          "rgba(234, 179, 8, 0.3)",
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = (currentTime: number) => {
      // Throttle to target FPS for performance
      if (currentTime - lastFrameTime.current < 1000 / targetFPS) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime.current = currentTime;

      ctx.clearRect(
        0,
        0,
        canvas.width / pixelRatio,
        canvas.height / pixelRatio
      );

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      // Simplified connection drawing with distance limit
      connectParticles();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      const maxConnections = 5; // Limit connections per particle

      for (let a = 0; a < particlesArray.length; a++) {
        let connections = 0;

        for (
          let b = a + 1;
          b < particlesArray.length && connections < maxConnections;
          b++
        ) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            // Reduced connection distance
            ctx.strokeStyle = particlesArray[a].color;
            ctx.globalAlpha = 0.05;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
            connections++;
          }
        }
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    init();
    animate(0);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`background-effects ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" />

      {/* Simplified gradient overlays */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5"
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};
