import { useState, type Dispatch, type SetStateAction } from 'react';
import { Button, Heading, Text } from '@/components';
import { Chip, Pill, StatusPill, TabChip, useToast } from '@/staging';
import Close from '@/icons/20/Close';
import Lock3 from '@/icons/20/Lock3';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Plus from '@/icons/20/Plus';
import CheckboxLight from '@/icons/20/CheckboxLight';
import CheckboxChecked from '@/icons/20/CheckboxChecked';
import { ChannelGlyph } from '../SdrDetail';
import { ALL_CHANNELS, CHANNEL_LABELS, type Channel } from '../sdr-data';
import {
  AFTER_HOURS_OPTIONS,
  AI_VOICES,
  BOOKING_OUTPUTS,
  CALL_ROUTING_OPTIONS,
  CONVERSATION_TONES,
  DAYS,
  DEFAULT_SDR_SETTINGS,
  ESCALATION_ACTIONS,
  FLOW_TEMPLATES,
  FLOW_TEMPLATE_BY_ID,
  MAX_CALL_DURATIONS,
  OUTCOMES,
  REQUIRED_FIELDS,
  VERTICAL_LABELS,
  matchesTemplate,
  nextStepId,
  type AfterHoursBehavior,
  type AiVoiceId,
  type BookingOutputMethod,
  type CallRoutingMethod,
  type ChannelSettings,
  type ConfirmationMode,
  type ConversationTone,
  type DayKey,
  type EscalationAction,
  type EscalationTrigger,
  type FlowChannel,
  type FlowStep,
  type FlowTemplateId,
  type MaxCallDuration,
  type OutcomeId,
  type PrimaryGoal,
  type RequiredFieldId,
  type SdrSettings,
  type Vertical,
} from '../sdr-settings-data';

/**
 * SDR Settings — Settings tab body for /h2/sdr.
 *
 * Top-level sub-tab strip groups sections into three buckets:
 *   - Agent          → Brand & identity · Business knowledge · Voice & personality
 *   - Conversations  → Conversation goals · Channels & outcomes (per-channel)
 *                       · Escalation rules · Follow-up flows
 *   - Connections    → Channel setup (Phone / SMS / Email) · Booking delivery
 */
type SettingsSubTab = 'agent' | 'conversations' | 'connections';

