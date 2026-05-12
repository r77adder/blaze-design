import type { ComponentType, ReactNode } from 'react';
import { Heading, Text } from '@/components';
import Check from '@/icons/16/Check';
import CustomerService from '@/icons/20/CustomerService';
import Marker from '@/icons/20/Marker';
import Map02 from '@/icons/20/Map02';
import Bag04 from '@/icons/20/Bag04';
import Calendar1 from '@/icons/20/Calendar1';
import FileSearch1 from '@/icons/20/FileSearch1';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Cursor04 from '@/icons/20/Cursor04';
import Mail from '@/icons/20/Mail';
import Templates from '@/icons/20/Templates';
import Star from '@/icons/20/Star';
import Google from '@/icons/20/Google';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import { H2Layout } from '../H2Layout';
import {
  BUSINESS_TYPES,
  CONVERSION_TOOLS,
  DEMAND_GEN_TOOLS,
  TOOL_DESCRIPTIONS,
  useTools,
  type BusinessType,
  type ToolId,
} from '../tools-context';

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number; color?: string }>> = {
  'Organic Campaigns': Calendar1,
  'SEO/AEO': FileSearch1,
  'Map Ranking': Map02,
  'UGC Content': UserProfileCircle,
  'Paid Social': Cursor04,
  'Paid Search': Google,
  'Email & SMS': Mail,
  'Landing Pages': Templates,
  CRM: UserProfileGroup,
  Reputation: Star,
};

const PRESET_ICONS: Record<BusinessType, ComponentType<{ size?: number; color?: string }>> = {
  services: CustomerService,
  local: Marker,
  products: Bag04,
};

export function ToolsRoute() {
  return (
    <H2Layout title="Tools">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '8px 4px 80px' }}>
        <Intro />
        <PresetRow />
        <ToolGroup title="Awareness" tools={DEMAND_GEN_TOOLS} />
        <ToolGroup title="Conversion" tools={CONVERSION_TOOLS} />
        <Footer />
      </div>
    </H2Layout>
  );
}

function Intro() {
  return (
    <div style={{ padding: '8px 0 24px' }}>
      <Heading level={2} style={{ lineHeight: 1.2, letterSpacing: '-0.3px', marginBottom: 6 }}>
        Pick the tools you want.
      </Heading>
      <Text style={{ display: 'block', color: 'var(--dark-60)', lineHeight: 1.5 }}>
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
          gap: 10,
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
                gap: 10,
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
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Text style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark-90)' }}>
                  {b.label}
                </Text>
                <Text style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
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
      <div
        style={{
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          background: 'var(--light-100)',
          overflow: 'hidden',
        }}
      >
        {tools.map((id, i) => (
          <ToolRow key={id} id={id} divider={i < tools.length - 1} />
        ))}
      </div>
    </section>
  );
}

function ToolRow({ id, divider }: { id: ToolId; divider: boolean }) {
  const { isEnabled, toggle } = useTools();
  const Icon = TOOL_ICONS[id];
  const on = isEnabled(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        border: 'none',
        borderBottom: divider ? '1px solid var(--dark-4)' : 'none',
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
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--dark-90)',
            marginBottom: 2,
          }}
        >
          {id}
        </Text>
        <Text style={{ display: 'block', fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.45 }}>
          {TOOL_DESCRIPTIONS[id]}
        </Text>
      </span>
      <Checkbox checked={on} />
    </button>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        flexShrink: 0,
        borderRadius: 5,
        background: checked ? 'var(--dark-90)' : 'var(--light-100)',
        border: checked ? '1px solid var(--dark-90)' : '1.5px solid var(--dark-15)',
        color: 'var(--light-100)',
        transition: 'background-color 120ms ease, border-color 120ms ease',
      }}
    >
      {checked && <Check size={14} color="var(--light-100)" />}
    </span>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--dark-8)',
        paddingBottom: 10,
        marginBottom: 16,
      }}
    >
      <Heading level={3} style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.2px' }}>
        {title}
      </Heading>
    </div>
  );
}

function Footer(): ReactNode {
  return (
    <Text
      style={{
        display: 'block',
        marginTop: 12,
        fontSize: 12.5,
        color: 'var(--dark-40)',
        textAlign: 'center',
      }}
    >
      Disabled tools are hidden from your sidebar. You can still reach them by URL.
    </Text>
  );
}
