import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { TextField, Pill, StatusPill, Select } from '@/staging';
import Trash2 from '@/icons/20/Trash2';
import Plus from '@/icons/20/Plus';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Upload from '@/icons/20/Upload';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import Facebook from '@/icons/20/Facebook';
import Instagram from '@/icons/20/Instagram';
import LinkedIn from '@/icons/20/LinkedIn';
import TikTok from '@/icons/20/TikTok';
import Map02 from '@/icons/20/Map02';
import Star from '@/icons/20/Star';
import Globe from '@/icons/20/Globe';
import {
  SCORECARD_SECTIONS, SCORECARD_SUMMARY, SEARCH_ADS, ARTICLES, STRATEGY_PILLARS,
  STRATEGY_TOTAL, STRATEGY_TOTAL_NOTE,
  WEBSITE_HEADLINE, WEBSITE_SUBHEAD, WEBSITE_URL, websiteHero,
  COMPARISON_ROWS, SITELINKS, type CreativeItem, type Sitelink,
} from './data';
import { scoreColor, ReadOnlyBullets, EffortPill, CreativeCard } from './ui';
import { ScoreDonut, ComparisonTable } from './StepScorecard';
import { PAGE_W } from './cardbody';
import { StepIntro, useWizard } from './wizard';

/*
 * AM-editable variants of the Growth Engine Review steps.
 *
 * Model: each step shows the client-facing PREVIEW first; editing is revealed
 * behind a per-section Edit button (scorecard, paid ads, strategy) or a
 * per-step preview toggle (website). In the `reviewed` demo state the review is
 * seeded with the client's verdicts + votes, so each section surfaces them.
 */

const F = "'Sohne', sans-serif";
const CARD: CSSProperties = { border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '24px 28px' };
const PAGE = 760;
const OVERALL_SCORE = COMPARISON_ROWS.find((r) => r.isUs)?.overall ?? 64;
type Effort = 'quick' | 'medium' | 'project';

// The client's asset votes, shown to the AM in the reviewed state.
const PAID_CLIENT_VOTES: Record<string, 'up' | 'down'> = {
  h1: 'up', h3: 'up', h9: 'up', h10: 'down', d1: 'up', d4: 'down', img2: 'down',
};

// Assets the client edited in review: the AM sees their copy + an "edited" tag.
const PAID_CLIENT_EDITS: Record<string, string> = {
  h4: '100% Dust-Free Sanding',
  h6: 'NWFA-Certified Local Installers',
  d2: 'From wood-look plank to solid hardwood, installed and guaranteed by our own certified crew.',
};

// Alternatives the "Regenerate" action cycles through, per asset kind.
const REGEN_POOL: Record<string, string[]> = {
  headline: [
    'Top-Rated Austin Flooring', 'Free In-Home Consultation', 'Same-Week Install Slots',
    '5-Star Local Installer', 'Financing Available', 'Pet-Proof Wood Floors',
    '25-Year Wear Warranty', 'Book Your Estimate Online',
  ],
  description: [
    'Book a free in-home estimate this week and see samples in your own light.',
    'Certified installers, transparent pricing, and a finish warranty that lasts.',
    'From refinishing to full installs, one local crew handles it start to finish.',
    'Trusted by 400+ Austin homeowners with a 4.9-star Google rating.',
  ],
};

// ─── Shared bits ────────────────────────────────────────────────────────────

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <Text variant="secondary" color="var(--dark-90)" style={{ display: 'block', marginBottom: 8 }}>{label}</Text>
      {children}
    </label>
  );
}

function TrashButton({ onPress, title = 'Remove' }: { onPress: () => void; title?: string }) {
  return <IconButton size="sm" variant="ghost" icon={Trash2} title={title} onPress={onPress} />;
}

function EditToggle({ editing, onPress }: { editing: boolean; onPress: () => void }) {
  return (
    <Button size="sm" variant={editing ? 'primary' : 'secondary'} frontIcon={editing ? Check2 : Edit3} onPress={onPress}>
      {editing ? 'Done' : 'Edit'}
    </Button>
  );
}

/** A textarea that grows to wrap its content instead of scrolling. */
function AutoTextArea({ value, onChange, placeholder, style }: { value: string; onChange: (v: string) => void; placeholder?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = (el: HTMLTextAreaElement | null) => { if (!el) return; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; };
  useEffect(() => { fit(ref.current); }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => { onChange(e.target.value); fit(e.target); }}
      style={{
        width: '100%', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '10px 12px',
        fontFamily: F, fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', lineHeight: 1.5,
        resize: 'none', outline: 'none', boxSizing: 'border-box', background: 'var(--light-100)', overflow: 'hidden',
        ...style,
      }}
    />
  );
}

