import { useState, useRef, useCallback } from 'react';
import { SegmentSelector, ContentAreaButton, GlassIconButton } from '@ios/components';
import { MetricsGrid } from './HomeScreen';
import chevronLeftIcon from '@ios/icons/chevron-left.svg';
import chevronDownIcon from '@ios/icons/chevron-down.svg';
import plusIcon from '@ios/icons/plus-01.svg';
import checkIcon from '@ios/icons/check.svg';
import calendarIcon from '@ios/icons/calendar-01.svg';

const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
  dark40: 'var(--ios-dark-40)',
  dark25: 'var(--ios-dark-25)',
  dark8:  'var(--ios-dark-8)',
  dark4:  'var(--ios-dark-4)',
  dark3:  'rgba(0,0,0,0.03)',
  dark2:  'var(--ios-dark-2)',
  green:  'var(--ios-green)',
  green5: 'rgba(32,161,79,0.05)',
  green10:'rgba(32,161,79,0.1)',
  brand:  'var(--ios-brand)',
  blue:   '#5b9bd5',
  orange: '#d38e0f',
  warnBg: 'rgba(255,174,0,0.3)',
  warnTx: '#3f2b00',
};

export type LearningsState = 'collecting' | 'active';
const GREEN_FILTER = 'invert(45%) sepia(64%) saturate(560%) hue-rotate(93deg) brightness(95%) contrast(90%)';

// ── Nav bar ──────────────────────────────────────────────────────────────────────
function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', position: 'relative', flexShrink: 0 }}>
      <GlassIconButton icon={chevronLeftIcon} label="Back" onClick={onBack} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
        Learning Loop
      </span>
      <div style={{ width: 44, height: 44 }} />
    </div>
  );
}

// ── Section heading (22px H2) ──────────────────────────────────────────────────────
function H2({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>{title}</span>
      {trailing && <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>{trailing}</span>}
    </div>
  );
}

// ── Collecting floating card ──────────────────────────────────────────────────────
function CollectingCard({ withBody }: { withBody?: boolean }) {
  return (
    <div style={{
      width: 311, boxSizing: 'border-box', background: T.light, border: `1px solid ${T.dark8}`,
      borderRadius: 20, padding: '12px 16px', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.1))',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 6, height: 6, borderRadius: 99, background: T.brand, flexShrink: 0 }} />
        <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark90, letterSpacing: '0.14px' }}>Collecting your data...</span>
        <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px' }}>~ 4 days remaining</span>
      </div>
      {withBody && (
        <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>
          Your performance chart will appear once we have 7 days of activity.
        </span>
      )}
    </div>
  );
}

// ── Performance ────────────────────────────────────────────────────────────────────
function Performance({ state }: { state: LearningsState }) {
  const [seg, setSeg] = useState('All');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <H2 title="Performance" trailing={state === 'active' ? 'Trailing 10 weeks' : undefined} />
      <SegmentSelector options={['All', 'Organic', 'Paid Ads', 'SEO']} selected={seg} onSelect={setSeg} fullWidth />
      {state === 'collecting' ? (
        <div style={{ position: 'relative' }}>
          <div style={{ filter: 'blur(1.5px)', opacity: 0.4, pointerEvents: 'none' }}>
            <MetricsGrid />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <CollectingCard withBody />
          </div>
        </div>
      ) : (
        <>
          <MetricsGrid />
          <EngagementChart />
        </>
      )}
    </div>
  );
}

// ── Interactive engagement chart (active) ──────────────────────────────────────────
const CHART = [
  { date: 'Sep 1',  you: 3.8, avg: 3.2 },
  { date: 'Sep 15', you: 3.5, avg: 3.1 },
  { date: 'Sep 28', you: 3.9, avg: 3.2 },
  { date: 'Oct 5',  you: 4.2, avg: 3.3 },
  { date: 'Oct 12', you: 5.1, avg: 3.3 },
  { date: 'Oct 19', you: 4.8, avg: 3.2 },
  { date: 'Oct 26', you: 4.3, avg: 3.3 },
  { date: 'Nov 1',  you: 4.0, avg: 3.3 },
  { date: 'Nov 5',  you: 4.2, avg: 3.3 },
];
const CW = 290, CH = 250, Y_MIN = 2.6, Y_MAX = 6.2;
const cx = (i: number) => (i / (CHART.length - 1)) * CW;
const cy = (v: number) => CH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * CH;
const youPath = CHART.map((d, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)} ${cy(d.you).toFixed(1)}`).join(' ');
const avgPath = CHART.map((d, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)} ${cy(d.avg).toFixed(1)}`).join(' ');
const areaPath = `${youPath} L${CW} ${CH} L0 ${CH} Z`;
const Y_LABELS = [6, 5, 4, 3];

