import { useEffect, useMemo, useState } from 'react';
import { Button, Heading, IconButton, Modal, Text, useModals, type StackModalProps } from '@/components';
import { Callout, Checkbox, Chip, SegmentedControl, Select, StatusPill, useToast } from '@/staging';
import type { StatusPillTone } from '@/staging';
import AlertTriangle from '@/icons/20/AlertTriangle';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronUp from '@/icons/20/ChevronUp';
import Copy from '@/icons/20/Copy';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import {
  FieldLabel,
  NumberField,
  RadioCard,
  SectionShell,
  TextareaField,
  inputFocusProps,
  largeInputStyle,
  textInputStyle,
} from './SettingsFormControls';
import {
  DEFAULT_QUALIFICATION_QUESTIONS,
  RESPONSE_FORMATS,
  THRESHOLD_OPERATORS,
  blankQuestion,
  evaluateQualification,
  generateCollectionPrompt,
  generateQualificationPrompt,
  systemPromptIsInSync,
  validateResponse,
  type QualificationMode,
  type QualificationQuestion,
  type QualificationRule,
  type QuestionType,
  type ResponseFormat,
  type ThresholdOperator,
} from '../qualification-criteria-data';

// ══════════════════════════════════════════════════════════════════════════
// AGENT TAB — Qualification criteria
//
// A builder for the questions the agent asks to qualify a lead. Drives three
// surfaces from one list of questions: the row list below, the two copyable
// system-prompt snippets, and the website prequalification form sync.
// ══════════════════════════════════════════════════════════════════════════

export function QualificationCriteriaSection({ systemPrompt }: { systemPrompt: string }) {
  const { showToast } = useToast();
  const { openModal } = useModals();
  const [questions, setQuestions] = useState<QualificationQuestion[]>(DEFAULT_QUALIFICATION_QUESTIONS);
  const [formActive, setFormActive] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  // Snapshot of the questions as of the last sync — compared against the live
  // `questions` list to detect drift (edits made after the form was synced).
  const [syncedQuestions, setSyncedQuestions] = useState<QualificationQuestion[] | null>(null);

  const openEdit = (nextQuestions: QualificationQuestion[], initialId: string, isNew: boolean) => {
    openModal(QuestionEditModalRoute, { initialQuestions: nextQuestions, initialId, isNew, onSave: setQuestions });
  };
  const handleRowClick = (id: string) => openEdit(questions, id, false);
  const handleAdd = () => {
    const next = blankQuestion();
    openEdit([...questions, next], next.id, true);
  };
  const removeQuestion = (id: string) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  const collectionPrompt = useMemo(() => generateCollectionPrompt(questions), [questions]);
  const qualificationPrompt = useMemo(() => generateQualificationPrompt(questions), [questions]);
  const promptInSync = useMemo(() => systemPromptIsInSync(systemPrompt, questions), [systemPrompt, questions]);
  const formInSync = !formActive || JSON.stringify(questions) === JSON.stringify(syncedQuestions);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({ message: `${label} copied to clipboard` });
  };

  const handleActivate = () => {
    setFormActive(true);
    setSyncedQuestions(questions);
    setSyncedAt(new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    showToast({ message: 'Website prequalification form updated' });
  };

  return (
    <SectionShell
      title="Qualification criteria"
      sub="Questions the agent asks to qualify a lead. These inform the system prompt across voice, SMS, and chat, and the prequalification form on your website."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ border: '1px solid var(--dark-8)', borderRadius: 10, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 220px 40px', gap: 12, padding: '10px 14px',
              background: 'var(--dark-2)', borderBottom: '1px solid var(--dark-8)', fontSize: 14, color: 'var(--dark-60)',
            }}
          >
            <span>Question</span>
            <span>Qualifies when</span>
            <span aria-hidden />
          </div>
          {questions.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>No qualification questions yet.</Text>
            </div>
          )}
          {questions.map((q, i) => {
            const summary = ruleSummary(q);
            return (
              <div
                key={q.id}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(q.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(q.id); } }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 220px 40px', padding: '14px', alignItems: 'center', gap: 12,
                  borderBottom: i === questions.length - 1 ? 'none' : '1px solid var(--dark-8)',
                  cursor: 'pointer', transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--dark-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ minWidth: 0 }}>
                  <Heading level={5} style={{ margin: 0 }}>{q.label || 'Untitled question'}</Heading>
                  <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
                    {q.type === 'multiple-choice'
                      ? `Multiple choice · ${q.options.length} option${q.options.length === 1 ? '' : 's'}`
                      : `Freeform · ${RESPONSE_FORMATS.find((f) => f.id === q.responseFormat)?.label}`}
                  </Text>
                </div>
                <div style={{ minWidth: 0 }}>
                  <StatusPill tone={summary.tone} size="sm">{summary.label}</StatusPill>
                </div>
                <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex' }}>
                  <IconButton variant="tertiary" size="sm" icon={Trash2} aria-label="Remove question" onPress={() => removeQuestion(q.id)} />
                </span>
              </div>
            );
          })}
        </div>
        <div>
          <Button variant="secondary" size="md" frontIcon={Plus} onPress={handleAdd}>
            Add question
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
        {!promptInSync && (
          <Callout tone="warning" icon={AlertTriangle} title="System prompt is out of sync">
            The agent's system prompt above doesn't include these instructions yet — copy the snippets below into it so the agent actually asks and evaluates these questions.
          </Callout>
        )}
        <PromptSnippetBlock
          title="Information collection prompt"
          description="Paste into the system prompt above to tell the agent what to ask and how to validate each answer."
          code={collectionPrompt}
          onCopy={() => copy(collectionPrompt, 'Information collection prompt')}
        />
        <PromptSnippetBlock
          title="Qualification evaluation prompt"
          description="Paste into the system prompt above to tell the agent how to decide whether a lead is qualified."
          code={qualificationPrompt}
          onCopy={() => copy(qualificationPrompt, 'Qualification evaluation prompt')}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
        <div
          style={{
            padding: 16, border: '1px solid var(--dark-8)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heading level={5} style={{ margin: 0 }}>Website prequalification form</Heading>
              {formActive && <StatusPill tone={formInSync ? 'success' : 'warning'} size="sm">{formInSync ? 'Active' : 'Out of sync'}</StatusPill>}
            </div>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>
              {formActive
                ? `Synced ${syncedQuestions?.length ?? 0} question${syncedQuestions?.length === 1 ? '' : 's'} to your website form${syncedAt ? ` · Last synced ${syncedAt}` : ''}.`
                : `Automatically update the form on your website to collect responses to these ${questions.length} question${questions.length === 1 ? '' : 's'}.`}
            </Text>
          </div>
          <Button
            variant={formActive ? 'secondary' : 'primary'}
            frontIcon={formActive ? ArrowRefresh : undefined}
            onPress={handleActivate}
            isDisabled={questions.length === 0}
          >
            {formActive ? 'Re-sync form' : 'Activate'}
          </Button>
        </div>
        {formActive && !formInSync && (
          <Callout tone="warning" icon={AlertTriangle} title="Website form is out of sync">
            Questions have changed since this form was last synced — re-sync so the live form matches the list above.
          </Callout>
        )}
      </div>
    </SectionShell>
  );
}

