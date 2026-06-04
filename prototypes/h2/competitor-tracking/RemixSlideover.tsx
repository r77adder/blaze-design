import { useEffect, useMemo, useState } from 'react';
import { Button, Heading, Modal, Text, type StackModalProps } from '@/components';
import { Chip, TabChip, useToast } from '@/staging';
import { ChannelBadge, CompetitorBadge, channelLabel } from './components';
import { COMPETITORS, type FeedCard } from './data';

// Local constants for swatches not covered by tokens.
const PURPLE_TINT_BG = '#F5F3FF';

/**
 * Remix slide-over — opens from the CardDetailModal "Remix" CTA.
 *
 * Two flows, picked from the source card type:
 *  - **Organic** (organic-ig, organic-li) → caption draft + platform chips.
 *  - **Ad**    (ad-google, ad-meta)     → headline + body + CTA + platform + daily-budget slider.
 *
 * After "Save Draft" the body switches to a success state with a phone / ad
 * mock preview plus a schedule picker. Mirrors the source HTML's slideover
 * (line 7247) end-to-end including the draft → preview → schedule path.
 */
export function RemixSlideover({ card, close }: StackModalProps & { card: FeedCard }) {
  const isAd = card.type === 'ad-google' || card.type === 'ad-meta';
  const competitor = COMPETITORS[card.competitor];
  const { showToast } = useToast();

  const draftSeed = useMemo(() => seedDraft(card), [card]);
  const [stage, setStage] = useState<'draft' | 'saved' | 'scheduled'>('draft');
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'linkedin'>('instagram');
  const [draft, setDraft] = useState(draftSeed.caption);
  const [headline, setHeadline] = useState(draftSeed.headline);
  const [body, setBody] = useState(draftSeed.body);
  const [cta, setCta] = useState(draftSeed.cta);
  const [budget, setBudget] = useState(50);
  const [scheduleTime, setScheduleTime] = useState<string | null>(null);

  // Simulate streaming AI generation when the modal opens.
  const [generating, setGenerating] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 700);
    return () => clearTimeout(t);
  }, []);

  const charCount = draft.length;
  const estReach = Math.round(budget * 240);
  const estTotal = budget * 30;

  return (
    <Modal.Root size="md" aria-labelledby="remix-title">
      <Modal.Header title="Remix in Blaze" id="remix-title" onClose={close} />
      <Modal.Content>
        {stage === 'draft' && (
          <>
            {/* Source preview */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                padding: 12,
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                marginBottom: 16,
                background: 'var(--dark-2)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  background: competitor.color,
                  color: 'var(--light-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Heading level={4} style={{ fontWeight: 700, color: 'inherit' }}>{competitor.initials}</Heading>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <ChannelBadge channel={card.channel} />
                  <CompetitorBadge k={card.competitor} />
                </div>
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-80)' }}>
                  {card.caption || card.googleHeadline || card.metaBrand}
                </Text>
              </div>
            </div>

            {/* Draft label + generating indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>Your draft</Text>
              {generating && (
                <Text variant="metadata" style={{ color: 'var(--purple)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <DotPulse /> Generating…
                </Text>
              )}
            </div>

            {!isAd && (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  placeholder={generating ? 'Drafting…' : 'Your branded draft will appear here'}
                  style={{
                    width: '100%',
                    fontSize: 14,
                    border: '1px solid var(--dark-15)',
                    borderRadius: 8,
                    padding: 12,
                    outline: 'none',
                    resize: 'vertical',
                    background: 'var(--light-100)',
                  }}
                />
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
                  {charCount} characters
                </Text>

                <Text variant="smallList" style={{ display: 'block', marginTop: 16, color: 'var(--dark-80)', marginBottom: 8 }}>
                  Post to
                </Text>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['tiktok', 'instagram', 'linkedin'] as const).map((p) => (
                    <TabChip
                      key={p}
                      selected={platform === p}
                      onSelect={() => setPlatform(p)}
                    >
                      {p === 'tiktok' ? '♪ TikTok' : p === 'instagram' ? '📸 Instagram' : 'in LinkedIn'}
                    </TabChip>
                  ))}
                </div>
              </>
            )}

            {isAd && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AdField label="Headline">
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={adFieldInputStyle}
                  />
                </AdField>
                <AdField label="Body">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    style={{ ...adFieldInputStyle, resize: 'vertical' }}
                  />
                </AdField>
                <AdField label="Call-to-action">
                  <input value={cta} onChange={(e) => setCta(e.target.value)} style={adFieldInputStyle} />
                </AdField>
                <AdField label="Run on">
                  <Text
                    variant="smallList"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 99,
                      border: '1px solid var(--purple)',
                      background: PURPLE_TINT_BG,
                      color: 'var(--purple)',
                    }}
                  >
                    {channelLabel(card.channel)}
                  </Text>
                </AdField>
                <AdField label="Daily budget">
                  <div style={{ padding: 14, border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--dark-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>Spend per day</Text>
                      <Heading level={4} style={{ fontWeight: 700, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                        ${budget}
                        <Text variant="metadata" style={{ color: 'var(--dark-60)', marginLeft: 4 }}>/day</Text>
                      </Heading>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={5}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--purple)' }}
                    />
                    <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 6 }}>
                      🎯 Est. daily reach <Text variant="metadata" style={{ color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>{estReach.toLocaleString()}</Text> · ~30-day total: <Text variant="metadata" style={{ color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>${estTotal.toLocaleString()}</Text>
                    </Text>
                  </div>
                </AdField>
              </div>
            )}
          </>
        )}

        {stage === 'saved' && (
          <div>
            <Text variant="smallList" style={{ display: 'block', color: 'var(--purple)', marginBottom: 12 }}>
              ✓ Draft saved to your queue
            </Text>
            <PhoneMockup card={card} draft={draft} platform={platform} isAd={isAd} headline={headline} body={body} cta={cta} budget={budget} />
            <div style={{ marginTop: 18 }}>
              <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>When should this go out?</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {['Today 3pm', 'Today 6pm', 'Tomorrow 9am', 'Tuesday 9am', 'Wednesday 12pm'].map((t) => (
                  <Chip
                    key={t}
                    size="sm"
                    selected={scheduleTime === t}
                    onSelectionChange={() => setScheduleTime(t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'scheduled' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <Heading level={4} style={{ color: 'var(--dark-90)', display: 'block', marginBottom: 6 }}>
              Scheduled for {scheduleTime}
            </Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
              Your remix is queued. We'll publish it for you and send a confirmation.
            </Text>
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        {stage === 'draft' && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
          </Modal.FooterContent>
        )}
        {stage === 'saved' && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="tertiary" onPress={() => setStage('draft')}>Back to draft</Modal.FooterButton>
          </Modal.FooterContent>
        )}
        {stage === 'scheduled' && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
          </Modal.FooterContent>
        )}
        {stage !== 'scheduled' && (
          <Modal.FooterContent slot="right">
            {stage === 'draft' && (
              <Modal.FooterButton
                variant="primary"
                onPress={() => {
                  setStage('saved');
                  showToast({ message: 'Draft saved to your queue', variant: 'success' });
                }}
              >
                Save Draft
              </Modal.FooterButton>
            )}
            {stage === 'saved' && (
              <Modal.FooterButton
                variant="primary"
                onPress={() => {
                  if (!scheduleTime) {
                    showToast({ message: 'Pick a time first', variant: 'error' });
                    return;
                  }
                  setStage('scheduled');
                  showToast({ message: `Scheduled for ${scheduleTime}`, variant: 'success' });
                }}
              >
                Confirm schedule
              </Modal.FooterButton>
            )}
          </Modal.FooterContent>
        )}
      </Modal.Footer>
    </Modal.Root>
  );
}

function AdField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text variant="metadata" style={{ color: 'var(--dark-80)' }}>{label}</Text>
      {children}
    </label>
  );
}

const adFieldInputStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 14,
  border: '1px solid var(--dark-15)',
  borderRadius: 8,
  padding: 12,
  outline: 'none',
  background: 'var(--light-100)',
};

function DotPulse() {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      <span style={dotStyle} />
      <span style={{ ...dotStyle, animationDelay: '0.15s' }} />
      <span style={{ ...dotStyle, animationDelay: '0.3s' }} />
    </span>
  );
}

const dotStyle: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--purple)',
  display: 'inline-block',
  animation: 'remix-dot-pulse 1.2s infinite ease-in-out',
};

function PhoneMockup({
  card,
  draft,
  platform,
  isAd,
  headline,
  body,
  cta,
}: {
  card: FeedCard;
  draft: string;
  platform: 'tiktok' | 'instagram' | 'linkedin';
  isAd: boolean;
  headline: string;
  body: string;
  cta: string;
  budget: number;
}) {
  if (isAd) {
    return (
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 16, background: 'var(--light-100)', maxWidth: 420 }}>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#202124', border: '1px solid #202124', padding: '0 4px', borderRadius: 3, marginBottom: 8 }}>Sponsored</div>
        <div style={{ fontSize: 18, color: '#1A0DAB', fontWeight: 500, lineHeight: '24px', marginBottom: 8 }}>{headline}</div>
        <div style={{ fontSize: 13, color: 'var(--dark-80)', lineHeight: '19px', marginBottom: 12 }}>{body}</div>
        <Button variant="primary" size="sm" onPress={() => undefined}>{cta}</Button>
      </div>
    );
  }
  return (
    <div style={{ border: '14px solid var(--dark-90)', borderRadius: 32, padding: 16, background: 'var(--light-100)', maxWidth: 320, margin: '0 auto', minHeight: 360 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)' }} />
        <strong style={{ fontSize: 13 }}>CertaPro Painters of Austin</strong>
        <span style={{ fontSize: 11, color: 'var(--dark-60)', marginLeft: 'auto' }}>{platform}</span>
      </div>
      <div style={{ background: card.type === 'organic-li' ? '#F3F2EF' : 'var(--dark-4)', borderRadius: 8, height: 160, marginBottom: 10 }} />
      <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: '18px' }}>{draft}</div>
    </div>
  );
}

function seedDraft(card: FeedCard) {
  const isAd = card.type === 'ad-google' || card.type === 'ad-meta';
  if (isAd) {
    return {
      caption: '',
      headline: card.googleHeadline ?? card.caption ?? 'Repaint your Austin home — same crew, start to finish.',
      body: card.googleDesc ?? card.caption ?? 'Interior + exterior painting in the Austin metro. Licensed crews, 2-year warranty.',
      cta: card.metaCta ?? 'Get free estimate',
    };
  }
  return {
    caption: `Inspired by ${COMPETITORS[card.competitor].name}: ${card.caption}\n\nReframed for CertaPro Painters of Austin — same-crew accountability, full-scope painting (interior, exterior, cabinets, HOA).`,
    headline: '',
    body: '',
    cta: '',
  };
}
