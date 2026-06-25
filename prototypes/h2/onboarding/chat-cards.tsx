import { useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Button, Heading, Text } from '@/components';
import Check2 from '@/icons/20/Check2';
import Close from '@/icons/20/Close';
import Plus from '@/icons/20/Plus';
import Edit1 from '@/icons/20/Edit1';
import ThumbUp from '@/icons/20/ThumbUp';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import { CardActiveContext, CardShell, LogoAvatar, SectionLabel, SelectChip } from './chat-ui';
import type { Selections } from './chat-ui';
import { COMPETITORS, galleryItems, type GalleryItem } from './chat-data';
import { stockImage } from '../stock-images';
import {
  ACCOUNT,
  BRAND_COLORS,
  BRAND_FONTS,
  GOALS,
  MAJOR_EVENTS,
  PLAN_CHANNELS,
  SWIPE_FILE,
  TAGLINES,
  TONE_SUMMARY,
} from '../cold-flows/strategy-data';
import { DIY_PLANS, fmtUsd } from './pricing-data';
import type { BusinessProfile } from './onboarding-context';

type Sel = Selections;
type SetSel = Dispatch<SetStateAction<Selections>>;
const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

// ─── Shared bits ──────────────────────────────────────────────────────────────

/** A warm, explanatory lead-in line under the card title — the "why". */
function Lead({ children }: { children: ReactNode }) {
  return (
    <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.5, marginBottom: 14 }}>
      {children}
    </Text>
  );
}

function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
      <Text variant="metadata" style={{ color: 'var(--dark-40)', width: 92, flexShrink: 0, paddingTop: 2 }}>
        {label}
      </Text>
      <div style={{ flex: 1, minWidth: 0 }}>
        {typeof value === 'string' ? (
          <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5 }}>
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function EditInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: 14, letterSpacing: '0.28px', fontFamily: 'inherit', border: '1px solid var(--dark-15)', borderRadius: 8, color: 'var(--dark-90)', outline: 'none' }}
    />
  );
}

function EditArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 14, letterSpacing: '0.28px', fontFamily: 'inherit', border: '1px solid var(--dark-15)', borderRadius: 8, color: 'var(--dark-90)', outline: 'none', minHeight: 56, resize: 'vertical', lineHeight: 1.5 }}
    />
  );
}

function chipBtn(active: boolean, bg: string, color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    background: active ? bg : 'var(--light-100)',
    color: active ? color : 'var(--dark-60)',
    border: active ? 'none' : '1px solid var(--dark-8)',
  };
}

// ─── #4 Business profile (with logo + inline edit) ────────────────────────────

