/**
 * Creative thumbnail. With a `seed` it renders a deterministic stock image
 * (so a given asset always shows the same picture); without one it falls back
 * to a neutral gradient placeholder.
 */
export function Thumb({ size = 36, seed }: { size?: number; seed?: string }) {
  if (seed) {
    // Fixed fetch resolution (independent of display size) so the same seed is
    // requested once and reused from cache across the table + drawer.
    return (
      <img
        src={`https://picsum.photos/seed/${encodeURIComponent(seed)}/96/96`}
        alt=""
        aria-hidden
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--dark-8)', flexShrink: 0, display: 'block', background: 'var(--dark-4)' }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        background: 'linear-gradient(135deg, var(--dark-4), var(--dark-8))',
        border: '1px solid var(--dark-8)',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}
