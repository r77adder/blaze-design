import {
  useState, useRef, useEffect,
  type ComponentType, type CSSProperties, type ReactNode,
  type InputHTMLAttributes, type TextareaHTMLAttributes,
} from 'react';
import { Heading, Text, Button, IconButton } from '@/components';
import { StatusPill, Chip, Avatar, Select, useToast } from '@/staging';
import type { IconProps } from '@/icons/Types';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Palette from '@/icons/20/Palette';
import Voice from '@/icons/20/Voice';
import Images from '@/icons/20/Images';
import SourceMaterialIcon from '@/icons/20/SourceMaterial';
import Check2 from '@/icons/20/Check2';
import Edit3 from '@/icons/20/Edit3';
import Trash2 from '@/icons/20/Trash2';
import Plus from '@/icons/20/Plus';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Document from '@/icons/20/Document';
import LinkExternal from '@/icons/20/LinkExternal';
import Upload from '@/icons/20/Upload';
import { ClientShell } from './shell';

/**
 * Client Brand Kit: Grain Design Flooring (Austin, TX).
 *
 * Self-contained rewrite (no ../h2/brand-kit imports, no BrandKitProvider). The
 * left sub-rail IA + ClientShell wrapper are kept from the original; every
 * sub-page authors Grain Design Flooring content so the portal is internally
 * consistent (the rest of the dfy-client portal is Grain Design Flooring).
 * View-only.
 */

type TabId = 'brand-profile' | 'brand-style' | 'brand-voice' | 'media-library' | 'source-materials';

interface NavEntry {
  id: TabId;
  label: string;
  icon: ComponentType<IconProps>;
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'brand-profile', label: 'Brand Profile', icon: UserProfileCircle },
  { id: 'brand-style', label: 'Brand Style', icon: Palette },
  { id: 'brand-voice', label: 'Brand Voice', icon: Voice },
  { id: 'media-library', label: 'Media Library', icon: Images },
  { id: 'source-materials', label: 'Source Materials', icon: SourceMaterialIcon },
];

const DEFAULT_TAB: TabId = 'brand-profile';

export function BrandKit({ sub }: { sub?: string }) {
  const initial = NAV_ITEMS.find((n) => n.id === sub)?.id ?? DEFAULT_TAB;
  const [tab, setTab] = useState<TabId>(initial);

  return (
    <ClientShell section="brand-kit">
      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 32, padding: '8px 4px 80px', maxWidth: 960, margin: '0 auto' }}>
        {/* section: left sub-rail */}
        <LeftRail activeId={tab} onSelect={setTab} />

        {/* section: active sub-page */}
        <div style={{ minWidth: 0 }}>
          {tab === 'brand-profile' && <BrandProfile />}
          {tab === 'brand-style' && <BrandStyle />}
          {tab === 'brand-voice' && <BrandVoice />}
          {tab === 'media-library' && <MediaLibrary />}
          {tab === 'source-materials' && <SourceMaterials />}
        </div>
      </div>
    </ClientShell>
  );
}

function LeftRail({ activeId, onSelect }: { activeId: TabId; onSelect: (id: TabId) => void }) {
  return (
    <nav aria-label="Brand Kit sections" style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
      {NAV_ITEMS.map((item) => (
        <RailItem key={item.id} icon={item.icon} active={item.id === activeId} onSelect={() => onSelect(item.id)}>
          {item.label}
        </RailItem>
      ))}
    </nav>
  );
}

function RailItem({ icon: Icon, active, onSelect, children }: { icon: ComponentType<IconProps>; active: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 12px', width: '100%', textAlign: 'left',
        background: active ? 'var(--dark-4)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer',
        color: active ? 'var(--dark-90)' : 'var(--dark-80)', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 500 : 400,
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--dark-2)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={20} color={active ? 'var(--dark-90)' : 'var(--dark-60)'} />
      <Text style={{ fontSize: 14, color: 'inherit', fontWeight: 'inherit' }}>{children}</Text>
    </button>
  );
}

// ─── Shared sub-page primitives ──────────────────────────────────────

/** Section header: shows the section name as the page header and a per-section
 *  "Request changes" control. The client can't edit the brand kit directly, but
 *  can ask their account manager to update any section. The button reveals a
 *  note box (in normal flow, below the header); sending fires a toast. */
