import { useState } from 'react';
import { ToolbarHeader, ToolbarButton, Sheet } from '@ios/components';
import { ASSETS } from './assets';
import { REPUTATION, ReputationMiniCard } from './Reputation';
import checkCircleIcon from '@ios/icons/approval.svg';
import eyeIcon from '@ios/icons/eye-open.svg';
import chevronRightIcon from '@ios/icons/chevron-right-small.svg';

const font = 'var(--ios-font)';
const SERIF = "Georgia, 'Times New Roman', serif";

// Reliable Unsplash fallback for any image that fails to load.
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80';
// A friends-at-a-cafe shot for the "Small steps. Real success." card.
const CAFE_FRIENDS_IMG = 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80';

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.dataset.fallback !== '1') {
    el.dataset.fallback = '1';
    el.src = FALLBACK_IMG;
  }
}

// ─── Data ──────────────────────────────────────────────────────────────────

type CardStatus = 'review' | 'approved';
type PostCard =
  | { type: 'image'; img: string; status: CardStatus; overlay?: string }
  | { type: 'email'; subject: string; img: string; status: CardStatus };

// Three sample post previews, reused across groups with a given status.
function sampleCards(status: CardStatus): PostCard[] {
  return [
    { type: 'image', img: ASSETS.homeUpcomingBlog, status },
    { type: 'image', img: CAFE_FRIENDS_IMG, status, overlay: 'Small steps. Real success.' },
    { type: 'email', subject: 'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', img: ASSETS.homeUpcomingProduct, status },
  ];
}

// Pending campaign groups — each opens the review flow.
const PENDING_GROUPS = [
  {
    id: 'spring-sale',
    kind: 'Campaign',
    dates: 'Apr 19 – May 1',
    title: 'Spring Sale 2026: The best of spring sale',
    reviewLabel: 'Review 15 Posts',
    cards: [
      { type: 'image' as const, img: ASSETS.homeUpcomingBlog,    status: 'review'   as const },
      { type: 'image' as const, img: CAFE_FRIENDS_IMG,          status: 'review'   as const, overlay: 'Small steps. Real success.' },
      { type: 'email' as const, subject: 'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', img: ASSETS.homeUpcomingProduct, status: 'approved' as const },
    ] as PostCard[],
  },
  {
    id: 'seo-blogs',
    kind: 'SEO',
    dates: 'Apr 19 – May 1',
    title: 'SEO Relevance Blogs',
    reviewLabel: 'Review 3 Posts',
    cards: [
      { type: 'email' as const, subject: 'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', img: ASSETS.homeUpcomingPhoto,   status: 'approved' as const },
      { type: 'email' as const, subject: 'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', img: ASSETS.homeUpcomingProduct, status: 'approved' as const },
      { type: 'email' as const, subject: 'Snag 20% Off Our New Product: Limited Time Sale this Weekend!', img: ASSETS.homeCampaignKona,    status: 'approved' as const },
    ] as PostCard[],
  },
];

type ListRow = { id: number; kind: string; dates: string; title: string; count: number; alert?: boolean };