// ── Row summary ──────────────────────────────────────────────────────────

function ruleSummary(q: QualificationQuestion): { label: string; tone: StatusPillTone } {
  const rule = q.rule;
  switch (rule.mode) {
    case 'all':
      return { label: 'All responses qualify', tone: 'neutral' };
    case 'threshold': {
      const op = THRESHOLD_OPERATORS.find((o) => o.id === rule.operator)?.symbol ?? rule.operator;
      const amount = q.responseFormat === 'currency' ? `$${rule.threshold.toLocaleString()}` : rule.threshold;
      return { label: `Qualifies ${op} ${amount}`, tone: 'accent' };
    }
    case 'allowed-list':
      return { label: `Must match ${rule.allowedValues.filter(Boolean).length} allowed value(s)`, tone: 'accent' };
    case 'selected-options':
      return { label: `${rule.qualifyingOptions.length} of ${q.options.length} options qualify`, tone: 'accent' };
  }
}

// ── Prompt snippet block ─────────────────────────────────────────────────

function PromptSnippetBlock({
  title,
  description,
  code,
  onCopy,
}: {
  title: string;
  description: string;
  code: string;
  onCopy: () => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Heading level={5} style={{ margin: 0 }}>{title}</Heading>
          <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginTop: 2 }}>{description}</Text>
        </div>
        <Button variant="secondary" size="sm" frontIcon={Copy} onPress={onCopy} isDisabled={!code}>
          Copy
        </Button>
      </div>
      <pre
        style={{
          margin: 0, padding: 16, background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 13, lineHeight: 1.6,
          color: 'var(--dark-80)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 280, overflowY: 'auto',
        }}
      >
        {code || 'Add at least one question above to generate this snippet.'}
      </pre>
    </div>
  );
}

// ── Question edit modal ──────────────────────────────────────────────────

function availableModes(q: QualificationQuestion): { id: QualificationMode; title: string; description: string }[] {
  if (q.type === 'multiple-choice') {
    return [
      { id: 'all', title: 'All responses qualify', description: 'Any option the caller picks counts as qualified.' },
      { id: 'selected-options', title: 'Only some options qualify', description: 'Choose which options count as qualified below.' },
    ];
  }
  const modes: { id: QualificationMode; title: string; description: string }[] = [
    { id: 'all', title: 'All responses qualify', description: 'Any answer counts as qualified — useful for contact info like name or phone.' },
  ];
  if (q.responseFormat === 'number' || q.responseFormat === 'currency') {
    modes.push({ id: 'threshold', title: 'Numeric threshold', description: 'Qualifies only if the value compares a certain way to a number you set.' });
  }
  modes.push({ id: 'allowed-list', title: 'Must match an allowed list', description: 'Qualifies only if the response is in a list you define — e.g. a service-area zip code list.' });
  return modes;
}