function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const anchorRef = useRef<HTMLSpanElement>(null);

  // Close the request-changes popover on any click outside its anchor.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const send = () => { setOpen(false); setNote(''); showToast({ message: `Change requested for ${title}. Your account manager will update it.` }); };

  return (
    <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--dark-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          <Heading level={2} style={{ margin: 0, fontSize: 22 }}>{title}</Heading>
          {children}
        </div>
        {/* Request changes, anchored popover so the input never pushes the page down */}
        <span ref={anchorRef} style={{ position: 'relative', flexShrink: 0, display: 'inline-flex' }}>
          <Button variant="secondary" size="sm" frontIcon={Edit3} onPress={() => setOpen((o) => !o)}>
            Request changes
          </Button>
          {open && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 30, width: 360,
                background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12,
                boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16,
                display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left',
              }}
            >
              <Text variant="metadata" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
                What should we change about {title}? Your account manager will follow up.
              </Text>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe the change…"
                style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '1px solid var(--dark-8)', padding: '10px 12px', fontFamily: 'Sohne, sans-serif', fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="ghost" size="sm" onPress={() => { setOpen(false); setNote(''); }}>Cancel</Button>
                <Button variant="primary" size="sm" isDisabled={!note.trim()} onPress={send}>Send request</Button>
              </div>
            </div>
          )}
        </span>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={3} style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--dark-60)' }}>{title}</Heading>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </section>
  );
}

function BodyParagraph({ children }: { children: ReactNode }) {
  return <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)' }}>{children}</p>;
}

function BulletList({ children }: { children: ReactNode }) {
  return <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)' }}>{children}</ul>;
}

interface PanelProps {
  title: string;
  children: ReactNode;
  bodyStyle?: CSSProperties;
}

function Panel({ title, children, bodyStyle }: PanelProps) {
  return (
    <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={4} style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{title}</Heading>
      </div>
      <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
    </div>
  );
}

// ─── Form-field primitives (token-styled native controls) ────────────

/** Shared token styling for native <input>/<select>/<textarea>. */
const FIELD_BASE: CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid var(--dark-8)', background: 'var(--light-100)',
  fontFamily: 'Sohne, sans-serif', fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', outline: 'none',
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)' }}>{children}</Text>;
}

function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...FIELD_BASE, borderRadius: 8, padding: '8px 12px', ...props.style }} />;
}

function EditTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...FIELD_BASE, minHeight: 96, borderRadius: 10, padding: '10px 12px', lineHeight: 1.5, resize: 'vertical', ...props.style,
      }}
    />
  );
}

// ─── Brand Profile ───────────────────────────────────────────────────

/** Default values for the two top-of-page selects + the editable prose/list
 *  sections. The client can edit all of these in-place (local state only). */
const BUSINESS_TYPES = ['Service', 'Product', 'Local service', 'E-commerce'];
const CONTENT_STRATEGIES = ['Educational / local authority', 'Educational', 'Local authority', 'Thought leadership', 'Promotional'];

const OVERVIEW_TEXT = `Grain Design Flooring is a premium, design-led flooring studio serving Austin, TX and the surrounding Hill Country (Westlake, Lakeway, Dripping Springs, Cedar Park). We specialize in hardwood, luxury vinyl plank (LVP), and tile for residential homes and light-commercial spaces.

We position on craftsmanship over commodity: "floors with character, built to last." Every project starts with an in-home design consultation (matching species, finish, and layout to the room's light and the home's style), and every installation is backed by a lifetime workmanship warranty, installed by trained in-house crews.`;

const SEGMENTS_TEXT = `Renovating homeowners in Westlake, Lakeway, and Dripping Springs
Past clients and referral relationships
Interior designers and custom builders
Luxury new-build owners specifying premium floors`;

const SERVICES_TEXT = `Hardwood installation (white oak, walnut, red oak)
Luxury vinyl plank (LVP)
Tile (porcelain, large-format, stone)
Dust-contained sanding & refinishing
In-home design consultation`;

const FOUNDER_TEXT = `Grain Design Flooring was founded by master craftsman Daniel Reyes, who spent fifteen years installing and refinishing floors across Central Texas before opening his own studio. Frustrated by warehouse-style flooring sold by the square foot, Daniel built Grain around a single idea: a floor is a design decision, not a commodity.

He leads every design consultation personally, matching species and finish to each home's light and architecture, and trains the in-house crews who carry out each install. His philosophy (natural materials, honest timelines, and work that ages well underfoot) runs through everything the studio touches.`;

