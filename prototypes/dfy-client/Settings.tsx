import { useState } from 'react';
import { Button, Heading, Text } from '@/components';
import { StatusPill, TabChip } from '@/staging';
import Plus from '@/icons/20/Plus';
import { DataTable } from '../h2/insights/shared';
import { ClientShell } from './shell';

/**
 * Client settings — a slim, view-only surface for the done-for-you customer.
 * Operator settings (Content Settings, Competitor Tracking, Meta Strategy…)
 * are intentionally absent. Two sub-tabs: who can see the account, and the
 * plan + billing relationship with Blaze.
 */

type SubKey = 'user-access' | 'plans-payments';
const SUBS: { key: SubKey; label: string }[] = [
  { key: 'user-access', label: 'User access' },
  { key: 'plans-payments', label: 'Plans & payments' },
];

export function Settings({ sub }: { sub?: string }) {
  const initial = SUBS.find((s) => s.key === sub)?.key ?? 'user-access';
  const [active, setActive] = useState<SubKey>(initial);

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {SUBS.map((s) => (
        <TabChip key={s.key} selected={active === s.key} onSelect={() => setActive(s.key)}>{s.label}</TabChip>
      ))}
    </div>
  );

  return (
    <ClientShell section="settings" topbarCenter={topbarCenter}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 28px 80px' }}>
        {active === 'user-access' && <UserAccess />}
        {active === 'plans-payments' && <PlansPayments />}
      </div>
    </ClientShell>
  );
}

/* ─── User access ─────────────────────────────────────────────────────── */

const ROLE_TONE: Record<string, 'accent' | 'info' | 'success' | 'neutral'> = {
  Owner: 'accent',
  Admin: 'info',
  Approver: 'success',
  Viewer: 'neutral',
};

const MEMBERS: { name: string; you?: boolean; email: string; role: string }[] = [
  { name: 'Michael Hart', you: true, email: 'michael@graindesignflooring.com', role: 'Owner' },
  { name: 'Dana Reyes', email: 'dana.reyes@blaze.ai', role: 'Admin' },
  { name: 'Sofia Lin', email: 'sofia@graindesignflooring.com', role: 'Approver' },
  { name: 'Raj Patel', email: 'raj@graindesignflooring.com', role: 'Viewer' },
];

function UserAccess() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Heading level={2} style={{ margin: 0 }}>User access</Heading>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>People who can view and approve work on this account.</Text>
        </div>
        <Button variant="secondary" size="md" frontIcon={Plus} onPress={() => {}}>Invite member</Button>
      </div>
      <DataTable
        columns={[{ label: 'Member' }, { label: 'Email' }, { label: 'Role' }]}
        rows={MEMBERS.map((m) => [
          <span>
            {m.name}
            {m.you && <Text variant="metadata" style={{ color: 'var(--dark-60)', marginLeft: 8 }}>You</Text>}
            {m.email.endsWith('@blaze.ai') && <Text variant="metadata" style={{ color: 'var(--dark-60)', marginLeft: 8 }}>Blaze AM</Text>}
          </span>,
          <span style={{ color: 'var(--dark-60)' }}>{m.email}</span>,
          <StatusPill tone={ROLE_TONE[m.role] ?? 'neutral'} size="sm">{m.role}</StatusPill>,
        ])}
      />
    </section>
  );
}

/* ─── Plans & payments ────────────────────────────────────────────────── */

function PlansPayments() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <Heading level={2} style={{ margin: '0 0 6px' }}>Plans & payments</Heading>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>Your Blaze plan, payment method, and billing history.</Text>
      </div>

      {/* section: plan card */}
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Heading level={4} style={{ margin: 0 }}>Done-For-You — Growth</Heading>
              <StatusPill tone="success" size="sm">Active</StatusPill>
            </div>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
              Full-service marketing across organic, paid, SEO, local & reputation — with a dedicated account manager (Dana Reyes).
            </Text>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Heading level={2} style={{ display: 'block' }}>$2,500</Heading>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>per month</Text>
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--dark-8)', display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="md" onPress={() => {}}>Manage plan</Button>
          <Button variant="ghost" size="md" onPress={() => {}}>Contact your AM</Button>
        </div>
      </div>

      {/* section: payment method */}
      <div>
        <Heading level={4} style={{ margin: '0 0 12px' }}>Payment method</Heading>
        <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 28, borderRadius: 6, background: 'var(--dark-90)', color: 'var(--light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>VISA</div>
            <div>
              <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Visa ending 4242</Text>
              <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Expires 08 / 2027</Text>
            </div>
          </div>
          <Button variant="secondary" size="md" onPress={() => {}}>Update</Button>
        </div>
      </div>

      {/* section: billing history */}
      <div>
        <Heading level={4} style={{ margin: '0 0 12px' }}>Billing history</Heading>
        <DataTable
          columns={[{ label: 'Invoice' }, { label: 'Date' }, { label: 'Amount' }, { label: 'Status' }]}
          rows={[
            ['INV-2026-006', 'Jun 1, 2026', '$2,500.00', <StatusPill tone="success" size="sm">Paid</StatusPill>],
            ['INV-2026-005', 'May 1, 2026', '$2,500.00', <StatusPill tone="success" size="sm">Paid</StatusPill>],
            ['INV-2026-004', 'Apr 1, 2026', '$2,500.00', <StatusPill tone="success" size="sm">Paid</StatusPill>],
          ]}
        />
      </div>
    </section>
  );
}