function QuestionEditModalRoute({
  close,
  initialQuestions,
  initialId,
  isNew,
  onSave,
}: StackModalProps & {
  initialQuestions: QualificationQuestion[];
  initialId: string;
  isNew: boolean;
  onSave: (questions: QualificationQuestion[]) => void;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentId, setCurrentId] = useState(initialId);
  const index = questions.findIndex((q) => q.id === currentId);
  const question = index >= 0 ? questions[index] : undefined;

  useEffect(() => { if (!question) close(); }, [question, close]);
  if (!question) return null;

  const update = (mut: (q: QualificationQuestion) => QualificationQuestion) =>
    setQuestions((qs) => qs.map((q) => (q.id === currentId ? mut(q) : q)));
  const updateRule = (mut: (r: QualificationRule) => QualificationRule) =>
    update((q) => ({ ...q, rule: mut(q.rule) }));
  const handleSave = () => { onSave(questions); close(); };
  const handleDelete = () => { onSave(questions.filter((q) => q.id !== currentId)); close(); };
  const onPrev = index > 0 ? () => setCurrentId(questions[index - 1].id) : undefined;
  const onNext = index < questions.length - 1 ? () => setCurrentId(questions[index + 1].id) : undefined;

  const handleTypeChange = (type: QuestionType) => update((q) => ({ ...q, type, rule: { ...q.rule, mode: 'all' } }));
  const handleFormatChange = (responseFormat: ResponseFormat) =>
    update((q) => ({
      ...q,
      responseFormat,
      rule: q.rule.mode === 'threshold' && responseFormat !== 'number' && responseFormat !== 'currency'
        ? { ...q.rule, mode: 'all' }
        : q.rule,
    }));

  const modes = availableModes(question);

  const headerActions = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <IconButton icon={ChevronUp} size="sm" variant="tertiary" isDisabled={!onPrev} onPress={() => onPrev?.()} aria-label="Previous question" />
      <IconButton icon={ChevronDown} size="sm" variant="tertiary" isDisabled={!onNext} onPress={() => onNext?.()} aria-label="Next question" />
      <Text variant="secondary" style={{ color: 'var(--dark-60)', whiteSpace: 'nowrap', margin: '0 4px' }}>
        {index + 1} of {questions.length}
      </Text>
    </div>
  );

  return (
    <Modal.Root size="md" onPressOutside={close}>
      <Modal.Header title={isNew ? 'New qualification question' : 'Qualification question'} onClose={close} actions={isNew ? undefined : headerActions} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Heading level={4} style={{ marginBottom: 8 }}>Question</Heading>
            <input
              {...inputFocusProps}
              type="text"
              value={question.label}
              onChange={(e) => update((q) => ({ ...q, label: e.target.value }))}
              placeholder="e.g. What is your zip code?"
              aria-label="Question"
              autoFocus
              style={largeInputStyle}
            />
          </div>

          <div>
            <Heading level={4} style={{ marginBottom: 8 }}>Response type</Heading>
            <SegmentedControl
              value={question.type}
              onChange={(v) => handleTypeChange(v as QuestionType)}
              options={[{ value: 'freeform', label: 'Freeform' }, { value: 'multiple-choice', label: 'Multiple choice' }]}
              aria-label="Response type"
            />
          </div>

          {question.type === 'freeform' ? (
            <div>
              <Heading level={4} style={{ marginBottom: 8 }}>Expected format</Heading>
              <Select
                value={question.responseFormat}
                onChange={(v) => handleFormatChange(v as ResponseFormat)}
                options={RESPONSE_FORMATS.map((f) => ({ value: f.id, label: f.label }))}
                aria-label="Expected format"
                size="lg"
                style={{ width: '33.333%' }}
              />
            </div>
          ) : (
            <div>
              <Heading level={4} style={{ marginBottom: 8 }}>Options</Heading>
              <OptionsEditor
                options={question.options}
                onChange={(options) => update((q) => ({
                  ...q,
                  options,
                  rule: { ...q.rule, qualifyingOptions: q.rule.qualifyingOptions.filter((o) => options.includes(o)) },
                }))}
              />
            </div>
          )}

          <div>
            <Heading level={4} style={{ marginBottom: 8 }}>Qualifies when</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modes.map((m) => (
                <RadioCard
                  key={m.id}
                  selected={question.rule.mode === m.id}
                  onClick={() => updateRule((r) => ({ ...r, mode: m.id }))}
                  title={m.title}
                  description={m.description}
                  titleLevel={5}
                />
              ))}
            </div>

            {question.rule.mode === 'threshold' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Comparison</FieldLabel>
                  <Select
                    value={question.rule.operator}
                    onChange={(v) => updateRule((r) => ({ ...r, operator: v as ThresholdOperator }))}
                    options={THRESHOLD_OPERATORS.map((o) => ({ value: o.id, label: o.label }))}
                    aria-label="Comparison"
                    fullWidth
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <NumberField
                    label={question.responseFormat === 'currency' ? 'Threshold ($)' : 'Threshold'}
                    value={question.rule.threshold}
                    onChange={(v) => updateRule((r) => ({ ...r, threshold: v }))}
                    min={0}
                  />
                </div>
              </div>
            )}

            {question.rule.mode === 'allowed-list' && (
              <div style={{ marginTop: 12 }}>
                <TextareaField
                  label="Allowed values"
                  value={question.rule.allowedValues.join(', ')}
                  onChange={(v) => updateRule((r) => ({ ...r, allowedValues: v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) }))}
                  rows={3}
                  placeholder="e.g. 78701, 78702, 78703"
                />
              </div>
            )}

            {question.rule.mode === 'selected-options' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {question.options.length === 0 ? (
                  <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>Add at least one option above first.</Text>
                ) : (
                  question.options.map((opt) => (
                    <Checkbox
                      key={opt}
                      checked={question.rule.qualifyingOptions.includes(opt)}
                      onChange={(next) => updateRule((r) => ({
                        ...r,
                        qualifyingOptions: next ? [...r.qualifyingOptions, opt] : r.qualifyingOptions.filter((o) => o !== opt),
                      }))}
                    >
                      {opt}
                    </Checkbox>
                  ))
                )}
              </div>
            )}
          </div>

          <TestResponse key={question.id} question={question} />
        </div>
      </Modal.Content>
      <Modal.Footer>
        {!isNew && (
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="tertiary" size="md" frontIcon={Trash2} onPress={handleDelete}>
              Delete question
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

// ── Options editor (multiple choice) ──────────────────────────────────────

function OptionsEditor({ options, onChange }: { options: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || options.some((o) => o.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    onChange([...options, v]);
    setDraft('');
  };
  return (
    <div>
      {options.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {options.map((opt) => (
            <Chip key={opt} deletable onDelete={() => onChange(options.filter((o) => o !== opt))}>{opt}</Chip>
          ))}
        </div>
      )}
      <input
        {...inputFocusProps}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder="e.g. Hardwood floor"
        aria-label="New option"
        style={{ ...textInputStyle, maxWidth: 240 }}
      />
      <div style={{ marginTop: 12 }}>
        <Button variant="secondary" size="sm" frontIcon={Plus} onPress={add} isDisabled={!draft.trim()}>
          Add option
        </Button>
      </div>
    </div>
  );
}

// ── Test a response ────────────────────────────────────────────────────────

function TestResponse({ question }: { question: QualificationQuestion }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<ReturnType<typeof runCheck> | null>(null);

  const run = () => setResult(runCheck(question, value));

  return (
    <div style={{ padding: 16, background: 'var(--dark-2)', borderRadius: 10 }}>
      <FieldLabel>Test a response</FieldLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: result ? 12 : 0 }}>
        {question.type === 'multiple-choice' ? (
          <div style={{ flex: 1 }}>
            <Select
              value={value}
              onChange={(v) => { setValue(v); setResult(null); }}
              options={question.options.map((o) => ({ value: o, label: o }))}
              placeholder="Choose a sample answer"
              aria-label="Sample answer"
              fullWidth
            />
          </div>
        ) : (
          <input
            {...inputFocusProps}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setResult(null); }}
            placeholder={RESPONSE_FORMATS.find((f) => f.id === question.responseFormat)?.placeholder}
            aria-label="Sample answer"
            style={{ ...textInputStyle, flex: 1 }}
          />
        )}
        <Button variant="secondary" size="sm" onPress={run} isDisabled={!value.trim()}>Check</Button>
      </div>
      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {!result.validation.valid ? (
            <>
              <StatusPill tone="danger" size="sm">Invalid</StatusPill>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{result.validation.error}</Text>
            </>
          ) : (
            <>
              <StatusPill tone={result.qualification?.qualifies ? 'success' : 'warning'} size="sm">
                {result.qualification?.qualifies ? 'Qualifies' : 'Does not qualify'}
              </StatusPill>
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{result.qualification?.reason}</Text>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function runCheck(question: QualificationQuestion, raw: string) {
  const validation = validateResponse(question, raw);
  const qualification = validation.valid ? evaluateQualification(question, raw) : undefined;
  return { validation, qualification };
}
