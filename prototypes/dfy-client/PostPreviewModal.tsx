import { useState, useEffect, useRef, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, IconButton, Text } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar, Pill, StatusPill, Toggle, TabChip } from '@/staging';
import type { IconProps } from '@/icons/Types';
import ArrowLeft from '@/icons/20/ArrowLeft';
import MoreDots from '@/icons/20/MoreDots';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/16/ChevronRight';
import ChevronDown from '@/icons/16/ChevronDown';
import Heart from '@/icons/24/Heart';
import Comment from '@/icons/20/Comment';
import Send from '@/icons/16/Send';
import Edit1 from '@/icons/20/Edit1';
import Check2 from '@/icons/20/Check2';
import Templates from '@/icons/20/Templates';
import Stars from '@/icons/20/Stars';
import Images from '@/icons/20/Images';
import InstagramBrand from '@/icons/24/InstagramBrand';
import FacebookBrand from '@/icons/35/FacebookBrand';
import LinkedInBrand from '@/icons/32/LinkedInBrand';
import TwitterBrand from '@/icons/20/TwitterBrand';
import Google from '@/icons/20/Google';
import { StoryPreview, ReelPreview, BlogPreview } from './SocialPreviewFrames';
import { BASE } from './shell';

/**
 * Full-screen post-approval preview, a recreation of Blaze's post approval
 * surface, composed only from Blaze design system components. Opened from an
 * Approvals card thumbnail and fed the whole approval queue so Previous / Next
 * page through it. "Request changes" opens a dropdown (anchored to the button,
 * auto-focused input); once submitted it becomes "Changes requested" and the
 * dropdown shows the note read-only.
 */

type Glyph = ComponentType<IconProps>;

interface PreviewItem {
  id: number;
  type: string;
  title?: string;
  caption: string;
  img?: string;
  campaign: string;
  date: string;
  channelIcon?: 'organic' | 'paid' | 'seo' | 'reputation';
  headline?: string;   // PaidSearch
  rating?: number;     // Reputation
  reviewer?: string;   // Reputation
  source?: string;     // Reputation
}

/** Maps a content item to the Insights sub-tab that reports on it, organic
 *  posts/stories/reels roll up under Organic Social, paid ads split between
 *  Paid Social (Meta) and Paid Search (Google) based on the campaign name. */
function insightsSlugFor(item: PreviewItem): string {
  if (item.channelIcon === 'seo') return 'seo';
  if (item.channelIcon === 'reputation') return 'reputation';
  if (item.channelIcon === 'paid') return /google|search/i.test(item.campaign) ? 'paid-search' : 'paid-social';
  return 'organic';
}

const CLIENT = 'Grain Design Flooring';

const PLATFORMS: { glyph: Glyph; label: string }[] = [
  { glyph: InstagramBrand as Glyph, label: 'Instagram' },
  { glyph: FacebookBrand as Glyph, label: 'Facebook' },
  { glyph: LinkedInBrand as Glyph, label: 'LinkedIn' },
  { glyph: TwitterBrand as Glyph, label: 'X/Twitter' },
  { glyph: Google as Glyph, label: 'Google Business' },
];

const LABEL: React.CSSProperties = { display: 'block', fontSize: 13, color: 'var(--dark-60)', marginBottom: 10 };

function SidebarAction({ icon: Icon, title, sub }: { icon: Glyph; title: string; sub?: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex', alignItems: sub ? 'flex-start' : 'center', gap: 12, width: '100%', textAlign: 'left',
        background: 'transparent', border: 'none', padding: '8px 0', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <span style={{ color: 'var(--dark-80)', display: 'inline-flex', flexShrink: 0, marginTop: sub ? 1 : 0 }}>
        <Icon size={20} color="var(--dark-80)" />
      </span>
      <span style={{ minWidth: 0 }}>
        <Text style={{ display: 'block', color: 'var(--dark-90)' }}>{title}</Text>
        {sub && <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>{sub}</Text>}
      </span>
    </button>
  );
}

