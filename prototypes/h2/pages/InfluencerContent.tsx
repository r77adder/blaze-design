import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import { H2Layout } from '../H2Layout';

/**
 * /h2/influencer-content — deep port of Blaze H2 Features/influencer-content.html.
 *
 * Four tabs:
 *  - Overview   — KPI strip, active campaigns + recent activity, learning loop
 *  - Campaigns  — split layout (cards + detail/pipeline aside)
 *  - Avatars    — left rail of avatar personas + right detail w/ recent videos
 *  - Content    — top stat bar + filter chips + grid of AI-generated videos
 *
 * Plus a 7-screen "New Campaign" wizard hosted in <ModalStack>:
 *  Product → Avatar → Configure → Deliverables → Brief (typed live) → Review → Done.
 *
 * Per-page-route pattern: <InfluencerContentRoute /> wraps inner in
 * <ModalStack> so the wizard can be opened via useModals().
 */

// ─── DATA ─────────────────────────────────────────────────────────

type CampaignStatusKey = 'production' | 'review' | 'ads';

interface CampaignStatusStyle {
  label: string;
  bg: string;
  fg: string;
}

const CAMPAIGN_STATUS: Record<CampaignStatusKey, CampaignStatusStyle> = {
  production: { label: 'In Production', bg: '#DCF5E2', fg: '#157A3A' },
  review: { label: 'In Review', bg: '#DBE9FF', fg: '#1A56C2' },
  ads: { label: 'Running Ads', bg: '#FBE5DC', fg: '#B8440A' },
};

interface Campaign {
  id: number;
  name: string;
  avatars: string[];
  videos: number;
  statusKey: CampaignStatusKey;
  progress: number;
  budget: string;
  timeline: string;
  brief: string;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Day Heel — AI Avatar Campaign',
    avatars: ['Sofia', 'Elise'],
    videos: 5,
    statusKey: 'production',
    progress: 35,
    budget: '$1,200',
    timeline: 'May 6 – May 28',
    brief: 'AI-generated lifestyle and product-demo videos using Sofia and Elise avatars for paid ad testing on Instagram + Meta.',
  },
  {
    id: 2,
    name: 'The Flat — Lifestyle AI Series',
    avatars: ['Jordan', 'Yuki', 'Amara'],
    videos: 5,
    statusKey: 'review',
    progress: 60,
    budget: '$1,400',
    timeline: 'May 10 – May 24',
    brief: 'AI testimonial and unboxing videos using Jordan, Yuki, and Amara across organic posts and Meta ads.',
  },
  {
    id: 3,
    name: 'Spring Loafer Drop — AI Demos',
    avatars: ['Sofia', 'Yuki', 'Amara'],
    videos: 8,
    statusKey: 'ads',
    progress: 80,
    budget: '$2,200',
    timeline: 'May 1 – May 21',
    brief: 'AI demo videos showcasing fit and style for the Loafer line, running on Instagram and TikTok with a paid push.',
  },
];

interface PipelineStep {
  step: string;
  status: 'done' | 'active' | 'todo';
}

const PIPELINE: PipelineStep[] = [
  { step: 'Avatar Selection', status: 'done' },
  { step: 'Brief Approved', status: 'done' },
  { step: 'Video Generation', status: 'active' },
  { step: 'Brand Safety Review', status: 'todo' },
  { step: 'Ad Integration', status: 'todo' },
];

type TabKey = 'overview' | 'campaigns' | 'avatars' | 'content';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  tab?: TabKey;
}

const STATS: StatCard[] = [
  { label: 'Active Campaigns', value: '3', icon: '📣', tab: 'campaigns' },
  { label: 'AI Avatars', value: '5', icon: '🤖', tab: 'avatars' },
  { label: 'Videos Generated', value: '12', icon: '🎬', tab: 'content' },
  { label: 'Pending Reviews', value: '4', icon: '🔔' },
  { label: 'Est. Reach', value: '142K', icon: '👁️' },
  { label: 'Avg. CTR', value: '4.6%', icon: '📈' },
];

interface ActivityItem {
  time: string;
  icon: string;
  text: string;
  action: string | null;
  tab?: TabKey;
}

const ACTIVITY: ActivityItem[] = [
  { time: '2h ago', icon: '🤖', text: '5 AI avatar videos generated and ready', action: 'View', tab: 'content' },
  { time: '4h ago', icon: '⚠️', text: 'Brand-safety check flagged 1 video', action: 'Review', tab: 'content' },
  { time: '6h ago', icon: '🎬', text: 'Sofia avatar — 3 new lifestyle clips', action: 'View', tab: 'content' },
  { time: '1d ago', icon: '✓', text: 'Brief approved — Spring Loafer Drop', action: null },
  { time: '2d ago', icon: '⚡', text: 'Jordan avatar trained on Brand Kit', action: null },
];

const INSIGHTS = [
  { title: 'Lifestyle AI videos driving 5.1% CTR', tag: 'Content · Format', icon: '🎬' },
  { title: 'Sofia avatar outperforming by 2.3×', tag: 'Avatar · Insight', icon: '🤖' },
  { title: 'Tuesday 9am posts get +38% reach', tag: 'Scheduling · All', icon: '📅' },
];

interface AvatarRow {
  id: number;
  name: string;
  emoji: string;
  persona: string;
  style: string;
  videos: number;
  status: 'active' | 'training' | 'paused';
  fit: number;
}

