import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill, useToast } from '@/staging';
import type { StatusPillTone } from '@/staging';
import Plus from '@/icons/20/Plus';
import Calendar1 from '@/icons/20/Calendar1';
import Filter from '@/icons/20/Filter';
import Grid from '@/icons/20/Grid';
import TableView from '@/icons/20/TableView';
import MoreDots from '@/icons/20/MoreDots';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Upload from '@/icons/20/Upload';
import EyeOpen from '@/icons/20/EyeOpen';
import Trash2 from '@/icons/20/Trash2';
import Settings from '@/icons/20/Settings';
import LineChartUp02 from '@/icons/20/LineChartUp02';
import Home from '@/icons/20/Home';
import Target5 from '@/icons/20/Target5';

/**
 * /h2/content-plan — deep port of Blaze H2 Features/content-plan-prototype.html.
 *
 * Like /h2/multi-change, this is a STANDALONE tool screen with its own
 * full-page chrome (custom 220px sidebar + main area). It does NOT render
 * <H2Layout>; the H2 sidebar/topbar are intentionally absent so the page
 * can present its own Publish/Grow nav structure that mirrors the source.
 *
 * Structure:
 *  - Custom sidebar: Logo / Publish (Content Plan, Calendar, Campaigns) /
 *    Grow (Growth, Analytics) / Strategy / Workspace selector.
 *  - Main: header strip with view toggle (List/Calendar) + date range +
 *    filter + Create button. Below: needs-content banner + post rows OR
 *    inline calendar grid. A separate "Calendar" sub-view (top-level)
 *    renders a fuller month view; "Campaigns" sub-view renders campaign
 *    cards.
 *
 * Modals (vetted Modal): content preview, create content, reschedule,
 * upload, create campaign, campaign details. Strategy and Growth settings
 * modals from the source are dropped (non-core polish).
 */

// ─── DATA ──────────────────────────────────────────────────────────────

type SubView = 'content-plan' | 'calendar' | 'campaigns';
type CPMode = 'list' | 'cal';
type PlatformId = 'ig' | 'fb' | 'li' | 'x';
type Status = 'scheduled' | 'draft' | 'needs-content' | 'published' | 'review';

interface PostData {
  id: number;
  text: string;
  platforms: PlatformId[];
  date: string;
  time: string;
  status: Status;
  campaign: string;
  day: number;
}

interface CampaignData {
  name: string;
  goal: string;
  start: string;
  end: string;
  posts: number;
  progress: number;
  status: 'active' | 'draft' | 'ended';
  platforms: PlatformId[];
}

const PLATFORMS: Record<PlatformId, { color: string; label: string }> = {
  ig: { color: '#E1306C', label: 'Instagram' },
  fb: { color: '#1877F2', label: 'Facebook' },
  li: { color: '#0A66C2', label: 'LinkedIn' },
  x: { color: 'var(--dark-90)', label: 'X' },
};

const POSTS: PostData[] = [
  { id: 1, text: '🚀 Exciting things are happening at Blaze! We\'re launching new features this week.', platforms: ['ig', 'fb'], date: 'Apr 12', time: '9:00 AM', status: 'scheduled', campaign: 'Spring Launch 2025', day: 12 },
  { id: 2, text: 'Behind the scenes: how our team builds content that converts 📸', platforms: ['fb', 'li'], date: 'Apr 12', time: '2:00 PM', status: 'draft', campaign: 'Spring Launch 2025', day: 12 },
  { id: 3, text: '5 tips for growing your social media audience organically in 2025', platforms: ['li'], date: 'Apr 14', time: '10:00 AM', status: 'scheduled', campaign: '', day: 14 },
  { id: 4, text: '', platforms: ['ig', 'fb', 'x'], date: 'Apr 15', time: '11:00 AM', status: 'needs-content', campaign: 'Product Awareness Q2', day: 15 },
  { id: 5, text: 'Customer spotlight: How @brandname grew 40% using Blaze 🔥', platforms: ['ig', 'x'], date: 'Apr 16', time: '9:00 AM', status: 'review', campaign: 'Customer Stories', day: 16 },
  { id: 6, text: '', platforms: ['ig'], date: 'Apr 18', time: '3:00 PM', status: 'needs-content', campaign: '', day: 18 },
  { id: 7, text: 'New product feature drop — thread 🧵 coming Monday. Don\'t miss it.', platforms: ['x', 'li'], date: 'Apr 19', time: '10:00 AM', status: 'scheduled', campaign: 'Spring Launch 2025', day: 19 },
  { id: 8, text: '', platforms: ['fb', 'li'], date: 'Apr 21', time: '1:00 PM', status: 'needs-content', campaign: 'Product Awareness Q2', day: 21 },
  { id: 9, text: 'Happy Monday! Here\'s your weekly dose of marketing inspiration ✨', platforms: ['ig', 'fb'], date: 'Apr 22', time: '8:00 AM', status: 'scheduled', campaign: '', day: 22 },
  { id: 10, text: 'Q2 strategy recap: what worked, what we\'re changing, and what\'s next.', platforms: ['li'], date: 'Apr 25', time: '11:00 AM', status: 'draft', campaign: '', day: 25 },
];

