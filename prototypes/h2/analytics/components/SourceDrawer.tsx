import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/components';
import { useAnalytics, useAnalyticsData } from '../analytics-context';
import { CHANNEL_LABEL, conversionRate, fmtInt, fmtPct } from '../mockData';
import type { Channel } from '../types';
import { FONT, formatShortDate, platformLabel, tracking } from '../format';
import { DrawerShell } from './DrawerShell';
import { RowButton, RowStatic } from './Row';
import { Thumb } from './Thumb';
import { CellLabel, Muted, Num } from './cells';

const ROW_COLS = 'minmax(0,1fr) 56px 44px';

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(11), color: 'var(--dark-60)' }}>{label}</span>
      <Heading level={2} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Heading>
    </div>
  );
}

function Group({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 8px', marginBottom: 4 }}>
        <Heading level={5}>{title}</Heading>
        <Text variant="secondary" color="var(--dark-60)">
          {caption}
        </Text>
      </div>
      {children}
    </section>
  );
}

/**
 * Source Drawer — opened from any channel row (Overview or Funnel). Shows the
 * channel's header stats, then its Blaze assets (closed-loop, each links to the
 * Content view) and its earned/external sources (no asset to link — distinct).
 */
export function SourceDrawer() {
  const { drawerChannel, closeSourceDrawer } = useAnalytics();
  const data = useAnalyticsData();
  const navigate = useNavigate();
  const [render, setRender] = useState<Channel | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (drawerChannel) {
      setRender(drawerChannel);
      const t = setTimeout(() => setOpen(true), 20);
      return () => clearTimeout(t);
    }
    setOpen(false);
    const t = setTimeout(() => setRender(null), 240);
    return () => clearTimeout(t);
  }, [drawerChannel]);

  if (!render) return null;

  const channel = render;
  const totals = data.channelSources('last_touch').find((c) => c.channel === channel)!;
  const blaze = data.blazeSourcesForChannel(channel);
  const external = data.externalSourcesForChannel(channel);

  const goToContent = () => {
    navigate('/h2/analytics/content');
    closeSourceDrawer();
  };

  const headerExtra = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <HeaderStat label="Visitors" value={fmtInt(totals.visitors)} />
      <HeaderStat label="Leads" value={fmtInt(totals.leads)} />
      <HeaderStat label="Clients" value={fmtInt(totals.clients)} />
      <HeaderStat label="Conversion" value={fmtPct(conversionRate(totals.visitors, totals.leads))} />
    </div>
  );

  return (
    <DrawerShell open={open} onClose={closeSourceDrawer} eyebrow="Channel" title={CHANNEL_LABEL[channel]} headerExtra={headerExtra}>
      {blaze.length > 0 && (
        <Group title="Blaze assets" caption="The published ads and posts that drove this channel">
          {blaze.map((s) => (
            <RowButton key={s.sourceAsset!.id + s.channel} cols={ROW_COLS} onClick={goToContent} align="center">
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Thumb size={38} seed={s.sourceAsset!.id} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <CellLabel size={14}>{s.sourceAsset!.title}</CellLabel>
                  <Muted size={14}>
                    {platformLabel(s.sourceAsset!.utm.source)} · {formatShortDate(s.sourceAsset!.publishedAt)}
                  </Muted>
                </span>
              </span>
              <Num strong>{fmtInt(s.visitors)}</Num>
              <Num>{fmtInt(s.leads)}</Num>
            </RowButton>
          ))}
        </Group>
      )}

      {external.length > 0 && (
        <Group title={blaze.length > 0 ? 'Other sources' : 'Sources'} caption="Earned / external — no linked asset">
          {external.map((s) => (
            <RowStatic key={s.label} cols={ROW_COLS} align="center">
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <CellLabel size={14}>{s.label}</CellLabel>
                <Muted size={14}>No linked asset</Muted>
              </span>
              <Num strong>{fmtInt(s.visitors)}</Num>
              <Num>{fmtInt(s.leads)}</Num>
            </RowStatic>
          ))}
        </Group>
      )}

      {blaze.length === 0 && external.length === 0 && (
        <span style={{ fontFamily: FONT, fontSize: 14, color: 'var(--dark-60)', padding: '0 8px' }}>
          No source detail for this channel yet.
        </span>
      )}
    </DrawerShell>
  );
}
