import { useLocation, useNavigate } from 'react-router-dom';
import { TabChip } from '@/staging';

/**
 * Header subtab strip for the competitor-tracking surface.
 *
 * Mounted via <H2Layout topbarCenter={<CompetitorTabs />} /> on each page
 * inside `competitor-tracking/pages/`. The active tab is derived from the
 * current pathname (exact match), and selecting a tab navigates to the
 * corresponding route. Pattern mirrors PaidSearch's topbar tab strip.
 */
const TABS = [
  { label: 'Tracking', path: '/h2/competitor-tracking' },
  { label: 'Alerts', path: '/h2/competitor-tracking/alerts' },
  { label: 'Landscape', path: '/h2/competitor-tracking/landscape' },
] as const;

export function CompetitorTabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {TABS.map((t) => (
        <TabChip
          key={t.path}
          selected={pathname === t.path}
          onSelect={() => navigate(t.path)}
        >
          {t.label}
        </TabChip>
      ))}
    </div>
  );
}