interface CompetitorRow { id: string; name: string; channels: string; note: string; }

const SEED_COMPETITORS: CompetitorRow[] = [
  { id: 'c1', name: 'Floor & Decor', channels: 'Google Business Profile · Instagram · Facebook', note: 'Big-box specialty retailer with huge in-stock selection, price-led, no design service.' },
  { id: 'c2', name: 'LL Flooring', channels: 'Google Business Profile · Facebook', note: 'National flooring chain (formerly Lumber Liquidators); value hardwood and LVP, limited install support.' },
  { id: 'c3', name: 'The Home Depot (flooring services)', channels: 'Google Business Profile · YouTube', note: 'Home-improvement giant offering subcontracted flooring installs; convenient but impersonal.' },
  { id: 'c4', name: 'Austin Hardwood Co.', channels: 'Google Business Profile · Instagram', note: 'Local independent hardwood crew, strong on refinishing, lighter on design guidance.' },
  { id: 'c5', name: 'Hill Country Tile & Stone', channels: 'Google Business Profile · Houzz', note: 'Regional tile and stone contractor; overlaps on tile, not a full-service flooring studio.' },
];

/** Brief, editable Grain Design Flooring content for the collapsible
 *  "Additional context" group. */
const ADDITIONAL_CONTEXT: { id: string; title: string; kind: DisplayKind; text: string }[] = [
  {
    id: 'competitive-landscape', title: 'Competitive landscape', kind: 'prose',
    text: 'Austin flooring is split between price-led big-box retailers (Floor & Decor, Home Depot) and a long tail of independent installers. Grain competes on the gap between them: design-led consultation plus craftsman installation, at a premium tier neither side serves well.',
  },
  {
    id: 'visual-identity', title: 'Visual identity', kind: 'prose',
    text: 'Warm, natural, design-led. Walnut and oak browns grounded by a terracotta accent against limewash neutrals. Photography is real grain (close-up board texture, raking light on a finished floor, in-progress craftsmanship), never flat catalog swatches.',
  },
  {
    id: 'vocabulary-kpis', title: 'Industry vocabulary & KPIs', kind: 'list',
    text: `Vocabulary: species, finish, grain, patina, plank width, refinishing, subfloor, moisture barrier
KPIs: booked design consultations, install jobs per month, average project value, referral rate, review volume & rating`,
  },
  {
    id: 'content-angles', title: 'Social content angles', kind: 'list',
    text: `Before/after refinish reveals
Species & finish education ("oak vs. walnut for Austin light")
In-progress craftsmanship and crew spotlights
Design-consult tips and room-by-room guides`,
  },
  {
    id: 'industry-trends', title: 'Industry trends', kind: 'list',
    text: `Wide-plank white oak and natural matte finishes
LVP gaining share for durability and pets/kids
Sustainable and low-VOC finishes in demand
Herringbone and pattern layouts trending in luxury builds`,
  },
  {
    id: 'customer-reviews', title: 'Customer reviews', kind: 'prose',
    text: 'Clients consistently praise the in-home design consult, the dust-contained refinishing process, and crews who treat the home with care. Themes: "felt like a designer, not a salesperson," "spotless after sanding," and "the floor looks better than we imagined." 4.9 stars across Google and Houzz.',
  },
];

function BrandProfile() {
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [contentStrategy, setContentStrategy] = useState(CONTENT_STRATEGIES[0]);

  // Editable prose/list sections, committed to local state on Save.
  const [overview, setOverview] = useState(OVERVIEW_TEXT);
  const [segments, setSegments] = useState(SEGMENTS_TEXT);
  const [services, setServices] = useState(SERVICES_TEXT);
  const [founder, setFounder] = useState(FOUNDER_TEXT);

  return (
    <div>
      <SectionHeading title="Brand Profile" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }}>
        {/* section: top dropdowns */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel>Business type</FieldLabel>
            <Select fullWidth value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES.map((t) => ({ value: t, label: t }))} />
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <FieldLabel>Content strategy</FieldLabel>
            <Select fullWidth value={contentStrategy} onChange={setContentStrategy} options={CONTENT_STRATEGIES.map((s) => ({ value: s, label: s }))} />
          </div>
        </div>

        {/* section: editable content sections */}
        <EditableSection title="Business overview" kind="prose" value={overview} onSave={setOverview} />
        <EditableSection title="Customer segments" kind="list" value={segments} onSave={setSegments} />
        <EditableSection title="Services / products" kind="list" value={services} onSave={setServices} />
        <EditableSection title="Founder bio" kind="prose" value={founder} onSave={setFounder} />

        {/* section: direct competitors (CRUD) */}
        <CompetitorsSection />

        {/* section: additional context (collapsibles) */}
        <AdditionalContext />
      </div>
    </div>
  );
}

