import { useState, useEffect } from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { Card, Select, StatusPill, Pill } from '@/staging';
import LinkExternal from '@/icons/20/LinkExternal';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import ChevronUp from '@/icons/20/ChevronUp';
import ChevronDown from '@/icons/20/ChevronDown';
import HelpCircleContained from '@/icons/24/HelpCircleContained';
import type { Account } from './lib/types';
import * as S from './lib/strategy';
import { Field, TextInput, TextArea, RemoveX, AddLink, SectionHeading, Tooltip } from './ui';
import { useWorkspaceChrome, type Go } from './nav';

/** Translucent tint of a token color. `var(--x) + '18'` is invalid CSS, so use
 *  color-mix to fade a design-system token to a soft background fill. */
const tint = (color: string, pct = 12) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScorecardSection {
  id: string;
  title: string;
  score: number; // 0–100, see METHODOLOGY below
  strengths: string[];
  weaknesses: string[];
  nextSteps: { label: string; effort: 'quick' | 'medium' | 'project' }[];
}

interface LocalCompetitor {
  id: string;
  name: string;
  website: string;
  gbp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  source: 'gbp' | 'manual';
  note: string;
  scores: { 'Paid Ads': number; 'Organic': number; 'Website': number; 'Reputation': number };
}

interface ScorecardData {
  sections: ScorecardSection[];
  competitors: LocalCompetitor[];
  ourName: string;
  ourScores: { 'Paid Ads': number; 'Organic': number; 'Website': number; 'Reputation': number };
  overallRank: number;
  summary: string;
}

// ─── Score methodology ───────────────────────────────────────────────────────
//
// Each section is scored 0–100 from publicly visible signals:
//
//   Paid Ads (0–100)
//     • Active Google Search ads detected:     +35 pts
//     • Active Meta/social ads in last 90 days: +35 pts
//     • Conversion tracking configured:         +20 pts
//     • Branded keyword defense:                +10 pts
//
//   Organic Presence (0–100)
//     • Posting ≥ 8×/month across channels:    +35 pts (scaled by cadence)
//     • GBP: photos + posts updated ≤ 30 days: +30 pts
//     • Active on 3+ platforms:                +20 pts
//     • Has video / short-form content:         +15 pts
//
//   Website & Conversion (0–100)
//     • Mobile LCP < 2.5 s (Core Web Vitals):  +30 pts
//     • Strong primary CTA ("Free estimate"):   +25 pts
//     • Lead form ≤ 4 fields:                   +20 pts
//     • Trust signals (reviews, badges):        +25 pts
//
//   Reputation (0–100)
//     • Avg rating × 20 (max 5★ = 100):        +40 pts
//     • Review count tier (≥50 = full):         +30 pts (scaled)
//     • ≥2 new reviews/month:                   +20 pts
//     • Owner response rate ≥ 80%:              +10 pts
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data generation ────────────────────────────────────────────────────────

