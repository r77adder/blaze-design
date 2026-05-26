/**
 * CampaignListItem — horizontal campaign row.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 6957-178735
 *
 * Layout: 104×125 thumbnail (r16) — 17px gap — content column — 12px chevron
 * Content column (justify-between, py-4):
 *   top:    date range (12px, dark-90 / dark-25 separator)
 *   middle: title (16px/400) + category label (12px, dark-60)
 *   bottom: campaign status pill
 */

import chevronRightSmall from '@ios/icons/chevron-right-small.svg';

export type CampaignStatusVariant = 'posting' | 'approved' | 'review' | 'scheduled' | 'ready';

export interface CampaignListItemProps {
  thumbnailSrc: string;
  dateStart: string;
  dateEnd: string;
  title: string;
  category: string;
  status: CampaignStatusVariant;
  /** Custom label for review/scheduled variants. */
  statusLabel?: string;
}

const STATUS_STYLES: Record<CampaignStatusVariant, { bg: string; border: string; color: string; defaultLabel: string }> = {
  posting:   { bg: 'rgba(0,131,226,0.1)',   border: 'rgba(0,131,226,0.1)',   color: '#0083e2',            defaultLabel: 'Posting'           },
  approved:  { bg: 'rgba(32,161,79,0.17)',   border: 'rgba(32,161,79,0.1)',   color: '#20a14f',            defaultLabel: 'Approved'          },
  review:    { bg: 'rgba(255,174,0,0.3)',    border: 'rgba(255,174,0,0.3)',   color: '#3f2b00',            defaultLabel: 'In Review'         },
  scheduled: { bg: 'rgba(0,0,0,0.08)',       border: 'rgba(0,0,0,0.04)',      color: 'rgba(0,0,0,0.6)',    defaultLabel: 'Scheduled'         },
  ready:     { bg: 'rgba(0,0,0,0.04)',       border: 'rgba(0,0,0,0.04)',      color: 'rgba(0,0,0,0.6)',    defaultLabel: 'Ready to generate' },
};

function CampaignPill({ status, label }: { status: CampaignStatusVariant; label?: string }) {
  const s = STATUS_STYLES[status];
  const text = label ?? s.defaultLabel;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 4px',
      borderRadius: 4.69,
      background: s.bg,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{
        fontFamily: 'var(--ios-font)',
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0.12,
        color: s.color,
        whiteSpace: 'nowrap',
      }}>
        {text}
      </span>
    </div>
  );
}

export function CampaignListItem({
  thumbnailSrc,
  dateStart,
  dateEnd,
  title,
  category,
  status,
  statusLabel,
}: CampaignListItemProps) {
  const font = 'var(--ios-font)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 17, width: '100%' }}>

      {/* Thumbnail */}
      <div style={{ flexShrink: 0, width: 104, height: 126, display: 'flex', alignItems: 'center' }}>
        <img
          src={thumbnailSrc}
          alt=""
          style={{ width: 104, height: 125, borderRadius: 16, objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 4, paddingBottom: 4 }}>

        {/* Date range */}
        <div style={{ fontFamily: font, fontSize: 12, lineHeight: 1.4, letterSpacing: 0.12, whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--ios-dark-90)' }}>{dateStart}</span>
          <span style={{ color: 'rgba(0,0,0,0.25)' }}>{' – '}</span>
          <span style={{ color: 'var(--ios-dark-90)' }}>{dateEnd}</span>
        </div>

        {/* Title + category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ margin: 0, fontFamily: font, fontSize: 16, fontWeight: 400, lineHeight: 1.5, color: 'var(--ios-dark-90)' }}>
            {title}
          </p>
          <p style={{ margin: 0, fontFamily: font, fontSize: 12, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-60)', letterSpacing: 0.12 }}>
            {category}
          </p>
        </div>

        {/* Status pill */}
        <CampaignPill status={status} label={statusLabel} />

      </div>

      {/* Chevron */}
      <img src={chevronRightSmall} alt="" aria-hidden="true" style={{ width: 16, height: 16, opacity: 0.3, flexShrink: 0 }} />

    </div>
  );
}
