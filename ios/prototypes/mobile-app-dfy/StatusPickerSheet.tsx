import { ContentStatusPill } from '@ios/components';
import { ALL_STATUSES, STATUS_STYLES, type Status } from './leads-data';
import checkIcon from '@ios/icons/check-02.svg';

const font = 'var(--ios-font)';

/** Bottom-sheet status picker — slides up from the bottom of the PhoneFrame
 *  with a scrim, content auto-sizes to the option list (4 statuses today),
 *  rounded top corners, 34px bottom padding for the iOS home indicator.
 *
 *  Used by both the lead conversation's Status action and the swipe-left
 *  Status button on lead / booking rows. Rendered as a PhoneFrame overlay
 *  so it floats above whatever screen is open. */
export interface StatusPickerSheetProps {
  visible: boolean;
  /** Currently-selected status — shown with a check mark in the row. */
  current: Status | null;
  onClose: () => void;
  onPick: (next: Status) => void;
}

export function StatusPickerSheet({ visible, current, onClose, onPick }: StatusPickerSheetProps) {
  if (!visible) return null;
  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 60,
          // Animate in
          animation: 'statusSheetFade 0.22s ease-out',
        }}
      />
      <style>{`
        @keyframes statusSheetFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes statusSheetRise { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>

      {/* Sheet */}
      <div
        role="dialog"
        aria-label="Change status"
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          zIndex: 61,
          background: 'var(--ios-background-gray, #f7f7f7)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -10px 50px rgba(0,0,0,0.18)',
          padding: '10px 0 34px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'statusSheetRise 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{
            width: 36, height: 5, borderRadius: 99, background: 'var(--ios-dark-15, rgba(0,0,0,0.15))',
          }} />
        </div>

        {/* Title */}
        <div style={{ padding: '4px 20px 12px' }}>
          <span style={{
            fontFamily: font,
            fontSize: 17, fontWeight: 500, lineHeight: 1.3,
            color: 'var(--ios-dark-90)',
          }}>
            Change status
          </span>
        </div>

        {/* Option list */}
        <div style={{
          margin: '0 16px',
          background: 'white',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {ALL_STATUSES.map((s, i) => {
            const isCurrent = s === current;
            const isLast = i === ALL_STATUSES.length - 1;
            const style = STATUS_STYLES[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => { onPick(s); onClose(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isLast ? 'none' : '1px solid var(--ios-dark-4)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: font,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <ContentStatusPill variant={style.variant} label={style.label} />
                </div>
                <span style={{
                  flex: 1,
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: 'var(--ios-dark-90)',
                  letterSpacing: '0.16px',
                }}>
                  {style.label}
                </span>
                {isCurrent && (
                  <img
                    src={checkIcon}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 18, height: 18, flexShrink: 0, opacity: 0.9 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Cancel button */}
        <div style={{ margin: '8px 16px 0' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              background: 'white',
              border: 'none',
              borderRadius: 14,
              padding: '14px 18px',
              fontFamily: font,
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--ios-dark-90)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
