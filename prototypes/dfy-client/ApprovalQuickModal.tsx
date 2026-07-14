import { useState, type ComponentType } from 'react';
import { Modal, Text, Heading, IconButton } from '@/components';
import type { StackModalProps } from '@/components';
import { Avatar } from '@/staging';
import type { IconProps } from '@/icons/Types';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Heart from '@/icons/24/Heart';
import Comment from '@/icons/20/Comment';
import Send from '@/icons/16/Send';
import StarFilled from '@/icons/20/StarFilled';
import Mail from '@/icons/20/Mail';
import ArrowLeft from '@/icons/20/ArrowLeft';
import ArrowRight from '@/icons/20/ArrowRight';
import InstagramBrand from '@/icons/24/InstagramBrand';
import FacebookBrand from '@/icons/35/FacebookBrand';
import type { FeedItem as FeedItemData } from '../h2/feed-data';
import { TYPE_META } from './HomeCard';

/**
 * "Approve from Home" modal, opened when a client taps a needs-sign-off to-do on
 * Home. The previous version showed tiny 104px thumbnails the client couldn't
 * read; this version renders a LARGE, type-specific preview driven by a typed
 * `ApprovalContent` payload attached to each action item in home-data.tsx.
 *
 * Eight content layouts (organic post, story, video/reel, email, blog, paid
 * search ad, paid social ad, reputation response). The Approve / Request-changes
 * footer is unchanged. Request changes reveals a "what to change" textarea, then
 * Send request.
 *
 * BATCH CAROUSEL: the item carries `approvals: ApprovalContent[]`. When it holds
 * more than one piece the modal pages through them (prev/next controls + a
 * "2 of 5" indicator) and each Approve / Request-changes decision advances to
 * the next piece, closing once the last is decided. Single-item notifications
 * (one-element array) show one piece with no nav. No "Ready to approve · source"
 * subtitle: source + time render as a small inline chip row, not a kicker.
 */

// ── Tokens ──────────────────────────────────────────────────────────────────
const F = "'Sohne', sans-serif";
const dark90 = 'var(--dark-90)';
const dark80 = 'var(--dark-80)';
const dark60 = 'var(--dark-60)';
const dark40 = 'var(--dark-40)';
const dark8 = 'var(--dark-8)';
const dark4 = 'var(--dark-4)';
const white = 'var(--light-100)';

const CLIENT = 'Grain Design Flooring';
const GOOGLE_BLUE = '#1a0dab'; // SERP link blue
const GOOGLE_GREEN = '#006621'; // SERP url green
const STAR_GOLD = '#f5a623';

type Glyph = ComponentType<IconProps>;

// ── Typed content payload (discriminated union by `type`) ─────────────────────
export type ApprovalContent =
  | {
      type: 'organic';
      channel: 'Instagram' | 'Facebook';
      image: string;
      caption: string;
    }
  | {
      type: 'story';
      image: string; // vertical 9:16
      caption?: string;
    }
  | {
      type: 'video';
      poster: string;
      duration: string; // e.g. "0:32"
      vertical?: boolean; // reel (9:16) vs landscape (16:9)
      caption?: string;
    }
  | {
      type: 'email';
      from: string;
      subject: string;
      preheader: string;
      hero: string;
      body: string;
      cta: string;
    }
  | {
      type: 'blog';
      cover: string;
      blogTitle: string;
      excerpt: string;
      readTime?: string;
      /** Full article body so the client can actually read the draft. Each
       *  section is an optional subheading + its paragraphs. */
      body?: { heading?: string; paragraphs: string[] }[];
    }
  | {
      type: 'paid-search';
      displayUrl: string;
      headlines: string[];
      description: string;
    }
  | {
      type: 'paid-social';
      channel: 'Instagram' | 'Facebook';
      image: string;
      primaryText: string;
      headline: string;
      cta: string;
    }
  | {
      type: 'reputation';
      reviewerName: string;
      rating: number; // 1–5
      reviewText: string;
      draftedReply: string;
    };