const AVATARS_DATA: AvatarRow[] = [
  { id: 1, name: 'Sofia', emoji: '👩🏻', persona: 'Sophisticated, Mediterranean', style: 'Lifestyle / Editorial', videos: 4, status: 'active', fit: 96 },
  { id: 2, name: 'Jordan', emoji: '👩🏽', persona: 'Street-style, Urban energy', style: 'UGC / Casual', videos: 3, status: 'active', fit: 88 },
  { id: 3, name: 'Elise', emoji: '👩🏼', persona: 'Minimalist Luxury, Scandinavian', style: 'Editorial', videos: 2, status: 'active', fit: 92 },
  { id: 4, name: 'Yuki', emoji: '👩🏻', persona: 'Calm Modern, Japanese-American', style: 'Studio / Clean', videos: 1, status: 'training', fit: 89 },
  { id: 5, name: 'Amara', emoji: '👩🏿', persona: 'Bold Vibrant, West African', style: 'Editorial / Lifestyle', videos: 2, status: 'active', fit: 84 },
];

const AVATAR_STATUS_LABEL: Record<AvatarRow['status'], string> = {
  active: 'Active',
  training: 'Training',
  paused: 'Paused',
};

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
  { id: 1, type: 'AI Lifestyle', creator: 'Sofia (AI)', campaign: 'Day Heel', status: 'approved', platform: 'Instagram', duration: '22s', note: '✓ Tone match 94%' },
  { id: 2, type: 'AI Demo', creator: 'Sofia (AI)', campaign: 'Day Heel', status: 'approved', platform: 'TikTok', duration: '41s', note: '✓ Clear product showcase' },
  { id: 3, type: 'AI Testimonial', creator: 'Jordan (AI)', campaign: 'The Flat', status: 'reviewing', platform: 'YouTube', duration: '29s', note: '⚠ Tone slightly casual' },
  { id: 4, type: 'AI Lifestyle', creator: 'Elise (AI)', campaign: 'The Flat', status: 'approved', platform: 'Instagram', duration: '19s', note: '✓ Elegant, on-brand' },
  { id: 5, type: 'AI Demo', creator: 'Sofia (AI)', campaign: 'Spring Loafer Drop', status: 'approved', platform: 'Instagram', duration: '27s', note: '✓ Brand guidelines passed' },
  { id: 6, type: 'AI Tutorial', creator: 'Yuki (AI)', campaign: 'Spring Loafer Drop', status: 'reviewing', platform: 'TikTok', duration: '52s', note: '⚠ Awaiting brand check' },
  { id: 7, type: 'AI Lifestyle', creator: 'Amara (AI)', campaign: 'Spring Loafer Drop', status: 'approved', platform: 'Instagram', duration: '24s', note: '✓ Vibrant, engaging' },
];

// ─── WIZARD DATA ──────────────────────────────────────────────────

interface ProductOption {
  id: number;
  name: string;
  sku: string;
  price: string;
  category: string;
  emoji: string;
}

const PRODUCTS: ProductOption[] = [
  { id: 1, name: 'Margaux The Day Heel', sku: 'MDH-001', price: '$298', category: 'Heels', emoji: '👠' },
  { id: 2, name: 'Margaux The Flat', sku: 'MF-002', price: '$248', category: 'Flats', emoji: '🥿' },
  { id: 3, name: 'Margaux The Loafer', sku: 'ML-003', price: '$268', category: 'Loafers', emoji: '👞' },
  { id: 4, name: 'Margaux The Boot', sku: 'MB-004', price: '$398', category: 'Boots', emoji: '🥾' },
  { id: 5, name: 'Margaux The Mule', sku: 'MM-005', price: '$258', category: 'Mules', emoji: '👡' },
  { id: 6, name: 'Margaux The Sneaker', sku: 'MS-006', price: '$228', category: 'Sneakers', emoji: '👟' },
];

interface AvatarPersona {
  id: string;
  emoji: string;
  name: string;
  style: string;
  tone: string;
  look: string;
  fit: number | null;
}

const WIZARD_AVATARS: AvatarPersona[] = [
  { id: 'sofia', emoji: '👩🏻', name: 'Sofia', style: 'Sophisticated', tone: 'Warm & Aspirational', look: 'Mediterranean, 28, fashion-forward', fit: 96 },
  { id: 'jordan', emoji: '👩🏽', name: 'Jordan', style: 'Street / Casual', tone: 'Energetic & Relatable', look: 'Urban, 24, streetwear edge', fit: 88 },
  { id: 'elise', emoji: '👩🏼', name: 'Elise', style: 'Minimalist Luxury', tone: 'Understated & Elegant', look: 'Scandinavian, 32, refined', fit: 92 },
  { id: 'amara', emoji: '👩🏿', name: 'Amara', style: 'Bold & Vibrant', tone: 'Confident & Expressive', look: 'West African, 26, maximalist', fit: 84 },
  { id: 'yuki', emoji: '👩🏻', name: 'Yuki', style: 'Clean & Modern', tone: 'Calm & Insightful', look: 'Japanese-American, 29, minimal', fit: 89 },
  { id: 'custom', emoji: '✨', name: 'Custom', style: 'Build your own', tone: 'Set your parameters', look: 'Upload reference images', fit: null },
];

interface StyleOption {
  id: string;
  label: string;
  desc: string;
  icon: string;
}