// CertaPro Painters of Austin — local override of the imported defaults for
// this prototype. We preserve the underlying shape and field set so every
// editor (text inputs, channel cards, escalation rules) renders identically.
// Painting-specific escalation triggers — replace the generic home-services
// defaults (burst pipe / gas safety) with what an Austin painting business
// actually needs to escalate on.
const CERTAPRO_ESCALATION_TRIGGERS = [
  { id: 'storm-damage', label: 'Storm or hail damage', description: 'Caller reports active siding or trim damage after a storm.', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
  { id: 'warranty-claim', label: 'Warranty claim', description: 'Existing customer reporting peeling, fading, or blistering within warranty.', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
  { id: 'complaint', label: 'Caller mentions complaint', description: 'Dissatisfied with a recent job or crew.', duringHours: 'escalate' as const, afterHours: 'digest' as const },
  { id: 'ask-human', label: 'Asks to speak to a human', description: 'Explicitly requests a person.', duringHours: 'escalate' as const, afterHours: 'decline' as const },
  { id: 'ask-price', label: 'Asks for firm price over phone', description: 'Wants a fixed quote without an in-home estimate.', duringHours: 'escalate' as const, afterHours: 'digest' as const },
  { id: 'reschedule', label: 'Wants to reschedule estimate', description: 'Existing prospect changing a booked estimate slot.', duringHours: 'handle' as const, afterHours: 'handle' as const },
];

const CERTAPRO_SDR_SETTINGS: SdrSettings = {
  ...DEFAULT_SDR_SETTINGS,
  escalation: { triggers: CERTAPRO_ESCALATION_TRIGGERS },
  brand: {
    ...DEFAULT_SDR_SETTINGS.brand,
    businessName: 'CertaPro Painters of Austin',
    vertical: 'home-services',
    ownerName: 'John Bunnell',
    serviceArea: 'Austin metro — Austin, Cedar Park, Round Rock, Lakeway, Westlake, Bee Cave, Pflugerville, Leander, Dripping Springs',
    address: '8127 Mesa Dr, Austin, TX 78759',
  },
  business: {
    ...DEFAULT_SDR_SETTINGS.business,
    services: [
      'Interior painting',
      'Exterior painting',
      'Cabinet refinishing',
      'Color consultation',
      'Deck & fence staining',
      'HOA & commercial repaints',
    ],
    faq:
      'We serve the Austin metro area — Austin, Cedar Park, Round Rock, Lakeway, Westlake, Bee Cave, Pflugerville, Leander, and Dripping Springs. ' +
      'In-home estimates are free. Average residential interior runs $3,500–$12,000; full exterior $8,000–$25,000. HOA and commercial repaints start at $30,000. ' +
      'Every job carries a 2-year written warranty.',
  },
  mediums: {
    ...DEFAULT_SDR_SETTINGS.mediums,
    phone: {
      ...DEFAULT_SDR_SETTINGS.mediums.phone,
      aiNumber: '+1 (512) 323-9502',
    },
    sms: {
      ...DEFAULT_SDR_SETTINGS.mediums.sms,
      senderNumber: '+1 (512) 323-9502',
      signature: '— CertaPro Painters of Austin',
    },
    email: {
      ...DEFAULT_SDR_SETTINGS.mediums.email,
      fromEmail: 'austin@certapro.com',
      signature: 'CertaPro Painters of Austin · (512) 323-9502 · certapro.com/austin',
    },
  },
  booking: {
    ...DEFAULT_SDR_SETTINGS.booking,
    confirmationSms:
      "Hi {caller_name}, thanks for reaching CertaPro Painters of Austin! Your {service} estimate on {date} at {time} is in. " +
      "Matthew will confirm by end of day. Reply here with questions or call {business_phone}.",
    ownerEmail: 'matthew@certapro.com',
    accountEmail: 'matthew@certapro.com',
    eventType: 'In-home estimate',
    durationMin: 45,
  },
  voice: {
    ...DEFAULT_SDR_SETTINGS.voice,
    greeting:
      "Hi, thanks for reaching CertaPro Painters of Austin! I'm an AI assistant helping John's team — I can help schedule a free in-home estimate or answer questions about our painting services. " +
      'Just so you know, this conversation may be logged. What can I help you with today?',
    topicsToAvoid:
      "Don't quote firm prices over the phone — direct callers to a free in-home estimate. Don't comment on competitor pricing or quality. " +
      "If asked about specific paint warranty claims, say \"I'll have Matthew Tims, our VP of Residential, follow up directly.\"",
  },
};

export function SdrSettingsBody() {
  const [settings, setSettings] = useState<SdrSettings>(CERTAPRO_SDR_SETTINGS);
  const [subTab, setSubTab] = useState<SettingsSubTab>('agent');
  return (
    <div
      style={{
        maxWidth: 920,
        margin: '0 auto',
        padding: '8px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <Intro />
      <SubTabStrip value={subTab} onChange={setSubTab} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {subTab === 'agent' && (
          <>
            <VoicePersonalitySection settings={settings} setSettings={setSettings} />
          </>
        )}
        {subTab === 'conversations' && (
          <>
            <ConversationGoalsSection settings={settings} setSettings={setSettings} />
            <SectionDivider />
            <ChannelsSection settings={settings} setSettings={setSettings} />
            <SectionDivider />
            <EscalationRulesSection settings={settings} setSettings={setSettings} />
            <SectionDivider />
            <FlowsSection settings={settings} setSettings={setSettings} />
          </>
        )}
        {subTab === 'connections' && (
          <>
            <ChannelSetupSection settings={settings} setSettings={setSettings} />
            <SectionDivider />
            <BookingDeliverySection settings={settings} setSettings={setSettings} />
          </>
        )}
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div>
      <Heading level={2} style={{ marginBottom: 8 }}>AI Receptionist settings</Heading>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', maxWidth: 720, lineHeight: 1.5 }}>
        Tune how the AI Receptionist represents CertaPro Painters of Austin, what conversations it can drive, and what it's wired to.
      </Text>
    </div>
  );
}

function SubTabStrip({ value, onChange }: { value: SettingsSubTab; onChange: (v: SettingsSubTab) => void }) {
  const tabs: { id: SettingsSubTab; label: string; sub: string }[] = [
    { id: 'agent',         label: 'Agent',         sub: 'Who the AI is' },
    { id: 'conversations', label: 'Conversations', sub: 'What it does' },
    { id: 'connections',   label: 'Connections',   sub: "What it's wired to" },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        padding: 6,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
      }}
    >
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '10px 14px',
              textAlign: 'left',
              border: `1px solid ${selected ? 'var(--dark-90)' : 'transparent'}`,
              borderRadius: 8,
              background: selected ? 'var(--light-100)' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 120ms ease, background 120ms ease',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{t.label}</span>
            <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>{t.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Section 1: Channels & outcomes ─────────────────────────────────────────

interface SectionProps {
  settings: SdrSettings;
  setSettings: Dispatch<SetStateAction<SdrSettings>>;
}

function ChannelsSection({ settings, setSettings }: SectionProps) {
  const updateChannel = (ch: Channel, mut: (c: ChannelSettings) => ChannelSettings) => {
    setSettings((s) => ({
      ...s,
      channels: { ...s.channels, [ch]: mut(s.channels[ch]) },
    }));
  };
  return (
    <SectionShell
      title="Channels & outcomes"
      sub="Pick what the AI is allowed to do on each channel. The connect-to-human escape hatch is always on."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_CHANNELS.map((ch) => (
          <ChannelRow
            key={ch}
            channel={ch}
            settings={settings.channels[ch]}
            update={(mut) => updateChannel(ch, mut)}
          />
        ))}
      </div>
    </SectionShell>
  );
}

interface ChannelRowProps {
  channel: Channel;
  settings: ChannelSettings;
  update: (mut: (c: ChannelSettings) => ChannelSettings) => void;
}

function ChannelRow({ channel, settings, update }: ChannelRowProps) {
  const dimmed = !settings.enabled;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const submitCustom = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      update((c) => ({ ...c, customOutcomes: [...c.customOutcomes, trimmed] }));
    }
    setDraft('');
    setAdding(false);
  };

  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: 20,
        background: 'var(--light-100)',
        opacity: dimmed ? 0.55 : 1,
        transition: 'opacity 160ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--dark-4)',
              flexShrink: 0,
            }}
          >
            <ChannelGlyph channel={channel} size={20} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{channelLabel(channel)}</div>
          </div>
        </div>
        <Toggle
          checked={settings.enabled}
          onChange={(v) => update((c) => ({ ...c, enabled: v }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 24, alignItems: 'start' }}>
        <div>
          <FieldLabel>Allowed outcomes</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {OUTCOMES.map((o) => {
              const selected = settings.outcomes.has(o.id);
              return (
                <Chip
                  key={o.id}
                  size="md"
                  selected={selected}
                  icon={o.locked ? Lock3 : undefined}
                  disabled={dimmed || o.locked}
                  title={o.locked ? 'Always on — the AI can always hand off to a human.' : undefined}
                  onSelectionChange={(next) => {
                    if (o.locked) return;
                    update((c) => {
                      const nextSet = new Set(c.outcomes);
                      if (next) nextSet.add(o.id);
                      else nextSet.delete(o.id);
                      return { ...c, outcomes: nextSet };
                    });
                  }}
                >
                  {o.label}
                </Chip>
              );
            })}
            {settings.customOutcomes.map((label, i) => (
              <Chip
                key={`custom-${i}-${label}`}
                size="md"
                selected
                deletable
                disabled={dimmed}
                onDelete={() =>
                  update((c) => ({
                    ...c,
                    customOutcomes: c.customOutcomes.filter((_, j) => j !== i),
                  }))
                }
              >
                {label}
              </Chip>
            ))}
            {adding ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={submitCustom}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitCustom();
                  } else if (e.key === 'Escape') {
                    setDraft('');
                    setAdding(false);
                  }
                }}
                placeholder="Custom outcome…"
                style={{
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: 'var(--dark-90)',
                  height: 32,
                  padding: '0 10px',
                  border: '1px solid var(--dark-90)',
                  borderRadius: 6,
                  background: 'var(--light-100)',
                  outline: 'none',
                  minWidth: 160,
                }}
              />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                frontIcon={Plus}
                isDisabled={dimmed}
                onPress={() => setAdding(true)}
              >
                Add custom
              </Button>
            )}
          </div>
        </div>

        <div>
          <FieldLabel>Reply SLA</FieldLabel>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <NumberInput
              value={settings.slaSeconds}
              onChange={(v) => update((c) => ({ ...c, slaSeconds: v }))}
              min={1}
              max={3600}
              disabled={dimmed}
            />
            <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Per-settings label overrides — keeps the underlying CHANNEL_LABELS
 *  shared with the Leads view intact while letting the settings copy be
 *  more descriptive. */
