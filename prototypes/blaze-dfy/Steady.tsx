import { useEffect, useState, type ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, StatusPill, Toggle, Callout, Select } from '@/staging';
import type { Account, Goals, ScoreStatus } from './lib/types';
import * as S from './lib/strategy';
import { ACCOUNT_MANAGERS } from './lib/api';
import type { Go } from './nav';
import { Field, TextInput, ScorecardHeader, GaugeRing } from './ui';
import Check2 from '@/icons/20/Check2';
import LinkExternal from '@/icons/20/LinkExternal';
import { packageByKey, monthlyTotal, oneOffTotal, usd, fmtDate, type SelectedPackage } from './lib/billing';

function statusColor(s: ScoreStatus) { return s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--status-approved)'; }

/* ─── Settings: General (customer data) + Billing, switched via top tabs ──── */
export function Settings({ account, go, sub = 'general' }: { account: Account; go: Go; sub?: string }) {
  return sub === 'billing' ? <BillingTab account={account} /> : <GeneralSettings account={account} go={go} />;
}

/* ─── General: customer data (always editable) + Team + restart controls ──── */
function GeneralSettings({ account, go }: { account: Account; go: Go }) {
  const [name, setName] = useState(account.name);
  const [website, setWebsite] = useState(account.brand.website);
  const [industry, setIndustry] = useState(account.industry);
  const [location, setLocation] = useState(account.location);
  const [poc, setPoc] = useState(account.poc);
  const [amName, setAmName] = useState(account.am.name);
  const am = ACCOUNT_MANAGERS.find((m) => m.name === amName) ?? account.am;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <Heading level={2} style={{ marginTop: 0, marginBottom: 4 }}>Settings</Heading>
        <Text variant="secondary" color="var(--dark-60)">Customer details captured at signup. Everything here is editable any time.</Text>
      </div>

      <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
        <Heading level={3} style={{ marginTop: 0, marginBottom: 12 }}>Account manager</Heading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 99, background: 'var(--action-50)', color: 'var(--light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{am.initials}</span>
          <div style={{ flex: 1 }}>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{am.name}</Text>
            <Text variant="secondary" color="var(--dark-60)">Lead account manager, {am.initials.toLowerCase()}@blaze.ai</Text>
          </div>
          <Field label="Assigned to">
            <Select value={amName} onChange={setAmName} options={ACCOUNT_MANAGERS.map((m) => ({ value: m.name, label: m.name }))} size="md" style={{ minWidth: 200 }} />
          </Field>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
        <Heading level={3} style={{ marginTop: 0, marginBottom: 12 }}>Business</Heading>
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="Business name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Website"><TextInput value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Industry"><TextInput value={industry} onChange={(e) => setIndustry(e.target.value)} /></Field>
            <Field label="Location"><TextInput value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
        <Heading level={3} style={{ marginTop: 0, marginBottom: 12 }}>Primary contact</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full name"><TextInput value={poc.name} onChange={(e) => setPoc({ ...poc, name: e.target.value })} /></Field>
          <Field label="Role"><TextInput value={poc.role ?? ''} onChange={(e) => setPoc({ ...poc, role: e.target.value })} /></Field>
          <Field label="Email"><TextInput value={poc.email} onChange={(e) => setPoc({ ...poc, email: e.target.value })} /></Field>
          <Field label="Phone"><TextInput value={poc.phone} onChange={(e) => setPoc({ ...poc, phone: e.target.value })} /></Field>
        </div>
      </section>

      <TeamSection account={account} />

      <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
        <Heading level={3} style={{ marginTop: 0, marginBottom: 4 }}>Onboarding</Heading>
        <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 14 }}>Re-run an onboarding sequence to regenerate strategy or creative from scratch.</Text>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" size="lg" onPress={() => go(`/${account.id}/am/strategy/intro`)}>Restart strategy onboarding</Button>
          <Button variant="secondary" size="lg" onPress={() => go(`/${account.id}/am/creative/intro`)}>Redo creative review</Button>
        </div>
      </section>
    </div>
  );
}

