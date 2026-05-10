import { useEffect, useMemo, useState } from 'react';
import { Heading, Text } from '@/components';
import { Avatar, Chip, Toast } from '@/staging';
import { H2_SECTIONS, PrototypeShell, StatePicker } from '../_shell';
import { FEED_ITEMS } from './feed-data';
import { FeedItem } from './FeedItem';

type FilterKey = 'all' | 'action' | 'insight';

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
    </svg>
  );
}

/**
 * GAP placeholder — `<TopBarRight>` cluster: credits badge with star, Upgrade
 * button (purple-themed, between secondary and primary). The avatar slot now
 * uses the real `<Avatar>` component. See GAPS.md for what's still inline.
 */
function TopBarRight() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'Sohne', sans-serif",
          fontSize: 13,
          color: 'var(--dark-80)',
        }}
      >
        <span style={{ color: 'var(--dark-60)' }}>
          <StarIcon size={14} />
        </span>
        48 Credits
      </span>
      <button
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid #C8B5FB',
          background: 'var(--light-100)',
          color: 'var(--purple)',
          fontFamily: "'Sohne', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.1px',
          cursor: 'pointer',
        }}
      >
        Upgrade
      </button>
      <Avatar
        src="https://i.pravatar.cc/64?img=12"
        fallback="FH"
        alt="Profile"
        size="md"
      />
    </div>
  );
}

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
          color="var(--dark-60)"
          style={{ display: 'block', lineHeight: 1.5 }}
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
          <Chip
            key={f.key}
            size="md"
            selected={activeFilter === f.key}
            onSelectionChange={() => setActiveFilter(f.key)}
          >
            {f.label}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--dark-4)',
                borderRadius: 4,
                padding: '0 4px',
                minWidth: 16,
                height: 16,
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--dark-80)',
                lineHeight: 1,
                marginLeft: 4,
              }}
            >
              {f.count}
            </span>
          </Chip>
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
        topbarRight={<TopBarRight />}
      >
        <Body />
      </PrototypeShell>
    </StatePicker>
  );
}
