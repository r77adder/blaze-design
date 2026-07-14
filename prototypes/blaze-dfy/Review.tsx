import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, StatusPill } from '@/staging';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Comment from '@/icons/20/Comment';
import type { Account, ScoreStatus } from './lib/types';
import * as S from './lib/strategy';
import { useReview, reviewSections, type Phase, type ItemStatus, type ItemFeedback, type ReviewSectionMeta } from './lib/review';
import type { Go } from './nav';
import { TextArea, gradientFor } from './ui';
import { GOALS_SECTIONS, GoalsSectionHead, SuccessFields, HistoryFields, EventsFields, PlanFields, type EditControl } from './onboarding-port/steps';
import { GOALS, DEFAULT_PLAN, MAJOR_EVENTS, type Goals, type MajorEvent } from './onboarding-port/data';

const PHASE_TITLE: Record<Phase, string> = { strategy: 'strategy', goals: 'goals & theme', creative: 'creative' };

/** A subsection of a review section, its own H5 label, a read rendering, and
 *  (when text-based) editable copy the client can revise field-by-field. */
interface SubPart { key: string; label: string; read: ReactNode; editText?: string }

const para = (t: string) => <Text variant="secondary" color="var(--dark-80)" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{t}</Text>;

/** Subsections per review section. Text subsections carry `editText` so they get
 *  a per-field Edit button; visual ones (swatches, asset grids) are read-only. */
function sectionParts(account: Account, id: string): SubPart[] {
  const md = S.brandContextMarkdown(account);
  const g = S.creativeGuidelines(account);

  if (id === 'context') return [
    { key: 'overview', label: 'Business overview', read: para(md.overview), editText: md.overview },
    { key: 'segments', label: 'Customer segments', read: para(md.segments), editText: md.segments },
    { key: 'services', label: 'Services / products', read: para(md.services), editText: md.services },
    { key: 'bio', label: 'Founder bio', read: para(md.bio), editText: md.bio },
  ];
  if (id === 'brand') {
    const fonts = account.brand.fonts.map((f) => f.family).filter(Boolean).join(', ');
    return [
      { key: 'colors', label: 'Colors', read: (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {account.brand.colors.map((c, i) => (
            <div key={i} style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, borderRadius: 8, background: c.hex, border: '1px solid var(--dark-8)' }} /><Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{c.name}</Text></div>
          ))}
        </div>
      ) },
      { key: 'fonts', label: 'Fonts', read: para(fonts || '-'), editText: fonts },
      { key: 'voice', label: 'Voice', read: para(g.toneSummary), editText: g.toneSummary },
    ];
  }
  if (id === 'guidelines') return [
    { key: 'taglines', label: 'Taglines', read: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{g.taglines.map((t, i) => <span key={i} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--dark-3)', fontSize: 14, color: 'var(--dark-90)' }}>{t}</span>)}</div>
    ), editText: g.taglines.join('\n') },
    { key: 'dos', label: "Do's", read: (
      <div>{g.toneExamples.map((e, i) => <Text key={i} style={{ display: 'block', marginBottom: 4, color: 'var(--dark-90)' }}><span style={{ color: 'var(--positive-60)', fontWeight: 700 }}>✓</span> {e.do}</Text>)}</div>
    ), editText: g.toneExamples.map((e) => e.do).join('\n') },
    { key: 'donts', label: "Don'ts", read: (
      <div>{g.toneExamples.map((e, i) => <Text key={i} style={{ display: 'block', marginBottom: 4, color: 'var(--dark-90)' }}><span style={{ color: 'var(--negative-60)', fontWeight: 700 }}>✕</span> {e.dont}</Text>)}</div>
    ), editText: g.toneExamples.map((e) => e.dont).join('\n') },
  ];
  if (id === 'scorecard') return [{ key: 'scorecard', label: 'Scorecard', read: <ScorecardRead account={account} /> }];
  if (id === 'storyboard') return [{ key: 'assets', label: 'First creative', read: <StoryboardRead account={account} /> }];
  if (id === 'calendar') return [{ key: 'weeks', label: 'Campaign calendar', read: <CalendarRead account={account} /> }];
  return [];
}

const hasEdits = (f?: ItemFeedback) => !!f?.edits && Object.values(f.edits).some((v) => v != null);