export function PostPreviewModal({
  items,
  initialIndex,
  typeMeta,
  typeLabel,
  replyDrafts,
  initialStatuses,
  initialNotes,
  rejectedIds,
  updatedIds,
  updatedReplies,
  onApprove,
  onRequestChanges,
  close,
}: StackModalProps & {
  items: PreviewItem[];
  initialIndex: number;
  typeMeta: Record<string, { icon: Glyph; color: string }>;
  typeLabel?: Record<string, string>;
  replyDrafts?: Record<number, string>;
  initialStatuses?: Record<number, 'pending' | 'approved' | 'rejected'>;
  initialNotes: Record<number, string>;
  rejectedIds: number[];
  // Pieces the team revised after the client's feedback and re-sent. They read
  // as "Updated", open with a conversation, and default to the Feedback tab.
  updatedIds?: number[];
  updatedReplies?: Record<number, string>;
  onApprove: (id: number) => void;
  onRequestChanges: (id: number, note: string) => void;
}) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(Math.max(0, initialIndex));
  const [notes, setNotes] = useState<Record<number, string>>(initialNotes);
  const [requested, setRequested] = useState<Set<number>>(() => new Set(rejectedIds));
  const [approved, setApproved] = useState<Set<number>>(() =>
    new Set(Object.entries(initialStatuses ?? {}).filter(([, s]) => s === 'approved').map(([id]) => Number(id))),
  );
  const [draft, setDraft] = useState('');
  const [dialog, setDialog] = useState<'none' | 'edit' | 'view'>('none');
  const anchorRef = useRef<HTMLSpanElement>(null);
  // Pieces the team revised and re-sent; they read as "Updated" until the
  // client approves or asks for more changes.
  const updatedSet = useRef(new Set(updatedIds ?? [])).current;
  // Sidebar tabs, Edit vs Feedback (the change-request conversation).
  const [sideTab, setSideTab] = useState<'edit' | 'feedback'>('edit');

  // "Posting to" starts as a read-only pill summary; the edit button swaps in
  // the per-platform row list so the client can toggle a connected account
  // on/off for this post, or connect one that's missing.
  const [platforms, setPlatforms] = useState(() =>
    PLATFORMS.map((p) => ({ ...p, connected: p.label !== 'Google Business', selected: p.label !== 'Google Business' })),
  );
  const [editingPosting, setEditingPosting] = useState(false);
  const [postingHover, setPostingHover] = useState(false);
  const setPlatformSelected = (label: string, next: boolean) =>
    setPlatforms((ps) => ps.map((p) => (p.label === label ? { ...p, selected: next } : p)));
  const connectPlatform = (label: string) =>
    setPlatforms((ps) => ps.map((p) => (p.label === label ? { ...p, connected: true, selected: true } : p)));

  // Close the request dropdown on any click outside its anchor.
  useEffect(() => {
    if (dialog === 'none') return;
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setDialog('none');
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [dialog]);

  const item = items[idx];
  const meta = typeMeta[item.type] ?? { icon: (() => null) as unknown as Glyph, color: 'var(--dark-60)' };
  const TypeIcon = meta.icon;
  const itemRequested = requested.has(item.id);
  const itemApproved = approved.has(item.id);
  // Updated only holds while the client hasn't yet re-approved or re-requested.
  const itemUpdated = updatedSet.has(item.id) && !itemApproved && !itemRequested;
  const itemNote = notes[item.id] ?? '';
  const itemReply = updatedReplies?.[item.id] ?? '';
  const hasConversation = itemRequested || itemUpdated;
  const label = typeLabel?.[item.type] ?? item.type;
  const isTextCard = item.type === 'PaidSearch' || item.type === 'Reputation';

  // Default the sidebar to Feedback when this post has a conversation (a
  // change request or a team revision awaiting another look).
  useEffect(() => {
    const id = items[idx].id;
    setSideTab(requested.has(id) || updatedSet.has(id) ? 'feedback' : 'edit');
    /* eslint-disable-next-line */
  }, [idx]);

  const go = (next: number) => { setIdx(Math.max(0, Math.min(items.length - 1, next))); setDialog('none'); };
  const openEdit = () => { setDraft(itemNote); setDialog('edit'); };
  const sendRequest = () => {
    setNotes((n) => ({ ...n, [item.id]: draft }));
    setRequested((r) => { const next = new Set(r); next.add(item.id); return next; });
    setApproved((a) => { const next = new Set(a); next.delete(item.id); return next; });
    onRequestChanges(item.id, draft);
    setDialog('none');
    setSideTab('feedback');
  };
  const approveItem = () => {
    setApproved((a) => { const next = new Set(a); next.add(item.id); return next; });
    setRequested((r) => { const next = new Set(r); next.delete(item.id); return next; });
    onApprove(item.id);
  };
  // Feedback tab, follow-up comments the client adds after the first request.
  const [feedbackReply, setFeedbackReply] = useState('');
  const [thread, setThread] = useState<Record<number, string[]>>({});
  const sendFollowUp = () => {
    if (!feedbackReply.trim()) return;
    setThread((t) => ({ ...t, [item.id]: [...(t[item.id] ?? []), feedbackReply.trim()] }));
    setFeedbackReply('');
  };

  return (
    <Modal.Root size="fullscreen" height="100vh" onClose={close} onPressOutside={close} aria-label="Post preview">
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--light-100)' }}>
        {/* ── Topbar ───────────────────────────────────────────────── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px', borderBottom: '1px solid var(--dark-8)', flexShrink: 0 }}>
          {/* left cluster, content type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back" onPress={close} />
            <TypeIcon size={20} color={meta.color} />
            <Text variant="secondary" style={{ color: 'var(--dark-90)', whiteSpace: 'nowrap' }}>{label}</Text>
            {itemApproved ? (
              <StatusPill tone="success" size="md">Approved</StatusPill>
            ) : itemRequested ? (
              <StatusPill tone="danger" size="md">Changes requested</StatusPill>
            ) : itemUpdated ? (
              <StatusPill tone="info" size="md">Updated</StatusPill>
            ) : (
              <StatusPill tone="warning" size="md">Review</StatusPill>
            )}
            <IconButton variant="ghost" size="sm" icon={MoreDots} aria-label="More" />
          </div>
          {/* center actions, absolutely centered, above the body for the dropdown */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button variant="tertiary" size="md" frontIcon={ChevronLeft} isDisabled={idx === 0} onPress={() => go(idx - 1)}>Previous</Button>
            <span ref={anchorRef} style={{ position: 'relative', display: 'inline-flex' }}>
              {itemRequested ? (
                <Button variant="secondary" size="md" onPress={() => setDialog((d) => (d === 'view' ? 'none' : 'view'))}>Changes requested</Button>
              ) : (
                <Button variant="secondary" size="md" onPress={() => (dialog === 'edit' ? setDialog('none') : openEdit())}>Request changes</Button>
              )}
              {dialog !== 'none' && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 340, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                  {dialog === 'view' ? (
                    <>
                      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>Your requested changes</Text>
                      <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{itemNote}</Text>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onPress={() => setDialog('none')}>Close</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>What would you like changed?</Text>
                      <textarea
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="e.g. Swap the hero photo for the white-oak install, and soften the headline."
                        style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '1px solid var(--dark-8)', padding: '10px 12px', fontFamily: "'Sohne', sans-serif", fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button variant="subtle" size="sm" onPress={() => setDialog('none')}>Cancel</Button>
                        <Button variant="primary" size="sm" isDisabled={!draft.trim()} onPress={sendRequest}>Send request</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </span>
            {itemApproved ? (
              <Button variant="secondary" size="md" frontIcon={Check2} isDisabled>Approved</Button>
            ) : (
              <Button variant="green" size="md" onPress={() => { approveItem(); if (idx < items.length - 1) go(idx + 1); }}>Approve</Button>
            )}
            <Button variant="tertiary" size="md" endIcon={ChevronRight} isDisabled={idx === items.length - 1} onPress={() => go(idx + 1)}>Next</Button>
          </div>
          {/* right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, justifyContent: 'flex-end' }}>
            <Avatar fallback="MH" size={32} />
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* center region: "view as" rail + phone preview */}
          <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, padding: '40px 24px', background: 'var(--default-bg)' }}>
            {/* view-as rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <Text variant="metadata" style={{ color: 'var(--dark-60)', marginBottom: 2 }}>View as</Text>
              {PLATFORMS.map(({ glyph: G, label }, i) => (
                <span
                  key={label}
                  aria-label={label}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 8,
                    border: i === 0 ? '1px solid var(--dark-15)' : '1px solid transparent',
                    background: i === 0 ? 'var(--light-100)' : 'transparent',
                    boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <G size={14} />
                </span>
              ))}
            </div>

            {/* phone post preview */}
            <div style={{ width: item.type === 'Blog' || isTextCard ? 480 : 360, flexShrink: 0, border: '1px solid var(--dark-8)', borderRadius: 16, background: 'var(--light-100)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {item.type === 'PaidSearch' ? (
                <div style={{ padding: '24px 26px' }}>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginBottom: 14 }}>Google Search, sponsored result</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--dark-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar fallback="G" size={22} style={{ background: 'var(--brand)' }} />
                    </span>
                    <div style={{ lineHeight: 1.2 }}>
                      <Text style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 500 }}>Grain Design Flooring</Text>
                      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>Ad · graindesignflooring.com</Text>
                    </div>
                  </div>
                  <h3 style={{ margin: '4px 0 6px', fontSize: 20, fontWeight: 400, color: '#1a0dab', fontFamily: "'Sohne', sans-serif", lineHeight: 1.3 }}>{item.headline}</h3>
                  <p style={{ margin: 0, fontSize: 15, color: 'var(--dark-60)', fontFamily: "'Sohne', sans-serif", lineHeight: 1.55 }}>{item.caption}</p>
                </div>
              ) : item.type === 'Reputation' ? (
                <div style={{ padding: '20px 22px' }}>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginBottom: 14 }}>{item.source} review, your reply</Text>
                  {/* The customer's review */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Avatar fallback={(item.reviewer ?? 'A').slice(0, 1)} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <Text style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 500 }}>{item.reviewer}</Text>
                      <span style={{ display: 'inline-flex', gap: 1, margin: '2px 0 6px' }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < (item.rating ?? 5) ? 'var(--status-review)' : 'none'}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" stroke="var(--status-review)" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                        ))}
                      </span>
                      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55 }}>{item.caption}</Text>
                    </div>
                  </div>
                  {/* The drafted reply */}
                  <div style={{ marginLeft: 20, paddingLeft: 16, borderLeft: '2px solid var(--dark-8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Avatar fallback="G" size={24} style={{ background: 'var(--brand)' }} />
                      <Text style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Grain Design Flooring</Text>
                      <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>· Owner</Text>
                    </div>
                    <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55 }}>{replyDrafts?.[item.id] ?? item.caption}</Text>
                  </div>
                </div>
              ) : item.type === 'Story' || item.type === 'Reel' ? (
                <div style={{ position: 'relative', aspectRatio: '9 / 16' }}>
                  {item.type === 'Story' ? (
                    <StoryPreview image={item.img} brandInitial="G" brandName={CLIENT} headline={item.caption} />
                  ) : (
                    <ReelPreview image={item.img} brandInitial="G" brandName={CLIENT} caption={item.caption} />
                  )}
                </div>
              ) : item.type === 'Blog' ? (
                <BlogPreview image={item.img} title={item.title ?? 'Blog post'} excerpt={item.caption} brandName={CLIENT} />
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                    <Avatar fallback="G" size={28} style={{ background: 'var(--brand)' }} />
                    <Text style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{CLIENT}</Text>
                  </div>
                  <div style={{ aspectRatio: '4 / 5', background: `center/cover no-repeat url('${item.img}'), var(--dark-4)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px 4px', color: 'var(--dark-90)' }}>
                    <Heart size={24} color="var(--dark-90)" />
                    <Comment size={20} color="var(--dark-90)" />
                    <Send size={16} color="var(--dark-90)" />
                  </div>
                  <div style={{ padding: '6px 14px 16px' }}>
                    <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 500 }}>{CLIENT}</span> {item.caption}
                    </Text>
                    <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 2 }}>see more</Text>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar, Edit / Feedback tabs ─────────────────────── */}
          <aside style={{ width: 312, flexShrink: 0, borderLeft: '1px solid var(--dark-8)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Tab bar, the standard TabChip pills. */}
            <div style={{ display: 'flex', gap: 6, padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--light-100)', zIndex: 2 }}>
              <TabChip selected={sideTab === 'edit'} onSelect={() => setSideTab('edit')}>Edit</TabChip>
              <TabChip selected={sideTab === 'feedback'} onSelect={() => setSideTab('feedback')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Feedback
                  {hasConversation && <span style={{ width: 6, height: 6, borderRadius: 99, background: itemRequested ? 'var(--red-90)' : 'var(--status-posting)' }} />}
                </span>
              </TabChip>
            </div>

            {sideTab === 'feedback' ? (
              <div style={{ padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hasConversation ? (
                  <>
                    <span style={LABEL}>Your requested changes</span>
                    {/* Client's request (sent bubble) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ maxWidth: '88%', background: 'var(--dark-90)', borderRadius: '12px 12px 4px 12px', padding: '8px 12px' }}>
                        <Text variant="secondary" style={{ display: 'block', color: 'var(--light-100)', lineHeight: 1.5 }}>{itemNote || 'Please make some changes to this.'}</Text>
                      </div>
                    </div>
                    {itemUpdated ? (
                      /* Team's revision, they addressed it and re-sent (received bubble) */
                      <div style={{ minWidth: 0 }}>
                        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '8px 12px' }}>
                          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.5 }}>{itemReply || 'We’ve revised this based on your feedback and re-sent it for your review.'}</Text>
                        </div>
                        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 4 }}>Blaze team · revised &amp; re-sent</Text>
                      </div>
                    ) : (
                      /* Team acknowledgement (received bubble) */
                      <div style={{ minWidth: 0 }}>
                        <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '8px 12px' }}>
                          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.5 }}>Got it, your team will revise this and resend for approval.</Text>
                        </div>
                        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 4 }}>Blaze team</Text>
                      </div>
                    )}
                    {(thread[item.id] ?? []).map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ maxWidth: '88%', background: 'var(--dark-90)', borderRadius: '12px 12px 4px 12px', padding: '8px 12px' }}>
                          <Text variant="secondary" style={{ display: 'block', color: 'var(--light-100)', lineHeight: 1.5 }}>{m}</Text>
                        </div>
                      </div>
                    ))}
                    {/* Follow-up composer */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <textarea
                        value={feedbackReply}
                        onChange={(e) => setFeedbackReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFollowUp(); } }}
                        placeholder="Add a comment…"
                        rows={1}
                        style={{ flex: 1, resize: 'none', borderRadius: 10, border: '1px solid var(--dark-8)', padding: '8px 10px', fontFamily: "'Sohne', sans-serif", fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.4, outline: 'none', boxSizing: 'border-box' }}
                      />
                      <IconButton variant="primary" size="sm" icon={Send} aria-label="Send comment" isDisabled={!feedbackReply.trim()} onPress={sendFollowUp} />
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '40px 12px', textAlign: 'center' }}>
                    <Comment size={20} color="var(--dark-40)" />
                    <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
                      {itemApproved ? 'You approved this, it’s scheduled to publish. No changes requested.' : 'No feedback yet. Use “Request changes” to tell your team what to tweak.'}
                    </Text>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <span style={LABEL}>Posting on</span>
                  <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Text variant="primary" style={{ color: 'var(--dark-90)' }}>{item.date}</Text>
                    <ChevronDown size={16} color="var(--dark-60)" />
                  </button>
                </div>

                <div onMouseEnter={() => setPostingHover(true)} onMouseLeave={() => setPostingHover(false)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>Posting to</span>
                    <span style={{ opacity: editingPosting || postingHover ? 1 : 0, transition: 'opacity 120ms ease' }}>
                      {editingPosting ? (
                        <Button variant="secondary" size="sm" onPress={() => setEditingPosting(false)}>Save</Button>
                      ) : (
                        <IconButton variant="ghost" size="sm" icon={Edit1} aria-label="Edit posting accounts" onPress={() => setEditingPosting(true)} />
                      )}
                    </span>
                  </div>
                  {editingPosting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {platforms.map(({ glyph: G, label, connected, selected }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <G size={20} />
                          <Text style={{ flex: 1, color: 'var(--dark-90)' }}>{label}</Text>
                          {connected ? (
                            <Toggle checked={selected} onChange={(next) => setPlatformSelected(label, next)} />
                          ) : (
                            <Button variant="secondary" size="sm" endIcon={ChevronRight} onPress={() => connectPlatform(label)}>Connect</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {platforms.filter((p) => p.connected && p.selected).map(({ glyph: G, label }) => (
                        <Pill key={label} size="md">
                          <G size={14} />
                          <span style={{ marginLeft: 5 }}>{label}</span>
                        </Pill>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <span style={LABEL}>Campaign</span>
                  <button
                    type="button"
                    onClick={() => navigate(`${BASE}/insights/${insightsSlugFor(item)}`)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Text variant="primary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.35 }}>{item.campaign}</Text>
                  </button>
                </div>

                <div>
                  <span style={LABEL}>Quick Edits</span>
                  <SidebarAction icon={Edit1} title="Adjust Caption" />
                  <SidebarAction icon={Templates} title="Edit Design" />
                </div>

                <div>
                  <span style={LABEL}>Redesign</span>
                  <SidebarAction icon={Stars} title="Regenerate Design" sub="Blaze will generate new design" />
                  <SidebarAction icon={Images} title="Replace with Media" sub="Swap design with your own" />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Modal.Root>
  );
}