const EFFORT_OPTS = [
  { value: 'quick', label: 'Quick win' },
  { value: 'medium', label: 'Medium lift' },
  { value: 'project', label: 'Bigger project' },
];

/** Up/down vote, matching the client's suggested-step controls. */
function VoteButtons() {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
      <IconButton size="sm" variant="ghost" icon={ThumbUp} title="I like this" active={vote === 'up'} onPress={() => setVote((v) => (v === 'up' ? null : 'up'))} />
      <IconButton size="sm" variant="ghost" icon={ThumbDown} title="Not for us" active={vote === 'down'} onPress={() => setVote((v) => (v === 'down' ? null : 'down'))} />
    </div>
  );
}

/** Red banner shown on a section when the client requested a change on it. */
function ClientChange({ decisionKey }: { decisionKey: string }) {
  const { decisions } = useWizard();
  const d = decisions[decisionKey];
  if (d?.status !== 'changes' || !d.note) return null;
  return (
    <div style={{ margin: '0 0 18px', padding: '12px 14px', background: 'rgba(188,1,11,0.06)', border: '1px solid rgba(188,1,11,0.22)', borderRadius: 10 }}>
      <Text variant="metadata" color="var(--red-90)" style={{ display: 'block', fontWeight: 500, marginBottom: 4, letterSpacing: '0.24px' }}>Client requested a change</Text>
      <Text color="var(--dark-80)" style={{ display: 'block', fontSize: 14, lineHeight: 1.5 }}>{d.note}</Text>
    </div>
  );
}

function useFlagged(decisionKey?: string) {
  const { decisions } = useWizard();
  return !!decisionKey && decisions[decisionKey]?.status === 'changes';
}

/** Compact "client requested a change" note, given the note text directly. */
function ChangeNote({ note }: { note?: string }) {
  if (!note) return null;
  return (
    <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(188,1,11,0.06)', border: '1px solid rgba(188,1,11,0.22)', borderRadius: 8 }}>
      <Text variant="metadata" color="var(--red-90)" style={{ display: 'block', fontWeight: 500, marginBottom: 4, letterSpacing: '0.24px' }}>Client requested a change</Text>
      <Text color="var(--dark-80)" style={{ display: 'block', fontSize: 14, lineHeight: 1.5 }}>{note}</Text>
    </div>
  );
}

/** Section header: title/subtitle on the left, Edit toggle on the right. */
function SectionHead({ title, subtitle, editing, onToggle, left }: { title: string; subtitle?: string; editing: boolean; onToggle: () => void; left?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: subtitle ? 'flex-start' : 'center', gap: 12, marginBottom: 16 }}>
      {left}
      <div style={{ minWidth: 0 }}>
        <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
        {subtitle && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>{subtitle}</Text>}
      </div>
      <span style={{ flex: 1 }} />
      <EditToggle editing={editing} onPress={onToggle} />
    </div>
  );
}

/** Add / edit / remove list of single-line or multiline text values. */
function EditableRows({ items, setItems, placeholder, multiline, addLabel = 'Add' }: {
  items: string[]; setItems: (v: string[]) => void; placeholder?: string; multiline?: boolean; addLabel?: string;
}) {
  const set = (i: number, v: string) => setItems(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => setItems(items.filter((_, j) => j !== i));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {multiline ? (
            <AutoTextArea value={v} onChange={(val) => set(i, val)} placeholder={placeholder} />
          ) : (
            <div style={{ flex: 1 }}><TextField fullWidth size="md" value={v} placeholder={placeholder} onChange={(val) => set(i, val)} /></div>
          )}
          <TrashButton onPress={() => remove(i)} />
        </div>
      ))}
      <div><Button size="sm" variant="secondary" frontIcon={Plus} onPress={() => setItems([...items, ''])}>{addLabel}</Button></div>
    </div>
  );
}

// ─── Scorecard ────────────────────────────────────────────────────────────────

export function AmScorecard({ generated }: { generated: boolean }) {
  return generated ? <ScorecardReview /> : <ScorecardIntake />;
}

interface NetworkDef { value: string; label: string; icon: ComponentType<{ size?: number; color?: string }> }
const NETWORKS: NetworkDef[] = [
  { value: 'gbp', label: 'Google Business', icon: Map02 },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedIn },
  { value: 'yelp', label: 'Yelp', icon: Star },
  { value: 'tiktok', label: 'TikTok', icon: TikTok },
  { value: 'other', label: 'Other', icon: Globe },
];
const NETWORK_OPTS = NETWORKS.map((n) => ({ value: n.value, label: n.label }));
const networkIcon = (v: string) => NETWORKS.find((n) => n.value === v)?.icon ?? Globe;

