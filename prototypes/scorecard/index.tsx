import { StatePicker, useStateContext } from '../_shell';
import { InputView } from './InputView';
import { ScanView } from './ScanView';
import { ResultsView } from './ResultsView';

type View = 'input' | 'scan' | 'results';

const VIEWS: { id: View; label: string }[] = [
  { id: 'input', label: '1. Input' },
  { id: 'scan', label: '2. Scan' },
  { id: 'results', label: '3. Results' },
];

function Scorecard() {
  const { state, setState } = useStateContext();
  const view = state as View;

  // Demo entry from the input form. Lands on the scan view and stays there
  // until the user manually advances via the floating state picker — gives
  // them time to see / screenshot the loading state.
  const runScan = () => setState('scan');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light-100)' }}>
      {view === 'input' && <InputView onRun={runScan} />}
      {view === 'scan' && <ScanView onComplete={() => setState('results')} />}
      {view === 'results' && <ResultsView onEditInputs={() => setState('input')} />}

      {/* Floating prototype state picker — click through input → scan → results
          without committing to the demo's auto-advance timing. */}
      <StatePickerWidget current={view} onSelect={(v) => setState(v)} />
    </div>
  );
}

function StatePickerWidget({ current, onSelect }: { current: View; onSelect: (v: View) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 100,
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: 'var(--dark-90)',
        borderRadius: 999,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
      }}
    >
      {VIEWS.map((v) => {
        const active = current === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '6px 12px',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              background: active ? 'var(--light-100)' : 'transparent',
              color: active ? 'var(--dark-90)' : 'rgba(255, 255, 255, 0.7)',
              transition: 'background 120ms ease, color 120ms ease',
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ScorecardPrototype() {
  return (
    <StatePicker states={['input', 'scan', 'results']} defaultState="results">
      <Scorecard />
    </StatePicker>
  );
}
