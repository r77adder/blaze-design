import type { ComponentType } from 'react';
import { Button, Text } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import ArrowUpRightSm from '@/icons/16/ArrowUpRightSm';
import Calendar1 from '@/icons/20/Calendar1';
import Cursor04 from '@/icons/20/Cursor04';
import Document from '@/icons/20/Document';
import FileMultiple from '@/icons/20/FileMultiple';
import Globe from '@/icons/20/Globe';
import Google from '@/icons/20/Google';
import LineChartUp02 from '@/icons/20/LineChartUp02';
import Mail from '@/icons/20/Mail';
import Map02 from '@/icons/20/Map02';
import Star from '@/icons/20/Star';
import VideoOn from '@/icons/20/VideoOn';
import Iphone02 from '@/icons/16/Iphone02';
import StillImageIcon from '../h2/StillImageIcon';
import type { ApprovalContent, ApprovalItem } from './ApprovalQuickModal';

/**
 * Bespoke Grain Design Flooring Home feed cards. One tailored card per approval
 * type, plus a distinct insight card. Replaces H2's generic `<FeedItem>`.
 *
 * Sign-off cards: a type glyph + label, a stand-alone title (no eyebrow, no
 * subtitle), a brief body line, a small preview (thumbnail / thumbnail strip /
 * count chip), and exactly ONE primary (filled) CTA whose label fits the work.
 * Clicking the card or the CTA opens the carousel modal at piece 0.
 *
 * Insight cards: a stat + trend, a plain-English "what this means" body line,
 * and a QUIET tertiary link ("See in Insights") into the relevant Insights tab.
 * No primary buttons, no mismatched action verbs.
 */

const F = "'Sohne', sans-serif";
const dark90 = 'var(--dark-90)';
const dark80 = 'var(--dark-80)';
const dark60 = 'var(--dark-60)';
const dark8 = 'var(--dark-8)';
const dark4 = 'var(--dark-4)';
const white = 'var(--light-100)';
const green = 'var(--status-approved)';

type Glyph = ComponentType<{ size?: number; color?: string }>;

// ── Per-type glyph + colored label (mirrors Approvals' TYPE_META palette) ──────
// Exported so the approval modal can label each piece with the same content
// type the original Home feed card shows.
export const TYPE_META: Record<ApprovalContent['type'], { icon: Glyph; color: string; label: string }> = {
  organic:       { icon: StillImageIcon, color: 'var(--red-70)',         label: 'Organic post' },
  story:         { icon: Iphone02,       color: 'var(--status-new)',     label: 'Story' },
  video:         { icon: VideoOn,        color: 'var(--purple)',         label: 'Video / Reel' },
  email:         { icon: Mail,           color: 'var(--status-review)',  label: 'Email' },
  blog:          { icon: Document,       color: 'var(--status-approved)',label: 'Blog' },
  'paid-search': { icon: Google,         color: 'var(--status-posting)', label: 'Paid search ad' },
  'paid-social': { icon: Cursor04,       color: 'var(--status-posting)', label: 'Paid social ad' },
  reputation:    { icon: Star,           color: 'var(--brand)',          label: 'Reputation reply' },
};

const INSIGHT_ICON: Record<string, Glyph> = {
  map: Map02,
  landing: Globe,
};

// Pull a representative thumbnail off any preview piece (varies by type).
function pieceImage(c: ApprovalContent): string | undefined {
  switch (c.type) {
    case 'organic':
    case 'story':
    case 'paid-social':
      return c.image;
    case 'video':
      return c.poster;
    case 'email':
      return c.hero;
    case 'blog':
      return c.cover;
    case 'paid-search':
    case 'reputation':
      return undefined; // text-led previews — no photo
  }
}

const THUMB = 56;

