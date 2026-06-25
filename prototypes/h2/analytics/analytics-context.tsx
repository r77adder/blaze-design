import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_DATE_RANGE,
  DEFAULT_WEBSITE_ID,
  PERIOD_DELTAS,
  aiEngines,
  assetChannelBreakdown,
  assetRollups,
  blazeSourcesForChannel,
  channelSources,
  contentRows,
  externalSourcesForChannel,
  funnelTotals,
  heroTrend,
  heroTrendPrevious,
  previousTotals,
  rangeDays,
  rangeFactor,
  rangeLabel,
  selfReported,
  topPages,
} from './mockData';
import type { AssetType, AttributionMode, Channel } from './types';

/** Content-view asset-type filter ('all' shows everything). Lives in context
 *  because the dropdown renders in the shared header but filters the Content
 *  table. */
export type ContentTypeFilter = AssetType | 'all';

/**
 * Shared state for the Website Analytics views.
 *
 * - `dateRange` is the persistent header control — every view reads it (the
 *   prototype doesn't recompute data per range yet; the seam is here for it).
 * - `drawerChannel` drives the Source Drawer: set it to open the drawer for a
 *   channel, null to close. The drawer is an overlay, not a route.
 */
interface AnalyticsContextValue {
  website: string;
  setWebsite: (id: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  contentType: ContentTypeFilter;
  setContentType: (value: ContentTypeFilter) => void;
  drawerChannel: Channel | null;
  openSourceDrawer: (channel: Channel) => void;
  closeSourceDrawer: () => void;
  /** Asset id whose detail panel is open (null = closed). Opened from the
   *  Content table and the Overview's Top content card. */
  assetPanel: string | null;
  openAssetPanel: (assetId: string) => void;
  closeAssetPanel: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [website, setWebsite] = useState(DEFAULT_WEBSITE_ID);
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE);
  const [contentType, setContentType] = useState<ContentTypeFilter>('all');
  const [drawerChannel, setDrawerChannel] = useState<Channel | null>(null);
  const [assetPanel, setAssetPanel] = useState<string | null>(null);

  return (
    <AnalyticsContext.Provider
      value={{
        website,
        setWebsite,
        dateRange,
        setDateRange,
        contentType,
        setContentType,
        drawerChannel,
        openSourceDrawer: setDrawerChannel,
        closeSourceDrawer: () => setDrawerChannel(null),
        assetPanel,
        openAssetPanel: setAssetPanel,
        closeAssetPanel: () => setAssetPanel(null),
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within <AnalyticsProvider>');
  return ctx;
}

/**
 * Date-range-aware data. Reads the selected `dateRange` and returns every
 * dataset already scaled to that window (factor = days / 30 vs the baseline),
 * plus getters for the args-taking ones. Memoized per range so components just
 * read `useAnalyticsData()` and re-render when the header filter changes.
 *
 * Conversion *rates* are ratios, so they're unaffected — only volumes scale.
 */
export function useAnalyticsData() {
  const { dateRange } = useAnalytics();
  return useMemo(() => {
    const factor = rangeFactor(dateRange);
    const days = rangeDays(dateRange);
    return {
      factor,
      days,
      rangeLabel: rangeLabel(dateRange),
      periodDeltas: PERIOD_DELTAS,
      funnelTotals: funnelTotals(factor),
      previousTotals: previousTotals(factor),
      topPages: topPages(factor),
      aiEngines: aiEngines(factor),
      selfReported: selfReported(factor),
      heroTrend: heroTrend(factor, days),
      heroTrendPrevious: heroTrendPrevious(factor, days),
      channelSources: (mode: AttributionMode = 'last_touch') => channelSources(mode, factor),
      assetRollups: () => assetRollups(factor),
      contentRows: () => contentRows(factor),
      assetChannelBreakdown: (assetId: string) => assetChannelBreakdown(assetId, factor),
      blazeSourcesForChannel: (channel: Channel) => blazeSourcesForChannel(channel, factor),
      externalSourcesForChannel: (channel: Channel) => externalSourcesForChannel(channel, factor),
    };
  }, [dateRange]);
}
