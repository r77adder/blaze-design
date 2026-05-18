import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { StatusPill, useToast } from '@/staging';
import Instagram from '@/icons/20/Instagram';
import Facebook from '@/icons/20/Facebook';
import LinkedIn from '@/icons/20/LinkedIn';
import TikTokBrand from '@/icons/20/TikTokBrand';
import TwitterBrand from '@/icons/20/TwitterBrand';
import YouTubeBrand from '@/icons/20/YouTubeBrand';
import Google from '@/icons/20/Google';
import Check2 from '@/icons/20/Check2';
import Close from '@/icons/20/Close';
import StarFilled from '@/icons/20/StarFilled';
import ChevronDown16 from '@/icons/16/ChevronDown';
import ChevronDown from '@/icons/20/ChevronDown';
import ArrowRight from '@/icons/20/ArrowRight';
import {
  AEO_PROMPTS,
  ASSISTANTS,
  BLAZE_START_LABEL,
  COMPETITORS,
  OVERALL_DELTA,
  OVERALL_SCORE,
  PAID_SEARCH_ADS,
  PAID_SOCIAL_ADS,
  PLATFORM_METRICS,
  REPUTATION,
  SECTION_META,
  SEO_QUERIES,
  SOCIAL_PLATFORMS,
  SOCIAL_PRESENCE,
  WEBSITE_APPEARANCE,
  WEBSITE_CONTENT,
  type CompetitorId,
  type Platform,
  type WebsiteCheck,
} from '../business-scorecard-data';
import { useTools, type ToolId } from '../tools-context';

// ── Score helpers ───────────────────────────────────────────────────────────

function scoreTone(value: number): { stroke: string; track: string; disk: string } {
  if (value >= 70) return { stroke: '#04af00', track: 'rgba(4, 175, 0, 0.12)', disk: 'rgba(4, 175, 0, 0.06)' };
  if (value >= 50) return { stroke: '#edb62c', track: 'rgba(237, 182, 44, 0.16)', disk: 'rgba(237, 182, 44, 0.07)' };
  if (value >= 30) return { stroke: '#ed7c2c', track: 'rgba(237, 124, 44, 0.16)', disk: 'rgba(237, 124, 44, 0.06)' };
  return { stroke: 'var(--red-70)', track: 'rgba(188, 1, 11, 0.10)', disk: 'rgba(188, 1, 11, 0.05)' };
}

/** Ease the number AND the arc together from 0 to `target` on mount.
 *  Single source of truth so the bar and the digit stay in sync. */
function useAnimatedScore(target: number, duration = 900): number {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic — fast in, gentle settle
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return current;
}

function ScoreRing({ value, size = 48, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(value);
  const animated = useAnimatedScore(value);
  const offset = circumference * (1 - animated / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Faded fill disk inside the ring — gives the score visual weight
            against neutral backgrounds without competing with the arc. */}
        <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} fill={tone.disk} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tone.track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.32),
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '0.3px',
        }}
      >
        {Math.round(animated)}
      </div>
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <StatusPill tone={positive ? 'success' : 'danger'} size="sm">
      {positive ? '↑' : '↓'} {positive ? '+' : ''}{value} {BLAZE_START_LABEL}
    </StatusPill>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroCard() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        padding: 32,
        marginBottom: 40,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-60)' }}>Business Score</span>
        <HeroScoreRing value={OVERALL_SCORE} delta={OVERALL_DELTA} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <Heading level={1}>You're climbing — here's where to push next.</Heading>
        <Text
          variant="primary"
          style={{
            display: 'block',
            color: 'var(--dark-90)',
            fontSize: 16,
            lineHeight: 1.55,
          }}
        >
          Reputation and SEO are your strongest plays. Paid social and AEO have the most ground left to make
          up — focus the next 30 days on closing those gaps.
        </Text>
      </div>
    </div>
  );
}

/** Larger ring used in the hero. Renders the score number and a compact
 *  delta label stacked inside the ring. */
