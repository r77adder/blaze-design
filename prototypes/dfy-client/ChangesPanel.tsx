import { useEffect } from 'react';
import { Heading, Text, Button } from '@/components';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import type { ClientState } from './dev-state';

/**
 * Prototype-only "What's new" drawer, opened from the "Changes" button in the
 * DevStatePanel on the client Home. Lists what shipped today in this PR (the
 * Growth Engine Review), split into UX and UI changes, with a quick link per
 * area that jumps the portal to the state where the change lives. Not part of
 * the shipped product.
 */

type ChangeKind = 'UX' | 'UI';

interface ChangeItem {
  kind: ChangeKind;
  text: string;
}

interface ChangeGroup {
  title: string;
  /** Client-state the quick link jumps to so the change is on screen. */
  jumpTo: ClientState;
  linkLabel: string;
  items: ChangeItem[];
}

// This PR (built today) — "Growth Engine Review for the DFY client" — grouped
// by area. UX items stay specific; UI is summarised per area.
const GROUPS: ChangeGroup[] = [
  {
    title: 'Growth Engine Review',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'A full-screen onboarding review launches from the cold Home: an overview, then Scorecard, Website, Paid Ads, SEO / AEO, Strategy and Integrations.' },
      { kind: 'UX', text: 'Approve or request changes per step; finishing routes the portal to reviewed (all approved) or mixed (changes sent to the strategist).' },
      { kind: 'UI', text: 'Header step nav, per-step Approve / Request changes, and a Back / Approve-all footer.' },
    ],
  },
  {
    title: 'Paid Ads',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'Refocused on two high-intent Google placements: Search text ads and Local Services Ads (Google Guaranteed), six ads in all.' },
      { kind: 'UX', text: 'Approve or request changes on each card; a page-level Approve all sits across from the headline.' },
      { kind: 'UI', text: 'Real PR112 approvals cards, with an image extension on some of the search ads.' },
    ],
  },
  {
    title: 'SEO / AEO articles',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'New step with six buyer-education articles, each described in plain language and targeting a Google or AI-search query.' },
      { kind: 'UX', text: 'Clicking an article opens a webpage-style reader with the hero, headline and drafted sections, sized to fit without scrolling.' },
      { kind: 'UI', text: 'Article cards lead with a hero image and center the summary in a content card.' },
    ],
  },
  {
    title: 'Strategy',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'Restructured into four sections: Digital home, Discovery engine, Lead qualification, and Reporting & analytics.' },
      { kind: 'UX', text: 'Each section approves independently and carries a monthly price, with a grand total at the bottom.' },
      { kind: 'UI', text: 'Paid channels show per-item spend pills.' },
    ],
  },
  {
    title: 'Website',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'A Google Business Profile preview on a phone floats beside the rebuilt website so both owned properties read at once.' },
      { kind: 'UI', text: 'The phone sits outside the site frame and bleeds off the bottom, clearly separate from the website design.' },
    ],
  },
  {
    title: 'Preview & dev controls',
    jumpTo: 'cold',
    linkLabel: 'Open the review',
    items: [
      { kind: 'UX', text: 'A minimal lightbox previews each piece with Prev / Request change / Approve / Next; Request change opens a dropdown under the button.' },
      { kind: 'UX', text: 'This Changes drawer opens from the dev panel, and the panel hides itself while the review overlay is open.' },
    ],
  },
];

/** Total number of listed changes — surfaced on the DevStatePanel trigger. */
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

export function ChangesPanel({ open, onClose, onJump }: { open: boolean; onClose: () => void; onJump?: (state: ClientState) => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (state: ClientState) => { onJump?.(state); onClose(); };

  if (!open) return null;

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.24)', zIndex: 80 }} />
      {/* drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '92vw', zIndex: 81,
          background: 'var(--light-100)', borderLeft: '1px solid var(--dark-8)',
          boxShadow: '-16px 0 40px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column',
          fontFamily: "'Sohne', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '24px 32px', borderBottom: '1px solid var(--dark-8)' }}>
          <div style={{ minWidth: 0 }}>
            <Heading level={4} style={{ margin: 0 }}>What&rsquo;s new</Heading>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>Shipped today, Growth Engine Review</Text>
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
                <Button variant="secondary" size="sm" endIcon={ArrowRightSm} onPress={() => go(g.jumpTo)}>
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