// Informational insight payload (no approval, no task). Drives the quiet Home
// insight card: a stat/trend + a low-emphasis "See in Insights" link.
export type InsightMeta = {
  stat: string;
  statLabel: string;
  trend?: 'up' | 'down' | 'flat';
  to: string; // route into the relevant Insights tab, e.g. '/insights/local'
  linkLabel: string;
};

// The item Home passes is a FeedItem carrying one or more typed approval
// previews. Single notifications hold a one-element `approvals` array; batch
// notifications ("5 posts ready", "3 content pieces") hold N previews the modal
// pages through. `approval` (singular) is kept as a legacy convenience read.
// Insight items carry `insight` instead.
export type ApprovalItem = Omit<FeedItemData, 'primary' | 'secondary'> & {
  // Insight items carry no CTA, so primary/secondary are optional here.
  primary?: string;
  secondary?: string | null;
  approvals?: ApprovalContent[];
  approval?: ApprovalContent;
  batchCount?: number;
  insight?: InsightMeta;
};

// ── Shared preview bits ───────────────────────────────────────────────────────
function ChannelChip({ channel }: { channel: 'Instagram' | 'Facebook' }) {
  const Icon = (channel === 'Instagram' ? InstagramBrand : FacebookBrand) as Glyph;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 8px', borderRadius: 99, border: `1px solid ${dark8}`, background: white }}>
      <Icon size={16} />
      <span style={{ fontSize: 13, color: dark80, fontFamily: F }}>{channel}</span>
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarFilled key={n} size={16} color={n <= rating ? STAR_GOLD : dark8} />
      ))}
    </span>
  );
}

function PlayButton() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="26" viewBox="0 0 16 18" fill={white}><path d="M2 2L14 9L2 16V2Z" /></svg>
      </div>
    </div>
  );
}

const FRAME: React.CSSProperties = {
  border: `1px solid ${dark8}`, borderRadius: 14, overflow: 'hidden', background: white,
};

