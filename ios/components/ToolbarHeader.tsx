/**
 * ToolbarHeader — iOS screen header / navigation bar.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4648:7286
 *
 * Variants:
 *   default     — compact sheet/modal header. py-16 px-20, centered title,
 *                 left ToolbarButton + optional right ToolbarButton.
 *   scrolled    — same as default but with gradient underscrim.
 *   onboarding  — same as default with no back button.
 *   screen      — full-page navigation header (node 6957-178974). 116px tall,
 *                 bottom-aligned, left-aligned title (18px/400), right
 *                 slot for arbitrary GlassIconButton elements.
 */

import { ToolbarButton } from './ToolbarButton';
import type { ToolbarButtonVariant } from './ToolbarButton';
import type { ReactNode } from 'react';

export type ToolbarHeaderVariant = 'default' | 'scrolled' | 'onboarding' | 'screen';

export interface ToolbarHeaderProps {
  title?: string;
  variant?: ToolbarHeaderVariant;
  /** Left button variant. Defaults to "back". Set to undefined to hide. */
  leftButton?: ToolbarButtonVariant | null;
  /** Right button variant. Set to undefined to hide. */
  rightButton?: ToolbarButtonVariant | null;
  rightButtonLabel?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  /** Replaces the title string with custom content. */
  titleSlot?: ReactNode;
  /**
   * Right-side content for the "screen" variant.
   * Typically one or more <GlassIconButton> elements.
   */
  rightButtons?: ReactNode;
}

export function ToolbarHeader({
  title,
  variant = 'default',
  leftButton = 'back',
  rightButton,
  rightButtonLabel,
  onLeftPress,
  onRightPress,
  titleSlot,
  rightButtons,
}: ToolbarHeaderProps) {
  const isScrolled = variant === 'scrolled';
  const isOnboarding = variant === 'onboarding';
  const isScreen = variant === 'screen';

  // ── screen variant ────────────────────────────────────────────────────────
  if (isScreen) {
    return (
      <div
        style={{
          width: '100%',
          height: 68,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 20px 12px',
          boxSizing: 'border-box',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.02)',
          borderBottom: '1px solid var(--ios-dark-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{
            flex: 1,
            fontFamily: 'var(--ios-font)',
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.4,
            color: 'var(--ios-dark-90)',
            minWidth: 0,
          }}>
            {titleSlot ?? title}
          </span>
          {rightButtons && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {rightButtons}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── default / scrolled / onboarding variants ──────────────────────────────
  return (
    <div
      style={{
        width: '100%',
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        flexShrink: 0,
        background: isScrolled
          ? 'linear-gradient(to bottom, var(--ios-background-gray) 60%, rgba(247,247,247,0))'
          : 'transparent',
        zIndex: 10,
      }}
    >
      {/* Left slot */}
      <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {!isOnboarding && leftButton != null && (
          <ToolbarButton variant={leftButton} onClick={onLeftPress} aria-label="Back" />
        )}
      </div>

      {/* Center title — 200px centered */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
        }}
      >
        {titleSlot ?? (
          <span
            style={{
              fontFamily: 'var(--ios-font)',
              fontSize: 'var(--ios-h3-size)',
              fontWeight: 'var(--ios-h3-weight)' as unknown as number,
              lineHeight: 'var(--ios-h3-lh)',
              color: 'var(--ios-dark-90)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 200,
            }}
          >
            {title}
          </span>
        )}
      </div>

      {/* Right slot */}
      <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {rightButton != null && (
          <ToolbarButton
            variant={rightButton}
            label={rightButtonLabel}
            buttonStyle={rightButton === 'primary' ? 'primary' : 'glass'}
            onClick={onRightPress}
          />
        )}
      </div>
    </div>
  );
}
