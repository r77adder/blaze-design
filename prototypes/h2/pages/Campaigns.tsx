import { Button } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';

/**
 * /h2/campaigns — port of Blaze H2 Features/campaigns.html.
 *
 * Source has a Gantt-chart timeline view of all campaigns with start/end
 * dates, status pills, and section indicators (organic/meta/landing/etc).
 * Plus a per-campaign detail view and a 5-step new-campaign wizard.
 *
 * This commit ports a card-list representation of the campaigns (faster
 * to implement than the SVG Gantt). Each card shows the same data the
 * Gantt bar would: status, dates, included sections.
 *
 * NOT yet wired (TODO follow-ups):
 *  - SVG Gantt timeline view
 *  - Per-campaign detail (Campaign details / What's in this / Recovery panel)
 *  - 5-step new-campaign wizard
 *  - Create-new chooser modal
 */

interface Campaign {
  id: string;
  name: string;
  type: string;
  start: string; // YYYY-MM-DD
  end: string;
  status: 'posting' | 'approved' | 'review' | 'generating' | 'proposed';
  statusLabel: string;
  sections: string[];
}

const CAMPAIGNS: Campaign[] = [
  { id: 'fj', name: 'Founder Journey Q1', type: 'Lifestyle Content', start: '2026-02-08', end: '2026-03-31', status: 'posting', statusLabel: 'Posting', sections: ['organic', 'influencer', 'landing', 'aeo'] },
  { id: 'vpl', name: 'Valentine Product Launch', type: 'Lifestyle Content', start: '2026-02-12', end: '2026-02-21', status: 'approved', statusLabel: 'Approved', sections: ['organic', 'meta', 'landing', 'email'] },
  { id: 'ss', name: 'Success Stories Q1', type: 'Lifestyle Content', start: '2026-02-14', end: '2026-03-28', status: 'approved', statusLabel: 'Approved', sections: ['organic', 'influencer', 'aeo'] },
  { id: 'tt1', name: 'Tips & Tricks March', type: 'Lifestyle Content', start: '2026-02-17', end: '2026-03-24', status: 'review', statusLabel: '15 posts to review', sections: ['organic', 'aeo'] },
  { id: 'ss1', name: 'Spring Sale 2026', type: 'Lifestyle Content', start: '2026-02-25', end: '2026-03-14', status: 'review', statusLabel: '2 posts to review', sections: ['organic', 'meta', 'search', 'landing'] },
  { id: 'ss2', name: 'Spring Sale — Wave 2', type: 'Lifestyle Content', start: '2026-03-01', end: '2026-03-28', status: 'generating', statusLabel: 'Generating in 3 days', sections: ['organic', 'meta', 'search'] },
  { id: 'pu', name: 'Product Updates Q1', type: 'Lifestyle Content', start: '2026-03-03', end: '2026-04-14', status: 'generating', statusLabel: 'Generating in 10 days', sections: ['organic', 'landing', 'aeo'] },
  { id: 'tt2', name: 'Tips & Tricks April', type: 'Lifestyle Content', start: '2026-03-03', end: '2026-04-04', status: 'generating', statusLabel: 'Generating on Apr 30', sections: ['organic', 'influencer'] },
  { id: 'pe', name: 'Easter Brunch Series', type: 'Seasonal · proposed', start: '2026-03-30', end: '2026-04-12', status: 'proposed', statusLabel: 'Proposed — review to accept', sections: ['organic', 'meta'] },
  { id: 'pmd', name: "Mother's Day Gift Guide", type: 'Seasonal · proposed', start: '2026-04-20', end: '2026-04-30', status: 'proposed', statusLabel: 'Proposed — review to accept', sections: ['organic', 'meta', 'email'] },
  { id: 'psl', name: 'Summer Pre-Launch Tease', type: 'Awareness · proposed', start: '2026-04-15', end: '2026-04-30', status: 'proposed', statusLabel: 'Proposed — review to accept', sections: ['organic', 'aeo', 'landing'] },
];

const STATUS_PILL: Record<Campaign['status'], { bg: string; color: string }> = {
  posting: { bg: '#DBEAFE', color: '#1E3A8A' },
  approved: { bg: 'rgba(32,161,79,0.12)', color: '#0E6B33' },
  review: { bg: '#FFE9A8', color: '#7B5B00' },
  generating: { bg: 'rgba(124,92,252,0.12)', color: '#5B3FB8' },
  proposed: { bg: 'rgba(0,0,0,0.05)', color: 'var(--dark-60)' },
};

const SECTION_LABELS: Record<string, string> = {
  organic: 'Organic',
  influencer: 'Influencer',
  landing: 'Landing',
  aeo: 'AEO',
  meta: 'Meta Ads',
  email: 'Email',
  search: 'Search Ads',
};

function PageTabs() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 28px',
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-8)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          padding: '11px 16px',
          fontSize: 13.5,
          fontWeight: 500,
          color: 'var(--dark-90)',
          borderBottom: '2px solid var(--dark-90)',
          marginBottom: -1,
        }}
      >
        Campaigns
      </span>
      <span
        style={{
          padding: '11px 16px',
          fontSize: 13.5,
          fontWeight: 400,
          color: 'var(--dark-60)',
          borderBottom: '2px solid transparent',
          marginBottom: -1,
          cursor: 'pointer',
        }}
      >
        Calendar
      </span>
    </div>
  );
}

export function Campaigns() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageTabs />
      <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto', width: '100%', flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CAMPAIGNS.map((c) => {
            const sp = STATUS_PILL[c.status];
            return (
              <div
                key={c.id}
                onClick={() => showToast({ message: `Open ${c.name}` })}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 14,
                  padding: '14px 18px',
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{c.name}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '2px 8px',
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 500,
                        background: sp.bg,
                        color: sp.color,
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {c.statusLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--dark-60)', marginBottom: 8 }}>
                    <span>{c.type}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dark-15)' }} />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{c.start} → {c.end}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.sections.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 10.5,
                          color: 'var(--dark-60)',
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: 'var(--dark-4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontWeight: 500,
                        }}
                      >
                        {SECTION_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ alignSelf: 'center', color: 'var(--dark-40)' }}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CampaignsTopbarAction() {
  const { showToast } = useToast();
  return (
    <Button variant="secondary" size="md" frontIcon={Plus} onClick={() => showToast({ message: 'Create chooser (TODO modal)' })}>
      Create new
    </Button>
  );
}
