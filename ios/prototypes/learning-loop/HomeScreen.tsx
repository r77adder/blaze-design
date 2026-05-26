import type { LLDataState } from './index';
import { ContentAreaButton, ContentPill, CampaignPill } from '@ios/components';
import arrowRightIcon from '@ios/icons/arrow-right.svg';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';
import plusIcon from '@ios/icons/plus-01.svg';
import creditsIcon from '@ios/icons/credits.svg';
import checkIcon from '@ios/icons/check.svg';
import videoIcon from '@ios/icons/video-on.svg';
import fileEditIcon from '@ios/icons/file-edit2.svg';
import paidAdsIcon from '@ios/icons/paid-ads.svg';
import barGroupIcon from '@ios/icons/bar-group-03.svg';

const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
  dark40: 'var(--ios-dark-40)',
  dark25: 'var(--ios-dark-25)',
  dark8:  'var(--ios-dark-8)',
  dark4:  'var(--ios-dark-4)',
  dark3:  'rgba(0,0,0,0.03)',
  dark2:  'var(--ios-dark-2)',
  green:  'var(--ios-green)',
  gray:   '#7383a2',
};

// Durable placeholder imagery (Figma uses brand assets that expire).
const POST_1 = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80';
const POST_2 = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80';
const POST_3 = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80';
const CAMP_1 = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&auto=format&fit=crop&q=80';
const CAMP_2 = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&auto=format&fit=crop&q=80';
const CAMP_3 = 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300&auto=format&fit=crop&q=80';
const AVATAR  = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

// ── Section heading (22px H2) ──────────────────────────────────────────────────
function SectionHeading({ title, onAdd }: { title: string; onAdd?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>{title}</span>
      {onAdd && (
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', WebkitAppearance: 'none' }}>
          <img src={plusIcon} alt="Add" style={{ width: 24, height: 24, opacity: 0.6 }} />
        </button>
      )}
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────────
function HomeHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 20px 12px',
      background: 'rgba(0,0,0,0.02)',
      borderBottom: `1px solid ${T.dark4}`,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 37, overflow: 'hidden', background: '#45164a' }}>
            <img src={AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Radiant Health
        </span>
      </div>
      {/* Glass credits button */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: 6, borderRadius: 99,
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        boxShadow: '0 0 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32, padding: '0 6px' }}>
          <img src={creditsIcon} alt="" style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 400, color: T.dark90, letterSpacing: '0.28px' }}>96</span>
        </div>
      </div>
    </div>
  );
}

