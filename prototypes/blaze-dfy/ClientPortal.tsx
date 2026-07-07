import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { Card, StatusPill } from '@/staging';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Palette from '@/icons/20/Palette';
import Voice from '@/icons/20/Voice';
import AudioSettings from '@/icons/20/AudioSettings';
import ClockBackward from '@/icons/20/ClockBackward';
import Star from '@/icons/20/Star';
import SourceMaterial from '@/icons/20/SourceMaterial';
import Images from '@/icons/20/Images';
import Stars from '@/icons/20/Stars';
import ChevronLeft from '@/icons/24/ChevronLeft';
import ChevronRight from '@/icons/24/ChevronRight';
import CoverImage from '@/icons/20/CoverImage';
import FileMultiple from '@/icons/20/FileMultiple';
import Document from '@/icons/20/Document';
import VideoIcon from '@/icons/20/Video';
import Emails from '@/icons/20/Emails';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Comment from '@/icons/20/Comment';
import type { Account, AssetType, BrandColor, BrandFont } from './lib/types';
import * as S from './lib/strategy';
import { updateAccountBrand } from './lib/api';
import { SectionHeading, EditableMarkdown, TextInput, TextArea, FontFamilySelect, AddLink, RemoveX, TokenInput, gradientFor, ColorSwatch } from './ui';
import { MeetingsView } from './Home';
import { ScorecardClientView } from './Scorecard';

// AM steady-state reuse only — the workspace routes Brand Kit / Content Calendar
// here. The old client-portal sections (review-*, approvals, insights) are no
// longer reachable now that the client lives in a separate prototype.
export function ClientPortal({ account, section, clientView }: { account: Account; section: string; clientView: boolean }) {
  if (section === 'approvals') return <WeeklyContent account={account} />;
  if (section === 'calendar') return <ContentCalendar account={account} />;
  if (section === 'insights') return <Performance account={account} />;
  if (section === 'scorecard') return <ScorecardClientView account={account} />;
  return <BrandKit account={account} clientView={clientView} />;
}

const KIT: { key: string; label: string; icon: ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'profile', label: 'Brand Profile', icon: UserProfileCircle },
  { key: 'style', label: 'Brand Style', icon: Palette },
  { key: 'voice', label: 'Brand Voice', icon: Voice },
  { key: 'preferences', label: 'Creative Preferences', icon: AudioSettings },
  { key: 'media', label: 'Media Library', icon: Images },
  { key: 'moodboard', label: 'Mood Board', icon: Stars },
  { key: 'swipe', label: 'Swipe File', icon: Star },
  { key: 'history', label: 'Marketing History', icon: ClockBackward },
  { key: 'sources', label: 'Source Materials', icon: SourceMaterial },
  { key: 'meetings', label: 'Meetings', icon: Comment },
];

