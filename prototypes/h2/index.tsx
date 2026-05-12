import { Route, Routes } from 'react-router-dom';
import { Heading, Text } from '@/components';
import { Check2 } from '@/icons/20';
import { Toaster, ToasterProvider } from '@/staging';
import { H2Layout } from './H2Layout';
import { Home } from './pages/Home';
import { OrganicSocialRoute } from './pages/OrganicSocial';
import { CampaignsRoute } from './pages/Campaigns';
import { ContentPlanRoute } from './pages/ContentPlan';
import { ContentSettingsRoute } from './pages/ContentSettings';
import { CrmRoute } from './pages/Crm';
import { ToolsRoute } from './pages/Tools';
import { ToolsProvider } from './tools-context';
import { EmailSmsRoute } from './pages/EmailSms';
import { InfluencerContentRoute } from './pages/InfluencerContent';
import { LandingPagesRoute } from './pages/LandingPages';
import { MapRankingRoute } from './pages/MapRanking';
import { MultiChangeRoute } from './pages/MultiChange';
import { PaidSearchRoute } from './pages/PaidSearch';
import { ReputationRoute } from './pages/Reputation';
import { SeoAeoRoute } from './pages/SeoAeo';
import { Placeholder } from './pages/Placeholder';
import { DevStateProvider, useDevState } from './dev-state-context';
import { DevStatePanel } from './DevStatePanel';
import { PaidAdsColdView } from './pages/ColdViews';

/**
 * H2 mega-prototype. Wraps every sub-page in <H2Layout> (sidebar + topbar)
 * and a single <ToasterProvider>. Each Ivan source page (organic-social,
 * paid-search, …) is its own route under /h2/. Sidebar nav uses React
 * Router via the new `href` prop on SidebarNavItem — see _shell/Sidebar.
 *
 * Pages live in ./pages/. Each file exports a single named React component
 * that renders ONLY its body content (no shell, no ToasterProvider).
 *
 * Until a page's HTML port lands, its slot uses <Placeholder> so the route
 * still resolves and navigation remains a functional flow.
 */
export default function H2() {
  return (
    <ToolsProvider>
      <ToasterProvider>
        <DevStateProvider>
          <Routes>
            <Route path="/" element={<H2Layout><Home /></H2Layout>} />
            <Route path="/organic-social" element={<OrganicSocialRoute />} />
            <Route path="/seo-aeo" element={<SeoAeoRoute />} />
            <Route path="/map-ranking" element={<MapRankingRoute />} />
            <Route path="/influencer-content" element={<InfluencerContentRoute />} />
            <Route path="/paid-social" element={<PaidSocialRoute />} />
            <Route path="/paid-search" element={<PaidSearchRoute />} />
            <Route path="/email-sms" element={<EmailSmsRoute />} />
            <Route path="/landing-pages" element={<LandingPagesRoute />} />
            <Route path="/reputation" element={<ReputationRoute />} />
            <Route path="/content-plan" element={<ContentPlanRoute />} />
            <Route path="/campaigns" element={<CampaignsRoute />} />
            <Route path="/multi-change" element={<MultiChangeRoute />} />
            <Route path="/content-settings" element={<ContentSettingsRoute />} />
            <Route path="/crm" element={<CrmRoute />} />
            <Route path="/tools" element={<ToolsRoute />} />
          </Routes>
          <DevStatePanel />
        </DevStateProvider>
        <Toaster />
      </ToasterProvider>
    </ToolsProvider>
  );
}

/** Paid Social is a redirect-style stub — already shipped in main Blaze. Cold-state preserved. */
function PaidSocialRoute() {
  const { getState } = useDevState();
  const devState = getState('/h2/paid-social');
  return (
    <H2Layout>
      {devState === 'cold' ? <PaidAdsColdView /> : <PaidSocialView />}
    </H2Layout>
  );
}

/** Steady state: short message indicating Paid Social already exists in main Blaze. */
function PaidSocialView() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '48px 24px',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 20,
          background: 'var(--dark-4)',
          color: 'var(--dark-60)',
          marginBottom: 4,
        }}
      >
        <Check2 />
      </div>
      <Heading level={3} style={{ color: 'var(--dark-90)' }}>Already Exists in Blaze</Heading>
      <Text variant="secondary">
        This feature is available in your main Blaze workspace.
      </Text>
    </div>
  );
}