/* ─── Client side: per-phase guided review (mirrors the AM setup) ────────── */
export function ClientReview({ account, phase }: { account: Account; phase: Phase }) {
  const { packet, feedback, submit } = useReview();
  const status = packet(phase);
  const fb = feedback(phase);
  const sections = reviewSections(phase);
  const reviewed = sections.filter((s) => { const f = fb[s.id]; return f && (f.status !== 'pending' || hasEdits(f)); }).length;

  if (status === 'draft') {
    return <Empty title="This review isn't ready yet" body={`${account.am.name} is still putting the ${PHASE_TITLE[phase]} together. You'll get a link as soon as it's ready.`} />;
  }
  if (status === 'submitted') {
    const changes = sections.filter((s) => fb[s.id]?.status === 'changes').length;
    const edits = sections.filter((s) => hasEdits(fb[s.id])).length;
    const parts = [changes > 0 ? `${changes} change request${changes === 1 ? '' : 's'}` : '', edits > 0 ? `${edits} edit${edits === 1 ? '' : 's'}` : ''].filter(Boolean);
    return <Empty tone="positive" title="Thanks, feedback sent" body={parts.length ? `We shared ${parts.join(' and ')} with the team. ${account.am.name} will follow up with the next version.` : `Everything's approved and sent to ${account.am.name}.`} />;
  }

  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Heading level={2} style={{ marginTop: 0 }}>{phase === 'strategy' ? 'Review your strategy' : phase === 'goals' ? 'Review your goals & first theme' : 'Review your first creative'}</Heading>
          <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '6px 0 24px', lineHeight: 1.6 }}>
            {account.am.name} put this together for {account.name}. Approve what looks right, edit any field directly, or request changes with a note. It goes straight back to the team.
          </Text>

          {phase === 'goals'
            ? <GoalsReviewSections />
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {sections.map((sec) => <ReviewSection key={sec.id} account={account} phase={phase} sec={sec} />)}
              </div>
            )}
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Text variant="secondary" color="var(--dark-60)">{reviewed} of {sections.length} reviewed</Text>
        <Button size="lg" onPress={() => submit(phase)}>Submit feedback</Button>
      </div>
    </div>
  );
}

/** One review section: the headline, subhead and verdict buttons sit OUTSIDE the
 *  container; the container holds each subsection with its own H5 + Edit. */
