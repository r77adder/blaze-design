import { useEffect, useState } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Chip, Select } from '@/staging';
import Plus from '@/icons/20/Plus';
import type { Account, Goals, BrandColor, BrandFont, ScoreStatus, SwipeItem } from './lib/types';
import * as S from './lib/strategy';
import { updateAccountBrand } from './lib/api';
import { PhaseScreen, type Go } from './nav';
import { useReview } from './lib/review';
import { AmReviewPanel } from './Review';
import { Field, TextInput, TextArea, SectionHeading, AddLink, RemoveX, EditableMarkdown, FontFamilySelect, FieldCard, IntroPage, SuccessState, ScorecardHeader, GaugeRing, gradientFor, ColorSwatch } from './ui';

function statusColor(s: ScoreStatus) { return s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--status-approved)'; }

export function Strategy({ account, sub, go }: { account: Account; sub: string; go: Go }) {
  const { setStrategyComplete } = useReview();
  useEffect(() => { if (sub === 'done') setStrategyComplete(true); }, [sub, setStrategyComplete]);
  if (sub === 'intro') {
    return (
      <IntroPage
        title="Build the strategy"
        intro={`We've pre-filled everything from ${account.name}'s scan, uploads, and a competitive audit. Review and adjust each part, then choose the first campaign theme.`}
        steps={[
          { label: 'Brand context', desc: 'Business, customers, services, and founder story.' },
          { label: 'Creative guidelines', desc: 'Taglines, tone, do’s & don’ts, and visual identity.' },
          { label: 'Swipe file', desc: 'React to competitor work and add your own references.' },
          { label: 'Competitive audit', desc: 'See where the easy wins are across four pillars.' },
          { label: 'Goals & theme', desc: 'Set success metrics, channels, and the first campaign.' },
        ]}
        action={<Button size="lg" onPress={() => go(`/${account.id}/am/strategy/context`)}>Start strategy</Button>}
      />
    );
  }
  if (sub === 'done') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SuccessState
          title="Strategy locked in"
          body="Everything you reviewed is saved and now powers the workspace. Here's where each part lives."
          stored={[
            { label: 'Brand context, guidelines & swipe file', where: 'Brand Kit' },
            { label: 'Competitive audit', where: 'Scorecard' },
            { label: 'Goals & channels', where: 'Blaze Plan' },
          ]}
          action={<Button size="lg" onPress={() => go(`/${account.id}/am/creative`)}>Continue to Creative Review</Button>}
        />
        <AmReviewPanel account={account} phase="strategy" go={go} />
      </div>
    );
  }
  return (
    <PhaseScreen account={account} side="am" section="strategy" sub={sub} go={go} nextSection="creative" nextLabel="Continue to Creative Review" maxWidth={920}>
      {sub === 'context' && <BrandContext account={account} />}
      {sub === 'creative' && <Creative account={account} />}
      {sub === 'swipe' && <SwipeFileStep account={account} />}
      {sub === 'audit' && <Audit account={account} />}
      {sub === 'goals' && <GoalsStep account={account} />}
    </PhaseScreen>
  );
}

function BrandContext({ account }: { account: Account }) {
  const md = S.brandContextMarkdown(account);
  const [v, setV] = useState({ overview: md.overview, segments: md.segments, services: md.services, bio: md.bio });
  const fields: [string, keyof typeof v][] = [['Business overview', 'overview'], ['Customer segments', 'segments'], ['Services / products', 'services'], ['Founder bio', 'bio']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fields.map(([label, key]) => (
        <FieldCard key={key}>
          <Heading level={4} style={{ margin: '0 0 8px' }}>{label}</Heading>
          <EditableMarkdown value={v[key]} onChange={(val) => setV({ ...v, [key]: val })} />
        </FieldCard>
      ))}
    </div>
  );
}

