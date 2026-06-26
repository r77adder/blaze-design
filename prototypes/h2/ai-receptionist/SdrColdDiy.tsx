import { useState, useRef, type ReactNode, type ComponentType } from 'react';
import { Button, Heading, Text } from '@/components';
import { Callout, Select, StatusPill, useToast } from '@/staging';
import { Input } from '../_ui';
import { useDevState } from '../dev-state-context';
import { useApprovalAudience } from '../approval-audience-context';
import type { IconProps } from '@/icons/Types';
import Voice from '@/icons/20/Voice';
import Calendar1 from '@/icons/20/Calendar1';
import Lightning from '@/icons/20/Lightning';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import Play3 from '@/icons/20/Play3';
import Check from '@/icons/16/Check';
import ChevronDown from '@/icons/20/ChevronDown';
import ArrowRight from '@/icons/20/ArrowRight';
import ArrowLeft from '@/icons/20/ArrowLeft';
import {
  ConnectStepBody,
  TWILIO_SETUP,
  CALENDAR_SETUP,
  CRM_SETUP,
} from './ConnectSteps';
import { ComplianceSection } from '../pages/SdrCompliance';
import { ChatDemoPanel, CallDemoModal } from './DemoExperience';

/**
 * DIY cold state for the AI Receptionist (`/h2/sdr` when isCold AND the
 * approval audience is `diy`). Page title lives in the H2Layout header.
 *
 * Screens:
 *   sales — a hero that pitches the receptionist (mirrors the DFY cold state),
 *           the voice + greeting, and chat/demo-call try-outs at the bottom.
 *   train — agent name + the four selectable ability cards. The selection
 *           drives a DYNAMIC flow of connect steps:
 *             Connect Twilio → phone numbers → A2P compliance → calendar → CRM,
 *           only for the abilities chosen. Each connect step is skippable.
 *   The last step's CTA is "Activate receptionist".
 *
 * No persistence — prototype only.
 */

const BLAZE_NUMBER = '+1 (512) 323-9502';

const VOICE_OPTIONS = [
  { value: 'warm-professional', label: 'Warm & professional' },
  { value: 'crisp-efficient', label: 'Crisp & efficient' },
  { value: 'friendly-casual', label: 'Friendly & casual' },
];
const VOICE_LABEL: Record<string, string> = Object.fromEntries(VOICE_OPTIONS.map((o) => [o.value, o.label]));

const HERO_CHECKLIST = [
  'Answers calls and texts 24/7',
  'Books appointments for you',
  'Qualifies and routes every lead',
  'Hands off to a human when needed',
];

const FORWARDING_STEPS = [
  'On most carriers, dial *72 from your business phone, then your agent’s number, to forward every call — dial *73 to turn it off.',
  'On a smartphone you can also turn this on under Settings → Phone → Call Forwarding (iPhone) or the Phone app’s settings (Android).',
  'Want calls to ring your team first and only forward when no one answers? Use your carrier’s conditional / no-answer forwarding.',
  'Not sure where to find it? Search your carrier’s name plus “call forwarding” — we’ll also email you the exact steps.',
];

const HUMAN_LINE_STEPS = [
  'Any direct line works — a mobile, a desk phone, or a teammate’s number.',
  'Most carriers can add a second line or number to your existing plan — check your provider’s app or give them a call.',
  'No luck there? Create a free number with Google Voice (voice.google.com) and point it at whoever should take handoffs.',
];

type CardId = 'calls' | 'texts' | 'book' | 'crm';

interface AbilityCardData {
  id: CardId;
  icon: ComponentType<IconProps>;
  brandHex: string;
  title: string;
  /** Consolidated subhead — what it does plus what it needs. */
  description: string;
}

const ABILITY_CARDS: AbilityCardData[] = [
  {
    id: 'calls',
    icon: Voice,
    brandHex: '#f22f46',
    title: 'Take calls & talk to customers',
    description:
      'Answer inbound calls, talk to leads and customers, answer their questions, and route them to the right place. You’ll need a Twilio integration plus the ability to set up separate lines and forwarding with your current provider.',
  },
  {
    id: 'texts',
    icon: MessageText2,
    brandHex: '#7c5cfc',
    title: 'Send text messages',
    description:
      'Send appointment confirmations, reminders, and follow-ups to your leads and customers over text. This needs A2P / 10DLC compliance — complete every section below, then submit your brand for outbound voice and SMS verification.',
  },
  {
    id: 'book',
    icon: Calendar1,
    brandHex: '#4285f4',
    title: 'Book appointments',
    description:
      'Book, reschedule, and confirm appointments directly in your connected calendar — no phone tag required. Connect Google Calendar or Outlook to enable it.',
  },
  {
    id: 'crm',
    icon: Lightning,
    brandHex: '#ff7a59',
    title: 'Integrate with your CRM',
    description:
      'Sync every qualified lead into your Blaze lead table, or push it to HubSpot, Salesforce, or your own CRM.',
  },
];

