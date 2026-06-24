import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Select } from '@/staging';
import Download from '@/icons/20/Download';

/**
 * Shared presentational primitives for the Paid Social / Paid Search
 * "Insights" tabs — a weekly-report document rendered from a marketing-ops
 * doc. Composed from `@/components` + `@/staging` + inline token styles,
 * matching the raw-div style of the surrounding page files.
 *
 * Visual rules: sentence-case labels (no ALL CAPS), neutral borders only (no
 * colored accent borders), and no colored status dots.
 *
 * "Download Report" triggers the browser print dialog (Save as PDF). The
 * scoped `@media print` block isolates the report node and hides the app
 * chrome + the controls themselves.
 */

// ─── PRINT STYLES ──────────────────────────────────────────────────────

function InsightsPrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        .insights-print-root, .insights-print-root * { visibility: visible !important; }
        .insights-print-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 12px !important;
        }
        .insights-no-print { display: none !important; }
        @page { margin: 14mm; }
      }
      /* Match the week-select trigger height to the adjacent md button (32px). */
      .insights-week-select > button[aria-haspopup='listbox'] {
        box-sizing: border-box;
        height: 32px;
        padding-top: 0;
        padding-bottom: 0;
      }
    `}</style>
  );
}

// ─── REPORT SHELL ──────────────────────────────────────────────────────

export interface ReportWeek {
  /** Stable value for the week select. */
  value: string;
  /** Week range shown in the picker and the "Week of …" heading. */
  label: string;
  /** Optional supporting line under the heading for that week. */
  subtitle?: string;
}

interface InsightsReportProps {
  eyebrow: string;
  /** First entry is the current week (selected by default). */
  weeks: ReportWeek[];
  children: ReactNode;
}

/** Document-style shell: centered reading column, a header row with a week
 *  picker + Download Report button, and the print stylesheet. */
export function InsightsReport({ eyebrow, weeks, children }: InsightsReportProps) {
  const [week, setWeek] = useState(weeks[0]?.value);
  const selected = weeks.find((w) => w.value === week) ?? weeks[0];

  return (
    <div
      className="insights-print-root"
      style={{ maxWidth: 880, margin: '0 auto', padding: '20px 28px 80px' }}
    >
      <InsightsPrintStyles />

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
            {eyebrow}
          </Text>
          <Heading level={2} style={{ margin: 0 }}>
            Week of {selected.label}
          </Heading>
          {selected.subtitle && (
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {selected.subtitle}
            </Text>
          )}
        </div>
        <div
          className="insights-no-print"
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Select
            className="insights-week-select"
            value={week}
            onChange={setWeek}
            options={weeks.map((w) => ({ value: w.value, label: w.label }))}
            size="md"
            aria-label="Select week"
          />
          <Button variant="secondary" size="md" frontIcon={Download} onPress={() => window.print()}>
            Download Report
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>{children}</div>
    </div>
  );
}

// ─── SECTION ───────────────────────────────────────────────────────────

export function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section>
      <Heading level={3} style={{ margin: '0 0 14px' }}>
        {title}
      </Heading>
      {intro !== undefined && (
        <div style={{ marginBottom: children ? 18 : 0 }}>
          {typeof intro === 'string' ? <Prose>{intro}</Prose> : intro}
        </div>
      )}
      {children}
    </section>
  );
}

/** Body paragraph. `lead` renders at primary (16px) size for summary copy. */
export function Prose({
  children,
  lead = false,
  style,
}: {
  children: ReactNode;
  lead?: boolean;
  style?: CSSProperties;
}) {
  if (lead) {
    return (
      <Text variant="primary" style={{ display: 'block', lineHeight: 1.6, ...style }}>
        {children}
      </Text>
    );
  }
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--dark-80)', ...style }}>{children}</p>
  );
}

// ─── CALLOUT ───────────────────────────────────────────────────────────

/** Headline callout — Account Health / Summary. Neutral tinted card with a
 *  headline + supporting body. No colored accent border, no status dot. */
export function Callout({ headline, children }: { headline: ReactNode; children?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 20px',
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
      }}
    >
      <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
        {headline}
      </Text>
      {children}
    </div>
  );
}

// ─── DATA TABLE ────────────────────────────────────────────────────────

export interface Column {
  label: string;
  align?: 'left' | 'right';
}

/** Generic table matching the page's card styling. First column left-aligns
 *  and reads as the row label; the rest right-align by default. */
export function DataTable({ columns, rows }: { columns: Column[]; rows: ReactNode[][] }) {
  const colAlign = (i: number) => columns[i]?.align ?? (i === 0 ? 'left' : 'right');
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflowX: 'auto',
        background: 'var(--light-100)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                style={{
                  textAlign: colAlign(i),
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--dark-60)',
                  borderBottom: '1px solid var(--dark-8)',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} style={r > 0 ? { borderTop: '1px solid var(--dark-8)' } : undefined}>
              {cells.map((cell, c) => (
                <td
                  key={c}
                  style={{
                    textAlign: colAlign(c),
                    padding: '12px 16px',
                    fontSize: 14,
                    color: c === 0 ? 'var(--dark-90)' : 'var(--dark-80)',
                    fontWeight: c === 0 ? 500 : 400,
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── METRIC HELPERS (for table cells) ──────────────────────────────────

/** Emphasized value — mirrors the doc's "good metric" markers using weight
 *  rather than a colored dot. */
export function GoodValue({ children }: { children: ReactNode }) {
  return <span style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{children}</span>;
}

/** Signed change indicator with a directional triangle. Tone colors the
 *  delta independent of sign (a −61% cost change can still be "good"). */
export function Delta({ value, tone = 'neutral' }: { value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const color =
    tone === 'good' ? 'var(--status-approved)' : tone === 'bad' ? 'var(--red-70)' : 'var(--dark-60)';
  const v = value.trim();
  const up = v.startsWith('+');
  const down = v.startsWith('−') || v.startsWith('-');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontWeight: 500 }}>
      {(up || down) && (
        <span aria-hidden style={{ fontSize: 9, lineHeight: 1 }}>
          {up ? '▲' : '▼'}
        </span>
      )}
      {value}
    </span>
  );
}

// ─── LISTS ─────────────────────────────────────────────────────────────

/** A labeled group inside the Action Plan (This week / Watch / Test). */
export function ActionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Heading level={5} style={{ margin: 0 }}>
        {label}
      </Heading>
      {children}
    </div>
  );
}

/** Plain bulleted list for verdicts / change-log items. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((it, i) => (
        <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--dark-80)' }}>
          {it}
        </li>
      ))}
    </ul>
  );
}

/** Ordered list with grey numeric counters, at primary (16px) size — used for
 *  next-step actions. */
export function NumberedList({ items }: { items: ReactNode[] }) {
  return (
    <ol
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            fontSize: 16,
            lineHeight: 1.6,
            letterSpacing: '0.32px',
            color: 'var(--dark-90)',
          }}
        >
          <span
            aria-hidden
            style={{ color: 'var(--dark-60)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
          >
            {i + 1}.
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

/** A bordered surface grouping related content (e.g. the action plan). */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        background: 'var(--light-100)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