function ReviewSection({ account, phase, sec }: { account: Account; phase: Phase; sec: ReviewSectionMeta }) {
  const { feedback, setItem } = useReview();
  const f = feedback(phase)[sec.id] ?? { status: 'pending' as ItemStatus, comment: '' };
  const parts = sectionParts(account, sec.id);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const edits = f.edits ?? {};

  return (
    <div>
      {/* header: headline, subhead and verdict buttons outside the container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <Heading level={3} style={{ margin: 0 }}>{sec.title}</Heading>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 3 }}>{sec.blurb}</Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <RequestChanges phase={phase} id={sec.id} />
          <ApproveButton phase={phase} id={sec.id} />
        </div>
      </div>

      {/* container: subsections, each with its own H5 and Edit button */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {parts.map((p) => {
            const editing = editingKey === p.key;
            const edited = edits[p.key] != null;
            return (
              <div key={p.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Heading level={5} style={{ margin: 0 }}>{p.label}</Heading>
                    {edited && !editing && <StatusPill tone="warning">Edited</StatusPill>}
                  </div>
                  {p.editText !== undefined && (
                    editing
                      ? <Button size="xs" variant="secondary" onPress={() => setEditingKey(null)}>Done</Button>
                      : <Button size="xs" variant="secondary" frontIcon={Edit3} onPress={() => setEditingKey(p.key)}>Edit</Button>
                  )}
                </div>
                {editing
                  ? <TextArea autoFocus value={edits[p.key] ?? p.editText ?? ''} onChange={(e) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: e.target.value } })} style={{ minHeight: 110, fontSize: 14 }} />
                  : edited
                    ? para(edits[p.key])
                    : p.read}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/** Shared verdict controls: a Request-changes button that opens a note popover,
 *  and an Approve toggle. Both read/write the section's feedback directly. */
function RequestChanges({ phase, id }: { phase: Phase; id: string }) {
  const { feedback, setItem } = useReview();
  const f = feedback(phase)[id] ?? { status: 'pending' as ItemStatus, comment: '' };
  const [open, setOpen] = useState(false);
  const setStatus = (status: ItemStatus) => setItem(phase, id, { status });
  return (
    <div style={{ position: 'relative' }}>
      <Button size="sm" variant={f.status === 'changes' ? 'red' : 'secondary'} frontIcon={Comment} onPress={() => setOpen((o) => !o)}>Request changes</Button>
      <Popover open={open} onClose={() => setOpen(false)}>
        <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', marginBottom: 8 }}>What would you like changed?</Text>
        <TextArea autoFocus value={f.comment} placeholder="Add a note for the team…" onChange={(e) => setItem(phase, id, { comment: e.target.value })} style={{ minHeight: 84, fontSize: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 10 }}>
          {f.status === 'changes'
            ? <Button size="sm" variant="ghost" onPress={() => { setStatus('pending'); setOpen(false); }}>Withdraw</Button>
            : <span />}
          <Button size="sm" variant="primary" onPress={() => { setStatus('changes'); setOpen(false); }}>Send request</Button>
        </div>
      </Popover>
    </div>
  );
}

function ApproveButton({ phase, id }: { phase: Phase; id: string }) {
  const { feedback, setItem } = useReview();
  const f = feedback(phase)[id] ?? { status: 'pending' as ItemStatus, comment: '' };
  return <Button size="sm" variant={f.status === 'approved' ? 'green' : 'secondary'} frontIcon={Check2} onPress={() => setItem(phase, id, { status: f.status === 'approved' ? 'pending' : 'approved' })}>Approve</Button>;
}

/* ─── Goals & theme review, mirrors the pre-submission Goals screen, read-only,
 *  with per-subsection Edit + section-level Approve / Request changes. No card
 *  around the subsections (matches the pre-submission layout). ────────────── */
function GoalsReviewSections() {
  const { setItem } = useReview();
  const [g, setG] = useState<Goals>({ ...GOALS });
  const [channels, setChannels] = useState<string[]>(GOALS.channels);
  const [plan, setPlan] = useState<string[]>(DEFAULT_PLAN);
  const [events, setEvents] = useState<MajorEvent[]>(MAJOR_EVENTS);
  // Which subsections are open in the inline editor, keyed `${sectionId}:${key}`.
  const [editing, setEditing] = useState<Set<string>>(() => new Set());
  const markEdited = (id: string) => setItem('goals', id, { edits: { form: 'edited' } });
  const ctrlFor = (id: string): EditControl => ({
    isEditing: (key) => editing.has(`${id}:${key}`),
    toggle: (key) => setEditing((prev) => { const n = new Set(prev); const k = `${id}:${key}`; n.has(k) ? n.delete(k) : n.add(k); return n; }),
  });

  const body = (id: string) => {
    const ctrl = ctrlFor(id);
    const onEdit = () => markEdited(id);
    if (id === 'success') return <SuccessFields g={g} setG={setG} ctrl={ctrl} onEdit={onEdit} />;
    if (id === 'history') return <HistoryFields g={g} setG={setG} channels={channels} setChannels={setChannels} ctrl={ctrl} onEdit={onEdit} />;
    if (id === 'events') return <EventsFields events={events} setEvents={setEvents} ctrl={ctrl} onEdit={onEdit} />;
    if (id === 'plan') return <PlanFields plan={plan} setPlan={setPlan} ctrl={ctrl} onEdit={onEdit} />;
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {GOALS_SECTIONS.map((sec) => (
        <div key={sec.id}>
          <GoalsSectionHead
            id={sec.id}
            title={sec.title}
            right={
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <RequestChanges phase="goals" id={sec.id} />
                <ApproveButton phase="goals" id={sec.id} />
              </div>
            }
          />
          {body(sec.id)}
        </div>
      ))}
    </div>
  );
}

/** Click popover anchored under its trigger. Backdrop closes on outside click. */
function Popover({ open, onClose, children, width = 320 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div role="dialog" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 41, width, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, boxShadow: '0 10px 28px rgba(15,23,42,0.16)', padding: 12 }}>
        {children}
      </div>
    </>
  );
}

function statusColor(s: ScoreStatus) { return s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--status-approved)'; }
function ScorecardRead({ account }: { account: Account }) {
  const data = S.scorecard(account);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
      {data.areas.map((a) => (
        <div key={a.number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--dark-2)', border: '1px solid var(--dark-6)' }}>
          <span style={{ width: 36, height: 36, borderRadius: 99, border: `3px solid ${statusColor(a.status)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{a.score}</span>
          <div style={{ flex: 1 }}><Text variant="smallList" color="var(--dark-90)" style={{ display: 'block' }}>{a.eyebrow}</Text><Text variant="metadata" color="var(--dark-60)">{a.score}/{a.maxScore}</Text></div>
        </div>
      ))}
    </div>
  );
}

function StoryboardRead({ account }: { account: Account }) {
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]).title;
  const assets = useMemo(() => S.generatedAssets(account, theme).slice(0, 6), [account, theme]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
      {assets.map((a) => {
        const textOnly = a.type === 'Blog Post' || a.type === 'Email';
        return (
          <div key={a.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-6)' }}>
            <div style={{ height: 96, background: textOnly ? 'var(--dark-3)' : gradientFor(a.seed), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}><Text style={{ color: textOnly ? 'var(--dark-40)' : 'var(--light-100)', fontWeight: 600, fontSize: 12, textAlign: 'center' }}>{textOnly ? a.type : a.overlay}</Text></div>
            <div style={{ padding: 8 }}><Text variant="metadata" color="var(--dark-80)" lineClamp={2}>{a.caption}</Text></div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarRead({ account }: { account: Account }) {
  const themes = useMemo(() => S.seasonalThemes(account).slice(0, 5), [account]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {themes.map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <Text variant="metadata" color="var(--dark-60)" style={{ width: 64, flexShrink: 0 }}>Wk {w.week}</Text>
          <Text variant="largeList" color="var(--dark-90)">{w.title}</Text>
          <StatusPill tone="neutral">{w.season}</StatusPill>
        </div>
      ))}
    </div>
  );
}

function Empty({ title, body, tone }: { title: string; body: string; tone?: 'positive' }) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: tone ? 'var(--positive-10)' : 'var(--dark-3)', color: tone ? 'var(--positive-60)' : 'var(--dark-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{tone ? '✓' : '⏳'}</div>
      <Heading level={3} style={{ marginTop: 0 }}>{title}</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.6 }}>{body}</Text>
    </div>
  );
}

/** One section's returned feedback: a change request, a client edit, or an
 *  approval. Shared by the inline SectionFeedback and the goals AmReviewPanel. */
function SectionFeedbackCard({ account, phase, sec, hideTitle }: { account: Account; phase: Phase; sec: ReviewSectionMeta; hideTitle?: boolean }) {
  const { feedback, resolve, setItem } = useReview();
  const f = feedback(phase)[sec.id];
  if (!f) return null;
  if (f.status === 'changes') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-6)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}><StatusPill tone="danger">Changes requested</StatusPill>{!hideTitle && <Text variant="largeList" color="var(--dark-90)">{sec.title}</Text>}</div>
          <Text variant="secondary" color="var(--dark-60)">{f.comment || 'Requested changes'}</Text>
        </div>
        <Button size="sm" variant="secondary" onPress={() => resolve(phase, sec.id)}>Mark resolved</Button>
      </div>
    );
  }
  if (hasEdits(f)) {
    const ed = f.edits ?? {};
    const editedParts = sectionParts(account, sec.id).filter((p) => ed[p.key] != null);
    return (
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--status-review) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--status-review) 30%, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><StatusPill tone="warning">Edited by client</StatusPill>{!hideTitle && <Text variant="largeList" color="var(--dark-90)">{sec.title}</Text>}</div>
          <Button size="sm" variant="secondary" onPress={() => setItem(phase, sec.id, { status: 'approved', edits: {} })}>Accept edits</Button>
        </div>
        {editedParts.length > 0
          ? editedParts.map((p) => (
            <div key={p.key} style={{ marginTop: 8 }}>
              <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 2 }}>{p.label}</Text>
              <Text variant="secondary" color="var(--dark-90)" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{ed[p.key]}</Text>
            </div>
          ))
          : <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>Client edited this section.</Text>}
      </div>
    );
  }
  if (f.status === 'approved') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--status-approved) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--status-approved) 22%, transparent)' }}>
        <StatusPill tone="success">Approved</StatusPill>{!hideTitle && <Text variant="secondary" color="var(--dark-80)">{sec.title}</Text>}
      </div>
    );
  }
  return null;
}

/** One section's returned feedback, placed inline next to the content block it
 *  relates to. Renders nothing unless the phase is submitted and this section
 *  has a verdict/edit. */
export function SectionFeedback({ account, phase, sectionId }: { account: Account; phase: Phase; sectionId: string }) {
  const { packet, feedback } = useReview();
  if (packet(phase) !== 'submitted') return null;
  const f = feedback(phase)[sectionId];
  if (!f || (f.status === 'pending' && !hasEdits(f))) return null;
  const sec = reviewSections(phase).find((s) => s.id === sectionId);
  if (!sec) return null;
  return <div style={{ marginBottom: 16 }}><SectionFeedbackCard account={account} phase={phase} sec={sec} hideTitle /></div>;
}

/** A single subsection's client edit, placed next to that field. */
export function SubsectionFeedback({ account, phase, sectionId, subKey }: { account: Account; phase: Phase; sectionId: string; subKey: string }) {
  const { packet, feedback, setItem } = useReview();
  if (packet(phase) !== 'submitted') return null;
  const f = feedback(phase)[sectionId];
  const edit = f?.edits?.[subKey];
  if (edit == null) return null;
  const accept = () => { const e = { ...(f?.edits ?? {}) }; delete e[subKey]; setItem(phase, sectionId, { edits: e }); };
  return (
    <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--status-review) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--status-review) 30%, transparent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><StatusPill tone="warning">Edited by client</StatusPill><Text variant="metadata" color="var(--dark-40)">{account.poc.name}</Text></div>
        <Button size="sm" variant="secondary" onPress={accept}>Accept edit</Button>
      </div>
      <Text variant="secondary" color="var(--dark-90)" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{edit}</Text>
    </div>
  );
}

/* ─── AM side: per-phase share + feedback, embedded in the phase done screen ─ */
export function AmReviewPanel({ account, phase, go, stepped }: { account: Account; phase: Phase; go: Go; stepped?: boolean }) {
  const { packet, share, reset, feedback } = useReview();
  const status = packet(phase);
  const fb = feedback(phase);
  const sections = reviewSections(phase);
  const changes = sections.filter((s) => fb[s.id]?.status === 'changes');
  const edited = sections.filter((s) => hasEdits(fb[s.id]));
  const link = `blaze.ai/r/${account.id}-${phase}`;

  return (
    <Card style={{ textAlign: 'left' }}>
      {status === 'draft' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Share this {PHASE_TITLE[phase]} with the client</Text>
            <Text variant="metadata" color="var(--dark-60)">Send {account.poc.name} a link to approve or request changes.</Text>
          </div>
          <Button size="lg" onPress={() => share(phase)}>Share for review</Button>
        </div>
      )}
      {status === 'shared' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <StatusPill tone="warning">Awaiting client</StatusPill>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginTop: 6 }}>Link sent to {account.poc.email}</Text>
            <code style={{ fontSize: 13, color: 'var(--action-50)' }}>{link}</code>
          </div>
          <Button size="sm" variant="ghost" onPress={() => reset(phase)}>Unshare</Button>
        </div>
      )}
      {status === 'submitted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="largeList" color="var(--dark-90)">
              {changes.length || edited.length ? `${account.poc.name} requested changes and made edits` : `${account.poc.name} approved everything`}
            </Text>
            <Button size="sm" variant="ghost" onPress={() => reset(phase)}>Reset</Button>
          </div>
          {stepped
            ? <Text variant="secondary" color="var(--dark-60)">{[changes.length ? `${changes.length} change request${changes.length === 1 ? '' : 's'}` : '', edited.length ? `${edited.length} edit${edited.length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' and ') || 'Everything approved'}. Open the highlighted steps above to review each in place.</Text>
            : (<>
                {changes.map((s) => <SectionFeedbackCard key={s.id} account={account} phase={phase} sec={s} />)}
                {edited.map((s) => <SectionFeedbackCard key={s.id} account={account} phase={phase} sec={s} />)}
              </>)}
        </div>
      )}
    </Card>
  );
}
