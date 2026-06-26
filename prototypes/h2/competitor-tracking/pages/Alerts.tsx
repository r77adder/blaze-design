import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { Avatar, Card, Pill, StatusPill, useToast } from '@/staging';
import type { StatusPillTone } from '@/staging';
import { Check2, Filter } from '@/icons/20';
import { H2Layout } from '../../H2Layout';
import { AddCompetitorButton } from '../AddCompetitorButton';
import { CompetitorTabs } from '../CompetitorTabs';
import { ALERTS, COMPETITORS, type AlertItem, type AlertPriority } from '../data';

/**
 * /competitor-tracking/alerts — deep port of the ALERTS page from
 * blaze-trends-prototype.html (lines 6953–7240).
 *
 * Structure mirrors the source:
 *   1. Page header (title + lede).
 *   2. Summary strip (4 stat cards).
 *   3. Filter dropdown (All / Unread / High priority / by competitor / Industry).
 *   4. Vertical list of <AlertCard>s — each is a neutral Card with a meta row,
 *      headline, body, data pills, and primary/ghost action buttons. Priority
 *      is signaled via the type pill (StatusPill tone), not the card border.
 *
 * Interactivity:
 *   - Filter dropdown uses local state; changing it re-renders the visible alerts.
 *   - "Dismiss" removes the alert from the list (local state, not persisted).
 *   - Other action buttons are no-op visuals — they match the source HTML which
 *     just calls a stub `alertAction()` JS function.
 */

type FilterKey = 'all' | 'unread' | 'high' | 'proof' | 'bluenotary' | 'notarypro' | 'industry';

/**
 * Map alert priority to a StatusPill tone for the type pill. The card border
 * itself is now uniformly `var(--dark-8)` — priority is conveyed purely via
 * this pill.
 */
const PRIORITY_TONE: Record<AlertPriority, StatusPillTone> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

/**
 * Tonal tints for inline data pills. These aren't part of the Blaze token
 * surface (no green/amber tokens) so they stay as named hex constants.
 */
const DATA_PILL_BG: Record<'default' | 'up' | 'down' | 'flag', string> = {
  default: 'var(--dark-4)',
  up: '#ECFDF5',
  down: '#FEF2F2',
  flag: '#FEF3C7',
};

const DATA_PILL_FG: Record<'default' | 'up' | 'down' | 'flag', string> = {
  default: 'var(--dark-80)',
  up: '#065F46',
  down: '#991B1B',
  flag: '#854D0E',
};

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card
      padding="md"
      style={{
        border: '1px solid var(--dark-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
        {label}
      </Text>
      <Heading level={2} style={{ color: 'var(--dark-90)' }}>
        {value}
      </Heading>
      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>{sub}</Text>
    </Card>
  );
}

function DataPill({ label, tone }: { label: string; tone?: 'up' | 'down' | 'flag' }) {
  const key = tone ?? 'default';
  return (
    <Pill
      size="sm"
      style={{
        background: DATA_PILL_BG[key],
        color: DATA_PILL_FG[key],
        padding: '4px 10px',
        borderRadius: 6,
        display: 'inline-flex',
        width: 'fit-content',
        flex: 'none',
      }}
    >
      {label}
    </Pill>
  );
}

function AlertCard({ alert, onDismiss }: { alert: AlertItem; onDismiss: () => void }) {
  const competitor = COMPETITORS[alert.competitor];
  const { showToast } = useToast();
  return (
    <Card
      padding="lg"
      style={{
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '20px 24px',
      }}
    >
      {/* meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            fallback={competitor.initials}
            size="sm"
            style={{ background: competitor.color, color: 'var(--light-100)' }}
          />
          <Text variant="smallList">{competitor.name}</Text>
        </div>
        <StatusPill tone={PRIORITY_TONE[alert.priority]} size="sm">
          <span style={{ marginRight: 4 }}>{alert.typeIcon}</span>
          {alert.typeLabel}
        </StatusPill>
        <Text variant="metadata" style={{ color: 'var(--dark-60)', marginLeft: 'auto' }}>{alert.time}</Text>
      </div>

      {/* headline */}
      <Heading level={5}>
        {alert.headline}
      </Heading>

      {/* body */}
      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
        {alert.body}
      </Text>

      {/* data strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
        {alert.data.map((d) => (
          <DataPill key={d.label} label={d.label} tone={d.tone} />
        ))}
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {alert.actions.map((a) =>
          a.label === 'Dismiss' ? (
            <div key={a.label} style={{ marginLeft: 'auto' }}>
              <Button variant="ghost" size="xs" onPress={onDismiss}>
                Dismiss
              </Button>
            </div>
          ) : (
            <Button
              key={a.label}
              size="sm"
              variant="secondary"
              onPress={() => showToast({ message: `${a.label} → ${alert.headline}`, variant: 'success' })}
            >
              {a.label}
            </Button>
          ),
        )}
      </div>
    </Card>
  );
}

export function AlertsPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    return ALERTS.filter((a) => !dismissed.has(a.id)).filter((a) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return a.unread;
      if (filter === 'high') return a.priority === 'high';
      return a.competitor === filter;
    });
  }, [filter, dismissed]);

  const counts = useMemo(
    () => ({
      all: ALERTS.length,
      unread: ALERTS.filter((a) => a.unread).length,
      high: ALERTS.filter((a) => a.priority === 'high').length,
    }),
    [],
  );

  return (
    <H2Layout topbarCenter={<CompetitorTabs />} topbarRight={<AddCompetitorButton />}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          padding: 28,
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        {/* section: summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <SummaryCard label="New this week" value="12" sub="↑ 4 vs last week" />
          <SummaryCard label="High priority" value="4" sub="Worth a response today" />
          <SummaryCard label="Unread" value={String(counts.unread)} sub="Updated 12 min ago" />
          <SummaryCard label="Quietest competitor" value="WOW 1 DAY" sub="No moves in 6 days" />
        </div>

        {/* section: filter row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {visible.length} {visible.length === 1 ? 'alert' : 'alerts'}
            </Text>
            <AlertsFilterDropdown filter={filter} counts={counts} onChange={setFilter} />
          </div>

          {/* section: alerts list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onDismiss={() => setDismissed((prev) => new Set(prev).add(a.id))}
              />
            ))}
            {visible.length === 0 && (
              <Text style={{ color: 'var(--dark-60)', padding: '24px 0' }}>
                No alerts match this filter.
              </Text>
            )}
          </div>
        </div>
      </div>
    </H2Layout>
  );
}

type AlertsFilterDropdownProps = {
  filter: FilterKey;
  counts: { all: number; unread: number; high: number };
  onChange: (k: FilterKey) => void;
};

function AlertsFilterDropdown({ filter, counts, onChange }: AlertsFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const options: Array<{ key: FilterKey; label: string }> = [
    { key: 'all', label: `All alerts (${counts.all})` },
    { key: 'unread', label: `Unread (${counts.unread})` },
    { key: 'high', label: `High priority (${counts.high})` },
    { key: 'proof', label: 'Five Star' },
    { key: 'bluenotary', label: 'Paper Moon' },
    { key: 'notarypro', label: 'WOW 1 DAY' },
    { key: 'industry', label: 'Industry' },
  ];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <Button
        size="sm"
        variant="secondary"
        frontIcon={Filter}
        onPress={() => setOpen((v) => !v)}
      >
        Filter
      </Button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 20,
            minWidth: 220,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--dark-4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--dark-90)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span>{opt.label}</span>
              {filter === opt.key && (
                <span style={{ color: 'var(--purple)', display: 'inline-flex' }}>
                  <Check2 size={16} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
