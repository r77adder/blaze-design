import { Button, useModals } from '@/components';
import { Plus } from '@/icons/20';
import { AddCompetitorModal } from './AddCompetitorModal';

/**
 * Shared "Add competitor" button — used in the topbar of every page in the
 * /h2/competitor-tracking surface (Intel, Alerts, Landscape, etc.).
 *
 * Opens the AddCompetitorModal stack modal.
 */
export function AddCompetitorButton() {
  const { openModal } = useModals();
  return (
    <Button
      size="sm"
      variant="secondary"
      frontIcon={Plus}
      onPress={() => openModal(AddCompetitorModal)}
    >
      Add competitor
    </Button>
  );
}
