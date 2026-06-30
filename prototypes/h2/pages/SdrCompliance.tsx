import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { Select, StatusPill, TextField, useToast } from '@/staging';
import type { SelectOption, StatusPillTone } from '@/staging';
import type { IconProps } from '@/icons/Types';
import AlertTriangle from '@/icons/20/AlertTriangle';
import Check2 from '@/icons/20/Check2';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import CoverImage from '@/icons/20/CoverImage';
import Document from '@/icons/20/Document';
import Edit1 from '@/icons/20/Edit1';
import LinkAngled from '@/icons/20/LinkAngled';
import Loader1 from '@/icons/20/Loader1';
import Marker2 from '@/icons/20/Marker2';
import MessageChat01 from '@/icons/20/MessageChat01';
import ShieldChecked from '@/icons/20/ShieldChecked';
import Trash2 from '@/icons/20/Trash2';
import Upload from '@/icons/20/Upload';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import { useDevState } from '../dev-state-context';

// ══════════════════════════════════════════════════════════════════════════
// COMPLIANCE TAB — A2P / 10DLC campaign pre-requisites
// Five sections the user fills, then submits together. Each section's status
// only reflects whether its required fields are filled. After submission the
// sections turn into review trackers (under review → approved / failed); a
// failed section can be edited and resubmitted on its own.
//
// Wired to the H2 dev-state controller: "cold" = empty editing form, "steady"
// = submitted with one section failed (ready to edit & resubmit).
// ══════════════════════════════════════════════════════════════════════════

type SectionId = 'business' | 'address' | 'rep' | 'policy' | 'optin';

interface ComplianceData {
  business: { name: string; website: string; type: string; companyType: string; industry: string; ein: string };
  address: { street: string; city: string; state: string; zip: string };
  rep: { firstName: string; lastName: string; email: string; phone: string; position: string; title: string };
  policy: { termsUrl: string; privacyUrl: string };
  optin: { screenshots: string[] };
}

const EMPTY: ComplianceData = {
  business: { name: '', website: '', type: '', companyType: 'private', industry: '', ein: '' },
  address: { street: '', city: '', state: '', zip: '' },
  rep: { firstName: '', lastName: '', email: '', phone: '', position: '', title: '' },
  policy: { termsUrl: '', privacyUrl: '' },
  optin: { screenshots: [] },
};

// Populated values backing the "steady" dev-state view.
const STEADY_DATA: ComplianceData = {
  business: { name: 'CertaPro Painters of Austin', website: 'https://certapro-austin.com', type: 'llc', companyType: 'private', industry: 'home-services', ein: '12-3456789' },
  address: { street: '100 Congress Ave', city: 'Austin', state: 'TX', zip: '78701' },
  rep: { firstName: 'Riley', lastName: 'Tran', email: 'riley@certapro-austin.com', phone: '+1 (512) 555-0148', position: 'owner', title: 'Operations Manager' },
  policy: { termsUrl: 'https://certapro-austin.com/terms', privacyUrl: 'https://certapro-austin.com/privacy' },
  optin: { screenshots: ['Opt-in screenshot 1.png'] },
};

type ReviewState = 'under-review' | 'approved' | 'failed';

/**
 * A2P 10DLC verification status for the agent number — the single status the
 * Triggers tab's phone-number token and this tab's submission tracker both
 * reflect. Derived from the compliance form's phase + per-section review state
 * (see `deriveA2pStatus`), so the two surfaces never disagree.
 *
 * - not-registered — nothing submitted yet (replaces the old "SMS not available")
 * - awaiting       — submitted, carrier review in progress
 * - verified       — every section approved; texting enabled
 * - rejected       — one or more sections were rejected and need changes
 */
export type A2pStatus = 'not-registered' | 'awaiting' | 'verified' | 'rejected';

/** The registered A2P number the agent sends all outbound SMS from. Surfaced on
 *  the compliance screen and in the review-request SMS step so it's clear where
 *  texts originate. */
export const AGENT_SMS_NUMBER = '+1 (512) 323-9502';