// Thumbnail strip (up to 4) with a "+N" overflow tile — used for batches.
function ThumbStrip({ images, total, isVideo }: { images: string[]; total: number; isVideo?: boolean }) {
  const visible = images.slice(0, 4);
  const overflow = total - visible.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {visible.map((src, i) => (
        <div key={`${src}-${i}`} style={{ position: 'relative', width: THUMB, height: THUMB, borderRadius: 8, overflow: 'hidden', border: `1px solid ${dark8}`, background: dark4 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {isVideo && (
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="14" viewBox="0 0 16 18" fill={white} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}><path d="M2 2L14 9L2 16V2Z" /></svg>
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div style={{ width: THUMB, height: THUMB, borderRadius: 8, border: `1px solid ${dark8}`, background: dark4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: dark60, fontFamily: F, fontVariantNumeric: 'tabular-nums' }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

// A single-image preview tile (single-piece content with a photo).
function SingleThumb({ src, isVideo }: { src: string; isVideo?: boolean }) {
  return (
    <div style={{ position: 'relative', width: THUMB, height: THUMB, borderRadius: 8, overflow: 'hidden', border: `1px solid ${dark8}`, background: dark4 }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {isVideo && (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="14" viewBox="0 0 16 18" fill={white} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}><path d="M2 2L14 9L2 16V2Z" /></svg>
        </span>
      )}
    </div>
  );
}

// A count chip for batches with no useful imagery, or as a label alongside thumbs.
function CountChip({ count, noun }: { count: number; noun: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 8, background: dark4, fontSize: 13, fontWeight: 500, color: dark80, fontFamily: F, fontVariantNumeric: 'tabular-nums' }}>
      {count} {noun}
    </span>
  );
}

const baseCard: React.CSSProperties = {
  background: white, border: `1px solid var(--dark-4)`, borderRadius: 14, padding: '18px 20px',
  display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 120ms ease, box-shadow 120ms ease',
};

function hoverOn(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.borderColor = 'var(--dark-15)';
  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
}
function hoverOff(e: React.MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.borderColor = 'var(--dark-4)';
  e.currentTarget.style.boxShadow = 'none';
}

// ── Sign-off card ──────────────────────────────────────────────────────────────
function ActionCard({ item, onOpen }: { item: ApprovalItem; onOpen: () => void }) {
  const pieces = item.approvals ?? (item.approval ? [item.approval] : []);
  const total = pieces.length;
  const type = pieces[0]?.type;
  const meta = type ? TYPE_META[type] : undefined;
  const TypeIcon = meta?.icon;
  const isVideo = type === 'video';

  // Build the preview: a strip for batches, a single thumb / count chip otherwise.
  const images = pieces.map(pieceImage).filter((s): s is string => Boolean(s));
  let preview: React.ReactNode = null;
  if (total > 1 && images.length > 0) {
    preview = <ThumbStrip images={images} total={total} isVideo={isVideo} />;
  } else if (total > 1) {
    preview = <CountChip count={total} noun={pluralNoun(type)} />;
  } else if (images.length === 1) {
    preview = <SingleThumb src={images[0]!} isVideo={isVideo} />;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      style={{ ...baseCard, cursor: 'pointer' }}
    >
      {/* meta row: type glyph + label · source · time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {TypeIcon && meta && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <TypeIcon size={16} color={meta.color} />
            <Text variant="metadata" style={{ color: dark80, fontWeight: 500, fontSize: 12.5 }}>{meta.label}</Text>
          </span>
        )}
        <Text variant="metadata" style={{ color: dark60, fontSize: 12 }}>· {item.sourceLabel}</Text>
        <Text variant="metadata" style={{ marginLeft: 'auto', color: 'var(--dark-40)', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>{item.time}</Text>
      </div>

      {/* stand-alone title */}
      <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px' }}>
        {item.title}
      </Text>

      {/* brief body line */}
      <Text variant="secondary" style={{ display: 'block', lineHeight: 1.55, color: dark60, fontSize: 13.5 }}>
        {item.body}
      </Text>

      {/* preview + primary CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
        <div>{preview}</div>
        {item.primary && (
          <Button
            variant="secondary"
            size="sm"
            endIcon={ArrowRightSm}
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            {item.primary}
          </Button>
        )}
      </div>
    </div>
  );
}

function pluralNoun(type?: ApprovalContent['type']): string {
  switch (type) {
    case 'organic': return 'posts';
    case 'story': return 'stories';
    case 'video': return 'videos';
    case 'email': return 'emails';
    case 'blog': return 'articles';
    case 'paid-search':
    case 'paid-social': return 'ads';
    case 'reputation': return 'replies';
    default: return 'items';
  }
}

// ── Insight card ───────────────────────────────────────────────────────────────
function InsightCard({ item, onSee }: { item: ApprovalItem; onSee: (to: string) => void }) {
  const ins = item.insight;
  const Icon = INSIGHT_ICON[item.source] ?? LineChartUp02;
  const up = ins?.trend !== 'down';

  return (
    <div onMouseEnter={hoverOn} onMouseLeave={hoverOff} style={baseCard}>
      {/* meta row: insight glyph + source · time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon size={16} color={dark60} />
          <Text variant="metadata" style={{ color: dark60, fontSize: 12 }}>Insight · {item.sourceLabel}</Text>
        </span>
        <Text variant="metadata" style={{ marginLeft: 'auto', color: 'var(--dark-40)', fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>{item.time}</Text>
      </div>

      {/* stat + title, side by side */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {ins && (
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 14, borderRight: `1px solid ${dark8}` }}>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: dark90, fontFamily: F, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px' }}>{ins.stat}</span>
              <LineChartUp02 size={16} color={up ? green : 'var(--red-90)'} style={{ transform: up ? 'none' : 'scaleY(-1)' }} />
            </span>
            <Text variant="metadata" style={{ color: dark60, fontSize: 11.5 }}>{ins.statLabel}</Text>
          </div>
        )}
        <Text variant="largeList" style={{ display: 'block', lineHeight: 1.35, letterSpacing: '-0.1px', alignSelf: 'center' }}>
          {item.title}
        </Text>
      </div>

      {/* plain-English "what this means" */}
      <Text variant="secondary" style={{ display: 'block', lineHeight: 1.55, color: dark60, fontSize: 13.5 }}>
        {item.body}
      </Text>

      {/* QUIET tertiary link — no primary button on insights */}
      {ins && (
        <div>
          <Button variant="subtle" size="sm" endIcon={ArrowUpRightSm} onClick={() => onSee(ins.to)}>
            {ins.linkLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function HomeCard({ item, onOpen, onSee }: {
  item: ApprovalItem;
  onOpen: (item: ApprovalItem) => void;
  onSee: (to: string) => void;
}) {
  if (item.kind === 'insight') return <InsightCard item={item} onSee={onSee} />;
  return <ActionCard item={item} onOpen={() => onOpen(item)} />;
}
