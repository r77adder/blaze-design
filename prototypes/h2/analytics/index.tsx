import { Navigate, Route, Routes } from 'react-router-dom';
import { H2Layout } from '../H2Layout';
import { AnalyticsProvider, useAnalytics } from './analytics-context';
import { ViewNav } from './AnalyticsHeader';
import { AnalyticsPageHeader } from './AnalyticsPageHeader';
import { SourceDrawer } from './components/SourceDrawer';
import { AssetPanel } from './components/AssetPanel';
import { Overview } from './views/Overview';
import { Funnel } from './views/Funnel';
import { Content } from './views/Content';

/** Asset detail panel, mounted app-level so it can open from the Content table
 *  or the Overview's Top content card. Driven by analytics-context. */
function AssetPanelMount() {
  const { assetPanel, closeAssetPanel } = useAnalytics();
  return <AssetPanel assetId={assetPanel} onClose={closeAssetPanel} />;
}

/**
 * Website Analytics — mounts inside the H2 shell at `/h2/analytics/*`, the
 * same way the Scorecard sub-app mounts at `/h2/scorecard/*`.
 *
 * Three top-level views (Overview / Funnel / Content) routed under one base.
 * The view tab strip lives in <H2Layout>'s topbar; the persistent page header
 * (website switcher + live pill + date range) sits above the routed view so it
 * stays put across views. The Source Drawer is an overlay, not a route.
 */
export function AnalyticsRoute() {
  return (
    <AnalyticsProvider>
      <H2Layout title="Website Analytics" topbarCenter={<ViewNav />}>
        {/* Tertiary ButtonLinks render an <a> that picks up the default anchor
            underline — strip it across the analytics surface. */}
        <style>{`.h2-analytics-root a[variant] { text-decoration: none; }`}</style>
        <div className="h2-analytics-root" style={{ maxWidth: 1160, margin: '0 auto', padding: '4px 4px 64px' }}>
          <AnalyticsPageHeader />
          <Routes>
            <Route index element={<Overview />} />
            <Route path="funnel" element={<Funnel />} />
            <Route path="content" element={<Content />} />
            <Route path="*" element={<Navigate to="/h2/analytics" replace />} />
          </Routes>
        </div>
      </H2Layout>
      <SourceDrawer />
      <AssetPanelMount />
    </AnalyticsProvider>
  );
}

export default AnalyticsRoute;