/** Seed the shared A2P status from the H2 dev-state controller, matching the
 *  compliance form's own cold/steady seeding (cold = empty form, steady =
 *  submitted with the policy section rejected). */
export function a2pFromDevState(devState: 'cold' | 'steady'): A2pStatus {
  return devState === 'cold' ? 'not-registered' : 'rejected';
}

const NULL_REVIEW: Record<SectionId, ReviewState | null> = {
  business: null, address: null, rep: null, policy: null, optin: null,
};
// "steady": everything approved except the policy section, which failed.
const STEADY_REVIEW: Record<SectionId, ReviewState | null> = {
  business: 'approved', address: 'approved', rep: 'approved', policy: 'failed', optin: 'approved',
};
const ALL_FALSE: Record<SectionId, boolean> = {
  business: false, address: false, rep: false, policy: false, optin: false,
};
const ALL_OPEN: Record<SectionId, boolean> = {
  business: true, address: true, rep: true, policy: true, optin: true,
};

// ── Option lists ────────────────────────────────────────────────────────────

const BUSINESS_TYPES: SelectOption[] = [
  { value: 'sole-proprietorship', label: 'Sole proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'co-op', label: 'Co-operative' },
  { value: 'non-profit', label: 'Non-profit' },
  { value: 'government', label: 'Government' },
];

const COMPANY_TYPES: SelectOption[] = [
  { value: 'private', label: 'private' },
  { value: 'public', label: 'public' },
  { value: 'government', label: 'government' },
  { value: 'non-profit', label: 'non-profit' },
];

const INDUSTRIES: SelectOption[] = [
  { value: 'home-services', label: 'Home services' },
  { value: 'construction', label: 'Construction' },
  { value: 'real-estate', label: 'Real estate' },
  { value: 'retail', label: 'Retail' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'professional-services', label: 'Professional services' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

const JOB_POSITIONS: SelectOption[] = [
  { value: 'director', label: 'Director' },
  { value: 'ceo', label: 'CEO' },
  { value: 'cfo', label: 'CFO' },
  { value: 'coo', label: 'COO' },
  { value: 'vp', label: 'VP' },
  { value: 'general-manager', label: 'General manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'owner', label: 'Owner' },
  { value: 'general-counsel', label: 'General counsel' },
  { value: 'other', label: 'Other' },
];

const US_STATES: SelectOption[] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([value, label]) => ({ value: value as string, label: label as string }));

// ── Right-rail explainer (dark-2 bg, dark-60 text, ≥14px) ─────────────────────

const WHY_REASONS = [
  'To verify your business with voice and SMS carriers and ensure communications do not get flagged as spam.',
  'To ensure that we are enabling the most robust features for you and your customers.',
  'For internal record keeping and compliance.',
];

function SideNote({ children }: { children: ReactNode }) {
  return (
    <aside
      style={{
        background: 'var(--dark-2)',
        borderRadius: 8,
        padding: 16,
        fontSize: 14,
        lineHeight: 1.5,
        color: 'var(--dark-60)',
      }}
    >
      {children}
    </aside>
  );
}

function WhyContent() {
  return (
    <>
      <div style={{ fontWeight: 500, color: 'var(--dark-60)', marginBottom: 8 }}>
        Why does Blaze need this information?
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WHY_REASONS.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </>
  );
}

function sideNoteFor(id: SectionId): ReactNode {
  switch (id) {
    case 'business':
    case 'address':
      return <WhyContent />;
    case 'rep':
      return (
        <>
          <p style={{ margin: '0 0 12px' }}>
            <strong style={{ fontWeight: 500 }}>Note:</strong> Choose a designated point of contact
            who can respond to a 2FA email or text while we verify the business for voice and SMS use
            cases.
          </p>
          <WhyContent />
        </>
      );
    case 'policy':
      return (
        <>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>What carriers check</div>
          <p style={{ margin: 0 }}>
            Your Terms and Privacy pages must mention consent to texts, opt-out (STOP), message
            frequency, and data rates. If you&rsquo;re missing either page, submit the same URL for
            both.
          </p>
        </>
      );
    case 'optin':
      return (
        <>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>What to upload</div>
          <p style={{ margin: 0 }}>
            Screenshots of your scheduler, webchat, or web form &mdash; any page that collects opt-in
            consent. The page must show the consent language and an SMS opt-in checkbox that is{' '}
            <strong style={{ fontWeight: 500 }}>unchecked by default</strong>.
          </p>
        </>
      );
  }
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <Text variant="primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {required && <span style={{ color: 'var(--dark-60)' }}>*</span>}
      </Text>
      {children}
    </label>
  );
}

// ── Section metadata ──────────────────────────────────────────────────────────

interface SectionMeta {
  id: SectionId;
  icon: ComponentType<IconProps>;
  title: string;
}

const SECTIONS: SectionMeta[] = [
  { id: 'business', icon: Document, title: 'Business information' },
  { id: 'address', icon: Marker2, title: 'Business address' },
  { id: 'rep', icon: UserProfileCircle, title: 'Authorized representative' },
  { id: 'policy', icon: LinkAngled, title: 'Policy URLs' },
  { id: 'optin', icon: CoverImage, title: 'Opt-in screenshots' },
];

const SECTION_ORDER: SectionId[] = SECTIONS.map((s) => s.id);

// Collapse the form's phase + per-section verdicts into one A2P status.
// Precedence: any rejected section (or one re-opened for editing) → rejected;
// else anything still in review → awaiting; else all approved → verified.
function deriveA2pStatus(
  phase: 'editing' | 'review',
  reviewStatus: Record<SectionId, ReviewState | null>,
  editing: Record<SectionId, boolean>,
): A2pStatus {
  if (phase === 'editing') return 'not-registered';
  const vals = SECTION_ORDER.map((s) => reviewStatus[s]);
  if (vals.some((v) => v === 'failed') || SECTION_ORDER.some((s) => editing[s])) return 'rejected';
  if (vals.some((v) => v === 'under-review')) return 'awaiting';
  if (vals.every((v) => v === 'approved')) return 'verified';
  return 'awaiting';
}

// Submission-tracker presentation, keyed by A2P status. `tint`/`border` mirror
// the StatusPill tone palette so the banner reads as the same status family.
const TRACKER: Record<
  A2pStatus,
  { title: string; tone: StatusPillTone; icon: ComponentType<IconProps>; spin?: boolean; tint: string; border: string; desc: string }
> = {
  'not-registered': {
    title: 'Not registered',
    tone: 'warning',
    icon: Document,
    tint: 'rgba(237, 124, 44, 0.08)',
    border: 'rgba(237, 124, 44, 0.22)',
    desc: "This number isn't registered for A2P 10DLC yet. Complete every section below and submit to register it for business texting.",
  },
  awaiting: {
    title: 'Awaiting approval',
    tone: 'info',
    icon: Loader1,
    spin: true,
    tint: 'rgba(1, 121, 207, 0.08)',
    border: 'rgba(1, 121, 207, 0.22)',
    desc: 'Your registration is under carrier review — no action needed. Approval typically takes 5–30 business days.',
  },
  verified: {
    title: 'Verified',
    tone: 'success',
    icon: ShieldChecked,
    tint: 'rgba(4, 175, 0, 0.08)',
    border: 'rgba(4, 175, 0, 0.20)',
    desc: 'This number is registered and approved for A2P 10DLC messaging. Outbound texting is enabled.',
  },
  rejected: {
    title: 'Rejected',
    tone: 'danger',
    icon: AlertTriangle,
    tint: 'rgba(188, 1, 11, 0.06)',
    border: 'rgba(188, 1, 11, 0.20)',
    desc: 'The carrier rejected your A2P 10DLC submission.',
  },
};

// Simulated carrier verdicts — sections sit in the "under review" waiting
// state for a few seconds before resolving; policy fails to demo the
// edit-and-resubmit flow.
const RESOLUTIONS: { id: SectionId; delay: number; result: ReviewState }[] = [
  { id: 'business', delay: 4000, result: 'approved' },
  { id: 'address', delay: 5200, result: 'approved' },
  { id: 'rep', delay: 6400, result: 'approved' },
  { id: 'optin', delay: 7600, result: 'approved' },
  { id: 'policy', delay: 8800, result: 'failed' },
];

const RESUBMIT_DELAY = 4500;

const FAILURE_REASON: Partial<Record<SectionId, string>> = {
  policy:
    'Your Privacy Policy page is missing the required opt-out (STOP) and message-frequency language. Update the page, then resubmit this section.',
};

// ── Submission status tracker ─────────────────────────────────────────────────

function SubmissionTracker({
  status,
  rejectionReasons,
}: {
  status: A2pStatus;
  rejectionReasons: { title: string; reason: string }[];
}) {
  const meta = TRACKER[status];
  const Icon = meta.icon;
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        borderRadius: 10,
        border: `1px solid ${meta.border}`,
        background: meta.tint,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          marginTop: 1,
          display: 'inline-flex',
          color: 'var(--dark-90)',
          ...(meta.spin ? { animation: 'blzspin 0.9s linear infinite' } : null),
        }}
      >
        <Icon size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Heading level={4}>A2P registration</Heading>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
          {status === 'rejected' && rejectionReasons.length > 0
            ? `${meta.desc} ${rejectionReasons.map((r) => r.reason).join(' ')}`
            : meta.desc}
        </Text>
      </div>
    </div>
  );
}

