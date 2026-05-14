import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Heading, IconButton, ModalStack, Text } from '@/components';
import { Avatar, TabChip } from '@/staging';
import Filter from '@/icons/20/Filter';
import ArrowLeft from '@/icons/20/ArrowLeft';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { ChannelGlyph, SdrDetail } from '../SdrDetail';
import {
  ALL_CHANNELS,
  ALL_STATUSES,
  CHANNEL_LABELS,
  LEADS,
  STATUS_STYLES,
  formatRelative,
  relativeMinutesAgo,
  scoreColor,
  truncate,
  type Channel,
  type Lead,
  type Status,
} from '../sdr-data';

/**
 * /h2/sdr — AI inbound-sales SDR.
 *
 * Two screens, one route:
 *   - Inbox (table) — default. A single "Filters" button opens a popover with
 *     all four filter groups (channel/status/date/score).
 *   - Detail (three-pane) — opened by clicking a row. Internal state, no
 *     router change. Back link returns to the inbox.
 *
 * Cold state shows a brief empty-state message — there's no separate
 * cold-page surface for SDR after this rebuild.
 */

type DateFilter = 'today' | '7d' | '30d' | 'all';
type ScoreFilter = 'top' | 'all' | 'bottom25';

const DATE_LABELS: Record<DateFilter, string> = {
  today: 'Today',
  '7d': '7d',
  '30d': '30d',
  all: 'All',
};

const SCORE_LABELS: Record<ScoreFilter, string> = {
  top: '60+ (Strong)',
  all: 'All',
  bottom25: 'Bottom 25%',
};

const DATE_DEFAULT: DateFilter = 'all';
const SCORE_DEFAULT: ScoreFilter = 'all';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function latestSnippet(lead: Lead): string {
  const turns = [...lead.transcript].reverse();
  for (const t of turns) {
    if (t.type === 'text' && t.content) return t.content;
    if (t.type === 'call' && t.call?.turns?.length) {
      return t.call.turns[t.call.turns.length - 1].line;
    }
  }
  if (lead.transcript.length) return lead.transcript[lead.transcript.length - 1].content;
  return '';
}

export function SdrRoute() {
  return (
    <ModalStack>
      <SdrInner />
    </ModalStack>
  );
}

