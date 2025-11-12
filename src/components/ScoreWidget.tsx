import { useEffect, useRef } from 'react';

interface ScoreWidgetProps {
  title: string;
  description: string;
  score: number | null;
  maxScore?: number;
}

enum Strength {
  None = 'none',
  Weak = 'weak',
  Moderate = 'moderate',
  Strong = 'strong',
}

function getStrength(score: number | null, maxScore: number): Strength {
  if (score === null) return Strength.None;
  const percent = score / maxScore;
  if (percent >= 0.8) return Strength.Strong;
  if (percent >= 0.4) return Strength.Moderate;
  return Strength.Weak;
}

function circumference(r: number): number {
  return 2 * Math.PI * r;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function ScoreHalfCircle({ value, max }: { value: number | null; max: number }) {
  const strokeRef = useRef<SVGCircleElement>(null);
  const gradIdRef = useRef(`grad-${Math.random().toString(36).substring(2, 8)}`);
  const gradId = gradIdRef.current;

  const radius = 45;
  const dist = circumference(radius);
  const distHalf = dist / 2;
  const distFourth = distHalf / 2;
  const strokeDasharray = `${distHalf} ${distHalf}`;
  const distForValue = Math.min((value ?? 0) / max, 1) * -distHalf;
  const strokeDashoffset = value !== null ? distForValue : -distFourth;

  const strength = getStrength(value, max);

  const strengthColors: Record<Strength, string[]> = {
    none: ['#3e3e42', '#858585'],
    weak: ['#f48771', '#f48771'],
    moderate: ['#dcdcaa', '#dcdcaa'],
    strong: ['#4ec9b0', '#4ec9b0'],
  };

  const colorStops = strengthColors[strength];

  useEffect(() => {
    if (!strokeRef.current || value === null) return;

    const strokeStart = 400;
    const duration = 1400;

    strokeRef.current.animate(
      [
        { strokeDashoffset: 0, offset: 0 },
        { strokeDashoffset: 0, offset: strokeStart / duration },
        { strokeDashoffset },
      ],
      {
        duration,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        fill: 'forwards',
      }
    );
  }, [value, max, strokeDashoffset]);

  return (
    <svg className="score-widget__half-circle" viewBox="0 0 100 50" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          {colorStops.map((stop, i) => {
            const offset = `${(100 / (colorStops.length - 1)) * i}%`;
            return <stop key={i} offset={offset} stopColor={stop} />;
          })}
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth="10" transform="translate(50, 50.5)">
        <circle className="score-widget__half-circle-track" r={radius} />
        <circle
          ref={strokeRef}
          stroke={colorStops[0]}
          strokeDasharray={strokeDasharray}
          r={radius}
        />
      </g>
    </svg>
  );
}

function ScoreDisplay({ value, max }: { value: number | null; max: number }) {
  const hasValue = value !== null;
  const digits = hasValue ? String(Math.floor(value)).split('') : [];
  const maxFormatted = formatNumber(max);
  const label = hasValue ? `out of ${maxFormatted}` : 'No score';

  return (
    <div className="score-widget__score-display">
      <div className={`score-widget__score${hasValue ? ' score-widget__score--animated' : ''}`}>
        <div className="score-widget__score-digits score-widget__score-digits--dimmed">
          <div className="score-widget__score-digit">0</div>
        </div>
        {hasValue && (
          <div className="score-widget__score-digits">
            {digits.map((digit, i) => (
              <span key={i} className="score-widget__score-digit">
                {digit}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="score-widget__score-label">{label}</div>
    </div>
  );
}

function ScoreHeader({ title, strength }: { title: string; strength: Strength }) {
  const hasStrength = strength !== Strength.None;
  const badgeClass = `score-widget__badge score-widget__badge--${strength}`;

  return (
    <div className="score-widget__header">
      <h3 className="score-widget__title">{title}</h3>
      {hasStrength && <span className={badgeClass}>{strength.toUpperCase()}</span>}
    </div>
  );
}

export function ScoreWidget({ title, description, score, maxScore = 100 }: ScoreWidgetProps) {
  const strength = getStrength(score, maxScore);

  return (
    <div className="score-widget">
      <div className="score-widget__surface">
        <div className="score-widget__content">
          <ScoreHeader title={title} strength={strength} />
          <div className="score-widget__graph-container">
            <ScoreHalfCircle value={score} max={maxScore} />
            <ScoreDisplay value={score} max={maxScore} />
          </div>
          <p className="score-widget__description">{description}</p>
        </div>
      </div>
    </div>
  );
}
