import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { StatusPill } from '@/staging';
import ArrowRight from '@/icons/20/ArrowRight';
import Check2 from '@/icons/20/Check2';
import AlertTriangle from '@/icons/20/AlertTriangle';
import XSquareContained from '@/icons/24/XSquareContained';
import { OVERALL_SCORE, BLAZE_START_LABEL } from '../business-scorecard-data';
import { TOOL_LABEL, useTools, type ToolId } from '../tools-context';
import { AREAS } from '../../scorecard/AreaCard';
import { GaugeRing, useAnimatedScore } from '../../scorecard/GaugeRing';
import {
  statusColor,
  statusDisk,
  statusLabel,
  statusTrack,
  type Status,
} from '../../scorecard/tokens';

// ── Delta pill (kept — used in each area header) ───────────────────────────

function DeltaPill({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <StatusPill tone={positive ? 'success' : 'danger'} size="sm">
      {positive ? '↑' : '↓'} {positive ? '+' : ''}{value} {BLAZE_START_LABEL}
    </StatusPill>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

// Status for the overall score. 50 falls in the "warn" band (50–69) per the
// same thresholds we use across the scorecard prototype.
const TOTAL_STATUS: Status = 'warn';
const TOTAL_MAX = 100;

function HeroCard() {
  // Animated number is the source of truth — the gauge ring uses the same
  // ease curve so the digit and the arc settle together.
  const animated = useAnimatedScore(OVERALL_SCORE, 1100);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        padding: 32,
        marginBottom: 40,
        // Red-4 tint matches the onboarding sidebar. Drops the border —
        // the tint itself provides separation against the page bg.
        background: 'rgba(188, 1, 11, 0.04)',
        borderRadius: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <GaugeRing
          score={OVERALL_SCORE}
          max={TOTAL_MAX}
          color={statusColor(TOTAL_STATUS)}
          trackColor={statusTrack(TOTAL_STATUS)}
          diskColor="var(--light-100)"
          size={168}
          strokeWidth={10}
          animate
        >
          <span
            style={{
              fontFamily: "'Sohne', sans-serif",
              fontSize: 64,
              fontWeight: 300,
              color: statusColor(TOTAL_STATUS),
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {Math.round(animated)}
          </span>
        </GaugeRing>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: 400, color: 'var(--dark-60)' }}>Online health</Text>
          <Heading level={5} style={{ margin: 0, color: statusColor(TOTAL_STATUS) }}>
            {statusLabel(TOTAL_STATUS)}
          </Heading>
        </div>
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
          Reputation is your strongest play. SEO/AEO visibility and paid social have the most ground left to
          make up — focus the next 30 days on closing those gaps.
        </Text>
      </div>
    </div>
  );
}

// ── Area section (onboarding-style card + per-feature CTA) ─────────────────

function CheckIcon({ status }: { status: Status }) {
  const color =
    status === 'good' ? 'var(--dark-90)' :
    status === 'warn' ? 'var(--yellow-90)' :
    'var(--red-70)';
  return (
    <span
      style={{
        width: 22,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 0,
        color,
      }}
    >
      {status === 'good' && <Check2 size={20} />}
      {status === 'warn' && <AlertTriangle size={20} />}
      {status === 'bad' && <XSquareContained size={20} />}
    </span>
  );
}

interface AreaSectionProps {
  eyebrow: string;
  title: string;
  score: number;
  maxScore: number;
  status: Status;
  checks: { status: Status; title: string; desc: string }[];
  delta: number;
  toolId: ToolId;
  ctaTo: string;
}

function AreaSection({
  eyebrow,
  title,
  score,
  maxScore,
  status,
  checks,
  delta,
  toolId,
  ctaTo,
}: AreaSectionProps) {
  const navigate = useNavigate();
  const { isEnabled, enable } = useTools();
  const enabledTool = isEnabled(toolId);
  return (
    <section style={{ marginBottom: 36 }}>
      {/* Header above card — ring + name + delta + CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flexWrap: 'wrap' }}>
          <GaugeRing
            score={score}
            max={maxScore}
            color={statusColor(status)}
            trackColor={statusTrack(status)}
            diskColor={statusDisk(status)}
            size={48}
            strokeWidth={4}
            animate
          >
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '0.3px' }}>
              {score}
            </span>
          </GaugeRing>
          <Heading level={3} style={{ margin: 0 }}>{eyebrow}</Heading>
          <DeltaPill value={delta} />
        </div>
        <div style={{ flexShrink: 0 }}>
          {enabledTool ? (
            <Button variant="secondary" size="md" onPress={() => navigate(ctaTo)} endIcon={ArrowRight}>
              Open {TOOL_LABEL[toolId]}
            </Button>
          ) : (
            <Button variant="secondary" size="md" onPress={() => enable(toolId)}>
              Turn on {TOOL_LABEL[toolId]}
            </Button>
          )}
        </div>
      </div>

      {/* Card body — title + check rows */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Heading level={4}>{title}</Heading>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {checks.map((check, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: i === checks.length - 1 ? '12px 4px 0' : '12px 4px',
                borderTop: i === 0 ? '1px solid var(--dark-4)' : 'none',
                borderBottom: i < checks.length - 1 ? '1px solid var(--dark-4)' : 'none',
              }}
            >
              <CheckIcon status={check.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{check.title}</span>
                <Text
                  variant="secondary"
                  color="var(--dark-60)"
                  style={{ fontSize: 14, lineHeight: 1.5, display: 'block', marginTop: 2 }}
                >
                  {check.desc}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Mapping from each onboarding area to its primary feature tool + route. The
// route paths are validated against `prototypes/h2/index.tsx`'s <Route> table.
// Deltas are synthetic placeholders — negative for areas still under-served
// (Presence & Awareness, Paid Ads), positive for the ones moving in the right
// direction (Conversion, Reputation Management).
const AREA_CONFIG: { eyebrow: string; delta: number; toolId: ToolId; ctaTo: string }[] = [
  { eyebrow: 'Presence & Awareness',    delta: -3, toolId: 'Organic Campaigns', ctaTo: '/h2/organic-social' },
  { eyebrow: 'Paid Ads',                delta: -5, toolId: 'Paid Search',       ctaTo: '/h2/paid-search' },
  { eyebrow: 'Conversion',              delta: 4,  toolId: 'Landing Pages',     ctaTo: '/h2/landing-pages' },
  { eyebrow: 'Reputation Management',   delta: 6,  toolId: 'Reputation',        ctaTo: '/h2/reputation' },
];

// ── Page body ──────────────────────────────────────────────────────────────

export function BusinessScorecardBody() {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: '0 auto',
        // Horizontal padding (24px) keeps content aligned with the rest of the
        // H2 chrome. H2Layout already provides outer padding, so the top
        // padding here is minimal.
        padding: '8px 24px 60px',
      }}
    >
      <HeroCard />
      {AREAS.map((area) => {
        const cfg = AREA_CONFIG.find((c) => c.eyebrow === area.eyebrow);
        // Defensive: if a new area appears in AREAS that isn't mapped here,
        // skip it rather than render a broken CTA.
        if (!cfg) return null;
        return (
          <AreaSection
            key={area.eyebrow}
            eyebrow={area.eyebrow}
            title={area.title}
            score={area.score}
            maxScore={area.maxScore}
            status={area.status}
            checks={area.checks}
            delta={cfg.delta}
            toolId={cfg.toolId}
            ctaTo={cfg.ctaTo}
          />
        );
      })}
    </div>
  );
}