/* ─── Team (members), embedded in Settings ───────────────────────────────── */
function TeamSection({ account }: { account: Account }) {
  const lead = account.am;
  const others = ACCOUNT_MANAGERS.filter((m) => m.name !== lead.name);
  interface Member { name: string; role: string; email: string; status: 'Active' | 'Invited'; active: string }
  const blaze: Member[] = [
    { name: lead.name, role: 'Lead account manager', email: `${lead.initials.toLowerCase()}@blaze.ai`, status: 'Active', active: 'Active now' },
    ...others.slice(0, 1).map((m): Member => ({ name: m.name, role: 'Creative strategist', email: `${m.initials.toLowerCase()}@blaze.ai`, status: 'Active', active: '2h ago' })),
    ...others.slice(1, 2).map((m): Member => ({ name: m.name, role: 'Paid media specialist', email: `${m.initials.toLowerCase()}@blaze.ai`, status: 'Invited', active: 'Invite sent' })),
  ];
  const client: Member[] = [
    { name: account.poc.name, role: account.poc.role || 'Primary contact', email: account.poc.email, status: 'Active', active: 'Yesterday' },
  ];

  const Row = ({ m, accent }: { m: Member; accent: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-6)' }}>
      <span style={{ width: 40, height: 40, borderRadius: 99, background: accent, color: 'var(--light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{m.name}</Text>
        <Text variant="secondary" color="var(--dark-60)">{m.role}, {m.email}</Text>
      </div>
      <Text variant="metadata" color="var(--dark-40)">{m.active}</Text>
      <StatusPill tone={m.status === 'Active' ? 'success' : 'warning'}>{m.status}</StatusPill>
    </div>
  );

  return (
    <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading level={3} style={{ margin: 0 }}>Team</Heading>
        <Button size="sm" variant="secondary">Invite member</Button>
      </div>
      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 8 }}>Blaze team</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {blaze.map((m) => <Row key={m.email} m={m} accent="var(--action-50)" />)}
      </div>
      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 8 }}>Client</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {client.map((m) => <Row key={m.email} m={m} accent="var(--dark-30)" />)}
      </div>
    </section>
  );
}

/* ─── Billing: subscription / first invoice / autopay / credits / links ───── */

/** Deterministic demo billing record — package model + contract dates, with
 *  the contract end set ~40 days out so the renewal window is live for the demo. */
function billingFor(account: Account) {
  const tok = (prefix: string, len: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let h = 5381;
    for (let i = 0; i < account.id.length; i++) h = ((h << 5) + h + account.id.charCodeAt(i) + prefix.length) >>> 0;
    let out = '';
    for (let i = 0; i < len; i++) { h = (h * 1103515245 + 12345) >>> 0; out += chars[h % chars.length]; }
    return prefix + out;
  };
  const ms = 86400000;
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // Live accounts carry a real contract; onboarding accounts fall back to a
  // synthetic end ~40 days out so the renewal window is still live for the demo.
  const term = account.contractTerm ?? 6;
  const end = account.contractEndDate ? new Date(`${account.contractEndDate}T00:00:00Z`) : new Date(now.getTime() + 40 * ms);
  const start = new Date(end); start.setMonth(start.getMonth() - term);
  const remind = new Date(end.getTime() - 45 * ms);
  const decide = new Date(end.getTime() - 30 * ms);
  const due = new Date(now.getTime() + 7 * ms);
  const daysToEnd = Math.round((end.getTime() - now.getTime()) / ms);
  const daysToDecide = Math.max(0, Math.round((decide.getTime() - now.getTime()) / ms));
  const packages: SelectedPackage[] = [
    { key: 'organic', duration: 'monthly', price: 899 },
    { key: 'paid-ads', duration: 'monthly', price: 899 },
    { key: 'reputation', duration: 'monthly', price: 899 },
    { key: 'video', duration: 'one-off', price: 400 },
  ];
  const workspaceNum = 1000000 + (account.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7919) % 99999;
  return {
    packages,
    mTotal: monthlyTotal(packages),
    oTotal: oneOffTotal(packages),
    term,
    startISO: iso(start), endISO: iso(end), remindISO: iso(remind), decideISO: iso(decide),
    daysToEnd, daysToDecide, inWindow: daysToEnd <= 45,
    invoiceStatus: 'Draft (finalizing)',
    dueDate: iso(due),
    creditsAllowance: '5,000',
    creditsRemaining: '5,000',
    stripeCustomer: `https://dashboard.stripe.com/customers/${tok('cus_', 14)}`,
    stripeSubscription: `https://dashboard.stripe.com/subscriptions/${tok('sub_', 18)}`,
    workspace: `https://app.blaze.ai/workspaces/${workspaceNum}/home`,
  };
}

/** A flat, divider-separated billing section — H3 header + read-only
 *  label/value rows. Matches the General settings layout (no card container). */
function BillingSection({ title, rows, footer }: { title: string; rows: { label: string; value: ReactNode }[]; footer?: ReactNode }) {
  return (
    <section style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 32 }}>
      <Heading level={3} style={{ marginTop: 0, marginBottom: 8 }}>{title}</Heading>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
            <Text variant="secondary" color="var(--dark-60)">{r.label}</Text>
            {typeof r.value === 'string' ? <Text variant="largeList" color="var(--dark-90)">{r.value}</Text> : r.value}
          </div>
        ))}
        {footer}
      </div>
    </section>
  );
}

function BillingLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--action-50)', textDecoration: 'none', fontSize: 14, maxWidth: '70%' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{href.replace('https://', '')}</span>
      <span style={{ flexShrink: 0, display: 'inline-flex' }}><LinkExternal size={14} /></span>
    </a>
  );
}

export function BillingTab({ account }: { account: Account }) {
  const b = billingFor(account);
  const totalLabel = `${usd(b.mTotal)}/mo${b.oTotal > 0 ? ` + ${usd(b.oTotal)} one-off` : ''}`;
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <Heading level={2} style={{ marginTop: 0, marginBottom: 4 }}>Billing</Heading>
        <Text variant="secondary" color="var(--dark-60)">The packages, contract term and renewal status pulled from the signed contract — everything you need for the Pipedrive note lives here.</Text>
      </div>

      {b.inWindow
        ? <Callout tone="warning" icon={Check2}>Renewal window — the {b.term}-month contract ends {fmtDate(b.endISO)}. Confirm renew or cancel by {fmtDate(b.decideISO)} ({b.daysToDecide} days).</Callout>
        : <Callout tone="success" icon={Check2}>Billing is set up — the first invoice has been issued to the customer.</Callout>}

      <BillingSection
        title="Packages"
        rows={b.packages.map((p: SelectedPackage) => {
          const def = packageByKey(p.key)!;
          return { label: def.label, value: `${usd(p.price)}${p.duration === 'monthly' ? '/mo' : ' one-off'}` };
        })}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 10, marginTop: 4, borderTop: '1px solid var(--dark-6)' }}>
            <Text variant="smallList" color="var(--dark-90)">Total</Text>
            <Text variant="smallList" color="var(--dark-90)">{totalLabel}</Text>
          </div>
        }
      />

      <BillingSection
        title="Contract"
        rows={[
          { label: 'Term', value: `${b.term} months` },
          { label: 'Started', value: fmtDate(b.startISO) },
          { label: 'Ends', value: fmtDate(b.endISO) },
          { label: 'Renewal', value: <StatusPill tone={b.inWindow ? 'warning' : 'neutral'}>{b.inWindow ? `Decision due in ${b.daysToDecide} days` : 'On track'}</StatusPill> },
        ]}
        footer={<Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 10, lineHeight: 1.5 }}>We flag the AM 45 days out ({fmtDate(b.remindISO)}) and want a renew / cancel decision by {fmtDate(b.decideISO)} (30 days out).</Text>}
      />

      <BillingSection title="First invoice" rows={[
        { label: 'Status', value: <StatusPill tone="neutral">{b.invoiceStatus}</StatusPill> },
        { label: 'Amount due', value: `${usd(b.mTotal)}` },
        { label: 'Due date', value: fmtDate(b.dueDate) },
      ]} />

      <BillingSection
        title="Autopay"
        rows={[{ label: 'Status', value: <StatusPill tone="neutral">Off — paying by invoice</StatusPill> }]}
        footer={<Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 10, lineHeight: 1.5 }}>Autopay switches on by itself once the customer pays their first invoice (the card is saved on file). Nothing to do here.</Text>}
      />

      <BillingSection title="Credits" rows={[
        { label: 'Monthly allowance', value: b.creditsAllowance },
        { label: 'Remaining this month', value: b.creditsRemaining },
      ]} />

      <BillingSection title="Links" rows={[
        { label: 'Stripe customer', value: <BillingLink href={b.stripeCustomer} /> },
        { label: 'Stripe subscription', value: <BillingLink href={b.stripeSubscription} /> },
        { label: 'Workspace in Blaze', value: <BillingLink href={b.workspace} /> },
      ]} />
    </div>
  );
}

/* ─── Strategy tab — Scorecard / Blaze Plan are top nav tabs (sub-driven). ── */
export function StrategyTab({ account, sub }: { account: Account; sub: string }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {sub === 'blaze-plan' ? <PlanView account={account} /> : <Scorecard account={account} />}
    </div>
  );
}

