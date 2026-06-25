import { useEffect, useState, type CSSProperties } from 'react';
import { Button, Heading, Text } from '@/components';
import { Card, Chip, Pill, Select } from '@/staging';
import { Input, Textarea } from '../_ui';
import { stockImage } from '../stock-images';
import Heart01 from '@/icons/20/Heart01';
import MessageCircle from '@/icons/20/MessageCircle';
import Send1 from '@/icons/20/Send1';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import Edit1 from '@/icons/20/Edit1';
import {
  DoneScreen,
  EditableMarkdown,
  EditSection,
  Field,
  FieldCard,
  FlowBody,
  FlowFooter,
  FlowHeader,
  FlowTakeover,
  GaugeRing,
  IntroScreen,
  RemoveX,
  ScorecardHeader,
  SectionHeading,
  AddLink,
  statusGlyphColor,
} from './cold-flow-shell';
import {
  ACCOUNT,
  BRAND_CONTEXT,
  BRAND_COLORS,
  BRAND_FONTS,
  DEFAULT_PLAN,
  GOALS,
  MAJOR_EVENTS,
  PLAN_CHANNELS,
  SWIPE_FILE,
  TAGLINES,
  TONE_DONTS,
  TONE_DOS,
  TONE_SUMMARY,
  scorecard,
  type BrandColor,
  type BrandFont,
  type MajorEvent,
  type SwipeItem,
} from './strategy-data';

/**
 * V2 cold-state "Strategy onboarding" flow — full-screen takeover launched
 * from HomeColdView. Ported from blaze-dfy's Strategy.tsx, rebuilt H2-native
 * (single CertaPro account, H2 primitives + tokens) and leaned paid-first.
 */

const STEPS = ['context', 'creative', 'swipe', 'audit', 'goals'] as const;
type Phase = 'intro' | (typeof STEPS)[number] | 'done';

