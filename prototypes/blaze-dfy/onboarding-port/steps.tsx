import { useState, type ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, Chip, Pill } from '@/staging';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import Edit1 from '@/icons/20/Edit1';
import { TextInput as Input, TextArea as Textarea, SectionHeading, AddLink, RemoveX, TokenInput } from '../ui';
import {
  GOALS,
  DEFAULT_PLAN,
  MAJOR_EVENTS,
  PLAN_CHANNELS,
  SWIPE_FILE,
  type Goals,
  type MajorEvent,
  type SwipeItem,
} from './data';

/**
 * SwipeStep + GoalsStep bodies, ported 1:1 (web) from the H2 web onboarding
 * rework (origin/prototype/h2-onboarding-rework:
 * prototypes/h2/cold-flows/StrategyFlow.tsx).
 *
 * Adapted for blaze-dfy: H2's `../_ui` Input/Textarea map to blaze-dfy's local
 * `ui.tsx` TextInput/TextArea (same event-based onChange), and cold-flow-shell's
 * SectionHeading/AddLink/RemoveX map to the local `ui.tsx` equivalents. The
 * full-flow chrome (FlowTakeover/FlowFooter/onboarding-context navigation) is
 * dropped. These render standalone inside an existing blaze-dfy page. The only
 * chrome kept is FlowHeader (title + subtitle), reproduced locally below.
 */

// ─── FlowHeader, per-step heading block (eyebrow + title + subtitle) ────────
// Reproduced 1:1 from cold-flow-shell's FlowHeader.

export function FlowHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {eyebrow && (
        <Text
          variant="metadata"
          style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12, fontWeight: 500, marginBottom: 8 }}
        >
          {eyebrow}
        </Text>
      )}
      <Heading level={1} style={{ fontSize: 30, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: subtitle ? 8 : 0 }}>
        {title}
      </Heading>
      {subtitle && (
        <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, lineHeight: 1.5, maxWidth: 640 }}>
          {subtitle}
        </Text>
      )}
    </div>
  );
}

// ─── Swipe file ──────────────────────────────────────────────────────────────

export function SwipeStep() {
  const [swipe, setSwipe] = useState<Record<string, 'like' | 'dislike' | undefined>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const [brands, setBrands] = useState<{ name: string; url: string }[]>([
    { name: 'Sherwin-Williams', url: 'instagram.com/sherwinwilliams' },
    { name: 'Five Star Painting', url: 'fivestarpainting.com' },
  ]);

  const reactions = (id: string) => {
    const r = swipe[id];
    const open = !!notesOpen[id];
    return (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: open ? 8 : 0 }}>
          <Button variant={r === 'like' ? 'primary' : 'secondary'} size="sm" frontIcon={ThumbUp} onPress={() => setSwipe({ ...swipe, [id]: r === 'like' ? undefined : 'like' })}>Like</Button>
          <Button variant={r === 'dislike' ? 'primary' : 'secondary'} size="sm" frontIcon={ThumbDown} onPress={() => setSwipe({ ...swipe, [id]: r === 'dislike' ? undefined : 'dislike' })}>Not for us</Button>
          <Button variant={open ? 'primary' : 'secondary'} size="sm" frontIcon={Edit1} onPress={() => setNotesOpen({ ...notesOpen, [id]: !open })}>Add notes</Button>
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
        <SectionHeading title="Brands you admire" desc="Brands you love. We'll study their look, voice, and paid creative." />
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
    </div>
  );
}

