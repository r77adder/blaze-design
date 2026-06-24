import type { CSSProperties, ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { Chip, StatusPill, TabChip, TextField, Toggle } from '@/staging';
import Target5 from '@/icons/20/Target5';
import CurrencyDollar from '@/icons/20/CurrencyDollar';
import Refresh01 from '@/icons/20/Refresh01';
import Calendar1 from '@/icons/20/Calendar1';
import { useMetaCampaign } from '../meta-campaign-context';
import {
  BID_STRATEGY_LABEL,
  BID_STRATEGY_NEEDS_TARGET,
  BID_STRATEGY_ORDER,
  OBJECTIVE_DESCRIPTION,
  OBJECTIVE_LABEL,
  OBJECTIVE_ORDER,
  SPECIAL_AD_CATEGORY_LABEL,
  SPECIAL_AD_CATEGORY_ORDER,
  type BidStrategy,
  type BudgetType,
  type CampaignObjective,
  type SpecialAdCategory,
} from '../concept/types';

/** Blaze's recommended objective for the painters scenario — used to flag
 *  the suggested choice in the objective grid. */
const RECOMMENDED_OBJECTIVE: CampaignObjective = 'leads';

const DAILY_OPTIONS = [60, 90, 150];
const LIFETIME_OPTIONS = [1800, 2700, 4500];

/** Stage 1 — Campaign basics: name, topic, objective, special-ad category,
 *  budget (daily/lifetime), bid strategy. Audience and destination URL move
 *  to Stage 2 (Ad set) to match Meta's actual setup hierarchy. */
export function Stage1Campaign() {
  const { draft, setDraft, regenerateTopic } = useMetaCampaign();

  const budgetOptions = draft.budgetType === 'daily' ? DAILY_OPTIONS : LIFETIME_OPTIONS;
  const budgetSuffix = draft.budgetType === 'daily' ? '/day' : ' total';
  const estLeads =
    draft.budgetType === 'daily'
      ? Math.round((draft.budgetAmount * 30) / 78)
      : Math.round(draft.budgetAmount / 78);

  return (
    <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
      <Heading level={2} style={{ margin: '0 0 6px' }}>
        Set up the campaign
      </Heading>
      <Text variant="secondary" style={{ display: 'block', marginBottom: 28 }}>
        Blaze drafted this from your best-performing channels and current Austin
        demand — adjust anything. Campaign-level decisions live here (topic,
        budget, bidding); the ad set and creative come next.
      </Text>

      <Field label="Campaign name">
        <TextField
          fullWidth
          value={draft.name}
          onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
        />
      </Field>

      <Field
        label={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>What is this campaign about?</span>
            <Button variant="ghost" size="xs" frontIcon={Refresh01} onPress={regenerateTopic}>
              Regenerate
            </Button>
          </span>
        }
      >
        <textarea
          value={draft.campaignTopic}
          onChange={(e) => setDraft((p) => ({ ...p, campaignTopic: e.target.value }))}
          rows={3}
          style={{ ...inputStyle, minHeight: 86, padding: 14, resize: 'vertical', lineHeight: 1.55 }}
        />
      </Field>

      <SectionLabel icon={<Target5 size={16} color="var(--dark-60)" />}>
        Objective
      </SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {OBJECTIVE_ORDER.map((id) => {
          const selected = draft.objective === id;
          const isRecommended = id === RECOMMENDED_OBJECTIVE;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDraft((p) => ({ ...p, objective: id }))}
              style={{
                textAlign: 'left',
                background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 12,
                padding: 16,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition: 'background-color 120ms ease, border-color 120ms ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)' }}>
                  {OBJECTIVE_LABEL[id]}
                </span>
                {isRecommended && (
                  <StatusPill tone="accent" size="sm">
                    Recommended
                  </StatusPill>
                )}
              </span>
              <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
                {OBJECTIVE_DESCRIPTION[id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Special ad categories — Yes/No toggle reveals the 4 sub-checkboxes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '14px 16px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500, display: 'block' }}>
              Special ad categories
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block' }}>
              Declare if these ads relate to credit, employment, housing, or
              social / political topics. Meta restricts targeting when any are
              selected.
            </Text>
          </div>
          <Toggle
            checked={draft.specialAdCategories.length > 0}
            onChange={(next) =>
              setDraft((p) => ({
                ...p,
                specialAdCategories: next ? p.specialAdCategories.length > 0 ? p.specialAdCategories : ['credit'] : [],
              }))
            }
            aria-label="Special ad categories"
          />
        </div>
        {draft.specialAdCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIAL_AD_CATEGORY_ORDER.map((cat) => {
              const checked = draft.specialAdCategories.includes(cat);
              return (
                <Chip
                  key={cat}
                  size="md"
                  selected={checked}
                  onSelectionChange={() =>
                    setDraft((p) => {
                      const has = p.specialAdCategories.includes(cat);
                      const next = has
                        ? p.specialAdCategories.filter((c) => c !== cat)
                        : [...p.specialAdCategories, cat];
                      return { ...p, specialAdCategories: next };
                    })
                  }
                >
                  {SPECIAL_AD_CATEGORY_LABEL[cat]}
                </Chip>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget type */}
      <SectionLabel icon={<CurrencyDollar size={16} color="var(--dark-60)" />}>
        Budget
      </SectionLabel>
      <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 14 }}>
        Projected ~{estLeads} estimate requests{draft.budgetType === 'daily' ? ' / month' : ''} at
        ~$78 per lead, based on your category benchmarks.
      </Text>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['daily', 'lifetime'] as BudgetType[]).map((t) => (
          <TabChip
            key={t}
            selected={draft.budgetType === t}
            onSelect={() =>
              setDraft((p) => ({
                ...p,
                budgetType: t,
                // Reset to a sane default whenever switching cadence.
                budgetAmount: t === 'daily' ? 90 : 2700,
              }))
            }
          >
            {t === 'daily' ? 'Daily budget' : 'Lifetime budget'}
          </TabChip>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {budgetOptions.map((amount) => {
          const selected = draft.budgetAmount === amount;
          const blazePick = draft.budgetType === 'daily' ? amount === 90 : amount === 2700;
          return (
            <button
              key={amount}
              type="button"
              onClick={() => setDraft((p) => ({ ...p, budgetAmount: amount }))}
              style={{
                flex: 1,
                background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                color: 'var(--dark-90)',
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 10,
                padding: '14px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'flex-start',
                transition: 'background-color 120ms ease, border-color 120ms ease',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 500 }}>
                ${amount.toLocaleString()}{budgetSuffix}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--dark-60)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {blazePick ? (
                  <StatusPill tone="accent" size="sm">Recommended</StatusPill>
                ) : draft.budgetType === 'daily' ? (
                  `~$${(amount * 30).toLocaleString()}/mo`
                ) : (
                  '~30 day flight'
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bid strategy */}
      <SectionLabel>Bid strategy</SectionLabel>
      <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block', marginBottom: 14 }}>
        Highest volume is Blaze's default. Switch to a goal-bound strategy once
        you have baseline costs.
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: BID_STRATEGY_NEEDS_TARGET[draft.bidStrategy] ? 6 : 28 }}>
        {BID_STRATEGY_ORDER.map((s: BidStrategy) => {
          const selected = draft.bidStrategy === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() =>
                setDraft((p) => ({
                  ...p,
                  bidStrategy: s,
                  // Drop the target value when switching to highest-volume.
                  bidTargetValue: BID_STRATEGY_NEEDS_TARGET[s] ? p.bidTargetValue ?? 75 : undefined,
                }))
              }
              style={{
                textAlign: 'left',
                background: selected ? 'var(--light-100)' : 'var(--dark-2)',
                color: 'var(--dark-90)',
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background-color 120ms ease, border-color 120ms ease',
              }}
            >
              {BID_STRATEGY_LABEL[s]}
            </button>
          );
        })}
      </div>
      {BID_STRATEGY_NEEDS_TARGET[draft.bidStrategy] && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--dark-60)', letterSpacing: '0.24px' }}>
            {draft.bidStrategy === 'roas-goal' ? 'Target ROAS' : 'Target value'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {draft.bidStrategy !== 'roas-goal' && (
              <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>$</span>
            )}
            <TextField
              type="number"
              min={0}
              step={draft.bidStrategy === 'roas-goal' ? 0.1 : 1}
              size="sm"
              value={draft.bidTargetValue ?? ''}
              onChange={(v) =>
                setDraft((p) => ({
                  ...p,
                  bidTargetValue: v === '' ? undefined : Number(v),
                }))
              }
              style={{ width: 100 }}
            />
            {draft.bidStrategy === 'roas-goal' && (
              <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>x</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
              {draft.bidStrategy === 'cost-per-result-goal'
                ? 'per result'
                : draft.bidStrategy === 'roas-goal'
                  ? 'return on ad spend'
                  : 'max bid'}
            </span>
          </span>
        </div>
      )}

      {/* Schedule */}
      <SectionLabel icon={<Calendar1 size={16} color="var(--dark-60)" />}>
        Schedule
      </SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Start date">
          <TextField
            type="date"
            fullWidth
            value={draft.schedule.startsAt}
            onChange={(v) =>
              setDraft((p) => ({
                ...p,
                schedule: { ...p.schedule, startsAt: v },
              }))
            }
          />
        </Field>
        <Field
          label={
            draft.budgetType === 'lifetime'
              ? 'End date (required)'
              : 'End date (optional — leave blank for ongoing)'
          }
        >
          <TextField
            type="date"
            fullWidth
            value={draft.schedule.endsAt ?? ''}
            onChange={(v) =>
              setDraft((p) => ({
                ...p,
                schedule: {
                  ...p.schedule,
                  endsAt: v === '' ? undefined : v,
                },
              }))
            }
          />
        </Field>
      </div>
    </div>
  );
}

// ─── LOCAL HELPERS ───────────────────────────────────────────────────────

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
      <span style={{ fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', fontWeight: 400 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon}
      <Heading level={3} style={{ margin: 0, color: 'var(--dark-90)' }}>
        {children}
      </Heading>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  fontFamily: "'Sohne', sans-serif",
  fontSize: 14,
  letterSpacing: '0.28px',
  color: 'var(--dark-90)',
  outline: 'none',
};