function BrandKit({ account, clientView }: { account: Account; clientView: boolean }) {
  const [tab, setTab] = useState('profile');
  const md = useMemo(() => S.brandContextMarkdown(account), [account]);
  const g = useMemo(() => S.creativeGuidelines(account), [account]);
  const prefs = useMemo(() => S.creativePreferences(account), [account]);
  const goals = useMemo(() => S.goals(account), [account]);

  const [profile, setProfile] = useState({ overview: md.overview, segments: md.segments, services: md.services, bio: md.bio });
  const [colors, setColors] = useState<BrandColor[]>(account.brand.colors);
  const [fonts, setFonts] = useState<BrandFont[]>(account.brand.fonts);
  useEffect(() => { updateAccountBrand(account.id, { colors, fonts }); }, [account.id, colors, fonts]);
  const [taglines, setTaglines] = useState(g.taglines);
  const [tone, setTone] = useState(g.toneSummary);
  const [dos, setDos] = useState(g.toneExamples.map((e) => e.do));
  const [donts, setDonts] = useState(g.toneExamples.map((e) => e.dont));
  const [learned, setLearned] = useState(prefs.learned);
  const [avoid, setAvoid] = useState(prefs.avoid);
  const [channels, setChannels] = useState(goals.channels);
  const [hist, setHist] = useState({ driving: goals.drivingGrowth, worked: goals.worked, notWorked: goals.notWorked });
  const [brands, setBrands] = useState([{ name: 'Magic Spoon', url: 'magicspoon.com' }, { name: 'Athletic Greens', url: 'instagram.com/athleticgreens' }]);
  const [materials, setMaterials] = useState([
    { id: 'transcript', label: 'Sales call transcript', file: 'sales-call-transcript.txt', uploaded: true },
    { id: 'guide', label: 'Brand guidelines', file: 'brand-guidelines.pdf', uploaded: true },
    { id: 'tone', label: 'Tone of voice doc', file: '', uploaded: false },
    { id: 'logos', label: 'Logo pack', file: '', uploaded: false },
  ]);
  const [react, setReact] = useState<Record<string, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const hrefOf = (u: string) => (u.startsWith('http') ? u : `https://${u}`);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
      <nav style={{ position: 'sticky', top: 8, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {KIT.map((n) => {
          const active = tab === n.key;
          return (
            <button key={n.key} onClick={() => setTab(n.key)}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--dark-2)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, background: active ? 'var(--dark-4)' : 'transparent', color: active ? 'var(--dark-90)' : 'var(--dark-80)', fontWeight: active ? 500 : 400, transition: 'background 120ms ease' }}>
              <n.icon size={20} color={active ? 'var(--dark-90)' : 'var(--dark-60)'} />
              {n.label}
            </button>
          );
        })}
      </nav>
      <div>
        {tab !== 'meetings' && <Heading level={2} style={{ marginTop: 0 }}>{KIT.find((n) => n.key === tab)?.label ?? 'Brand Kit'}</Heading>}

        {tab === 'profile' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {([['Business overview', 'overview'], ['Customer segments', 'segments'], ['Services / products', 'services'], ['Founder bio', 'bio']] as const).map(([label, key]) => (
              <Section key={key} title={label}><EditableMarkdown value={profile[key]} onChange={(v) => setProfile({ ...profile, [key]: v })} /></Section>
            ))}
          </div>
        )}

        {tab === 'style' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Colors">
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
            </Section>
            <Section title="Fonts">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fonts.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontFamilySelect value={f.family} onChange={(val) => setFonts(fonts.map((x, j) => j === i ? { ...x, family: val } : x))} />
                    <select value={f.role} onChange={(e) => setFonts(fonts.map((x, j) => j === i ? { ...x, role: e.target.value as BrandFont['role'] } : x))} style={{ height: 44, borderRadius: 8, border: '1px solid var(--dark-8)', padding: '0 10px', fontFamily: 'inherit', fontSize: 15 }}><option>Display</option><option>Heading</option><option>Body</option></select>
                    <RemoveX onClick={() => setFonts(fonts.filter((_, j) => j !== i))} />
                  </div>
                ))}
                <AddLink label="Add font" onClick={() => setFonts([...fonts, { family: '', role: 'Body' }])} />
              </div>
            </Section>
            {account.brand.logos.length > 0 && (
              <Section title="Logos"><div style={{ display: 'flex', gap: 8 }}>{account.brand.logos.map((l) => <div key={l.id} style={{ width: 64, height: 64, borderRadius: 8, background: l.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 6 }}>{l.src ? <img src={l.src} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Text color="var(--light-100)">{l.label[0]}</Text>}</div>)}</div></Section>
            )}
          </div>
        )}

        {tab === 'voice' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Taglines"><EditRows items={taglines} setItems={setTaglines} placeholder="Tagline" addLabel="Add tagline" /></Section>
            <Section title="Tone & voice"><TextArea value={tone} onChange={(e) => setTone(e.target.value)} style={{ minHeight: 76 }} /></Section>
            <Section title="Do's & don'ts">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><Text variant="smallList" color="var(--positive-60)" style={{ display: 'block', marginBottom: 8 }}>✓ Do's</Text><EditRows items={dos} setItems={setDos} placeholder="Do" addLabel="Add a do" /></div>
                <div><Text variant="smallList" color="var(--negative-60)" style={{ display: 'block', marginBottom: 8 }}>✕ Don'ts</Text><EditRows items={donts} setItems={setDonts} placeholder="Don't" addLabel="Add a don't" /></div>
              </div>
            </Section>
          </div>
        )}

        {tab === 'preferences' && (
          <div style={{ marginTop: 16 }}>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>What we've learned from your feedback. Every new piece matches these.</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><Text variant="metadata" color="var(--positive-60)" style={{ display: 'block', marginBottom: 8 }}>Lean into</Text><EditRows items={learned} setItems={setLearned} placeholder="Lean into…" addLabel="Add" /></div>
              <div><Text variant="metadata" color="var(--negative-60)" style={{ display: 'block', marginBottom: 8 }}>Avoid</Text><EditRows items={avoid} setItems={setAvoid} placeholder="Avoid…" addLabel="Add" /></div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Channels they're on"><TokenInput tokens={channels} setTokens={setChannels} placeholder="Add channel" /></Section>
            <Section title="What's driving growth"><TextArea value={hist.driving} onChange={(e) => setHist({ ...hist, driving: e.target.value })} style={{ minHeight: 64 }} /></Section>
            <Section title="What's worked"><TextArea value={hist.worked} onChange={(e) => setHist({ ...hist, worked: e.target.value })} style={{ minHeight: 64 }} /></Section>
            <Section title="What hasn't worked"><TextArea value={hist.notWorked} onChange={(e) => setHist({ ...hist, notWorked: e.target.value })} style={{ minHeight: 64 }} /></Section>
          </div>
        )}

        {tab === 'swipe' && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Section title="Brands they admire">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {brands.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TextInput value={b.name} placeholder="Brand name" onChange={(e) => setBrands(brands.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ maxWidth: 240 }} />
                    <TextInput value={b.url} placeholder="Website or instagram.com/handle" onChange={(e) => setBrands(brands.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    {b.url.trim() && <a href={hrefOf(b.url)} target="_blank" rel="noreferrer" title="Open" style={{ flexShrink: 0, width: 40, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--dark-8)', color: 'var(--action-50)', textDecoration: 'none' }}>↗</a>}
                    <RemoveX onClick={() => setBrands(brands.filter((_, j) => j !== i))} />
                  </div>
                ))}
                <AddLink label="Add brand" onClick={() => setBrands([...brands, { name: '', url: '' }])} />
              </div>
            </Section>
            <Section title="Competitor & category references">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {S.swipeFile(account).map((item) => {
                  const r = react[item.id];
                  return (
                    <Card key={item.id} padding="none">
                      <div style={{ height: 100, background: gradientFor(item.seed), display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px 8px 0 0' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.45)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>{item.channel}</span>
                      </div>
                      <div style={{ padding: 12 }}>
                        <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block' }}>{item.source}</Text>
                        <Text variant="largeList" style={{ display: 'block' }}>{item.headline}</Text>
                        <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', margin: '4px 0 8px', lineHeight: 1.5 }}>{item.note}</Text>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          <button onClick={() => setReact({ ...react, [item.id]: r === 'like' ? undefined : 'like' })} style={{ padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: r === 'like' ? 'var(--positive-10)' : 'var(--light-100)', color: r === 'like' ? 'var(--positive-60)' : 'var(--dark-60)', border: r === 'like' ? 'none' : '1px solid var(--dark-8)' }}>👍 Like</button>
                          <button onClick={() => setReact({ ...react, [item.id]: r === 'dislike' ? undefined : 'dislike' })} style={{ padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: r === 'dislike' ? 'var(--negative-10)' : 'var(--light-100)', color: r === 'dislike' ? 'var(--negative-60)' : 'var(--dark-60)', border: r === 'dislike' ? 'none' : '1px solid var(--dark-8)' }}>👎</button>
                        </div>
                        <TextArea value={notes[item.id] ?? ''} placeholder="Notes…" onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })} style={{ minHeight: 44, fontSize: 13 }} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {tab === 'sources' && (
          <div style={{ marginTop: 16 }}>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Raw inputs that inform everything Blaze generates — the sales call, brand docs, and anything else the client shares.</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {materials.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: m.uploaded ? 'var(--light-100)' : 'var(--dark-2)', border: m.uploaded ? '1px solid var(--dark-6)' : '1.5px dashed var(--dark-12)' }}>
                  <span style={{ fontSize: 20 }}>{m.id === 'transcript' ? '📄' : '📁'}</span>
                  <div style={{ flex: 1 }}>
                    <Text variant="largeList" style={{ display: 'block' }}>{m.label}</Text>
                    <Text variant="metadata" color="var(--dark-60)">{m.uploaded ? m.file : 'Not uploaded'}</Text>
                  </div>
                  {m.uploaded && <StatusPill tone="success">Uploaded</StatusPill>}
                  <Button size="sm" variant="secondary" onPress={() => setMaterials(materials.map((x) => x.id === m.id ? { ...x, uploaded: !x.uploaded, file: !x.uploaded ? `${x.id}.pdf` : '' } : x))}>{m.uploaded ? 'Replace' : 'Upload'}</Button>
                  <RemoveX onClick={() => setMaterials(materials.filter((x) => x.id !== m.id))} />
                </div>
              ))}
              <AddLink label="Add material" onClick={() => setMaterials([...materials, { id: `m${materials.length}`, label: 'New material', file: '', uploaded: false }])} />
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div style={{ marginTop: 16 }}>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>The client's own images — scanned from {account.brand.website || 'their site'} and uploads. Used directly in content.</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {Array.from({ length: 11 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: gradientFor(i + 2) }} />)}
              <button style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed var(--dark-12)', background: 'var(--dark-2)', cursor: 'pointer', color: 'var(--dark-40)', fontFamily: 'inherit', fontSize: 13 }}>+ Upload</button>
            </div>
          </div>
        )}
        {tab === 'moodboard' && (
          <div style={{ marginTop: 16 }}>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Inspiration the client loves — the look and feel we generate against (not their own assets).</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: gradientFor(i + 1 + account.name.length) }} />)}
              <button style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed var(--dark-12)', background: 'var(--dark-2)', cursor: 'pointer', color: 'var(--dark-40)', fontFamily: 'inherit', fontSize: 13 }}>+ Add inspiration</button>
            </div>
          </div>
        )}
        {tab === 'meetings' && (
          <div style={{ marginTop: 16 }}>
            <MeetingsView clientView={clientView} />
          </div>
        )}
      </div>
    </div>
  );
}

