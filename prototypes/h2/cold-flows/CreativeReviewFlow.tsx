import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Card, Chip, StatusPill } from '@/staging';
import { Input, Textarea } from '../_ui';
import { stockImage } from '../stock-images';
import Edit1 from '@/icons/20/Edit1';
import ImageArrows from '@/icons/20/ImageArrows';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Trash2 from '@/icons/20/Trash2';
import Check2 from '@/icons/20/Check2';
import Close from '@/icons/20/Close';
import XCircleContained from '@/icons/20/XCircleContained';
import Plus from '@/icons/20/Plus';
import {
  AddLink,
  FlowBody,
  FlowFooter,
  FlowHeader,
  FlowTakeover,
  RemoveX,
  SectionHeading,
} from './cold-flow-shell';
import {
  ASSET_ORDER,
  CHANNELS,
  CONTENT_TYPES,
  CREATIVE_PREFS,
  DAYS,
  DEFAULT_CHANNEL,
  SEO_KEYWORDS,
  generatedAssets,
  seasonalThemes,
  type GeneratedAsset,
  type WeekTheme,
} from './creative-data';

/**
 * V2 cold-state "Creative review" flow — full-screen takeover launched from
 * HomeColdView. Ported from blaze-dfy's CreativeReview.tsx, rebuilt H2-native
 * and leaned paid-first. blaze-dfy's AM/client review-packet split is dropped
 * (H2 has no AM/client roles) — the flow ends on its own done screen.
 */

export const THEME = 'Cabinet Season';
const STEPS = ['storyboard', 'feedback'] as const;
type Phase = (typeof STEPS)[number];

/** Preview aspect ratio per format — Instagram portrait (4:5) for stills, ads &
 *  carousels; vertical (9:16) for stories and video reels. */
const ASPECT: Partial<Record<GeneratedAsset['type'], string>> = {
  'Meta Ad': '4 / 5',
  'Search Ad': '4 / 5',
  'Still Image': '4 / 5',
  Carousel: '4 / 5',
  Story: '9 / 16',
  Video: '9 / 16',
};

export function CreativeReviewFlow({ onClose, onFinish }: { onClose: () => void; onFinish: () => void }) {
  // Opens straight on the storyboard (no intro) and finishes from the feedback
  // step (no separate "approved" screen).
  const [phase, setPhase] = useState<Phase>('storyboard');
  const assets = useMemo(() => generatedAssets(THEME), []);

  const idx = STEPS.indexOf(phase);
  const stepNum = idx + 1;

  // Last step → finish; otherwise advance.
  const goNext = () => (idx < STEPS.length - 1 ? setPhase(STEPS[idx + 1]) : onFinish());
  // First step → exit the takeover; otherwise step back.
  const goBack = () => (idx > 0 ? setPhase(STEPS[idx - 1]) : onClose());

  return (
    <FlowTakeover step={stepNum} totalSteps={STEPS.length} onClose={onClose}>
      {phase === 'storyboard' && (
        <FlowBody maxWidth={1000}>
          <FlowHeader eyebrow="Creative review" title="The first wave of creative" />
          <Storyboard theme={THEME} assets={assets} />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Continue" />
        </FlowBody>
      )}

      {phase === 'feedback' && (
        <FlowBody>
          <FlowHeader eyebrow="Creative review" title="What we learned" subtitle="Synthesized from this round's feedback and swipe-file reactions." />
          <FeedbackSummary />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Approve creative" />
        </FlowBody>
      )}
    </FlowTakeover>
  );
}

// ─── Storyboard (left-rail TOC + asset grid + SEO plan) ─────────────────────

