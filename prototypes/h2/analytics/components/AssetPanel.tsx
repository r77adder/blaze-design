import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/components';
import { Card } from '@/staging';
import ChevronRight from '@/icons/16/ChevronRight';
import {
  BLAZE_ASSETS,
  CHANNEL_LABEL,
  assetContentUrl,
  assetPreviewUrl,
  channelDestination,
  conversionRate,
  fmtInt,
  fmtPct,
} from '../mockData';
import { useAnalyticsData } from '../analytics-context';
import { FONT, assetTypeLabel, campaignName, formatLongDate, platformLabel, tracking } from '../format';
import type { BlazeAsset } from '../types';
import { DrawerShell } from './DrawerShell';
import { RowStatic } from './Row';
import { Thumb } from './Thumb';
import { CellLabel, Num } from './cells';

function FieldLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>{children}</span>;
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(11), color: 'var(--dark-60)' }}>{label}</span>
      <Heading level={2} style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Heading>
    </div>
  );
}

/** A section heading (H5) with a secondary subheadline. */
function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 8px' }}>
      <Heading level={5}>{title}</Heading>
      <Text variant="secondary" color="var(--dark-60)">
        {sub}
      </Text>
    </div>
  );
}

/** A labelled card that leads to a source: label on top, clickable card below.
 *  Optional `thumbSeed` renders a thumbnail before the value. */
function SourceField({ label, value, onClick, thumbSeed }: { label: string; value: string; onClick: () => void; thumbSeed?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <Card padding="md" interactive onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {thumbSeed && <Thumb size={36} seed={thumbSeed} />}
            <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-90)', fontWeight: 500 }}>{value}</span>
          </span>
          <span aria-hidden style={{ display: 'inline-flex', color: 'var(--dark-60)' }}>
            <ChevronRight size={16} />
          </span>
        </div>
      </Card>
    </div>
  );
}

/** The "Content" field: a post-style preview (like the organic campaign
 *  calendar) that links to the live content. */
function ContentField({ asset }: { asset: BlazeAsset }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <FieldLabel>Content</FieldLabel>
      <Card padding="none" interactive onClick={() => window.open(assetContentUrl(asset), '_blank', 'noopener')}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px 8px' }}>
            <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)' }}>
              {platformLabel(asset.utm.source)} · {assetTypeLabel(asset.type)}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-90)', fontWeight: 500 }}>View live ↗</span>
          </div>
          <img
            src={assetPreviewUrl(asset.id)}
            alt=""
            aria-hidden
            loading="lazy"
            style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', background: 'var(--dark-4)', display: 'block' }}
          />
          <div style={{ padding: '12px 14px 14px' }}>
            <Heading level={3} lineClamp={2}>
              {asset.title}
            </Heading>
          </div>
        </div>
      </Card>
    </div>
  );
}

/** A single auto-stamped UTM key/value, rendered monospace. */
function UtmRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 8px', borderRadius: 6, background: 'var(--dark-2)' }}>
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: 'var(--dark-60)', minWidth: 96 }}>utm_{k}</span>
      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, color: 'var(--dark-90)' }}>{v}</span>
    </div>
  );
}

/**
 * Focused panel for one Blaze asset. Top: the attribution insight + identity
 * (content preview, campaign, feature — each a card that leads to its source).
 * Below: the auto-stamped UTMs and the traffic it drove.
 */
export function AssetPanel({ assetId, onClose }: { assetId: string | null; onClose: () => void }) {
  const navigate = useNavigate();
  const data = useAnalyticsData();
  const [renderId, setRenderId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (assetId) {
      setRenderId(assetId);
      const t = setTimeout(() => setOpen(true), 20);
      return () => clearTimeout(t);
    }
    setOpen(false);
    const t = setTimeout(() => setRenderId(null), 240);
    return () => clearTimeout(t);
  }, [assetId]);

  if (!renderId) return null;
  const asset = BLAZE_ASSETS[renderId];
  if (!asset) return null;

  const row = data.contentRows().find((r) => r.asset.id === renderId);
  const breakdown = data.assetChannelBreakdown(renderId);
  const visitors = row?.visitors ?? 0;
  const leads = row?.leads ?? 0;
  const clients = row?.clients ?? 0;
  const dest = channelDestination(asset.channel);

  const { utm } = asset;
  const utmEntries: [string, string | undefined][] = [
    ['source', utm.source],
    ['medium', utm.medium],
    ['campaign', utm.campaign],
    ['content', utm.content],
    ['term', utm.term],
  ];

  const go = (href: string) => {
    navigate(href);
    onClose();
  };

  const headerExtra = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <HeaderStat label="Visitors" value={fmtInt(visitors)} />
      <HeaderStat label="Leads" value={fmtInt(leads)} />
      <HeaderStat label="Clients" value={fmtInt(clients)} />
      <HeaderStat label="Conversion" value={fmtPct(conversionRate(visitors, leads))} />
    </div>
  );

  const typeLabel = assetTypeLabel(asset.type);
  const channelLabel = CHANNEL_LABEL[asset.channel];
  const eyebrow = typeLabel === channelLabel ? typeLabel : `${typeLabel} · ${channelLabel}`;

  return (
    <DrawerShell open={open} onClose={onClose} eyebrow={eyebrow} title={asset.title} headerExtra={headerExtra}>
      {/* insight — moved up under the metrics */}
      <div style={{ padding: '0 8px' }}>
        <Text variant="primary">
          The {fmtInt(clients)} clients and {fmtInt(leads)} leads from this asset carry its attribution into the Leads Inbox → AI
          Sales Rep.
        </Text>
      </div>

      {/* identity: content preview, campaign, feature — each leads to its source */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 8px' }}>
        <ContentField asset={asset} />
        <SourceField label="Campaign" value={campaignName(asset.utm.campaign)} thumbSeed={asset.utm.campaign} onClick={() => go('/h2/campaigns')} />
        {dest && <SourceField label="Managed in" value={dest.label} onClick={() => go(dest.href)} />}
      </div>

      {/* UTMs */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionHead title="Auto-stamped UTMs" sub={`Stamped by Blaze at publish — ${formatLongDate(asset.publishedAt)}`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
          {utmEntries.filter(([, v]) => v).map(([k, v]) => (
            <UtmRow key={k} k={k} v={v as string} />
          ))}
        </div>
      </section>

      {/* traffic */}
      {breakdown.length > 0 ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SectionHead title="Traffic by channel" sub="Where this asset surfaced" />
          <div style={{ padding: '0 8px' }}>
            {breakdown.map((s) => (
              <RowStatic key={s.channel} cols="minmax(0,1fr) 56px 44px" align="center">
                <CellLabel size={13}>{CHANNEL_LABEL[s.channel]}</CellLabel>
                <Num strong>{fmtInt(s.visitors)}</Num>
                <Num>{fmtInt(s.leads)}</Num>
              </RowStatic>
            ))}
          </div>
        </section>
      ) : (
        <span style={{ fontFamily: FONT, fontSize: 12, letterSpacing: tracking(12), color: 'var(--dark-60)', padding: '0 8px' }}>
          Landing page — a destination, so traffic isn't split by channel here.
        </span>
      )}
    </DrawerShell>
  );
}
