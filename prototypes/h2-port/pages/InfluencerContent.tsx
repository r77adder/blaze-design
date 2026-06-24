import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { SourcePill, StatusPill, useToast } from '@/staging';
import type { SourceName, StatusPillTone } from '@/staging';
import Plus from '@/icons/20/Plus';
import Stars from '@/icons/20/Stars';
import PenEdit from '@/icons/16/PenEdit';
import { H2Layout } from '../H2Layout';
import { GenerateReportButton } from '../GenerateReportButton';
import { useDevState } from '../dev-state-context';
import { UgcColdView } from './ColdViews';

/**
 * /h2/influencer-content — deep port of Blaze H2 Features/influencer-content.html.
 *
 * Two tabs:
 *  - Overview — KPI strip, cross-channel UGC campaign cards (with source pills),
 *               recent activity, learning loop.
 *  - Content  — top stat bar + filter chips + grid of AI-generated videos.
 *
 * The avatar-personas detail view lives in /h2/content-settings under the
 * "Avatars" tab.
 *
 * "New Campaign" opens a single editable-summary modal: ~1.5s loading stage
 * (Paid Search pattern), then a summary of pre-selected defaults with inline
 * Edit pickers per field. Primary "Create" finishes immediately.
 */

// ─── DATA ─────────────────────────────────────────────────────────

type CampaignStatusKey = 'production' | 'review' | 'ads';

interface CampaignStatusStyle {
  label: string;
  tone: StatusPillTone;
}

const CAMPAIGN_STATUS: Record<CampaignStatusKey, CampaignStatusStyle> = {
  production: { label: 'In Production', tone: 'success' },
  review: { label: 'In Review', tone: 'info' },
  ads: { label: 'Running Ads', tone: 'warning' },
};

interface Campaign {
  id: number;
  name: string;
  avatars: string[];
  videos: number;
  statusKey: CampaignStatusKey;
  progress: number;
  sources: SourceName[];
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Exterior Painting — AI Avatar Campaign',
    avatars: ['Brenna', 'Tess'],
    videos: 5,
    statusKey: 'production',
    progress: 35,
    sources: ['campaigns', 'paidsocial'],
  },
  {
    id: 2,
    name: 'Cabinet Refresh — Lifestyle AI Series',
    avatars: ['Marco', 'Yuki', 'Brenna'],
    videos: 5,
    statusKey: 'review',
    progress: 60,
    sources: ['campaigns'],
  },
  {
    id: 3,
    name: 'Spring HOA Repaint — AI Demos',
    avatars: ['Tess', 'Yuki', 'James'],
    videos: 8,
    statusKey: 'ads',
    progress: 80,
    sources: ['paidsocial'],
  },
];

type TabKey = 'overview' | 'content';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  tab?: TabKey;
}

const STATS: StatCard[] = [
  { label: 'Active Campaigns', value: '3', icon: '📣' },
  { label: 'AI Avatars', value: '5', icon: '🤖' },
  { label: 'Videos Generated', value: '12', icon: '🎬', tab: 'content' },
  { label: 'Pending Reviews', value: '4', icon: '🔔' },
  { label: 'Est. Reach', value: '142K', icon: '👁️' },
  { label: 'Avg. CTR', value: '4.6%', icon: '📈' },
];

type ContentStatusKey = 'approved' | 'reviewing';

interface ContentItem {
  id: number;
  type: string;
  creator: string;
  campaign: string;
  status: ContentStatusKey;
  platform: string;
  duration: string;
  note: string;
}

const CONTENT: ContentItem[] = [
  { id: 1, type: 'Before/After', creator: 'Brenna (AI)', campaign: 'Exterior Painting', status: 'approved', platform: 'Instagram', duration: '22s', note: '✓ Tone match 94%' },
  { id: 2, type: 'Day-of-Work', creator: 'Brenna (AI)', campaign: 'Exterior Painting', status: 'approved', platform: 'TikTok', duration: '41s', note: '✓ Clear crew showcase' },
  { id: 3, type: 'Customer Testimonial', creator: 'Marco (AI)', campaign: 'Cabinet Refresh', status: 'reviewing', platform: 'YouTube', duration: '29s', note: '⚠ Tone slightly casual' },
  { id: 4, type: 'Color Walkthrough', creator: 'Tess (AI)', campaign: 'Cabinet Refresh', status: 'approved', platform: 'Instagram', duration: '19s', note: '✓ Elegant, on-brand' },
  { id: 5, type: 'Crew on Site', creator: 'Brenna (AI)', campaign: 'Spring HOA Repaint', status: 'approved', platform: 'Instagram', duration: '27s', note: '✓ Brand guidelines passed' },
  { id: 6, type: 'Color Tutorial', creator: 'Yuki (AI)', campaign: 'Spring HOA Repaint', status: 'reviewing', platform: 'TikTok', duration: '52s', note: '⚠ Awaiting brand check' },
  { id: 7, type: 'Project Reveal', creator: 'James (AI)', campaign: 'Spring HOA Repaint', status: 'approved', platform: 'Instagram', duration: '24s', note: '✓ Vibrant, engaging' },
];

