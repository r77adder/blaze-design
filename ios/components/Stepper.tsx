/**
 * Stepper — iOS numeric increment/decrement control.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 7140-268875
 *
 * Pill-shaped container (h:32, r:24) with a − button, numeric value,
 * and + button. Buttons disable at min/max bounds.
 */

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

function MinusIcon() {
  return (
    <svg width="12" height="2" viewBox="0 0 12 2" fill="none" aria-hidden="true">
      <path d="M1 1h10" stroke="var(--ios-dark-80)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="var(--ios-dark-80)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Stepper({ value, min, max, onChange }: StepperProps) {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 40,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    borderRadius: 99,
    flexShrink: 0,
    padding: 0,
    WebkitAppearance: 'none',
    appearance: 'none',
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 32,
        borderRadius: 24,
        background: 'rgba(0,0,0,0.03)',
        flexShrink: 0,
      }}
    >
      {/* Decrement */}
      <button
        type="button"
        aria-label="Decrease"
        disabled={atMin}
        onClick={() => !atMin && onChange(value - 1)}
        style={btnStyle(atMin)}
      >
        <MinusIcon />
      </button>

      {/* Value */}
      <div
        style={{
          width: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--ios-font)',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 1.4,
          color: 'var(--ios-dark-80)',
          flexShrink: 0,
        }}
      >
        {value}
      </div>

      {/* Increment */}
      <button
        type="button"
        aria-label="Increase"
        disabled={atMax}
        onClick={() => !atMax && onChange(value + 1)}
        style={btnStyle(atMax)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
