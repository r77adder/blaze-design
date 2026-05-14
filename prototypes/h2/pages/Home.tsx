import { useMemo, useState } from 'react';
import { Heading, ModalStack, Text, useModals } from '@/components';
import { TabChip, useToast } from '@/staging';
import { FEED_ITEMS, type FeedItem as FeedItemData } from '../feed-data';
import { FeedItem } from '../FeedItem';
import { FeedItemModal } from '../FeedItemModal';
import { GenerateReportButton } from '../GenerateReportButton';
import { H2Layout } from '../H2Layout';

type FilterKey = 'all' | 'action' | 'insight';

export function Home() {
  return (
    <ModalStack>
      <HomeInner />
    </ModalStack>
  );
}

function HomeInner() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const { showToast } = useToast();
  const { openModal } = useModals();

  const counts = useMemo(
    () => ({
      all: FEED_ITEMS.length,
      action: FEED_ITEMS.filter((i) => i.kind === 'action').length,
      insight: FEED_ITEMS.filter((i) => i.kind === 'insight').length,
    }),
    [],
  );

  const visible = useMemo(() => {
    if (activeFilter === 'all') return FEED_ITEMS;
    if (activeFilter === 'action') {
      return FEED_ITEMS.filter((i) => i.kind === 'action');
    }
    return FEED_ITEMS.filter((i) => i.kind === 'insight');
  }, [activeFilter]);

  const handleAction = (label: string, source: string) => {
    showToast({ message: `${label} · ${source}` });
  };

  const handleOpen = (item: FeedItemData) => {
    const initialIndex = Math.max(0, visible.findIndex((i) => i.id === item.id));
    openModal(FeedItemModal, { items: visible, initialIndex, onAction: handleAction });
  };

  // Filter chips lifted into the topbar's center slot — keep the controlled
  // state here (counts + active key) and pass the rendered chips up.
  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(
        [
          { key: 'all', label: 'All', count: counts.all },
          { key: 'action', label: 'Needs your sign-off', count: counts.action },
          { key: 'insight', label: 'Insights', count: counts.insight },
        ] as const
      ).map((f) => (
        <TabChip
          key={f.key}
          selected={activeFilter === f.key}
          count={f.count}
          onSelect={() => setActiveFilter(f.key)}
        >
          {f.label}
        </TabChip>
      ))}
    </div>
  );

  return (
    <H2Layout
      topbarCenter={topbarCenter}
      topbarRight={<GenerateReportButton label="Workspace report" />}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 4px 60px' }}>
        {/* HERO */}
        <div style={{ padding: '24px 0 32px' }}>
          <Heading
            level={2}
            style={{ lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: 6 }}
          >
            Good morning, Fabian.
          </Heading>
          <Text
            variant="secondary"
            style={{ display: 'block', lineHeight: 1.5, color: 'var(--dark-60)' }}
          >
            <Text variant="smallList">3 things need your sign-off</Text>
            {' '}this morning · 12 fresh updates from your channels.
          </Text>
        </div>

        {/* FEED — borderless items, vertical rhythm comes from this gap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((item) => (
            <FeedItem key={item.id} item={item} onAction={handleAction} onOpen={handleOpen} />
          ))}
        </div>
      </div>
    </H2Layout>
  );
}
