/**
 * ContentPreviewFooter — gradient action bar for content review/approval flow.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 7413-121088
 *
 * Structure
 * ─────────
 *   Gradient container
 *   ├── Metadata row  (centered: Content type · Posting on)
 *   └── Action row    (Prev circle · shared glass pill · Next circle)
 *
 * Variants
 * ─────────
 *   review             → Don't Post (red) | Approve (green) | Actions
 *   dont-post          → Reschedule | Regenerate | Actions  (date = "Not scheduled")
 *   approved-connected → Reschedule | Post (green badge)    | Actions
 *   approved-0-connect → Reschedule | Connect (yellow "0")  | Actions
 *   approved-alert     → Reschedule | Post (yellow alert)   | Actions
 *   posted             → [Post — single centered button]
 *   posted-failed      → [Post — single, red alert badge]
 */

import React from 'react';

export type ContentPreviewFooterVariant =
  | 'review'
  | 'dont-post'
  | 'approved-connected'
  | 'approved-0-connected'
  | 'approved-alert'
  | 'posted'
  | 'posted-failed';

export interface ContentPreviewFooterProps {
  variant?: ContentPreviewFooterVariant;
  /** E.g. "Instagram Post", "Story", "Reel" */
  contentType?: string;
  /** Formatted date string, e.g. "Fri Sep 18 at 11:15am" */
  date?: string;
  /** Number shown in circle badge (approved-connected / posted variants) */
  badgeCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  /** Primary CTA: Approve / Post / Connect */
  onPrimaryAction?: () => void;
  /** Secondary CTA: Don't Post / Reschedule / Regenerate */
  onSecondaryAction?: () => void;
  onActions?: () => void;
  onDatePress?: () => void;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const FONT    = "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
const DARK_4  = 'rgba(0,0,0,0.04)';
const DARK_8  = 'rgba(0,0,0,0.08)';
const DARK_60 = 'rgba(0,0,0,0.6)';
const DARK_80 = 'rgba(0,0,0,0.8)';
const DARK_90 = 'rgba(0,0,0,0.9)';
const GREEN   = '#20a14f';
const RED     = '#bc010b';
const YELLOW  = '#ffc800';

// ── Glass pill shared style ───────────────────────────────────────────────────
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.08)',
  borderRadius: 99,
  overflow: 'hidden',
};

// ── Inline SVG icons (strokeWidth = 1.15) ────────────────────────────────────

