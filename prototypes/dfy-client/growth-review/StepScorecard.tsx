import { useEffect, useRef, useState } from 'react';
import { Heading, Text, IconButton } from '@/components';
import { Pill } from '@/staging';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import HelpCircleContained from '@/icons/24/HelpCircleContained';
import { COMPARISON_ROWS, METHODOLOGY, SCORECARD_SECTIONS, SCORECARD_SUMMARY, type ScorecardSection } from './data';
import { EffortPill, ReadOnlyBullets, scoreColor, Tooltip } from './ui';
import { StepIntro } from './wizard';

const F = "'Sohne', sans-serif";
const OVERALL_SCORE = COMPARISON_ROWS.find((r) => r.isUs)?.overall ?? 64;

/** Live score color: interpolates red → yellow → green across 0..100 so the
 *  donut's color tracks the number as it counts up (red is a low score, yellow
 *  a middling one, green a strong one). Stops mirror the --red-70 /
 *  --status-review / --status-approved tokens; raw rgb is needed to tween. */
function rampColor(v: number): string {
  const stops: { at: number; c: [number, number, number] }[] = [
    { at: 0, c: [188, 1, 11] },     // --red-70
    { at: 65, c: [237, 182, 44] },  // --status-review
    { at: 100, c: [4, 175, 0] },    // --status-approved
  ];
  const x = Math.max(0, Math.min(100, v));
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (x >= stops[i].at && x <= stops[i + 1].at) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const t = (x - a.at) / (b.at - a.at || 1);
  const mix = a.c.map((ci, i) => Math.round(ci + (b.c[i] - ci) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

/** Animated donut: a thin ring springs in and the number counts up to the
 *  score, its color sweeping red → yellow → green with the count. onColor
 *  reports the live color each frame so a parent can tint along. Small sizes
 *  drop the "/100". */
export function ScoreDonut({ score, size = 148, onColor }: { score: number; size?: number; onColor?: (c: string) => void }) {
  const [num, setNum] = useState(0);
  const [arcPct, setArcPct] = useState(0);
  // Keep the latest onColor without making it an effect dep, else setTint on the
  // parent would recreate the callback each frame and restart the animation.
  const onColorRef = useRef(onColor);
  onColorRef.current = onColor;
  useEffect(() => {
    let raf = 0;
    let startTs = 0;
    const dur = 1200;
    const back = (p: number) => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
    const cubic = (p: number) => 1 - Math.pow(1 - p, 3);
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const n = cubic(p) * score;
      setNum(n);
      setArcPct(Math.min(100, back(p) * score));
      onColorRef.current?.(rampColor(n));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setNum(score); setArcPct(score); onColorRef.current?.(rampColor(score)); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const small = size < 80;
  const sw = small ? 4 : 5.5;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const color = rampColor(num);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill={color} fillOpacity={0.08} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - arcPct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: small ? Math.round(size * 0.34) : 44, fontWeight: 400, color, fontFamily: F, lineHeight: 1, letterSpacing: '-0.5px' }}>{Math.round(num)}</span>
        {!small && <span style={{ fontSize: 13, color: 'var(--dark-40)', fontFamily: F, marginTop: 4 }}>/ 100</span>}
      </div>
    </div>
  );
}

/** The top summary: the big animated donut + blurb, in a container whose
 *  background tints along with the donut's live color as it counts up. */
function SummaryCard() {
  const [tint, setTint] = useState('var(--light-100)');
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 28, marginBottom: 32, background: tint, display: 'flex', alignItems: 'center', gap: 32 }}>
      <ScoreDonut score={OVERALL_SCORE} onColor={(c) => setTint(`color-mix(in srgb, ${c} 10%, var(--light-100))`)} />
      <Text style={{ flex: 1, minWidth: 0, display: 'block', fontSize: 17, color: 'var(--dark-80)', lineHeight: 1.7 }}>{SCORECARD_SUMMARY}</Text>
    </div>
  );
}

/** Step 1: the competitive scorecard, same design as /dfy-client/scorecard,
 *  filled with the live Grain Design Flooring data from app.blaze.ai. */
export function StepScorecard() {
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro title="Welcome, let's start with where you stand" />
      <ScorecardBody />
    </div>
  );
}

/** The scorecard content (animated donut summary, local comparison, and the
 *  per-section cards). Shared by the review step and the portal Scorecard page
 *  so both read identically. */
export function ScorecardBody() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <SummaryCard />

      <ComparisonTable />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, margin: '40px 0 0' }}>
        {SCORECARD_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const dims = ['Paid Ads', 'Organic', 'Website', 'Reputation'] as const;
  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 4px' }}>How you compare locally</Heading>
      <Text style={{ display: 'block', marginBottom: 14, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
        Scores are estimated from publicly visible signals: ad library activity, social presence, website audit, and review data. Open any section below to see exactly how each score is calculated.
      </Text>

      <div style={{ borderRadius: 12, border: '1px solid var(--dark-8)', overflow: 'hidden', background: 'var(--light-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dark-8)' }}>
                <th style={{ padding: '10px 22px', textAlign: 'left', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Business</th>
                {dims.map((d) => (
                  <th key={d} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>{d}</th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} style={{ background: row.isUs ? 'var(--dark-2)' : 'transparent', borderBottom: '1px solid var(--dark-4)' }}>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontWeight: row.isUs ? 600 : 400, color: row.isUs ? 'var(--dark-90)' : 'var(--dark-80)', fontSize: 15 }}>{row.name}</Text>
                      {row.isUs && <Pill size="sm">You</Pill>}
                    </div>
                  </td>
                  {dims.map((d) => {
                    const s = row.scores[d];
                    return <td key={d} style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(s) }}>{s}</span></td>;
                  })}
                  <td style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(row.overall) }}>{row.overall}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** One suggested next step, with an up/down vote so the client can signal
 *  which recommendations they're keen on. Vote state is prototype-local. */
function NextStep({ step, index }: { step: ScorecardSection['nextSteps'][number]; index: number }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 400, flexShrink: 0 }}>{index + 1}</span>
      <Text style={{ flex: 1, fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{step.label}</Text>
      <EffortPill effort={step.effort} />
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <IconButton size="sm" variant="ghost" icon={ThumbUp} title="I like this" active={vote === 'up'} onPress={() => setVote((v) => (v === 'up' ? null : 'up'))} />
        <IconButton size="sm" variant="ghost" icon={ThumbDown} title="Not for us" active={vote === 'down'} onPress={() => setVote((v) => (v === 'down' ? null : 'down'))} />
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: ScorecardSection }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <ScoreDonut score={section.score} size={44} />
        <Heading level={3} style={{ margin: 0 }}>{section.title}</Heading>
        <Tooltip label={METHODOLOGY[section.id]}>
          <span style={{ display: 'inline-flex', cursor: 'help' }} aria-label="How this score is calculated">
            <HelpCircleContained size={18} color="var(--dark-60)" />
          </span>
        </Tooltip>
      </div>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 32, background: 'var(--light-100)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 26 }}>
          <ReadOnlyBullets label="Strengths" color="var(--status-approved)" icon="✓" items={section.strengths} />
          <ReadOnlyBullets label="Weaknesses" color="var(--red-70)" icon="!" items={section.weaknesses} />
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 18 }}>
          <Heading level={5} style={{ margin: '0 0 16px' }}>Suggested next steps</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {section.nextSteps.map((step, i) => (
              <NextStep key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