function LegendLine({ dashed }: { dashed?: boolean }) {
  return (
    <svg width="16" height="4" viewBox="0 0 16 4">
      <line x1="0" y1="2" x2="16" y2="2" stroke={dashed ? T.dark40 : T.blue} strokeWidth="2" strokeDasharray={dashed ? '3 2' : undefined} strokeLinecap="round" />
    </svg>
  );
}

function EngagementChart() {
  const [idx, setIdx] = useState(CHART.length - 1);
  const ref = useRef<HTMLDivElement>(null);
  const updateFromX = useCallback((clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setIdx(Math.round(pct * (CHART.length - 1)));
  }, []);
  const active = CHART[idx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {/* header + legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4 }}>Engagement rate</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegendLine />
            <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>You</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegendLine dashed />
            <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>Industry average</span>
          </div>
        </div>
      </div>

      {/* chart card */}
      <div style={{ background: T.dark3, borderRadius: 24, padding: '20px 16px 20px 20px', position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          {/* y labels */}
          <div style={{ width: 18, position: 'relative', height: CH * (1 / 1), marginRight: 4 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {Y_LABELS.map(l => (
                <span key={l} style={{ fontFamily: T.font, fontSize: 12, color: T.dark40, letterSpacing: '0.12px', lineHeight: 1, transform: 'translateY(-50%)' }}>{l}%</span>
              ))}
            </div>
          </div>
          {/* plot */}
          <div
            ref={ref}
            style={{ flex: 1, position: 'relative', cursor: 'crosshair', userSelect: 'none', touchAction: 'none' }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); updateFromX(e.clientX); }}
            onPointerMove={(e) => { if (e.buttons > 0) updateFromX(e.clientX); }}
          >
            <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ display: 'block', height: 200, overflow: 'visible' }}>
              <defs>
                <linearGradient id="llArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.blue} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={T.blue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* grid lines */}
              {Y_LABELS.map(v => (
                <line key={v} x1={0} y1={cy(v)} x2={CW} y2={cy(v)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
              ))}
              {/* industry baseline dashed (full width) */}
              <line x1={0} y1={cy(3)} x2={CW} y2={cy(3)} stroke={T.dark25} strokeWidth="1" strokeDasharray="4 3" />
              <path d={areaPath} fill="url(#llArea)" />
              <path d={avgPath} fill="none" stroke={T.dark40} strokeWidth="1.5" strokeDasharray="4 3" />
              <path d={youPath} fill="none" stroke={T.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* vertical indicator */}
              <line x1={cx(idx)} y1={0} x2={cx(idx)} y2={CH} stroke={T.dark25} strokeWidth="1" />
              {/* dot */}
              <circle cx={cx(idx)} cy={cy(active.you)} r={6} fill={T.blue} stroke={T.light} strokeWidth="2.5" />
            </svg>
            {/* x labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['Sep', 'Oct', 'Nov'].map(m => (
                <span key={m} style={{ fontFamily: T.font, fontSize: 12, color: T.dark40, letterSpacing: '0.12px' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
        {/* tooltip top-right */}
        <div style={{
          position: 'absolute', top: 11, right: 8, background: T.light, border: `1px solid ${T.dark4}`,
          borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px' }}>{active.date}</span>
          <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 500, color: T.dark90 }}>{active.you}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Strategies ──────────────────────────────────────────────────────────────────────
const STRATEGIES = [
  { emoji: '💭', name: 'Thought Leadership', meta: '6 campaigns' },
  { emoji: '👨‍💼', name: 'Lead Generation', meta: '6 campaigns' },
];

function Strategies() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Strategies</span>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
        {STRATEGIES.map(s => (
          <div key={s.name} style={{ flexShrink: 0, width: 130, minHeight: 110, background: T.light, border: `1px solid ${T.dark8}`, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: T.font, fontSize: 16, color: T.dark90, lineHeight: 1.5 }}>{s.emoji}<br />{s.name}</span>
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4, marginTop: 12 }}>{s.meta}</span>
          </div>
        ))}
        {/* Add strategy suggestion */}
        <div style={{ flexShrink: 0, width: 300, background: 'rgba(0,131,226,0.05)', border: `1px solid ${T.dark4}`, borderRadius: 20, padding: '16px 16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: T.font, fontSize: 16, color: T.dark90, lineHeight: 1.5 }}>Brand awareness</span>
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>Top-quartile SaaS brands run alongside Thought Leadership to grow reach.</span>
          </div>
          <ContentAreaButton type="secondary" size="m" label="Add" leftIcon={plusIcon} />
        </div>
      </div>
    </div>
  );
}

// ── Your actions ────────────────────────────────────────────────────────────────────
type Action = { tag: string; tagKind: 'organic' | 'paid'; text: string; why: string; btn: string };
const ACTIONS: Action[] = [
  { tag: 'Organic', tagKind: 'organic', text: 'Increase posting frequency on Instagram to compound momentum.', why: 'Your top-performing posts are Organic. Posting 5× per week instead of 3× has shown 2× reach in similar SaaS accounts.', btn: 'Increase Frequency' },
  { tag: 'Organic', tagKind: 'organic', text: 'Add 1 Story per day to engage new followers.', why: 'Story engagement from new followers averages 40% higher than feed posts in your industry.', btn: 'Increase Frequency' },
  { tag: 'Organic to Paid', tagKind: 'paid', text: 'Move TikTok posts with a 3% save rate to Q2 Campaign.', why: "Promote your top-performing TikTok videos from March into the 'Spring Fling' paid campaign.", btn: 'Boost as Ad' },
];

function ActionTag({ kind, label }: { kind: 'organic' | 'paid'; label: string }) {
  if (kind === 'paid') {
    return (
      <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69, backgroundImage: 'linear-gradient(rgba(255,174,0,0.3),rgba(255,174,0,0.3)), linear-gradient(#fff,#fff)', border: '1px solid rgba(255,174,0,0.3)' }}>
        <span style={{ fontFamily: T.font, fontSize: 12, color: T.warnTx, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>{label}</span>
      </div>
    );
  }
  return (
    <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69, background: T.green5, border: '1px solid rgba(32,161,79,0.1)' }}>
      <span style={{ fontFamily: T.font, fontSize: 12, color: T.green, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>{label}</span>
    </div>
  );
}

function YourActions({ state }: { state: LearningsState }) {
  const [open, setOpen] = useState<number | null>(null);

  if (state === 'collecting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Your actions</span>
        <div style={{ background: T.green5, border: `1px solid ${T.dark4}`, borderRadius: 24, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: T.green10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={checkIcon} alt="" style={{ width: 24, height: 24, filter: GREEN_FILTER }} />
          </div>
          <span style={{ fontFamily: T.font, fontSize: 18, color: T.dark90, lineHeight: 1.4 }}>You're all caught up</span>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>New recommendations will appear here as your performance data updates in 4 days.</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Your actions</span>
        <div style={{ width: 20, height: 20, borderRadius: 12, background: T.dark90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.light, lineHeight: 1.48, paddingBottom: 1 }}>{ACTIONS.length}</span>
        </div>
      </div>
      <div style={{ background: T.dark3, borderRadius: 24, overflow: 'hidden' }}>
        {ACTIONS.map((a, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 16px 16px 20px', borderBottom: i < ACTIONS.length - 1 ? `1px solid ${T.dark4}` : 'none' }}>
              <ActionTag kind={a.tagKind} label={a.tag} />
              <span style={{ fontFamily: T.font, fontSize: 16, color: T.dark90, lineHeight: 1.5 }}>{a.text}</span>
              {isOpen && (
                <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>{a.why}</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 3px', display: 'flex', alignItems: 'center', gap: 4, marginLeft: -10 }}>
                  <span style={{ fontFamily: T.font, fontSize: 16, color: T.dark60, letterSpacing: '0.16px' }}>{isOpen ? 'See less' : 'See why'}</span>
                  <img src={chevronDownIcon} alt="" style={{ width: 12, height: 12, opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                <ContentAreaButton type="secondary" size="m" label={a.btn} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Applied this week ────────────────────────────────────────────────────────────────
function BulletLine() {
  return (
    <div style={{ width: 6, alignSelf: 'stretch', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 2, borderRadius: 99, background: T.dark25 }} />
    </div>
  );
}

function NeutralPill({ label }: { label: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69, backgroundImage: 'linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.08)), linear-gradient(#fff,#fff)', border: `1px solid ${T.dark4}` }}>
      <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>{label}</span>
    </div>
  );
}

function AppliedPill() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69, background: T.green5, border: '1px solid rgba(32,161,79,0.1)' }}>
      <img src={checkIcon} alt="" style={{ width: 12, height: 12, filter: GREEN_FILTER }} />
      <span style={{ fontFamily: T.font, fontSize: 12, color: T.green, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>Applied</span>
    </div>
  );
}

const APPLIED_GROUPS = [
  { tag: 'Organic', items: [
    { title: 'Publish dates redistributed evenly across the week.', sub: 'Product Education posts were clustering on Mondays' },
    { title: 'Pain-point hook style applied to upcoming content briefs.', sub: 'Thought Leadership hook pattern identified across 12 posts.' },
  ] },
  { tag: 'Paid', items: [
    { title: 'Publish times moved to afternoon for maximum exposure.', sub: 'Lifestyle posts were underperforming on weekends.' },
    { title: 'AIDA format applied to next batch of paid ads.', sub: 'Thought Leadership hook pattern identified across 12 posts.' },
  ] },
];

function AppliedThisWeek({ state }: { state: LearningsState }) {
  if (state === 'collecting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Applied this week</span>
        <div style={{ background: T.dark3, border: `1px solid ${T.dark4}`, borderRadius: 24, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: T.dark4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={calendarIcon} alt="" style={{ width: 24, height: 24, opacity: 0.4 }} />
          </div>
          <span style={{ fontFamily: T.font, fontSize: 18, color: T.dark90, lineHeight: 1.4 }}>Nothing applied yet this week</span>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>Actions you accept from above will be tracked here automatically. Resets every week</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Applied this week</span>
      {APPLIED_GROUPS.map(g => (
        <div key={g.tag} style={{ background: T.dark3, borderRadius: 24, padding: '16px 16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <NeutralPill label={g.tag} />
            <AppliedPill />
          </div>
          {g.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <BulletLine />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark90, letterSpacing: '0.14px', lineHeight: 1.4 }}>{item.title}</span>
                <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Benchmarks ────────────────────────────────────────────────────────────────────
function BenchBar({ aboveMedian, youPct, medianPct }: { aboveMedian: boolean; youPct: number; medianPct: number }) {
  const color = aboveMedian ? T.green : T.orange;
  return (
    <div style={{ position: 'relative', height: 10, margin: '6px 0' }}>
      <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 2, borderRadius: 99, background: 'rgba(0,0,0,0.08)' }} />
      {/* median dashed marker */}
      <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${medianPct}%`, width: 0, borderLeft: `1.5px dashed ${T.dark40}` }} />
      {/* your dot */}
      <div style={{ position: 'absolute', top: 0, left: `calc(${youPct}% - 5px)`, width: 10, height: 10, borderRadius: 99, background: color }} />
    </div>
  );
}

const BENCH_METRICS = [
  { name: 'Engagement Rate', aboveMedian: true,  youPct: 66, medianPct: 52, you: 'You: 4.2%', med: '6%',  rank: 'Top 34%', rankColor: T.green },
  { name: 'Impressions',     aboveMedian: false, youPct: 44, medianPct: 60, you: 'You: 12K',  med: '18K', rank: 'Top 61%', rankColor: T.orange },
];

function Benchmarks({ state }: { state: LearningsState }) {
  const [seg, setSeg] = useState('Organic');

  const barCard = (
    <div style={{ background: T.dark3, borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', boxSizing: 'border-box' }}>
      {BENCH_METRICS.map(m => (
        <div key={m.name} style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px', lineHeight: 1.4 }}>{m.name}</span>
          <BenchBar aboveMedian={m.aboveMedian} youPct={m.youPct} medianPct={m.medianPct} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: T.font, fontSize: 12, color: '#5e5e5e', letterSpacing: '0.12px' }}>{m.you}</span>
            <span style={{ fontFamily: T.font, fontSize: 12, color: '#5e5e5e', letterSpacing: '0.12px' }}>{m.med}</span>
            <span style={{ fontFamily: T.font, fontSize: 12, color: m.rankColor, letterSpacing: '0.12px' }}>{m.rank}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>Benchmarks</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['SaaS', 'Marketing Tech', '200+ accounts'].map((s, i) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: 99, background: T.dark40 }} />}
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>{s}</span>
            </span>
          ))}
        </div>
      </div>

      {state === 'active' ? (
        <>
          <SegmentSelector options={['Organic', 'Paid Ads', 'SEO']} selected={seg} onSelect={setSeg} fullWidth />
          {/* legend */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: T.green }} />
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>Above median</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: T.orange }} />
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>Below median</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="4"><line x1="0" y1="2" x2="12" y2="2" stroke={T.dark40} strokeWidth="1.5" strokeDasharray="3 2" /></svg>
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px' }}>Median</span>
            </div>
          </div>
          {barCard}
        </>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ filter: 'blur(1.5px)' }}>{barCard}</div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <CollectingCard />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────────────
export function LearningsScreen({ state, onBack }: { state: LearningsState; onBack: () => void }) {
  return (
    <div style={{ background: T.light, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <NavBar onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, padding: '4px 20px 40px' }}>
        <Performance state={state} />
        <Strategies />
        <YourActions state={state} />
        <AppliedThisWeek state={state} />
        <Benchmarks state={state} />
      </div>
    </div>
  );
}
