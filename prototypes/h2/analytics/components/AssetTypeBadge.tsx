import { Pill } from '@/staging';
import type { AssetType } from '../types';
import { assetTypeLabel } from '../format';

/** Neutral category badge for a Blaze asset's type (Ad / Social / Blog /
 *  Email / Landing page). Kept tonally neutral — it's a category label, not a
 *  status, so no color coding or status dot. */
export function AssetTypeBadge({ type }: { type: AssetType }) {
  return (
    <Pill size="sm" style={{ color: 'var(--dark-60)' }}>
      {assetTypeLabel(type)}
    </Pill>
  );
}
