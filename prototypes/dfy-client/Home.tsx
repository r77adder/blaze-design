import type { ComponentType } from 'react';
import { Heading, Text, Button } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import ApprovalsIcon from '@/icons/20/Approvals';
import { Sparkline } from './insights/charts';
import { useGo, ClientShell } from './shell';

/** At-a-glance results across the channels Blaze runs, links into Insights.
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

const F = "'Sohne', sans-serif";

// Flooring photography, reused 1:1 from Approvals.tsx's IMG map so the Home
// previews match the actual pieces sitting in the batch.
const IMG = {
  hardwood: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop',
  install: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop',
  livingRoom: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&auto=format&fit=crop',
  detail: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=400&auto=format&fit=crop',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop',
  swatch: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop',
  showroom: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&auto=format&fit=crop',
  tile: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400&auto=format&fit=crop',
};

// Two approvals notifications, the only things on the steady Home feed. Both
// link into the Approvals tab (the batch list).
interface Notification {
  id: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  label: string;
  time: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  images: string[];  // preview thumbnails of the actual pieces
  total: number;     // total pieces (drives the "+N" overflow tile)
}
const NOTIFICATIONS: Notification[] = [
  {
    id: 'n-updated',
    icon: ApprovalsIcon,
    iconColor: 'var(--status-approved)',
    label: 'Approvals',
    time: '2h ago',
    title: 'Revised designs are back in review',
    body: 'Your team revised the pieces you asked changes on and re-sent them. Take a quick look and approve when they’re right.',
    cta: 'See what changed',
    to: '/approvals',
    images: [IMG.hardwood, IMG.livingRoom],
    total: 2,
  },
  {
    id: 'n-batch',
    icon: ApprovalsIcon,
    iconColor: 'var(--status-approved)',
    label: 'Approvals',
    time: 'Yesterday',
    title: 'This week’s batch is ready for your review',
    body: 'Your team sent this week’s content for Grain Design Flooring, social posts, paid ads, articles, and review replies. Approve anything that’s good to go.',
    cta: 'Review batch',
    to: '/approvals',
    images: [IMG.detail, IMG.kitchen, IMG.swatch, IMG.showroom],
    total: 13,
  },
];

const THUMB = 44;

// A small strip of preview thumbnails with a "+N" overflow tile.
function ThumbStrip({ images, total }: { images: string[]; total: number }) {
  const visible = images.slice(0, 4);
  const overflow = total - visible.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {visible.map((src, i) => (
        <div key={`${src}-${i}`} style={{ width: THUMB, height: THUMB, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-8)', background: 'var(--dark-4)', flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{ width: THUMB, height: THUMB, borderRadius: 8, border: '1px solid var(--dark-8)', background: 'var(--dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'var(--dark-60)', fontFamily: F, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ n, onGo }: { n: Notification; onGo: (to: string) => void }) {
  const Icon = n.icon;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onGo(n.to)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGo(n.to); } }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--dark-15)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--dark-4)'; e.currentTarget.style.boxShadow = 'none'; }}
      style={{ background: 'var(--light-100)', border: '1px solid var(--dark-4)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', transition: 'border-color 120ms ease, box-shadow 120ms ease', fontFamily: F }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon size={16} color={n.iconColor} />
          <Text variant="metadata" style={{ color: 'var(--dark-80)', fontWeight: 500, fontSize: 12.5 }}>{n.label}</Text>
        </span>
        <Text variant="metadata" style={{ marginLeft: 'auto', color: 'var(--dark-40)', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>{n.time}</Text>
      </div>

      <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px' }}>{n.title}</Text>
      <Text variant="secondary" style={{ display: 'block', lineHeight: 1.55, color: 'var(--dark-60)', fontSize: 13.5 }}>{n.body}</Text>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
        <ThumbStrip images={n.images} total={n.total} />
        <Button variant="secondary" size="sm" endIcon={ArrowRightSm} onClick={(e) => { e.stopPropagation(); onGo(n.to); }}>
          {n.cta}
        </Button>
      </div>
    </div>
  );
}

/**
 * Client home for Grain Design Flooring. A compact results dashboard plus the
 * only two things the client needs to act on: this week's batch was sent, and a
 * few designs were revised and re-sent. Both link into the Approvals tab.
 */
export function Home() {
  const go = useGo();

  return (
    <ClientShell section="home">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '8px 4px 60px' }}>
        <div style={{ padding: '24px 0 32px' }}>
          <Heading level={2} style={{ lineHeight: 1.2, letterSpacing: '-0.4px', marginBottom: 0 }}>This week at Grain Design Flooring</Heading>
        </div>
        <MetricsRow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {NOTIFICATIONS.map((n) => <NotificationCard key={n.id} n={n} onGo={go} />)}
        </div>
      </div>
    </ClientShell>
  );
}