function CertaProLogo() {
  return (
    <div
      style={{
        width: 120,
        height: 52,
        borderRadius: 8,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: 19,
        letterSpacing: '0.04em',
        color: 'var(--dark-90)',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      CertaPro
    </div>
  );
}

export function ProfileCard({ profile, onContinue }: { profile: BusinessProfile; onContinue: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [pitch, setPitch] = useState(profile.elevatorPitch.split('. ')[0] + '.');
  const [positioning, setPositioning] = useState(profile.positioningPrimary);
  const audience = `Homeowners ${profile.audienceAgeMin}–${profile.audienceAgeMax} · ${profile.audienceLocations.join(', ')}`;
  return (
    <CardShell
      title="Here's the profile I built from your site"
      primary={{ label: 'Looks good', onPress: onContinue }}
      secondary={{ label: editing ? 'Done' : 'Edit', onPress: () => setEditing((e) => !e) }}
    >
      <Lead>I pulled this from your website, Google Business Profile, and reviews. Give it a quick look — anything off, just hit Edit.</Lead>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
        <CertaProLogo />
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <EditInput value={name} onChange={setName} />
          ) : (
            <Heading level={5} style={{ margin: '0 0 2px' }}>
              {name}
            </Heading>
          )}
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {ACCOUNT.domain}
          </Text>
        </div>
      </div>
      <KV label="What they do" value={editing ? <EditArea value={pitch} onChange={setPitch} /> : pitch} />
      <KV label="Audience" value={audience} />
      <KV label="Positioning" value={editing ? <EditArea value={positioning} onChange={setPositioning} /> : positioning} />
      <Text variant="metadata" style={{ display: 'block', marginTop: 4, color: 'var(--dark-40)' }}>
        I also captured your customer segments, services, and {ACCOUNT.founder}’s founder bio.
      </Text>
    </CardShell>
  );
}

// ─── #5.1 Competitors ─────────────────────────────────────────────────────────

export function CompetitorsCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const tracked = sel.competitors.length ? sel.competitors : COMPETITORS.map((c) => c.id);

  const toggleC = (id: string) =>
    setSel((s) => ({ ...s, competitors: toggle(s.competitors.length ? s.competitors : COMPETITORS.map((c) => c.id), id) }));

  const addCustom = () => {
    const t = draft.trim();
    if (!t) return;
    setExtra((e) => [...e, t]);
    setDraft('');
  };

  return (
    <CardShell title="Here's who you're up against" primary={{ label: 'These look right', onPress: onContinue }}>
      <Lead>
        These local shops are all running paid right now. I'll keep an eye on them to benchmark your ads and spot the gaps you can win. Tap any to stop tracking, or add one I missed.
      </Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPETITORS.map((c) => {
          const on = tracked.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleC(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                padding: 12,
                borderRadius: 10,
                cursor: 'pointer',
                background: on ? 'var(--dark-2)' : 'var(--light-100)',
                border: `1px solid ${on ? 'var(--dark-15)' : 'var(--dark-8)'}`,
              }}
            >
              <LogoAvatar label={c.name} color={c.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
                    {c.name}
                  </Text>
                  <Text variant="metadata" style={{ color: 'var(--dark-40)' }}>
                    {c.handle}
                  </Text>
                </div>
                <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2, lineHeight: 1.45 }}>
                  {c.note}
                </Text>
              </div>
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: on ? 'none' : '1.5px solid var(--dark-15)',
                  background: on ? 'var(--dark-90)' : 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {on && <Check2 size={14} color="var(--light-100)" />}
              </span>
            </button>
          );
        })}
        {extra.map((nm) => (
          <div key={nm} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'var(--dark-2)', border: '1px solid var(--dark-15)' }}>
            <LogoAvatar label={nm} color="var(--purple)" />
            <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
              {nm}
            </Text>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add a competitor (name or @handle)"
          style={{ flex: 1, padding: '10px 12px', fontSize: 14, letterSpacing: '0.28px', fontFamily: 'inherit', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 8, color: 'var(--dark-90)', outline: 'none' }}
        />
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={addCustom}>
          Add
        </Button>
      </div>
    </CardShell>
  );
}

// ─── #5.2 Ads & posts they're running (like / note) ───────────────────────────

export function MarketCreativeCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);

  return (
    <CardShell title="And here's what they're running" primary={{ label: 'Continue', onPress: onContinue }}>
      <Lead>Like the ones that feel right for your brand — I'll lean your creative toward what you pick. Leave a note if you want to be specific.</Lead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SWIPE_FILE.slice(0, 4).map((item) => {
          const liked = sel.likedAds.includes(item.id);
          return (
            <div key={item.id} style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden', background: 'var(--light-100)' }}>
              {item.kind === 'search' && item.searchAd ? (
                <div style={{ padding: 12, background: 'var(--dark-2)' }}>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>Ad · {item.searchAd.url}</Text>
                  <Text variant="secondary" style={{ display: 'block', color: 'var(--action-50)', fontWeight: 500, marginTop: 2 }}>{item.searchAd.title}</Text>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2, lineHeight: 1.4 }}>{item.searchAd.desc}</Text>
                </div>
              ) : (
                <div style={{ position: 'relative', aspectRatio: item.aspect === 'auto' ? '4 / 3' : item.aspect, background: 'var(--dark-8)' }}>
                  <img src={stockImage(`mkt-${item.id}`, 600, 600)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: 10 }}>
                <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>{item.source} · {item.channel}</Text>
                <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', marginTop: 2, lineHeight: 1.4 }}>{item.headline}</Text>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button type="button" onClick={() => setSel((s) => ({ ...s, likedAds: toggle(s.likedAds, item.id) }))} style={chipBtn(liked, 'var(--positive-10)', 'var(--positive-60)')}>
                    <ThumbUp size={14} color="currentColor" /> {liked ? 'Liked' : 'Like'}
                  </button>
                  <button type="button" onClick={() => setNoteOpen(noteOpen === item.id ? null : item.id)} style={chipBtn(noteOpen === item.id, 'var(--dark-4)', 'var(--dark-90)')}>
                    <Edit1 size={14} color="currentColor" /> Note
                  </button>
                </div>
                {noteOpen === item.id && (
                  <textarea
                    value={sel.adNotes[item.id] ?? ''}
                    onChange={(e) => setSel((s) => ({ ...s, adNotes: { ...s.adNotes, [item.id]: e.target.value } }))}
                    placeholder="What works about this?"
                    style={{ width: '100%', boxSizing: 'border-box', marginTop: 8, minHeight: 48, padding: 8, fontSize: 14, letterSpacing: '0.28px', fontFamily: 'inherit', border: '1px solid var(--dark-8)', borderRadius: 8, outline: 'none', resize: 'vertical', color: 'var(--dark-90)' }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ─── #6a Sound ────────────────────────────────────────────────────────────────

export function SoundCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  return (
    <CardShell title="First, how you should sound" primary={{ label: 'Sounds right', onPress: onContinue }}>
      <Lead>This is the voice I'll write every ad, post, and reply in — pulled from how you already talk to customers. Pick the taglines that feel most like you.</Lead>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-90)', lineHeight: 1.55, marginBottom: 16 }}>
        {TONE_SUMMARY}
      </Text>
      <SectionLabel>Taglines</SectionLabel>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TAGLINES.map((t) => (
          <SelectChip key={t} selected={sel.taglines.includes(t)} onClick={() => setSel((s) => ({ ...s, taglines: toggle(s.taglines, t) }))}>
            {t}
          </SelectChip>
        ))}
      </div>
    </CardShell>
  );
}