// ─── SUMMARY MODAL DATA ───────────────────────────────────────────

const PRODUCTS = [
  'Exterior painting',
  'Interior painting',
  'Cabinet refinishing',
  'Color consultation',
  'Deck & fence staining',
  'HOA & commercial repaints',
];

const AVATARS = ['Brenna', 'Marco', 'Yuki', 'Tess', 'James'];
const STYLES = ['Editorial', 'Lifestyle', 'UGC-style', 'Studio/Clean'];
const TONES = ['Aspirational', 'Playful', 'Educational', 'Trustworthy', 'Relatable', 'Minimal', 'Bold'];
const VOLUMES = ['5 videos', '10 videos', '25 videos', '50 videos'];
const USAGES = ['Organic only', 'Paid ads allowed', 'Whitelisting'];
const EXCLUSIVITIES = ['None', '14 days', '30 days', '90 days'];

interface SummaryState {
  product: string;
  avatar: string;
  style: string;
  tone: string;
  volume: string;
  usage: string;
  exclusivity: string;
}

const initialSummary = (): SummaryState => ({
  product: 'Exterior painting',
  avatar: 'Brenna',
  style: 'Lifestyle',
  tone: 'Trustworthy',
  volume: '5 videos',
  usage: 'Paid ads allowed',
  exclusivity: '30 days',
});

// ─── REUSABLE STYLES ──────────────────────────────────────────────

const cardSurface: CSSProperties = {
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 12,
};

const sectionTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--dark-90)',
  margin: '0 0 12px',
};

