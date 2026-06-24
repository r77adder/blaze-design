import { useState, type ReactNode, type ComponentType } from 'react';
import { Modal, Button, Text, Heading, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Select, Toggle, SegmentedControl } from '@/staging';
import type { IconProps } from '@/icons/Types';
import { Field, TextInput, TextArea } from './ui';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Edit3 from '@/icons/20/Edit3';
import ChevronDown from '@/icons/20/ChevronDown';
import Stars from '@/icons/20/Stars';
import Layers3 from '@/icons/20/Layers3';
import Marker03 from '@/icons/20/Marker03';
import Lock3 from '@/icons/20/Lock3';
import CreditsSparkle from '@/icons/20/CreditsSparkle';
import Image from '@/icons/20/Image';
import Images3 from '@/icons/20/Images3';
import Video from '@/icons/20/Video';
import Play3 from '@/icons/20/Play3';
import ImageAdd from '@/icons/20/ImageAdd';
import Document from '@/icons/20/Document';
import Mail from '@/icons/20/Mail';

/* ─── Static options ─────────────────────────────────────────────────────── */
const STRATEGIES = [
  '🏝️ Lifestyle - Day in the life moments',
  '🎯 Product spotlight - Feature deep-dives',
  '📣 Promotional - Offers & launches',
  '🗣️ Thought leadership - Industry takes',
  '⭐ Social proof - Reviews & testimonials',
];

