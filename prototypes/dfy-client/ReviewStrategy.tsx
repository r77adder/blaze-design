import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text, Button, IconButton } from '@/components';
import { Callout, Chip, Pill, Select, StatusPill, TextField } from '@/staging';
import Check2 from '@/icons/20/Check2';
import Check02 from '@/icons/16/Check02';
import Close from '@/icons/16/Close';
import Edit3 from '@/icons/20/Edit3';
import Comment from '@/icons/20/Comment';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import Camera1 from '@/icons/20/Camera1';
import VideoOn from '@/icons/20/VideoOn';
import FileMultiple from '@/icons/20/FileMultiple';
import Iphone02 from '@/icons/16/Iphone02';
import Google from '@/icons/20/Google';
import MetaBrand from '@/icons/20/MetaBrand';
import Document from '@/icons/20/Document';
import Mail from '@/icons/20/Mail';
import type { Account, BrandColor, BrandFont, GeneratedAsset, ScoreStatus } from './review-lib/types';
import * as S from './review-lib/strategy';
import { ReviewProvider, useReview, reviewSections, type Phase, type ItemStatus, type ItemFeedback, type ReviewSectionMeta } from './review-lib/review';
import { GRAIN_ACCOUNT } from './review-lib/account';
import { TextArea } from './review-lib/ui';
import { ClientShell, BackTitle, BASE } from './shell';
import { useClientState } from './dev-state';
import { StoryPreview, ReelPreview } from './SocialPreviewFrames';

/* ─── Verbatim copy of prototypes/blaze-dfy Review.tsx (ClientReview + its
 * strategy/goals/creative section renderers, Empty, Popover, ScorecardRead,
 * StoryboardRead, CalendarRead). AmReviewPanel and its deps are dropped, it's
 * only used by the AM-side "done" screens, never by the client. Only import
 * paths changed. */

const PHASE_TITLE: Record<Phase, string> = { strategy: 'strategy', goals: 'goals', creative: 'creative' };

/** A subsection of a review section: its own H5 label, a read rendering, and
 *  (when text-based) editable copy the client can revise field-by-field. */
interface SubPart { key: string; label: string; read: ReactNode; editText?: string }

const para = (t: string) => <Text variant="secondary" color="var(--dark-80)" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{t}</Text>;

/** Colors are stored as JSON in `editText`/`edits` so the generic per-field
 *  edit flow can carry an array through the same string-keyed feedback map. */
const parseColors = (json?: string): BrandColor[] => { try { return json ? JSON.parse(json) : []; } catch { return []; } };
const parseFonts = (json?: string): BrandFont[] => { try { return json ? JSON.parse(json) : []; } catch { return []; } };
const fontsDisplayText = (fonts: BrandFont[]) => fonts.map((f) => f.family).filter(Boolean).join(', ') || 'None yet';

const FONT_FAMILY_OPTIONS = ['Sohne', 'Inter', 'Playfair Display', 'Merriweather', 'Montserrat', 'Poppins', 'Lato', 'Roboto', 'Georgia', 'Helvetica Neue'].map((f) => ({ value: f, label: f }));
const fontFamilyOptionsFor = (family: string) => (FONT_FAMILY_OPTIONS.some((o) => o.value === family) ? FONT_FAMILY_OPTIONS : [{ value: family, label: family }, ...FONT_FAMILY_OPTIONS]);
const FONT_ROLE_OPTIONS: { value: BrandFont['role']; label: string }[] = [
  { value: 'Display', label: 'Display' },
  { value: 'Heading', label: 'Heading' },
  { value: 'Body', label: 'Body' },
];

/** Channels + plan-channels are stored as JSON string[], same pattern as
 *  colors/fonts above. */
const parseChannels = (json?: string): string[] => { try { return json ? JSON.parse(json) : []; } catch { return []; } };

/** Major events merge the account's companyEvents + industryEvents into one
 *  tagged, chronological list, the same shape the AM's goals page edits. */