// ─── Editable content section (Edit → textarea → Save/Cancel) ────────

type DisplayKind = 'prose' | 'list';

/** A titled section whose body the client can edit in place. `prose` renders
 *  blank-line-separated paragraphs; `list` renders each non-empty line as a
 *  bullet. The textarea always edits the raw multi-line text. */
function EditableSection({
  title, kind, value, onSave,
}: { title: string; kind: DisplayKind; value: string; onSave: (next: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => { setDraft(value); setEditing(true); };
  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
        {!editing && (
          <Button variant="secondary" size="sm" frontIcon={Edit3} onPress={startEdit}>Edit</Button>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <EditTextarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" onPress={save}>Save</Button>
              <Button variant="ghost" size="sm" onPress={cancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <SectionBody kind={kind} value={value} />
        )}
      </div>
    </section>
  );
}

/** Renders committed section text as prose paragraphs or a bullet list. */
function SectionBody({ kind, value }: { kind: DisplayKind; value: string }) {
  if (kind === 'list') {
    const items = value.split('\n').map((l) => l.trim()).filter(Boolean);
    return (
      <BulletList>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </BulletList>
    );
  }
  const paragraphs = value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {paragraphs.map((p, i) => <BodyParagraph key={i}>{p}</BodyParagraph>)}
    </div>
  );
}

// ─── Direct competitors (add / edit / remove) ────────────────────────

/** First-letter initials for the avatar fallback (max 2 chars). */
const initials = (name: string) => name.trim() ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';

function CompetitorsSection() {
  const [comps, setComps] = useState<CompetitorRow[]>(SEED_COMPETITORS);
  const [editing, setEditing] = useState<string | null>(null);

  const add = () => {
    const id = `c${Date.now()}`;
    setComps((prev) => [...prev, { id, name: '', channels: '', note: '' }]);
    setEditing(id);
  };
  const remove = (id: string) => { setComps((prev) => prev.filter((c) => c.id !== id)); if (editing === id) setEditing(null); };
  const update = (id: string, patch: Partial<CompetitorRow>) => setComps((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <section>
      <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--dark-8)' }}>
        <Heading level={3} style={{ margin: 0 }}>Direct competitors</Heading>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {comps.map((c) => (
          <CompetitorCard
            key={c.id}
            comp={c}
            isEditing={editing === c.id}
            onEdit={() => setEditing(c.id)}
            onDone={() => setEditing(null)}
            onRemove={() => remove(c.id)}
            onChange={(patch) => update(c.id, patch)}
          />
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={add}>Add a competitor</Button>
      </div>
    </section>
  );
}

function CompetitorCard({
  comp, isEditing, onEdit, onDone, onRemove, onChange,
}: {
  comp: CompetitorRow;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<CompetitorRow>) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)' }}>
      <Avatar fallback={initials(comp.name)} size={32} style={{ flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TextField autoFocus value={comp.name} placeholder="Competitor name" onChange={(e) => onChange({ name: e.target.value })} />
            <TextField value={comp.channels} placeholder="Channels (e.g. Google Business Profile · Instagram)" onChange={(e) => onChange({ channels: e.target.value })} />
            <TextField value={comp.note} placeholder="One-line note" onChange={(e) => onChange({ note: e.target.value })} />
          </div>
        ) : (
          <>
            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
              {comp.name || <span style={{ color: 'var(--dark-40)' }}>Unnamed competitor</span>}
            </Text>
            {comp.channels && (
              <Text variant="secondary" style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--dark-60)' }}>{comp.channels}</Text>
            )}
            {comp.note && (
              <Text style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--dark-80)', lineHeight: 1.5 }}>{comp.note}</Text>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {isEditing ? (
          <Button size="sm" onPress={onDone}>Done</Button>
        ) : (
          <Button variant="secondary" size="sm" frontIcon={Edit3} onPress={onEdit}>Edit</Button>
        )}
        <IconButton size="sm" variant="ghost" icon={Trash2} title="Remove competitor" onPress={onRemove} />
      </div>
    </div>
  );
}

// ─── Additional context (collapsibles) ───────────────────────────────

function AdditionalContext() {
  // Each collapsible keeps its own committed text so edits persist across
  // collapse/expand. Seed from ADDITIONAL_CONTEXT.
  const [texts, setTexts] = useState<Record<string, string>>(
    () => Object.fromEntries(ADDITIONAL_CONTEXT.map((s) => [s.id, s.text])),
  );
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <section>
      <Text variant="metadata" style={{ display: 'block', marginBottom: 10, color: 'var(--dark-60)' }}>Additional context</Text>
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        {ADDITIONAL_CONTEXT.map((s, i) => (
          <Collapsible
            key={s.id}
            title={s.title}
            isLast={i === ADDITIONAL_CONTEXT.length - 1}
            isOpen={!!open[s.id]}
            onToggle={() => setOpen((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
          >
            <EditableSection
              title={s.title}
              kind={s.kind}
              value={texts[s.id]}
              onSave={(next) => setTexts((prev) => ({ ...prev, [s.id]: next }))}
            />
          </Collapsible>
        ))}
      </div>
    </section>
  );
}

function Collapsible({
  title, isOpen, isLast, onToggle, children,
}: { title: string; isOpen: boolean; isLast: boolean; onToggle: () => void; children: ReactNode }) {
  const Chevron = isOpen ? ChevronUp : ChevronDown;
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--dark-8)' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', textAlign: 'left',
          padding: '14px 18px', background: isOpen ? 'var(--dark-2)' : 'var(--light-100)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</Text>
        <Chevron size={20} color="var(--dark-60)" />
      </button>
      {isOpen && <div style={{ padding: '4px 18px 18px' }}>{children}</div>}
    </div>
  );
}

// ─── Brand Style ─────────────────────────────────────────────────────

// Grain Design Flooring brand swatches: these literal hex values ARE the brand
// colors, so they are intentionally not tokenized. Surrounding UI chrome uses tokens.
interface ColorSwatchSpec { hex: string; label: string; }
const SWATCHES: ColorSwatchSpec[] = [
  { hex: '#5a3a23', label: 'Walnut' },
  { hex: '#a9744f', label: 'Oak' },
  { hex: '#c45a36', label: 'Terracotta' },
  { hex: '#f3ece2', label: 'Limewash' },
  { hex: '#b7a98f', label: 'Driftwood' },
  { hex: '#2a211a', label: 'Espresso' },
];

function BrandStyle() {
  return (
    <div>
      <SectionHeading title="Brand Style" />

      {/* section: logo + colors (top row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
        <Panel title="Logo">
          <LogoTile />
        </Panel>
        <Panel title="Colors">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 84px)', gap: 10, justifyContent: 'flex-start' }}>
            {SWATCHES.map((s) => <ColorSwatch key={s.hex} hex={s.hex} label={s.label} />)}
          </div>
        </Panel>
      </div>

      {/* section: typography (full width) */}
      <div style={{ marginTop: 16 }}>
        <Panel title="Typography">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FontRow role="Display / headlines" family="Fraunces" weight="Semibold" preview="Floors with character" previewFamily='Georgia, "Times New Roman", serif' previewWeight={600} />
            <FontRow role="Body / UI" family="Inter" weight="Regular" preview="A free in-home design consult, species, finish, and layout matched to the room." previewFamily='"Helvetica Neue", Arial, sans-serif' previewWeight={400} />
          </div>
        </Panel>
      </div>

      {/* section: visual identity description (full width) */}
      <div style={{ marginTop: 16 }}>
        <Panel title="Visual identity description">
          <div style={{ padding: '14px 16px', background: 'var(--dark-2)', borderRadius: 8, color: 'var(--dark-90)', fontSize: 14, lineHeight: 1.5 }}>
            Warm, natural, and design-led. Walnut and oak browns grounded by a terracotta accent,
            set against limewash neutrals and generous breathing room. Photography is real grain:
            close-up board texture, raking light across a finished floor, in-progress craftsmanship,
            never flat catalog swatches or stocky abstraction.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LogoTile() {
  return (
    <div style={{ width: 200, height: 140, borderRadius: 10, background: '#2a211a', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, fontWeight: 600, letterSpacing: '-0.4px', color: '#f3ece2', lineHeight: 1 }}>
        Grain<span style={{ color: '#c45a36' }}>.</span>
      </span>
      <span style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 9, fontWeight: 500, letterSpacing: '2.5px', color: 'rgba(243,236,226,0.7)', textTransform: 'uppercase' }}>
        Design Flooring · Austin
      </span>
    </div>
  );
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  // Light swatches get a faint token border so they read against white.
  const isLight = ['#f3ece2'].includes(hex.toLowerCase());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ width: 84, height: 64, borderRadius: 10, background: hex, border: isLight ? '1px solid var(--dark-8)' : '1px solid transparent' }} aria-label={label} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</Text>
        <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{hex}</Text>
      </div>
    </div>
  );
}

