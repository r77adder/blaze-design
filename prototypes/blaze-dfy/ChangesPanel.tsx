import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text, Button } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';

/**
 * Prototype-only review aid (borrowed from PR #118's dfy-client Changes panel).
 * A controlled drawer, opened from the "Changes" button in the DevStatePanel,
 * that lists what shipped in PR #112 split into UX and UI changes, with a quick
 * link per area that jumps straight to the surface. Not part of the shipped
 * product. `prepare` lets the host flip its own dev-state to `steady` before a
 * jump (client / AM surfaces only render live).
 */

type ChangeKind = 'UX' | 'UI';

interface ChangeItem {
  kind: ChangeKind;
  text: string;
}

interface ChangeGroup {
  title: string;
  /** Route the "quick link" navigates to. */
  to: string;
  linkLabel: string;
  items: ChangeItem[];
}

// PR #112, "rebuild approvals around content types", organized by area. UX
// items stay specific; UI is summarised into one general item per area.
const GROUPS: ChangeGroup[] = [
  {
    title: 'AM · Approvals',
    to: '/blaze-dfy/grain-design-flooring/am/approvals',
    linkLabel: 'Open AM approvals',
    items: [
      { kind: 'UX', text: 'Rebuilt around content type: Paid Ads, Organic, SEO / AEO and Reputation, in collapsible sections.' },
      { kind: 'UX', text: 'Status filter subtabs (Draft, In review, Requested changes, Updated, Approved) with a red count.' },
      { kind: 'UX', text: 'Send for review posts a note; the preview can set any status, and Resubmit marks it Updated.' },
      { kind: 'UX', text: 'Preview handles text-only Paid Search and Reputation replies, with Edit / Feedback tabs.' },
      { kind: 'UI', text: 'Fixed-height cards, three per row, true 9:16 reels and stories.' },
    ],
  },
  {
    title: 'Client · Approvals',
    to: '/dfy-client/approvals',
    linkLabel: 'Open client approvals',
    items: [
      { kind: 'UX', text: 'Same cards and layout as the AM side, with the same subtabs minus Draft.' },
      { kind: 'UX', text: 'The note carries the pending count and a large Approve all; Previous batches sits by the avatar.' },
      { kind: 'UX', text: 'Updated pieces open on the Feedback tab with the request-to-revision thread.' },
      { kind: 'UX', text: 'Steady always lands on a populated pipeline, never an empty state.' },
    ],
  },
  {
    title: 'Client · Home',
    to: '/dfy-client',
    linkLabel: 'Open client home',
    items: [
      { kind: 'UX', text: 'Trimmed to two notifications: this week’s batch and updated designs.' },
      { kind: 'UI', text: 'Each shows a thumbnail preview and the green Approvals icon.' },
    ],
  },
  {
    title: 'AM · Home',
    to: '/blaze-dfy/grain-design-flooring/am/home',
    linkLabel: 'Open AM home',
    items: [
      { kind: 'UX', text: 'Workstream feed trimmed: filters and Approve all removed, feed ends at the meeting item.' },
    ],
  },
  {
    title: 'Prototype controls',
    to: '/dfy-client/approvals',
    linkLabel: 'Open controls',
    items: [
      { kind: 'UX', text: 'AM / Client switch in the dev panel on both approvals and home, jumping to the matching surface.' },
      { kind: 'UI', text: 'Panel wraps in the sidebar, dims until hover, and groups its controls.' },
    ],
  },
];

/** Total number of listed changes, surfaced on the DevStatePanel trigger. */
export const CHANGES_COUNT = GROUPS.reduce((n, g) => n + g.items.length, 0);

function KindTag({ kind }: { kind: ChangeKind }) {
  const ux = kind === 'UX';
  return (
    <span
      style={{
        alignSelf: 'flex-start', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1,
        padding: '3px 6px', borderRadius: 4,
        background: ux ? 'rgba(124,92,252,0.12)' : 'var(--dark-4)',
        color: ux ? 'var(--purple)' : 'var(--dark-60)',
      }}
    >
      {kind}
    </span>
  );
}

export function ChangesPanel({ open, onClose, prepare }: { open: boolean; onClose: () => void; prepare?: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (to: string) => {
    // Client / AM surfaces only render in the live state, so flip to steady
    // before jumping.
    prepare?.();
    onClose();
    navigate(to);
  };

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.24)', zIndex: 80 }}
      />
      {/* drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '92vw', zIndex: 81,
          background: 'var(--light-100)', borderLeft: '1px solid var(--dark-8)',
          boxShadow: '-16px 0 40px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '24px 32px', borderBottom: '1px solid var(--dark-8)' }}>
          <div style={{ minWidth: 0 }}>
            <Heading level={4} style={{ margin: 0 }}>What&rsquo;s new</Heading>
          </div>
          <button
            type="button"
            aria-label="Close changes"
            onClick={onClose}
            style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, border: 'none', background: 'var(--dark-4)', color: 'var(--dark-60)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 32px 44px' }}>
          {GROUPS.map((g) => (
            <section key={g.title} style={{ padding: '28px 0', borderBottom: '1px solid var(--dark-8)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <Heading level={5} style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{g.title}</Heading>
                <Button variant="secondary" size="sm" endIcon={ArrowRightSm} onPress={() => go(g.to)}>
                  {g.linkLabel}
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {g.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                    <KindTag kind={it.kind} />
                    <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{it.text}</Text>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}
