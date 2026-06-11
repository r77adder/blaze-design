import { useEffect, type CSSProperties } from 'react';
import { Text } from '@/components';
import Check2 from '@/icons/20/Check2';
import AlertTriangle from '@/icons/20/AlertTriangle';
import XCircleContained from '@/icons/20/XCircleContained';
import type { PreflightCheck, PreflightStatus } from './types';

/**
 * Renders the result of runPreflight() — traffic-light items with optional
 * 1-click fixes. Side-effect: writes `launchBlocked` to context whenever any
 * red item is present so the modal footer can disable the Launch button.
 */
export function PreflightChecklist({
  checks,
  hasRedBlocker,
  greenCount,
  attentionCount,
  onLaunchBlockedChange,
}: {
  checks: PreflightCheck[];
  hasRedBlocker: boolean;
  greenCount: number;
  attentionCount: number;
  onLaunchBlockedChange: (blocked: boolean) => void;
}) {
  useEffect(() => {
    onLaunchBlockedChange(hasRedBlocker);
  }, [hasRedBlocker, onLaunchBlockedChange]);

  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          padding: '14px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Text style={{ color: 'var(--dark-90)', fontSize: 14, fontWeight: 500 }}>
          Pre-launch checks
        </Text>
        <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
          {greenCount} ready
          {attentionCount > 0 && ` · ${attentionCount} need${attentionCount === 1 ? 's' : ''} attention`}
        </Text>
      </div>

      {/* items */}
      <div>
        {checks.map((c, i) => (
          <ChecklistRow key={c.id} check={c} isLast={i === checks.length - 1} />
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({ check, isLast }: { check: PreflightCheck; isLast: boolean }) {
  const tone = TONE_STYLES[check.status];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--dark-8)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          flexShrink: 0,
          color: tone.color,
          marginTop: 1,
        }}
      >
        {check.status === 'green' && <Check2 size={16} color="currentColor" />}
        {check.status === 'amber' && <AlertTriangle size={16} color="currentColor" />}
        {check.status === 'red' && <XCircleContained size={16} color="currentColor" />}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text
          style={{
            color: check.status === 'green' ? 'var(--dark-60)' : 'var(--dark-90)',
            fontSize: 13,
            fontWeight: check.status === 'green' ? 400 : 500,
            display: 'block',
          }}
        >
          {check.label}
        </Text>
        {check.detail && (
          <Text variant="secondary" style={{ color: 'var(--dark-60)', display: 'block' }}>
            {check.detail}
          </Text>
        )}
      </div>
      {check.fix && check.fixLabel && (
        <button type="button" onClick={check.fix} style={fixButtonStyle}>
          {check.fixLabel}
        </button>
      )}
    </div>
  );
}

const TONE_STYLES: Record<PreflightStatus, { color: string }> = {
  green: { color: 'var(--status-approved)' },
  amber: { color: 'var(--status-connect)' },
  red: { color: 'var(--red-70)' },
};

const fixButtonStyle: CSSProperties = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  color: 'var(--dark-90)',
  fontFamily: 'inherit',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
};