function HeroScoreRing({ value, delta }: { value: number; delta: number }) {
  const size = 168;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(value);
  const positive = delta >= 0;
  const animated = useAnimatedScore(value, 1100);
  const offset = circumference * (1 - animated / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} fill={tone.disk} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tone.track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 52, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1, letterSpacing: '-0.5px' }}>
          {Math.round(animated)}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 13,
            fontWeight: 500,
            color: positive ? '#036b00' : 'var(--red-90)',
          }}
        >
          {positive ? '↑' : '↓'} {positive ? '+' : ''}{delta}
        </span>
      </div>
    </div>
  );
}

// ── Section shell ───────────────────────────────────────────────────────────

interface SectionCardProps {
  name: string;
  score: number;
  delta: number;
  headline: string;
  sub: string;
  /** Route to navigate to when the section CTA is pressed (used when the
   *  tool is enabled). */
  ctaTo: string;
  /** Tool that powers this section. Drives the CTA: when enabled, the CTA
   *  reads "Open {name}" and navigates to `ctaTo`; when disabled, it reads
   *  "Turn on {name}" and flips the tool on in place. */
  toolId: ToolId;
  children: ReactNode;
}

function SectionCard({ name, score, delta, headline, sub, ctaTo, toolId, children }: SectionCardProps) {
  const navigate = useNavigate();
  const { isEnabled, enable } = useTools();
  const enabledTool = isEnabled(toolId);
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flexWrap: 'wrap' }}>
          <ScoreRing value={score} size={48} />
          <Heading level={3} style={{ margin: 0 }}>{name}</Heading>
          <DeltaPill value={delta} />
        </div>
        <div style={{ flexShrink: 0 }}>
          {enabledTool ? (
            <Button variant="secondary" size="md" onPress={() => navigate(ctaTo)} endIcon={ArrowRight}>
              Open {toolId}
            </Button>
          ) : (
            <Button variant="secondary" size="md" onPress={() => enable(toolId)}>
              Turn on {toolId}
            </Button>
          )}
        </div>
      </div>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Heading level={5} style={{ marginBottom: 4 }}>{headline}</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>{sub}</Text>
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Competitor cell helpers ────────────────────────────────────────────────

function CompetitorAvatar({ id, size = 28 }: { id: CompetitorId; size?: number }) {
  const c = COMPETITORS.find((x) => x.id === id)!;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 6,
        background: c.color,
        color: 'var(--light-100)',
        fontSize: Math.round(size * 0.46),
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {c.initial}
    </span>
  );
}

function CompetitorLabel({ id }: { id: CompetitorId }) {
  const c = COMPETITORS.find((x) => x.id === id)!;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <CompetitorAvatar id={id} />
      <span
        style={{
          fontSize: 14,
          color: 'var(--dark-90)',
          fontWeight: c.self ? 500 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {c.name}
      </span>
    </div>
  );
}

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ size?: number; color?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: LinkedIn,
  tiktok: TikTokBrand,
  x: TwitterBrand,
  youtube: YouTubeBrand,
};

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  x: 'X',
  youtube: 'YouTube',
};

// ── Section 1: Social Media Presence ───────────────────────────────────────

