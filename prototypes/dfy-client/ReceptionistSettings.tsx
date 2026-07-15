import { useState, type ReactNode } from 'react';
import { Button, Heading, IconButton, Modal, Text, useModals, type StackModalProps } from '@/components';
import { StatusPill, TabChip, useToast } from '@/staging';
import ArrowLeft from '@/icons/20/ArrowLeft';
import Check from '@/icons/16/Check';
import Edit3 from '@/icons/20/Edit3';
import { ClientShell } from './shell';
import { ComplianceSection } from '../h2/pages/SdrCompliance';
import {
  DEFAULT_QUALIFICATION_QUESTIONS,
  RESPONSE_FORMATS,
  THRESHOLD_OPERATORS,
  type QualificationQuestion,
} from '../h2/qualification-criteria-data';

/**
 * AI Receptionist settings: the client-facing (Grain Design Flooring) mirror
 * of the operator's AI Receptionist settings (h2/pages/SdrSettings.tsx).
 *
 * Opens as a full page from a button in the Leads topbar (see Leads.tsx) and
 * closes back to the Leads inbox via the back arrow. It is NOT a routed page.
 *
 * The client sees EVERYTHING Blaze configured, but read-only. For the six
 * config areas Blaze owns (escalation rules, qualification criteria, system
 * prompt, voice & personality, recipients, hours) the client can only
 * "Request a change". A note goes to their Blaze team. The one exception is
 * Compliance (A2P / 10DLC), which is legally the client's to complete, so the
 * real editable ComplianceSection is embedded with full access.
 */

type SubKey = 'triggers' | 'agent' | 'qualification' | 'outcomes' | 'notifications' | 'compliance';

const SUBS: { key: SubKey; label: string }[] = [
  { key: 'triggers', label: 'Triggers' },
  { key: 'agent', label: 'Agent' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'outcomes', label: 'Outcomes' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'compliance', label: 'Compliance' },
];

export function ReceptionistSettings({ onBack }: { onBack: () => void }) {
  const { openModal } = useModals();
  const { showToast } = useToast();
  const [active, setActive] = useState<SubKey>('triggers');
  // sectionKey → the change note the client submitted for it.
  const [requests, setRequests] = useState<Record<string, string>>({});

  const requestChange = (key: string, label: string) => {
    openModal(RequestChangeModal, {
      sectionLabel: label,
      existing: requests[key] ?? '',
      onSubmit: (note: string) => {
        setRequests((r) => ({ ...r, [key]: note }));
        showToast({ message: `Change request sent to your Blaze team: ${label}` });
      },
    });
  };

  const title = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <IconButton variant="secondary" size="sm" icon={ArrowLeft} aria-label="Back to Leads" onPress={onBack} />
      <Text variant="largeList" style={{ color: 'var(--dark-90)', fontWeight: 500 }}>AI Receptionist settings</Text>
    </div>
  );

  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {SUBS.map((s) => (
        <TabChip key={s.key} selected={active === s.key} onSelect={() => setActive(s.key)}>{s.label}</TabChip>
      ))}
    </div>
  );

  const shared = { requests, requestChange };

  return (
    <ClientShell section="leads" title={title} topbarCenter={topbarCenter}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 28px 80px' }}>
        {active === 'triggers' && <TriggersTab {...shared} />}
        {active === 'agent' && <AgentTab {...shared} />}
        {active === 'qualification' && <QualificationTab {...shared} />}
        {active === 'outcomes' && <OutcomesTab {...shared} />}
        {active === 'notifications' && <NotificationsTab {...shared} />}
        {active === 'compliance' && <ComplianceTab />}
      </div>
    </ClientShell>
  );
}

// ── Shared read-only building blocks ───────────────────────────────────────

type TabProps = { requests: Record<string, string>; requestChange: (key: string, label: string) => void };

/** A read-only settings section. `requestKey`/`requestLabel` opt it into the
 *  "Request change" affordance; omit them for plain read-only sections. */
function Section({
  title,
  description,
  requestKey,
  requestLabel,
  requests,
  requestChange,
  children,
}: {
  title: string;
  description?: string;
  requestKey?: string;
  requestLabel?: string;
  requests?: Record<string, string>;
  requestChange?: (key: string, label: string) => void;
  children: ReactNode;
}) {
  const requested = requestKey && requests ? requests[requestKey] : undefined;
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <Heading level={4} style={{ margin: 0 }}>{title}</Heading>
          {description && <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 4 }}>{description}</Text>}
        </div>
        {requestKey && requestLabel && requestChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {requested !== undefined && <StatusPill tone="info" size="sm">Change requested</StatusPill>}
            <Button
              variant={requested !== undefined ? 'ghost' : 'secondary'}
              size="md"
              frontIcon={Edit3}
              onPress={() => requestChange(requestKey, requestLabel)}
            >
              {requested !== undefined ? 'Edit request' : 'Request change'}
            </Button>
          </div>
        )}
      </div>
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', overflow: 'hidden' }}>
        {children}
      </div>
    </section>
  );
}

