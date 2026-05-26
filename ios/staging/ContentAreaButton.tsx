/**
 * ContentAreaButton — in-screen action button.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4929:11080
 *
 * type × size matrix:
 *   type:  primary | secondary | tertiary
 *   size:  xs (24px) | s (32px) | m (40px) | l (52px) | xl (60px)
 *
 * r99 capsule.
 * Primary:   dark-90 fill, light-100 text.
 * Secondary: light-100 fill, dark-8 border, dark-90 text.
 * Tertiary:  transparent fill, dark-90 text.
 */

import type { CSSProperties, ReactNode } from 'react';

export type ContentAreaButtonType = 'primary' | 'secondary' | 'tertiary';
export type ContentAreaButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface ContentAreaButtonProps {
  type?: ContentAreaButtonType;
  size?: ContentAreaButtonSize;
  label: string;
  leftIcon?: string;
  rightIcon?: string;
  showChevron?: boolean;
  creditsAmount?: number;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const SIZE_MAP: Record<ContentAreaButtonSize, { height: number; fontSize: number; px: number; gap: number }> = {
  xs: { height: 24, fontSize: 12, px: 8,  gap: 4 },
  s:  { height: 32, fontSize: 13, px: 12, gap: 4 },
  m:  { height: 40, fontSize: 14, px: 16, gap: 6 },
  l:  { height: 52, fontSize: 16, px: 20, gap: 8 },
  xl: { height: 60, fontSize: 16, px: 24, gap: 8 },
};

export function ContentAreaButton({
  type = 'primary',
  size = 'm',
  label,
  leftIcon,
  rightIcon,
  showChevron,
  creditsAmount,
  onClick,
  disabled = false,
  fullWidth = false,
}: ContentAreaButtonProps) {
  const { height, fontSize, px, gap } = SIZE_MAP[size];
  const iconSize = fontSize + 2;

  let bgStyle: CSSProperties;
  let textColor: string;

  if (type === 'primary') {
    bgStyle = { background: 'var(--ios-dark-90)' };
    textColor = 'var(--ios-light-100)';
  } else if (type === 'secondary') {
    bgStyle = {
      background: 'var(--ios-light-100)',
      border: '1px solid var(--ios-dark-8)',
    };
    textColor = 'var(--ios-dark-90)';
  } else {
    bgStyle = { background: 'transparent' };
    textColor = 'var(--ios-dark-90)';
  }

  const chevronColor = type === 'primary' ? 'rgba(255,255,255,0.6)' : 'var(--ios-dark-40)';

  const children: ReactNode[] = [];

  if (leftIcon) {
    children.push(
      <img key="left-icon" src={leftIcon} alt="" aria-hidden="true"
        style={{ width: iconSize, height: iconSize, opacity: type === 'primary' ? 1 : 0.8 }} />
    );
  }

  children.push(
    <span key="label" style={{
      fontFamily: 'var(--ios-font)',
      fontSize,
      fontWeight: 500,
      lineHeight: 1.4,
      color: textColor,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );

  if (creditsAmount !== undefined) {
    children.push(
      <span key="credits" style={{
        fontFamily: 'var(--ios-font)',
        fontSize: fontSize - 2,
        fontWeight: 400,
        color: type === 'primary' ? 'rgba(255,255,255,0.6)' : 'var(--ios-dark-40)',
        whiteSpace: 'nowrap',
      }}>
        {creditsAmount} credits
      </span>
    );
  }

  if (rightIcon) {
    children.push(
      <img key="right-icon" src={rightIcon} alt="" aria-hidden="true"
        style={{ width: iconSize, height: iconSize }} />
    );
  }

  if (showChevron) {
    children.push(
      <svg key="chevron" width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
        <path d="M1 1l6 5.5L1 12" stroke={chevronColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        paddingLeft: px,
        paddingRight: px,
        borderRadius: 99,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        border: 'none',
        width: fullWidth ? '100%' : undefined,
        WebkitAppearance: 'none',
        appearance: 'none',
        flexShrink: 0,
        ...bgStyle,
      }}
    >
      {children}
    </button>
  );
}
