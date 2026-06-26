import { Modal, Text } from '@/components';
import type { StackModalProps } from '@/components';
import { stockImage } from './stock-images';

/**
 * Announcement modal — pops on the cold Home a beat after the user lands there
 * from the "generating" handoff, telling them their first wave of creative
 * finished rendering. "Review creative" launches the Creative review takeover.
 *
 * Open via:
 *   openModal(CreativeReadyModal, { onReview })
 */

const PREVIEW_SEEDS = ['creative-ready-a', 'creative-ready-b', 'creative-ready-c', 'creative-ready-d'];

interface CreativeReadyModalProps {
  /** Number of generated assets, shown in the body copy. */
  count?: number;
  /** Launches the Creative review takeover. */
  onReview: () => void;
}

export function CreativeReadyModal({
  close,
  count = 14,
  onReview,
}: StackModalProps & CreativeReadyModalProps) {
  return (
    <Modal.Root size="sm" aria-labelledby="creative-ready-title" data-testid="creative-ready-modal">
      <Modal.Header title="Your first wave of creative is ready" id="creative-ready-title" onClose={close} compact />
      <Modal.Content compact>
        {/* Preview strip — a peek at what's waiting in the review. */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {PREVIEW_SEEDS.map((seed) => (
            <img
              key={seed}
              src={stockImage(seed, 200, 250)}
              alt=""
              style={{
                width: '25%',
                aspectRatio: '4 / 5',
                objectFit: 'cover',
                borderRadius: 10,
                border: '1px solid var(--dark-8)',
              }}
            />
          ))}
        </div>
        <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, lineHeight: 1.55 }}>
          We generated <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{count} ads, posts, and videos</strong> from
          your brand, goals, and the examples you liked. Take a look and approve the ones you want to ship.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Later
          </Modal.FooterButton>
          <Modal.FooterButton
            variant="primary"
            onPress={() => {
              onReview();
              close();
            }}
          >
            Review creative
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
