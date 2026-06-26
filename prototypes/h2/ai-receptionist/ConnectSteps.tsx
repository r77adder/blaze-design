import { useState, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Select } from '@/staging';
import { Input } from '../_ui';
import Check2 from '@/icons/20/Check2';

/**
 * Inline "connect a tool" step bodies for the DIY receptionist flow. The wizard
 * decides WHICH steps appear from the abilities picked on the train step.
 *
 * - ConnectStepBody: optional H3 sub-sections + a gray box holding the
 *   secondary connect button (Twilio also gets a "have Blaze help" button).
 * - ComplianceForm: the A2P form rendered right in the step.
 * Skipping is handled by the parent's footer ("Skip for now").
 */

export interface SetupPhase {
  heading: string;
  steps: string[];
}

export interface ConnectContent {
  /** Shown as the step's Section subtitle in the parent. */
  intro: string;
  phases?: SetupPhase[];
  connectLabel: string;
  connectCaption?: string;
  connectedLabel: string;
  /** Twilio only — a second button to bring in a Blaze specialist. */
  helpLabel?: string;
}

export function ConnectStepBody({
  content,
  done,
  onConnect,
  onHelp,
  hideConnect = false,
}: {
  content: ConnectContent;
  done: boolean;
  onConnect: () => void;
  onHelp?: () => void;
  /** Hide the in-body connect CTA (the parent owns it, e.g. in a footer).
   *  Still shows the connected badge once done, and keeps the caption as context. */
  hideConnect?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {content.phases?.map((phase) => (
        <div key={phase.heading}>
          <Heading level={3} style={{ margin: '0 0 12px' }}>
            {phase.heading}
          </Heading>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {phase.steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <span aria-hidden style={{ flexShrink: 0, width: 5, height: 5, borderRadius: '50%', background: 'var(--dark-40)', marginTop: 9 }} />
                <Text style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--dark-80)' }}>{step}</Text>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {done ? (
        <GrayBox>
          <DoneBadge label={content.connectedLabel} />
        </GrayBox>
      ) : hideConnect ? (
        content.connectCaption ? (
          <Text variant="secondary" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--dark-60)' }}>
            {content.connectCaption}
          </Text>
        ) : null
      ) : (
        <GrayBox>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onPress={onConnect}>
              {content.connectLabel}
            </Button>
            {content.helpLabel && onHelp && (
              <Button variant="secondary" size="md" onPress={onHelp}>
                {content.helpLabel}
              </Button>
            )}
          </div>
          {content.connectCaption && (
            <Text variant="secondary" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--dark-60)' }}>
              {content.connectCaption}
            </Text>
          )}
        </GrayBox>
      )}
    </div>
  );
}

const USE_CASE_OPTIONS = [
  { value: 'reminders', label: 'Appointment reminders & confirmations' },
  { value: 'followups', label: 'Follow-ups & re-engagement' },
  { value: 'both', label: 'Both' },
];

export function ComplianceForm({ submitted, onSubmit }: { submitted: boolean; onSubmit: () => void }) {
  const [bizName, setBizName] = useState('CertaPro Painters of Austin');
  const [address, setAddress] = useState('');
  const [ein, setEin] = useState('');
  const [useCase, setUseCase] = useState('reminders');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>
      <FormField label="Legal business name">
        <Input value={bizName} onChange={(e) => setBizName(e.target.value)} fullWidth />
      </FormField>
      <FormField label="Business address">
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Austin, TX 78701" fullWidth />
      </FormField>
      <FormField label="EIN / Tax ID">
        <Input value={ein} onChange={(e) => setEin(e.target.value)} placeholder="12-3456789" style={{ width: 240 }} />
      </FormField>
      <FormField label="How you'll use texting">
        <Select value={useCase} onChange={setUseCase} options={USE_CASE_OPTIONS} fullWidth />
      </FormField>

      <GrayBox>
        {submitted ? (
          <DoneBadge label="Submitted for review" />
        ) : (
          <div>
            <Button variant="secondary" size="md" onPress={onSubmit}>
              Submit for review
            </Button>
          </div>
        )}
        <Text variant="secondary" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--dark-60)' }}>
          Carriers usually review within one to two weeks. Your calls keep working the whole time.
        </Text>
      </GrayBox>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────

function GrayBox({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--dark-4)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {children}
    </div>
  );
}

function DoneBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px 6px 10px',
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--status-approved) 12%, transparent)',
        color: 'var(--status-approved)',
        fontSize: 14,
        fontWeight: 500,
        alignSelf: 'flex-start',
      }}
    >
      <Check2 size={16} color="var(--status-approved)" />
      {label}
    </span>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</Text>
      {children}
    </div>
  );
}

// ── Content ──────────────────────────────────────────────────────────

export const TWILIO_SETUP: ConnectContent = {
  intro: 'Twilio gives your receptionist a real phone number to answer calls and text from. It takes about 10 minutes.',
  phases: [
    {
      heading: 'Create your Twilio account',
      steps: [
        'Go to twilio.com and sign up with your email — it’s free to start.',
        'Confirm your email and phone number when Twilio asks.',
      ],
    },
    {
      heading: 'Get a phone number',
      steps: [
        'In Twilio, choose a local number for your business.',
        'Pick one that can do both calls and texts, then claim it.',
      ],
    },
  ],
  connectLabel: 'Connect with Twilio',
  connectCaption: 'You’ll sign in to Twilio and approve access — Blaze handles the rest, no codes to copy.',
  connectedLabel: 'Twilio connected',
  helpLabel: 'Have someone from Blaze help you',
};

export const COMPLIANCE_SETUP: ConnectContent = {
  intro: 'Before your receptionist can text customers, phone carriers need to confirm your business is real. Fill this out, or skip and finish it later.',
  connectLabel: 'Submit for review',
  connectedLabel: 'Submitted for review',
};

export const CALENDAR_SETUP: ConnectContent = {
  intro: 'Connect your calendar so your receptionist can book, reschedule, and confirm appointments without any back-and-forth.',
  connectLabel: 'Connect Google Calendar',
  connectCaption: 'You’ll sign in to Google and approve access.',
  connectedLabel: 'Calendar connected',
};

export const CRM_SETUP: ConnectContent = {
  intro: 'Connect your CRM so every qualified lead flows into your Blaze lead table and your existing tools.',
  connectLabel: 'Connect your CRM',
  connectCaption: 'Works with HubSpot, Salesforce, and more.',
  connectedLabel: 'CRM connected',
};
