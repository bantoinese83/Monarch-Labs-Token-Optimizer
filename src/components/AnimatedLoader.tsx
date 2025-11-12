import { useEffect, useRef } from 'react';
import {
  CANVAS_SIZES,
  ANIMATION_CONFIG,
  createMonochromeFill,
  createMonochromeStroke,
  DEFAULT_LOADER_TYPE,
  type LoaderType,
} from '@/constants';

interface AnimatedLoaderProps {
  type?: LoaderType;
}

const CANVAS_SIZE = CANVAS_SIZES.MAIN_LOADER;
const MONOCHROME_FILL = createMonochromeFill;
const MONOCHROME_STROKE = createMonochromeStroke;
const GLOBAL_SPEED = ANIMATION_CONFIG.GLOBAL_SPEED;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function AnimatedLoader({ type = DEFAULT_LOADER_TYPE }: AnimatedLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;

    let animate: (timestamp: number) => void;

    switch (type) {
      case 'helix-scanner':
        {
          const numDots = 100;
          const radius = 35;
          const height = 120;
          const dots: Array<{ angle: number; y: number }> = [];

          for (let i = 0; i < numDots; i++) {
            dots.push({ angle: i * 0.3, y: (i / numDots) * height - height / 2 });
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.001 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const loopDuration = 8;
            const seamlessProgress = Math.sin((timeRef.current / loopDuration) * Math.PI * 2);
            const scanY = seamlessProgress * (height / 2);
            const scanWidth = 25;
            const trailLength = height * 0.3;

            dots.forEach(dot => {
              const rotation = timeRef.current;
              const x = radius * Math.cos(dot.angle + rotation);
              const z = radius * Math.sin(dot.angle + rotation);
              const pX = centerX + x;
              const pY = centerY + dot.y;
              const scale = (z + radius) / (radius * 2);
              const distToScan = Math.abs(dot.y - scanY);
              const leadingEdgeInfluence =
                distToScan < scanWidth ? Math.cos((distToScan / scanWidth) * (Math.PI / 2)) : 0;

              let trailInfluence = 0;
              const distBehindScan = dot.y - scanY;
              const isMovingUp = Math.cos((timeRef.current / loopDuration) * Math.PI * 2) > 0;

              if (isMovingUp && distBehindScan < 0 && Math.abs(distBehindScan) < trailLength) {
                trailInfluence = Math.pow(1 - Math.abs(distBehindScan) / trailLength, 2) * 0.4;
              } else if (
                !isMovingUp &&
                distBehindScan > 0 &&
                Math.abs(distBehindScan) < trailLength
              ) {
                trailInfluence = Math.pow(1 - Math.abs(distBehindScan) / trailLength, 2) * 0.4;
              }

              const totalInfluence = Math.max(leadingEdgeInfluence, trailInfluence);
              const dotSize = Math.max(0, scale * 1.8 + totalInfluence * 2.8);
              const opacity = Math.max(0, scale * 0.4 + totalInfluence * 0.6);

              ctx.beginPath();
              ctx.arc(pX, pY, dotSize, 0, Math.PI * 2);
              ctx.fillStyle = MONOCHROME_FILL(opacity);
              ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'sphere-scan':
        {
          const radius = CANVAS_SIZE * 0.4;
          const numDots = 250;
          const dots: Array<{ x: number; y: number; z: number }> = [];

          for (let i = 0; i < numDots; i++) {
            const theta = Math.acos(1 - 2 * (i / numDots));
            const phi = Math.sqrt(numDots * Math.PI) * theta;
            dots.push({
              x: radius * Math.sin(theta) * Math.cos(phi),
              y: radius * Math.sin(theta) * Math.sin(phi),
              z: radius * Math.cos(theta),
            });
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.0005 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const rotX = Math.sin(timeRef.current * 0.3) * 0.5;
            const rotY = timeRef.current * 0.5;
            const easedTime = easeInOutCubic((Math.sin(timeRef.current * 2.5) + 1) / 2);
            const scanLine = (easedTime * 2 - 1) * radius;
            const scanWidth = 25;

            dots.forEach(dot => {
              let { x, y, z } = dot;
              const nX = x * Math.cos(rotY) - z * Math.sin(rotY);
              let nZ = x * Math.sin(rotY) + z * Math.cos(rotY);
              x = nX;
              z = nZ;
              const nY = y * Math.cos(rotX) - z * Math.sin(rotX);
              nZ = y * Math.sin(rotX) + z * Math.cos(rotX);
              y = nY;
              z = nZ;

              const scale = (z + radius * 1.5) / (radius * 2.5);
              const pX = centerX + x;
              const pY = centerY + y;
              const distToScan = Math.abs(y - scanLine);
              const scanInfluence =
                distToScan < scanWidth ? Math.cos((distToScan / scanWidth) * (Math.PI / 2)) : 0;
              const dotSize = Math.max(0, scale * 2.0 + scanInfluence * 2.5);
              const opacity = Math.max(0, scale * 0.6 + scanInfluence * 0.4);

              ctx.beginPath();
              ctx.arc(pX, pY, dotSize, 0, Math.PI * 2);
              ctx.fillStyle = MONOCHROME_FILL(opacity);
              ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'sonar-sweep':
        {
          const rings: Array<{ r: number; angle: number; lastSeen: number }> = [];
          const fadeTime = 2500;

          for (let r = 20; r <= 80; r += 15) {
            for (let i = 0; i < r / 2; i++) {
              rings.push({
                r,
                angle: (i / (r / 2)) * Math.PI * 2,
                lastSeen: -fadeTime,
              });
            }
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            lastTimeRef.current = timestamp;
            timeRef.current = timestamp;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const scanAngle =
              (timeRef.current * 0.001 * (Math.PI / 2) * GLOBAL_SPEED) % (Math.PI * 2);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + 85 * Math.cos(scanAngle), centerY + 85 * Math.sin(scanAngle));
            ctx.strokeStyle = MONOCHROME_STROKE(0.5);
            ctx.lineWidth = 1;
            ctx.stroke();

            rings.forEach(dot => {
              let angleDiff = Math.abs(dot.angle - scanAngle);
              if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
              if (angleDiff < 0.05) dot.lastSeen = timeRef.current;

              const timeSinceSeen = timeRef.current - dot.lastSeen;
              if (timeSinceSeen < fadeTime) {
                const t = timeSinceSeen / fadeTime;
                const opacity = 1 - easeInOutCubic(t);
                const dotSize = 1 + opacity * 1.5;
                const x = centerX + dot.r * Math.cos(dot.angle);
                const y = centerY + dot.r * Math.sin(dot.angle);

                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = MONOCHROME_FILL(opacity);
                ctx.fill();
              }
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'crystalline-refraction':
        {
          const gridSize = 15;
          const spacing = CANVAS_SIZE / (gridSize - 1);
          const dots: Array<{ x: number; y: number }> = [];

          for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
              dots.push({ x: c * spacing, y: r * spacing });
            }
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.16 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const waveRadius = (timeRef.current * 100) % (CANVAS_SIZE * 1.2);
            const waveWidth = 60;

            dots.forEach(dot => {
              const dist = Math.hypot(dot.x - centerX, dot.y - centerY);
              const distToWave = Math.abs(dist - waveRadius);
              let displacement = 0;

              if (distToWave < waveWidth / 2) {
                const wavePhase = (distToWave / (waveWidth / 2)) * Math.PI;
                displacement = easeInOutCubic(Math.sin(wavePhase)) * 10;
              }

              const angleToCenter = Math.atan2(dot.y - centerY, dot.x - centerX);
              const dx = Math.cos(angleToCenter) * displacement;
              const dy = Math.sin(angleToCenter) * displacement;
              const opacity = 0.2 + (Math.abs(displacement) / 10) * 0.8;
              const dotSize = 1.2 + (Math.abs(displacement) / 10) * 2;

              ctx.beginPath();
              ctx.arc(dot.x + dx, dot.y + dy, dotSize, 0, Math.PI * 2);
              ctx.fillStyle = MONOCHROME_FILL(opacity);
              ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'interconnecting-waves':
        {
          const dotRings = [
            { radius: 20, count: 12 },
            { radius: 45, count: 24 },
            { radius: 70, count: 36 },
          ];

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.001 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            dotRings.forEach((ring, ringIndex) => {
              if (ringIndex >= dotRings.length - 1) return;

              const nextRing = dotRings[ringIndex + 1];
              if (!nextRing) return;

              for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2;
                const radiusPulse1 = Math.sin(timeRef.current * 2 - ringIndex * 0.4) * 3;
                const x1 = centerX + Math.cos(angle) * (ring.radius + radiusPulse1);
                const y1 = centerY + Math.sin(angle) * (ring.radius + radiusPulse1);
                const nextRingRatio = nextRing.count / ring.count;

                for (let j = 0; j < nextRingRatio; j++) {
                  const nextAngle = ((i * nextRingRatio + j) / nextRing.count) * Math.PI * 2;
                  const radiusPulse2 = Math.sin(timeRef.current * 2 - (ringIndex + 1) * 0.4) * 3;
                  const x2 = centerX + Math.cos(nextAngle) * (nextRing.radius + radiusPulse2);
                  const y2 = centerY + Math.sin(nextAngle) * (nextRing.radius + radiusPulse2);
                  const lineOpacity =
                    0.1 +
                    ((Math.sin(timeRef.current * 3 - ringIndex * 0.5 + i * 0.3) + 1) / 2) * 0.4;

                  ctx.beginPath();
                  ctx.moveTo(x1, y1);
                  ctx.lineTo(x2, y2);
                  ctx.lineWidth = 0.75;
                  ctx.strokeStyle = MONOCHROME_STROKE(lineOpacity);
                  ctx.stroke();
                }
              }
            });

            dotRings.forEach((ring, ringIndex) => {
              for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2;
                const radiusPulse = Math.sin(timeRef.current * 2 - ringIndex * 0.4) * 3;
                const x = centerX + Math.cos(angle) * (ring.radius + radiusPulse);
                const y = centerY + Math.sin(angle) * (ring.radius + radiusPulse);
                const dotOpacity =
                  0.4 + Math.sin(timeRef.current * 2 - ringIndex * 0.4 + i * 0.2) * 0.6;

                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = MONOCHROME_FILL(dotOpacity);
                ctx.fill();
              }
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'cylindrical-analysis':
        {
          const radius = 60;
          const height = 100;
          const numLayers = 15;
          const dotsPerLayer = 25;

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.001 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const easedTime = easeInOutCubic((Math.sin(timeRef.current * 2) + 1) / 2);
            const scanY = centerY + (easedTime * 2 - 1) * (height / 2);
            const scanWidth = 15;

            for (let i = 0; i < numLayers; i++) {
              const layerY = centerY + (i / (numLayers - 1) - 0.5) * height;
              const rot = timeRef.current * (0.2 + (i % 2) * 0.1);

              for (let j = 0; j < dotsPerLayer; j++) {
                const angle = (j / dotsPerLayer) * Math.PI * 2 + rot;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const scale = (z + radius) / (radius * 2);
                const pX = centerX + x * scale;
                const pY = layerY;
                const distToScan = Math.abs(pY - scanY);
                const scanInfluence =
                  distToScan < scanWidth ? Math.cos((distToScan / scanWidth) * (Math.PI / 2)) : 0;
                const dotSize = Math.max(0, scale * 1.5 + scanInfluence * 2);
                const opacity = Math.max(0, scale * 0.5 + scanInfluence * 0.5);

                ctx.beginPath();
                ctx.arc(pX, pY, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = MONOCHROME_FILL(opacity);
                ctx.fill();
              }
            }

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'voxel-matrix-morph':
        {
          const points: Array<{ x: number; y: number; z: number }> = [];
          const gridSize = 5;
          const spacing = 20;
          const totalSize = (gridSize - 1) * spacing;

          for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
              for (let z = 0; z < gridSize; z++) {
                points.push({
                  x: (x - (gridSize - 1) / 2) * spacing,
                  y: (y - (gridSize - 1) / 2) * spacing,
                  z: (z - (gridSize - 1) / 2) * spacing,
                });
              }
            }
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.0005 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const rotX = timeRef.current * 0.4;
            const rotY = timeRef.current * 0.6;
            const easedTime = easeInOutCubic((Math.sin(timeRef.current * 2) + 1) / 2);
            const scanLine = (easedTime * 2 - 1) * (totalSize / 2 + 10);
            const scanWidth = 30;

            points.forEach(p => {
              let { x, y, z } = p;
              const nX = x * Math.cos(rotY) - z * Math.sin(rotY);
              let nZ = x * Math.sin(rotY) + z * Math.cos(rotY);
              x = nX;
              z = nZ;
              const nY = y * Math.cos(rotX) - z * Math.sin(rotX);
              nZ = y * Math.sin(rotX) + z * Math.cos(rotX);
              y = nY;
              z = nZ;

              const distToScan = Math.abs(y - scanLine);
              let scanInfluence = 0;
              let displacement = 1;

              if (distToScan < scanWidth) {
                scanInfluence = Math.cos((distToScan / scanWidth) * (Math.PI / 2));
                displacement = 1 + scanInfluence * 0.4;
              }

              const scale = (z + 80) / 160;
              const pX = centerX + x * displacement;
              const pY = centerY + y * displacement;
              const dotSize = Math.max(0, scale * 2 + scanInfluence * 2);
              const opacity = Math.max(0.1, scale * 0.7 + scanInfluence * 0.3);

              ctx.beginPath();
              ctx.arc(pX, pY, dotSize, 0, Math.PI * 2);
              ctx.fillStyle = MONOCHROME_FILL(opacity);
              ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'phased-array-emitter':
        {
          const fov = 300;
          const points: Array<{ x: number; y: number; z: number }> = [];
          const ringRadii = [20, 40, 60, 80];
          const pointsPerRing = [12, 18, 24, 30];
          const maxRadius = ringRadii[ringRadii.length - 1] ?? 80;

          ringRadii.forEach((radius, i) => {
            for (let j = 0; j < pointsPerRing[i]!; j++) {
              const angle = (j / pointsPerRing[i]!) * Math.PI * 2;
              points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: 0,
              });
            }
          });

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.001 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const rotX = 1.0;
            const rotY = timeRef.current * 0.2;
            const waveRadius = (timeRef.current * 120) % (maxRadius * 1.8);
            const waveWidth = 50;
            const waveHeight = 18;

            const pointsToDraw: Array<{
              x: number;
              y: number;
              z: number;
              size: number;
              opacity: number;
            }> = [];

            points.forEach(p_orig => {
              let { x, y, z } = p_orig;
              const distFromCenter = Math.hypot(x, y);
              const distToWave = Math.abs(distFromCenter - waveRadius);
              let waveInfluence = 0;

              if (distToWave < waveWidth / 2) {
                const wavePhase = (1 - distToWave / (waveWidth / 2)) * Math.PI;
                z = easeInOutCubic(Math.sin(wavePhase)) * waveHeight;
                waveInfluence = z / waveHeight;
              }

              const cY = Math.cos(rotY);
              const sY = Math.sin(rotY);
              const tX = x * cY - z * sY;
              let tZ = x * sY + z * cY;
              x = tX;
              z = tZ;

              const cX = Math.cos(rotX);
              const sX = Math.sin(rotX);
              const tY = y * cX - z * sX;
              tZ = y * sX + z * cX;
              y = tY;
              z = tZ;

              const scale = fov / (fov + z + 100);
              const pX = centerX + x * scale;
              const pY = centerY + y * scale;
              const dotSize = (1.5 + waveInfluence * 2.5) * scale;
              const opacity = 0.4 + waveInfluence * 0.6;

              pointsToDraw.push({ x: pX, y: pY, z, size: dotSize, opacity });
            });

            pointsToDraw
              .sort((a, b) => a.z - b.z)
              .forEach(p => {
                if (p.size < 0.1) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = MONOCHROME_FILL(p.opacity);
                ctx.fill();
              });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      case 'crystalline-cube-refraction':
        {
          const fov = 250;
          const points: Array<{ x: number; y: number; z: number }> = [];
          const gridSize = 7;
          const spacing = 15;
          const cubeHalfSize = ((gridSize - 1) * spacing) / 2;
          const maxDist = Math.hypot(cubeHalfSize, cubeHalfSize, cubeHalfSize);

          for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
              for (let z = 0; z < gridSize; z++) {
                points.push({
                  x: x * spacing - cubeHalfSize,
                  y: y * spacing - cubeHalfSize,
                  z: z * spacing - cubeHalfSize,
                });
              }
            }
          }

          animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;
            timeRef.current += deltaTime * 0.0003 * GLOBAL_SPEED;

            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const rotX = timeRef.current * 2;
            const rotY = timeRef.current * 3;
            const waveRadius = (timestamp * 0.04 * GLOBAL_SPEED) % (maxDist * 1.5);
            const waveWidth = 40;
            const displacementMagnitude = 10;

            const pointsToDraw: Array<{
              x: number;
              y: number;
              z: number;
              size: number;
              opacity: number;
            }> = [];

            points.forEach(p_orig => {
              let { x, y, z } = p_orig;
              const distFromCenter = Math.hypot(x, y, z);
              const distToWave = Math.abs(distFromCenter - waveRadius);
              let displacementAmount = 0;

              if (distToWave < waveWidth / 2) {
                const wavePhase = (distToWave / (waveWidth / 2)) * (Math.PI / 2);
                displacementAmount = easeInOutCubic(Math.cos(wavePhase)) * displacementMagnitude;
              }

              if (displacementAmount > 0 && distFromCenter > 0) {
                const ratio = (distFromCenter + displacementAmount) / distFromCenter;
                x *= ratio;
                y *= ratio;
                z *= ratio;
              }

              const cY = Math.cos(rotY);
              const sY = Math.sin(rotY);
              const tX = x * cY - z * sY;
              let tZ = x * sY + z * cY;
              x = tX;
              z = tZ;

              const cX = Math.cos(rotX);
              const sX = Math.sin(rotX);
              const tY = y * cX - z * sX;
              tZ = y * sX + z * cX;
              y = tY;
              z = tZ;

              const scale = fov / (fov + z);
              const pX = centerX + x * scale;
              const pY = centerY + y * scale;
              const waveInfluence = displacementAmount / displacementMagnitude;
              const dotSize = (1.5 + waveInfluence * 2.5) * scale;
              const opacity = Math.max(0.1, scale * 0.7 + waveInfluence * 0.4);

              if (dotSize > 0.1) {
                pointsToDraw.push({ x: pX, y: pY, z, size: dotSize, opacity });
              }
            });

            pointsToDraw
              .sort((a, b) => a.z - b.z)
              .forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = MONOCHROME_FILL(p.opacity);
                ctx.fill();
              });

            animationRef.current = requestAnimationFrame(animate);
          };
        }
        break;

      default:
        // Default to helix-scanner if type not implemented yet
        animate = (_timestamp: number) => {};
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type]);

  return (
    <div
      className="flex flex-col items-center justify-center my-12"
      role="status"
      aria-label="Loading"
    >
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="block" />
      <p className="mt-4 text-[#858585] text-sm">Analyzing formats...</p>
    </div>
  );
}
