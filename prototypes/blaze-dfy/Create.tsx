import { useState, type ReactNode } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { StatusPill, Select } from '@/staging';
import ArrowLeft from '@/icons/20/ArrowLeft';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import { createAccount, ACCOUNT_MANAGERS, ACCENT_SWATCHES } from './lib/api';
import type { BrandColor, BrandFont } from './lib/types';
import type { BillingInfo } from './lib/billing';
import { useGo } from './nav';
import { Field, FontFamilySelect, ColorSwatch, TextInput, FieldCard } from './ui';
import { BillingSection, BillingSummary } from './CreateBilling';

type Step = 'details' | 'scan' | 'confirm';
const STEPS: [Step, string][] = [['details', 'Client details'], ['scan', 'Brand scan'], ['confirm', 'Confirm']];

interface Doc { id: string; label: string; uploaded: boolean; note?: string }

const TODAY = new Date().toISOString().slice(0, 10);

/** Loading ring for the website-scan step. */
function Spinner() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ animation: 'dfy-spin 0.9s linear infinite' }}>
      <style>{`@keyframes dfy-spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="20" cy="20" r="16" stroke="var(--dark-8)" strokeWidth="3" />
      <circle cx="20" cy="20" r="16" stroke="var(--dark-90)" strokeWidth="3" strokeLinecap="round" strokeDasharray="80 40" />
    </svg>
  );
}

function SummaryCard({ title, editing, onToggle, edit, children }: { title: string; editing: boolean; onToggle: () => void; edit: ReactNode; children: ReactNode }) {
  return (
    <FieldCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? 16 : 10 }}>
        <Text variant="largeList" color="var(--dark-90)">{title}</Text>
        <Button variant="ghost" size="xs" onPress={onToggle}>{editing ? 'Done' : 'Edit'}</Button>
      </div>
      {editing ? edit : children}
    </FieldCard>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '5px 0' }}>
      <Text variant="secondary" color="var(--dark-60)">{label}</Text>
      <div style={{ textAlign: 'right', minWidth: 0 }}>
        {typeof value === 'string' ? <Text variant="secondary" color="var(--dark-90)">{value || '—'}</Text> : value}
      </div>
    </div>
  );
}

export function Create() {
  const go = useGo();
  const [step, setStep] = useState<Step>('details');
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [poc, setPoc] = useState({ name: '', email: '', phone: '', role: '' });
  const [amIdx, setAmIdx] = useState(0);
  const [accent, setAccent] = useState(ACCENT_SWATCHES[0]);
  const [billing, setBilling] = useState<BillingInfo>({ packages: [], term: 6, startDate: TODAY });
  const [billingImported, setBillingImported] = useState(false);
  // Confirm-step inline editing — which summary cards are expanded into editors.
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const toggleEdit = (k: string) => setEditing((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const [colors, setColors] = useState<BrandColor[]>([{ hex: '#1F2A44', name: 'Primary' }, { hex: '#F0B429', name: 'Accent' }]);
  const [fonts, setFonts] = useState<BrandFont[]>([{ family: 'Poppins', role: 'Heading' }, { family: 'Inter', role: 'Body' }]);
  const [docs, setDocs] = useState<Doc[]>([
    { id: 'transcript', label: 'Sales call transcript', uploaded: false, note: 'Informs brand, strategy & creative' },
    { id: 'guide', label: 'Brand guidelines', uploaded: false },
    { id: 'tone', label: 'Tone of voice', uploaded: false },
    { id: 'avoid', label: 'Words / phrases to avoid', uploaded: false },
    { id: 'photos', label: 'Photos', uploaded: false },
    { id: 'audiences', label: 'Target audiences', uploaded: false },
    { id: 'logos', label: 'Logo pack', uploaded: false },
  ]);

  const canContinue = name.trim() && poc.name.trim() && poc.email.trim();
  const stepIdx = STEPS.findIndex(([s]) => s === step);
  const am = ACCOUNT_MANAGERS[amIdx];

  // Step 1 → website scan (loading) → step 2.
  const startScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setStep('scan'); }, 2200);
  };

  // Mock "pull from the signed contract" — fills a realistic package set.
  const importBilling = () => {
    setBilling({
      packages: [
        { key: 'organic', duration: 'monthly', price: 899 },
        { key: 'paid-ads', duration: 'monthly', price: 899 },
        { key: 'video', duration: 'one-off', price: 400 },
      ],
      term: 6,
      startDate: TODAY,
    });
    setBillingImported(true);
  };

  async function create() {
    const account = await createAccount({ name, website, industry, location, poc, am, accent, colors, fonts });
    go(`/${account.id}/am/strategy`);
  }

  const clientGrid = (
    <div style={{ display: 'grid', gap: 16 }}>
      <Field label="Client / business name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunrise Cafe" /></Field>
      <Field label="Website"><TextInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="sunrisecafe.com" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Industry"><TextInput value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Coffee shop" /></Field>
        <Field label="Location"><TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Portland, OR" /></Field>
      </div>
    </div>
  );

  const contactGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Field label="Full name"><TextInput value={poc.name} onChange={(e) => setPoc({ ...poc, name: e.target.value })} /></Field>
      <Field label="Role"><TextInput value={poc.role} onChange={(e) => setPoc({ ...poc, role: e.target.value })} placeholder="Owner" /></Field>
      <Field label="Email"><TextInput value={poc.email} onChange={(e) => setPoc({ ...poc, email: e.target.value })} /></Field>
      <Field label="Phone"><TextInput value={poc.phone} onChange={(e) => setPoc({ ...poc, phone: e.target.value })} /></Field>
    </div>
  );

  const setupGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Field label="Assigned Blaze AM">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ACCOUNT_MANAGERS.map((m, i) => (
            <button key={m.name} onClick={() => setAmIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 36, boxSizing: 'border-box', padding: '0 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 14, letterSpacing: '0.28px', background: 'var(--light-100)', border: i === amIdx ? '1px solid var(--dark-90)' : '1px solid var(--dark-8)' }}>
              <span>{m.name}</span>
              {i === amIdx && <span>✓</span>}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Workspace accent">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACCENT_SWATCHES.map((c) => <button key={c} onClick={() => setAccent(c)} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: 'none', cursor: 'pointer', outline: accent === c ? '1px solid var(--dark-90)' : 'none', outlineOffset: 2, color: 'var(--light-100)' }}>{accent === c ? '✓' : ''}</button>)}
          </div>
        </div>
      </Field>
    </div>
  );

  const clientDetailsFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div><Heading level={3} style={{ margin: '0 0 12px' }}>Client</Heading>{clientGrid}</div>
      <div><Heading level={3} style={{ margin: '0 0 12px' }}>Primary contact</Heading>{contactGrid}</div>
      <div><Heading level={3} style={{ margin: '0 0 12px' }}>Setup</Heading>{setupGrid}</div>
      <BillingSection value={billing} onChange={setBilling} imported={billingImported} onImport={importBilling} />
    </div>
  );

  const brandScanFields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <Heading level={3} style={{ margin: '0 0 12px' }}>Colors</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ColorSwatch value={c.hex} onChange={(hex) => setColors(colors.map((x, j) => j === i ? { ...x, hex } : x))} />
              <TextInput value={c.hex} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))} style={{ maxWidth: 130, textTransform: 'uppercase' }} />
              <TextInput value={c.name} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ maxWidth: 200 }} />
              <IconButton icon={Trash2} variant="secondary" size="md" title="Remove color" onPress={() => setColors(colors.filter((_, j) => j !== i))} />
            </div>
          ))}
          <div style={{ display: 'flex' }}><Button variant="secondary" frontIcon={Plus} onPress={() => setColors([...colors, { hex: '#888888', name: 'New color' }])}>Add color</Button></div>
        </div>
      </div>
      <div>
        <Heading level={3} style={{ margin: '0 0 12px' }}>Fonts</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fonts.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', alignItems: 'center', gap: 8 }}>
              <FontFamilySelect value={f.family} onChange={(val) => setFonts(fonts.map((x, j) => j === i ? { ...x, family: val } : x))} size="md" />
              <Select value={f.role} onChange={(v) => setFonts(fonts.map((x, j) => j === i ? { ...x, role: v as BrandFont['role'] } : x))} options={[{ value: 'Display', label: 'Display' }, { value: 'Heading', label: 'Heading' }, { value: 'Body', label: 'Body' }]} size="md" fullWidth />
              <IconButton icon={Trash2} variant="secondary" size="md" title="Remove font" onPress={() => setFonts(fonts.filter((_, j) => j !== i))} />
            </div>
          ))}
          <div style={{ display: 'flex' }}><Button variant="secondary" frontIcon={Plus} onPress={() => setFonts([...fonts, { family: '', role: 'Body' }])}>Add font</Button></div>
        </div>
      </div>
      <div>
        <Heading level={3} style={{ margin: '0 0 4px' }}>Source materials</Heading>
        <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12 }}>Drop the sales call and any brand docs the scan couldn't pull — these inform everything Blaze generates.</Text>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {docs.map((d) => {
            const ext = d.id === 'transcript' ? 'txt' : 'pdf';
            return (
              <button key={d.id} onClick={() => setDocs(docs.map((x) => x.id === d.id ? { ...x, uploaded: !x.uploaded } : x))} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, cursor: 'pointer', background: 'var(--light-100)', border: d.uploaded ? '1px solid var(--dark-90)' : '1.5px dashed var(--dark-12)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{d.label}</Text>
                  <Text variant="metadata" color="var(--dark-60)">{d.uploaded ? `${d.id}.${ext}` : d.note ?? 'Drop PDF or DOC'}</Text>
                </div>
                {d.uploaded && <StatusPill tone="success">Uploaded</StatusPill>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Confirm = recap; each card edits inline (toggles to its editor in place).
  const confirmSummary = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SummaryCard title="Client" editing={editing.has('client')} onToggle={() => toggleEdit('client')} edit={clientGrid}>
        <Row label="Business name" value={name} />
        <Row label="Website" value={website} />
        <Row label="Industry" value={industry} />
        <Row label="Location" value={location} />
      </SummaryCard>
      <SummaryCard title="Primary contact" editing={editing.has('contact')} onToggle={() => toggleEdit('contact')} edit={contactGrid}>
        <Row label="Name" value={poc.name} />
        <Row label="Role" value={poc.role} />
        <Row label="Email" value={poc.email} />
        <Row label="Phone" value={poc.phone} />
      </SummaryCard>
      <SummaryCard title="Setup" editing={editing.has('setup')} onToggle={() => toggleEdit('setup')} edit={setupGrid}>
        <Row label="Assigned AM" value={am.name} />
        <Row label="Workspace accent" value={<span style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: 5, background: accent, border: '1px solid var(--dark-8)' }} />} />
      </SummaryCard>
      <SummaryCard title="Billing" editing={editing.has('billing')} onToggle={() => toggleEdit('billing')} edit={<BillingSection value={billing} onChange={setBilling} imported={billingImported} onImport={importBilling} />}>
        <BillingSummary value={billing} />
      </SummaryCard>
      <SummaryCard title="Brand" editing={editing.has('brand')} onToggle={() => toggleEdit('brand')} edit={brandScanFields}>
        <Row label="Colors" value={<div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>{colors.map((c, i) => <span key={i} title={c.name} style={{ width: 20, height: 20, borderRadius: 5, background: c.hex, border: '1px solid var(--dark-8)' }} />)}</div>} />
        <Row label="Fonts" value={fonts.map((f) => `${f.family || '—'} (${f.role})`).join(', ')} />
        <Row label="Source materials" value={`${docs.filter((d) => d.uploaded).length} of ${docs.length} uploaded`} />
      </SummaryCard>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--light-100)' }}>
      {/* Header — stepper centered (no dividers), Cancel pinned right. */}
      <header style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--light-100)', borderBottom: '1px solid var(--dark-4)' }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {STEPS.map(([s, label], i) => {
            const done = i < stepIdx; const on = s === step;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, background: on || done ? 'var(--dark-90)' : 'var(--dark-6)', color: on || done ? 'var(--light-100)' : 'var(--dark-60)' }}>{done ? '✓' : i + 1}</span>
                <Text variant={on ? 'smallList' : 'secondary'} color={on ? 'var(--dark-90)' : 'var(--dark-60)'}>{label}</Text>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="tertiary" size="sm" onPress={() => go('/')}>Cancel</Button>
        </div>
      </header>

      {/* Scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 40px' }}>
          {scanning && (
            <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '72px 0' }}>
              <div style={{ display: 'inline-flex', marginBottom: 20 }}><Spinner /></div>
              <Heading level={3} style={{ marginTop: 0 }}>Scanning {website || 'the website'}…</Heading>
              <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '10px auto 0', maxWidth: 380, lineHeight: 1.6 }}>
                Pulling brand colors, fonts and logos · reading the site copy · finding social profiles. This takes a few seconds.
              </Text>
            </div>
          )}

          {!scanning && step === 'details' && (
            <>
              <Heading level={2} style={{ marginTop: 0 }}>Create a workspace</Heading>
              <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', margin: '4px 0 32px' }}>Spin up a workspace for a newly-paying customer, then we'll scan their brand.</Text>
              {clientDetailsFields}
            </>
          )}

          {!scanning && step === 'scan' && (
            <>
              <Heading level={2} style={{ marginTop: 0 }}>Brand scan</Heading>
              <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', margin: '4px 0 32px' }}>We scanned {website || 'the website'} — review what we pulled, edit anything, and drop in materials we couldn't find.</Text>
              {brandScanFields}
            </>
          )}

          {!scanning && step === 'confirm' && (
            <>
              <Heading level={2} style={{ marginTop: 0 }}>Confirm & create</Heading>
              <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', margin: '4px 0 32px' }}>Here's everything we captured. Edit any section, then create the workspace and drop into Strategy onboarding.</Text>
              {confirmSummary}
            </>
          )}
        </div>
      </div>

      {/* Sticky, full-width footer — hidden during the scan. */}
      {!scanning && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          {step === 'details'
            ? <Button variant="tertiary" size="lg" onPress={() => go('/')}>Cancel</Button>
            : <Button variant="tertiary" size="lg" frontIcon={ArrowLeft} onPress={() => setStep(step === 'scan' ? 'details' : 'scan')}>Back</Button>}
          {step === 'details' && <Button size="lg" onPress={startScan} isDisabled={!canContinue}>Continue to brand scan</Button>}
          {step === 'scan' && <Button size="lg" onPress={() => setStep('confirm')}>Continue to confirm</Button>}
          {step === 'confirm' && <Button size="lg" onPress={create}>Create & start onboarding</Button>}
        </div>
      )}
    </div>
  );
}