function EditRows({ items, setItems, placeholder, addLabel }: { items: string[]; setItems: (v: string[]) => void; placeholder?: string; addLabel: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <TextInput value={t} placeholder={placeholder} onChange={(e) => setItems(items.map((x, j) => j === i ? e.target.value : x))} />
          <RemoveX onClick={() => setItems(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddLink label={addLabel} onClick={() => setItems([...items, ''])} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div style={{ paddingBottom: 8, borderBottom: '1px solid var(--dark-8)', marginBottom: 12 }}><Text variant="largeList" color="var(--dark-60)">{title}</Text></div>{children}</div>;
}

function WeeklyContent({ account }: { account: Account }) {
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]).title;
  const week = useMemo(() => S.generatedAssets(account, theme).slice(0, 6), [account, theme]);
  const [state, setState] = useState<Record<string, string>>({});
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <Heading level={2} style={{ marginTop: 0 }}>This week's content</Heading>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Theme: <strong style={{ color: 'var(--purple)' }}>{theme}</strong>, {week.length} posts to review</Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {week.map((a) => (
          <Card key={a.id} padding="none">
            <div style={{ display: 'flex' }}>
              <div style={{ width: 120, flexShrink: 0, background: gradientFor(a.seed), borderRadius: '8px 0 0 8px' }} />
              <div style={{ padding: 12, flex: 1 }}>
                <StatusPill tone={state[a.id] === 'approved' ? 'success' : state[a.id] === 'changes' ? 'warning' : 'neutral'}>{state[a.id] === 'approved' ? 'Approved' : state[a.id] === 'changes' ? 'Changes requested' : a.type}</StatusPill>
                <Text variant="primary" style={{ display: 'block', margin: '8px 0' }} lineClamp={2}>{a.caption}</Text>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="xs" onPress={() => setState({ ...state, [a.id]: 'approved' })}>Approve</Button>
                  <Button size="xs" variant="ghost" onPress={() => setState({ ...state, [a.id]: 'changes' })}>Request changes</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Content calendar — weekly view ─────────────────────────────────────────
 * Faithful port of the H2 OrganicSocial weekly calendar
 * (prototypes/h2/pages/OrganicSocial.tsx): a toolbar with prev/Today/next week
 * nav, then a horizontally-scrolling 7-column Mon–Sun grid. Each day stacks
 * post cards — a media variant (header + caption + portrait image with status
 * overlay) and a blog/text variant (header + landscape image + serif title +
 * body). Driven by DFY's generated assets rather than H2's seed posts. */

type CalKind = 'media' | 'carousel' | 'video' | 'blog';

// Each DFY AssetType maps to a card kind, a content label + glyph, a platform,
// and a brand dot color. Platform/brand colors are data, so brand tokens are OK.
const CAL_ASSET_META: Record<
  AssetType,
  { kind: CalKind; label: string; icon: ComponentType<{ size?: number; color?: string }>; iconColor: string; platform: string; dot: string }
> = {
  'Still Image': { kind: 'media', label: 'Still Image', icon: CoverImage, iconColor: 'var(--red-70)', platform: 'Instagram', dot: 'var(--brand-instagram)' },
  Story: { kind: 'media', label: 'Story', icon: CoverImage, iconColor: 'var(--red-70)', platform: 'Instagram', dot: 'var(--brand-instagram)' },
  Carousel: { kind: 'carousel', label: 'Carousel', icon: FileMultiple, iconColor: 'var(--status-connect)', platform: 'Instagram', dot: 'var(--brand-instagram)' },
  Video: { kind: 'video', label: 'Video', icon: VideoIcon, iconColor: 'var(--purple)', platform: 'TikTok', dot: 'var(--brand-tiktok)' },
  'Meta Ad': { kind: 'media', label: 'Meta Ad', icon: CoverImage, iconColor: 'var(--brand-facebook)', platform: 'Facebook', dot: 'var(--brand-facebook)' },
  'Search Ad': { kind: 'media', label: 'Search Ad', icon: CoverImage, iconColor: 'var(--status-posting)', platform: 'LinkedIn', dot: 'var(--brand-linkedin)' },
  'Blog Post': { kind: 'blog', label: 'Blog Post', icon: Document, iconColor: 'var(--status-approved)', platform: 'LinkedIn', dot: 'var(--brand-linkedin)' },
  Email: { kind: 'blog', label: 'Email', icon: Emails, iconColor: 'var(--status-review)', platform: 'Email', dot: 'var(--status-review)' },
};

type CalStatus = 'approved' | 'review' | 'draft';
const CAL_STATUS_CYCLE: CalStatus[] = ['approved', 'approved', 'review', 'approved', 'review', 'draft'];
const CAL_TIMES = ['9:00 AM', '1:00 PM', '8:00 AM', '4:00 PM', '11:00 AM', '5:00 PM', '10:00 AM'];

const CAL_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const CAL_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CAL_TODAY_KEY = 'wed';
// Base week — Monday Jun 8, 2026 (today = Wed Jun 10, matching the prototype date).
const CAL_BASE_MONDAY = new Date(2026, 5, 8);

interface CalDayInfo {
  key: string;
  name: string;
  date: string;
  full: string;
}

function calWeekFromOffset(offsetWeeks: number): CalDayInfo[] {
  const monday = new Date(CAL_BASE_MONDAY);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  return CAL_DAY_KEYS.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      key,
      name: CAL_DAY_NAMES[i] ?? '',
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  });
}

