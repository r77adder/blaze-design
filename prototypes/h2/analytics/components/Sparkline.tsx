/**
 * Tiny inline-SVG sparkline — area + line, normalized to its own min/max.
 * Matches the existing H2 sparkline convention (SeoAeo / LandingPages): no
 * chart library, just a polyline. Neutral by default so it reads as texture in
 * a dense row, not a colored accent.
 */
export function Sparkline({
  data,
  width = 104,
  height = 28,
  stroke = 'var(--dark-40)',
  fill = 'rgba(0, 0, 0, 0.05)',
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (data.length < 2) return <svg width={width} height={height} aria-hidden />;

  const pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + innerH - ((v - min) / span) * innerH;
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)} ${height} L${pts[0]![0].toFixed(1)} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: 'block' }}>
      <path d={area} fill={fill} stroke="none" />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