interface GoalEvent { label: string; when: string; tag: 'Company' | 'Industry' }
const parseEvents = (json?: string): GoalEvent[] => { try { return json ? JSON.parse(json) : []; } catch { return []; } };
const fmtEventDate = (iso: string) => {
  if (!iso) return 'TBD';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Subsections per review section. Text subsections carry `editText` so they get
 *  a per-field Edit button; visual ones (swatches, asset grids) are read-only. */
function sectionParts(account: Account, id: string): SubPart[] {
  const md = S.brandContextMarkdown(account);
  const g = S.creativeGuidelines(account);
  const goals = S.goals(account);

  if (id === 'context') return [
    { key: 'overview', label: 'Business overview', read: para(md.overview), editText: md.overview },
    { key: 'segments', label: 'Customer segments', read: para(md.segments), editText: md.segments },
    { key: 'services', label: 'Services / products', read: para(md.services), editText: md.services },
    { key: 'bio', label: 'Founder bio', read: para(md.bio), editText: md.bio },
  ];
  if (id === 'brand') {
    return [
      { key: 'colors', label: 'Colors', read: <ColorSwatches colors={account.brand.colors} />, editText: JSON.stringify(account.brand.colors) },
      { key: 'fonts', label: 'Fonts', read: para(fontsDisplayText(account.brand.fonts)), editText: JSON.stringify(account.brand.fonts) },
      { key: 'voice', label: 'Voice', read: para(g.toneSummary), editText: g.toneSummary },
    ];
  }
  if (id === 'guidelines') return [
    { key: 'taglines', label: 'Taglines', read: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{g.taglines.map((t, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--dark-40)', flexShrink: 0, marginTop: 9 }} />
          <Text style={{ color: 'var(--dark-90)' }}>{t}</Text>
        </div>
      ))}</div>
    ), editText: g.taglines.join('\n') },
    { key: 'dos', label: "Do's", read: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{g.toneExamples.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ display: 'inline-flex', marginTop: 2, flexShrink: 0 }}><Check02 size={16} color="var(--positive-60)" /></span>
          <Text style={{ color: 'var(--dark-90)' }}>{e.do}</Text>
        </div>
      ))}</div>
    ), editText: g.toneExamples.map((e) => e.do).join('\n') },
    { key: 'donts', label: "Don'ts", read: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{g.toneExamples.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ display: 'inline-flex', marginTop: 2, flexShrink: 0 }}><Close size={16} color="var(--negative-60)" /></span>
          <Text style={{ color: 'var(--dark-90)' }}>{e.dont}</Text>
        </div>
      ))}</div>
    ), editText: g.toneExamples.map((e) => e.dont).join('\n') },
  ];
  if (id === 'success') return [
    { key: 'thirty', label: 'First 30 days', read: para(goals.thirty), editText: goals.thirty },
    { key: 'sixty', label: 'By 60 days', read: para(goals.sixty), editText: goals.sixty },
    { key: 'ninety', label: 'By 90 days', read: para(goals.ninety), editText: goals.ninety },
  ];
  if (id === 'history') return [
    { key: 'channels', label: "Channels they're on", read: <ChannelPills channels={goals.channels} />, editText: JSON.stringify(goals.channels) },
    { key: 'drivingGrowth', label: "What's driving growth?", read: para(goals.drivingGrowth), editText: goals.drivingGrowth },
    { key: 'worked', label: "What's worked?", read: para(goals.worked), editText: goals.worked },
    { key: 'notWorked', label: "What hasn't worked?", read: para(goals.notWorked), editText: goals.notWorked },
  ];
  if (id === 'events') {
    const events: GoalEvent[] = [
      ...goals.companyEvents.map((e) => ({ label: e.label, when: e.date, tag: 'Company' as const })),
      ...goals.industryEvents.map((e) => ({ label: e.label, when: e.date, tag: 'Industry' as const })),
    ].sort((a, b) => a.when.localeCompare(b.when));
    return [{ key: 'events', label: 'Major events', read: <EventsRead events={events} />, editText: JSON.stringify(events) }];
  }
  if (id === 'plan') return [{ key: 'planChannels', label: 'Channels to develop plans around', read: <ChannelPills channels={S.DEFAULT_PLAN} />, editText: JSON.stringify(S.DEFAULT_PLAN) }];
  if (id === 'scorecard') return [{ key: 'scorecard', label: 'Scorecard', read: <ScorecardRead account={account} /> }];
  return [];
}

const hasEdits = (f?: ItemFeedback) => !!f?.edits && Object.values(f.edits).some((v) => v != null);