export function StrategyFlow({ onClose, onFinish }: { onClose: () => void; onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');

  const idx = STEPS.indexOf(phase as (typeof STEPS)[number]);
  const stepNum = phase === 'intro' ? 0 : phase === 'done' ? STEPS.length : idx + 1;

  const goNext = () => {
    if (phase === 'intro') return setPhase('context');
    if (idx >= 0 && idx < STEPS.length - 1) return setPhase(STEPS[idx + 1]);
    if (phase === 'goals') return setPhase('done');
  };
  const goBack = () => {
    if (phase === 'context') return setPhase('intro');
    if (idx > 0) return setPhase(STEPS[idx - 1]);
  };

  return (
    <FlowTakeover step={stepNum} totalSteps={STEPS.length} onClose={onClose}>
      {phase === 'intro' && (
        <IntroScreen
          eyebrow="Strategy onboarding · Step 1 of 2"
          title="Build the strategy"
          intro={`We've pre-filled everything from ${ACCOUNT.name}'s scan, uploads, and a competitive audit. Review and adjust each part, then lock in the first paid campaign theme.`}
          steps={[
            { label: 'Brand context', desc: 'Business, customers, services, and founder story.' },
            { label: 'Creative guidelines', desc: "Taglines, tone, do's & don'ts, and visual identity." },
            { label: 'Swipe file', desc: 'React to competitor paid creative and add your own references.' },
            { label: 'Competitive audit', desc: 'See where the paid wins are — Search, Social, and conversion.' },
            { label: 'Goals & theme', desc: 'Set success metrics, channels, and the first campaign.' },
          ]}
          action={
            <Button size="lg" onPress={() => setPhase('context')}>
              Start strategy
            </Button>
          }
        />
      )}

      {phase === 'context' && (
        <FlowBody>
          <FlowHeader eyebrow="Brand context" title="Who you are" subtitle="Pulled from your site and intake — edit anything that's off." />
          <BrandContextStep />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Continue" />
        </FlowBody>
      )}

      {phase === 'creative' && (
        <>
          <CreativeStep />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Continue" />
        </>
      )}

      {phase === 'swipe' && (
        <FlowBody>
          <FlowHeader eyebrow="Swipe file" title="What's working in your market" subtitle="React so we learn what to chase — most of these are paid ads from local competitors." />
          <SwipeStep />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Continue" />
        </FlowBody>
      )}

      {phase === 'audit' && (
        <FlowBody>
          <FlowHeader eyebrow="Competitive audit" title="Where the paid wins are" subtitle="Scanned from your site, social, Google Business Profile, and local competitors." />
          <AuditStep />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Continue" />
        </FlowBody>
      )}

      {phase === 'goals' && (
        <FlowBody>
          <FlowHeader eyebrow="Goals & theme" title="What success looks like" subtitle="Set the targets and pick the first campaign to launch." />
          <GoalsStep />
          <FlowFooter onBack={goBack} onNext={goNext} nextLabel="Lock in strategy" />
        </FlowBody>
      )}

      {phase === 'done' && (
        <DoneScreen
          title="Strategy locked in"
          body="Everything you reviewed is saved and now powers the workspace. Here's where each part lives."
          stored={[
            { label: 'Brand context, guidelines & swipe file', where: 'Brand Kit' },
            { label: 'Competitive audit', where: 'Scorecard' },
            { label: 'Goals, channels & first theme', where: 'Blaze Plan' },
          ]}
          action={
            <Button size="lg" onPress={onFinish}>
              Done — back to setup
            </Button>
          }
        />
      )}
    </FlowTakeover>
  );
}

// ─── Step 1: Brand context ──────────────────────────────────────────────────

export function BrandContextStep() {
  const [v, setV] = useState({ ...BRAND_CONTEXT });
  const fields: [string, keyof typeof v][] = [
    ['Business overview', 'overview'],
    ['Customer segments', 'segments'],
    ['Services / products', 'services'],
    ['Founder bio', 'bio'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fields.map(([label, key]) => (
        <FieldCard key={key}>
          <Heading level={4} style={{ margin: '0 0 8px' }}>
            {label}
          </Heading>
          <EditableMarkdown value={v[key]} onChange={(val) => setV({ ...v, [key]: val })} />
        </FieldCard>
      ))}
    </div>
  );
}

// ─── Step 2: Creative guidelines ────────────────────────────────────────────

function ColorSwatch({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 36,
        height: 36,
        padding: 0,
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        background: 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    />
  );
}

function RuleColumn({
  title,
  items,
  setItems,
  addLabel,
}: {
  title: string;
  items: string[];
  setItems: (v: string[]) => void;
  addLabel: string;
}) {
  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 8px', fontSize: 16 }}>
        {title}
      </Heading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <Input
              fullWidth
              value={r}
              onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <RemoveX onClick={() => setItems(items.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddLink label={addLabel} onClick={() => setItems([...items, ''])} />
      </div>
    </div>
  );
}

/** Read-only Do's / Don'ts list — H3 header, no icon. */
function ReadList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 8px', fontSize: 16 }}>
        {title}
      </Heading>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((r, i) => (
          <li key={i} style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--dark-80)' }}>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CreativeStep() {
  const [taglines, setTaglines] = useState<string[]>(TAGLINES);
  const [tone, setTone] = useState(TONE_SUMMARY);
  const [dos, setDos] = useState<string[]>(TONE_DOS);
  const [donts, setDonts] = useState<string[]>(TONE_DONTS);
  const [colors, setColors] = useState<BrandColor[]>(BRAND_COLORS);
  const [fonts, setFonts] = useState<BrandFont[]>(BRAND_FONTS);
  const [seed, setSeed] = useState(1);

  // Load the brand webfonts so the Fonts section can preview them for real.
  useEffect(() => {
    const id = 'h2-brand-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* LEFT: editable creative guidelines, in its own padded half */}
      <div style={{ width: '50vw', boxSizing: 'border-box', padding: '40px 48px 140px' }}>
        <FlowHeader title="How you sound and look" subtitle="The rules every campaign and ad will follow." />
        <div>
          <EditSection title="Taglines" first>
            {(editing) =>
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {taglines.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                      <Input fullWidth value={t} onChange={(e) => setTaglines(taglines.map((x, j) => (j === i ? e.target.value : x)))} />
                      <RemoveX onClick={() => setTaglines(taglines.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                  <AddLink label="Add tagline" onClick={() => setTaglines([...taglines, ''])} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {taglines.map((t, i) => (
                    <Text key={i} variant="primary" style={{ display: 'block', color: 'var(--dark-90)', fontSize: 15 }}>
                      “{t}”
                    </Text>
                  ))}
                </div>
              )
            }
          </EditSection>

          <EditSection title="Tone & voice">
            {(editing) =>
              editing ? (
                <>
                  <Textarea value={tone} onChange={(e) => setTone(e.target.value)} style={{ minHeight: 76, marginBottom: 16 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <RuleColumn title="Do's" items={dos} setItems={setDos} addLabel="Add a do" />
                    <RuleColumn title="Don'ts" items={donts} setItems={setDonts} addLabel="Add a don't" />
                  </div>
                </>
              ) : (
                <>
                  <Text variant="primary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55, fontSize: 14, marginBottom: 16 }}>
                    {tone}
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <ReadList title="Do's" items={dos} />
                    <ReadList title="Don'ts" items={donts} />
                  </div>
                </>
              )
            }
          </EditSection>

          <EditSection title="Brand colors">
            {(editing) =>
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ColorSwatch value={c.hex} onChange={(hex) => setColors(colors.map((x, j) => (j === i ? { ...x, hex } : x)))} />
                      <div style={{ maxWidth: 130, width: '100%' }}>
                        <Input fullWidth value={c.hex} onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} style={{ textTransform: 'uppercase' } as CSSProperties} />
                      </div>
                      <div style={{ maxWidth: 200, width: '100%' }}>
                        <Input fullWidth value={c.name} onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      </div>
                      <RemoveX onClick={() => setColors(colors.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                  <AddLink label="Add color" onClick={() => setColors([...colors, { hex: '#888888', name: 'New color' }])} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                  {colors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: c.hex, border: '1px solid var(--dark-8)', flexShrink: 0 }} />
                      <div>
                        <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)' }}>{c.name}</Text>
                        <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', textTransform: 'uppercase' }}>{c.hex}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </EditSection>

          <EditSection title="Fonts">
            {(editing) =>
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fonts.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', alignItems: 'center', gap: 8 }}>
                      <Input fullWidth value={f.family} onChange={(e) => setFonts(fonts.map((x, j) => (j === i ? { ...x, family: e.target.value } : x)))} />
                      <Select
                        value={f.role}
                        onChange={(val: string) => setFonts(fonts.map((x, j) => (j === i ? { ...x, role: val as BrandFont['role'] } : x)))}
                        options={[
                          { value: 'Display', label: 'Display' },
                          { value: 'Heading', label: 'Heading' },
                          { value: 'Body', label: 'Body' },
                        ]}
                        size="md"
                        fullWidth
                      />
                      <RemoveX onClick={() => setFonts(fonts.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                  <AddLink label="Add font" onClick={() => setFonts([...fonts, { family: '', role: 'Body' }])} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {fonts.map((f, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: 30, lineHeight: 1.1, color: 'var(--dark-90)', fontWeight: f.role === 'Display' ? 700 : f.role === 'Heading' ? 600 : 400 }}>
                        {f.family || 'Aa'}
                      </div>
                      <div style={{ fontFamily: `'${f.family}', sans-serif`, fontSize: 15, color: 'var(--dark-60)', marginTop: 4 }}>
                        The quick brown fox jumps over the lazy dog
                      </div>
                      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-40)', marginTop: 6 }}>
                        {f.family} · {f.role}
                      </Text>
                    </div>
                  ))}
                </div>
              )
            }
          </EditSection>

          <EditSection title="Mood board" desc="Drop creative you love — it sets the inspiration target for every campaign.">
            {(editing) =>
              editing ? (
                <button
                  style={{
                    width: '100%',
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 12,
                    border: '1.5px dashed var(--dark-12)',
                    background: 'var(--dark-2)',
                    cursor: 'pointer',
                    color: 'var(--dark-40)',
                    fontFamily: 'inherit',
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontSize: 26 }}>🖼️</span>
                  Drop inspiration images, or click to upload
                </button>
              ) : (
                <Text variant="secondary" style={{ color: 'var(--dark-40)' }}>
                  No inspiration images yet — hit Edit to upload.
                </Text>
              )
            }
          </EditSection>
        </div>
      </div>

      {/* RIGHT: live Instagram-post preview — full-height dark gradient half */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '50vw',
          height: '100vh',
          boxSizing: 'border-box',
          zIndex: 1,
          background: 'radial-gradient(120% 80% at 50% 25%, var(--dark-80), var(--dark-90))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 32,
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <IgPreview tagline={taglines[0]} seed={seed} />
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--light-60)',
            padding: '6px 10px',
          }}
        >
          <ArrowRefresh size={16} color="var(--light-60)" />
          Refresh Preview
        </button>
      </div>
    </div>
  );
}

// ─── Instagram-post live preview ────────────────────────────────────────────

function IgAction({ icon: Icon, label }: { icon: typeof Heart01; label: string }) {
  return (
    <span title={label} style={{ display: 'inline-flex' }}>
      <Icon size={24} color="var(--light-100)" />
    </span>
  );
}

function IgPreview({ tagline, seed = 1 }: { tagline?: string; seed?: number }) {
  const headline = (tagline ?? '').trim() || 'A fresh coat changes everything';

  return (
    <div>
      <div
        style={{
          borderRadius: 18,
          background: 'var(--dark-100)',
          border: '1px solid var(--light-12)',
          padding: 14,
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        }}
      >
        {/* header: avatar + username */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              flexShrink: 0,
              background: 'var(--purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--light-100)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            C
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ color: 'var(--light-100)', fontSize: 14, fontWeight: 600 }}>certapro_austin</div>
            <div style={{ color: 'var(--light-60)', fontSize: 12 }}>Just now</div>
          </div>
        </div>

        {/* post image with headline overlay */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '4 / 5',
            overflow: 'hidden',
            borderRadius: 12,
            background: 'var(--light-8)',
          }}
        >
          <img
            src={stockImage(`ig-${seed}`, 640, 800)}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 16,
              display: 'flex',
            }}
          >
            <span
              style={{
                background: 'var(--brand)',
                color: 'var(--dark-90)',
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: '-0.2px',
                padding: '6px 10px',
                borderRadius: 8,
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
              } as CSSProperties}
            >
              {headline}
            </span>
          </div>

          {/* carousel dots */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--light-100)' : 'rgba(255,255,255,0.45)',
                }}
              />
            ))}
          </div>
        </div>

        {/* action row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 2px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IgAction icon={Heart01} label="Like" />
            <IgAction icon={MessageCircle} label="Comment" />
            <IgAction icon={Send1} label="Share" />
          </div>
          {/* bookmark — no lib icon, inline SVG */}
          <span title="Save" style={{ display: 'inline-flex' }}>
            <svg width={24} height={24} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 3.5h10a.75.75 0 0 1 .75.75v12L10 13.25 4.25 16.25v-12A.75.75 0 0 1 5 3.5Z"
                stroke="var(--light-100)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* caption */}
        <Text variant="secondary" style={{ display: 'block', color: 'var(--light-60)', fontSize: 13, lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600, color: 'var(--light-100)' }}>certapro_austin</strong> Booking spring exteriors now — clean lines, on
          time, spotless cleanup. <span style={{ color: 'var(--light-40)' }}>…more</span>
        </Text>
      </div>
    </div>
  );
}

