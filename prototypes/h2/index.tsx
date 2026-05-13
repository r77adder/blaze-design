import { Route, Routes } from 'react-router-dom';
import { Toaster, ToasterProvider } from '@/staging';
import { H2Layout } from './H2Layout';
import { Home } from './pages/Home';
import { OrganicSocialRoute } from './pages/OrganicSocial';
import { CampaignsRoute } from './pages/Campaigns';
import { ContentPlanRoute } from './pages/ContentPlan';
import { ContentSettingsRoute } from './pages/ContentSettings';
import { ToolsRoute } from './pages/Tools';
import { ToolsProvider } from './tools-context';
import { SdrRoute } from './pages/Sdr';
import { InfluencerContentRoute } from './pages/InfluencerContent';
import { LandingPagesRoute } from './pages/LandingPages';
import { MultiChangeRoute } from './pages/MultiChange';
import { PaidSearchRoute } from './pages/PaidSearch';
import { PaidSocialRoute as PaidSocialPageRoute } from './pages/PaidSocial';
import { ReputationRoute } from './pages/Reputation';
import { SeoRoute } from './pages/Seo';
import { AeoRoute } from './pages/Aeo';
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
            <Route path="/" element={<Home />} />
            <Route path="/organic-social" element={<OrganicSocialRoute />} />
            <Route path="/seo" element={<SeoRoute />} />
            <Route path="/aeo" element={<AeoRoute />} />
            <Route path="/influencer-content" element={<InfluencerContentRoute />} />
            <Route path="/paid-social" element={<PaidSocialRoute />} />
            <Route path="/paid-search" element={<PaidSearchRoute />} />
            <Route path="/landing-pages" element={<LandingPagesRoute />} />
            <Route path="/reputation" element={<ReputationRoute />} />
            <Route path="/content-plan" element={<ContentPlanRoute />} />
            <Route path="/campaigns" element={<CampaignsRoute />} />
            <Route path="/multi-change" element={<MultiChangeRoute />} />
            <Route path="/content-settings" element={<ContentSettingsRoute />} />
            <Route path="/sdr" element={<SdrRoute />} />
            <Route path="/tools" element={<ToolsRoute />} />
          </Routes>
          <DevStatePanel />
        </DevStateProvider>
        <Toaster />
      </ToasterProvider>
    </ToolsProvider>
  );
}

/** Paid Social: cold-state ports of Ivan's HTML; steady-state is the new
 *  campaign-management table — see ./pages/PaidSocial. */
function PaidSocialRoute() {
  const { getState } = useDevState();
  const devState = getState('/h2/paid-social');
  if (devState === 'cold') {
    return (
      <H2Layout>
        <PaidAdsColdView />
      </H2Layout>
    );
  }
  return <PaidSocialPageRoute />;
}