function buildScorecardData(account: Account): ScorecardData {
  const city = account.location.split(',')[0];
  const comp = S.competitors(account);

  const sections: ScorecardSection[] = [
    {
      id: 'paid',
      title: 'Paid Ads',
      score: 12,
      strengths: [
        'Conversion tracking is partially installed, analytics are live',
        'Website has a phone number in the header, so paid traffic has a clear exit',
      ],
      weaknesses: [
        `No active Google Search campaigns. Competitors in ${city} are bidding on high-intent terms right now`,
        'Zero Meta ad spend in the last 90 days while competitors run always-on local reels',
        'No branded keyword protection. A competitor may be intercepting your name searches',
      ],
      nextSteps: [
        { label: 'Launch a "free estimate" Google Search campaign targeting local keywords', effort: 'quick' },
        { label: 'Set up a retargeting audience from existing website traffic', effort: 'quick' },
        { label: 'Configure conversion events (form submit, click-to-call) in GA4', effort: 'medium' },
      ],
    },
    {
      id: 'organic',
      title: 'Organic Presence',
      score: 34,
      strengths: [
        'Business is established on both Facebook and Instagram',
        `Google Business Profile is claimed and shows up in ${city} map results`,
        'Past posts with before/after content drove strong organic reach',
      ],
      weaknesses: [
        'Posting cadence has stalled. Last social post was 30+ days ago',
        'Google Business Profile is missing recent photos and has no posts in months',
        'Organic reach is limited by single-channel distribution, no TikTok or YouTube Shorts',
        'No local SEO content targeting city + service keywords',
      ],
      nextSteps: [
        { label: 'Post 2× per week minimum. Before/after photos and crew shots perform best in this category', effort: 'quick' },
        { label: 'Add 5+ fresh photos to Google Business Profile and publish a monthly GBP post', effort: 'quick' },
        { label: 'Build a "best [service] in [city]" landing page targeting local search intent', effort: 'project' },
      ],
    },
    {
      id: 'website',
      title: 'Website & Conversion',
      score: 58,
      strengths: [
        'Click-to-call is visible on every page, critical for a services business',
        'Reviews, licensing badges, and "insured" signals are present above the fold',
        'The site is mobile-responsive and loads correctly on small screens',
      ],
      weaknesses: [
        '"Contact us" is the primary CTA. "Get a free estimate" converts 30–60% better',
        'Mobile LCP is slow, around 30% of visitors likely bounce before the page loads',
        'Lead form has too many fields; trimming to name, phone, ZIP, and project type reduces drop-off',
      ],
      nextSteps: [
        { label: 'Swap the hero CTA copy from "Contact us" to "Get a free estimate"', effort: 'quick' },
        { label: 'Compress hero images and enable lazy-load on below-fold assets to fix LCP', effort: 'medium' },
        { label: 'Trim the lead form to 4 fields and A/B test a floating call button', effort: 'medium' },
      ],
    },
    {
      id: 'reputation',
      title: 'Reputation',
      score: 72,
      strengths: [
        '4.7★ average rating across Google, Yelp, and Facebook, the strongest asset in the market',
        'Owner is responding to most reviews, response rate lifts conversion ~11%',
        'Review quality is high; several mention specific crew members by name',
      ],
      weaknesses: [
        `Behind the top ${city} competitors on total review count, volume is a ranking signal`,
        'New review velocity has slowed, less than 2 new reviews/month recently',
        '3 unanswered negative reviews are visible on Google, each can deter 30 potential customers',
      ],
      nextSteps: [
        { label: 'Respond to the 3 unanswered Google reviews this week', effort: 'quick' },
        { label: 'Add a post-job review ask via text (SMS link) for every completed project', effort: 'medium' },
        { label: 'Set a goal of 5 new reviews/month and track it in your monthly report', effort: 'medium' },
      ],
    },
  ];

  const ourScores = { 'Paid Ads': 12, 'Organic': 34, 'Website': 58, 'Reputation': 72 };

  const competitors: LocalCompetitor[] = comp.slice(0, 3).map((c, i) => ({
    id: `c${i}`,
    name: c.name,
    website: '',
    gbp: '',
    source: 'gbp',
    note: c.note,
    scores: {
      'Paid Ads': [68, 55, 22][i],
      'Organic': [72, 45, 58][i],
      'Website': [65, 40, 35][i],
      'Reputation': [82, 60, 55][i],
    },
  }));

  const ourOverall = Math.round(Object.values(ourScores).reduce((a, b) => a + b, 0) / 4);
  const allScores = [ourOverall, ...competitors.map((c) => Math.round(Object.values(c.scores).reduce((a, b) => a + b, 0) / 4))].sort((a, b) => b - a);
  const rank = allScores.indexOf(ourOverall) + 1;
  const total = allScores.length;

  const topSection = [...sections].sort((a, b) => b.score - a.score)[0];
  const bottomSection = [...sections].sort((a, b) => a.score - b.score)[0];

  const summary = `${account.name} scores ${ourOverall}/100 overall, ranking #${rank} of ${total} businesses in ${city}. `
    + `The strongest area is ${topSection.title.toLowerCase()} (${topSection.score}/100): ${topSection.strengths[0].toLowerCase()}. `
    + `The biggest opportunity is ${bottomSection.title.toLowerCase()} (${bottomSection.score}/100): ${bottomSection.weaknesses[0].toLowerCase()}.`;

  return { sections, competitors, ourName: account.name, ourScores, overallRank: rank, summary };
}

// ─── Top-level component ─────────────────────────────────────────────────────