const STYLES: StyleOption[] = [
  { id: 'editorial', label: 'Editorial', desc: 'High-fashion, aspirational imagery', icon: '📸' },
  { id: 'lifestyle', label: 'Lifestyle', desc: 'Real moments, authentic settings', icon: '🌿' },
  { id: 'ugc', label: 'UGC-style', desc: 'Raw, casual, creator-feel', icon: '📱' },
  { id: 'studio', label: 'Studio/Clean', desc: 'Product-forward, minimal backgrounds', icon: '⬜' },
];

const TONES = ['Aspirational', 'Playful', 'Educational', 'Luxurious', 'Relatable', 'Minimal', 'Bold'];
const AI_TYPES = ['Product Demo', 'Testimonial', 'Lifestyle', 'Unboxing', 'Tutorial'];
const AI_VOLS = ['5 videos', '10 videos', '25 videos', '50 videos'];
const USAGES = ['Organic only', 'Paid ads allowed', 'Whitelisting'];
const EXCLUSIVITIES = ['None', '14 days', '30 days', '90 days'];
const REVISIONS = ['1 round', '2 rounds', 'Unlimited'];

interface DeliverableRow {
  id: string;
  label: string;
  desc: string;
  qty: number;
  platform: string;
}

const initialDeliverables = (): DeliverableRow[] => [
  { id: 'reel', label: 'Reels / Short-form Video', desc: '15–60s vertical video', qty: 1, platform: 'Instagram / TikTok' },
  { id: 'feed', label: 'Feed Post', desc: 'Single image or carousel', qty: 1, platform: 'Instagram' },
  { id: 'story', label: 'Stories', desc: '24hr ephemeral, 3-frame set', qty: 0, platform: 'Instagram' },
  { id: 'ugc', label: 'UGC Video (raw)', desc: 'Unedited footage for ad team', qty: 0, platform: 'Any' },
  { id: 'blog', label: 'Blog / Long-form', desc: '500–1000 word article', qty: 0, platform: 'Creator blog' },
];

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
  { key: 'campaigns', label: '📣 Campaigns' },
  { key: 'avatars', label: '🤖 Avatars' },
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
              fontSize: 13.5,
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
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
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <h3 style={sectionTitle}>Active campaigns</h3>
          {CAMPAIGNS.map((c) => (
            <CampaignCard key={c.id} campaign={c} onClick={() => onJump('campaigns')} />
          ))}
        </div>
        <div>
          <h3 style={sectionTitle}>Recent activity</h3>
          <div style={{ ...cardSurface, overflow: 'hidden' }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr auto',
                  gap: 12,
                  padding: '11px 14px',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--dark-4)' : 'none',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--dark-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}
                >
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--dark-90)', lineHeight: 1.5 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 2 }}>{a.time}</div>
                </div>
                {a.action && (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => {
                      if (a.tab) onJump(a.tab);
                      else showToast({ message: `${a.action} ${a.text}` });
                    }}
                  >
                    {a.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={sectionTitle}>🧠 Learning Loop snapshot</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {INSIGHTS.map((ins) => (
          <div key={ins.title} style={{ ...cardSurface, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{ins.icon}</span>
              <span
                style={{
                  fontSize: 10.5,
                  background: 'var(--dark-4)',
                  color: 'var(--dark-60)',
                  borderRadius: 5,
                  padding: '2px 7px',
                  letterSpacing: '0.02em',
                }}
              >
                {ins.tag}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.4, letterSpacing: '0.05px' }}>
              {ins.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignCard({
  campaign,
  selected,
  detailed,
  onClick,
}: {
  campaign: Campaign;
  selected?: boolean;
  detailed?: boolean;
  onClick: () => void;
}) {
  const sty = CAMPAIGN_STATUS[campaign.statusKey];
  return (
    <div
      onClick={onClick}
      style={{
        ...cardSurface,
        padding: detailed ? '16px 18px' : '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        borderColor: selected ? 'var(--dark-90)' : 'var(--dark-8)',
        boxShadow: selected ? '0 0 0 1px var(--dark-90)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: detailed ? 14 : 13.5, color: 'var(--dark-90)', marginBottom: 3, letterSpacing: '0.05px' }}>
            {campaign.name}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--dark-60)', flexWrap: 'wrap' }}>
            {detailed ? (
              <>
                <span>🤖 AI Avatar</span>
                <span>📅 {campaign.timeline}</span>
                <span>💰 {campaign.budget}</span>
                <span>🎬 {campaign.videos} videos</span>
                <span>🎭 {campaign.avatars.join(' · ')}</span>
              </>
            ) : (
              <>
                <span>🤖 {campaign.videos} AI videos</span>
                <span>🎭 {campaign.avatars.join(' · ')}</span>
              </>
            )}
          </div>
        </div>
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 5,
            fontSize: 11.5,
            fontWeight: 500,
            flexShrink: 0,
            background: sty.bg,
            color: sty.fg,
          }}
        >
          {sty.label}
        </span>
      </div>
      <div style={{ height: detailed ? 5 : 4, background: 'var(--dark-4)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${campaign.progress}%`, background: sty.fg, borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 4, textAlign: 'right' }}>
        {campaign.progress}% complete
      </div>
    </div>
  );
}

// ─── CAMPAIGNS TAB ───────────────────────────────────────────────

function CampaignsTab() {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = selectedId != null ? CAMPAIGNS.find((c) => c.id === selectedId) ?? null : null;

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selected ? '1fr 320px' : '1fr',
          gap: 16,
          alignItems: 'start',
          transition: 'grid-template-columns 0.2s',
        }}
      >
        <div>
          {CAMPAIGNS.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              selected={selectedId === c.id}
              detailed
              onClick={() => setSelectedId((id) => (id === c.id ? null : c.id))}
            />
          ))}
        </div>
        {selected && (
          <aside style={{ ...cardSurface, padding: 18, position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)', letterSpacing: '0.1px' }}>
                {selected.name}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--dark-40)',
                  cursor: 'pointer',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--dark-80)',
                lineHeight: 1.55,
                background: 'var(--dark-2)',
                border: '1px solid var(--dark-4)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 16,
              }}
            >
              {selected.brief}
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 12,
                marginBottom: 12,
                color: 'var(--dark-80)',
                letterSpacing: '0.1px',
              }}
            >
              CAMPAIGN PIPELINE
            </div>
            {PIPELINE.map((p, i) => {
              const dotBg =
                p.status === 'done'
                  ? 'var(--dark-90)'
                  : p.status === 'active'
                    ? '#FCB728'
                    : 'var(--dark-4)';
              const dotColor =
                p.status === 'done' ? '#fff' : p.status === 'active' ? '#1a1a1a' : 'var(--dark-40)';
              const labelColor =
                p.status === 'todo'
                  ? 'var(--dark-40)'
                  : p.status === 'active'
                    ? '#B06000'
                    : 'var(--dark-90)';
              return (
                <div key={p.step} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10.5,
                      fontWeight: 500,
                      flexShrink: 0,
                      background: dotBg,
                      color: dotColor,
                    }}
                  >
                    {p.status === 'done' ? '✓' : i + 1}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: labelColor,
                      fontWeight: p.status === 'active' ? 500 : 400,
                    }}
                  >
                    {p.step}
                  </div>
                </div>
              );
            })}
            <Button
              variant="secondary"
              size="md"
              onClick={() => showToast({ message: 'Open review queue (TODO)' })}
              style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
            >
              View review queue
            </Button>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── AVATARS TAB ─────────────────────────────────────────────────

