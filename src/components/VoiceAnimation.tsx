import { useEffect, useRef } from 'react';

interface VoiceAnimationProps {
  isActive: boolean;
}

export default function VoiceAnimation({ isActive }: VoiceAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    life: number;
    maxLife: number;
    hue: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = (Math.random() - 0.5) * 2;
      this.life = 0;
      this.maxLife = Math.random() * 100 + 100;
      this.hue = Math.random() * 60 + 180;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      this.size *= 0.99;
    }

    draw(ctx: CanvasRenderingContext2D) {
      const alpha = 1 - this.life / this.maxLife;
      ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    isDead() {
      return this.life >= this.maxLife;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      if (isActive && Math.random() > 0.7) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 40;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        particlesRef.current.push(new Particle(x, y));
      }

      const rings = 4;
      for (let i = 0; i < rings; i++) {
        const radius = 60 + i * 30 + Math.sin(time + i) * 10;
        const alpha = isActive ? 0.3 - i * 0.05 : 0.1 - i * 0.02;
        const hue = 190 + i * 10;

        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius + 10);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      coreGradient.addColorStop(0, isActive ? 'rgba(34, 211, 238, 0.8)' : 'rgba(34, 211, 238, 0.3)');
      coreGradient.addColorStop(0.5, isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)');
      coreGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time;
        const pulseRadius = 50 + (isActive ? Math.sin(time * 3 + i) * 20 : Math.sin(time + i) * 10);
        const x1 = centerX + Math.cos(angle) * pulseRadius;
        const y1 = centerY + Math.sin(angle) * pulseRadius;
        const x2 = centerX + Math.cos(angle) * (pulseRadius + 30);
        const y2 = centerY + Math.sin(angle) * (pulseRadius + 30);

        const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        lineGradient.addColorStop(0, isActive ? 'rgba(34, 211, 238, 0.5)' : 'rgba(34, 211, 238, 0.2)');
        lineGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.update();
        particle.draw(ctx);
        return !particle.isDead();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      />
      <div className="relative z-10 text-center">
        <div className="text-6xl mb-4">🎙️</div>
        <div className="text-lg font-medium text-cyan-400">
          {isActive ? 'Listening...' : 'Start Conversation'}
        </div>
      </div>
    </div>
  );
}
