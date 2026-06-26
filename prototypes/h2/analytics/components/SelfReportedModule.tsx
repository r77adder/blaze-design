import { SELF_REPORTED, channelSources, fmtInt } from '../mockData';
import { FONT, tracking } from '../format';
import { SectionCard } from './SectionCard';

const COLS = 'minmax(200px, 300px) 1fr 96px';

/**
 * Self-reported attribution ("How did you hear about us?"). Framed as the dark
 * funnel: discovery that deterministic tracking misses — most visibly AI
 * assistants, where the self-reported count far exceeds what UTMs measured
 * (people discover via an AI tool, then return via direct / branded search).
 */
export function SelfReportedModule() {
  const rows = [...SELF_REPORTED].sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map((r) => r.count), 1);
  const measuredAiLeads = channelSources('last_touch').find((c) => c.channel === 'ai_search')?.leads ?? 0;

  return (
    <SectionCard title="How did you hear about us?" subtitle="Self-reported at signup — catches what attribution can't see">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
        {rows.map((row) => {
          const isAi = row.mapsTo === 'ai_search';
          return (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: COLS,
                alignItems: 'center',
                gap: 14,
                padding: '6px 8px',
                borderRadius: 8,
                background: isAi ? 'rgba(124, 92, 252, 0.06)' : 'transparent',
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.35, letterSpacing: tracking(13), color: 'var(--dark-80)' }}>
                {row.label}
              </span>
              <span style={{ display: 'block', height: 10, borderRadius: 5, background: 'var(--dark-4)', overflow: 'hidden' }}>
                <span
                  style={{
                    display: 'block',
                    height: '100%',
                    width: `${(row.count / max) * 100}%`,
                    background: isAi ? 'var(--purple)' : 'var(--dark-40)',
                    opacity: isAi ? 0.7 : 1,
                    borderRadius: 5,
                  }}
                />
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-90)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtInt(row.count)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          background: 'rgba(124, 92, 252, 0.06)',
          border: '1px solid rgba(124, 92, 252, 0.18)',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: FONT,
          fontSize: 14,
          lineHeight: 1.5,
          letterSpacing: tracking(13),
          color: 'var(--dark-80)',
        }}
      >
        <strong style={{ fontWeight: 500 }}>The dark funnel:</strong> {fmtInt(SELF_REPORTED.find((r) => r.mapsTo === 'ai_search')?.count ?? 0)}{' '}
        people credit an AI assistant — but attribution only measured {fmtInt(measuredAiLeads)} AI-search leads. Most discover
        you in an AI tool, then return via direct or branded search, so the tracked number undersells AI's real influence.
      </div>
    </SectionCard>
  );
}
