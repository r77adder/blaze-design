import { useState, type ComponentType, type ReactNode } from 'react';
import { Heading, Text } from '@/components';
import type { IconProps } from '@/icons/Types';
import Images from '@/icons/20/Images';
import Palette from '@/icons/20/Palette';
import Voice from '@/icons/20/Voice';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import SourceMaterialIcon from '@/icons/20/SourceMaterial';
import { H2Layout } from '../H2Layout';
import { MediaLibrary } from './steady/MediaLibrary';
import { BrandStyle } from './steady/BrandStyle';
import { BrandVoice } from './steady/BrandVoice';
import { BrandProfile } from './steady/BrandProfile';
import { SourceMaterials } from './steady/SourceMaterials';

/**
 * Brand Kit steady state — the post-setup content surface for `/h2/brand-kit`.
 *
 * Renders inside <H2Layout> (sidebar + topbar). The page body is a two-column
 * grid: a 220px left rail of 5 nav items + the active sub-page on the right.
 * The page header at the top of the right column shows "Brand Kit" + a
 * credits chip.
 *
 * The active tab is tracked via the URL hash so deep-linking (e.g.
 * `/h2/brand-kit#brand-voice`) and back/forward both work.
 */

type SteadyTab = 'media-library' | 'brand-style' | 'brand-voice' | 'brand-profile' | 'source-materials';

interface NavEntry {
  id: SteadyTab;
  label: string;
  icon: ComponentType<IconProps>;
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'media-library', label: 'Media Library', icon: Images },
  { id: 'brand-style', label: 'Brand Style', icon: Palette },
  { id: 'brand-voice', label: 'Brand Voice', icon: Voice },
  { id: 'brand-profile', label: 'Brand Profile', icon: UserProfileCircle },
  { id: 'source-materials', label: 'Source Materials', icon: SourceMaterialIcon },
];

const DEFAULT_TAB: SteadyTab = 'media-library';

function readHashTab(): SteadyTab {
  if (typeof window === 'undefined') return DEFAULT_TAB;
  const raw = window.location.hash.replace(/^#/, '');
  const match = NAV_ITEMS.find((n) => n.id === raw);
  return match ? match.id : DEFAULT_TAB;
}

export function BrandKitSteady() {
  const [tab, setTab] = useState<SteadyTab>(() => readHashTab());

  const handleSelect = (id: SteadyTab) => {
    setTab(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <H2Layout title="Brand Kit">
      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 32, padding: '8px 4px 80px', maxWidth: 1320, margin: '0 auto' }}>
        {/* section: left rail */}
        <LeftRail activeId={tab} onSelect={handleSelect} />

        {/* section: right column — header + active sub-page */}
        <div style={{ minWidth: 0 }}>
          <PageHeader />
          <div style={{ marginTop: 24 }}>
            {tab === 'media-library' && <MediaLibrary />}
            {tab === 'brand-style' && <BrandStyle />}
            {tab === 'brand-voice' && <BrandVoice />}
            {tab === 'brand-profile' && <BrandProfile />}
            {tab === 'source-materials' && <SourceMaterials />}
          </div>
        </div>
      </div>
    </H2Layout>
  );
}

function PageHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <Heading level={1} style={{ margin: 0, fontSize: 28, letterSpacing: '-0.3px' }}>
        Brand Kit
      </Heading>
    </div>
  );
}

function LeftRail({ activeId, onSelect }: { activeId: SteadyTab; onSelect: (id: SteadyTab) => void }) {
  return (
    <nav aria-label="Brand Kit sections" style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
      {NAV_ITEMS.map((item) => (
        <RailItem
          key={item.id}
          icon={item.icon}
          active={item.id === activeId}
          onSelect={() => onSelect(item.id)}
        >
          {item.label}
        </RailItem>
      ))}
    </nav>
  );
}

function RailItem({
  icon: Icon,
  active,
  onSelect,
  children,
}: {
  icon: ComponentType<IconProps>;
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        width: '100%',
        textAlign: 'left',
        background: active ? 'var(--dark-4)' : 'transparent',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        color: active ? 'var(--dark-90)' : 'var(--dark-80)',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        transition: 'background 120ms ease, color 120ms ease',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--dark-2)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon size={20} color={active ? 'var(--dark-90)' : 'var(--dark-60)'} />
      <Text style={{ fontSize: 14, color: 'inherit', fontWeight: 'inherit' }}>{children}</Text>
    </button>
  );
}
