import React from 'react';

export type CampaignPillVariant =
  | 'connect'
  | 'review'
  | 'pre-gen'
  | 'approved'
  | 'posting'
  | 'failed'
  | 'posted'
  | 'strategy';

export interface CampaignPillProps {
  variant: CampaignPillVariant;
  /** Override the default label text */
  label?: string;
  /** Emoji shown before label for strategy variant */
  emoji?: string;
}

const FONT = "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";

// Opaque helper — white base + tint overlay so pills stay readable on any surface
const tinted = (tint: string, border: string, color: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(${tint}, ${tint}), linear-gradient(#fff, #fff)`,
  border,
  color,
});

const VARIANT_STYLES: Record<CampaignPillVariant, React.CSSProperties> = {
  // Solid/intentional colours — keep as-is
  connect:  { background: 'rgb(255,200,0)', border: '1px solid rgba(0,0,0,0.08)', color: '#3f2b00' },
  strategy: { background: 'rgba(0,0,0,0.6)', color: '#ffffff' },

  // White-based opaque variants
  review:   tinted('rgba(255,174,0,0.3)',    '1px solid rgba(255,174,0,0.4)',    '#3f2b00'),
  'pre-gen':tinted('rgba(0,0,0,0.06)',       '1px solid rgba(0,0,0,0.08)',       'rgba(0,0,0,0.6)'),
  approved: tinted('rgba(32,161,79,0.14)',   '1px solid rgba(32,161,79,0.2)',    '#20a14f'),
  posting:  tinted('rgba(0,131,226,0.1)',    '1px solid rgba(0,131,226,0.2)',    '#0083e2'),
  failed:   tinted('rgba(236,30,40,0.1)',    '1px solid rgba(236,30,40,0.2)',    '#ae2222'),
  posted:   tinted('rgba(106,0,255,0.1)',    '1px solid rgba(106,0,255,0.15)',   '#6a00ff'),
};

const DEFAULT_LABELS: Record<CampaignPillVariant, string> = {
  connect:   '4 accounts to connect',
  review:    '12 posts to review',
  'pre-gen': 'Generates in 3 days',
  approved:  'Approved',
  posting:   'Posting',
  failed:    'Failed',
  posted:    'Posted',
  strategy:  'Strategy',
};

export function CampaignPill({ variant, label, emoji = '🛍️' }: CampaignPillProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const text = label ?? DEFAULT_LABELS[variant];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: variant === 'strategy' ? 3 : 0,
        padding: '2px 4px',
        borderRadius: 4.69,
        flexShrink: 0,
        ...variantStyle,
      }}
    >
      {variant === 'strategy' && (
        <span style={{ fontSize: 14, lineHeight: 1.64 }}>{emoji}</span>
      )}
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: '0.12px',
          color: variantStyle.color,
          padding: '0 4px 1px',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
}
