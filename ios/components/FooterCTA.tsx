/**
 * FooterCTA — bottom action area with gradient underscrim.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4933:11457
 *
 * Absolutely positioned at bottom of PhoneFrame (above TabBar if present).
 * A 126 px container with gradient fade fades content below the actions.
 *
 * Variants:
 *   cta            — Full-width primary button + optional secondary + microcopy
 *   floating       — Upload-style floating icon button (right-aligned)
 *   media-library  — Clear + Delete side-by-side buttons
 *   approval       — ‹ Prev / Approve › Approve All nav capsule
 *   no-approval    — ‹ Prev / Skip › capsule (no approve action)
 */

import { ContentAreaButton } from './ContentAreaButton';

export type FooterCTAVariant = 'cta' | 'floating' | 'media-library' | 'approval' | 'no-approval';

export interface FooterCTAProps {
  variant?: FooterCTAVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  microcopy?: string;
  uploadIcon?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Bottom offset in px — use when a TabBar is present (default 84). */
  bottomOffset?: number;
}

export function FooterCTA({
  variant = 'cta',
  primaryLabel = 'Continue',
  secondaryLabel,
  microcopy,
  uploadIcon,
  onPrimary,
  onSecondary,
  onPrev,
  onNext,
  bottomOffset = 84,
}: FooterCTAProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        height: 126,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 20px 16px',
        background: 'linear-gradient(to bottom, rgba(247,247,247,0), var(--ios-background-gray) 60%)',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <div style={{ pointerEvents: 'all' }}>
        {variant === 'cta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <ContentAreaButton
              type="primary"
              size="l"
              label={primaryLabel}
              fullWidth
              onClick={onPrimary}
            />
            {secondaryLabel && (
              <ContentAreaButton
                type="secondary"
                size="l"
                label={secondaryLabel}
                fullWidth
                onClick={onSecondary}
              />
            )}
            {microcopy && (
              <span
                style={{
                  fontFamily: 'var(--ios-font)',
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'var(--ios-dark-40)',
                  textAlign: 'center',
                }}
              >
                {microcopy}
              </span>
            )}
          </div>
        )}

        {variant === 'floating' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onPrimary}
              style={{
                width: 55,
                height: 55,
                borderRadius: 99,
                background: 'var(--ios-dark-90)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            >
              {uploadIcon ? (
                <img src={uploadIcon} alt="" aria-hidden="true" style={{ width: 22, height: 22 }} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M11 3v16M3 11h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        )}

        {variant === 'media-library' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <ContentAreaButton
              type="secondary"
              size="l"
              label="Clear"
              fullWidth
              onClick={onSecondary}
            />
            <ContentAreaButton
              type="primary"
              size="l"
              label="Delete"
              fullWidth
              onClick={onPrimary}
            />
          </div>
        )}

        {(variant === 'approval' || variant === 'no-approval') && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--ios-light-60)',
                backdropFilter: 'var(--ios-glass-blur)',
                WebkitBackdropFilter: 'var(--ios-glass-blur)',
                boxShadow: 'var(--ios-glass-shadow), inset 0 0 0 0.5px var(--ios-dark-8)',
                borderRadius: 99,
                padding: 4,
                gap: 2,
              }}
            >
              <NavCapsuleButton label="‹ Prev" onClick={onPrev} />
              {variant === 'approval' ? (
                <>
                  <NavCapsuleButton label="Approve" onClick={onPrimary} primary />
                  <NavCapsuleButton label="Approve All ›" onClick={onNext} />
                </>
              ) : (
                <NavCapsuleButton label="Skip ›" onClick={onNext} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavCapsuleButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 40,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 99,
        background: primary ? 'var(--ios-dark-90)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--ios-font)',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.4,
        color: primary ? 'var(--ios-light-100)' : 'var(--ios-dark-90)',
        whiteSpace: 'nowrap',
        WebkitAppearance: 'none',
        appearance: 'none',
      }}
    >
      {label}
    </button>
  );
}
