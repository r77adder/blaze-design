import { useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@/components';
import { TabChip, Toast } from '@/staging';
import { H2_SECTIONS, PrototypeShell, StatePicker } from '../_shell';
import { FEED_ITEMS } from './feed-data';
import { FeedItem } from './FeedItem';

type FilterKey = 'all' | 'action' | 'insight';

interface ToastState {
  id: number;
  message: string;
}

function ToastStack({ toasts }: { toasts: ToastState[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} variant="success" style={{ pointerEvents: 'auto' }}>
          {t.message}
        </Toast>
      ))}
    </div>
  );
}

function Body() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const counts = useMemo(
    () => ({
      all: FEED_ITEMS.length,
      action: FEED_ITEMS.filter((i) => i.kind === 'action' || i.kind === 'alert').length,
      insight: FEED_ITEMS.filter((i) => i.kind === 'insight').length,
    }),
    [],
  );

  const visible = useMemo(() => {
    if (activeFilter === 'all') return FEED_ITEMS;
    if (activeFilter === 'action') {
      return FEED_ITEMS.filter((i) => i.kind === 'action' || i.kind === 'alert');
    }
    return FEED_ITEMS.filter((i) => i.kind === 'insight');
  }, [activeFilter]);

  function showToast(label: string, source: string) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message: `${label} · ${source}` }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2400);
  }

  // clean up toasts on unmount
  useEffect(() => () => setToasts([]), []);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 4px 60px' }}>
      {/* HERO */}
      <div style={{ padding: '24px 0 20px' }}>
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

      {/* FILTERS */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          padding: '6px 0 18px',
          borderBottom: '1px solid var(--dark-8)',
          marginBottom: 18,
        }}
      >
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

      {/* FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((item) => (
          <FeedItem key={item.id} item={item} onAction={showToast} />
        ))}
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}

export default function H2Index() {
  return (
    <StatePicker states={['default']} defaultState="default">
      <PrototypeShell
        title="Home"
        sidebarSections={H2_SECTIONS}
        sidebarActiveLabel="Home"
        workspaceName="Radiant Health"
      >
        <Body />
      </PrototypeShell>
    </StatePicker>
  );
}
