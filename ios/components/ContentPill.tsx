import React from 'react';

export type ContentPillVariant =
  | 'review'
  | 'approved'
  | 'approved-warning'
  | 'draft'
  | 'posted'
  | 'failed'
  | 'partial-posted';

export interface ContentPillProps {
  variant: ContentPillVariant;
}

const FONT = "'Sohne', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";

// Warning icon pill (yellow circle) used in approved-warning + partial-posted
function WarningIconPill({ bg }: { bg: string }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 99,
        background: bg,
        border: '1px solid rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Alert triangle icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 9V13M12 17H12.01M10.29 4.86L2.45 18C2.15 18.53 1.99 19.12 2 19.72C2.01 20.32 2.18 20.9 2.49 21.42C2.81 21.94 3.26 22.37 3.79 22.67C4.32 22.97 4.92 23.13 5.52 23.14H18.48C19.08 23.13 19.68 22.97 20.21 22.67C20.74 22.37 21.19 21.94 21.51 21.42C21.82 20.9 21.99 20.32 22 19.72C22.01 19.12 21.85 18.53 21.55 18L13.71 4.86C13.4 4.35 12.96 3.93 12.43 3.64C11.9 3.36 11.3 3.21 10.7 3.21C10.1 3.21 9.5 3.36 8.97 3.64C8.44 3.93 8 4.35 7.69 4.86H10.29Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SinglePill({
  tint,
  border,
  textColor,
  label,
}: {
  tint: string;
  border: string;
  textColor: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 4px',
        borderRadius: 4.69,
        // White base + color tint on top — matches Figma's layered backgroundImage approach
        backgroundImage: `linear-gradient(${tint}, ${tint}), linear-gradient(white, white)`,
        border,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: '0.12px',
          color: textColor,
          padding: '0 4px 1px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function ContentPill({ variant }: ContentPillProps) {
  if (variant === 'approved-warning') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <SinglePill
          tint="rgba(32,161,79,0.17)"
          border="1px solid rgba(32,161,79,0.1)"
          textColor="#20a14f"
          label="Approved"
        />
        <WarningIconPill bg="rgb(255,200,0)" />
      </div>
    );
  }

  if (variant === 'partial-posted') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        <SinglePill
          tint="rgba(106,0,255,0.1)"
          border="1px solid rgba(106,0,255,0.1)"
          textColor="#6a00ff"
          label="Posted"
        />
        <WarningIconPill bg="rgb(236,30,40)" />
      </div>
    );
  }

  const MAP: Record<
    Exclude<ContentPillVariant, 'approved-warning' | 'partial-posted'>,
    { tint: string; border: string; textColor: string; label: string }
  > = {
    review: {
      tint: 'rgba(255,174,0,0.3)',
      border: '1px solid rgba(255,174,0,0.5)',
      textColor: '#3f2b00',
      label: 'Review',
    },
    approved: {
      tint: 'rgba(32,161,79,0.17)',
      border: '1px solid rgba(32,161,79,0.1)',
      textColor: '#20a14f',
      label: 'Approved',
    },
    draft: {
      tint: 'rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.04)',
      textColor: 'rgba(0,0,0,0.6)',
      label: 'Draft',
    },
    posted: {
      tint: 'rgba(106,0,255,0.1)',
      border: '1px solid rgba(106,0,255,0.1)',
      textColor: '#6a00ff',
      label: 'Posted',
    },
    failed: {
      tint: 'rgba(236,30,40,0.1)',
      border: '1px solid rgba(236,30,40,0.1)',
      textColor: '#ae2222',
      label: 'Failed',
    },
  };

  const config = MAP[variant as keyof typeof MAP];
  return <SinglePill {...config} />;
}
