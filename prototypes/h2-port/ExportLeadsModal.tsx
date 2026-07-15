import { useRef, useState, useMemo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Heading, Text, Modal, type StackModalProps } from '@/components';
import { Checkbox, Select } from '@/staging';
import Download from '@/icons/20/Download';
import Help from '@/icons/16/Help';
import {
  type Lead,
  type Status,
  STATUS_STYLES,
  METHOD_LABELS,
} from './sdr-data';
import { DEFAULT_QUALIFICATION_QUESTIONS } from './qualification-criteria-data';
import { SAMPLE_ZIPS, FLOORING_SERVICES, leadZip, leadService, qualificationAnswer } from './qualification-answer';

/**
 * Export leads to CSV — the operator (AM) side of the same flow the client
 * portal offers. Opened from the … more-menu in the Leads & Bookings topbar.
 * Ported from dfy-client/Leads.tsx; the client-only "message your strategist"
 * card is dropped since the AM owns this workspace.
 */

const STATUS_FUNNEL_ORDER: Status[] = ['human-handling', 'ai-handling', 'resolved', 'opted-out'];

/** Best-guess "call reason" from the lead's source / need / tags. */
function requestType(lead: Lead): string {
  const src = lead.first_touch_source ?? '';
  if (/cabinet/i.test(src)) return 'Cabinet refinishing';
  if (/exterior/i.test(src)) return 'Exterior painting';
  if (/interior/i.test(src)) return 'Interior painting';
  if (/warranty/i.test(src)) return 'Warranty claim';
  if (/hoa/i.test(src)) return 'HOA project';
  if (/commercial|restaurant|healthcare/i.test(src)) return 'Commercial painting';
  if (/deck|fence/i.test(src)) return 'Deck & fence';
  if (/color/i.test(src)) return 'Color consultation';
  const need = lead.scorecard.need ?? '';
  if (/cabinet/i.test(need)) return 'Cabinet refinishing';
  if (/exterior/i.test(need)) return 'Exterior painting';
  if (/interior/i.test(need)) return 'Interior painting';
  const tag = lead.tags.find(
    (t) => !/residential|westlake|cedar park|austin|pflugerville|leander|round rock|lakeway|bee cave|dripping|booked|hot lead|cooled/i.test(t),
  );
  return tag ?? 'General inquiry';
}

interface ExportField {
  key: string;
  /** Doubles as the checkbox label and the CSV column header. */
  label: string;
  /** Short example shown beside the label for the less self-evident fields. */
  hint?: string;
  value: (lead: Lead) => string;
  defaultOn: boolean;
  group: 'details' | 'qualification';
}

// Name and phone intentionally live only under Qualification criteria (Full
// name / Phone number) so the two column groups never duplicate each other.
const DETAIL_FIELDS: ExportField[] = [
  { key: 'email', label: 'Email', value: (l) => l.prospect.email, defaultOn: true, group: 'details' },
  { key: 'company', label: 'Company / location', value: (l) => l.location ?? l.prospect.company, defaultOn: true, group: 'details' },
  { key: 'reason', label: 'Call reason', value: (l) => requestType(l), defaultOn: true, group: 'details' },
  { key: 'method', label: 'Method', hint: 'Call, SMS, Chat', value: (l) => METHOD_LABELS[l.method], defaultOn: false, group: 'details' },
  { key: 'status', label: 'Status', hint: 'AI handling, Booked', value: (l) => STATUS_STYLES[l.status].label, defaultOn: false, group: 'details' },
];

// Each configured qualification question is also an exportable column. Full
// name and Phone number default on (they replace the old lead-details columns).
const QUALIFICATION_FIELDS: ExportField[] = DEFAULT_QUALIFICATION_QUESTIONS.map((q) => ({
  key: `qual-${q.id}`,
  label: q.label,
  value: (l) => qualificationAnswer(l, q.id) ?? '',
  defaultOn: q.id === 'q-name' || q.id === 'q-phone',
  group: 'qualification',
}));

const EXPORT_FIELDS: ExportField[] = [...DETAIL_FIELDS, ...QUALIFICATION_FIELDS];

