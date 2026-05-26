/**
 * Toggle — iOS on/off switch.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4965:13021
 *
 * 64×28, r100.
 * On:  dark-90 fill, white knob 39×24 at right edge.
 * Off: rgba(0,0,0,0.15) fill, white knob at left edge.
 */

export interface ToggleProps {
  on?: boolean;
  onChange?: (on: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ on = false, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!on)}
      style={{
        width: 64,
        height: 28,
        borderRadius: 100,
        background: on ? 'var(--ios-dark-90)' : 'rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        justifyContent: on ? 'flex-end' : 'flex-start',
        cursor: disabled ? 'default' : 'pointer',
        border: 'none',
        opacity: disabled ? 0.4 : 1,
        WebkitAppearance: 'none',
        appearance: 'none',
        transition: 'background 0.2s ease, justify-content 0.2s ease',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 39,
          height: 24,
          borderRadius: 99,
          background: 'var(--ios-light-100)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      />
    </button>
  );
}
