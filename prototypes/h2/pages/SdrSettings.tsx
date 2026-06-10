import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Button, Heading, IconButton, Modal, Text, useModals, type StackModalProps } from '@/components';
import { Avatar, Chip, Pill, Select, StatusPill, useToast } from '@/staging';
import Close from '@/icons/20/Close';
import Lock3 from '@/icons/20/Lock3';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Plus from '@/icons/20/Plus';
import CheckboxLight from '@/icons/20/CheckboxLight';
import CheckboxChecked from '@/icons/20/CheckboxChecked';
import ArrowRight from '@/icons/20/ArrowRight';
import Play3 from '@/icons/20/Play3';
import Trash2 from '@/icons/20/Trash2';
import { ChannelGlyph } from '../SdrDetail';
import { H2Layout } from '../H2Layout';
import { ALL_CHANNELS, SOURCE_LABELS, type Channel } from '../sdr-data';
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

type SettingsSubTab = 'triggers' | 'agent' | 'outcomes';

// ── Agent config ──────────────────────────────────────────────────────────

const LLM_MODELS = [
  { id: 'gpt-4o',           label: 'GPT-4o',          sub: 'OpenAI · Best quality' },
  { id: 'gpt-4o-mini',      label: 'GPT-4o Mini',     sub: 'OpenAI · Faster & cheaper' },
  { id: 'claude-sonnet',    label: 'Claude Sonnet',   sub: 'Anthropic · Balanced' },
  { id: 'claude-haiku',     label: 'Claude Haiku',    sub: 'Anthropic · Fast & lightweight' },
  { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro',  sub: 'Google · Long context' },
];

interface AgentConfig {
  id: string;
  name: string;
  persona: string;
  agentPhone: string;
  llmModel: string;
  systemPrompt: string;
  knowledgeBase: string;
}

const DEFAULT_SYSTEM_PROMPT =
  'You are Riley, an AI receptionist for CertaPro Painters of Austin. Your primary goal is to qualify inbound leads and schedule free in-home estimates with the sales team.\n\n' +
  'Always introduce yourself as Riley. Be warm, professional, and efficient. Keep calls under 4 minutes.\n\n' +
  'Collect: project type (interior/exterior/cabinets), property location within Austin metro, approximate timeline, whether the caller is the homeowner or decision-maker.\n\n' +
  'Escalate immediately if: caller reports storm/hail damage, an active warranty claim, or a complaint about a recent job. Transfer to Matthew Tims for commercial projects over 10 units.\n\n' +
  'Do not quote firm prices over the phone. Direct callers to the free in-home estimate instead.';

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'agent-riley',
    name: 'Riley',
    persona: 'Sales receptionist',
    agentPhone: '+1 (512) 323-9502',
    llmModel: 'claude-sonnet',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    knowledgeBase: '',
  },
];