type ConnectId = 'twilio' | 'calendar' | 'crm';
type DemoId = 'chat' | 'call';
type Screen = 'sales' | 'twilio' | 'phone' | 'compliance' | 'calendar' | 'crm';

// Each setup step is framed by the ability it unlocks. `phone` is a
// continuation of the mandatory calls setup, so it carries no ability header.
const ABILITY_BY_ID = Object.fromEntries(ABILITY_CARDS.map((c) => [c.id, c])) as Record<
  CardId,
  AbilityCardData
>;
// Connect steps whose CTA lives in the footer (the body just explains the step).
const CONNECT_FOOTER: Partial<Record<Screen, { id: ConnectId; label: string; message: string }>> = {
  calendar: { id: 'calendar', label: 'Connect Google Calendar', message: 'Google Calendar connected · Riley can book appointments' },
  crm: { id: 'crm', label: 'Connect your CRM', message: 'CRM connected · Leads will migrate to your lead table' },
};

export function SdrColdDiy() {
  const { setState } = useDevState();
  const { setAudience } = useApprovalAudience();
  const { showToast } = useToast();

  const [stepIdx, setStepIdx] = useState(0);

  const [name, setName] = useState('Riley');
  const [voice, setVoice] = useState('warm-professional');
  const [connected, setConnected] = useState<Set<ConnectId>>(() => new Set());
  const [complianceStarted, setComplianceStarted] = useState(false);
  const [demo, setDemo] = useState<DemoId | null>(null);
  const [businessNumber, setBusinessNumber] = useState('');
  const [humanNumber, setHumanNumber] = useState('');
  const complianceRef = useRef<{ submit: () => void } | null>(null);
  const [complianceReady, setComplianceReady] = useState(false);

  // No upfront ability picker — every setup step is shown and the user decides
  // on each one. Optional steps can be skipped from the footer.
  const screens: Screen[] = ['sales', 'twilio', 'phone', 'compliance', 'calendar', 'crm'];

  const safeIdx = Math.min(stepIdx, screens.length - 1);
  const screen = screens[safeIdx];
  const isLast = safeIdx === screens.length - 1;

  const norm = (s: string) => s.replace(/[^\d]/g, '');
  const numbersClash =
    businessNumber.trim() !== '' &&
    humanNumber.trim() !== '' &&
    norm(businessNumber) === norm(humanNumber);
  const phoneBlocked = screen === 'phone' && numbersClash;

  const stepDone =
    screen === 'twilio' ? connected.has('twilio') :
    screen === 'calendar' ? connected.has('calendar') :
    screen === 'crm' ? connected.has('crm') :
    screen === 'compliance' ? complianceStarted :
    true;
  // Short steps (just a header + caption) center vertically in the body.
  const shortStep = screen === 'calendar' || screen === 'crm';

  const connect = (id: ConnectId, message: string) => {
    setConnected((prev) => new Set(prev).add(id));
    showToast({ message });
  };

  const back = () => setStepIdx((i) => Math.max(0, i - 1));
  const next = () => setStepIdx((i) => Math.min(i + 1, screens.length - 1));
  const goLive = () => {
    showToast({ message: 'AI receptionist activated', variant: 'success' });
    setState('/h2/sdr', 'steady');
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* scrolling body — centered column */}
      <div style={{ flex: '1 0 auto', width: '100%', maxWidth: screen === 'compliance' ? 940 : screen === 'sales' ? 1320 : 720, margin: '0 auto', paddingBottom: 32, display: shortStep ? 'flex' : undefined, flexDirection: shortStep ? 'column' : undefined, justifyContent: shortStep ? 'center' : undefined }}>
        {screen === 'sales' && (
          <div
            style={{
              background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
              borderRadius: 16,
              padding: '40px 44px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 320 }}>
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--dark-90)',
                  marginBottom: 16,
                }}
              >
                {(name || 'R').charAt(0).toUpperCase()}
              </span>
              <Heading level={2} style={{ margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                Never miss another call.
              </Heading>
              <Text style={{ display: 'block', fontSize: 16, color: 'var(--dark-80)', lineHeight: 1.6, maxWidth: 460, marginBottom: 28 }}>
                Your AI receptionist answers every call and text, books appointments, and hands off to you when
                it matters — day or night. Set it up below, then hear it for yourself.
              </Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <Field label="Agent name">
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Riley" fullWidth />
                    </Field>
                  </div>
                  <div style={{ width: 190, flexShrink: 0 }}>
                    <Field label="Voice">
                      <Select
                        value={voice}
                        onChange={setVoice}
                        options={VOICE_OPTIONS}
                        fullWidth
                        optionAction={{
                          icon: Play3,
                          ariaLabel: 'Preview voice',
                          onAction: (v) => showToast({ message: `Playing the ${VOICE_LABEL[v]} sample` }),
                        }}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Experience it for yourself" hint="Try a quick chat or a live demo call to hear your agent.">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="lg" frontIcon={MessageChat01} onPress={() => setDemo('chat')}>
                      Chat with your agent
                    </Button>
                    <Button variant="secondary" size="lg" frontIcon={Voice} onPress={() => setDemo('call')}>
                      Try a demo call
                    </Button>
                  </div>
                </Field>
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                width: 328,
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 14,
                padding: '30px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 4 }}>What it can do</div>
              {HERO_CHECKLIST.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ flexShrink: 0, marginTop: 2, display: 'inline-flex' }}>
                    <Check size={16} color="var(--status-posting)" />
                  </span>
                  <span style={{ fontSize: 16, letterSpacing: '0.32px', color: 'var(--dark-80)', lineHeight: 1.45 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === 'twilio' && (
          <div>
            <StepHeader ability={ABILITY_BY_ID.calls} />
            <ConnectStepBody
              content={TWILIO_SETUP}
              done={connected.has('twilio')}
              onConnect={() => connect('twilio', `Twilio connected · Number ${BLAZE_NUMBER} provisioned`)}
              onHelp={() => showToast({ message: 'A Blaze specialist will reach out to set up Twilio with you.' })}
              hideConnect
            />
          </div>
        )}

        {screen === 'phone' && (
          <Section
            title="Setup forwarding & extra line"
            subtitle="Customers keep calling the number they already know — forward it to your agent’s number so the AI picks up every call, day or night. When a caller needs a person, your agent hands off to a direct human line."
          >
            <Field label="Enter your business number and set up forwarding to your agent number" hint="The number your customers already call.">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Input
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  placeholder="+1 (512) 555-0100"
                  inputMode="tel"
                  inputSize="lg"
                  style={{ width: 240, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 280 }}>
                  <Disclosure summary="How do I forward my business number?" items={FORWARDING_STEPS} />
                </div>
              </div>
            </Field>

            <Field
              label="Your agent number"
              hint="Auto-provisioned by Blaze. Forward your business number to this number so the AI answers your calls."
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 8,
                    background: 'var(--dark-2)',
                  }}
                >
                  <span style={{ fontSize: 16, letterSpacing: '0.32px', fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
                    {BLAZE_NUMBER}
                  </span>
                  <StatusPill tone="success" size="sm">
                    Ready
                  </StatusPill>
                </div>
              </div>
            </Field>

            <Field
              label="Direct line to a human"
              hint="Where the agent transfers when a caller needs a person. Must be different from your business number."
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Input
                  value={humanNumber}
                  onChange={(e) => setHumanNumber(e.target.value)}
                  placeholder="+1 (512) 555-0142"
                  inputMode="tel"
                  inputSize="lg"
                  style={{ width: 240, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 280 }}>
                  <Disclosure summary="Don’t have a separate line for handoffs?" items={HUMAN_LINE_STEPS} />
                </div>
              </div>
            </Field>

            {numbersClash && (
              <Callout tone="warning" title="Use a different number">
                This is the same as your business number. That line forwards to the AI, so transfers would
                loop back. Enter a direct line that reaches a person.
              </Callout>
            )}
          </Section>
        )}

        {screen === 'compliance' && (
          <div>
            <StepHeader ability={ABILITY_BY_ID.texts} />
            <ComplianceSection
              ref={complianceRef}
              embedded
              hideSubmit
              onReadyChange={setComplianceReady}
              onSubmitted={() => setComplianceStarted(true)}
            />
          </div>
        )}

        {screen === 'calendar' && (
          <div>
            <StepHeader ability={ABILITY_BY_ID.book} />
            <ConnectStepBody
              content={CALENDAR_SETUP}
              done={connected.has('calendar')}
              onConnect={() => connect('calendar', 'Google Calendar connected · Riley can book appointments')}
              hideConnect
            />
          </div>
        )}

        {screen === 'crm' && (
          <div>
            <StepHeader ability={ABILITY_BY_ID.crm} />
            <ConnectStepBody
              content={CRM_SETUP}
              done={connected.has('crm')}
              onConnect={() => connect('crm', 'CRM connected · Leads will migrate to your lead table')}
              hideConnect
            />
          </div>
        )}
      </div>

      {/* sticky footer */}
      <div
        style={{
          position: 'sticky',
          bottom: -24,
          zIndex: 5,
          margin: '0 -24px -24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          {safeIdx > 0 ? (
            <Button variant="ghost" size="md" frontIcon={ArrowLeft} onPress={back}>
              Back
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setAudience('dfy')}
              style={{
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--dark-60)',
                textDecoration: 'underline',
              }}
            >
              Prefer we set it up for you?
            </button>
          )}
        </div>

        {screen === 'twilio' && !connected.has('twilio') ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="secondary"
              size="md"
              onPress={() => showToast({ message: 'A Blaze specialist will reach out to set up Twilio with you.' })}
            >
              Have someone from Blaze help you
            </Button>
            <Button
              variant="primary"
              size="md"
              endIcon={ArrowRight}
              onPress={() => {
                connect('twilio', `Twilio connected · Number ${BLAZE_NUMBER} provisioned`);
                next();
              }}
            >
              Connect with Twilio
            </Button>
          </div>
        ) : screen === 'compliance' && !complianceStarted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="ghost"
              size="md"
              onPress={() => {
                if (isLast) goLive();
                else next();
              }}
            >
              Skip for now
            </Button>
            <Button
              variant="primary"
              size="md"
              isDisabled={!complianceReady}
              onPress={() => {
                complianceRef.current?.submit();
                next();
              }}
            >
              Submit for review
            </Button>
          </div>
        ) : (screen === 'calendar' || screen === 'crm') && !stepDone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              variant="ghost"
              size="md"
              onPress={() => {
                if (isLast) goLive();
                else next();
              }}
            >
              Skip for now
            </Button>
            <Button
              variant="primary"
              size="md"
              endIcon={ArrowRight}
              onPress={() => {
                const c = CONNECT_FOOTER[screen]!;
                connect(c.id, c.message);
                next();
              }}
            >
              {CONNECT_FOOTER[screen]!.label}
            </Button>
          </div>
        ) : isLast ? (
          <Button variant="primary" size="md" onPress={goLive} isDisabled={phoneBlocked}>
            Activate receptionist
          </Button>
        ) : (
          <Button variant="primary" size="md" endIcon={ArrowRight} onPress={next} isDisabled={phoneBlocked}>
            Continue
          </Button>
        )}
      </div>

      {demo === 'chat' && <ChatDemoPanel agentName={name || 'Riley'} onClose={() => setDemo(null)} />}
      {demo === 'call' && <CallDemoModal agentName={name || 'Riley'} onClose={() => setDemo(null)} />}
    </div>
  );
}

