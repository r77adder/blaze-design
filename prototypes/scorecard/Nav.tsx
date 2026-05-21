import { Button } from '@/components';
import { Logo, TabChip } from '@/staging';

type View = 'input' | 'scan' | 'results';

const TABS: { id: View; label: string }[] = [
  { id: 'input', label: '1. Inputs' },
  { id: 'scan', label: '2. Scan' },
  { id: 'results', label: '3. Results' },
];

interface NavProps {
  view: View;
  setView: (v: View) => void;
  onTryDemo: () => void;
}

export function Nav({ view, setView, onTryDemo }: NavProps) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      height: 60,
      borderBottom: '1px solid var(--dark-4)',
      background: 'var(--light-100)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxSizing: 'border-box',
    }}>
      {/* left: brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo variant="mark" size={20} />
        <span style={{
          fontFamily: 'Sohne, sans-serif',
          fontWeight: 500,
          fontSize: 16,
          color: 'var(--dark-90)',
        }}>
          Scorecard
        </span>
      </div>

      {/* center: tabs */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {TABS.map(tab => (
          <TabChip key={tab.id} selected={view === tab.id} onSelect={() => setView(tab.id)}>
            {tab.label}
          </TabChip>
        ))}
      </div>

      {/* right: CTA */}
      <Button variant="primary" size="sm" onPress={onTryDemo}>Try the demo</Button>
    </nav>
  );
}
