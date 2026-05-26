/**
 * Radio — iOS radio button.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4927:9034
 *
 * Default: 20×20 white circle, dark-8 border, r12.
 * Selected: dark-90 fill, r99, white check mark 10×10.
 */

export interface RadioProps {
  selected?: boolean;
  onChange?: (selected: boolean) => void;
  disabled?: boolean;
}

export function Radio({ selected = false, onChange, disabled = false }: RadioProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!selected)}
      style={{
        width: 20,
        height: 20,
        borderRadius: selected ? 99 : 12,
        background: selected ? 'var(--ios-dark-90)' : 'var(--ios-light-100)',
        border: selected ? 'none' : '1.5px solid var(--ios-dark-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        padding: 0,
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        WebkitAppearance: 'none',
        appearance: 'none',
        transition: 'background 0.15s ease, border-radius 0.15s ease',
        boxSizing: 'border-box',
      }}
    >
      {selected && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M2 5l2.2 2.5L8 2.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