function AvatarsTab() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const selected = AVATARS_DATA.find((a) => a.id === selectedId) ?? AVATARS_DATA[0]!;
  const recentVideos = CONTENT.filter((c) => c.creator.startsWith(selected.name));

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          overflow: 'hidden',
          minHeight: 480,
        }}
      >
        <div style={{ borderRight: '1px solid var(--dark-8)', overflowY: 'auto' }}>
          {AVATARS_DATA.map((av) => {
            const isActive = av.id === selectedId;
            return (
              <div
                key={av.id}
                onClick={() => setSelectedId(av.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderBottom: '1px solid var(--dark-4)',
                  cursor: 'pointer',
                  background: isActive ? 'var(--dark-4)' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--dark-90)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {av.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 12.5, color: 'var(--dark-90)' }}>{av.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
                    {av.style} · {av.videos} video{av.videos === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--dark-4)',
              fontWeight: 500,
              fontSize: 13,
              color: 'var(--dark-90)',
              letterSpacing: '0.1px',
            }}
          >
            {selected.name} — {selected.style}
          </div>
          <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
              <AvatarStatTile label="Brand fit" value={`${selected.fit}%`} />
              <AvatarStatTile
                label="Status"
                value={
                  <span style={statusPillStyle(selected.status === 'active' ? 'approved' : 'reviewing')}>
                    {AVATAR_STATUS_LABEL[selected.status]}
                  </span>
                }
              />
              <div style={{ gridColumn: '1 / -1', ...avatarTileSurface }}>
                <div style={avatarTileLabel}>Persona</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{selected.persona}</div>
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--dark-60)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Recent videos · {recentVideos.length}
            </div>
            {recentVideos.length === 0 ? (
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--dark-40)',
                  padding: 14,
                  textAlign: 'center',
                  background: 'var(--light-100)',
                  border: '1px dashed var(--dark-15)',
                  borderRadius: 10,
                }}
              >
                No videos yet — agent is preparing the first batch.
              </div>
            ) : (
              recentVideos.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: 'var(--light-100)',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 10,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #7C5CFC, #A78BFA)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    🎬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {c.type} · {c.campaign}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--dark-40)', marginTop: 1 }}>
                      {c.platform} · {c.duration}
                    </div>
                  </div>
                  <span style={statusPillStyle(c.status)}>{c.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const avatarTileSurface: CSSProperties = {
  background: 'var(--dark-2)',
  border: '1px solid var(--dark-8)',
  borderRadius: 10,
  padding: '12px 14px',
};

const avatarTileLabel: CSSProperties = {
  fontSize: 11,
  color: 'var(--dark-40)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 500,
};

function AvatarStatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={avatarTileSurface}>
      <div style={avatarTileLabel}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function statusPillStyle(status: ContentStatusKey): CSSProperties {
  const map: Record<ContentStatusKey, { bg: string; fg: string }> = {
    approved: { bg: '#DCF5E2', fg: '#2D7A3A' },
    reviewing: { bg: '#FFEDD9', fg: '#B06000' },
  };
  const s = map[status];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 5,
    padding: '3px 8px',
    fontSize: 11.5,
    fontWeight: 500,
    background: s.bg,
    color: s.fg,
    whiteSpace: 'nowrap',
  };
}

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
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--dark-90)' }}>{c.type}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 1 }}>
                      {c.creator} · {c.platform} · {c.duration}
                    </div>
                  </div>
                  <span style={statusPillStyle(c.status)}>{c.status}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--dark-60)', margin: '2px 0 8px' }}>{c.note}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  {c.status === 'approved' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => showToast({ message: `${c.type} sent to Ads` })}
                    >
                      Send to Ads
                    </Button>
                  ) : (
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
        <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>{label}</div>
      </div>
    </div>
  );
}

