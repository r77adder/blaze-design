import { useMemo, useState } from 'react';
import { Text, Button, Heading } from '@/components';
import { Card, StatusPill, Chip } from '@/staging';
import Plus from '@/icons/20/Plus';
import type { Account, GeneratedAsset, AssetType, WeekTheme } from './lib/types';
import * as S from './lib/strategy';
import { PhaseScreen, type Go } from './nav';
import { AmReviewPanel } from './Review';
import { SectionHeading, TextInput, TextArea, AddLink, RemoveX, HoverInput, IntroPage, SuccessState, SidePanel, PanelSection } from './ui';

const ORDER: AssetType[] = ['Still Image', 'Video', 'Carousel', 'Story', 'Search Ad', 'Meta Ad', 'Blog Post', 'Email'];

export function CreativeReview({ account, sub, go }: { account: Account; sub: string; go: Go }) {
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]).title;
  const assets = useMemo(() => S.generatedAssets(account, theme), [account, theme]);

  if (sub === 'intro') {
    return (
      <IntroPage
        title="Review the first wave of creative"
        intro={`We generated a storyboard for the "${theme}" theme — three of each format. Review it, capture feedback, then set the posting cadence and campaign themes.`}
        steps={[
          { label: 'Visual review', desc: 'Stills, video, carousels, ads, blogs, emails, and an SEO plan.' },
          { label: 'Feedback summary', desc: 'What the client wants changed — auto-saved to the Brand Kit.' },
          { label: 'Campaign calendar', desc: 'Weekly cadence plus two months of campaign themes.' },
        ]}
        action={<Button size="lg" onPress={() => go(`/${account.id}/am/creative/storyboard`)}>Start review</Button>}
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
      {sub === 'storyboard' && <Storyboard account={account} theme={theme} assets={assets} />}
      {sub === 'feedback' && <FeedbackSummary account={account} />}
      {sub === 'calendar' && <Calendar account={account} />}
    </PhaseScreen>
  );
}

function Storyboard({ account, theme, assets }: { account: Account; theme: string; assets: GeneratedAsset[] }) {
  const groups = ORDER.map((t) => [t, assets.filter((a) => a.type === t)] as const).filter(([, l]) => l.length);
  const items = [...groups.map(([t]) => ({ key: t as string, label: t as string })), { key: 'seo', label: 'SEO Plan' }];
  return (
    <div>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Generated for <strong style={{ color: 'var(--purple)' }}>{theme}</strong>, three of each format. Add feedback on any asset.</Text>
      <SidePanel items={items}>
        {groups.map(([t, list]) => (
          <PanelSection key={t} id={t}>
            <SectionHeading title={t} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {list.map((a) => <AssetCard key={a.id} asset={a} />)}
            </div>
          </PanelSection>
        ))}
        <PanelSection id="seo">
          <SectionHeading title="SEO keyword plan" desc="Chosen for local intent + winnable difficulty." />
          <SeoPlan account={account} />
        </PanelSection>
      </SidePanel>
    </div>
  );
}

