import { useState, type ComponentType, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import { TabChip, useToast } from '@/staging';
import Download from '@/icons/20/Download';
import CustomerService from '@/icons/20/CustomerService';
import Marker from '@/icons/20/Marker';
import Bag04 from '@/icons/20/Bag04';
import Calendar1 from '@/icons/20/Calendar1';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Cursor04 from '@/icons/20/Cursor04';
import Templates from '@/icons/20/Templates';
import Star from '@/icons/20/Star';
import Google from '@/icons/20/Google';
import Globe from '@/icons/20/Globe';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import { H2Layout } from '../H2Layout';
import {
  BUSINESS_TYPES,
  CONVERSION_TOOLS,
  DEMAND_GEN_TOOLS,
  TOOL_DESCRIPTIONS,
  TOOL_LABEL,
  useTools,
  type BusinessType,
  type ToolId,
} from '../tools-context';
import { BusinessScorecardBody } from './BusinessScorecard';

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number; color?: string }>> = {
  'Organic Campaigns': Calendar1,
  'SEO/AEO': Globe,
  'UGC Content': UserProfileCircle,
  'Paid Social': Cursor04,
  'Paid Search': Google,
  'Landing Pages': Templates,
  SDR: UserProfileGroup,
  Reputation: Star,
};

const PRESET_ICONS: Record<BusinessType, ComponentType<{ size?: number; color?: string }>> = {
  services: CustomerService,
  local: Marker,
  products: Bag04,
};

// Reserve space at the bottom of the scroll body so the last row isn't
// covered by the fixed Save footer. 96px = 64px footer height + 32px breathing.
const FOOTER_RESERVE_HEIGHT = 96;

type MetaStrategyTab = 'scorecard' | 'tools';

export function ToolsRoute() {
  const [tab, setTab] = useState<MetaStrategyTab>('scorecard');
  const topbarCenter = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <TabChip selected={tab === 'scorecard'} onSelect={() => setTab('scorecard')}>
        Business Scorecard
      </TabChip>
      <TabChip selected={tab === 'tools'} onSelect={() => setTab('tools')}>
        Blaze Products
      </TabChip>
    </div>
  );
  const topbarRight = tab === 'scorecard' ? <ExportPdfButton /> : undefined;
  return (
    <H2Layout title="Meta Strategy" topbarCenter={topbarCenter} topbarRight={topbarRight}>
      {tab === 'scorecard' ? <BusinessScorecardBody /> : <ToolsTabBody />}
      {tab === 'tools' && <SaveFooter />}
    </H2Layout>
  );
}

function ExportPdfButton() {
  const { showToast } = useToast();
  return (
    <Button
      variant="secondary"
      size="md"
      frontIcon={Download}
      onPress={() => showToast({ message: 'PDF export queued — we\'ll email it to you when ready.' })}
    >
      Export to PDF
    </Button>
  );
}

function ToolsTabBody() {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: `8px 4px ${FOOTER_RESERVE_HEIGHT}px`,
      }}
    >
      <Intro />
      <PresetRow />
      <ToolGroup title="Awareness" tools={DEMAND_GEN_TOOLS} />
      <ToolGroup title="Conversion" tools={CONVERSION_TOOLS} />
      <FootnoteText />
    </div>
  );
}

function Intro() {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Heading level={2} style={{ marginBottom: 8 }}>
        Pick the tools you want.
      </Heading>
      <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
        Start from a preset that matches your business, then fine-tune. Anything you turn off here
        is hidden from your sidebar.
      </Text>
    </div>
  );
}

function PresetRow() {
  const { preset, applyPreset } = useTools();
  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeader title="Start from a preset" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {BUSINESS_TYPES.map((b) => {
          const Icon = PRESET_ICONS[b.id];
          const selected = preset === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => applyPreset(b.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                padding: 16,
                border: `1px solid ${selected ? 'var(--dark-90)' : 'var(--dark-8)'}`,
                borderRadius: 12,
                background: 'var(--light-100)',
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: selected ? '0 0 0 1px var(--dark-90) inset' : 'none',
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
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
                  background: 'rgba(124, 92, 252, 0.10)',
                  color: 'var(--purple)',
                }}
              >
                <Icon size={20} color="var(--purple)" />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>
                  {b.label}
                </Text>
                <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
                  {b.description}
                </Text>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ToolGroup({ title, tools }: { title: string; tools: ToolId[] }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <SectionHeader title={title} />
      <div>
        {tools.map((id, i) => (
          <ToolRow key={id} id={id} showTopBorder={i > 0} />
        ))}
      </div>
    </section>
  );
}

function ToolRow({ id, showTopBorder }: { id: ToolId; showTopBorder: boolean }) {
  const { isDraftEnabled, toggle } = useTools();
  const Icon = TOOL_ICONS[id];
  const on = isDraftEnabled(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        padding: '16px 0',
        border: 'none',
        borderTop: showTopBorder ? '1px solid var(--dark-8)' : 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          background: 'var(--dark-4)',
          color: 'var(--dark-90)',
        }}
      >
        <Icon size={20} color="var(--dark-90)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="smallList"
          style={{
            display: 'block',
            color: 'var(--dark-90)',
            marginBottom: 4,
          }}
        >
          {TOOL_LABEL[id]}
        </Text>
        <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)' }}>
          {TOOL_DESCRIPTIONS[id]}
        </Text>
      </span>
      <Toggle checked={on} />
    </button>
  );
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
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
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--dark-8)',
        paddingBottom: 12,
        marginBottom: 16,
      }}
    >
      <Heading level={4}>{title}</Heading>
    </div>
  );
}

function FootnoteText(): ReactNode {
  return (
    <Text
      variant="metadata"
      style={{
        display: 'block',
        marginTop: 12,
        color: 'var(--dark-40)',
        textAlign: 'center',
      }}
    >
      Disabled tools are hidden from your sidebar. You can still reach them by URL.
    </Text>
  );
}

/**
 * Fixed footer that appears when the draft set differs from the committed
 * set. Anchored to the bottom of the H2 main column (i.e. inside the shell's
 * right pane, NOT spanning the viewport — the sidebar stays clear). Slides
 * in via `transform: translateY` so it animates on every dirty→clean flip.
 *
 * The footer lives outside the scrollable `<H2Layout>` body content, so it
 * stays stuck to the viewport bottom while the page scrolls. We position it
 * `left: 238px` (the sidebar width — see `_shell/Sidebar.module.scss`) so it
 * starts at the right edge of the sidebar.
 */
function SaveFooter() {
  const { hasUnsavedChanges, saveChanges, discardChanges } = useTools();
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      aria-hidden={!hasUnsavedChanges}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 238,
        right: 0,
        background: 'var(--light-100)',
        borderTop: '1px solid var(--dark-8)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        transform: hasUnsavedChanges ? 'translateY(0)' : 'translateY(100%)',
        opacity: hasUnsavedChanges ? 1 : 0,
        pointerEvents: hasUnsavedChanges ? 'auto' : 'none',
        transition: 'transform 160ms ease, opacity 160ms ease',
        zIndex: 10,
      }}
    >
      <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
        Unsaved changes
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="md" onPress={() => discardChanges()}>
          Discard
        </Button>
        <Button variant="primary" size="md" onPress={() => saveChanges()}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