interface CalPost {
  id: string;
  dayKey: string;
  time: string;
  type: AssetType;
  title: string;
  body?: string;
  thumb: string;
  status: CalStatus;
}

// Opaque status badge — readable over a photo or on a white surface.
function CalStatusBadge({ status }: { status: CalStatus }) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  };

  if (status === 'approved') {
    return (
      <span
        style={{
          ...base,
          backgroundImage:
            'linear-gradient(rgba(4,175,0,0.14), rgba(4,175,0,0.14)), linear-gradient(var(--light-100), var(--light-100))',
          border: '1px solid rgba(4,175,0,0.22)',
          color: '#036b00',
        }}
      >
        Approved
      </span>
    );
  }

  if (status === 'review') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            ...base,
            backgroundImage:
              'linear-gradient(rgba(252,183,40,0.24), rgba(252,183,40,0.24)), linear-gradient(var(--light-100), var(--light-100))',
            border: '1px solid rgba(252,183,40,0.45)',
            color: '#8a5a00',
          }}
        >
          Review
        </span>
        <span style={{ color: '#d99a00', display: 'inline-flex' }}>
          <AlertTriangle size={16} color="currentColor" />
        </span>
      </span>
    );
  }

  return (
    <span
      style={{
        ...base,
        backgroundImage:
          'linear-gradient(var(--dark-4), var(--dark-4)), linear-gradient(var(--light-100), var(--light-100))',
        border: '1px solid var(--dark-8)',
        color: 'var(--dark-60)',
      }}
    >
      Draft
    </span>
  );
}

