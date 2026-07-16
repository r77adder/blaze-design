import type { ComponentType, ReactNode } from 'react';
import { Heading, Text } from '@/components';
import { StatusPill, type StatusPillTone } from '@/staging';
import Check2 from '@/icons/20/Check2';

/**
 * Shared building blocks + fixtures for the pre-go-live Home variants —
 * HomeCold (review ready), HomeReviewed (approved), and HomeMixed (changes
 * requested). Keeps the "Ready for you" / "What we're working on" row
 * components in one place so every variant renders identical chrome. (The
 * "Connect your accounts" section lives in ConnectAccounts.tsx.)
 */

export const WORKSPACE_NAME = 'Grain Design Flooring';
export const STRATEGIST = { name: 'Dana Whitfield', initials: 'DW', title: 'Your Blaze strategist' };

export type Glyph = ComponentType<{ size?: number; color?: string }>;

export type PhaseState = 'done' | 'current' | 'upcoming';

export const ICON_BOX: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 8,
  flexShrink: 0,
  background: 'var(--dark-4)',
};

/** A "Ready for you" row: muted icon, title + status pill, blurb, and a
 *  single action the client can take now. Lives in the shared section Card.
 *  `extra` renders below the blurb — used for a Callout note (e.g. when the
 *  AM sends an item back with addressed feedback). Pass `action` for a
 *  vertically-centered action column, or `titleAction` to sit the action
 *  inline with the title, pushed to the right (used on tall cards where a
 *  centered action would float against the middle of a callout). */
export function ReadyRow({ icon: Icon, title, blurb, action, titleAction, isFirst, badge = 'Ready', badgeTone = 'success', extra }: {
  icon: Glyph;
  title: string;
  blurb: string;
  action?: React.ReactNode;
  titleAction?: React.ReactNode;
  isFirst?: boolean;
  badge?: string;
  badgeTone?: StatusPillTone;
  extra?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-8)' }}>
      <span aria-hidden style={ICON_BOX}><Icon size={20} color="var(--dark-80)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Heading level={5} style={{ margin: 0 }}>{title}</Heading>
          <StatusPill tone={badgeTone}>{badge}</StatusPill>
          {titleAction && <><span style={{ flex: 1 }} />{titleAction}</>}
        </div>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.5 }}>{blurb}</Text>
        {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
      </div>
      {action && <div style={{ flexShrink: 0, alignSelf: 'center' }}>{action}</div>}
    </div>
  );
}

/** One onboarding phase row inside the "What we're working on" card. */
export function PhaseRow({ icon: Icon, label, blurb, state, isFirst }: {
  icon: Glyph;
  label: string;
  blurb: string;
  state: PhaseState;
  isFirst: boolean;
}) {
  const done = state === 'done';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-8)',
        opacity: state === 'upcoming' ? 0.7 : 1,
      }}
    >
      <span aria-hidden style={ICON_BOX}>
        {done ? <Check2 size={20} color="var(--dark-80)" /> : <Icon size={20} color="var(--dark-80)" />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0 }}>{label}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>{blurb}</Text>
      </div>
      {done ? (
        <StatusPill tone="success">Done</StatusPill>
      ) : state === 'current' ? (
        <StatusPill tone="neutral">In progress</StatusPill>
      ) : (
        <StatusPill tone="neutral">Up next</StatusPill>
      )}
    </div>
  );
}