const CHANNEL_LABEL_OVERRIDE: Partial<Record<Channel, string>> = {
  form: 'Website Form Submission',
};

function channelLabel(ch: Channel): string {
  return CHANNEL_LABEL_OVERRIDE[ch] ?? CHANNEL_LABELS[ch];
}

function channelHint(ch: Channel): string {
  switch (ch) {
    case 'form':           return 'Inbound form submissions from the website. AI replies by email.';
    case 'inbound-call':   return 'Live calls picked up by the AI voice agent.';
    case 'missed-call':    return 'Auto-SMS follow-up when a call rings out.';
    case 'chat':           return 'Web chat widget on the marketing site.';
    case 'cold-followup':  return 'AI-initiated outreach to dormant inquiries.';
  }
}

// ── Section: Follow-up flows ──────────────────────────────────────────────

function FlowsSection({ settings, setSettings }: SectionProps) {
  return (
    <SectionShell
      title="What happens after the first contact"
      sub="Per-channel follow-up. Pick a template, then tweak the steps if you want."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_CHANNELS.map((ch) => (
          <FlowChannelCard
            key={ch}
            channel={ch}
            settings={settings.channels[ch]}
            update={(mut) =>
              setSettings((s) => ({
                ...s,
                channels: { ...s.channels, [ch]: mut(s.channels[ch]) },
              }))
            }
          />
        ))}
      </div>
    </SectionShell>
  );
}