function ScorecardIntake() {
  const [profiles, setProfiles] = useState<{ network: string; value: string }[]>([
    { network: 'gbp', value: 'Grain Design Flooring, Austin' },
    { network: 'facebook', value: 'facebook.com/graindesignflooring' },
    { network: 'instagram', value: '@graindesignflooring' },
    { network: 'linkedin', value: '' },
    { network: 'yelp', value: '' },
    { network: 'tiktok', value: '' },
  ]);
  const [competitors, setCompetitors] = useState<{ name: string; link: string }[]>([
    { name: "Buddy's Flooring America", link: 'buddysflooring.com' },
    { name: 'All About Floors', link: 'allaboutfloorsaustin.com' },
    { name: 'Lumber Liquidators', link: 'lumberliquidators.com' },
    { name: 'Schmidt Flooring', link: 'schmidtflooring.com' },
  ]);
  const setProfile = (i: number, patch: Partial<{ network: string; value: string }>) => setProfiles((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setComp = (i: number, key: 'name' | 'link', v: string) => setCompetitors((p) => p.map((x, j) => (j === i ? { ...x, [key]: v } : x)));

  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro title="Set up the scorecard" body="Add the client's details, their profiles, and the local competitors to score against, then generate the competitive scorecard." maxWidth={PAGE} />
      <div style={{ maxWidth: PAGE, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <section>
          <Heading level={3} style={{ margin: '0 0 12px' }}>Client details</Heading>
          <div style={CARD}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Labeled label="Client name"><TextField fullWidth size="md" defaultValue="Grain Design Flooring" /></Labeled>
              <Labeled label="Website"><TextField fullWidth size="md" defaultValue="graindesignflooring.com" /></Labeled>
              <Labeled label="Location"><TextField fullWidth size="md" defaultValue="Austin, TX" /></Labeled>
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Heading level={3} style={{ margin: 0 }}>Social &amp; listing profiles</Heading>
            <Text variant="metadata" color="var(--dark-40)">{profiles.length} connected</Text>
          </div>
          <div style={CARD}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profiles.map((p, i) => {
                const Icon = networkIcon(p.network);
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Icon size={18} color="var(--dark-60)" />
                    <Select size="md" value={p.network} options={NETWORK_OPTS} onChange={(v) => setProfile(i, { network: v })} style={{ width: 168, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}><TextField fullWidth size="md" value={p.value} placeholder="Profile URL or handle" onChange={(v) => setProfile(i, { value: v })} /></div>
                    <TrashButton onPress={() => setProfiles((prev) => prev.filter((_, j) => j !== i))} />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <Button size="sm" variant="secondary" frontIcon={Plus} onPress={() => setProfiles((prev) => [...prev, { network: 'other', value: '' }])}>Add profile</Button>
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Heading level={3} style={{ margin: 0 }}>Local competitors</Heading>
            <Text variant="metadata" color="var(--dark-40)">{competitors.length} to score against</Text>
          </div>
          <div style={CARD}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {competitors.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><TextField fullWidth size="md" value={c.name} placeholder="Competitor name" onChange={(v) => setComp(i, 'name', v)} /></div>
                  <div style={{ flex: 1 }}><TextField fullWidth size="md" value={c.link} placeholder="Website" onChange={(v) => setComp(i, 'link', v)} /></div>
                  <TrashButton onPress={() => setCompetitors((prev) => prev.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <Button size="sm" variant="secondary" frontIcon={Plus} onPress={() => setCompetitors((prev) => [...prev, { name: '', link: '' }])}>Add competitor</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** The generated scorecard as the client sees it. The header Edit toggles the
 *  summary; each section carries its own Edit. */
function ScorecardReview() {
  const [summaryEditing, setSummaryEditing] = useState(false);
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Heading level={2} style={{ margin: 0 }}>Review &amp; edit the scorecard</Heading>
        <EditToggle editing={summaryEditing} onPress={() => setSummaryEditing((o) => !o)} />
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <SummaryCard editing={summaryEditing} />
        <ComparisonTable />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SCORECARD_SECTIONS.map((s) => (
            <ScorecardSection key={s.id} section={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ editing }: { editing: boolean }) {
  const [summary, setSummary] = useState(SCORECARD_SUMMARY);
  const [tint, setTint] = useState('var(--light-100)');
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 28, background: tint, display: 'flex', alignItems: 'center', gap: 32 }}>
      <ScoreDonut score={OVERALL_SCORE} onColor={(c) => setTint(`color-mix(in srgb, ${c} 10%, var(--light-100))`)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing
          ? <AutoTextArea value={summary} onChange={setSummary} style={{ fontSize: 15 }} />
          : <Text style={{ display: 'block', fontSize: 17, color: 'var(--dark-80)', lineHeight: 1.7 }}>{summary}</Text>}
      </div>
    </div>
  );
}

function ScorecardSection({ section }: { section: (typeof SCORECARD_SECTIONS)[number] }) {
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState(String(section.score));
  const [strengths, setStrengths] = useState<string[]>(section.strengths);
  const [weaknesses, setWeaknesses] = useState<string[]>(section.weaknesses);
  const [steps, setSteps] = useState(section.nextSteps.map((s) => ({ label: s.label, effort: s.effort as Effort })));
  const n = Math.max(0, Math.min(100, parseInt(score || '0', 10) || 0));
  const decisionKey = `sc:${section.id}`;
  const flagged = useFlagged(decisionKey);
  const setStep = (i: number, patch: Partial<{ label: string; effort: Effort }>) => setSteps((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div>
      <SectionHead
        title={section.title}
        editing={editing}
        onToggle={() => setEditing((o) => !o)}
        left={<ScoreDonut score={n} size={44} />}
      />
      <div style={{ ...CARD, padding: 32, borderColor: flagged ? 'rgba(188,1,11,0.28)' : 'var(--dark-8)' }}>
        <ClientChange decisionKey={decisionKey} />

        {editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ width: 72 }}><TextField value={score} onChange={setScore} fullWidth size="md" style={{ textAlign: 'center', fontWeight: 500, color: scoreColor(n) }} /></div>
            <Text variant="metadata" color="var(--dark-40)">/ 100 score</Text>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 26 }}>
          {editing ? (
            <>
              <div>
                <Text variant="secondary" color="var(--status-approved)" style={{ display: 'block', fontWeight: 500, marginBottom: 10 }}>Strengths</Text>
                <EditableRows items={strengths} setItems={setStrengths} multiline placeholder="What's working" addLabel="Add strength" />
              </div>
              <div>
                <Text variant="secondary" color="var(--red-70)" style={{ display: 'block', fontWeight: 500, marginBottom: 10 }}>Weaknesses</Text>
                <EditableRows items={weaknesses} setItems={setWeaknesses} multiline placeholder="What's holding them back" addLabel="Add weakness" />
              </div>
            </>
          ) : (
            <>
              <ReadOnlyBullets label="Strengths" color="var(--status-approved)" icon="✓" items={strengths} />
              <ReadOnlyBullets label="Weaknesses" color="var(--red-70)" icon="!" items={weaknesses} />
            </>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 18 }}>
          <Heading level={5} style={{ margin: '0 0 16px' }}>Suggested next steps</Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: editing ? 14 : 20 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: editing ? 'flex-start' : 'center', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: editing ? 8 : 0 }}>{i + 1}</span>
                {editing ? (
                  <>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <AutoTextArea value={step.label} onChange={(v) => setStep(i, { label: v })} placeholder="Suggested step" />
                      <Select size="sm" value={step.effort} options={EFFORT_OPTS} onChange={(v) => setStep(i, { effort: v as Effort })} style={{ width: 176 }} />
                    </div>
                    <TrashButton onPress={() => setSteps((p) => p.filter((_, j) => j !== i))} />
                  </>
                ) : (
                  <>
                    <Text style={{ flex: 1, fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{step.label}</Text>
                    <EffortPill effort={step.effort} />
                    <VoteButtons />
                  </>
                )}
              </div>
            ))}
            {editing && (
              <div style={{ paddingLeft: 34 }}>
                <Button size="sm" variant="secondary" frontIcon={Plus} onPress={() => setSteps((p) => [...p, { label: '', effort: 'medium' }])}>Add step</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Website ──────────────────────────────────────────────────────────────────

export function AmWebsite({ previewing }: { previewing: boolean }) {
  const [headline, setHeadline] = useState(WEBSITE_HEADLINE);
  const [subhead, setSubhead] = useState(WEBSITE_SUBHEAD);
  const [url, setUrl] = useState(WEBSITE_URL);
  const [shots, setShots] = useState<string[]>([websiteHero]);
  const fileRef = useRef<HTMLInputElement>(null);
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setShots((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  if (previewing) return <WebsitePreview headline={headline} subhead={subhead} url={url} shots={shots} />;

  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro title="Website" body="Set the client's new site and the preview screenshots they'll see, then preview it before continuing." maxWidth={PAGE} />
      <div style={{ maxWidth: PAGE, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={CARD}>
          <ClientChange decisionKey="step:website" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Labeled label="Headline"><TextField fullWidth size="md" value={headline} onChange={setHeadline} /></Labeled>
            <Labeled label="Subheadline"><AutoTextArea value={subhead} onChange={setSubhead} /></Labeled>
            <Labeled label="Website link"><TextField fullWidth size="md" value={url} onChange={setUrl} placeholder="https://…" /></Labeled>
          </div>
        </div>

        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Heading level={4} style={{ margin: 0 }}>Preview screenshots</Heading>
            <Button size="sm" variant="secondary" frontIcon={Upload} onPress={() => fileRef.current?.click()}>Upload screenshots</Button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {shots.map((src, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-8)', aspectRatio: '4 / 3', background: 'var(--dark-4)' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => setShots((prev) => prev.filter((_, j) => j !== i))} title="Remove" style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} color="var(--light-100)" />
                </button>
              </div>
            ))}
            {shots.length === 0 && <Text variant="secondary" color="var(--dark-40)">No screenshots yet. Upload the previews the client should see.</Text>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** How the website step looks to the client. The "Client preview" caption lives
 *  in the footer (see GrowthReview), so the body is just the hero + mock. */
function WebsitePreview({ headline, subhead, url, shots }: { headline: string; subhead: string; url: string; shots: string[] }) {
  const hero = shots[0];
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '64px 0 36px' }}>
        <Heading level={1} style={{ margin: 0 }}>{headline}</Heading>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '14px 0 28px', fontSize: 17, lineHeight: 1.65 }}>{subhead}</Text>
        <Button size="xl" onPress={() => window.open(url, '_blank', 'noopener,noreferrer')}>Visit the new website</Button>
      </div>
      {hero && (
        <div style={{ maxWidth: 940, margin: '0 auto', borderRadius: '14px 14px 0 0', border: '1px solid var(--dark-8)', borderBottom: 'none', overflow: 'hidden', background: 'var(--light-100)', boxShadow: '0 -8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--dark-8)', background: 'var(--dark-4)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-15)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-15)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--dark-15)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}><Text style={{ fontSize: 12.5, color: 'var(--dark-60)', fontFamily: F }}>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</Text></div>
            <span style={{ width: 27 }} />
          </div>
          <img src={hero} alt="Website preview" style={{ width: '100%', display: 'block' }} />
        </div>
      )}
    </div>
  );
}

// ─── Paid Ads (RSA assets) ──────────────────────────────────────────────────────

/** One read-only asset row in the client preview, with the client's signals. */
function AssetPreviewRow({ id, text, first, mono }: { id: string; text: string; first: boolean; mono?: boolean }) {
  const { reviewed } = useWizard();
  const vote = reviewed ? PAID_CLIENT_VOTES[id] : undefined;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderTop: first ? 'none' : '1px solid var(--dark-8)', opacity: vote === 'down' ? 0.6 : 1 }}>
      <Text style={{ flex: 1, minWidth: 0, fontSize: mono ? 14 : 16, color: mono ? 'var(--dark-70)' : 'var(--dark-90)', fontFamily: F, textDecoration: vote === 'down' ? 'line-through' : 'none' }}>{text}</Text>
      <AssetSignals id={id} />
    </div>
  );
}

/** The client's signals on an asset (edited / liked / flagged), reviewed state. */
function AssetSignals({ id }: { id: string }) {
  const { reviewed } = useWizard();
  if (!reviewed) return null;
  const vote = PAID_CLIENT_VOTES[id];
  const edited = !!PAID_CLIENT_EDITS[id];
  if (!vote && !edited) return null;
  return (
    <div style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
      {edited && <Pill size="sm">Client edited</Pill>}
      {vote === 'up' && <StatusPill tone="success" size="sm">Client liked</StatusPill>}
      {vote === 'down' && <StatusPill tone="danger" size="sm">Client flagged</StatusPill>}
    </div>
  );
}

/** One editable + previewable Paid section (headlines / descriptions / paths).
 *  In edit mode each row keeps the client's like/flag pill and, for headlines +
 *  descriptions, a per-row Regenerate that cycles an alternative. */
function PaidTextSection({ title, hint, cap, kind, assets, setAssets, placeholder, addLabel, multiline, mono }: {
  title: string; hint?: string; cap?: string; kind: 'headline' | 'description' | 'path';
  assets: { id: string; text: string }[]; setAssets: (v: { id: string; text: string }[]) => void;
  placeholder: string; addLabel: string; multiline?: boolean; mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [regenIx, setRegenIx] = useState(0);
  const pool = REGEN_POOL[kind] ?? [];
  const set = (i: number, text: string) => setAssets(assets.map((a, j) => (j === i ? { ...a, text } : a)));
  const remove = (i: number) => setAssets(assets.filter((_, j) => j !== i));
  const regen = (i: number) => { if (!pool.length) return; set(i, pool[regenIx % pool.length]); setRegenIx((n) => n + 1); };
  const add = () => setAssets([...assets, { id: `new-${assets.length}`, text: '' }]);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: hint ? 4 : 12 }}>
        <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {cap && <Text variant="metadata" color="var(--dark-40)">{cap}</Text>}
          <EditToggle editing={editing} onPress={() => setEditing((o) => !o)} />
        </div>
      </div>
      {hint && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12, lineHeight: 1.5 }}>{hint}</Text>}
      <div style={{ ...CARD, padding: editing ? '20px 22px' : '2px 22px' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assets.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: multiline ? 'flex-start' : 'center' }}>
                <div style={{ flex: 1 }}>
                  {multiline
                    ? <AutoTextArea value={a.text} onChange={(v) => set(i, v)} placeholder={placeholder} />
                    : <TextField fullWidth size="md" value={a.text} placeholder={placeholder} onChange={(v) => set(i, v)} />}
                </div>
                <div style={{ marginTop: multiline ? 9 : 0 }}><AssetSignals id={a.id} /></div>
                {pool.length > 0 && <IconButton size="sm" variant="ghost" icon={ArrowRefresh} title="Regenerate" onPress={() => regen(i)} />}
                <TrashButton onPress={() => remove(i)} />
              </div>
            ))}
            <div><Button size="sm" variant="secondary" frontIcon={Plus} onPress={add}>{addLabel}</Button></div>
          </div>
        ) : (
          assets.map((a, i) => <AssetPreviewRow key={a.id} id={a.id} text={a.text} first={i === 0} mono={mono} />)
        )}
      </div>
    </section>
  );
}