function IconChevronLeft({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown({ size = 12, color = DARK_60 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** x-circle-contained — red outlined circle with X */
function IconXCircle({ color = RED }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.15" />
      <path d="M9 9L15 15M15 9L9 15" stroke={color} strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

/** approvals — green outlined circle with checkmark */
function IconApprovals({ color = GREEN }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.15" />
      <path d="M8 12.5L11 15.5L16.5 8.5" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSend({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ color = DARK_80 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRefresh({ color = DARK_90 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1 4V10H7" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15C4.47 17.72 7.05 19.73 10.08 19.97C13.1 20.21 16.07 18.63 17.49 15.96C18.92 13.29 18.48 10.05 16.4 7.85C14.32 5.65 11.12 4.96 8.33 6.07L1 10" stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDots({ color = DARK_80 }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1.5" fill={color} />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      <circle cx="19" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

// ── Badge overlay ─────────────────────────────────────────────────────────────

type BadgeKind = 'count-green' | 'count-yellow' | 'count-dark' | 'alert-yellow' | 'alert-red';

function Badge({ kind, count }: { kind: BadgeKind; count?: number }) {
  const isAlert = kind === 'alert-yellow' || kind === 'alert-red';
  const bg =
    kind === 'count-green'  ? GREEN    :
    kind === 'count-yellow' ? YELLOW   :
    kind === 'count-dark'   ? DARK_90  :
    kind === 'alert-yellow' ? YELLOW   : '#ec1e28';

  return (
    <div style={{
      position: 'absolute',
      // Sit right at the arc of the rounded highlight (borderRadius:99 on ~70×55px
      // → effective r=27.5; 45° corner point ≈ 8px from top-right corner)
      top: -1,
      right: -1,
      minWidth: 18,
      height: 18,
      borderRadius: isAlert ? 4 : 99,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
      pointerEvents: 'none',
      border: '1.5px solid rgba(255,255,255,0.9)',
    }}>
      {isAlert ? (
        <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
          <path d="M5 0.5L9.5 8.5H0.5L5 0.5Z" fill="#fff" />
          <path d="M5 3.5V5.5" stroke={kind === 'alert-yellow' ? '#000' : '#fff'} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="7" r="0.5" fill={kind === 'alert-yellow' ? '#000' : '#fff'} />
        </svg>
      ) : (
        <span style={{
          fontFamily: FONT, fontSize: 10, fontWeight: 600,
          color: kind === 'count-yellow' ? '#000' : '#fff',
          lineHeight: 1,
        }}>
          {count ?? 0}
        </span>
      )}
    </div>
  );
}

// ── Shared pill button slot ───────────────────────────────────────────────────

interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onClick?: () => void;
  highlightBg?: string;
  badge?: React.ReactNode;
}

function PillButton({ icon, label, labelColor = DARK_90, onClick, highlightBg, badge }: PillButtonProps) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        cursor: 'pointer',
        height: '100%',
        background: highlightBg ?? 'transparent',
        borderRadius: highlightBg ? 99 : undefined,
        WebkitTapHighlightColor: 'transparent',
        paddingTop: 6,
        paddingBottom: 7,
        paddingInline: 8,
      }}
    >
      {icon}
      <span style={{
        fontFamily: FONT,
        fontSize: 10,
        fontWeight: 500,
        color: labelColor,
        lineHeight: 1.4,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        letterSpacing: '0.1px',
      }}>
        {label}
      </span>
      {badge}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ContentPreviewFooter({
  variant = 'review',
  contentType = 'Still image',
  date = 'Fri Sep 18 at 11:15am',
  badgeCount = 3,
  onPrev,
  onNext,
  onPrimaryAction,
  onSecondaryAction,
  onActions,
  onDatePress,
}: ContentPreviewFooterProps) {

  const isPosted   = variant === 'posted' || variant === 'posted-failed';
  const isDontPost = variant === 'dont-post';
  const showChevron = !isPosted;
  const dateLabel   = isPosted ? 'Posted on' : 'Posting on';
  const dateValue   = isDontPost ? 'Not scheduled' : date;

  // ── Badge resolution ──────────────────────────────────────────────────────
  const primaryBadge: React.ReactNode = (() => {
    if (variant === 'approved-connected')   return <Badge kind="count-green"  count={badgeCount} />;
    if (variant === 'approved-0-connected') return <Badge kind="count-yellow" count={0} />;
    if (variant === 'approved-alert')       return <Badge kind="alert-yellow" />;
    if (variant === 'posted')               return <Badge kind="count-dark"   count={badgeCount} />;
    if (variant === 'posted-failed')        return <Badge kind="alert-red" />;
    return null;
  })();

  // ── Primary button highlight bg ───────────────────────────────────────────
  const primaryHighlight: string | undefined = (() => {
    if (variant === 'approved-connected' || variant === 'approved-0-connected') return DARK_4;
    if (variant === 'approved-alert')  return 'rgba(255,200,0,0.1)';
    if (variant === 'posted')          return DARK_4;
    if (variant === 'posted-failed')   return 'rgba(236,30,40,0.1)';
    return undefined;
  })();

  // ── Middle pill buttons ───────────────────────────────────────────────────
  const renderMiddleButtons = () => {
    if (isPosted) {
      return (
        <PillButton
          icon={<IconSend color={DARK_90} />}
          label="Post"
          onClick={onPrimaryAction}
          highlightBg={primaryHighlight}
          badge={primaryBadge}
        />
      );
    }

    if (variant === 'review') {
      return (
        <>
          <PillButton
            icon={<IconXCircle color={RED} />}
            label="Don't Post"
            labelColor={RED}
            onClick={onSecondaryAction}
          />
          <PillButton
            icon={<IconApprovals color={GREEN} />}
            label="Approve"
            labelColor={GREEN}
            onClick={onPrimaryAction}
          />
          <PillButton
            icon={<IconDots color={DARK_80} />}
            label="Actions"
            labelColor={DARK_80}
            onClick={onActions}
          />
        </>
      );
    }

    if (variant === 'dont-post') {
      return (
        <>
          <PillButton icon={<IconCalendar color={DARK_90} />} label="Reschedule" onClick={onSecondaryAction} />
          <PillButton icon={<IconRefresh color={DARK_90} />}  label="Regenerate" onClick={onPrimaryAction} />
          <PillButton icon={<IconDots color={DARK_80} />}     label="Actions"    labelColor={DARK_80} onClick={onActions} />
        </>
      );
    }

    // approved-* variants
    const primaryLabel = variant === 'approved-0-connected' ? 'Connect' : 'Post';
    const primaryColor = variant === 'approved-0-connected' ? DARK_80 : DARK_90;

    return (
      <>
        <PillButton icon={<IconCalendar />}  label="Reschedule" labelColor={DARK_80} onClick={onSecondaryAction} />
        <PillButton
          icon={<IconSend color={primaryColor} />}
          label={primaryLabel}
          labelColor={primaryColor}
          onClick={onPrimaryAction}
          highlightBg={primaryHighlight}
          badge={primaryBadge}
        />
        <PillButton icon={<IconDots />} label="Actions" labelColor={DARK_80} onClick={onActions} />
      </>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom, rgba(254,254,254,0) 0%, rgba(254,254,254,0.9) 59.524%)',
      flexShrink: 0,
    }}>

      {/* ── Metadata row — centered ── */}
      <div style={{
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingInline: 20,
        paddingTop: 8,
        paddingBottom: 8,
      }}>

        {/* Content type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <span style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 500,
            color: DARK_60, lineHeight: 1.4, letterSpacing: '0.1px',
            textAlign: 'center', whiteSpace: 'nowrap',
          }}>
            Content type
          </span>
          <div style={{
            height: 28, paddingInline: 6, borderRadius: 99,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 400,
              color: DARK_90, lineHeight: 1.39, letterSpacing: '0.14px',
              whiteSpace: 'nowrap',
            }}>
              {contentType}
            </span>
          </div>
        </div>

        {/* Posting on / Posted on */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <span style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 500,
            color: DARK_60, lineHeight: 1.4, letterSpacing: '0.1px',
            textAlign: 'center', whiteSpace: 'nowrap',
          }}>
            {dateLabel}
          </span>
          <div
            onClick={showChevron ? onDatePress : undefined}
            style={{
              height: 28, paddingInline: 6, borderRadius: 99,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 4, cursor: showChevron ? 'pointer' : 'default',
            }}
          >
            <span style={{
              fontFamily: FONT, fontSize: 14, fontWeight: 400,
              color: DARK_90, lineHeight: 1.39, letterSpacing: '0.14px',
              whiteSpace: 'nowrap',
            }}>
              {dateValue}
            </span>
            {showChevron && <IconChevronDown size={12} color={DARK_60} />}
          </div>
        </div>

      </div>

      {/* ── Action row ── */}
      <div style={{
        padding: '0 20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>

        {/* Prev — 63×63 circle */}
        <div
          onClick={onPrev}
          style={{ ...GLASS, width: 63, height: 63, flexShrink: 0, padding: 4, cursor: 'pointer' }}
        >
          <div style={{
            width: 55, height: 55, borderRadius: 99,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <IconChevronLeft color={DARK_90} />
            <span style={{
              fontFamily: FONT, fontSize: 10, fontWeight: 500,
              color: DARK_90, lineHeight: 1.4, letterSpacing: '0.1px',
            }}>
              Prev
            </span>
          </div>
        </div>

        {/* Middle shared pill — flex:1, no dividers */}
        <div style={{
          ...GLASS,
          flex: 1,
          padding: 4,
          display: 'flex',
          alignItems: 'stretch',
          height: 63,
        }}>
          {renderMiddleButtons()}
        </div>

        {/* Next — 63×63 circle */}
        <div
          onClick={onNext}
          style={{ ...GLASS, width: 63, height: 63, flexShrink: 0, padding: 4, cursor: 'pointer' }}
        >
          <div style={{
            width: 55, height: 55, borderRadius: 99,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <IconChevronRight color={DARK_90} />
            <span style={{
              fontFamily: FONT, fontSize: 10, fontWeight: 500,
              color: DARK_90, lineHeight: 1.4, letterSpacing: '0.1px',
            }}>
              Next
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
