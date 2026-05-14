/**
 * ToolbarButton — iOS toolbar icon button.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5
 *   Close    4372-12096   Back     4372-12098   Add     4771-171340
 *   Submit   4372-12100   Label    4372-13551   Counter 4806-265563
 *   Settings 6957-177957  Credits  4404-17945   Upgrade 4404-17950
 *
 * Structure (all variants):
 *   Outer container — glass pill (p:6, r:99, bg light-60, shadow 0 0 32 rgba(0,0,0,0.08))
 *     Inner wrapper  — transparent 32px wrapper (r:6, p:6, flex gap:2)
 *       Content      — icon / text / badge
 *
 * Primary (submit): outer bg is dark-90 instead of glass.
 */

import type { CSSProperties, ReactNode } from 'react';
import creditsIconSrc from '@ios/icons/credits.svg';
import settingsIconSrc from '@ios/icons/settings.svg';

export type ToolbarButtonVariant =
  | 'close'
  | 'back'
  | 'add'
  | 'label'
  | 'primary'
  | 'counter'
  | 'settings'
  | 'credits'
  | 'upgrade';

export type ToolbarButtonStyle = 'glass' | 'primary';

export interface ToolbarButtonProps {
  variant?: ToolbarButtonVariant;
  /** Text shown when variant="label". */
  label?: string;
  /** Count shown when variant="counter". */
  count?: number;
  /** Credit count shown when variant="credits". */
  credits?: number;
  /** Visual fill style. Defaults to "glass". Primary variant forces "primary". */
  buttonStyle?: ToolbarButtonStyle;
  /** Custom SVG/PNG icon src — overrides the built-in variant icon. */
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

// ── inline icons ────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" stroke="var(--ios-dark-90)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path d="M8 1L2 8l6 7" stroke="var(--ios-dark-90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="var(--ios-dark-90)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M1 6l4.5 5L13 1" stroke="var(--ios-light-100)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── component ────────────────────────────────────────────────────────────────

export function ToolbarButton({
  variant = 'close',
  label,
  count,
  credits,
  buttonStyle,
  icon,
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
}: ToolbarButtonProps) {
  const isPrimary = variant === 'primary' || buttonStyle === 'primary';

  const outerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 99,
    background: isPrimary ? 'var(--ios-dark-90)' : 'rgba(255,255,255,0.6)',
    boxShadow: '0 0 32px rgba(0,0,0,0.08)',
    backdropFilter: isPrimary ? undefined : 'blur(4px)',
    WebkitBackdropFilter: isPrimary ? undefined : 'blur(4px)',
    overflow: 'hidden',
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    WebkitAppearance: 'none',
    appearance: 'none',
    flexShrink: 0,
  };

  const innerStyle: CSSProperties = {
    height: 32,
    borderRadius: 6,
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  };

  // ── content per variant ──────────────────────────────────────────────────

  let content: ReactNode;

  if (icon) {
    // custom icon override
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
      </div>
    );
  } else if (variant === 'close') {
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CloseIcon />
      </div>
    );
  } else if (variant === 'back') {
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BackIcon />
      </div>
    );
  } else if (variant === 'add') {
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AddIcon />
      </div>
    );
  } else if (variant === 'primary') {
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckIcon />
      </div>
    );
  } else if (variant === 'counter') {
    content = (
      <>
        {/* Back chevron */}
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BackIcon />
        </div>
        {/* Count badge */}
        {count !== undefined && count > 0 && (
          <div style={{
            width: 20,
            height: 20,
            borderRadius: 12,
            background: 'var(--ios-dark-90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 1,
              color: 'var(--ios-light-100)',
              letterSpacing: '0.42px',
              fontVariantNumeric: 'lining-nums tabular-nums',
            }}>
              {count}
            </span>
          </div>
        )}
      </>
    );
  } else if (variant === 'settings') {
    content = (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={settingsIconSrc} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
      </div>
    );
  } else if (variant === 'credits') {
    content = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingLeft: 2, paddingRight: 2 }}>
        <img src={creditsIconSrc} alt="" aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.39,
          color: 'var(--ios-dark-90)',
          letterSpacing: '0.28px',
          whiteSpace: 'nowrap',
        }}>
          {credits ?? 0}
        </span>
      </div>
    );
  } else if (variant === 'upgrade') {
    content = (
      <div style={{ paddingLeft: 2, paddingRight: 2 }}>
        <span style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.39,
          color: '#6a00ff',
          letterSpacing: '0.14px',
          whiteSpace: 'nowrap',
        }}>
          {label ?? 'Upgrade'}
        </span>
      </div>
    );
  } else if (variant === 'label') {
    content = (
      <div style={{ paddingLeft: 2, paddingRight: 2 }}>
        <span style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.39,
          color: 'var(--ios-dark-90)',
          letterSpacing: '0.14px',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={outerStyle}
    >
      <div style={innerStyle}>
        {content}
      </div>
    </button>
  );
}