function FlowChannelCard({
  channel,
  settings,
  update,
}: {
  channel: Channel;
  settings: ChannelSettings;
  update: (mut: (c: ChannelSettings) => ChannelSettings) => void;
}) {
  const [open, setOpen] = useState(false);
  const tpl = FLOW_TEMPLATE_BY_ID[settings.templateId];
  const isCustom = settings.templateId === 'custom';

  const pickTemplate = (id: FlowTemplateId) => {
    if (id === 'custom') return;
    const seedSteps = FLOW_TEMPLATE_BY_ID[id].steps.map((s, i) => ({ ...s, id: `${id}-${i + 1}-${Math.random().toString(36).slice(2, 6)}` }));
    update((c) => ({ ...c, templateId: id, flowSteps: seedSteps }));
  };

  const mutateSteps = (mut: (steps: FlowStep[]) => FlowStep[]) => {
    update((c) => {
      const nextSteps = mut(c.flowSteps);
      // If we drifted off-template, mark it Custom. If we landed back on
      // one of the seeded templates exactly, snap back to that id.
      let nextTemplate: FlowTemplateId = 'custom';
      for (const seed of FLOW_TEMPLATES) {
        if (matchesTemplate(nextSteps, seed.id)) {
          nextTemplate = seed.id;
          break;
        }
      }
      return { ...c, flowSteps: nextSteps, templateId: nextTemplate };
    });
  };

  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        background: 'var(--light-100)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: 16,
          gap: 14,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--dark-4)',
            flexShrink: 0,
          }}
        >
          <ChannelGlyph channel={channel} size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{CHANNEL_LABELS[channel]}</div>
          <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
            {tpl.label}{isCustom ? '' : ` · ${settings.flowSteps.length} step${settings.flowSteps.length === 1 ? '' : 's'}`}
          </Text>
        </div>
        {isCustom && <StatusPill tone="accent" size="sm">Custom</StatusPill>}
        {open ? <ChevronUp size={20} color="var(--dark-60)" /> : <ChevronDown size={20} color="var(--dark-60)" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--dark-8)', padding: 20, background: 'var(--dark-2)' }}>
          <FieldLabel>Template</FieldLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginBottom: 20,
            }}
          >
            {FLOW_TEMPLATES.map((t) => {
              const isSelected = settings.templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickTemplate(t.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: 14,
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                    background: 'var(--light-100)',
                    color: 'var(--dark-90)',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: 92,
                    boxShadow: isSelected ? '0 0 0 1px var(--dark-90) inset' : 'none',
                    transition: 'border-color 120ms ease, box-shadow 120ms ease',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.4 }}>{t.description}</div>
                </button>
              );
            })}
          </div>

          <FieldLabel>Steps</FieldLabel>
          {settings.flowSteps.length === 0 ? (
            <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', padding: '8px 0' }}>
              No follow-up steps — the AI replies once and waits.
            </Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {settings.flowSteps.map((step, i) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={i}
                  total={settings.flowSteps.length}
                  onChange={(next) =>
                    mutateSteps((steps) => steps.map((s) => (s.id === step.id ? next : s)))
                  }
                  onDelete={() => mutateSteps((steps) => steps.filter((s) => s.id !== step.id))}
                  onMove={(dir) =>
                    mutateSteps((steps) => {
                      const j = i + dir;
                      if (j < 0 || j >= steps.length) return steps;
                      const next = steps.slice();
                      [next[i], next[j]] = [next[j], next[i]];
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Button
              variant="secondary"
              size="sm"
              frontIcon={Plus}
              onPress={() =>
                mutateSteps((steps) => [
                  ...steps,
                  {
                    id: nextStepId(),
                    delay: '24h',
                    channel: 'sms' as FlowChannel,
                    message: 'New step — write the message the AI will send here.',
                  },
                ])
              }
            >
              Add step
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepRow({
  step,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  step: FlowStep;
  index: number;
  total: number;
  onChange: (next: FlowStep) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 80px 100px 1fr auto',
        gap: 10,
        alignItems: 'flex-start',
        padding: 12,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--dark-4)',
          color: 'var(--dark-90)',
          fontSize: 13,
          fontWeight: 500,
          marginTop: 2,
        }}
      >
        {index + 1}
      </span>
      <input
        type="text"
        value={step.delay}
        onChange={(e) => onChange({ ...step, delay: e.target.value })}
        aria-label="Delay"
        style={inputStyle}
        placeholder="24h"
      />
      <select
        value={step.channel}
        onChange={(e) => onChange({ ...step, channel: e.target.value as FlowChannel })}
        aria-label="Channel"
        style={{ ...inputStyle, paddingRight: 8 }}
      >
        <option value="sms">SMS</option>
        <option value="email">Email</option>
      </select>
      <textarea
        value={step.message}
        onChange={(e) => onChange({ ...step, message: e.target.value })}
        aria-label="Message"
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', minHeight: 36 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <IconButton ariaLabel="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</IconButton>
        <IconButton ariaLabel="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>↓</IconButton>
        <IconButton ariaLabel="Delete step" onClick={onDelete}>
          <Close size={14} color="var(--dark-60)" />
        </IconButton>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 13,
  color: 'var(--dark-90)',
  padding: '6px 8px',
  border: '1px solid var(--dark-8)',
  borderRadius: 6,
  background: 'var(--light-100)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

function IconButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--dark-8)',
        borderRadius: 6,
        background: 'var(--light-100)',
        color: 'var(--dark-60)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: 0,
        fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function SectionDivider() {
  return <hr style={{ height: 1, background: 'var(--dark-4)', border: 'none', margin: 0 }} />;
}

function SectionShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ marginBottom: 14 }}>
        <Heading level={3} style={{ marginBottom: 4 }}>{title}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>{sub}</Text>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 16,
        fontWeight: 400,
        color: 'var(--dark-90)',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n)));
      }}
      style={{
        width: 72,
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        padding: '6px 8px',
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        background: 'var(--light-100)',
        outline: 'none',
      }}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      {label && <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>{label}</span>}
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 36,
          height: 20,
          flexShrink: 0,
          borderRadius: 999,
          background: checked ? 'var(--dark-90)' : 'var(--dark-15)',
          transition: 'background-color 160ms ease',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--light-100)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            transition: 'left 160ms ease',
          }}
        />
      </span>
    </label>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AGENT TAB — Brand & identity · Business knowledge · Voice & personality