function Scorecard({ account }: { account: Account }) {
  const data = S.scorecard(account);
  return (
    <div>
      <ScorecardHeader data={data} accountName={account.name} />
      {data.areas.map((area) => (
        <div key={area.number} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <GaugeRing score={area.score} max={area.maxScore} status={area.status}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>{area.score}</span></GaugeRing>
            <div style={{ flex: 1 }}>
              <Heading level={4} style={{ margin: 0 }}>{area.eyebrow}</Heading>
              <Text variant="metadata" style={{ color: statusColor(area.status) }}>{area.score}/{area.maxScore}</Text>
            </div>
            {area.platforms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {area.platforms.map((p) => <span key={p} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, background: 'var(--dark-3)', color: 'var(--dark-80)', border: '1px solid var(--dark-4)' }}>{p}</span>)}
              </div>
            )}
          </div>
          <Card>
            {area.checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
                <span style={{ color: statusColor(c.status), fontWeight: 700 }}>{c.status === 'good' ? '✓' : c.status === 'warn' ? '!' : '✕'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text variant="largeList" color="var(--dark-90)">{c.title}</Text><Text variant="metadata" color="var(--dark-40)">{c.pts}</Text></div>
                  <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block' }}>{c.desc}</Text>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

/** Blaze's marketing levers — each can be switched on or off for the account. */
const LEVERS: { name: string; desc: string; on: boolean }[] = [
  { name: 'Organic Social', desc: 'Always-on posting across Instagram, Facebook & TikTok', on: true },
  { name: 'SEO / AEO', desc: 'Local SEO plus answer-engine optimization', on: true },
  { name: 'Reputation', desc: 'Review generation and response management', on: true },
  { name: 'Email', desc: 'Lifecycle and promotional email', on: true },
  { name: 'Paid Social', desc: 'Meta & TikTok ad campaigns', on: false },
  { name: 'Paid Search', desc: 'Google Ads on high-intent keywords', on: false },
  { name: 'UGC', desc: 'Creator-sourced user-generated content', on: false },
  { name: 'Landing Pages', desc: 'Conversion-optimized campaign pages', on: false },
  { name: 'AI Receptionist', desc: 'Inbound call & text capture', on: false },
];

function PlanView({ account }: { account: Account }) {
  const init = S.goals(account);
  const [g, setG] = useState<Goals>(init);
  const [levers, setLevers] = useState<Record<string, boolean>>(() => Object.fromEntries(LEVERS.map((l) => [l.name, l.on])));
  useEffect(() => { setG(S.goals(account)); }, [account]);
  const activeCount = LEVERS.filter((l) => levers[l.name]).length;
  const theme = S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0];
  const events = [
    ...g.companyEvents.map((e) => ({ ...e, tag: 'Company' as const })),
    ...g.industryEvents.map((e) => ({ ...e, tag: 'Industry' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const seo = S.seoKeywords(account);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <SectionHeading title="What does success look like?" />
        {([['First 30 days', 'thirty'], ['By 60 days', 'sixty'], ['By 90 days', 'ninety']] as const).map(([label, key]) => (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start', marginBottom: 12 }}>
            <Text variant="largeList" color="var(--dark-90)" style={{ paddingTop: 10 }}>{label}</Text>
            <TextArea value={g[key]} onChange={(e) => setG({ ...g, [key]: e.target.value })} style={{ minHeight: 64 }} />
          </div>
        ))}
      </div>

      <div>
        <SectionHeading title="First campaign theme" />
        <div style={{ padding: 16, borderRadius: 12, background: 'var(--light-100)', border: '1px solid var(--dark-8)' }}>
          <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{theme.title}</Text>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{theme.angle}</Text>
        </div>
      </div>

      <div>
        <SectionHeading title="Major events" desc="Dates the plan is built around." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-6)' }}>
              <Text variant="metadata" color="var(--dark-60)" style={{ width: 72, flexShrink: 0 }}>{e.date.slice(0, 7)}</Text>
              <Text variant="largeList" color="var(--dark-90)" style={{ flex: 1 }}>{e.label}</Text>
              <StatusPill tone={e.tag === 'Company' ? 'accent' : 'neutral'}>{e.tag}</StatusPill>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="SEO keyword plan" desc="Local-intent terms we're building content and pages around." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {seo.map((k, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-6)' }}>
              <Text variant="largeList" color="var(--dark-90)" style={{ flex: 1 }}>{k.keyword}</Text>
              <Text variant="metadata" color="var(--dark-60)">{k.volume}</Text>
              <StatusPill tone="neutral">{k.intent}</StatusPill>
              <StatusPill tone={k.difficulty === 'Low' ? 'success' : k.difficulty === 'Medium' ? 'warning' : 'danger'}>{k.difficulty}</StatusPill>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Blaze levers" desc="Switch the channels Blaze runs for this account on or off." right={<StatusPill tone="info">{activeCount} active</StatusPill>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LEVERS.map((l) => {
            const on = levers[l.name];
            return (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: on ? 'var(--light-100)' : 'var(--dark-2)', border: '1px solid var(--dark-6)' }}>
                <div style={{ flex: 1 }}>
                  <Text variant="largeList" color={on ? 'var(--dark-90)' : 'var(--dark-40)'} style={{ display: 'block' }}>{l.name}</Text>
                  <Text variant="metadata" color="var(--dark-60)">{l.desc}</Text>
                </div>
                <Toggle checked={on} onChange={(v) => setLevers({ ...levers, [l.name]: v })} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
