/**
 * GlassIconButton — glass-pill toolbar icon button.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 6957-177957
 *
 * A frosted-glass pill (r99, 44px outer) containing a 32×32 inner zone
 * with a single 20×20 icon. Used in screen headers as action buttons.
 */

export interface GlassIconButtonProps {
  icon: string;
  label?: string;
  onClick?: () => void;
}

export function GlassIconButton({ icon, label, onClick }: GlassIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 99,
        border: 'none',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: '0 0 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
      </div>
    </button>
  );
}