/* ─── Client side: per-phase guided review (mirrors the AM setup) ────────── */
export function ClientReview({ account, phase }: { account: Account; phase: Phase }) {
  const { packet, feedback, submit, setItem } = useReview();
  const { state, setPhaseSubmitted } = useClientState();
  const navigate = useNavigate();
  const status = packet(phase);
  const fb = feedback(phase);
  const sections = reviewSections(phase);
  const reviewed = sections.filter((s) => { const f = fb[s.id]; return f && (f.status !== 'pending' || hasEdits(f)); }).length;

  // In the "Mixed" portal state, Home tells the client their strategist
  // already addressed a note on Taglines, highlight that same field here so
  // it's easy to find, instead of making them re-read the whole page.
  const highlightKeys = phase === 'strategy' && state === 'mixed' ? new Set(['taglines']) : null;

  // Rather than dead-ending on a "Thanks" screen, submit redirects the client
  // to Home and hands the confirmation copy along so Home can show it in a
  // modal. The client lands somewhere they can keep navigating from.
  const submitAndRedirect = () => {
    // Nothing touched. "Approve All" means exactly that, so mark every
    // section approved before submitting instead of leaving them pending.
    if (reviewed === 0) sections.forEach((sec) => setItem(phase, sec.id, { status: 'approved' }));
    const changes = sections.filter((s) => fb[s.id]?.status === 'changes').length;
    const edits = sections.filter((s) => hasEdits(fb[s.id])).length;
    const parts = [changes > 0 ? `${changes} change request${changes === 1 ? '' : 's'}` : '', edits > 0 ? `${edits} edit${edits === 1 ? '' : 's'}` : ''].filter(Boolean);
    const body = parts.length
      ? `We shared ${parts.join(' and ')} with the team. ${account.am.name} will follow up with the next version.`
      : `Everything's approved and sent to ${account.am.name}.`;
    submit(phase);
    setPhaseSubmitted(phase, true);
    navigate(BASE, { state: { feedbackSubmitted: { title: 'Thanks, feedback sent', body } } });
  };

  if (status === 'draft') {
    return <Empty title="This review isn't ready yet" body={`${account.am.name} is still putting the ${PHASE_TITLE[phase]} together. You'll get a link as soon as it's ready.`} />;
  }
  if (status === 'submitted') {
    const changes = sections.filter((s) => fb[s.id]?.status === 'changes').length;
    const edits = sections.filter((s) => hasEdits(fb[s.id])).length;
    const parts = [changes > 0 ? `${changes} change request${changes === 1 ? '' : 's'}` : '', edits > 0 ? `${edits} edit${edits === 1 ? '' : 's'}` : ''].filter(Boolean);
    return <Empty tone="positive" title="Thanks, feedback sent" body={parts.length ? `We shared ${parts.join(' and ')} with the team. ${account.am.name} will follow up with the next version.` : `Everything's approved and sent to ${account.am.name}.`} />;
  }

  // Creative phase reviews individual content pieces (Approvals-tab style)
  // rather than the generic per-field sections below.
  if (phase === 'creative') {
    return (
      <CreativeReviewScreen
        account={account}
        onSubmitted={(body) => {
          submit(phase);
          setPhaseSubmitted(phase, true);
          navigate(BASE, { state: { feedbackSubmitted: { title: 'Thanks, feedback sent', body } } });
        }}
      />
    );
  }

  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Heading level={2} style={{ marginTop: 0 }}>{phase === 'strategy' ? 'Review your strategy' : phase === 'goals' ? 'Review your goals' : 'Review your first creative'}</Heading>
          <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '6px 0 24px', lineHeight: 1.6 }}>
            {account.am.name} put this together for {account.name}. Approve what looks right, edit any field directly, or request changes with a note. It goes straight back to the team.
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {sections.map((sec) => <ReviewSection key={sec.id} account={account} phase={phase} sec={sec} highlightKeys={highlightKeys} />)}
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
        <div style={{ justifySelf: 'start' }}>
          <Button variant="ghost" size="lg" onPress={() => navigate(BASE)}>Cancel</Button>
        </div>
        <Text variant="secondary" color="var(--dark-60)">{reviewed} of {sections.length} reviewed</Text>
        <div style={{ justifySelf: 'end' }}>
          <Button size="lg" onPress={submitAndRedirect}>{reviewed === 0 ? 'Approve All' : 'Submit feedback'}</Button>
        </div>
      </div>
    </div>
  );
}

/** One review section: the headline, subhead and verdict buttons sit OUTSIDE the
 *  container; the container holds each subsection with its own H5 + Edit. */