function CalTypeAndTime({ post }: { post: CalPost }) {
  const meta = CAL_ASSET_META[post.type];
  const TypeIcon = meta.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 400, color: 'var(--dark-80)' }}>
        <TypeIcon size={16} color={meta.iconColor} />
        {meta.label}
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
        <span style={{ color: 'var(--dark-60)' }}>{meta.platform}</span>
      </span>
      <span style={{ fontSize: 13, color: 'var(--dark-60)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {post.time.toLowerCase().replace(/\s/g, '')}
      </span>
    </div>
  );
}

function CalCaption({ text }: { text: string }) {
  const truncated = text.length > 78;
  const shown = truncated ? text.slice(0, 78).replace(/\s+\S*$/, '') : text;
  return (
    <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
      {shown}
      {truncated && (
        <>
          {' … '}
          <span style={{ color: 'var(--dark-40)' }}>more</span>
        </>
      )}
    </div>
  );
}

const calCardShell: React.CSSProperties = {
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: '100%',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

function CalPostCard({ post, dayFull }: { post: CalPost; dayFull: string }) {
  const kind = CAL_ASSET_META[post.type].kind;

  // ── Blog / text variant — header, landscape image, serif title + body ──
  if (kind === 'blog') {
    return (
      <div style={calCardShell}>
        <div style={{ padding: '11px 12px 9px' }}>
          <CalTypeAndTime post={post} />
        </div>
        <div style={{ aspectRatio: '16 / 9', background: `center/cover url('${post.thumb}'), var(--dark-4)` }} />
        <div style={{ padding: '12px 13px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--dark-90)',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--dark-40)' }}>{dayFull}</div>
          {post.body && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--dark-60)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.body}
            </div>
          )}
          <div style={{ marginTop: 2 }}>
            <CalStatusBadge status={post.status} />
          </div>
        </div>
      </div>
    );
  }

  // ── Media variant — header + caption, then portrait image with overlays ──
  return (
    <div style={calCardShell}>
      <div style={{ padding: '11px 12px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <CalTypeAndTime post={post} />
        <CalCaption text={post.title} />
      </div>
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          background: `center/cover url('${post.thumb}'), var(--dark-4)`,
        }}
      >
        {kind === 'carousel' && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'inline-flex',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="3" width="13" height="13" rx="3" stroke="var(--light-100)" strokeWidth="1.7" />
              <path d="M4 8v9a4 4 0 0 0 4 4h9" stroke="var(--light-100)" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {kind === 'video' && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M2 2L14 9L2 16V2Z" fill="var(--light-100)" />
              </svg>
            </span>
          </span>
        )}
        <div style={{ position: 'absolute', left: 10, bottom: 10 }}>
          <CalStatusBadge status={post.status} />
        </div>
      </div>
    </div>
  );
}

