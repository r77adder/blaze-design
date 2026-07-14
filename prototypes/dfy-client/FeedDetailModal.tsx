import { useState } from 'react';
import { Modal, Text } from '@/components';
import type { StackModalProps } from '@/components';
import { StatusPill } from '@/staging';
import Star from '@/icons/20/Star';
import Image from '@/icons/20/Image';
import Lightbulb1 from '@/icons/20/Lightbulb1';
import ClockBackward from '@/icons/20/ClockBackward';
import type { FeedItem as FeedItemData } from '../h2/feed-data';

type DetailKind = 'review' | 'approval' | 'insight' | 'fatigue';

/** Pick the per-type layout. Order matters: fatigue (proposedSolution) and
 *  insight win over the source-based buckets. */
function detailKind(item: FeedItemData): DetailKind {
  if (item.proposedSolution) return 'fatigue';
  if (item.kind === 'insight') return 'insight';
  if (item.source === 'reputation') return 'review';
  return 'approval';
}

const KIND_META: Record<DetailKind, { Icon: React.ComponentType<{ size?: number; color?: string }>; eyebrow: string }> = {
  review: { Icon: Star, eyebrow: 'Review reply' },
  approval: { Icon: Image, eyebrow: 'Ready to approve' },
  insight: { Icon: Lightbulb1, eyebrow: 'Insight' },
  fatigue: { Icon: ClockBackward, eyebrow: 'Creative fatigue' },
};

/**
 * Simplified, per-type detail modal for the DFY client feed. Drop-in for H2's
 * FeedItemModal, same `openModal(FeedDetailModal, { items, initialIndex,
 * onAction })` shape, but each notification type gets its own minimal layout
 * instead of the dense why/steps stack.
 */
export function FeedDetailModal({
  close,
  items,
  initialIndex,
  onAction,
}: StackModalProps & {
  items: FeedItemData[];
  initialIndex: number;
  onAction: (label: string, source: string) => void;
}) {
  const [index] = useState(initialIndex);
  const item = items[index] ?? items[0];
  if (!item) return null;
  const kind = detailKind(item);
  const { Icon, eyebrow } = KIND_META[kind];

  const fire = (label: string) => {
    onAction(label, item.sourceLabel);
    close();
  };

  return (
    <Modal.Root size="sm" aria-labelledby="feed-detail-title">
      <Modal.Header title={item.title} id="feed-detail-title" onClose={close} compact />
      <Modal.Content compact>
        {/* type eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
          <Icon size={16} color="var(--dark-60)" />
          <Text variant="metadata" style={{ color: 'var(--dark-60)', fontWeight: 500, letterSpacing: '0.04em' }}>
            {eyebrow} · {item.sourceLabel}
          </Text>
          <Text variant="metadata" style={{ marginLeft: 'auto', color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums' }}>
            {item.time}
          </Text>
        </div>

        {kind === 'review' && <ReviewLayout item={item} />}
        {kind === 'approval' && <ApprovalLayout item={item} />}
        {kind === 'insight' && <InsightLayout item={item} />}
        {kind === 'fatigue' && <FatigueLayout item={item} />}
      </Modal.Content>

      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {item.secondary && (
              <Modal.FooterButton variant="tertiary" onPress={() => fire(item.secondary!)}>
                {item.secondary}
              </Modal.FooterButton>
            )}
            {item.primary && (
              <Modal.FooterButton variant="primary" onPress={() => fire(item.primary!)}>
                {item.primary}
              </Modal.FooterButton>
            )}
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

/* ── Review reply: context line + AI-drafted reply in a quote block ───────── */
function ReviewLayout({ item }: { item: FeedItemData }) {
  return (
    <>
      <Body>{item.body}</Body>
      <Label>Drafted reply</Label>
      <blockquote
        style={{
          margin: 0,
          padding: '14px 16px',
          borderLeft: '3px solid var(--brand)',
          background: 'var(--dark-2)',
          borderRadius: '0 8px 8px 0',
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--dark-90)',
          fontStyle: 'italic',
        }}
      >
        “Thank you so much, Maria! We’re thrilled you’re loving the white-oak floors. We’d love to make that stair landing right. Our team will reach out this week to schedule a quick comeback visit at no charge. We appreciate your trust in Grain Design Flooring.”
      </blockquote>
    </>
  );
}

/* ── Content approval: thumbnails row + caption/body ─────────────────────── */
function ApprovalLayout({ item }: { item: FeedItemData }) {
  const thumbs = item.thumbnails ?? [];
  return (
    <>
      {thumbs.length > 0 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
          {thumbs.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              style={{
                height: 104,
                width: 104,
                flexShrink: 0,
                borderRadius: 8,
                border: '1px solid var(--dark-8)',
                objectFit: 'cover',
                background: 'var(--dark-4)',
                display: 'block',
              }}
            />
          ))}
        </div>
      )}
      <Body>{item.body}</Body>
    </>
  );
}

/* ── Insight: headline body, no approval buttons ─────────────────────────── */
function InsightLayout({ item }: { item: FeedItemData }) {
  return <Body>{item.body}</Body>;
}

/* ── Creative fatigue: what's happening + proposed fix bullets ───────────── */
function FatigueLayout({ item }: { item: FeedItemData }) {
  const sol = item.proposedSolution!;
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: 18,
        }}
      >
        <StatusPill tone="danger" size="sm">Fatigue</StatusPill>
        <Text style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--dark-80)' }}>{sol.reason}</Text>
      </div>
      <Label>Proposed refresh</Label>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sol.bullets.map((b) => (
          <li key={b} style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5 }}>{b}</li>
        ))}
      </ul>
    </>
  );
}

/* ── shared bits ─────────────────────────────────────────────────────────── */
function Body({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ display: 'block', fontSize: 14, lineHeight: 1.6, color: 'var(--dark-80)' }}>
      {children}
    </Text>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      variant="metadata"
      style={{
        display: 'block',
        margin: '18px 0 8px',
        color: 'var(--dark-60)',
        fontWeight: 500,
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </Text>
  );
}
