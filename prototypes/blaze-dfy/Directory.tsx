import { useEffect, useMemo, useState } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { Card, StatusPill, Avatar, TabChip } from '@/staging';
import type { StatusPillTone } from '@/staging';
import Home from '@/icons/20/Home';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Plus from '@/icons/20/Plus';
import Mail from '@/icons/20/Mail';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import { PrototypeShell } from '../_shell';
import { getAccounts, ACCOUNT_MANAGERS } from './lib/api';
import type { Account, AccountStatus } from './lib/types';
import { useGo, BASE } from './nav';
import { HoverInput } from './ui';

const COLS = 'minmax(220px,1.5fr) 120px minmax(300px,2.6fr) minmax(150px,1fr) 88px 52px';

type Filter = 'all' | AccountStatus;

function stageTone(a: Account): StatusPillTone {
  if (a.status === 'invited') return 'neutral';
  if (a.status === 'live') return 'success';
  return 'accent';
}
function stageLabel(a: Account): string {
  if (a.status === 'invited') return 'Awaiting kickoff';
  if (a.status === 'live') return 'Live';
  return 'Onboarding';
}

function phaseSection(p: 1 | 2 | 3): string {
  return p === 1 ? 'settings' : p === 2 ? 'strategy' : 'creative';
}

export function Directory() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [steps, setSteps] = useState<Record<string, string>>({});
  const go = useGo();

  useEffect(() => { getAccounts().then(setAccounts); }, []);

  const counts = useMemo(() => {
    const c = { all: accounts?.length ?? 0, invited: 0, onboarding: 0, live: 0 } as Record<Filter, number>;
    accounts?.forEach((a) => (c[a.status] += 1));
    return c;
  }, [accounts]);

  const rows = (accounts ?? []).filter((a) => filter === 'all' || a.status === filter);

  return (
    <PrototypeShell
      title="Accounts"
      workspaceName="Done For You"
      sidebarItems={[
        { label: 'Accounts', icon: Home, href: BASE },
        { label: 'Team', icon: UserProfileGroup, href: `${BASE}/team` },
      ]}
      sidebarActiveLabel="Accounts"
      topbarCenter={
        <div style={{ display: 'flex', gap: 4 }}>
          {([['all', 'All'], ['onboarding', 'Onboarding'], ['invited', 'Awaiting kickoff'], ['live', 'Live']] as [Filter, string][]).map(([key, label]) => (
            <TabChip key={key} selected={filter === key} count={counts[key]} onSelect={() => setFilter(key)}>{label}</TabChip>
          ))}
        </div>
      }
      topbarRight={<Button size="lg" variant="secondary" frontIcon={Plus} onPress={() => go('/new')}>New workspace</Button>}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Table */}
        <Card padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--dark-4)' }}>
            {['Account', 'Stage', 'Next step', 'Primary contact', 'Blaze AM', ''].map((h, i) => (
              <Text key={i} variant="metadata" color="var(--dark-40)">{h}</Text>
            ))}
          </div>
          {accounts === null ? (
            <div style={{ padding: 40 }}><Text color="var(--dark-40)">Loading accounts…</Text></div>
          ) : rows.map((a) => (
            <div
              key={a.id}
              onClick={() => go(`/${a.id}/am`)}
              style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--dark-4)', cursor: 'pointer', alignItems: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-5)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Account — name + short business description underneath */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, background: a.accent, color: 'var(--light-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{a.name.charAt(0)}</span>
                <div style={{ minWidth: 0 }}>
                  <Text variant="largeList" lineClamp={1} style={{ display: 'block', lineHeight: 1.3 }}>{a.name}</Text>
                  <Text variant="metadata" color="var(--dark-60)" lineClamp={1} style={{ display: 'block' }}>{a.industry}</Text>
                </div>
              </div>

              {/* Stage — simplified lifecycle */}
              <div style={{ minWidth: 0 }}><StatusPill tone={stageTone(a)}>{stageLabel(a)}</StatusPill></div>

              {/* Next step — editable inline */}
              <div style={{ minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
                <HoverInput value={steps[a.id] ?? a.aiNextStep} onChange={(v) => setSteps({ ...steps, [a.id]: v })} multiline style={{ fontSize: 13, color: 'var(--dark-80)', minHeight: 34, padding: '5px 7px' }} />
              </div>

              {/* POC */}
              <div style={{ minWidth: 0 }}>
                <Text variant="secondary" lineClamp={1}>{a.poc.name}</Text>
                <a href={`mailto:${a.poc.email}`} onClick={(e) => e.stopPropagation()} style={{ display: 'block', color: 'var(--dark-60)', textDecoration: 'none' }}>
                  <Text variant="metadata" lineClamp={1} color="var(--dark-60)">{a.poc.email}</Text>
                </a>
              </div>

              {/* AM */}
              <div style={{ minWidth: 0 }}>
                <Text variant="secondary" lineClamp={1}>{a.am.name.split(' ')[0]}</Text>
              </div>

              {/* Quick links */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <IconButton variant="ghost" size="sm" title="Resume" onPress={() => go(`/${a.id}/am/${phaseSection(a.phase)}`)}><ChevronRightSmall color="var(--dark-25)" /></IconButton>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </PrototypeShell>
  );
}

/* ─── Team: the account managers on Blaze's staff ────────────────────────── */
const STAFF_ROLES: Record<string, string> = {
  'Dana Whitfield': 'Senior account manager',
  'Marcus Lee': 'Account manager',
  'Priya Shah': 'Account manager',
};

export function StaffTeam() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  useEffect(() => { getAccounts().then(setAccounts); }, []);

  const staff = ACCOUNT_MANAGERS.map((m) => {
    const managed = (accounts ?? []).filter((a) => a.am.name === m.name);
    return {
      ...m,
      email: `${m.initials.toLowerCase()}@blaze.ai`,
      role: STAFF_ROLES[m.name] ?? 'Account manager',
      count: managed.length,
      live: managed.filter((a) => a.status === 'live').length,
    };
  });

  return (
    <PrototypeShell
      title="Team"
      workspaceName="Done For You"
      sidebarItems={[
        { label: 'Accounts', icon: Home, href: BASE },
        { label: 'Team', icon: UserProfileGroup, href: `${BASE}/team` },
      ]}
      sidebarActiveLabel="Team"
      topbarRight={<Button size="lg" frontIcon={Plus}>Add account manager</Button>}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <Heading level={2} style={{ margin: 0 }}>Account managers</Heading>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>The Blaze staff running Done For You accounts.</Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {staff.map((m) => (
            <Card key={m.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Avatar size="lg" fallback={m.initials} />
                <div style={{ minWidth: 0 }}>
                  <Text variant="largeList" style={{ display: 'block' }}>{m.name}</Text>
                  <Text variant="secondary" color="var(--dark-60)">{m.role}</Text>
                </div>
              </div>
              <a href={`mailto:${m.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--action-50)', textDecoration: 'none', marginBottom: 14 }}>
                <Mail size={13} color="var(--action-50)" /><Text variant="metadata" color="var(--action-50)">{m.email}</Text>
              </a>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusPill tone="neutral">{m.count} account{m.count === 1 ? '' : 's'}</StatusPill>
                <StatusPill tone="success">{m.live} live</StatusPill>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PrototypeShell>
  );
}
