import { Modal } from '@/components';
import type { StackModalProps } from '@/components';
import AlertTriangle from '@/icons/20/AlertTriangle';

/**
 * Shared crosspost-warning modal — shown when a user about to disable
 * crossposting and publish individually to each connected account.
 * Ported from Ivan's `~/dev/Blaze H2 Features/crosspost-warning-modal.html`.
 *
 * Used by:
 *  - prototypes/h2/pages/OrganicSocial.tsx (NewPostModal)
 *  - prototypes/h2/pages/Campaigns.tsx (campaign detail / wizard)
 *
 * Open via:
 *   openModal(CrosspostWarningModal, { accounts, onConfirm })
 */

export interface CrosspostAccount {
  id: string;
  /** Person/brand name shown on the account row */
  name: string;
  /** Channel + handle, e.g. "Instagram · @emmajohnson" */
  channel: string;
  /** Initials shown on the avatar circle */
  initials: string;
  /** Avatar gradient (linear-gradient CSS value) */
  avatarGradient: string;
  /** Platform badge color (background) */
  platformColor: string;
  /** Platform short label rendered in the badge ("ig", "f", "in", "x", etc) */
  platformLabel: string;
}

export const SAMPLE_CROSSPOST_ACCOUNTS: CrosspostAccount[] = [
  {
    id: 'ig',
    name: 'Emma Johnson',
    channel: 'Instagram · @emmajohnson',
    initials: 'EJ',
    avatarGradient: 'linear-gradient(135deg, #c95b8a 0%, #a8359a 100%)',
    platformColor: '#E1306C',
    platformLabel: 'IG',
  },
  {
    id: 'fb',
    name: 'Emma Johnson',
    channel: 'Facebook · Emma Johnson',
    initials: 'EJ',
    avatarGradient: 'linear-gradient(135deg, #7BAEE8 0%, #5A8FD4 100%)',
    platformColor: '#1877F2',
    platformLabel: 'f',
  },
  {
    id: 'li',
    name: 'Blaze Official',
    channel: 'LinkedIn · Blaze Official',
    initials: 'BL',
    avatarGradient: 'linear-gradient(135deg, #8B7EC8 0%, #6A5BAE 100%)',
    platformColor: '#0A66C2',
    platformLabel: 'in',
  },
  {
    id: 'x',
    name: 'Blaze Official',
    channel: 'X (Twitter) · @blazeofficial',
    initials: 'BL',
    avatarGradient: 'linear-gradient(135deg, #74C2A8 0%, #4FA88A 100%)',
    platformColor: '#000000',
    platformLabel: 'X',
  },
];

interface CrosspostWarningModalProps {
  accounts?: CrosspostAccount[];
  onConfirm: () => void;
}

export function CrosspostWarningModal({
  close,
  accounts = SAMPLE_CROSSPOST_ACCOUNTS,
  onConfirm,
}: StackModalProps & CrosspostWarningModalProps) {
  return (
    <Modal.Root size="md" aria-labelledby="crosspost-warning-title" data-testid="crosspost-warning-modal">
      <Modal.Header
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="var(--status-review)" />
            Turn off Crosspost?
          </span>
        }
        id="crosspost-warning-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 14,
            background: 'rgba(237, 182, 44, 0.08)',
            border: '1px solid rgba(237, 182, 44, 0.2)',
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={20} color="var(--status-review)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
              Each account will publish its own post
            </span>
            <span style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
              Turning off crosspost means posts are no longer shared across accounts. A separate
              post will be created and sent for each account and channel below.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: 'var(--dark-40)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Posting individually for
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {accounts.map((acct, i) => (
              <div
                key={acct.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                  background: 'var(--light-100)',
                }}
              >
                <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: acct.avatarGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--light-100)',
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {acct.initials}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: acct.platformColor,
                      border: '1.5px solid var(--light-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--light-100)',
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {acct.platformLabel}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
                    {acct.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{acct.channel}</span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    background: 'var(--dark-4)',
                    borderRadius: 6,
                    color: 'var(--dark-60)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <svg viewBox="0 0 12 12" width={12} height={12} fill="none">
                    <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1" />
                    <rect x="7" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1" />
                    <rect x="1" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1" />
                    <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                  Individual post
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              onConfirm();
              close();
            }}
          >
            Turn off Crosspost
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
