import { useRef, useState, type ReactNode } from 'react';
import phoneCallIcon from '@ios/icons/phone-call01.svg';
import messageCircleIcon from '@ios/icons/message-circle.svg';
import refreshIcon from '@ios/icons/refresh.svg';

const font = 'var(--ios-font)';

/** Mobile iOS-style "swipe-left to reveal actions" row.
 *
 *  Wraps `children` in a swipeable container that exposes circular action
 *  buttons on the right when the user drags the row left (or clicks one of
 *  the action buttons after a swipe).
 *
 *  Patterned after Apple HIG's call/message circle buttons (full color
 *  disc + white glyph). Three buttons by default — Call (green), Text
 *  (blue), Status (indigo). Pass `onCall`, `onText`, `onStatus` to wire
 *  them. Omit any handler to hide that button.
 */
export interface SwipeableRowProps {
  children: ReactNode;
  /** Fires on a tap that didn't move enough to count as a swipe. */
  onClick: () => void;
  onCall?: () => void;
  onText?: () => void;
  onStatus?: () => void;
}

export function SwipeableRow({
  children,
  onClick,
  onCall,
  onText,
  onStatus,
}: SwipeableRowProps) {
  // 3 buttons × (44 disc + 8 gap) + 12 trailing padding = ~168 px reveal
  const buttonCount = [onCall, onText, onStatus].filter(Boolean).length;
  const revealWidth = buttonCount > 0 ? buttonCount * 52 + 16 : 0;

  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const dragged = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (revealWidth === 0) return;
    startX.current = e.clientX - offset; // continue from current offset
    dragged.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    dragged.current = Math.max(dragged.current, Math.abs(dx - offset));
    setOffset(Math.min(0, Math.max(-revealWidth, dx)));
  };
  const settle = () => {
    startX.current = null;
    // Snap fully open or fully closed depending on how far we got.
    setOffset((prev) => (prev < -revealWidth / 2 ? -revealWidth : 0));
  };

  const handleClick = () => {
    // Suppress click if this was a swipe.
    if (dragged.current > 6) return;
    // Tap while open → snap closed instead of triggering the row's onClick.
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    onClick();
  };

  const closeAnd = (fn: () => void) => () => {
    setOffset(0);
    fn();
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Action buttons — sit behind the row on the right. Revealed as the
          row slides left. */}
      {revealWidth > 0 && (
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
          paddingLeft: 8,
          paddingRight: 12,
          pointerEvents: offset === 0 ? 'none' : 'auto',
        }}>
          {onCall && (
            <ActionButton
              ariaLabel="Call"
              icon={phoneCallIcon}
              bg="var(--ios-green, #34c759)"
              onClick={closeAnd(onCall)}
            />
          )}
          {onText && (
            <ActionButton
              ariaLabel="Text"
              icon={messageCircleIcon}
              bg="#0083e2"
              onClick={closeAnd(onText)}
            />
          )}
          {onStatus && (
            <ActionButton
              ariaLabel="Change status"
              icon={refreshIcon}
              bg="#5856d6"
              onClick={closeAnd(onStatus)}
            />
          )}
        </div>
      )}

      {/* Swipeable row content. */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={settle}
        onPointerCancel={settle}
        onPointerLeave={(e) => { if (e.buttons === 0) return; settle(); }}
        onClick={handleClick}
        style={{
          transform: `translateX(${offset}px)`,
          transition: startX.current === null ? 'transform 220ms ease' : 'none',
          background: 'inherit',
          touchAction: 'pan-y',
          cursor: 'pointer',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ActionButton({ icon, bg, ariaLabel, onClick }: {
  icon: string;
  bg: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 99,
        background: bg,
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: font,
      }}
    >
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        style={{ width: 20, height: 20, filter: 'invert(1)' }}
      />
    </button>
  );
}
