import { useState, useEffect, useRef, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, IconButton, Text } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar, Pill, StatusPill, Toggle } from '@/staging';
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
 * Full-screen post-approval preview — a recreation of Blaze's post approval
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
  img: string;
  campaign: string;
  date: string;
  channelIcon?: 'organic' | 'paid' | 'seo' | 'reputation';
}

/** Maps a content item to the Insights sub-tab that reports on it — organic
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
  initialNotes,
  rejectedIds,
  onApprove,
  onRequestChanges,
  close,
}: StackModalProps & {
  items: PreviewItem[];
  initialIndex: number;
  typeMeta: Record<string, { icon: Glyph; color: string }>;
  initialNotes: Record<number, string>;
  rejectedIds: number[];
  onApprove: (id: number) => void;
  onRequestChanges: (id: number, note: string) => void;
}) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(Math.max(0, initialIndex));
  const [notes, setNotes] = useState<Record<number, string>>(initialNotes);
  const [requested, setRequested] = useState<Set<number>>(() => new Set(rejectedIds));
  const [draft, setDraft] = useState('');
  const [dialog, setDialog] = useState<'none' | 'edit' | 'view'>('none');
  const anchorRef = useRef<HTMLSpanElement>(null);

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
  const itemNote = notes[item.id] ?? '';

  const go = (next: number) => { setIdx(Math.max(0, Math.min(items.length - 1, next))); setDialog('none'); };
  const openEdit = () => { setDraft(itemNote); setDialog('edit'); };
  const sendRequest = () => {
    setNotes((n) => ({ ...n, [item.id]: draft }));
    setRequested((r) => { const next = new Set(r); next.add(item.id); return next; });
    onRequestChanges(item.id, draft);
    setDialog('none');
  };

  return (
    <Modal.Root size="fullscreen" height="100vh" onClose={close} onPressOutside={close} aria-label="Post preview">
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--light-100)' }}>
        {/* ── Topbar ───────────────────────────────────────────────── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px', borderBottom: '1px solid var(--dark-8)', flexShrink: 0 }}>
          {/* left cluster — content type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <IconButton variant="ghost" size="sm" icon={ArrowLeft} aria-label="Back" onPress={close} />
            <TypeIcon size={20} color={meta.color} />
            <Text variant="secondary" style={{ color: 'var(--dark-90)', whiteSpace: 'nowrap' }}>{item.type}</Text>
            <StatusPill tone="warning" size="md">Review</StatusPill>
            <IconButton variant="ghost" size="sm" icon={MoreDots} aria-label="More" />
          </div>
          {/* center actions — absolutely centered, above the body for the dropdown */}
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
            <Button variant="green" size="md" onPress={() => { onApprove(item.id); close(); }}>Approve</Button>
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
            <div style={{ width: item.type === 'Blog' ? 480 : 360, flexShrink: 0, border: '1px solid var(--dark-8)', borderRadius: 16, background: 'var(--light-100)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {item.type === 'Story' || item.type === 'Reel' ? (
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

          {/* ── Sidebar ────────────────────────────────────────────── */}
          <aside style={{ width: 312, flexShrink: 0, borderLeft: '1px solid var(--dark-8)', overflowY: 'auto', padding: '24px 24px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>
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
          </aside>
        </div>
      </div>
    </Modal.Root>
  );
}
