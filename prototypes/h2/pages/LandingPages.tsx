import { useState } from 'react';
import { Button } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';

/**
 * /h2/landing-pages — port of Blaze H2 Features/landing-pages.html (hub view).
 *
 * Source has 4 states (cold/empty / hub / loading / editor / published).
 * This commit ports the hub steady state: tabs (All/Live/Draft/Needs Review),
 * search input, list of landing-page rows.
 *
 * NOT yet wired (TODO follow-ups):
 *  - Cold/empty state
 *  - Loading screen ("Building your page" with agent analysis)
 *  - Editor (3-pane: sections / canvas / edit panel)
 *  - Published view with conversion insights
 *  - Search filtering
 *  - Tab filtering (currently always shows all)
 */

type Status = 'Live' | 'Draft' | 'Needs Review' | 'Paused';

interface Page {
  name: string;
  source: string;
  status: Status;
  cvr: string;
  views: string;
  updated: string;
}

const PAGES: Page[] = [
  { name: 'CRM for small teams — landing page', source: 'Spring SEO Push', status: 'Live', cvr: '4.6%', views: '12,400', updated: '2 days ago' },
  { name: 'Best email tool for ops — comparison', source: 'Best Email Tool — Organic Cluster', status: 'Live', cvr: '3.1%', views: '8,612', updated: '5 days ago' },
  { name: 'Founder story — LinkedIn long-form', source: 'LinkedIn — Ops Manager Persona', status: 'Needs Review', cvr: '—', views: '—', updated: '1h ago' },
  { name: 'Trial reactivation — abandoned users', source: 'Retargeting — Abandoned Trial Users', status: 'Draft', cvr: '—', views: '—', updated: 'Yesterday' },
];

const STATUS_PILL: Record<Status, { bg: string; color: string }> = {
  'Live': { bg: 'rgba(32,161,79,0.12)', color: '#0E6B33' },
  'Draft': { bg: 'rgba(0,0,0,0.05)', color: 'var(--dark-60)' },
  'Needs Review': { bg: '#FEF3C7', color: '#7B5B00' },
  'Paused': { bg: 'rgba(0,0,0,0.05)', color: 'var(--dark-60)' },
};

const TABS = ['All', 'Live', 'Draft', 'Needs Review'] as const;

export function LandingPages() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('All');
  const counts = {
    All: PAGES.length,
    Live: PAGES.filter((p) => p.status === 'Live').length,
    Draft: PAGES.filter((p) => p.status === 'Draft').length,
    'Needs Review': PAGES.filter((p) => p.status === 'Needs Review').length,
  };
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: isActive ? 'var(--dark-90)' : 'var(--dark-60)',
                  background: isActive ? 'var(--dark-8)' : 'transparent',
                  border: 'none',
                  fontWeight: isActive ? 500 : 400,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {tab}
                <span style={{ color: 'var(--dark-40)', marginLeft: 4 }}>
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>
        <input
          placeholder="Search pages…"
          style={{
            width: 240,
            padding: '8px 12px',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            fontFamily: 'inherit',
            fontSize: 13,
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PAGES.map((p) => {
          const sp = STATUS_PILL[p.status];
          return (
            <div
              key={p.name}
              onClick={() => showToast({ message: `Open ${p.name} (TODO editor)` })}
              style={{
                display: 'grid',
                gridTemplateColumns: '88px 1fr 110px 80px 140px',
                gap: 14,
                alignItems: 'center',
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                padding: '12px 14px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 56,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--dark-4) 0%, var(--dark-8) 100%)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: 'var(--dark-40)',
                }}
              >
                preview
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--dark-90)', marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
                  Built from: {p.source}
                </div>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 500,
                  background: sp.bg,
                  color: sp.color,
                  width: 'fit-content',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                {p.status}
              </span>
              <div style={{ fontSize: 12, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                <div style={{ fontWeight: 500 }}>{p.cvr}</div>
                <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>CVR</div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--dark-40)' }}>{p.updated}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LandingPagesTopbarAction() {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="md" onClick={() => showToast({ message: 'Import URL (TODO)' })}>
        Import URL
      </Button>
      <Button variant="secondary" size="md" frontIcon={Plus} onClick={() => showToast({ message: 'New landing page (TODO)' })}>
        New Landing Page
      </Button>
    </div>
  );
}