// ─── Local layout primitives ─────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Heading level={2} style={{ margin: subtitle ? '0 0 6px' : '0 0 24px' }}>
        {title}
      </Heading>
      {subtitle && (
        <Text variant="primary" style={{ display: 'block', fontSize: 16, lineHeight: 1.5, margin: '0 0 32px' }}>
          {subtitle}
        </Text>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading level={4} style={{ margin: 0 }}>{label}</Heading>
      {hint && (
        <Text variant="secondary" style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--dark-60)', marginTop: -2, marginBottom: 2 }}>
          {hint}
        </Text>
      )}
      {children}
    </div>
  );
}

function Disclosure({ summary, items }: { summary: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px',
          background: 'var(--dark-2)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <Heading level={5} style={{ margin: 0 }}>{summary}</Heading>
        <span style={{ flexShrink: 0, display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease', color: 'var(--dark-60)' }}>
          <ChevronDown size={18} />
        </span>
      </button>
      {open && (
        <ul style={{ margin: 0, padding: '14px 16px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {items.map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <span aria-hidden style={{ flexShrink: 0, width: 5, height: 5, borderRadius: '50%', background: 'var(--dark-40)', marginTop: 9 }} />
              <Text style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--dark-80)' }}>{item}</Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Header banner that frames a setup step by the ability it unlocks: brand icon,
// title, optionality badge, the migrated ability copy, and its requirements.
function StepHeader({ ability }: { ability: AbilityCardData }) {
  const Icon = ability.icon;
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: hexToRgba(ability.brandHex, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={22} color={ability.brandHex} />
      </div>

      <Heading level={2} style={{ margin: '0 0 8px' }}>{ability.title}</Heading>
      <Text variant="primary" style={{ display: 'block', fontSize: 16, lineHeight: 1.55, maxWidth: 620 }}>
        {ability.description}
      </Text>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