// ── Layout constants ────────────────────────────────────────────────────────

const GRID_2: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 };
const GRID_3: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 };
const GRID_4: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 };

const BODY_LAYOUT: CSSProperties = {
  display: 'flex',
  gap: 24,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  // heading→body gap (matches the full gap between sections = 2× the 20px wrapper pad).
  // bottom gap is owned by the section wrapper's paddingBottom.
  padding: '40px 0 0',
};
const LEFT_COL: CSSProperties = { flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 };
const RIGHT_COL: CSSProperties = { flex: '0 1 300px', minWidth: 0 };

const SCOPED_CSS =
  '@keyframes blzspin{to{transform:rotate(360deg)}}' +
  '.blz-cmp svg path,.blz-cmp svg line,.blz-cmp svg polyline,.blz-cmp svg polygon,.blz-cmp svg rect,.blz-cmp svg circle,.blz-cmp svg ellipse{stroke-width:1.15px;}';

// ── Main ──────────────────────────────────────────────────────────────────────

export const ComplianceSection = forwardRef<
  { submit: () => void },
  {
    embedded?: boolean;
    hideSubmit?: boolean;
    onSubmitted?: () => void;
    onReadyChange?: (ready: boolean) => void;
    /** Reports the derived A2P status up so the Triggers tab token stays in sync. */
    onStatusChange?: (status: A2pStatus) => void;
  }