/** A label → value row inside a Section card. */
function Row({ label, children, top }: { label: string; children: ReactNode; top?: boolean }) {
  return (
    <div
      style={{
        display: 'flex', gap: 16, padding: '14px 18px', borderTop: top ? 'none' : '1px solid var(--dark-8)',
        alignItems: 'baseline',
      }}
    >
      <div style={{ flexShrink: 0, minWidth: 120 }}>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{label}</Text>
      </div>
      <div style={{ minWidth: 0, flex: 1, color: 'var(--dark-90)' }}>{children}</div>
    </div>
  );
}

/** Static multi-line text block (system prompt, knowledge base, greeting).
 *  Sits directly inside the Section card, no extra inner container. */
function TextBlock({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', color: 'var(--dark-80)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
      {children}
    </div>
  );
}

function OnOff({ on, onLabel = 'On', offLabel = 'Off' }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return <StatusPill tone={on ? 'success' : 'neutral'} size="sm">{on ? onLabel : offLabel}</StatusPill>;
}

// ── Triggers ────────────────────────────────────────────────────────────────

const SHIFT_HOURS: { day: string; hours: string; on: boolean }[] = [
  { day: 'Monday', hours: '8:00 AM – 6:00 PM', on: true },
  { day: 'Tuesday', hours: '8:00 AM – 6:00 PM', on: true },
  { day: 'Wednesday', hours: '8:00 AM – 6:00 PM', on: true },
  { day: 'Thursday', hours: '8:00 AM – 6:00 PM', on: true },
  { day: 'Friday', hours: '8:00 AM – 5:00 PM', on: true },
  { day: 'Saturday', hours: '9:00 AM – 2:00 PM', on: true },
  { day: 'Sunday', hours: 'Closed', on: false },
];