// ─── WIZARD ──────────────────────────────────────────────────────

type WizardStep = 'product' | 'avatar' | 'configure' | 'deliverables' | 'brief' | 'review' | 'done';

interface WizardState {
  product: ProductOption | null;
  avatar: AvatarPersona | null;
  avatarStyle: string | null;
  avatarTone: string | null;
  aiContentTypes: string[];
  aiVolume: string;
  deliverables: DeliverableRow[];
  usage: string;
  exclusivity: string;
  revisions: string;
  briefText: string;
  briefGenerating: boolean;
}

const initialState = (): WizardState => ({
  product: null,
  avatar: null,
  avatarStyle: null,
  avatarTone: null,
  aiContentTypes: [],
  aiVolume: '10 videos',
  deliverables: initialDeliverables(),
  usage: 'Organic only',
  exclusivity: '30 days',
  revisions: '1 round',
  briefText: '',
  briefGenerating: false,
});

const STEP_ORDER: WizardStep[] = ['product', 'avatar', 'configure', 'deliverables', 'brief', 'review', 'done'];

const STEP_PILL: Partial<Record<WizardStep, string>> = {
  product: 'Step 1 of 5 · Product',
  avatar: 'Step 2 of 5 · AI Avatar',
  configure: 'Step 3 of 5 · Configure',
  deliverables: 'Step 4 of 5 · Deliverables',
  brief: 'Step 5 of 5 · Brief',
};

const STEP_TITLE: Record<WizardStep, string> = {
  product: 'Select a product',
  avatar: 'Choose your AI avatar',
  configure: 'Configure AI avatar campaign',
  deliverables: 'Per-avatar deliverables',
  brief: 'Campaign brief',
  review: 'Review & launch',
  done: 'Campaign launched',
};

function buildBrief(state: WizardState): string {
  const product = state.product?.name ?? 'Margaux The Day Heel';
  const deliv =
    state.deliverables
      .filter((d) => d.qty > 0)
      .map((d) => `${d.qty}x ${d.label}`)
      .join(', ') || '1x Reel, 1x Feed Post';
  const styleLabel = state.avatarStyle
    ? STYLES.find((s) => s.id === state.avatarStyle)?.label ?? 'Lifestyle'
    : 'Lifestyle';
  const avatarLine = state.avatar
    ? `AI Avatar: ${state.avatar.emoji} ${state.avatar.name} (${state.avatar.style})\nContent style: ${styleLabel} · Tone: ${state.avatarTone || 'Aspirational'}`
    : 'AI Avatar: TBD';
  const types = state.aiContentTypes.length ? state.aiContentTypes.join(', ') : 'Lifestyle, Product Demo';
  return `Campaign Brief: ${product} — AI Avatar Campaign

Overview
We are launching an AI avatar campaign for ${product}, a handcrafted footwear brand known for precision fit, timeless design, and elevated everyday style. The agent will generate on-brand video content at scale using our chosen avatar persona, ready for organic and paid use.

Objective
Drive brand awareness and consideration among fashion-forward women aged 25–38. Produce a steady library of avatar-led videos that showcase how ${product} fits seamlessly into a curated, intentional lifestyle.

Avatar & Voice
${avatarLine}

Content Plan
Volume: ${state.aiVolume}
Formats: ${types}
Per-avatar deliverables: ${deliv}
Usage rights: ${state.usage} · Exclusivity: ${state.exclusivity} · Revisions: ${state.revisions}

Key Messages
• Handcrafted in three widths for a perfect fit
• Designed for all-day wear without compromise
• Timeless style that works from desk to dinner

Dos & Don'ts
✓ Keep avatar voice and posture consistent across the set
✓ Frame product clearly in the first 3 seconds for short-form
✗ No claims that imply real-person endorsement
✗ Do not feature competitor products in shots

Hashtags
#MargauxNY #ThePerfectFit #SlowFashion #HandcraftedStyle`;
}

const WIZ_FIELD_LABEL: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--dark-80)',
  marginBottom: 8,
  letterSpacing: '0.1px',
};

