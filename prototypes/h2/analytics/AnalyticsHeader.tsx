import { useLocation, useNavigate } from 'react-router-dom';
import { TabChip } from '@/staging';

/** Base path of the analytics sub-app inside H2. */
const BASE = '/h2/analytics';

type ViewId = 'overview' | 'funnel' | 'content';

function viewFromPathname(pathname: string): ViewId {
  if (pathname.endsWith('/funnel')) return 'funnel';
  if (pathname.endsWith('/content')) return 'content';
  return 'overview';
}

/**
 * The three top-level views, rendered as TabChips in the topbar's center slot —
 * matching the sub-tab style used on Local SEO and the other H2 pages.
 * Selecting a tab routes; the Source Drawer is an overlay, not a destination.
 */
export function ViewNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const view = viewFromPathname(pathname);

  const go = (next: ViewId) => navigate(next === 'overview' ? BASE : `${BASE}/${next}`);

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <TabChip selected={view === 'overview'} onSelect={() => go('overview')}>
        Overview
      </TabChip>
      <TabChip selected={view === 'funnel'} onSelect={() => go('funnel')}>
        Funnel
      </TabChip>
      <TabChip selected={view === 'content'} onSelect={() => go('content')}>
        Content
      </TabChip>
    </div>
  );
}