function SdrInner() {
  const { getState } = useDevState();
  const isCold = getState('/h2/sdr') === 'cold';
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  // Filters
  const [channels, setChannels] = useState<Set<Channel>>(new Set());
  const [statuses, setStatuses] = useState<Set<Status>>(new Set());
  const [dateFilter, setDateFilter] = useState<DateFilter>(DATE_DEFAULT);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>(SCORE_DEFAULT);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortedLeads = useMemo(() => {
    return [...leads].sort(
      (a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at),
    );
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return sortedLeads.filter((lead) => {
      if (channels.size > 0 && !channels.has(lead.channel)) return false;
      if (statuses.size > 0 && !statuses.has(lead.status)) return false;

      const minsAgo = relativeMinutesAgo(lead.last_activity_at);
      if (dateFilter === 'today' && minsAgo > 24 * 60) return false;
      if (dateFilter === '7d' && minsAgo > 7 * 24 * 60) return false;
      if (dateFilter === '30d' && minsAgo > 30 * 24 * 60) return false;

      if (scoreFilter === 'top' && lead.score < 60) return false;
      if (scoreFilter === 'bottom25' && lead.score >= 25) return false;
      return true;
    });
  }, [sortedLeads, channels, statuses, dateFilter, scoreFilter]);

  const activeFilterCount =
    channels.size +
    statuses.size +
    (dateFilter !== DATE_DEFAULT ? 1 : 0) +
    (scoreFilter !== SCORE_DEFAULT ? 1 : 0);

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const updateLead = (next: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === next.id ? next : l)));
  };

  const activeLead = activeLeadId ? leads.find((l) => l.id === activeLeadId) ?? null : null;

  // ─── Cold view ─────────────────────────────────────────────────────
  if (isCold) {
    return (
      <H2Layout topbarRight={<GenerateReportButton />}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 24px',
            minHeight: 360,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <Heading level={3} style={{ marginBottom: 8 }}>
            No leads yet
          </Heading>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.55, maxWidth: 400 }}>
            Once you connect your channels — forms, inbound calls, chat widget —
            leads will appear here. The AI will respond in &lt;60s, qualify, and
            route to the right next step.
          </Text>
        </div>
      </H2Layout>
    );
  }

  // ─── Detail view ───────────────────────────────────────────────────
  if (activeLead) {
    return (
      <H2Layout
        title={<DetailTitleCluster lead={activeLead} onBack={() => setActiveLeadId(null)} />}
        topbarRight={<GenerateReportButton />}
      >
        <SdrDetail lead={activeLead} onUpdateLead={updateLead} />
      </H2Layout>
    );
  }

  // ─── Inbox view ────────────────────────────────────────────────────
  const filtersButton = (
    <FiltersPopoverButton
      count={activeFilterCount}
      open={filtersOpen}
      onToggle={() => setFiltersOpen((v) => !v)}
      onClose={() => setFiltersOpen(false)}
    >
      <FilterGroup label="Channel">
        {ALL_CHANNELS.map((c) => (
          <TabChip
            key={c}
            selected={channels.has(c)}
            onSelect={() => setChannels((prev) => toggle(prev, c))}
          >
            {CHANNEL_LABELS[c]}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Status">
        {ALL_STATUSES.map((s) => (
          <TabChip
            key={s}
            selected={statuses.has(s)}
            onSelect={() => setStatuses((prev) => toggle(prev, s))}
          >
            {STATUS_STYLES[s].label}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Date">
        {(Object.keys(DATE_LABELS) as DateFilter[]).map((d) => (
          <TabChip key={d} selected={dateFilter === d} onSelect={() => setDateFilter(d)}>
            {DATE_LABELS[d]}
          </TabChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Score">
        {(Object.keys(SCORE_LABELS) as ScoreFilter[]).map((s) => (
          <TabChip key={s} selected={scoreFilter === s} onSelect={() => setScoreFilter(s)}>
            {SCORE_LABELS[s]}
          </TabChip>
        ))}
      </FilterGroup>
    </FiltersPopoverButton>
  );

  return (
    <H2Layout
      topbarRight={
        <>
          {filtersButton}
          <GenerateReportButton />
        </>
      }
    >
      <div style={{ padding: '20px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
        {/* section: inbox table */}
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(220px, 1.6fr) 140px minmax(240px, 1.8fr) 100px 140px',
              background: 'var(--dark-2)',
              borderBottom: '1px solid var(--dark-8)',
              padding: '10px 16px',
              gap: 12,
              fontSize: 11,
              color: 'var(--dark-40)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>Prospect</span>
            <span>Channel</span>
            <span>Last activity</span>
            <span>Score</span>
            <span>Status</span>
          </div>

          {filteredLeads.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Text variant="secondary">No leads match these filters.</Text>
            </div>
          )}

          {filteredLeads.map((lead, i) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isLast={i === filteredLeads.length - 1}
              onOpen={() => setActiveLeadId(lead.id)}
            />
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <Text variant="secondary" style={{ fontSize: 12 }}>
            {filteredLeads.length} of {leads.length} leads · sorted by last activity
          </Text>
        </div>
      </div>
    </H2Layout>
  );
}

// ─── Detail-view title cluster (back · name · status pill) ────────────
// Sits left-aligned in the topbar's title slot (where the "SDR" string
// normally lives). Icon-only back button — no text — so the cluster stays
// compact and lets the lead name read as the page identity.

function DetailTitleCluster({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const ss = STATUS_STYLES[lead.status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        aria-label="Back to inbox"
        onPress={onBack}
      />
      <span
        aria-hidden
        style={{ width: 1, height: 16, background: 'var(--dark-15)' }}
      />
      <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
        {lead.prospect.name}
      </Text>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 999,
          background: ss.bg,
          color: ss.fg,
          fontSize: 11.5,
          fontWeight: 500,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.fg }} />
        {ss.label}
      </span>
    </div>
  );
}

// ─── Filters popover ──────────────────────────────────────────────────

function FiltersPopoverButton({
  count,
  open,
  onToggle,
  onClose,
  children,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  // Anchor the popover to the trigger's viewport rect (position: fixed). Now
  // that the Filters button lives in the topbar, an ancestor's stacking or
  // overflow could clip a position: absolute popover — fixed sidesteps that.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const POPOVER_WIDTH = 360;
  const VIEWPORT_PADDING = 16;

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Right-align the popover under the trigger, but clamp so it doesn't
      // bleed off the left edge of the viewport on narrow widths.
      const desiredRight = window.innerWidth - r.right;
      const maxRight = window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING;
      setAnchor({ top: r.bottom + 8, right: Math.min(desiredRight, maxRight) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div ref={triggerRef} style={{ display: 'inline-flex' }}>
      <Button variant="secondary" size="md" frontIcon={Filter} onPress={onToggle}>
        {count > 0 ? `Filters · ${count}` : 'Filters'}
      </Button>
      {open && anchor && (
        <>
          {/* outside-click catcher */}
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9 }}
          />
          <div
            role="dialog"
            aria-label="Filters"
            style={{
              position: 'fixed',
              top: anchor.top,
              right: Math.max(anchor.right, VIEWPORT_PADDING),
              width: POPOVER_WIDTH,
              maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
              padding: 16,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        variant="metadata"
        style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dark-40)' }}
      >
        {label}
      </Text>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

// ─── Lead row ─────────────────────────────────────────────────────────

interface LeadRowProps {
  lead: Lead;
  isLast: boolean;
  onOpen: () => void;
}

function LeadRow({ lead, isLast, onOpen }: LeadRowProps) {
  const ss = STATUS_STYLES[lead.status];
  const sc = scoreColor(lead.score);
  const snippet = latestSnippet(lead);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns:
          'minmax(220px, 1.6fr) 140px minmax(240px, 1.8fr) 100px 140px',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'var(--light-100)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--light-100)')}
    >
      {/* Prospect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar
          src={lead.prospect.avatarUrl}
          fallback={initials(lead.prospect.name)}
          size={32}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text
            style={{
              fontWeight: 500,
              color: 'var(--dark-90)',
              fontSize: 13.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lead.prospect.name}
          </Text>
          <Text
            variant="secondary"
            style={{
              fontSize: 11.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lead.prospect.phone} · {lead.prospect.email}
          </Text>
        </div>
      </div>

      {/* Channel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <ChannelGlyph channel={lead.channel} size={16} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text style={{ fontSize: 12.5, color: 'var(--dark-90)' }}>
            {CHANNEL_LABELS[lead.channel]}
          </Text>
          {lead.channel === 'missed-call' && (
            <Text style={{ fontSize: 10.5, color: 'var(--red-70)', fontWeight: 500 }}>
              missed
            </Text>
          )}
        </div>
      </div>

      {/* Last activity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Text style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
          {formatRelative(lead.last_activity_at)}
        </Text>
        <Text
          style={{
            fontSize: 12.5,
            color: 'var(--dark-80)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          {truncate(snippet, 60)}
        </Text>
      </div>

      {/* Score — color-coded number with matching dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.fg }} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: sc.fg,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {lead.score}
        </Text>
      </div>

      {/* Status */}
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 999,
            background: ss.bg,
            color: ss.fg,
            fontSize: 11.5,
            fontWeight: 500,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.fg }} />
          {ss.label}
        </span>
      </div>
    </div>
  );
}
