import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, IconButton, Modal, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Chip, Select, StatusPill, TextField, Toggle, useToast } from '@/staging';
import type { Icon } from '@/icons/Types';
import Upload from '@/icons/20/Upload';
import Data from '@/icons/20/Data';
import Mail from '@/icons/20/Mail';
import MessageChat01 from '@/icons/20/MessageChat01';
import Google from '@/icons/20/Google';
import Facebook from '@/icons/20/Facebook';
import Plus from '@/icons/20/Plus';
import Edit1 from '@/icons/20/Edit1';
import Send1 from '@/icons/20/Send1';
import Lock3 from '@/icons/20/Lock3';
import Trash2 from '@/icons/20/Trash2';
import { AGENT_SMS_NUMBER, type A2pStatus } from './SdrCompliance';

/**
 * /h2/reputation → "Review Requests" tab.
 *
 * Two surfaces:
 *   1. Campaign list — every review-request campaign with its status
 *      (Draft / Active / Paused / Complete). CRM-backed (ongoing) campaigns
 *      get an on/off toggle; one-time blasts get pause/resume controls.
 *   2. Setup wizard — a BDS modal that walks the user through creating a
 *      campaign step by step (no breadcrumb stepper): customer list → review
 *      sites → messages → review & launch. SMS stays gated behind A2P
 *      compliance until the brand is verified (see ComplianceGate).
 *
 * Scoped-down port of Birdeye's review-request setup. Customer lists are
 * limited to CSV upload + CRM integration. Out of scope for v1:
 * send-time/optimization triggers, formal A/B testing, and sending email
 * from the client's own domain (all email sends from reviews@blaze.ai).
 */

// ── Domain types ───────────────────────────────────────────────────

type CampaignStatus = 'draft' | 'active' | 'paused' | 'complete';
type SourceType = 'csv' | 'crm';
type ReviewSiteKey = 'google' | 'facebook';

interface Campaign {
  id: string;
  name: string;
  sourceType: SourceType;
  sourceLabel: string;
  channels: { email: boolean; sms: boolean };
  sites: ReviewSiteKey[];
  status: CampaignStatus;
  sent: number;
  collected: number;
  meta: string;
  /** Draft-only: the wizard step the user left off on, so "Finish setup"
   *  reopens the wizard right where they abandoned it. */
  resumeStep?: number;
  /** Draft-only: the uploaded CSV chip label to restore (CSV sources). */
  draftCsvFile?: string;
}

const CRM_OPTIONS = [
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'gohighlevel', label: 'GoHighLevel' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'jobber', label: 'Jobber' },
];

const REVIEW_SITES: { key: ReviewSiteKey; label: string; icon: Icon; sub: string }[] = [
  { key: 'google', label: 'Google Business Profile', icon: Google, sub: 'Highest impact on local search' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, sub: 'Recommendations on your page' },
];

const STATUS_TONE: Record<CampaignStatus, 'neutral' | 'success' | 'warning' | 'info'> = {
  draft: 'neutral',
  active: 'success',
  paused: 'warning',
  complete: 'info',
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  complete: 'Complete',
};

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'cabinet-draft',
    name: 'Cabinet refinish spring push',
    sourceType: 'csv',
    sourceLabel: 'CSV · 312 contacts',
    channels: { email: true, sms: false },
    sites: ['google', 'facebook'],
    status: 'draft',
    sent: 0,
    collected: 0,
    meta: 'One-time blast · saved as draft',
    // Picked up mid-way: customer list + sites done, abandoned on the
    // messages step.
    resumeStep: 2,
    draftCsvFile: 'cabinet-customers-march.csv · 312 contacts',
  },
  {
    id: 'spring-blast',
    name: 'Spring repaint follow-up',
    sourceType: 'csv',
    sourceLabel: 'CSV · 482 contacts',
    channels: { email: true, sms: true },
    sites: ['google'],
    status: 'complete',
    sent: 482,
    collected: 63,
    meta: 'One-time blast · sent Jun 12',
  },
  {
    id: 'crm-ongoing',
    name: 'Completed jobs — ongoing',
    sourceType: 'crm',
    sourceLabel: 'HubSpot · auto-sync',
    channels: { email: true, sms: true },
    sites: ['google', 'facebook'],
    status: 'active',
    sent: 218,
    collected: 47,
    meta: 'Ongoing · running since May 2',
  },
];