// ══════════════════════════════════════════════════════════════════════════


function VoicePersonalitySection({ settings, setSettings }: SectionProps) {
  const { showToast } = useToast();
  const v = settings.voice;
  const update = (mut: (v: typeof settings.voice) => typeof settings.voice) =>
    setSettings((s) => ({ ...s, voice: mut(s.voice) }));
  return (
    <SectionShell
      title="Voice & personality"
      sub="Optional — sensible defaults apply if skipped. Configuring this makes the agent feel more on-brand."
    >
      <FieldLabel>AI voice</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {AI_VOICES.map((voice) => {
          const selected = voice.id === v.voiceId;
          return (
            <button
              key={voice.id}
              type="button"
              onClick={() => update((x) => ({ ...x, voiceId: voice.id as AiVoiceId }))}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 16,
                borderRadius: 10,
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                background: 'var(--light-100)',
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: selected ? '0 0 0 1px var(--dark-90) inset' : 'none',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{voice.name}</span>
              <span style={{ fontSize: 13, color: 'var(--dark-60)' }}>{voice.description}</span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast({ message: `Previewing ${voice.name}…` });
                }}
                style={{ fontSize: 13, color: 'var(--dark-90)', marginTop: 4, textDecoration: 'underline' }}
              >
                ▶ Preview
              </span>
            </button>
          );
        })}
      </div>

      <FieldLabel>Conversation tone</FieldLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {CONVERSATION_TONES.map((t) => (
          <Chip
            key={t.id}
            size="md"
            selected={v.tone === t.id}
            onSelectionChange={() => update((x) => ({ ...x, tone: t.id as ConversationTone }))}
          >
            {t.label}
          </Chip>
        ))}
      </div>
      <div style={{ marginBottom: 24 }} />

      <FieldLabel>Custom greeting script <OptionalHint /></FieldLabel>
      <textarea
        value={v.greeting}
        onChange={(e) => update((x) => ({ ...x, greeting: e.target.value }))}
        rows={4}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5, marginBottom: 24 }}
      />

      <FieldLabel>Topics to avoid <OptionalHint /></FieldLabel>
      <textarea
        value={v.topicsToAvoid}
        onChange={(e) => update((x) => ({ ...x, topicsToAvoid: e.target.value }))}
        rows={3}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5, marginBottom: 24 }}
      />

      <FieldLabel>Maximum call duration <OptionalHint /></FieldLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {MAX_CALL_DURATIONS.map((d) => (
          <Chip
            key={d.value}
            size="md"
            selected={v.maxCallDuration === d.value}
            onSelectionChange={() => update((x) => ({ ...x, maxCallDuration: d.value as MaxCallDuration }))}
          >
            {d.label}
          </Chip>
        ))}
      </div>
    </SectionShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CONVERSATIONS TAB — Goals · per-channel (existing) · Escalation · Flows