/** Sitelinks: the extra links under an ad. Read view shows the blue title +
 *  its supporting line; edit reveals title + description fields per row. */
function PaidSitelinksSection({ sitelinks, setSitelinks }: {
  sitelinks: Sitelink[];
  setSitelinks: (v: Sitelink[]) => void;
}) {
  const { decisions } = useWizard();
  const [editing, setEditing] = useState(false);
  const set = (i: number, patch: Partial<Sitelink>) => setSitelinks(sitelinks.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => setSitelinks(sitelinks.filter((_, j) => j !== i));
  const add = () => setSitelinks([...sitelinks, { id: `sl-${sitelinks.length}`, title: '', desc: '', url: '' }]);
  const change = decisions['paid:sitelinks']?.status === 'changes' ? decisions['paid:sitelinks'] : undefined;
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <Heading level={3} style={{ margin: 0 }}>Sitelinks</Heading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {change && <StatusPill tone="danger" size="sm">Change requested</StatusPill>}
          <Text variant="metadata" color="var(--dark-40)">{sitelinks.length}</Text>
          <EditToggle editing={editing} onPress={() => setEditing((o) => !o)} />
        </div>
      </div>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12, lineHeight: 1.5 }}>Extra links shown under the ad that jump people to key pages.</Text>
      <div style={{ ...CARD, padding: 22, borderColor: change ? 'rgba(188,1,11,0.28)' : 'var(--dark-8)' }}>
        <ChangeNote note={change?.note} />
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: change ? 8 : 0 }}>
            {sitelinks.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingTop: i === 0 ? 0 : 16, borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <TextField fullWidth size="md" value={s.title} placeholder="Sitelink text" onChange={(v) => set(i, { title: v })} />
                  <TextField fullWidth size="md" value={s.desc} placeholder="Description line" onChange={(v) => set(i, { desc: v })} />
                  <TextField fullWidth size="md" value={s.url} placeholder="Link URL" onChange={(v) => set(i, { url: v })} />
                </div>
                <TrashButton onPress={() => remove(i)} />
              </div>
            ))}
            <div><Button size="sm" variant="secondary" frontIcon={Plus} onPress={add}>Add sitelink</Button></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: change ? 8 : 0 }}>
            {sitelinks.map((s) => (
              <div key={s.id} style={{ border: '1px solid var(--dark-8)', borderRadius: 10, padding: '16px 18px' }}>
                <Text style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#1a0dab', fontFamily: F }}>{s.title}</Text>
                <Text style={{ display: 'block', marginTop: 4, fontSize: 13.5, color: 'var(--dark-60)', lineHeight: 1.45 }}>{s.desc}</Text>
                {s.url && <Text style={{ display: 'block', marginTop: 8, fontSize: 12.5, color: 'var(--status-approved)', fontFamily: F }}>{s.url}</Text>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AmPaidAds() {
  const { reviewed } = useWizard();
  // In the reviewed state the pool reflects the client's edits.
  const withEdits = (list: { id: string; text: string }[]) => list.map((a) => (reviewed && PAID_CLIENT_EDITS[a.id] ? { ...a, text: PAID_CLIENT_EDITS[a.id] } : a));
  const [headlines, setHeadlines] = useState(() => withEdits(SEARCH_ADS.headlines.map((h) => ({ id: h.id, text: h.text }))));
  const [descriptions, setDescriptions] = useState(() => withEdits(SEARCH_ADS.descriptions.map((d) => ({ id: d.id, text: d.text }))));
  const [sitelinks, setSitelinks] = useState<Sitelink[]>(SITELINKS);
  const [images, setImages] = useState(SEARCH_ADS.images.map((im) => ({ id: im.id, label: im.label, img: im.img })));
  const [imagesEditing, setImagesEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files.map((f, k) => ({ id: `new-${prev.length + k}`, label: f.name.replace(/\.[^.]+$/, ''), img: URL.createObjectURL(f) }))]);
    e.target.value = '';
  };

  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro
        title="Your Google Search ads"
        body={reviewed ? 'The client liked and flagged assets in the pool below. Edit any section to act on their feedback.' : 'This is the asset pool Google mixes and matches. Edit any section to add, change, or remove assets.'}
        maxWidth={PAGE}
      />
      <div style={{ maxWidth: PAGE, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PaidTextSection title="Headlines" hint="Up to 15. Google shows up to 3 at a time." cap={`${headlines.length} / 15`} kind="headline" assets={headlines} setAssets={setHeadlines} placeholder="Headline (max 30 chars)" addLabel="Add headline" />
        <PaidTextSection title="Descriptions" hint="Up to 4. Google shows up to 2 at a time." cap={`${descriptions.length} / 4`} kind="description" assets={descriptions} setAssets={setDescriptions} placeholder="Description (max 90 chars)" addLabel="Add description" multiline />

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <Heading level={3} style={{ margin: 0 }}>Images</Heading>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {imagesEditing && (
                <>
                  <Button size="sm" variant="secondary" frontIcon={Upload} onPress={() => fileRef.current?.click()}>Upload</Button>
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
                </>
              )}
              <EditToggle editing={imagesEditing} onPress={() => setImagesEditing((o) => !o)} />
            </div>
          </div>
          <div style={{ ...CARD }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
              {images.map((im, i) => {
                const vote = reviewed ? PAID_CLIENT_VOTES[im.id] : undefined;
                return (
                  <div key={im.id} style={{ opacity: vote === 'down' ? 0.6 : 1 }}>
                    <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-8)', background: 'var(--dark-4)' }}>
                      <img src={im.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {imagesEditing && (
                        <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} title="Remove" style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'var(--dark-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} color="var(--light-100)" />
                        </button>
                      )}
                    </div>
                    {imagesEditing ? (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <TextField fullWidth size="sm" value={im.label} onChange={(v) => setImages((prev) => prev.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
                        <AssetSignals id={im.id} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <Text style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.35 }}>{im.label}</Text>
                        <AssetSignals id={im.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <PaidSitelinksSection sitelinks={sitelinks} setSitelinks={setSitelinks} />
      </div>
    </div>
  );
}

// ─── SEO / AEO articles ─────────────────────────────────────────────────────────

export function AmArticles() {
  const [items, setItems] = useState<CreativeItem[]>(ARTICLES);
  const fileRef = useRef<HTMLInputElement>(null);
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setItems((prev) => [
      ...prev,
      ...files.map((f, k) => ({
        id: `up-${prev.length + k}`,
        type: 'SEO Article' as const,
        title: f.name.replace(/\.[^.]+$/, ''),
        img: URL.createObjectURL(f),
        caption: '',
        query: '',
      })),
    ]);
    e.target.value = '';
  };
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro
        title="Your SEO &amp; AEO articles"
        body="This is what the client sees. Open any piece to read, edit, and approve it, remove one on hover, or upload your own."
        maxWidth={PAGE_W}
        action={
          <>
            <Button size="md" variant="secondary" frontIcon={Upload} onPress={() => fileRef.current?.click()}>Upload article</Button>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple hidden onChange={onFiles} />
          </>
        }
      />
      <div style={{ maxWidth: PAGE_W, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', alignItems: 'flex-start' }}>
        {items.map((item, i) => (
          <CreativeCard key={item.id} item={item} items={items} index={i} onRemove={() => remove(item.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

export function AmStrategy() {
  return (
    <div style={{ padding: '0 32px 48px' }}>
      <StepIntro title="Your growth strategy" body="This is what the client sees. Edit any pillar: its summary, the line items, and the monthly price." maxWidth={820} />
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {STRATEGY_PILLARS.map((p, i) => (
          <section key={p.id} style={{ paddingTop: i === 0 ? 0 : 44, paddingBottom: 44, borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
            <PillarSection pillar={p} />
          </section>
        ))}
        <div style={{ paddingTop: 24, borderTop: '2px solid var(--dark-8)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Heading level={4} style={{ margin: 0 }}>Total</Heading>
          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 26, fontWeight: 600, color: 'var(--dark-90)', letterSpacing: '0.2px' }}>{STRATEGY_TOTAL}</Text>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2 }}>{STRATEGY_TOTAL_NOTE}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ top = 9 }: { top?: number }) {
  return <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: top }} />;
}

function PillarSection({ pillar }: { pillar: (typeof STRATEGY_PILLARS)[number] }) {
  const [editing, setEditing] = useState(false);
  const [intro, setIntro] = useState(pillar.intro);
  const [items, setItems] = useState(pillar.items.map((i) => ({ title: i.title, body: i.body, spend: i.spend })));
  const [price, setPrice] = useState(pillar.price ?? '');
  const [priceNote, setPriceNote] = useState(pillar.priceNote ?? '');
  const decisionKey = `strategy:${pillar.id}`;
  const flagged = useFlagged(decisionKey);
  const setItem = (i: number, key: 'title' | 'body', v: string) => setItems((p) => p.map((x, j) => (j === i ? { ...x, [key]: v } : x)));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Heading level={3} style={{ margin: 0 }}>{pillar.title}</Heading>
          {!editing && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>{intro}</Text>}
        </div>
        <EditToggle editing={editing} onPress={() => setEditing((o) => !o)} />
      </div>

      <div style={{ ...CARD, borderColor: flagged ? 'rgba(188,1,11,0.28)' : 'var(--dark-8)' }}>
        <ClientChange decisionKey={decisionKey} />

        {editing && (
          <div style={{ marginBottom: 18 }}>
            <Labeled label="Summary"><AutoTextArea value={intro} onChange={setIntro} /></Labeled>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: editing ? 16 : 18 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Bullet top={editing ? 15 : 9} />
              {editing ? (
                <>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <TextField fullWidth size="md" value={it.title} onChange={(v) => setItem(i, 'title', v)} placeholder="Line item" />
                    <AutoTextArea value={it.body} onChange={(v) => setItem(i, 'body', v)} placeholder="Detail" />
                  </div>
                  <TrashButton onPress={() => setItems((p) => p.filter((_, j) => j !== i))} />
                </>
              ) : (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 2 }}>
                    <Text style={{ fontWeight: 500 }}>{it.title}</Text>
                    {it.spend && <Pill size="sm">{it.spend}</Pill>}
                  </div>
                  <Text style={{ display: 'block', fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.6 }}>{it.body}</Text>
                </div>
              )}
            </div>
          ))}
          {editing && (
            <div style={{ paddingLeft: 18 }}>
              <Button size="sm" variant="secondary" frontIcon={Plus} onPress={() => setItems((p) => [...p, { title: '', body: '', spend: undefined }])}>Add line item</Button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--dark-8)' }}>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div style={{ width: 160 }}><Labeled label="Monthly price"><TextField fullWidth size="md" value={price} onChange={setPrice} placeholder="$0/mo" /></Labeled></div>
              <div style={{ flex: 1 }}><Labeled label="Price note"><TextField fullWidth size="md" value={priceNote} onChange={setPriceNote} placeholder="e.g. includes ad spend" /></Labeled></div>
            </div>
          ) : price ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <Text variant="secondary" color="var(--dark-60)">Monthly price</Text>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '0.2px' }}>{price}</Text>
                {priceNote && <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 2 }}>{priceNote}</Text>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
