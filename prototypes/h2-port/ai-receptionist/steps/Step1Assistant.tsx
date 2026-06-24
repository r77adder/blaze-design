import { useState, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Chip } from '@/staging';
import ArrowRight from '@/icons/20/ArrowRight';
import Close from '@/icons/12/Close';

/**
 * Step 1 — "Confirm your AI Receptionist."
 *
 * Pre-configured assistant config the user can tweak before connecting tools.
 * The fields here are wired to a controlled `AssistantConfig` so step 2 can
 * preserve edits if the user goes back. None of these values are persisted
 * outside the modal — this is a prototype.
 */

export interface AssistantConfig {
  name: string;
  voicePersona: string;
  greeting: string;
  qualifyingQuestions: string[];
  capabilities: Set<Capability>;
  handoffThreshold: HandoffThreshold;
}

export type Capability =
  | 'book-meetings'
  | 'answer-faqs'
  | 'hand-off-warm-leads'
  | 'send-follow-ups';

const CAPABILITY_LABELS: Record<Capability, string> = {
  'book-meetings': 'Book meetings',
  'answer-faqs': 'Answer FAQs',
  'hand-off-warm-leads': 'Hand off warm leads',
  'send-follow-ups': 'Send follow-ups',
};

export type HandoffThreshold = '3-turns' | '5-turns' | 'on-request';

const HANDOFF_LABELS: Record<HandoffThreshold, string> = {
  '3-turns': 'After 3 turns',
  '5-turns': 'After 5 turns',
  'on-request': 'When user asks',
};

const VOICE_OPTIONS = [
  { value: 'warm-professional', label: 'Warm and professional', hint: 'Optimistic, confident, conversational' },
  { value: 'crisp-efficient', label: 'Crisp and efficient', hint: 'Direct, no filler, gets to the point' },
  { value: 'friendly-casual', label: 'Friendly and casual', hint: 'Relaxed, approachable, lightly humorous' },
];

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  name: 'Riley',
  voicePersona: 'warm-professional',
  greeting:
    "Hi! Thanks for reaching out to CertaPro Painters of Austin. I'm Riley, John's AI receptionist. I can line up a free estimate or color consultation — to point you to the right crew, can you tell me a bit about the project?",
  qualifyingQuestions: [
    'Is this for interior, exterior, cabinets, or commercial?',
    'What part of the Austin metro is the property in?',
    'When are you hoping to have the work done?',
  ],
  capabilities: new Set<Capability>([
    'book-meetings',
    'answer-faqs',
    'hand-off-warm-leads',
    'send-follow-ups',
  ]),
  handoffThreshold: '3-turns',
};

interface Step1AssistantProps {
  value: AssistantConfig;
  onChange: (next: AssistantConfig) => void;
  onCancel: () => void;
  onAdvance: () => void;
}

export function Step1Assistant({ value, onChange, onCancel, onAdvance }: Step1AssistantProps) {
  const update = <K extends keyof AssistantConfig>(key: K, next: AssistantConfig[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <>
      <Header />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Field label="Assistant name">
          <TextInput
            value={value.name}
            onChange={(v) => update('name', v)}
            placeholder="Riley"
          />
        </Field>

        <Field label="Voice persona">
          <VoiceSelect
            value={value.voicePersona}
            onChange={(v) => update('voicePersona', v)}
          />
        </Field>

        <Field label="Greeting">
          <Textarea
            value={value.greeting}
            onChange={(v) => update('greeting', v)}
            rows={4}
          />
        </Field>

        <Field label="Qualifying questions">
          <QualifyingQuestionsEditor
            questions={value.qualifyingQuestions}
            onChange={(qs) => update('qualifyingQuestions', qs)}
          />
        </Field>

        <Field label="What it can do">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Object.keys(CAPABILITY_LABELS) as Capability[]).map((c) => (
              <Chip
                key={c}
                size="md"
                selected={value.capabilities.has(c)}
                onSelectionChange={(next) => {
                  const set = new Set(value.capabilities);
                  if (next) set.add(c);
                  else set.delete(c);
                  update('capabilities', set);
                }}
              >
                {CAPABILITY_LABELS[c]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Handoff threshold">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Object.keys(HANDOFF_LABELS) as HandoffThreshold[]).map((h) => (
              <Chip
                key={h}
                size="md"
                selected={value.handoffThreshold === h}
                onSelectionChange={() => update('handoffThreshold', h)}
              >
                {HANDOFF_LABELS[h]}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <Footer>
        <Button variant="ghost" size="md" onPress={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" endIcon={ArrowRight} onPress={onAdvance}>
          Looks good — connect tools
        </Button>
      </Footer>
    </>
  );
}

// ─── Modal-local primitives ──────────────────────────────────────────

function Header() {
  return (
    <div
      style={{
        padding: '24px 32px 20px',
        borderBottom: '1px solid var(--dark-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <Heading level={3} id="ai-receptionist-setup-title" style={{ margin: 0 }}>
        Confirm your AI Receptionist
      </Heading>
      <Text variant="secondary" style={{ lineHeight: 1.5 }}>
        We pre-configured the assistant from your brand profile. Confirm or tweak anything that's off.
      </Text>
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text
        variant="label"
        style={{ color: 'var(--dark-90)', fontWeight: 500, fontSize: 13 }}
      >
        {label}
      </Text>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 38,
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        color: 'var(--dark-90)',
        fontFamily: "'Sohne', sans-serif",
        fontSize: 14,
        outline: 'none',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--dark-90)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--dark-8)')}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        color: 'var(--dark-90)',
        fontFamily: "'Sohne', sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        outline: 'none',
        resize: 'vertical',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--dark-90)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--dark-8)')}
    />
  );
}

function VoiceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const current = VOICE_OPTIONS.find((o) => o.value === value) ?? VOICE_OPTIONS[0]!;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 38,
          padding: '0 12px',
          borderRadius: 8,
          border: '1px solid var(--dark-8)',
          background: 'var(--light-100)',
          color: 'var(--dark-90)',
          fontFamily: "'Sohne', sans-serif",
          fontSize: 14,
          outline: 'none',
          appearance: 'menulist',
        }}
      >
        {VOICE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Text variant="secondary" style={{ fontSize: 12 }}>
        {current.hint}
      </Text>
    </div>
  );
}

function QualifyingQuestionsEditor({
  questions,
  onChange,
}: {
  questions: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const removeAt = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateAt = (index: number, value: string) => {
    onChange(questions.map((q, i) => (i === index ? value : q)));
  };

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...questions, v]);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {questions.map((q, i) => (
        <QuestionRow
          key={i}
          value={q}
          onChange={(v) => updateAt(i, v)}
          onRemove={() => removeAt(i)}
        />
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add another qualifying question"
          style={{
            flex: 1,
            height: 36,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px dashed var(--dark-15)',
            background: 'var(--light-100)',
            color: 'var(--dark-90)',
            fontFamily: "'Sohne', sans-serif",
            fontSize: 14,
            outline: 'none',
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          onPress={add}
          isDisabled={draft.trim().length === 0}
        >
          Add question
        </Button>
      </div>
    </div>
  );
}

function QuestionRow({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px 6px 12px',
        borderRadius: 999,
        border: '1px solid var(--dark-8)',
        background: 'var(--dark-2)',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          height: 24,
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: 'var(--dark-90)',
          fontFamily: "'Sohne', sans-serif",
          fontSize: 14,
          outline: 'none',
        }}
      />
      <button
        type="button"
        aria-label="Remove question"
        onClick={onRemove}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--dark-8)',
          color: 'var(--dark-60)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <Close size={12} />
      </button>
    </div>
  );
}
