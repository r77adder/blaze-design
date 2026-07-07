import { useEffect, useState } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Select } from '@/staging';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import ChevronDown from '@/icons/16/ChevronDown';
import ChevronRight from '@/icons/16/ChevronRight';
import type { Account, BrandColor, BrandFont, SwipeItem } from './lib/types';
import * as S from './lib/strategy';
import { updateAccountBrand } from './lib/api';
import { PhaseScreen, type Go } from './nav';
import { useReview } from './lib/review';
import { AmReviewPanel, SectionFeedback, SubsectionFeedback } from './Review';
import { Field, TextInput, TextArea, SectionHeading, AddLink, RemoveX, EditableMarkdown, FontFamilySelect, FieldCard, SuccessState, gradientFor, ColorSwatch } from './ui';
import { MarketingGoalsPort } from './onboarding-port';

export function Strategy({ account, sub, go }: { account: Account; sub: string; go: Go }) {
  const { setStrategyComplete } = useReview();
  useEffect(() => { if (sub === 'done') setStrategyComplete(true); }, [sub, setStrategyComplete]);
  if (sub === 'done') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SuccessState
          title="Strategy locked in"
          body="Everything you reviewed is saved and now powers the workspace. Here's where each part lives."
          stored={[
            { label: 'Brand context & creative guidelines', where: 'Brand Kit' },
          ]}
          action={<Button size="lg" onPress={() => go(`/${account.id}/am/goals`)}>Continue to Goals & theme</Button>}
        />
        <AmReviewPanel account={account} phase="strategy" go={go} stepped />
      </div>
    );
  }
  return (
    <PhaseScreen account={account} side="am" section="strategy" sub={sub} go={go} nextSection="goals" nextLabel="Continue to Goals & theme" maxWidth={920}>
      {sub === 'context' && <BrandContext account={account} />}
      {sub === 'creative' && <Creative account={account} />}
    </PhaseScreen>
  );
}

/** Goals & theme — a standalone one-page flow that runs after Strategy and
 *  before Creative Review, with its own client-review send. */
export function GoalsOnboarding({ account, go }: { account: Account; go: Go }) {
  const { setGoalsComplete } = useReview();
  // Full-bleed sticky footer — mirrors the PhaseScreen frame used across the
  // other onboarding pages: content scrolls, the footer bar spans the whole
  // body width and stays pinned to the bottom.
  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <MarketingGoalsPort />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 32px' }}>
          <AmReviewPanel account={account} phase="goals" go={go} />
        </div>
      </div>
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Button variant="secondary" size="lg" onPress={() => go(`/${account.id}/am/strategy`)}>Back to Strategy</Button>
        <Button size="lg" onPress={() => { setGoalsComplete(true); go(`/${account.id}/am/creative`); }}>Continue to Creative Review</Button>
      </div>
    </div>
  );
}

const BUSINESS_TYPES = ['Service', 'Product', 'SaaS', 'E-commerce', 'Local business', 'Agency', 'Nonprofit'];
const CONTENT_STRATEGIES = ['Thought leadership', 'Educational', 'Promotional', 'Community building', 'Product-led'];
// Optional deep-dive sections, collapsed by default — the AM expands the ones
// worth filling in. "Capture all the sections" per the brief, design TBD.
const ADDITIONAL_CONTEXT: { key: string; label: string }[] = [
  { key: 'competitive', label: 'Competitive landscape' },
  { key: 'visual', label: 'Visual identity' },
  { key: 'vocab', label: 'Industry vocabulary & KPIs' },
  { key: 'angles', label: 'Social content angles' },
  { key: 'trends', label: 'Industry trends' },
  { key: 'reviews', label: 'Customer reviews' },
];