// ─── #6b Look ─────────────────────────────────────────────────────────────────

export function LookCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  const accent = sel.primaryColor || BRAND_COLORS[0].hex;
  return (
    <CardShell title="And how you should look" primary={{ label: 'Looks great', onPress: onContinue }} width={560}>
      <Lead>Here's a live preview of your ad style. Tap a color to make it your lead accent — the preview updates as you go.</Lead>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 200, flexShrink: 0, border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
          <div style={{ height: 8, background: accent }} />
          <div style={{ padding: 14 }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--dark-90)' }}>CertaPro</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--dark-60)', marginTop: 4, lineHeight: 1.4 }}>{sel.taglines[0] ?? TAGLINES[0]}</div>
            <div style={{ marginTop: 12, display: 'inline-block', padding: '6px 12px', borderRadius: 8, background: accent, color: 'var(--light-100)', fontSize: 13, fontWeight: 600 }}>Get a free estimate</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SectionLabel>Brand colors</SectionLabel>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {BRAND_COLORS.map((c) => {
              const on = accent === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setSel((s) => ({ ...s, primaryColor: c.hex }))}
                  style={{ width: 36, height: 36, borderRadius: 8, background: c.hex, cursor: 'pointer', border: on ? '2px solid var(--dark-90)' : '1px solid var(--dark-8)', boxShadow: on ? '0 0 0 2px var(--light-100) inset' : 'none' }}
                />
              );
            })}
          </div>
          <SectionLabel>Fonts</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BRAND_FONTS.map((f) => (
              <div key={f.family} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 12px', border: '1px solid var(--dark-8)', borderRadius: 8 }}>
                <span style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: 26, fontWeight: f.role === 'Display' ? 700 : 400, color: 'var(--dark-90)', lineHeight: 1 }}>Ag</span>
                <div>
                  <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{f.family}</Text>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)' }}>{f.role}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ─── #7 Goals (staged, editable) ──────────────────────────────────────────────