// ─── TAB STRIP ────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'content', label: '🎬 Content' },
];

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        padding: '0 28px',
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-8)',
      }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            style={{
              padding: '12px 18px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--dark-90)' : 'transparent'}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              color: isActive ? 'var(--dark-90)' : 'var(--dark-60)',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: '0.1px',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────

function OverviewTab({ onJump }: { onJump: (t: TabKey) => void }) {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 32 }}>
        {STATS.map((s) => {
          const clickable = !!s.tab;
          return (
            <div
              key={s.label}
              onClick={clickable ? () => onJump(s.tab!) : undefined}
              style={{
                ...cardSurface,
                padding: '14px 16px',
                cursor: clickable ? 'pointer' : 'default',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 2, letterSpacing: '-0.2px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={sectionTitle}>Active UGC campaigns</h3>
        {CAMPAIGNS.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            onClick={() => showToast({ message: `Opening ${c.name}` })}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const sty = CAMPAIGN_STATUS[campaign.statusKey];
  return (
    <div
      onClick={onClick}
      style={{
        ...cardSurface,
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)', marginBottom: 6, letterSpacing: '0.05px' }}>
            {campaign.name}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {campaign.sources.map((s) => (
              <SourcePill key={s} source={s} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--dark-60)', flexWrap: 'wrap' }}>
            <span>🤖 {campaign.videos} AI videos</span>
            <span>🎭 {campaign.avatars.join(' · ')}</span>
          </div>
        </div>
        <StatusPill tone={sty.tone} size="sm" style={{ flexShrink: 0 }}>
          {sty.label}
        </StatusPill>
      </div>
    </div>
  );
}

const CONTENT_STATUS_TONE: Record<ContentStatusKey, StatusPillTone> = {
  approved: 'success',
  reviewing: 'warning',
};

const CONTENT_STATUS_LABEL: Record<ContentStatusKey, string> = {
  approved: 'Approved',
  reviewing: 'Reviewing',
};

// ─── CONTENT TAB ─────────────────────────────────────────────────

const CONTENT_FILTERS: { key: 'all' | ContentStatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: '✓ Approved' },
  { key: 'reviewing', label: '⚠️ Needs review' },
];

function ContentTab() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | ContentStatusKey>('all');
  const filtered = filter === 'all' ? CONTENT : CONTENT.filter((c) => c.status === filter);
  const counts = {
    total: CONTENT.length,
    approved: CONTENT.filter((c) => c.status === 'approved').length,
    review: CONTENT.filter((c) => c.status === 'reviewing').length,
    ads: 2,
  };
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 28px',
          background: 'var(--light-100)',
          borderBottom: '1px solid var(--dark-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, flex: 1, minWidth: 320 }}>
          <ContentStatPill icon="🎬" value={counts.total} label="Total videos" />
          <ContentStatPill icon="✓" value={counts.approved} label="Approved" />
          <ContentStatPill icon="⚠️" value={counts.review} label="Needs review" />
          <ContentStatPill icon="📢" value={counts.ads} label="Running as ads" />
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {CONTENT_FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  border: `1px solid ${isActive ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  background: isActive ? 'var(--dark-90)' : 'var(--light-100)',
                  color: isActive ? '#fff' : 'var(--dark-60)',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ ...cardSurface, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: 130,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  background: 'linear-gradient(135deg, var(--dark-90), #3d3d3d)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                🤖
              </div>
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{c.type}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 1 }}>
                      {c.creator} · {c.platform} · {c.duration}
                    </div>
                  </div>
                  <StatusPill tone={CONTENT_STATUS_TONE[c.status]} size="sm">
                    {CONTENT_STATUS_LABEL[c.status]}
                  </StatusPill>
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)', margin: '2px 0 8px' }}>{c.note}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  {c.status === 'reviewing' && (
                    <Button variant="secondary" size="sm" onClick={() => showToast({ message: `Reviewing ${c.type}` })}>
                      Review
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => showToast({ message: `Downloading ${c.type}` })}
                  >
                    ⬇ Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ContentStatPill({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{label}</div>
      </div>
    </div>
  );
}

// ─── SUMMARY MODAL ────────────────────────────────────────────────

type EditField = 'product' | 'avatar' | 'style' | 'tone' | 'volume' | 'usage' | 'exclusivity';

const FIELD_LABEL: Record<EditField, string> = {
  product: 'Product',
  avatar: 'Avatar',
  style: 'Style',
  tone: 'Tone',
  volume: 'Volume',
  usage: 'Usage rights',
  exclusivity: 'Exclusivity',
};

const FIELD_OPTIONS: Record<EditField, string[]> = {
  product: PRODUCTS,
  avatar: AVATARS,
  style: STYLES,
  tone: TONES,
  volume: VOLUMES,
  usage: USAGES,
  exclusivity: EXCLUSIVITIES,
};

const LOADING_TASKS = [
  'Pulling brand context',
  'Picking best-fit avatar',
  'Drafting content plan',
  'Generating sample brief',
];

const LOADING_TOTAL_MS = 1500;

function CampaignSummaryModal({
  close,
  onComplete,
}: StackModalProps & { onComplete: () => void }) {
  const [state, setState] = useState<SummaryState>(initialSummary);
  const [editing, setEditing] = useState<EditField | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskIdx, setTaskIdx] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!loading) return;
    startedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const target = Math.min(LOADING_TASKS.length - 1, Math.floor(elapsed / (LOADING_TOTAL_MS / LOADING_TASKS.length)));
      setTaskIdx(target);
      if (elapsed >= LOADING_TOTAL_MS) {
        clearInterval(id);
        setLoading(false);
      }
    }, 80);
    return () => clearInterval(id);
  }, [loading]);

  const setField = (field: EditField, value: string) => {
    setState((s) => ({ ...s, [field]: value }));
    setEditing(null);
  };

  if (editing) {
    return (
      <FieldPickerModal
        field={editing}
        current={state[editing]}
        onPick={(v) => setField(editing, v)}
        onBack={() => setEditing(null)}
        onClose={close}
      />
    );
  }

  return (
    <Modal.Root size="md" aria-labelledby="campaign-summary-title" data-testid="campaign-summary">
      <Modal.Header
        title={loading ? 'Preparing your campaign' : 'Review your campaign'}
        id="campaign-summary-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        {loading ? <SummaryLoading taskIdx={taskIdx} /> : <SummaryRows state={state} onEdit={setEditing} />}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            isDisabled={loading}
            onPress={() => {
              onComplete();
              close();
            }}
          >
            Create
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function SummaryLoading({ taskIdx }: { taskIdx: number }) {
  return (
    <div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FCB728, #B06000)',
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Stars size={22} />
      </div>
      <p
        style={{
          fontSize: 14,
          color: 'var(--dark-60)',
          lineHeight: 1.55,
          margin: '0 0 18px',
          maxWidth: 480,
        }}
      >
        Setting up your campaign — pulling brand context, picking a best-fit avatar, and drafting a content plan.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LOADING_TASKS.map((task, i) => {
          const isDone = i < taskIdx;
          const isActive = i === taskIdx;
          const dim = !isDone && !isActive;
          return (
            <div
              key={task}
              style={{
                border: `1px solid ${isActive ? 'var(--dark-15)' : 'var(--dark-8)'}`,
                borderRadius: 10,
                padding: '12px 14px',
                background: isActive ? 'var(--light-100)' : 'var(--dark-2)',
                opacity: dim ? 0.45 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                transition: 'opacity 200ms ease, background 200ms ease, border-color 200ms ease',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: isDone
                    ? '1.5px solid var(--status-approved)'
                    : isActive
                      ? '1.5px solid #FCB728'
                      : '1.5px solid var(--dark-15)',
                  background: isDone ? 'var(--status-approved)' : 'transparent',
                  borderTopColor: isActive ? 'transparent' : undefined,
                  animation: isActive ? 'spin 0.8s linear infinite' : undefined,
                  color: 'var(--light-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDone && (
                  <svg viewBox="0 0 12 12" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 6.5l2 2 5-6" />
                  </svg>
                )}
              </span>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{task}</div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


const AVATAR_EMOJI: Record<string, string> = {
  Brenna: '👩🏻',
  Marco: '🧑🏽',
  Yuki: '🧑🏻',
  Tess: '👱🏼‍♀️',
  James: '👨🏾',
};

const AVATAR_GRADIENT: Record<string, string> = {
  Brenna: 'linear-gradient(135deg, #FCB728, #ED7C2C)',
  Marco: 'linear-gradient(135deg, #7C5CFC, #0179CF)',
  Yuki: 'linear-gradient(135deg, #04AF00, #0179CF)',
  Tess: 'linear-gradient(135deg, #E65CAC, #7F24B7)',
  James: 'linear-gradient(135deg, #ED7C2C, #BC010B)',
};

const STYLE_SWATCH: Record<string, string> = {
  Editorial: 'linear-gradient(135deg, var(--dark-90), var(--dark-60))',
  Lifestyle: 'linear-gradient(135deg, #FCB728, #E65CAC)',
  'UGC-style': 'linear-gradient(135deg, #7C5CFC, #0179CF)',
  'Studio/Clean': 'linear-gradient(135deg, var(--dark-4), var(--dark-15))',
};

// Real CertaPro Austin project photos keyed by service name. Falls back to
// the white-brick exterior shot for anything not in the catalog so the
// product picker never shows a random placeholder.
const PRODUCT_THUMBS: Record<string, string> = {
  'Exterior painting': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
  'Interior painting': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/AfterIMG_0384-scaled.jpeg',
  'Cabinet refinishing': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/cabinet-staining.jpg',
  'Color consultation': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/color_consultation_certapro_preview-686x353.jpg',
  'Deck & fence staining': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/deck-staining-1.jpg',
  'Power washing': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/power-washing-2.jpg',
  'Stucco repair': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/02/After-Pic.png',
  'Drywall repair': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2026/04/IMG_9426-scaled.jpeg',
  'Wood rot repair': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/20250719220330/siding-painting.jpg',
  'Commercial painting': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2025/01/After-4-rotated.jpeg',
  'HOA repaint': 'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2024/12/After-3-scaled.jpeg',
};

const FALLBACK_PRODUCT_THUMB =
  'https://pub-9fc1f065f07e441b8f35365c774f09ae.r2.dev/uploads/sites/1368/2022/03/white-painted-brick-home-686x353.jpg';

function ProductThumb({ name }: { name: string }) {
  return (
    <img
      src={PRODUCT_THUMBS[name] ?? FALLBACK_PRODUCT_THUMB}
      alt=""
      style={{
        width: 48,
        height: 36,
        borderRadius: 6,
        objectFit: 'cover',
        border: '1px solid var(--dark-8)',
        flexShrink: 0,
      }}
    />
  );
}

function AvatarBubble({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: AVATAR_GRADIENT[name] ?? 'linear-gradient(135deg, var(--dark-60), var(--dark-90))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
      }}
    >
      {AVATAR_EMOJI[name] ?? '🧑'}
    </div>
  );
}

function StyleSwatch({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: STYLE_SWATCH[name] ?? 'linear-gradient(135deg, var(--dark-60), var(--dark-90))',
        border: '1px solid var(--dark-8)',
        flexShrink: 0,
      }}
    />
  );
}

function FieldVisual({ field, value }: { field: EditField; value: string }) {
  if (field === 'product') return <ProductThumb name={value} />;
  if (field === 'avatar') return <AvatarBubble name={value} />;
  if (field === 'style') return <StyleSwatch name={value} />;
  return null;
}

function SummaryRows({
  state,
  onEdit,
}: {
  state: SummaryState;
  onEdit: (field: EditField) => void;
}) {
  const fields: EditField[] = ['product', 'avatar', 'style', 'tone', 'volume', 'usage', 'exclusivity'];
  return (
    <div>
      <p style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55, margin: '0 0 16px' }}>
        We pre-selected sensible defaults based on your brand kit and past campaigns. Edit any field below, or hit{' '}
        <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Create</strong> to launch.
      </p>
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {fields.map((f, i) => {
          const hasVisual = f === 'product' || f === 'avatar' || f === 'style';
          return (
            <div
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < fields.length - 1 ? '1px solid var(--dark-4)' : 'none',
              }}
            >
              <div style={{ width: 96, fontSize: 12, color: 'var(--dark-60)', flexShrink: 0 }}>
                {FIELD_LABEL[f]}
              </div>
              {hasVisual && <FieldVisual field={f} value={state[f]} />}
              <div style={{ flex: 1, fontSize: 14, color: 'var(--dark-90)', fontWeight: 500 }}>
                {state[f]}
              </div>
              <button
                type="button"
                onClick={() => onEdit(f)}
                aria-label={`Edit ${FIELD_LABEL[f]}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  color: 'var(--dark-80)',
                  cursor: 'pointer',
                }}
              >
                <PenEdit size={12} /> Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldPickerModal({
  field,
  current,
  onPick,
  onBack,
  onClose,
}: {
  field: EditField;
  current: string;
  onPick: (v: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <Modal.Root size="sm" aria-labelledby="field-picker-title" data-testid="campaign-field-picker">
      <Modal.Header
        title={`Edit ${FIELD_LABEL[field].toLowerCase()}`}
        id="field-picker-title"
        onClose={onClose}
        onBack={onBack}
        compact={false}
      />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FIELD_OPTIONS[field].map((opt) => {
            const isSelected = opt === current;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onPick(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--light-100)',
                  border: `1px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-15)'}`,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dark-90)' }} />}
                </span>
                <span style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: isSelected ? 500 : 400 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={onBack}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── TOPBAR ACTION ───────────────────────────────────────────────

function InfluencerContentTopbarAction({ onNew }: { onNew: () => void }) {
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="secondary" size="md" onClick={() => showToast({ message: 'Settings (TODO)' })}>
        Settings
      </Button>
      <Button variant="primary" size="md" frontIcon={Plus} onClick={onNew}>
        New Campaign
      </Button>
    </div>
  );
}

// ─── ROUTE ───────────────────────────────────────────────────────

export function InfluencerContentRoute() {
  return (
    <ModalStack>
      <InfluencerContentRouteInner />
    </ModalStack>
  );
}

function InfluencerContentRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [tab, setTab] = useState<TabKey>('overview');
  const devState = useDevState().getState('/h2/influencer-content');
  if (devState === 'cold') return <H2Layout title="UGC Content"><UgcColdView /></H2Layout>;

  const openSummary = () => {
    openModal(CampaignSummaryModal, {
      onComplete: () => {
        closeModal();
        showToast({ message: 'Campaign launched' });
      },
    });
  };

  return (
    <H2Layout
      topbarRight={
        <>
          <InfluencerContentTopbarAction onNew={openSummary} />
          <GenerateReportButton />
        </>
      }
    >
      <TabBar active={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab onJump={setTab} />}
      {tab === 'content' && <ContentTab />}
    </H2Layout>
  );
}