const START_DATES = [
  { value: '2026-09-28', label: 'Fri, Sept 28' },
  { value: '2026-10-05', label: 'Fri, Oct 05' },
  { value: '2026-10-12', label: 'Fri, Oct 12' },
];
const LENGTHS = [
  { value: '1', label: '1 Week' },
  { value: '2', label: '2 Weeks' },
  { value: '4', label: '4 Weeks' },
  { value: '6', label: '6 Weeks' },
];
const POST_DAYS = ['Anyday', 'Weekdays', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'T, W, T, F'];

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
function endDate(startISO: string, weeks: number): string {
  const d = new Date(`${startISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

/* ─── Visual content modification modes ──────────────────────────────────── */
const MOD_MODES: { key: string; Icon: ComponentType<IconProps>; title: string; desc: string }[] = [
  { key: 'growth', Icon: Stars, title: 'Growth-focused', desc: 'Boosts performance with AI and smart swaps.' },
  { key: 'balanced', Icon: Layers3, title: 'Balanced', desc: 'Optimizes while preserving your brand look.' },
  { key: 'brand-first', Icon: Marker03, title: 'Brand-first', desc: 'Stays close to your original assets.' },
  { key: 'strict', Icon: Lock3, title: 'Strict brand control', desc: 'Uses your Brand Kit assets without changes.' },
];

/* ─── Content-per-week rows ──────────────────────────────────────────────── */
interface ContentRow {
  key: string;
  label: string;
  one: string; // singular for the summary
  Icon: ComponentType<IconProps>;
  cost: number; // credits per post
  count: number;
  days: string;
  accounts: string[]; // accent colors standing in for connected accounts
}
const SEED_ROWS: ContentRow[] = [
  { key: 'still', label: 'Still image posts', one: 'still', Icon: Image, cost: 8, count: 2, days: 'Anyday', accounts: ['#C8553D', '#7c5cfc', '#1877F2', '#E8568A', '#0E9AA7'] },
  { key: 'carousel', label: 'Carousels', one: 'carousel', Icon: Images3, cost: 14, count: 1, days: 'Tuesday', accounts: ['#C8553D', '#7c5cfc', '#1877F2'] },
  { key: 'video', label: 'Video feed posts', one: 'video', Icon: Video, cost: 20, count: 2, days: 'Weekdays', accounts: ['#7c5cfc'] },
  { key: 'short', label: 'Short form videos', one: 'short', Icon: Play3, cost: 16, count: 1, days: 'Weekdays', accounts: ['#7c5cfc', '#1877F2'] },
  { key: 'story', label: 'Stories', one: 'story', Icon: ImageAdd, cost: 3, count: 4, days: 'T, W, T, F', accounts: ['#7c5cfc', '#E8568A'] },
  { key: 'blog', label: 'Blog post', one: 'blog', Icon: Document, cost: 18, count: 1, days: 'Monday', accounts: ['#C8553D', '#7c5cfc', '#1877F2', '#2EB872', '#0E9AA7'] },
  { key: 'email', label: 'Email', one: 'email', Icon: Mail, cost: 8, count: 1, days: 'Tuesday', accounts: ['#C8553D', '#7c5cfc', '#1877F2', '#E8568A', '#2EB872'] },
];

const plural = (one: string, n: number) => (n === 1 ? one : one === 'story' ? 'stories' : `${one}s`);
function summarize(rows: ContentRow[]): string {
  const parts = rows.filter((r) => r.count > 0).map((r) => `${r.count} ${plural(r.one, r.count)}`);
  return parts.length ? parts.join(' · ') : 'No content scheduled';
}

/* ─── Small building blocks ──────────────────────────────────────────────── */
function RegenLabel({ children, onRegen }: { children: ReactNode; onRegen?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text variant="largeList" color="var(--dark-90)">{children}</Text>
      <button type="button" title="Regenerate" onClick={onRegen} style={{ display: 'inline-flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--dark-60)', cursor: 'pointer' }}><ArrowRefresh size={18} /></button>
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const btn = { width: 32, height: 38, border: '1px solid var(--dark-8)', background: 'var(--light-100)', color: 'var(--dark-80)', cursor: 'pointer', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-8)' }}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} style={{ ...btn, borderWidth: 0 }}>−</button>
      <span style={{ minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--dark-90)' }}>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} style={{ ...btn, borderWidth: 0 }}>+</button>
    </div>
  );
}

function AccountStack({ colors }: { colors: string[] }) {
  const shown = colors.slice(0, 3);
  const extra = colors.length - shown.length;
  return (
    <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
      <span style={{ display: 'inline-flex' }}>
        {shown.map((c, i) => (
          <span key={i} style={{ width: 26, height: 26, borderRadius: 99, background: c, border: '2px solid var(--light-100)', marginLeft: i ? -8 : 0 }} />
        ))}
        {extra > 0 && <span style={{ width: 26, height: 26, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', border: '2px solid var(--light-100)', marginLeft: -8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>+{extra}</span>}
      </span>
      <span style={{ display: 'inline-flex', color: 'var(--dark-40)' }}><ChevronDown size={16} /></span>
    </button>
  );
}

/* ─── Visual content settings accordion ──────────────────────────────────── */
function VisualSettings() {
  const [open, setOpen] = useState(false);
  const [brandKit, setBrandKit] = useState(true);
  const [mode, setMode] = useState('growth');
  const [people, setPeople] = useState('decide');
  const [overlays, setOverlays] = useState(true);
  const line = { height: 1, background: 'var(--dark-6)', margin: '16px 0' } as const;
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: '14px 16px' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <div>
          <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Visual content settings</Text>
          <Text variant="secondary" color="var(--dark-60)">Change workspace defaults only for this campaign</Text>
        </div>
        <span style={{ display: 'inline-flex', color: 'var(--dark-60)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><ChevronDown size={20} /></span>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 1, background: 'var(--dark-6)', marginBottom: 16 }} />
          {/* Brand Kit Style */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Brand Kit Style</Text>
              <Text variant="secondary" color="var(--dark-60)">Use my logos, fonts, and colors</Text>
            </div>
            <Toggle checked={brandKit} onChange={setBrandKit} aria-label="Brand Kit Style" />
          </div>

          <div style={line} />

          {/* Modification modes */}
          <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 4 }}>Visual Content Modification</Text>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12, lineHeight: 1.5 }}>Blaze uses AI to generate asset variants from your Brand Kit, tailored to your goals, strategies, and topics. Choose how to balance asset fidelity with goal optimization.</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {MOD_MODES.map((m) => {
              const on = mode === m.key;
              return (
                <button key={m.key} type="button" onClick={() => setMode(m.key)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', padding: 12, borderRadius: 10, cursor: 'pointer', background: 'var(--light-100)', border: on ? '1.5px solid var(--dark-90)' : '1px solid var(--dark-8)' }}>
                  <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: 'var(--focus-5)', color: 'var(--purple)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><m.Icon size={18} /></span>
                  <span>
                    <Text variant="smallList" color="var(--dark-90)" style={{ display: 'block' }}>{m.title}</Text>
                    <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.45 }}>{m.desc}</Text>
                  </span>
                </button>
              );
            })}
          </div>

          <div style={line} />

          {/* People */}
          <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>Do you want people in the visual assets?</Text>
          <SegmentedControl
            value={people}
            onChange={setPeople}
            options={[{ value: 'always', label: 'Always' }, { value: 'decide', label: 'Decide for me' }, { value: 'never', label: 'Never' }]}
            aria-label="People in visual assets"
          />

          <div style={line} />

          {/* Text overlays */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Do you want text overlays to the visual assets?</Text>
              <Text variant="secondary" color="var(--dark-60)">Blaze may add headlines, text, and CTAs</Text>
            </div>
            <Toggle checked={overlays} onChange={setOverlays} aria-label="Text overlays" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Content per week modal ─────────────────────────────────────────────── */
export function ContentPerWeekModal({ close, rows: initial, onConfirm }: StackModalProps & {
  rows: ContentRow[];
  onConfirm: (rows: ContentRow[]) => void;
}) {
  const [rows, setRows] = useState(initial);
  const totalPosts = rows.reduce((n, r) => n + r.count, 0);
  const totalCredits = rows.reduce((n, r) => n + r.count * r.cost, 0);
  const set = (key: string, patch: Partial<ContentRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <Modal.Root size="lg" aria-labelledby="cpw-title">
      <Modal.Header title="Content per week" id="cpw-title" onClose={close} />
      <Modal.Content>
        {/* column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr', gap: 16, padding: '0 4px 8px' }}>
          {['Content type', 'Accounts', 'Posts per week', 'Post days'].map((h) => (
            <Text key={h} variant="metadata" color="var(--dark-40)">{h}</Text>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((r) => (
            <div key={r.key} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr', gap: 16, alignItems: 'center', padding: '14px 4px', borderTop: '1px solid var(--dark-6)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ color: 'var(--dark-60)', display: 'inline-flex' }}><r.Icon size={20} /></span>
                <Text variant="primary" color="var(--dark-90)">{r.label}</Text>
              </span>
              <AccountStack colors={r.accounts} />
              <Stepper value={r.count} onChange={(n) => set(r.key, { count: n })} />
              <Select value={r.days} onChange={(d) => set(r.key, { days: d })} options={POST_DAYS.map((d) => ({ value: d, label: d }))} size="md" fullWidth />
            </div>
          ))}
          {/* total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 24, padding: '16px 4px 0', borderTop: '1px solid var(--dark-8)', marginTop: 4 }}>
            <Text variant="largeList" color="var(--dark-90)">{totalPosts} posts</Text>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--dark-90)' }}>
              <span style={{ display: 'inline-flex', color: 'var(--purple)' }}><CreditsSparkle size={18} /></span>
              <Text variant="largeList" color="var(--dark-90)">{totalCredits} credits</Text>
            </span>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left"><Modal.FooterButton variant="ghost" size="md" onPress={close}>Back</Modal.FooterButton></Modal.FooterContent>
        <Modal.FooterContent slot="right"><Modal.FooterButton variant="primary" size="md" onPress={() => { onConfirm(rows); close(); }}>Confirm Content</Modal.FooterButton></Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

/* ─── Review campaign details modal ──────────────────────────────────────── */
export function CampaignModal({ close, taskTitle }: StackModalProps & { taskTitle?: string }) {
  const { openModal } = useModals();
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [name, setName] = useState(taskTitle?.replace(/^Create (the )?/i, '').replace(/ campaign.*$/i, '') || 'Spring Lookbook Launch');
  const [theme, setTheme] = useState('Introduce our newest trail gear with a focus on performance features and real-world use cases that speak to serious outdoor enthusiasts.');
  const [ctaText, setCtaText] = useState('Book your free estimate');
  const [ctaUrl, setCtaUrl] = useState('www.woodycreekoutdoor.com');
  const [audience, setAudience] = useState('Homeowners, HOAs, Property managers');
  const [startDate, setStartDate] = useState(START_DATES[0].value);
  const [length, setLength] = useState('1');
  const [rows, setRows] = useState<ContentRow[]>(SEED_ROWS);
  const alternatives = ['Spring Style Showcase', 'Trail-Ready Drop'];

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as const;

  return (
    <Modal.Root size="lg" aria-labelledby="campaign-title">
      <Modal.Header title="Review campaign details" id="campaign-title" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Strategy">
            <Select value={strategy} onChange={setStrategy} options={STRATEGIES.map((s) => ({ value: s, label: s }))} size="lg" fullWidth />
          </Field>

          <div>
            <RegenLabel>Campaign name</RegenLabel>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <Text variant="metadata" color="var(--dark-40)">Alternatives:</Text>
              {alternatives.map((a) => (
                <button key={a} type="button" onClick={() => setName(a)} style={{ border: '1px solid var(--dark-8)', background: 'var(--dark-2)', borderRadius: 8, padding: '5px 10px', fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-80)', cursor: 'pointer' }}>{a}</button>
              ))}
            </div>
          </div>

          <div>
            <RegenLabel>Theme</RegenLabel>
            <TextArea value={theme} onChange={(e) => setTheme(e.target.value)} style={{ minHeight: 64 }} />
          </div>

          <div>
            <RegenLabel>Call-to-action</RegenLabel>
            <div style={grid2}>
              <TextInput value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
              <TextInput value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
            </div>
          </div>

          <div>
            <RegenLabel>Audience</RegenLabel>
            <TextInput value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>

          <div>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>Schedule</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Text variant="secondary" color="var(--dark-40)">Starts on</Text>
              <Select value={startDate} onChange={setStartDate} options={START_DATES} size="md" />
              <Text variant="secondary" color="var(--dark-40)">Length</Text>
              <Select value={length} onChange={setLength} options={LENGTHS} size="md" />
              <Text variant="secondary" color="var(--dark-40)">Ends {fmtDate(endDate(startDate, Number(length)))}</Text>
            </div>
          </div>

          <div>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>Content per week</Text>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid var(--dark-8)', borderRadius: 10, padding: '12px 14px' }}>
              <Text variant="secondary" color="var(--dark-80)">{summarize(rows)}</Text>
              <Button variant="ghost" size="sm" frontIcon={Edit3} onPress={() => openModal(ContentPerWeekModal, { rows, onConfirm: setRows })}>Edit</Button>
            </div>
          </div>

          <VisualSettings />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left"><Modal.FooterButton variant="ghost" size="md" onPress={close}>Back</Modal.FooterButton></Modal.FooterContent>
        <Modal.FooterContent slot="right"><Modal.FooterButton variant="primary" size="md" onPress={close}>Create Campaign</Modal.FooterButton></Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