function SocialMediaSection() {
  const meta = SECTION_META.social;
  const [platform, setPlatform] = useState<Platform>('instagram');
  const metrics = PLATFORM_METRICS[platform];
  const PlatformIcon = PLATFORM_ICONS[platform];
  return (
    <SectionCard
      name="Social Media Presence"
      score={meta.score}
      delta={meta.delta}
      headline="You're missing platforms where your competitors are already active"
      sub="See how your social presence stacks up against local competitors."
      ctaTo="/h2/organic-social"
      toolId="Organic Campaigns"
    >
      <SocialCoverageMatrix />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 32, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <PlatformIcon size={20} />
          <Heading level={5} style={{ margin: 0 }}>{metrics.headline}</Heading>
        </div>
        <PlatformDropdown value={platform} onChange={setPlatform} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        <SubCard
          title="Posts per week"
          sub="Consistency matters more than volume. Even 1–2 posts a week can meaningfully boost reach."
          values={metrics.postsPerWeek}
          average={metrics.averages.postsPerWeek}
          delta={metrics.selfDeltas.postsPerWeek}
          format={(v) => String(v)}
          showBars
        />
        <SubCard
          title="Followers"
          sub="More followers means a bigger audience for every post you publish."
          values={metrics.followersK}
          average={metrics.averages.followersK}
          delta={metrics.selfDeltas.followersK}
          format={(v) => `${v}k`}
          deltaFormat={(v) => `${v >= 0 ? '+' : ''}${v}k`}
        />
        <SubCard
          title="Engagement"
          sub="Engagement rate shows how well your content resonates — often more telling than follower count."
          values={metrics.engagementPct}
          average={metrics.averages.engagementPct}
          delta={metrics.selfDeltas.engagementPct}
          format={(v) => `${v.toFixed(2)}%`}
          deltaFormat={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
        />
        <SubCard
          title="Impressions"
          sub="Impressions measure how often your posts are seen — a key signal of your overall reach."
          values={metrics.impressionsK}
          average={metrics.averages.impressionsK}
          delta={metrics.selfDeltas.impressionsK}
          format={(v) => (v > 0 ? `${v}k` : '0')}
          deltaFormat={(v) => `${v >= 0 ? '+' : ''}${v}k`}
        />
      </div>
    </SectionCard>
  );
}

// Compact dropdown for switching the sub-metric platform. Uses native button
// + popup pattern — light styling, click-outside to close.
function PlatformDropdown({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const Icon = PLATFORM_ICONS[value];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px 6px 8px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--dark-90)',
          minWidth: 140,
        }}
      >
        <Icon size={16} />
        <span style={{ flex: 1, textAlign: 'left' }}>{PLATFORM_LABEL[value]}</span>
        <ChevronDown size={16} color="var(--dark-60)" />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: 4,
            zIndex: 5,
            minWidth: 180,
          }}
        >
          {SOCIAL_PLATFORMS.map((p) => {
            const PIcon = PLATFORM_ICONS[p];
            const selected = p === value;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  background: selected ? 'var(--dark-4)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: 'var(--dark-90)',
                  textAlign: 'left',
                }}
              >
                <PIcon size={16} />
                {PLATFORM_LABEL[p]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SocialCoverageMatrix() {
  // Avg row = check if a majority of NON-self competitors are on the platform.
  const nonSelf = COMPETITORS.filter((c) => !c.self);
  const avgCells = SOCIAL_PLATFORMS.map((p) => {
    const onCount = nonSelf.filter((c) => SOCIAL_PRESENCE[c.id][p]).length;
    const majority = onCount >= Math.ceil(nonSelf.length / 2);
    return <PresenceCheck present={majority} />;
  });
  return (
    <Matrix
      columns={SOCIAL_PLATFORMS.map((p) => ({ key: p, label: PLATFORM_LABEL[p], Icon: PLATFORM_ICONS[p] }))}
      rows={COMPETITORS.map((c) => ({
        id: c.id,
        cells: SOCIAL_PLATFORMS.map((p) => {
          const present = SOCIAL_PRESENCE[c.id][p];
          return <PresenceCheck present={present} highlighted={c.self} />;
        }),
      }))}
      avgRow={{ cells: avgCells }}
    />
  );
}

function PresenceCheck({ present, highlighted }: { present: boolean; highlighted?: boolean }) {
  if (highlighted) {
    return present
      ? <Check2 size={20} color="#04af00" />
      : <Close size={20} color="var(--red-70)" />;
  }
  return present
    ? <Check2 size={20} color="var(--dark-40)" />
    : <Close size={20} color="var(--dark-15)" />;
}

interface SubCardProps {
  title: string;
  sub: string;
  values: number[];
  average: number;
  /** Delta for the workspace (Radiant Health) on this metric since starting Blaze. */
  delta: number;
  format: (v: number) => string;
  /** Formatter for the delta pill. Defaults to "+N"/"N" plain number. */
  deltaFormat?: (v: number) => string;
  showBars?: boolean;
}

function SubCard({ title, sub, values, average, delta, format, deltaFormat, showBars }: SubCardProps) {
  const max = Math.max(...values, average, 1);
  const positive = delta >= 0;
  const deltaLabel = deltaFormat
    ? deltaFormat(delta)
    : `${positive ? '+' : ''}${delta}`;
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: 'var(--light-100)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Heading level={5} style={{ marginBottom: 4 }}>{title}</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>{sub}</Text>
        </div>
        {delta !== 0 && (
          <StatusPill tone={positive ? 'success' : 'danger'} size="sm">
            {positive ? '↑' : '↓'} {deltaLabel}
          </StatusPill>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {COMPETITORS.map((c, i) => (
          <SubCardRow
            key={c.id}
            id={c.id}
            value={values[i]}
            max={max}
            format={format}
            showBars={showBars}
          />
        ))}
        <div style={{ height: 1, background: 'var(--dark-8)', margin: '6px 0' }} />
        <SubCardRow
          id="__avg__"
          value={average}
          max={max}
          format={format}
          showBars={showBars}
          averageLabel
        />
      </div>
    </div>
  );
}

function SubCardRow({
  id,
  value,
  max,
  format,
  showBars,
  averageLabel,
}: {
  id: CompetitorId | '__avg__';
  value: number;
  max: number;
  format: (v: number) => string;
  showBars?: boolean;
  averageLabel?: boolean;
}) {
  const self = id !== '__avg__' && COMPETITORS.find((c) => c.id === id)?.self;
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 8,
        background: self ? 'var(--dark-2)' : 'transparent',
        gap: 12,
      }}
    >
      <div style={{ flex: '0 0 160px', minWidth: 0 }}>
        {averageLabel ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#3b3f47',
                color: 'var(--light-100)',
                fontSize: 12,
              }}
            >
              ⊞
            </span>
            <span style={{ fontSize: 14, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>Avg. competitor</span>
          </div>
        ) : (
          <CompetitorLabel id={id as CompetitorId} />
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        {showBars && (
          <div style={{ flex: 1, height: 8, background: 'var(--dark-4)', borderRadius: 4, overflow: 'hidden', maxWidth: 120 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: self ? 'var(--dark-40)' : 'var(--dark-15)' }} />
          </div>
        )}
        <span
          style={{
            fontSize: 14,
            color: 'var(--dark-90)',
            fontWeight: self ? 500 : 400,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 48,
            textAlign: 'right',
          }}
        >
          {format(value)}
        </span>
      </div>
    </div>
  );
}

// ── Section 2: Paid Social ─────────────────────────────────────────────────

function PaidSocialSection() {
  const meta = SECTION_META.paidSocial;
  return (
    <SectionCard
      name="Paid Social"
      score={meta.score}
      delta={meta.delta}
      headline="You're not running any paid social — your competitors are."
      sub="Active ad counts per platform, last 30 days."
      ctaTo="/h2/paid-social"
      toolId="Paid Social"
    >
      <Matrix
        columns={SOCIAL_PLATFORMS.map((p) => ({ key: p, label: PLATFORM_LABEL[p], Icon: PLATFORM_ICONS[p] }))}
        rows={COMPETITORS.map((c) => ({
          id: c.id,
          cells: SOCIAL_PLATFORMS.map((p) => {
            const n = PAID_SOCIAL_ADS[c.id][p];
            return <AdCountCell value={n} self={c.self} />;
          }),
        }))}
        avgRow={{
          cells: SOCIAL_PLATFORMS.map((p) => {
            const nonSelf = COMPETITORS.filter((c) => !c.self);
            const counts = nonSelf
              .map((c) => PAID_SOCIAL_ADS[c.id][p])
              .filter((v): v is number => typeof v === 'number');
            if (counts.length === 0) return <AdCountCell value={null} />;
            const avg = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
            return <AdCountCell value={avg} />;
          }),
        }}
      />
    </SectionCard>
  );
}

function AdCountCell({ value, self }: { value: number | null; self?: boolean }) {
  if (value === null) {
    return <span style={{ color: 'var(--dark-40)', fontSize: 14 }}>—</span>;
  }
  return (
    <span
      style={{
        fontSize: 14,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: self ? 500 : 400,
        color: self && value === 0 ? 'var(--red-70)' : 'var(--dark-90)',
      }}
    >
      {value}
    </span>
  );
}

// ── Section 3: Paid Search ─────────────────────────────────────────────────

function PaidSearchSection() {
  const meta = SECTION_META.paidSearch;
  const nonSelf = COMPETITORS.filter((c) => !c.self);
  const avg = Math.round(nonSelf.reduce((sum, c) => sum + PAID_SEARCH_ADS[c.id], 0) / nonSelf.length);
  const max = Math.max(...Object.values(PAID_SEARCH_ADS), avg);
  return (
    <SectionCard
      name="Paid Search"
      score={meta.score}
      delta={meta.delta}
      headline="You're running 2 Google Ads — competitors average 10."
      sub="Active Google Ads campaigns per competitor."
      ctaTo="/h2/paid-search"
      toolId="Paid Search"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: 12 }}>
          <div style={{ flex: '0 0 240px', fontSize: 13, color: 'var(--dark-60)' }}>Competitors</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <Google size={20} />
            <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>Google Ads</span>
          </div>
        </div>
        {COMPETITORS.map((c) => (
          <SubCardRow
            key={c.id}
            id={c.id}
            value={PAID_SEARCH_ADS[c.id]}
            max={max}
            format={(v) => String(v)}
            showBars
          />
        ))}
        <div style={{ height: 1, background: 'var(--dark-8)', margin: '6px 0' }} />
        <SubCardRow
          id="__avg__"
          value={avg}
          max={max}
          format={(v) => String(v)}
          showBars
          averageLabel
        />
      </div>
    </SectionCard>
  );
}

