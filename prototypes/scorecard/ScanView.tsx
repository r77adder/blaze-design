import { useEffect, useRef, useState } from 'react';
import { Heading } from '@/components';
import Check02 from '@/icons/16/Check02';
import { WebsitePanel } from './scan-panels/WebsitePanel';
import { MapPanel } from './scan-panels/MapPanel';
import { CompetitorListPanel } from './scan-panels/CompetitorListPanel';
import { InstagramPanel } from './scan-panels/InstagramPanel';
import { SerpPanel } from './scan-panels/SerpPanel';

// ─────────────────────────────────────────────────────────────────────────
// Step data + panel mapping
// ─────────────────────────────────────────────────────────────────────────

type PanelKey = 'website' | 'website-experience' | 'map-locate' | 'map-market' | 'competitors' | 'social' | 'serp';

interface Step {
  label: string;
  panel: PanelKey;
}

const STEPS: Step[] = [
  { label: 'Analyzing your website',         panel: 'website' },
  { label: 'Examining website experience',   panel: 'website-experience' },
  { label: 'Locating your business',         panel: 'map-locate' },
  { label: 'Analyzing the market',           panel: 'map-market' },
  { label: 'Looking for competitors',        panel: 'competitors' },
  { label: 'Reviewing social media presence', panel: 'social' },
  { label: 'Examining keywords',             panel: 'serp' },
  { label: 'Auditing Google ranking',        panel: 'serp' },
];

const PER_STEP_MS = 2500;
const FINAL_PAUSE_MS = 600;

// ─────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────

/** Drives currentStep (0…STEPS.length-1) over time, then fires onComplete
 *  once the final settle pause ends. `onComplete` is held via a ref so the
 *  effect doesn't restart its timer when the parent re-renders and passes
 *  a fresh arrow function. */
function useScanProgression(onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (currentStep < STEPS.length - 1) {
      const t = setTimeout(() => setCurrentStep((s) => s + 1), PER_STEP_MS);
      return () => clearTimeout(t);
    }
    // last step active — wait one more PER_STEP_MS for visual completion,
    // then a short settle pause, then complete
    const t = setTimeout(() => onCompleteRef.current(), PER_STEP_MS + FINAL_PAUSE_MS);
    return () => clearTimeout(t);
  }, [currentStep]);
  return currentStep;
}

// ─────────────────────────────────────────────────────────────────────────
// Panel switcher — all panels stacked, only active one visible
// ─────────────────────────────────────────────────────────────────────────

function PanelStack({ active }: { active: PanelKey }) {
  const layers: { key: PanelKey; node: React.ReactNode }[] = [
    { key: 'website', node: <WebsitePanel /> },
    { key: 'website-experience', node: <WebsitePanel highlightRow /> },
    { key: 'map-locate', node: <MapPanel /> },
    { key: 'map-market', node: <MapPanel revealCompetitors /> },
    { key: 'competitors', node: <CompetitorListPanel /> },
    { key: 'social', node: <InstagramPanel /> },
    { key: 'serp', node: <SerpPanel /> },
  ];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {layers.map((l) => (
        <div
          key={l.key}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: l.key === active ? 1 : 0,
            transition: 'opacity 300ms ease',
            pointerEvents: l.key === active ? 'auto' : 'none',
          }}
        >
          {l.node}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Timeline (left column)
// ─────────────────────────────────────────────────────────────────────────

function TimelineRow({
  step,
  state,
  isLast,
}: {
  step: Step;
  state: 'done' | 'active' | 'pending';
  isLast: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
      {/* icon column + vertical connector */}
      <div
        style={{
          width: 22,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          alignSelf: 'stretch',
        }}
      >
        <StepIcon state={state} />
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: 1,
              minHeight: 12,
              background: state === 'done' ? 'var(--status-approved)' : 'var(--dark-8)',
              marginTop: 4,
              transition: 'background 200ms ease',
            }}
          />
        )}
      </div>

      {/* label */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16, minWidth: 0 }}>
        <span
          className={state === 'active' ? 'scanActiveText' : undefined}
          style={{
            fontSize: 15,
            fontWeight: state === 'active' ? 500 : 400,
            color:
              state === 'done' ? 'var(--status-approved)' :
              state === 'active' ? 'var(--blue-70)' :
              'var(--dark-40)',
            transition: 'color 200ms ease',
          }}
        >
          {state === 'done' ? step.label.replace(/^(\w+ing)/, (m) => m.replace('ing', 'ed')) : step.label}
        </span>
      </div>
    </div>
  );
}

function StepIcon({ state }: { state: 'done' | 'active' | 'pending' }) {
  if (state === 'done') {
    return (
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--status-approved)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--light-100)',
          flexShrink: 0,
        }}
      >
        <Check02 size={12} color="currentColor" />
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2px solid var(--dark-8)',
          borderTopColor: 'var(--blue-70)',
          borderRightColor: 'var(--blue-70)',
          animation: 'scanSpin 0.9s linear infinite',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: '1.5px solid var(--dark-15)',
        background: 'transparent',
        flexShrink: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────

interface ScanViewProps {
  onComplete?: () => void;
}

export function ScanView({ onComplete }: ScanViewProps = {}) {
  const currentStep = useScanProgression(() => onComplete?.());
  const activePanel = STEPS[currentStep]?.panel ?? 'website';

  return (
    <div
      data-scan-grid
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: '48px 24px',
        display: 'grid',
        gridTemplateColumns: 'minmax(360px, 1fr) 1.4fr',
        gap: 48,
        alignItems: 'start',
      }}
    >
      <style>{`
        @keyframes scanSpin { to { transform: rotate(360deg); } }
        @keyframes scanShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .scanActiveText {
          background: linear-gradient(90deg, var(--blue-70) 0%, var(--blue-70) 35%, #74c5f0 50%, var(--blue-70) 65%, var(--blue-70) 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: scanShimmer 2.2s linear infinite;
        }
        @media (max-width: 900px) {
          [data-scan-grid] { grid-template-columns: 1fr !important; padding: 32px 20px !important; gap: 28px !important; }
          [data-scan-panel-wrap] { position: static !important; height: 380px !important; }
        }
      `}</style>

      {/* LEFT COLUMN — title + timeline */}
        <div>
          <Heading level={2} style={{ marginBottom: 28, lineHeight: 1.2 }}>
            Analyzing Bright Day HVAC&rsquo;s business across all sources…
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((step, i) => {
              const state: 'done' | 'active' | 'pending' =
                i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
              return (
                <TimelineRow
                  key={step.label}
                  step={step}
                  state={state}
                  isLast={i === STEPS.length - 1}
                />
              );
            })}
          </div>
        </div>

      {/* RIGHT COLUMN — visual panel */}
      <div data-scan-panel-wrap style={{ position: 'sticky', top: 24, height: 540 }}>
        <PanelStack active={activePanel} />
      </div>
    </div>
  );
}