// ─── Step 3: Swipe file ─────────────────────────────────────────────────────

export function SwipeStep() {
  const [swipe, setSwipe] = useState<Record<string, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const [brands, setBrands] = useState<{ name: string; url: string }[]>([
    { name: 'Sherwin-Williams', url: 'instagram.com/sherwinwilliams' },
    { name: 'Five Star Painting', url: 'fivestarpainting.com' },
  ]);
  // The swipe file is scanned live from the market, so it takes a beat —
  // show a scanning skeleton before the benchmarks land.
  const [scanning, setScanning] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 2400);
    return () => clearTimeout(t);
  }, []);

  const reactions = (id: string) => {
    const r = swipe[id];
    const open = !!notesOpen[id];
    return (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: open ? 8 : 0 }}>
          <Button
            variant={r === 'like' ? 'green' : 'secondary'}
            size="sm"
            frontIcon={ThumbUp}
            onPress={() => setSwipe({ ...swipe, [id]: r === 'like' ? undefined : 'like' })}
          >
            Like
          </Button>
          <Button
            variant={r === 'dislike' ? 'red' : 'secondary'}
            size="sm"
            frontIcon={ThumbDown}
            onPress={() => setSwipe({ ...swipe, [id]: r === 'dislike' ? undefined : 'dislike' })}
          >
            Not for us
          </Button>
          <Button
            variant={open ? 'tertiary' : 'secondary'}
            size="sm"
            frontIcon={Edit1}
            onPress={() => setNotesOpen({ ...notesOpen, [id]: !open })}
          >
            Add notes
          </Button>
        </div>
        {open && (
          <Textarea
            value={notes[id] ?? ''}
            placeholder="What works / doesn't work about this?"
            onChange={(e) => setNotes({ ...notes, [id]: e.target.value })}
            style={{ minHeight: 56, fontSize: 14 }}
          />
        )}
      </>
    );
  };

  const hrefOf = (u: string) => (u.startsWith('http') ? u : `https://${u}`);

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <SectionHeading title="Brands you admire" desc="Brands you love — we'll study their look, voice, and paid creative." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {brands.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ maxWidth: 240, width: '100%' }}>
                <Input fullWidth value={b.name} placeholder="Brand name" onChange={(e) => setBrands(brands.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              </div>
              <Input fullWidth value={b.url} placeholder="Website or instagram.com/handle" onChange={(e) => setBrands(brands.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              {b.url.trim() && (
                <a
                  href={hrefOf(b.url)}
                  target="_blank"
                  rel="noreferrer"
                  title="Open"
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--dark-8)',
                    color: 'var(--action-50)',
                    textDecoration: 'none',
                  }}
                >
                  ↗
                </a>
              )}
              <RemoveX onClick={() => setBrands(brands.filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddLink label="Add brand" onClick={() => setBrands([...brands, { name: '', url: '' }])} />
        </div>
      </div>

      <SectionHeading title="Swipe file" desc="Competitor & category benchmarks scanned from the market. React so we learn what to chase." />
      {scanning ? (
        <SwipeFileLoading />
      ) : (
        <div style={{ columnCount: 2, columnGap: 12 }}>
          {SWIPE_FILE.map((item) => (
            <div key={item.id} style={{ breakInside: 'avoid', marginBottom: 12 }}>
              <Card padding="none">
                <SwipePreview item={item} />
                <div style={{ padding: 14 }}>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>
                    {item.source}
                  </Text>
                  <Text variant="largeList" style={{ display: 'block' }}>
                    {item.headline}
                  </Text>
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', margin: '4px 0 10px', lineHeight: 1.5 }}>
                    {item.note}
                  </Text>
                  {reactions(item.id)}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Scanning skeleton shown while the swipe file is "pulled from the market". */
function SwipeFileLoading() {
  const heights = [220, 150, 190, 240, 160, 200];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0 18px' }}>
        <Spinner />
        <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>
          Scanning competitor ads, landing pages, and category benchmarks…
        </Text>
      </div>
      <div style={{ columnCount: 2, columnGap: 12 }}>
        {heights.map((h, i) => (
          <div key={i} style={{ breakInside: 'avoid', marginBottom: 12 }}>
            <Card padding="none">
              <div style={{ height: h, background: 'var(--dark-4)', borderRadius: '8px 8px 0 0' }} />
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 10, width: '40%', background: 'var(--dark-6)', borderRadius: 4 }} />
                <div style={{ height: 12, width: '85%', background: 'var(--dark-6)', borderRadius: 4 }} />
                <div style={{ height: 10, width: '60%', background: 'var(--dark-4)', borderRadius: 4 }} />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Small inline spinner (SMIL — no CSS file needed). */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="var(--dark-8)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="var(--dark-60)" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/** Swipe-card preview — an image at the format's native aspect ratio, or a
 *  Google text-ad mock for search ads (whose "creative" is text, not an image). */
function SwipePreview({ item }: { item: SwipeItem }) {
  if (item.kind === 'search' && item.searchAd) {
    const ad = item.searchAd;
    return (
      <div style={{ position: 'relative', padding: '16px 14px 14px', background: 'var(--light-100)', borderBottom: '1px solid var(--dark-8)', borderRadius: '8px 8px 0 0' }}>
        <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 10px', borderRadius: 99, background: 'var(--dark-90)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>
          {item.channel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dark-90)', border: '1px solid var(--dark-15)', borderRadius: 4, padding: '0 5px', lineHeight: '17px' }}>Ad</span>
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{ad.url}</span>
        </div>
        <div style={{ fontSize: 16, color: 'var(--action-50)', fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>{ad.title}</div>
        <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>{ad.desc}</div>
      </div>
    );
  }
  const [aw, ah] = item.aspect.split('/').map((s) => parseFloat(s.trim()));
  const r = aw / ah;
  const w = r >= 1 ? 640 : Math.round(640 * r);
  const h = r >= 1 ? Math.round(640 / r) : 640;
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: item.aspect,
        overflow: 'hidden',
        borderRadius: '8px 8px 0 0',
        background: 'var(--dark-8)',
      }}
    >
      <img
        src={stockImage(`swipe-${item.id}`, w, h)}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.45))' }} />
      <span style={{ position: 'absolute', top: 8, left: 8, padding: '3px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.55)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>
        {item.channel}
      </span>
    </div>
  );
}

// ─── Step 4: Competitive audit ──────────────────────────────────────────────

function AuditStep() {
  const data = scorecard();
  return (
    <div>
      <ScorecardHeader data={data} accountName={ACCOUNT.name} />
      {data.areas.map((area) => (
        <div key={area.number} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <GaugeRing score={area.score} max={area.maxScore} status={area.status}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark-90)' }}>{area.score}</span>
            </GaugeRing>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Heading level={4} style={{ margin: 0 }}>
                {area.eyebrow}
              </Heading>
              <Text variant="metadata" style={{ color: statusGlyphColor(area.status) }}>
                {area.score}/{area.maxScore} — {area.title}
              </Text>
            </div>
            {area.platforms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {area.platforms.map((p) => (
                  <span key={p} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, background: 'var(--dark-3)', color: 'var(--dark-80)', border: '1px solid var(--dark-4)' }}>
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Card>
            {area.checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
                <span style={{ color: statusGlyphColor(c.status), fontWeight: 700 }}>
                  {c.status === 'good' ? '✓' : c.status === 'warn' ? '!' : '✕'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <Text variant="largeList">{c.title}</Text>
                    <Text variant="metadata" style={{ color: 'var(--dark-40)', whiteSpace: 'nowrap' }}>
                      {c.pts}
                    </Text>
                  </div>
                  <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
                    {c.desc}
                  </Text>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── Step 5: Goals & theme ──────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'start', marginBottom: 12 }}>
      <Text variant="largeList" style={{ paddingTop: 10 }}>
        {label}
      </Text>
      <div>{children}</div>
    </div>
  );
}

export function GoalsStep() {
  const [g, setG] = useState({ ...GOALS });
  const [channels, setChannels] = useState<string[]>(GOALS.channels);
  const [plan, setPlan] = useState<string[]>(DEFAULT_PLAN);
  const [events, setEvents] = useState<MajorEvent[]>(MAJOR_EVENTS);

  return (
    <div>
      <EditSection title="What does success look like?" desc="Drafted from your goals and the audit." first>
        {(editing) =>
          ([['First 30 days', 'thirty'], ['By 60 days', 'sixty'], ['By 90 days', 'ninety']] as const).map(([label, key]) => (
            <FieldRow key={key} label={label}>
              {editing ? (
                <Textarea value={g[key]} onChange={(e) => setG({ ...g, [key]: e.target.value })} style={{ minHeight: 68 }} />
              ) : (
                <Text variant="primary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55, fontSize: 14 }}>
                  {g[key]}
                </Text>
              )}
            </FieldRow>
          ))
        }
      </EditSection>

      <EditSection title="Marketing history" desc="Summarized from your intake and current channels.">
        {(editing) => (
          <>
            <FieldRow label="Channels they're on">
              {editing ? (
                <TokenInput tokens={channels} setTokens={setChannels} placeholder="Add channel" />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {channels.map((c) => (
                    <Pill key={c}>{c}</Pill>
                  ))}
                </div>
              )}
            </FieldRow>
            {([["What's driving growth?", 'drivingGrowth'], ["What's worked?", 'worked'], ["What hasn't worked?", 'notWorked']] as const).map(([label, key]) => (
              <FieldRow key={key} label={label}>
                {editing ? (
                  <Textarea value={g[key]} onChange={(e) => setG({ ...g, [key]: e.target.value })} style={{ minHeight: 60 }} />
                ) : (
                  <Text variant="primary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55, fontSize: 14 }}>
                    {g[key]}
                  </Text>
                )}
              </FieldRow>
            ))}
          </>
        )}
      </EditSection>

      <EditSection title="Major events" desc="Dates worth planning campaigns around. Tag each as company or industry.">
        {(editing) =>
          editing ? (
            <>
              <div style={{ borderRadius: 10, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
                {events.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
                    <input
                      value={e.label}
                      onChange={(ev) => setEvents(events.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))}
                      placeholder="Event"
                      style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', outline: 'none' }}
                    />
                    <input
                      type="month"
                      value={e.when}
                      onChange={(ev) => setEvents(events.map((x, j) => (j === i ? { ...x, when: ev.target.value } : x)))}
                      style={{ borderRadius: 6, border: '1px solid var(--dark-8)', padding: '5px 8px', fontFamily: 'inherit', fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)' }}
                    />
                    <div style={{ display: 'flex', padding: 2, borderRadius: 6, background: 'var(--dark-3)' }}>
                      {(['Company', 'Industry'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setEvents(events.map((x, j) => (j === i ? { ...x, tag: t } : x)))}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontFamily: 'inherit',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            background: e.tag === t ? 'var(--light-100)' : 'transparent',
                            color: e.tag === t ? 'var(--dark-90)' : 'var(--dark-60)',
                            border: e.tag === t ? '1px solid var(--dark-8)' : '1px solid transparent',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <RemoveX onClick={() => setEvents(events.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: 8 }}>
                <AddLink label="Add event" onClick={() => setEvents([...events, { label: '', when: '', tag: 'Company' }])} />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, background: 'var(--dark-4)', color: 'var(--dark-80)', fontSize: 13, fontWeight: 500, minWidth: 76, textAlign: 'center' }}>
                    {e.when ? new Date(e.when + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <Text variant="secondary" style={{ flex: 1, color: 'var(--dark-90)' }}>
                    {e.label}
                  </Text>
                  <Pill size="sm">{e.tag}</Pill>
                </div>
              ))}
            </div>
          )
        }
      </EditSection>

      <EditSection title="Channels to develop plans around" desc="Pre-selected from the audit's biggest gaps — paid-first.">
        {(editing) =>
          editing ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLAN_CHANNELS.map((c) => {
                const on = plan.includes(c);
                return (
                  <Chip key={c} selected={on} onSelectionChange={(sel: boolean) => setPlan(sel ? [...plan, c] : plan.filter((x) => x !== c))}>
                    {c}
                  </Chip>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {plan.map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </div>
          )
        }
      </EditSection>
    </div>
  );
}

function TokenInput({ tokens, setTokens, placeholder }: { tokens: string[]; setTokens: (t: string[]) => void; placeholder: string }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (t && !tokens.includes(t)) setTokens([...tokens, t]);
    setDraft('');
    setAdding(false);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingTop: 6 }}>
      {tokens.map((t) => (
        <Chip key={t} size="md" deletable onDelete={() => setTokens(tokens.filter((x) => x !== t))}>
          {t}
        </Chip>
      ))}
      {adding ? (
        <div style={{ width: 180 }}>
          <Input
            autoFocus
            inputSize="sm"
            fullWidth
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
              if (e.key === 'Escape') {
                setDraft('');
                setAdding(false);
              }
            }}
          />
        </div>
      ) : (
        <Chip size="md" variant="add" onClick={() => setAdding(true)}>
          {placeholder}
        </Chip>
      )}
    </div>
  );
}