function CampaignWizardModal({
  close,
  onComplete,
}: StackModalProps & { onComplete: () => void }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [step, setStep] = useState<WizardStep>('product');
  const briefTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopBrief = () => {
    if (briefTimer.current) {
      clearInterval(briefTimer.current);
      briefTimer.current = null;
    }
    setState((s) => ({ ...s, briefGenerating: false }));
  };

  useEffect(() => () => stopBrief(), []);

  const startBrief = () => {
    if (briefTimer.current) {
      clearInterval(briefTimer.current);
      briefTimer.current = null;
    }
    setState((s) => ({ ...s, briefText: '', briefGenerating: true }));
    setTimeout(() => {
      setState((current) => {
        const full = buildBrief(current);
        let i = 0;
        briefTimer.current = setInterval(() => {
          i += 8;
          setState((cur) => {
            const next = full.slice(0, i);
            if (i >= full.length) {
              if (briefTimer.current) {
                clearInterval(briefTimer.current);
                briefTimer.current = null;
              }
              return { ...cur, briefText: full, briefGenerating: false };
            }
            return { ...cur, briefText: next };
          });
        }, 18);
        return current;
      });
    }, 0);
  };

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[idx + 1];
    if (!next) return;
    if (next === 'brief') startBrief();
    setStep(next);
  };

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    const prev = STEP_ORDER[idx - 1];
    if (!prev) return;
    stopBrief();
    setStep(prev);
  };

  const stepIdx = STEP_ORDER.indexOf(step);
  const showBack = stepIdx > 0 && step !== 'done';

  let nextLabel = 'Continue';
  let nextDisabled = false;
  let onNext: () => void = goNext;

  switch (step) {
    case 'product':
      nextLabel = 'Next, choose AI avatar';
      nextDisabled = !state.product;
      break;
    case 'avatar':
      nextLabel = 'Next, configure campaign';
      nextDisabled = !state.avatar;
      break;
    case 'configure':
      nextLabel = 'Next, set deliverables';
      break;
    case 'deliverables':
      nextLabel = 'Generate campaign brief';
      break;
    case 'brief':
      nextLabel = 'Review & launch';
      nextDisabled = !state.briefText || state.briefGenerating;
      break;
    case 'review':
      nextLabel = 'Launch campaign';
      onNext = () => {
        stopBrief();
        setStep('done');
      };
      break;
    case 'done':
      nextLabel = 'View campaign';
      onNext = () => {
        onComplete();
        close();
      };
      break;
  }

  return (
    <Modal.Root size="md" aria-labelledby="campaign-wizard-title" data-testid="campaign-wizard">
      <Modal.Header
        title={STEP_TITLE[step]}
        id="campaign-wizard-title"
        onClose={close}
        onBack={showBack ? goBack : undefined}
        compact={false}
      />
      <Modal.Content compact={false}>
        {step === 'product' && <StepProduct state={state} setState={setState} />}
        {step === 'avatar' && <StepAvatar state={state} setState={setState} />}
        {step === 'configure' && <StepConfigure state={state} setState={setState} />}
        {step === 'deliverables' && <StepDeliverables state={state} setState={setState} />}
        {step === 'brief' && <StepBrief state={state} setState={setState} onRegenerate={startBrief} />}
        {step === 'review' && <StepReview state={state} />}
        {step === 'done' && <StepDone />}
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          {step !== 'done' && (
            <Modal.FooterButton variant="ghost" onPress={close}>
              Cancel
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" isDisabled={nextDisabled} onPress={onNext}>
            {nextLabel}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function WizStepPill({ step }: { step: WizardStep }) {
  const label = STEP_PILL[step];
  if (!label) return null;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        color: '#B06000',
        background: 'rgba(252,183,40,0.12)',
        border: '1px solid rgba(252,183,40,0.25)',
        borderRadius: 999,
        padding: '4px 10px',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </div>
  );
}

function WizSubtitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13.5, color: 'var(--dark-60)', margin: '4px 0 20px' }}>{children}</p>;
}

const wizRowStyle = (selected: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 16px',
  border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
  borderRadius: 12,
  cursor: 'pointer',
  background: selected ? 'var(--dark-2)' : 'var(--light-100)',
});