// ── Section 4: SEO ─────────────────────────────────────────────────────────

function SeoSection() {
  const meta = SECTION_META.seo;
  const { showToast } = useToast();
  return (
    <SectionCard
      name="Google Visibility (SEO)"
      score={meta.score}
      delta={meta.delta}
      headline="Here's where you rank when customers search for you on Google."
      sub="Each row shows a real search term your customers use and whether your business appears in the results."
      ctaTo="/h2/seo"
      toolId="SEO"
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 12px' }}>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--dark-60)' }}>Search query</div>
          <div style={{ width: 110, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>Organic</div>
          <div style={{ width: 110, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>Map</div>
          <div style={{ width: 32 }} />
        </div>
        {SEO_QUERIES.map((q, i) => (
          <div
            key={q.query}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 8px',
              borderTop: i === 0 ? '1px solid var(--dark-8)' : 'none',
              borderBottom: '1px solid var(--dark-8)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Google size={20} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--dark-90)' }}>{q.query}</div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>
                  🏆 #1 is {q.topName}
                </div>
              </div>
            </div>
            <div style={{ width: 110, display: 'flex', justifyContent: 'center' }}>
              <RankBadge rank={q.organic} />
            </div>
            <div style={{ width: 110, display: 'flex', justifyContent: 'center' }}>
              <RankBadge rank={q.map} />
            </div>
            <button
              type="button"
              onClick={() => showToast({ message: 'Query details (TODO)' })}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--dark-8)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <ChevronDown16 size={16} color="var(--dark-60)" />
            </button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <StatusPill tone="danger" size="md">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Close size={12} color="currentColor" />
          Not Ranked
        </span>
      </StatusPill>
    );
  }
  return <StatusPill tone="success" size="md">#{rank}</StatusPill>;
}

// ── Section 5: AEO ─────────────────────────────────────────────────────────

function AeoSection() {
  const meta = SECTION_META.aeo;
  return (
    <SectionCard
      name="AEO — Visibility in AI Assistants"
      score={meta.score}
      delta={meta.delta}
      headline="Here's how often customers hear about you when they ask an AI."
      sub="Each row is a real prompt customers use. We check whether your brand is mentioned in the answer."
      ctaTo="/h2/aeo"
      toolId="AEO"
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 12px' }}>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--dark-60)' }}>Customer prompt</div>
          {ASSISTANTS.map((a) => (
            <div key={a} style={{ width: 110, textAlign: 'center', fontSize: 13, color: 'var(--dark-60)' }}>{a}</div>
          ))}
        </div>
        {AEO_PROMPTS.map((p, i) => (
          <div
            key={p.prompt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 8px',
              borderTop: i === 0 ? '1px solid var(--dark-8)' : 'none',
              borderBottom: '1px solid var(--dark-8)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--dark-90)' }}>{p.prompt}</div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>
                💬 Top mention: {p.topMention}
              </div>
            </div>
            {ASSISTANTS.map((a) => (
              <div key={a} style={{ width: 110, display: 'flex', justifyContent: 'center' }}>
                <MentionBadge mentioned={p.mentioned[a]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function MentionBadge({ mentioned }: { mentioned: boolean }) {
  return (
    <StatusPill tone={mentioned ? 'success' : 'danger'} size="md">
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {mentioned ? <Check2 size={14} color="currentColor" /> : <Close size={14} color="currentColor" />}
        {mentioned ? 'Mentioned' : 'Missing'}
      </span>
    </StatusPill>
  );
}

// ── Section 6: Website Experience ──────────────────────────────────────────

function WebsiteSection() {
  const meta = SECTION_META.website;
  return (
    <SectionCard
      name="Website Experience"
      score={meta.score}
      delta={meta.delta}
      headline="A few quick fixes would meaningfully lift your site experience."
      sub="Content and appearance checks against best practices for local wellness sites."
      ctaTo="/h2/landing-pages"
      toolId="Landing Pages"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <WebsiteChecklist title="Content" items={WEBSITE_CONTENT} />
        <WebsiteChecklist title="Appearance" items={WEBSITE_APPEARANCE} />
      </div>
    </SectionCard>
  );
}

function WebsiteChecklist({ title, items }: { title: string; items: WebsiteCheck[] }) {
  const { showToast } = useToast();
  return (
    <div>
      <Heading level={5} style={{ marginBottom: 12 }}>{title}</Heading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 4px',
              borderBottom: '1px solid var(--dark-4)',
            }}
          >
            <WebsiteCheckIcon ok={it.ok} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>{it.label}</div>
              {!it.ok && (
                <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 2 }}>{it.description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => showToast({ message: `${it.label}: details (TODO)` })}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--dark-8)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <ChevronDown16 size={16} color="var(--dark-60)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebsiteCheckIcon({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check2 size={20} color="var(--dark-90)" />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: '1.5px solid var(--red-70)',
        background: 'rgba(188, 1, 11, 0.06)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Close size={14} color="var(--red-70)" />
    </span>
  );
}

// ── Section 7: Reputation ──────────────────────────────────────────────────

function ReputationSection() {
  const meta = SECTION_META.reputation;
  const nonSelf = REPUTATION.filter((r) => !COMPETITORS.find((c) => c.id === r.competitor)?.self);
  const avg = {
    rating: nonSelf.reduce((s, r) => s + r.rating, 0) / nonSelf.length,
    reviews: Math.round(nonSelf.reduce((s, r) => s + r.reviews, 0) / nonSelf.length),
    responseRatePct: Math.round(nonSelf.reduce((s, r) => s + r.responseRatePct, 0) / nonSelf.length),
    recent: Math.round(nonSelf.reduce((s, r) => s + r.recent, 0) / nonSelf.length),
  };
  return (
    <SectionCard
      name="Reputation"
      score={meta.score}
      delta={meta.delta}
      headline="You lead on response rate — keep the momentum on review volume."
      sub="Aggregate review data across Google and Yelp, last 30 days."
      ctaTo="/h2/reputation"
      toolId="Reputation"
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 12px', gap: 16 }}>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--dark-60)' }}>Competitors</div>
          <div style={{ width: 100, textAlign: 'right', fontSize: 13, color: 'var(--dark-60)' }}>Avg. rating</div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 13, color: 'var(--dark-60)' }}>Reviews</div>
          <div style={{ width: 110, textAlign: 'right', fontSize: 13, color: 'var(--dark-60)' }}>Response rate</div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 13, color: 'var(--dark-60)' }}>Recent</div>
        </div>
        {[...REPUTATION].sort((a, b) => b.rating - a.rating).map((r, i) => {
          const c = COMPETITORS.find((x) => x.id === r.competitor)!;
          return (
            <div
              key={r.competitor}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 8px',
                background: c.self ? 'var(--dark-2)' : 'transparent',
                borderRadius: c.self ? 8 : 0,
                borderTop: i === 0 ? '1px solid var(--dark-8)' : 'none',
                borderBottom: '1px solid var(--dark-8)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <CompetitorLabel id={r.competitor} />
              </div>
              <div style={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <StarFilled size={14} color="#edb62c" />
                <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: c.self ? 500 : 400 }}>
                  {r.rating.toFixed(1)}
                </span>
              </div>
              <div style={{ width: 90, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: c.self ? 500 : 400, color: 'var(--dark-90)' }}>
                {r.reviews.toLocaleString()}
              </div>
              <div style={{ width: 110, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: c.self ? 500 : 400, color: 'var(--dark-90)' }}>
                {r.responseRatePct}%
              </div>
              <div style={{ width: 90, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: c.self ? 500 : 400, color: 'var(--dark-90)' }}>
                +{r.recent}
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 8px' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'var(--dark-4)',
                color: 'var(--dark-60)',
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              ⊞
            </span>
            <span style={{ fontSize: 14, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>Avg. competitor</span>
          </div>
          <div style={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <StarFilled size={14} color="#edb62c" />
            <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'var(--dark-60)' }}>{avg.rating.toFixed(1)}</span>
          </div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'var(--dark-60)' }}>
            {avg.reviews.toLocaleString()}
          </div>
          <div style={{ width: 110, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'var(--dark-60)' }}>
            {avg.responseRatePct}%
          </div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'var(--dark-60)' }}>
            +{avg.recent}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ── Matrix primitive ───────────────────────────────────────────────────────