function ReviewSection({ account, phase, sec, highlightKeys }: { account: Account; phase: Phase; sec: ReviewSectionMeta; highlightKeys?: Set<string> | null }) {
  const { feedback, setItem } = useReview();
  const f = feedback(phase)[sec.id] ?? { status: 'pending' as ItemStatus, comment: '' };
  const parts = sectionParts(account, sec.id);
  // Group Do's + Don'ts into one row so they render side by side.
  const partRows: SubPart[][] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].key === 'dos' && parts[i + 1]?.key === 'donts') {
      partRows.push([parts[i], parts[i + 1]]);
      i++;
    } else {
      partRows.push([parts[i]]);
    }
  }
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const edits = f.edits ?? {};
  const setStatus = (status: ItemStatus) => setItem(phase, sec.id, { status });

  // Sections with exactly one subpart that just repeats the section title
  // (Major events, Channels to develop plans around, Scorecard, First
  // creative, Campaign calendar) don't need their own H5 + Edit row. That
  // Edit control moves up into the section header instead, replacing
  // Request changes/Approve with a single Save while active.
  const singleField = parts.length === 1 && parts[0].label === sec.title ? parts[0] : null;
  const singleFieldEditing = singleField ? editingKey === singleField.key : false;
  const singleFieldEdited = singleField ? edits[singleField.key] != null : false;

  return (
    <div>
      {/* header: headline and verdict buttons outside the container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--dark-8)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heading level={3} style={{ margin: 0 }}>{sec.title}</Heading>
          {f.status === 'changes' && <StatusPill tone="warning">Changes requested</StatusPill>}
          {singleField && singleFieldEdited && !singleFieldEditing && <StatusPill tone="warning">Edited</StatusPill>}
        </div>
        {singleField && singleFieldEditing ? (
          <Button size="sm" variant="secondary" onPress={() => setEditingKey(null)}>Save</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Button size="sm" variant={f.status === 'changes' ? 'red' : 'secondary'} frontIcon={Comment} onPress={() => setCommentOpen((o) => !o)}>Request changes</Button>
              <Popover open={commentOpen} onClose={() => setCommentOpen(false)}>
                <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', marginBottom: 8 }}>What would you like changed?</Text>
                <TextArea autoFocus value={f.comment} placeholder="Add a note for the team…" onChange={(e) => setItem(phase, sec.id, { comment: e.target.value })} style={{ minHeight: 84, fontSize: 14 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  {f.status === 'changes'
                    ? <Button size="sm" variant="ghost" onPress={() => { setStatus('pending'); setCommentOpen(false); }}>Withdraw</Button>
                    : <span />}
                  <Button size="sm" variant="primary" onPress={() => { setStatus('changes'); setCommentOpen(false); }}>Send request</Button>
                </div>
              </Popover>
            </div>
            {singleField && (
              <Button size="sm" variant="secondary" frontIcon={Edit3} onPress={() => setEditingKey(singleField.key)}>Edit</Button>
            )}
            <Button size="sm" variant={f.status === 'approved' ? 'green' : 'secondary'} frontIcon={Check2} onPress={() => setStatus(f.status === 'approved' ? 'pending' : 'approved')}>Approve</Button>
          </div>
        )}
      </div>

      {/* the request itself, visible on the page instead of only inside the
       *  Request changes popover */}
      {f.status === 'changes' && f.comment && (
        <div style={{ marginBottom: 24, marginTop: -8 }}>
          <Callout tone="warning" title="You requested changes">{f.comment}</Callout>
        </div>
      )}

      {/* subsections, each with its own H5 and Edit button, no outer container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {partRows.map((row) => (
          <div key={row[0].key} style={row.length === 2 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 } : undefined}>
            {row.map((p) => {
              const editing = editingKey === p.key;
              const edited = edits[p.key] != null;
              const highlighted = !!highlightKeys?.has(p.key);
              return (
                <div key={p.key}>
                  {!singleField && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Heading level={5} style={{ margin: 0 }}>{p.label}</Heading>
                        {edited && !editing && <StatusPill tone="warning">Edited</StatusPill>}
                        {highlighted && !editing && <StatusPill tone="info">Updated</StatusPill>}
                      </div>
                      {p.editText !== undefined && (
                        editing
                          ? <Button size="xs" variant="secondary" onPress={() => setEditingKey(null)}>Save</Button>
                          : <Button size="xs" variant="secondary" frontIcon={Edit3} onPress={() => setEditingKey(p.key)}>Edit</Button>
                      )}
                    </div>
                  )}
                  {highlighted && !editing && (
                    <div style={{ marginBottom: 10 }}>
                      <Callout tone="info" icon={Comment} title="Dana updated this based on your feedback">
                        Tightened these to lead harder with your free-estimate CTA, per your note.
                      </Callout>
                    </div>
                  )}
                  {p.key === 'colors'
                    ? (editing
                        ? <ColorsEditor colors={parseColors(edits[p.key] ?? p.editText)} onChange={(colors) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: JSON.stringify(colors) } })} />
                        : <ColorSwatches colors={parseColors(edits[p.key] ?? p.editText)} />)
                    : p.key === 'fonts'
                      ? (editing
                          ? <FontsEditor fonts={parseFonts(edits[p.key] ?? p.editText)} onChange={(fonts) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: JSON.stringify(fonts) } })} />
                          : para(fontsDisplayText(parseFonts(edits[p.key] ?? p.editText))))
                      : p.key === 'channels'
                        ? (editing
                            ? <ChannelsEditor channels={parseChannels(edits[p.key] ?? p.editText)} onChange={(channels) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: JSON.stringify(channels) } })} />
                            : <ChannelPills channels={parseChannels(edits[p.key] ?? p.editText)} />)
                        : p.key === 'planChannels'
                          ? (editing
                              ? <PlanChannelsEditor selected={parseChannels(edits[p.key] ?? p.editText)} onChange={(channels) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: JSON.stringify(channels) } })} />
                              : <ChannelPills channels={parseChannels(edits[p.key] ?? p.editText)} />)
                          : p.key === 'events'
                            ? (editing
                                ? <EventsEditor events={parseEvents(edits[p.key] ?? p.editText)} onChange={(events) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: JSON.stringify(events) } })} />
                                : <EventsRead events={parseEvents(edits[p.key] ?? p.editText)} />)
                            : editing
                              ? <TextArea autoFocus value={edits[p.key] ?? p.editText ?? ''} onChange={(e) => setItem(phase, sec.id, { edits: { ...edits, [p.key]: e.target.value } })} style={{ minHeight: 110, fontSize: 14 }} />
                              : edited
                                ? para(edits[p.key])
                                : p.read}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Read-only swatch grid. The default view before the client taps Edit. */
function ColorSwatches({ colors }: { colors: BrandColor[] }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: c.hex, border: '1px solid var(--dark-8)' }} />
          <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{c.name}</Text>
        </div>
      ))}
    </div>
  );
}

