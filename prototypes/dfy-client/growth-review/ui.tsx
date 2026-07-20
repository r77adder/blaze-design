import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Heading, Text, Button, IconButton, useModals, type StackModalProps } from '@/components';
import { StatusPill } from '@/staging';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Comment from '@/icons/20/Comment';
import Close from '@/icons/20/Close';
import Trash2 from '@/icons/20/Trash2';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import { useWizard, type DecisionStatus } from './wizard';
import type { CreativeItem, CreativeType } from './data';
import { CardBody, TypeIcon, CARD_W, CARD_H, type ContentType, type Post } from './cardbody';
import { ReelPlayer } from './reel-player';

/* Shared review primitives, adapted from dfy-client's Scorecard.tsx and the
 * blaze-dfy AM approvals view so this flow reads like the internal tooling. */

// ─── Score + effort pills (Scorecard design) ─────────────────────────────────

const EFFORT_LABELS = { quick: 'Quick win', medium: 'Medium lift', project: 'Bigger project' } as const;
const EFFORT_TONE = { quick: 'success', medium: 'warning', project: 'accent' } as const;

export const scoreTone = (s: number): 'success' | 'warning' | 'danger' => (s >= 65 ? 'success' : s >= 40 ? 'warning' : 'danger');

export function scoreColor(score: number) {
  if (score >= 65) return 'var(--status-approved)';
  if (score >= 40) return 'var(--status-review)';
  return 'var(--red-70)';
}

export function ScorePill({ score }: { score: number }) {
  return <StatusPill tone={scoreTone(score)} size="md">{score}/100</StatusPill>;
}

export function EffortPill({ effort }: { effort: keyof typeof EFFORT_LABELS }) {
  return <StatusPill tone={EFFORT_TONE[effort]} size="sm">{EFFORT_LABELS[effort]}</StatusPill>;
}

// ─── Tooltip (copied from dfy-client Scorecard) ──────────────────────────────

