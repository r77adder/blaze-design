import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Heading, Text, Button } from '@/components';
import { getAccount } from './lib/api';
import type { Account } from './lib/types';
import type { Side } from './lib/router';
import { WorkspaceShell, STEPS, useGo, type Go } from './nav';
import { Home } from './Home';
import { Strategy } from './Strategy';
import { CreativeReview } from './CreativeReview';
import { ClientPortal } from './ClientPortal';
import { Settings, StrategyTab } from './Steady';
import { useReview, type Phase } from './lib/review';

export function Workspace() {
  const { accountId = '', side = 'am', section, sub } = useParams();
  const { pathname } = useLocation();
  const [account, setAccount] = useState<Account | null | undefined>(null);
  const go = useGo();
  const { packet, strategyComplete } = useReview();

  useEffect(() => { setAccount(null); getAccount(accountId).then((a) => setAccount(a ?? undefined)); }, [accountId]);

  // Reset scroll on any section/sub-step change — the shell's content section
  // owns the scroll, so window.scrollTo alone isn't enough.
  useEffect(() => {
    document.querySelector('section[class*="content"]')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (account === null) return <div style={{ padding: 40 }}><Text color="var(--dark-40)">Loading workspace…</Text></div>;
  if (account === undefined) return <div style={{ padding: 40 }}><Text>Workspace not found. <a href="/blaze-dfy">Back to accounts</a></Text></div>;

  // Opening an account lands on Home; its sub-tabs (overview/meetings/etc.)
  // ride the URL just like the onboarding step tabs.
  const sec = section ?? 'home';
  const steps = STEPS[sec];
  // Onboarding phases default to their intro; once shared for client review,
  // landing on the phase shows the done/review hub instead.
  const phaseDefault = (sec === 'strategy' || sec === 'creative')
    ? (packet(sec as Phase) !== 'draft' ? 'done' : 'intro')
    : sec === 'plan' ? 'scorecard' : sec === 'home' ? 'overview' : undefined;
  const effSub = steps ? (sub && steps.some((s) => s.key === sub) ? sub : phaseDefault) : undefined;
  const s = side as Side;

  // Creative Review is locked until Strategy onboarding is finished.
  const creativeUnlocked = account.phase >= 3 || strategyComplete;

  let content;
  if (sec === 'home') content = <Home clientView={s === 'client'} tab={effSub ?? 'overview'} onTabChange={(t) => go(`/${account.id}/${s}/home/${t}`)} />;
  else if (s === 'client') content = <ClientPortal account={account} section={sec} clientView={s === 'client'} />;
  // AM steady-state Brand Kit / Content Calendar reuse the shared portal views.
  else if (sec === 'brand' || sec === 'calendar') content = <ClientPortal account={account} section={sec} clientView={s === 'client'} />;
  else if (sec === 'strategy') content = <Strategy account={account} sub={effSub!} go={go} />;
  else if (sec === 'creative') content = creativeUnlocked
    ? <CreativeReview account={account} sub={effSub!} go={go} />
    : <CreativeLocked account={account} go={go} />;
  else if (sec === 'plan') content = <StrategyTab account={account} sub={effSub!} />;
  else if (sec === 'settings') content = <Settings account={account} go={go} />;
  else content = <SectionStub label={sec} />;

  return <WorkspaceShell account={account} side={s} section={sec} sub={effSub} creativeLocked={s === 'am' && !creativeUnlocked}>{content}</WorkspaceShell>;
}

function CreativeLocked({ account, go }: { account: Account; go: Go }) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: 'var(--dark-3)', color: 'var(--dark-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔒</div>
      <Heading level={3} style={{ marginTop: 0 }}>Finish Strategy onboarding first</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '8px 0 24px', lineHeight: 1.6 }}>Creative Review unlocks once the strategy is locked in — the creative is generated from it.</Text>
      <Button size="lg" onPress={() => go(`/${account.id}/am/strategy`)}>Go to Strategy onboarding</Button>
    </div>
  );
}

function SectionStub({ label }: { label: string }) {
  return <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}><Heading level={3}>{label}</Heading><Text variant="secondary" color="var(--dark-60)">Coming soon.</Text></div>;
}