function FontRow({ role, family, weight, preview, previewFamily, previewWeight }: { role: string; family: string; weight: string; preview: string; previewFamily: string; previewWeight: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: 16, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--dark-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{role}</Text>
        <Text style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>{family}</Text>
        <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{weight}</Text>
      </div>
      <div style={{ fontFamily: previewFamily, fontWeight: previewWeight, fontSize: 22, color: 'var(--dark-90)', lineHeight: 1.3, overflow: 'hidden' }}>
        {preview}
      </div>
    </div>
  );
}

// ─── Brand Voice ─────────────────────────────────────────────────────

function BrandVoice() {
  return (
    <div>
      <SectionHeading title="Brand Voice" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 28 }}>
        <ProfileSection title="Tone summary">
          <BodyParagraph>
            Warm, design-led, and craftsmanship-forward. Grain Design Flooring speaks like a maker
            who knows wood, equal parts designer and craftsman, plain-spoken about materials and
            quietly confident about the result. Natural-material language ("grain," "patina,"
            "underfoot") over sales pressure. Confidence comes from the work itself, real grain and
            honest timelines, not hype.
          </BodyParagraph>
        </ProfileSection>

        <ProfileSection title="Taglines">
          <BulletList>
            <li>"Floors with character, built to last."</li>
            <li>"From the right grain to the last board."</li>
            <li>"Austin's design-led flooring studio."</li>
          </BulletList>
        </ProfileSection>

        <ProfileSection title="Do / Don't">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            <VoiceList variant="do" items={[
              'Lead with craftsmanship and materials: species, finish, grain, longevity.',
              'Reference Austin and the Hill Country, and how local light and slab homes shape the choice.',
              'Show real grain and in-progress work; name the service (hardwood, LVP, tile, refinishing).',
              'Sound like a maker-designer: warm, precise, confident about the result.',
            ]} />
            <VoiceList variant="dont" items={[
              "Don't run discount-driven hard sells or price-per-square-foot races.",
              "Don't use generic catalog-swatch language or empty superlatives.",
              "Don't get jargon-heavy, keep it client-friendly, not contractor-speak.",
              "Don't sound like a big-box warehouse; we're a design studio, not a pick-list.",
            ]} />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}