function BrandContext({ account }: { account: Account }) {
  const md = S.brandContextMarkdown(account);
  const [v, setV] = useState({ overview: md.overview, segments: md.segments, services: md.services, bio: md.bio });
  const [businessType, setBusinessType] = useState('Service');
  const [contentStrategy, setContentStrategy] = useState('Thought leadership');
  const [openContext, setOpenContext] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const fields: [string, keyof typeof v][] = [['Business overview', 'overview'], ['Customer segments', 'segments'], ['Services / products', 'services'], ['Founder bio', 'bio']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* section: page headline (moved here from the removed intro step) */}
      <div style={{ marginBottom: 8 }}>
        <Heading level={2} style={{ marginTop: 0, marginBottom: 8 }}>Build the strategy</Heading>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.6 }}>
          We've pre-filled everything from {account.name}'s scan and uploads. Review and adjust each part, then continue to the creative guidelines.
        </Text>
      </div>

      {/* section: business type + content strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Business type">
          <Select value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES.map((o) => ({ value: o, label: o }))} size="md" fullWidth />
        </Field>
        <Field label="Content strategy">
          <Select value={contentStrategy} onChange={setContentStrategy} options={CONTENT_STRATEGIES.map((o) => ({ value: o, label: o }))} size="md" fullWidth />
        </Field>
      </div>

      {/* section: core brand context */}
      {fields.map(([label, key]) => (
        <div key={key}>
          <Heading level={3} style={{ margin: '0 0 8px' }}>{label}</Heading>
          <TextArea value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} style={{ minHeight: 110 }} />
          <SubsectionFeedback account={account} phase="strategy" sectionId="context" subKey={key} />
        </div>
      ))}

      {/* section: additional context — collapsible deep-dive areas */}
      <div style={{ marginTop: 8 }}>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 10 }}>Additional context</Text>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADDITIONAL_CONTEXT.map((s) => {
            const open = openContext === s.key;
            return (
              <div key={s.key} style={{ border: '1px solid var(--dark-8)', borderRadius: 8, overflow: 'hidden' }}>
                <div
                  onClick={() => setOpenContext(open ? null : s.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenContext(open ? null : s.key); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', cursor: 'pointer', background: 'var(--dark-2)' }}
                >
                  {open ? <ChevronDown size={18} color="var(--dark-60)" /> : <ChevronRight size={18} color="var(--dark-60)" />}
                  <Heading level={5} style={{ margin: 0 }}>{s.label}</Heading>
                </div>
                {open && (
                  <div style={{ padding: 14 }}>
                    <TextArea value={extra[s.key] ?? ''} onChange={(e) => setExtra({ ...extra, [s.key]: e.target.value })} placeholder={`Notes on ${s.label.toLowerCase()}…`} style={{ minHeight: 90 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
        <SectionFeedback account={account} phase="strategy" sectionId="guidelines" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {taglines.map((t, i) => <div key={i} style={{ display: 'flex', gap: 8 }}><TextInput value={t} onChange={(e) => setTaglines(taglines.map((x, j) => j === i ? e.target.value : x))} /><RemoveX size="lg" onClick={() => setTaglines(taglines.filter((_, j) => j !== i))} /></div>)}
          <AddLink variant="tertiary" label="Add tagline" onClick={() => setTaglines([...taglines, ''])} />
        </div>
      </div>
      <div>
        <SectionHeading title="Tone & voice" />
        <TextArea value={tone} onChange={(e) => setTone(e.target.value)} style={{ minHeight: 76, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <RuleColumn title="Do's" tone="var(--positive-60)" items={dos} setItems={setDos} addLabel="Add a do" />
          <RuleColumn title="Don'ts" tone="var(--negative-60)" items={donts} setItems={setDonts} addLabel="Add a don't" />
        </div>
      </div>
      <div>
        <SectionHeading title="Visual identity" desc="From the brand kit — click to edit colors and fonts." />
        <SectionFeedback account={account} phase="strategy" sectionId="brand" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {colors.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ColorSwatch value={c.hex} onChange={(hex) => setColors(colors.map((x, j) => j === i ? { ...x, hex } : x))} />
                <TextInput value={c.hex} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))} style={{ maxWidth: 130, textTransform: 'uppercase' }} />
                <TextInput value={c.name} onChange={(e) => setColors(colors.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ maxWidth: 200 }} />
                <RemoveX size="lg" onClick={() => setColors(colors.filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddLink variant="tertiary" label="Add color" onClick={() => setColors([...colors, { hex: '#888888', name: 'New color' }])} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fonts.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', alignItems: 'center', gap: 8 }}>
                <FontFamilySelect value={f.family} onChange={(val) => setFonts(fonts.map((x, j) => j === i ? { ...x, family: val } : x))} size="md" />
                <Select value={f.role} onChange={(v) => setFonts(fonts.map((x, j) => j === i ? { ...x, role: v as BrandFont['role'] } : x))} options={[{ value: 'Display', label: 'Display' }, { value: 'Heading', label: 'Heading' }, { value: 'Body', label: 'Body' }]} size="md" fullWidth />
                <RemoveX size="lg" onClick={() => setFonts(fonts.filter((_, j) => j !== i))} />
              </div>
            ))}
            <AddLink variant="tertiary" label="Add font" onClick={() => setFonts([...fonts, { family: '', role: 'Body' }])} />
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

function RuleColumn({ title, tone, items, setItems, addLabel }: { title: string; tone: string; items: string[]; setItems: (v: string[]) => void; addLabel: string }) {
  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 8px', color: tone }}>{title}</Heading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <TextInput value={r} onChange={(e) => setItems(items.map((x, j) => j === i ? e.target.value : x))} placeholder={`${title.slice(0, -1)}…`} />
            <RemoveX size="lg" onClick={() => setItems(items.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddLink variant="tertiary" label={addLabel} onClick={() => setItems([...items, ''])} />
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
          <button onClick={() => setSwipe({ ...swipe, [id]: r === 'like' ? undefined : 'like' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: r === 'like' ? 'var(--positive-10)' : 'var(--light-100)', color: r === 'like' ? 'var(--positive-60)' : 'var(--dark-60)', border: r === 'like' ? 'none' : '1px solid var(--dark-8)' }}><ThumbUp size={16} /> Like</button>
          <button onClick={() => setSwipe({ ...swipe, [id]: r === 'dislike' ? undefined : 'dislike' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: r === 'dislike' ? 'var(--negative-10)' : 'var(--light-100)', color: r === 'dislike' ? 'var(--negative-60)' : 'var(--dark-60)', border: r === 'dislike' ? 'none' : '1px solid var(--dark-8)' }}><ThumbDown size={16} /> Not for us</button>
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
