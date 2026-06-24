import { useEffect, useState } from 'react';
import { Text, Button, Heading } from '@/components';
import { Card, StatusPill, Chip } from '@/staging';
import Plus from '@/icons/20/Plus';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import type { Account, AssetType, WeekTheme } from './lib/types';
import * as S from './lib/strategy';
import { PhaseScreen, type Go } from './nav';
import { AmReviewPanel } from './Review';
import { SectionHeading, TextArea, AddLink, RemoveX, HoverInput, IntroPage, SuccessState } from './ui';
import { AssetCard } from './AssetCard';
import { CreativePlan } from './CreativePlan';
import { BrandGuidelinesEditor } from './CreativeFeedbackExtras';
import { reviewItems, type Wave, type SampleItem } from './lib/creative';
import { useReview } from './lib/review';

const ORDER: AssetType[] = ['Still Image', 'Video', 'Carousel', 'Story', 'Search Ad', 'Meta Ad', 'Blog Post', 'Email'];

export function CreativeReview({ account, sub, go }: { account: Account; sub: string; go: Go }) {
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]).title;
  // Generation waves live here so they persist across sub-steps — the items the
  // AM marks in the Plan step flow into the Visual review step.
  const [waves, setWaves] = useState<Wave[]>([]);
  const { setCreativeComplete } = useReview();
  useEffect(() => { if (sub === 'done') setCreativeComplete(true); }, [sub, setCreativeComplete]);

  if (sub === 'intro') {
    return (
      <IntroPage
        title="Review the first wave of creative"
        intro={`Seeded from the "${theme}" strategy. Plan and generate samples, pick what's worth the customer's time, then capture feedback and set the cadence.`}
        steps={[
          { label: 'Plan & generate', desc: 'Choose what to generate (or upload your own) and run waves until it’s right.' },
          { label: 'Visual review', desc: 'The samples you marked, ready for the customer to approve.' },
          { label: 'Feedback summary', desc: 'Inferred taste + brand guidelines, auto-saved to the Brand Kit.' },
          { label: 'Campaign calendar', desc: 'Weekly cadence plus two months of campaign themes.' },
        ]}
        action={<Button size="lg" onPress={() => go(`/${account.id}/am/creative/plan`)}>Start review</Button>}
      />
    );
  }
  if (sub === 'done') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SuccessState
          title="Creative approved"
          body="We'll produce the full campaign from this direction. Here's where everything you set lives."
          stored={[
            { label: 'Creative preferences from feedback', where: 'Brand Kit' },
            { label: 'Weekly schedule & campaign themes', where: 'Content Calendar' },
          ]}
          action={<Button size="lg" onPress={() => go(`/${account.id}/client`)}>Open client portal</Button>}
        />
        <AmReviewPanel account={account} phase="creative" go={go} />
      </div>
    );
  }

  return (
    <PhaseScreen account={account} side="am" section="creative" sub={sub} go={go} prevSection="strategy" nextLabel="Finish & open client portal" maxWidth={960}>
      {sub === 'plan' && <CreativePlan account={account} waves={waves} setWaves={setWaves} />}
      {sub === 'storyboard' && <Storyboard account={account} items={reviewItems(waves)} onGoToPlan={() => go(`/${account.id}/am/creative/plan`)} />}
      {sub === 'feedback' && <FeedbackSummary account={account} />}
      {sub === 'calendar' && <Calendar account={account} />}
    </PhaseScreen>
  );
}

function Storyboard({ account, items, onGoToPlan }: { account: Account; items: SampleItem[]; onGoToPlan: () => void }) {
  const groups = ORDER.map((t) => [t, items.filter((a) => a.type === t)] as const).filter(([, l]) => l.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed var(--dark-12)', borderRadius: 12 }}>
          <Heading level={4} style={{ margin: '0 0 6px' }}>Nothing marked for review yet</Heading>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Generate samples and tick “Include in customer review” in the Plan step — they’ll show up here.</Text>
          <Button variant="secondary" onPress={onGoToPlan}>Go to Plan</Button>
        </div>
      ) : (
        groups.map(([t, list]) => (
          <section key={t}>
            <SectionHeading title={t} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
              {list.map((a) => <AssetCard key={a.id} asset={a} />)}
            </div>
          </section>
        ))
      )}
      <section>
        <SectionHeading title="SEO keyword plan" desc="Chosen for local intent + winnable difficulty." />
        <SeoPlan account={account} />
      </section>
    </div>
  );
}