// ── Message templates (compliance footers are locked) ──────────────

interface EmailStep {
  id: string;
  label: string;
  timing: string;
  subject: string;
  body: string;
}

const EMAIL_FOOTER =
  "You're receiving this because you're a customer of CertaPro Painters of Austin. Unsubscribe from review requests.";
const SMS_FOOTER = 'Reply STOP to opt out.';

const DEFAULT_EMAIL_SEQUENCE: EmailStep[] = [
  {
    id: 'initial',
    label: 'Initial request',
    timing: 'Sent immediately',
    subject: 'How was your experience with CertaPro Painters?',
    body: 'Hi {first name} — thanks for choosing us! Would you mind leaving a quick review? It only takes a minute and helps your neighbors find us.',
  },
  {
    id: 'reminder',
    label: 'Reminder',
    timing: '3 days later',
    subject: 'A quick reminder',
    body: 'Hi {first name}, just following up — a short review would mean a lot to our crew and helps other homeowners choose with confidence.',
  },
];

const DEFAULT_SMS_BODY =
  'Hi {first name}, thanks for choosing CertaPro! Mind leaving a quick review? {link}';

const DEFAULT_CAMPAIGN_NAME = 'Review request campaign';

// Per-step title + description — surfaced in the modal header (title +
// subHeader) rather than in the step body.
const STEP_META = [
  {
    title: 'Add your customer list',
    description:
      'Choose where this campaign pulls contacts from. Your choice sets whether it runs once or on an ongoing basis.',
  },
  {
    title: 'Choose where to send reviewers',
    description:
      'Pick the review sites customers are asked to post to. The agent routes each request to one of these.',
  },
  {
    title: 'Set up your messages',
    description:
      'Choose the channels this campaign uses and review what gets sent. All emails send from reviews@blaze.ai.',
  },
  {
    title: 'Review & launch',
    description:
      'Give this campaign a name and confirm the setup. You can change everything later from the campaign list.',
  },
] as const;

let campaignSeq = 0;

// ═══════════════════════════════════════════════════════════════════
// Root — switches between the campaign list and the setup wizard
// ═══════════════════════════════════════════════════════════════════

