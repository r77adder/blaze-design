import { useState, type CSSProperties } from 'react';
import { Heading, Text } from '@/components';
import { Toggle } from '@/staging';
import ShieldChecked from '@/icons/20/ShieldChecked';
import ChevronDown from '@/icons/20/ChevronDown';
import ChevronRightSmall from '@/icons/20/ChevronRightSmall';
import type { SafetyNetConfig, SafetyRule } from './types';

/**
 * Expandable card that lets the user toggle and tune the three safety-net
 * rules — auto-pause on high CPR, hard cap on weekly spend, and CTR alert.
 * Mirrors itself in two modes:
 *   - "wizard" (default): used on Step 5, header reads "Safety net" with
 *     Customize-to-expand affordance.
 *   - "compact": used on the campaign detail page, no chrome heading because
 *     it lives inside its own SectionCard.
 */
export function SafetyNetEditor({
  value,
  onChange,
  mode = 'wizard',
  defaultOpen = false,
}: {
  value: SafetyNetConfig;
  onChange: (next: SafetyNetConfig) => void;
  mode?: 'wizard' | 'compact';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || mode === 'compact');

  const activeCount = [
    value.pauseCprAbove.enabled,
    value.capWeeklySpend.enabled,
    value.alertCtrBelow.enabled,
  ].filter(Boolean).length;

  const updateRule = <K extends keyof SafetyNetConfig>(key: K, patch: Partial<SafetyRule>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: mode === 'compact' ? 10 : 14,
        overflow: 'hidden',
      }}
    >
      {mode === 'wizard' && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={headerButtonStyle}
        >
          <ShieldChecked size={16} color="var(--dark-60)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0, textAlign: 'left' }}>
            <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500, display: 'block' }}>
              Safety net
            </Text>
            <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block' }}>
              {activeCount === 0
                ? 'No rules active — Blaze won’t intervene'
                : `${activeCount} rule${activeCount === 1 ? '' : 's'} active · ${summarizeActive(value)}`}
            </Text>
          </div>
          <span style={{ color: 'var(--dark-60)', display: 'inline-flex' }}>
            {open ? <ChevronDown size={16} /> : <ChevronRightSmall size={16} />}
          </span>
        </button>
      )}

      {open && (
        <div style={{ borderTop: mode === 'wizard' ? '1px solid var(--dark-8)' : 'none' }}>
          <RuleRow
            label="Auto-pause an ad if cost per lead rises above"
            tone="warning"
            rule={value.pauseCprAbove}
            unit="$"
            unitPosition="prefix"
            suffixText=" for 3 days"
            onChange={(patch) => updateRule('pauseCprAbove', patch)}
          />
          <RuleRow
            label="Cap total weekly spend at"
            tone="approved"
            rule={value.capWeeklySpend}
            unit="$"
            unitPosition="prefix"
            onChange={(patch) => updateRule('capWeeklySpend', patch)}
          />
          <RuleRow
            label="Alert me when an ad’s CTR drops below"
            tone="approved"
            rule={value.alertCtrBelow}
            unit="%"
            unitPosition="suffix"
            step={0.1}
            onChange={(patch) => updateRule('alertCtrBelow', patch)}
            isLast
          />
        </div>
      )}
    </div>
  );
}

function RuleRow({
  label,
  rule,
  unit,
  unitPosition,
  suffixText,
  step = 1,
  isLast,
  onChange,
}: {
  label: string;
  tone: 'approved' | 'warning';
  rule: SafetyRule;
  unit: '$' | '%';
  unitPosition: 'prefix' | 'suffix';
  suffixText?: string;
  step?: number;
  isLast?: boolean;
  onChange: (patch: Partial<SafetyRule>) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
        opacity: rule.enabled ? 1 : 0.55,
        transition: 'opacity 120ms ease',
      }}
    >
      <Toggle
        checked={rule.enabled}
        onChange={(next) => onChange({ enabled: next })}
        aria-label={label}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text style={{ color: 'var(--dark-90)', fontSize: 14, lineHeight: 1.4 }}>
          {label}
        </Text>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {unitPosition === 'prefix' && (
            <span style={{ color: 'var(--dark-60)', fontSize: 14 }}>{unit}</span>
          )}
          <input
            type="number"
            value={rule.threshold}
            step={step}
            disabled={!rule.enabled}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!Number.isFinite(num)) return;
              onChange({ threshold: num });
            }}
            style={thresholdInputStyle}
          />
          {unitPosition === 'suffix' && (
            <span style={{ color: 'var(--dark-60)', fontSize: 14 }}>{unit}</span>
          )}
        </span>
        {suffixText && (
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {suffixText}
          </Text>
        )}
      </div>
    </div>
  );
}

function summarizeActive(config: SafetyNetConfig): string {
  const parts: string[] = [];
  if (config.pauseCprAbove.enabled) parts.push(`pause >$${config.pauseCprAbove.threshold} CPR`);
  if (config.capWeeklySpend.enabled) parts.push(`cap $${config.capWeeklySpend.threshold}/wk`);
  if (config.alertCtrBelow.enabled) parts.push(`alert <${config.alertCtrBelow.threshold}% CTR`);
  return parts.join(' · ');
}

const headerButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '14px 16px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const thresholdInputStyle: CSSProperties = {
  width: 72,
  padding: '6px 8px',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 6,
  fontFamily: "'Sohne', sans-serif",
  fontSize: 14,
  color: 'var(--dark-90)',
  outline: 'none',
  textAlign: 'center',
};