// ══════════════════════════════════════════════════════════════════════════

function ConversationGoalsSection({ settings, setSettings }: SectionProps) {
  const g = settings.goals;
  const update = (mut: (g: typeof settings.goals) => typeof settings.goals) =>
    setSettings((s) => ({ ...s, goals: mut(s.goals) }));
  return (
    <SectionShell
      title="Conversation goals"
      sub="Workspace defaults for what the AI should accomplish and what it must collect. Channels below can override."
    >
      <FieldLabel>Primary goal</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
        <RadioCard
          selected={g.primaryGoal === 'book'}
          onClick={() => update((x) => ({ ...x, primaryGoal: 'book' as PrimaryGoal }))}
          title="Book an appointment"
          description="Collect service, date, time, and contact info."
        />
        <RadioCard
          selected={g.primaryGoal === 'capture'}
          onClick={() => update((x) => ({ ...x, primaryGoal: 'capture' as PrimaryGoal }))}
          title="Capture a lead"
          description="Collect name, phone, and intent."
        />
      </div>

<FieldLabel>After-hours behavior</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {AFTER_HOURS_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.id}
            selected={g.afterHours === opt.id}
            onClick={() => update((x) => ({ ...x, afterHours: opt.id as AfterHoursBehavior }))}
            title={opt.label}
            description={opt.description}
          />
        ))}
      </div>
    </SectionShell>
  );
}

function EscalationRulesSection({ settings, setSettings }: SectionProps) {
  const triggers = settings.escalation.triggers;
  const updateTrigger = (id: string, mut: (t: EscalationTrigger) => EscalationTrigger) =>
    setSettings((s) => ({
      ...s,
      escalation: { triggers: s.escalation.triggers.map((t) => (t.id === id ? mut(t) : t)) },
    }));
  return (
    <SectionShell
      title="Escalation rules"
      sub="Different situations call for different responses depending on when the call comes in. Set a behavior per trigger for each time window."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <WindowCard
          dot="#04af00"
          title="During business hours"
          line1="Mon–Fri 8 AM–5 PM · Sat 9 AM–12 PM"
          line2="All triggers active · Owner is reachable"
          pillTone="success"
          pillLabel="Full escalation"
        />
        <WindowCard
          dot="var(--dark-40)"
          title="Outside business hours"
          line1="Evenings, Sundays, and holidays"
          line2="Owner should only be interrupted for true emergencies"
          pillTone="neutral"
          pillLabel="Emergencies only"
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 18px',
          padding: '10px 14px',
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-8)',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--dark-60)',
        }}
      >
        {ESCALATION_ACTIONS.map((a) => (
          <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: actionDotColor(a.id),
                display: 'inline-block',
              }}
            />
            <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>{a.label}</strong> — {a.description}
          </span>
        ))}
      </div>

      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 160px',
            padding: '10px 14px',
            background: 'var(--dark-2)',
            borderBottom: '1px solid var(--dark-8)',
            fontSize: 13,
            color: 'var(--dark-60)',
          }}
        >
          <span>Trigger</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#04af00' }} />
            During hours
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dark-40)' }} />
            After hours
          </span>
        </div>
        {triggers.map((t, i) => (
          <div
            key={t.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 160px',
              padding: '14px',
              alignItems: 'center',
              gap: 12,
              borderBottom: i === triggers.length - 1 ? 'none' : '1px solid var(--dark-8)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{t.label}</div>
              <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 2 }}>{t.description}</div>
            </div>
            <ActionSelect
              value={t.duringHours}
              onChange={(v) => updateTrigger(t.id, (x) => ({ ...x, duringHours: v }))}
            />
            <ActionSelect
              value={t.afterHours}
              onChange={(v) => updateTrigger(t.id, (x) => ({ ...x, afterHours: v }))}
            />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function actionDotColor(id: EscalationAction): string {
  if (id === 'escalate') return 'var(--red-70)';
  if (id === 'digest')   return '#edb62c';
  if (id === 'decline')  return 'var(--dark-40)';
  return '#04af00';
}

function actionTone(id: EscalationAction): 'danger' | 'warning' | 'neutral' | 'success' {
  if (id === 'escalate') return 'danger';
  if (id === 'digest')   return 'warning';
  if (id === 'decline')  return 'neutral';
  return 'success';
}

function ActionSelect({ value, onChange }: { value: EscalationAction; onChange: (v: EscalationAction) => void }) {
  const action = ESCALATION_ACTIONS.find((a) => a.id === value)!;
  return (
    <div style={{ position: 'relative' }}>
      <StatusPill tone={actionTone(value)} size="md">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {action.label}
          <ChevronDown size={14} color="currentColor" />
        </span>
      </StatusPill>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EscalationAction)}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
        }}
      >
        {ESCALATION_ACTIONS.map((a) => (
          <option key={a.id} value={a.id}>{a.label}</option>
        ))}
      </select>
    </div>
  );
}