// ── Up next ──────────────────────────────────────────────────────────────────────
function UpNext() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Up next" />
      <div style={{
        borderRadius: 12, background: T.light, border: `1px solid ${T.dark8}`,
        padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6, flexShrink: 0,
          background: 'linear-gradient(180deg, #20a14f 0%, #1fcf5f 100%)',
          border: `1px solid ${T.dark4}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={checkIcon} alt="" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 500, color: T.dark90, lineHeight: 1.4 }}>
            Approve your next campaign
          </span>
          <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, lineHeight: 1.5, letterSpacing: '0.28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Spring Sale 2026: The best of spring sale
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark40, letterSpacing: '0.12px' }}>Apr 19 – May 1</span>
            <span style={{ fontFamily: T.font, fontSize: 10, color: T.dark25 }}>•</span>
            <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark40, letterSpacing: '0.24px' }}>16 posts to review</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upcoming posts ────────────────────────────────────────────────────────────────
const POSTS: Array<{ img: string; status: 'approved' | 'review' }> = [
  { img: POST_1, status: 'approved' },
  { img: POST_2, status: 'review' },
  { img: POST_3, status: 'review' },
];

function UpcomingPosts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Upcoming posts" onAdd />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
        {POSTS.map((p, i) => (
          <div key={i} style={{ flexShrink: 0, width: 150, height: 201, borderRadius: 8, overflow: 'hidden', position: 'relative', border: `1px solid ${T.dark4}`, boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
            <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
              <ContentPill variant={p.status} />
            </div>
          </div>
        ))}
      </div>
      <ContentAreaButton type="secondary" size="m" label="See All Content" rightIcon={arrowRightIcon} fullWidth />
    </div>
  );
}

// ── Campaigns ──────────────────────────────────────────────────────────────────────
const CAMPAIGNS: Array<{ img: string; status: 'posting' | 'approved' | 'pre-gen'; label?: string }> = [
  { img: CAMP_1, status: 'posting' },
  { img: CAMP_2, status: 'approved' },
  { img: CAMP_3, status: 'pre-gen' },
];

function Campaigns() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Campaigns" onAdd />
      {CAMPAIGNS.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 17, width: '100%', cursor: 'pointer' }}>
          <img src={c.img} alt="" style={{ width: 104, height: 125, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, height: 125, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark90, letterSpacing: '0.12px', lineHeight: 1.4 }}>
              Fri, Feb 8<span style={{ color: T.dark25 }}> – </span>Mon, Feb 12
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: T.font, fontSize: 16, color: T.dark90, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                Savor The Origins: Craft Coffee Revealed
              </span>
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px', lineHeight: 1.4 }}>☕ Lifestyle Content</span>
            </div>
            <div><CampaignPill variant={c.status} label={c.label} /></div>
          </div>
          <img src={chevronRightIcon} alt="" style={{ width: 12, height: 12, opacity: 0.3, flexShrink: 0 }} />
        </div>
      ))}
      <ContentAreaButton type="secondary" size="m" label="See All Campaigns" rightIcon={arrowRightIcon} fullWidth />
    </div>
  );
}

// ── Last 7 days ──────────────────────────────────────────────────────────────────
function TrendArrow({ dir }: { dir: 'up' | 'down' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: dir === 'down' ? 'scaleY(-1)' : 'none' }}>
      <path d="M2.5 7.5L7.5 2.5M7.5 2.5H3.5M7.5 2.5V6.5" stroke={dir === 'up' ? '#20a14f' : '#7383a2'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Metric = { value: string; label: string; trend?: string; dir?: 'up' | 'down'; noChange?: boolean };
const METRICS: Metric[] = [
  { value: '2,433', label: 'Impressions',     trend: '4%', dir: 'up' },
  { value: '4.2%',  label: 'Engagement rate', trend: '2%', dir: 'down' },
  { value: '1,197', label: 'Followers',       noChange: true },
  { value: '8',     label: 'Posts published' },
];

export function MetricsGrid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
      {METRICS.map(m => (
        <div key={m.label} style={{
          width: 177, flex: '1 0 auto', position: 'relative', overflow: 'hidden',
          background: T.light, border: `1px solid ${T.dark8}`, borderRadius: 20,
          padding: '32px 16px 16px',
        }}>
          <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, lineHeight: 1.2 }}>{m.value}</div>
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>{m.label}</div>
          {m.trend && (
            <div style={{ position: 'absolute', top: 9, right: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: T.font, fontSize: 14, color: m.dir === 'up' ? T.green : T.gray, letterSpacing: '0.14px' }}>{m.trend}</span>
              <TrendArrow dir={m.dir!} />
            </div>
          )}
          {m.noChange && (
            <div style={{ position: 'absolute', top: 9, right: 8, fontFamily: T.font, fontSize: 12, color: T.gray, letterSpacing: '0.12px', lineHeight: 1.3 }}>No change</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Last7Days() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Last 7 days" />
      <MetricsGrid />
      <ContentAreaButton type="secondary" size="m" label="View Insights" rightIcon={arrowRightIcon} fullWidth />
    </div>
  );
}

// ── Pills (Learnings applied) ──────────────────────────────────────────────────────
function NeutralPill({ label }: { label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69,
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.08)), linear-gradient(#fff,#fff)',
      border: `1px solid ${T.dark4}`,
    }}>
      <span style={{ fontFamily: T.font, fontSize: 12, color: T.dark60, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>{label}</span>
    </div>
  );
}

function AppliedPill() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4.69,
      background: 'rgba(32,161,79,0.05)', border: '1px solid rgba(32,161,79,0.1)',
    }}>
      <img src={checkIcon} alt="" style={{ width: 12, height: 12, filter: 'invert(45%) sepia(64%) saturate(560%) hue-rotate(93deg) brightness(95%) contrast(90%)' }} />
      <span style={{ fontFamily: T.font, fontSize: 12, color: T.green, letterSpacing: '0.12px', lineHeight: 1.4, padding: '0 4px 1px' }}>Applied</span>
    </div>
  );
}

function BulletLine() {
  return (
    <div style={{ width: 6, alignSelf: 'stretch', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 2, borderRadius: 99, background: T.dark25 }} />
    </div>
  );
}

const APPLIED_ITEMS = [
  { title: 'Publish dates redistributed evenly across the week.', sub: 'Product Education posts were clustering on Mondays' },
  { title: 'Pain-point hook style applied to upcoming content briefs.', sub: 'Thought Leadership hook pattern identified across 12 posts.' },
];

function LearningsApplied({ onViewMore }: { onViewMore: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Learnings applied" />
      <div style={{ borderRadius: 24, background: T.dark3, padding: '16px 16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 20, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <NeutralPill label="Organic" />
          <AppliedPill />
        </div>
        {APPLIED_ITEMS.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <BulletLine />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark90, letterSpacing: '0.14px', lineHeight: 1.4 }}>{item.title}</span>
              <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <ContentAreaButton type="secondary" size="m" label="View More" rightIcon={arrowRightIcon} fullWidth onClick={onViewMore} />
    </div>
  );
}

// ── Expand your reach ───────────────────────────────────────────────────────────────
const REACH = [
  { icon: videoIcon,    title: 'Try short form video',     body: 'Reels, Shorts, and TikToks get 3x more reach than static posts. Make your first!' },
  { icon: fileEditIcon, title: 'Set up your SEO engine',   body: 'Pick your keywords to automatically build content clusters and rank higher on Google.' },
  { icon: paidAdsIcon,  title: 'Run your first ad',        body: 'Turn your content into a Meta ad. Blaze handles copy and targeting.' },
  { icon: barGroupIcon, title: 'Unlock the Learning Loop', body: "See what's working and let the Learning Loop improve every campaign." },
];

function ExpandYourReach({ onUnlockLearningLoop }: { onUnlockLearningLoop: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <SectionHeading title="Expand your reach" />
      {REACH.map(r => {
        const isLearningLoop = r.title === 'Unlock the Learning Loop';
        return (
          <div
            key={r.title}
            onClick={isLearningLoop ? onUnlockLearningLoop : undefined}
            style={{ borderRadius: 12, background: T.light, border: `1px solid ${T.dark8}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 4, cursor: isLearningLoop ? 'pointer' : 'default' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={r.icon} alt="" style={{ width: 16, height: 16, opacity: 0.85 }} />
              <span style={{ fontFamily: T.font, fontSize: 16, fontWeight: 500, color: T.dark90, lineHeight: 1.4 }}>{r.title}</span>
            </div>
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, letterSpacing: '0.14px', lineHeight: 1.4 }}>{r.body}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────────────
export function HomeScreen({ llState, onViewLearnings }: { llState: LLDataState; onViewLearnings: () => void }) {
  return (
    <div style={{ background: T.light, minHeight: '100%' }}>
      <HomeHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, padding: '20px 20px 10px' }}>
        <h1 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 400, color: T.dark90, margin: 0, lineHeight: 1.1 }}>
          Welcome back, Fabian
        </h1>
        <UpNext />
        <UpcomingPosts />
        <Campaigns />
        <Last7Days />
        {llState === 'active' && <LearningsApplied onViewMore={onViewLearnings} />}
        <ExpandYourReach onUnlockLearningLoop={onViewLearnings} />
      </div>
      {/* spacer for tab bar */}
      <div style={{ height: 126 }} />
    </div>
  );
}