export function Scorecard({ account, sub, go }: { account: Account; sub: string; go: Go }) {
  if (sub === 'setup') return <SetupStep account={account} go={go} />;
  if (sub === 'competitors') return <CompetitorsStep account={account} go={go} />;
  return <ScorecardView account={account} go={go} />;
}

// ─── Step 1: Setup ───────────────────────────────────────────────────────────

interface Social { id: string; platform: string; handle: string }

const SOCIAL_PLATFORMS = ['Google Business Profile', 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X/Twitter', 'Pinterest', 'Nextdoor'];

/** Add/remove-any-number social-profile rows: a platform Select + handle field
 *  with a trash button per row, plus an "Add social profile" action. Shared by
 *  the customer setup step and each competitor's edit form so they're identical. */
function SocialProfiles({ socials, onChange }: { socials: Social[]; onChange: (next: Social[]) => void }) {
  const add = () => onChange([...socials, { id: `s${Date.now()}`, platform: 'Facebook', handle: '' }]);
  const remove = (id: string) => onChange(socials.filter((s) => s.id !== id));
  const update = (id: string, patch: Partial<Social>) => onChange(socials.map((s) => s.id === id ? { ...s, ...patch } : s));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {socials.map((s) => (
        <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 188, flexShrink: 0 }}>
            <Select
              value={s.platform}
              onChange={(v) => update(s.id, { platform: v })}
              options={SOCIAL_PLATFORMS.map((p) => ({ value: p, label: p }))}
              fullWidth
            />
          </div>
          <TextInput value={s.handle} onChange={(e) => update(s.id, { handle: e.target.value })} placeholder="@handle or profile URL" />
          <RemoveX onClick={() => remove(s.id)} />
        </div>
      ))}
      <AddLink label="Add Social Profile" onClick={add} />
    </div>
  );
}

function SetupStep({ account, go }: { account: Account; go: Go }) {
  const [website, setWebsite] = useState(account.brand.website ?? '');
  const [gbp, setGbp] = useState('');
  const [socials, setSocials] = useState<Social[]>([
    { id: 's1', platform: 'Facebook', handle: '' },
    { id: 's2', platform: 'Instagram', handle: '' },
  ]);

  const canContinue = website.trim().length > 0;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 28px' }}>Build the competitive scorecard</Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card>
          <SectionHeading title="Customer's online presence" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Website">
              <TextInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. grainflooring.com" />
            </Field>
            <Field label="Google Business Profile URL">
              <TextInput value={gbp} onChange={(e) => setGbp(e.target.value)} placeholder="maps.google.com/… or g.co/…" />
              <Text style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--dark-40)' }}>
                Used to find local competitors in the same service area.
              </Text>
            </Field>
          </div>
        </Card>

        <Card>
          <SectionHeading title="Social profiles" desc="Add any channels the customer is active on." />
          <SocialProfiles socials={socials} onChange={setSocials} />
        </Card>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="lg" onPress={() => go(`/${account.id}/am/scorecard/competitors`)} isDisabled={!canContinue}>
          Find Local Competitors →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Competitors ─────────────────────────────────────────────────────

interface EditableComp { id: string; name: string; website: string; socials: Social[]; note: string; source: 'gbp' | 'manual' }

/** Prefilled social rows for a competitor, Google Business Profile leads (it's
 *  the primary local-business signal), then the common channels. Handles are
 *  stubbed from the name; a blank name (new manual competitor) leaves them empty. */
const defaultCompetitorSocials = (name: string): Social[] => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return [
    { id: 's1', platform: 'Google Business Profile', handle: slug ? `g.co/${slug}` : '' },
    { id: 's2', platform: 'Facebook', handle: slug ? `facebook.com/${slug}` : '' },
    { id: 's3', platform: 'Instagram', handle: slug ? `@${slug}` : '' },
  ];
};