function StepProduct({
  state,
  setState,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  return (
    <div>
      <WizStepPill step="product" />
      <WizSubtitle>Which product is this AI avatar campaign promoting?</WizSubtitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {PRODUCTS.map((p) => {
          const selected = state.product?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setState((s) => ({ ...s, product: p }))}
              style={wizRowStyle(selected)}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'var(--dark-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 22,
                }}
              >
                {p.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14.5, color: 'var(--dark-90)', marginBottom: 2 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>
                  {p.category} · {p.price}
                </div>
              </div>
              {selected && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--dark-90)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepAvatar({
  state,
  setState,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  return (
    <div>
      <WizStepPill step="avatar" />
      <WizSubtitle>Select an avatar persona and content style for your AI-generated videos.</WizSubtitle>

      <div style={{ ...WIZ_FIELD_LABEL, marginBottom: 10 }}>Avatar personas</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {WIZARD_AVATARS.map((av) => {
          const selected = state.avatar?.id === av.id;
          return (
            <div
              key={av.id}
              onClick={() => setState((s) => ({ ...s, avatar: av }))}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '14px 14px 16px',
                border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                background: selected ? 'var(--dark-2)' : 'var(--light-100)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{av.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{av.name}</div>
                  <div style={{ fontSize: 11.5, color: '#7C5CFC', fontWeight: 500, marginTop: 2 }}>{av.style}</div>
                </div>
                {av.fit !== null && (
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: av.fit >= 90 ? '#157A3A' : '#B06000',
                      }}
                    >
                      {av.fit}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--dark-40)' }}>brand fit</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{av.tone}</div>
              <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>{av.look}</div>
              {selected && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    background: 'var(--dark-90)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 5,
                    padding: '2px 7px',
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...WIZ_FIELD_LABEL, marginBottom: 10 }}>Content style</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {STYLES.map((cs) => {
          const selected = state.avatarStyle === cs.id;
          return (
            <div
              key={cs.id}
              onClick={() => setState((s) => ({ ...s, avatarStyle: cs.id }))}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '14px 14px 16px',
                border: `1.5px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 12,
                background: selected ? 'var(--dark-2)' : 'var(--light-100)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>{cs.icon}</div>
              <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--dark-90)', marginBottom: 4 }}>{cs.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--dark-60)', lineHeight: 1.45 }}>{cs.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{ ...WIZ_FIELD_LABEL, marginBottom: 8 }}>Tone</div>
      <Chips
        values={TONES}
        current={state.avatarTone}
        onSelect={(v) => setState((s) => ({ ...s, avatarTone: v }))}
      />
    </div>
  );
}

function StepConfigure({
  state,
  setState,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  return (
    <div>
      <WizStepPill step="configure" />
      <WizSubtitle>Set the content types and volume your agent will produce.</WizSubtitle>

      <div
        style={{
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            fontWeight: 500,
            fontSize: 13.5,
            marginBottom: 14,
            color: 'var(--dark-90)',
            letterSpacing: '0.1px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🤖 AI avatar settings
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={WIZ_FIELD_LABEL}>
            Content types <span style={{ color: 'var(--dark-40)', fontWeight: 400 }}>(select multiple)</span>
          </div>
          <Chips
            values={AI_TYPES}
            current={state.aiContentTypes}
            multi
            onToggle={(v) =>
              setState((s) => ({
                ...s,
                aiContentTypes: s.aiContentTypes.includes(v)
                  ? s.aiContentTypes.filter((x) => x !== v)
                  : [...s.aiContentTypes, v],
              }))
            }
          />
        </div>
        <div>
          <div style={WIZ_FIELD_LABEL}>Content volume</div>
          <Chips values={AI_VOLS} current={state.aiVolume} onSelect={(v) => setState((s) => ({ ...s, aiVolume: v }))} />
        </div>
      </div>
    </div>
  );
}

function StepDeliverables({
  state,
  setState,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}) {
  const updateQty = (id: string, delta: number) =>
    setState((s) => ({
      ...s,
      deliverables: s.deliverables.map((d) =>
        d.id === id ? { ...d, qty: Math.max(0, d.qty + delta) } : d,
      ),
    }));

  return (
    <div>
      <WizStepPill step="deliverables" />
      <WizSubtitle>
        Set the content formats, usage rights, and revision policy. This shapes the brief and how the agent produces and reviews each video.
      </WizSubtitle>

      <div style={{ marginBottom: 18 }}>
        <div style={WIZ_FIELD_LABEL}>Content deliverables per avatar</div>
        <div
          style={{
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {state.deliverables.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '13px 16px',
                borderBottom: i < state.deliverables.length - 1 ? '1px solid var(--dark-4)' : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--dark-90)', marginBottom: 2, letterSpacing: '0.1px' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>
                  {d.desc} · {d.platform}
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1.5px solid var(--dark-8)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  aria-label={`Decrease ${d.label}`}
                  onClick={() => updateQty(d.id, -1)}
                  style={stepperBtnStyle}
                >
                  −
                </button>
                <span style={{ minWidth: 32, textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
                  {d.qty}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${d.label}`}
                  onClick={() => updateQty(d.id, +1)}
                  style={stepperBtnStyle}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignItems: 'start' }}>
        <div>
          <div style={WIZ_FIELD_LABEL}>Usage rights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {USAGES.map((u) => (
              <label
                key={u}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--dark-90)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="usage"
                  checked={state.usage === u}
                  onChange={() => setState((s) => ({ ...s, usage: u }))}
                  style={{ margin: 0, accentColor: 'var(--dark-90)' }}
                />
                {u}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div style={WIZ_FIELD_LABEL}>Exclusivity</div>
          <Chips
            values={EXCLUSIVITIES}
            current={state.exclusivity}
            onSelect={(v) => setState((s) => ({ ...s, exclusivity: v }))}
          />
        </div>
        <div>
          <div style={WIZ_FIELD_LABEL}>Revision rounds</div>
          <Chips
            values={REVISIONS}
            current={state.revisions}
            onSelect={(v) => setState((s) => ({ ...s, revisions: v }))}
          />
        </div>
      </div>
    </div>
  );
}

const stepperBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  width: 30,
  height: 30,
  cursor: 'pointer',
  color: 'var(--dark-60)',
  fontSize: 16,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
};

function StepBrief({
  state,
  setState,
  onRegenerate,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onRegenerate: () => void;
}) {
  const wordCount = state.briefText.trim() ? state.briefText.trim().split(/\s+/).length : 0;
  const showActions = !state.briefGenerating && !!state.briefText;
  return (
    <div>
      <WizStepPill step="brief" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.2px', margin: 0 }}>
          Campaign brief
        </h2>
        {state.briefGenerating && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontWeight: 500,
              color: '#7C5CFC',
              background: '#F1ECFF',
              borderRadius: 6,
              padding: '3px 9px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C5CFC' }} />
            Writing…
          </span>
        )}
      </div>
      <WizSubtitle>AI-generated based on your campaign settings. Edit freely before launching.</WizSubtitle>

      <div style={{ position: 'relative' }}>
        <textarea
          value={state.briefText}
          onChange={(e) => setState((s) => ({ ...s, briefText: e.target.value }))}
          placeholder="Generating brief…"
          style={{
            width: '100%',
            minHeight: 320,
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            padding: '16px 18px',
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: 12.5,
            lineHeight: 1.75,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        {showActions && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <button type="button" onClick={onRegenerate} style={chipBtnStyle(false)}>
              ↺ Regenerate
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  void navigator.clipboard.writeText(state.briefText);
                }
              }}
              style={chipBtnStyle(false)}
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <BriefQuality label="Tone match" value="94%" tone="good" />
          <BriefQuality label="Brand safety" value="98%" tone="good" />
          <BriefQuality label="Clarity score" value="A+" tone="good" />
          <BriefQuality label="Word count" value={String(wordCount)} tone="muted" />
        </div>
      )}
    </div>
  );
}

function BriefQuality({ label, value, tone }: { label: string; value: string; tone: 'good' | 'muted' }) {
  return (
    <div
      style={{
        background: 'var(--dark-2)',
        borderRadius: 7,
        padding: '6px 11px',
        fontSize: 11.5,
        color: 'var(--dark-60)',
      }}
    >
      {label}: <b style={{ fontWeight: 500, color: tone === 'good' ? '#157A3A' : 'var(--dark-90)', marginLeft: 2 }}>{value}</b>
    </div>
  );
}

function StepReview({ state }: { state: WizardState }) {
  const delivList =
    state.deliverables
      .filter((d) => d.qty > 0)
      .map((d) => `${d.qty}× ${d.label}`)
      .join(', ') || '—';
  const wordCount = state.briefText.trim() ? state.briefText.trim().split(/\s+/).length : 0;
  const styleLabel = state.avatarStyle ? STYLES.find((s) => s.id === state.avatarStyle)?.label ?? state.avatarStyle : null;
  const rows: [string, string][] = [
    ['Product', state.product?.name ?? '—'],
    ['AI avatar', state.avatar ? `${state.avatar.emoji} ${state.avatar.name} · ${state.avatar.style}` : '—'],
  ];
  if (styleLabel) rows.push(['Content style', styleLabel]);
  if (state.avatarTone) rows.push(['Tone', state.avatarTone]);
  rows.push(
    ['Content types', state.aiContentTypes.length ? state.aiContentTypes.join(', ') : '—'],
    ['AI content volume', state.aiVolume],
    ['Deliverables', delivList],
    ['Usage rights', state.usage],
    ['Exclusivity', state.exclusivity],
    ['Revisions', state.revisions],
    ['Campaign brief', state.briefText ? `✓ AI brief ready (${wordCount} words)` : '—'],
    ['First agent action', 'Generate avatar content'],
  );

  return (
    <div>
      <WizSubtitle>Your agent will begin generating this campaign autonomously.</WizSubtitle>
      <div
        style={{
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {rows.map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              padding: '11px 18px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--dark-4)' : 'none',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--dark-60)', flexShrink: 0 }}>{k}</span>
            <span style={{ color: 'var(--dark-90)', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{v}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          background: 'rgba(252,183,40,0.10)',
          border: '1px solid rgba(252,183,40,0.25)',
          borderRadius: 10,
          padding: '13px 16px',
          marginTop: 14,
          fontSize: 12.5,
          color: 'var(--dark-80)',
          lineHeight: 1.6,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16, color: '#B06000' }}>⏱</span>
        <div>
          The agent will act autonomously on low-risk steps and pause for your review on key decisions — avatar consistency checks, brand-safety review, content approval, ad integration.
        </div>
      </div>
    </div>
  );
}

function StepDone() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px 20px' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#DCF5E2',
          color: '#157A3A',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          fontSize: 28,
          fontWeight: 500,
        }}
      >
        ✓
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '-0.4px',
          marginBottom: 8,
        }}
      >
        Campaign launched
      </h2>
      <p style={{ fontSize: 14, color: 'var(--dark-60)', maxWidth: 480, margin: '0 auto' }}>
        Your agent is now generating avatar content. We'll notify you when there's something to review.
      </p>
    </div>
  );
}