/** Add / rename / remove brand colors, only reachable behind the Colors
 *  subsection's Edit button, matching every other field's edit affordance. */
function ColorsEditor({ colors, onChange }: { colors: BrandColor[]; onChange: (colors: BrandColor[]) => void }) {
  const update = (i: number, patch: Partial<BrandColor>) => onChange(colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i: number) => onChange(colors.filter((_, idx) => idx !== i));
  const add = () => onChange([...colors, { hex: '#CCCCCC', name: '' }]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: c.hex, border: '1px solid var(--dark-8)', flexShrink: 0 }} />
            <TextField value={c.hex} onChange={(v) => update(i, { hex: v })} placeholder="#RRGGBB" style={{ width: 110, flexShrink: 0 }} />
            <TextField value={c.name} onChange={(v) => update(i, { name: v })} placeholder="Color name" fullWidth />
            <IconButton size="sm" variant="ghost" icon={Trash2} title="Remove color" onPress={() => remove(i)} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={add}>Add color</Button>
      </div>
    </div>
  );
}

/** Add / rename / remove brand fonts, only reachable behind the Fonts
 *  subsection's Edit button, matching every other field's edit affordance. */
function FontsEditor({ fonts, onChange }: { fonts: BrandFont[]; onChange: (fonts: BrandFont[]) => void }) {
  const update = (i: number, patch: Partial<BrandFont>) => onChange(fonts.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(fonts.filter((_, idx) => idx !== i));
  const add = () => onChange([...fonts, { family: 'Inter', role: 'Body' }]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fonts.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Select value={f.family} onChange={(v) => update(i, { family: v })} options={fontFamilyOptionsFor(f.family)} fullWidth />
            <Select value={f.role} onChange={(v) => update(i, { role: v as BrandFont['role'] })} options={FONT_ROLE_OPTIONS} style={{ width: 140, flexShrink: 0 }} />
            <IconButton size="sm" variant="ghost" icon={Trash2} title="Remove font" onPress={() => remove(i)} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={add}>Add font</Button>
      </div>
    </div>
  );
}

/** Read-only chip grid, shared by "Channels they're on" and "Channels to
 *  develop plans around" before the client taps Edit. */
function ChannelPills({ channels }: { channels: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {channels.map((c) => <Pill key={c} size="lg">{c}</Pill>)}
    </div>
  );
}

/** Add / remove arbitrary channels, free text, for "Channels they're on". */
function ChannelsEditor({ channels, onChange }: { channels: string[]; onChange: (channels: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const commit = () => {
    const t = draft.trim();
    if (t && !channels.includes(t)) onChange([...channels, t]);
    setDraft('');
    setAdding(false);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {channels.map((c) => (
        <Chip key={c} deletable onDelete={() => onChange(channels.filter((x) => x !== c))}>{c}</Chip>
      ))}
      {adding ? (
        <TextField
          autoFocus
          value={draft}
          placeholder="Add channel"
          onChange={setDraft}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
          style={{ width: 160 }}
        />
      ) : (
        <Chip variant="add" onClick={() => setAdding(true)}>Add channel</Chip>
      )}
    </div>
  );
}

/** Toggle membership in a fixed candidate list, for "Channels to develop
 *  plans around", where the options come from the audit, not free text. */
function PlanChannelsEditor({ selected, onChange }: { selected: string[]; onChange: (channels: string[]) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {S.PLAN_CHANNELS.map((c) => {
        const on = selected.includes(c);
        return (
          <Chip key={c} selected={on} onSelectionChange={(sel) => onChange(sel ? [...selected, c] : selected.filter((x) => x !== c))}>{c}</Chip>
        );
      })}
    </div>
  );
}

/** Read-only tagged event list: Major events before the client taps Edit. */
function EventsRead({ events }: { events: GoalEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text style={{ flex: 1, color: 'var(--dark-90)' }}>{e.label}</Text>
          <Text variant="metadata" color="var(--dark-60)">{fmtEventDate(e.when)}</Text>
          <Pill size="md">{e.tag}</Pill>
        </div>
      ))}
    </div>
  );
}

