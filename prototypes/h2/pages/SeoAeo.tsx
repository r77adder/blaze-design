import { Button } from '@/components';
import { useToast } from '@/staging';

/**
 * /h2/seo-aeo — port of Blaze H2 Features/seo-aeo.html (citation analysis steady state).
 *
 * Source has tabs (Citations / Brand Facts / Trends / Content) plus a setup
 * flow ("Confirm your AEO setup", "Running first citation analysis…").
 * This commit ports the citations tab with a target-queries matrix.
 *
 * NOT yet wired (TODO follow-ups):
 *  - Brand Facts / Trends / Content tabs
 *  - Setup flow
 *  - Filter chips
 *  - Cell click-through to actual AI tool response
 */

const TOOLS = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'];
const TOOL_COLORS: Record<string, string> = {
  ChatGPT: '#10A37F', Claude: '#C96442', Perplexity: '#1FB6FF', Gemini: '#5390F4',
};

type CellStatus = 'cited' | 'competitor' | 'neither';

const QUERIES: { q: string; intent: string; icp: string; status: CellStatus[]; content: string; last: string }[] = [
  { q: 'best supplements for energy in 2026', intent: 'Comparison', icp: 'Wellness-curious 25-45', status: ['cited', 'competitor', 'neither', 'cited'], content: 'live+cited', last: '2h' },
  { q: 'is ashwagandha safe long term', intent: 'Safety', icp: 'Cautious shoppers', status: ['cited', 'cited', 'cited', 'neither'], content: 'live', last: '4h' },
  { q: 'what is the best brand of magnesium', intent: 'Brand', icp: 'Brand-aware', status: ['competitor', 'competitor', 'neither', 'competitor'], content: 'none', last: '1d' },
  { q: 'how much vitamin D should I take daily', intent: 'Educational', icp: 'New supplement users', status: ['cited', 'neither', 'cited', 'cited'], content: 'draft', last: '6h' },
  { q: 'adaptogens vs caffeine for focus', intent: 'Comparison', icp: 'Productivity-focused', status: ['neither', 'cited', 'competitor', 'neither'], content: 'none', last: '12h' },
];

const STATUS_STYLES: Record<CellStatus, { bg: string; color: string; symbol: string }> = {
  cited: { bg: 'rgba(32,161,79,0.15)', color: '#0E6B33', symbol: '✓' },
  competitor: { bg: '#FEE4E2', color: '#B42318', symbol: '✕' },
  neither: { bg: 'var(--dark-4)', color: 'var(--dark-40)', symbol: '–' },
};

const CONTENT_PILL: Record<string, { bg: string; color: string; label: string }> = {
  'live+cited': { bg: 'rgba(32,161,79,0.12)', color: '#0E6B33', label: 'Live + cited' },
  'live': { bg: 'var(--dark-4)', color: 'var(--dark-80)', label: 'Live' },
  'draft': { bg: '#FEF3C7', color: '#7B5B00', label: 'Draft' },
  'none': { bg: 'rgba(0,0,0,0.04)', color: 'var(--dark-60)', label: 'No content · Ideas →' },
};

export function SeoAeo() {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      {/* Sparkline section */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            AI citation rate
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
            58%
          </div>
          <div style={{ fontSize: 12, color: '#0E6B33' }}>↑ 14% vs 30 days ago</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--dark-60)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Citations over time · last 13 weeks
          </div>
          <svg viewBox="0 0 600 80" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
            <polyline
              points="0,60 50,55 100,52 150,48 200,40 250,42 300,35 350,30 400,28 450,22 500,20 550,18 600,12"
              fill="none"
              stroke="#20A14F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="600" cy="12" r="3.5" fill="#20A14F" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--dark-40)' }}>
            <span>Mar 1</span>
            <span>Apr 5</span>
            <span>May 6</span>
          </div>
        </div>
      </div>

      {/* Target queries section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Target queries</h3>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>
            Citation status across {TOOLS.length} AI tools · click any cell to see the actual response
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="tertiary" size="sm" onClick={() => showToast({ message: 'Add query (TODO)' })}>+ Add query</Button>
          <Button variant="tertiary" size="sm" onClick={() => showToast({ message: 'Regenerate (TODO)' })}>Regenerate</Button>
          <Button variant="secondary" size="sm" onClick={() => showToast({ message: 'Bulk edit (TODO)' })}>Bulk edit</Button>
        </div>
      </div>

      <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--dark-8)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 500, color: 'var(--dark-60)', minWidth: 280 }}>
                Query
              </th>
              {TOOLS.map((t) => (
                <th key={t} style={{ padding: '10px 14px', fontSize: 11.5, fontWeight: 500, color: 'var(--dark-60)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: TOOL_COLORS[t],
                        color: '#fff',
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t.slice(0, 1)}
                    </div>
                    <span style={{ fontSize: 11 }}>{t}</span>
                  </div>
                </th>
              ))}
              <th style={{ width: 130, textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 500, color: 'var(--dark-60)' }}>
                Your content
              </th>
              <th style={{ width: 70, textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 500, color: 'var(--dark-60)' }}>
                Last
              </th>
            </tr>
          </thead>
          <tbody>
            {QUERIES.map((q, i) => {
              const cp = CONTENT_PILL[q.content]!;
              return (
                <tr key={q.q} style={{ borderBottom: i < QUERIES.length - 1 ? '1px solid var(--dark-8)' : 'none' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 3 }}>{q.q}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--dark-60)' }}>
                      <span style={{ padding: '1px 7px', background: 'var(--dark-4)', borderRadius: 99, fontSize: 10.5 }}>{q.intent}</span>
                      <span>{q.icp}</span>
                    </div>
                  </td>
                  {q.status.map((s, ti) => {
                    const ss = STATUS_STYLES[s];
                    return (
                      <td key={ti} style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: ss.bg,
                            color: ss.color,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {ss.symbol}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      onClick={q.content === 'none' ? () => showToast({ message: 'Content recommendations (TODO)' }) : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '3px 8px',
                        borderRadius: 5,
                        fontSize: 11.5,
                        background: cp.bg,
                        color: cp.color,
                        cursor: q.content === 'none' ? 'pointer' : 'default',
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {cp.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11.5, color: 'var(--dark-40)' }}>{q.last}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