function SeoPlan({ account }: { account: Account }) {
  const [react, setReact] = useState<Record<number, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {S.seoKeywords(account).map((k, i) => {
        const r = react[i];
        return (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <Text variant="largeList" color="var(--dark-90)">{k.keyword}</Text>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text variant="metadata" color="var(--dark-60)">{k.volume}</Text>
                <StatusPill tone="neutral">{k.intent}</StatusPill>
                <StatusPill tone={k.difficulty === 'Low' ? 'success' : k.difficulty === 'Medium' ? 'warning' : 'danger'}>{k.difficulty}</StatusPill>
                <button title="Keep" onClick={() => setReact({ ...react, [i]: r === 'like' ? undefined : 'like' })} style={{ width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: r === 'like' ? 'none' : '1px solid var(--dark-8)', background: r === 'like' ? 'var(--positive-10)' : 'var(--light-100)', color: r === 'like' ? 'var(--positive-60)' : 'var(--dark-60)' }}><ThumbUp size={16} /></button>
                <button title="Drop" onClick={() => setReact({ ...react, [i]: r === 'dislike' ? undefined : 'dislike' })} style={{ width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: r === 'dislike' ? 'none' : '1px solid var(--dark-8)', background: r === 'dislike' ? 'var(--negative-10)' : 'var(--light-100)', color: r === 'dislike' ? 'var(--negative-60)' : 'var(--dark-60)' }}><ThumbDown size={16} /></button>
              </div>
            </div>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>★ {k.why}</Text>
          </Card>
        );
      })}
      <div style={{ marginTop: 8 }}>
        <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 6 }}>Feedback on the keyword plan</Text>
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add or remove keywords, flag intent, or note local terms we missed…" style={{ minHeight: 72 }} />
      </div>
    </div>
  );
}

function FeedbackSummary({ account }: { account: Account }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <BrandGuidelinesEditor account={account} />
    </div>
  );
}

/* ─── Campaign calendar: weekly schedule CRUD + multiple strategy tracks ──── */
const CONTENT_TYPES = ['Still Image', 'Video', 'Carousel', 'Story', 'Blog Post', 'Email'] as const;
const DEFAULT_CHANNEL: Record<string, string> = { 'Still Image': 'Instagram', Video: 'Instagram', Carousel: 'Instagram', Story: 'Instagram', 'Blog Post': 'Google', Email: 'Email' };
interface SlotItem { id: string; type: string; channels: string[] }
type Schedule = Record<string, SlotItem[]>;
interface Track { id: string; name: string; schedule: Schedule }
let idSeq = 1;
const emptySchedule = (): Schedule => ({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });

function Calendar({ account }: { account: Account }) {
  const [tracks, setTracks] = useState<Track[]>(() => [{
    id: 'core', name: 'Evergreen campaign',
    schedule: { ...emptySchedule(), Tue: [{ id: 't1', type: 'Still Image', channels: ['Instagram', 'Facebook'] }], Wed: [{ id: 't2', type: 'Video', channels: ['Instagram', 'TikTok'] }], Fri: [{ id: 't3', type: 'Email', channels: ['Email'] }] },
  }]);
  const [adding, setAdding] = useState<{ trackId: string; day: string } | null>(null);
  const [fType, setFType] = useState<string>(CONTENT_TYPES[0]);
  const [fChannels, setFChannels] = useState<string[]>([]);
  const [fDays, setFDays] = useState<string[]>([]);
  const [themes, setThemes] = useState<WeekTheme[]>(() => S.seasonalThemes(account));
  const total = tracks.reduce((n, t) => n + Object.values(t.schedule).reduce((m, l) => m + l.length, 0), 0);

  const openAdd = (trackId: string, day: string) => { setAdding({ trackId, day }); setFType('Still Image'); setFChannels([DEFAULT_CHANNEL['Still Image']]); setFDays([day]); };
  const confirmAdd = () => {
    if (!adding) return;
    setTracks(tracks.map((t) => {
      if (t.id !== adding.trackId) return t;
      const sched = { ...t.schedule };
      fDays.forEach((d) => { sched[d] = [...(sched[d] ?? []), { id: `s${idSeq++}`, type: fType, channels: fChannels }]; });
      return { ...t, schedule: sched };
    }));
    setAdding(null);
  };
  const removeItem = (trackId: string, day: string, id: string) => setTracks(tracks.map((t) => t.id !== trackId ? t : { ...t, schedule: { ...t.schedule, [day]: t.schedule[day].filter((s) => s.id !== id) } }));
  const addTrack = () => setTracks([...tracks, { id: `tr${idSeq++}`, name: 'New strategy', schedule: emptySchedule() }]);
  const renameTrack = (id: string, name: string) => setTracks(tracks.map((t) => t.id === id ? { ...t, name } : t));
  const removeTrack = (id: string) => setTracks(tracks.filter((t) => t.id !== id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <SectionHeading title="Weekly schedule" desc="Add posts to any day. Each strategy is its own track (e.g. Offers, Thought leadership)." right={<StatusPill tone="info">{total} posts / week</StatusPill>} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tracks.map((track, ti) => (
            <div key={track.id} style={{ paddingTop: ti ? 20 : 0, paddingBottom: ti < tracks.length - 1 ? 20 : 0, borderTop: ti ? '1px solid var(--dark-8)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <HoverInput value={track.name} onChange={(v) => renameTrack(track.id, v)} style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.16px', maxWidth: 280, marginLeft: -8 }} />
                {tracks.length > 1 && <RemoveX variant="tertiary" onClick={() => removeTrack(track.id)} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                {S.DAYS.map((d) => (
                  <div key={d} style={{ minHeight: 112, display: 'flex', flexDirection: 'column', borderRadius: 8, background: 'var(--dark-2)', border: '1px solid var(--dark-4)', padding: 8 }}>
                    <Text variant="metadata" color="var(--dark-40)" style={{ marginBottom: 6 }}>{d}</Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      {track.schedule[d].map((s) => (
                        <div key={s.id} style={{ position: 'relative', borderRadius: 6, background: 'var(--light-100)', border: '1px solid var(--dark-6)', padding: 6 }}>
                          <Text variant="metadata" color="var(--dark-90)" style={{ display: 'block' }}>{s.type}</Text>
                          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.channels.join(', ')}</Text>
                          <button onClick={() => removeItem(track.id, d, s.id)} style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 4, border: 'none', background: 'var(--dark-6)', color: 'var(--dark-60)', cursor: 'pointer', fontSize: 10, lineHeight: 1 }}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'center' }}><Button variant="tertiary" size="sm" frontIcon={Plus} onPress={() => openAdd(track.id, d)}>Add</Button></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}><Button variant="secondary" size="sm" frontIcon={Plus} onPress={addTrack}>Add strategy track</Button></div>
      </div>

      {adding && (
        <div onClick={() => setAdding(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: '90vw', background: 'var(--light-100)', borderRadius: 14, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <Heading level={4} style={{ margin: '0 0 16px' }}>Add to schedule</Heading>
            <PickerGroup label="Content type">
              {CONTENT_TYPES.map((t) => <Chip key={t} selected={fType === t} onSelectionChange={() => { setFType(t); if (!fChannels.length) setFChannels([DEFAULT_CHANNEL[t]]); }}>{t}</Chip>)}
            </PickerGroup>
            <PickerGroup label="Channels">
              {S.CHANNELS.map((c) => { const on = fChannels.includes(c); return <Chip key={c} selected={on} onSelectionChange={(sel) => setFChannels(sel ? [...fChannels, c] : fChannels.filter((x) => x !== c))}>{c}</Chip>; })}
            </PickerGroup>
            <PickerGroup label="Which days?">
              {S.DAYS.map((d) => { const on = fDays.includes(d); return <Chip key={d} selected={on} onSelectionChange={(sel) => setFDays(sel ? [...fDays, d] : fDays.filter((x) => x !== d))}>{d}</Chip>; })}
            </PickerGroup>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" onPress={() => setAdding(null)}>Cancel</Button>
              <Button onPress={confirmAdd} isDisabled={!fChannels.length || !fDays.length}>Add{fDays.length > 1 ? ` to ${fDays.length} days` : ''}</Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <SectionHeading title="Weekly evergreen campaign themes, next 2 months" right={<Button size="sm" variant="secondary" onPress={() => setThemes(S.seasonalThemes(account))}>Regenerate</Button>} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {themes.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'stretch', paddingTop: i ? 16 : 0, paddingBottom: 16, borderTop: i ? '1px solid var(--dark-8)' : 'none' }}>
              <div style={{ width: 100, height: 100, flexShrink: 0, alignSelf: 'center', borderRadius: 8, background: 'var(--dark-2)', padding: '6px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>Week</Text>
                <HoverInput value={w.week} onChange={(v) => setThemes(themes.map((x, j) => j === i ? { ...x, week: v } : x))} style={{ textAlign: 'center', fontSize: 15, fontWeight: 400, padding: '2px 4px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><HoverInput value={w.title} placeholder="Campaign title" onChange={(v) => setThemes(themes.map((x, j) => j === i ? { ...x, title: v } : x))} style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.16px' }} /></div>
                  <StatusPill tone="neutral">{w.season}</StatusPill>
                  <RemoveX variant="tertiary" onClick={() => setThemes(themes.filter((_, j) => j !== i))} />
                </div>
                <TextArea value={w.description} placeholder="What this campaign is about…" onChange={(e) => setThemes(themes.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} style={{ minHeight: 56 }} />
              </div>
            </div>
          ))}
          <AddLink label="Add campaign" onClick={() => setThemes([...themes, { week: 'New', title: '', description: '', season: 'Custom' }])} />
        </div>
      </div>
    </div>
  );
}

function PickerGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>{label}</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}
