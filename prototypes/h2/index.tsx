import { Route, Routes } from 'react-router-dom';
import { Toaster, ToasterProvider } from '@/staging';
import { H2Layout } from './H2Layout';
import { Home } from './pages/Home';
import { OrganicSocial, OrganicSocialTopbarAction } from './pages/OrganicSocial';
import { MapRanking, MapRankingTopbarAction } from './pages/MapRanking';
import { Reputation } from './pages/Reputation';
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
        <Route path="/organic-social" element={<H2Layout topbarRight={<OrganicSocialTopbarAction />}><OrganicSocial /></H2Layout>} />
        <Route path="/seo-aeo" element={<H2Layout><Placeholder name="SEO/AEO" sourceFile="seo-aeo" /></H2Layout>} />
        <Route path="/map-ranking" element={<H2Layout topbarRight={<MapRankingTopbarAction />}><MapRanking /></H2Layout>} />
        <Route path="/influencer-content" element={<H2Layout><Placeholder name="UGC Content" sourceFile="influencer-content" /></H2Layout>} />
        <Route path="/paid-social" element={<H2Layout><Placeholder name="Paid Social" /></H2Layout>} />
        <Route path="/paid-search" element={<H2Layout><Placeholder name="Paid Search" sourceFile="paid-search" /></H2Layout>} />
        <Route path="/email-sms" element={<H2Layout><Placeholder name="Email & SMS Programs" sourceFile="email&sms" /></H2Layout>} />
        <Route path="/landing-pages" element={<H2Layout><Placeholder name="Landing Pages" sourceFile="landing-pages" /></H2Layout>} />
        <Route path="/reputation" element={<H2Layout><Reputation /></H2Layout>} />
        <Route path="/content-plan" element={<H2Layout><Placeholder name="Content Plan" sourceFile="content-plan-prototype" /></H2Layout>} />
        <Route path="/campaigns" element={<H2Layout><Placeholder name="Campaigns" sourceFile="campaigns" /></H2Layout>} />
        <Route path="/multi-change" element={<H2Layout><Placeholder name="Multi-Change" sourceFile="multi-change-mockup" /></H2Layout>} />
      </Routes>
      <Toaster />
    </ToasterProvider>
  );
}