export function Storyboard({ assets: initialAssets }: { theme?: string; assets: GeneratedAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const groups = ASSET_ORDER.map((t) => [t, assets.filter((a) => a.type === t)] as const).filter(([, l]) => l.length);
  // "Add more" generates another asset of that format — clones a template of the
  // type with a fresh id so it renders a new preview.
  const addMore = (type: GeneratedAsset['type']) =>
    setAssets((prev) => {
      const base = prev.find((a) => a.type === type);
      if (!base) return prev;
      return [...prev, { ...base, id: `${type.replace(/\s/g, '-').toLowerCase()}-add-${prev.length}` }];
    });
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, minWidth: 0 }}>
        {groups.map(([t, list]) => (
          <section key={t}>
            <SectionHeading
              title={t}
              right={
                <Button variant="tertiary" size="sm" frontIcon={Plus} onPress={() => addMore(t)}>
                  Add more
                </Button>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
              {list.map((a) => (
                <AssetCard key={a.id} asset={a} />
              ))}
            </div>
          </section>
        ))}
        <section>
          <SectionHeading title="SEO keyword plan" desc="Chosen for local intent + winnable difficulty." />
          <SeoPlan />
        </section>
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: GeneratedAsset }) {
  const [fb, setFb] = useState({ topic: '', caption: '', overlay: '' });
  const [panel, setPanel] = useState<'edit' | 'replace' | null>(null);
  const [seed, setSeed] = useState(0);
  const [hover, setHover] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [decision, setDecision] = useState<'none' | 'approved' | 'changes'>('none');
  const [notesOpen, setNotesOpen] = useState(false);
  const [caption, setCaption] = useState(asset.caption);
  const textOnly = asset.type === 'Blog Post' || asset.type === 'Email';
  if (deleted) return null;
  return (
    <Card padding="none" style={{ overflow: 'visible', position: 'relative' }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div
          style={{
            position: 'relative',
            ...(textOnly ? { height: 132 } : { aspectRatio: ASPECT[asset.type] ?? '4 / 5' }),
            overflow: 'hidden',
            borderRadius: '8px 8px 0 0',
            background: textOnly ? 'var(--dark-3)' : 'var(--dark-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!textOnly && (
            <img
              src={stockImage(`${asset.id}-${seed}`, 480, 300)}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {!textOnly && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55))' }} />}
          {/* hover actions: edit design · replace · regenerate · delete */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              display: 'flex',
              gap: 6,
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.12s',
              pointerEvents: hover ? 'auto' : 'none',
            }}
          >
            <MiniBtn title="Edit design" onClick={() => setPanel(panel === 'edit' ? null : 'edit')}>
              <Edit1 size={14} />
            </MiniBtn>
            <MiniBtn title="Replace" onClick={() => setPanel(panel === 'replace' ? null : 'replace')}>
              <ImageArrows size={14} />
            </MiniBtn>
            <MiniBtn title="Regenerate" onClick={() => setSeed((s) => s + 1)}>
              <ArrowRefresh size={14} />
            </MiniBtn>
            <MiniBtn title="Delete" onClick={() => setDeleted(true)}>
              <Trash2 size={14} />
            </MiniBtn>
          </div>
          <Text
            variant="smallList"
            style={{
              position: 'relative',
              zIndex: 1,
              padding: '32px 16px 16px',
              textAlign: 'center',
              color: textOnly ? 'var(--dark-60)' : 'var(--light-100)',
              textShadow: textOnly ? 'none' : '0 1px 7px rgba(0,0,0,0.45)',
            }}
          >
            {textOnly ? asset.type : asset.overlay}
          </Text>
        </div>
        <div style={{ padding: 12 }}>
          {panel === 'edit' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <Input inputSize="sm" fullWidth placeholder="Describe the change…" />
              <Button size="sm" onPress={() => setPanel(null)}>
                Apply
              </Button>
            </div>
          )}
          {panel === 'replace' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <Button variant="secondary" size="sm" fullWidth onPress={() => setPanel(null)}>
                Upload a file
              </Button>
              <Button variant="secondary" size="sm" fullWidth onPress={() => setPanel(null)}>
                Paste a link
              </Button>
            </div>
          )}
          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 2 }}>
            {asset.topic}
          </Text>
          <div style={{ margin: '0 0 8px' }}>
            <HoverInput value={caption} onChange={setCaption} multiline placeholder="Caption…" style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', lineHeight: 1.5, minHeight: 0 }} />
          </div>
          {/* approve / request changes */}
          {decision === 'approved' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusPill tone="success">Approved</StatusPill>
              <Button variant="ghost" size="sm" onPress={() => setDecision('none')}>
                Undo
              </Button>
            </div>
          ) : decision === 'changes' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusPill tone="warning">Changes requested</StatusPill>
              <Button variant="ghost" size="sm" onPress={() => setNotesOpen(true)}>
                Edit notes
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              <span style={{ position: 'relative' }}>
                <Button variant="secondary" size="sm" onPress={() => setNotesOpen(true)}>
                  Request changes
                </Button>
                {notesOpen && (
                  <>
                    <div onClick={() => setNotesOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        right: 0,
                        width: 300,
                        zIndex: 30,
                        background: 'var(--light-100)',
                        border: '1px solid var(--dark-8)',
                        borderRadius: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
                        Request changes
                      </Text>
                      {(['topic', 'caption', 'overlay'] as const).map((k) => (
                        <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
                            {k === 'overlay' ? 'Image / text overlay' : k.charAt(0).toUpperCase() + k.slice(1)}
                          </Text>
                          <Textarea value={fb[k]} onChange={(e) => setFb({ ...fb, [k]: e.target.value })} placeholder={`Notes on ${k}…`} style={{ minHeight: 46 }} />
                        </label>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
                        <Button variant="ghost" size="sm" onPress={() => setNotesOpen(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onPress={() => { setDecision('changes'); setNotesOpen(false); }}>
                          Send notes
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </span>
              <Button variant="secondary" size="sm" frontIcon={Check2} onPress={() => setDecision('approved')}>
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SeoPlan() {
  const [react, setReact] = useState<Record<number, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState('');
  const voteBtn = (active: boolean, activeBg: string, activeColor: string): CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 7,
    cursor: 'pointer',
    border: active ? 'none' : '1px solid var(--dark-8)',
    background: active ? activeBg : 'var(--light-100)',
    color: active ? activeColor : 'var(--dark-60)',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SEO_KEYWORDS.map((k, i) => {
        const r = react[i];
        return (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <Text variant="largeList" style={{ color: 'var(--dark-90)' }}>
                {k.keyword}
              </Text>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
                  {k.volume}
                </Text>
                <StatusPill tone="neutral">{k.intent}</StatusPill>
                <StatusPill tone={k.difficulty === 'Low' ? 'success' : k.difficulty === 'Medium' ? 'warning' : 'danger'}>{k.difficulty}</StatusPill>
                <button title="Keep" onClick={() => setReact({ ...react, [i]: r === 'like' ? undefined : 'like' })} style={voteBtn(r === 'like', 'var(--positive-10)', 'var(--positive-60)')}>
                  👍
                </button>
                <button title="Drop" onClick={() => setReact({ ...react, [i]: r === 'dislike' ? undefined : 'dislike' })} style={voteBtn(r === 'dislike', 'var(--negative-10)', 'var(--negative-60)')}>
                  👎
                </button>
              </div>
            </div>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>
              ★ {k.why}
            </Text>
          </Card>
        );
      })}
      <div style={{ marginTop: 8 }}>
        <Text variant="largeList" style={{ display: 'block', color: 'var(--dark-90)', marginBottom: 6 }}>
          Feedback on the keyword plan
        </Text>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add or remove keywords, flag intent, or note local terms we missed…" style={{ minHeight: 72 }} />
      </div>
    </div>
  );
}

function MiniBtn({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
        background: 'rgba(255,255,255,0.9)',
        color: 'var(--dark-80)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}
    >
      {children}
    </button>
  );
}

// ─── Feedback summary ───────────────────────────────────────────────────────

export function FeedbackSummary() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <PrefColumn
          title="Lean into"
          tone="positive"
          icon={<Check2 size={16} color="var(--light-100)" />}
          items={CREATIVE_PREFS.learned}
        />
        <PrefColumn
          title="Avoid"
          tone="negative"
          icon={<Close size={16} color="var(--light-100)" />}
          items={CREATIVE_PREFS.avoid}
        />
      </div>
    </div>
  );
}

function PrefColumn({
  title,
  tone,
  icon,
  items,
}: {
  title: string;
  tone: 'positive' | 'negative';
  icon: ReactNode;
  items: string[];
}) {
  const chipBg = tone === 'positive' ? 'var(--positive-50)' : 'var(--negative-50)';
  const headerColor = tone === 'positive' ? 'var(--positive-60)' : 'var(--negative-60)';
  const rowBg = tone === 'positive' ? 'var(--positive-10)' : 'var(--negative-10)';
  const rowIconColor = tone === 'positive' ? 'var(--positive-60)' : 'var(--negative-60)';
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: 8,
            background: chipBg,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </span>
        <Text variant="largeList" style={{ color: headerColor }}>
          {title}
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              background: rowBg,
            }}
          >
            <span style={{ flexShrink: 0, color: rowIconColor, display: 'inline-flex' }}>
              {tone === 'positive' ? <Check2 size={16} /> : <XCircleContained size={16} />}
            </span>
            <Text style={{ color: 'var(--dark-90)', lineHeight: 1.45 }}>{p}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Campaign calendar ──────────────────────────────────────────────────────

interface SlotItem {
  id: string;
  type: string;
  channels: string[];
}
type Schedule = Record<string, SlotItem[]>;
interface Track {
  id: string;
  name: string;
  schedule: Schedule;
}
let idSeq = 1;
const emptySchedule = (): Schedule => ({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });

export function Calendar() {
  const [tracks, setTracks] = useState<Track[]>(() => [
    {
      id: 'core',
      name: 'Always-on paid',
      schedule: {
        ...emptySchedule(),
        Mon: [{ id: 't1', type: 'Meta Ad', channels: ['Meta Ads'] }],
        Wed: [{ id: 't2', type: 'Search Ad', channels: ['Google'] }],
        Fri: [{ id: 't3', type: 'Email', channels: ['Email'] }],
      },
    },
  ]);
  const [adding, setAdding] = useState<{ trackId: string; day: string } | null>(null);
  const [fType, setFType] = useState<string>(CONTENT_TYPES[0]);
  const [fChannels, setFChannels] = useState<string[]>([]);
  const [fDays, setFDays] = useState<string[]>([]);
  const [themes, setThemes] = useState<WeekTheme[]>(() => seasonalThemes());
  const total = tracks.reduce((n, t) => n + Object.values(t.schedule).reduce((m, l) => m + l.length, 0), 0);

  const openAdd = (trackId: string, day: string) => {
    setAdding({ trackId, day });
    setFType('Meta Ad');
    setFChannels([DEFAULT_CHANNEL['Meta Ad']]);
    setFDays([day]);
  };
  const confirmAdd = () => {
    if (!adding) return;
    setTracks(
      tracks.map((t) => {
        if (t.id !== adding.trackId) return t;
        const sched = { ...t.schedule };
        fDays.forEach((d) => {
          sched[d] = [...(sched[d] ?? []), { id: `s${idSeq++}`, type: fType, channels: fChannels }];
        });
        return { ...t, schedule: sched };
      }),
    );
    setAdding(null);
  };
  const removeItem = (trackId: string, day: string, id: string) =>
    setTracks(tracks.map((t) => (t.id !== trackId ? t : { ...t, schedule: { ...t.schedule, [day]: t.schedule[day].filter((s) => s.id !== id) } })));
  const addTrack = () => setTracks([...tracks, { id: `tr${idSeq++}`, name: 'New strategy', schedule: emptySchedule() }]);
  const renameTrack = (id: string, name: string) => setTracks(tracks.map((t) => (t.id === id ? { ...t, name } : t)));
  const removeTrack = (id: string) => setTracks(tracks.filter((t) => t.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <SectionHeading
          title="Weekly schedule"
          desc="Add posts to any day. Each strategy is its own track (e.g. Always-on paid, Offers)."
          right={<StatusPill tone="info">{total} posts / week</StatusPill>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tracks.map((track) => (
            <div key={track.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <HoverInput value={track.name} onChange={(v) => renameTrack(track.id, v)} style={{ fontSize: 14, letterSpacing: '0.28px', fontWeight: 500, maxWidth: 280 }} />
                {tracks.length > 1 && <RemoveX onClick={() => removeTrack(track.id)} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ minHeight: 112, display: 'flex', flexDirection: 'column', borderRadius: 8, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', padding: 8 }}>
                    <Text variant="metadata" style={{ color: 'var(--dark-60)', marginBottom: 6 }}>
                      {d}
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      {track.schedule[d].map((s) => (
                        <div key={s.id} style={{ position: 'relative', borderRadius: 6, background: 'var(--light-100)', border: '1px solid var(--dark-6)', padding: 6 }}>
                          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-90)' }}>
                            {s.type}
                          </Text>
                          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.channels.join(', ')}
                          </Text>
                          <button
                            onClick={() => removeItem(track.id, d, s.id)}
                            style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 4, border: 'none', background: 'var(--dark-6)', color: 'var(--dark-60)', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <Button variant="secondary" size="sm" fullWidth onPress={() => openAdd(track.id, d)}>
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <AddLink label="Add strategy track" onClick={addTrack} />
        </div>
      </div>

      {adding && (
        <div onClick={() => setAdding(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '90vw', background: 'var(--light-100)', borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <Heading level={4} style={{ margin: '0 0 16px' }}>
              Add to schedule
            </Heading>
            <PickerGroup label="Content type">
              {CONTENT_TYPES.map((t) => (
                <Chip
                  key={t}
                  selected={fType === t}
                  onSelectionChange={() => {
                    setFType(t);
                    if (!fChannels.length) setFChannels([DEFAULT_CHANNEL[t]]);
                  }}
                >
                  {t}
                </Chip>
              ))}
            </PickerGroup>
            <PickerGroup label="Channels">
              {CHANNELS.map((c) => {
                const on = fChannels.includes(c);
                return (
                  <Chip key={c} selected={on} onSelectionChange={(sel: boolean) => setFChannels(sel ? [...fChannels, c] : fChannels.filter((x) => x !== c))}>
                    {c}
                  </Chip>
                );
              })}
            </PickerGroup>
            <PickerGroup label="Which days?">
              {DAYS.map((d) => {
                const on = fDays.includes(d);
                return (
                  <Chip key={d} selected={on} onSelectionChange={(sel: boolean) => setFDays(sel ? [...fDays, d] : fDays.filter((x) => x !== d))}>
                    {d}
                  </Chip>
                );
              })}
            </PickerGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" onPress={() => setAdding(null)}>
                Cancel
              </Button>
              <Button onPress={confirmAdd} isDisabled={!fChannels.length || !fDays.length}>
                Add{fDays.length > 1 ? ` to ${fDays.length} days` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <SectionHeading title="Campaign themes, next month" right={<Button size="sm" variant="secondary" onPress={() => setThemes(seasonalThemes())}>Regenerate</Button>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {themes.map((w, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 64, flexShrink: 0, borderRadius: 8, background: 'var(--dark-2)', padding: '6px 4px', textAlign: 'center' }}>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>
                    Week
                  </Text>
                  <HoverInput value={w.week} onChange={(v) => setThemes(themes.map((x, j) => (j === i ? { ...x, week: v } : x)))} style={{ textAlign: 'center', fontSize: 14, letterSpacing: '0.28px', fontWeight: 500, padding: '2px 4px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <HoverInput value={w.title} placeholder="Campaign title" onChange={(v) => setThemes(themes.map((x, j) => (j === i ? { ...x, title: v } : x)))} style={{ fontSize: 16, letterSpacing: '0.32px', fontWeight: 600 }} />
                    </div>
                    <StatusPill tone="neutral">{w.season}</StatusPill>
                    <RemoveX onClick={() => setThemes(themes.filter((_, j) => j !== i))} />
                  </div>
                  <HoverInput
                    value={w.description}
                    placeholder="What this campaign is about…"
                    multiline
                    onChange={(v) => setThemes(themes.map((x, j) => (j === i ? { ...x, description: v } : x)))}
                    style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-60)', minHeight: 38 }}
                  />
                </div>
              </div>
            </Card>
          ))}
          <AddLink label="Add campaign" onClick={() => setThemes([...themes, { week: 'New', title: '', description: '', season: 'Custom' }])} />
        </div>
      </div>
    </div>
  );
}

function PickerGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text variant="largeList" style={{ display: 'block', color: 'var(--dark-90)', marginBottom: 8 }}>
        {label}
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}

// ─── Local helpers (hover-to-edit inputs) ───────────────────────────────────

function HoverInput({
  value,
  onChange,
  placeholder,
  multiline,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: CSSProperties;
}) {
  const [hot, setHot] = useState(false);
  const shared: CSSProperties = {
    width: '100%',
    fontFamily: 'inherit',
    color: 'var(--dark-90)',
    outline: 'none',
    background: hot ? 'var(--light-100)' : 'transparent',
    borderRadius: 7,
    padding: '6px 8px',
    border: hot ? '1px solid var(--dark-12)' : '1px solid transparent',
    transition: 'background 0.1s, border 0.1s',
    ...style,
  };
  const handlers = {
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
  };
  return multiline ? (
    <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...handlers} style={{ ...shared, resize: 'vertical', lineHeight: 1.5 }} />
  ) : (
    <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...handlers} style={shared} />
  );
}
