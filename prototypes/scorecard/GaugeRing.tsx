import { useEffect, useState } from 'react';

interface GaugeRingProps {
  score: number;
  max: number;
  /** Stroke color for the foreground arc. Accepts CSS color or `var(--…)`. */
  color: string;
  size: number;
  strokeWidth?: number;
  /** Track color behind the foreground arc. Defaults to `var(--dark-8)`. */
  trackColor?: string;
  /** Faded disk fill *inside* the ring. Set to give the number visual weight. */
  diskColor?: string;
  /** When true, animate from 0 → score on mount (ease-out cubic, 900ms). */
  animate?: boolean;
  /** Optional content centered inside the ring (e.g. score number, delta). */
  children?: React.ReactNode;
}

function useAnimatedValue(target: number, enabled: boolean, duration = 900): number {
  const [current, setCurrent] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return current;
}

export function GaugeRing({
  score,
  max,
  color,
  size,
  strokeWidth = 8,
  trackColor = 'var(--dark-8)',
  diskColor,
  animate = false,
  children,
}: GaugeRingProps) {
  const animated = useAnimatedValue(score, animate);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - animated / max);
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {diskColor && (
          <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill={diskColor} />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          style={{ stroke: trackColor }}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Hook variant — exposed so consumers can show the animated number themselves
 *  while still using the ring's animation as the source of truth. */
export function useAnimatedScore(target: number, duration = 900): number {
  return useAnimatedValue(target, true, duration);
}
