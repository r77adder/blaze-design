import { Route, Routes } from 'react-router-dom';
import { Toaster, ToasterProvider } from '@/staging';
import { H2Layout } from './H2Layout';
import { Home } from './pages/Home';
import { OrganicSocialRoute } from './pages/OrganicSocial';
import { Campaigns, CampaignsTopbarAction } from './pages/Campaigns';
import { EmailSms } from './pages/EmailSms';
import { InfluencerContent, InfluencerContentTopbarAction } from './pages/InfluencerContent';
import { LandingPages, LandingPagesTopbarAction } from './pages/LandingPages';
import { MapRankingRoute } from './pages/MapRanking';
import { PaidSearch, PaidSearchTopbarAction } from './pages/PaidSearch';
import { ReputationRoute } from './pages/Reputation';
import { SeoAeo } from './pages/SeoAeo';
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
        <Route path="/seo-aeo" element={<H2Layout><SeoAeo /></H2Layout>} />
        <Route path="/map-ranking" element={<MapRankingRoute />} />
        <Route path="/influencer-content" element={<H2Layout topbarRight={<InfluencerContentTopbarAction />}><InfluencerContent /></H2Layout>} />
        <Route path="/paid-social" element={<H2Layout><Placeholder name="Paid Social" /></H2Layout>} />
        <Route path="/paid-search" element={<H2Layout topbarRight={<PaidSearchTopbarAction />}><PaidSearch /></H2Layout>} />
        <Route path="/email-sms" element={<H2Layout><EmailSms /></H2Layout>} />
        <Route path="/landing-pages" element={<H2Layout topbarRight={<LandingPagesTopbarAction />}><LandingPages /></H2Layout>} />
        <Route path="/reputation" element={<ReputationRoute />} />
        <Route path="/content-plan" element={<H2Layout><Placeholder name="Content Plan" sourceFile="content-plan-prototype" /></H2Layout>} />
        <Route path="/campaigns" element={<H2Layout topbarRight={<CampaignsTopbarAction />}><Campaigns /></H2Layout>} />
        <Route path="/multi-change" element={<H2Layout><Placeholder name="Multi-Change" sourceFile="multi-change-mockup" /></H2Layout>} />
      </Routes>
      <Toaster />
    </ToasterProvider>
  );
}