function VoiceList({ variant, items }: { variant: 'do' | 'dont'; items: string[] }) {
  const isDo = variant === 'do';
  const accent = isDo ? 'var(--status-approved)' : 'var(--red-70)';
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--dark-8)' }}>
        <span style={{ width: 20, height: 20, borderRadius: 999, background: accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-100)', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>
          {isDo ? '✓' : '✕'}
        </span>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{isDo ? 'Do' : "Don't"}</Text>
      </div>
      <ul style={{ margin: 0, padding: '12px 16px 14px 32px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, lineHeight: 1.5, color: 'var(--dark-80)' }}>
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

// ─── Media Library ───────────────────────────────────────────────────

// Flooring imagery: the feed-data assets are painting-specific, so the Media
// Library uses warm wood-tone gradient tiles (per the rebrand brief). Each tile
// gets a `tone` that maps to a gradient in MediaCard.
type Tone = 'walnut' | 'oak' | 'terracotta' | 'tile' | 'limewash' | 'espresso';
interface MediaItem { id: string; tone: Tone; title: string; kind: 'image' | 'video'; date: string; used?: boolean; duration?: string; }

const MEDIA: MediaItem[] = [
  { id: '1', tone: 'walnut', title: 'White oak install · Westlake great room', kind: 'image', date: 'Image · Jan 28, 2026', used: true },
  { id: '2', tone: 'oak', title: 'Refinished red oak · Tarrytown', kind: 'image', date: 'Image · Jan 28, 2026' },
  { id: '3', tone: 'terracotta', title: 'Herringbone LVP · Lakeway kitchen', kind: 'image', date: 'Image · Jan 27, 2026', used: true },
  { id: '4', tone: 'tile', title: 'Porcelain tile · Cedar Park bath', kind: 'image', date: 'Image · Jan 26, 2026' },
  { id: '5', tone: 'espresso', title: 'Dust-contained sanding · time-lapse', kind: 'video', date: 'Video · Jan 22, 2026', duration: '0:15', used: true },
  { id: '6', tone: 'oak', title: 'Species & finish samples · design consult', kind: 'image', date: 'Image · Jan 20, 2026' },
  { id: '7', tone: 'limewash', title: 'Wide-plank white oak · light commercial', kind: 'image', date: 'Image · Jan 18, 2026' },
  { id: '8', tone: 'walnut', title: 'Walnut plank close-up · grain detail', kind: 'video', date: 'Video · Jan 17, 2026', duration: '0:15' },
  { id: '9', tone: 'terracotta', title: 'Stair treads & nosing · South Austin', kind: 'image', date: 'Image · Jan 15, 2026' },
  { id: '10', tone: 'tile', title: 'Large-format tile · Dripping Springs entry', kind: 'image', date: 'Image · Jan 12, 2026' },
  { id: '11', tone: 'espresso', title: 'Crew on-site · LVP layout', kind: 'image', date: 'Image · Jan 10, 2026', used: true },
  { id: '12', tone: 'limewash', title: 'Refinish · before/after', kind: 'image', date: 'Image · Jan 8, 2026' },
];

// Warm wood-tone gradients keyed by Tone: these literal values are imagery
// stand-ins for the brand, intentionally not tokenized.
const TILE_GRADIENT: Record<Tone, string> = {
  walnut: 'linear-gradient(135deg, #5a3a23 0%, #8a5a38 100%)',
  oak: 'linear-gradient(135deg, #a9744f 0%, #cf9a6a 100%)',
  terracotta: 'linear-gradient(135deg, #c45a36 0%, #9c4528 100%)',
  tile: 'linear-gradient(135deg, #b7a98f 0%, #8f8167 100%)',
  limewash: 'linear-gradient(135deg, #f3ece2 0%, #d9cdba 100%)',
  espresso: 'linear-gradient(135deg, #2a211a 0%, #4a3a2c 100%)',
};

function MediaLibrary() {
  return (
    <div>
      {/* section: title bar */}
      <SectionHeading title="Media Library">
        <Text variant="secondary" style={{ fontSize: 14, color: 'var(--dark-60)' }}>85 images, 12 videos</Text>
      </SectionHeading>

      {/* section: blurb */}
      <div style={{ maxWidth: 640, paddingTop: 20, paddingBottom: 24 }}>
        <Heading level={4} style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Job photos that keep your content fresh</Heading>
        <Text variant="secondary" style={{ display: 'block', marginTop: 4, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>
          Blaze uses your install, refinish, and detail photos and videos to create social posts,
          blogs, and emails, sourced from Grain Design Flooring projects across Austin and the
          Hill Country.
        </Text>
      </div>

      {/* section: media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {MEDIA.map((item) => <MediaCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', background: 'var(--dark-4)' }}>
        <div style={{ width: '100%', height: '100%', background: TILE_GRADIENT[item.tone] }} />
        {item.used && (
          <span style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>Used</span>
        )}
        {item.duration && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: 'var(--light-100)', fontSize: 12, fontWeight: 500 }}>{item.duration}</span>
        )}
      </div>
      <Text style={{ fontSize: 14, color: 'var(--dark-90)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Text>
      <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{item.date}</Text>
    </div>
  );
}

// ─── Source Materials ────────────────────────────────────────────────

type DocStatus = 'uploaded' | 'empty';
interface SourceRow { id: string; name: string; type: string; status: DocStatus; meta: string; }

const DOCS: SourceRow[] = [
  { id: '1', name: 'Grain Design Flooring Brand Guidelines', type: 'PDF', status: 'uploaded', meta: 'Added Sep 17, 2025' },
  { id: '2', name: 'Species & finish spec sheet · hardwood, LVP & tile', type: 'PDF', status: 'uploaded', meta: 'Added Sep 18, 2025' },
  { id: '3', name: 'Lifetime install warranty & care guide', type: 'Document', status: 'uploaded', meta: 'Added Aug 14, 2025' },
  { id: '4', name: 'Sales-call transcript · Westlake design consult', type: 'Transcript', status: 'uploaded', meta: 'Added Nov 14, 2025' },
  { id: '5', name: 'Light-commercial line sheet · contract flooring', type: 'PDF', status: 'empty', meta: 'Not uploaded yet' },
];

/** Best-guess material type from a file extension (drives the row glyph). */
function typeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(ext)) return 'Image';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'Video';
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'Audio';
  return 'Document';
}

function SourceMaterials() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<SourceRow[]>(DOCS);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock upload: append the chosen files to the top of the list as uploaded rows.
  const addFiles = (files: FileList | null) => {
    const list = files ? Array.from(files) : [];
    if (!list.length) return;
    const added: SourceRow[] = list.map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name.replace(/\.[^.]+$/, ''),
      type: typeFromName(f.name),
      status: 'uploaded',
      meta: 'Added just now',
    }));
    setDocs((prev) => [...added, ...prev]);
    showToast({ variant: 'success', message: `${added.length} source material${added.length === 1 ? '' : 's'} uploaded` });
  };

  return (
    <div>
      {/* section: header */}
      <SectionHeading title="Source Materials">
        <Text variant="secondary" style={{ fontSize: 14, color: 'var(--dark-60)' }}>{docs.length} items</Text>
      </SectionHeading>

      {/* section: blurb */}
      <Text variant="secondary" style={{ display: 'block', marginTop: 16, marginBottom: 16, fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5, maxWidth: 640 }}>
        Brand and marketing materials Blaze has indexed: guidelines, species &amp; finish specs,
        the install warranty, and recorded sales calls. Blaze pulls from these to keep content on-brand.
        Add your own any time.
      </Text>

      {/* section: upload dropzone (click to browse or drag & drop) */}
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: '100%', padding: '26px 20px', marginBottom: 16, cursor: 'pointer', fontFamily: 'inherit',
          border: `1px dashed ${dragging ? 'var(--dark-40)' : 'var(--dark-15)'}`, borderRadius: 12,
          background: dragging ? 'var(--dark-4)' : 'var(--dark-2)', transition: 'background-color 120ms ease, border-color 120ms ease',
        }}
      >
        <Upload size={24} color="var(--dark-60)" />
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Upload source materials</Text>
        <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>Drag files here, or click to browse. PDFs, docs, transcripts, images</Text>
      </button>

      {/* section: list */}
      <div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        {docs.map((row, i) => <DocRow key={row.id} row={row} isLast={i === docs.length - 1} />)}
      </div>
    </div>
  );
}