export function Tooltip({ label, children, width = 300, placement = 'below', align = 'center' }: { label: ReactNode; children: ReactNode; width?: number; placement?: 'above' | 'below'; align?: 'center' | 'right' }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...(align === 'right' ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' }),
            ...(placement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
            width, maxWidth: '80vw', background: 'var(--dark-90)', color: 'var(--light-100)', fontSize: 12,
            fontWeight: 400, lineHeight: 1.5, padding: '8px 10px', borderRadius: 6, zIndex: 40,
            pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

// ─── Bullet columns (Scorecard strengths/weaknesses) ─────────────────────────

export function ReadOnlyBullets({ label, color, icon, items }: { label: string; color: string; icon: string; items: string[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <span style={{ width: 20, height: 20, borderRadius: 99, background: color, color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
        <Heading level={5} style={{ margin: 0, color }}>{label}</Heading>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
            <Text style={{ fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TextArea + Popover (ReviewStrategy design) ──────────────────────────────

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: CSSProperties }) {
  const { style, ...rest } = props;
  return (
    <textarea
      {...rest}
      style={{
        width: '100%', minHeight: 84, borderRadius: 10, border: '1px solid var(--dark-8)', padding: '10px 12px',
        fontFamily: "'Sohne', sans-serif", fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)',
        lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: 'var(--light-100)',
        ...style,
      }}
    />
  );
}

export function Popover({ open, onClose, children, width = 340 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 30, width,
        background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12,
        boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left',
      }}
    >
      {children}
    </div>
  );
}

/** "Request Changes" button + note popover, bound to one decision key. Once a
 *  change exists it flips to an "Edit change" affordance — the popover opens
 *  pre-filled with the current note so the client can revise or withdraw it. */
export function RequestChangesAction({ decisionKey, prompt, size = 'sm', label = 'Request Changes' }: { decisionKey: string; prompt: string; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const { decisions, decide } = useWizard();
  const decision = decisions[decisionKey];
  const editing = decision?.status === 'changes';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(decision?.note ?? '');
  // Re-sync the draft to the current note every time the popover opens, so
  // editing always starts from what was actually requested.
  const toggle = () => { if (!open) setDraft(decision?.note ?? ''); setOpen((o) => !o); };
  return (
    <div style={{ position: 'relative' }}>
      <Button size={size} variant={editing ? 'red' : 'secondary'} frontIcon={editing ? Edit3 : Comment} onPress={toggle}>
        {editing ? 'Edit change' : label}
      </Button>
      <Popover open={open} onClose={() => setOpen(false)}>
        <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block' }}>{prompt}</Text>
        <TextArea autoFocus value={draft} placeholder="Add a note for the team…" onChange={(e) => setDraft(e.target.value)} style={{ fontSize: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          {editing
            ? <Button size="sm" variant="ghost" onPress={() => { decide(decisionKey, null); setDraft(''); setOpen(false); }}>Withdraw</Button>
            : <span />}
          <Button size="sm" variant="primary" isDisabled={!draft.trim()} onPress={() => { decide(decisionKey, { status: 'changes', note: draft }); setOpen(false); }}>
            {editing ? 'Save change' : 'Send Request'}
          </Button>
        </div>
      </Popover>
    </div>
  );
}

/** Section header row with Approve / Request Changes verdicts. No divider.
 *  Once a change is requested the verdict button flips to a red "Requested
 *  Change" state (click to withdraw); the note below is editable via a hover
 *  pencil. Mirrors the Approve ⇄ Approved toggle. */
/** A heading that sweeps a blue/red/yellow gradient across itself once on
 *  mount, then settles to solid dark. Same flourish as the Website hero. */
export function GradientHeadline({ children, level = 1, style }: { children: ReactNode; level?: 1 | 2 | 3 | 4; style?: CSSProperties }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1300);
    return () => clearTimeout(t);
  }, []);
  const gradient: CSSProperties = done
    ? {}
    : {
        background: 'linear-gradient(90deg, var(--dark-90) 0%, var(--status-posting) 18%, var(--red-70) 34%, var(--brand) 50%, var(--status-posting) 66%, var(--dark-90) 84%)',
        backgroundSize: '230% 100%',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', color: 'transparent',
        animation: 'gdfHeadlineSweep 1.2s ease-out',
      };
  return (
    <>
      <style>{'@keyframes gdfHeadlineSweep { from { background-position: 130% 0; } to { background-position: -30% 0; } }'}</style>
      <Heading level={level} style={{ margin: 0, ...style, ...gradient }}>{children}</Heading>
    </>
  );
}

export function ReviewSectionHeader({ decisionKey, title, subtitle, hideActions = false }: { decisionKey: string; title: string; subtitle?: string; hideActions?: boolean }) {
  const { decisions, decide } = useWizard();
  const decision = decisions[decisionKey];
  const isChanges = decision?.status === 'changes';
  const isApproved = decision?.status === 'approved';
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
          {subtitle && (
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>{subtitle}</Text>
          )}
        </div>
        {!hideActions && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {isChanges ? (
              <Button size="sm" variant="red" frontIcon={Comment} onPress={() => decide(decisionKey, null)}>Requested Change</Button>
            ) : (
              <RequestChangesAction decisionKey={decisionKey} prompt="What would you like changed?" />
            )}
            <Button
              size="sm"
              variant={isApproved ? 'green' : 'secondary'}
              frontIcon={Check2}
              onPress={() => decide(decisionKey, isApproved ? null : { status: 'approved' })}
            >
              {isApproved ? 'Approved' : 'Approve'}
            </Button>
          </div>
        )}
      </div>
      {!hideActions && isChanges && decision?.note && <ChangeNote decisionKey={decisionKey} note={decision.note} />}
    </div>
  );
}

/** The requested-change note, with a hover pencil that opens an inline editor. */
function ChangeNote({ decisionKey, note }: { decisionKey: string; note: string }) {
  const { decide } = useWizard();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', marginTop: 12, padding: '10px 12px', background: 'rgba(174,34,34,0.06)', borderRadius: 8 }}
    >
      <Text color="var(--dark-80)" style={{ display: 'block', fontSize: 14, lineHeight: 1.5, paddingRight: 28 }}>
        You requested changes: {note}
      </Text>
      {(hovered || editing) && (
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <IconButton size="sm" variant="ghost" icon={Edit3} title="Edit change" onPress={() => { setDraft(note); setEditing((o) => !o); }} />
          <Popover open={editing} onClose={() => setEditing(false)}>
            <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block' }}>Edit your change request</Text>
            <TextArea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} style={{ fontSize: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Button size="sm" variant="ghost" onPress={() => { decide(decisionKey, null); setEditing(false); }}>Withdraw</Button>
              <Button size="sm" variant="primary" isDisabled={!draft.trim()} onPress={() => { decide(decisionKey, { status: 'changes', note: draft }); setEditing(false); }}>Save change</Button>
            </div>
          </Popover>
        </div>
      )}
    </div>
  );
}

// ─── Creative cards + preview (PR112 approvals CardBody, copied verbatim) ─────

// growth-review's creative types map onto the PR112 content types so the exact
// same CardBody renders them. Labels stay specific to this flow.
const TO_POST_TYPE: Record<CreativeType, ContentType> = {
  Video: 'short',
  'Meta Ad': 'paid-social',
  'Still Image': 'still',
  Photo: 'still',
  'Quote Card': 'still',
  'Paid Search': 'paid-search',
  'Local Services Ad': 'lsa',
  'SEO Article': 'seo-article',
};

const TYPE_LABEL_LOCAL: Record<CreativeType, string> = {
  Video: 'Video', 'Meta Ad': 'Meta Ad', 'Still Image': 'Still Image', Photo: 'Photo', 'Quote Card': 'Quote Card',
  'Paid Search': 'Google Search', 'Local Services Ad': 'Local Services Ad', 'SEO Article': 'SEO / AEO',
};

// Stable numeric id for the Post shape (CardBody only reads it as a key).
const postIdFor = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return h; };

const toPost = (item: CreativeItem): Post => ({
  id: postIdFor(item.id),
  type: TO_POST_TYPE[item.type],
  date: '',
  caption: item.caption,
  img: item.img,
  video: item.video,
  headline: item.headline,
  rating: item.rating,
  reviews: item.reviews,
  area: item.area,
  query: item.query,
});

/** Status shown in the card header (the old posting-time slot) + preview. */
function statusPillFor(status: DecisionStatus | undefined) {
  if (status === 'approved') return <StatusPill tone="success" size="sm">Approved</StatusPill>;
  if (status === 'changes') return <StatusPill tone="warning" size="sm">Changes requested</StatusPill>;
  return <StatusPill tone="neutral" size="sm">In review</StatusPill>;
}

/** Content approval card: the exact PR112 approvals card shell + CardBody, with
 *  the only change being the header's right slot — the posting time is replaced
 *  by the review status. Approve / Request Changes stay inline so the client
 *  never has to open the preview; clicking the body opens the lightbox. */
export function CreativeCard({ item, items, index, onRemove }: { item: CreativeItem; items: CreativeItem[]; index: number; onRemove?: () => void }) {
  const { decisions, decide, mode } = useWizard();
  const { openModal } = useModals();
  const decision = decisions[item.id];
  const isChanges = decision?.status === 'changes';
  const isApproved = decision?.status === 'approved';
  const post = toPost(item);
  const [requesting, setRequesting] = useState(false);
  const [draft, setDraft] = useState('');
  const [hovered, setHovered] = useState(false);

  const open = () => openModal(CreativePreview, { items, initialIndex: index }, { hideUnderlay: true });
  const openRequest = () => { setDraft(decision?.note ?? ''); setRequesting(true); };
  const actionFloat = { boxShadow: '0 2px 10px rgba(0,0,0,0.25)' } as const;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', width: CARD_W, flexShrink: 0, background: hovered ? 'var(--dark-8)' : 'var(--dark-2)', border: '1px solid var(--dark-4)',
        borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        opacity: isApproved ? 0.85 : 1, transition: 'opacity 0.2s, background 0.15s ease',
      }}
    >
      {/* PR112 card region: header + CardBody, fixed height so media scales. The
          date slot now carries the review status. Click the body → lightbox. */}
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        style={{ height: CARD_H, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 12px 2px', flexShrink: 0 }}>
          <TypeIcon type={post.type} size={14} />
          <span style={{ fontSize: 14, color: 'var(--dark-80)', fontFamily: "'Sohne', sans-serif", flex: 1, letterSpacing: '0.14px' }}>{TYPE_LABEL_LOCAL[item.type]}</span>
          {statusPillFor(decision?.status)}
        </div>
        <CardBody post={post} />
      </div>

      {/* AM only: remove the piece, revealed on hover in the top-right. */}
      {mode === 'am' && onRemove && hovered && (
        <button
          type="button"
          title="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, width: 28, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
        >
          <Trash2 size={15} color="var(--light-100)" />
        </button>
      )}

      {/* actions: revealed on hover, pinned to the bottom of the card.
          Approve is one click; Request changes opens the composer overlay. */}
      {!requesting && (
        <div
          style={{
            position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)',
            display: 'flex', gap: 8, whiteSpace: 'nowrap',
            opacity: hovered ? 1 : 0, pointerEvents: hovered ? 'auto' : 'none', transition: 'opacity 140ms ease',
          }}
        >
          <Button size="md" variant={isChanges ? 'red' : 'secondary'} frontIcon={isChanges ? Comment : Edit3} style={actionFloat} onPress={openRequest}>
            {isChanges ? 'Requested Change' : 'Request changes'}
          </Button>
          <Button size="md" variant={isApproved ? 'green' : 'secondary'} frontIcon={Check2} style={actionFloat} onPress={() => decide(item.id, isApproved ? null : { status: 'approved' })}>
            {isApproved ? 'Approved' : 'Approve'}
          </Button>
        </div>
      )}

      {/* request composer, fills the card so it stays within the rounded frame */}
      {requesting && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: 16 }}>
          <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block' }}>What would you like changed?</Text>
          <TextArea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note for the team…" style={{ minHeight: 120, fontSize: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            {isChanges ? <Button size="sm" variant="ghost" onPress={() => { decide(item.id, null); setRequesting(false); }}>Withdraw</Button> : <span />}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="ghost" onPress={() => setRequesting(false)}>Cancel</Button>
              <Button size="sm" variant="primary" isDisabled={!draft.trim()} onPress={() => { decide(item.id, { status: 'changes', note: draft }); setRequesting(false); }}>{isChanges ? 'Save change' : 'Send request'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Minimal lightbox: the creative floats over a blurred grid, with the only
 *  chrome a floating control row (prev · request change · Approve · next).
 *  No sidebar, no header. Click the backdrop to close. */
function CreativePreview({ items, initialIndex, close }: StackModalProps & { items: CreativeItem[]; initialIndex: number }) {
  const { decisions, decide, mode } = useWizard();
  const isAm = mode === 'am';
  const [idx, setIdx] = useState(Math.max(0, initialIndex));
  const item = items[idx];
  const decision = decisions[item.id];
  const isChanges = decision?.status === 'changes';
  const isApproved = decision?.status === 'approved';
  const [requesting, setRequesting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  // Reset the composer whenever the visible item changes.
  useEffect(() => {
    setRequesting(false);
    setEditing(false);
    setDraft(decisions[items[idx].id]?.note ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const go = (n: number) => setIdx((i) => Math.max(0, Math.min(items.length - 1, i + n)));
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const float = { boxShadow: '0 2px 12px rgba(0,0,0,0.22)' } as const;
  const isVideo = item.type === 'Video';
  const isTextAd = item.type === 'Paid Search';
  const isArticle = item.type === 'SEO Article';
  const isLsa = item.type === 'Local Services Ad';

  // Shared review controls (prev / request-change / approve / next).
  const controls = (
    <div onClick={stop} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton size="lg" variant="secondary" icon={ChevronLeft} title="Previous" isDisabled={idx === 0} onPress={() => go(-1)} style={float} />
      <div style={{ position: 'relative' }}>
        <Button size="lg" variant={isChanges ? 'red' : 'secondary'} frontIcon={Comment} style={float} onPress={() => { setDraft(decision?.note ?? ''); setRequesting((o) => !o); }}>
          {isChanges ? 'Requested change' : 'Request change'}
        </Button>
        {requesting && (
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', width: 360, maxWidth: '90vw', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', zIndex: 2 }}>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block' }}>{isChanges ? 'Edit your requested changes' : 'What would you like changed?'}</Text>
            <TextArea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. Swap the hero photo for the white-oak install, and soften the headline." style={{ fontSize: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              {isChanges ? <Button size="sm" variant="ghost" onPress={() => { decide(item.id, null); setRequesting(false); }}>Withdraw</Button> : <span />}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="ghost" onPress={() => setRequesting(false)}>Cancel</Button>
                <Button size="sm" variant="primary" isDisabled={!draft.trim()} onPress={() => { decide(item.id, { status: 'changes', note: draft }); setRequesting(false); }}>{isChanges ? 'Save changes' : 'Send request'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isAm && (
        <Button size="lg" variant={editing ? 'primary' : 'secondary'} frontIcon={editing ? Check2 : Edit3} style={float} onPress={() => setEditing((o) => !o)}>
          {editing ? 'Done' : 'Edit'}
        </Button>
      )}
      <Button size="lg" variant={isApproved ? 'green' : 'primary'} frontIcon={Check2} style={float} onPress={() => decide(item.id, isApproved ? null : { status: 'approved' })}>
        {isApproved ? 'Approved' : 'Approve'}
      </Button>
      <IconButton size="lg" variant="secondary" icon={ChevronRight} title="Next" isDisabled={idx === items.length - 1} onPress={() => go(1)} style={float} />
    </div>
  );

  const closeBtn = (
    <div onClick={stop} style={{ position: 'fixed', top: 24, right: 24, zIndex: 5 }}>
      <IconButton size="lg" variant="secondary" icon={Close} title="Close" onPress={close} style={float} />
    </div>
  );

  // Articles read as a real webpage: the whole overlay scrolls, not a box.
  if (isArticle) {
    return (
      <div
        onClick={close}
        style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto', background: 'rgba(20,20,22,0.40)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', fontFamily: "'Sohne', sans-serif" }}
      >
        <div onClick={stop} style={{ position: 'sticky', top: 0, zIndex: 4, display: 'flex', justifyContent: 'center', padding: '16px 0 12px' }}>
          {controls}
        </div>
        {closeBtn}
        <div style={{ padding: '0 16px 80px' }}>
          <ArticlePreview key={item.id} item={item} onClick={stop} editing={editing} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(20,20,22,0.34)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        fontFamily: "'Sohne', sans-serif",
      }}
    >
      {closeBtn}

      {/* floating controls, large */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
        {controls}
      </div>

      {/* creative: a playable reel for video, the Google ad mock for text ads,
          else the full composed still */}
      {isVideo ? (
        <div onClick={stop} style={{ position: 'relative', height: '78vh', aspectRatio: '9 / 16', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 60px rgba(0,0,0,0.4)', background: '#1a1a1a' }}>
          <ReelPlayer key={item.id} poster={item.img ?? ''} src={item.video} autoPlay duration={12} radius={12} />
        </div>
      ) : isTextAd ? (
        <div onClick={stop} style={{ width: 'min(92vw, 560px)', background: 'var(--light-100)', borderRadius: 12, boxShadow: '0 16px 60px rgba(0,0,0,0.4)', padding: '30px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)', border: '1px solid var(--dark-15)', borderRadius: 5, padding: '1px 7px', lineHeight: '20px' }}>Ad</span>
            <span style={{ fontSize: 16, color: 'var(--dark-60)' }}>graindesignflooring.com</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 400, color: '#1a0dab', lineHeight: 1.3 }}>{item.headline ?? item.caption}</p>
              <p style={{ margin: '14px 0 0', fontSize: 17, color: 'var(--dark-60)', lineHeight: 1.55 }}>{item.caption}</p>
            </div>
            {item.img && <img src={item.img} alt="" style={{ width: 128, height: 128, flexShrink: 0, borderRadius: 10, objectFit: 'cover', display: 'block' }} />}
          </div>
        </div>
      ) : isArticle ? (
        <ArticlePreview key={item.id} item={item} onClick={stop} editing={editing} />
      ) : isLsa ? (
        <div onClick={stop} style={{ width: 'min(92vw, 480px)', height: 300, display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 16px 60px rgba(0,0,0,0.4))' }}>
          <CardBody post={toPost(item)} />
        </div>
      ) : (
        <img
          onClick={stop}
          src={item.previewImg ?? item.img}
          alt={item.title}
          style={{ maxWidth: 'min(88vw, 880px)', maxHeight: '78vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 16px 60px rgba(0,0,0,0.4)' }}
        />
      )}
    </div>
  );
}

/** Article preview: the SEO/AEO piece as it would read on the blog, a scrollable
 *  webpage with browser chrome, hero, headline, and the drafted sections. In AM
 *  edit mode the headline, intro, and each section become inline-editable. */
function ArticlePreview({ item, onClick, editing }: { item: CreativeItem; onClick: (e: React.MouseEvent) => void; editing?: boolean }) {
  const slug = item.id.split(':')[1] ?? '';
  const [headline, setHeadline] = useState(item.headline ?? item.title);
  const [caption, setCaption] = useState(item.caption ?? '');
  const [sections, setSections] = useState(item.sections ?? []);
  const setSection = (i: number, key: 'heading' | 'body', v: string) => setSections((p) => p.map((s, j) => (j === i ? { ...s, [key]: v } : s)));
  const titleInput: CSSProperties = { width: '100%', border: '1px solid var(--dark-15)', borderRadius: 8, padding: '8px 10px', fontFamily: "'Sohne', sans-serif", fontSize: 26, fontWeight: 500, color: 'var(--dark-90)', outline: 'none', boxSizing: 'border-box', lineHeight: 1.2 };
  const headInput: CSSProperties = { ...titleInput, fontSize: 18 };

  return (
    <div
      onClick={editing ? (e) => e.stopPropagation() : onClick}
      style={{
        width: 'min(94vw, 940px)', margin: '0 auto',
        background: 'var(--light-100)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 60px rgba(0,0,0,0.4)',
        fontFamily: "'Sohne', sans-serif",
      }}
    >
      {/* browser chrome */}
      <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', borderBottom: '1px solid var(--dark-8)', background: 'var(--light-100)' }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-8)' }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-8)' }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-8)' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--dark-40)' }}>graindesignflooring.com/blog/{slug}</span>
        <span style={{ width: 27 }} />
      </div>
      {item.img && <img src={item.img} alt="" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '26px 56px 32px' }}>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>Guides · Grain Design Flooring</Text>
        {editing ? (
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} style={{ ...titleInput, marginTop: 8 }} />
        ) : (
          <Heading level={1} style={{ margin: '8px 0 0', fontSize: 28, lineHeight: 1.2 }}>{headline}</Heading>
        )}
        {editing ? (
          <TextArea value={caption} onChange={(e) => setCaption(e.target.value)} style={{ marginTop: 12, fontSize: 15 }} />
        ) : (
          <Text style={{ display: 'block', marginTop: 12, fontSize: 16, color: 'var(--dark-70)', lineHeight: 1.55 }}>{caption}</Text>
        )}
        {sections.map((s, i) => (
          <div key={i} style={{ marginTop: 20 }}>
            {editing ? (
              <>
                <input value={s.heading} onChange={(e) => setSection(i, 'heading', e.target.value)} style={headInput} />
                <TextArea value={s.body} onChange={(e) => setSection(i, 'body', e.target.value)} style={{ marginTop: 8, fontSize: 14 }} />
              </>
            ) : (
              <>
                <Heading level={3} style={{ margin: '0 0 6px', fontSize: 18 }}>{s.heading}</Heading>
                <Text style={{ display: 'block', fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.6 }}>{s.body}</Text>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
