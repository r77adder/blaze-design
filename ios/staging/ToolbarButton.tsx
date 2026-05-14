/**
 * ToolbarButton — iOS toolbar icon button.
 * ToolbarButtonGroup — multiple buttons in one shared glass pill.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5
 *   Close    4372-12096   Back     4372-12098   Add       4771-171340
 *   Submit   4372-12100   Label    4372-13551   Counter   4806-265563
 *   Settings 6957-177957  Credits  4404-17945   Upgrade   4404-17950
 *   Group (two together)  7165-275178  — gap:10, e.g. more-dots + help
 *   Group (calendar)      7165-275276  — gap:8,  e.g. "Today" label + filter icon
 *
 * Single button structure:
 *   Outer  — glass pill (p:6 r:99 bg rgba(255,255,255,0.6) shadow 0 0 32px rgba(0,0,0,0.08))
 *   Inner  — transparent wrapper (h:32 r:6 p:6 flex gap:2)
 *   Primary variant: outer bg var(--ios-dark-90), no backdrop-filter.
 *
 * Group structure:
 *   Shared glass pill (same outer styling, gap between slot buttons)
 *   Each slot — transparent <button> (h:32 r:6 p:6 flex gap:2)
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
  /** Text shown when variant="label" or "upgrade". */
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

// ── slot descriptor used by ToolbarButtonGroup ───────────────────────────────

export interface ToolbarGroupSlot {
  variant?: ToolbarButtonVariant;
  label?: string;
  icon?: string;
  credits?: number;
  count?: number;
  onClick?: () => void;
  'aria-label'?: string;
}

export interface ToolbarButtonGroupProps {
  slots: ToolbarGroupSlot[];
  /**
   * px gap between inner slot buttons inside the shared pill.
   * Figma: 10 for "two together", 8 for "calendar". Default: 8.
   */
  gap?: number;
}

// ── inline icons ─────────────────────────────────────────────────────────────

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

/** Three-line filter/sort icon — used in the calendar group slot. */
function FilterIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M1 2h14M3 6h10M5 10h6" stroke="var(--ios-dark-90)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── shared inner content renderer ─────────────────────────────────────────────

function renderSlotContent(slot: ToolbarGroupSlot, isPrimary = false): ReactNode {
  const { variant = 'close', label, icon, credits, count } = slot;

  if (icon) {
    return (
      <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={icon} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  switch (variant) {
    case 'close':
      return (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CloseIcon />
        </div>
      );
    case 'back':
      return (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BackIcon />
        </div>
      );
    case 'add':
      return (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AddIcon />
        </div>
      );
    case 'primary':
      return (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon />
        </div>
      );
    case 'counter':
      return (
        <>
          <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BackIcon />
          </div>
          {count !== undefined && count > 0 && (
            <div style={{
              width: 20, height: 20, borderRadius: 12,
              background: 'var(--ios-dark-90)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'var(--ios-font)', fontSize: 12, fontWeight: 400,
                lineHeight: 1, color: 'var(--ios-light-100)',
                letterSpacing: '0.42px', fontVariantNumeric: 'lining-nums tabular-nums',
              }}>
                {count}
              </span>
            </div>
          )}
        </>
      );
    case 'settings':
      return (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={settingsIconSrc} alt="" aria-hidden="true" style={{ width: 20, height: 20 }} />
        </div>
      );
    case 'credits':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingLeft: 2, paddingRight: 2 }}>
          <img src={creditsIconSrc} alt="" aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--ios-font)', fontSize: 14, fontWeight: 400,
            lineHeight: 1.39, color: 'var(--ios-dark-90)',
            letterSpacing: '0.28px', whiteSpace: 'nowrap',
          }}>
            {credits ?? 0}
          </span>
        </div>
      );
    case 'upgrade':
      return (
        <div style={{ paddingLeft: 2, paddingRight: 2 }}>
          <span style={{
            fontFamily: 'var(--ios-font)', fontSize: 14, fontWeight: 400,
            lineHeight: 1.39, color: '#6a00ff',
            letterSpacing: '0.14px', whiteSpace: 'nowrap',
          }}>
            {label ?? 'Upgrade'}
          </span>
        </div>
      );
    case 'label':
    default:
      return (
        <div style={{ paddingLeft: 2, paddingRight: 2 }}>
          <span style={{
            fontFamily: 'var(--ios-font)', fontSize: 14, fontWeight: 400,
            lineHeight: 1.39, color: 'var(--ios-dark-90)',
            letterSpacing: '0.14px', whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        </div>
      );
  }
}

// ── glass outer style (shared) ────────────────────────────────────────────────

const GLASS_OUTER: CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  boxShadow: '0 0 32px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  overflow: 'hidden',
  borderRadius: 99,
  padding: 6,
};

const INNER_SLOT: CSSProperties = {
  height: 32,
  borderRadius: 6,
  padding: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  WebkitAppearance: 'none',
  appearance: 'none',
  flexShrink: 0,
};

// ── ToolbarButton ─────────────────────────────────────────────────────────────

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
    ...(isPrimary
      ? { background: 'var(--ios-dark-90)', boxShadow: '0 0 32px rgba(0,0,0,0.08)', overflow: 'hidden', borderRadius: 99, padding: 6 }
      : GLASS_OUTER),
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    WebkitAppearance: 'none',
    appearance: 'none',
    flexShrink: 0,
  };

  return (
    <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={onClick} style={outerStyle}>
      <div style={{ height: 32, borderRadius: 6, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {renderSlotContent({ variant, label, icon, credits, count }, isPrimary)}
      </div>
    </button>
  );
}

// ── ToolbarButtonGroup ────────────────────────────────────────────────────────

/**
 * Multiple buttons inside one shared glass pill.
 *
 * Usage — two together (dots + help):
 *   <ToolbarButtonGroup gap={10} slots={[
 *     { icon: moreDotsIcon, onClick: … },
 *     { icon: helpIcon, onClick: … },
 *   ]} />
 *
 * Usage — calendar (Today + filter):
 *   <ToolbarButtonGroup slots={[
 *     { variant: 'label', label: 'Today', onClick: … },
 *     { variant: 'filter', onClick: … },
 *   ]} />
 */
export function ToolbarButtonGroup({ slots, gap = 8 }: ToolbarButtonGroupProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        ...GLASS_OUTER,
      }}
    >
      {slots.map((slot, i) => (
        <button
          key={i}
          type="button"
          aria-label={slot['aria-label']}
          onClick={slot.onClick}
          style={INNER_SLOT}
        >
          {renderSlotContent(slot)}
        </button>
      ))}
    </div>
  );
}

// ── FilterIcon export for calendar slot ───────────────────────────────────────
// Consumers can pass this as a custom icon via the `icon` prop, or use it directly.
export { FilterIcon };