function DocRow({ row, isLast }: { row: SourceRow; isLast: boolean }) {
  const uploaded = row.status === 'uploaded';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid var(--dark-4)' }}>
      <DocGlyph type={row.type} uploaded={uploaded} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</Text>
        <Text variant="secondary" style={{ fontSize: 12, color: 'var(--dark-60)' }}>{row.type} · {row.meta}</Text>
      </div>
      {uploaded ? (
        <StatusPill tone="neutral" size="sm" style={{ gap: 4 }}>
          <Check2 size={14} color="var(--status-approved)" />Uploaded
        </StatusPill>
      ) : (
        <Chip variant="add" size="sm" selected={false}>Add</Chip>
      )}
    </div>
  );
}

function DocGlyph({ type, uploaded }: { type: string; uploaded: boolean }) {
  if (!uploaded) {
    return (
      <span aria-hidden style={{ width: 32, height: 32, borderRadius: 6, border: '1px dashed var(--dark-15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark-40)', flexShrink: 0 }}>
        <Document size={18} color="currentColor" />
      </span>
    );
  }
  if (type === 'PDF') {
    return (
      <span aria-hidden style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--red-90)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-100)', fontSize: 12, fontWeight: 700, letterSpacing: '0.3px', flexShrink: 0 }}>
        PDF
      </span>
    );
  }
  if (type === 'Transcript') {
    return (
      <span aria-hidden style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--purple)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-100)', flexShrink: 0 }}>
        <LinkExternal size={16} color="currentColor" />
      </span>
    );
  }
  return (
    <span aria-hidden style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--dark-4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark-60)', flexShrink: 0 }}>
      <Document size={18} color="currentColor" />
    </span>
  );
}
