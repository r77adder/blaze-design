import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Heading, Text, Button } from '@/components';
import { getAccount } from './lib/api';
import type { Account } from './lib/types';
import type { Side } from './lib/router';
import { WorkspaceShell, STEPS, useGo, useWorkspaceChrome, type Go } from './nav';
import { Home } from './Home';
import { Strategy, GoalsOnboarding } from './Strategy';
import { CreativeReview } from './CreativeReview';
import { ClientPortal } from './ClientPortal';
import { Settings, StrategyTab } from './Steady';
import { ApprovalV2View } from './Approvals';
import { Scorecard } from './Scorecard';
import { useReview, type Phase } from './lib/review';
import type { ComponentType } from 'react';
// Faithfully-ported H2 feature pages (Awareness / Conversion). They live in
// ../h2-port and read cold/steady via the shimmed dev-state (our global toggle).
import { OrganicSocialRoute } from '../h2-port/pages/OrganicSocial';
import { OrganicProfileRoute } from '../h2-port/pages/OrganicProfile';
import { SeoAeoRoute } from '../h2-port/pages/SeoAeo';
import { PaidSocialRoute } from '../h2-port/pages/PaidSocial';
import { PaidSearchRoute } from '../h2-port/pages/PaidSearch';
import { LandingPagesRoute } from '../h2-port/pages/LandingPages';
import { ReputationView, ReputationTabs, type TabKey } from '../h2-port/pages/Reputation';
import { CompetitorIntelPage } from '../h2-port/competitor-tracking/pages/CompetitorIntel';
import { ContentSettingsRoute } from '../h2-port/pages/ContentSettings';
import { Leads } from '../dfy-client/Leads';
import { ClientStateProvider } from '../dfy-client/dev-state';

/** AM Leads & Bookings — the exact same Conversations + Leads workspace the
 *  client sees, rendered `embedded` inside the AM WorkspaceShell so both sides
 *  stay identical. */
function SdrLeads() {
  return (
    <ClientStateProvider>
      <Leads embedded />
    </ClientStateProvider>
  );
}

/** Reputation with its subtabs pushed up into the WorkspaceShell topbar (same
 *  chrome-context mechanism H2Layout uses), so the tabs sit in the header. */
function AmReputation() {
  const chrome = useWorkspaceChrome();
  const [tab, setTab] = useState<TabKey>('reviews');
  useEffect(() => {
    chrome?.setTopbarCenter(<ReputationTabs tab={tab} onTab={setTab} />);
  });
  useEffect(() => () => { chrome?.setTopbarCenter(null); }, [chrome]);
  return <ReputationView tab={tab} onTab={setTab} />;
}

/** section slug -> ported feature page. Shared across AM/Client for now. */
const H2_FEATURE_ROUTES: Record<string, ComponentType> = {
  'organic-social': OrganicSocialRoute,
  'organic-profile': OrganicProfileRoute,
  'seo-aeo': SeoAeoRoute,
  'paid-social': PaidSocialRoute,
  'paid-search': PaidSearchRoute,
  'competitor-tracking': CompetitorIntelPage,
  'landing-pages': LandingPagesRoute,
  sdr: SdrLeads,
  reputation: AmReputation,
  'content-settings': ContentSettingsRoute,
};

export function Workspace() {
  // The client experience lives in a separate prototype now, this workspace is
  // always the AM side, so we ignore any `:side` URL segment.
  const { accountId = '', section, sub } = useParams();
  const { pathname } = useLocation();
  const [account, setAccount] = useState<Account | null | undefined>(null);
  const go = useGo();
  const { packet, goalsComplete } = useReview();
  // AM→Client cover notes live here (not inside ApprovalV2View) so they survive
  // the AM↔Client toggle and show up on the client's side of the same workspace.
  const [campaignMessages, setCampaignMessages] = useState<Record<number, string>>({});

  useEffect(() => { setAccount(null); getAccount(accountId).then((a) => setAccount(a ?? undefined)); }, [accountId]);
  // Re-pull the (mutated) in-session account without a full reset, used after
  // a handoff so the new owner shows up live across the workspace.
  const reload = () => getAccount(accountId).then((a) => { if (a) setAccount(a); });

  // Reset scroll on any section/sub-step change, the shell's content section
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
    ? (packet(sec as Phase) !== 'draft' ? 'done' : sec === 'strategy' ? 'context' : 'intro')
    : sec === 'scorecard' ? 'setup'
    : sec === 'home' ? 'work'
    : sec === 'settings' ? 'general'
    : undefined;
  const effSub = steps ? (sub && steps.some((s) => s.key === sub) ? sub : phaseDefault) : undefined;
  const s: Side = 'am';

  // Creative Review is locked until the Goals & theme flow is finished
  // (which itself comes after Strategy onboarding).
  const creativeUnlocked = account.phase >= 3 || goalsComplete;

  let content;
  if (sec === 'home') content = <Home account={account} clientView={false} tab={effSub ?? 'work'} onTabChange={(t) => go(`/${account.id}/${s}/home/${t}`)} onOpenSection={(section) => go(`/${account.id}/${s}/${section}`)} />;
  else if (sec === 'approvals') content = <ApprovalV2View clientView={false} embedded initialReviewPostId={sub} campaignMessages={campaignMessages} onSendCampaignMessage={(id, message) => setCampaignMessages((m) => ({ ...m, [id]: message }))} />;
  // Ported H2 Awareness / Conversion features.
  else if (H2_FEATURE_ROUTES[sec]) { const Feature = H2_FEATURE_ROUTES[sec]; content = <Feature />; }
  // Steady-state Brand Kit / Content Calendar reuse the shared portal views.
  else if (sec === 'brand' || sec === 'calendar') content = <ClientPortal account={account} section={sec} clientView={false} />;
  else if (sec === 'strategy') content = <Strategy account={account} sub={effSub!} go={go} />;
  else if (sec === 'goals') content = <GoalsOnboarding account={account} go={go} />;
  else if (sec === 'creative') content = creativeUnlocked
    ? <CreativeReview account={account} sub={effSub!} go={go} />
    : <CreativeLocked account={account} go={go} />;
  else if (sec === 'plan') content = <StrategyTab account={account} />;
  else if (sec === 'scorecard') content = <Scorecard account={account} sub={effSub!} go={go} />;
  else if (sec === 'settings') content = <Settings account={account} go={go} sub={effSub} />;
  else content = <SectionStub label={sec} />;

  // Approvals now navigates via in-view subtabs + content-type sections, so the
  // old type/status Filter dropdown is retired from the topbar.
  const topbarExtra = undefined;

  return <WorkspaceShell account={account} side={s} section={sec} sub={effSub} creativeLocked={!creativeUnlocked} onReload={reload} topbarExtra={topbarExtra}>{content}</WorkspaceShell>;
}

function CreativeLocked({ account, go }: { account: Account; go: Go }) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: 'var(--dark-3)', color: 'var(--dark-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔒</div>
      <Heading level={3} style={{ marginTop: 0 }}>Finish Strategy onboarding first</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '8px 0 24px', lineHeight: 1.6 }}>Creative Review unlocks once the strategy is locked in. The creative is generated from it.</Text>
      <Button size="lg" onPress={() => go(`/${account.id}/am/strategy`)}>Go to Strategy onboarding</Button>
    </div>
  );
}

function SectionStub({ label }: { label: string }) {
  return <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}><Heading level={3}>{label}</Heading><Text variant="secondary" color="var(--dark-60)">Coming soon.</Text></div>;
}
