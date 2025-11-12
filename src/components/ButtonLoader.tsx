import { useEffect, useRef } from 'react';
import { CANVAS_SIZES, ANIMATION_CONFIG, createMonochromeFill } from '@/constants';

const CANVAS_SIZE = CANVAS_SIZES.BUTTON_LOADER;
const MONOCHROME_FILL = createMonochromeFill;
const GLOBAL_SPEED = ANIMATION_CONFIG.GLOBAL_SPEED;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function ButtonLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;

    // Crystalline Refraction animation - scaled down for button (16x16)
    // Use a smaller grid for the button size
    const gridSize = 5;
    const spacing = CANVAS_SIZE / (gridSize - 1);
    const dots: Array<{ x: number; y: number }> = [];

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        dots.push({ x: c * spacing, y: r * spacing });
      }
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      // Scale down the time step for button size
      timeRef.current += deltaTime * 0.16 * GLOBAL_SPEED;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Wave radius calculation - scaled for button
      const waveRadius = (timeRef.current * 100) % (CANVAS_SIZE * 1.2);
      const waveWidth = 8; // Scaled down from 60

      dots.forEach(dot => {
        const dist = Math.hypot(dot.x - centerX, dot.y - centerY);
        const distToWave = Math.abs(dist - waveRadius);
        let displacement = 0;

        if (distToWave < waveWidth / 2) {
          const wavePhase = (distToWave / (waveWidth / 2)) * Math.PI;
          displacement = easeInOutCubic(Math.sin(wavePhase)) * 1.5; // Scaled down from 10
        }

        const angleToCenter = Math.atan2(dot.y - centerY, dot.x - centerX);
        const dx = Math.cos(angleToCenter) * displacement;
        const dy = Math.sin(angleToCenter) * displacement;
        const opacity = 0.2 + (Math.abs(displacement) / 1.5) * 0.8;
        const dotSize = 0.4 + (Math.abs(displacement) / 1.5) * 0.8; // Scaled down from 1.2-3.2

        ctx.beginPath();
        ctx.arc(dot.x + dx, dot.y + dy, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = MONOCHROME_FILL(opacity);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      lastTimeRef.current = null;
      timeRef.current = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="block"
      aria-hidden="true"
      style={{ display: 'block' }}
    />
  );
}