function AssetCard({ asset }: { asset: GeneratedAsset }) {
  const [fb, setFb] = useState({ topic: '', caption: '', overlay: '' });
  const [regen, setRegen] = useState(false);
  const [hover, setHover] = useState(false);
  const textOnly = asset.type === 'Blog Post' || asset.type === 'Email';
  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {/* media on top */}
        <div style={{ position: 'relative', height: 150, overflow: 'hidden', background: textOnly ? 'var(--dark-3)' : 'var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!textOnly && <img src={`https://picsum.photos/seed/dfy-${asset.id}/480/300`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          {!textOnly && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55))' }} />}
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 2, display: 'flex', gap: 6, opacity: hover ? 1 : 0, transition: 'opacity 0.12s', pointerEvents: hover ? 'auto' : 'none' }}>
            <MiniBtn title="Regenerate" onClick={() => setRegen(!regen)}>↻</MiniBtn>
            <MiniBtn title="Upload a file" onClick={() => {}}>↑</MiniBtn>
            <MiniBtn title="Paste a link" onClick={() => {}}>🔗</MiniBtn>
          </div>
          <Text variant="smallList" color={textOnly ? 'var(--dark-40)' : 'var(--light-100)'} style={{ position: 'relative', zIndex: 1, padding: '32px 16px 16px', textAlign: 'center', textShadow: textOnly ? 'none' : '0 1px 7px rgba(0,0,0,0.45)' }}>{textOnly ? asset.type : asset.overlay}</Text>
        </div>
        <div style={{ padding: 12 }}>
          {regen && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <TextInput inputSize="sm" placeholder="Regenerate with a prompt…" style={{ flex: 1 }} />
              <Button size="sm" onPress={() => setRegen(false)}>Go</Button>
            </div>
          )}
          {/* caption underneath */}
          <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>{asset.topic}</Text>
          <Text variant="secondary" color="var(--dark-90)" style={{ display: 'block', margin: '4px 0 12px', lineHeight: 1.5 }}>{asset.caption}</Text>
          {/* feedback boxes under that */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['topic', 'caption', 'overlay'] as const).map((k) => (
              <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text variant="metadata" color="var(--dark-60)">{k === 'overlay' ? 'Image / text overlay' : k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                <TextArea value={fb[k]} onChange={(e) => setFb({ ...fb, [k]: e.target.value })} placeholder={`Notes on ${k}…`} style={{ minHeight: 52, fontSize: 13 }} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
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
                <button title="Keep" onClick={() => setReact({ ...react, [i]: r === 'like' ? undefined : 'like' })} style={{ width: 28, height: 28, borderRadius: 7, cursor: 'pointer', border: r === 'like' ? 'none' : '1px solid var(--dark-8)', background: r === 'like' ? 'var(--positive-10)' : 'var(--light-100)', color: r === 'like' ? 'var(--positive-60)' : 'var(--dark-60)' }}>👍</button>
                <button title="Drop" onClick={() => setReact({ ...react, [i]: r === 'dislike' ? undefined : 'dislike' })} style={{ width: 28, height: 28, borderRadius: 7, cursor: 'pointer', border: r === 'dislike' ? 'none' : '1px solid var(--dark-8)', background: r === 'dislike' ? 'var(--negative-10)' : 'var(--light-100)', color: r === 'dislike' ? 'var(--negative-60)' : 'var(--dark-60)' }}>👎</button>
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

function MiniBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return <button title={title} onClick={onClick} style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, background: 'var(--light-90)', color: 'var(--dark-80)', backdropFilter: 'blur(4px)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{children}</button>;
}

function FeedbackSummary({ account }: { account: Account }) {
  const prefs = S.creativePreferences(account);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeading title="What we learned" note="Synthesized from this round's feedback and swipe-file reactions." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card><Text variant="metadata" color="var(--positive-60)" style={{ display: 'block', marginBottom: 8 }}>Lean into</Text>{prefs.learned.map((p, i) => <Text key={i} style={{ display: 'block', marginBottom: 6, color: 'var(--dark-90)' }}>✓ {p}</Text>)}</Card>
        <Card><Text variant="metadata" color="var(--negative-60)" style={{ display: 'block', marginBottom: 8 }}>Avoid</Text>{prefs.avoid.map((p, i) => <Text key={i} style={{ display: 'block', marginBottom: 6, color: 'var(--dark-90)' }}>✕ {p}</Text>)}</Card>
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--positive-60)', fontSize: 20 }}>✓</span>
          <div style={{ flex: 1 }}>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Saved automatically to Brand Kit → Creative preferences</Text>
            <Text variant="metadata" color="var(--dark-60)">These learnings steer every future generation, and the client sees them in their portal.</Text>
          </div>
        </div>
      </Card>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tracks.map((track) => (
            <div key={track.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--action-50)' }} />
                <HoverInput value={track.name} onChange={(v) => renameTrack(track.id, v)} style={{ fontSize: 15, fontWeight: 600, maxWidth: 280 }} />
                {tracks.length > 1 && <RemoveX onClick={() => removeTrack(track.id)} />}
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
                    <button onClick={() => openAdd(track.id, d)} style={{ marginTop: 6, display: 'flex', justifyContent: 'center', gap: 4, borderRadius: 6, border: '1px dashed var(--dark-12)', background: 'none', padding: '5px 0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: 'var(--dark-60)' }}>+ Add</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" frontIcon={Plus} onPress={addTrack} style={{ marginTop: 12 }}>Add strategy track</Button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {themes.map((w, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 64, flexShrink: 0, borderRadius: 8, background: 'var(--dark-2)', padding: '6px 4px', textAlign: 'center' }}>
                  <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>Week</Text>
                  <HoverInput value={w.week} onChange={(v) => setThemes(themes.map((x, j) => j === i ? { ...x, week: v } : x))} style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, padding: '2px 4px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><HoverInput value={w.title} placeholder="Campaign title" onChange={(v) => setThemes(themes.map((x, j) => j === i ? { ...x, title: v } : x))} style={{ fontSize: 16, fontWeight: 600 }} /></div>
                    <StatusPill tone="neutral">{w.season}</StatusPill>
                    <RemoveX onClick={() => setThemes(themes.filter((_, j) => j !== i))} />
                  </div>
                  <HoverInput value={w.description} placeholder="What this campaign is about…" multiline onChange={(v) => setThemes(themes.map((x, j) => j === i ? { ...x, description: v } : x))} style={{ fontSize: 14, color: 'var(--dark-60)', minHeight: 38 }} />
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

function PickerGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>{label}</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
    </div>
  );
}