interface MatrixColumn {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

interface MatrixRow {
  id: CompetitorId;
  cells: ReactNode[];
}

interface MatrixAvgRow {
  cells: ReactNode[];
}

function Matrix({ columns, rows, avgRow }: { columns: MatrixColumn[]; rows: MatrixRow[]; avgRow?: MatrixAvgRow }) {
  const COL_W = 56;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 12px', gap: 8 }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--dark-60)' }}>Competitors</div>
        {columns.map((col) => (
          <div key={col.key} style={{ width: COL_W, display: 'flex', justifyContent: 'center' }}>
            <col.Icon size={20} />
          </div>
        ))}
      </div>
      {rows.map((row, i) => {
        const c = COMPETITORS.find((x) => x.id === row.id)!;
        return (
          <div
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 8px',
              background: c.self ? 'var(--dark-2)' : 'transparent',
              borderRadius: c.self ? 8 : 0,
              borderBottom: '1px solid var(--dark-4)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <CompetitorLabel id={row.id} />
            </div>
            {row.cells.map((cell, j) => (
              <div key={j} style={{ width: COL_W, display: 'flex', justifyContent: 'center' }}>
                {cell}
              </div>
            ))}
          </div>
        );
      })}
      {avgRow && <MatrixAvgRowView cells={avgRow.cells} columnWidth={COL_W} />}
    </div>
  );
}

function MatrixAvgRowView({ cells, columnWidth }: { cells: ReactNode[]; columnWidth: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 8px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'var(--dark-4)',
            color: 'var(--dark-60)',
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          ⊞
        </span>
        <span style={{ fontSize: 14, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>Avg. competitor</span>
      </div>
      {cells.map((cell, j) => (
        <div key={j} style={{ width: columnWidth, display: 'flex', justifyContent: 'center' }}>
          {cell}
        </div>
      ))}
    </div>
  );
}

// ── Page body ──────────────────────────────────────────────────────────────

export function BusinessScorecardBody() {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: '0 auto',
        // Horizontal padding (24px) acts as a viewport buffer so that on
        // narrower screens we consume the padding before the content has
        // to compress. Vertical padding stays tight at the top because
        // H2Layout already provides chrome.
        padding: '8px 24px 60px',
      }}
    >
      <HeroCard />
      <SocialMediaSection />
      <ReputationSection />
      <PaidSocialSection />
      <PaidSearchSection />
      <SeoSection />
      <AeoSection />
      <WebsiteSection />
    </div>
  );
}