export function ReviewGenerationTab({
  a2pStatus,
  onStartCompliance,
}: {
  /** Shared A2P verification status — SMS is gated until this is `verified`. */
  a2pStatus: A2pStatus;
  /** Jump to the Settings → Compliance sub-tab from inside the wizard. */
  onStartCompliance: () => void;
}) {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);

  const setStatus = (id: string, status: CampaignStatus) =>
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  // `initial` resumes an existing draft; omitted for a brand-new campaign.
  const openWizard = (initial?: Campaign) =>
    openModal(CampaignWizardModal, {
      a2pStatus,
      onStartCompliance,
      initial,
      onFinish: (campaign: Campaign, asDraft: boolean) => {
        // Drop the draft we resumed (if any) so it isn't duplicated.
        setCampaigns((prev) => [campaign, ...prev.filter((c) => c.id !== initial?.id)]);
        closeModal();
        showToast({
          message: asDraft ? 'Saved as draft' : `“${campaign.name}” is now active`,
        });
      },
    });

  const confirmDelete = (c: Campaign) =>
    openModal(DeleteCampaignModal, {
      name: c.name,
      onConfirm: () => {
        setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
        closeModal();
        showToast({ message: `“${c.name}” deleted` });
      },
    });

  return (
    <CampaignList
      campaigns={campaigns}
      onCreate={() => openWizard()}
      onToggle={(c) => {
        const next: CampaignStatus = c.status === 'active' ? 'paused' : 'active';
        setStatus(c.id, next);
        showToast({ message: next === 'active' ? `“${c.name}” resumed` : `“${c.name}” paused` });
      }}
      onContinue={openWizard}
      onDelete={confirmDelete}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Campaign list
// ═══════════════════════════════════════════════════════════════════

// Table layout — one container, divider-separated rows, columns aligned to a
// shared grid (Campaign · Contacts · Type · Source · control).
// The two trailing columns are fixed widths (not `auto`) so the control's
// varying content — toggle, button, or nothing — plus the delete button never
// shift the data columns out of alignment.
const CAMPAIGN_GRID = 'minmax(0, 2.6fr) minmax(0, 1fr) minmax(0, 0.85fr) minmax(0, 1fr) 132px 36px';
const CAMPAIGN_COLUMNS = ['Campaign', 'Contacts', 'Type', 'Source'] as const;

function CampaignList({
  campaigns,
  onCreate,
  onToggle,
  onContinue,
  onDelete,
}: {
  campaigns: Campaign[];
  onCreate: () => void;
  onToggle: (c: Campaign) => void;
  onContinue: (c: Campaign) => void;
  onDelete: (c: Campaign) => void;
}) {
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 4px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={2}>Review Requests</Heading>
          <Text style={{ display: 'block', color: 'var(--dark-60)', fontSize: 14, lineHeight: 1.55, marginTop: 6 }}>
            Ask happy customers for reviews over email and SMS, then route them to the sites that
            matter most. Each campaign runs from a customer list you choose.
          </Text>
        </div>
        <Button variant="secondary" size="md" frontIcon={Plus} onClick={onCreate}>
          Create campaign
        </Button>
      </div>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden', background: 'var(--light-100)' }}>
        {/* Column header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: CAMPAIGN_GRID,
            gap: 16,
            alignItems: 'center',
            padding: '10px 18px',
            borderBottom: '1px solid var(--dark-8)',
          }}
        >
          {CAMPAIGN_COLUMNS.map((h) => (
            <span key={h} style={{ fontSize: 12, color: 'var(--dark-60)' }}>
              {h}
            </span>
          ))}
          <span />
          <span />
        </div>
        {campaigns.map((c, i) => (
          <CampaignRow
            key={c.id}
            campaign={c}
            isFirst={i === 0}
            onToggle={() => onToggle(c)}
            onContinue={() => onContinue(c)}
            onDelete={() => onDelete(c)}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignRow({
  campaign: c,
  isFirst,
  onToggle,
  onContinue,
  onDelete,
}: {
  campaign: Campaign;
  isFirst: boolean;
  onToggle: () => void;
  onContinue: () => void;
  onDelete: () => void;
}) {
  // Split the stored source label into its source + contacts halves so each
  // can sit in its own column ("HubSpot · auto-sync" → "HubSpot" + "Auto-sync").
  const isCrm = c.sourceType === 'crm';
  const [sourceName, contactsRaw] = c.sourceLabel.split(' · ');
  const contactsText = isCrm ? 'Auto-sync' : contactsRaw ?? '—';
  const typeText = isCrm ? 'Ongoing' : 'One-time blast';

  // Right-side control depends on status + source type. Status itself lives in
  // the pill beside the name, so the control only carries actions — never a
  // second copy of the status. CRM (ongoing) campaigns flip on/off with a
  // toggle; one-time blasts pause/resume with a button. Drafts resume setup;
  // completed blasts are terminal (no control).
  let control: ReactNode = null;
  if (c.status === 'draft') {
    control = (
      <Button variant="secondary" size="sm" onClick={onContinue}>
        Finish setup
      </Button>
    );
  } else if (c.status === 'complete') {
    control = null;
  } else {
    // Active / paused — both CRM and one-time blasts flip on/off with a toggle.
    control = <Toggle checked={c.status === 'active'} onChange={onToggle} />;
  }

  const cellText: CSSProperties = { fontSize: 14, color: 'var(--dark-60)' };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: CAMPAIGN_GRID,
        gap: 16,
        alignItems: 'center',
        padding: '16px 18px',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      {/* Campaign */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span aria-hidden style={SOURCE_ACCENT[c.sourceType].tile}>
          {isCrm ? (
            <Data size={20} color={SOURCE_ACCENT.crm.icon} />
          ) : (
            <Upload size={20} color={SOURCE_ACCENT.csv.icon} />
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Text
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: 'var(--dark-90)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}
          >
            {c.name}
          </Text>
          <span style={{ flexShrink: 0 }}>
            <StatusPill tone={STATUS_TONE[c.status]} size="sm">
              {STATUS_LABEL[c.status]}
            </StatusPill>
          </span>
        </span>
      </div>
      {/* Contacts */}
      <Text style={cellText}>{contactsText}</Text>
      {/* Type */}
      <Text style={cellText}>{typeText}</Text>
      {/* Source */}
      <Text style={cellText}>{sourceName}</Text>
      {/* Control */}
      <div style={{ justifySelf: 'end' }}>{control}</div>
      {/* Delete */}
      <div style={{ justifySelf: 'end' }}>
        <IconButton
          icon={Trash2}
          size="sm"
          variant="tertiary"
          aria-label={`Delete ${c.name}`}
          onPress={onDelete}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Delete confirmation
// ═══════════════════════════════════════════════════════════════════

function DeleteCampaignModal({
  close,
  name,
  onConfirm,
}: StackModalProps & {
  name: string;
  onConfirm: () => void;
}) {
  return (
    <Modal.Root size="sm" aria-labelledby="delete-campaign-title" data-testid="delete-campaign-modal">
      <Modal.Header title="Delete campaign?" id="delete-campaign-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <Text style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.55 }}>
          “{name}” and its sending history will be removed. This can’t be undone.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="danger" onPress={onConfirm}>
            Delete campaign
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Setup wizard
// ═══════════════════════════════════════════════════════════════════

const STEPS = ['Customer list', 'Review sites', 'Messages', 'Review & launch'] as const;

function CampaignWizardModal({
  close,
  a2pStatus,
  onStartCompliance,
  initial,
  onFinish,
}: StackModalProps & {
  a2pStatus: A2pStatus;
  onStartCompliance: () => void;
  /** When resuming a saved draft, seeds the form + starting step from it. */
  initial?: Campaign;
  onFinish: (campaign: Campaign, asDraft: boolean) => void;
}) {
  const { showToast } = useToast();

  // Resume a saved draft where the user left off, else start fresh.
  const [step, setStep] = useState(initial?.resumeStep ?? 0);

  // form state — seeded from the draft when resuming
  const [sourceType, setSourceType] = useState<SourceType | null>(initial?.sourceType ?? null);
  const [csvFile, setCsvFile] = useState<string | null>(
    initial && initial.sourceType === 'csv' ? initial.draftCsvFile ?? initial.sourceLabel : null,
  );
  const [crm, setCrm] = useState(
    initial && initial.sourceType === 'crm'
      ? CRM_OPTIONS.find((o) => o.label === initial.sourceLabel.split(' · ')[0])?.value ?? ''
      : '',
  );
  const [sites, setSites] = useState<Set<ReviewSiteKey>>(
    () => new Set<ReviewSiteKey>(initial?.sites ?? ['google']),
  );
  const [email, setEmail] = useState(initial?.channels.email ?? true);
  // SMS starts off — it can only be switched on once A2P compliance is verified
  // (see the ComplianceGate below).
  const [sms, setSms] = useState(initial?.channels.sms ?? false);
  const [emailSequence, setEmailSequence] = useState<EmailStep[]>(DEFAULT_EMAIL_SEQUENCE);
  const [smsBody, setSmsBody] = useState(DEFAULT_SMS_BODY);
  // Campaign is named by default so the user can launch straight from the list.
  const [name, setName] = useState(initial?.name ?? DEFAULT_CAMPAIGN_NAME);

  const smsVerified = a2pStatus === 'verified';
  // Leaving the wizard for the Compliance tab — close this modal first.
  const goToCompliance = () => {
    close();
    onStartCompliance();
  };

  const crmLabel = CRM_OPTIONS.find((o) => o.value === crm)?.label ?? '';

  const stepValid = [
    sourceType !== null && (sourceType === 'csv' ? csvFile !== null : crm !== ''),
    sites.size > 0,
    email || sms,
    name.trim().length > 0,
  ];
  const canNext = stepValid[step];

  const toggleSite = (key: ReviewSiteKey) =>
    setSites((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const buildCampaign = (status: CampaignStatus): Campaign => {
    const contacts = csvFile ? 482 : 0;
    return {
      id: `c-${++campaignSeq}-${name.trim().toLowerCase().replace(/\s+/g, '-') || 'untitled'}`,
      name: name.trim() || 'Untitled campaign',
      sourceType: sourceType ?? 'csv',
      sourceLabel: sourceType === 'crm' ? `${crmLabel} · auto-sync` : `CSV · ${contacts} contacts`,
      channels: { email, sms },
      sites: [...sites],
      status,
      sent: 0,
      collected: 0,
      meta: sourceType === 'crm' ? 'Ongoing · just created' : 'One-time blast · just created',
    };
  };

  const updateEmailStep = (id: string, patch: Partial<EmailStep>) =>
    setEmailSequence((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const isLast = step === STEPS.length - 1;
  const stepMeta = STEP_META[step];

  return (
    <Modal.Root size="lg" aria-labelledby="campaign-wizard-title" data-testid="campaign-wizard-modal">
      <Modal.Header
        title={stepMeta.title}
        id="campaign-wizard-title"
        onClose={close}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', fontSize: 14, lineHeight: 1.5 }}>
            {stepMeta.description}
          </Text>
        }
      />
      <Modal.Content>
        <div>
        {step === 0 && (
          <StepShell>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SourceCard
                icon={Upload}
                title="CSV upload"
                tag="One-time blast"
                description="Upload a spreadsheet of customers with their name, email, and phone. The campaign sends once."
                selected={sourceType === 'csv'}
                onSelect={() => setSourceType('csv')}
                accent={SOURCE_ACCENT.csv}
              >
                {sourceType === 'csv' &&
                  (csvFile ? (
                    <Chip deletable size="md" onDelete={() => setCsvFile(null)}>
                      {csvFile}
                    </Chip>
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        setCsvFile('customers-june.csv · 482 contacts');
                        showToast({ message: '482 contacts imported from CSV' });
                      }}
                    >
                      Upload CSV
                    </Button>
                  ))}
              </SourceCard>

              <SourceCard
                icon={Data}
                title="CRM integration"
                tag="Ongoing"
                description="Sync contacts from your CRM. New customers are added to the queue automatically as they come in."
                selected={sourceType === 'crm'}
                onSelect={() => setSourceType('crm')}
                accent={SOURCE_ACCENT.crm}
              >
                {sourceType === 'crm' && (
                  <Select
                    value={crm}
                    placeholder="Choose a CRM"
                    options={CRM_OPTIONS}
                    size="lg"
                    onChange={(v) => {
                      setCrm(v);
                      showToast({ message: `Connected to ${CRM_OPTIONS.find((o) => o.value === v)?.label}` });
                    }}
                    style={{ minWidth: 200 }}
                  />
                )}
              </SourceCard>
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
              {REVIEW_SITES.map((site, i) => (
                <ToggleRow
                  key={site.key}
                  icon={site.icon}
                  title={site.label}
                  description={site.sub}
                  checked={sites.has(site.key)}
                  onChange={() => toggleSite(site.key)}
                  divider={i > 0}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <ChannelBlock icon={Mail} title="Email" checked={email} onChange={setEmail}>
                {email && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    {emailSequence.map((s) => (
                      <EmailStepCard
                        key={s.id}
                        step={s}
                        onChange={(patch) => updateEmailStep(s.id, patch)}
                      />
                    ))}
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        frontIcon={Send1}
                        onClick={() => showToast({ message: 'Draft sent to eddie@blaze.ai' })}
                      >
                        Send myself a test
                      </Button>
                    </div>
                  </div>
                )}
              </ChannelBlock>

              {/* SMS — toggling on when A2P isn't verified reveals the
                  compliance gate instead of the message editor. */}
              <ChannelBlock icon={MessageChat01} title="SMS" checked={sms} onChange={setSms}>
                {sms &&
                  (smsVerified ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      <SmsMessageCard body={smsBody} onChange={setSmsBody} />
                      <div>
                        <Button
                          variant="secondary"
                          size="sm"
                          frontIcon={Send1}
                          onClick={() => showToast({ message: 'Test SMS sent to your number' })}
                        >
                          Send myself a test
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ComplianceGate onStart={goToCompliance} />
                  ))}
              </ChannelBlock>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>
                  Campaign name
                </Text>
                <TextField value={name} onChange={setName} fullWidth placeholder="e.g. Completed jobs — ongoing" />
              </div>
              <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
                <SummaryRow label="Customer list" value={sourceType === 'crm' ? `${crmLabel} · ongoing` : `${csvFile ?? 'CSV'} · one-time`} />
                <SummaryRow label="Review sites" value={[...sites].map((s) => REVIEW_SITES.find((r) => r.key === s)?.label).join(', ') || '—'} />
                <SummaryRow label="Channels" value={[email && 'Email', sms && 'SMS'].filter(Boolean).join(' + ') || '—'} />
                <SummaryRow label="Email sender" value="reviews@blaze.ai" last />
              </div>
            </div>
          </StepShell>
        )}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={step === 0 ? close : () => setStep((s) => s - 1)}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Modal.FooterButton variant="secondary" onPress={() => onFinish(buildCampaign('draft'), true)}>
              Save as draft
            </Modal.FooterButton>
            {isLast ? (
              <Modal.FooterButton variant="primary" isDisabled={!canNext} onPress={() => onFinish(buildCampaign('active'), false)}>
                Create campaign
              </Modal.FooterButton>
            ) : (
              <Modal.FooterButton variant="primary" isDisabled={!canNext} onPress={() => setStep((s) => s + 1)}>
                Next
              </Modal.FooterButton>
            )}
          </div>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// Shown inside the SMS channel block when A2P registration isn't verified yet —
// SMS review requests can't send until the brand clears carrier compliance.
function ComplianceGate({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginTop: 12,
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(237, 124, 44, 0.22)',
        background: 'rgba(237, 124, 44, 0.08)',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--status-connect)', display: 'inline-flex' }}>
        <Lock3 size={20} color="var(--status-connect)" />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
          Finish A2P compliance to enable SMS
        </Text>
        <Text style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5 }}>
          SMS review requests need carrier-approved A2P 10DLC registration. Complete compliance under
          Settings, then SMS unlocks here.
        </Text>
        <div>
          <Button variant="secondary" size="sm" onClick={onStart}>
            Complete compliance
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Wizard sub-components ───────────────────────────────────────────

// Step title/description now live in the modal header, so this is just a
// spacing wrapper around the step body.
function StepShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

// Locked compliance footer note, shared by the inline message editors.
function lockedFooterNote(kind: 'email' | 'sms') {
  return kind === 'email'
    ? 'The unsubscribe line is required for compliance and can’t be edited.'
    : 'The opt-out line is required for compliance and can’t be edited.';
}

const messageCardStyle: CSSProperties = {
  background: 'var(--dark-2)',
  border: '1px solid var(--dark-8)',
  borderRadius: 10,
  padding: '12px 14px',
};

const inlineTextareaStyle: CSSProperties = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 14,
  color: 'var(--dark-90)',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-15)',
  borderRadius: 9,
  padding: '10px 12px',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.55,
};

// Email step card — preview by default, editable inline (no sub-modal).
function EmailStepCard({ step, onChange }: { step: EmailStep; onChange: (patch: Partial<EmailStep>) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={messageCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{step.label}</Text>
        <StatusPill tone="neutral" size="sm">{step.timing}</StatusPill>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="ghost"
            size="sm"
            frontIcon={editing ? undefined : Edit1}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <Text style={{ display: 'block', fontSize: 14, color: 'var(--dark-60)', marginBottom: 4 }}>Subject</Text>
            <TextField value={step.subject} onChange={(v) => onChange({ subject: v })} fullWidth />
          </div>
          <div>
            <Text style={{ display: 'block', fontSize: 14, color: 'var(--dark-60)', marginBottom: 4 }}>Body</Text>
            <textarea
              value={step.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={4}
              style={{ ...inlineTextareaStyle, minHeight: 96 }}
            />
          </div>
          <LockedFooter text={EMAIL_FOOTER} note={lockedFooterNote('email')} />
        </div>
      ) : (
        <>
          <PreviewLine label="Subject" value={step.subject} />
          <PreviewLine label="Body" value={step.body} />
          <LockedFooter text={EMAIL_FOOTER} />
        </>
      )}
    </div>
  );
}

// SMS message card — preview by default, editable inline (no sub-modal).
function SmsMessageCard({ body, onChange }: { body: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={messageCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Message</Text>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="ghost"
            size="sm"
            frontIcon={editing ? undefined : Edit1}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {/* Sender — makes it clear the text comes from the agent's A2P number. */}
      <PreviewLine label="From" value={AGENT_SMS_NUMBER} />
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            value={body}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            style={{ ...inlineTextareaStyle, minHeight: 72 }}
          />
          <LockedFooter text={SMS_FOOTER} note={lockedFooterNote('sms')} />
        </div>
      ) : (
        <>
          <PreviewLine label="Text" value={body} />
          <LockedFooter text={SMS_FOOTER} />
        </>
      )}
    </div>
  );
}

function SourceCard({
  icon: Icon,
  title,
  tag,
  description,
  selected,
  onSelect,
  accent = { tile: tileStyle, icon: 'var(--purple)' },
  children,
}: {
  icon: Icon;
  title: string;
  tag: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  accent?: { tile: CSSProperties; icon: string };
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        border: selected ? '1px solid var(--dark-90)' : '1px solid var(--dark-8)',
        background: selected ? 'var(--light-100)' : 'var(--dark-2)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 14, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', flex: 1, minWidth: 0 }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            width: 18,
            height: 18,
            flexShrink: 0,
            borderRadius: 999,
            border: selected ? '5px solid var(--dark-90)' : '1.5px solid var(--dark-15)',
            background: 'var(--light-100)',
            marginTop: 11,
            boxSizing: 'border-box',
          }}
        />
        <span aria-hidden style={accent.tile}>
          <Icon size={20} color={accent.icon} />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{title}</Text>
            <StatusPill tone="accent" size="sm">{tag}</StatusPill>
          </span>
          <Text style={{ color: 'var(--dark-60)', fontSize: 14, lineHeight: 1.5 }}>{description}</Text>
        </span>
      </button>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  divider,
}: {
  icon: Icon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: divider ? '1px solid var(--dark-8)' : 'none' }}>
      <span aria-hidden style={tileStyle}>
        <Icon size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{title}</Text>
        <Text style={{ display: 'block', color: 'var(--dark-60)', fontSize: 14 }}>{description}</Text>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ChannelBlock({
  icon: Icon,
  title,
  checked,
  onChange,
  children,
}: {
  icon: Icon;
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: '16px 18px', background: 'var(--light-100)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span aria-hidden style={tileStyle}>
          <Icon size={20} color="var(--purple)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{title}</Text>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {children}
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5, marginBottom: 4 }}>
      <span style={{ flexShrink: 0, width: 56, color: 'var(--dark-60)' }}>{label}</span>
      <span style={{ color: 'var(--dark-90)' }}>{value}</span>
    </div>
  );
}

function LockedFooter({ text, note }: { text: string; note?: string }) {
  return (
    <div
      style={{
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px dashed var(--dark-8)',
        fontSize: 14,
        color: 'var(--dark-40)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lock3 size={20} color="var(--dark-40)" />
        <span style={{ lineHeight: 1.4 }}>{text}</span>
      </div>
      {note && (
        <Text style={{ display: 'block', fontSize: 14, color: 'var(--dark-40)', marginTop: 6 }}>{note}</Text>
      )}
    </div>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: last ? 'none' : '1px solid var(--dark-8)' }}>
      <span style={{ flexShrink: 0, width: 120, fontSize: 14, color: 'var(--dark-60)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--dark-90)' }}>{value}</span>
    </div>
  );
}


// ── shared ─────────────────────────────────────────────────────────

const tileStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: 8,
  background: 'rgba(124, 92, 252, 0.10)',
  color: 'var(--purple)',
};

// Source-type accent — CSV upload (one-time) reads blue; CRM integration
// (ongoing) reads purple, so the two are distinguishable at a glance.
const SOURCE_ACCENT: Record<SourceType, { tile: CSSProperties; icon: string }> = {
  csv: { tile: { ...tileStyle, background: 'rgba(1, 121, 207, 0.10)' }, icon: 'var(--status-posting)' },
  crm: { tile: tileStyle, icon: 'var(--purple)' },
};