function CompetitorsStep({ account, go }: { account: Account; go: Go }) {
  const city = account.location.split(',')[0];
  const initial: EditableComp[] = S.competitors(account).map((c, i) => ({
    id: `c${i}`, name: c.name, website: '', socials: defaultCompetitorSocials(c.name), note: c.note, source: 'gbp',
  }));
  const [comps, setComps] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);

  const add = () => {
    const id = `c${Date.now()}`;
    setComps([...comps, { id, name: '', website: '', socials: defaultCompetitorSocials(''), note: '', source: 'manual' }]);
    setEditing(id);
  };
  const remove = (id: string) => setComps(comps.filter((c) => c.id !== id));
  const update = (id: string, patch: Partial<EditableComp>) => setComps(comps.map((c) => c.id === id ? { ...c, ...patch } : c));

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 8px' }}>Local competitors</Heading>
      <Text style={{ display: 'block', marginBottom: 28, fontSize: 16, color: 'var(--dark-60)', lineHeight: 1.6 }}>
        These were pulled from the GBP service area for {account.name} in {city}. Edit, delete, or add others, they'll be used in the comparison.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {comps.map((c) => {
          const isEditing = editing === c.id;
          return (
            <Card key={c.id} padding="none" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 8, background: 'var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--dark-60)' }}>
                  {c.name ? c.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Field label="Name">
                        <TextInput autoFocus value={c.name} placeholder="Competitor name" onChange={(e) => update(c.id, { name: e.target.value })} />
                      </Field>
                      <Field label="Website">
                        <TextInput value={c.website} placeholder="e.g. napprohard.com" onChange={(e) => update(c.id, { website: e.target.value })} />
                      </Field>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Text variant="secondary" color="var(--dark-80)">Social profiles</Text>
                        <SocialProfiles socials={c.socials} onChange={(next) => update(c.id, { socials: next })} />
                      </div>
                      <Field label="Note">
                        <TextInput value={c.note} placeholder="One-line note (optional)" onChange={(e) => update(c.id, { note: e.target.value })} />
                      </Field>
                      <div style={{ alignSelf: 'flex-end' }}>
                        <Button variant="secondary" size="lg" onPress={() => setEditing(null)}>Done</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Text style={{ fontWeight: 600, color: 'var(--dark-90)', display: 'block', fontSize: 16 }}>
                        {c.name || <span style={{ color: 'var(--dark-40)' }}>Unnamed competitor</span>}
                      </Text>
                      {(c.website || c.socials.some((s) => s.handle.trim())) && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                          {c.website && <Text style={{ fontSize: 13, color: 'var(--dark-40)' }}>🌐 {c.website}</Text>}
                          {c.socials.filter((s) => s.handle.trim()).map((s) => (
                            <Text key={s.id} style={{ fontSize: 13, color: 'var(--dark-40)' }}>{s.platform}</Text>
                          ))}
                        </div>
                      )}
                      {c.note && <Text style={{ display: 'block', marginTop: 3, fontSize: 14, color: 'var(--dark-60)' }}>{c.note}</Text>}
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {!isEditing && <Button variant="secondary" size="sm" onPress={() => setEditing(c.id)}>Edit</Button>}
                  <RemoveX onClick={() => remove(c.id)} size="sm" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AddLink label="Add a Competitor" onClick={add} />

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" size="lg" onPress={() => go(`/${account.id}/am/scorecard/setup`)}>Back</Button>
        <Button size="lg" onPress={() => go(`/${account.id}/am/scorecard/view`)}>Build Scorecard →</Button>
      </div>
    </div>
  );
}

// ─── Step 3: Scorecard view ──────────────────────────────────────────────────

const publishedAccounts = new Set<string>();

/** Whether the competitive scorecard has been published to the client portal,
 *  the cold-home onboarding step reads this to flip itself to "done". */
export function isScorecardPublished(accountId: string): boolean {
  return publishedAccounts.has(accountId);
}

const EFFORT_LABELS = { quick: 'Quick win', medium: 'Medium lift', project: 'Bigger project' } as const;
const EFFORT_TONE = { quick: 'success', medium: 'warning', project: 'accent' } as const;

/** Score → StatusPill tone: good (green) / fair (orange) / poor (red). */
const scoreTone = (s: number): 'success' | 'warning' | 'danger' => (s >= 65 ? 'success' : s >= 40 ? 'warning' : 'danger');

/** Score badge, DS StatusPill; the tone carries the good/fair/poor meaning. */
function ScorePill({ score }: { score: number }) {
  return <StatusPill tone={scoreTone(score)} size="md">{score}/100</StatusPill>;
}

