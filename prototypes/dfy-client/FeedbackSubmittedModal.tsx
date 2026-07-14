import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Text, useModals, type StackModalProps } from '@/components';

/** Shown right after Submit feedback redirects the client to Home, confirms
 *  the review went through without dead-ending them on the review page itself. */
function FeedbackSubmittedModal({ title, body, close }: StackModalProps & { title: string; body: string }) {
  return (
    <Modal.Root size="sm" aria-labelledby="feedback-submitted-title">
      <Modal.Header title={title} id="feedback-submitted-title" onClose={close} compact />
      <Modal.Content compact>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.6 }}>{body}</Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>Got it</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

/** Call once from any Home variant (cold / reviewing / steady), opens the
 *  confirmation modal if the client was just redirected here from a review
 *  page's Submit feedback, then clears the nav state so a refresh or revisit
 *  doesn't reopen it. */
export function useFeedbackSubmittedModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useModals();
  useEffect(() => {
    const submitted = (location.state as { feedbackSubmitted?: { title: string; body: string } } | null)?.feedbackSubmitted;
    if (!submitted) return;
    openModal(FeedbackSubmittedModal, submitted);
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
