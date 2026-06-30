import { useState } from 'react';
import { useModals, Text } from '@/components';
import { AvatarAnnouncementModal } from './AvatarAnnouncementModal';

/**
 * Temporary "What's New" entry point for the AI avatar video feature. Renders
 * as a dismissable card pinned to the bottom of the sidebar (via the shell's
 * `sidebarPanel` slot), sitting on top of the footer rows.
 *
 *  - Clicking the card opens the avatar announcement modal flow.
 *  - The × dismisses it.
 *  - Completing the flow (Done on the all-set screen) makes it disappear.
 *
 * Dismissal/completion are session-scoped (module-level flag): the panel stays
 * gone as you navigate between pages, but a full page reload brings it back so
 * the entry point is easy to re-demo.
 */
let dismissedThisSession = false;

export function AvatarPromoPanel() {
  const { openModal } = useModals();
  const [hidden, setHidden] = useState(dismissedThisSession);

  if (hidden) return null;

  const hide = () => {
    dismissedThisSession = true;
    setHidden(true);
  };

  const openFlow = () => openModal(AvatarAnnouncementModal, { onComplete: hide });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFlow}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFlow();
        }
      }}
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>What's New</Text>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            hide();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            margin: -4,
            border: 'none',
            background: 'transparent',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--dark-60)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark-90)' }}>
        AI avatar videos
      </Text>
      <Text style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>
        Turn your topics into lifelike short videos.
      </Text>
    </div>
  );
}
