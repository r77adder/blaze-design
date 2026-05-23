import { Text, Heading } from '@/components';
import { Sidebar } from './Sidebar';
import { HookRow } from './HookRow';
import { SearchResults } from './SearchResults';
import { AreaCard, AREAS } from './AreaCard';

interface ResultsViewProps {
  onEditInputs: () => void;
}

export function ResultsView({ onEditInputs }: ResultsViewProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
      {/* sidebar column — soft pink tint reflecting the overall status disk,
          fills full page height */}
      <div style={{ width: 324, flexShrink: 0, background: 'rgba(188, 1, 11, 0.04)' }}>
        <Sidebar />
      </div>

      {/* main content column */}
      <div style={{ flex: 1, padding: '48px 28px 80px', minWidth: 0 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {/* section: header bar — tighter coupling to the hook cards below */}
          <div style={{ marginBottom: -16 }}>
            <Heading level={1} style={{ marginBottom: 4 }}>CertaPro Painters of Austin</Heading>
            <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>
              certapro.com/austin · Austin, TX · Scanned today ·{' '}
              <button
                type="button"
                onClick={onEditInputs}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  fontWeight: 600,
                  color: 'var(--dark-40)',
                  cursor: 'pointer',
                }}
              >
                Edit inputs
              </button>
            </Text>
          </div>

          {/* section: hook + competitors */}
          <HookRow />

          {/* section: search visibility */}
          <SearchResults />

          {/* section: area summary header — chapter-break title between the
              quick-hit cards above and the per-pillar breakdown below */}
          <div style={{ paddingTop: 16, marginBottom: -8 }}>
            <Text
              variant="metadata"
              color="var(--dark-40)"
              style={{ display: 'block', marginBottom: 8 }}
            >
              The full breakdown
            </Text>
            <Heading level={2} style={{ marginBottom: 6 }}>23 things reviewed, 17 need work</Heading>
            <Text color="var(--dark-60)" style={{ fontSize: 16, lineHeight: 1.55, display: 'block' }}>
              Here's what's broken in each of the four pillars — and how to fix it.
            </Text>
          </div>

          {/* section: area cards (each has its own marginBottom:36) */}
          <div>
            {AREAS.map(area => <AreaCard key={area.number} {...area} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