const CERTAPRO_ESCALATION_TRIGGERS = [
  { id: 'default-speak-human', label: 'Caller asks to speak with a human', description: 'The caller explicitly requests a person.', requirements: 'Caller uses phrases like "real person", "speak to someone", or repeatedly asks to be transferred.', duringHours: 'escalate' as const, afterHours: 'escalate' as const, default: true as const },
  { id: 'storm-damage', label: 'Storm or hail damage', description: 'Caller reports active siding or trim damage after a storm.', requirements: 'Caller mentions hail, wind, or storm damage occurring in the last 60 days. Insurance claim language is a strong signal.', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
  { id: 'warranty-claim', label: 'Warranty claim', description: 'Existing customer reporting peeling, fading, or blistering within warranty.', requirements: 'Caller is in our CRM as a past customer and the job completion date is within the warranty window (typically 2 years).', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
  { id: 'complaint', label: 'Caller mentions complaint', description: 'Dissatisfied with a recent job or crew.', requirements: 'Negative sentiment + reference to a recent job, crew member, or service issue.', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
  { id: 'ask-price', label: 'Asks for firm price over phone', description: 'Wants a fixed quote without an in-home estimate.', requirements: 'Caller refuses to schedule an in-home estimate and insists on a number over the phone.', duringHours: 'escalate' as const, afterHours: 'escalate' as const },
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

// ── Root component ─────────────────────────────────────────────────────────

export function SdrSettingsBody({ tabStrip }: { tabStrip?: React.ReactNode }) {
  const [agents, setAgents] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [activeAgentId, setActiveAgentId] = useState<string>('agent-riley');
  const [settings, setSettings] = useState<SdrSettings>(CERTAPRO_SDR_SETTINGS);
  const [subTab, setSubTab] = useState<SettingsSubTab>('triggers');
  const [chatOpen, setChatOpen] = useState(false);

  const activeAgent = agents.find((a) => a.id === activeAgentId) ?? agents[0]!;

  const updateAgent = (next: AgentConfig) => {
    setAgents((prev) => prev.map((a) => (a.id === next.id ? next : a)));
  };

  const addAgent = () => {
    const newId = `agent-${Date.now()}`;
    setAgents((prev) => [
      ...prev,
      { id: newId, name: 'New agent', persona: 'Custom receptionist', agentPhone: '', llmModel: 'claude-sonnet', systemPrompt: '', knowledgeBase: '' },
    ]);
    setActiveAgentId(newId);
  };

  const tabs: { id: SettingsSubTab; label: string; sub: string }[] = [
    { id: 'triggers', label: 'Triggers', sub: 'When it runs' },
    { id: 'agent',    label: 'Agent',    sub: 'What the AI does' },
    { id: 'outcomes', label: 'Outcomes', sub: 'What gets delivered' },
  ];

  return (
    <H2Layout
      topbarCenter={tabStrip}
      topbarRight={
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={addAgent}>
          Add agent
        </Button>
      }
    >
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '8px 24px 60px',
      }}
    >
      {/* Main settings content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* section: agent selector — page starts here, no title/description */}
        <AgentSelector
          agents={agents}
          activeId={activeAgentId}
          onChange={setActiveAgentId}
        />

        {/* section: tabbed settings panel */}
        <FolderTabPanel
          tabs={tabs}
          value={subTab}
          onChange={(v) => setSubTab(v as SettingsSubTab)}
        >
          {subTab === 'triggers' && (
            <TriggersSection agent={activeAgent} onChange={updateAgent} />
          )}
          {subTab === 'agent' && (
            <>
              <SystemPromptSection agent={activeAgent} onChange={updateAgent} />
              <SectionDivider />
              <VoicePersonalitySection settings={settings} setSettings={setSettings} />
              <SectionDivider />
              <KnowledgeBaseSection agent={activeAgent} onChange={updateAgent} />
              <SectionDivider />
              <CustomerMessagesSection />
            </>
          )}
          {subTab === 'outcomes' && (
            <OutcomesSection settings={settings} setSettings={setSettings} />
          )}
        </FolderTabPanel>
      </div>

      {/* Chat side pane */}
      {chatOpen && (
        <div style={{ width: 380, flexShrink: 0, position: 'sticky', top: 24 }}>
          <ChatTestPanel
            agentName={activeAgent.name}
            agentPersona={activeAgent.persona}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
    </H2Layout>
  );
}

// ── Agent selector ────────────────────────────────────────────────────────

function AgentSelector({
  agents,
  activeId,
  onChange,
}: {
  agents: AgentConfig[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const activeAgent = agents.find((a) => a.id === activeId) ?? agents[0];

  // Single agent: just an avatar + the name at H2, with Add agent beside it.
  // The selectable cards (with a selected state) only appear once a 2nd agent
  // is added.
  if (agents.length <= 1) {
    const fallback = activeAgent.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <Avatar fallback={fallback} size={40} />
        <Heading level={2}>{activeAgent.name}</Heading>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)', fontWeight: 400 }}>
          Agents in this workspace
        </Text>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {agents.map((agent) => {
          const active = agent.id === activeId;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onChange(agent.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${active ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                background: active ? 'var(--dark-90)' : 'var(--light-100)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: active ? '0 0 0 1px var(--dark-90) inset' : 'none',
                transition: 'border-color 120ms ease, background 120ms ease',
              }}
            >
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: '#04af00', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: active ? 'var(--light-100)' : 'var(--dark-90)', lineHeight: 1.3 }}>
                  {agent.name}
                </span>
                <span style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.65)' : 'var(--dark-60)', lineHeight: 1.2 }}>
                  {agent.persona}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Folder tab panel ──────────────────────────────────────────────────────

function FolderTabPanel({
  tabs,
  value,
  onChange,
  children,
}: {
  tabs: { id: string; label: string; sub: string }[];
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Tab strip — selectable chips (grey fill; white + border when selected) */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <Chip key={t.id} size="md" selected={t.id === value} onSelectionChange={() => onChange(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          padding: '28px 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 56,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── System prompt section ─────────────────────────────────────────────────

function SystemPromptSection({
  agent,
  onChange,
}: {
  agent: AgentConfig;
  onChange: (a: AgentConfig) => void;
}) {
  return (
    <>
      {/* System prompt */}
      <SectionShell
        title="System prompt"
        sub="The foundational instructions for this agent — its goal, qualification process, booking flow, escalation rules, and any other rules."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea
            {...inputFocusProps}
            value={agent.systemPrompt}
            onChange={(e) => onChange({ ...agent, systemPrompt: e.target.value })}
            rows={9}
            placeholder="You are Riley, an AI receptionist for [Business Name]. Your primary goal is to qualify inbound leads and book estimates..."
            style={{
              ...textInputStyle,
              resize: 'vertical',
              lineHeight: 1.6,
              fontFamily: "'Sohne', sans-serif",
              fontSize: 13,
              color: 'var(--dark-90)',
            }}
          />

          <div>
            <FieldLabel>Model</FieldLabel>
            <Select
              value={agent.llmModel}
              onChange={(v) => onChange({ ...agent, llmModel: v })}
              options={LLM_MODELS.map((m) => ({ value: m.id, label: `${m.label} — ${m.sub}` }))}
              aria-label="Model"
            />
          </div>
        </div>
      </SectionShell>
    </>
  );
}

// ── Chat test panel — side pane ────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  ts: string;
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c0',
    role: 'agent',
    text: "Hi, thanks for reaching CertaPro Painters of Austin! I'm Riley, an AI receptionist. I can help you schedule a free in-home estimate or answer questions. What can I help you with today?",
    ts: 'Just now',
  },
];

function ChatTestPanel({
  agentName,
  agentPersona,
  onClose,
}: {
  agentName: string;
  agentPersona: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text, ts: 'Just now' }]);
    setDraft('');
    setTimeout(() => {
      const replies = [
        "Great — are you looking at interior, exterior, or cabinet work?",
        "Got it. And is the property in the Austin metro area?",
        "Perfect. Our free in-home estimates usually take about 30 minutes. Would you like me to send a slot picker to your phone?",
        "I'll get that set up for you. One more thing — are you the homeowner or the decision-maker for this project?",
      ];
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'agent', text: replies[Math.floor(Math.random() * replies.length)]!, ts: 'Just now' },
      ]);
    }, 800);
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 96px)',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
          background: 'var(--dark-90)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'var(--dark-90)', flexShrink: 0,
            }}
          >
            {agentName.charAt(0).toUpperCase()}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--light-100)', lineHeight: 1.3 }}>{agentName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>{agentPersona} · preview</div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close test chat"
          onClick={onClose}
          style={{
            width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)',
            color: 'var(--light-100)', cursor: 'pointer', padding: 0,
          }}
        >
          <Close size={16} />
        </button>
      </div>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg) => {
          const isAgent = msg.role === 'agent';
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-start' : 'flex-end', gap: 4 }}>
              <div
                style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: isAgent ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: isAgent ? 'var(--dark-4)' : 'var(--dark-90)',
                  color: isAgent ? 'var(--dark-90)' : 'var(--light-100)',
                  fontSize: 14, lineHeight: 1.45,
                }}
              >
                {msg.text}
              </div>
              <span style={{ fontSize: 11, color: 'var(--dark-40)' }}>{msg.ts}</span>
            </div>
          );
        })}
      </div>

      {/* Input row */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dark-8)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <input
          {...inputFocusProps}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type a message…"
          style={{
            flex: 1, height: 36, padding: '0 12px', borderRadius: 8,
            border: '1px solid var(--dark-8)', background: 'var(--light-100)',
            color: 'var(--dark-90)', fontFamily: 'inherit', fontSize: 14, outline: 'none',
          }}
        />
        <button
          type="button"
          aria-label="Send"
          onClick={sendMessage}
          disabled={draft.trim().length === 0}
          style={{
            width: 36, height: 36, borderRadius: 8, border: 'none', padding: 0, flexShrink: 0,
            background: draft.trim().length > 0 ? 'var(--dark-90)' : 'var(--dark-8)',
            color: draft.trim().length > 0 ? 'var(--light-100)' : 'var(--dark-40)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: draft.trim().length > 0 ? 'pointer' : 'not-allowed',
            transition: 'background 120ms ease',
          }}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Channels & outcomes + follow-up flows — unified per-channel ────────────

interface SectionProps {
  settings: SdrSettings;
  setSettings: Dispatch<SetStateAction<SdrSettings>>;
}