/** Swipe-card preview, an image at the format's native aspect ratio, or a
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
        src={`https://picsum.photos/seed/swipe-${item.id}/${w}/${h}`}
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

// ─── Goals & theme ─────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text variant="largeList" style={{ display: 'block', marginBottom: 8 }}>{label}</Text>
      <div>{children}</div>
    </div>
  );
}

/** Read-only value display used when a Goals field is not being edited. */
function ReadValue({ children }: { children: ReactNode }) {
  return <Text variant="secondary" color="var(--dark-80)" style={{ display: 'block', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{children || '-'}</Text>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtMonth = (w: string) => { const [y, m] = (w || '').split('-'); return m ? `${MONTHS[+m - 1]} ${y}` : (w || '-'); };

/** Section metadata shared by the pre-submission GoalsStep and the client
 *  review, so both render the exact same headings in the same order. */
export interface GoalsSectionMeta { id: string; title: string; note?: string; desc?: string }
export const GOALS_SECTIONS: GoalsSectionMeta[] = [
  { id: 'success', title: 'What does success look like?', note: 'Drafted from your goals and the audit.' },
  { id: 'history', title: 'Marketing history', note: 'Summarized from your intake and current channels.' },
  { id: 'events', title: 'Major events', desc: 'Dates worth planning campaigns around. Tag each as company or industry.' },
  { id: 'plan', title: 'Channels to develop plans around', note: "Pre-selected from the audit's biggest gaps, paid-first." },
];

/** Goals section headline, H3 with a divider underneath (except Major events),
 *  and an optional right slot for the review's verdict buttons. Shared by the
 *  pre-submission GoalsStep and the client review so both stay identical. */
export function GoalsSectionHead({ id, title, right }: { id: string; title: string; right?: ReactNode }) {
  const divider = id !== 'events';
  return (
    <div style={{ marginBottom: divider ? 20 : 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
        {right}
      </div>
      {divider && <div style={{ marginTop: 12, borderTop: '1px solid var(--dark-8)' }} />}
    </div>
  );
}

/** Per-subsection edit controller, the review passes this so each field toggles
 *  its own read/edit state. Absent (pre-submission) → always editable. */
export interface EditControl { isEditing: (key: string) => boolean; toggle: (key: string) => void }
interface EditableProps { ctrl?: EditControl; onEdit?: () => void }

/** One subsection. Pre-submission (no ctrl): always-editable, label-above-field.
 *  Review (ctrl): read-only with a per-subsection Edit toggle to reveal `edit`. */
function SubField({ ctrl, fieldKey, label, read, edit }: { ctrl?: EditControl; fieldKey: string; label?: string; read: ReactNode; edit: ReactNode }) {
  if (!ctrl) return label ? <FieldRow label={label}>{edit}</FieldRow> : <>{edit}</>;
  const editing = ctrl.isEditing(fieldKey);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: label ? 'space-between' : 'flex-end', alignItems: 'center', gap: 12, marginBottom: label ? 8 : 8 }}>
        {label && <Text variant="largeList">{label}</Text>}
        <Button size="xs" variant={editing ? 'primary' : 'secondary'} frontIcon={Edit1} onPress={() => ctrl.toggle(fieldKey)}>{editing ? 'Done' : 'Edit'}</Button>
      </div>
      {editing ? edit : read}
    </div>
  );
}

/** Each Goals section's fields, extracted so the pre-submission screen (always
 *  editable) and the client review (read-only, per-subsection Edit) share one
 *  rendering. */
export function SuccessFields({ g, setG, ctrl, onEdit }: EditableProps & { g: Goals; setG: (v: Goals) => void }) {
  return (
    <>
      {([['First 30 days', 'thirty'], ['By 60 days', 'sixty'], ['By 90 days', 'ninety']] as const).map(([label, key]) => (
        <SubField key={key} ctrl={ctrl} fieldKey={key} label={label}
          read={<ReadValue>{g[key]}</ReadValue>}
          edit={<Textarea value={g[key]} onChange={(e) => { setG({ ...g, [key]: e.target.value }); onEdit?.(); }} style={{ minHeight: 68 }} />}
        />
      ))}
    </>
  );
}

export function HistoryFields({ g, setG, channels, setChannels, ctrl, onEdit }: EditableProps & { g: Goals; setG: (v: Goals) => void; channels: string[]; setChannels: (v: string[]) => void }) {
  const rows: [string, keyof Goals][] = [["What's driving growth?", 'drivingGrowth'], ["What's worked?", 'worked'], ["What hasn't worked?", 'notWorked']];
  return (
    <>
      <SubField ctrl={ctrl} fieldKey="channels" label="Channels they're on"
        read={<TokenInput tokens={channels} setTokens={setChannels} placeholder="Add channel" readOnly />}
        edit={<TokenInput tokens={channels} setTokens={(v) => { setChannels(v); onEdit?.(); }} placeholder="Add channel" />}
      />
      {rows.map(([label, key]) => (
        <SubField key={key} ctrl={ctrl} fieldKey={key} label={label}
          read={<ReadValue>{g[key] as string}</ReadValue>}
          edit={<Textarea value={g[key] as string} onChange={(e) => { setG({ ...g, [key]: e.target.value } as Goals); onEdit?.(); }} style={{ minHeight: 60 }} />}
        />
      ))}
    </>
  );
}

export function EventsFields({ events, setEvents, ctrl, onEdit }: EditableProps & { events: MajorEvent[]; setEvents: (v: MajorEvent[]) => void }) {
  const set = (v: MajorEvent[]) => { setEvents(v); onEdit?.(); };
  const read = (
    <div style={{ borderRadius: 10, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
          <Text variant="secondary" color="var(--dark-90)" style={{ flex: 1 }}>{e.label}</Text>
          <Text variant="metadata" color="var(--dark-60)">{fmtMonth(e.when)}</Text>
          <Pill size="md">{e.tag}</Pill>
        </div>
      ))}
    </div>
  );
  const edit = (
    <>
      <div style={{ borderRadius: 10, border: '1px solid var(--dark-8)', overflow: 'hidden' }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: i ? '1px solid var(--dark-4)' : 'none' }}>
            <input
              value={e.label}
              onChange={(ev) => set(events.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))}
              placeholder="Event"
              style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: 'var(--dark-90)', outline: 'none' }}
            />
            <input
              type="month"
              value={e.when}
              onChange={(ev) => set(events.map((x, j) => (j === i ? { ...x, when: ev.target.value } : x)))}
              style={{ borderRadius: 6, border: '1px solid var(--dark-8)', padding: '5px 8px', fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-90)' }}
            />
            <div style={{ display: 'flex', padding: 2, borderRadius: 6, background: 'var(--dark-3)' }}>
              {(['Company', 'Industry'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => set(events.map((x, j) => (j === i ? { ...x, tag: t } : x)))}
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
            <RemoveX onClick={() => set(events.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        <AddLink label="Add event" onClick={() => set([...events, { label: '', when: '', tag: 'Company' }])} />
      </div>
    </>
  );
  return <SubField ctrl={ctrl} fieldKey="events" read={read} edit={edit} />;
}

export function PlanFields({ plan, setPlan, ctrl, onEdit }: EditableProps & { plan: string[]; setPlan: (v: string[]) => void }) {
  const read = <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{plan.map((c) => <Pill key={c} size="xl">{c}</Pill>)}</div>;
  const edit = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PLAN_CHANNELS.map((c) => {
        const on = plan.includes(c);
        return (
          <Chip key={c} selected={on} onSelectionChange={(sel: boolean) => { setPlan(sel ? [...plan, c] : plan.filter((x) => x !== c)); onEdit?.(); }}>
            {c}
          </Chip>
        );
      })}
    </div>
  );
  return <SubField ctrl={ctrl} fieldKey="plan" read={read} edit={edit} />;
}

export function GoalsStep() {
  const [g, setG] = useState<Goals>({ ...GOALS });
  const [channels, setChannels] = useState<string[]>(GOALS.channels);
  const [plan, setPlan] = useState<string[]>(DEFAULT_PLAN);
  const [events, setEvents] = useState<MajorEvent[]>(MAJOR_EVENTS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div>
        <GoalsSectionHead id={GOALS_SECTIONS[0].id} title={GOALS_SECTIONS[0].title} />
        <SuccessFields g={g} setG={setG} />
      </div>
      <div>
        <GoalsSectionHead id={GOALS_SECTIONS[1].id} title={GOALS_SECTIONS[1].title} />
        <HistoryFields g={g} setG={setG} channels={channels} setChannels={setChannels} />
      </div>
      <div>
        <GoalsSectionHead id={GOALS_SECTIONS[2].id} title={GOALS_SECTIONS[2].title} />
        <EventsFields events={events} setEvents={setEvents} />
      </div>
      <div>
        <GoalsSectionHead id={GOALS_SECTIONS[3].id} title={GOALS_SECTIONS[3].title} />
        <PlanFields plan={plan} setPlan={setPlan} />
      </div>
    </div>
  );
}
