/**
 * Sheet — iOS bottom sheet / modal overlay.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4997:15914
 *
 * Renders inside the PhoneFrame (position: absolute) with a dark-8 scrim.
 * Drawer shadow: 0 15px 75px rgba(0,0,0,0.18).
 *
 * Sizes:
 *   large          — 814px, optional header
 *   medium         — 600px, optional header
 *   full           — 874px full screen
 *   small-modal    — 320px, centered dialog (not a sheet)
 *   medium-no-header — 600px, no ToolbarHeader
 */

import type { ReactNode } from 'react';
import { ToolbarHeader } from './ToolbarHeader';
import { ContentAreaButton } from './ContentAreaButton';

export type SheetSize = 'large' | 'medium' | 'full' | 'small-modal' | 'medium-no-header';

export interface SheetProps {
  size?: SheetSize;
  title?: string;
  visible: boolean;
  children?: ReactNode;
  /** Primary CTA button label at sheet bottom. */
  primaryLabel?: string;
  /** Secondary CTA button label at sheet bottom. */
  secondaryLabel?: string;
  onClose?: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const SIZE_MAP: Record<SheetSize, number> = {
  large: 814,
  medium: 600,
  full: 874,
  'small-modal': 320,
  'medium-no-header': 600,
};

export function Sheet({
  size = 'large',
  title,
  visible,
  children,
  primaryLabel,
  secondaryLabel,
  onClose,
  onPrimary,
  onSecondary,
}: SheetProps) {
  if (!visible) return null;

  const sheetHeight = SIZE_MAP[size];
  const isModal = size === 'small-modal';
  const isFull = size === 'full';
  const noHeader = size === 'medium-no-header';
  const showHeader = !noHeader && !isModal;

  const sheetStyle = isModal
    ? {
        width: 320,
        borderRadius: 20,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bottom: undefined as undefined,
      }
    : isFull
    ? {
        width: '100%',
        borderRadius: 0,
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
      }
    : {
        width: '100%',
        borderRadius: '24px 24px 0 0',
        bottom: 0,
        left: 0,
        right: 0,
      };

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--ios-dark-8)',
          zIndex: 50,
        }}
      />

      {/* Sheet */}
      <div
        role={isModal ? 'dialog' : 'complementary'}
        aria-modal={isModal}
        aria-label={title}
        style={{
          position: 'absolute',
          height: isModal ? undefined : sheetHeight,
          background: 'var(--ios-background-light)',
          boxShadow: '0 15px 75px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 51,
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...sheetStyle,
        }}
      >
        {/* Drag handle (non-full, non-modal) */}
        {!isFull && !isModal && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 4,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 99,
                background: 'var(--ios-dark-8)',
              }}
            />
          </div>
        )}

        {/* Header */}
        {showHeader && (
          <ToolbarHeader
            title={title}
            leftButton={isFull ? 'back' : 'close'}
            rightButton={undefined}
            onLeftPress={onClose}
          />
        )}

        {/* Modal title (small-modal) */}
        {isModal && title && (
          <div style={{ padding: '20px 20px 0' }}>
            <span
              style={{
                fontFamily: 'var(--ios-font)',
                fontSize: 'var(--ios-h4-size)',
                fontWeight: 'var(--ios-h4-weight)' as unknown as number,
                lineHeight: 'var(--ios-h4-lh)',
                color: 'var(--ios-dark-90)',
              }}
            >
              {title}
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>

        {/* Footer actions */}
        {(primaryLabel || secondaryLabel) && (
          <div
            style={{
              padding: '12px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              borderTop: '1px solid var(--ios-dark-4)',
              flexShrink: 0,
            }}
          >
            {primaryLabel && (
              <ContentAreaButton
                type="primary"
                size="l"
                label={primaryLabel}
                fullWidth
                onClick={onPrimary}
              />
            )}
            {secondaryLabel && (
              <ContentAreaButton
                type="secondary"
                size="l"
                label={secondaryLabel}
                fullWidth
                onClick={onSecondary}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