function WindowCard({
  dot,
  title,
  line1,
  line2,
  pillTone,
  pillLabel,
}: {
  dot: string;
  title: string;
  line1: string;
  line2: string;
  pillTone: 'success' | 'neutral';
  pillLabel: string;
}) {
  return (
    <div
      style={{
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        padding: 18,
        background: 'var(--light-100)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', marginBottom: 2 }}>{line1}</div>
      <div style={{ fontSize: 13, color: 'var(--dark-60)', marginBottom: 10 }}>{line2}</div>
      <StatusPill tone={pillTone} size="sm">{pillLabel}</StatusPill>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CONNECTIONS TAB — Channel setup (mediums) · Booking delivery
// ══════════════════════════════════════════════════════════════════════════

function ChannelSetupSection({ settings, setSettings }: SectionProps) {
  type MediumTab = 'phone' | 'sms' | 'email';
  const [medium, setMedium] = useState<MediumTab>('phone');
  const update = (mut: (m: typeof settings.mediums) => typeof settings.mediums) =>
    setSettings((s) => ({ ...s, mediums: mut(s.mediums) }));
  return (
    <SectionShell
      title="Channel setup"
      sub="Configure how each outbound channel is wired. Phone is required for v1."
    >
      <div
        style={{
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: 20,
          background: 'var(--light-100)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            paddingBottom: 16,
            marginBottom: 20,
            borderBottom: '1px solid var(--dark-8)',
          }}
        >
          {(['phone', 'sms', 'email'] as const).map((m) => (
            <TabChip key={m} selected={medium === m} onSelect={() => setMedium(m)}>
              {m === 'phone' ? 'Phone' : m === 'sms' ? 'SMS follow-up' : 'Email'}
            </TabChip>
          ))}
        </div>

      {medium === 'phone' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FieldLabel>Assigned AI number</FieldLabel>
              <StatusPill tone="success" size="sm">Auto-provisioned</StatusPill>
            </div>
            <div style={{ ...textInputStyle, display: 'inline-block', width: 'auto', padding: '10px 14px', cursor: 'default' }}>
              {settings.mediums.phone.aiNumber}
            </div>
          </div>

          <div>
            <FieldLabel>Call routing method</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CALL_ROUTING_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.id}
                  selected={settings.mediums.phone.routingMethod === opt.id}
                  onClick={() => update((m) => ({ ...m, phone: { ...m.phone, routingMethod: opt.id as CallRoutingMethod } }))}
                  title={opt.label}
                  description={opt.description}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>AI &amp; recording disclosures</FieldLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 16px',
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Disclose AI at start of call</div>
              <Toggle
                checked={settings.mediums.phone.discloseAi}
                onChange={(v) => update((m) => ({ ...m, phone: { ...m.phone, discloseAi: v } }))}
              />
            </div>
          </div>
        </div>
      )}

      {medium === 'sms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <FieldLabel>SMS sender number</FieldLabel>
            <div style={{ ...textInputStyle, display: 'inline-block', width: 'auto', padding: '10px 14px', cursor: 'default' }}>
              {settings.mediums.sms.senderNumber}
            </div>
          </div>
          <TextField
            label="SMS signature"
            value={settings.mediums.sms.signature}
            onChange={(v) => update((m) => ({ ...m, sms: { ...m.sms, signature: v } }))}
            hint="Appended to every outbound SMS."
          />
        </div>
      )}

      {medium === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <TextField
            label="From email"
            value={settings.mediums.email.fromEmail}
            onChange={(v) => update((m) => ({ ...m, email: { ...m.email, fromEmail: v } }))}
            hint="Set up a forwarder or connect via OAuth in v1.1."
          />
          <div>
            <FieldLabel>Email signature</FieldLabel>
            <textarea
              value={settings.mediums.email.signature}
              onChange={(e) => update((m) => ({ ...m, email: { ...m.email, signature: e.target.value } }))}
              rows={3}
              style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>
      )}
      </div>
    </SectionShell>
  );
}