const CAMPAIGNS: CampaignData[] = [
  { name: 'Spring Launch 2025', goal: 'Product Launch', start: 'Apr 1', end: 'Apr 30', posts: 24, progress: 62, status: 'active', platforms: ['ig', 'fb', 'li'] },
  { name: 'Product Awareness Q2', goal: 'Brand Awareness', start: 'Apr 1', end: 'Jun 30', posts: 40, progress: 18, status: 'active', platforms: ['ig', 'fb', 'x', 'li'] },
  { name: 'Customer Stories', goal: 'Engagement', start: 'Mar 15', end: 'May 15', posts: 12, progress: 41, status: 'active', platforms: ['ig', 'li'] },
  { name: 'Q1 Wrap-up', goal: 'Brand Awareness', start: 'Jan 1', end: 'Mar 31', posts: 36, progress: 100, status: 'ended', platforms: ['ig', 'fb', 'li', 'x'] },
  { name: 'Holiday Campaign', goal: 'Engagement', start: 'Dec 1', end: 'Dec 31', posts: 18, progress: 100, status: 'ended', platforms: ['ig', 'fb'] },
  { name: 'Summer Preview', goal: 'Lead Generation', start: 'May 1', end: 'Jul 31', posts: 0, progress: 0, status: 'draft', platforms: ['ig', 'fb'] },
];

const STATUS_META: Record<Status, { label: string; tone: StatusPillTone }> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  draft: { label: 'Draft', tone: 'neutral' },
  'needs-content': { label: 'Needs Content', tone: 'warning' },
  published: { label: 'Published', tone: 'success' },
  review: { label: 'In Review', tone: 'warning' },
};

// ─── ROUTE ─────────────────────────────────────────────────────────────

export function ContentPlanRoute() {
  return (
    <ModalStack>
      <ContentPlanRouteInner />
    </ModalStack>
  );
}

function ContentPlanRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();

  const [subView, setSubView] = useState<SubView>('content-plan');
  const [cpMode, setCpMode] = useState<CPMode>('list');

  // ── Modal openers ──
  const openPreview = (post?: PostData) => {
    openModal(ContentPreviewModal, { post });
  };

  const openCreate = () => {
    openModal(CreateContentModal, {
      onSchedule: () => {
        closeModal();
        showToast({ message: 'Post scheduled for Apr 15, 9:00 AM' });
      },
    });
  };

  const openReschedule = () => {
    openModal(RescheduleModal, {
      onConfirm: () => {
        closeModal();
        showToast({ message: 'Post rescheduled' });
      },
    });
  };

  const openUpload = () => {
    openModal(UploadContentModal, {
      onUpload: () => {
        closeModal();
        showToast({ message: 'Media uploaded — assigning to 3 posts' });
      },
    });
  };

  const openCreateCampaign = () => {
    openModal(CreateCampaignModal, {
      onCreate: (name: string) => {
        closeModal();
        showToast({ message: `Campaign "${name}" created` });
      },
    });
  };

  const openCampaignDetails = (c: CampaignData) => {
    openModal(CampaignDetailsModal, {
      campaign: c,
      onPreview: () => {
        closeModal();
        openPreview();
      },
      onAddPost: () => {
        closeModal();
        openCreate();
      },
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: '#f0f0f0',
        color: 'var(--dark-90)',
        overflow: 'hidden',
        fontFamily: "'Sohne', sans-serif",
      }}
    >
      <Sidebar
        active={subView}
        onNavigate={(v) => setSubView(v)}
        onStrategyClick={() => showToast({ message: 'Strategy settings coming soon' })}
        onGrowthClick={() => showToast({ message: 'Growth settings coming soon' })}
      />

      <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {subView === 'content-plan' && (
          <ContentPlanView
            mode={cpMode}
            onModeChange={setCpMode}
            onPreview={openPreview}
            onCreate={openCreate}
            onUpload={openUpload}
            onReschedule={openReschedule}
          />
        )}

        {subView === 'calendar' && (
          <CalendarView onCreate={openCreate} onPreview={openPreview} />
        )}

        {subView === 'campaigns' && (
          <CampaignsView onCreate={openCreateCampaign} onOpen={openCampaignDetails} />
        )}
      </main>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────

function Sidebar({
  active,
  onNavigate,
  onStrategyClick,
  onGrowthClick,
}: {
  active: SubView;
  onNavigate: (v: SubView) => void;
  onStrategyClick: () => void;
  onGrowthClick: () => void;
}) {
  return (
    <nav
      style={{
        width: 220,
        minWidth: 220,
        height: '100vh',
        background: 'var(--light-100)',
        borderRight: '1px solid var(--dark-8)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 8px',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 8px 12px',
          borderBottom: '1px solid var(--dark-4)',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--dark-90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" width={16} height={16}>
            <path d="M3 4h10M3 8h7M3 12h5" stroke="var(--light-100)" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: 0.15 }}>
          Blaze
        </span>
      </div>

      {/* Publish section */}
      <SidebarSectionLabel>Publish</SidebarSectionLabel>
      <SidebarItem
        icon={<Grid />}
        label="Content Plan"
        active={active === 'content-plan'}
        badge={3}
        onClick={() => onNavigate('content-plan')}
      />
      <SidebarItem
        icon={<Calendar1 />}
        label="Calendar"
        active={active === 'calendar'}
        onClick={() => onNavigate('calendar')}
      />
      <SidebarItem
        icon={<Target5 />}
        label="Campaigns"
        active={active === 'campaigns'}
        onClick={() => onNavigate('campaigns')}
      />

      {/* Grow section */}
      <div style={{ marginTop: 4 }}>
        <SidebarSectionLabel>Grow</SidebarSectionLabel>
        <SidebarItem icon={<LineChartUp02 />} label="Growth" onClick={onGrowthClick} />
        <SidebarItem icon={<Home />} label="Analytics" />
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, background: 'var(--dark-4)', margin: '8px 0' }} />

      <SidebarItem icon={<Settings />} label="Strategy" onClick={onStrategyClick} />

      <div style={{ height: 1, background: 'var(--dark-4)', margin: '8px 0' }} />

      {/* Workspace row */}
      <div
        role="button"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 8,
          borderRadius: 7,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #7C6FD4 0%, #5B4EC8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--light-100)',
            flexShrink: 0,
          }}
        >
          BL
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-80)' }}>Blaze Official</div>
          <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>Pro Plan</div>
        </div>
      </div>
    </nav>
  );
}

function SidebarSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 400,
        color: 'var(--dark-40)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        padding: '8px 8px 4px',
      }}
    >
      {children}
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 8px',
        borderRadius: 7,
        cursor: 'pointer',
        color: active ? 'var(--dark-90)' : 'var(--dark-60)',
        background: active ? 'var(--dark-8)' : 'transparent',
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        letterSpacing: 0.14,
        lineHeight: 1.3,
        userSelect: 'none',
        marginBottom: 2,
      }}
    >
      <span style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && (
        <span
          style={{
            background: 'var(--dark-90)',
            color: 'var(--light-100)',
            fontSize: 12,
            fontWeight: 500,
            padding: '1px 6px',
            borderRadius: 20,
            minWidth: 18,
            textAlign: 'center',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── CONTENT PLAN VIEW ─────────────────────────────────────────────────

function ContentPlanView({
  mode,
  onModeChange,
  onPreview,
  onCreate,
  onUpload,
  onReschedule,
}: {
  mode: CPMode;
  onModeChange: (m: CPMode) => void;
  onPreview: (post: PostData) => void;
  onCreate: () => void;
  onUpload: () => void;
  onReschedule: () => void;
}) {
  return (
    <>
      <Header
        title="Content Plan"
        center={
          <ViewToggle
            mode={mode}
            onChange={onModeChange}
            options={[
              { id: 'list', label: 'List', icon: <TableView /> },
              { id: 'cal', label: 'Calendar', icon: <Calendar1 /> },
            ]}
          />
        }
        right={
          <>
            <SecondaryToolbarBtn icon={<Calendar1 />}>Apr 1 – Apr 30, 2025</SecondaryToolbarBtn>
            <SecondaryToolbarBtn icon={<Filter />}>Filter</SecondaryToolbarBtn>
            <Button variant="primary" size="md" frontIcon={Plus} onPress={onCreate}>
              Create
            </Button>
          </>
        }
      />

      {mode === 'list' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: 0, background: '#f8f8f8' }}>
          <NeedsContentBanner onUpload={onUpload} />

          <SectionHeader label="Upcoming" count={POSTS.length} />

          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {POSTS.map((p) => (
              <PostRow
                key={p.id}
                post={p}
                onPreview={() => onPreview(p)}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#f8f8f8' }}>
          <CalendarGrid onPreview={onPreview} />
        </div>
      )}
    </>
  );
}

// ─── CALENDAR (FULL) VIEW ──────────────────────────────────────────────

function CalendarView({
  onCreate,
  onPreview,
}: {
  onCreate: () => void;
  onPreview: (post: PostData) => void;
}) {
  return (
    <>
      <Header
        title="Calendar"
        right={
          <>
            <button type="button" style={navBtnStyle} aria-label="Previous month">
              <svg viewBox="0 0 14 14" fill="none" width={14} height={14}>
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>April 2025</span>
            <button type="button" style={navBtnStyle} aria-label="Next month">
              <svg viewBox="0 0 14 14" fill="none" width={14} height={14}>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Button variant="primary" size="md" frontIcon={Plus} onPress={onCreate}>
              Create
            </Button>
          </>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#f8f8f8' }}>
        <CalendarGrid onPreview={onPreview} />
      </div>
    </>
  );
}

const navBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 7,
  border: '1px solid var(--dark-8)',
  background: 'var(--light-100)',
  cursor: 'pointer',
  color: 'var(--dark-60)',
  padding: 0,
};

// ─── CAMPAIGNS VIEW ────────────────────────────────────────────────────

function CampaignsView({
  onCreate,
  onOpen,
}: {
  onCreate: () => void;
  onOpen: (c: CampaignData) => void;
}) {
  return (
    <>
      <Header
        title="Campaigns"
        right={
          <Button variant="primary" size="md" frontIcon={Plus} onPress={onCreate}>
            Create Campaign
          </Button>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f8f8f8' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {CAMPAIGNS.map((c) => (
            <CampaignCard key={c.name} campaign={c} onOpen={() => onOpen(c)} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────

function Header({
  title,
  center,
  right,
}: {
  title: string;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 24px',
        borderBottom: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: 0.16 }}>
        {title}
      </span>
      <div style={{ flex: 1 }} />
      {center}
      {right}
    </header>
  );
}

// ─── VIEW TOGGLE ───────────────────────────────────────────────────────

function ViewToggle<T extends string>({
  mode,
  onChange,
  options,
}: {
  mode: T;
  onChange: (m: T) => void;
  options: { id: T; label: string; icon: ReactNode }[];
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--dark-4)',
        borderRadius: 8,
        padding: 3,
      }}
    >
      {options.map((o) => {
        const active = o.id === mode;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              color: active ? 'var(--dark-90)' : 'var(--dark-60)',
              fontFamily: 'inherit',
              border: 'none',
              background: active ? 'var(--light-100)' : 'transparent',
              fontWeight: active ? 500 : 400,
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{o.icon}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SecondaryToolbarBtn({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        cursor: 'pointer',
        fontSize: 14,
        color: 'var(--dark-80)',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ width: 14, height: 14, color: 'var(--dark-60)', display: 'inline-flex' }}>{icon}</span>
      {children}
    </button>
  );
}

// ─── NEEDS-CONTENT BANNER ──────────────────────────────────────────────

function NeedsContentBanner({ onUpload }: { onUpload: () => void }) {
  return (
    <div
      style={{
        margin: '16px 24px 0',
        background: '#FFF8EC',
        border: '1px solid #F5D88A',
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <span style={{ color: '#C97A00', flexShrink: 0, marginTop: 1, display: 'inline-flex' }}>
        <AlertTriangle />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#7A4A00' }}>3 posts need content</div>
        <div style={{ fontSize: 12, color: '#9A6200', marginTop: 2, lineHeight: 1.4 }}>
          These posts are scheduled but missing media or copy. Add content to keep your plan on track.
        </div>
      </div>
      <Button variant="primary" size="sm" onPress={onUpload}>
        Upload Content
      </Button>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '16px 24px 8px',
        fontSize: 12,
        fontWeight: 400,
        color: 'var(--dark-40)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {label}
      <span
        style={{
          background: 'var(--dark-8)',
          color: 'var(--dark-60)',
          fontSize: 12,
          borderRadius: 20,
          padding: '1px 6px',
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── POST ROW ──────────────────────────────────────────────────────────

function PostRow({
  post,
  onPreview,
  onReschedule,
}: {
  post: PostData;
  onPreview: () => void;
  onReschedule: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const needsContent = post.status === 'needs-content';
  const meta = STATUS_META[post.status];

  return (
    <div
      onClick={onPreview}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: needsContent ? '#FFFDF5' : 'var(--light-100)',
        border: needsContent ? '1px solid #F5D88A' : '1px solid var(--dark-4)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Thumb needsContent={needsContent} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div
          style={{
            fontSize: 14,
            color: 'var(--dark-80)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {post.text || (
            <span style={{ color: 'var(--dark-40)', fontStyle: 'italic' }}>
              No caption yet — add content
            </span>
          )}
        </div>
        {post.campaign && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                color: 'var(--dark-40)',
                background: 'var(--dark-4)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {post.campaign}
            </span>
          </div>
        )}
      </div>

      <PlatformBadgeStack platforms={post.platforms} />

      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 14, color: 'var(--dark-80)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          {post.date}
        </div>
        <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>{post.time}</div>
      </div>

      <StatusPill tone={meta.tone} size="sm" style={{ flexShrink: 0 }}>
        {meta.label}
      </StatusPill>

      <div style={{ flexShrink: 0, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="More actions"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--dark-40)',
            padding: 0,
          }}
        >
          <MoreDots />
        </button>
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 4px)',
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              padding: 4,
              zIndex: 100,
              minWidth: 160,
            }}
          >
            <DropdownItem
              icon={<EyeOpen />}
              label="View / Edit"
              onClick={() => {
                setMenuOpen(false);
                onPreview();
              }}
            />
            <DropdownItem
              icon={<Calendar1 />}
              label="Reschedule"
              onClick={() => {
                setMenuOpen(false);
                onReschedule();
              }}
            />
            <div style={{ height: 1, background: 'var(--dark-4)', margin: '4px 0' }} />
            <DropdownItem
              icon={<Trash2 />}
              label="Delete"
              danger
              onClick={() => setMenuOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 7,
        fontSize: 14,
        color: danger ? 'var(--red-90)' : 'var(--dark-80)',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 14, height: 14, color: danger ? 'var(--red-90)' : 'var(--dark-60)', display: 'inline-flex' }}>
        {icon}
      </span>
      {label}
    </div>
  );
}

function Thumb({ needsContent }: { needsContent: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        background: 'var(--dark-8)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--dark-40)',
      }}
    >
      {needsContent ? (
        <svg viewBox="0 0 20 20" fill="none" width={20} height={20}>
          <path d="M10 7v4M10 13v.01" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M8.72 3.3L2.19 13.5a1.5 1.5 0 001.29 2.25h13.04a1.5 1.5 0 001.29-2.25L11.28 3.3a1.5 1.5 0 00-2.56 0z" stroke="currentColor" strokeWidth={1.3} />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" width={20} height={20}>
          <rect x={3} y={3} width={14} height={14} rx={3} stroke="currentColor" strokeWidth={1.3} />
          <circle cx={8} cy={8} r={2} stroke="currentColor" strokeWidth={1.2} />
          <path d="M3 14l5-5 3 3 3-3 3 3" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function PlatformBadgeStack({ platforms }: { platforms: PlatformId[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {platforms.map((p, i) => (
        <div
          key={p}
          title={PLATFORMS[p].label}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: PLATFORMS[p].color,
            border: '2px solid var(--light-100)',
            marginLeft: i === 0 ? 0 : -4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--light-100)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {p === 'ig' ? 'I' : p === 'fb' ? 'f' : p === 'li' ? 'in' : 'X'}
        </div>
      ))}
    </div>
  );
}

// ─── CALENDAR GRID ─────────────────────────────────────────────────────

function CalendarGrid({ onPreview }: { onPreview: (post: PostData) => void }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDay = 2; // April 2025 starts on Tuesday
  const totalDays = 30;
  const totalCells = Math.ceil((startDay + totalDays) / 7) * 7;

  const postsByDay = useMemo(() => {
    const map: Record<number, PostData[]> = {};
    POSTS.forEach((p) => {
      if (!map[p.day]) map[p.day] = [];
      map[p.day].push(p);
    });
    return map;
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        background: 'var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {days.map((d) => (
        <div
          key={d}
          style={{
            background: 'var(--light-100)',
            padding: '6px 12px',
            fontSize: 12,
            color: 'var(--dark-60)',
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          {d}
        </div>
      ))}
      {Array.from({ length: totalCells }).map((_, i) => {
        const dayNum = i - startDay + 1;
        const otherMonth = dayNum < 1 || dayNum > totalDays;
        const today = dayNum === 12;
        const dayLabel = otherMonth ? (dayNum < 1 ? 30 + dayNum : dayNum - 30) : dayNum;
        const dayPosts = !otherMonth ? postsByDay[dayNum] : undefined;
        return (
          <div
            key={i}
            style={{
              background: otherMonth ? '#FAFAFA' : 'var(--light-100)',
              minHeight: 100,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: 'var(--dark-60)',
                marginBottom: 2,
                ...(today
                  ? {
                      background: 'var(--dark-90)',
                      color: 'var(--light-100)',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  : {}),
              }}
            >
              {dayLabel}
            </div>
            {dayPosts?.map((post) => (
              <div
                key={post.id}
                onClick={() => onPreview(post)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 6px',
                  borderRadius: 5,
                  background: 'var(--dark-4)',
                  border: '1px solid var(--dark-8)',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--dark-80)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: PLATFORMS[post.platforms[0]]?.color ?? 'var(--dark-40)',
                    flexShrink: 0,
                  }}
                />
                {post.text ? `${post.text.substring(0, 22)}…` : 'No caption'}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── CAMPAIGN CARD ─────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  onOpen,
}: {
  campaign: CampaignData;
  onOpen: () => void;
}) {
  const statusMap: Record<CampaignData['status'], { label: string; tone: StatusPillTone }> = {
    active: { label: 'Active', tone: 'success' },
    draft: { label: 'Draft', tone: 'neutral' },
    ended: { label: 'Ended', tone: 'neutral' },
  };
  const s = statusMap[campaign.status];

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.3 }}>
            {campaign.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-40)', marginTop: 2 }}>
            {campaign.start} – {campaign.end}
          </div>
        </div>
        <StatusPill tone={s.tone} size="sm" style={{ flexShrink: 0 }}>
          {s.label}
        </StatusPill>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            height: 4,
            background: 'var(--dark-8)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              background: 'var(--dark-90)',
              width: `${campaign.progress}%`,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dark-40)' }}>
          <span>{campaign.progress}% complete</span>
          <span>{campaign.posts} posts</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', marginLeft: -3 }}>
          {campaign.platforms.map((p, i) => (
            <div
              key={p}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: '2px solid var(--light-100)',
                marginLeft: i === 0 ? 0 : -3,
                background: PLATFORMS[p].color,
                color: 'var(--light-100)',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {p === 'ig' ? 'I' : p === 'fb' ? 'f' : p === 'li' ? 'in' : 'X'}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--dark-40)', marginLeft: 'auto' }}>{campaign.goal}</div>
      </div>
    </div>
  );
}

// ─── MODALS ────────────────────────────────────────────────────────────

function ContentPreviewModal({
  close,
  post,
}: StackModalProps & { post?: PostData }) {
  const [tab, setTab] = useState<'preview' | 'edit' | 'analytics'>('preview');
  const text =
    post?.text ||
    "🚀 Exciting things are happening at Blaze! We're thrilled to announce our new content features that will transform how you manage your social media presence. Stay tuned for more updates! #Blaze #ContentCreation #SocialMedia";

  return (
    <Modal.Root size="lg" aria-labelledby="cp-preview-title">
      <Modal.Header title="Content Preview" id="cp-preview-title" onClose={close} compact={false} />

      <ModalTabs
        tabs={[
          { id: 'preview', label: 'Preview' },
          { id: 'edit', label: 'Edit' },
          { id: 'analytics', label: 'Analytics' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Modal.Content compact={false}>
        {tab === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PlatformChips selected={['ig']} />
            <div
              style={{
                border: '1px solid var(--dark-8)',
                borderRadius: 12,
                overflow: 'hidden',
                background: 'var(--dark-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#c95b8a,#a8359a)',
                    color: 'var(--light-100)',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  EJ
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Emma Johnson</div>
                  <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>@emmajohnson · Instagram</div>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: 'var(--dark-8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--dark-40)',
                }}
              >
                <svg viewBox="0 0 32 32" fill="none" width={32} height={32}>
                  <rect x={4} y={4} width={24} height={24} rx={4} stroke="currentColor" strokeWidth={1.5} />
                  <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.3} />
                  <path d="M4 22l7-7 5 5 4-4 8 8" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ padding: 12, fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.5 }}>{text}</div>
            </div>
          </div>
        )}

        {tab === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormGroup label="Caption">
              <textarea
                defaultValue={text}
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
              />
            </FormGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormGroup label="Date">
                <input type="date" defaultValue="2025-04-12" style={inputStyle} />
              </FormGroup>
              <FormGroup label="Time">
                <input type="time" defaultValue="09:00" style={inputStyle} />
              </FormGroup>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <MetricCard value="4,821" label="Impressions" />
            <MetricCard value="312" label="Engagements" />
            <MetricCard value="6.5%" label="Eng. Rate" />
            <MetricCard value="87" label="Likes" />
            <MetricCard value="23" label="Comments" />
            <MetricCard value="14" label="Shares" />
          </div>
        )}
      </Modal.Content>

      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Save Changes
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function CreateContentModal({
  close,
  onSchedule,
}: StackModalProps & { onSchedule: () => void }) {
  const [selected, setSelected] = useState<PlatformId[]>(['ig']);

  const toggle = (p: PlatformId) =>
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <Modal.Root size="md" aria-labelledby="cp-create-title">
      <Modal.Header title="Create Content" id="cp-create-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormGroup label="Platforms">
            <PlatformChips selected={selected} onToggle={toggle} />
          </FormGroup>
          <FormGroup label="Caption">
            <textarea
              placeholder="Write your post caption…"
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
            />
          </FormGroup>
          <FormGroup label="Media">
            <div
              style={{
                border: '2px dashed var(--dark-15)',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                textAlign: 'center',
                cursor: 'pointer',
                color: 'var(--dark-40)',
              }}
            >
              <svg viewBox="0 0 32 32" fill="none" width={32} height={32}>
                <rect x={4} y={4} width={24} height={24} rx={4} stroke="currentColor" strokeWidth={1.5} />
                <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.3} />
                <path d="M4 22l7-7 5 5 4-4 8 8" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-80)' }}>Add Media</div>
              <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>Click to select from library or upload new</div>
            </div>
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Date">
              <input type="date" defaultValue="2025-04-15" style={inputStyle} />
            </FormGroup>
            <FormGroup label="Time">
              <input type="time" defaultValue="09:00" style={inputStyle} />
            </FormGroup>
          </div>
          <FormGroup label="Campaign (optional)">
            <select style={inputStyle} defaultValue="">
              <option value="">No campaign</option>
              <option>Spring Launch 2025</option>
              <option>Product Awareness Q2</option>
              <option>Customer Stories</option>
            </select>
          </FormGroup>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={onSchedule}>
            Schedule Post
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function RescheduleModal({ close, onConfirm }: StackModalProps & { onConfirm: () => void }) {
  return (
    <Modal.Root size="sm" aria-labelledby="cp-reschedule-title">
      <Modal.Header title="Reschedule Post" id="cp-reschedule-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="New Date">
              <input type="date" defaultValue="2025-04-18" style={inputStyle} />
            </FormGroup>
            <FormGroup label="New Time">
              <input type="time" defaultValue="10:00" style={inputStyle} />
            </FormGroup>
          </div>
          <FormGroup label="Affected Accounts">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <AccountRow color="linear-gradient(135deg,#c95b8a,#a8359a)" name="Emma Johnson" channel="Instagram · @emmajohnson" />
              <AccountRow color="linear-gradient(135deg,#7BAEE8,#5A8FD4)" name="Emma Johnson" channel="Facebook · Emma Johnson" />
            </div>
          </FormGroup>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={onConfirm}>
            Confirm Reschedule
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function UploadContentModal({ close, onUpload }: StackModalProps & { onUpload: () => void }) {
  return (
    <Modal.Root size="md" aria-labelledby="cp-upload-title">
      <Modal.Header title="Upload Content" id="cp-upload-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#FFF8EC',
              border: '1px solid #F5D88A',
              borderRadius: 10,
              padding: '14px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: '#C97A00', flexShrink: 0, marginTop: 1, display: 'inline-flex' }}>
              <AlertTriangle />
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#7A4A00' }}>3 posts are missing media</div>
              <div style={{ fontSize: 14, color: '#9A6200', lineHeight: 1.4, marginTop: 2 }}>
                Upload images or videos for the posts listed below to complete your content plan.
              </div>
            </div>
          </div>
          <div
            style={{
              border: '2px dashed var(--dark-15)',
              borderRadius: 12,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--dark-40)',
            }}
          >
            <Upload />
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-80)' }}>Drag & drop your media here</div>
            <div style={{ fontSize: 12, color: 'var(--dark-40)' }}>PNG, JPG, GIF, MP4 · Max 50MB per file</div>
            <Button variant="secondary" size="sm">
              Browse Files
            </Button>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={onUpload}>
            Upload &amp; Assign
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function CreateCampaignModal({
  close,
  onCreate,
}: StackModalProps & { onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<PlatformId[]>(['ig', 'fb']);

  const toggle = (p: PlatformId) =>
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  return (
    <Modal.Root size="md" aria-labelledby="cp-create-camp-title">
      <Modal.Header title="Create Campaign" id="cp-create-camp-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormGroup label="Campaign Name">
            <input
              type="text"
              placeholder="e.g. Spring Launch 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </FormGroup>
          <FormGroup label="Goal">
            <select style={inputStyle} defaultValue="Brand Awareness">
              <option>Brand Awareness</option>
              <option>Lead Generation</option>
              <option>Engagement</option>
              <option>Product Launch</option>
              <option>Community Growth</option>
            </select>
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Start Date">
              <input type="date" defaultValue="2025-04-01" style={inputStyle} />
            </FormGroup>
            <FormGroup label="End Date">
              <input type="date" defaultValue="2025-04-30" style={inputStyle} />
            </FormGroup>
          </div>
          <FormGroup label="Channels">
            <PlatformChips selected={selected} onToggle={toggle} />
          </FormGroup>
        </div>
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
            onPress={() => onCreate(name || 'Untitled Campaign')}
          >
            Create Campaign
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function CampaignDetailsModal({
  close,
  campaign,
  onPreview,
  onAddPost,
}: StackModalProps & {
  campaign: CampaignData;
  onPreview: () => void;
  onAddPost: () => void;
}) {
  return (
    <Modal.Root size="lg" aria-labelledby="cp-campaign-details-title">
      <Modal.Header title={campaign.name} id="cp-campaign-details-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <MetricCard value={String(campaign.posts)} label="Total Posts" />
            <MetricCard value={String(Math.round(campaign.posts * 0.75))} label="Scheduled" />
            <MetricCard value={String(Math.round(campaign.posts * 0.25))} label="Published" />
            <MetricCard value="48.2K" label="Impressions" />
            <MetricCard value="3.1K" label="Engagements" />
            <MetricCard value="6.4%" label="Eng. Rate" />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--dark-60)',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Upcoming Posts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <UpcomingRow
                title="Product spotlight — Instagram"
                meta="Apr 12, 2025 · 9:00 AM"
                statusLabel="Scheduled"
                statusBg="#E8F5E9"
                statusColor="#2E7D32"
                onClick={onPreview}
              />
              <UpcomingRow
                title="Behind the scenes — Facebook"
                meta="Apr 14, 2025 · 2:00 PM"
                statusLabel="Draft"
                statusBg="var(--dark-8)"
                statusColor="var(--dark-60)"
                onClick={onPreview}
              />
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Close
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={onAddPost}>
            Add Post
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ─── MODAL HELPERS ─────────────────────────────────────────────────────

function ModalTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid var(--dark-8)',
        flexShrink: 0,
        padding: '0 24px',
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: '12px 16px',
              fontSize: 14,
              color: isActive ? 'var(--dark-90)' : 'var(--dark-60)',
              cursor: 'pointer',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: isActive ? '2px solid var(--dark-90)' : '2px solid transparent',
              marginBottom: -1,
              fontFamily: 'inherit',
              background: 'transparent',
              fontWeight: isActive ? 500 : 400,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', letterSpacing: 0.12 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid var(--dark-15)',
  fontFamily: 'inherit',
  fontSize: 14,
  color: 'var(--dark-90)',
  outline: 'none',
  background: 'var(--light-100)',
  width: '100%',
};

function PlatformChips({
  selected,
  onToggle,
}: {
  selected: PlatformId[];
  onToggle?: (p: PlatformId) => void;
}) {
  const all: PlatformId[] = ['ig', 'fb', 'li', 'x'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {all.map((p) => {
        const active = selected.includes(p);
        return (
          <div
            key={p}
            role={onToggle ? 'button' : undefined}
            tabIndex={onToggle ? 0 : undefined}
            onClick={() => onToggle?.(p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 8,
              border: active ? '1px solid var(--dark-40)' : '1px solid var(--dark-8)',
              background: active ? 'var(--dark-4)' : 'transparent',
              cursor: onToggle ? 'pointer' : 'default',
              fontSize: 14,
              color: active ? 'var(--dark-90)' : 'var(--dark-80)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLATFORMS[p].color }} />
            {PLATFORMS[p].label}
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: 'var(--dark-2)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)' }}>{value}</div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--dark-40)',
          marginTop: 2,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function AccountRow({
  color,
  name,
  channel,
}: {
  color: string;
  name: string;
  channel: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: color,
          color: 'var(--light-100)',
          fontSize: 12,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        EJ
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{channel}</div>
      </div>
    </div>
  );
}

function UpcomingRow({
  title,
  meta,
  statusLabel,
  statusBg,
  statusColor,
  onClick,
}: {
  title: string;
  meta: string;
  statusLabel: string;
  statusBg: string;
  statusColor: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          background: 'var(--dark-8)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dark-40)',
        }}
      >
        <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
          <rect x={3} y={3} width={14} height={14} rx={3} stroke="currentColor" strokeWidth={1.3} />
          <circle cx={8} cy={8} r={2} stroke="currentColor" strokeWidth={1.2} />
          <path d="M3 14l5-5 3 3 3-3 3 3" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{meta}</div>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: 20,
          background: statusBg,
          color: statusColor,
          flexShrink: 0,
        }}
      >
        {statusLabel}
      </span>
    </div>
  );
}