function TriggersTab({ requests, requestChange }: TabProps) {
  return (
    <>
      <Section title="Agent phone number" description="The number callers reach and that the AI uses for outbound SMS.">
        <Row label="Phone number" top>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: 'var(--dark-90)', fontWeight: 500 }}>+1 (512) 555-0148</Text>
            <StatusPill tone="success" size="sm">Active</StatusPill>
          </div>
        </Row>
      </Section>

      <Section
        title="Hours"
        description="When the AI answers, and the shift hours it handles inbound contacts."
        requestKey="hours"
        requestLabel="Hours"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="During business hours" top>Picks up on the 4th ring, giving your team a chance to grab it first.</Row>
        <Row label="After hours">Answers on the 1st ring. No one&rsquo;s in the office, so the AI responds immediately.</Row>
        <div style={{ borderTop: '1px solid var(--dark-8)', padding: '14px 18px' }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 10 }}>Shift hours</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SHIFT_HOURS.map((s) => (
              <div key={s.day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                <Text style={{ color: 'var(--dark-90)', width: 120 }}>{s.day}</Text>
                <Text style={{ color: s.on ? 'var(--dark-90)' : 'var(--dark-40)', flex: 1 }}>{s.hours}</Text>
                <OnOff on={s.on} onLabel="Open" offLabel="Closed" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Agent ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Riley, the AI receptionist for Grain Design Flooring, a premium flooring company serving the Austin metro.

Always introduce yourself as Riley. Be warm, professional, and efficient. Keep calls under 4 minutes.

Collect the project type (hardwood / laminate / vinyl / carpet), the property location within the Austin service area, the approximate project budget, and preferred timeline. Confirm the caller is the homeowner or decision-maker before booking an in-home measure.`;

const KNOWLEDGE_BASE = `Grain Design Flooring installs and refinishes hardwood, laminate, luxury vinyl plank, and carpet across the greater Austin area. In-home measures are free. Typical install lead time is 2–3 weeks. Financing available on projects over $5,000. Showroom open Mon–Sat in South Austin.`;

function ruleSummary(q: QualificationQuestion): string {
  const rule = q.rule;
  switch (rule.mode) {
    case 'all':
      return 'All responses qualify';
    case 'threshold': {
      const op = THRESHOLD_OPERATORS.find((o) => o.id === rule.operator)?.symbol ?? rule.operator;
      const amount = q.responseFormat === 'currency' ? `$${rule.threshold.toLocaleString()}` : rule.threshold;
      return `Qualifies ${op} ${amount}`;
    }
    case 'allowed-list':
      return `Must match ${rule.allowedValues.filter(Boolean).length} allowed value(s)`;
    case 'selected-options':
      return `${rule.qualifyingOptions.length} of ${q.options.length} options qualify`;
  }
}

function AgentTab({ requests, requestChange }: TabProps) {
  return (
    <>
      <Section
        title="System prompt"
        description="The instructions that tell the AI who it is and how to handle every conversation."
        requestKey="system-prompt"
        requestLabel="System prompt"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="Model" top>GPT-4o</Row>
        <div style={{ borderTop: '1px solid var(--dark-8)' }}>
          <TextBlock>{SYSTEM_PROMPT}</TextBlock>
        </div>
      </Section>

      <Section
        title="Voice & personality"
        description="How the AI sounds and greets your callers."
        requestKey="voice"
        requestLabel="Voice & personality"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="AI voice" top>Sarah · Friendly, clear</Row>
        <Row label="Tone">Warm</Row>
        <Row label="Max call duration">5 minutes</Row>
        <Row label="Greeting">
          <span style={{ fontStyle: 'italic', color: 'var(--dark-80)' }}>
            &ldquo;Hi, thanks for calling Grain Design Flooring! This is Riley. I can help you get a free in-home measure booked. How can I help today?&rdquo;
          </span>
        </Row>
      </Section>

      <Section title="Knowledge base" description="Facts the AI can draw on when answering caller questions.">
        <TextBlock>{KNOWLEDGE_BASE}</TextBlock>
      </Section>
    </>
  );
}

// ── Qualification ─────────────────────────────────────────────────────────────
// Read-only mirror of the questions the AI asks to qualify a lead. Same data as
// the AM-side Qualification tab; clients review it and can request a change.

function QualificationTab({ requests, requestChange }: TabProps) {
  return (
    <Section
      title="Qualification criteria"
      description="The questions the AI asks to qualify a lead, and what counts as qualified."
      requestKey="qualification"
      requestLabel="Qualification criteria"
      requests={requests}
      requestChange={requestChange}
    >
      {DEFAULT_QUALIFICATION_QUESTIONS.map((q, i) => (
        <div
          key={q.id}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}
        >
          <div style={{ minWidth: 0 }}>
            <Text style={{ color: 'var(--dark-90)', fontWeight: 500, display: 'block' }}>{q.label}</Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
              {q.type === 'multiple-choice'
                ? `Multiple choice · ${q.options.length} options`
                : `Freeform · ${RESPONSE_FORMATS.find((f) => f.id === q.responseFormat)?.label}`}
            </Text>
          </div>
          <StatusPill tone={q.rule.mode === 'all' ? 'neutral' : 'accent'} size="sm">{ruleSummary(q)}</StatusPill>
        </div>
      ))}
    </Section>
  );
}

// ── Outcomes ────────────────────────────────────────────────────────────────

const ESCALATION_RULES: { name: string; detail: string }[] = [
  { name: 'Angry or upset caller', detail: 'If the caller is frustrated or asks for a manager, escalate immediately.' },
  { name: 'Commercial / large project', detail: 'Projects over 3,000 sq ft or commercial jobs route to the owner.' },
  { name: 'Out of service area', detail: 'Callers outside the Austin metro are captured but flagged for follow-up.' },
];

function OutcomesTab({ requests, requestChange }: TabProps) {
  return (
    <>
      <Section title="Escalations" description="When the AI hands a live conversation to your team.">
        <Row label="Escalation" top><OnOff on onLabel="Enabled" /></Row>
        <Row label="Contact method">Call + SMS</Row>
        <Row label="Escalation number">+1 (512) 555-0170</Row>
      </Section>

      <Section
        title="Escalation rules"
        description="The situations that trigger a handoff to your team."
        requestKey="escalation"
        requestLabel="Escalation rules"
        requests={requests}
        requestChange={requestChange}
      >
        {ESCALATION_RULES.map((r, i) => (
          <div key={r.name} style={{ padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
            <Text style={{ color: 'var(--dark-90)', fontWeight: 500, display: 'block' }}>{r.name}</Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{r.detail}</Text>
          </div>
        ))}
      </Section>

      <Section
        title="Bookings"
        description="How booked appointments are confirmed and delivered."
        requestKey="bookings"
        requestLabel="Bookings"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="Booking calendar" top>Grain Design Flooring: In-home measures</Row>
        <Row label="Confirmation">SMS + email confirmation sent to the caller on booking.</Row>
        <Row label="Notification email">bookings@graindesignflooring.com</Row>
      </Section>
    </>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────

const NOTIFY_EVENTS: { event: string; channels: string }[] = [
  { event: 'New qualified lead', channels: 'Push · SMS · Email' },
  { event: 'Appointment booked', channels: 'Push · Email' },
  { event: 'Escalation triggered', channels: 'Push · SMS' },
  { event: 'Missed / unqualified call', channels: 'Email' },
];

const RECIPIENTS: { name: string; email: string; phone: string }[] = [
  { name: 'Michael Hart', email: 'michael@graindesignflooring.com', phone: '+1 (512) 555-0101' },
  { name: 'Sofia Lin', email: 'sofia@graindesignflooring.com', phone: '+1 (512) 555-0102' },
];

function NotificationsTab({ requests, requestChange }: TabProps) {
  return (
    <>
      <Section
        title="Notify me when…"
        description="The events that trigger a notification."
        requestKey="notify"
        requestLabel="Notify me when…"
        requests={requests}
        requestChange={requestChange}
      >
        {NOTIFY_EVENTS.map((n, i) => (
          <div key={n.event} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
            <Text style={{ color: 'var(--dark-90)' }}>{n.event}</Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{n.channels}</Text>
          </div>
        ))}
      </Section>

      <Section
        title="Recipients"
        description="Who receives the notifications above."
        requestKey="recipients"
        requestLabel="Recipients"
        requests={requests}
        requestChange={requestChange}
      >
        {RECIPIENTS.map((r, i) => (
          <div key={r.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--dark-8)' }}>
            <div>
              <Text style={{ color: 'var(--dark-90)', fontWeight: 500, display: 'block' }}>{r.name}</Text>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{r.email}</Text>
            </div>
            <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{r.phone}</Text>
          </div>
        ))}
      </Section>

      <Section
        title="Quiet hours"
        description="When non-urgent notifications are held."
        requestKey="quiet-hours"
        requestLabel="Quiet hours"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="Quiet hours" top><OnOff on onLabel="Enabled" /></Row>
        <Row label="Window">9:00 PM – 7:00 AM</Row>
      </Section>

      <Section
        title="Daily digest"
        description="A once-a-day summary of receptionist activity."
        requestKey="daily-digest"
        requestLabel="Daily digest"
        requests={requests}
        requestChange={requestChange}
      >
        <Row label="Daily digest" top><OnOff on onLabel="Enabled" /></Row>
        <Row label="Send time">8:00 AM</Row>
      </Section>
    </>
  );
}

// ── Compliance (editable, the client's to complete) ────────────────────────

function ComplianceTab() {
  return (
    <section>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px', marginBottom: 24, border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--dark-2)' }}>
        <span style={{ marginTop: 1, color: 'var(--status-approved)' }}><Check size={16} /></span>
        <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
          Carrier registration (A2P / 10DLC) is required before your AI Receptionist can send texts. This is yours to complete. Fill it in and submit it directly.
        </Text>
      </div>
      <ComplianceSection embedded />
    </section>
  );
}

// ── Request-a-change modal ──────────────────────────────────────────────────

function RequestChangeModal({
  close,
  sectionLabel,
  existing,
  onSubmit,
}: StackModalProps & { sectionLabel: string; existing: string; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState(existing);
  const submit = () => {
    if (!note.trim()) return;
    onSubmit(note.trim());
    close();
  };
  return (
    <Modal.Root size="sm" onPressOutside={close}>
      <Modal.Header title="Request a change" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Tell your Blaze team what you&rsquo;d like to change to <Text style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{sectionLabel}</Text>. They&rsquo;ll make the update and confirm.
          </Text>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            autoFocus
            placeholder={`e.g. Please update ${sectionLabel.toLowerCase()} to…`}
            style={{
              fontFamily: "'Sohne', sans-serif", fontSize: 14, lineHeight: 1.6, color: 'var(--dark-90)',
              padding: '10px 12px', border: '1px solid var(--dark-8)', borderRadius: 8, background: 'var(--light-100)',
              outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical',
            }}
          />
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="tertiary" onPress={close}>Cancel</Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={submit} isDisabled={!note.trim()}>Send request</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
