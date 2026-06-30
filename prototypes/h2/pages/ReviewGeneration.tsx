import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Modal, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { Chip, Select, StatusPill, TextField, Toggle, useToast } from '@/staging';
import type { Icon } from '@/icons/Types';
import Upload from '@/icons/20/Upload';
import Data from '@/icons/20/Data';
import Mail from '@/icons/20/Mail';
import MessageChat01 from '@/icons/20/MessageChat01';
import Google from '@/icons/20/Google';
import Facebook from '@/icons/20/Facebook';
import Star from '@/icons/20/Star';
import Check2 from '@/icons/20/Check2';
import Plus from '@/icons/20/Plus';
import Edit1 from '@/icons/20/Edit1';
import Send1 from '@/icons/20/Send1';
import ArrowLeft from '@/icons/20/ArrowLeft';
import Lock3 from '@/icons/20/Lock3';

/**
 * /h2/reputation → "Review Generation" tab.
 *
 * Two surfaces:
 *   1. Campaign list — every review-generation campaign with its status
 *      (Draft / Active / Paused / Complete). CRM-backed (ongoing) campaigns
 *      get an on/off toggle; one-time blasts get pause/resume controls.
 *   2. Setup wizard — walks the user through creating a campaign:
 *      customer list → review sites → messages → review & launch.
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

let campaignSeq = 0;

// ═══════════════════════════════════════════════════════════════════
// Root — switches between the campaign list and the setup wizard
// ═══════════════════════════════════════════════════════════════════

export function ReviewGenerationTab() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [view, setView] = useState<'list' | 'wizard'>('list');

  const setStatus = (id: string, status: CampaignStatus) =>
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  const addCampaign = (c: Campaign) => setCampaigns((prev) => [c, ...prev]);

  if (view === 'wizard') {
    return (
      <CampaignWizard
        onCancel={() => setView('list')}
        onFinish={(campaign, asDraft) => {
          addCampaign(campaign);
          setView('list');
          showToast({
            message: asDraft
              ? 'Saved as draft'
              : `“${campaign.name}” is now active`,
          });
        }}
      />
    );
  }

  return (
    <CampaignList
      campaigns={campaigns}
      onCreate={() => setView('wizard')}
      onToggle={(c) => {
        const next: CampaignStatus = c.status === 'active' ? 'paused' : 'active';
        setStatus(c.id, next);
        showToast({ message: next === 'active' ? `“${c.name}” resumed` : `“${c.name}” paused` });
      }}
      onContinue={() => setView('wizard')}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// Campaign list
// ═══════════════════════════════════════════════════════════════════

function CampaignList({
  campaigns,
  onCreate,
  onToggle,
  onContinue,
}: {
  campaigns: Campaign[];
  onCreate: () => void;
  onToggle: (c: Campaign) => void;
  onContinue: (c: Campaign) => void;
}) {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 4px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <span aria-hidden style={{ ...tileStyle, width: 44, height: 44, borderRadius: 11 }}>
          <Star size={22} color="var(--purple)" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={2} style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px' }}>
            Review Generation
          </Heading>
          <Text style={{ color: 'var(--dark-60)', fontSize: 14, lineHeight: 1.55 }}>
            Ask happy customers for reviews over email and SMS, then route them to the sites that
            matter most. Each campaign runs from a customer list you choose.
          </Text>
        </div>
        <Button variant="primary" size="md" frontIcon={Plus} onClick={onCreate}>
          Create campaign
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading level={3} style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-60)' }}>
          Campaigns
        </Heading>
        <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>{campaigns.length} total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} onToggle={() => onToggle(c)} onContinue={() => onContinue(c)} />
        ))}
      </div>
    </div>
  );
}

function CampaignCard({
  campaign: c,
  onToggle,
  onContinue,
}: {
  campaign: Campaign;
  onToggle: () => void;
  onContinue: () => void;
}) {
  const channelText = [c.channels.email && 'Email', c.channels.sms && 'SMS'].filter(Boolean).join(' + ');

  // Right-side control depends on status + source type.
  // CRM (ongoing) campaigns flip on/off with a toggle; one-time blasts pause/resume
  // with a button. Drafts resume setup; completed blasts are terminal.
  let control: ReactNode = null;
  if (c.status === 'draft') {
    control = (
      <Button variant="secondary" size="sm" onClick={onContinue}>
        Continue setup
      </Button>
    );
  } else if (c.status === 'complete') {
    control = (
      <StatusPill tone="info" size="md">
        Complete
      </StatusPill>
    );
  } else if (c.sourceType === 'crm') {
    control = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)' }}>{c.status === 'active' ? 'On' : 'Off'}</Text>
        <Toggle checked={c.status === 'active'} tone="success" onChange={onToggle} />
      </div>
    );
  } else {
    // one-time blast, currently active or paused
    control = (
      <Button variant="secondary" size="sm" onClick={onToggle}>
        {c.status === 'active' ? 'Pause' : 'Resume'}
      </Button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <span aria-hidden style={tileStyle}>
        {c.sourceType === 'csv' ? <Upload size={20} color="var(--purple)" /> : <Data size={20} color="var(--purple)" />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Text style={{ fontWeight: 500, fontSize: 15, color: 'var(--dark-90)' }}>{c.name}</Text>
          <StatusPill tone={STATUS_TONE[c.status]} size="sm">
            {STATUS_LABEL[c.status]}
          </StatusPill>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--dark-60)' }}>
          <span>{c.meta}</span>
          <Dot />
          <span>{c.sourceLabel}</span>
          <Dot />
          <span>{channelText}</span>
          <Dot />
          <span>
            {c.sent.toLocaleString()} sent · {c.collected} reviews
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

function Dot() {
  return <span style={{ color: 'var(--dark-15)' }}>·</span>;
}

// ═══════════════════════════════════════════════════════════════════
// Setup wizard
// ═══════════════════════════════════════════════════════════════════

const STEPS = ['Customer list', 'Review sites', 'Messages', 'Review & launch'] as const;

function CampaignWizard({
  onCancel,
  onFinish,
}: {
  onCancel: () => void;
  onFinish: (campaign: Campaign, asDraft: boolean) => void;
}) {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();

  const [step, setStep] = useState(0);

  // form state
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [csvFile, setCsvFile] = useState<string | null>(null);
  const [crm, setCrm] = useState('');
  const [sites, setSites] = useState<Set<ReviewSiteKey>>(() => new Set<ReviewSiteKey>(['google']));
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [emailSequence, setEmailSequence] = useState<EmailStep[]>(DEFAULT_EMAIL_SEQUENCE);
  const [smsBody, setSmsBody] = useState(DEFAULT_SMS_BODY);
  const [name, setName] = useState('');

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

  const editEmailStep = (s: EmailStep) =>
    openModal(EditMessageModal, {
      title: `Edit “${s.label}” email`,
      subject: s.subject,
      body: s.body,
      footer: EMAIL_FOOTER,
      footerNote: 'The unsubscribe line is required for compliance and can’t be edited.',
      onSave: ({ subject, body }) => {
        setEmailSequence((prev) => prev.map((p) => (p.id === s.id ? { ...p, subject: subject ?? p.subject, body } : p)));
        closeModal();
        showToast({ message: 'Email updated' });
      },
    });

  const editSms = () =>
    openModal(EditMessageModal, {
      title: 'Edit SMS message',
      body: smsBody,
      footer: SMS_FOOTER,
      footerNote: 'The opt-out line is required for compliance and can’t be edited.',
      onSave: ({ body }) => {
        setSmsBody(body);
        closeModal();
        showToast({ message: 'SMS message updated' });
      },
    });

  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 4px 96px' }}>
      {/* back + title */}
      <button
        type="button"
        onClick={onCancel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          border: 'none',
          background: 'transparent',
          padding: 0,
          marginBottom: 16,
          cursor: 'pointer',
          fontFamily: "'Sohne', sans-serif",
          fontSize: 13,
          color: 'var(--dark-60)',
        }}
      >
        <ArrowLeft size={16} color="var(--dark-60)" />
        All campaigns
      </button>

      <Heading level={2} style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.2px', marginBottom: 16 }}>
        New review generation campaign
      </Heading>

      <Stepper current={step} />

      <div style={{ marginTop: 28, marginBottom: 28 }}>
        {step === 0 && (
          <StepShell title="Add your customer list" description="Choose where this campaign pulls contacts from. Your choice sets whether it runs once or on an ongoing basis.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SourceCard
                icon={Upload}
                title="CSV upload"
                tag="One-time blast"
                description="Upload a spreadsheet of customers with their name, email, and phone. The campaign sends once."
                selected={sourceType === 'csv'}
                onSelect={() => setSourceType('csv')}
              >
                {sourceType === 'csv' &&
                  (csvFile ? (
                    <Chip deletable size="md" onDelete={() => setCsvFile(null)}>
                      {csvFile}
                    </Chip>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
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
              >
                {sourceType === 'crm' && (
                  <Select
                    value={crm}
                    placeholder="Choose a CRM"
                    options={CRM_OPTIONS}
                    size="sm"
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
          <StepShell title="Choose where to send reviewers" description="Pick the review sites customers are asked to post to. The agent routes each request to one of these.">
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
          <StepShell title="Set up your messages" description="Choose the channels this campaign uses and review what gets sent. All emails send from reviews@blaze.ai.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <ChannelBlock icon={Mail} title="Email" checked={email} onChange={setEmail}>
                {email && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    {emailSequence.map((s) => (
                      <div
                        key={s.id}
                        style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '12px 14px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>{s.label}</Text>
                          <StatusPill tone="neutral" size="sm">{s.timing}</StatusPill>
                          <div style={{ marginLeft: 'auto' }}>
                            <Button variant="ghost" size="sm" frontIcon={Edit1} onClick={() => editEmailStep(s)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                        <PreviewLine label="Subject" value={s.subject} />
                        <PreviewLine label="Body" value={s.body} />
                        <LockedFooter text={EMAIL_FOOTER} />
                      </div>
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

              {/* SMS */}
              <ChannelBlock icon={MessageChat01} title="SMS" checked={sms} onChange={setSms}>
                {sms && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    <div style={{ background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>Message</Text>
                        <div style={{ marginLeft: 'auto' }}>
                          <Button variant="ghost" size="sm" frontIcon={Edit1} onClick={editSms}>
                            Edit
                          </Button>
                        </div>
                      </div>
                      <PreviewLine label="Text" value={smsBody} />
                      <LockedFooter text={SMS_FOOTER} />
                    </div>
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
                )}
              </ChannelBlock>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Review & launch" description="Give this campaign a name and confirm the setup. You can change everything later from the campaign list.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <Text style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>
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

      {/* footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          paddingTop: 20,
          borderTop: '1px solid var(--dark-8)',
        }}
      >
        <Button variant="ghost" size="md" onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="md" onClick={() => onFinish(buildCampaign('draft'), true)}>
            Save as draft
          </Button>
          {isLast ? (
            <Button variant="primary" size="md" disabled={!canNext} onClick={() => onFinish(buildCampaign('active'), false)}>
              Create campaign
            </Button>
          ) : (
            <Button variant="primary" size="md" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wizard sub-components ───────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < STEPS.length - 1 ? 1 : '0 0 auto' }}>
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: 999,
                background: done || active ? 'var(--dark-90)' : 'var(--dark-8)',
                color: done || active ? 'var(--light-100)' : 'var(--dark-60)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {done ? <Check2 size={14} color="var(--light-100)" /> : i + 1}
            </span>
            <Text
              style={{
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--dark-90)' : 'var(--dark-60)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Text>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 1, background: 'var(--dark-8)', minWidth: 12 }} />}
          </div>
        );
      })}
    </div>
  );
}

function StepShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div>
      <Heading level={3} style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.1px' }}>
        {title}
      </Heading>
      <Text style={{ display: 'block', color: 'var(--dark-60)', fontSize: 14, lineHeight: 1.5, marginTop: 4, marginBottom: 18 }}>
        {description}
      </Text>
      {children}
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
  children,
}: {
  icon: Icon;
  title: string;
  tag: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        border: selected ? '1px solid var(--purple)' : '1px solid var(--dark-8)',
        background: selected ? 'rgba(124, 92, 252, 0.04)' : 'var(--light-100)',
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 14, border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            width: 18,
            height: 18,
            flexShrink: 0,
            borderRadius: 999,
            border: selected ? '5px solid var(--purple)' : '1.5px solid var(--dark-15)',
            background: 'var(--light-100)',
            marginTop: 11,
            boxSizing: 'border-box',
          }}
        />
        <span aria-hidden style={tileStyle}>
          <Icon size={20} color="var(--purple)" />
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>{title}</Text>
            <StatusPill tone="accent" size="sm">{tag}</StatusPill>
          </span>
          <Text style={{ color: 'var(--dark-60)', fontSize: 13, lineHeight: 1.5 }}>{description}</Text>
        </span>
      </button>
      {children && <div style={{ paddingLeft: 32, marginTop: 12 }}>{children}</div>}
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
        <Text style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12 }}>{description}</Text>
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
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.5, marginBottom: 4 }}>
      <span style={{ flexShrink: 0, width: 56, color: 'var(--dark-60)' }}>{label}</span>
      <span style={{ color: 'var(--dark-90)' }}>{value}</span>
    </div>
  );
}

function LockedFooter({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px dashed var(--dark-8)',
        fontSize: 12,
        color: 'var(--dark-40)',
      }}
    >
      <Lock3 size={20} color="var(--dark-40)" />
      <span style={{ lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: last ? 'none' : '1px solid var(--dark-8)' }}>
      <span style={{ flexShrink: 0, width: 120, fontSize: 13, color: 'var(--dark-60)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--dark-90)' }}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Edit message modal (compliance footer is locked)
// ═══════════════════════════════════════════════════════════════════

function EditMessageModal({
  close,
  title,
  subject,
  body,
  footer,
  footerNote,
  onSave,
}: StackModalProps & {
  title: string;
  subject?: string;
  body: string;
  footer: string;
  footerNote: string;
  onSave: (next: { subject?: string; body: string }) => void;
}) {
  const [subjectVal, setSubjectVal] = useState(subject ?? '');
  const [bodyVal, setBodyVal] = useState(body);
  const canSave = bodyVal.trim().length > 0 && (subject === undefined || subjectVal.trim().length > 0);

  return (
    <Modal.Root size="md" aria-labelledby="edit-message-title" data-testid="edit-message-modal">
      <Modal.Header title={title} id="edit-message-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        {subject !== undefined && (
          <div style={{ marginBottom: 16 }}>
            <Text style={{ display: 'block', fontSize: 12, color: 'var(--dark-60)', fontWeight: 500, marginBottom: 8 }}>
              Subject
            </Text>
            <TextField value={subjectVal} onChange={setSubjectVal} fullWidth />
          </div>
        )}
        <div>
          <Text style={{ display: 'block', fontSize: 12, color: 'var(--dark-60)', fontWeight: 500, marginBottom: 8 }}>
            Message
          </Text>
          <textarea
            value={bodyVal}
            onChange={(e) => setBodyVal(e.target.value)}
            rows={6}
            style={{
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
              minHeight: 120,
              lineHeight: 1.55,
            }}
          />
        </div>

        {/* Locked compliance footer */}
        <div style={{ marginTop: 16 }}>
          <Text style={{ display: 'block', fontSize: 12, color: 'var(--dark-60)', fontWeight: 500, marginBottom: 8 }}>
            Required footer
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'var(--dark-4)',
              border: '1px solid var(--dark-8)',
              borderRadius: 9,
              padding: '10px 12px',
              color: 'var(--dark-60)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <Lock3 size={20} color="var(--dark-40)" />
            <span>{footer}</span>
          </div>
          <Text style={{ display: 'block', fontSize: 12, color: 'var(--dark-40)', marginTop: 6 }}>
            {footerNote}
          </Text>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            isDisabled={!canSave}
            onPress={() => onSave({ subject: subject !== undefined ? subjectVal.trim() : undefined, body: bodyVal.trim() })}
          >
            Save
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
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
