import { useEffect, useState } from 'react';
import { Heading, Modal, Text, type StackModalProps } from '@/components';
import { Chip, Toggle, useToast } from '@/staging';
import { SUGGESTED_ADD_COMPETITORS } from './data';

// Local constants for swatches not covered by tokens.
const STATUS_GREEN = '#059669';

/**
 * Add competitor modal — 3-step stepper: Identify → Discover → Configure.
 *
 * Mirrors the source HTML's #modal (line 7443+). The Discover step simulates
 * a multi-channel scan with a progress list. The Configure step sets refresh
 * frequency + alert toggles.
 */
type Step = 1 | 2 | 3;

interface SuggestedHit { key: string; name: string; initials: string; color: string }

function getStepTitle(step: Step, input: string, picked: SuggestedHit | null, scanDone: boolean): string {
  if (step === 1) return 'Who are you tracking?';
  if (step === 2) {
    const name = picked?.name ?? input;
    return scanDone && name ? `We found ${name}` : 'Finding their channels…';
  }
  return 'How should we track them?';
}

export function AddCompetitorModal({ close }: StackModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [input, setInput] = useState('');
  const [picked, setPicked] = useState<SuggestedHit | null>(null);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    'new-ad': true,
    spike: true,
    sentiment: false,
    positioning: false,
  });
  const [scanDone, setScanDone] = useState(false);
  const { showToast } = useToast();

  const canContinue = (step === 1 && (input.trim().length > 0 || picked !== null)) || step === 2 || step === 3;

  const goNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else {
      showToast({ message: `✓ Now tracking ${picked?.name ?? input}`, variant: 'success' });
      close();
    }
  };

  const title = getStepTitle(step, input, picked, scanDone);

  return (
    <Modal.Root size="md" aria-labelledby="add-comp-title">
      <Modal.Header title={title} id="add-comp-title" onClose={close} />
      <Modal.Content>
        {step === 1 && (
          <Step1
            input={input}
            setInput={setInput}
            onPickSuggested={(s) => {
              setPicked(s);
              setInput(s.name);
            }}
          />
        )}
        {step === 2 && (
          <Step2
            input={picked?.name ?? input}
            picked={picked}
            onResolved={(hit) => setPicked(hit)}
            onScanDoneChange={setScanDone}
            onAdvance={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3
            alerts={alerts}
            toggleAlert={(k) => setAlerts((prev) => ({ ...prev, [k]: !prev[k] }))}
          />
        )}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          {step === 1 ? (
            <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
          ) : (
            <Modal.FooterButton variant="tertiary" onPress={() => setStep((s) => (s - 1) as Step)}>
              Back
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" disabled={!canContinue} onPress={goNext}>
            {step === 3 ? 'Start tracking' : 'Continue'}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function Step1({
  input,
  setInput,
  onPickSuggested,
}: {
  input: string;
  setInput: (v: string) => void;
  onPickSuggested: (s: SuggestedHit) => void;
}) {
  return (
    <div>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 16 }}>
        Enter their website, brand name, or any social handle. We'll find every channel they're active on.
      </Text>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--dark-40)' }}>🔍</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="fivestarpainting.com, Five Star, or @fivestarsouth"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            fontSize: 15,
            border: '1px solid var(--dark-15)',
            borderRadius: 10,
            outline: 'none',
          }}
        />
      </div>

      <Heading level={5} style={{ color: 'var(--dark-90)', marginBottom: 4 }}>Suggested from your landscape</Heading>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 12 }}>
        We mapped these as your most relevant competitors when you signed up. One click to add any.
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SUGGESTED_ADD_COMPETITORS.map((s) => {
          const selected = input === s.name;
          return (
            <Chip
              key={s.key}
              size="sm"
              selected={selected}
              onSelectionChange={() => onPickSuggested(s)}
              style={{
                background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                borderColor: selected ? 'var(--dark-60)' : 'transparent',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: s.color,
                  color: 'var(--light-100)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 6,
                }}
              >
                <Text variant="metadata" style={{ color: 'inherit' }}>{s.initials}</Text>
              </span>
              {s.name}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

const CHANNELS_TO_SCAN = [
  'Website',
  'Instagram',
  'LinkedIn',
  'Google Ads',
  'Meta Ads',
  'YouTube',
] as const;

function Step2({ input, picked, onResolved, onScanDoneChange, onAdvance }: { input: string; picked: SuggestedHit | null; onResolved: (hit: SuggestedHit) => void; onScanDoneChange: (done: boolean) => void; onAdvance: () => void }) {
  const [scanned, setScanned] = useState<string[]>([]);

  useEffect(() => {
    setScanned([]);
    onScanDoneChange(false);
    const order: string[] = [];
    const id = setInterval(() => {
      const next = CHANNELS_TO_SCAN[order.length];
      if (!next) {
        clearInterval(id);
        // Auto-resolve to a synthetic hit when input is freeform.
        if (!picked && input.trim().length > 0) {
          onResolved({ key: 'custom', name: input.trim(), initials: input.trim().slice(0, 2).toUpperCase(), color: '#7C3AED' });
        }
        onScanDoneChange(true);
        // Auto-advance to step 3 once every channel is checked — give the
        // user a brief beat to see the final checkmark land, then move on.
        setTimeout(() => onAdvance(), 500);
        return;
      }
      order.push(next);
      setScanned([...order]);
    }, 350);
    return () => clearInterval(id);
  }, [input, picked, onResolved, onScanDoneChange, onAdvance]);

  return (
    <div>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 16 }}>
        We're scanning every major platform to map their full footprint.
      </Text>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CHANNELS_TO_SCAN.map((ch) => {
          const found = scanned.includes(ch);
          return (
            <li key={ch} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--dark-8)', borderRadius: 8 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: found ? STATUS_GREEN : 'var(--dark-4)', color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="metadata" style={{ color: 'inherit' }}>{found ? '✓' : ''}</Text>
              </span>
              <Text variant="secondary" style={{ color: found ? 'var(--dark-90)' : 'var(--dark-60)' }}>{ch}</Text>
              <Text variant="metadata" style={{ color: 'var(--dark-60)', marginLeft: 'auto' }}>
                {found ? 'Active' : 'Scanning…'}
              </Text>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Step3({
  alerts,
  toggleAlert,
}: {
  alerts: Record<string, boolean>;
  toggleAlert: (k: string) => void;
}) {
  const alertDefs = [
    { key: 'new-ad', title: 'New ad launched', sub: 'A fresh creative goes live on Google or Meta' },
    { key: 'spike', title: 'Engagement spike', sub: 'A post performs 3× their normal baseline' },
    { key: 'sentiment', title: 'Sentiment shift', sub: 'Conversation tone changes meaningfully' },
    { key: 'positioning', title: 'New positioning detected', sub: 'Tagline, product, or messaging changes' },
  ];

  return (
    <div>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 16 }}>
        Choose what's worth interrupting you for.
      </Text>

      <div>
        <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)', marginBottom: 12 }}>Alert me when</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alertDefs.map((a) => {
            const on = alerts[a.key];
            return (
              <div
                key={a.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  border: `1px solid ${on ? 'var(--dark-60)' : 'var(--dark-4)'}`,
                  background: on ? 'var(--light-100)' : 'var(--dark-2)',
                  borderRadius: 10,
                  transition: 'background-color 120ms ease, border-color 120ms ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)' }}>{a.title}</Text>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{a.sub}</Text>
                </div>
                <Toggle checked={on} onChange={() => toggleAlert(a.key)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid var(--dark-15)',
        borderTopColor: 'var(--purple)',
        animation: 'remix-spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}
