import { Route, Routes } from 'react-router-dom';
import { Toaster, ToasterProvider } from '@/staging';
import { H2Layout } from './H2Layout';
import { Home } from './pages/Home';
import { OrganicSocialRoute } from './pages/OrganicSocial';
import { CampaignsRoute } from './pages/Campaigns';
import { ContentPlanRoute } from './pages/ContentPlan';
import { EmailSmsRoute } from './pages/EmailSms';
import { InfluencerContentRoute } from './pages/InfluencerContent';
import { LandingPagesRoute } from './pages/LandingPages';
import { MapRankingRoute } from './pages/MapRanking';
import { MultiChangeRoute } from './pages/MultiChange';
import { PaidSearchRoute } from './pages/PaidSearch';
import { ReputationRoute } from './pages/Reputation';
import { SeoAeoRoute } from './pages/SeoAeo';
import { Placeholder } from './pages/Placeholder';

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
    <ToasterProvider>
      <Routes>
        <Route path="/" element={<H2Layout><Home /></H2Layout>} />
        <Route path="/organic-social" element={<OrganicSocialRoute />} />
        <Route path="/seo-aeo" element={<SeoAeoRoute />} />
        <Route path="/map-ranking" element={<MapRankingRoute />} />
        <Route path="/influencer-content" element={<InfluencerContentRoute />} />
        <Route path="/paid-social" element={<H2Layout><Placeholder name="Paid Social" /></H2Layout>} />
        <Route path="/paid-search" element={<PaidSearchRoute />} />
        <Route path="/email-sms" element={<EmailSmsRoute />} />
        <Route path="/landing-pages" element={<LandingPagesRoute />} />
        <Route path="/reputation" element={<ReputationRoute />} />
        <Route path="/content-plan" element={<ContentPlanRoute />} />
        <Route path="/campaigns" element={<CampaignsRoute />} />
        <Route path="/multi-change" element={<MultiChangeRoute />} />
      </Routes>
      <Toaster />
    </ToasterProvider>
  );
}
