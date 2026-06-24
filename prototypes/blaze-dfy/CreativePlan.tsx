import { useEffect, useState } from 'react';
import { Text, Button, IconButton } from '@/components';
import { Card, Select } from '@/staging';
import ImageAdd from '@/icons/20/ImageAdd';
import ChevronRight from '@/icons/16/ChevronRight';
import type { Account, AssetType } from './lib/types';
import {
  type Wave,
  type PlanRow,
  SAMPLE_TYPES,
  CHANNELS,
  CHANNEL_FOR_TYPE,
  newRowId,
  defaultPlan,
  waveFromPlan,
  customSample,
} from './lib/creative';
import { SectionHeading, TextInput, AddLink, RemoveX } from './ui';
import { AssetCard } from './AssetCard';
import { usePhaseChrome } from './nav';

/** Per-format preview aspect ratio — Instagram portrait (4:5) for stills &
 *  carousels, vertical (9:16) for stories & video; mirrors CreativeReview. */
const ASPECT: Partial<Record<AssetType, string>> = {
  'Still Image': '4 / 5',
  Carousel: '4 / 5',
  Story: '9 / 16',
  Video: '9 / 16',
};
const aspectFor = (type: AssetType) => ASPECT[type] ?? '4 / 5';

const GEN_DELAY = 1600;

/**
 * Creative planning + sample-wave generation — the step shown BEFORE the visual
 * review. With no waves yet it shows an editable plan table; once samples are
 * generated it shows the latest wave as cards the AM marks for the customer.
 */
export function CreativePlan({
  account,
  waves,
  setWaves,
}: {
  account: Account;
  waves: Wave[];
  setWaves: React.Dispatch<React.SetStateAction<Wave[]>>;
}): JSX.Element {
  // The plan persists across modes so "Regenerate all" can reuse it.
  const [plan, setPlan] = useState<PlanRow[]>(() => defaultPlan(account));

  // Can't continue to Visual review until at least one wave is generated.
  const chrome = usePhaseChrome();
  useEffect(() => {
    chrome?.setNextDisabled(waves.length === 0);
    return () => chrome?.setNextDisabled(false);
  }, [chrome, waves.length]);

  /** Flip every item in a wave from `generating` to `done` after a short delay. */
  const finishWave = (waveId: string) => {
    setTimeout(() => {
      setWaves((prev) =>
        prev.map((w) =>
          w.id === waveId ? { ...w, items: w.items.map((it) => ({ ...it, status: 'done' as const })) } : w,
        ),
      );
    }, GEN_DELAY);
  };

  if (waves.length === 0) {
    return (
      <Planning
        account={account}
        plan={plan}
        setPlan={setPlan}
        onGenerate={() => {
          const wave = waveFromPlan(plan, account);
          setWaves([wave]);
          finishWave(wave.id);
        }}
        onUploadOwn={() => {
          setWaves([{ id: `wave-upload`, label: 'Your uploads', items: [customSample()] }]);
        }}
      />
    );
  }

  return <Generated account={account} plan={plan} waves={waves} setWaves={setWaves} finishWave={finishWave} />;
}

/* ─── Mode 1 — Planning ──────────────────────────────────────────────────── */

