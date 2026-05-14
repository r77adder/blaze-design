import { Button } from '@/components';
import Download from '@/icons/20/Download';

export interface GenerateReportButtonProps {
  /** Override the default "Generate report" label. Home uses "Workspace report". */
  label?: string;
  onClick?: () => void;
}

/** Tertiary button that sits in the H2 topbarRight slot on every feature page.
 *  Visually mirrors the prod tertiary-with-icon pattern (the same one
 *  previously used for the Credits indicator before it was removed). */
export function GenerateReportButton({
  label = 'Generate report',
  onClick,
}: GenerateReportButtonProps) {
  return (
    <Button variant="tertiary" size="md" frontIcon={Download} onPress={onClick}>
      {label}
    </Button>
  );
}