/** Effort badge, DS StatusPill keyed to the effort level. */
function EffortPill({ effort }: { effort: keyof typeof EFFORT_LABELS }) {
  return <StatusPill tone={EFFORT_TONE[effort]} size="sm">{EFFORT_LABELS[effort]}</StatusPill>;
}

function scoreColor(score: number) {
  if (score >= 65) return 'var(--status-approved)';
  if (score >= 40) return 'var(--status-review)';
  return 'var(--red-70)';
}

// Methodology tooltip content
const METHODOLOGY: Record<string, string> = {
  'Paid Ads': 'Google Search ads active (+35) · Meta ads in last 90 days (+35) · Conversion tracking (+20) · Branded keyword defense (+10)',
  'Organic': 'Posting cadence ≥ 8×/month (+35) · GBP photos + posts fresh (+30) · Active on 3+ platforms (+20) · Video/short-form present (+15)',
  'Website': 'Mobile LCP < 2.5 s (+30) · Strong CTA copy (+25) · Lead form ≤ 4 fields (+20) · Trust signals present (+25)',
  'Reputation': 'Avg rating × 20 (+40 max) · Review count tier ≥ 50 (+30) · ≥ 2 new reviews/month (+20) · Response rate ≥ 80% (+10)',
};

function ScorecardView({ account, go }: { account: Account; go: Go }) {
  const [data, setData] = useState(() => buildScorecardData(account));
  const [published, setPublished] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [summaryEditing, setSummaryEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');

  const updateSection = (id: string, patch: Partial<ScorecardSection>) => {
    setData((d) => ({ ...d, sections: d.sections.map((s) => s.id === id ? { ...s, ...patch } : s) }));
  };

  const clientUrl = `${window.location.origin}/blaze-dfy/${account.id}/client/scorecard`;

  const copyLink = () => {
    navigator.clipboard.writeText(clientUrl).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Publish action lives in the workspace topbar. The client reviews the
  // published scorecard in the separate client prototype, so we just share a
  // link, no in-app client preview.
  const chrome = useWorkspaceChrome();
  const topbarActions = published ? (
    <Button variant={linkCopied ? 'primary' : 'secondary'} size="md" frontIcon={linkCopied ? Check2 : LinkExternal} onPress={copyLink}>{linkCopied ? 'Link Copied!' : 'Copy Client Link'}</Button>
  ) : (
    <Button variant="secondary" size="md" onPress={() => { publishedAccounts.add(account.id); setPublished(true); }}>Publish to Client</Button>
  );
  useEffect(() => {
    chrome?.setTopbarRight(topbarActions);
  });
  useEffect(() => () => {
    chrome?.setTopbarRight(null);
  }, [chrome]);

  // Bleed past the shell's 24px content padding so the footer bar spans the full
  // page width and sits flush at the bottom; the scroll area re-adds the margins.
  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <Heading level={2} style={{ margin: 0 }}>{account.name}</Heading>
          </div>

          <div style={{ position: 'relative', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 28, marginBottom: 32, background: summaryEditing ? 'var(--dark-2)' : 'var(--light-100)' }}>
            {summaryEditing ? (
              <>
                <TextArea value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} style={{ minHeight: 120, fontSize: 16, lineHeight: 1.7, letterSpacing: '0.32px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                  <Button variant="secondary" size="md" onPress={() => setSummaryEditing(false)}>Cancel</Button>
                  <Button size="md" onPress={() => { setData((d) => ({ ...d, summary: summaryDraft })); setSummaryEditing(false); }}>Save</Button>
                </div>
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                  <IconButton icon={Edit3} variant="ghost" size="sm" title="Edit summary" onPress={() => { setSummaryDraft(data.summary); setSummaryEditing(true); }} />
                </div>
                <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-80)', lineHeight: 1.7, paddingRight: 40 }}>{data.summary}</Text>
              </>
            )}
          </div>

          <ComparisonTable data={data} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, margin: '40px 0 0' }}>
            {data.sections.map((section) => (
              <SectionCard key={section.id} section={section} onUpdate={(patch) => updateSection(section.id, patch)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Button variant="secondary" size="lg" onPress={() => go(`/${account.id}/am/scorecard/competitors`)}>Edit Competitors</Button>
        <Button size="lg" onPress={() => go(`/${account.id}/am/strategy`)}>Continue to Strategy</Button>
      </div>
    </div>
  );
}

// ─── Client-facing scorecard (read-only) ─────────────────────────────────────

export function ScorecardClientView({ account }: { account: Account }) {
  const data = buildScorecardData(account);
  const isPublished = publishedAccounts.has(account.id);

  if (!isPublished) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', textAlign: 'center' }}>
        <Heading level={2} style={{ margin: '0 0 12px' }}>Scorecard coming soon</Heading>
        <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-60)', lineHeight: 1.6 }}>
          Your account manager is finishing up your competitive scorecard. Check back soon.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 28px' }}>{account.name}</Heading>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 28, marginBottom: 32, background: 'var(--light-100)' }}>
        <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-80)', lineHeight: 1.7 }}>{data.summary}</Text>
      </div>

      <ComparisonTable data={data} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, margin: '40px 0 0' }}>
        {data.sections.map((section) => (
          <ClientSectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function ClientSectionCard({ section }: { section: ScorecardSection }) {
  const [open, setOpen] = useState(true);
  const color = scoreColor(section.score);

  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, cursor: 'pointer' }}
      >
        <Heading level={3} style={{ margin: 0, flex: 1 }}>{section.title}</Heading>
        <ScorePill score={section.score} />
        <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}>{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </div>

      {open && (
        <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 32, background: 'var(--light-100)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 26 }}>
            <ReadOnlyBullets label="Strengths" color="var(--status-approved)" icon="✓" items={section.strengths} />
            <ReadOnlyBullets label="Weaknesses" color="var(--red-70)" icon="!" items={section.weaknesses} />
          </div>

          <div style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 18 }}>
            <Heading level={5} style={{ margin: '0 0 16px' }}>Suggested next steps</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {section.nextSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 400, flexShrink: 0 }}>{i + 1}</span>
                  <Text style={{ flex: 1, fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{step.label}</Text>
                  <EffortPill effort={step.effort} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnlyBullets({ label, color, icon, items }: { label: string; color: string; icon: string; items: string[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <span style={{ width: 20, height: 20, borderRadius: 99, background: color, color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
        <Heading level={5} style={{ margin: 0, color }}>{label}</Heading>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
            <Text style={{ fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section, onUpdate }: { section: ScorecardSection; onUpdate: (p: Partial<ScorecardSection>) => void }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const color = scoreColor(section.score);

  const dimKey = section.title.replace(' & Conversion', '').replace('Organic Presence', 'Organic') as keyof typeof METHODOLOGY;

  return (
    <div>
      {/* Section header, pulled out above the content card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div onClick={() => setOpen((o) => !o)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <Heading level={3} style={{ margin: 0 }}>{section.title}</Heading>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="number" min={0} max={100} value={section.score}
                  onChange={(e) => onUpdate({ score: Math.min(100, Math.max(0, Number(e.target.value))) })}
                  style={{ width: 56, height: 32, borderRadius: 8, border: '1px solid var(--dark-8)', textAlign: 'center', fontFamily: 'inherit', fontSize: 13, letterSpacing: '0.26px', fontWeight: 600, color, background: tint(color, 14), outline: 'none' }}
                />
                <Text style={{ fontSize: 13, color: 'var(--dark-40)' }}>/100</Text>
              </div>
            ) : (
              <ScorePill score={section.score} />
            )}
            <Tooltip label={METHODOLOGY[dimKey] ?? METHODOLOGY['Paid Ads']}>
              <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', cursor: 'help' }} aria-label="How this score is calculated">
                <HelpCircleContained size={18} color="var(--dark-60)" />
              </span>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="md" onPress={() => setEditing((e) => !e)}>
            {editing ? 'Done Editing' : 'Edit'}
          </Button>
          <IconButton icon={open ? ChevronUp : ChevronDown} variant="ghost" size="sm" title={open ? 'Collapse' : 'Expand'} onPress={() => setOpen((o) => !o)} />
        </div>
      </div>

      {open && (
        <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: 32, background: editing ? 'var(--dark-2)' : 'var(--light-100)' }}>
          {/* Strengths / Weaknesses columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 26 }}>
            <BulletColumn
              label="Strengths"
              color="var(--status-approved)"
              icon="✓"
              items={section.strengths}
              editing={editing}
              onUpdate={(items) => onUpdate({ strengths: items })}
            />
            <BulletColumn
              label="Weaknesses"
              color="var(--red-70)"
              icon="!"
              items={section.weaknesses}
              editing={editing}
              onUpdate={(items) => onUpdate({ weaknesses: items })}
            />
          </div>

          {/* Next steps */}
          <div style={{ borderTop: '1px solid var(--dark-6)', paddingTop: 18 }}>
            <Heading level={5} style={{ margin: '0 0 16px' }}>Suggested next steps</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {section.nextSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--dark-8)', color: 'var(--dark-60)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 400, flexShrink: 0 }}>{i + 1}</span>
                  {editing ? (
                    <div style={{ flex: 1 }}>
                      <TextInput
                        inputSize="md"
                        value={step.label}
                        onChange={(e) => onUpdate({ nextSteps: section.nextSteps.map((s, j) => j === i ? { ...s, label: e.target.value } : s) })}
                      />
                    </div>
                  ) : (
                    <Text style={{ flex: 1, fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{step.label}</Text>
                  )}
                  <EffortPill effort={step.effort} />
                </div>
              ))}
              {editing && (
                <AddLink label="Add Step" variant="ghost" onClick={() => onUpdate({ nextSteps: [...section.nextSteps, { label: '', effort: 'quick' }] })} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BulletColumn({ label, color, icon, items, editing, onUpdate }: {
  label: string; color: string; icon: string; items: string[]; editing: boolean; onUpdate: (items: string[]) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <span style={{ width: 20, height: 20, borderRadius: 99, background: color, color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
        <Heading level={5} style={{ margin: 0, color }}>{label}</Heading>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {editing ? (
              <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <TextArea
                  value={item}
                  onChange={(e) => onUpdate(items.map((x, j) => j === i ? e.target.value : x))}
                  rows={2}
                  style={{ minHeight: 56 }}
                />
                <RemoveX variant="ghost" size="sm" onClick={() => onUpdate(items.filter((_, j) => j !== i))} />
              </div>
            ) : (
              <>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
                <Text style={{ fontSize: 15, color: 'var(--dark-80)', lineHeight: 1.5 }}>{item}</Text>
              </>
            )}
          </div>
        ))}
        {editing && (
          <AddLink label="Add" variant="ghost" onClick={() => onUpdate([...items, ''])} />
        )}
      </div>
    </div>
  );
}

function ComparisonTable({ data }: { data: ScorecardData }) {
  const dims: Array<keyof typeof data.ourScores> = ['Paid Ads', 'Organic', 'Website', 'Reputation'];
  const overall = (scores: typeof data.ourScores) => Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  const rows = [
    { name: data.ourName, scores: data.ourScores, isUs: true },
    ...data.competitors.map((c) => ({ name: c.name, scores: c.scores, isUs: false })),
  ];

  return (
    <div>
      <Heading level={3} style={{ margin: '0 0 4px' }}>How you compare locally</Heading>
      <Text style={{ display: 'block', marginBottom: 14, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
        Scores are estimated from publicly visible signals: ad library activity, social presence, website audit, and review data. Open any section below to see exactly how each score is calculated.
      </Text>

      <div style={{ borderRadius: 12, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--dark-6)' }}>
              <th style={{ padding: '10px 22px', textAlign: 'left', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Business</th>
              {dims.map((d) => (
                <th key={d} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>{d}</th>
              ))}
              <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--dark-40)' }}>Overall</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const ov = overall(row.scores);
              return (
                <tr key={i} style={{ background: row.isUs ? 'var(--dark-2)' : 'transparent', borderBottom: '1px solid var(--dark-4)' }}>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontWeight: row.isUs ? 600 : 400, color: row.isUs ? 'var(--dark-90)' : 'var(--dark-80)', fontSize: 15 }}>{row.name}</Text>
                      {row.isUs && <Pill size="sm">You</Pill>}
                    </div>
                  </td>
                  {dims.map((d) => {
                    const s = row.scores[d];
                    return <td key={d} style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(s) }}>{s}</span></td>;
                  })}
                  <td style={{ padding: '14px', textAlign: 'center' }}><span style={{ fontWeight: 400, fontSize: 16, color: scoreColor(ov) }}>{ov}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