/** Add / edit / remove / retag major events: a repeating list of label +
 *  date + Company/Industry toggle, matching the AM goals page's editing UI. */
function EventsEditor({ events, onChange }: { events: GoalEvent[]; onChange: (events: GoalEvent[]) => void }) {
  const update = (i: number, patch: Partial<GoalEvent>) => onChange(events.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const remove = (i: number) => onChange(events.filter((_, idx) => idx !== i));
  const add = () => onChange([...events, { label: '', when: '', tag: 'Company' }]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TextField value={e.label} onChange={(v) => update(i, { label: v })} placeholder="Event" fullWidth />
            <input
              type="date"
              value={e.when}
              onChange={(ev) => update(i, { when: ev.target.value })}
              style={{ borderRadius: 6, border: '1px solid var(--dark-8)', padding: '5px 8px', fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-90)', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', padding: 2, borderRadius: 6, background: 'var(--dark-3)', flexShrink: 0 }}>
              {(['Company', 'Industry'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update(i, { tag: t })}
                  style={{
                    padding: '3px 8px', borderRadius: 4, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: e.tag === t ? 'var(--light-100)' : 'transparent',
                    color: e.tag === t ? 'var(--dark-90)' : 'var(--dark-60)',
                    border: e.tag === t ? '1px solid var(--dark-8)' : '1px solid transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <IconButton size="sm" variant="ghost" icon={Trash2} title="Remove event" onPress={() => remove(i)} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={add}>Add event</Button>
      </div>
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

/* ─── Creative phase: per-item approve/request-changes, mirroring the
 * Approvals tab's ContentCard interaction (see Approvals.tsx) rather than
 * PR97's AM-only AssetCard/Calendar authoring tools. PR97's real "Campaign
 * calendar" AM step has no per-item approval UI at all (it's a day-by-day
 * scheduling CRUD tool). Since the client needs to approve individual
 * content in BOTH views, both views here share one item list built from
 * S.generatedAssets, grouped by asset type ("Visual review") and by the
 * account's real S.seasonalThemes week ("Campaign calendar"). ─────────────*/

interface CreativeItem extends GeneratedAsset { week: string }

const CREATIVE_ASSET_TYPES: GeneratedAsset['type'][] = ['Still Image', 'Video', 'Carousel', 'Story', 'Search Ad', 'Meta Ad', 'Blog Post', 'Email'];

function buildCreativeItems(account: Account): CreativeItem[] {
  const theme = S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0];
  const assets = S.generatedAssets(account, theme.title);
  const weeks = S.seasonalThemes(account);
  // Two of each asset type, a representative "first wave", not the full
  // 24-asset backlog, spread two per week to match the seasonal calendar.
  const items: CreativeItem[] = [];
  CREATIVE_ASSET_TYPES.forEach((type, typeIdx) => {
    assets.filter((a) => a.type === type).slice(0, 2).forEach((a, i) => {
      items.push({ ...a, week: weeks[(typeIdx * 2 + i) % weeks.length].week });
    });
  });
  return items;
}

// Same on-brand Grain Design Flooring photography used on the Approvals tab,
// cycled by index so every card gets a real (not generic placeholder) photo.
const CREATIVE_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop',
];

const CREATIVE_TYPE_META: Record<GeneratedAsset['type'], { icon: typeof VideoOn; color: string; aspect: string }> = {
  'Still Image': { icon: Camera1, color: 'var(--red-70)', aspect: '4 / 5' },
  Video: { icon: VideoOn, color: 'var(--purple)', aspect: '9 / 16' },
  Carousel: { icon: FileMultiple, color: 'var(--status-connect)', aspect: '4 / 5' },
  Story: { icon: Iphone02, color: 'var(--status-new)', aspect: '9 / 16' },
  'Search Ad': { icon: Google, color: 'var(--status-posting)', aspect: '1 / 1' },
  'Meta Ad': { icon: MetaBrand, color: 'var(--status-posting)', aspect: '1 / 1' },
  'Blog Post': { icon: Document, color: 'var(--status-approved)', aspect: '16 / 9' },
  Email: { icon: Mail, color: 'var(--status-review)', aspect: '16 / 9' },
};

type CreativeStatus = 'pending' | 'approved' | 'changes';

/** Status banner shown once a card is decided, mirrors Approvals.tsx's
 *  DecisionBanner. */
function CreativeDecisionBanner({ status, note }: { status: Exclude<CreativeStatus, 'pending'>; note?: string }) {
  const approved = status === 'approved';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: approved ? 'rgba(4,175,0,0.07)' : 'rgba(174,34,34,0.06)', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {approved ? <Check2 size={16} color="var(--status-approved)" /> : <Edit3 size={16} color="var(--red-70)" />}
        <Text style={{ fontSize: 13, fontWeight: 500, color: approved ? 'var(--status-approved)' : 'var(--red-70)' }}>{approved ? 'Approved' : 'Changes requested'}</Text>
      </div>
      {!approved && note && <Text variant="metadata" color="var(--dark-70)" style={{ lineHeight: 1.5 }}>{note}</Text>}
    </div>
  );
}

/** One approvable creative card: image, caption, and inline Approve /
 *  Request changes actions, adapted directly from Approvals.tsx's
 *  ContentCard so the client's creative review feels like the Approvals tab. */
function CreativeCard({ item, image, status, note, onApprove, onRequestChanges }: {
  item: CreativeItem; image: string; status: CreativeStatus; note?: string; onApprove: () => void; onRequestChanges: (note: string) => void;
}) {
  const decided = status !== 'pending';
  const meta = CREATIVE_TYPE_META[item.type];
  const TypeIcon = meta.icon;
  const textOnly = item.type === 'Blog Post' || item.type === 'Email';
  const [requesting, setRequesting] = useState(false);
  const [draft, setDraft] = useState('');

  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: decided ? 0.92 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 14px 8px' }}>
        <TypeIcon size={16} color={meta.color} />
        <Text style={{ fontSize: 13, color: 'var(--dark-80)' }}>{item.type}</Text>
      </div>
      <div style={{ padding: '0 14px' }}>
        <div style={{ position: 'relative', aspectRatio: meta.aspect, borderRadius: 8, overflow: 'hidden', background: 'var(--dark-4)' }}>
          {textOnly ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'var(--dark-40)', fontWeight: 600, fontSize: 13 }}>{item.type}</Text>
            </div>
          ) : item.type === 'Story' ? (
            <StoryPreview image={image} brandInitial="G" brandName="Grain Design Flooring" headline={item.overlay} />
          ) : item.type === 'Video' ? (
            <ReelPreview image={image} brandInitial="G" brandName="Grain Design Flooring" caption={item.caption} />
          ) : (
            <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
      </div>
      <div style={{ padding: '12px 14px 8px' }}>
        <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginBottom: 4 }}>{item.overlay}</Text>
        <Text variant="metadata" color="var(--dark-70)" style={{ display: 'block', lineHeight: 1.5 }} lineClamp={3}>{item.caption}</Text>
      </div>
      <div style={{ marginTop: 'auto', padding: '8px 14px 14px' }}>
        {decided ? (
          <CreativeDecisionBanner status={status} note={note} />
        ) : requesting ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TextArea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What would you like changed?" style={{ minHeight: 72, fontSize: 13 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" size="sm" onPress={() => { setRequesting(false); setDraft(''); }}>Cancel</Button>
              <Button variant="primary" size="sm" isDisabled={!draft.trim()} onPress={() => { onRequestChanges(draft); setRequesting(false); }}>Send request</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" size="sm" frontIcon={Edit3} onPress={() => setRequesting(true)}>Request changes</Button>
            <Button variant="green" size="sm" frontIcon={Check2} onPress={onApprove}>Approve</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Creative phase screen: replaces the generic per-field ReviewSection flow
 *  with a per-item approvals grid (Approvals-tab style), shown two ways:
 *  grouped by format ("Visual review") and by week ("Campaign calendar"). */
function CreativeReviewScreen({ account, onSubmitted }: { account: Account; onSubmitted: (body: string) => void }) {
  const navigate = useNavigate();
  const items = useMemo(() => buildCreativeItems(account), [account]);
  const [statuses, setStatuses] = useState<Record<string, CreativeStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const decidedCount = items.filter((i) => (statuses[i.id] ?? 'pending') !== 'pending').length;
  const approve = (id: string) => setStatuses((prev) => ({ ...prev, [id]: 'approved' }));
  const requestChanges = (id: string, note: string) => { setStatuses((prev) => ({ ...prev, [id]: 'changes' })); setNotes((prev) => ({ ...prev, [id]: note })); };

  const byType = CREATIVE_ASSET_TYPES.map((type) => ({ type, items: items.filter((i) => i.type === type) })).filter((g) => g.items.length);
  const weeks = useMemo(() => S.seasonalThemes(account), [account]);
  const byWeek = weeks.map((w) => ({ week: w, items: items.filter((i) => i.week === w.week) })).filter((g) => g.items.length);

  const submit = () => {
    let finalStatuses = statuses;
    if (decidedCount === 0) {
      finalStatuses = Object.fromEntries(items.map((i) => [i.id, 'approved' as const]));
      setStatuses(finalStatuses);
    }
    const changes = items.filter((i) => finalStatuses[i.id] === 'changes').length;
    const body = changes > 0
      ? `We shared ${changes} change request${changes === 1 ? '' : 's'} with the team. ${account.am.name} will follow up with the next version.`
      : `Everything's approved and sent to ${account.am.name}.`;
    onSubmitted(body);
  };

  return (
    <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <Heading level={2} style={{ marginTop: 0 }}>Review your first creative</Heading>
          <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '6px 0 24px', lineHeight: 1.6 }}>
            {account.am.name} put this together for {account.name}. Approve each piece or request changes with a note. It goes straight back to the team.
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            <section>
              <Heading level={3} style={{ margin: 0, paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>Visual review</Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 24 }}>
                {byType.map(({ type, items: typeItems }) => (
                  <div key={type}>
                    <Heading level={5} style={{ margin: '0 0 12px' }}>{type}</Heading>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {typeItems.map((item, i) => (
                        <CreativeCard
                          key={item.id}
                          item={item}
                          image={CREATIVE_IMAGES[(CREATIVE_ASSET_TYPES.indexOf(type) * 2 + i) % CREATIVE_IMAGES.length]}
                          status={statuses[item.id] ?? 'pending'}
                          note={notes[item.id]}
                          onApprove={() => approve(item.id)}
                          onRequestChanges={(note) => requestChanges(item.id, note)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Heading level={3} style={{ margin: 0, paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>Campaign calendar</Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 24 }}>
                {byWeek.map(({ week, items: weekItems }) => (
                  <div key={week.week}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                      <Heading level={5} style={{ margin: 0 }}>Week of {week.week}</Heading>
                      <Text variant="metadata" color="var(--dark-60)">{week.title}</Text>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                      {weekItems.map((item) => {
                        const globalIdx = items.findIndex((i) => i.id === item.id);
                        return (
                          <CreativeCard
                            key={item.id}
                            item={item}
                            image={CREATIVE_IMAGES[globalIdx % CREATIVE_IMAGES.length]}
                            status={statuses[item.id] ?? 'pending'}
                            note={notes[item.id]}
                            onApprove={() => approve(item.id)}
                            onRequestChanges={(note) => requestChanges(item.id, note)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
        <div style={{ justifySelf: 'start' }}>
          <Button variant="ghost" size="lg" onPress={() => navigate(BASE)}>Cancel</Button>
        </div>
        <Text variant="secondary" color="var(--dark-60)">{decidedCount} of {items.length} reviewed</Text>
        <div style={{ justifySelf: 'end' }}>
          <Button size="lg" onPress={submit}>{decidedCount === 0 ? 'Approve All' : 'Submit feedback'}</Button>
        </div>
      </div>
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

/* ─── dfy-client route export + seed ─────────────────────────────────────────
 * PR97 starts every packet as 'draft' (→ "This review isn't ready yet"). Here
 * the client always lands ready, so a tiny mount effect shares the strategy
 * packet before rendering ClientReview. Submit still flips it to 'submitted'. */
function StrategyReviewBody() {
  const { packet, share } = useReview();
  useEffect(() => {
    if (packet('strategy') === 'draft') share('strategy');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <ClientReview account={GRAIN_ACCOUNT} phase="strategy" />;
}

export function ReviewStrategy() {
  return (
    <ClientShell section="review-strategy" title={<BackTitle label="Review your strategy" />}>
      <ReviewProvider>
        <StrategyReviewBody />
      </ReviewProvider>
    </ClientShell>
  );
}