export function GoalsTimelineCard({ onContinue }: { onContinue: () => void }) {
  const [editing, setEditing] = useState(false);
  const [g, setG] = useState({ thirty: GOALS.thirty, sixty: GOALS.sixty, ninety: GOALS.ninety });
  const cols: [string, keyof typeof g][] = [
    ['First 30 days', 'thirty'],
    ['By 60 days', 'sixty'],
    ['By 90 days', 'ninety'],
  ];
  return (
    <CardShell
      title="Where I'd aim over your first 90 days"
      primary={{ label: 'Approve goals', onPress: onContinue }}
      secondary={{ label: editing ? 'Done' : 'Edit', onPress: () => setEditing((e) => !e) }}
    >
      <Lead>These build on each other — get the paid engine live, then prove it out, then scale what's working. Tweak any of them if your targets are different.</Lead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {cols.map(([label, key]) => (
          <div key={key} style={{ border: '1px solid var(--dark-8)', borderRadius: 10, padding: 12, background: 'var(--dark-2)' }}>
            <Text variant="metadata" style={{ display: 'block', color: 'var(--purple)', fontWeight: 500, marginBottom: 6 }}>{label}</Text>
            {editing ? (
              <EditArea value={g[key]} onChange={(v) => setG({ ...g, [key]: v })} />
            ) : (
              <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.45 }}>{g[key]}</Text>
            )}
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export function GoalsHistoryCard({ onContinue }: { onContinue: () => void }) {
  const [editing, setEditing] = useState(false);
  const [h, setH] = useState({ driving: GOALS.drivingGrowth, worked: GOALS.worked, notWorked: GOALS.notWorked });
  return (
    <CardShell
      title="And the starting point I'm working from"
      primary={{ label: 'Got it', onPress: onContinue }}
      secondary={{ label: editing ? 'Done' : 'Edit', onPress: () => setEditing((e) => !e) }}
    >
      <Lead>Knowing what's driven your growth so far — and what hasn't — tells me where the fastest wins are.</Lead>
      <div style={{ marginBottom: 12 }}>
        <SectionLabel>What's driving growth today</SectionLabel>
        {editing ? <EditArea value={h.driving} onChange={(v) => setH({ ...h, driving: v })} /> : <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.5 }}>{h.driving}</Text>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ borderRadius: 10, padding: 12, background: 'var(--positive-10)' }}>
          <Text variant="metadata" style={{ display: 'block', color: 'var(--positive-60)', marginBottom: 4 }}>What's worked</Text>
          {editing ? <EditArea value={h.worked} onChange={(v) => setH({ ...h, worked: v })} /> : <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.45 }}>{h.worked}</Text>}
        </div>
        <div style={{ borderRadius: 10, padding: 12, background: 'var(--negative-10)' }}>
          <Text variant="metadata" style={{ display: 'block', color: 'var(--negative-60)', marginBottom: 4 }}>What hasn't</Text>
          {editing ? <EditArea value={h.notWorked} onChange={(v) => setH({ ...h, notWorked: v })} /> : <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.45 }}>{h.notWorked}</Text>}
        </div>
      </div>
    </CardShell>
  );
}

export function MajorEventsCard({ onContinue }: { onContinue: () => void }) {
  const [editing, setEditing] = useState(false);
  const [events, setEvents] = useState(MAJOR_EVENTS.map((e) => e.label));
  return (
    <CardShell
      title="Dates worth planning campaigns around"
      primary={{ label: 'Looks right', onPress: onContinue }}
      secondary={{ label: editing ? 'Done' : 'Edit', onPress: () => setEditing((e) => !e) }}
    >
      <Lead>I'll line your campaigns up against your busy seasons so the spend lands when demand peaks.</Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MAJOR_EVENTS.map((e, i) => (
          <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--dark-8)', borderRadius: 10 }}>
            <span style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, background: 'var(--dark-4)', color: 'var(--dark-80)', fontSize: 13, fontWeight: 500, minWidth: 64, textAlign: 'center' }}>
              {new Date(e.when + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            {editing ? (
              <input value={events[i]} onChange={(ev) => setEvents((arr) => arr.map((x, j) => (j === i ? ev.target.value : x)))} style={{ flex: 1, padding: '6px 10px', fontSize: 14, letterSpacing: '0.28px', fontFamily: 'inherit', border: '1px solid var(--dark-15)', borderRadius: 8, color: 'var(--dark-90)', outline: 'none' }} />
            ) : (
              <Text variant="secondary" style={{ flex: 1, color: 'var(--dark-90)' }}>{events[i]}</Text>
            )}
            <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 999, background: e.tag === 'Company' ? 'rgba(124,92,252,0.12)' : 'var(--dark-4)', color: e.tag === 'Company' ? 'var(--purple)' : 'var(--dark-60)', fontSize: 12 }}>
              {e.tag}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

