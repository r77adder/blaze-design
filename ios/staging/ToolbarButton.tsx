/**
 * ToolbarButton — iOS toolbar icon button.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4648:7288
 *
 * 44×44 outer container (r99). Inner pill is 32px tall, r6.
 * style="glass"   → light-60 bg + glass blur + inset ring
 * style="primary" → dark-90 bg
 *
 * Variants:
 *   close   — × icon
 *   back    — ‹ chevron icon
 *   add     — + icon
 *   label   — text label inside pill
 *   primary — ✓ check icon (dark-90 bg)
 *   counter — back chevron + numeric badge
 */

import type { CSSProperties, ReactNode } from 'react';

export type ToolbarButtonVariant = 'close' | 'back' | 'add' | 'label' | 'primary' | 'counter';
export type ToolbarButtonStyle = 'glass' | 'primary';

export interface ToolbarButtonProps {
  variant?: ToolbarButtonVariant;
  /** Text shown when variant="label". */
  label?: string;
  /** Count shown when variant="counter". */
  count?: number;
  /** Visual fill style. Defaults to "glass". Primary variant forces "primary". */
  buttonStyle?: ToolbarButtonStyle;
  /** Custom SVG/PNG icon src — overrides the built-in variant icon. */
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

const GLASS_STYLE: CSSProperties = {
  background: 'var(--ios-light-60)',
  backdropFilter: 'var(--ios-glass-blur)',
  WebkitBackdropFilter: 'var(--ios-glass-blur)',
  boxShadow: 'var(--ios-glass-shadow), inset 0 0 0 0.5px var(--ios-dark-8)',
};

const PRIMARY_STYLE: CSSProperties = {
  background: 'var(--ios-dark-90)',
};

function CloseIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path d="M8 1L2 8l6 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M1 6l4.5 5L13 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ToolbarButton({
  variant = 'close',
  label,
  count,
  buttonStyle,
  icon,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
}: ToolbarButtonProps) {
  const isPrimary = variant === 'primary' || buttonStyle === 'primary';
  const pillStyle: CSSProperties = isPrimary ? PRIMARY_STYLE : GLASS_STYLE;
  const iconColor = isPrimary ? '#ffffff' : 'var(--ios-dark-90)';

  let inner: ReactNode;

  if (icon) {
    inner = (
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        style={{ width: 20, height: 20, opacity: isPrimary ? 1 : 0.85 }}
      />
    );
  } else if (variant === 'close') {
    inner = <CloseIcon color={iconColor} />;
  } else if (variant === 'back') {
    inner = <BackIcon color={iconColor} />;
  } else if (variant === 'add') {
    inner = <AddIcon color={iconColor} />;
  } else if (variant === 'primary') {
    inner = <CheckIcon color={iconColor} />;
  } else if (variant === 'label') {
    inner = (
      <span
        style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '20px',
          color: iconColor,
          whiteSpace: 'nowrap',
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        {label}
      </span>
    );
  } else if (variant === 'counter') {
    inner = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <BackIcon color={iconColor} />
        {count !== undefined && count > 0 && (
          <span
            style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '16px',
              color: iconColor,
            }}
          >
            {count}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 99,
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        WebkitAppearance: 'none',
        appearance: 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...pillStyle,
        }}
      >
        {inner}
      </div>
    </button>
  );
}