function BookingDeliverySection({ settings, setSettings }: SectionProps) {
  const b = settings.booking;
  const update = (mut: (b: typeof settings.booking) => typeof settings.booking) =>
    setSettings((s) => ({ ...s, booking: mut(s.booking) }));
  return (
    <SectionShell
      title="Booking delivery"
      sub="Where does a captured booking go? At least one method required to go live."
    >
      <FieldLabel>Booking output method</FieldLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {BOOKING_OUTPUTS.map((opt) => (
          <RadioCard
            key={opt.id}
            selected={b.outputMethod === opt.id}
            onClick={() => update((x) => ({ ...x, outputMethod: opt.id as BookingOutputMethod }))}
            title={opt.label}
            description={opt.description}
          />
        ))}
      </div>

      {(b.outputMethod === 'calendly' || b.outputMethod === 'google') && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 16,
            padding: 16,
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            marginBottom: 24,
          }}
        >
          <TextField
            label="Account email"
            value={b.accountEmail}
            onChange={(v) => update((x) => ({ ...x, accountEmail: v }))}
          />
          <TextField
            label="Default event type"
            value={b.eventType}
            onChange={(v) => update((x) => ({ ...x, eventType: v }))}
          />
          <NumberField
            label="Duration (min)"
            value={b.durationMin}
            onChange={(v) => update((x) => ({ ...x, durationMin: Math.max(5, Math.min(180, v)) }))}
            min={5}
            max={180}
          />
        </div>
      )}

      <FieldLabel>Booking confirmation mode</FieldLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        <Chip
          size="md"
          selected={b.confirmationMode === 'pending'}
          onSelectionChange={() => update((x) => ({ ...x, confirmationMode: 'pending' as ConfirmationMode }))}
        >
          Pending — owner confirms before it&apos;s final
        </Chip>
        <Chip
          size="md"
          selected={b.confirmationMode === 'auto'}
          onSelectionChange={() => update((x) => ({ ...x, confirmationMode: 'auto' as ConfirmationMode }))}
        >
          Auto-confirmed (requires calendar integration)
        </Chip>
      </div>
      <div style={{ marginBottom: 24 }} />

      <FieldLabel>Confirmation SMS to caller</FieldLabel>
      <textarea
        value={b.confirmationSms}
        onChange={(e) => update((x) => ({ ...x, confirmationSms: e.target.value }))}
        rows={4}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5, marginBottom: 24 }}
      />

      <TextField
        label="Booking notification email (owner)"
        required
        value={b.ownerEmail}
        onChange={(v) => update((x) => ({ ...x, ownerEmail: v }))}
        hint="Where the booking summary is sent immediately after capture."
      />
    </SectionShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Shared form helpers
// ══════════════════════════════════════════════════════════════════════════

const textInputStyle: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 14,
  color: 'var(--dark-90)',
  padding: '8px 10px',
  border: '1px solid var(--dark-8)',
  borderRadius: 6,
  background: 'var(--light-100)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const iconButtonBoxStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  background: 'var(--light-100)',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={textInputStyle}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        style={textInputStyle}
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={textInputStyle}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  const Icon = selected ? CheckboxChecked : CheckboxLight;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        textAlign: 'left',
        border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-4)'}`,
        borderRadius: 10,
        background: selected ? 'var(--light-100)' : 'var(--dark-2)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
    >
      <Icon size={20} />
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</span>
        {description && (
          <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4 }}>{description}</span>
        )}
      </span>
    </button>
  );
}

function RequiredHint() {
  return <Pill size="xs" style={{ marginLeft: 6 }}>Required</Pill>;
}

function OptionalHint() {
  return <Pill size="xs" style={{ marginLeft: 6 }}>Optional</Pill>;
}
