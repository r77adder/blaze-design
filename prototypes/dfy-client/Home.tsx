import { Heading, Text, useModals } from '@/components';
import { useToast } from '@/staging';
import { FEED_ITEMS } from './home-data';
import { HomeCard } from './HomeCard';
import { ApprovalQuickModal, type ApprovalItem } from './ApprovalQuickModal';
import { Sparkline } from './insights/charts';
import { useGo, ClientShell } from './shell';

/** At-a-glance results across the channels Blaze runs — links into Insights.
 *  `spark` is the trailing-30d shape rendered as a Sparkline inside each card;
 *  `sparkColor` tints it to match the metric's accent. */
const METRICS: { label: string; value: string; delta: string; to: string; spark: number[]; sparkColor: string }[] = [
  { label: 'Website traffic', value: '16.4k', delta: '+12% · 30d', to: '/insights/website', spark: [9, 10, 11, 10, 13, 14, 16, 16.4], sparkColor: 'var(--purple)' },
  { label: 'New leads', value: '503', delta: '+9% · 30d', to: '/insights/website', spark: [380, 410, 395, 440, 460, 455, 490, 503], sparkColor: 'var(--status-approved)' },
  { label: 'New reviews', value: '18', delta: '4.7★ avg', to: '/insights/reputation', spark: [8, 11, 9, 13, 12, 15, 16, 18], sparkColor: 'var(--brand)' },
  { label: 'Social impressions', value: '34.1k', delta: '+18% · 30d', to: '/insights/organic', spark: [21, 24, 23, 27, 29, 28, 32, 34.1], sparkColor: 'var(--status-posting)' },
];

function MetricsRow() {
  const go = useGo();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
      {METRICS.map((m) => (
        <button key={m.label} onClick={() => go(m.to)} style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px', background: 'var(--light-100)', fontFamily: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--dark-15)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--dark-8)')}>
          <Text variant="metadata" color="var(--dark-60)" style={{ letterSpacing: '0.04em', display: 'block' }}>{m.label}</Text>
          <Heading level={2} style={{ display: 'block', margin: '4px 0 2px' }}>{m.value}</Heading>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="metadata" color="var(--status-approved)" style={{ fontWeight: 500 }}>{m.delta}</Text>
            <Sparkline data={m.spark} width={68} height={24} stroke={m.sparkColor} fill="transparent" />
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Client home for Grain Design Flooring — reuses H2's FeedItem + modal, fed by
 * the flooring-flavored `./home-data` payload. The client sees the same "needs
 * your sign-off / insights" stream their account manager works from. View-only
 * framing: actions just toast in the prototype.
 */
export function Home() {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const go = useGo();

  // Sign-off (action) items approve/request-changes in the carousel modal
  // without leaving Home; both decisions toast. Insights are informational —
  // their quiet link navigates into the relevant Insights tab (no modal).
  const approveItem = (item: ApprovalItem) =>
    showToast({ variant: 'success', message: `Approved · ${item.sourceLabel}` });
  const requestChangesItem = (item: ApprovalItem, note: string) =>
    showToast({ message: note ? `Changes sent · ${item.sourceLabel}` : `Changes requested · ${item.sourceLabel}` });

  // Open the carousel modal at piece 0 for a sign-off card.
  const handleOpen = (item: ApprovalItem) => {
    openModal(ApprovalQuickModal, { item, startIndex: 0, onApprove: approveItem, onRequestChanges: requestChangesItem });
  };

  return (
    <ClientShell section="home">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px' }}>
        <div style={{ padding: '24px 0 32px' }}>
          <Heading level={2} style={{ lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: 0 }}>This week at Grain Design Flooring</Heading>
        </div>
        <MetricsRow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEED_ITEMS.map((item) => <HomeCard key={item.id} item={item} onOpen={handleOpen} onSee={go} />)}
        </div>
      </div>
    </ClientShell>
  );
}