export function ChannelsCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  return (
    <CardShell title="Which channels should I build plans around?" primary={{ label: 'Lock channels', onPress: onContinue }}>
      <Lead>I've pre-picked the paid-first channels where your competitors are winning and you're absent. Adjust if you'd rather start somewhere else.</Lead>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PLAN_CHANNELS.map((c) => (
          <SelectChip key={c} selected={sel.channels.includes(c)} onClick={() => setSel((s) => ({ ...s, channels: toggle(s.channels, c) }))}>
            {c}
          </SelectChip>
        ))}
      </div>
    </CardShell>
  );
}

// ─── #8 Creative gallery (click → larger preview + controls) ──────────────────

export function CreativeGalleryCard({ sel, setSel, onContinue }: { sel: Sel; setSel: SetSel; onContinue: () => void }) {
  const [items] = useState<GalleryItem[]>(() => galleryItems());
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const [seedBump, setSeedBump] = useState<Record<string, number>>({});

  const imgFor = (it: GalleryItem) => (seedBump[it.id] ? stockImage(`${it.id}-r${seedBump[it.id]}`, 640, 800) : it.img);

  return (
    <>
      <CardShell title="Your first wave of creative is ready" primary={{ label: 'Continue', onPress: onContinue }} width={600}>
        <Lead>I generated these from everything above — your voice, your look, and what's working for competitors. Tap any to see it bigger, then approve it or ask me to change it.</Lead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {items.map((it) => {
            const approved = sel.approved.includes(it.id);
            const changed = sel.changes.includes(it.id);
            return (
              <button key={it.id} type="button" onClick={() => setOpen(it)} style={{ position: 'relative', padding: 0, border: 'none', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: 'var(--dark-8)', aspectRatio: it.aspect }}>
                <img src={imgFor(it)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span style={{ position: 'absolute', top: 6, left: 6, padding: '2px 6px', borderRadius: 6, background: 'rgba(0,0,0,0.55)', color: 'var(--light-100)', fontSize: 10, fontWeight: 500 }}>{it.type}</span>
                {(approved || changed) && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: approved ? 'var(--positive-60)' : 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {approved ? <Check2 size={13} color="var(--light-100)" /> : <Edit1 size={12} color="var(--dark-90)" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardShell>

      {open && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--light-100)', borderRadius: 16, overflow: 'hidden', maxWidth: 720, width: '100%', maxHeight: '90vh', display: 'flex' }}>
            <div style={{ flex: '0 0 55%', background: 'var(--dark-90)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imgFor(open)} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 600 }}>{open.type}</Text>
                <button type="button" aria-label="Close" onClick={() => setOpen(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <Close size={18} color="var(--dark-60)" />
                </button>
              </div>
              <div style={{ display: 'inline-block', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 8, background: 'var(--brand)', color: 'var(--dark-90)', fontSize: 13, fontWeight: 600 }}>{open.overlay}</div>
              <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>{open.caption}</Text>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="primary" size="sm" frontIcon={Check2} onPress={() => { setSel((s) => ({ ...s, approved: [...new Set([...s.approved, open.id])], changes: s.changes.filter((x) => x !== open.id) })); setOpen(null); }}>
                  Approve
                </Button>
                <Button variant="secondary" size="sm" frontIcon={Edit1} onPress={() => { setSel((s) => ({ ...s, changes: [...new Set([...s.changes, open.id])], approved: s.approved.filter((x) => x !== open.id) })); setOpen(null); }}>
                  Request changes
                </Button>
                <Button variant="tertiary" size="sm" frontIcon={ArrowRefresh} onPress={() => setSeedBump((b) => ({ ...b, [open.id]: (b[open.id] ?? 0) + 1 }))}>
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── #9 Summary of what they shaped ───────────────────────────────────────────

export function ChangesSummaryCard({ sel, onContinue }: { sel: Sel; onContinue: () => void }) {
  const trackedCount = sel.competitors.length || COMPETITORS.length;
  const rows: [string, string][] = [
    ['Competitors tracked', `${trackedCount}`],
    ['Ads liked', `${sel.likedAds.length}`],
    ['Notes left', `${Object.values(sel.adNotes).filter((v) => v.trim()).length}`],
    ['Taglines kept', sel.taglines.length ? sel.taglines.join(' · ') : 'all 3'],
    ['Brand color', sel.primaryColor ? (BRAND_COLORS.find((c) => c.hex === sel.primaryColor)?.name ?? sel.primaryColor) : BRAND_COLORS[0].name],
    ['Channels', (sel.channels.length ? sel.channels : PLAN_CHANNELS.slice(0, 4)).join(', ')],
    ['Creative approved', `${sel.approved.length}`],
    ['Changes requested', `${sel.changes.length}`],
  ];
  return (
    <CardShell title="Here's everything you shaped" primary={{ label: 'Looks complete', onPress: onContinue }}>
      <Lead>Quick recap of your calls — all of this is saved to your Brand Kit and steers every campaign from here.</Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--dark-4)' }}>
            <Check2 size={16} color="var(--positive-60)" />
            <Text variant="metadata" style={{ color: 'var(--dark-40)', width: 150, flexShrink: 0 }}>{k}</Text>
            <Text variant="secondary" style={{ color: 'var(--dark-90)', lineHeight: 1.4 }}>{v}</Text>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── #10 Plan (message-like, switchable) ──────────────────────────────────────

const PLAN_FEATURES: Record<'growth' | 'starter', string[]> = {
  growth: ['Paid Ads (Social + Search)', 'Landing Pages', 'SEO, AEO & Reputation', 'AI Receptionist'],
  starter: ['Organic Campaigns', 'Local SEO', 'SEO/AEO'],
};

export function PlanCard({ sel, setSel, onStartTrial, onCheckout }: { sel: Sel; setSel: SetSel; onStartTrial: () => void; onCheckout: () => void }) {
  const active = useContext(CardActiveContext);
  const tier = sel.plan;
  const plan = DIY_PLANS[tier];
  const other = tier === 'growth' ? 'starter' : 'growth';
  return (
    <CardShell width={460}>
      <Lead>
        Based on everything we set up, the <strong style={{ color: 'var(--dark-90)', fontWeight: 600 }}>{plan.label}</strong> plan fits you best — it covers the paid-first channels we lined up. You can switch plans or start a free trial.
      </Lead>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['growth', 'starter'] as const).map((t) => {
          const on = tier === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setSel((s) => ({ ...s, plan: t }))}
              style={{ flex: 1, textAlign: 'left', padding: 12, borderRadius: 12, cursor: 'pointer', background: on ? 'var(--dark-2)' : 'var(--light-100)', border: `1.5px solid ${on ? 'var(--dark-90)' : 'var(--dark-8)'}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 600 }}>{DIY_PLANS[t].label}</Text>
                {t === 'growth' && <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--brand)', color: 'var(--dark-90)', fontSize: 11, fontWeight: 600 }}>Recommended</span>}
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--dark-90)' }}>{fmtUsd(DIY_PLANS[t].monthlyByTerm[12])}</span>
                <Text variant="metadata" style={{ color: 'var(--dark-60)' }}> /mo · 12-mo</Text>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PLAN_FEATURES[tier].map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Check2 size={16} color="var(--positive-60)" />
            <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{f}</Text>
          </div>
        ))}
      </div>
      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 8 }}>
        Switch to {DIY_PLANS[other].label} above any time.
      </Text>
      {active && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <Button variant="primary" size="md" onPress={onStartTrial}>
            Start free trial
          </Button>
          <Button variant="tertiary" size="md" onPress={onCheckout}>
            Continue to checkout
          </Button>
        </div>
      )}
    </CardShell>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export function CheckoutCard({ tier, paying, onPay }: { tier: 'growth' | 'starter'; paying: boolean; onPay: () => void }) {
  const monthly = DIY_PLANS[tier].monthlyByTerm[12];
  return (
    <CardShell title="One last thing — checkout" width={420}>
      <KV label="Plan" value={`${DIY_PLANS[tier].label} — ${fmtUsd(monthly)}/mo`} />
      <KV label="Email" value="john@certapro-austin.com" />
      <KV label="Card" value="•••• •••• •••• 4242" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--dark-8)', marginTop: 12, paddingTop: 12 }}>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>Total today</Text>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{fmtUsd(monthly)}</Text>
      </div>
      <div style={{ marginTop: 14 }}>
        <Button variant="primary" size="md" onPress={onPay} disabled={paying}>
          {paying ? 'Processing…' : 'Pay & go live'}
        </Button>
      </div>
    </CardShell>
  );
}
