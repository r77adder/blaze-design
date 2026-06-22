import { useState, useCallback } from 'react';
import { ToolbarButton } from '@ios/components';
import instagramIcon from '@ios/icons/instagram-brand.svg';

const font = 'var(--ios-font)';

// ─── Data ──────────────────────────────────────────────────────────────────

export type RepSource = 'instagram' | 'google' | 'yelp' | 'reddit';

export interface RepItem {
  id: number;
  source: RepSource;
  sourceLabel: string;
  time: string;
  author: string;
  meta?: string;
  rating?: number;
  title: string;
  body: string;
  tone: string;
  flag?: string;
  draft: string;
}

export const REPUTATION: RepItem[] = [
  {
    id: 1, source: 'instagram', sourceLabel: 'Instagram comment', time: '4d ago',
    author: '@certapro_fan_atx',
    title: 'How long does an exterior job usually take?',
    body: 'Thinking about booking for next month. House is about 2,200 sq ft. Roughly how many days should I block off?',
    tone: 'Helpful, friendly',
    draft: 'Great question! For a 2,200 sq ft exterior we typically plan 3–5 days depending on prep needs (power washing, caulking, any wood repair). We’ll give you a firm timeline once we see it in person — want me to set up a quick visit?',
  },
  {
    id: 2, source: 'google', sourceLabel: 'Google Reviews', time: '3d ago',
    author: 'Tom B.', meta: 'Cedar Park, TX', rating: 5,
    title: 'Best painters in Austin — highly recommend',
    body: 'Crew was on time every single day, cleaned up after themselves, and the color matching was perfect. Already referring friends. John’s team is the real deal.',
    tone: 'Warm, direct',
    draft: 'Tom, thank you so much — this made our whole week! Color-matching is something we obsess over so it’s great to hear it showed. We’d love to help your friends too; just have them mention your name.',
  },
  {
    id: 3, source: 'yelp', sourceLabel: 'Yelp', time: 'Yesterday',
    author: 'Devon R.', meta: 'Round Rock, TX · 2.4× normal · 24h', rating: 2,
    title: 'Quoted price went up after the job started',
    body: 'Estimate said $4,200 for the exterior. After two days the lead asked for another $900 for “extra prep.” I would have appreciated a heads-up before they started.',
    flag: 'Needs human review', tone: 'Apologetic',
    draft: 'Hi Devon — really sorry about the surprise on the wood rot. You’re right that we should flag it before the crew starts spraying. John (the owner) is going to call you today to make this right.',
  },
  {
    id: 4, source: 'instagram', sourceLabel: 'Instagram comment', time: '1d ago',
    author: '@hannahgoesgreen',
    title: 'Do you use low-VOC paint? Nothing on the site.',
    body: 'Hi! Trying to figure out if you use low-VOC paint for interior jobs — couldn’t find anything in the FAQ.',
    tone: 'Warm, factual',
    draft: 'Hi Hannah! Great question — we use low-VOC and zero-VOC interior paints from Sherwin-Williams and Benjamin Moore on request, at no extra charge. We’ll mention it on the site too — thanks for the nudge!',
  },
  {
    id: 5, source: 'reddit', sourceLabel: 'r/Austin', time: '5h ago',
    author: 'u/cedar_park_carla', meta: '3× normal · 6h',
    title: 'Any honest reviews of CertaPro Austin?',
    body: 'Getting bids from a few painters for a 2,400 sq ft exterior repaint. CertaPro came in middle of the pack on price — anyone here used them recently?',
    tone: 'Helpful, direct',
    draft: 'Hey Carla — John here, owner of CertaPro Painters of Austin. Happy to share a few recent Cedar Park references and walk you through how we handle prep + change orders so there are no surprises.',
  },
];

// ─── Source badge + stars ────────────────────────────────────────────────────

// Brand logomarks uploaded to public/ (PR #83) — served at the site root.
const yelpLogo = '/more_brand_icons/Logomark=yelp,%20White=OFF,%20Filled=ON.svg';
const redditLogo = '/more_brand_icons/Logomark=Reddit,%20White=OFF,%20Filled=ON.svg';

const SOURCE: Record<RepSource, { color: string; icon?: string; glyph?: string }> = {
  instagram: { color: '#c13584', icon: instagramIcon },
  google:    { color: '#1a73e8' },
  yelp:      { color: '#d32323', icon: yelpLogo },
  reddit:    { color: '#ff4500', icon: redditLogo },
};