function Creative({ account }: { account: Account }) {
  const g = S.creativeGuidelines(account);
  const [taglines, setTaglines] = useState(g.taglines);
  const [tone, setTone] = useState(g.toneSummary);
  const [dos, setDos] = useState<string[]>(() => g.toneExamples.map((e) => e.do));
  const [donts, setDonts] = useState<string[]>(() => g.toneExamples.map((e) => e.dont));
  const [colors, setColors] = useState<BrandColor[]>(account.brand.colors);
  const [fonts, setFonts] = useState<BrandFont[]>(account.brand.fonts);
  useEffect(() => { updateAccountBrand(account.id, { colors, fonts }); }, [account.id, colors, fonts]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <SectionHeading title="Taglines" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {taglines.map((t, i) => <div key={i} style={{ display: 'flex', gap: 8 }}><TextInput value={t} onChange={(e) => setTaglines(taglines.map((x, j) => j === i ? e.target.value : x))} /><RemoveX onClick={() => setTaglines(taglines.filter((_, j) => j !== i))} /></div>)}
          <AddLink label="Add tagline" onClick={() => setTaglines([...taglines, ''])} />
        </div>
      </div>
      <div>
        <SectionHeading title="Tone & voice" />
        <TextArea value={tone} onChange={(e) => setTone(e.target.value)} style={{ minHeight: 76, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <RuleColumn title="Do's" tone="var(--positive-60)" mark="✓" items={dos} setItems={setDos} addLabel="Add a do" />
          <RuleColumn title="Don'ts" tone="var(--negative-60)" mark="✕" items={donts} setItems={setDonts} addLabel="Add a don't" />
        </div>
      </div>
      <div>
        <SectionHeading title="Visual identity" desc="From the brand kit — click to edit colors and fonts." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {colors.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColorSwatch value={c.hex} onChange={(hex) => setColors(colors.map((x, j) => j === i ? { ...x, hex } : x))} />
                <TextInput value={c.hex} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))} style={{ maxWidth: 130, textTransform: 'uppercase' }} />
                <TextInput value={c.name} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ maxWidth: 200 }} />
                <RemoveX onClick={() => setColors(colors.filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddLink label="Add color" onClick={() => setColors([...colors, { hex: '#888888', name: 'New color' }])} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fonts.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', alignItems: 'center', gap: 8 }}>
                <FontFamilySelect value={f.family} onChange={(val) => setFonts(fonts.map((x, j) => j === i ? { ...x, family: val } : x))} size="lg" />
                <Select value={f.role} onChange={(v) => setFonts(fonts.map((x, j) => j === i ? { ...x, role: v as BrandFont['role'] } : x))} options={[{ value: 'Display', label: 'Display' }, { value: 'Heading', label: 'Heading' }, { value: 'Body', label: 'Body' }]} size="lg" fullWidth />
                <RemoveX onClick={() => setFonts(fonts.filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddLink label="Add font" onClick={() => setFonts([...fonts, { family: '', role: 'Body' }])} />
          </div>
        </div>
      </div>
      <div>
        <SectionHeading title="Mood board" desc="Drop creative the client loves — it sets the inspiration target." />
        <button style={{ width: '100%', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, border: '1.5px dashed var(--dark-12)', background: 'var(--dark-2)', cursor: 'pointer', color: 'var(--dark-40)', fontFamily: 'inherit', fontSize: 14 }}>
          <span style={{ fontSize: 26 }}>🖼️</span>
          Drop inspiration images, or click to upload
        </button>
      </div>
    </div>
  );
}

function RuleColumn({ title, tone, mark, items, setItems, addLabel }: { title: string; tone: string; mark: string; items: string[]; setItems: (v: string[]) => void; addLabel: string }) {
  return (
    <div>
      <Text variant="smallList" color={tone} style={{ display: 'block', marginBottom: 8 }}>{mark} {title}</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <TextInput value={r} onChange={(e) => setItems(items.map((x, j) => j === i ? e.target.value : x))} placeholder={`${title.slice(0, -1)}…`} />
            <RemoveX onClick={() => setItems(items.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddLink label={addLabel} onClick={() => setItems([...items, ''])} />
      </div>
    </div>
  );
}

function SwipeFileStep({ account }: { account: Account }) {
  const [swipe, setSwipe] = useState<Record<string, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<{ id: string; kind: 'image' | 'link'; url?: string }[]>([]);
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [brands, setBrands] = useState<{ name: string; url: string }[]>([
    { name: 'Magic Spoon', url: 'magicspoon.com' },
    { name: 'Athletic Greens', url: 'instagram.com/athleticgreens' },
  ]);
  const hrefOf = (u: string) => (u.startsWith('http') ? u : `https://${u}`);

  const Reactions = ({ id }: { id: string }) => {
    const r = swipe[id];
    return (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={() => setSwipe({ ...swipe, [id]: r === 'like' ? undefined : 'like' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: r === 'like' ? 'var(--positive-10)' : 'var(--light-100)', color: r === 'like' ? 'var(--positive-60)' : 'var(--dark-60)', border: r === 'like' ? 'none' : '1px solid var(--dark-8)' }}>👍 Like</button>
          <button onClick={() => setSwipe({ ...swipe, [id]: r === 'dislike' ? undefined : 'dislike' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: r === 'dislike' ? 'var(--negative-10)' : 'var(--light-100)', color: r === 'dislike' ? 'var(--negative-60)' : 'var(--dark-60)', border: r === 'dislike' ? 'none' : '1px solid var(--dark-8)' }}>👎 Not for us</button>
        </div>
        <TextArea value={notes[id] ?? ''} placeholder="What do they like / not like about this?" onChange={(e) => setNotes({ ...notes, [id]: e.target.value })} style={{ minHeight: 56, fontSize: 14 }} />
      </>
    );
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    setCustom([...custom, { id: `c${Date.now()}`, kind: 'link', url: linkUrl.trim() }]);
    setLinkUrl(''); setLinkMode(false);
  };
  const domain = (u: string) => { try { return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace('www.', ''); } catch { return u; } };

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <SectionHeading title="Brands they admire" desc="Brands the client loves — we'll study their look, voice, and content." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {brands.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TextInput value={b.name} placeholder="Brand name" onChange={(e) => setBrands(brands.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ maxWidth: 240 }} />
              <TextInput value={b.url} placeholder="Website or instagram.com/handle" onChange={(e) => setBrands(brands.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
              {b.url.trim() && <a href={hrefOf(b.url)} target="_blank" rel="noreferrer" title="Open" style={{ flexShrink: 0, width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--dark-8)', color: 'var(--action-50)', textDecoration: 'none' }}>↗</a>}
              <RemoveX onClick={() => setBrands(brands.filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddLink label="Add brand" onClick={() => setBrands([...brands, { name: '', url: '' }])} />
        </div>
      </div>

      <SectionHeading title="Swipe file" desc="Competitor & category benchmarks scanned from the market. React so we learn what to chase — or add your own references." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {S.swipeFile(account).map((item: SwipeItem) => (
          <Card key={item.id} padding="none">
            <div style={{ height: 112, background: gradientFor(item.seed), display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
              <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.45)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>{item.channel}</span>
            </div>
            <div style={{ padding: 14 }}>
              <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block' }}>{item.source}</Text>
              <Text variant="largeList" style={{ display: 'block' }}>{item.headline}</Text>
              <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', margin: '4px 0 10px', lineHeight: 1.5 }}>{item.note}</Text>
              <Reactions id={item.id} />
            </div>
          </Card>
        ))}

        {custom.map((c) => (
          <Card key={c.id} padding="none">
            <div style={{ position: 'relative', height: 112, background: c.kind === 'image' ? gradientFor(c.id.length + 3) : 'var(--dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
              <span style={{ color: 'var(--light-100)', fontSize: 13, fontWeight: 500, padding: '0 12px', textAlign: 'center' }}>{c.kind === 'image' ? '🖼️ Uploaded image' : `🔗 ${domain(c.url!)}`}</span>
              <button onClick={() => setCustom(custom.filter((x) => x.id !== c.id))} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 99, border: 'none', background: 'rgba(0,0,0,0.45)', color: 'var(--light-100)', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
            <div style={{ padding: 14 }}>
              <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block' }}>Your reference</Text>
              {c.kind === 'link'
                ? <a href={c.url!.startsWith('http') ? c.url : `https://${c.url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--action-50)', fontWeight: 500, fontSize: 14, wordBreak: 'break-all' }}>{c.url} ↗</a>
                : <Text variant="largeList" style={{ display: 'block' }}>Image reference</Text>}
              <div style={{ marginTop: 10 }}><Reactions id={c.id} /></div>
            </div>
          </Card>
        ))}

        {/* Cold-state: add your own reference */}
        <Card padding="none" style={{ borderStyle: 'dashed', borderColor: 'var(--dark-12)' }}>
          <div style={{ minHeight: 112, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 }}>
            {linkMode ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TextInput autoFocus value={linkUrl} placeholder="Paste a link to a post…" onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" onPress={addLink} isDisabled={!linkUrl.trim()}>Add</Button>
                  <Button size="sm" variant="secondary" onPress={() => { setLinkMode(false); setLinkUrl(''); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <Text variant="secondary" color="var(--dark-60)">Add a reference</Text>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="secondary" onPress={() => setCustom([...custom, { id: `c${Date.now()}`, kind: 'image' }])}>↑ Upload image</Button>
                  <Button size="sm" variant="secondary" onPress={() => setLinkMode(true)}>🔗 Add link</Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Audit({ account }: { account: Account }) {
  const data = S.scorecard(account);
  return (
    <div>
      <ScorecardHeader data={data} accountName={account.name} />
      <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 16 }}>Scanned from your website, social, Google Business Profile, and local competitors.</Text>
      {data.areas.map((area) => (
        <div key={area.number} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <GaugeRing score={area.score} max={area.maxScore} status={area.status}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>{area.score}</span></GaugeRing>
            <div style={{ flex: 1 }}>
              <Heading level={4} style={{ margin: 0 }}>{area.eyebrow}</Heading>
              <Text variant="metadata" style={{ color: statusColor(area.status) }}>{area.score}/{area.maxScore}</Text>
            </div>
            {area.platforms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {area.platforms.map((p) => <span key={p} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, background: 'var(--dark-3)', color: 'var(--dark-80)', border: '1px solid var(--dark-4)' }}>{p}</span>)}
              </div>
            )}
          </div>
          <Card>
            {area.checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
                <span style={{ color: statusColor(c.status), fontWeight: 700 }}>{c.status === 'good' ? '✓' : c.status === 'warn' ? '!' : '✕'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><Text variant="largeList">{c.title}</Text><Text variant="metadata" color="var(--dark-40)">{c.pts}</Text></div>
                  <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block' }}>{c.desc}</Text>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

const PLAN_CHANNELS = ['Local SEO', 'Organic Social', 'Meta Ads', 'Paid Search', 'Reputation', 'UGC', 'Landing Pages', 'Email'];
interface EventRow { label: string; when: string; tag: 'Company' | 'Industry' }

function GoalsStep({ account }: { account: Account }) {
  const init = S.goals(account);
  const [g, setG] = useState<Goals>(init);
  const [channels, setChannels] = useState<string[]>(init.channels);
  const [plan, setPlan] = useState<string[]>(['Local SEO', 'Meta Ads', 'Reputation', 'Email']);
  const [events, setEvents] = useState<EventRow[]>([
    ...init.companyEvents.map((e) => ({ label: e.label, when: e.date.slice(0, 7), tag: 'Company' as const })),
    ...init.industryEvents.map((e) => ({ label: e.label, when: e.date.slice(0, 7), tag: 'Industry' as const })),
  ]);
  const themes = S.campaignThemes(account);
  const rec = themes.find((t) => t.recommended) ?? themes[0];
  const [theme, setTheme] = useState({ title: rec.title, angle: rec.angle });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <SectionHeading title="What does success look like?" note="Drafted from your goals and the audit." />
        {([['First 30 days', 'thirty'], ['By 60 days', 'sixty'], ['By 90 days', 'ninety']] as const).map(([label, key]) => (
          <FieldRow key={key} label={label}><TextArea value={g[key]} onChange={(e) => setG({ ...g, [key]: e.target.value })} style={{ minHeight: 68 }} /></FieldRow>
        ))}
      </div>

      <div>
        <SectionHeading title="Marketing history" note="Summarized from your intake answers and current channels." />
        <FieldRow label="Channels they're on"><TokenInput tokens={channels} setTokens={setChannels} placeholder="Add channel" /></FieldRow>
        <FieldRow label="What's driving growth?"><TextArea value={g.drivingGrowth} onChange={(e) => setG({ ...g, drivingGrowth: e.target.value })} style={{ minHeight: 60 }} /></FieldRow>
        <FieldRow label="What's worked historically?"><TextArea value={g.worked} onChange={(e) => setG({ ...g, worked: e.target.value })} style={{ minHeight: 60 }} /></FieldRow>
        <FieldRow label="What hasn't worked?"><TextArea value={g.notWorked} onChange={(e) => setG({ ...g, notWorked: e.target.value })} style={{ minHeight: 60 }} /></FieldRow>
      </div>

      <div>
        <SectionHeading title="Major events" desc="Dates worth planning campaigns around. Tag each as company or industry." />
        <div style={{ borderRadius: 10, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
              <input value={e.label} onChange={(ev) => setEvents(events.map((x, j) => j === i ? { ...x, label: ev.target.value } : x))} placeholder="Event" style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: 'var(--dark-90)', outline: 'none' }} />
              <input type="month" value={e.when} onChange={(ev) => setEvents(events.map((x, j) => j === i ? { ...x, when: ev.target.value } : x))} style={{ borderRadius: 6, border: '1px solid var(--dark-8)', padding: '5px 8px', fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-90)' }} />
              <div style={{ display: 'flex', padding: 2, borderRadius: 6, background: 'var(--dark-3)' }}>
                {(['Company', 'Industry'] as const).map((t) => <button key={t} onClick={() => setEvents(events.map((x, j) => j === i ? { ...x, tag: t } : x))} style={{ padding: '3px 8px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: e.tag === t ? 'var(--light-100)' : 'transparent', color: e.tag === t ? 'var(--dark-90)' : 'var(--dark-60)', border: e.tag === t ? '1px solid var(--dark-8)' : '1px solid transparent' }}>{t}</button>)}
              </div>
              <RemoveX onClick={() => setEvents(events.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}><Button variant="secondary" frontIcon={Plus} onPress={() => setEvents([...events, { label: '', when: '', tag: 'Company' }])}>Add event</Button></div>
      </div>

      <div>
        <SectionHeading title="Channels to develop plans around" note="Pre-selected from the audit's biggest gaps." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PLAN_CHANNELS.map((c) => { const on = plan.includes(c); return <Chip key={c} selected={on} onSelectionChange={(sel) => setPlan(sel ? [...plan, c] : plan.filter((x) => x !== c))}>{c}</Chip>; })}
        </div>
      </div>

      <div>
        <SectionHeading title="First campaign theme" desc="Suggested — edit it or pick another." />
        <Card style={{ borderColor: 'var(--action-50)' }}>
          <Field label="Theme title"><TextInput value={theme.title} onChange={(e) => setTheme({ ...theme, title: e.target.value })} /></Field>
          <div style={{ marginTop: 12 }}><Field label="Angle"><TextArea value={theme.angle} onChange={(e) => setTheme({ ...theme, angle: e.target.value })} style={{ minHeight: 60 }} /></Field></div>
        </Card>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Text variant="metadata" color="var(--dark-40)">Other suggestions:</Text>
          {themes.filter((t) => t.title !== theme.title).map((t) => <button key={t.id} onClick={() => setTheme({ title: t.title, angle: t.angle })} style={{ padding: '6px 12px', borderRadius: 99, border: '1px solid var(--dark-8)', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'var(--dark-80)' }}>✦ {t.title}</button>)}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'start', marginBottom: 12 }}>
      <Text variant="largeList" style={{ paddingTop: 10 }}>{label}</Text>
      <div>{children}</div>
    </div>
  );
}

function TokenInput({ tokens, setTokens, placeholder }: { tokens: string[]; setTokens: (t: string[]) => void; placeholder: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 6 }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 4px 4px 12px', borderRadius: 99, background: 'rgba(1,121,207,0.10)', border: '1px solid rgba(1,121,207,0.22)' }}>
          <input value={t} onChange={(e) => setTokens(tokens.map((x, j) => j === i ? e.target.value : x))} style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--status-posting)', width: `${Math.max(4, t.length + 1)}ch` }} />
          <button onClick={() => setTokens(tokens.filter((_, j) => j !== i))} style={{ width: 20, height: 20, borderRadius: 99, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--status-posting)' }}>✕</button>
        </span>
      ))}
      <button onClick={() => setTokens([...tokens, ''])} style={{ padding: '5px 12px', borderRadius: 99, border: '1px dashed var(--dark-12)', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'var(--dark-60)' }}>+ {placeholder}</button>
    </div>
  );
}