// ── The eight type-specific previews ──────────────────────────────────────────
function Preview({ content }: { content: ApprovalContent }) {
  switch (content.type) {
    // Organic post → feed-style card, large 4:5 image, caption, channel chip
    case 'organic':
      return (
        <div style={FRAME}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
            <Avatar fallback="G" size={28} style={{ background: 'var(--brand)' }} />
            <Text style={{ fontWeight: 500, color: dark90 }}>{CLIENT}</Text>
            <span style={{ marginLeft: 'auto' }}><ChannelChip channel={content.channel} /></span>
          </div>
          <div style={{ aspectRatio: '4 / 5', background: `center/cover no-repeat url('${content.image}'), ${dark4}` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px 4px' }}>
            <Heart size={24} color={dark90} />
            <Comment size={20} color={dark90} />
            <Send size={16} color={dark90} />
          </div>
          <div style={{ padding: '4px 14px 16px' }}>
            <Text variant="secondary" style={{ display: 'block', color: dark90, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              <span style={{ fontWeight: 500 }}>{CLIENT}</span> {content.caption}
            </Text>
          </div>
        </div>
      );

    // Story → vertical 9:16 phone-style frame, caption overlaid at the bottom
    case 'story':
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 280, aspectRatio: '9 / 16', borderRadius: 20, overflow: 'hidden', position: 'relative', background: `center/cover no-repeat url('${content.image}'), ${dark4}`, border: `1px solid ${dark8}` }}>
            {/* top progress bar + avatar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(rgba(0,0,0,0.45), transparent)' }}>
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.9)', marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar fallback="G" size={26} style={{ background: 'var(--brand)' }} />
                <Text style={{ color: white, fontWeight: 500, fontSize: 13 }}>{CLIENT}</Text>
              </div>
            </div>
            {content.caption && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 16px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                <Text style={{ color: white, fontSize: 15, lineHeight: 1.45, fontWeight: 500 }}>{content.caption}</Text>
              </div>
            )}
          </div>
        </div>
      );

    // Video / Reel → large poster with centered play button + duration badge
    case 'video':
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: content.vertical ? 280 : '100%', maxWidth: content.vertical ? 280 : 'none' }}>
            <div style={{ position: 'relative', aspectRatio: content.vertical ? '9 / 16' : '16 / 9', borderRadius: 14, overflow: 'hidden', background: `center/cover no-repeat url('${content.poster}'), ${dark4}`, border: `1px solid ${dark8}` }}>
              <PlayButton />
              <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: white, fontSize: 12, fontFamily: F, padding: '3px 8px', borderRadius: 6, fontVariantNumeric: 'tabular-nums' }}>
                {content.duration}
              </span>
            </div>
            {content.caption && (
              <Text variant="secondary" style={{ display: 'block', color: dark80, lineHeight: 1.55, marginTop: 12 }}>{content.caption}</Text>
            )}
          </div>
        </div>
      );

    // Email → email-client mock: from + subject + preheader, hero, body, CTA
    case 'email':
      return (
        <div style={FRAME}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${dark8}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 99, background: 'var(--brand)', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} color={dark90} />
              </span>
              <span style={{ minWidth: 0 }}>
                <Text style={{ display: 'block', fontWeight: 500, color: dark90, fontSize: 14 }}>{content.from}</Text>
                <Text variant="metadata" style={{ display: 'block', color: dark60 }}>to me</Text>
              </span>
            </div>
            <Text style={{ display: 'block', fontWeight: 500, color: dark90, fontSize: 16, lineHeight: 1.35 }}>{content.subject}</Text>
            <Text variant="secondary" style={{ display: 'block', color: dark60, marginTop: 2 }}>{content.preheader}</Text>
          </div>
          <div style={{ aspectRatio: '16 / 9', background: `center/cover no-repeat url('${content.hero}'), ${dark4}` }} />
          <div style={{ padding: '18px 18px 22px' }}>
            <Text variant="secondary" style={{ display: 'block', color: dark80, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{content.body}</Text>
            <span style={{ display: 'inline-flex', marginTop: 16, padding: '10px 18px', borderRadius: 8, background: dark90, color: white, fontFamily: F, fontSize: 14, fontWeight: 500 }}>
              {content.cta}
            </span>
          </div>
        </div>
      );

    // Blog → cover image + headline + standfirst + full article body to read
    case 'blog':
      return (
        <div style={FRAME}>
          <div style={{ aspectRatio: '16 / 9', background: `center/cover no-repeat url('${content.cover}'), ${dark4}` }} />
          <div style={{ padding: '20px 22px 24px' }}>
            <Text variant="metadata" style={{ display: 'block', color: dark60, letterSpacing: '0.04em', marginBottom: 8 }}>
              Grain Design Journal{content.readTime ? ` · ${content.readTime}` : ''}
            </Text>
            <Heading level={4} style={{ margin: '0 0 10px', lineHeight: 1.25 }}>{content.blogTitle}</Heading>
            {/* Standfirst: slightly larger lead paragraph */}
            <Text style={{ display: 'block', color: dark80, lineHeight: 1.6, fontWeight: 500 }}>{content.excerpt}</Text>
            {/* Full article body */}
            {content.body?.map((section, i) => (
              <div key={i} style={{ marginTop: section.heading ? 22 : 14 }}>
                {section.heading && (
                  <Heading level={5} style={{ margin: '0 0 8px', lineHeight: 1.3 }}>{section.heading}</Heading>
                )}
                {section.paragraphs.map((p, j) => (
                  <Text key={j} variant="secondary" style={{ display: 'block', color: dark80, lineHeight: 1.7, marginBottom: j === section.paragraphs.length - 1 ? 0 : 12 }}>
                    {p}
                  </Text>
                ))}
              </div>
            ))}
          </div>
        </div>
      );

    // Paid search ad → Google SERP-style ad block
    case 'paid-search':
      return (
        <div style={{ ...FRAME, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: dark90, fontFamily: F }}>Ad</span>
            <span style={{ color: dark40 }}>·</span>
            <span style={{ fontSize: 13, color: GOOGLE_GREEN, fontFamily: F }}>{content.displayUrl}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 6 }}>
            {content.headlines.map((h, i) => (
              <span key={i} style={{ fontSize: 20, color: GOOGLE_BLUE, fontFamily: F, lineHeight: 1.3 }}>{h}</span>
            ))}
          </div>
          <Text variant="secondary" style={{ display: 'block', color: dark80, lineHeight: 1.55 }}>{content.description}</Text>
        </div>
      );

    // Paid social ad → feed ad: image + "Sponsored" + primary text + CTA bar
    case 'paid-social':
      return (
        <div style={FRAME}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
            <Avatar fallback="G" size={28} style={{ background: 'var(--brand)' }} />
            <span style={{ minWidth: 0 }}>
              <Text style={{ display: 'block', fontWeight: 500, color: dark90, fontSize: 14 }}>{CLIENT}</Text>
              <Text variant="metadata" style={{ display: 'block', color: dark60 }}>Sponsored · {content.channel}</Text>
            </span>
          </div>
          <div style={{ padding: '0 14px 12px' }}>
            <Text variant="secondary" style={{ display: 'block', color: dark90, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{content.primaryText}</Text>
          </div>
          <div style={{ aspectRatio: '1 / 1', background: `center/cover no-repeat url('${content.image}'), ${dark4}` }} />
          {/* CTA bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: dark4 }}>
            <Text style={{ flex: 1, minWidth: 0, fontWeight: 500, color: dark90, fontSize: 14, lineHeight: 1.35 }}>{content.headline}</Text>
            <span style={{ flexShrink: 0, display: 'inline-flex', padding: '8px 14px', borderRadius: 6, background: dark90, color: white, fontFamily: F, fontSize: 13, fontWeight: 500 }}>
              {content.cta}
            </span>
          </div>
        </div>
      );

    // Reputation response → original review + drafted reply in a distinct bubble
    case 'reputation':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* the review */}
          <div style={{ ...FRAME, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Avatar fallback={content.reviewerName.slice(0, 1)} size={32} />
              <span style={{ minWidth: 0 }}>
                <Text style={{ display: 'block', fontWeight: 500, color: dark90, fontSize: 14 }}>{content.reviewerName}</Text>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars rating={content.rating} />
                  <Text variant="metadata" style={{ color: dark60 }}>on Google</Text>
                </span>
              </span>
            </div>
            <Text variant="secondary" style={{ display: 'block', color: dark80, lineHeight: 1.6 }}>{content.reviewText}</Text>
          </div>
          {/* drafted reply: clearly distinct, indented brand bubble */}
          <div style={{ marginLeft: 24, position: 'relative' }}>
            <div style={{ border: `1px solid var(--brand)`, background: 'rgba(252,183,40,0.08)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar fallback="G" size={24} style={{ background: 'var(--brand)' }} />
                <Text style={{ fontWeight: 500, color: dark90, fontSize: 13 }}>Your reply, drafted by Blaze</Text>
              </div>
              <Text variant="secondary" style={{ display: 'block', color: dark90, lineHeight: 1.6 }}>{content.draftedReply}</Text>
            </div>
          </div>
        </div>
      );
  }
}

// Fallback when no typed payload is present (older items). Keep it readable.
function LegacyPreview({ item }: { item: ApprovalItem }) {
  const thumbs = item.thumbnails ?? [];
  return (
    <>
      {thumbs.length > 0 && (
        <div style={{ aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden', border: `1px solid ${dark8}`, background: `center/cover no-repeat url('${thumbs[0]}'), ${dark4}`, marginBottom: 16 }} />
      )}
      <Text style={{ display: 'block', fontSize: 15, lineHeight: 1.6, color: dark80 }}>{item.body}</Text>
    </>
  );
}

export function ApprovalQuickModal({
  close,
  item,
  startIndex = 0,
  onApprove,
  onRequestChanges,
}: StackModalProps & {
  item: ApprovalItem;
  startIndex?: number;
  onApprove: (item: ApprovalItem) => void;
  onRequestChanges: (item: ApprovalItem, note: string) => void;
}) {
  // Resolve the batch of previews. Single notifications carry a one-element
  // array; batches carry N. Falls back to the legacy singular `approval`.
  const pieces: ApprovalContent[] =
    item.approvals && item.approvals.length > 0
      ? item.approvals
      : item.approval
        ? [item.approval]
        : [];
  const total = pieces.length;

  const [index, setIndex] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(total - 1, 0)));
  const [requesting, setRequesting] = useState(false);
  const [note, setNote] = useState('');

  const isBatch = total > 1;
  const current = pieces[index];
  // Label the piece with the same content type the original Home card shows.
  const typeMeta = current ? TYPE_META[current.type] : null;
  const TypeIcon = typeMeta?.icon;

  // Content-type + time, rendered as the header's subHeader so it sits tight
  // under the title (the modal's compact Content padding clips a negative
  // margin, so it can't be pulled up from inside the body).
  const metaRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {typeMeta && TypeIcon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <TypeIcon size={16} color={typeMeta.color} />
          <Text variant="metadata" style={{ color: dark80, fontWeight: 500, fontSize: 12.5 }}>{typeMeta.label}</Text>
        </span>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, background: dark4, fontSize: 12, color: dark60, fontFamily: F, fontWeight: 500 }}>
          {item.sourceLabel}
        </span>
      )}
      <Text variant="metadata" style={{ color: dark60, fontVariantNumeric: 'tabular-nums' }}>· {item.time}</Text>
    </div>
  );

  // After a decision, advance to the next undecided piece; close once the last
  // piece in the batch is decided. Single items just close.
  const advance = () => {
    setRequesting(false);
    setNote('');
    if (index < total - 1) setIndex(index + 1);
    else close();
  };
  const approve = () => { onApprove(item); advance(); };
  const sendRequest = () => { onRequestChanges(item, note.trim()); advance(); };

  const goPrev = () => { if (index > 0) { setRequesting(false); setNote(''); setIndex(index - 1); } };
  const goNext = () => { if (index < total - 1) { setRequesting(false); setNote(''); setIndex(index + 1); } };

  return (
    <Modal.Root size="md" aria-labelledby="approval-quick-title">
      <Modal.Header title={item.title} id="approval-quick-title" onClose={close} compact subHeader={metaRow} />
      <Modal.Content compact>
        {/* source + time as a small inline chip row, NOT a subtitle under the
            title. Batch nav (prev / "2 of 5" / next) sits on the right. */}
        {current ? <Preview content={current} /> : <LegacyPreview item={item} />}

        {requesting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <Text variant="metadata" style={{ color: dark60, fontWeight: 500, letterSpacing: '0.06em' }}>
              What would you like changed?
            </Text>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Swap the hero photo for the white-oak install, and soften the headline. Your team will revise and resend."
              style={{
                width: '100%', minHeight: 90, borderRadius: 10, border: `1px solid ${dark8}`,
                padding: '10px 12px', fontFamily: F, fontSize: 14,
                color: dark90, lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}
      </Modal.Content>

      <Modal.Footer>
        {/* left corner: Request changes (or Cancel while composing a note) */}
        <Modal.FooterContent slot="left">
          {requesting ? (
            <Modal.FooterButton variant="subtle" onPress={() => { setRequesting(false); setNote(''); }}>
              Cancel
            </Modal.FooterButton>
          ) : (
            <Modal.FooterButton variant="secondary" frontIcon={Edit3} onPress={() => setRequesting(true)}>
              Request changes
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>

        {/* middle: batch nav (prev · count · next) */}
        {isBatch && (
          <Modal.FooterContent slot="center">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconButton size="sm" variant="subtle" aria-label="Previous" icon={ArrowLeft} isDisabled={index === 0} onPress={goPrev} />
              <span style={{ fontSize: 13, color: dark80, fontFamily: F, fontWeight: 500, fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'center' }}>
                {index + 1} of {total}
              </span>
              <IconButton size="sm" variant="subtle" aria-label="Next" icon={ArrowRight} isDisabled={index === total - 1} onPress={goNext} />
            </span>
          </Modal.FooterContent>
        )}

        {/* right corner: Approve (or Send request while composing a note) */}
        <Modal.FooterContent slot="right">
          {requesting ? (
            <Modal.FooterButton variant="primary" isDisabled={!note.trim()} onPress={sendRequest}>
              Send request
            </Modal.FooterButton>
          ) : (
            <Modal.FooterButton variant="green" frontIcon={Check2} onPress={approve}>
              {isBatch && index < total - 1 ? 'Approve & next' : 'Approve'}
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
