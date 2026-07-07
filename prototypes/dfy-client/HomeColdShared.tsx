import type { ComponentType, ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { StatusPill, type StatusPillTone } from '@/staging';
import Check2 from '@/icons/20/Check2';
import MetaBrand from '@/icons/20/MetaBrand';
import Marker03 from '@/icons/20/Marker03';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';

/**
 * Shared building blocks + fixtures for the pre-go-live Home variants —
 * HomeCold (early onboarding) and HomeReviewing (everything but go-live is
 * ready). Keeps the "Ready for you" / "What we're working on" / "Connect
 * your accounts" row components and the account-connection fixture in one
 * place so both variants render identical chrome.
 */

export const WORKSPACE_NAME = 'Grain Design Flooring';
export const STRATEGIST = { name: 'Dana Whitfield', initials: 'DW', title: 'Your Blaze strategist' };

export type Glyph = ComponentType<{ size?: number; color?: string }>;

export type PhaseState = 'done' | 'current' | 'upcoming';

export interface Connection {
  id: string;
  icon: Glyph;
  title: string;
  blurb: string;
  cta: string;
}

export const CONNECTIONS: Connection[] = [
  { id: 'meta', icon: MetaBrand, title: 'Meta (Facebook & Instagram)', blurb: 'Organic posts and paid social publish here.', cta: 'Connect' },
  { id: 'gbp', icon: Marker03, title: 'Google Business Profile', blurb: 'Local posts, review replies, and map ranking.', cta: 'Connect' },
  { id: 'gads', icon: Google, title: 'Google Ads', blurb: 'Paid search runs and optimizes against your goals.', cta: 'Connect' },
  { id: 'site', icon: Globe, title: 'Website & analytics', blurb: 'Track conversions and the leads your marketing drives.', cta: 'Connect' },
];

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
 *  AM sends an item back with addressed feedback). */
export function ReadyRow({ icon: Icon, title, blurb, action, isFirst, badge = 'Ready', badgeTone = 'success', extra }: {
  icon: Glyph;
  title: string;
  blurb: string;
  action: React.ReactNode;
  isFirst?: boolean;
  badge?: string;
  badgeTone?: StatusPillTone;
  extra?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-8)' }}>
      <span aria-hidden style={ICON_BOX}><Icon size={20} color="var(--dark-80)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Heading level={5} style={{ margin: 0 }}>{title}</Heading>
          <StatusPill tone={badgeTone}>{badge}</StatusPill>
        </div>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.5 }}>{blurb}</Text>
        {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
      </div>
      <div style={{ flexShrink: 0, alignSelf: 'center' }}>{action}</div>
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

/** One connection row. Already-connected rows show a success "Connected" pill;
 *  connectable rows show a secondary button that flips them on click. */
export function ConnectionRow({ connection, connected, onConnect, isFirst }: {
  connection: Connection;
  connected: boolean;
  onConnect: () => void;
  isFirst: boolean;
}) {
  const Icon = connection.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderTop: isFirst ? 'none' : '1px solid var(--dark-8)' }}>
      <span aria-hidden style={ICON_BOX}><Icon size={20} color="var(--dark-80)" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Heading level={5} style={{ margin: 0 }}>{connection.title}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 3, lineHeight: 1.45 }}>{connection.blurb}</Text>
      </div>
      {connected ? (
        <StatusPill tone="success">Connected</StatusPill>
      ) : (
        <Button variant="secondary" size="sm" onPress={onConnect}>{connection.cta}</Button>
      )}
    </div>
  );
}
