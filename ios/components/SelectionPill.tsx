/**
 * SelectionPill — filter/selection chip.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4969:13255
 *
 * r99, px-12 py-8, 16px Söhne.
 * Default:  dark-3 bg, dark-4 border, weight 400.
 * Selected: white bg, dark-90 border, weight 500.
 */

export interface SelectionPillProps {
  label: string;
  selected?: boolean;
  /** Optional numeric counter shown after the label as a dimmer, smaller
   *  tabular-numeric chip. Mirrors the H2 prototype's TabChip pattern
   *  (`src/staging/TabChip`). Omit (or set to undefined) to hide. */
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export function SelectionPill({
  label,
  selected = false,
  count,
  onClick,
  disabled = false,
}: SelectionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 99,
        background: selected ? 'var(--ios-light-100)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${selected ? 'var(--ios-dark-90)' : 'var(--ios-dark-4)'}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        WebkitAppearance: 'none',
        appearance: 'none',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 16,
          fontWeight: selected ? 500 : 400,
          lineHeight: 1.5,
          color: 'var(--ios-dark-90)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {count !== undefined && (
        <span
          style={{
            fontFamily: 'var(--ios-font)',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1,
            color: 'var(--ios-dark-40)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