const APPROVED: ListRow[] = [
  { id: 1, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer. Longer days call for it.', count: 8 },
  { id: 2, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer.', count: 8 },
  { id: 3, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer.', count: 8 },
];

const PAST: ListRow[] = [
  { id: 1, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer. Longer days call for it.', count: 4, alert: true },
  { id: 2, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer.', count: 4 },
  { id: 3, kind: 'Campaign', dates: 'Apr 19 – May 1', title: 'Eat Well. Healthier Summer.', count: 4 },
];

// ─── Pieces ────────────────────────────────────────────────────────────────

function Eyebrow({ kind, dates }: { kind: string; dates: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px' }}>{kind}</span>
      <span style={{ width: 1, height: 11, background: 'var(--ios-dark-15)' }} />
      <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', letterSpacing: '0.12px' }}>{dates}</span>
    </div>
  );
}

function StatusChip({ status }: { status: CardStatus }) {
  const cfg = status === 'approved'
    ? { bg: 'rgba(32,161,79,0.17)', border: 'rgba(32,161,79,0.1)', color: '#20a14f', label: 'Approved' }
    : { bg: 'rgba(255,174,0,0.3)',  border: 'rgba(255,174,0,0.5)', color: '#3f2b00', label: 'Review' };
  return (
    <span style={{
      display: 'inline-block', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5,
      padding: '2px 7px', fontFamily: font, fontSize: 12, color: cfg.color,
      letterSpacing: '0.12px', whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

function PreviewCard({ card }: { card: PostCard }) {
  const base: React.CSSProperties = {
    minWidth: 150, width: 150, height: 210, borderRadius: 12, overflow: 'hidden',
    flexShrink: 0, border: '1px solid var(--ios-dark-4)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'relative', background: '#fff',
  };

  if (card.type === 'email') {
    return (
      <div style={{ ...base, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{
            fontFamily: SERIF, fontSize: 15, color: 'var(--ios-dark-90)', lineHeight: 1.25, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{card.subject}</div>
        </div>
        {card.img && <img src={card.img} alt="" onError={handleImgError} style={{ width: '100%', height: 78, objectFit: 'cover', display: 'block' }} />}
        <div style={{ padding: '10px 12px 12px', marginTop: 'auto' }}>
          <StatusChip status={card.status} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...base, background: '#c8c0b4' }}>
      {card.img && <img src={card.img} alt="" onError={handleImgError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {card.overlay && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)' }} />
          <span style={{
            position: 'absolute', top: 12, left: 12, right: 12,
            fontFamily: font, fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.3,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>{card.overlay}</span>
        </>
      )}
      <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
        <StatusChip status={card.status} />
      </div>
    </div>
  );
}

function GroupButton({ label, icon, onClick }: { label: string; icon: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', height: 52, background: '#fff', border: '1px solid var(--ios-dark-8)',
        borderRadius: 99, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)',
        WebkitAppearance: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <img src={icon} alt="" aria-hidden="true" style={{ width: 18, height: 18, opacity: 0.85 }} />
      {label}
    </button>
  );
}

// A campaign group: eyebrow + title + horizontal card scroll + a CTA button.
function CampaignGroup({ kind, dates, title, cards, button }: {
  kind: string;
  dates: string;
  title: string;
  cards: PostCard[];
  button: { label: string; icon: string; onClick?: () => void };
}) {
  return (
    <div>
      <Eyebrow kind={kind} dates={dates} />
      <div style={{ fontFamily: font, fontSize: 20, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.25, marginBottom: 14 }}>
        {title}
      </div>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
        marginLeft: -20, paddingLeft: 20, marginRight: -20, paddingRight: 20,
        scrollbarWidth: 'none',
      }}>
        {cards.map((card, i) => <PreviewCard key={i} card={card} />)}
      </div>
      <div style={{ marginTop: 14 }}>
        <GroupButton label={button.label} icon={button.icon} onClick={button.onClick} />
      </div>
    </div>
  );
}

function CountBadge({ count, variant }: { count: number; variant: 'approved' | 'alert' | 'muted' }) {
  if (variant === 'muted') {
    return (
      <span style={{
        minWidth: 24, height: 24, padding: '0 7px', borderRadius: 99, background: 'var(--ios-dark-4)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: font, fontSize: 14, color: 'var(--ios-dark-60)',
      }}>{count}</span>
    );
  }
  const bg = variant === 'alert' ? 'var(--status-failed, #bc010b)' : '#20a14f';
  return (
    <span style={{
      width: 24, height: 24, borderRadius: 99, background: bg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font, fontSize: 13, fontWeight: 500, color: '#fff',
    }}>{count}</span>
  );
}

function CampaignList({ rows, badge, onRowClick }: {
  rows: ListRow[];
  badge: 'approved' | 'past';
  onRowClick?: (row: ListRow) => void;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--ios-dark-4)', borderRadius: 16, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={row.id}
          onClick={() => onRowClick?.(row)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--ios-dark-4)' : 'none',
            cursor: onRowClick ? 'pointer' : 'default',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow kind={row.kind} dates={row.dates} />
            <div style={{
              fontFamily: font, fontSize: 16, color: 'var(--ios-dark-90)', lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{row.title}</div>
          </div>
          <CountBadge
            count={row.count}
            variant={badge === 'approved' ? 'approved' : row.alert ? 'alert' : 'muted'}
          />
          <img src={chevronRightIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: font, fontSize: 20, fontWeight: 400, color: 'var(--ios-dark-90)', marginBottom: 12 }}>
      {children}
    </div>
  );
}

// ─── Section sheet (Approved / Past campaigns) ──────────────────────────────

function SectionSheet({ section, onClose, onViewCampaign }: {
  section: { title: string; rows: ListRow[] } | null;
  onClose: () => void;
  onViewCampaign: () => void;
}) {
  return (
    <Sheet
      size="full"
      leftButton="back"
      title={section?.title}
      visible={section !== null}
      onClose={onClose}
    >
      <div style={{ padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {section?.rows.map((row) => (
          <CampaignGroup
            key={row.id}
            kind={row.kind}
            dates={row.dates}
            title={row.title}
            cards={sampleCards('approved')}
            button={{ label: `View ${row.count} Posts`, icon: eyeIcon, onClick: onViewCampaign }}
          />
        ))}
      </div>
    </Sheet>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export function ApprovalsScreen({
  onBack = () => {},
  onReviewCampaign = () => {},
  onReviewReputation = () => {},
  asTab = false,
}: {
  onBack?: () => void;
  onReviewCampaign?: () => void;
  onReviewReputation?: () => void;
  /** When shown as a tab-bar destination (DFY), drop the back button. */
  asTab?: boolean;
} = {}) {
  const [sheetSection, setSheetSection] = useState<{ title: string; rows: ListRow[] } | null>(null);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--ios-background-gray)' }}>
      {asTab ? (
        <ToolbarHeader
          variant="screen"
          titleSlot={<span style={{ fontFamily: font, fontSize: 28, fontWeight: 400, lineHeight: 1.1, color: 'var(--ios-dark-90)' }}>Approvals</span>}
          rightButtons={<ToolbarButton variant="credits" credits={96} />}
        />
      ) : (
        <ToolbarHeader title="Approvals" onLeftPress={onBack} />
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: asTab ? '4px 20px 130px' : '4px 20px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Pending campaign groups */}
        {PENDING_GROUPS.map((group) => (
          <CampaignGroup
            key={group.id}
            kind={group.kind}
            dates={group.dates}
            title={group.title}
            cards={group.cards}
            button={{ label: group.reviewLabel, icon: checkCircleIcon, onClick: onReviewCampaign }}
          />
        ))}

        {/* Reputation — Needs Attention */}
        <div>
          <Eyebrow kind="Reputation" dates="Oct 1 – Oct 15" />
          <div style={{ fontFamily: font, fontSize: 20, fontWeight: 400, color: 'var(--ios-dark-90)', lineHeight: 1.25, marginBottom: 14 }}>
            Needs Attention
          </div>
          <div style={{
            display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
            marginLeft: -20, paddingLeft: 20, marginRight: -20, paddingRight: 20,
            scrollbarWidth: 'none',
          }}>
            {REPUTATION.map((item) => (
              <ReputationMiniCard key={item.id} item={item} onClick={onReviewReputation} />
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <GroupButton label={`Review ${REPUTATION.length} Replies`} icon={checkCircleIcon} onClick={onReviewReputation} />
          </div>
        </div>

        {/* Approved */}
        <div>
          <SectionTitle>Approved</SectionTitle>
          <CampaignList
            rows={APPROVED}
            badge="approved"
            onRowClick={() => setSheetSection({ title: 'Approved', rows: APPROVED })}
          />
        </div>

        {/* Past campaigns */}
        <div>
          <SectionTitle>Past campaigns</SectionTitle>
          <CampaignList
            rows={PAST}
            badge="past"
            onRowClick={() => setSheetSection({ title: 'Past campaigns', rows: PAST })}
          />
        </div>

      </div>

      <SectionSheet
        section={sheetSection}
        onClose={() => setSheetSection(null)}
        onViewCampaign={onReviewCampaign}
      />
    </div>
  );
}
