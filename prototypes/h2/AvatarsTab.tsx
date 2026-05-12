import { useState, type CSSProperties } from 'react';

/**
 * AvatarsTab — split layout: avatar list (left rail) + selected-avatar detail
 * (right). Originally lived under /h2/influencer-content; moved into
 * /h2/content-settings as the "Avatars" preferences tab.
 */

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
}

const CONTENT: ContentItem[] = [
  { id: 1, type: 'AI Lifestyle', creator: 'Sofia (AI)', campaign: 'Day Heel', status: 'approved', platform: 'Instagram', duration: '22s' },
  { id: 2, type: 'AI Demo', creator: 'Sofia (AI)', campaign: 'Day Heel', status: 'approved', platform: 'TikTok', duration: '41s' },
  { id: 3, type: 'AI Testimonial', creator: 'Jordan (AI)', campaign: 'The Flat', status: 'reviewing', platform: 'YouTube', duration: '29s' },
  { id: 4, type: 'AI Lifestyle', creator: 'Elise (AI)', campaign: 'The Flat', status: 'approved', platform: 'Instagram', duration: '19s' },
  { id: 5, type: 'AI Demo', creator: 'Sofia (AI)', campaign: 'Spring Loafer Drop', status: 'approved', platform: 'Instagram', duration: '27s' },
  { id: 6, type: 'AI Tutorial', creator: 'Yuki (AI)', campaign: 'Spring Loafer Drop', status: 'reviewing', platform: 'TikTok', duration: '52s' },
  { id: 7, type: 'AI Lifestyle', creator: 'Amara (AI)', campaign: 'Spring Loafer Drop', status: 'approved', platform: 'Instagram', duration: '24s' },
];

const tileSurface: CSSProperties = {
  background: 'var(--dark-2)',
  border: '1px solid var(--dark-8)',
  borderRadius: 10,
  padding: '12px 14px',
};

const tileLabel: CSSProperties = {
  fontSize: 11,
  color: 'var(--dark-40)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 500,
};

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

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={tileSurface}>
      <div style={tileLabel}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, marginTop: 3 }}>{value}</div>
    </div>
  );
}

export function AvatarsTab() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const selected = AVATARS_DATA.find((a) => a.id === selectedId) ?? AVATARS_DATA[0]!;
  const recentVideos = CONTENT.filter((c) => c.creator.startsWith(selected.name));

  return (
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
            <StatTile label="Brand fit" value={`${selected.fit}%`} />
            <StatTile
              label="Status"
              value={
                <span style={statusPillStyle(selected.status === 'active' ? 'approved' : 'reviewing')}>
                  {AVATAR_STATUS_LABEL[selected.status]}
                </span>
              }
            />
            <div style={{ gridColumn: '1 / -1', ...tileSurface }}>
              <div style={tileLabel}>Persona</div>
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
  );
}
