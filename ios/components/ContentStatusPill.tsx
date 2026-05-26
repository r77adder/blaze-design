/**
 * ContentStatusPill — content status label chip.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4971:13499
 *
 * r4.69, px-4 py-2, 12px Söhne Buch.
 * Variants: review | approved | posted | failed | draft | approved-warning | partial-posted
 */

export type ContentStatusVariant =
  | 'review'
  | 'approved'
  | 'posted'
  | 'posting'
  | 'failed'
  | 'draft'
  | 'needs-context'
  | 'approved-warning'
  | 'partial-posted';

export interface ContentStatusPillProps {
  variant: ContentStatusVariant;
  label?: string;
}

const VARIANT_STYLES: Record<
  ContentStatusVariant,
  { bg: string; color: string; label: string }
> = {
  review: {
    bg: 'var(--ios-warning-30)',
    color: 'var(--ios-warning-text)',
    label: 'Review',
  },
  approved: {
    bg: 'var(--ios-green-10)',
    color: 'var(--ios-green)',
    label: 'Approved',
  },
  posted: {
    bg: 'var(--ios-upgrade-10)',
    color: 'var(--ios-upgrade)',
    label: 'Posted',
  },
  posting: {
    bg: 'rgba(0,131,226,0.1)',
    color: '#0083e2',
    label: 'Posting',
  },
  failed: {
    bg: 'rgba(174, 34, 34, 0.1)',
    color: '#ae2222',
    label: 'Failed',
  },
  draft: {
    bg: 'var(--ios-dark-8)',
    color: 'var(--ios-dark-60)',
    label: 'Draft',
  },
  'needs-context': {
    bg: '#ffc800',
    color: 'var(--ios-dark-90)',
    label: 'Needs context',
  },
  'approved-warning': {
    bg: 'var(--ios-green-10)',
    color: 'var(--ios-green)',
    label: 'Approved',
  },
  'partial-posted': {
    bg: 'var(--ios-upgrade-10)',
    color: 'var(--ios-upgrade)',
    label: 'Partially Posted',
  },
};

export function ContentStatusPill({ variant, label }: ContentStatusPillProps) {
  const { bg, color, label: defaultLabel } = VARIANT_STYLES[variant];
  const showWarning = variant === 'approved-warning';
  const showError = variant === 'partial-posted';
  const showUpload = variant === 'needs-context';

  // Opaque: white base + tint overlay via layered backgroundImage so pills
  // stay readable on any surface (dark hero, gray sheet, etc.)
  const backgroundImage = `linear-gradient(${bg}, ${bg}), linear-gradient(#fff, #fff)`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundImage,
        borderRadius: 4.69,
        padding: '2px 4px',
        flexShrink: 0,
      }}
    >
      {showUpload && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 1v6M2 4l3-3 3 3M1 9h8" stroke="var(--ios-dark-90)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span
        style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: '0.24px',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {label ?? defaultLabel}
      </span>
      {showWarning && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="4.5" fill="#ffc800" />
          <rect x="4.5" y="2.5" width="1" height="3" rx="0.5" fill="#3f2b00" />
          <circle cx="5" cy="7" r="0.5" fill="#3f2b00" />
        </svg>
      )}
      {showError && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="4.5" fill="#ae2222" />
          <rect x="4.5" y="2.5" width="1" height="3" rx="0.5" fill="white" />
          <circle cx="5" cy="7" r="0.5" fill="white" />
        </svg>
      )}
    </div>
  );
}
