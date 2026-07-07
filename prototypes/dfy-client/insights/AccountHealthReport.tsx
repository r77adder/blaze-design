import { InsightsReport } from '../../h2/insights/shared';
import { Stat, StatRow } from './charts';
import { AccountHealth, NextSteps } from './narrative';
import { WEEKS, type Narrative } from './common';
import { Heading } from '@/components';

/**
 * Business Health — the central overview tab. Leads with the four cross-channel
 * KPIs (reach · leads · clients · conversion) and the account narrative, then a
 * 2×2 grid expanding each KPI into its top traffic sources — styled after the
 * Website analytics "Traffic by channel" (neutral volume bars) and drilling into
 * the Website tab, whose own stat row is exactly these four. The engagement goal
 * rides along as the week's subheadline.
 */

interface BusinessHealthProps {
  editing: boolean;
  goal: string;
  onGoal: (v: string) => void;
  narrative: Narrative;
  onNarrative: (patch: Partial<Narrative>) => void;
  /** Jump to another Insights sub-tab (the breakdown cards drill into Website). */
  onNavigate: (key: string) => void;
}

// Cross-channel KPIs attributed by traffic source. `reach` is impressions,
// `conv` is a per-source visitor→lead rate (%). These four columns mirror the
// Website tab's own stat row, which is why every card drills into Website.
type Metric = 'reach' | 'leads' | 'clients' | 'conv';
interface SourceRow { source: string; reach: number; leads: number; clients: number; conv: number; }

const TRAFFIC_SOURCES: SourceRow[] = [
  { source: 'Organic search', reach: 22000, leads: 24, clients: 14, conv: 0.7 },
  { source: 'Paid social',    reach: 18400, leads: 30, clients: 13, conv: 1.1 },
  { source: 'Paid search',    reach: 12000, leads: 38, clients: 20, conv: 5.0 },
  { source: 'Organic social', reach: 9600,  leads: 12, clients: 5,  conv: 2.0 },
  { source: 'Direct',         reach: 7400,  leads: 16, clients: 9,  conv: 3.0 },
  { source: 'Email',          reach: 4600,  leads: 22, clients: 8,  conv: 6.4 },
  { source: 'Referral',       reach: 3000,  leads: 8,  clients: 10, conv: 2.0 },
  { source: 'AI search',      reach: 1600,  leads: 6,  clients: 2,  conv: 9.2 },
];

const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const fmtInt = (n: number) => n.toLocaleString();
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

interface CardSpec { metric: Metric; label: string; format: (n: number) => string; }

const METRIC_CARDS: CardSpec[] = [
  { metric: 'reach',   label: 'Total reach',     format: fmtK },
  { metric: 'leads',   label: 'Leads',           format: fmtInt },
  { metric: 'clients', label: 'Clients',         format: fmtInt },
  { metric: 'conv',    label: 'Conversion rate', format: fmtPct },
];

// Each traffic source drills into the Insights sub-tab that owns it, so a row
// in any breakdown jumps straight to the relevant channel report. Direct /
// Email / Referral have no dedicated channel tab, so they land on Website.
const SOURCE_TAB: Record<string, string> = {
  'Organic search': 'seo',
  'Paid social': 'paid-social',
  'Paid search': 'paid-search',
  'Organic social': 'organic',
  'Direct': 'website',
  'Email': 'website',
  'Referral': 'website',
  'AI search': 'seo',
};

/**
 * Ranked source row — borrowed from the Website analytics "Traffic by channel"
 * treatment: a neutral volume bar behind the row (width ∝ value), source name on
 * the left, value right-aligned. The whole row is a button that drills into the
 * channel's own Insights sub-tab.
 */
function SourceBarRow({ label, display, fraction, onOpen }: { label: string; display: string; fraction: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        position: 'relative', display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 8px', marginBottom: 2, border: 'none', borderRadius: 8,
        background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background-color 120ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dark-4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(1, fraction)) * 100}%`, background: 'var(--dark-3)', borderRadius: 8, zIndex: 0 }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: 14, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{display}</span>
      </span>
    </button>
  );
}

/** One KPI — H3 title above (outside the card), its top traffic sources within.
 *  Each source row drills into that channel's own Insights sub-tab. */
function StatBreakdownCard({ spec, onNavigate }: { spec: CardSpec; onNavigate: (key: string) => void }) {
  const rows = [...TRAFFIC_SOURCES].sort((a, b) => b[spec.metric] - a[spec.metric]).slice(0, 5);
  const max = Math.max(...rows.map((r) => r[spec.metric]), 1);
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading level={3} style={{ margin: 0 }}>{spec.label}</Heading>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <SourceBarRow
            key={r.source}
            label={r.source}
            display={spec.format(r[spec.metric])}
            fraction={r[spec.metric] / max}
            onOpen={() => onNavigate(SOURCE_TAB[r.source] ?? 'website')}
          />
        ))}
      </div>
    </section>
  );
}

/** Business Health — KPIs + narrative + per-source breakdowns. */
export function AccountHealthReport({ editing, goal, narrative, onNarrative, onNavigate }: BusinessHealthProps) {
  return (
    <InsightsReport weeks={WEEKS.map((w) => ({ ...w, subtitle: goal }))} subtitleVariant="primary">
      {/* Top: the four cross-channel KPIs at a glance */}
      <StatRow>
        <Stat label="Total reach" value="78.6k" delta="+16%" spark={[58, 62, 66, 69, 72, 75, 78.6]} sparkColor="var(--blue-70)" />
        <Stat label="Leads" value="156" delta="+14%" spark={[110, 118, 126, 134, 142, 149, 156]} sparkColor="var(--purple)" />
        <Stat label="Clients" value="81" delta="+21%" spark={[52, 58, 63, 68, 72, 77, 81]} sparkColor="var(--green)" />
        <Stat label="Reputation" value="4.7★" delta="+0.1" spark={[4.5, 4.5, 4.6, 4.6, 4.7, 4.7, 4.7]} sparkColor="var(--brand)" />
      </StatRow>

      {/* Business Health narrative — sits above the breakdown */}
      <AccountHealth
        editing={editing}
        headline={narrative.headline}
        body={narrative.body}
        onHeadline={(headline) => onNarrative({ headline })}
        onBody={(body) => onNarrative({ body })}
      />

      {/* 2×2 — each KPI broken down by traffic source, drilling into Website */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '32px 40px' }}>
        {METRIC_CARDS.map((spec) => (
          <StatBreakdownCard key={spec.metric} spec={spec} onNavigate={onNavigate} />
        ))}
      </div>

      <NextSteps editing={editing} items={narrative.next} onItems={(next) => onNarrative({ next })} />
    </InsightsReport>
  );
}