// Multicolor Google "G" — the brand icon (the lib glyph is monochrome).
function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function SourceBadge({ item }: { item: RepItem }) {
  const cfg = SOURCE[item.source];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      {item.source === 'google' ? (
        <GoogleLogo />
      ) : cfg.icon ? (
        <img src={cfg.icon} alt="" aria-hidden="true" style={{ width: 14, height: 14, flexShrink: 0 }} />
      ) : (
        <span style={{
          width: 14, height: 14, borderRadius: 4, background: cfg.color, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font, fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1,
        }}>{cfg.glyph}</span>
      )}
      <span style={{
        fontFamily: font,
        fontSize: 'var(--ios-meta-size)',
        fontWeight: 'var(--ios-meta-weight)' as unknown as number,
        lineHeight: 'var(--ios-meta-lh)',
        letterSpacing: 'var(--ios-meta-ls)',
        color: 'var(--ios-dark-60)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{item.sourceLabel}</span>
      {item.rating != null && <Stars n={item.rating} />}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.5 9l6.6-.9L12 2z"
            fill={i <= n ? '#ffb800' : 'none'} stroke={i <= n ? '#ffb800' : 'rgba(0,0,0,0.2)'} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

// ─── Simple mini card (Approvals row) ─────────────────────────────────────────

export function ReputationMiniCard({ item, onClick }: { item: RepItem; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 150, width: 150, height: 210, borderRadius: 12, flexShrink: 0,
        border: '1px solid var(--ios-dark-4)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: '#fff', padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
        cursor: onClick ? 'pointer' : 'default', boxSizing: 'border-box', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <SourceBadge item={{ ...item, rating: undefined }} />
      </div>
      <div style={{
        fontFamily: font, fontSize: 13, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{item.title}</div>
      <div style={{
        fontFamily: font, fontSize: 12, color: 'var(--ios-dark-60)', lineHeight: 1.4, letterSpacing: '0.12px',
        display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{item.body}</div>
      <span style={{
        marginTop: 'auto', alignSelf: 'flex-start',
        background: 'rgba(255,174,0,0.3)', border: '1px solid rgba(255,174,0,0.5)', borderRadius: 5,
        padding: '2px 7px', fontFamily: font, fontSize: 12, color: '#3f2b00', whiteSpace: 'nowrap',
      }}>Review</span>
    </div>
  );
}

// ─── Inline footer icons ───────────────────────────────────────────────────────

const DARK_90 = 'rgba(0,0,0,0.9)';
const GREEN = '#20a14f';

const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'var(--ios-glass-blur)',
  WebkitBackdropFilter: 'var(--ios-glass-blur)',
  boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.08)',
  borderRadius: 99,
  overflow: 'hidden',
};

function IconChevron({ dir, color = DARK_90 }: { dir: 'left' | 'right'; color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d={dir === 'left' ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6'} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12.5365 19.2431L13.2788 18.4112C14.1896 17.3904 15.8236 17.5231 16.5577 18.6774C17.2416 19.7527 18.7274 19.9566 19.6757 19.1052L21.0211 17.8972M2.97888 19.4701L7.34487 18.5904C7.57664 18.5437 7.78946 18.4296 7.9566 18.2624L17.7303 8.48332C18.1989 8.01446 18.1986 7.25447 17.7296 6.78601L15.6591 4.71794C15.1903 4.24967 14.4307 4.24999 13.9623 4.71865L4.18764 14.4987C4.02083 14.6656 3.90693 14.878 3.86018 15.1093L2.97888 19.4701Z" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Scalloped "seal" approval mark (lib approval.svg) — matches the flower-edge
// icon used on the Review buttons, instead of a plain circle.
function IconApprovals({ color = GREEN }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5784 3.29416C11.603 3.333 11.6183 3.36125 11.6249 3.374L12.165 4.65198L13.4775 4.18693L13.4816 4.18579C13.4988 4.18098 13.5359 4.17136 13.589 4.16125C13.6973 4.14063 13.8583 4.12062 14.0466 4.12845C14.4055 4.14337 14.8613 4.25473 15.3033 4.6967C15.7453 5.13867 15.8566 5.59446 15.8716 5.95339C15.8794 6.14168 15.8594 6.30273 15.8387 6.41105C15.8286 6.46414 15.819 6.50118 15.8142 6.51845L15.8131 6.52248L15.348 7.83496L16.626 8.3751C16.6387 8.3817 16.667 8.39698 16.7058 8.42165C16.7884 8.47407 16.907 8.56136 17.0261 8.68754C17.2455 8.92004 17.5 9.31314 17.5 10C17.5 10.6869 17.2455 11.08 17.0261 11.3125C16.907 11.4386 16.7884 11.5259 16.7058 11.5784C16.667 11.603 16.6388 11.6183 16.626 11.6249L15.338 12.1693L15.8165 13.4877L15.8174 13.4907C15.8221 13.5071 15.8317 13.5432 15.8419 13.5952C15.8627 13.7013 15.8831 13.8597 15.8758 14.0455C15.8619 14.3975 15.7528 14.8538 15.3033 15.3033C14.8538 15.7528 14.3975 15.8619 14.0455 15.8758C13.8597 15.8831 13.7013 15.8627 13.5952 15.8419C13.5432 15.8317 13.5071 15.8221 13.4907 15.8174L13.4877 15.8165L12.1693 15.338L11.6249 16.626C11.6183 16.6388 11.603 16.667 11.5784 16.7058C11.5259 16.7884 11.4386 16.907 11.3125 17.0261C11.08 17.2455 10.6869 17.5 10 17.5C9.31314 17.5 8.92004 17.2455 8.68754 17.0261C8.56136 16.907 8.47407 16.7884 8.42165 16.7058C8.39698 16.667 8.3817 16.6387 8.3751 16.626L7.86302 15.4144L6.59242 15.7913L6.5806 15.7942C6.55788 15.7994 6.51409 15.8087 6.45345 15.818C6.32984 15.8369 6.15048 15.8535 5.94482 15.8419C5.5378 15.8189 5.08632 15.6929 4.6967 15.3033C4.30708 14.9137 4.18108 14.4622 4.15812 14.0552C4.14652 13.8495 4.16315 13.6702 4.18204 13.5466C4.19131 13.4859 4.2006 13.4421 4.20585 13.4194L4.20866 13.4076L4.58558 12.137L3.374 11.6249C3.36125 11.6183 3.333 11.603 3.29416 11.5784C3.2116 11.5259 3.09302 11.4386 2.97394 11.3125C2.75454 11.08 2.5 10.6869 2.5 10C2.5 9.31314 2.75454 8.92004 2.97394 8.68754C3.09302 8.56136 3.2116 8.47407 3.29416 8.42165C3.333 8.39698 3.36125 8.3817 3.37401 8.3751L4.69305 7.8176L4.17255 6.48178L4.17254 6.48174C4.16818 6.46759 4.1586 6.43443 4.14822 6.38573C4.12705 6.28632 4.1055 6.13598 4.11135 5.95795C4.12225 5.62636 4.22445 5.16894 4.6967 4.6967C5.16894 4.22445 5.62636 4.12225 5.95795 4.11135C6.13598 4.1055 6.28632 4.12705 6.38573 4.14822C6.43443 4.1586 6.46759 4.16818 6.48174 4.17254L6.48178 4.17255L7.8176 4.69305L8.3751 3.37401C8.3817 3.36125 8.39698 3.333 8.42165 3.29416C8.47407 3.2116 8.56136 3.09302 8.68754 2.97394C8.92004 2.75454 9.31314 2.5 10 2.5C10.6869 2.5 11.08 2.75454 11.3125 2.97394C11.4386 3.09302 11.5259 3.2116 11.5784 3.29416ZM10 1C12.25 1 12.9964 2.76602 12.9964 2.76602C12.9964 2.76602 14.8405 2.1126 16.364 3.63604C17.8874 5.15948 17.234 7.00359 17.234 7.00359C17.234 7.00359 19 7.75 19 10C19 12.25 17.234 12.9964 17.234 12.9964C17.234 12.9964 17.8991 14.8288 16.364 16.364C14.8288 17.8991 12.9964 17.234 12.9964 17.234C12.9964 17.234 12.25 19 10 19C7.75 19 7.00359 17.234 7.00359 17.234C7.00359 17.234 5.07745 17.8054 3.63604 16.364C2.19463 14.9226 2.76602 12.9964 2.76602 12.9964C2.76602 12.9964 1 12.25 1 10C1 7.75 2.76602 7.00359 2.76602 7.00359C2.76602 7.00359 2.06573 5.20635 3.63604 3.63604C5.20635 2.06573 7.00359 2.76602 7.00359 2.76602C7.00359 2.76602 7.75 1 10 1ZM13.6431 7.38593C13.8562 7.03075 13.7411 6.57005 13.3859 6.35694C13.0307 6.14383 12.57 6.25901 12.3569 6.61419L9.26165 11.7729L7.54104 9.98066C7.25418 9.68185 6.77941 9.67217 6.4806 9.95902C6.18179 10.2459 6.1721 10.7207 6.45896 11.0195L8.85899 13.5195C9.02079 13.688 9.2519 13.7715 9.48406 13.7453C9.71623 13.7192 9.92294 13.5863 10.0431 13.3859L13.6431 7.38593Z"
        fill={color}
      />
    </svg>
  );
}

// Green check-burst overlay — mirrors the campaign approve animation.
function ApproveAnim({ stage }: { stage: 'idle' | 's1' | 's2' }) {
  if (stage === 'idle') return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(32,161,79,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: stage === 's2' ? 1 : 0, transition: 'opacity 0.35s ease', zIndex: 10,
    }}>
      <div style={{
        width: stage === 's2' ? 80 : 48, height: stage === 's2' ? 80 : 48, borderRadius: '50%',
        background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <svg width={stage === 's2' ? 36 : 22} height={stage === 's2' ? 28 : 17} viewBox="0 0 36 28" fill="none"
          style={{ transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <path d="M3 14.5L13.5 25L33 3" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function IconSend({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEye({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.15" />
    </svg>
  );
}

function CircleButton({ dir, label, onClick }: { dir: 'left' | 'right'; label: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ ...GLASS, width: 63, height: 63, flexShrink: 0, padding: 4, cursor: 'pointer' }}>
      <div style={{ width: 55, height: 55, borderRadius: 99, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <IconChevron dir={dir} />
        <span style={{ fontFamily: font, fontSize: 10, fontWeight: 500, color: DARK_90, lineHeight: 1.4, letterSpacing: '0.1px' }}>{label}</span>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color = DARK_90, onClick, disabled }: { icon: React.ReactNode; label: string; color?: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        cursor: disabled ? 'default' : 'pointer', height: '100%', paddingTop: 6, paddingBottom: 7,
        opacity: disabled ? 0.3 : 1, transition: 'opacity 0.25s ease',
      }}
    >
      {icon}
      <span style={{ fontFamily: font, fontSize: 10, fontWeight: 500, color, lineHeight: 1.4, letterSpacing: '0.1px' }}>{label}</span>
    </div>
  );
}

// ─── Full content preview (the whole reputation card) ─────────────────────────

function ReputationPreview({ item, posted, approveAnim = 'idle' }: { item: RepItem; posted: boolean; approveAnim?: 'idle' | 's1' | 's2' }) {
  const flagColor = '#ed7c2c';
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: '#fff', borderRadius: 16, border: '1px solid var(--ios-dark-8)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Source + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <SourceBadge item={item} />
        <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-40)', whiteSpace: 'nowrap' }}>{item.time}</span>
      </div>

      {/* Author / meta */}
      <div style={{ fontFamily: font, fontSize: 13, color: 'var(--ios-dark-60)', letterSpacing: '0.13px' }}>
        {item.author}{item.meta ? ` · ${item.meta}` : ''}
      </div>

      {/* Title */}
      <div style={{ fontFamily: font, fontSize: 17, fontWeight: 500, color: 'var(--ios-dark-90)', lineHeight: 1.3 }}>{item.title}</div>

      {/* Body */}
      <div style={{ fontFamily: font, fontSize: 15, color: 'var(--ios-dark-80)', lineHeight: 1.5, letterSpacing: '0.15px' }}>{item.body}</div>

      {/* AI draft reply */}
      <div style={{
        background: posted ? 'rgba(32,161,79,0.08)' : 'rgba(124,92,252,0.06)',
        border: `1px solid ${posted ? 'rgba(32,161,79,0.2)' : 'rgba(124,92,252,0.18)'}`,
        borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {posted ? (
            <>
              <IconApprovals color={GREEN} />
              <span style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: GREEN }}>Posted reply</span>
            </>
          ) : (
            <span style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: item.flag ? flagColor : 'var(--purple)' }}>
              {item.flag ? `⚠ ${item.flag} · ${item.tone}` : `✓ AI draft · ${item.tone}`}
            </span>
          )}
        </div>
        <div style={{ fontFamily: font, fontSize: 15, color: 'var(--ios-dark-90)', lineHeight: 1.5, letterSpacing: '0.15px' }}>{item.draft}</div>
      </div>

      <ApproveAnim stage={approveAnim} />
    </div>
  );
}

// ─── Review flow ───────────────────────────────────────────────────────────────

export function ReputationReviewFlow({ onClose }: { onClose: () => void }) {
  const TOTAL = REPUTATION.length;
  const [cur, setCur] = useState(0);
  const [posted, setPosted] = useState<boolean[]>(Array(TOTAL).fill(false));
  const [approveAnim, setApproveAnim] = useState<'idle' | 's1' | 's2'>('idle');

  const item = REPUTATION[cur];
  const postedCount = posted.filter(Boolean).length;
  const isPosted = posted[cur];

  const goNext = useCallback(() => setCur((c) => Math.min(TOTAL - 1, c + 1)), [TOTAL]);
  const goPrev = useCallback(() => setCur((c) => Math.max(0, c - 1)), []);

  // Post → play the same check-burst as the campaign approve flow, then mark
  // the reply posted. Stays on the current reply so the "Posted" state shows.
  const handlePost = useCallback(() => {
    if (posted[cur]) return;
    setApproveAnim('s1');
    setTimeout(() => setApproveAnim('s2'), 420);
    setTimeout(() => {
      setPosted((prev) => { const next = [...prev]; next[cur] = true; return next; });
      setApproveAnim('idle');
    }, 950);
  }, [cur, posted]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--ios-background-gray)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 44, display: 'flex', justifyContent: 'flex-start' }}>
          <ToolbarButton variant="back" aria-label="Close" onClick={onClose} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)' }}>Reputation</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          {isPosted ? (
            <span style={{
              background: 'rgba(32,161,79,0.17)', border: '1px solid rgba(32,161,79,0.1)', borderRadius: 5,
              padding: '2px 7px', fontFamily: font, fontSize: 12, color: GREEN, whiteSpace: 'nowrap',
            }}>Posted</span>
          ) : (
            <span style={{
              background: 'rgba(255,174,0,0.3)', border: '1px solid rgba(255,174,0,0.5)', borderRadius: 5,
              padding: '2px 7px', fontFamily: font, fontSize: 12, color: '#3f2b00', whiteSpace: 'nowrap',
            }}>Review</span>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ padding: '0 0 10px', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {posted.map((p, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: 99, flexShrink: 0,
              background: p ? GREEN : i === cur ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.08)',
              boxShadow: i === cur ? '0 0 0 2px rgba(255,255,255,0.9), 0 0 0 3.5px rgba(0,0,0,0.25)' : 'none',
              transition: 'background 0.25s, box-shadow 0.25s',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: font, fontSize: 12, color: 'var(--ios-dark-40)', whiteSpace: 'nowrap' }}>{postedCount} of {TOTAL} reviewed</span>
      </div>

      {/* Preview — vertically centered, scrolls when the card is taller than the area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 12px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto 0' }}>
          <ReputationPreview item={item} posted={posted[cur]} approveAnim={approveAnim} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: 'linear-gradient(to bottom, rgba(254,254,254,0) 0%, rgba(254,254,254,0.9) 59.524%)', flexShrink: 0, padding: '8px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CircleButton dir="left" label="Prev" onClick={goPrev} />
          <div style={{ ...GLASS, flex: 1, padding: 4, display: 'flex', alignItems: 'stretch', height: 63 }}>
            <ActionButton icon={<IconEdit />} label="Edit" disabled={isPosted} />
            <ActionButton icon={<IconSend color={GREEN} />} label="Post" onClick={handlePost} disabled={isPosted} />
            <ActionButton icon={<IconEye />} label="View" />
          </div>
          <CircleButton dir="right" label="Next" onClick={goNext} />
        </div>
      </div>
    </div>
  );
}