/** Quote a CSV cell only when it contains a comma, quote, or newline. */
function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadLeadsCsv(fields: ExportField[], leads: Lead[]) {
  const rows = [fields.map((f) => f.label), ...leads.map((l) => fields.map((f) => f.value(l)))];
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Hover preview: a mini spreadsheet of the currently-checked columns filled
 *  with a few real leads, so the operator sees exactly what the CSV will hold. */
function CsvPreview({ fields, leads, anchor }: { fields: ExportField[]; leads: Lead[]; anchor: DOMRect }) {
  const centerX = anchor.left + anchor.width / 2;
  const edgeGap = Math.min(centerX, window.innerWidth - centerX) - 12;
  const base: CSSProperties = {
    position: 'fixed', top: anchor.bottom + 8, left: centerX, transform: 'translateX(-50%)', zIndex: 3000,
    background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10,
    boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 14,
    maxWidth: Math.max(240, Math.round(edgeGap * 2)),
  };
  if (fields.length === 0) {
    return (
      <div style={{ ...base, width: 240 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>Tick at least one column to preview your export.</Text>
      </div>
    );
  }
  const cell: CSSProperties = { border: '1px solid var(--dark-8)', padding: '6px 10px', whiteSpace: 'nowrap', textAlign: 'left' };
  return (
    <div style={base}>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>This is how your CSV will look</Text>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.key} style={{ ...cell, fontWeight: 500, color: 'var(--dark-90)', background: 'var(--dark-4)' }}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                {fields.map((f) => (
                  <td key={f.key} style={{ ...cell, color: 'var(--dark-60)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value(l)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 6 }}>{label}</Text>
      <Select value={value} onChange={onChange} options={options} size="md" fullWidth aria-label={label} />
    </div>
  );
}

export function ExportLeadsModal({ leads, close }: StackModalProps & { leads: Lead[] }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(EXPORT_FIELDS.filter((f) => f.defaultOn).map((f) => f.key)),
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [zipFilter, setZipFilter] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const helpRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const activeFields = EXPORT_FIELDS.filter((f) => selected.has(f.key));

  const filteredLeads = useMemo(
    () => leads.filter((l) =>
      (statusFilter === 'all' || l.status === statusFilter) &&
      (methodFilter === 'all' || l.method === methodFilter) &&
      (serviceFilter === 'all' || leadService(l) === serviceFilter) &&
      (zipFilter === 'all' || leadZip(l) === zipFilter),
    ),
    [leads, statusFilter, methodFilter, serviceFilter, zipFilter],
  );
  const isFiltered = filteredLeads.length !== leads.length;

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const statusOptions = [{ value: 'all', label: 'All statuses' }, ...STATUS_FUNNEL_ORDER.map((s) => ({ value: s, label: STATUS_STYLES[s].label }))];
  const methodOptions = [{ value: 'all', label: 'All methods' }, { value: 'call', label: 'Call' }, { value: 'sms', label: 'SMS' }, { value: 'other', label: 'Chat' }];
  const serviceOptions = [{ value: 'all', label: 'Any service' }, ...FLOORING_SERVICES.map((s) => ({ value: s, label: s }))];
  const zipOptions = [{ value: 'all', label: 'All zip codes' }, ...SAMPLE_ZIPS.map((z) => ({ value: z, label: z }))];
  const detailFields = EXPORT_FIELDS.filter((f) => f.group === 'details');
  const qualFields = EXPORT_FIELDS.filter((f) => f.group === 'qualification');

  const renderCheckbox = (f: ExportField) => (
    <Checkbox key={f.key} style={{ gap: 12 }} checked={selected.has(f.key)} onChange={() => toggle(f.key)}>
      <Text variant="primary" style={{ color: 'var(--dark-90)' }}>
        {f.label}
        {f.hint && <span style={{ color: 'var(--dark-60)', marginLeft: 5 }}>({f.hint})</span>}
      </Text>
    </Checkbox>
  );

  return (
    <Modal.Root size="md" aria-labelledby="export-leads-title">
      <Modal.Header
        title="Export leads to CSV"
        id="export-leads-title"
        onClose={close}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontWeight: 400, lineHeight: 1.5 }}>
            Choose which details to include. Each one you tick becomes a column in your CSV.{' '}
            <span
              style={{ display: 'inline-flex', verticalAlign: 'middle' }}
              onMouseEnter={() => { setAnchor(helpRef.current?.getBoundingClientRect() ?? null); setPreviewOpen(true); }}
              onMouseLeave={() => setPreviewOpen(false)}
            >
              <button
                ref={helpRef}
                type="button"
                aria-label="Preview how the CSV columns will look"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 99, border: 'none', background: 'var(--dark-6)', cursor: 'help', padding: 0 }}
              >
                <Help size={12} color="var(--dark-60)" />
              </button>
            </span>
          </Text>
        }
      />
      <Modal.Content>
        {previewOpen && anchor && createPortal(
          <CsvPreview fields={activeFields} leads={filteredLeads.slice(0, 4)} anchor={anchor} />,
          document.body,
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* columns — lead details */}
          <div>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10 }}>Lead details</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              {detailFields.map(renderCheckbox)}
            </div>
          </div>

          {/* columns — qualification criteria */}
          <div>
            <Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10 }}>Qualification criteria</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
              {qualFields.map(renderCheckbox)}
            </div>
          </div>

          {/* filter which leads to include */}
          <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 20 }}>
            <Heading level={5} style={{ margin: '0 0 2px' }}>Filter leads</Heading>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 14 }}>Optional — export only the leads that match.</Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
              <FilterSelect label="Method" value={methodFilter} onChange={setMethodFilter} options={methodOptions} />
              <FilterSelect label="Primary service" value={serviceFilter} onChange={setServiceFilter} options={serviceOptions} />
              <FilterSelect label="Zip code" value={zipFilter} onChange={setZipFilter} options={zipOptions} />
            </div>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="subtle" onPress={close}>Cancel</Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Text variant="secondary" style={{ color: 'var(--dark-60)', marginRight: 12 }}>
            {isFiltered ? `${filteredLeads.length} of ${leads.length} leads` : `${leads.length} leads`}
          </Text>
          <Modal.FooterButton
            variant="primary"
            frontIcon={Download}
            isDisabled={activeFields.length === 0 || filteredLeads.length === 0}
            onPress={() => { downloadLeadsCsv(activeFields, filteredLeads); close(); }}
          >
            Export CSV
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