function ChannelAndFlowsSection({ settings, setSettings }: SectionProps) {
  const updateChannel = (ch: Channel, mut: (c: ChannelSettings) => ChannelSettings) => {
    setSettings((s) => ({
      ...s,
      channels: { ...s.channels, [ch]: mut(s.channels[ch]) },
    }));
  };

  return (
    <SectionShell
      title="Channels"
      sub="Configure what the AI can do on each channel — including outcomes, response targets, and what happens after first contact."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_CHANNELS.filter((ch) => ch !== 'chat').map((ch) => (
          <UnifiedChannelCard
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

function UnifiedChannelCard({
  channel,
  settings,
  update,
}: {
  channel: Channel;
  settings: ChannelSettings;
  update: (mut: (c: ChannelSettings) => ChannelSettings) => void;
}) {
  const dimmed = !settings.enabled;
  const [adding, setAdding] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [flowOpen, setFlowOpen] = useState(false);

  const submitCustom = () => {
    const trimmed = customDraft.trim();
    if (trimmed) update((c) => ({ ...c, customOutcomes: [...c.customOutcomes, trimmed] }));
    setCustomDraft('');
    setAdding(false);
  };

  const tpl = FLOW_TEMPLATE_BY_ID[settings.templateId];
  const isCustom = settings.templateId === 'custom';

  const pickTemplate = (id: FlowTemplateId) => {
    if (id === 'custom') return;
    const seedSteps = FLOW_TEMPLATE_BY_ID[id].steps.map((s, i) => ({
      ...s, id: `${id}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    update((c) => ({ ...c, templateId: id, flowSteps: seedSteps }));
  };

  const mutateSteps = (mut: (steps: FlowStep[]) => FlowStep[]) => {
    update((c) => {
      const nextSteps = mut(c.flowSteps);
      let nextTemplate: FlowTemplateId = 'custom';
      for (const seed of FLOW_TEMPLATES) {
        if (matchesTemplate(nextSteps, seed.id)) { nextTemplate = seed.id; break; }
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
        opacity: dimmed ? 0.55 : 1,
        transition: 'opacity 160ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--dark-8)',
          background: 'var(--dark-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8, background: 'var(--light-100)', flexShrink: 0,
            }}
          >
            <ChannelGlyph channel={channel} size={20} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>{channelLabel(channel)}</div>
            <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{channelHint(channel)}</div>
          </div>
        </div>
        <Toggle checked={settings.enabled} onChange={(v) => update((c) => ({ ...c, enabled: v }))} />
      </div>

      {/* Card body */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Allowed outcomes */}
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
                      if (next) nextSet.add(o.id); else nextSet.delete(o.id);
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
                onDelete={() => update((c) => ({ ...c, customOutcomes: c.customOutcomes.filter((_, j) => j !== i) }))}
              >
                {label}
              </Chip>
            ))}
            {adding ? (
              <input
                autoFocus
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px var(--dark-4)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; submitCustom(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); submitCustom(); }
                  else if (e.key === 'Escape') { setCustomDraft(''); setAdding(false); }
                }}
                placeholder="Custom outcome…"
                style={{
                  fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)',
                  height: 32, padding: '0 10px', border: '1px solid var(--dark-90)',
                  borderRadius: 6, background: 'var(--light-100)', outline: 'none', minWidth: 160,
                }}
              />
            ) : (
              <Button variant="secondary" size="sm" frontIcon={Plus} isDisabled={dimmed} onPress={() => setAdding(true)}>
                Add custom
              </Button>
            )}
          </div>
        </div>

        {/* Reply SLA — inline labeled group */}
        <div>
          <FieldLabel>Reply SLA</FieldLabel>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'var(--dark-2)',
              border: '1px solid var(--dark-8)',
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>Respond within</span>
            <NumberInput
              value={settings.slaSeconds}
              onChange={(v) => update((c) => ({ ...c, slaSeconds: v }))}
              min={1}
              max={3600}
              disabled={dimmed}
            />
            <span style={{ fontSize: 13, color: 'var(--dark-60)', whiteSpace: 'nowrap' }}>seconds</span>
          </div>
        </div>

        {/* After first contact — collapsible */}
        <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => setFlowOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
              marginBottom: flowOpen ? 16 : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>After first contact</span>
              <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
                {tpl.label}{!isCustom && ` · ${settings.flowSteps.length} step${settings.flowSteps.length === 1 ? '' : 's'}`}
              </span>
              {isCustom && <StatusPill tone="accent" size="sm">Custom</StatusPill>}
            </div>
            {flowOpen ? <ChevronUp size={16} color="var(--dark-60)" /> : <ChevronDown size={16} color="var(--dark-60)" />}
          </button>

          {flowOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <FieldLabel>Template</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {FLOW_TEMPLATES.map((t) => {
                    const isSelected = settings.templateId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => pickTemplate(t.id)}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 4, padding: 12,
                          borderRadius: 8, border: `1px solid ${isSelected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                          background: 'var(--light-100)', color: 'var(--dark-90)', fontFamily: 'inherit',
                          cursor: 'pointer', textAlign: 'left', minHeight: 80,
                          boxShadow: isSelected ? '0 0 0 1px var(--dark-90) inset' : 'none',
                          transition: 'border-color 120ms ease, box-shadow 120ms ease',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.4 }}>{t.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Steps</FieldLabel>
                {settings.flowSteps.length === 0 ? (
                  <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', padding: '4px 0', fontSize: 13 }}>
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
                        onChange={(next) => mutateSteps((steps) => steps.map((s) => (s.id === step.id ? next : s)))}
                        onDelete={() => mutateSteps((steps) => steps.filter((s) => s.id !== step.id))}
                        onMove={(dir) =>
                          mutateSteps((steps) => {
                            const j = i + dir;
                            if (j < 0 || j >= steps.length) return steps;
                            const next = steps.slice();
                            [next[i], next[j]] = [next[j]!, next[i]!];
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    frontIcon={Plus}
                    onPress={() =>
                      mutateSteps((steps) => [
                        ...steps,
                        { id: nextStepId(), delay: '24h', channel: 'sms' as FlowChannel, message: 'New step — write the message the AI will send here.' },
                      ])
                    }
                  >
                    Add step
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CHANNEL_LABEL_OVERRIDE: Partial<Record<Channel, string>> = {
  form: 'Form submission',
};

function channelLabel(ch: Channel): string {
  return CHANNEL_LABEL_OVERRIDE[ch] ?? SOURCE_LABELS[ch];
}

function channelHint(ch: Channel): string {
  switch (ch) {
    case 'form':         return 'Inbound form submissions from the website. AI replies by SMS.';
    case 'inbound-call': return 'Live calls picked up by the AI voice agent.';
    case 'chat':         return 'Web chat widget on the marketing site.';
  }
}

// ── Step row ──────────────────────────────────────────────────────────────

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
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%', background: 'var(--dark-4)',
          color: 'var(--dark-90)', fontSize: 13, fontWeight: 500, marginTop: 2,
        }}
      >
        {index + 1}
      </span>
      <input {...inputFocusProps} type="text" value={step.delay} onChange={(e) => onChange({ ...step, delay: e.target.value })} aria-label="Delay" style={inputStyle} placeholder="24h" />
      <select value={step.channel} onChange={(e) => onChange({ ...step, channel: e.target.value as FlowChannel })} aria-label="Channel" style={{ ...inputStyle, paddingRight: 8 }}>
        <option value="sms">SMS</option>
        <option value="email">Email</option>
      </select>
      <textarea {...inputFocusProps} value={step.message} onChange={(e) => onChange({ ...step, message: e.target.value })} aria-label="Message" rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: 36 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SmallIconButton ariaLabel="Move up" disabled={index === 0} onClick={() => onMove(-1)}>↑</SmallIconButton>
        <SmallIconButton ariaLabel="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>↓</SmallIconButton>
        <SmallIconButton ariaLabel="Delete step" onClick={onDelete}><Close size={14} color="var(--dark-60)" /></SmallIconButton>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-90)',
  padding: '6px 8px', border: '1px solid var(--dark-8)', borderRadius: 6,
  background: 'var(--light-100)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

function SmallIconButton({ children, onClick, disabled, ariaLabel }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; ariaLabel: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--dark-8)', borderRadius: 6, background: 'var(--light-100)',
        color: 'var(--dark-60)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, padding: 0, fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function SectionDivider() {
  // Dividers removed for now — kept as a no-op so call sites stay intact.
  return null;
}

function SectionShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <Heading level={3} style={{ marginBottom: 4 }}>{title}</Heading>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>{sub}</Text>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="primary" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      {children}
    </Text>
  );
}

function NumberInput({ value, onChange, min, max, disabled }: { value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean }) {
  return (
    <input
      {...inputFocusProps}
      type="number"
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n)));
      }}
      style={{ width: 72, fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)', padding: '6px 8px', border: '1px solid var(--dark-8)', borderRadius: 8, background: 'var(--light-100)', outline: 'none' }}
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
          position: 'relative', display: 'inline-block', width: 36, height: 20, flexShrink: 0,
          borderRadius: 999, background: checked ? 'var(--dark-90)' : 'var(--dark-15)',
          transition: 'background-color 160ms ease',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
            borderRadius: '50%', background: 'var(--light-100)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transition: 'left 160ms ease',
          }}
        />
      </span>
    </label>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AGENT TAB — System prompt · Voice & personality
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
      <div style={{ marginBottom: 24 }}>
        <Select
          value={v.voiceId}
          onChange={(val) => update((x) => ({ ...x, voiceId: val as AiVoiceId }))}
          options={AI_VOICES.map((voice) => ({ value: voice.id, label: `${voice.name} — ${voice.description}` }))}
          optionAction={{
            icon: Play3,
            ariaLabel: 'Preview',
            onAction: (id) => {
              const sel = AI_VOICES.find((vo) => vo.id === id);
              showToast({ message: `Previewing ${sel?.name ?? 'voice'}…` });
            },
          }}
          aria-label="AI voice"
        />
      </div>

      <FieldLabel>Custom greeting script <OptionalHint /></FieldLabel>
      <textarea
        {...inputFocusProps}
        value={v.greeting}
        onChange={(e) => update((x) => ({ ...x, greeting: e.target.value }))}
        rows={4}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5, marginBottom: 24 }}
      />

      <FieldLabel>Maximum call duration <OptionalHint /></FieldLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {MAX_CALL_DURATIONS.map((d) => (
          <Chip key={d.value} size="md" selected={v.maxCallDuration === d.value} onSelectionChange={() => update((x) => ({ ...x, maxCallDuration: d.value as MaxCallDuration }))}>
            {d.label}
          </Chip>
        ))}
      </div>
    </SectionShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CONVERSATIONS TAB — Goals · Channels · Escalation
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
        <RadioCard selected={g.primaryGoal === 'book'} onClick={() => update((x) => ({ ...x, primaryGoal: 'book' as PrimaryGoal }))} title="Book an appointment" description="Collect service, date, time, and contact info." />
        <RadioCard selected={g.primaryGoal === 'capture'} onClick={() => update((x) => ({ ...x, primaryGoal: 'capture' as PrimaryGoal }))} title="Capture a lead" description="Collect name, phone, and intent." />
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
  const { openModal } = useModals();

  const commitTriggers = (next: EscalationTrigger[]) =>
    setSettings((s) => ({ ...s, escalation: { triggers: next } }));
  const removeTrigger = (id: string) =>
    commitTriggers(triggers.filter((t) => t.id !== id));

  const openEdit = (initialTriggers: EscalationTrigger[], initialId: string, isNew: boolean) => {
    openModal(EscalationRuleModalRoute, {
      initialTriggers,
      initialId,
      isNew,
      onSave: commitTriggers,
    });
  };
  const handleRowClick = (id: string) => openEdit(triggers, id, false);
  const handleAdd = () => {
    const newId = `rule-${Date.now()}`;
    const newTrigger: EscalationTrigger = {
      id: newId, label: '', description: '', requirements: '', duringHours: 'escalate', afterHours: 'escalate',
    };
    openEdit([...triggers, newTrigger], newId, true);
  };

  return (
    <SectionShell
      title="Escalation rules"
      sub="Different situations call for different responses depending on when the call comes in. Set a behavior per trigger for each time window."
    >
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px 40px', gap: 12, padding: '10px 14px', background: 'var(--dark-2)', borderBottom: '1px solid var(--dark-8)', fontSize: 13, color: 'var(--dark-60)' }}>
          <span>Trigger</span>
          <span>During hours</span>
          <span>After hours</span>
          <span aria-hidden />
        </div>
        {triggers.map((t, i) => {
          const duringLabel = ESCALATION_ACTIONS.find((a) => a.id === t.duringHours)?.label ?? t.duringHours;
          const afterLabel = ESCALATION_ACTIONS.find((a) => a.id === t.afterHours)?.label ?? t.afterHours;
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => handleRowClick(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(t.id); }
              }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 160px 40px', padding: '14px', alignItems: 'center', gap: 12,
                borderBottom: i === triggers.length - 1 ? 'none' : '1px solid var(--dark-8)',
                cursor: 'pointer', transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dark-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heading level={5} style={{ margin: 0 }}>
                    {t.label || 'Untitled trigger'}
                  </Heading>
                  {t.default && <StatusPill tone="neutral" size="sm">Default</StatusPill>}
                </div>
                <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
                  {t.description || 'Describe the situation'}
                </Text>
              </div>
              <div style={{ minWidth: 0 }}>
                <StatusPill tone={actionTone(t.duringHours)} size="sm">{duringLabel}</StatusPill>
              </div>
              <div style={{ minWidth: 0 }}>
                <StatusPill tone={actionTone(t.afterHours)} size="sm">{afterLabel}</StatusPill>
              </div>
              {t.default ? (
                <span aria-hidden />
              ) : (
                <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex' }}>
                  <IconButton
                    variant="tertiary"
                    size="sm"
                    icon={Trash2}
                    aria-label="Remove trigger"
                    onPress={() => removeTrigger(t.id)}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleAdd}>
          Add Escalation Rule
        </Button>
      </div>
    </SectionShell>
  );
}

/**
 * EscalationRuleModalRoute — Blaze lib Modal that edits a single escalation
 * rule. Holds local edits + the in-flight triggers array so prev/next can
 * step between rules without flushing; Save commits all local edits at once,
 * Delete drops the current rule and commits, Close/Esc/backdrop discards.
 * The ModalStack provider is mounted at prototypes/h2/index.tsx.
 */
function EscalationRuleModalRoute({
  close,
  initialTriggers,
  initialId,
  isNew,
  onSave,
}: StackModalProps & {
  initialTriggers: EscalationTrigger[];
  initialId: string;
  isNew: boolean;
  onSave: (triggers: EscalationTrigger[]) => void;
}) {
  const [triggers, setTriggers] = useState(initialTriggers);
  const [currentId, setCurrentId] = useState(initialId);
  const index = triggers.findIndex((t) => t.id === currentId);
  const trigger = index >= 0 ? triggers[index] : undefined;

  // Arrow keys step between rules — but only in edit mode. In "new" mode
  // there's nothing to navigate to (the draft isn't saved yet) and we let
  // the inputs handle ArrowUp/ArrowDown normally.
  useEffect(() => {
    if (isNew) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && index > 0) { e.preventDefault(); setCurrentId(triggers[index - 1].id); }
      else if (e.key === 'ArrowDown' && index < triggers.length - 1) { e.preventDefault(); setCurrentId(triggers[index + 1].id); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, triggers, isNew]);

  // Self-close if the current rule disappears (shouldn't happen — defensive).
  useEffect(() => { if (!trigger) close(); }, [trigger, close]);
  if (!trigger) return null;

  const isDefault = !!trigger.default;
  const update = (mut: (t: EscalationTrigger) => EscalationTrigger) =>
    setTriggers((ts) => ts.map((t) => (t.id === currentId ? mut(t) : t)));
  const handleSave = () => { onSave(triggers); close(); };
  const handleDelete = () => { onSave(triggers.filter((t) => t.id !== currentId)); close(); };
  const onPrev = index > 0 ? () => setCurrentId(triggers[index - 1].id) : undefined;
  const onNext = index < triggers.length - 1 ? () => setCurrentId(triggers[index + 1].id) : undefined;

  const headerActions = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <IconButton icon={ChevronUp} size="sm" variant="tertiary" isDisabled={!onPrev} onPress={() => onPrev?.()} aria-label="Previous rule" />
      <IconButton icon={ChevronDown} size="sm" variant="tertiary" isDisabled={!onNext} onPress={() => onNext?.()} aria-label="Next rule" />
      <Text variant="secondary" style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap', margin: '0 4px' }}>
        {index + 1} of {triggers.length}
      </Text>
    </div>
  );

  const title = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {isNew ? 'New escalation rule' : 'Escalation rule'}
      {isDefault && <StatusPill tone="neutral" size="sm">Default</StatusPill>}
    </span>
  );

  return (
    <Modal.Root size="md" onPressOutside={close}>
      <Modal.Header title={title} onClose={close} actions={isNew ? undefined : headerActions} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <FieldLabel>Trigger name</FieldLabel>
            {isDefault ? (
              <Text variant="primary" style={{ display: 'block' }}>{trigger.label}</Text>
            ) : (
              <input
                {...inputFocusProps}
                type="text"
                value={trigger.label}
                onChange={(e) => update((x) => ({ ...x, label: e.target.value }))}
                placeholder="e.g. Storm or hail damage"
                aria-label="Trigger name"
                autoFocus
                style={largeInputStyle}
              />
            )}
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            {isDefault ? (
              <Text variant="primary" style={{ display: 'block' }}>{trigger.description}</Text>
            ) : (
              <textarea
                {...inputFocusProps}
                value={trigger.description}
                onChange={(e) => update((x) => ({ ...x, description: e.target.value }))}
                placeholder="Describe the situation that should trigger this rule"
                aria-label="Trigger description"
                rows={2}
                style={{ ...largeInputStyle, resize: 'vertical', minHeight: 72 }}
              />
            )}
            {isDefault && (
              <Text variant="secondary" style={{ display: 'block', marginTop: 8, color: 'var(--dark-60)' }}>
                This is a built-in rule that ships with every agent. You can still tune how it responds during and after hours.
              </Text>
            )}
          </div>
          <div>
            <FieldLabel>Requirements</FieldLabel>
            {isDefault ? (
              trigger.requirements ? (
                <Text variant="primary" style={{ display: 'block' }}>{trigger.requirements}</Text>
              ) : (
                <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>No additional requirements.</Text>
              )
            ) : (
              <textarea
                {...inputFocusProps}
                value={trigger.requirements ?? ''}
                onChange={(e) => update((x) => ({ ...x, requirements: e.target.value }))}
                placeholder="Optional: any conditions that must be met for the rule to fire"
                aria-label="Trigger requirements"
                rows={2}
                style={{ ...largeInputStyle, resize: 'vertical', minHeight: 72 }}
              />
            )}
          </div>
          <div>
            <FieldLabel>During hours</FieldLabel>
            <ActionPillGroup
              value={trigger.duringHours}
              onChange={(v) => update((x) => ({ ...x, duringHours: v }))}
              ariaLabel="During business hours action"
            />
          </div>
          <div>
            <FieldLabel>After hours</FieldLabel>
            <ActionPillGroup
              value={trigger.afterHours}
              onChange={(v) => update((x) => ({ ...x, afterHours: v }))}
              ariaLabel="After hours action"
            />
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        {!isDefault && !isNew && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="tertiary" frontIcon={Trash2} onPress={handleDelete}>
              Delete rule
            </Modal.FooterButton>
          </Modal.FooterContent>
        )}
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={handleSave}>Save</Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function actionTone(id: EscalationAction): 'danger' | 'warning' | 'neutral' | 'success' {
  if (id === 'escalate') return 'danger';
  if (id === 'decline')  return 'neutral';
  return 'success';
}

/**
 * ActionPillGroup — radio-group of selectable Chip pills, one per escalation
 * action. Used inside the escalation rule modal in place of a dropdown.
 */
function ActionPillGroup({
  value,
  onChange,
  ariaLabel,
}: {
  value: EscalationAction;
  onChange: (v: EscalationAction) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {ESCALATION_ACTIONS.map((action) => {
        const isSelected = action.id === value;
        return (
          <Chip
            key={action.id}
            size="md"
            selected={isSelected}
            onSelectionChange={() => { if (!isSelected) onChange(action.id); }}
            role="radio"
            aria-checked={isSelected}
          >
            {action.label}
          </Chip>
        );
      })}
    </div>
  );
}

function WindowCard({ dot, title, line1, line2, pillTone, pillLabel }: { dot: string; title: string; line1: string; line2: string; pillTone: 'success' | 'neutral'; pillLabel: string }) {
  return (
    <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, padding: 18, background: 'var(--light-100)' }}>
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
// AGENT TAB — Knowledge base section
// ══════════════════════════════════════════════════════════════════════════

function KnowledgeBaseSection({
  agent,
  onChange,
}: {
  agent: AgentConfig;
  onChange: (a: AgentConfig) => void;
}) {
  return (
    <SectionShell
      title="Knowledge base"
      sub="Paste or type any background information the AI should reference — FAQs, pricing, service area, policies. The AI will use this to answer prospect questions accurately."
    >
      <textarea
        {...inputFocusProps}
        value={agent.knowledgeBase}
        onChange={(e) => onChange({ ...agent, knowledgeBase: e.target.value })}
        rows={8}
        placeholder="e.g. We serve the Austin metro area. Free in-home estimates. Average residential interior: $3,500–$12,000. Every job includes a 2-year written warranty..."
        style={{
          ...textInputStyle,
          resize: 'vertical',
          lineHeight: 1.6,
          fontFamily: "'Sohne', sans-serif",
          fontSize: 13,
        }}
      />
    </SectionShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TRIGGERS TAB — Shift hours + expected inputs
// ══════════════════════════════════════════════════════════════════════════

const TRIGGER_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ShiftDay {
  key: string;
  label: string;
  enabled: boolean;
  start: string;
  end: string;
}

const DEFAULT_SHIFT: ShiftDay[] = [
  { key: 'mon', label: 'Monday',    enabled: true,  start: '08:00', end: '17:00' },
  { key: 'tue', label: 'Tuesday',   enabled: true,  start: '08:00', end: '17:00' },
  { key: 'wed', label: 'Wednesday', enabled: true,  start: '08:00', end: '17:00' },
  { key: 'thu', label: 'Thursday',  enabled: true,  start: '08:00', end: '17:00' },
  { key: 'fri', label: 'Friday',    enabled: true,  start: '08:00', end: '17:00' },
  { key: 'sat', label: 'Saturday',  enabled: true,  start: '09:00', end: '12:00' },
  { key: 'sun', label: 'Sunday',    enabled: false, start: '09:00', end: '17:00' },
];

// How many rings before the AI answers — set separately for business hours vs
// after hours. Business-hours default rings longer (4) so the team can pick up
// first; after-hours answers on the first ring since no one's in the office.
const RING_OPTIONS = [
  { value: '1', label: 'On the 1st ring' },
  { value: '2', label: 'On the 2nd ring' },
  { value: '3', label: 'On the 3rd ring' },
  { value: '4', label: 'On the 4th ring' },
  { value: '5', label: 'On the 5th ring' },
  { value: '6', label: 'On the 6th ring' },
];

function PickupRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 14px',
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{label}</Text>
        <Text color="var(--dark-60)" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{hint}</Text>
      </div>
      <div style={{ flexShrink: 0 }}>
        <Select size="sm" value={value} onChange={onChange} options={RING_OPTIONS} aria-label={`${label} — rings before the AI picks up`} />
      </div>
    </div>
  );
}

function TriggersSection({
  agent,
  onChange,
}: {
  agent: AgentConfig;
  onChange: (a: AgentConfig) => void;
}) {
  const [shift, setShift] = useState<ShiftDay[]>(DEFAULT_SHIFT);
  // Rings-before-pickup, separate for business hours vs after hours.
  const [pickup, setPickup] = useState({ business: '4', afterHours: '1' });

  const toggleDay = (key: string) => {
    setShift((prev) => prev.map((d) => d.key === key ? { ...d, enabled: !d.enabled } : d));
  };
  const updateTime = (key: string, field: 'start' | 'end', val: string) => {
    setShift((prev) => prev.map((d) => d.key === key ? { ...d, [field]: val } : d));
  };

  return (
    <>
      <SectionShell
        title="Agent phone number"
        sub="The number callers will reach and that the AI will use for outbound SMS."
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            border: '1px solid var(--dark-8)',
            borderRadius: 8,
            background: 'var(--dark-2)',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', fontVariantNumeric: 'tabular-nums' }}>
            {agent.agentPhone || '—'}
          </span>
          <StatusPill tone="success" size="sm">Active</StatusPill>
        </div>
      </SectionShell>

      <SectionDivider />

      <SectionShell
        title="Pickup timing"
        sub="How long the line rings before the AI answers. Ring longer during business hours so your team can grab it first; answer right away after hours."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
          <PickupRow
            label="During business hours"
            hint="Give the team a few rings to pick up first."
            value={pickup.business}
            onChange={(v) => setPickup((p) => ({ ...p, business: v }))}
          />
          <PickupRow
            label="After hours"
            hint="No one's in the office — the AI answers immediately."
            value={pickup.afterHours}
            onChange={(v) => setPickup((p) => ({ ...p, afterHours: v }))}
          />
        </div>
      </SectionShell>

      <SectionDivider />

      <SectionShell
      title="Shift hours"
      sub="The hours during which this agent handles inbound contacts. Outside these hours, escalation and after-hours rules apply."
    >
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 120px 120px 64px',
            padding: '8px 16px',
            background: 'var(--dark-2)',
            borderBottom: '1px solid var(--dark-8)',
            fontSize: 12,
            color: 'var(--dark-60)',
            gap: 16,
          }}
        >
          <span>Day</span>
          <span>Start</span>
          <span>End</span>
          <span>Active</span>
        </div>
        {shift.map((d, i) => (
          <div
            key={d.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 120px 120px 64px',
              padding: '10px 16px',
              alignItems: 'center',
              gap: 16,
              borderBottom: i === shift.length - 1 ? 'none' : '1px solid var(--dark-4)',
              opacity: d.enabled ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--dark-90)' }}>{d.label}</span>
            <input
              {...inputFocusProps}
              type="text"
              value={d.start}
              disabled={!d.enabled}
              onChange={(e) => updateTime(d.key, 'start', e.target.value)}
              style={{ ...inputStyle, cursor: d.enabled ? 'auto' : 'not-allowed' }}
            />
            <input
              {...inputFocusProps}
              type="text"
              value={d.end}
              disabled={!d.enabled}
              onChange={(e) => updateTime(d.key, 'end', e.target.value)}
              style={{ ...inputStyle, cursor: d.enabled ? 'auto' : 'not-allowed' }}
            />
            <Toggle checked={d.enabled} onChange={() => toggleDay(d.key)} />
          </div>
        ))}
      </div>
    </SectionShell>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// OUTCOMES TAB — Messages · Escalations · Bookings
// ══════════════════════════════════════════════════════════════════════════

interface MessageRecipient {
  id: string;
  type: 'sms' | 'email';
  value: string;
}

interface EscalationConfig {
  enabled: boolean;
  contactMethod: 'call' | 'sms';
  contactNumber: string;
}

interface OutcomesConfig {
  escalation: EscalationConfig;
  emailIcsEnabled: boolean;
  bookingSmsEnabled: boolean;
  bookingSmsNumber: string;
  serviceLabel: string;
  confirmationMessage: string;
  notificationEmail: string;
  extraInstructions: string;
  calendarLink: string;
}

const DEFAULT_OUTCOMES_CONFIG: OutcomesConfig = {
  escalation: {
    enabled: true,
    contactMethod: 'sms',
    contactNumber: '+1 (512) 323-9000',
  },
  emailIcsEnabled: true,
  bookingSmsEnabled: true,
  bookingSmsNumber: '+1 (512) 323-9000',
  serviceLabel: 'In-home estimate',
  confirmationMessage:
    "Hi {caller_name}, your {service} with CertaPro Painters of Austin is confirmed for {date} at {time}. " +
    "Matthew will follow up by end of day. Questions? Reply here or call {business_phone}.",
  notificationEmail: 'matthew@certapro.com',
  extraInstructions:
    "Confirm whether the prospect wants interior, exterior, or both before booking. " +
    "Mention that the estimate takes about 30–45 minutes and is completely free.",
  calendarLink: 'https://calendly.com/certapro-austin/estimate',
};

// Customer messages — moved out of the Outcomes tab into the Agent tab.
function CustomerMessagesSection() {
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const addRecipient = (type: 'sms' | 'email') =>
    setRecipients((rs) => [...rs, { id: `msg-${Date.now()}`, type, value: '' }]);
  const updateRecipient = (id: string, value: string) =>
    setRecipients((rs) => rs.map((r) => (r.id === id ? { ...r, value } : r)));
  const removeRecipient = (id: string) =>
    setRecipients((rs) => rs.filter((r) => r.id !== id));

  return (
    <SectionShell
      title="Customer messages"
      sub="When a customer wants to leave a message or ask a question, the AI will notify these contacts."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recipients.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11, fontWeight: 500,
                color: r.type === 'sms' ? 'var(--status-posting)' : 'var(--purple)',
                background: r.type === 'sms' ? 'rgba(1,121,207,0.08)' : 'rgba(124,92,252,0.08)',
                padding: '3px 8px', borderRadius: 6, flexShrink: 0,
              }}
            >
              {r.type === 'sms' ? 'SMS' : 'Email'}
            </span>
            <input
              {...inputFocusProps}
              type={r.type === 'email' ? 'email' : 'tel'}
              value={r.value}
              onChange={(e) => updateRecipient(r.id, e.target.value)}
              placeholder={r.type === 'sms' ? '+1 (512) 555-0000' : 'name@example.com'}
              style={{ ...textInputStyle, flex: 1, maxWidth: 360 }}
            />
            <button
              type="button"
              aria-label="Remove"
              onClick={() => removeRecipient(r.id)}
              style={{
                width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--dark-8)', borderRadius: 6, background: 'none',
                cursor: 'pointer', color: 'var(--dark-40)', flexShrink: 0, padding: 0,
              }}
            >
              <Close size={14} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" frontIcon={Plus} onPress={() => addRecipient('sms')}>
            Add phone (SMS)
          </Button>
          <Button variant="secondary" size="sm" frontIcon={Plus} onPress={() => addRecipient('email')}>
            Add email
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}

function OutcomesSection({ settings, setSettings }: SectionProps) {
  const [config, setConfig] = useState<OutcomesConfig>(DEFAULT_OUTCOMES_CONFIG);
  const update = (mut: (c: OutcomesConfig) => OutcomesConfig) => setConfig((prev) => mut(prev));

  return (
    <>
      {/* ── Escalations ── */}
      <SectionShell
        title="Escalations"
        sub="When a qualified customer urgently needs to speak with someone, the AI will contact the owner directly."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid var(--dark-8)', borderRadius: 10 }}>
            <div>
              <Heading level={5}>Accept escalations</Heading>
              <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 2 }}>
                Allow the AI to interrupt the owner when a hot prospect can't wait.
              </div>
            </div>
            <Toggle
              checked={config.escalation.enabled}
              onChange={(v) => update((c) => ({ ...c, escalation: { ...c.escalation, enabled: v } }))}
            />
          </div>

          {config.escalation.enabled && (
            <>
              <div>
                <FieldLabel>Contact method</FieldLabel>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['call', 'sms'] as const).map((m) => (
                    <Chip
                      key={m}
                      size="md"
                      selected={config.escalation.contactMethod === m}
                      onSelectionChange={() => update((c) => ({ ...c, escalation: { ...c.escalation, contactMethod: m } }))}
                    >
                      {m === 'call' ? 'Phone call' : 'SMS'}
                    </Chip>
                  ))}
                </div>
              </div>
              <TextField
                label="Escalation contact"
                value={config.escalation.contactNumber}
                onChange={(v) => update((c) => ({ ...c, escalation: { ...c.escalation, contactNumber: v } }))}
                hint="The phone number the AI will call or text when escalating."
                maxWidth={240}
              />
            </>
          )}
        </div>
      </SectionShell>

      {/* ── Escalation rules (moved over from Settings 2) — only when escalations are on ── */}
      {config.escalation.enabled && (
        <>
          <SectionDivider />
          <EscalationRulesSection settings={settings} setSettings={setSettings} />
        </>
      )}

      <SectionDivider />

      {/* ── Bookings ── */}
      <SectionShell
        title="Bookings"
        sub="Configure how booking confirmations are delivered and what the AI should do when capturing a booking."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Email / ICS */}
          <div>
            <FieldLabel>Delivery method</FieldLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--dark-8)', borderRadius: 10 }}>
                <div>
                  <Heading level={5}>Email + ICS calendar invite</Heading>
                  <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 2 }}>Confirmation email with .ics file to prospect and owner.</div>
                </div>
                <Toggle checked={config.emailIcsEnabled} onChange={(v) => update((c) => ({ ...c, emailIcsEnabled: v }))} />
              </div>

              {/* SMS notification for bookings */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--dark-8)', borderRadius: config.bookingSmsEnabled ? '10px 10px 0 0' : 10 }}>
                  <div>
                    <Heading level={5}>SMS notification</Heading>
                    <div style={{ fontSize: 13, color: 'var(--dark-60)', marginTop: 2 }}>Text a phone number when a booking is confirmed.</div>
                  </div>
                  <Toggle checked={config.bookingSmsEnabled} onChange={(v) => update((c) => ({ ...c, bookingSmsEnabled: v }))} />
                </div>
                {config.bookingSmsEnabled && (
                  <div style={{ padding: '12px 16px', border: '1px solid var(--dark-8)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'var(--dark-2)' }}>
                    <FieldLabel>SMS recipient number</FieldLabel>
                    <input
                      {...inputFocusProps}
                      type="tel"
                      value={config.bookingSmsNumber}
                      onChange={(e) => update((c) => ({ ...c, bookingSmsNumber: e.target.value }))}
                      placeholder="+1 (512) 555-0000"
                      style={{ ...textInputStyle, maxWidth: 240 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <TextField
            label="Booked service label"
            value={config.serviceLabel}
            onChange={(v) => update((c) => ({ ...c, serviceLabel: v }))}
            hint='What is being booked — e.g. "appointment", "coaching session", "in-home estimate".'
            maxWidth={320}
          />

          <div>
            <div style={{ marginBottom: -6 }}>
              <FieldLabel>Confirmation message</FieldLabel>
            </div>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>
              Sent to the prospect after booking. Variables: {'{caller_name}'}, {'{service}'}, {'{date}'}, {'{time}'}, {'{business_phone}'}.
            </Text>
            <textarea
              {...inputFocusProps}
              value={config.confirmationMessage}
              onChange={(e) => update((c) => ({ ...c, confirmationMessage: e.target.value }))}
              rows={4}
              style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <TextField
            label="Booking notification email"
            value={config.notificationEmail}
            onChange={(v) => update((c) => ({ ...c, notificationEmail: v }))}
            hint="Where the booking summary is sent immediately after the AI captures a booking."
            maxWidth={360}
          />

          <div>
            <div style={{ marginBottom: -6 }}>
              <FieldLabel>Extra booking instructions for AI</FieldLabel>
            </div>
            <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>
              What the AI should check or say before confirming a booking.
            </Text>
            <textarea
              {...inputFocusProps}
              value={config.extraInstructions}
              onChange={(e) => update((c) => ({ ...c, extraInstructions: e.target.value }))}
              rows={3}
              style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <TextField
            label="Calendar availability link"
            value={config.calendarLink}
            onChange={(v) => update((c) => ({ ...c, calendarLink: v }))}
            hint="A Calendly, Cal.com, or similar link. The AI will direct prospects here to pick a slot."
            maxWidth={480}
          />
        </div>
      </SectionShell>
    </>
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

  const mediumTabs: { id: MediumTab; label: string }[] = [
    { id: 'phone', label: 'Phone' },
    { id: 'sms',   label: 'SMS follow-up' },
    { id: 'email', label: 'Email' },
  ];

  return (
    <SectionShell
      title="Channel setup"
      sub="Configure how each outbound channel is wired. Phone is required for v1."
    >
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Folder-style tab strip */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--dark-8)' }}>
          {mediumTabs.map((t, i) => {
            const sel = medium === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMedium(t.id)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: sel ? 'var(--light-100)' : 'var(--dark-2)',
                  border: 'none',
                  borderRight: i < 2 ? '1px solid var(--dark-8)' : 'none',
                  borderBottom: sel ? '2px solid var(--dark-90)' : '2px solid transparent',
                  fontSize: 14,
                  fontWeight: sel ? 500 : 400,
                  color: sel ? 'var(--dark-90)' : 'var(--dark-60)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: 20 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', border: '1px solid var(--dark-8)', borderRadius: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>Disclose AI at start of call</div>
                  <Toggle checked={settings.mediums.phone.discloseAi} onChange={(v) => update((m) => ({ ...m, phone: { ...m.phone, discloseAi: v } }))} />
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
                  {...inputFocusProps}
                  value={settings.mediums.email.signature}
                  onChange={(e) => update((m) => ({ ...m, email: { ...m.email, signature: e.target.value } }))}
                  rows={3}
                  style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>
            </div>
          )}
        </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 16, background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10, marginBottom: 24 }}>
          <TextField label="Account email" value={b.accountEmail} onChange={(v) => update((x) => ({ ...x, accountEmail: v }))} />
          <TextField label="Default event type" value={b.eventType} onChange={(v) => update((x) => ({ ...x, eventType: v }))} />
          <NumberField label="Duration (min)" value={b.durationMin} onChange={(v) => update((x) => ({ ...x, durationMin: Math.max(5, Math.min(180, v)) }))} min={5} max={180} />
        </div>
      )}

      <FieldLabel>Booking confirmation mode</FieldLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        <Chip size="md" selected={b.confirmationMode === 'pending'} onSelectionChange={() => update((x) => ({ ...x, confirmationMode: 'pending' as ConfirmationMode }))}>
          Pending — owner confirms before it&apos;s final
        </Chip>
        <Chip size="md" selected={b.confirmationMode === 'auto'} onSelectionChange={() => update((x) => ({ ...x, confirmationMode: 'auto' as ConfirmationMode }))}>
          Auto-confirmed (requires calendar integration)
        </Chip>
      </div>

      <FieldLabel>Confirmation SMS to caller</FieldLabel>
      <textarea
        {...inputFocusProps}
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

// Blaze-style focus: on focus the border darkens to var(--dark-40) + a subtle
// ring; on blur it reverts to the default var(--dark-8). Spread onto raw
// inputs/textareas (those whose resting border is var(--dark-8)).
const inputFocusProps = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--dark-40)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--dark-4)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--dark-8)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