function Planning({
  account,
  plan,
  setPlan,
  onGenerate,
  onUploadOwn,
}: {
  account: Account;
  plan: PlanRow[];
  setPlan: React.Dispatch<React.SetStateAction<PlanRow[]>>;
  onGenerate: () => void;
  onUploadOwn: () => void;
}) {
  const updateRow = (id: string, patch: Partial<PlanRow>) =>
    setPlan((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: string) => setPlan((prev) => prev.filter((r) => r.id !== id));
  const addRow = () =>
    setPlan((prev) => [
      ...prev,
      { id: newRowId(), type: 'Still Image', count: 1, topic: '', channel: 'instagram_post' },
    ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeading
        title="Plan the sample wave"
        desc="Seeded from the strategy. Tweak, then generate samples for the customer to review."
      />

      {/* column labels + rows, kept tight together */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ColLabel width={200}>Format</ColLabel>
          <ColLabel width={92}>Count</ColLabel>
          <ColLabel flex>Topic</ColLabel>
          <ColLabel width={200}>Channel</ColLabel>
          <span style={{ width: 36 }} />
        </div>

        {/* rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {plan.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 200 }}>
                <Select
                  value={row.type}
                  onChange={(v) => updateRow(row.id, { type: v as AssetType, channel: CHANNEL_FOR_TYPE[v] ?? 'instagram_post' })}
                  options={SAMPLE_TYPES.map((t) => ({ value: t, label: t }))}
                  size="md"
                  fullWidth
                />
              </div>
              <Stepper value={row.count} onChange={(n) => updateRow(row.id, { count: n })} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  value={row.topic}
                  placeholder="What's it about…"
                  onChange={(e) => updateRow(row.id, { topic: e.target.value })}
                />
              </div>
              <div style={{ width: 200 }}>
                <Select
                  value={row.channel}
                  onChange={(v) => updateRow(row.id, { channel: v })}
                  options={CHANNELS}
                  size="md"
                  fullWidth
                />
              </div>
              <RemoveX onClick={() => (plan.length > 1 ? removeRow(row.id) : undefined)} />
            </div>
          ))}
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AddLink label="Add row" onClick={addRow} />
          <Button variant="secondary" frontIcon={ImageAdd} onPress={onUploadOwn}>
            Upload your own
          </Button>
        </div>
        <Button variant="primary" size="lg" onPress={onGenerate}>
          Generate samples
        </Button>
      </div>

      <Text variant="metadata" color="var(--dark-40)">
        {plan.reduce((n, r) => n + Math.max(1, r.count), 0)} samples will be generated for {account.name}.
      </Text>
    </div>
  );
}

function ColLabel({ children, width, flex }: { children: React.ReactNode; width?: number; flex?: boolean }) {
  return (
    <div style={{ width, flex: flex ? 1 : undefined }}>
      <Text variant="metadata" color="var(--dark-40)">
        {children}
      </Text>
    </div>
  );
}

/** Tiny numeric stepper (− N +). No DS stepper exists, so this is a styled
 *  inline control; min 1, ~92px wide. */
function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const btn: React.CSSProperties = {
    width: 30,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'var(--light-100)',
    color: 'var(--dark-80)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: 92, flexShrink: 0, border: '1px solid var(--dark-8)', borderRadius: 6, overflow: 'hidden' }}>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{ ...btn, borderRadius: '6px 0 0 6px' }}
      >
        −
      </button>
      <span
        style={{
          flex: 1,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: 'var(--dark-90)',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        style={{ ...btn, borderRadius: '0 6px 6px 0' }}
      >
        +
      </button>
    </div>
  );
}

/* ─── Mode 2 — Generated waves ───────────────────────────────────────────── */

/** Left chevron = the right chevron rotated; the icon set has no ChevronLeft. */
function ChevronLeft(props: { size?: number }) {
  return <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><ChevronRight {...props} /></span>;
}

/** Placeholder card shown while a sample is still generating. */
function GeneratingCard({ type }: { type: AssetType }) {
  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <div style={{ aspectRatio: aspectFor(type), background: 'var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="metadata" color="var(--dark-40)">Generating…</Text>
      </div>
    </Card>
  );
}

function Generated({
  account,
  plan,
  waves,
  setWaves,
  finishWave,
}: {
  account: Account;
  plan: PlanRow[];
  waves: Wave[];
  setWaves: React.Dispatch<React.SetStateAction<Wave[]>>;
  finishWave: (waveId: string) => void;
}) {
  const chrome = usePhaseChrome();
  // One wave shows at a time; arrows page back through earlier waves. Jump to
  // the newest whenever a wave is added.
  const [idx, setIdx] = useState(waves.length - 1);
  useEffect(() => { setIdx(waves.length - 1); }, [waves.length]);
  const safeIdx = Math.min(idx, waves.length - 1);
  const current = waves[safeIdx];
  const selectedCount = current.items.filter((it) => it.status === 'done' && it.includeInReview).length;

  const patchItem = (itemId: string, patch: Partial<Wave['items'][number]>) =>
    setWaves((prev) => prev.map((w) => (w.id === current.id ? { ...w, items: w.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) } : w)));
  const setAll = (next: boolean) =>
    setWaves((prev) => prev.map((w) => (w.id === current.id ? { ...w, items: w.items.map((it) => (it.status === 'done' ? { ...it, includeInReview: next } : it)) } : w)));
  const addOwn = () =>
    setWaves((prev) => prev.map((w) => (w.id === current.id ? { ...w, items: [...w.items, customSample()] } : w)));
  const regenerate = (guidance: string) => {
    const wave = waveFromPlan(plan, account, guidance || undefined);
    setWaves((prev) => [...prev, wave]); // the idx-jump effect moves to it
    finishWave(wave.id);
  };

  // Select all / Clear sit in the sticky footer's center; the regenerate bar
  // floats just above the footer. Both are injected into the PhaseScreen frame.
  useEffect(() => {
    chrome?.setFooterCenter(
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="sm" onPress={() => setAll(true)}>Select all</Button>
        <Text variant="metadata" color="var(--dark-60)">{selectedCount} selected</Text>
        <Button variant="ghost" size="sm" onPress={() => setAll(false)}>Clear</Button>
      </div>,
    );
    return () => chrome?.setFooterCenter(null);
  }, [chrome, current.id, selectedCount]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    chrome?.setAboveFooter(<RegenerateBar onRegenerate={regenerate} />);
    return () => chrome?.setAboveFooter(null);
  }, [chrome]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* header: wave name with the nav arrows to its right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text variant="largeList" color="var(--dark-90)">{current.label}</Text>
        <IconButton icon={ChevronLeft} variant="secondary" size="sm" title="Previous wave" isDisabled={safeIdx <= 0} onPress={() => setIdx(safeIdx - 1)} />
        <IconButton icon={ChevronRight} variant="secondary" size="sm" title="Next wave" isDisabled={safeIdx >= waves.length - 1} onPress={() => setIdx(safeIdx + 1)} />
      </div>

      {/* grid of cards (same as the Visual review card, plus a select checkbox) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
        <button
          type="button"
          onClick={addOwn}
          style={{ aspectRatio: '4 / 5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, border: '1px dashed var(--dark-15)', background: 'transparent', color: 'var(--dark-60)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <ImageAdd size={20} />
          <Text variant="metadata" color="var(--dark-60)">Add your own</Text>
        </button>
        {current.items.map((item) =>
          item.status === 'generating' ? (
            <GeneratingCard key={item.id} type={item.type} />
          ) : (
            <AssetCard
              key={item.id}
              asset={item}
              selectable
              checked={item.includeInReview}
              onCheckedChange={(n) => patchItem(item.id, { includeInReview: n })}
            />
          ),
        )}
      </div>
    </div>
  );
}

/** The "guidance + Regenerate all" bar that floats above the sticky footer.
 *  Owns its own draft so typing never remounts it in the injected slot. */
function RegenerateBar({ onRegenerate }: { onRegenerate: (guidance: string) => void }) {
  const [guidance, setGuidance] = useState('');
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--light-100)',
        border: `1px solid ${focused ? 'var(--dark-90)' : 'var(--dark-8)'}`,
        borderRadius: 16,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.04)',
        padding: '8px 8px 8px 16px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <TextInput
          value={guidance}
          placeholder="Guidance for a fresh wave — e.g. warmer tones, bigger logo, less text"
          onChange={(e) => setGuidance(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: '8px 0' }}
        />
      </div>
      <Button variant="secondary" onPress={() => { onRegenerate(guidance); setGuidance(''); }}>Regenerate all</Button>
    </div>
  );
}