>(function ComplianceSection(
  { embedded = false, hideSubmit = false, onSubmitted, onReadyChange, onStatusChange },
  ref,
) {
  const { showToast } = useToast();
  const { pathname } = useLocation();
  const { getState } = useDevState();
  const devState = getState(pathname); // 'cold' | 'steady'

  const [data, setData] = useState<ComplianceData>(() => (devState === 'cold' ? EMPTY : STEADY_DATA));
  const [phase, setPhase] = useState<'editing' | 'review'>(() => (devState === 'cold' ? 'editing' : 'review'));
  const [reviewStatus, setReviewStatus] = useState<Record<SectionId, ReviewState | null>>(() =>
    devState === 'cold' ? NULL_REVIEW : STEADY_REVIEW,
  );
  // Failed sections the user has re-opened for editing inside the review phase.
  const [editing, setEditing] = useState<Record<SectionId, boolean>>(ALL_FALSE);
  const [open, setOpen] = useState<Record<SectionId, boolean>>(ALL_OPEN);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  // Re-seed the whole view when the designer flips the dev-state controller.
  const appliedDevState = useRef(devState);
  useEffect(() => {
    if (appliedDevState.current === devState) return;
    appliedDevState.current = devState;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setEditing(ALL_FALSE);
    setOpen(ALL_OPEN);
    if (devState === 'cold') {
      setData(EMPTY);
      setPhase('editing');
      setReviewStatus(NULL_REVIEW);
    } else {
      setData(STEADY_DATA);
      setPhase('review');
      setReviewStatus(STEADY_REVIEW);
    }
  }, [devState]);

  const update = <K extends SectionId>(section: K, patch: Partial<ComplianceData[K]>) =>
    setData((d) => ({ ...d, [section]: { ...d[section], ...patch } }));

  // ready = every required field present (for optin: at least one screenshot)
  const ready = useMemo<Record<SectionId, boolean>>(() => {
    const b = data.business, a = data.address, r = data.rep, p = data.policy;
    return {
      business: !!(b.name && b.website && b.type && b.companyType && b.industry && b.ein),
      address: !!(a.street && a.city && a.state && a.zip),
      rep: !!(r.firstName && r.lastName && r.email && r.phone && r.position && r.title),
      policy: !!(p.termsUrl && p.privacyUrl),
      optin: data.optin.screenshots.length > 0,
    };
  }, [data]);

  const allReady = SECTION_ORDER.every((s) => ready[s]);

  useEffect(() => {
    onReadyChange?.(allReady);
  }, [allReady, onReadyChange]);

  // Single A2P status that drives both the top tracker and (reported up) the
  // Triggers-tab phone-number token.
  const a2pStatus = deriveA2pStatus(phase, reviewStatus, editing);
  useEffect(() => {
    onStatusChange?.(a2pStatus);
  }, [a2pStatus, onStatusChange]);

  // Per-section rejection reasons, surfaced in the tracker when status is
  // rejected (a section the user has re-opened for editing has no verdict yet).
  const rejectionReasons = SECTION_ORDER
    .filter((s) => reviewStatus[s] === 'failed')
    .map((s) => ({
      title: SECTIONS.find((m) => m.id === s)!.title,
      reason: FAILURE_REASON[s] ?? 'This section was rejected during carrier review. Update it and resubmit.',
    }));

  const toggle = (id: SectionId) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const scheduleResolution = (only?: SectionId) => {
    const list = only ? [{ id: only, delay: RESUBMIT_DELAY, result: 'approved' as ReviewState }] : RESOLUTIONS;
    list.forEach(({ id, delay, result }) => {
      const t = window.setTimeout(() => setReviewStatus((rs) => ({ ...rs, [id]: result })), delay);
      timers.current.push(t);
    });
  };

  const submitAll = () => {
    setPhase('review');
    setEditing(ALL_FALSE);
    setReviewStatus({
      business: 'under-review', address: 'under-review', rep: 'under-review',
      policy: 'under-review', optin: 'under-review',
    });
    scheduleResolution();
    showToast({ message: 'Submitted for carrier review', variant: 'success' });
    onSubmitted?.();
  };

  useImperativeHandle(ref, () => ({ submit: submitAll }));

  const editFailed = (id: SectionId) => {
    setEditing((e) => ({ ...e, [id]: true }));
    setReviewStatus((rs) => ({ ...rs, [id]: null }));
    setOpen((o) => ({ ...o, [id]: true }));
  };

  const resubmitSection = (id: SectionId) => {
    setEditing((e) => ({ ...e, [id]: false }));
    setReviewStatus((rs) => ({ ...rs, [id]: 'under-review' }));
    scheduleResolution(id);
    showToast({ message: 'Section resubmitted for review', variant: 'success' });
  };

  // ── Per-section field bodies ───────────────────────────────────────────────
  const fieldsFor = (id: SectionId): ReactNode => {
    switch (id) {
      case 'business':
        return (
          <div style={GRID_2}>
            <Field label="Business name" required>
              <TextField fullWidth placeholder="Your company name" value={data.business.name} onChange={(v) => update('business', { name: v })} />
            </Field>
            <Field label="Website URL" required>
              <TextField fullWidth placeholder="https://yourcompany.com" value={data.business.website} onChange={(v) => update('business', { website: v })} />
            </Field>
            <Field label="Business type" required>
              <Select fullWidth placeholder="Select business type" value={data.business.type} onChange={(v) => update('business', { type: v })} options={BUSINESS_TYPES} aria-label="Business type" />
            </Field>
            <Field label="Company type" required>
              <Select fullWidth value={data.business.companyType} onChange={(v) => update('business', { companyType: v })} options={COMPANY_TYPES} aria-label="Company type" />
            </Field>
            <Field label="Business industry" required>
              <Select fullWidth placeholder="Select industry" value={data.business.industry} onChange={(v) => update('business', { industry: v })} options={INDUSTRIES} aria-label="Business industry" />
            </Field>
            <Field label="Employer Identification Number (EIN)" required>
              <TextField fullWidth placeholder="e.g., 12-3456789" value={data.business.ein} onChange={(v) => update('business', { ein: v })} />
            </Field>
          </div>
        );
      case 'address':
        return (
          <div style={embedded ? GRID_2 : GRID_4}>
            <Field label="Street address" required>
              <TextField fullWidth placeholder="123 Main Street" value={data.address.street} onChange={(v) => update('address', { street: v })} />
            </Field>
            <Field label="City" required>
              <TextField fullWidth placeholder="San Francisco" value={data.address.city} onChange={(v) => update('address', { city: v })} />
            </Field>
            <Field label="State / Province" required>
              <Select fullWidth placeholder="Select" value={data.address.state} onChange={(v) => update('address', { state: v })} options={US_STATES} aria-label="State or province" />
            </Field>
            <Field label="ZIP / Postal code" required>
              <TextField fullWidth placeholder="94105" value={data.address.zip} onChange={(v) => update('address', { zip: v })} />
            </Field>
          </div>
        );
      case 'rep':
        return (
          <div style={embedded ? GRID_2 : GRID_3}>
            <Field label="First name" required>
              <TextField fullWidth placeholder="John" value={data.rep.firstName} onChange={(v) => update('rep', { firstName: v })} />
            </Field>
            <Field label="Last name" required>
              <TextField fullWidth placeholder="Doe" value={data.rep.lastName} onChange={(v) => update('rep', { lastName: v })} />
            </Field>
            <Field label="Email address" required>
              <TextField fullWidth type="email" placeholder="john.doe@yourcompany.com" value={data.rep.email} onChange={(v) => update('rep', { email: v })} />
            </Field>
            <Field label="Phone number" required>
              <TextField fullWidth placeholder="+1 (555) 123-4567" value={data.rep.phone} onChange={(v) => update('rep', { phone: v })} />
            </Field>
            <Field label="Job position" required>
              <Select fullWidth placeholder="Select position" value={data.rep.position} onChange={(v) => update('rep', { position: v })} options={JOB_POSITIONS} aria-label="Job position" />
            </Field>
            <Field label="Job title" required>
              <TextField fullWidth placeholder="e.g., CEO, Marketing Director, Operations Manager" value={data.rep.title} onChange={(v) => update('rep', { title: v })} />
            </Field>
          </div>
        );
      case 'policy':
        return (
          <div style={GRID_2}>
            <Field label="Terms &amp; Conditions URL" required>
              <TextField fullWidth placeholder="https://yoursite.com/terms" value={data.policy.termsUrl} onChange={(v) => update('policy', { termsUrl: v })} />
            </Field>
            <Field label="Privacy Policy URL" required>
              <TextField fullWidth placeholder="https://yoursite.com/privacy" value={data.policy.privacyUrl} onChange={(v) => update('policy', { privacyUrl: v })} />
            </Field>
          </div>
        );
      case 'optin':
        return (
          <OptinUploader
            screenshots={data.optin.screenshots}
            onChange={(screenshots) => update('optin', { screenshots })}
          />
        );
    }
  };

  // ── Editable section (editing phase, or a failed section reopened) ──────────
  const renderEditable = (meta: SectionMeta, isResubmit: boolean) => {
    const id = meta.id;
    const Icon = meta.icon;
    const isOpen = isResubmit ? true : open[id];
    const sectionReady = ready[id];

    const headerInner = (
      <>
        <span style={{ flexShrink: 0, color: 'var(--dark-90)', display: 'inline-flex' }}>
          <Icon size={20} />
        </span>
        <Heading level={4} style={{ flex: 1, minWidth: 0 }}>{meta.title}</Heading>
        {isResubmit ? (
          <StatusPill tone="neutral" size="md">Editing</StatusPill>
        ) : (
          <StatusPill tone={sectionReady ? 'success' : 'neutral'} size="md">
            {sectionReady ? 'Complete' : 'Incomplete'}
          </StatusPill>
        )}
        {!isResubmit && (
          <span style={{ flexShrink: 0, color: 'var(--dark-60)', display: 'inline-flex' }}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        )}
      </>
    );

    return (
      <>
        {isResubmit ? (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 0 }}>
            {headerInner}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => toggle(id)}
            aria-expanded={isOpen}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
          >
            {headerInner}
          </button>
        )}

        {isOpen && (
          <div style={BODY_LAYOUT}>
            <div style={LEFT_COL}>
              {fieldsFor(id)}
              {isResubmit && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" size="md" isDisabled={!sectionReady} onPress={() => resubmitSection(id)}>
                    Resubmit Section
                  </Button>
                </div>
              )}
            </div>
            <div style={RIGHT_COL}>
              <SideNote>{sideNoteFor(id)}</SideNote>
            </div>
          </div>
        )}
      </>
    );
  };

  // ── Review tracker (status lives in the pill on the right) ──────────────────
  const renderTracker = (meta: SectionMeta) => {
    const id = meta.id;
    const Icon = meta.icon;
    const st = reviewStatus[id];

    const pill =
      st === 'approved' ? (
        <StatusPill tone="success" size="md">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check2 size={14} />Approved</span>
        </StatusPill>
      ) : st === 'failed' ? (
        <StatusPill tone="danger" size="md">Needs changes</StatusPill>
      ) : (
        <StatusPill tone="info" size="md">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-flex', animation: 'blzspin 0.9s linear infinite' }}><Loader1 size={14} /></span>
            Under review
          </span>
        </StatusPill>
      );

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 0 }}>
        <span style={{ flexShrink: 0, color: 'var(--dark-90)', display: 'inline-flex', marginTop: 2 }}>
          <Icon size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Heading level={4} style={{ flex: 1, minWidth: 0 }}>{meta.title}</Heading>
            {pill}
          </div>
          {st === 'under-review' && (
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
              Submitted &mdash; the carrier is reviewing this section.
            </Text>
          )}
          {st === 'failed' && (
            <>
              <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
                {FAILURE_REASON[id] ?? 'This section was rejected during review. Update it and resubmit.'}
              </Text>
              <div>
                <Button variant="secondary" size="sm" frontIcon={Edit1} onPress={() => editFailed(id)}>
                  Edit &amp; Resubmit
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="blz-cmp" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{SCOPED_CSS}</style>

      {/* intro — hidden in the embedded DIY flow, where the step header covers it */}
      {!embedded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Heading level={3}>A2P / 10DLC compliance</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
            Complete every section below, then submit your brand for outbound voice and SMS
            verification. Submitted details should match your latest official legal and financial documents.
          </Text>
        </div>
      )}

      {/* submission status tracker — the single A2P verdict for this number,
          with a brief reason (and per-section detail when rejected). Hidden in
          the embedded DIY setup flow, where the step header already frames it. */}
      {!embedded && <SubmissionTracker status={a2pStatus} rejectionReasons={rejectionReasons} />}

      {/* Agent SMS number — makes it clear which number all outbound texts
          (review requests, replies, notifications) send from. */}
      {!embedded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--dark-8)',
            background: 'var(--dark-2)',
          }}
        >
          <span style={{ flexShrink: 0, color: 'var(--dark-90)', display: 'inline-flex' }}>
            <MessageChat01 size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text variant="primary" style={{ display: 'block', fontWeight: 500 }}>
              Agent SMS number
            </Text>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 14 }}>
              All outbound texts from your agent send from this number.
            </Text>
          </div>
          <Text
            variant="primary"
            style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
          >
            {AGENT_SMS_NUMBER}
          </Text>
        </div>
      )}

      {/* divider-separated sections, with generous spacing */}
      <div>
        {SECTIONS.map((meta, i) => {
          const inReview = phase === 'review' && !editing[meta.id];
          return (
            <div
              key={meta.id}
              style={{
                borderTop: i > 0 ? '1px solid var(--dark-8)' : undefined,
                // symmetric top/bottom so a collapsed header sits centered between dividers
                paddingTop: i > 0 ? 20 : 0,
                paddingBottom: 20,
              }}
            >
              {inReview ? renderTracker(meta) : renderEditable(meta, phase === 'review' && editing[meta.id])}
            </div>
          );
        })}
      </div>

      {/* single combined submit — flush sticky footer (editing phase only).
          Negative margins bleed past the page's 24px gutter + the scroll
          container's 24px padding so the bar spans edge-to-edge and sits
          flush at the bottom; padding re-insets the contents to the gutter. */}
      {phase === 'editing' && !hideSubmit && (
        <div
          style={
            embedded
              ? { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }
              : {
                  position: 'sticky',
                  bottom: -24,
                  zIndex: 5,
                  margin: '0 -48px -24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 16,
                  background: 'var(--light-100)',
                  borderTop: '1px solid var(--dark-8)',
                  padding: '16px 48px',
                }
          }
        >
          {!allReady && (
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
              Complete every section to submit for review
            </Text>
          )}
          <Button variant="primary" size="md" isDisabled={!allReady} onPress={submitAll}>
            Submit for Review
          </Button>
        </div>
      )}
    </section>
  );
});