const textInputStyle: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)',
  padding: '8px 10px', border: '1px solid var(--dark-8)', borderRadius: 6,
  background: 'var(--light-100)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

const largeInputStyle: React.CSSProperties = { ...textInputStyle, fontSize: 16, padding: '12px 14px', borderRadius: 8 };

function TextField({ label, value, onChange, hint, maxWidth }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; hint?: string; maxWidth?: number }) {
  return (
    <div>
      {hint ? (
        <>
          <div style={{ marginBottom: -6 }}>
            <FieldLabel>{label}</FieldLabel>
          </div>
          <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 8 }}>{hint}</Text>
        </>
      ) : (
        <FieldLabel>{label}</FieldLabel>
      )}
      <input {...inputFocusProps} type="text" value={value} onChange={(e) => onChange(e.target.value)} style={maxWidth ? { ...textInputStyle, maxWidth } : textInputStyle} />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...inputFocusProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 3}
        placeholder={placeholder}
        style={{ ...textInputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: "'Sohne', sans-serif", fontSize: 13 }}
      />
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        {...inputFocusProps}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n)) onChange(n); }}
        style={textInputStyle}
      />
    </div>
  );
}

function RadioCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description?: string }) {
  const Icon = selected ? CheckboxChecked : CheckboxLight;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left',
        border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-4)'}`,
        borderRadius: 10, background: selected ? 'var(--light-100)' : 'var(--dark-2)',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
    >
      <Icon size={20} />
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{title}</span>
        {description && <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4 }}>{description}</span>}
      </span>
    </button>
  );
}

function OptionalHint() {
  return <Pill size="xs" style={{ marginLeft: 6 }}>Optional</Pill>;
}
