import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Text } from '@/components';
import Check2 from '@/icons/20/Check2';

/** When false, a CardShell renders read-only (no actions, not interactive) so
 *  completed cards stay visible in the transcript instead of collapsing. */
export const CardActiveContext = createContext(true);

/**
 * Shared chat primitives + the running "selections" the user makes as the
 * agent walks them through V2. Kept in its own module so both the chat shell
 * (OnboardingChat) and the per-topic cards (chat-cards) can import without a
 * circular dependency.
 */

export interface Selections {
  competitors: string[]; // tracked competitor ids
  likedAds: string[]; // swipe item ids the user liked
  adNotes: Record<string, string>;
  taglines: string[]; // chosen taglines
  primaryColor: string; // chosen brand color hex
  channels: string[]; // chosen channels to develop
  approved: string[]; // approved creative asset ids
  changes: string[]; // creative asset ids with change requests
  plan: 'growth' | 'starter';
}

export const INITIAL_SELECTIONS: Selections = {
  competitors: [],
  likedAds: [],
  adNotes: {},
  taglines: [],
  primaryColor: '',
  channels: [],
  approved: [],
  changes: [],
  plan: 'growth',
};

// ─── Agent identity ───────────────────────────────────────────────────────────

/** Blaze "B" avatar on the brand-yellow background. */
export function AgentAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--brand)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Sohne', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.5,
        color: 'var(--dark-90)',
        lineHeight: 1,
      }}
    >
      B
    </span>
  );
}

export function AgentRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <AgentAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function AgentBubble({ children }: { children: ReactNode }) {
  return (
    <AgentRow>
      <div
        style={{
          display: 'inline-block',
          background: 'var(--dark-3)',
          color: 'var(--dark-90)',
          padding: '10px 14px',
          borderRadius: 14,
          borderTopLeftRadius: 4,
          fontSize: 16,
          lineHeight: 1.5,
          maxWidth: '100%',
        }}
      >
        {children}
      </div>
    </AgentRow>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          display: 'inline-block',
          background: 'var(--dark-90)',
          color: 'var(--light-100)',
          padding: '10px 14px',
          borderRadius: 14,
          borderTopRightRadius: 4,
          fontSize: 16,
          lineHeight: 1.5,
          maxWidth: '80%',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="var(--dark-8)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function FetchingBubble({ lines, onDone, lineDelay = 700 }: { lines: string[]; onDone: () => void; lineDelay?: number }) {
  const [shown, setShown] = useState(0);
  const fired = useRef(false);
  useEffect(() => {
    if (shown >= lines.length) {
      if (fired.current) return;
      fired.current = true;
      const t = window.setTimeout(onDone, 550);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setShown((s) => s + 1), lineDelay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  return (
    <AgentRow>
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 8,
          background: 'var(--dark-3)',
          borderRadius: 14,
          borderTopLeftRadius: 4,
          padding: '12px 16px',
        }}
      >
        {lines.map((line, i) => {
          if (i > shown) return null;
          const done = i < shown;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {done ? <Check2 size={16} color="var(--positive-60)" /> : <Spinner />}
              <Text variant="secondary" style={{ color: done ? 'var(--dark-60)' : 'var(--dark-90)' }}>
                {line}
              </Text>
            </div>
          );
        })}
      </div>
    </AgentRow>
  );
}

// ─── Card scaffolding ─────────────────────────────────────────────────────────

/** A bordered agent card with an optional title and a trailing action row. */
export function CardShell({
  title,
  children,
  primary,
  secondary,
  width = 520,
}: {
  title?: ReactNode;
  children: ReactNode;
  primary?: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
  /** Caps the content width so it wraps the content instead of stretching. */
  width?: number;
}) {
  const active = useContext(CardActiveContext);
  // Frameless: no outer box, so collections of inner cards don't read as
  // boxes-within-boxes, and the content sits in the stream like a message.
  return (
    <AgentRow>
      <div style={{ maxWidth: width, pointerEvents: active ? 'auto' : 'none' }}>
        {title && (
          <Text variant="largeList" style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 600, marginBottom: 10 }}>
            {title}
          </Text>
        )}
        {children}
        {active ? (
          (primary || secondary) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              {primary && (
                <Button variant="primary" size="sm" onPress={primary.onPress}>
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button variant="secondary" size="sm" onPress={secondary.onPress}>
                  {secondary.label}
                </Button>
              )}
            </div>
          )
        ) : (
          <div style={{ marginTop: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--positive-60)', fontSize: 14, fontWeight: 500 }}>
              <Check2 size={14} color="var(--positive-60)" />
              Confirmed
            </span>
          </div>
        )}
      </div>
    </AgentRow>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 8 }}>
      {children}
    </Text>
  );
}

/** Initials logo chip for competitors / brands that have no real logo asset. */
export function LogoAvatar({ label, color, size = 36 }: { label: string; color: string; size?: number }) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 8,
        background: color,
        color: 'var(--light-100)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
      }}
    >
      {initials}
    </span>
  );
}

export function SelectChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 500,
        background: selected ? 'var(--dark-90)' : 'var(--light-100)',
        color: selected ? 'var(--light-100)' : 'var(--dark-80)',
        border: selected ? '1px solid var(--dark-90)' : '1px solid var(--dark-8)',
        transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
      }}
    >
      {selected && <Check2 size={14} color="var(--light-100)" />}
      {children}
    </button>
  );
}
