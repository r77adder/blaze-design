import { type ComponentType } from 'react';
import { Button, Heading, Text } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import Calendar1 from '@/icons/20/Calendar1';
import FileSearch1 from '@/icons/20/FileSearch1';
import Stars from '@/icons/20/Stars';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Templates from '@/icons/20/Templates';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Star from '@/icons/20/Star';
import Check2 from '@/icons/20/Check2';
import { ALL_TOOLS, TOOL_LABEL, type ToolId } from '../../tools-context';
import { useOnboarding } from '../onboarding-context';
import { GAP_AND_FIX } from '../gap-and-fix-data';

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number; color?: string }>> = {
  'Organic Campaigns': Calendar1,
  SEO: FileSearch1,
  AEO: Stars,
  'UGC Content': UserProfileCircle,
  'Paid Social': Cursor04,
  'Paid Search': Google,
  'Landing Pages': Templates,
  SDR: UserProfileGroup,
  Reputation: Star,
};

export function Step5Strategy() {
  const { selectedTools, toggleTool, next, back, profile } = useOnboarding();
  const selectedCount = selectedTools.length;

  return (
    <div style={{ padding: '64px 24px 120px', maxWidth: 900, margin: '0 auto' }}>
      <Heading
        level={1}
        style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}
      >
        Here's how Blaze fixes the gaps
      </Heading>
      <Text
        variant="primary"
        style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 32 }}
      >
        Based on your scorecard, we recommend these {ALL_TOOLS.length} features. Opt out of any
        you don't want — pricing on the next step adjusts automatically.
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {ALL_TOOLS.map((id) => (
          <FeatureCard
            key={id}
            id={id}
            selected={selectedTools.includes(id)}
            onToggle={() => toggleTool(id)}
          />
        ))}
      </div>

      {/* footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <button
          type="button"
          onClick={back}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 14,
            color: 'var(--dark-90)',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
            {selectedCount} feature{selectedCount === 1 ? '' : 's'} selected for {profile.name}
          </Text>
          <Button
            variant="primary"
            size="lg"
            isDisabled={selectedCount === 0}
            onPress={next}
            endIcon={ArrowRight}
          >
            See pricing
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  id,
  selected,
  onToggle,
}: {
  id: ToolId;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = TOOL_ICONS[id];
  const { gap, fix } = GAP_AND_FIX[id];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 22,
        background: 'var(--light-100)',
        border: `1px solid ${selected ? 'var(--dark-15)' : 'var(--dark-4)'}`,
        borderRadius: 14,
        transition: 'border-color 160ms ease',
      }}
    >
      {/* Header row — icon + title on the left, toggle on the right. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--dark-4)',
            color: 'var(--dark-90)',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color="var(--dark-90)" />
        </span>
        <Heading
          level={4}
          style={{ margin: 0, lineHeight: 1.25, flex: 1, minWidth: 0 }}
        >
          {TOOL_LABEL[id]}
        </Heading>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            opacity: selected ? 1 : 0.4,
            transition: 'opacity 160ms ease',
          }}
        >
          <Toggle on={selected} onPress={onToggle} />
        </div>
      </div>

      {/* Gap — always active. Keeping the problem visible even when the
          user opts out makes the trade-off explicit. */}
      <NarrativeLine label="Gap" tone="warn" body={gap} />

      {/* Fix — dimmed alongside the toggle when the feature is off. */}
      <div
        style={{
          opacity: selected ? 1 : 0.4,
          transition: 'opacity 160ms ease',
        }}
      >
        <NarrativeLine label="Fix" tone="ok" body={fix} />
      </div>
    </div>
  );
}

function NarrativeLine({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: 'warn' | 'ok';
}) {
  const accent = tone === 'warn' ? 'var(--red-70)' : '#04af00';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', columnGap: 12 }}>
      <Text
        variant="primary"
        style={{
          color: accent,
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.5,
        }}
      >
        {label}
      </Text>
      <Text
        variant="primary"
        style={{
          color: 'var(--dark-90)',
          fontSize: 16,
          lineHeight: 1.45,
          letterSpacing: '-0.1px',
        }}
      >
        {body}
      </Text>
    </div>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onPress}
      style={{
        position: 'relative',
        width: 44,
        height: 24,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        background: on ? 'var(--dark-90)' : 'var(--dark-15)',
        transition: 'background-color 160ms ease',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--light-100)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 160ms ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {on && <Check2 size={12} color="var(--dark-90)" />}
      </span>
    </button>
  );
}