// ─── CHIPS ───────────────────────────────────────────────────────

function chipBtnStyle(active: boolean): CSSProperties {
  return {
    padding: '7px 13px',
    borderRadius: 8,
    border: `1.5px solid ${active ? 'var(--dark-90)' : 'var(--dark-8)'}`,
    background: active ? 'var(--dark-90)' : 'var(--light-100)',
    color: active ? '#fff' : 'var(--dark-80)',
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: active ? 500 : 400,
  };
}

interface ChipsProps {
  values: string[];
  current: string | string[] | null;
  multi?: boolean;
  onSelect?: (v: string) => void;
  onToggle?: (v: string) => void;
}

function Chips({ values, current, multi, onSelect, onToggle }: ChipsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {values.map((v) => {
        const active = multi ? Array.isArray(current) && current.includes(v) : current === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => (multi ? onToggle?.(v) : onSelect?.(v))}
            style={chipBtnStyle(active)}
          >
            {v}
          </button>
        );
      })}
    </div>
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

  const openWizard = () => {
    openModal(CampaignWizardModal, {
      onComplete: () => {
        closeModal();
        showToast({ message: 'Campaign launched' });
      },
    });
  };

  return (
    <H2Layout topbarRight={<InfluencerContentTopbarAction onNew={openWizard} />}>
      <TabBar active={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab onJump={setTab} />}
      {tab === 'campaigns' && <CampaignsTab />}
      {tab === 'avatars' && <AvatarsTab />}
      {tab === 'content' && <ContentTab />}
    </H2Layout>
  );
}