// ── Opt-in screenshot uploader (simulated) ────────────────────────────────────

const MAX_SCREENSHOTS = 5;

function OptinUploader({
  screenshots,
  onChange,
}: {
  screenshots: string[];
  onChange: (next: string[]) => void;
}) {
  const add = () => {
    if (screenshots.length >= MAX_SCREENSHOTS) return;
    onChange([...screenshots, `Opt-in screenshot ${screenshots.length + 1}.png`]);
  };
  const remove = (i: number) => onChange(screenshots.filter((_, idx) => idx !== i));

  return (
    <div>
      <Text variant="primary" style={{ display: 'block', marginBottom: 8 }}>
        Screenshots (max {MAX_SCREENSHOTS})
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {screenshots.map((name, i) => (
          <div
            key={name}
            style={{
              width: 160,
              height: 110,
              borderRadius: 8,
              border: '1px solid var(--dark-8)',
              background: 'var(--dark-2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 8,
              position: 'relative',
            }}
          >
            <span style={{ color: 'var(--dark-60)', display: 'inline-flex' }}>
              <CoverImage size={20} />
            </span>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 12, textAlign: 'center' }}>
              {name}
            </Text>
            <button
              type="button"
              aria-label={`Remove ${name}`}
              onClick={() => remove(i)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 22,
                height: 22,
                borderRadius: 6,
                border: '1px solid var(--dark-8)',
                background: 'var(--light-100)',
                color: 'var(--dark-60)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {screenshots.length < MAX_SCREENSHOTS && (
          <button
            type="button"
            onClick={add}
            style={{
              width: 160,
              height: 110,
              borderRadius: 8,
              border: '1.5px dashed var(--dark-15)',
              background: 'transparent',
              color: 'var(--dark-60)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              font: 'inherit',
            }}
          >
            <Upload size={20} />
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14 }}>
              Add Screenshot
            </Text>
          </button>
        )}
      </div>
      <Text variant="secondary" style={{ display: 'block', marginTop: 8, color: 'var(--dark-60)', fontSize: 12 }}>
        Supported formats: PNG, JPG, GIF, WebP
      </Text>
    </div>
  );
}
