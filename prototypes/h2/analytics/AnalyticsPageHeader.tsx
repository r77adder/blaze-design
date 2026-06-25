import { useLocation } from 'react-router-dom';
import { Select } from '@/staging';
import { useAnalytics, type ContentTypeFilter } from './analytics-context';
import { WebsiteSelector } from './components/WebsiteSelector';
import { DATE_RANGE_OPTIONS, LIVE_VISITORS } from './mockData';
import { FONT, tracking } from './format';

const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All content' },
  { value: 'ad', label: 'Ads' },
  { value: 'social_post', label: 'Social' },
  { value: 'blog_article', label: 'Blog' },
  { value: 'email_campaign', label: 'Email' },
  { value: 'landing_page', label: 'Landing pages' },
];

/** "N visitors right now" — plain text + neutral pulsing dot (no container),
 *  sitting next to the website switcher. */
function LiveVisitors() {
  return (
    <>
      <style>{`@keyframes blaze-live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT, fontSize: 14, letterSpacing: tracking(14), color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: LIVE_VISITORS > 0 ? 'var(--status-approved)' : 'var(--dark-40)',
            animation: LIVE_VISITORS > 0 ? 'blaze-live-pulse 1.6s ease-in-out infinite' : 'none',
          }}
        />
        <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{LIVE_VISITORS}</strong>
        visitors right now
      </div>
    </>
  );
}

/**
 * Persistent header above every analytics view. Left: website switcher + live
 * visitors. Right: filters — the date range, plus (on Content) the asset-type
 * dropdown next to it.
 */
export function AnalyticsPageHeader() {
  const { dateRange, setDateRange, contentType, setContentType } = useAnalytics();
  const { pathname } = useLocation();
  const isContent = pathname.endsWith('/content');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <WebsiteSelector />
        <LiveVisitors />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isContent && (
          <Select
            value={contentType}
            onChange={(v) => setContentType(v as ContentTypeFilter)}
            options={CONTENT_TYPE_OPTIONS}
            size="md"
            aria-label="Filter content by type"
          />
        )}
        <Select value={dateRange} onChange={setDateRange} options={DATE_RANGE_OPTIONS} size="md" aria-label="Date range" />
      </div>
    </div>
  );
}