function CalDayColumn({ day, posts, isCurrentWeek }: { day: CalDayInfo; posts: CalPost[]; isCurrentWeek: boolean }) {
  const isToday = isCurrentWeek && day.key === CAL_TODAY_KEY;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 320px)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 0 12px',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          background: 'var(--default-bg)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            background: isToday ? 'var(--dark-4)' : 'transparent',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{day.date}</span>
          <span style={{ fontSize: 14, fontWeight: 400, color: isToday ? 'var(--dark-60)' : 'var(--dark-40)' }}>{day.name}</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {posts.length > 0 ? (
          posts.map((p) => <CalPostCard key={p.id} post={p} dayFull={day.full} />)
        ) : (
          <div style={{ margin: 'auto', padding: '28px 8px', textAlign: 'center' }}>
            <Text variant="metadata" color="var(--dark-40)">Nothing scheduled</Text>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCalendar({ account }: { account: Account }) {
  const theme = S.campaignThemes(account)[0]?.title ?? 'This season';
  const assets = useMemo(() => S.generatedAssets(account, theme), [account, theme]);
  const [weekOffset, setWeekOffset] = useState(0);

  const visibleWeek = useMemo(() => calWeekFromOffset(weekOffset), [weekOffset]);
  const isCurrentWeek = weekOffset === 0;

  // Map generated assets onto week days, round-robin Mon→Sun, deriving a time,
  // status, image, and (for blog/email) a body excerpt for each.
  const posts = useMemo<CalPost[]>(
    () =>
      assets.map((a, i) => {
        const kind = CAL_ASSET_META[a.type].kind;
        const w = kind === 'blog' ? 640 : 600;
        const h = kind === 'blog' ? 360 : 750;
        return {
          id: a.id,
          dayKey: CAL_DAY_KEYS[i % 7] ?? 'mon',
          time: CAL_TIMES[i % CAL_TIMES.length] ?? '9:00 AM',
          type: a.type,
          title: kind === 'blog' ? a.topic.replace(/^[^:]+:\s*/, '') : a.caption,
          body: kind === 'blog' ? a.caption : undefined,
          thumb: `https://picsum.photos/seed/dfy-${a.id}/${w}/${h}`,
          status: CAL_STATUS_CYCLE[i % CAL_STATUS_CYCLE.length] ?? 'approved',
        };
      }),
    [assets],
  );

  const byDay = useMemo(() => {
    const map: Record<string, CalPost[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    if (isCurrentWeek) posts.forEach((p) => (map[p.dayKey] ??= []).push(p));
    return map;
  }, [posts, isCurrentWeek]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--default-bg)', margin: '-24px', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toolbar — week navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderBottom: '1px solid var(--dark-4)',
          background: 'var(--default-bg)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <IconButton variant="ghost" size="sm" icon={ChevronLeft} aria-label="Previous week" onPress={() => setWeekOffset((o) => o - 1)} />
          <Button variant="ghost" size="sm" onPress={() => setWeekOffset(0)}>Today</Button>
          <IconButton variant="ghost" size="sm" icon={ChevronRight} aria-label="Next week" onPress={() => setWeekOffset((o) => o + 1)} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginLeft: 4 }}>
          {visibleWeek[0]?.date} – {visibleWeek[6]?.date}
        </span>
        <Text variant="metadata" color="var(--dark-60)" style={{ marginLeft: 'auto' }}>
          Theme <strong style={{ color: 'var(--purple)' }}>{theme}</strong>
        </Text>
      </div>

      {/* Week grid — horizontally scrolling 7 columns */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', background: 'var(--default-bg)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(240px, 1fr))',
            gap: 12,
            minWidth: 1640,
            padding: '8px 16px 24px',
          }}
        >
          {visibleWeek.map((d) => (
            <CalDayColumn key={d.key} day={d} posts={byDay[d.key] ?? []} isCurrentWeek={isCurrentWeek} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Performance({ account }: { account: Account }) {
  const stats = [['Reach', '48.2k', '+18%'], ['Engagements', '3,910', '+24%'], ['Clicks', '1,204', '+12%'], ['Leads', '86', '+31%']];
  const channels = [['Instagram', 82], ['Meta Ads', 64], ['Local SEO', 51], ['Email', 38]] as [string, number][];
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <Heading level={2} style={{ marginTop: 0 }}>Performance</Heading>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 16 }}>Last 30 days across the channels Blaze manages for {account.name}.</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {stats.map(([label, val, delta]) => <Card key={label}><StatusPill tone="success">{delta}</StatusPill><Text style={{ display: 'block', fontSize: 28, fontWeight: 600, marginTop: 8, color: 'var(--dark-90)' }}>{val}</Text><Text variant="metadata" color="var(--dark-40)">{label}</Text></Card>)}
      </div>
      <Card>
        <Text variant="largeList" style={{ display: 'block', marginBottom: 12 }}>By channel</Text>
        {channels.map(([name, pct]) => (
          <div key={name} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><Text>{name}</Text><Text color="var(--dark-60)">{pct}%</Text></div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--dark-6)' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'var(--action-50)' }} /></div>
          </div>
        ))}
      </Card>
    </div>
  );
}
